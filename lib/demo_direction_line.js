// @ts-check

import { DirectionLine } from '../stores/main/direction_line';

/**
 * Demo function to show how Direction Line audio works like Vocabulary Tutorial v3
 * This demonstrates the dynamic audio generation system
 */
export async function demoDirectionLineAudio() {
  console.log('🎵 Interactive Video Tutorial v2 - Direction Line Audio Demo');
  console.log('=' .repeat(60));

  // Example 1: Step with dynamic audio generation
  console.log('\n📝 Example 1: Dynamic Audio Generation');
  const step1 = new DirectionLine({
    stepId: 'video-intro',
    languageCode: 'en',
    name: 'video_step',
    text: 'Watch the video and follow along with the instructions.',
    isNew: true,
  });

  console.log('Step ID:', step1.stepId);
  console.log('Generated Audio Path:', step1.audioPath);
  console.log('Text:', step1.text);
  console.log('Language:', step1.languageCode);

  // Check if audio file exists
  const audioAvailable = await step1.checkAudioAvailability();
  console.log('Audio File Available:', audioAvailable);

  // Example 2: Step with custom audio path
  console.log('\n📝 Example 2: Custom Audio Path');
  const step2 = new DirectionLine({
    stepId: 'interactive-quiz',
    languageCode: 'es',
    name: 'quiz_step',
    text: 'Complete the interactive quiz to test your knowledge.',
    audioPath: '/custom/audio/quiz-instructions.mp3',
    isNew: true,
  });

  console.log('Step ID:', step2.stepId);
  console.log('Custom Audio Path:', step2.audioPath);
  console.log('Text:', step2.text);
  console.log('Language:', step2.languageCode);

  // Example 3: Step without audio (fallback to TTS)
  console.log('\n📝 Example 3: TTS Fallback');
  const step3 = new DirectionLine({
    stepId: 'final-step',
    languageCode: 'fr',
    name: 'interactive_step',
    text: 'Great job! You have completed the tutorial.',
    isNew: true,
  });

  console.log('Step ID:', step3.stepId);
  console.log('Generated Audio Path:', step3.audioPath);
  console.log('Text:', step3.text);
  console.log('Language:', step3.languageCode);

  // Example 4: Step that's not new (no audio button)
  console.log('\n📝 Example 4: Non-New Step (No Audio Button)');
  const step4 = new DirectionLine({
    stepId: 'repeat-step',
    languageCode: 'en',
    name: 'video_step',
    text: 'Watch the video again if needed.',
    isNew: false, // This step is not new, so no audio button will show
  });

  console.log('Step ID:', step4.stepId);
  console.log('Is New:', step4.isNew);
  console.log('Will Show Audio Button:', step4.audioPath && step4.isNew);

  console.log('\n🎯 Key Features:');
  console.log('✅ Dynamic audio path generation: /audio/direction-lines/{stepId}/{language}.mp3');
  console.log('✅ Audio file availability checking');
  console.log('✅ TTS fallback when audio files are not available');
  console.log('✅ Language-specific audio support');
  console.log('✅ Conditional audio button display (only for new steps)');
  console.log('✅ Automatic audio generation on component mount');

  console.log('\n🔄 How it works:');
  console.log('1. Step loads with stepId and languageCode');
  console.log('2. System generates audio path: /audio/direction-lines/{stepId}/{language}.mp3');
  console.log('3. Checks if audio file exists on server');
  console.log('4. If available: plays audio file');
  console.log('5. If not available: uses browser TTS as fallback');
  console.log('6. Audio button only shows for new steps with audio');

  return {
    step1,
    step2,
    step3,
    step4,
  };
}

/**
 * Demo function to show step navigation with audio
 */
export function demoStepNavigation() {
  console.log('\n🎮 Step Navigation Demo');
  console.log('=' .repeat(40));

  const steps = [
    {
      id: 'intro',
      name: 'video_step',
      text: 'Welcome to the interactive video tutorial.',
      languageCode: 'en',
    },
    {
      id: 'main-content',
      name: 'video_step',
      text: 'Watch the main video content carefully.',
      languageCode: 'en',
    },
    {
      id: 'quiz',
      name: 'quiz_step',
      text: 'Answer the questions to test your understanding.',
      languageCode: 'en',
    },
    {
      id: 'conclusion',
      name: 'interactive_step',
      text: 'Great job! You have completed the tutorial.',
      languageCode: 'en',
    },
  ];

  console.log('Steps in this tutorial:');
  steps.forEach((step, index) => {
    const directionLine = new DirectionLine({
      stepId: step.id,
      languageCode: step.languageCode,
      name: step.name,
      text: step.text,
      isNew: index === 0, // Only first step is new
    });

    console.log(`\nStep ${index + 1}: ${step.id}`);
    console.log(`  Audio Path: ${directionLine.audioPath}`);
    console.log(`  Is New: ${directionLine.isNew}`);
    console.log(`  Will Show Audio: ${directionLine.audioPath && directionLine.isNew}`);
    console.log(`  Text: "${directionLine.text}"`);
  });

  console.log('\n🎯 Navigation Behavior:');
  console.log('• First step: Audio button shows, auto-plays if enabled');
  console.log('• Subsequent steps: Audio button shows if step is marked as new');
  console.log('• Audio plays before video resumes (if auto-play enabled)');
  console.log('• Timer cleanup on navigation between steps');
} 