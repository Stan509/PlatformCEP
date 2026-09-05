import { useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, StatusIndicator, StateView } from '@cep/design-system';
import { api } from '../lib/api';
import { navigate } from '../router';
import type { DermalogVoter } from '@cep/shared-types';

type Phase = 'idle' | 'submitting' | 'result' | 'error';

export function CheckStatus(): JSX.Element {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>('idle');
  const [ref, setRef] = useState('004-123-456-7');
  const [voter, setVoter] = useState<DermalogVoter | null>(null);

  const submit = async () => {
    setPhase('submitting');
    try {
      // Try Dermalog NIN first, then Passport
      let v = await api.getVoterByNIN(ref.trim());
      if (!v && ref.includes('PA')) {
        v = await api.getVoterByPassport(ref.trim());
      }

      setVoter(v);
      setPhase('result');
    } catch {
      setPhase('error');
    }
  };

  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--cep-space-8) var(--cep-space-5)', width: '100%' }}>
      <h1 style={{ fontSize: 'var(--cep-font-size-h2)', marginBottom: 'var(--cep-space-2)' }}>
        {t('pages.status.title')}
      </h1>
      <p style={{ color: 'var(--cep-color-text-secondary)', marginBottom: 'var(--cep-space-5)' }}>
        Consultez l'état de votre inscription sur la liste électorale nationale (ONI/CEP), votre centre de vote attribué et l'état de votre émargement.
      </p>

      <Card body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-2)' }}>
            <label className="cep-label">
              Numéro Carte Dermalog (CIN / NIF) ou Passeport Haïtien :
            </label>
            <input
              type="text"
              className="cep-input"
              placeholder="Ex: 004-123-456-7 ou PA-998877"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
            />
          </div>

          <Button
            block
            isLoading={phase === 'submitting'}
            loadingText={t('pages.status.loading')}
            disabled={ref.trim() === ''}
            onClick={submit}
          >
            {t('pages.status.submit')}
          </Button>
        </div>
      } />

      {phase === 'result' && (
        <div style={{ marginTop: 'var(--cep-space-5)' }}>
          {voter ? (
            <Card
              title={<StatusIndicator tone="success" label="Électeur Enregistré & Actif" />}
              body={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#F8F9FA', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <h3 style={{ margin: 0, color: 'var(--cep-color-deep-blue)' }}>
                      {voter.fullName || `${voter.firstName} ${voter.lastName}`}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#555' }}>
                      Identifiant : <strong>{voter.nin}</strong> {voter.passportNumber ? `(Passeport: ${voter.passportNumber})` : ''}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div style={{ background: '#FFF', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>Département</span>
                      <strong style={{ display: 'block', color: 'var(--cep-color-deep-blue)', fontSize: '1rem' }}>{voter.department}</strong>
                    </div>

                    <div style={{ background: '#FFF', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>Commune de Vote</span>
                      <strong style={{ display: 'block', color: 'var(--cep-color-deep-blue)', fontSize: '1rem' }}>{voter.commune}</strong>
                    </div>

                    <div style={{ background: '#FFF', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>Centre de Vote Attribué</span>
                      <strong style={{ display: 'block', color: 'var(--cep-color-deep-blue)', fontSize: '0.9rem' }}>
                        Lycée National de {voter.commune}
                      </strong>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #EEE', paddingTop: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--cep-color-deep-blue)' }}>Historique Électoral & Émargements :</h4>
                    {Object.keys(voter.hasVotedElections).length > 0 ? (
                      <div style={{ padding: '10px 14px', background: '#E2F0D9', borderRadius: '6px', color: '#385723', fontSize: '0.85rem' }}>
                        ✓ Émarge(s) validé(s) pour : {Object.keys(voter.hasVotedElections).join(', ')}. <br />
                        <span style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>Note : Vos choix électoraux demeurent anonymes et secrets.</span>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: '#666' }}>Vous n'avez encore voté à aucun scrutin en cours.</p>
                    )}
                  </div>

                  {/* Transfer & Online Vote Request Section */}
                  <TransferRequestBlock voter={voter} />

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <Button block onClick={() => navigate('vote')}>
                      Accéder à l'Isoloir pour Voter →
                    </Button>
                  </div>
                </div>
              }
            />
          ) : (
            <Card body={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)', textAlign: 'center', padding: '16px' }}>
                <StateView
                  state="empty"
                  title="Numéro d'identifiant non trouvé"
                  description="Aucun électeur ne correspond à cet identifiant Dermalog / Passeport dans le registre électoral actuel."
                />
                <Button variant="primary" onClick={() => navigate('register')}>
                  S'inscrire comme Nouvel Électeur →
                </Button>
              </div>
            } />
          )}
        </div>
      )}

      {phase === 'error' && (
        <div style={{ marginTop: 'var(--cep-space-4)' }}>
          <StateView state="error" title={t('pages.status.errorTitle')} description={t('pages.status.supportCode')} />
        </div>
      )}
    </section>
  );
}

function TransferRequestBlock({ voter }: { voter: DermalogVoter }): JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);
  const [targetModality, setTargetModality] = useState<'ONLINE_Z' | 'NOMADIC' | 'OTHER_FIXED'>('ONLINE_Z');
  const [reason, setReason] = useState('Déplacement professionnel / Mission');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<Array<{
    requestId: string;
    targetModality: string;
    reason: string;
    status: string;
    submittedAt: string;
  }>>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleOpenModal = async () => {
    const existing = await api.getTransferRequestsByNin(voter.nin);
    setRequests(existing);
    setModalOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.submitTransferRequest({
        electorNin: voter.nin,
        electorName: voter.fullName || `${voter.firstName} ${voter.lastName}`,
        targetModality,
        reason,
        justificationNotes: notes,
      });

      if (res.success) {
        setSuccessMsg(`✅ Demande enregistrée avec succès sous le N° ${res.request.requestId}. Transmise aux analystes du CEP.`);
        const updated = await api.getTransferRequestsByNin(voter.nin);
        setRequests(updated);
        setNotes('');
      }
    } catch {
      alert('Erreur lors de la soumission de la demande de transfert.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ borderTop: '2px dashed #E2E8F0', paddingTop: '16px', marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h4 style={{ margin: 0, color: 'var(--cep-color-deep-blue)' }}>
            ⇄ Changement de Bureau ou Option Vote en Ligne (Online-Z)
          </h4>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#666' }}>
            Besoin de voter à distance ou dans un bureau nomade ? Soumettez une demande soumise à l'analyse du CEP.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={handleOpenModal}>
          Demander un Transfert →
        </Button>
      </div>

      {/* Transfer Modal / Form */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '8px',
              maxWidth: 520,
              width: '100%',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--cep-color-deep-blue)', fontSize: '1.2rem' }}>
                Demande de Transfert & Vote en Ligne
              </h3>
              <button
                onClick={() => { setModalOpen(false); setSuccessMsg(null); }}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Existing requests list if any */}
            {requests.length > 0 && (
              <div style={{ background: '#F8F9FA', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <h5 style={{ margin: '0 0 8px 0', color: 'var(--cep-color-deep-blue)' }}>Vos demandes soumises :</h5>
                {requests.map((r) => (
                  <div key={r.requestId} style={{ fontSize: '0.82rem', padding: '6px 0', borderBottom: '1px solid #EEE' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{r.requestId}</strong>
                      <span style={{ color: '#B45309', fontWeight: 600 }}>
                        {r.status === 'PENDING_ANALYSIS' ? '🟡 EN COURS D\'ANALYSE' : r.status === 'APPROVED' ? '🟢 APPROUVÉE' : '🔴 REJETÉE'}
                      </span>
                    </div>
                    <div style={{ color: '#555' }}>Cible : {r.targetModality === 'ONLINE_Z' ? 'Vote en Ligne (Online-Z)' : r.targetModality} | Motif : {r.reason}</div>
                  </div>
                ))}
              </div>
            )}

            {successMsg ? (
              <div style={{ background: '#F0FDF4', color: '#166534', padding: '14px', borderRadius: '6px', fontSize: '0.9rem' }}>
                {successMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                    Mode de vote / Bureau désiré :
                  </label>
                  <select
                    value={targetModality}
                    onChange={(e) => setTargetModality(e.target.value as any)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CCC' }}
                  >
                    <option value="ONLINE_Z">🌐 Vote en Ligne PWA (Bureau Virtuel ONLINE-Z)</option>
                    <option value="NOMADIC">🚐 Bureau Nomade Mobile</option>
                    <option value="OTHER_FIXED">🏫 Autre Bureau Fixe de Commune</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                    Motif principal du transfert :
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CCC' }}
                  >
                    <option value="Déplacement professionnel / Mission">Déplacement professionnel / Mission</option>
                    <option value="Changement de domicile temporaire">Changement de domicile temporaire</option>
                    <option value="Diaspora / Séjour à l'Étranger">Diaspora / Séjour à l'Étranger</option>
                    <option value="Raison de sécurité / Zone difficile d'accès">Raison de sécurité / Zone difficile d'accès</option>
                    <option value="Handicap / Mobilité réduite">Handicap / Mobilité réduite</option>
                    <option value="Autre raison légitime">Autre raison légitime</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                    Notes explicatives & Justificatifs :
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Précisez votre adresse temporaire ou toute information utile pour l'analyse par la Commission du CEP..."
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CCC' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <Button variant="secondary" onClick={() => setModalOpen(false)}>
                    Fermer
                  </Button>
                  <Button variant="primary" type="submit" isLoading={submitting} loadingText="Envoi en cours...">
                    Envoyer pour Analyse par le CEP →
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

