import { useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, LanguageSwitcher, OfflineBanner, SyncIndicator, useOnline } from '@cep/design-system';
import { DemoSigner, LocalQueue } from '@cep/local-first';

const DEVICE_ID = 'FIELD-DEV-001';

/**
 * APK agent de terrain — LOCAL-FIRST (Document Maître §21, §24-25).
 * Les inscriptions sont enregistrées dans une file locale de transactions
 * signées et synchronisées dès le retour du réseau. L'état offline/online est
 * TOUJOURS visible. Les données sont fictives (démo).
 */
export function App(): JSX.Element {
  const { t } = useI18n();
  const online = useOnline();
  const [queue] = useState(() => new LocalQueue(DEVICE_ID, new DemoSigner(DEVICE_ID)));
  const [registered, setRegistered] = useState(0);
  const [pending, setPending] = useState(queue.pending().length);
  const [incident, setIncident] = useState(0);
  const [syncMessage, setSyncMessage] = useState<'synced' | 'error' | null>(null);

  const register = async () => {
    await queue.enqueue('field.registration', { demo: true, at: new Date().toISOString() });
    setRegistered((n) => n + 1);
    setPending(queue.pending().length);
    setSyncMessage(null);
  };

  const sync = async () => {
    if (!online) {
      setSyncMessage('error');
      return;
    }
    for (const item of queue.pending()) {
      queue.markSynced(item.transactionId);
    }
    setPending(queue.pending().length);
    setSyncMessage('synced');
  };

  const reportIncident = async () => {
    await queue.enqueue('field.incident', { category: 'operational', demo: true, at: new Date().toISOString() });
    setIncident((n) => n + 1);
    setPending(queue.pending().length);
  };

  const syncState = online ? (pending > 0 ? 'pending' : 'synced') : 'offline';

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', padding: 'var(--cep-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <strong style={{ color: 'var(--cep-color-deep-blue)' }}>AGENT ÉLECTORAL</strong>
        <LanguageSwitcher />
      </header>

      <OfflineBanner state={online ? 'online' : 'offline'} detail={`${pending}`} />

      <Card title={t('apps.field.mission')} body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--cep-color-text-secondary)' }}>{t('apps.field.registered')}</span>
            <strong>{registered}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--cep-color-text-secondary)' }}>{t('apps.field.synced')}</span>
            <strong>{registered - pending}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--cep-color-text-secondary)' }}>{t('apps.field.pending')}</span>
            <strong>{pending}</strong>
          </div>
          <SyncIndicator state={syncState} />
        </div>
      } />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)' }}>
        <Button size="xl" block onClick={register}>{t('apps.field.newRegistration')}</Button>
        <Button size="xl" variant="secondary" block onClick={sync}>{t('apps.field.search')}</Button>
        <Button size="lg" variant="ghost" block onClick={sync}>{t('apps.field.sync')}</Button>
        <Button size="lg" variant="danger" block onClick={reportIncident}>{t('apps.field.incident')}</Button>
      </div>

      {syncMessage === 'synced' && <SyncIndicator state="synced" />}
      {syncMessage === 'error' && <SyncIndicator state="offline" />}
      <p style={{ marginTop: 'auto', color: 'var(--cep-color-text-secondary)', fontSize: 'var(--cep-font-size-caption)' }}>
        {t('apps.field.offlineNote')} {incident > 0 ? `· ${t('apps.field.incident')} : ${incident}` : ''}
      </p>
    </div>
  );
}
