document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audio');
    const playStopCmd = document.getElementById('play-stop');
    const nextCmd = document.getElementById('next');
    const previousCmd = document.getElementById('prev');
    const rewCmd = document.getElementById('rew');
    const fwdCmd = document.getElementById('fwd');
    const volUpCmd = document.getElementById('vol-up');
    const volDownCmd = document.getElementById('vol-down');
    const trackDisplay = document.getElementById('track');
    const timeDisplay = document.getElementById('time');
    const volumeDisplay = document.getElementById('volume');
    const playlistContainer = document.getElementById('playlist');
    const shuffleCmd = document.getElementById('shuffle');
    const repeatCmd = document.getElementById('repeat');

    let playlist = [];
    let currentTrackIndex = 0;
    let shuffle = false;
    let repeatMode = 0; // 0: off, 1: track, 2: album, 3: playlist
    let shuffledIndexes = [];
    let currentAlbumTracks = [];

    // Загрузка треков с сервера
    fetch('api.php')
        .then(response => response.json())
        .then(data => {
            let trackIndex = 0;
            for (const artist in data) {
                const artistLi = document.createElement('li');
                artistLi.className = 'artist';
                const artistToggle = document.createElement('span');
                artistToggle.className = 'toggle';
                const artistSpan = document.createElement('span');
                artistSpan.textContent = artist;
                artistLi.appendChild(artistToggle);
                artistLi.appendChild(artistSpan);
                playlistContainer.appendChild(artistLi);

                const artistUl = document.createElement('ul');
                artistLi.appendChild(artistUl);

                for (const album in data[artist].albums) {
                    const albumLi = document.createElement('li');
                    albumLi.className = 'album';
                    const albumToggle = document.createElement('span');
                    albumToggle.className = 'toggle';
                    const albumSpan = document.createElement('span');
                    albumSpan.textContent = album;
                    albumLi.appendChild(albumToggle);
                    albumLi.appendChild(albumSpan);
                    artistUl.appendChild(albumLi);

                    const albumUl = document.createElement('ul');
                    albumLi.appendChild(albumUl);

                    data[artist].albums[album].forEach(trackSrc => {
                        const trackLi = document.createElement('li');
                        const trackSpan = document.createElement('span');
                        trackSpan.className = 'command track';
                        const trackName = trackSrc.split('/').pop().replace('.mp3', '');
                        trackSpan.textContent = `[${trackName}]`;
                        trackSpan.dataset.src = encodeURI(trackSrc);
                        trackSpan.dataset.index = trackIndex++;
                        trackLi.appendChild(trackSpan);
                        albumUl.appendChild(trackLi);

                        playlist.push({
                            src: encodeURI(trackSrc),
                            name: `[${artist} - ${album} - ${trackName}]`,
                            album: album,
                            artist: artist
                        });
                    });
                }
            }
            loadTrack(0); // Загружаем первый трек
            addTrackListeners();
            addCollapseListeners();
            updateCurrentAlbumTracks();
        });

    // Загрузка трека
    function loadTrack(index) {
        audio.src = playlist[index].src;
        trackDisplay.textContent = `track: ${playlist[index].name}`;
        document.querySelectorAll('.track').forEach(t => t.classList.remove('active'));
        document.querySelector(`.track[data-index="${index}"]`)?.classList.add('active');
        currentTrackIndex = index;
        updateCurrentAlbumTracks();
    }

    // Обновление списка треков текущего альбома
    function updateCurrentAlbumTracks() {
        const currentAlbum = playlist[currentTrackIndex].album;
        currentAlbumTracks = playlist.filter(track => track.album === currentAlbum).map(track => playlist.indexOf(track));
    }

    // Обработчики кликов по трекам
    function addTrackListeners() {
        document.querySelectorAll('.track').forEach(track => {
            track.addEventListener('click', () => {
                const index = parseInt(track.dataset.index);
                loadTrack(index);
                audio.play();
                playStopCmd.textContent = '[stop]';
            });
        });
    }

    // Обработчики сворачивания/разворачивания
    function addCollapseListeners() {
        document.querySelectorAll('.artist > span, .album > span').forEach(header => {
            header.addEventListener('click', () => {
                const parent = header.parentElement;
                parent.classList.toggle('expanded');
            });
        });
    }

    // Play/Stop
    playStopCmd.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playStopCmd.textContent = '[stop]';
        } else {
            audio.pause();
            playStopCmd.textContent = '[play]';
        }
    });

    // Next
    nextCmd.addEventListener('click', () => {
        playNextTrack();
    });

    // Previous
    previousCmd.addEventListener('click', () => {
        playPreviousTrack();
    });

    // Rewind (-30 секунд)
    rewCmd.addEventListener('click', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 30);
    });

    // Forward (+30 секунд)
    fwdCmd.addEventListener('click', () => {
        audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 30);
    });

    // Shuffle
    shuffleCmd.addEventListener('click', () => {
        shuffle = !shuffle;
        shuffleCmd.classList.toggle('active', shuffle);
        if (shuffle) {
            shuffledIndexes = [...Array(playlist.length).keys()];
            shuffledIndexes.sort(() => Math.random() - 0.5);
            // Убираем текущий трек из случайного порядка, чтобы не повторился сразу
            const currentIdx = shuffledIndexes.indexOf(currentTrackIndex);
            if (currentIdx !== -1) shuffledIndexes.splice(currentIdx, 1);
        }
    });

    // Repeat
    repeatCmd.addEventListener('click', () => {
        repeatMode = (repeatMode + 1) % 4; // 0: off, 1: track, 2: album, 3: playlist
        repeatCmd.classList.toggle('active', repeatMode !== 0);
        switch (repeatMode) {
            case 0:
                repeatCmd.textContent = '[rpt]';
                break;
            case 1:
                repeatCmd.textContent = '[trc]';
                break;
            case 2:
                repeatCmd.textContent = '[alb]';
                break;
            case 3:
                repeatCmd.textContent = '[all]';
                break;
        }
    });

    // Обновление времени
    audio.addEventListener('timeupdate', () => {
        const current = audio.currentTime;
        const duration = audio.duration || 0;
        const formatTime = (seconds) => {
            const min = Math.floor(seconds / 60);
            const sec = Math.floor(seconds % 60);
            return `${min}:${sec < 10 ? '0' + sec : sec}`;
        };
        timeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    });

    // Автоматический переход к следующему треку
    audio.addEventListener('ended', () => {
        if (repeatMode === 1) {
            audio.currentTime = 0;
            audio.play();
        } else {
            playNextTrack();
        }
    });

    // Воспроизведение следующего трека
    function playNextTrack() {
        if (repeatMode === 2) {
            // Повтор альбома
            const nextAlbumIndex = (currentAlbumTracks.indexOf(currentTrackIndex) + 1) % currentAlbumTracks.length;
            currentTrackIndex = currentAlbumTracks[nextAlbumIndex];
        } else if (shuffle) {
            // Случайный порядок
            if (shuffledIndexes.length > 0) {
                currentTrackIndex = shuffledIndexes.shift();
            } else {
                currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
            }
        } else {
            // Обычный порядок или повтор всего плейлиста
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        }
        loadTrack(currentTrackIndex);
        audio.play();
        playStopCmd.textContent = '[stop]';
    }

    // Воспроизведение предыдущего трека
    function playPreviousTrack() {
        if (shuffle) {
            // В случайном порядке предыдущий трек не так важен, идём просто назад
            currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        } else if (repeatMode === 2) {
            // Повтор альбома
            const prevAlbumIndex = (currentAlbumTracks.indexOf(currentTrackIndex) - 1 + currentAlbumTracks.length) % currentAlbumTracks.length;
            currentTrackIndex = currentAlbumTracks[prevAlbumIndex];
        } else {
            currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        }
        loadTrack(currentTrackIndex);
        audio.play();
        playStopCmd.textContent = '[stop]';
    }

    // Управление громкостью
    const updateVolumeDisplay = () => {
        const volumePercent = Math.round(audio.volume * 100);
        volumeDisplay.textContent = `${volumePercent}%`;
    };

    volUpCmd.addEventListener('click', () => {
        audio.volume = Math.min(1, audio.volume + 0.05);
        updateVolumeDisplay();
    });

    volDownCmd.addEventListener('click', () => {
        audio.volume = Math.max(0, audio.volume - 0.05);
        updateVolumeDisplay();
    });

    // Инициализация громкости
    audio.volume = 1; // 100% по умолчанию
    updateVolumeDisplay();
});
