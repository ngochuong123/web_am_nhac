document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // 1. XỬ LÝ TRẠNG THÁI ACTIVE VÀ CHUYỂN TRANG
    // =============================================
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;

    const menuItems = document.querySelectorAll('.sidebar .menu-item');
    const topNavItems = document.querySelectorAll('.top-nav span');

    // Chuyển trang Sidebar
    const sidebarLinks = ['/coming-soon?ref=radio', '/coming-soon?ref=playlist', '/coming-soon?ref=library', '/favorites', '/history'];
    menuItems.forEach((item, index) => {
        item.classList.remove('active');
        if (index < sidebarLinks.length) {
            item.addEventListener('click', () => { window.location.href = sidebarLinks[index]; });
        }
    });

    // Active Sidebar theo URL
    if (currentPath === '/favorites') menuItems[3]?.classList.add('active');
    else if (currentPath === '/history') menuItems[4]?.classList.add('active');

    // Chuyển trang Top Nav
    if (topNavItems.length >= 4) {
        topNavItems.forEach(i => i.classList.remove('active'));
        topNavItems[0].addEventListener('click', () => window.location.href = '/');
        topNavItems[1].addEventListener('click', () => typeof startDiscoveryTransition === 'function' ? startDiscoveryTransition('/explore') : window.location.href = '/explore');
        topNavItems[2].addEventListener('click', () => window.location.href = '/category/genre');
        topNavItems[3].addEventListener('click', () => window.location.href = '/category/artist');

        if (currentPath === '/') topNavItems[0].classList.add('active');
        else if (currentPath === '/explore') topNavItems[1].classList.add('active');
        else if (currentPath.includes('/category/genre')) topNavItems[2].classList.add('active');
        else if (currentPath.includes('/category/artist')) topNavItems[3].classList.add('active');
    }

    // =============================================
    // 2. TÌM KIẾM LIVE (SEARCH LIVE) - CẬP NHẬT
    // =============================================
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    let searchTimeout = null;

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            clearTimeout(searchTimeout);

            if (value.length > 0) {
                // Đợi 300ms sau khi ngừng gõ mới gọi API để tiết kiệm tài nguyên
                searchTimeout = setTimeout(async () => {
                    try {
                        const response = await fetch(`/api/search-live?q=${encodeURIComponent(value)}`);
                        const data = await response.json();
                        if (data.success) renderLiveResults(data.songs);
                    } catch (err) { console.error('Lỗi tìm kiếm:', err); }
                }, 300);
            } else if (searchResults) {
                searchResults.innerHTML = '';
            }
        });
    }

    function renderLiveResults(songs) {
        if (!searchResults) return;
        if (!songs || songs.length === 0) {
            searchResults.innerHTML = '<div class="search-item">Không tìm thấy bài hát nào</div>';
            return;
        }
        // Thêm các thuộc tính data- vào mỗi kết quả để hàm playSong có thể đọc được
        searchResults.innerHTML = songs.map(song => `
            <div class="search-item" 
                 data-song-id="${song.id}" 
                 data-title="${song.title}" 
                 data-artist="${song.artist}" 
                 data-cover="${song.cover_url}" 
                 data-audio="${song.audio_url}"
                 onclick="playFromSearch(this)">
                <img src="${song.cover_url}" alt="${song.title}">
                <div>
                    <p class="title">${song.title}</p>
                    <p class="artist">${song.artist}</p>
                </div>
            </div>
        `).join('');
    }

    window.playFromSearch = function (el) {
        // el ở đây chính là div .search-item vừa click
        if (typeof playSong === 'function') {
            playSong(el);
        }
        if (searchResults) searchResults.innerHTML = '';
        if (searchInput) searchInput.value = '';
    };

    // =============================================
    // 3. MUSIC PLAYER LOGIC
    // =============================================
    const audio = document.getElementById('main-audio-player');
    const playerBar = document.getElementById('music-player-bar');
    const playPauseBtn = document.getElementById('btn-play-pause');
    const playPauseIcon = document.getElementById('icon-play-pause');
    const playerCover = document.getElementById('player-cover');
    const playerTitle = document.getElementById('player-title');
    const playerArtist = document.getElementById('player-artist');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const volumeBar = document.getElementById('volume-bar');
    const muteBtn = document.getElementById('btn-mute');
    const playerFavBtn = document.getElementById('player-favorite-btn');

    let isPlaying = false;
    let currentSongId = null;
    let isShuffle = false;
    let repeatMode = 0; // 0: off, 1: all, 2: one
    let currentPlaylistIndex = -1;

    const playlist = Array.from(document.querySelectorAll('.music-card, .rank-item, .song-item-row'));

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    function playSong(card) {
        if (!card || !audio) return;
        const title = card.getAttribute('data-title');
        const artist = card.getAttribute('data-artist');
        const cover = card.getAttribute('data-cover');
        const audioUrl = card.getAttribute('data-audio');
        const songId = card.getAttribute('data-song-id');

        if (!audioUrl) return alert('Bài hát này chưa có dữ liệu!');

        playerBar?.classList.add('active');
        if (playerTitle) playerTitle.textContent = title;
        if (playerArtist) playerArtist.textContent = artist;
        if (playerCover) {
            playerCover.style.backgroundImage = `url('${cover}')`;
            playerCover.classList.add('playing');
        }

        currentPlaylistIndex = playlist.findIndex(item => item.getAttribute('data-song-id') === songId);

        if (currentSongId !== songId) {
            audio.src = audioUrl;
            currentSongId = songId;
        }

        audio.play().then(() => {
            isPlaying = true;
            if (playPauseIcon) playPauseIcon.className = 'fas fa-pause';
            fetch(`/api/history/${songId}`, { method: 'POST' }).catch(() => { });
        }).catch(err => console.error(err));

        checkFavoriteStatus(songId);
    }
    window.playSongGlobal = playSong;
    async function checkFavoriteStatus(songId) {
        if (!playerFavBtn) return;
        try {
            const res = await fetch(`/api/favorite/${songId}`);
            const data = await res.json();
            playerFavBtn.style.color = (data.success && data.isFavorite) ? '#ff3b30' : '';
        } catch (err) { console.error(err); }
    }

    function togglePlay() {
        if (!currentSongId) return;
        if (isPlaying) {
            audio.pause();
            if (playPauseIcon) playPauseIcon.className = 'fas fa-play';
            playerCover?.classList.remove('playing');
        } else {
            audio.play();
            if (playPauseIcon) playPauseIcon.className = 'fas fa-pause';
            playerCover?.classList.add('playing');
        }
        isPlaying = !isPlaying;
    }

    function playNext() {
        if (playlist.length === 0) return;
        if (isShuffle) {
            currentPlaylistIndex = Math.floor(Math.random() * playlist.length);
        } else {
            currentPlaylistIndex = (currentPlaylistIndex + 1) % playlist.length;
        }
        playSong(playlist[currentPlaylistIndex]);
    }

    function playPrev() {
        if (playlist.length === 0) return;
        if (audio.currentTime > 3) { audio.currentTime = 0; return; }
        currentPlaylistIndex = (currentPlaylistIndex - 1 + playlist.length) % playlist.length;
        playSong(playlist[currentPlaylistIndex]);
    }

    // Gắn sự kiện cho Player Controls
    playPauseBtn?.addEventListener('click', togglePlay);
    document.getElementById('btn-next')?.addEventListener('click', playNext);
    document.getElementById('btn-prev')?.addEventListener('click', playPrev);

    // Nút Shuffle & Repeat
    document.querySelector('.fa-random')?.parentElement.addEventListener('click', function () {
        isShuffle = !isShuffle;
        this.style.color = isShuffle ? '#00f2ff' : '';
    });
    document.querySelector('.fa-redo-alt')?.parentElement.addEventListener('click', function () {
        repeatMode = (repeatMode + 1) % 3;
        this.style.color = repeatMode > 0 ? '#00f2ff' : '';
    });

    // Thả tim trên Card và Player
    const handleFavorite = async (songId, btnEl) => {
        try {
            const res = await fetch(`/api/favorite/${songId}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) btnEl.style.color = data.isFavorite ? '#ff3b30' : '';
        } catch (err) { console.error(err); }
    };

    playerFavBtn?.addEventListener('click', () => handleFavorite(currentSongId, playerFavBtn));

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const songId = btn.getAttribute('data-id');
        // Check ban đầu
        fetch(`/api/favorite/${songId}`).then(r => r.json()).then(d => { if (d.isFavorite) btn.style.color = '#ff3b30'; });
        // Click
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleFavorite(songId, btn);
        });
    });

    // Click vào Card để phát nhạc
    playlist.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn')) return;
            playSong(card);
        });
    });

    // Tiến trình bài hát
    audio?.addEventListener('timeupdate', () => {
        if (audio.duration) {
            if (progressBar) progressBar.value = (audio.currentTime / audio.duration) * 100;
            if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    });
    audio?.addEventListener('loadedmetadata', () => { if (totalTimeEl) totalTimeEl.textContent = formatTime(audio.duration); });
    audio?.addEventListener('ended', () => repeatMode === 2 ? (audio.currentTime = 0, audio.play()) : playNext());

    progressBar?.addEventListener('input', (e) => { if (audio.duration) audio.currentTime = (e.target.value / 100) * audio.duration; });
    volumeBar?.addEventListener('input', (e) => { if (audio) audio.volume = e.target.value / 100; });

    // Logout
    safeAddEvent('logout-btn', 'click', async (e) => {
        e.preventDefault();
        document.getElementById('loading-overlay').style.display = 'flex';
        await fetch('/api/logout', { method: 'POST' });
        setTimeout(() => window.location.href = '/', 1500);
    });

    function safeAddEvent(id, event, cb) { document.getElementById(id)?.addEventListener(event, cb); }
});