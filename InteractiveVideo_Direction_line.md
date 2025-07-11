# Interactive Video v2 Analysis & Direction Line Implementation Guide

## Current Architecture Overview

### 1. **App Structure**
```
InteractiveVideoApp.vue
├── InteractiveVideoIntro.vue (intro screen)
└── InteractiveVideoPlayer.vue (player screen)
```

### 2. **Store Structure**
- `mainStore`: Manages activity info, autoplay settings, and direction line state
- `sequencer`: Handles screen navigation (intro → player)
- `quickCheckStore`: Manages quick check questions

### 3. **Current Flow**
1. **Intro Screen**: Shows activity info, loads media, has start button
2. **Player Screen**: Shows video player with controls and QuickCheck component

## Direction Line (DL) Implementation Guide

### **Step 1: Understanding the Requirements**

Based on ticket mae-79358, DL should:
- ✅ Play audio on the first screen of every step
- ✅ Support autoplay (500ms delay) for new steps
- ✅ Support manual play via button
- ✅ Clean up timers on navigation
- ✅ Work with video player (pause video during DL audio)

### **Step 2: Data Structure**

**Direction Line Data:**
```javascript
{
  stepId: "step_001",
  type: "interactive_step", // or "quick_check", "diagnostic"
  text: "Complete the interactive activity.",
  isNew: true, // determines if autoplay should happen
  languageCode: "en",
  audioPath: "/audio/direction-lines/step_001/en.mp3" // optional
}
```

### **Step 3: Component Architecture**

**Required Components:**
1. `DirectionLine.vue` - Main DL component
2. `PlayButton.vue` - Audio play/pause button
3. `DirectionLine` class - Data model and audio logic

### **Step 4: Implementation Steps**

#### **A. Create DirectionLine Class**
```javascript
// stores/main/direction_line.js
export class DirectionLine {
  constructor(options) {
    this.stepId = options.stepId;
    this.text = options.text;
    this.isNew = options.isNew;
    this.audioPath = options.audioPath;
    this.languageCode = options.languageCode;
  }

  // Audio playback methods
  async playAudio() { /* implementation */ }
  async playTTS() { /* fallback */ }
}
```

#### **B. Create PlayButton Component**
```vue
<!-- components/PlayButton.vue -->
<template>
  <button @click="$emit('click')" :class="stateClass">
    <!-- Speaker icon for paused, pause icon for playing -->
  </button>
</template>
```

#### **C. Create DirectionLine Component**
```vue
<!-- components/DirectionLine.vue -->
<template>
  <div class="direction-line">
    <PlayButton v-if="showPlayButton" @click="play" />
    <div class="direction-line__text">{{ directionLine.text }}</div>
  </div>
</template>
```

#### **D. Update Main Store**
```javascript
// stores/main/main_store.js
export const mainStore = defineStore('interactive_video_v2', {
  state: () => ({
    // ... existing state
    currentDirectionLine: null,
    isDirectionLinePlaying: false,
    directionLineTimer: null,
  }),
  
  actions: {
    setCurrentDirectionLine(directionLine) { /* implementation */ },
    startDirectionLineAudio() { /* implementation */ },
    playDirectionLineAudio() { /* implementation */ },
    stopDirectionLineAudio() { /* implementation */ },
    cleanupDirectionLine() { /* implementation */ },
  }
});
```

#### **E. Update InteractiveVideoPlayer**
```vue
<!-- views/InteractiveVideoPlayer.vue -->
<template>
  <div>
    <!-- Video player -->
    <DirectionLine 
      v-if="currentDirectionLine"
      :direction-line="currentDirectionLine"
      @play="handleDirectionLinePlay"
      @audio-ended="handleDirectionLineAudioEnded" />
    <!-- Other components -->
  </div>
</template>
```

### **Step 5: Audio Playback Logic**

