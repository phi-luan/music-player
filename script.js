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
    const playlistBtn = document.getElementById('playlist-btn');

    // progress bar
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.querySelector('.progress-container');

    // volume
    const volumeRange = document.querySelector('.volume-range');
    const volumeIcon = document.querySelector('.volume i');

    // modifiable elements
    const songName = document.getElementById('song-name');
    const artistName = document.getElementById('artist-name');
    const albumCover = document.getElementById('album-cover');
    const songLyrics = document.getElementById('song-lyrics');
    const blurredBg = document.getElementById('blurred-bg');

    let songs = [];
    let originalCopy = [];
    let currentSongIndex = 0;
    let isPlaying = false;
    let isShuffled = false;
    let isRepeat = false;
    let lyricsShown = false;
    let playlistShown = false;

    let lyricsStr;
    
    let favoriteSongs = [];

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
        audio.volume = 0.50;
        volumeRange.value = 50;
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
            showLyrics();
        }

        if (playlistShown) {
            showPlaylist();
        }

        for (let i = 0; i < favoriteSongs.length; i++) {
            if (song.name === favoriteSongs[i]) {
                favoriteBtn.querySelector('i').classList.remove('far');
                favoriteBtn.querySelector('i').classList.add('fas');
                return;
            }
        }
        favoriteBtn.querySelector('i').classList.remove('fas');
        favoriteBtn.querySelector('i').classList.add('far');
    }

    function addToFavorite() {
        let song = songs[currentSongIndex].name;
        let index = favoriteSongs.findIndex(favSong => favSong === song);

        if (index !== -1) {
            // Song is already in favorites, remove it
            favoriteSongs.splice(index, 1);
            favoriteBtn.querySelector('i').classList.remove('fas');
            favoriteBtn.querySelector('i').classList.add('far');
        } 
        else {
            // Add song to favorites
            favoriteSongs.push(song);
            favoriteBtn.querySelector('i').classList.remove('far');
            favoriteBtn.querySelector('i').classList.add('fas');
        }

        for (let i = 0; i < favoriteSongs.length; i++) {
            console.log(favoriteSongs[i]);
        }
        
    }

    favoriteBtn.addEventListener('click', addToFavorite)

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
        if (playlistShown) {
            showPlaylist();
        }
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

    const lyricsElem = document.querySelector('.lyrics');
    function showLyrics() {
        lyricsShown = true;
        hidePlaylist();
        songLyrics.textContent = lyricsStr;
        
        const lyricsHeight = lyricsElem.scrollHeight;
        
        if (lyricsHeight > 300) {
            lyricsElem.style.columnCount = 2;
        } else {
            lyricsElem.style.columnCount = 1;
        }
        
        lyricsBtn.style.color = 'black';
        lyricsBtn.style.backgroundColor = 'rgba(255,255,255,0.6)';
        lyricsElem.style.marginLeft = '3vh';
        lyricsElem.classList.remove('hidden');

    }

    function hideLyrics() {
        lyricsShown = false;
        songLyrics.textContent = '';
        lyricsElem.style.columnCount = 2;
        lyricsBtn.style.color = 'white';
        lyricsBtn.style.backgroundColor = 'rgba(0,0,0,0.15)';
        lyricsElem.style.marginLeft = '0vh';
        lyricsElem.classList.add('hidden');
    }

    function manageLyrics() {
        lyricsShown ? hideLyrics() : showLyrics();
    }


    function showSong(song, playlistInterface) {
        let parent = document.createElement("div");
        let cover = document.createElement('img');
        cover.src = song.cover;
        cover.alt  = 'Album Cover';

        let child1 = document.createElement("div");
        let titleElem = document.createElement('p');
        let artistElem = document.createElement('p');
        

        parent.classList.add('one-song');
        cover.classList.add('small-cover');
        child1.classList.add('song-details');

        let name = song.name;
        let artist = song.artist;
        titleElem.textContent = name;
        artistElem.textContent = artist;

        titleElem.classList.add('small-title');
        artistElem.classList.add('small-artist');

        child1.appendChild(titleElem);
        child1.appendChild(artistElem);
        parent.appendChild(cover);
        parent.appendChild(child1);
        playlistInterface.appendChild(parent);
    }

    const playlistElem = document.querySelector('.more-song');
    function showPlaylist() {
        playlistShown = true;
        hideLyrics();
        playlistElem.style.marginLeft = '3vh';
        playlistBtn.style.color = 'black';
        playlistBtn.style.backgroundColor = 'rgba(255,255,255,0.6)';
        
        const playlistInterface = document.getElementById('next-songs');
        playlistInterface.innerHTML = "";
        
        for (i = currentSongIndex  + 1; i < songs.length; i++) {
            showSong(songs[i], playlistInterface);
        }
        
        if (isRepeat) {
            for (i = 0; i < currentSongIndex; i++) {
                showSong(songs[i], playlistInterface);
            }
        }
        
        playlistElem.style.marginLeft = '3vh';
        playlistElem.classList.remove('hidden');
    }

    function hidePlaylist() {
        playlistShown = false;
        playlistBtn.style.color = 'white';
        playlistBtn.style.backgroundColor = 'rgba(0,0,0,0.15)';
        playlistElem.style.marginLeft = '0';
        playlistElem.classList.add('hidden');
    }

    function managePlaylist() {
        playlistShown ? hidePlaylist() : showPlaylist();
    }

    function controlVolume() {
        audio.volume = volumeRange.value / 100;
        if (volumeRange.value == 0) {
            volumeIcon.classList.remove('fa-volume-up');
            volumeIcon.classList.add('fa-volume-mute');
        } else {
            volumeIcon.classList.remove('fa-volume-mute');
            volumeIcon.classList.add('fa-volume-up');
        }
    }
   

    // Event listeners
    playStopBtn.addEventListener('click', playPause);
    nextSongBtn.addEventListener('click', playNextSong);
    previousSongBtn.addEventListener('click', playPreviousSong);
    shufflePlaylistBtn.addEventListener('click', shuffleUnshuffle);
    repeatPlaylistBtn.addEventListener('click', repeatPlaylistOnOROFF);
    audio.addEventListener('timeupdate', updateProgressBar);
    progressContainer.addEventListener('click', setProgress);
    
    lyricsBtn.addEventListener('click', manageLyrics);
    playlistBtn.addEventListener('click', managePlaylist);
    volumeRange.addEventListener('input', controlVolume);
    
    let volumeOn = true;
    volumeIcon.addEventListener('click', () => {
        volumeOn = !volumeOn;
        if (!volumeOn) {
            audio.volume = 0;
            volumeRange.value = 0;
            volumeIcon.classList.remove('fa-volume-up');
            volumeIcon.classList.add('fa-volume-mute');
        }
        else {
            audio.volume = 0.50;
            volumeRange.value = 50;
            volumeIcon.classList.remove('fa-volume-mute');
            volumeIcon.classList.add('fa-volume-up');
        }
    })

    main();
});
