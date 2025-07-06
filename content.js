let lastVolume = 1;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setVolume') {
    const videoElement = document.querySelector('video.html5-main-video');
    if (videoElement) {
      if (request.volume === 0) { // Mute
        lastVolume = videoElement.volume;
        videoElement.volume = 0;
      } else { // Unmute
        // Restore to last known volume, or 1 if last volume was 0.
        videoElement.volume = lastVolume > 0 ? lastVolume : 1;
      }
    }
  }
});
