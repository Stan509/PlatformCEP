import { useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, LanguageSwitcher, OfflineBanner, SyncIndicator, useOnline } from '@cep/design-system';
import { DemoSigner, LocalQueue } from '@cep/local-first';

const DEVICE_ID = 'POLLING-DEV-0042';
const RECEIPT_PREFIX = 'REC-';

/** Bulletin DEMO — candidats STRICTEMENT identiques (neutralité absolue). */
const DEMO_CANDIDATES = [
  { ref: 'cand-001', name: 'Demo Person A', ballotIndex: 1 },
  { ref: 'cand-002', name: 'Demo Person B', ballotIndex: 2 },
  { ref: 'cand-003', name: 'Demo Person C', ballotIndex: 3 },
];

type Step = 'start' | 'verify' | 'authorized' | 'not_authorized' | 'ballot' | 'confirm' | 'recorded';

/**
 * APK bureau de vote — la plus simple du système (spec §26), LOCAL-FIRST.
 * Une action principale par écran, gros boutons, confirmation.
 * Le bulletin est ANONYME : le vote est enregistré dans une transaction signée
 * sans identité d'électeur. L'écran final n'expose JAMAIS le choix (secret du
 * vote). Un mode formation reproduit le workflow sans données réelles (§47).
 */
export function App(): JSX.Element {
  const { t } = useI18n();
  const online = useOnline();
  const [queue] = useState(() => new LocalQueue(DEVICE_ID, new DemoSigner(DEVICE_ID)));
  const [step, setStep] = useState<Step>('start');
  const [selected, setSelected] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [training, setTraining] = useState(false);

  const selectedCandidate = DEMO_CANDIDATES.find((c) => c.ref === selected) ?? null;
  const syncState = online ? 'online' : 'offline';

  const verifyAuthorized = (authorized: boolean) => setStep(authorized ? 'authorized' : 'not_authorized');

  const recordVote = async () => {
    if (!selectedCandidate) return;
    // Bulletin anonyme : election + ballotIndex, JAMAIS l'identité de l'électeur.
    const tx = await queue.enqueue('polling.vote', {
      election: 'demo-2026',
      ballotIndex: selectedCandidate.ballotIndex,
      sealedAt: new Date().toISOString(),
    });
    setReceipt(`${RECEIPT_PREFIX}${tx.sequence}-${tx.transactionId.slice(-6)}`);
    setStep('recorded');
  };

  const enterTraining = () => {
    setTraining(true);
    setStep('start');
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', minHeight: '100vh', padding: 'var(--cep-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <strong style={{ color: 'var(--cep-color-deep-blue)', fontSize: '1.25rem' }}>{t('apps.polling.bureau')}</strong>
        <div style={{ display: 'flex', gap: 'var(--cep-space-3)', alignItems: 'center' }}>
          <LanguageSwitcher />
          <Button size="sm" variant="ghost" onClick={enterTraining}>{t('apps.polling.help')}</Button>
        </div>
      </header>

      <OfflineBanner state={online ? 'online' : 'offline'} detail={`${queue.pending().length}`} />
      {training && <OfflineBanner state="syncing" label={t('apps.polling.ready')} />}
      <SyncIndicator state={syncState} />

      {step === 'start' && (
        <Card title={`Bureau 0042 — ${t('apps.polling.ready')}`} body={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)', paddingTop: 'var(--cep-space-3)' }}>
            <Button size="xl" block onClick={() => setStep('verify')}>{t('apps.polling.start')}</Button>
          </div>
        } />
      )}

      {step === 'verify' && (
        <Card title={t('apps.polling.verify')} body={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)', paddingTop: 'var(--cep-space-3)' }}>
            <Button size="xl" block onClick={() => verifyAuthorized(true)}>{t('apps.polling.scan')}</Button>
            <Button size="xl" variant="secondary" block onClick={() => verifyAuthorized(true)}>{t('apps.polling.manual')}</Button>
            <Button size="lg" variant="ghost" onClick={() => verifyAuthorized(false)}>{t('apps.polling.notAuthorized')}</Button>
            <Button variant="ghost" onClick={() => setStep('start')}>{t('common.actions.back')}</Button>
          </div>
        } />
      )}

      {step === 'authorized' && (
        <Card title="✓" body={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)', alignItems: 'center', paddingTop: 'var(--cep-space-3)' }}>
            <strong style={{ fontSize: '1.5rem', color: 'var(--cep-color-success)' }}>{t('apps.polling.authorized')}</strong>
            <Button size="xl" block onClick={() => setStep('ballot')}>{t('common.actions.continue')}</Button>
          </div>
        } />
      )}

      {step === 'not_authorized' && (
        <Card title="✗" body={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)', alignItems: 'center', paddingTop: 'var(--cep-space-3)' }}>
            <strong style={{ fontSize: '1.5rem', color: 'var(--cep-color-danger)' }}>{t('apps.polling.notAuthorized')}</strong>
            <Button size="xl" variant="secondary" block onClick={() => setStep('verify')}>{t('apps.polling.verify')}</Button>
          </div>
        } />
      )}

      {step === 'ballot' && (
        <Card title={t('apps.polling.ballot')} body={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)', paddingTop: 'var(--cep-space-3)' }}>
            {DEMO_CANDIDATES.map((c) => (
              <button
                key={c.ref}
                type="button"
                onClick={() => setSelected(c.ref)}
                style={{
                  font: 'inherit',
                  fontSize: 'var(--cep-font-size-body-lg)',
                  textAlign: 'left',
                  padding: 'var(--cep-space-4)',
                  border: '1px solid var(--cep-color-border)',
                  borderRadius: 'var(--cep-radius-md)',
                  background: selected === c.ref ? 'var(--cep-color-light-blue)' : 'var(--cep-color-white)',
                  cursor: 'pointer',
                }}
              >
                {c.ballotIndex}. {c.name}
              </button>
            ))}
            <Button size="xl" block disabled={!selected} onClick={() => setStep('confirm')}>{t('common.actions.continue')}</Button>
          </div>
        } />
      )}

      {step === 'confirm' && selectedCandidate && (
        <Card title={t('apps.polling.confirm')} body={
          <div style={{ paddingTop: 'var(--cep-space-3)' }}>
            <p style={{ fontSize: 'var(--cep-font-size-body-lg)' }}>{selectedCandidate.name}</p>
            <div style={{ display: 'flex', gap: 'var(--cep-space-3)', marginTop: 'var(--cep-space-4)' }}>
              <Button variant="secondary" onClick={() => setStep('ballot')}>{t('apps.polling.modify')}</Button>
              <Button onClick={recordVote}>{t('common.actions.confirm')}</Button>
            </div>
          </div>
        } />
      )}

      {step === 'recorded' && (
        <Card title={t('apps.polling.recorded')} body={
          <div style={{ paddingTop: 'var(--cep-space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)' }}>
            {receipt && <strong>{receipt}</strong>}
            <p style={{ color: 'var(--cep-color-text-secondary)' }}>{t('apps.polling.secret')}</p>
            <Button size="xl" block onClick={() => { setStep('start'); setSelected(null); setReceipt(null); }}>{t('apps.polling.finish')}</Button>
          </div>
        } />
      )}
    </div>
  );
}
