// @ts-check

import { describe, it, expect, beforeEach } from 'vitest';
import { Sequencer } from './sequencer';

describe('Sequencer', () => {
  /** @type {import('./sequencer').Sequencer} */
  let sequencer;

  beforeEach(() => {
    sequencer = new Sequencer();
  });

  describe('initialization', () => {
    it('should initialize with empty screens', () => {
      expect(sequencer.screens).toEqual([]);
      expect(sequencer.currentScreen).toBeNull();
    });
  });

  describe('screen management', () => {
    it('should add screens correctly', () => {
      const screens = [
        { id: 'intro', name: 'intro' },
        { id: 'player', name: 'player' },
      ];

      sequencer.addScreen(screens);

      expect(sequencer.screens).toEqual(screens);
    });

    it('should go to specific screen', () => {
      const screens = [
        { id: 'intro', name: 'intro' },
        { id: 'player', name: 'player' },
      ];

      sequencer.addScreen(screens);
      sequencer.goToScreen('player');

      expect(sequencer.currentScreen?.id).toBe('player');
    });

    it('should get current screen', () => {
      const screens = [
        { id: 'intro', name: 'intro' },
        { id: 'player', name: 'player' },
      ];

      sequencer.addScreen(screens);
      sequencer.goToScreen('intro');

      expect(sequencer.currentScreen?.id).toBe('intro');
    });
  });

  describe('navigation', () => {
    it('should go to next screen', () => {
      const screens = [
        { id: 'intro', name: 'intro' },
        { id: 'player', name: 'player' },
      ];

      sequencer.addScreen(screens);
      sequencer.goToScreen('intro');
      sequencer.goToNextScreen();

      expect(sequencer.currentScreen?.id).toBe('player');
    });

    it('should handle navigation when no current screen', () => {
      const screens = [
        { id: 'intro', name: 'intro' },
        { id: 'player', name: 'player' },
      ];

      sequencer.addScreen(screens);
      sequencer.goToNextScreen();

      expect(sequencer.currentScreen).toBeNull();
    });
  });
});
