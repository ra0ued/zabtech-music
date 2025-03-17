document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audio');
    const playPauseCmd = document.getElementById('play-stop');
    const nextCmd = document.getElementById('next');
    const previousCmd = document.getElementById('prev');
    const rewCmd = document.getElementById('rew');
    const fwdCmd = document.getElementById('fwd');
    const trackDisplay = document.getElementById('track');
    const timeDisplay = document.getElementById('time');
    const tracks = document.querySelectorAll('.track');
    const volUpCmd = document.getElementById('vol-up');
    const volDownCmd = document.getElementById('vol-down');
    const volumeDisplay = document.getElementById('volume');

    let currentTrackIndex = 0;

    // Список треков
    const playlist = Array.from(tracks).map(track => ({
        src: track.dataset.src,
        name: track.textContent
    }));

    // Инициализация первого трека
    const loadTrack = (index) => {
        audio.src = playlist[index].src;
        trackDisplay.textContent = `track: ${playlist[index].name}`;
        tracks.forEach(t => t.classList.remove('active'));
        tracks[index].classList.add('active');
        currentTrackIndex = index;
    };
    loadTrack(currentTrackIndex);

    // Play/Stop
    playPauseCmd.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playPauseCmd.textContent = '[stop]';
        } else {
            audio.pause();
            playPauseCmd.textContent = '[play]';
        }
    });

    // Next
    nextCmd.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        audio.play();
        playPauseCmd.textContent = '[pause]';
    });

    // Previous
    previousCmd.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
        audio.play();
        playPauseCmd.textContent = '[pause]';
    });

    // Rewind (-30 секунд)
    rewCmd.addEventListener('click', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 30);
    });

    // Forward (+30 секунд)
    fwdCmd.addEventListener('click', () => {
        audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 30);
    });

    // Выбор трека из плейлиста
    tracks.forEach((track, index) => {
        track.addEventListener('click', () => {
            loadTrack(index);
            audio.play();
            playPauseCmd.textContent = '[pause]';
        });
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