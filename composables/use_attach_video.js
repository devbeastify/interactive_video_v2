/**
 * Finds the template matching the specified selector, detaches the
 * video reference element from the template, and appends it to the
 * specified container element.
 * @param {string} templateSelector - selector for template containing the
 * video reference
 * @param {HTMLElement} targetElm - element to append the video reference to
 * @return {VHL.Video.File} - The initialized video player instance
 */
export function attachVideo(templateSelector, targetElm) {
    // Clean up any existing video elements in the container
    const existingVideos = targetElm.querySelectorAll('.js-video-reference, .reference_model');
    
    existingVideos.forEach(video => {
      try {
        // If the video has a videojs player, dispose it
        const videojsPlayer = video.querySelector('.video-js');
        if (videojsPlayer && videojsPlayer.player) {
          videojsPlayer.player.dispose();
        }
        // Remove the video element
        video.remove();
      } catch (error) {
        console.warn('Error cleaning up existing video:', error);
        video.remove();
      }
    });
    
    const templateElm = document.querySelector(templateSelector)?.content;
    if (!templateElm) {
      console.warn(`Template not found for selector: ${templateSelector}`);
      return;
    }
  
    const referenceElm = templateElm.firstElementChild;
    if (!referenceElm) {
      console.warn(`No video reference found in template: ${templateSelector}`);
      return;
    }
  
    // Clone the element instead of removing it
    const clonedReferenceElm = referenceElm.cloneNode(true);
    targetElm.appendChild(clonedReferenceElm);
  
    if (typeof window.initVideoPlayer === 'function') {
      const videoElm = referenceElm.querySelector('.js-video-reference');
      if (!videoElm) {
        console.warn(`No video element found in template: ${templateSelector}`);
        return;
      }
  
      const videoId = videoElm.id;
      const videoPlayer = window.initVideoPlayer(videoId);
      return videoPlayer;
    } else {
      console.warn('window.initVideoPlayer is not available');
      return;
    }
  } 