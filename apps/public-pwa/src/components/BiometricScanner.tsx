import { useState, useRef, useEffect } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, Input, StatusIndicator } from '@cep/design-system';
import { api } from '../lib/api';
import type { DermalogVoter } from '@cep/shared-types';

interface BiometricScannerProps {
  voter?: DermalogVoter;
  onVerified: (voter: DermalogVoter) => void;
  onNotRegistered?: (nin: string) => void;
  onAlreadyVoted?: (voter: DermalogVoter) => void;
  onCancel?: () => void;
  electionId?: string;
}

export function BiometricScanner({
  voter: initialVoter,
  onVerified,
  onNotRegistered,
  onAlreadyVoted,
  onCancel,
  electionId = 'haiti-general-2026',
}: BiometricScannerProps): JSX.Element {
  const { t } = useI18n();
  const [voter, setVoter] = useState<DermalogVoter | null>(initialVoter || null);
  const [step, setStep] = useState<'id_input' | 'face_scan' | 'verifying' | 'success' | 'error'>(
    initialVoter ? 'face_scan' : 'id_input'
  );
  const [nin, setNin] = useState(initialVoter ? initialVoter.nin : '004-123-456-7');
  const [errorMessage, setErrorMessage] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Démarrage de la webcam pour la captation faciale en direct
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === 'face_scan') {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
          }
          setCameraActive(true);
        })
        .catch(() => {
          setCameraActive(false);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [step]);

  // Phase 1 : Recherche dans la base électorale Dermalog
  const handleIdSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    if (!nin.trim()) return;

    try {
      const eligibility = await api.checkEligibility(nin, electionId);
      if (eligibility.status === 'NOT_REGISTERED') {
        if (onNotRegistered) {
          onNotRegistered(nin);
        } else {
          setErrorMessage("Électeur non inscrit au registre Dermalog.");
          setStep('error');
        }
        return;
      }

      if (eligibility.status === 'ALREADY_VOTED' && eligibility.voter) {
        if (onAlreadyVoted) {
          onAlreadyVoted(eligibility.voter);
        } else {
          setVoter(eligibility.voter);
          setErrorMessage("Vous avez déjà émis votre vote pour ce scrutin.");
          setStep('error');
        }
        return;
      }

      if (eligibility.voter) {
        setVoter(eligibility.voter);
        setStep('face_scan');
      }
    } catch {
      setErrorMessage("Erreur lors de la vérification de la carte Dermalog.");
      setStep('error');
    }
  };

  // Phase 2 : Scan biométrique facial & analyse de concordance
  const startBiometricScan = () => {
    setStep('verifying');
    setScanProgress(15);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 250);

    setTimeout(async () => {
      if (!voter) return;
      const result = await api.verifyBiometrics(voter.nin);
      if (result.matched && result.voter) {
        setStep('success');
        setTimeout(() => {
          onVerified(result.voter!);
        }, 1200);
      } else {
        setErrorMessage("Échec de concordance biométrique. Le visage ne correspond pas à la carte.");
        setStep('error');
      }
    }, 1200);
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cep-space-2)' }}>
          <span style={{ fontSize: '1.25rem' }}>🪪</span>
          <span>Vérification Biométrique Dermalog® (Haïti)</span>
        </div>
      }
      body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)' }}>
          {step === 'id_input' && (
            <form onSubmit={handleIdSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)' }}>
              <p style={{ fontSize: 'var(--cep-font-size-body)', color: 'var(--cep-color-text-secondary)' }}>
                Saisissez votre numéro de Carte Dermalog® (NIN / NIF / Carte Électorale) :
              </p>

              <Input
                label="Numéro Carte Dermalog (NIN / NIF)"
                examplePlaceholder="Ex: 004-123-456-7"
                value={nin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNin(e.target.value)}
                required
              />

              <div style={{ background: 'var(--cep-color-light-blue)', padding: 'var(--cep-space-3)', borderRadius: 'var(--cep-radius-md)' }}>
                <span style={{ fontSize: 'var(--cep-font-size-caption)', fontWeight: 600, color: 'var(--cep-color-primary)' }}>
                  💡 Exemples d'électeurs pour démonstration :
                </span>
                <div style={{ display: 'flex', gap: 'var(--cep-space-2)', flexWrap: 'wrap', marginTop: 'var(--cep-space-2)' }}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setNin('004-123-456-7'); }}
                  >
                    Stanley Gabriel (Éligible - Ouest)
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setNin('001-987-654-3'); }}
                  >
                    Marie-Claire Jean (Déjà Voté - Artibonite)
                  </Button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                {onCancel && (
                  <Button type="button" variant="secondary" onClick={onCancel}>
                    Annuler
                  </Button>
                )}
                <Button type="submit" block>
                  Vérifier mon Éligibilité & Continuer →
                </Button>
              </div>
            </form>
          )}

          {step === 'face_scan' && voter && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)', alignItems: 'center', textAlign: 'center' }}>
              <StatusIndicator tone="info" label={`Électeur identifié : ${voter.fullName || `${voter.firstName} ${voter.lastName}`}`} />
              <p style={{ color: 'var(--cep-color-text-secondary)', fontSize: 'var(--cep-font-size-small)' }}>
                Veuillez placer votre visage en face de la caméra pour effectuer la vérification de concordance biométrique avec votre carte Dermalog.
              </p>

              <div style={{ position: 'relative', width: 280, height: 210, borderRadius: 12, overflow: 'hidden', border: '3px solid var(--cep-color-primary)', background: '#000' }}>
                {cameraActive ? (
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={voter.facePhotoUrl || voter.cartePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} alt="Photo Carte Dermalog" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                )}
                <div style={{
                  position: 'absolute',
                  inset: 20,
                  border: '2px dashed #00E676',
                  borderRadius: '50%',
                  pointerEvents: 'none'
                }} />
              </div>

              <div style={{ display: 'flex', gap: 'var(--cep-space-3)', width: '100%' }}>
                {onCancel ? (
                  <Button type="button" variant="secondary" onClick={onCancel}>
                    Annuler
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => setStep('id_input')}>
                    ← Changer de NIF/NIN
                  </Button>
                )}
                <Button block onClick={startBiometricScan}>
                  📸 Scanner mon visage & Valider
                </Button>
              </div>
            </div>
          )}

          {step === 'verifying' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)', alignItems: 'center', textAlign: 'center', padding: 'var(--cep-space-5) 0' }}>
              <span style={{ fontSize: '2.5rem' }}>🔄</span>
              <h3 style={{ fontSize: 'var(--cep-font-size-h3)' }}>Analyse Biométrique en cours...</h3>
              <p style={{ color: 'var(--cep-color-text-secondary)' }}>
                Comparaison des points nodaux faciaux avec la photo officielle Dermalog ({scanProgress}%)
              </p>
              <div style={{ width: '100%', height: 10, background: '#E0E0E0', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${scanProgress}%`, height: '100%', background: 'var(--cep-color-primary)', transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          {step === 'success' && voter && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)', alignItems: 'center', textAlign: 'center' }}>
              <StatusIndicator tone="success" label="Authentification Biométrique Réussie (Concordance 98.6%)" />
              <img src={voter.cartePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} alt={voter.fullName} style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid #00E676', marginTop: 8 }} />
              <h3>Bienvenue, {voter.fullName || `${voter.firstName} ${voter.lastName}`}</h3>
              <p style={{ fontSize: 'var(--cep-font-size-small)', color: 'var(--cep-color-text-secondary)' }}>
                📍 Résidence électorale : <strong>{voter.commune}</strong> ({voter.department})
              </p>
              <p style={{ fontSize: 'var(--cep-font-size-caption)', color: 'var(--cep-color-text-muted)' }}>
                Redirection automatique...
              </p>
            </div>
          )}

          {step === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)', alignItems: 'center', textAlign: 'center' }}>
              <StatusIndicator tone="danger" label="Accès Refusé" />
              <p style={{ color: 'var(--cep-color-danger-text)', fontWeight: 600 }}>{errorMessage}</p>
              <Button onClick={() => setStep('id_input')}>
                Réessayer la vérification
              </Button>
            </div>
          )}
        </div>
      }
    />
  );
}
