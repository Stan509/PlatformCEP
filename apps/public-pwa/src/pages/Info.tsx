import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Card, StateView } from '@cep/design-system';

/** Page Informations — communiqués, calendrier, documents officiels (état vide). */
export function Info(): JSX.Element {
  const { t } = useI18n();
  return (
    <section style={{ maxWidth: 1000, margin: '0 auto', padding: 'var(--cep-space-8) var(--cep-space-6)', width: '100%' }}>
      <h1 style={{ fontSize: 'var(--cep-font-size-h2)' }}>{t('pages.info.title')}</h1>
      <div style={{ display: 'grid', gap: 'var(--cep-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: 'var(--cep-space-5)' }}>
        <Card title={t('pages.info.communiques')} body={<StateView state="empty" title={t('pages.info.communiques')} />} />
        <Card title={t('pages.info.calendar')} body={<StateView state="empty" title={t('pages.info.calendar')} />} />
        <Card title={t('pages.info.documents')} body={<StateView state="empty" title={t('pages.info.documents')} />} />
      </div>
    </section>
  );
}

/** Page Diaspora — modalités activables par configuration, jamais supposées. */
export function Diaspora(): JSX.Element {
  const { t } = useI18n();
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--cep-space-8) var(--cep-space-6)', width: '100%' }}>
      <h1 style={{ fontSize: 'var(--cep-font-size-h2)' }}>{t('public.nav.diaspora')}</h1>
      <p style={{ color: 'var(--cep-color-text-secondary)', marginBlock: 'var(--cep-space-3)' }}>
        {t('pages.info.empty')}
      </p>
      <div style={{ marginTop: 'var(--cep-space-5)' }}>
        <StateView state="empty" title={t('pages.info.empty')} description={t('pages.results.emptyDetail')} />
      </div>
    </section>
  );
}

/** Page Aide / Support — les secrets ne sont jamais transmis. */
export function Help(): JSX.Element {
  const { t } = useI18n();
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--cep-space-8) var(--cep-space-6)', width: '100%' }}>
      <h1 style={{ fontSize: 'var(--cep-font-size-h2)' }}>{t('public.nav.help')}</h1>
      <div style={{ marginTop: 'var(--cep-space-5)' }}>
        <StateView state="empty" title={t('public.hero.ctaUnderstand')} description={t('pages.info.empty')} />
      </div>
    </section>
  );
}
