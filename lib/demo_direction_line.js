/**
 * Demo file showing how to use the DirectionLine system in Interactive Video v2
 * Based on the Vocabulary Tutorial v3 implementation
 */

import { DirectionLine } from '../stores/main/direction_line';

/**
 * Example of how to create direction lines for different step types
 */
export function createDirectionLinesForSteps() {
  const directionLines = {
    // Video intro step
    video_intro: new DirectionLine({
      stepId: 'video_intro_001',
      name: 'video_intro',
      text: 'Welcome to the interactive video tutorial. Watch the video and follow along.',
      isNew: true,
      languageCode: 'en',
      stepType: 'video_intro',
    }),

    // Interactive step
    interactive_step: new DirectionLine({
      stepId: 'interactive_step_001',
      name: 'interactive_step',
      text: 'Complete the interactive activity to test your understanding.',
      isNew: true,
      languageCode: 'en',
      stepType: 'interactive_step',
    }),

    // Quick check step
    quick_check: new DirectionLine({
      stepId: 'quick_check_001',
      name: 'quick_check',
      text: 'Answer the questions to check your progress.',
      isNew: true,
      languageCode: 'en',
      stepType: 'quick_check',
    }),

    // Diagnostic step
    diagnostic: new DirectionLine({
      stepId: 'diagnostic_001',
      name: 'diagnostic',
      text: 'Complete the diagnostic assessment to evaluate your learning.',
      isNew: true,
      languageCode: 'en',
      stepType: 'diagnostic',
    }),
  };

  return directionLines;
}

/**
 * Example of how to integrate direction lines with step data from XML
 */
export function createDirectionLinesFromStepData(stepData) {
  const directionLines = [];

  stepData.forEach((step, index) => {
    const directionLine = new DirectionLine({
      stepId: step.id || `step_${index}`,
      name: step.type || 'interactive_step',
      text: step.directionLine || '',
      isNew: step.isNew !== false,
      languageCode: step.languageCode || 'en',
      stepType: step.type || 'interactive_step',
    });

    directionLines.push(directionLine);
  });

  return directionLines;
}

/**
 * Example of how to handle direction line audio playback in a component
 */
export function setupDirectionLineAudio(directionLine, store) {
  // Set the direction line in the store
  store.setCurrentDirectionLine(directionLine);

  // Start audio playback with autoplay
  store.startDirectionLineAudio();

  // Example of manual play
  const playDirectionLine = async () => {
    try {
      await store.playDirectionLineAudio();
    } catch (error) {
      console.error('Failed to play direction line audio:', error);
    }
  };

  // Example of cleanup
  const cleanupDirectionLine = () => {
    store.cleanupDirectionLine();
  };

  return {
    playDirectionLine,
    cleanupDirectionLine,
  };
}

/**
 * Example of how to handle direction line events in a Vue component
 */
export function createDirectionLineHandlers(videoPlayer, store) {
  const handleDirectionLinePlay = () => {
    // Pause video when direction line audio starts
    if (videoPlayer && videoPlayer.isPlaying) {
      videoPlayer.pause();
    }
  };

  const handleDirectionLinePause = () => {
    // Resume video if autoplay is enabled
    if (videoPlayer && store.actionSettings.useAutoPlay) {
      videoPlayer.play();
    }
  };

  const handleDirectionLineAudioEnded = () => {
    // Resume video if autoplay is enabled
    if (videoPlayer && store.actionSettings.useAutoPlay) {
      videoPlayer.play();
    }
  };

  return {
    handleDirectionLinePlay,
    handleDirectionLinePause,
    handleDirectionLineAudioEnded,
  };
}

/**
 * Example of how to generate dynamic audio paths for direction lines
 */
export function generateAudioPath(stepId, languageCode = 'en') {
  return `/audio/direction-lines/${stepId}/${languageCode}.mp3`;
}

/**
 * Example of how to check audio availability and fallback to TTS
 */
export async function checkAndPlayAudio(directionLine) {
  try {
    // Check if audio file exists
    const audioAvailable = await directionLine.checkAudioAvailability();
    
    if (audioAvailable) {
      // Play audio file
      await directionLine.generateAudioIfNeeded();
    } else {
      // Fallback to TTS
      console.log('Audio file not available, using TTS fallback');
    }
  } catch (error) {
    console.error('Error checking audio availability:', error);
  }
}

/**
 * Example usage in a Vue component
 */
export function exampleUsage() {
  // Create direction line
  const directionLine = new DirectionLine({
    stepId: 'example_step_001',
    name: 'interactive_step',
    text: 'This is an example direction line with audio support.',
    isNew: true,
    languageCode: 'en',
    stepType: 'interactive_step',
  });

  // In a Vue component setup:
  // const { playDirectionLine, cleanupDirectionLine } = setupDirectionLineAudio(directionLine, store);
  // const { handleDirectionLinePlay, handleDirectionLinePause, handleDirectionLineAudioEnded } = createDirectionLineHandlers(videoPlayer, store);

  return directionLine;
} 