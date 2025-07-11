// @ts-check

import { defineStore } from 'pinia';
import { browserIsSafari } from '../../lib/safari_browser_check';
import { Sequencer } from '../../lib/sequencer';
import { buildScreensForActivity } from '../../lib/screens';
import { getActivityInfo, parseActivityInfo } from './activity_info';
import { DirectionLine } from './direction_line';

/**
 * @typedef ActionSettings
 * @property {boolean} useAutoPlay
 */

/**
 * @typedef VideoReference
 * @property {string} video_path
 * @property {string|null} english_subtitles_path
 * @property {string|null} foreign_subtitles_path
 * @property {string} foreign_language
 */

/**
 * @typedef QuickCheck
 * @property {number} offset
 * @property {number} gap
 * @property {string} type
 * @property {Object} quick_check_content
 */

/**
 * @typedef StepData
 * @property {string} id
 * @property {string} name
 * @property {string} [directionLineAudio]
 * @property {string} [directionLineText]
 * @property {string} [languageCode]
 * @property {number} startTime
 * @property {number} endTime
 */

/**
 * @typedef Step
 * @property {string} id
 * @property {string} name
 * @property {DirectionLine} directionLine
 * @property {number} startTime
 * @property {number} endTime
 */

/**
 * @typedef ActivityInfo
 * @property {string} topic
 * @property {string} sub_topic
 * @property {string} title
 * @property {Array<any>} reference
 * @property {Array<any>} quick_checks
 * @property {Array<StepData>} [steps]
 * @property {string} [languageCode]
 */

/**
 * @typedef MainStoreState
 * @property {ActionSettings} actionSettings
 * @property {boolean} isInitialized
 * @property {ActivityInfo} activityInfo
 * @property {number} currentStep
 * @property {Array<Step>} processedSteps
 */

export const mainStore = defineStore('interactive_video_v2', {
  state: () => ({
    actionSettings: {
      useAutoPlay: false,
    },
    isInitialized: false,
    currentStep: 0,
    /** @type {ActivityInfo} */
    activityInfo: {
      topic: '',
      sub_topic: '',
      title: '',
      reference: [],
      quick_checks: [],
      steps: [],
    },
    /** @type {Array<Step>} */
    processedSteps: [],
    sequencer: new Sequencer(),
  }),
  getters: {
    /**
     * Get the current step
     * @return {Step|null}
     */
    currentStepInfo() {
      if (this.processedSteps && this.processedSteps.length > 0) {
        return this.processedSteps[this.currentStep] || null;
      }
      return null;
    },

    /**
     * Get the total number of steps
     * @return {number}
     */
    totalSteps() {
      return this.processedSteps ? this.processedSteps.length : 0;
    },

    /**
     * Check if we're on the last step
     * @return {boolean}
     */
    isLastStep() {
      return this.currentStep === this.totalSteps - 1;
    },
  },
  actions: {
    /**
     * Initialize the store with activity information and build screens
     */
    init() {
      getActivityInfo()
        .then((activityInfo) => {
          if (!activityInfo) {
            throw new Error('Activity info element not found');
          }
          return parseActivityInfo(activityInfo);
        })
        .then((activityInfo) => {
          this.activityInfo = activityInfo;
          this._setupSteps();
          const screens = buildScreensForActivity(activityInfo);
          this.sequencer.addScreen(screens);
          this.sequencer.goToScreen('intro');
        })
        .catch((error) => console.error(error));

      this.initializeAutoPlaySetting();
      this.isInitialized = true;
    },

    /**
     * Setup steps with direction lines
     * @private
     */
    _setupSteps() {
      // Create default steps if none exist
      if (!this.activityInfo.steps || this.activityInfo.steps.length === 0) {
        const defaultDirectionLine = new DirectionLine({
          audioPath: '',
          isNew: true,
          name: 'video_step',
          text: 'Watch the video and follow along.',
          stepId: 'step-1',
          languageCode: this.activityInfo.languageCode || 'en',
        });

        this.processedSteps = [
          {
            id: 'step-1',
            name: 'video_step',
            directionLine: defaultDirectionLine,
            startTime: 0,
            endTime: 30,
          },
        ];
        return;
      }

      // Process existing steps
      this.processedSteps = this.activityInfo.steps.map((stepData, index) => {
        const directionLine = new DirectionLine({
          audioPath: stepData.directionLineAudio || '',
          isNew: index === 0, // First step is new
          name: stepData.name || 'unknown',
          text: stepData.directionLineText || '',
          stepId: stepData.id || `step-${index + 1}`,
          languageCode: stepData.languageCode || this.activityInfo.languageCode || 'en',
        });

        return {
          id: stepData.id,
          name: stepData.name,
          directionLine,
          startTime: stepData.startTime || 0,
          endTime: stepData.endTime || 30,
        };
      });
    },

    /**
     * Go to the next step
     */
    nextStep() {
      if (this.currentStep < this.totalSteps - 1) {
        this.currentStep++;
        this._updateStepDirectionLine();
      }
    },

    /**
     * Go to the previous step
     */
    previousStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
        this._updateStepDirectionLine();
      }
    },

    /**
     * Go to a specific step
     * @param {number} stepIndex
     */
    goToStep(stepIndex) {
      if (stepIndex >= 0 && stepIndex < this.totalSteps) {
        this.currentStep = stepIndex;
        this._updateStepDirectionLine();
      }
    },

    /**
     * Update the direction line for the current step
     * @private
     */
    _updateStepDirectionLine() {
      const currentStep = this.currentStepInfo;
      if (currentStep && currentStep.directionLine) {
        // Mark as new if it's different from the previous step
        const previousStep = this.currentStep > 0 ? this.processedSteps[this.currentStep - 1] : null;
        if (previousStep) {
          currentStep.directionLine.isNew = 
            currentStep.directionLine.text !== previousStep.directionLine.text ||
            currentStep.directionLine.audioPath !== previousStep.directionLine.audioPath;
        } else {
          currentStep.directionLine.isNew = true;
        }
      }
    },

    /**
     * Initialize the autoplay setting based on browser type and stored preference
     */
    initializeAutoPlaySetting() {
      const storedAutoPlay = localStorage.getItem('interactive_video_autoplay');

      if (storedAutoPlay !== null) {
        this.actionSettings.useAutoPlay = storedAutoPlay === 'true';
      } else {
        this.actionSettings.useAutoPlay = !browserIsSafari();
      }
    },

    /**
     * Update the autoplay setting and persist to localStorage
     * @param {boolean} useAutoPlay - Whether to enable autoplay
     */
    updateAutoPlaySetting(useAutoPlay) {
      this.actionSettings.useAutoPlay = useAutoPlay;
      localStorage.setItem(
        'interactive_video_autoplay',
        useAutoPlay.toString()
      );
    },

    /**
     * Reset the autoplay setting to true (enabled) and persist to localStorage
     * Called when InteractiveVideoIntro component is mounted
     */
    resetIndex() {
      this.actionSettings.useAutoPlay = true;
      localStorage.setItem('interactive_video_autoplay', 'true');
    },
  },
});
