let lastVolume = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setVolume') {
    const videoElement = document.querySelector('video.html5-main-video');
    if (videoElement) {
      if (request.volume === 0) { // Mute command
        lastVolume = videoElement.volume;
        videoElement.volume = 0;
      } else { // Unmute command
        if (lastVolume !== null) {
          videoElement.volume = lastVolume;
        }
      }
    }
  }
});