#### **A. Audio File Priority**
1. **Try audio file first** (if `audioPath` exists)
2. **Fallback to TTS** (if audio file fails or doesn't exist)
3. **Silent fallback** (if TTS fails)

#### **B. Autoplay Logic**
```javascript
// When step loads
if (directionLine.isNew) {
  // Wait 500ms, then autoplay
  setTimeout(() => {
    directionLine.playAudio();
  }, 500);
}
```

#### **C. Video Integration**
```javascript
// When DL audio starts
handleDirectionLinePlay() {
  if (videoPlayer.isPlaying) {
    videoPlayer.pause();
  }
}

// When DL audio ends
handleDirectionLineAudioEnded() {
  if (store.actionSettings.useAutoPlay) {
    videoPlayer.play();
  }
}
```

### **Step 6: Step Data Integration**

#### **A. Step Types**
- `interactive_step`: "Complete the interactive activity."
- `quick_check`: "Answer the questions to check your progress."
- `diagnostic`: "Complete the diagnostic assessment."
- `video_intro`: "Watch the video and follow along."

#### **B. Step Data Structure**
```javascript
// Example step data
{
  id: "step_001",
  type: "interactive_step",
  directionLine: "Custom direction text", // optional
  isNew: true,
  languageCode: "en"
}
```

### **Step 7: Timer Management**

#### **A. Setup Timer**
```javascript
startDirectionLineAudio() {
  this.directionLineTimer = setTimeout(() => {
    if (this.currentDirectionLine?.isNew) {
      this.playDirectionLineAudio();
    }
  }, 500);
}
```

#### **B. Cleanup Timer**
```javascript
cleanupDirectionLine() {
  if (this.directionLineTimer) {
    clearTimeout(this.directionLineTimer);
    this.directionLineTimer = null;
  }
  // Stop any ongoing audio
  speechSynthesis.cancel();
}
```

### **Step 8: Error Handling**

#### **A. Audio File Errors**
```javascript
try {
  await playAudioFile();
} catch (error) {
  console.warn('Audio file failed, trying TTS');
  await playTTS();
}
```

#### **B. TTS Errors**
```javascript
try {
  await playTTS();
} catch (error) {
  console.warn('TTS failed, continuing silently');
  emit('audioEnded');
}
```

## Example Implementation Flow

### **Scenario 1: New Step with Audio File**
1. User navigates to step
2. DirectionLine component mounts
3. Store sets current direction line
4. Timer starts (500ms delay)
5. Audio file plays
6. Video pauses during audio
7. Audio ends, video resumes (if autoplay enabled)

### **Scenario 2: New Step without Audio File**
1. User navigates to step
2. DirectionLine component mounts
3. Store sets current direction line
4. Timer starts (500ms delay)
5. TTS plays direction line text
6. Video pauses during TTS
7. TTS ends, video resumes (if autoplay enabled)

### **Scenario 3: Manual Play**
1. User clicks play button
2. Audio plays immediately (no delay)
3. Video pauses during audio
4. Audio ends, video resumes (if autoplay enabled)

## File Structure

```
interactive_video_v2/
├── components/
│   ├── DirectionLine.vue
│   ├── PlayButton.vue
│   └── DirectionLineSpec.vitest.js
├── stores/main/
│   ├── direction_line.js
│   └── main_store.js (updated)
├── views/
│   └── InteractiveVideoPlayer.vue (updated)
└── INTERACTIVE_VIDEO_V2_ANALYSIS.md
```

## Key Implementation Points

### **1. Component Communication**
- DirectionLine emits events: `play`, `pause`, `audioEnded`
- InteractiveVideoPlayer handles these events
- Store manages state and timer cleanup

### **2. Audio Strategy**
- Primary: Audio files from server
- Fallback: Browser TTS (speechSynthesis)
- Graceful degradation if both fail

### **3. State Management**
- `currentDirectionLine`: Current step's direction line
- `isDirectionLinePlaying`: Audio playback state
- `directionLineTimer`: Autoplay timer reference

### **4. Integration Points**
- Video player pauses during DL audio
- QuickCheck integration (if needed)
- Screen navigation cleanup

This implementation provides a complete Direction Line system that integrates seamlessly with the existing Interactive Video v2 architecture while following the requirements from ticket mae-79358. 