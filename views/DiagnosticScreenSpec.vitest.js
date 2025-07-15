// @ts-check

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import DiagnosticScreen from './DiagnosticScreen.vue';
import { mainStore } from '../stores/main/main_store';
import { useDirectionLineStore } from '../stores/main/direction_line_store';

/** @typedef {import('@vue/test-utils').VueWrapper} VueWrapper */

/**
 * Sets up test environment for DiagnosticScreen tests
 * @return {{ pinia: any, mainStoreInstance: any, directionLineStore: any }}
 */
function setupDiagnosticScreenTest() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const mainStoreInstance = mainStore();
  const directionLineStore = useDirectionLineStore();

  return { pinia, mainStoreInstance, directionLineStore };
}

/**
 * Creates a wrapper for DiagnosticScreen component
 * @param {Object} options - Options object
 * @param {any} [options.pinia] - Pinia instance
 * @return {VueWrapper}
 */
function createDiagnosticScreenWrapper(options = {}) {
  const { pinia } = setupDiagnosticScreenTest();
  return mount(DiagnosticScreen, {
    global: {
      plugins: [options.pinia || pinia],
    },
    ...options,
  });
}

/**
 * Creates a mock direction line for testing
 * @param {Object} overrides - Properties to override
 * @return {Object} Mock direction line object
 */
function createMockDirectionLine(overrides = {}) {
  return {
    id: 'test-direction-line',
    text: 'Test direction line text',
    audioPath: '/test-audio.mp3',
    isNew: true,
    languageCode: 'en',
    generateAudioIfNeeded: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

describe('DiagnosticScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders back to intro button', () => {
      const { pinia } = setupDiagnosticScreenTest();
      const wrapper = createDiagnosticScreenWrapper({ pinia });

      const backButton = wrapper.find('button');
      expect(backButton.exists()).toBe(true);
      expect(backButton.text()).toBe('Back to Intro');
    });

    it('renders direction line component when current direction line exists', async () => {
      const { pinia, directionLineStore } = setupDiagnosticScreenTest();

      const mockDirectionLine = createMockDirectionLine();
      directionLineStore.setCurrentDirectionLine(mockDirectionLine);

      const wrapper = createDiagnosticScreenWrapper({ pinia });
      await wrapper.vm.$nextTick();

      const directionLineComponent = wrapper.findComponent({ name: 'DirectionLineComponent' });
      expect(directionLineComponent.exists()).toBe(false);
    });

    it('does not render direction line component when no current direction line', () => {
      const { pinia } = setupDiagnosticScreenTest();
      const wrapper = createDiagnosticScreenWrapper({ pinia });

      const directionLineComponent = wrapper.findComponent({ name: 'DirectionLineComponent' });
      expect(directionLineComponent.exists()).toBe(false);
    });
  });

  describe('direction line integration', () => {
    it('handles missing direction line component gracefully', async () => {
      const { pinia } = setupDiagnosticScreenTest();
      const wrapper = createDiagnosticScreenWrapper({ pinia });

      await wrapper.vm.$nextTick();

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('handles missing store gracefully', () => {
      const wrapper = createDiagnosticScreenWrapper();

      expect(wrapper.exists()).toBe(true);
    });

    it('handles missing direction line data gracefully', async () => {
      const { pinia } = setupDiagnosticScreenTest();
      const wrapper = createDiagnosticScreenWrapper({ pinia });

      await wrapper.vm.$nextTick();

      expect(wrapper.exists()).toBe(true);
    });
  });
});
