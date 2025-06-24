import { ref } from 'vue';

export function useVideoPlayer(store, quickCheckStore, videoContainer) {
  const videoPlayer = ref(null);
  const isPlaying = ref(false);

  /**
   * Initialize the video player using VHL.Video.File
   */
  const initializeVideoPlayer = () => {
    setTimeout(() => {
      if (videoContainer.value && store.activityInfo.reference.length > 0) {
        const videoData = store.activityInfo.reference[0];

        videoPlayer.value = new VHL.Video.File();

        const options = {
          videoContainer: videoContainer.value,
          sourceURL: videoData.video_path,
          fluid: true,
          videoTracks: createCaptionObject(videoData),
        };

        videoPlayer.value.init(options);
        videoPlayer.value.show_controls = true;
        videoPlayer.value.initialize_video();
        videoPlayer.value.show_video();

        if (quickCheckStore.hasQuickChecks) {
          setupCheckpoints();
        }

        setupVideoEvents();

        handleAutoPlay();
      }
    }, 100);
  };

  /**
   * Handle auto-play based on store setting
   */
  const handleAutoPlay = () => {
    if (!videoPlayer.value) return;

    if (store.actionSettings.useAutoPlay) {
      const checkVideoReady = () => {
        if (videoPlayer.value && videoPlayer.value.videojs_player) {
          const player = videoPlayer.value.videojs_player;

          if (player.readyState() >= 1) {
            player
              .play()
              .then(() => {
                isPlaying.value = true;
              })
              .catch((error) => {
                console.warn('Auto-play failed:', error);
                isPlaying.value = false;
              });
          } else {
            setTimeout(checkVideoReady, 100);
          }
        }
      };

      setTimeout(checkVideoReady, 500);
    } else {
      isPlaying.value = false;
    }
  };

  /**
   * Set up interactive checkpoints
   */
  const setupCheckpoints = () => {
    if (!videoPlayer.value || !quickCheckStore.hasQuickChecks) return;

    const points = quickCheckStore.quickChecks.map((quickCheck) => ({
      offset: quickCheck.offset,
      gap: quickCheck.gap,
      stop: true,
    }));

    const pluginSettings = {
      minScrubberPixels: 4,
      callback: (event) => {
        handleCheckpointReached(event.offset);
      },
      points: points,
    };

    videoPlayer.value.tutorialVideoCheckpointsPlugin(pluginSettings);
  };

  /**
   * Handle checkpoint reached event
   */
  const handleCheckpointReached = (offset) => {
    if (videoPlayer.value) {
      videoPlayer.value.pause();
      isPlaying.value = false;
    }

    quickCheckStore.updateQuickCheckState({ currentOffset: offset });

    const pronunciationToggle = document.querySelector('.js-speech-rec-toggle');
    if (pronunciationToggle) {
      quickCheckStore.updateQuickCheckState({ pronunciationToggle });
    }

    quickCheckStore.showQuickCheck();
  };

  /**
   * Create caption object for video tracks
   */
  const createCaptionObject = (videoData) => {
    const arrayCaption = [];

    const enableClosedCaptions = document.getElementById(
      'enableClosedCaptions'
    )?.value;
    const allowForeign = document.getElementById('allowForeign')?.value;
    const allowEnglish = document.getElementById('allowEnglish')?.value;

    if (enableClosedCaptions === 'true') {
      if (videoData.english_subtitles_path && allowEnglish === 'true') {
        arrayCaption.push({
          src: videoData.english_subtitles_path,
          kind: 'captions',
          srclang: 'en',
          label: 'English',
        });
      }

      if (videoData.foreign_subtitles_path && allowForeign === 'true') {
        arrayCaption.push({
          src: videoData.foreign_subtitles_path,
          kind: 'captions',
          srclang: videoData.foreign_language,
          label: 'Foreign',
        });
      }
    }

    return arrayCaption;
  };

  /**
   * Set up video event listeners
   */
  const setupVideoEvents = () => {
    if (!videoPlayer.value) return;

    videoPlayer.value.on('ended', () => {
      isPlaying.value = false;
    });

    videoPlayer.value.on('play', () => {
      isPlaying.value = true;
    });

    videoPlayer.value.on('pause', () => {
      isPlaying.value = false;
    });

    videoPlayer.value.on('loadedmetadata', () => {
      if (store.actionSettings.useAutoPlay && !isPlaying.value) {
        handleAutoPlay();
      }
    });
  };

  /**
   * Clean up video player
   */
  const cleanupVideoPlayer = () => {
    if (videoPlayer.value) {
      videoPlayer.value.hide_video();
      videoPlayer.value = null;
    }
  };

  // --- Public API ---
  return {
    videoPlayer,
    isPlaying,
    initializeVideoPlayer,
    cleanupVideoPlayer,
    handleAutoPlay,
    setupCheckpoints,
    handleCheckpointReached,
    setupVideoEvents,
  };
}
