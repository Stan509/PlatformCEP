import { useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, Input, StatusIndicator, StateView } from '@cep/design-system';
import { api } from '../lib/api';
import { navigate } from '../router';

type Phase = 'idle' | 'submitting' | 'result' | 'error';

/**
 * Écran « Vérifier mon statut » — minimal et sécurisé (spec §11).
 * 3 cas : enregistré (badge vert) / non trouvé (message neutre) / problème
 * (code de référence). Minimisation : informations nécessaires uniquement.
 */
export function CheckStatus(): JSX.Element {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>('idle');
  const [ref, setRef] = useState('');
  const [found, setFound] = useState(false);

  const submit = async () => {
    setPhase('submitting');
    try {
      const res = await api.checkStatus(ref);
      setFound(res.found);
      setPhase('result');
    } catch {
      setPhase('error');
    }
  };

  return (
    <section style={{ maxWidth: 640, margin: '0 auto', padding: 'var(--cep-space-8) var(--cep-space-5)', width: '100%' }}>
      <h1 style={{ fontSize: 'var(--cep-font-size-h2)', marginBottom: 'var(--cep-space-2)' }}>{t('pages.status.title')}</h1>
      <p style={{ color: 'var(--cep-color-text-secondary)', marginBottom: 'var(--cep-space-5)' }}>
        {t('public.hero.subtitle')}
      </p>

      <Card body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)' }}>
          <Input
            label={t('pages.status.fieldLabel')}
            examplePlaceholder={t('pages.status.fieldPlaceholder')}
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            loading={phase === 'submitting'}
          />
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
        <div style={{ marginTop: 'var(--cep-space-4)' }}>
          {found ? (
            <Card title={<StatusIndicator tone="success" label={t('pages.status.registeredBadge')} />} body={
              <p style={{ color: 'var(--cep-color-text-secondary)' }}>{t('pages.status.registeredBody')}</p>
            } />
          ) : (
            <Card body={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)' }}>
                <p style={{ color: 'var(--cep-color-text-secondary)' }}>{t('pages.status.notFound')}</p>
                <Button variant="secondary" onClick={() => navigate('register')}>
                  {t('pages.status.notFoundCta')}
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
