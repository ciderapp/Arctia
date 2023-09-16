const tsvscode = acquireVsCodeApi();
let artworkElement = document.querySelector(".album-artwork");
let albumLinkElement = document.querySelector(".album-link");
let nameElement = document.querySelector(".name");
let artistElement = document.querySelector(".artist");
let albumElement = document.querySelector(".album");
let playButton = document.querySelector(".play");
let pauseButton = document.querySelector(".pause");
let nextButton = document.querySelector(".next");
let previousButton = document.querySelector(".previous");
let debugElements = document.querySelector(".debug");
let radioNoticeElement = document.querySelector(".radio-notice");
let heartBeat = 0;
let currentMediaItem = {};
let audioKind = "song";

function postMessageToExtension(type, value = '') {
    tsvscode.postMessage({
        type: type,
        value: value
    });
}

function play() {
    playButton.style.display = "none";
    pauseButton.style.display = "inline-block";
    postMessageToExtension('controlPlayback', 'play')
    setTimeout(fetchPlaybackInfo, 500)
}

function pause() {
    pauseButton.style.display = "none";
    playButton.style.display = "inline-block";
    postMessageToExtension('controlPlayback', 'pause')
    setTimeout(fetchPlaybackInfo, 500)
}

function next() {
    postMessageToExtension('controlPlayback', 'next')
    setTimeout(fetchPlaybackInfo, 500)
}

function previous() {
    postMessageToExtension('controlPlayback', 'previous')
    setTimeout(fetchPlaybackInfo, 500)
}

function seekTo(time, adjust = true) {
    // TODO: Implement seeking
    
    // if (adjust) { time = parseInt(time / 1000) }
    // dataSocket.send(JSON.stringify({ action: "seek", time: time }));
}

setInterval(fetchPlaybackInfo, 2000)

async function heartTap() {
    heartBeat += 1;
    if (heartBeat == 5) {
        debugElements.style.display = "block";
        postMessageToExtension('developerMenuOpened');
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    heartBeat -= 1;
}

function heartHide() {
    heartBeat = 0;
    debugElements.style.display = "none";
    postMessageToExtension('developerMenuClosed');
}

async function fetchPlaybackInfo() {
    postMessageToExtension('fetchPlaybackInfo');
}

window.addEventListener('message', (event) => {
    const message = event.data;
    
    switch (message.type) {
        case "playbackInfo":
        setData(message.value);
        break;
    }
});

async function setData(data) {
    const playbackInfo = data;
    
    currentMediaItem = playbackInfo.info;
    
    if (!currentMediaItem) return;
    
    if (currentMediaItem.playParams.kind) {
        audioKind = currentMediaItem.playParams.kind
    }
    
    if (audioKind == "song" || audioKind == "musicVideo" || audioKind == "uploadedVideo" || audioKind == "music-movie") {
        // Playback Info
        if (currentMediaItem.artistName && artistElement.innerText !== currentMediaItem.artistName) {
            if (artistElement.style.display == "none") {
                artistElement.style.display = "block";
            }
            artistElement.innerText = currentMediaItem.artistName;
        } else if (!currentMediaItem.artistName) {
            artistElement.style.display = "none";
        }
        
        if (currentMediaItem.albumName && albumElement.innerText !== currentMediaItem.albumName) {
            if (albumElement.style.display == "none") {
                albumElement.style.display = "block";
            }
            albumElement.innerText = currentMediaItem.albumName;
        } else if (!currentMediaItem.albumName) {
            albumElement.style.display = "none";
        }
        
        // Radio Notice
        radioNoticeElement.style.display = "none";
        // Play/Pause Logic
        if (currentMediaItem.isPlaying !== undefined) {
            if (currentMediaItem.isPlaying == true) {
                playButton.style.display = "none";
                pauseButton.style.display = "inline-block";
            } else {
                pauseButton.style.display = "none";
                playButton.style.display = "inline-block";
            }
        }
        // Next/Previous Logic
        if (currentMediaItem.isPlaying !== undefined) {
            nextButton.style.display = "inline-block";
            previousButton.style.display = "inline-block";
        }
    } else if (audioKind == "radioStation") {
        radioNoticeElement.style.display = "block";
        
        if (currentMediaItem.artistName && currentMediaItem.editorialNotes.name) {
            if (artistElement.innerText !== currentMediaItem.artistName + " " + "(" + currentMediaItem.editorialNotes.name + ")") {
                artistElement.innerText = currentMediaItem.artistName + " " + "(" + currentMediaItem.editorialNotes.name + ")";
            }
        } else {
            artistElement.innerText = "Radio Station"
        }
        
        if (currentMediaItem.albumName && albumElement.innerText !== currentMediaItem.albumName) {
            if (albumElement.style.display == "none") {
                albumElement.style.display = "block";
            }
            albumElement.innerText = currentMediaItem.albumName;
        } else if (!currentMediaItem.albumName) {
            albumElement.style.display = "none";
        }
        
        // Hide Not Working Elements
        playButton.style.display = "none";
        pauseButton.style.display = "none";
        nextButton.style.display = "none";
        previousButton.style.display = "none";
    }
    // Artwork URL
    if (currentMediaItem.url && currentMediaItem.url.appleMusic.length > 0 && audioKind == "song") {
        if (albumLinkElement.style.pointerEvents == "none") {
            albumLinkElement.style.pointerEvents = "auto";
        }
        albumLinkElement.href = currentMediaItem.url.appleMusic;
    } else {
        albumLinkElement.style.pointerEvents = "none";
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
        }
    }
    // Album Artwork
    if (currentMediaItem.artwork && currentMediaItem.artwork.url.length > 0) {
        artworkElement.src = currentMediaItem.artwork.url.replace('{w}', 600).replace('{h}', 600);
        artworkElement.style.display = "block";
    }
}
