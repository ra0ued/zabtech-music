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

    let playlist = [];
    let currentTrackIndex = 0;

    // Загрузка треков с сервера
    fetch('api.php')
        .then(response => response.json())
        .then(data => {
            let trackIndex = 0;
            for (const artist in data) {
                const artistLi = document.createElement('li');
                artistLi.className = 'artist';
                const artistSpan = document.createElement('span');
                artistSpan.textContent = artist;
                artistLi.appendChild(artistSpan);
                playlistContainer.appendChild(artistLi);

                const artistUl = document.createElement('ul');
                artistLi.appendChild(artistUl);

                for (const album in data[artist].albums) {
                    const albumLi = document.createElement('li');
                    albumLi.className = 'album';
                    const albumSpan = document.createElement('span');
                    albumSpan.textContent = album;
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
                        trackSpan.dataset.src = trackSrc;
                        trackSpan.dataset.index = trackIndex++;
                        trackLi.appendChild(trackSpan);
                        albumUl.appendChild(trackLi);

                        playlist.push({
                            src: trackSrc,
                            name: `[${artist} - ${album} - ${trackName}]`
                        });
                    });
                }
            }
            loadTrack(0); // Загружаем первый трек
            addTrackListeners(); // Добавляем обработчики кликов
            addCollapseListeners(); // Добавляем сворачивание
        });

    // Загрузка трека
    function loadTrack(index) {
        audio.src = playlist[index].src;
        trackDisplay.textContent = `${playlist[index].name}`;
        document.querySelectorAll('.track').forEach(t => t.classList.remove('active'));
        document.querySelector(`.track[data-index="${index}"]`)?.classList.add('active');
        currentTrackIndex = index;
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
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        audio.play();
        playStopCmd.textContent = '[stop]';
    });

    // Previous
    previousCmd.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
        audio.play();
        playStopCmd.textContent = '[stop]';
    });

    // Rewind (-30 секунд)
    rewCmd.addEventListener('click', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 30);
    });

    // Forward (+30 секунд)
    fwdCmd.addEventListener('click', () => {
        audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 30);
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
        nextCmd.click();
    });

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

document.querySelector('.artist').classList.add('expanded');