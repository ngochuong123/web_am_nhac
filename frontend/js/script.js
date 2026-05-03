// Đợi cho đến khi toàn bộ nội dung HTML được tải xong
document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // 1. XỬ LÝ TRẠNG THÁI ACTIVE THEO URL
    // =============================================
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;

    const menuItems = document.querySelectorAll('.sidebar .menu-item');
    const topNavItems = document.querySelectorAll('.top-nav span');

    menuItems.forEach(i => i.classList.remove('active'));
    topNavItems.forEach(i => i.classList.remove('active'));

    if (currentPath === '/favorites') {
        if (menuItems[3]) menuItems[3].classList.add('active');
    } else if (currentPath === '/history') {
        if (menuItems[4]) menuItems[4].classList.add('active');
    } else if (currentPath === '/coming-soon') {
        if (currentSearch.includes('radio') && menuItems[0]) menuItems[0].classList.add('active');
        else if (currentSearch.includes('playlist') && menuItems[1]) menuItems[1].classList.add('active');
        else if (currentSearch.includes('library') && menuItems[2]) menuItems[2].classList.add('active');
    }

    if (currentPath === '/') {
        if (topNavItems[0]) topNavItems[0].classList.add('active');
    } else if (currentPath === '/explore') {
        if (topNavItems[1]) topNavItems[1].classList.add('active');
    } else if (currentPath.includes('/category/genre')) {
        if (topNavItems[2]) topNavItems[2].classList.add('active');
    } else if (currentPath.includes('/category/artist')) {
        if (topNavItems[3]) topNavItems[3].classList.add('active');
    }

    // =============================================
    // 2. XỬ LÝ ĐĂNG XUẤT
    // =============================================
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.style.display = 'flex';
                overlay.style.animation = 'fadeIn 0.5s forwards';
            }
            try {
                await fetch('/api/logout', { method: 'POST' });
            } catch (err) {
                console.error('Lỗi đăng xuất:', err);
            }
            setTimeout(() => { window.location.href = '/'; }, 2000);
        });
    }

    // =============================================
    // 3. TÌM KIẾM LIVE (SEARCH LIVE)
    // =============================================
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    let searchTimeout = null;

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            clearTimeout(searchTimeout);

            if (value.length > 0) {
                searchTimeout = setTimeout(async () => {
                    try {
                        const response = await fetch(`/api/search-live?q=${encodeURIComponent(value)}`);
                        const data = await response.json();
                        if (data.success) renderLiveResults(data.songs);
                    } catch (err) { console.error('Lỗi tìm kiếm:', err); }
                }, 300);
            } else {
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
        playSong(el);
        if (searchResults) searchResults.innerHTML = '';
        if (searchInput) searchInput.value = '';
    };

    // =============================================
    // 4. MUSIC PLAYER LOGIC
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
    let repeatMode = 0;
    let currentPlaylistIndex = -1;

    // Thu thập playlist từ giao diện
    const allSongCards = document.querySelectorAll('.music-card, .rank-item, .song-item-row');
    const playlist = Array.from(allSongCards);

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    function playSong(card) {
        if (!card) return;
        const title = card.getAttribute('data-title');
        const artist = card.getAttribute('data-artist');
        const cover = card.getAttribute('data-cover');
        const audioUrl = card.getAttribute('data-audio');
        const songId = card.getAttribute('data-song-id');

        if (!audioUrl) {
            alert('Bài hát này chưa có linh khí (dữ liệu âm thanh)!');
            return;
        }

        if (playerBar) playerBar.classList.add('active');
        if (playerTitle) playerTitle.textContent = title;
        if (playerArtist) playerArtist.textContent = artist;
        if (playerCover) playerCover.style.backgroundImage = `url('${cover}')`;

        const idx = playlist.findIndex(item => item.getAttribute('data-song-id') === songId);
        if (idx !== -1) currentPlaylistIndex = idx;

        if (currentSongId !== songId) {
            audio.src = audioUrl;
            currentSongId = songId;
        }

        audio.play().then(() => {
            isPlaying = true;
            if (playPauseIcon) playPauseIcon.className = 'fas fa-pause';
            if (playerCover) playerCover.classList.add('playing');
            fetch(`/api/history/${songId}`, { method: 'POST' }).catch(err => console.error(err));
        }).catch(err => console.error('Lỗi phát nhạc:', err));

        checkFavoriteStatus(songId);
    }

    async function checkFavoriteStatus(songId) {
        if (!playerFavBtn || !songId) return;
        try {
            const res = await fetch(`/api/favorite/${songId}`);
            const data = await res.json();
            playerFavBtn.style.color = (data.success && data.isFavorite) ? '#ff3b30' : '';
        } catch (err) { console.error(err); }
    }

    window.playSongGlobal = playSong;

    function togglePlay() {
        if (!currentSongId) return;
        if (isPlaying) {
            audio.pause();
            if (playPauseIcon) playPauseIcon.className = 'fas fa-play';
            if (playerCover) playerCover.classList.remove('playing');
        } else {
            audio.play();
            if (playPauseIcon) playPauseIcon.className = 'fas fa-pause';
            if (playerCover) playerCover.classList.add('playing');
        }
        isPlaying = !isPlaying;
    }

    function playNext() {
        if (playlist.length === 0) return;
        if (isShuffle) {
            let r = Math.floor(Math.random() * playlist.length);
            if (playlist.length > 1) while (r === currentPlaylistIndex) r = Math.floor(Math.random() * playlist.length);
            currentPlaylistIndex = r;
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

    // Gắn sự kiện điều khiển
    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    if (btnNext) btnNext.addEventListener('click', playNext);
    if (btnPrev) btnPrev.addEventListener('click', playPrev);

    if (playerFavBtn) {
        playerFavBtn.addEventListener('click', async () => {
            if (!currentSongId) return;
            const res = await fetch(`/api/favorite/${currentSongId}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) playerFavBtn.style.color = data.isFavorite ? '#ff3b30' : '';
        });
    }

    // Gắn sự kiện cho các Card bài hát
    allSongCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn')) return;
            playSong(card);
        });
    });

    // Thả tim trên Card
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    favoriteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const songId = btn.getAttribute('data-id');
            const res = await fetch(`/api/favorite/${songId}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) btn.style.color = data.isFavorite ? '#ff3b30' : '';
        });

        // Check trạng thái ban đầu
        const songId = btn.getAttribute('data-id');
        fetch(`/api/favorite/${songId}`).then(r => r.json()).then(d => {
            if (d.success && d.isFavorite) btn.style.color = '#ff3b30';
        });
    });

    // Cập nhật Progress Bar
    if (audio) {
        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                if (progressBar) progressBar.value = (audio.currentTime / audio.duration) * 100;
                if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
            }
        });
        audio.addEventListener('loadedmetadata', () => {
            if (totalTimeEl) totalTimeEl.textContent = formatTime(audio.duration);
        });
        audio.addEventListener('ended', () => {
            if (repeatMode === 2) { audio.currentTime = 0; audio.play(); }
            else playNext();
        });
    }

    if (progressBar) {
        progressBar.addEventListener('input', (e) => {
            if (audio.duration) audio.currentTime = (e.target.value / 100) * audio.duration;
        });
    }

    if (volumeBar) {
        volumeBar.addEventListener('input', (e) => {
            audio.volume = e.target.value / 100;
        });
    }
});