import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { applyThemeToDocument } from '../src/hooks/useTheme.ts';
import { getTheme } from '../src/themes/registry.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function parseTokens(themeId) {
  const css = readFileSync(path.join(projectRoot, 'src', 'themes', themeId, 'tokens.css'), 'utf8');
  const tokens = {};
  const regex = /(--[a-z0-9-]+):\s*([^;]+);/gi;
  let match;
  while ((match = regex.exec(css))) {
    tokens[match[1]] = match[2].trim();
  }
  return tokens;
}

const themeTokens = {
  default: parseTokens('default'),
  luxury: parseTokens('luxury'),
  damascus: parseTokens('damascus'),
};

class FakeDocumentElement {
  constructor() {
    this.attributes = new Map();
    this.styleVars = { ...themeTokens.default };
    this.style = {
      setProperty: (name, value) => {
        this.styleVars[name] = value;
      },
    };
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
    if (name === 'data-theme') {
      this.styleVars = { ...(themeTokens[value] ?? this.styleVars) };
    }
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }
}

const fakeDocumentElement = new FakeDocumentElement();

globalThis.document = { documentElement: fakeDocumentElement };

globalThis.getComputedStyle = (element) => ({
  getPropertyValue: (name) => element.styleVars[name] ?? '',
});

test('applyThemeToDocument updates root data-theme and token values', () => {
  applyThemeToDocument(getTheme('default'));
  const root = globalThis.document.documentElement;
  assert.equal(root.getAttribute('data-theme'), 'default');
  assert.equal(globalThis.getComputedStyle(root).getPropertyValue('--bg').trim(), themeTokens.default['--bg']);

  applyThemeToDocument(getTheme('luxury'));
  assert.equal(root.getAttribute('data-theme'), 'luxury');
  assert.equal(globalThis.getComputedStyle(root).getPropertyValue('--bg').trim(), themeTokens.luxury['--bg']);

  applyThemeToDocument(getTheme('damascus'));
  assert.equal(root.getAttribute('data-theme'), 'damascus');
  assert.equal(globalThis.getComputedStyle(root).getPropertyValue('--bg').trim(), themeTokens.damascus['--bg']);
});
