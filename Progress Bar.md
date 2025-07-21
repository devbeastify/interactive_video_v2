# Progress Bar Implementation for Interactive Video V2

## Overview

This implementation provides a progress bar component for Interactive Video V2 tutorials that allows students to navigate through video segments and quick checks.

## Features

- **Segment-based Navigation**: Progress bar shows individual segments for video portions and quick checks
- **Dynamic Enabling**: Segments become clickable as students progress through the tutorial
- **Visual Feedback**: Clear visual states for disabled, enabled, and current segments
- **Event-driven Architecture**: Uses custom events for communication between components

## Components

### ProgressBarApp.vue
Main Vue component that manages the progress bar state and handles events.

### ProgressBarElement.vue
Individual progress bar element that renders as either a button or link.

### ProgressBarButton.vue
Button-style progress bar element that dispatches click events.

### ProgressBarLink.vue
Link-style progress bar element for navigation.

## Integration with Interactive Video V2

### 1. Include Progress Bar in Template

Add the progress bar to your Interactive Video V2 template:

```erb
<%= render 'maestro_activity_engine/activities/progress_bar', elements: progress_elements %>
```

### 2. Create Progress Elements Data

In your Ruby controller or presenter, create the progress elements:

```ruby
def progress_elements
  elements = []
  
  # Add video segments and quick checks
  activity_info.quick_checks.each_with_index do |quick_check, index|
    # Video segment before quick check
    if quick_check.offset > current_time
      elements << {
        action_type: 'button',
        event_data: {
          elementIndex: index * 2,
          segmentType: 'video',
          startTime: current_time,
          endTime: quick_check.offset
        },
        is_enabled: index == 0,
        is_current: index == 0,
        label: "Video Segment #{index + 1}",
        url: ''
      }
    end
    
    # Quick check segment
    elements << {
      action_type: 'button',
      event_data: {
        elementIndex: index * 2 + 1,
        segmentType: 'quick_check',
        startTime: quick_check.offset,
        endTime: quick_check.offset + (quick_check.gap || 10),
        offset: quick_check.offset
      },
      is_enabled: false,
      is_current: false,
      label: "Quick Check #{index + 1}",
      url: ''
    }
    
    current_time = quick_check.offset + (quick_check.gap || 10)
  end
  
  elements
end
```

### 3. Handle Progress Bar Events

In your Interactive Video V2 component, listen for progress bar events:

```javascript
// Listen for segment navigation
document.addEventListener('progressBarButtonClick', (event) => {
  const { elementIndex, startTime, segmentType } = event.detail;
  
  if (segmentType === 'video') {
    // Navigate to video time
    videoPlayer.currentTime(startTime);
  } else if (segmentType === 'quick_check') {
    // Trigger quick check
    triggerQuickCheck(startTime);
  }
});

// Enable segments as they're completed
document.addEventListener('progressBarElementEnabled', (event) => {
  const { elementIndex } = event.detail;
  // Update UI to show segment as enabled
});
```

## Event System

### progressBarButtonClick
Dispatched when a user clicks an enabled progress bar element.

**Event Detail:**
```javascript
{
  elementIndex: number,
  segmentType: 'video' | 'quick_check',
  startTime: number,
  endTime: number,
  offset?: number
}
```

### progressBarElementEnabled
Dispatched when a segment should be enabled (e.g., after completing a quick check).

**Event Detail:**
```javascript
{
  elementIndex: number
}
```

## Styling

The progress bar uses MusicV3 design system variables:

- `--music-red-300`: Border color for disabled segments
- `--music-red-500`: Background color for enabled segments
- `--music-gray-700`: Text color for hover/focus states

## Usage Example

```vue
<template>
  <div>
    <!-- Video player -->
    <div class="video-container">
      <!-- Video content -->
    </div>
    
    <!-- Progress bar -->
    <ProgressBar
      :activityInfo="activityInfo"
      :videoPlayer="videoPlayer"
      @segment-navigation="handleNavigation" />
  </div>
</template>

<script setup>
import ProgressBar from './components/ProgressBar.vue';

const handleNavigation = (navigationData) => {
  if (navigationData.type === 'video') {
    videoPlayer.currentTime(navigationData.startTime);
  }
};
</script>
```

## Requirements

- Vue 3
- MusicV3 design system
- Interactive Video V2 activity structure with quick checks

## Notes

- Progress bar elements are disabled by default and enabled as students progress
- Video segments are enabled when the video reaches their end time
- Quick check segments are enabled when the quick check is completed
- The progress bar automatically handles visual states and accessibility 