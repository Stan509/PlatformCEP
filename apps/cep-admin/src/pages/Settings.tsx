import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Card } from '@cep/design-system';

/** Configuration — moteur électoral configurable, invariants (spec §24). */
export function Settings(): JSX.Element {
  const { t } = useI18n();
  return (
    <div style={{ display: 'grid', gap: 'var(--cep-space-5)', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      <Card title={t('admin.settings.configHint')} body={<span style={{ fontSize: 'var(--cep-font-size-small)', color: 'var(--cep-color-text-secondary)' }}>{t('admin.settings.separationHint')}</span>} />
      <Card title={t('admin.nav.settings')} body={<span style={{ fontSize: 'var(--cep-font-size-small)', color: 'var(--cep-color-text-secondary)' }}>{t('admin.settings.separationHint')}</span>} />
    </div>
  );
}
