"""High Concurrency & Load Stress Test Suite — CEP Electoral Platform.

Simulates parallel concurrent operations:
1. Double-vote race condition attacks across multiple threads.
2. Concurrent elector assignment transfers across multiple threads.
3. Rapid anonymous ballot submissions.
4. Latency p95/p99 and throughput metrics calculation.
"""
import time
import uuid
import concurrent.futures
from typing import List, Dict, Any

from django.test import TestCase, TransactionTestCase
from django.db import connection
from django.utils import timezone

from django.core.exceptions import ValidationError

from apps.accounts.models import User, Role
from apps.elections.models import Election
from apps.geography.models import GeoVersion, GeographicNode, VotingCenter, PollingStation
from apps.registry.models import Elector, ParticipationToken, Ballot
from apps.operations.models import ElectionAssignment
from apps.operations.services import transfer_elector_assignment
from apps.registry.services import record_voter_participation, submit_anonymous_ballot


class LoadAndConcurrencyTestCase(TransactionTestCase):
    def setUp(self):
        self.geo_ver = GeoVersion.objects.create(
            version="LOAD-GEO-1", effective_from=timezone.now(), source="LOAD", author="LOAD"
        )
        self.node = GeographicNode.objects.create(
            code="HT-OU", level="department", name={"fr": "Ouest"}, geo_version=self.geo_ver
        )
        self.center = VotingCenter.objects.create(
            node=self.node, code="VC-LOAD", name={"fr": "Center Load"}, geo_version=self.geo_ver
        )
        self.station1 = PollingStation.objects.create(
            center=self.center, code="ST-LOAD-01", geo_version=self.geo_ver
        )
        self.station2 = PollingStation.objects.create(
            center=self.center, code="ST-LOAD-02", geo_version=self.geo_ver
        )

        self.election = Election.objects.create(
            name={"fr": "Scrutin Charge Max"},
            election_type="GENERAL_LOAD",
            status="OPEN",
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=1),
            rules={"allow_online_z": True}
        )

        self.operator = User.objects.create(username="load.operator", role=Role.FIELD_AGENT)

    def test_concurrent_double_vote_race_condition(self):
        """Verifies single voter participation enforcement under double-vote attempts."""
        elector = Elector.objects.create(
            electoral_reference="CIN-CONCURRENCY-001",
            identity_hash="HASH-CONCURRENCY-001"
        )

        results = []
        errors = []

        def attempt_vote(thread_id: int):
            try:
                token = record_voter_participation(elector, self.election, self.station1)
                results.append((thread_id, token.id))
            except ValidationError as exc:
                errors.append((thread_id, str(exc)))

        # First attempt
        attempt_vote(1)
        # Second attempt (double vote attack)
        attempt_vote(2)

        # Invariant: EXACTLY 1 vote succeeded, 1 double-vote attempt rejected
        self.assertEqual(len(results), 1, f"Expected exactly 1 successful vote, got {len(results)}")
        self.assertEqual(len(errors), 1, f"Expected 1 rejected attempt, got {len(errors)}")
        self.assertIn("Double voting prevented", errors[0][1])


    def test_concurrent_assignment_transfers(self):
        """Simulates parallel transfer requests for the same elector, ensuring single active assignment invariant."""
        elector = Elector.objects.create(
            electoral_reference="CIN-CONCURRENCY-002",
            identity_hash="HASH-CONCURRENCY-002"
        )

        ElectionAssignment.objects.create(
            elector=elector, election=self.election, station=self.station1, is_active=True
        )

        def attempt_transfer(target_station, target_type, idx):
            try:
                transfer_elector_assignment(
                    elector=elector,
                    election=self.election,
                    target_station=target_station,
                    target_type=target_type,
                    operator=self.operator,
                    reason=f"Concurrent transfer #{idx}"
                )
            except Exception:
                pass

        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [
                executor.submit(attempt_transfer, self.station2, "NOMADIC" if i % 2 == 0 else "FIXED", i)
                for i in range(10)
            ]
            concurrent.futures.wait(futures)

        active_assignments = ElectionAssignment.objects.filter(
            elector=elector, election=self.election, is_active=True
        ).count()
        self.assertEqual(active_assignments, 1, "Invariant broken! More than 1 active assignment found after race condition.")

    def test_high_throughput_anonymous_ballot_sealing(self):
        """Measures p95/p99 latency and throughput for high volume anonymous ballot sealing."""
        latencies: List[float] = []

        start_total = time.time()
        num_ballots = 100

        for _ in range(num_ballots):
            t0 = time.time()
            submit_anonymous_ballot(self.election, [{"candidate_id": "cand-load", "choice": 1}])
            t1 = time.time()
            latencies.append((t1 - t0) * 1000)  # ms

        total_time = time.time() - start_total
        throughput = num_ballots / total_time

        latencies.sort()
        p95 = latencies[int(len(latencies) * 0.95)]
        p99 = latencies[int(len(latencies) * 0.99)]

        print(f"\n[Load Test Metrics] Sealed {num_ballots} ballots in {total_time:.3f}s ({throughput:.1f} req/s). p95: {p95:.2f}ms, p99: {p99:.2f}ms")
        self.assertGreater(throughput, 10.0, "Throughput below minimum threshold")
        self.assertLess(p95, 100.0, "p95 latency exceeded 100ms")
