document.addEventListener('DOMContentLoaded', () => {

    // Helper: Hàm kiểm tra phần tử tồn tại trước khi gán sự kiện
    const safeAddEvent = (id, event, callback) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, callback);
    };

    // 1. XỬ LÝ TRẠNG THÁI ACTIVE THEO URL
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.sidebar .menu-item');
    const topNavItems = document.querySelectorAll('.top-nav span');

    if (currentPath === '/favorites' && menuItems[3]) menuItems[3].classList.add('active');
    if (currentPath === '/history' && menuItems[4]) menuItems[4].classList.add('active');
    // ... (Giữ nguyên các logic active khác nhưng thêm kiểm tra phần tử)

    // 2. XỬ LÝ ĐĂNG XUẤT (Sử dụng safeAddEvent)
    safeAddEvent('logout-btn', 'click', async (e) => {
        e.preventDefault();
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.style.animation = 'fadeIn 0.5s forwards';
        }
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (err) { console.error(err); }
        setTimeout(() => { window.location.href = '/'; }, 2000);
    });

    // 3. TÌM KIẾM LIVE
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    let searchTimeout = null;

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            clearTimeout(searchTimeout);
            if (value.length > 0) {
                searchTimeout = setTimeout(async () => {
                    const res = await fetch(`/api/search-live?q=${encodeURIComponent(value)}`);
                    const data = await res.json();
                    if (data.success) renderLiveResults(data.songs);
                }, 300);
            } else if (searchResults) {
                searchResults.innerHTML = '';
            }
        });
    }

    function renderLiveResults(songs) {
        if (!searchResults) return;
        searchResults.innerHTML = songs.map(song => `
            <div class="search-item" 
                 data-song-id="${song.id}" data-title="${song.title}" 
                 data-artist="${song.artist}" data-cover="${song.cover_url}" 
                 data-audio="${song.audio_url}" onclick="playFromSearch(this)">
                <img src="${song.cover_url}">
                <div><p class="title">${song.title}</p><p class="artist">${song.artist}</p></div>
            </div>
        `).join('');
    }

    window.playFromSearch = function (el) {
        playSong(el);
        if (searchResults) searchResults.innerHTML = '';
        if (searchInput) searchInput.value = '';
    };

    // 4. MUSIC PLAYER LOGIC
    const audio = document.getElementById('main-audio-player');
    const playerBar = document.getElementById('music-player-bar');
    const playPauseIcon = document.getElementById('icon-play-pause');
    const playerCover = document.getElementById('player-cover');
    const playerTitle = document.getElementById('player-title');
    const playerArtist = document.getElementById('player-artist');

    let currentSongId = null;
    const allSongCards = document.querySelectorAll('.music-card, .rank-item, .song-item-row');
    const playlist = Array.from(allSongCards);

    function playSong(card) {
        if (!card || !audio) return;
        const songData = {
            id: card.getAttribute('data-song-id'),
            title: card.getAttribute('data-title'),
            artist: card.getAttribute('data-artist'),
            cover: card.getAttribute('data-cover'),
            audio: card.getAttribute('data-audio')
        };

        if (!songData.audio) return alert('Thiếu linh khí (audio)!');

        if (playerBar) playerBar.classList.add('active');
        if (playerTitle) playerTitle.textContent = songData.title;
        if (playerArtist) playerArtist.textContent = songData.artist;
        if (playerCover) playerCover.style.backgroundImage = `url('${songData.cover}')`;

        if (currentSongId !== songData.id) {
            audio.src = songData.audio;
            currentSongId = songData.id;
        }

        audio.play().then(() => {
            if (playPauseIcon) playPauseIcon.className = 'fas fa-pause';
            fetch(`/api/history/${songData.id}`, { method: 'POST' }).catch(() => { });
        });
        checkFavoriteStatus(songData.id);
    }

    window.playSongGlobal = playSong;

    // Gán sự kiện cho các Card (Sửa lỗi "ấn không nhận")
    allSongCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn')) return;
            playSong(card);
        });
    });

    // Thả tim trên Card
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const songId = btn.getAttribute('data-id');
            const res = await fetch(`/api/favorite/${songId}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) btn.style.color = data.isFavorite ? '#ff3b30' : '';
        });
    });
});