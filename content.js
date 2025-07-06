let originalMutedState = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const videoElement = document.querySelector('video.html5-main-video');
  if (!videoElement) {
    return;
  }

  if (request.action === 'mute') {
    // Only store the original state on the first mute action.
    if (originalMutedState === null) {
      originalMutedState = videoElement.muted;
    }
    videoElement.muted = true;
  } else if (request.action === 'unmute') {
    videoElement.muted = false;
  } else if (request.action === 'restore') {
    // Restore to the original state when the cycle is stopped.
    if (originalMutedState !== null) {
      videoElement.muted = originalMutedState;
    }
    originalMutedState = null;
  }
});
