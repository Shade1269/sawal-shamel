import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import ThemeProvider from '../src/components/ThemeProvider.tsx';
import { Button as ThemeButton } from '../src/ui/Button.tsx';

function renderWithProvider(child) {
  return renderToStaticMarkup(React.createElement(ThemeProvider, null, child));
}

test('theme button exposes variant and size attributes', () => {
  const html = renderWithProvider(
    React.createElement(ThemeButton, { variant: 'outline', size: 'lg' }, 'زر رئيسي')
  );

  assert.match(html, /data-variant="outline"/);
  assert.match(html, /data-size="lg"/);
  assert.match(html, /focus-visible:ring-\[color:var\(--focus-ring,var\(--primary\)\)\]/);
});

test('loading theme button toggles disabled state', () => {
  const html = renderWithProvider(
    React.createElement(ThemeButton, { loading: true }, 'تحميل')
  );

  assert.match(html, /data-loading="true"/);
  assert.match(html, /disabled/);
  assert.match(html, /aria-busy="true"/);
});

test('button styles adapt to theme component settings and css variables', () => {
  const defaultHtml = renderWithProvider(React.createElement(ThemeButton, null, 'إجراء'));
  assert.match(defaultHtml, /--btn-bg:\s*var\(--primary\)/);
  assert.match(defaultHtml, /height:\s*44px/);

  const luxuryHtml = renderToStaticMarkup(
    React.createElement(
      ThemeProvider,
      { defaultThemeId: 'luxury' },
      React.createElement(ThemeButton, null, 'فاخر')
    )
  );
  assert.match(luxuryHtml, /--btn-bg:\s*var\(--primary\)/);
  assert.match(luxuryHtml, /height:\s*48px/);
});
