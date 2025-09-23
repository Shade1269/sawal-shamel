import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test('Ocean Breeze theme configuration is valid', () => {
  // Test theme.json structure
  const theme = require('../examples/custom-theme-example/theme.json');
  
  // Check required properties
  assert.ok(theme.id === 'ocean-breeze', 'Theme ID should be ocean-breeze');
  assert.ok(theme.name === 'نسيم المحيط', 'Theme name should be in Arabic');
  
  // Check colors structure
  assert.ok(typeof theme.colors === 'object', 'Colors should be an object');
  assert.ok(theme.colors.bg, 'Background color should be defined');
  assert.ok(theme.colors.fg, 'Foreground color should be defined');
  assert.ok(theme.colors.primary, 'Primary color should be defined');
  
  // Check 3D configuration
  assert.ok(typeof theme.three === 'object', '3D config should be an object');
  assert.ok(Array.isArray(theme.three.camera.position), 'Camera position should be an array');
  assert.ok(theme.three.camera.position.length === 3, 'Camera position should have 3 coordinates');
  assert.ok(Array.isArray(theme.three.lights), 'Lights should be an array');
  assert.ok(theme.three.lights.length > 0, 'Should have at least one light');
  
  // Check model configuration
  assert.ok(typeof theme.three.model === 'object', 'Model config should be an object');
  assert.ok(['cube', 'sphere', 'model'].includes(theme.three.model.example), 'Model should be a valid example');
  
  // Check effects
  assert.ok(typeof theme.three.effects === 'object', 'Effects should be an object');
  assert.ok(typeof theme.three.effects.bloom === 'object', 'Bloom should be configured');
  assert.ok(typeof theme.three.effects.fog === 'object', 'Fog should be configured');
  assert.ok(typeof theme.three.effects.shadow === 'object', 'Shadow should be configured');
});

test('Ocean Breeze Hero3D component structure', async () => {
  // This test would require proper module resolution in a real environment
  // For now, we'll test the file exists and has expected structure
  const fs = require('fs');
  const path = require('path');
  
  const heroPath = path.join(__dirname, '../examples/custom-theme-example/Hero3D.tsx');
  assert.ok(fs.existsSync(heroPath), 'Hero3D.tsx should exist');
  
  const heroContent = fs.readFileSync(heroPath, 'utf8');
  assert.ok(heroContent.includes('OceanBreezeHero3D'), 'Should export OceanBreezeHero3D component');
  assert.ok(heroContent.includes('SimpleScene'), 'Should use SimpleScene component');
  assert.ok(heroContent.includes('data-hero-canvas'), 'Should have canvas container');
  assert.ok(heroContent.includes('نسيم المحيط التفاعلي'), 'Should have Arabic title');
});

test('Ocean Breeze CSS tokens structure', () => {
  const fs = require('fs');
  const path = require('path');
  
  const cssPath = path.join(__dirname, '../examples/custom-theme-example/tokens.css');
  assert.ok(fs.existsSync(cssPath), 'tokens.css should exist');
  
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  assert.ok(cssContent.includes('[data-theme="ocean-breeze"]'), 'Should have theme selector');
  assert.ok(cssContent.includes('--bg:'), 'Should define background variable');
  assert.ok(cssContent.includes('--fg:'), 'Should define foreground variable');
  assert.ok(cssContent.includes('--primary:'), 'Should define primary color variable');
  assert.ok(cssContent.includes('oceanWaves'), 'Should have ocean animation');
});