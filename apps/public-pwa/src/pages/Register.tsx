import { useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, Input } from '@cep/design-system';

type Step = 'welcome' | 'identity' | 'verify' | 'location' | 'summary' | 'confirm';
const ORDER: Step[] = ['welcome', 'identity', 'verify', 'location', 'summary', 'confirm'];

const STEP_TITLE: Record<Step, string> = {
  welcome: 'pages.register.welcomeTitle',
  identity: 'pages.register.identityTitle',
  verify: 'pages.register.verifyTitle',
  location: 'pages.register.locationTitle',
  summary: 'pages.register.summaryTitle',
  confirm: 'pages.register.confirmTitle',
};

const GEO_DEMO = ['Ouest · Port-au-Prince', 'Ouest · Pétion-Ville', 'Artibonite · Gonaïves'];

/**
 * Parcours d'inscription citoyen — WIZARD (spec §12).
 * Une seule action principale par étape, géographie jamais hardcodée (démo).
 * Valeurs fictives uniquement ; la référence finale n'est pas un preuve de vote.
 */
export function Register(): JSX.Element {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>('welcome');
  const [location, setLocation] = useState(GEO_DEMO[0] as string);
  const [confirmDone, setConfirmDone] = useState(false);

  const idx = ORDER.indexOf(step);
  const next = () => setStep(ORDER[Math.min(idx + 1, ORDER.length - 1)] as Step);
  const back = () => setStep(ORDER[Math.max(idx - 1, 0)] as Step);

  const reference = `DEMO-EP-${String(Math.floor(Math.random() * 90000) + 10000)}`;

  if (confirmDone) {
    return (
      <section style={{ maxWidth: 640, margin: '0 auto', padding: 'var(--cep-space-8) var(--cep-space-5)', width: '100%' }}>
        <Card title={t('pages.register.doneTitle')} body={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)' }}>
            <p style={{ color: 'var(--cep-color-text-secondary)' }}>{t('pages.register.doneBody')}</p>
            <strong>{reference}</strong>
            <p style={{ fontSize: 'var(--cep-font-size-small)', color: 'var(--cep-color-warning-text)' }}>
              {t('pages.register.referenceNote')}
            </p>
            <Button onClick={() => { setConfirmDone(false); setStep('welcome'); }}>
              {t('common.actions.submit')}
            </Button>
          </div>
        } />
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 640, margin: '0 auto', padding: 'var(--cep-space-8) var(--cep-space-5)', width: '100%' }}>
      <p style={{ color: 'var(--cep-color-text-muted)', fontSize: 'var(--cep-font-size-caption-lg)' }}>
        {t('pages.register.stepLabel')} {idx + 1} / {ORDER.length}
      </p>
      <h1 style={{ fontSize: 'var(--cep-font-size-h3)', margin: 'var(--cep-space-2) 0 var(--cep-space-4)' }}>
        {t(STEP_TITLE[step])}
      </h1>

      <Card body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)' }}>
          {step === 'welcome' && (
            <p style={{ color: 'var(--cep-color-text-secondary)' }}>
              {t('pages.register.welcomeBody')}
            </p>
          )}
          {step === 'identity' && (
            <>
              <Input label={t('pages.register.identityTitle')} examplePlaceholder={t('pages.status.fieldPlaceholder')} />
              <Input label={t('pages.register.identityTitle')} examplePlaceholder="Demo" />
            </>
          )}
          {step === 'verify' && (
            <Input label={t('pages.register.verifyTitle')} examplePlaceholder={t('pages.status.fieldPlaceholder')} />
          )}
          {step === 'location' && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-1)' }}>
              <span className="cep-label">{t('pages.register.locationTitle')}</span>
              <select
                className="cep-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ appearance: 'auto' }}
              >
                {GEO_DEMO.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>
          )}
          {step === 'summary' && (
            <p style={{ color: 'var(--cep-color-text-secondary)' }}>
              {t('pages.register.summaryTitle')} — {location}
            </p>
          )}
          {step === 'confirm' && (
            <p style={{ color: 'var(--cep-color-text-secondary)' }}>{t('pages.register.confirmTitle')}</p>
          )}

          <div style={{ display: 'flex', gap: 'var(--cep-space-3)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {idx > 0 && <Button variant="secondary" onClick={back}>{t('pages.register.back')}</Button>}
            {idx < ORDER.length - 1 ? (
              <Button onClick={next}>{t('pages.register.next')}</Button>
            ) : (
              <Button onClick={() => setConfirmDone(true)}>{t('common.actions.confirm')}</Button>
            )}
          </div>
        </div>
      } />
    </section>
  );
}
