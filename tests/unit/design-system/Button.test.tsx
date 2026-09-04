import { test, expect } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@cep/i18n';
import { Button } from '@cep/design-system';

function renderWithProvider(ui: ReactNode) {
  return render(<I18nProvider>{ui}</I18nProvider>);
}

test('Button — état default affiche son contenu', () => {
  renderWithProvider(<Button>Continuer</Button>);
  expect(screen.getByRole('button', { name: /continuer/i })).toBeDefined();
});

test('Button — état loading affiche le libellé de chargement et désactive', () => {
  renderWithProvider(<Button isLoading>Continuer</Button>);
  const btn = screen.getByRole('button');
  expect(btn.getAttribute('aria-busy')).toBe('true');
  expect(btn.hasAttribute('disabled')).toBe(true);
});
