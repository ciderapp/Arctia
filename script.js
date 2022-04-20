const tsvscode = acquireVsCodeApi();
let artworkElement = document.querySelector(".album-artwork");
let albumLinkElement = document.querySelector(".album-link");
let nameElement = document.querySelector(".name");
let artistElement = document.querySelector(".artist");
let albumElement = document.querySelector(".album");
let playbackSlider = document.querySelector(".playback-slider");
let playButton = document.querySelector(".play");
let pauseButton = document.querySelector(".pause");
let nextButton = document.querySelector(".next");
let previousButton = document.querySelector(".previous");
let debugElements = document.querySelector(".debug");
let radioNoticeElement = document.querySelector(".radio-notice");
let heartBeat = 0;
let currentMediaItem = {};
let audioKind = "song";

function postMessage(type, value = '') { tsvscode.postMessage({ type: type, value: value }); }

function seekTo(time, adjust = true) {
  if (adjust) { time = parseInt(time / 1000) }
  socket.send(JSON.stringify({ action: "seek", time: time }));
}

async function heartTap() {
    heartBeat += 1;
    if (heartBeat == 5) {
        debugElements.style.display = "block";
        postMessage('developerMenuOpened');
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    heartBeat -= 1;
}

function heartHide() {
    heartBeat = 0;
    debugElements.style.display = "none";
    postMessage('developerMenuClosed');
}

socket = new WebSocket("ws://localhost:26369");
socket.onopen = (e) => {
  socket.onmessage = (e) => {
    currentMediaItem = JSON.parse(e.data).data;
    if (currentMediaItem.playParams.kind) { audioKind = currentMediaItem.playParams.kind }
    if (audioKind == "song" || audioKind == "musicVideo" || audioKind == "uploadedVideo" || audioKind == "music-movie") {
      // Playback Info
      if (currentMediaItem.artistName && artistElement.innerText !== currentMediaItem.artistName) {
        artistElement.innerText = currentMediaItem.artistName;
      }
      if (currentMediaItem.albumName && albumElement.innerText !== currentMediaItem.albumName) {
        albumElement.innerText = currentMediaItem.albumName;
      }

      // Radio Notice
      radioNoticeElement.style.display = "none";

      // Play/Pause Logic
      if (currentMediaItem.status !== undefined) {
        if (currentMediaItem.status == true) {
          playButton.style.display = "none";
          pauseButton.style.display = "inline-block";
        } else {
          pauseButton.style.display = "none";
          playButton.style.display = "inline-block";
        }
      }

      // Next/Previous Logic
      if (currentMediaItem.status !== undefined) {
        nextButton.style.display = "inline-block";
        previousButton.style.display = "inline-block";
      }

      // Playback Slider
      if (playbackSlider.max == null) {
        playbackSlider.style.display = "none";
      }
      if (currentMediaItem.durationInMillis) {
        if (playbackSlider.style.display == "none") {
          playbackSlider.style.display = "block";
        }
        playbackSlider.max = currentMediaItem.durationInMillis;
      }
      if (currentMediaItem.remainingTime && currentMediaItem.durationInMillis) {
        if (playbackSlider.style.display == "none") {
          playbackSlider.style.display = "block";
        }
        playbackSlider.value = currentMediaItem.durationInMillis - currentMediaItem.remainingTime;
      }

    } else if (audioKind == "radioStation") {
      radioNoticeElement.style.display = "block";
      artistElement.innerText = "Radio Station";

      // Hide Not Working Elements
      albumElement.innerText = "";
      albumLinkElement.href = "";
      playButton.style.display = "none";
      pauseButton.style.display = "none";
      nextButton.style.display = "none";
      previousButton.style.display = "none";
      playbackSlider.style.display = "none";
    }

    // Artwork URL
    if (currentMediaItem.url && currentMediaItem.url.appleMusic.length > 0 && audioKind == "song") {
      albumLinkElement.href = currentMediaItem.url.appleMusic;
    } else {
      albumLinkElement.href = "";
    }

    // Song Name & No Title Check
    if (currentMediaItem.name && nameElement.innerText !== currentMediaItem.name) {
      nameElement.innerText = currentMediaItem.name;
      if (nameElement.innerText == "No Title Found") {
        artistElement.innerText = "";
        albumElement.innerText = "";
        artworkElement.style.display = "none";
        artworkElement.src = "";
        playbackSlider.style.display = "none";
      }
    }

    // Album Artwork
    if (currentMediaItem.artwork && currentMediaItem.artwork.url.length > 0) {
      artworkElement.src = currentMediaItem.artwork.url.replace('{w}', 600).replace('{h}', 600);
      artworkElement.style.display = "block";
    }
  }
}
