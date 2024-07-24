document.addEventListener('DOMContentLoaded', () => {
    // buttons
    const audio = document.getElementById('audio');
    const playStopBtn = document.getElementById('play-stop-btn');
    const nextSongBtn = document.getElementById('next-song-btn');
    const previousSongBtn = document.getElementById('previous-song-btn');
    const shufflePlaylistBtn = document.getElementById('shuffle-btn');
    const repeatPlaylistBtn = document.getElementById('repeat-btn');
    const favoriteBtn = document.getElementById('favorite-btn');
    const lyricsBtn = document.getElementById('lyrics-btn');

    // progress bar
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.querySelector('.progress-container');

    // volume
    const volumeRange = document.querySelector('.volume-range');

    // modifiable elements
    const songName = document.getElementById('song-name');
    const artistName = document.getElementById('artist-name');
    const albumCover = document.getElementById('album-cover');
    const songLyrics = document.getElementById('song-lyrics');
    const blurredBg = document.getElementById('blurred-bg');
    const rightSide = document.querySelector('.right-side');

    let songs = [];
    let originalCopy = [];
    let currentSongIndex = 0;
    let isPlaying = false;
    let isShuffled = false;
    let isRepeat = false;
    let lyricsShown = false;

    let lyricsStr;

    async function fetchSongs() {
        try {
            const response = await fetch('music.json');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching songs:', error);
            return [];
        }
    }

    async function main() {
        songs = await fetchSongs();
        originalCopy = JSON.parse(JSON.stringify(songs));
        if (songs.length > 0) {
            loadSong(songs[currentSongIndex]);
        }
    }

    function loadSong(song) {
        audio.src = song.mp3;
        songName.textContent = song.name;
        artistName.textContent = song.artist;
        albumCover.src = song.cover;
        blurredBg.style.backgroundImage = `url('${song.cover}')`;
        lyricsStr = song.lyrics;
        if (lyricsShown) {
            showLyrics(); // Ensure lyrics are updated if already shown
        }
    }

    function playSong() {
        audio.play();
        playStopBtn.querySelector('i').classList.remove('fa-play');
        playStopBtn.querySelector('i').classList.add('fa-pause');
        isPlaying = true;
    }

    function pauseSong() {
        audio.pause();
        playStopBtn.querySelector('i').classList.remove('fa-pause');
        playStopBtn.querySelector('i').classList.add('fa-play');
        isPlaying = false;
    }

    function playPause() {
        isPlaying ? pauseSong() : playSong();
    }

    function playNextSong() {
        if (currentSongIndex != (songs.length - 1) || isRepeat) {
            currentSongIndex = (currentSongIndex + 1) % songs.length;
            loadSong(songs[currentSongIndex]);
            playSong();
        } else if (!isRepeat && currentSongIndex == (songs.length - 1)) {
            pauseSong();
        }
    }

    function playPreviousSong() {
        if (currentSongIndex != 0 || isRepeat) {
            currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
            loadSong(songs[currentSongIndex]);
            playSong();
        }
    }

    function shufflePlaylist() {
        for (let i = songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [songs[i], songs[j]] = [songs[j], songs[i]];
        }
        currentSongIndex = 0;
        loadSong(songs[currentSongIndex]);
        playSong();
        isShuffled = true;
        shufflePlaylistBtn.style.backgroundColor = 'rgba(255,255,255,0.6)';
        shufflePlaylistBtn.style.color = 'black';
    }

    function unshufflePlaylist() {
        songs = JSON.parse(JSON.stringify(originalCopy));
        currentSongIndex = 0;
        loadSong(songs[currentSongIndex]);
        playSong();
        shufflePlaylistBtn.style.backgroundColor = 'rgba(255,255,255,0)';
        shufflePlaylistBtn.style.color = '#fff';
        isShuffled = false;
    }

    function shuffleUnshuffle() {
        isShuffled ? unshufflePlaylist() : shufflePlaylist();
    }

    function repeatPlaylistOn() {
        isRepeat = true;
        repeatPlaylistBtn.style.backgroundColor = 'rgba(255,255,255,0.6)';
        repeatPlaylistBtn.style.color = 'black';
    }

    function repeatPlaylistOff() {
        isRepeat = false;
        repeatPlaylistBtn.style.backgroundColor = 'rgba(255,255,255,0)';
        repeatPlaylistBtn.style.color = '#fff';
    }

    function repeatPlaylistOnOROFF() {
        isRepeat ? repeatPlaylistOff() : repeatPlaylistOn();
    }

    function updateProgressBar() {
        const { currentTime, duration } = audio;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;

        if (currentTime >= duration) {
            playNextSong();
        }
    }

    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    }

    function showLyrics() {
        lyricsShown = true;
        songLyrics.textContent = lyricsStr;
        rightSide.classList.remove('hidden');

        const lyricsContainer = document.getElementById('lyrics');
        const lyricsHeight = lyricsContainer.scrollHeight; // Force reflow

        if (lyricsHeight > 300) { // Adjust threshold as needed
            lyricsContainer.style.columnCount = 2;
        } 
        else {
            lyricsContainer.style.columnCount = 1;
        }

        lyricsBtn.style.color = 'black';
        lyricsBtn.style.backgroundColor = 'rgba(255,255,255,0.6)';
        rightSide.style.marginLeft = '3vh';
    }

    function hideLyrics() {
        lyricsShown = false;
        songLyrics.textContent = '';
        lyricsBtn.style.color = 'white';
        lyricsBtn.style.backgroundColor = 'rgba(0,0,0,0.15)';
        rightSide.classList.add('hidden');
        rightSide.style.marginLeft = '0';

        const lyricsContainer = document.getElementById('lyrics');
        lyricsContainer.style.columnCount = 2;
    }

    function lyricsInterface() {
        lyricsShown ? hideLyrics() : showLyrics();
    }

    // Event listeners
    playStopBtn.addEventListener('click', playPause);
    nextSongBtn.addEventListener('click', playNextSong);
    previousSongBtn.addEventListener('click', playPreviousSong);
    shufflePlaylistBtn.addEventListener('click', shuffleUnshuffle);
    repeatPlaylistBtn.addEventListener('click', repeatPlaylistOnOROFF);
    audio.addEventListener('timeupdate', updateProgressBar);
    progressContainer.addEventListener('click', setProgress);
    lyricsBtn.addEventListener('click', lyricsInterface);

    main();
});
