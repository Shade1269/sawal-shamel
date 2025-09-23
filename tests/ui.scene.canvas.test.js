import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const CanvasMock = ({ children }) => React.createElement('canvas', null, children);

test('Canvas3D renders a canvas element when WebGL is available', async () => {
  const { Canvas3D } = await import('../src/three/Canvas3D.tsx');
  const html = renderToStaticMarkup(
    React.createElement(
      Canvas3D,
      { CanvasComponent: CanvasMock },
      React.createElement('span', null, 'placeholder')
    )
  );
  assert.ok(html.includes('<canvas'));
});

test('SimpleScene renders canvas surface with provided configuration', async () => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;

  try {
    globalThis.window = {
      devicePixelRatio: 1.6,
      matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    };
    globalThis.document = {
      hidden: false,
      addEventListener() {},
      removeEventListener() {},
      createElement: () => ({
        getContext: () => ({}),
      }),
    };

    const { SimpleScene } = await import('../src/three/SimpleScene.tsx');
    const sceneHtml = renderToStaticMarkup(
      React.createElement(SimpleScene, {
        config: {
          camera: { position: [0, 1.25, 4], fov: 45 },
          lights: [{ type: 'ambient', intensity: 0.5 }],
          effects: {},
          model: { example: 'cube', autoRotate: false },
        },
        CanvasComponent: CanvasMock,
      })
    );
    assert.ok(sceneHtml.includes('<canvas'));
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  }
});
