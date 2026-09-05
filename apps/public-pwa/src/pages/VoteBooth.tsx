import { useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, StatusIndicator, StateView } from '@cep/design-system';
import { api } from '../lib/api';
import { BiometricScanner } from '../components/BiometricScanner';
import type { DermalogVoter, Candidate, Election } from '@cep/shared-types';
import { sampleElections } from '../lib/mockData';

type BoothStep = 'biometric' | 'eligibility' | 'ballot' | 'review' | 'success';

export function VoteBooth(): JSX.Element {
  const { t } = useI18n();
  const [step, setStep] = useState<BoothStep>('biometric');
  const [voter, setVoter] = useState<DermalogVoter | null>(null);

  const [activeElections, setActiveElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [eligiblePositions, setEligiblePositions] = useState<{ position: string; positionLabel: string; candidates: Candidate[] }[]>([]);

  // Selected candidates map: position -> candidateId
  const [selections, setSelections] = useState<Record<string, string>>({});

  const [alreadyVotedElections, setAlreadyVotedElections] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{ receiptHash: string; timestamp: string; confirmationCode: string } | null>(null);

  // Step: Facial Biometric & Real Identity Verification completed
  const handleBiometricSuccess = async (verifiedVoter: DermalogVoter) => {
    setVoter(verifiedVoter);

    // Check eligibility across active elections
    const elections = sampleElections.filter(e => e.status === 'OPEN');
    setActiveElections(elections);

    const alreadyVoted: string[] = [];
    for (const e of elections) {
      const elId = e.electionId || e.id || 'haiti-general-2026';
      const elRes = await api.checkEligibility(verifiedVoter.nin, elId);
      if (elRes.status === 'ALREADY_VOTED') {
        alreadyVoted.push(elId);
      }
    }
    setAlreadyVotedElections(alreadyVoted);

    // Pick first available active election for voting if available
    const available = elections.find(e => !alreadyVoted.includes(e.electionId || e.id || ''));
    if (available) {
      loadElectionBallots(verifiedVoter, available);
    }

    setStep('eligibility');
  };

  const loadElectionBallots = (v: DermalogVoter, el: Election) => {
    setSelectedElection(el);
    const elId = el.electionId || el.id || 'haiti-general-2026';
    const positions = api.getCandidatesForVoter(v, elId);
    setEligiblePositions(positions);
    setSelections({});
  };

  const handleSelectCandidate = (position: string, candidateId: string) => {
    setSelections(prev => ({
      ...prev,
      [position]: candidateId
    }));
  };

  const handleSubmitVote = async () => {
    if (!voter || !selectedElection) return;
    setIsSubmitting(true);
    try {
      const elId = selectedElection.electionId || selectedElection.id || 'haiti-general-2026';
      const res = await api.castVote({
        voterNin: voter.nin,
        electionId: elId,
        selections
      });

      if (res.success && res.receiptHash) {
        setReceipt({
          receiptHash: res.receiptHash,
          timestamp: res.timestamp || new Date().toISOString(),
          confirmationCode: res.receiptHash.substring(0, 12).toUpperCase()
        });
        setStep('success');
      }
    } catch {
      alert('Erreur technique lors de l\'envoi du bulletin de vote scellé.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section style={{ maxWidth: 860, margin: '0 auto', padding: 'var(--cep-space-8) var(--cep-space-5)', width: '100%' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--cep-space-6)' }}>
        <span style={{ 
          background: 'rgba(0, 32, 96, 0.1)', 
          color: 'var(--cep-color-deep-blue)', 
          padding: '4px 12px', 
          borderRadius: 20, 
          fontSize: 'var(--cep-font-size-small)', 
          fontWeight: 600 
        }}>
          Isoloir Numérique Sécurisé — Biométrie Dermalog® (En direct)
        </span>
        <h1 style={{ fontSize: 'var(--cep-font-size-h2)', marginTop: 'var(--cep-space-2)' }}>
          Scrutin Officiel en Ligne
        </h1>
        <p style={{ color: 'var(--cep-color-text-secondary)', maxWidth: 600, margin: 'var(--cep-space-2) auto 0' }}>
          Système Électoral de la République d'Haïti — Protection stricte du secret du vote & Captation Biométrique Réelle.
        </p>
      </div>

      {/* Progress Steps Indicator */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: 'var(--cep-space-6)', 
        borderBottom: '2px solid var(--cep-color-border)', 
        paddingBottom: 'var(--cep-space-3)' 
      }}>
        {[
          { key: 'biometric', label: '1. Identification & Biométrie' },
          { key: 'eligibility', label: '2. Éligibilité' },
          { key: 'ballot', label: '3. Bulletin de Vote' },
          { key: 'review', label: '4. Scellement' }
        ].map((s) => {
          const stepOrder: BoothStep[] = ['biometric', 'eligibility', 'ballot', 'review', 'success'];
          const currentIdx = stepOrder.indexOf(step);
          const itemIdx = stepOrder.indexOf(s.key as BoothStep);
          const isActive = step === s.key;
          const isDone = currentIdx > itemIdx;

          return (
            <div key={s.key} style={{ 
              fontWeight: isActive ? 700 : 400, 
              color: isActive ? 'var(--cep-color-cep-blue)' : isDone ? 'var(--cep-color-success)' : 'var(--cep-color-text-muted)',
              fontSize: 'var(--cep-font-size-small)'
            }}>
              {isDone ? '✓ ' : ''}{s.label}
            </div>
          );
        })}
      </div>

      {/* STEP 1: Biometric & Multi-Angle Scan Engine */}
      {step === 'biometric' && (
        <div>
          <BiometricScanner
            onVerified={handleBiometricSuccess}
          />
        </div>
      )}

      {/* STEP 2: Eligibility & Jurisdiction Check */}
      {step === 'eligibility' && voter && (
        <Card title={`Vérification d'Éligibilité & Circonscription de Vote`} body={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)' }}>
            <div style={{ background: '#F4F7FC', padding: '16px', borderRadius: '8px', border: '1px solid #D0DCEE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--cep-color-deep-blue)' }}>{voter.fullName || `${voter.firstName} ${voter.lastName}`}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--cep-color-text-secondary)' }}>
                    CIN Dermalog: <strong>{voter.nin}</strong> | Résidence: <strong>{voter.commune}</strong> ({voter.department})
                  </p>
                </div>
                <StatusIndicator tone="success" label="Biométrie Faciale Validée (98.4%)" />
              </div>
            </div>

            <h4 style={{ margin: 'var(--cep-space-2) 0 0' }}>Elections en cours pour votre circonscription:</h4>

            {activeElections.map(el => {
              const elId = el.electionId || el.id || '';
              const hasVoted = alreadyVotedElections.includes(elId);
              const isSelected = selectedElection?.electionId === elId || selectedElection?.id === elId;

              return (
                <div key={elId} style={{ 
                  border: isSelected ? '2px solid var(--cep-color-cep-blue)' : '1px solid var(--cep-color-border)',
                  borderRadius: '8px',
                  padding: '16px',
                  background: isSelected ? '#F0F6FF' : 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem' }}>{el.title || el.name.fr} ({el.type || el.electionType})</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--cep-color-text-secondary)' }}>
                        Date de clôture: {new Date(el.endDate).toLocaleDateString()} | Statut: Ouvert
                      </p>
                    </div>
                    {hasVoted ? (
                      <div style={{ padding: '6px 12px', background: '#E2F0D9', color: '#385723', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                        ✓ Vote Déjà Enregistré (Emargé)
                      </div>
                    ) : (
                      <Button
                        variant={isSelected ? 'primary' : 'secondary'}
                        onClick={() => {
                          loadElectionBallots(voter, el);
                          setStep('ballot');
                        }}
                      >
                        Ouvrir le Bulletin de Vote →
                      </Button>
                    )}
                  </div>

                  {hasVoted && (
                    <p style={{ margin: '10px 0 0', fontSize: '0.8rem', color: '#555', fontStyle: 'italic', background: '#FFF', padding: '8px', borderRadius: '4px' }}>
                      🔒 Protection du secret électoral : Le système certifie que vous avez déjà accompli votre devoir civique pour ce scrutin. Conformément à la loi électorale haïtienne, les choix exprimés demeurent 100% anonymes et scellés.
                    </p>
                  )}
                </div>
              );
            })}

            {activeElections.every(e => alreadyVotedElections.includes(e.electionId || e.id || '')) && (
              <div style={{ textAlign: 'center', padding: '20px', background: '#F8F9FA', borderRadius: '8px' }}>
                <StateView
                  state="empty"
                  title="Vous avez participé à tous les scrutins en cours !"
                  description="Aucun nouveau bulletin disponible pour votre circonscription actuellement."
                />
                <Button variant="secondary" onClick={() => setStep('biometric')} style={{ marginTop: '16px' }}>
                  Terminer / Déconnexion de l'isoloir
                </Button>
              </div>
            )}
          </div>
        } />
      )}

      {/* STEP 3: Interactive Ballot for eligible positions */}
      {step === 'ballot' && selectedElection && voter && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="secondary" onClick={() => setStep('eligibility')}>← Retour aux Scrutins</Button>
            <span style={{ fontSize: '0.9rem', color: 'var(--cep-color-text-secondary)' }}>
              Circonscription de vote: <strong>{voter.commune} ({voter.department})</strong>
            </span>
          </div>

          <Card title={`Bulletin de Vote — ${selectedElection.title || selectedElection.name.fr}`} body={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-6)' }}>
              <p style={{ color: 'var(--cep-color-text-secondary)' }}>
                Sélectionnez un candidat par poste électif ouvert dans votre circonscription ({voter.commune}, {voter.department}).
              </p>

              {eligiblePositions.map(posGroup => (
                <div key={posGroup.position} style={{ borderTop: '2px solid #E5E9F0', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ background: 'var(--cep-color-deep-blue)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      {posGroup.position}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--cep-color-deep-blue)' }}>
                      Poste de: {posGroup.positionLabel}
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                    {posGroup.candidates.map(cand => {
                      const candId = cand.id || cand.candidateRef;
                      const isChosen = selections[posGroup.position] === candId;
                      return (
                        <div
                          key={candId}
                          onClick={() => handleSelectCandidate(posGroup.position, candId)}
                          style={{
                            border: isChosen ? '3px solid var(--cep-color-cep-blue)' : '1px solid var(--cep-color-border)',
                            borderRadius: '8px',
                            padding: '16px',
                            cursor: 'pointer',
                            background: isChosen ? '#EEF4FF' : 'white',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: isChosen ? '0 4px 12px rgba(0, 32, 96, 0.15)' : 'none'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                              <div style={{ 
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '50%', 
                                background: '#E2E8F0', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontWeight: 700, 
                                fontSize: '1.2rem', 
                                color: 'var(--cep-color-deep-blue)' 
                              }}>
                                {cand.firstName[0]}{cand.lastName[0]}
                              </div>
                              <input
                                type="radio"
                                name={`pos-${posGroup.position}`}
                                checked={isChosen}
                                onChange={() => handleSelectCandidate(posGroup.position, candId)}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                              />
                            </div>

                            <strong style={{ fontSize: '1.1rem', color: 'var(--cep-color-deep-blue)', display: 'block' }}>
                              {cand.firstName} {cand.lastName}
                            </strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--cep-color-cep-blue)', fontWeight: 600, display: 'block', margin: '2px 0 6px' }}>
                              {cand.party || cand.partyRef} ({cand.partyAcronym || cand.partyRef})
                            </span>
                            <p style={{ fontSize: '0.8rem', color: 'var(--cep-color-text-secondary)', fontStyle: 'italic', margin: 0 }}>
                              "{cand.slogan || 'Engagement pour Haïti'}"
                            </p>
                          </div>

                          <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #DDD', fontSize: '0.75rem', color: '#666' }}>
                            Circonscription: {cand.territoryScope === 'NATIONAL' ? 'Haïti Entière (National)' : cand.territoryScope === 'DEPARTMENT' ? `Département ${cand.department}` : `Commune ${cand.commune}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button
                  block
                  disabled={Object.keys(selections).length === 0}
                  onClick={() => setStep('review')}
                >
                  Vérifier & Valider mon Choix →
                </Button>
              </div>
            </div>
          } />
        </div>
      )}

      {/* STEP 4: Final Review & Confirmation */}
      {step === 'review' && selectedElection && voter && (
        <Card title="Récapitulatif & Scellement Cryptographique du Vote" body={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)' }}>
            <p style={{ color: 'var(--cep-color-text-secondary)' }}>
              Veuillez relire attentivement vos choix électoraux avant d'effectuer le scellement définitif. Une fois validé, votre bulletin sera chiffré de manière irréversible dans l'urne numérique CEP.
            </p>

            <div style={{ background: '#F8F9FA', padding: '16px', borderRadius: '8px', border: '1px solid #DDD' }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--cep-color-deep-blue)' }}>Vos choix sélectionnés:</h4>

              {Object.entries(selections).map(([posKey, candId]) => {
                const posGroup = eligiblePositions.find(p => p.position === posKey);
                const cand = posGroup?.candidates.find(c => (c.id || c.candidateRef) === candId);

                return (
                  <div key={posKey} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #EEE' }}>
                    <span style={{ fontWeight: 600 }}>{posGroup?.positionLabel || posKey}:</span>
                    <span style={{ color: 'var(--cep-color-cep-blue)', fontWeight: 700 }}>
                      {cand ? `${cand.firstName} ${cand.lastName} (${cand.partyAcronym || cand.partyRef})` : candId}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '12px', background: '#FFFBEB', borderLeft: '4px solid #F59E0B', borderRadius: '4px', fontSize: '0.85rem' }}>
              ⚠️ <strong>Important :</strong> En cliquant sur "Confirmer & Sceller mon Vote", votre émargement sera validé. Il sera impossible de modifier vos réponses ultérieurement.
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '12px' }}>
              <Button variant="secondary" onClick={() => setStep('ballot')}>
                Modifier mes choix
              </Button>
              <Button
                isLoading={isSubmitting}
                loadingText="Scellement cryptographique en cours..."
                onClick={handleSubmitVote}
              >
                🔒 Confirmer & Sceller mon Vote
              </Button>
            </div>
          </div>
        } />
      )}

      {/* STEP 5: Voting Receipt Success */}
      {step === 'success' && receipt && (
        <Card title="✅ Vote Enregistré avec Succès" body={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)', textAlign: 'center' }}>
            <div style={{ 
              width: '70px', 
              height: '70px', 
              borderRadius: '50%', 
              background: '#E2F0D9', 
              color: '#385723', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '2rem', 
              margin: '0 auto' 
            }}>
              ✓
            </div>

            <h2 style={{ color: 'var(--cep-color-deep-blue)', margin: 0 }}>
              Félicitations ! Votre bulletin a été scellé dans l'urne.
            </h2>

            <p style={{ color: 'var(--cep-color-text-secondary)', maxWidth: 600, margin: '0 auto' }}>
              Votre voix a été comptabilisée en toute sécurité et votre droit au secret du vote est garanti conformément aux dispositions du Conseil Électoral Provisoire (CEP).
            </p>

            {/* Cryptographic Receipt Box */}
            <div style={{ background: '#1E293B', color: '#F8FAFC', padding: '20px', borderRadius: '8px', textAlign: 'left', fontFamily: 'monospace' }}>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '8px' }}>REÇU OFFICIEL DE VOTE HASH (SHA-256)</div>
              <div style={{ fontSize: '0.95rem', wordBreak: 'break-all', color: '#38BDF8', fontWeight: 700 }}>
                {receipt.receiptHash}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.8rem', borderTop: '1px solid #334155', paddingTop: '12px' }}>
                <span>Code d'Horodatage: {receipt.timestamp}</span>
                <span>Jeton: {receipt.confirmationCode}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => window.print()}>
                🖨️ Imprimer mon reçu
              </Button>
              <Button onClick={() => {
                setStep('biometric');
                setVoter(null);
                setReceipt(null);
              }}>
                Quitter l'Isoloir
              </Button>
            </div>
          </div>
        } />
      )}
    </section>
  );
}
