# Quick Check Analysis - Interactive Video v2

## Overview

Quick Check is an interactive assessment feature in Interactive Video v2 that pauses video playback at specific timestamps to present users with questions or activities. It provides immediate feedback and engagement during video learning.

## Architecture

### Core Components

1. **QuickCheck.vue** - Main component that renders the quick check overlay
2. **quick_check_store.js** - Pinia store managing quick check state
3. **use_video_player.js** - Video player composable with checkpoint integration
4. **Question Components** - Specialized components for different question types

### Data Structure

```javascript
// Quick Check Data Structure
{
  "offset": 130,           // Video timestamp in seconds
  "gap": 1,               // Duration gap in seconds
  "type": "quick_check_drag_and_drop", // Question type
  "quick_check_content": {
    "dl": "Which subject pronoun would you use to talk about these people?",
    "items": [
      {
        "prompt": "una mujer: %1%",
        "words": [
          { "content": "yo", "targetId": null },
          { "content": "ella", "targetId": "1" },
          { "content": "tú", "targetId": null }
        ],
        "targets": [
          { "content": "ella", "targetId": "1" }
        ],
        "size": "word"
      }
    ]
  }
}
```

## Question Types

### 1. Multiple Choice (`multiple_choice`)
- **Component**: `MultipleChoiceQuestion.vue`
- **Features**: Radio button selection, single correct answer
- **Props**: `question` object with `prompt` and `choices`
- **Events**: `answer-selected` with choice index

### 2. Fill in the Blanks (`fill_in_the_blanks`)
- **Component**: `FillInTheBlanksQuestion.vue`
- **Features**: Text input fields for multiple blanks
- **Props**: `question` object with `prompt` and `blanks` array
- **Events**: `answer-submitted` with answers array

### 3. Pronunciation (`pronunciation`)
- **Component**: `PronunciationQuestion.vue`
- **Features**: Audio playback and recording functionality
- **Props**: `question` object and optional `pronunciationToggle`
- **Events**: `pronunciation-complete` with recording state

### 4. Drag and Drop (`quick_check_drag_and_drop`)
- **Features**: Word/phrase matching with drag and drop interface
- **Structure**: Words array with targets for matching

## Store Management

### Quick Check Store (`quick_check_store.js`)

**State Properties:**
- `currentOffset`: Current video timestamp
- `content`: Current question content
- `isComplete`: Whether current question is completed
- `pronunciationToggle`: Reference to pronunciation toggle element
- `isVisible`: Whether quick check overlay is visible
- `quickChecks`: Array of all quick check data

**Key Methods:**
- `showQuickCheck()`: Display the quick check overlay
- `hideQuickCheck()`: Hide the quick check overlay
- `completeQuickCheck()`: Mark current question complete and resume video
- `updateQuickCheckState()`: Update multiple state properties
- `reset()`: Reset all state to initial values

**Getters:**
- `currentQuickCheck`: Get current question based on offset
- `hasQuickChecks`: Check if any quick checks are available

## Video Integration

### Checkpoint System

1. **Setup**: `setupCheckpoints()` in `use_video_player.js`
   - Maps quick check data to checkpoint points
   - Configures video player plugin with timestamps
   - Sets up callback for checkpoint events

2. **Trigger**: `handleCheckpointReached(offset)`
   - Pauses video playback
   - Sets current offset in store
   - Shows quick check overlay
   - Handles pronunciation toggle if available

3. **Completion**: `completeQuickCheck()`
   - Dispatches `finishCheckpoint` event
   - Hides quick check overlay
   - Resumes video playback (if autoplay enabled)
   - Resets store state

### Video Player Events

```javascript
// Checkpoint reached
handleCheckpointReached(offset) {
  videoPlayer.pause();
  quickCheckStore.currentOffset = offset;
  quickCheckStore.showQuickCheck();
}

// Quick check completed
completeQuickCheck() {
  document.dispatchEvent(new CustomEvent('finishCheckpoint'));
  quickCheckStore.hideQuickCheck();
  // Video resumes via event listener
}
```

## User Flow

1. **Video Playback**: Video plays normally until checkpoint
2. **Checkpoint Reached**: Video pauses at specified timestamp
3. **Question Display**: Quick check overlay appears with question
4. **User Interaction**: User answers question using appropriate interface
5. **Completion**: Question marked complete, overlay disappears
6. **Video Resume**: Video continues playback from checkpoint

## Integration Points

### Activity Info Integration
```javascript
// In InteractiveVideoPlayer.vue
if (store.activityInfo.quick_checks) {
  quickCheckStore.updateQuickCheckState({ 
    quickChecks: store.activityInfo.quick_checks 
  });
}
```

### Video Player Integration
```javascript
// In use_video_player.js
if (useQuickCheckStore().hasQuickChecks) {
  setupCheckpoints();
}
```

### Event Handling
```javascript
// In InteractiveVideoPlayer.vue
document.addEventListener('finishCheckpoint', handleFinishCheckpoint);

const handleFinishCheckpoint = () => {
  if (videoPlayer.value && store.actionSettings.useAutoPlay) {
    videoPlayer.value.play();
    isPlaying.value = true;
  }
};
```

## Styling

### Overlay Design
- Fixed positioning covering entire viewport
- Semi-transparent black background (`rgba(0, 0, 0, 0.8)`)
- Centered content with white background
- Responsive design with max-width constraints

### Question Components
- Consistent styling across all question types
- Hover effects for interactive elements
- Clear visual hierarchy with proper spacing
- Accessible form controls

## Error Handling

1. **Missing Quick Checks**: Graceful degradation if no quick checks available
2. **Invalid Question Types**: Fallback to default completion button
3. **Video Player Errors**: Error handling in video playback
4. **Store State**: Proper state reset and cleanup

## Testing

### Test Coverage
- Component rendering tests for each question type
- Store state management tests
- Video player integration tests
- User interaction flow tests

### Mock Data
```javascript
// Test question structure
const mockQuestion = {
  type: 'multiple_choice',
  prompt: 'Test question?',
  content: {
    question: 'Test question?',
    options: ['Option A', 'Option B', 'Option C'],
    correct_answer: 0
  }
};
```

## Key Features

1. **Timed Interruption**: Video pauses at precise timestamps
2. **Multiple Question Types**: Support for various assessment formats
3. **Immediate Feedback**: Instant completion and video resume
4. **Responsive Design**: Works across different screen sizes
5. **Accessibility**: Proper ARIA labels and keyboard navigation
6. **State Management**: Centralized state with Pinia store
7. **Event-Driven**: Clean separation of concerns via events

## Future Enhancements

1. **Scoring System**: Track correct/incorrect answers
2. **Progress Tracking**: Show completion status
3. **Retry Logic**: Allow multiple attempts
4. **Analytics**: Track user interaction patterns
5. **Custom Styling**: Theme support for different activities
6. **Offline Support**: Cache questions for offline use 