document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // 1. XỬ LÝ TRẠNG THÁI ACTIVE VÀ CHUYỂN TRANG
    // =============================================
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;

    const menuItems = document.querySelectorAll('.sidebar .menu-item');
    const topNavItems = document.querySelectorAll('.top-nav span');

    // =============================================
    // TRANSITION LOGIC (KHÁM PHÁ NGAY)
    // =============================================
    const exploreNowBtn = document.querySelector('.btn-play-now');
    const transitionContainer = document.getElementById('transition-container');
    const transitionVideo = document.getElementById('transition-video');
    const mistSwipe = document.getElementById('mist-swipe');
    let isTransitioning = false;

    function goToExplore() {
        window.location.href = '/explore';
    }

    function runMistSwipe() {
        if (!mistSwipe) return;
        mistSwipe.classList.remove('mist-active');
        void mistSwipe.offsetWidth;
        mistSwipe.classList.add('mist-active');
    }

    window.startDiscoveryTransition = async function (url) {
        if (isTransitioning) return;
        isTransitioning = true;

        if (!transitionContainer || !transitionVideo) {
            window.location.href = url;
            return;
        }

        transitionContainer.style.display = 'flex';
        runMistSwipe();

        let didFinish = false;
        const finishTransition = () => {
            if (didFinish) return;
            didFinish = true;
            runMistSwipe();
            setTimeout(() => window.location.href = url, 600);
        };

        const fallbackTimer = setTimeout(finishTransition, 3500);

        try {
            transitionVideo.pause();
            transitionVideo.muted = true;
            transitionVideo.playsInline = true;
            transitionVideo.load();
            await transitionVideo.play();
            transitionVideo.onended = finishTransition;
        } catch (err) {
            console.error('Không thể phát transition video:', err);
            finishTransition();
        }
    };

    if (exploreNowBtn) {
        exploreNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.startDiscoveryTransition('/explore');
        });
    }

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
    else if (currentPath === '/coming-soon') {
        if (currentSearch.includes('ref=radio')) menuItems[0]?.classList.add('active');
        else if (currentSearch.includes('ref=playlist')) menuItems[1]?.classList.add('active');
        else if (currentSearch.includes('ref=library')) menuItems[2]?.classList.add('active');
    }

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
                        if (data.success) {
                            renderLiveResults(data.songs);
                            if (data.songs.length > 0) {
                                searchResults.classList.add('active');
                            }
                        }
                    } catch (err) { console.error('Lỗi tìm kiếm:', err); }
                }, 300);
            } else if (searchResults) {
                searchResults.innerHTML = '';
                searchResults.classList.remove('active');
            }
        });

        // Đóng kết quả khi click ra ngoài
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('active');
            }
        });

        // Hiện lại kết quả khi focus vào input nếu đã có giá trị
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length > 0 && searchResults.children.length > 0) {
                searchResults.classList.add('active');
            }
        });
    }
function renderLiveResults(songs) {
    if (!searchResults) return;
    const currentLang = localStorage.getItem('preferredLang') || 'vi';
    const dict = (typeof translations !== 'undefined') ? translations[currentLang] : null;

    if (!songs || songs.length === 0) {
        const msg = dict ? dict.search_no_results : 'Không tìm thấy bài hát nào';
        searchResults.innerHTML = `<div class="search-item">${msg}</div>`;
        return;
    }

    const title = dict ? dict.search_suggest : 'Gợi ý kết quả';
    const html = `
        <div class="search-section-title">${title}</div>
        ${songs.map(song => `
            <div class="search-item" 
                     data-song-id="${song.id}" 
                     data-title="${song.title}" 
                     data-artist="${song.artist}" 
                     data-cover="${song.cover_url}" 
                     data-audio="${song.audio_url}"
                     onclick="playFromSearch(this)">
                    <img src="${song.cover_url}" alt="${song.title}">
                    <div class="info">
                        <p class="title">${song.title}</p>
                        <p class="artist">${song.artist}</p>
                    </div>
                    ${song.genre ? `<span class="genre-tag">${song.genre}</span>` : ''}
                </div>
            `).join('')}
        `;
        searchResults.innerHTML = html;
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

        if (!audioUrl) return alert(getTranslation('no_data_alert'));

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
        currentPlaylistIndex = (currentPlaylistIndex - 1 + playlist.length) % playlist.length;
        playSong(playlist[currentPlaylistIndex]);
    }

    // Gắn sự kiện cho Player Controls
    playPauseBtn?.addEventListener('click', togglePlay);
    document.getElementById('btn-next')?.addEventListener('click', playNext);
    document.getElementById('btn-prev')?.addEventListener('click', playPrev);

    // Nút Shuffle & Repeat
    document.querySelector('.fa-random')?.addEventListener('click', function () {
        isShuffle = !isShuffle;
        this.style.color = isShuffle ? '#00f2ff' : '';
    });
    document.querySelector('.fa-redo-alt')?.addEventListener('click', function () {
        repeatMode = (repeatMode + 1) % 3;
        this.style.color = repeatMode > 0 ? '#00f2ff' : '';
    });

    // Thả tim trên Card và Player
    function createHeartAnimation(e) {
        const heartFly = document.createElement('i');
        heartFly.className = 'fas fa-heart heart-fly-anim';
        heartFly.style.left = (e.clientX - 10) + 'px';
        heartFly.style.top = (e.clientY - 10) + 'px';
        document.body.appendChild(heartFly);
        
        setTimeout(() => heartFly.remove(), 800);
    }
    window.createHeartAnimationGlobal = createHeartAnimation;

    const handleFavorite = async (songId, btnEl) => {
        try {
            const res = await fetch(`/api/favorite/${songId}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) btnEl.style.color = data.isFavorite ? '#ff3b30' : '';
        } catch (err) { console.error(err); }
    };

    playerFavBtn?.addEventListener('click', (e) => {
        createHeartAnimation(e);
        handleFavorite(currentSongId, playerFavBtn);
    });

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const songId = btn.getAttribute('data-id');
        // Check ban đầu
        fetch(`/api/favorite/${songId}`).then(r => r.json()).then(d => { if (d.isFavorite) btn.style.color = '#ff3b30'; });
        // Click
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            createHeartAnimation(e);
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
            saveAudioState(); // Save state on progress
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
        sessionStorage.removeItem('audioState');
        setTimeout(() => window.location.href = '/', 1500);
    });

    function safeAddEvent(id, event, cb) { document.getElementById(id)?.addEventListener(event, cb); }

    // =============================================
    // AUDIO STATE PERSISTENCE
    // =============================================
    function saveAudioState() {
        if (!currentSongId || !audio) return;
        const state = {
            songId: currentSongId,
            currentTime: audio.currentTime,
            isPlaying: !audio.paused,
            isShuffle: isShuffle,
            repeatMode: repeatMode,
            title: playerTitle?.textContent || '',
            artist: playerArtist?.textContent || '',
            coverUrl: playerCover?.style.backgroundImage || '',
            audioUrl: audio.src
        };
        sessionStorage.setItem('audioState', JSON.stringify(state));
    }

    function restoreAudioState() {
        const stateStr = sessionStorage.getItem('audioState');
        if (!stateStr || !audio) return;
        try {
            const state = JSON.parse(stateStr);
            isShuffle = state.isShuffle;
            repeatMode = state.repeatMode;
            currentSongId = state.songId;

            // Update Shuffle/Repeat UI
            const shuffleIcon = document.querySelector('.fa-random');
            if (shuffleIcon) shuffleIcon.style.color = isShuffle ? '#00f2ff' : '';
            const repeatIcon = document.querySelector('.fa-redo-alt');
            if (repeatIcon) repeatIcon.style.color = repeatMode > 0 ? '#00f2ff' : '';

            // Update Player UI
            playerBar?.classList.add('active');
            if (playerTitle) playerTitle.textContent = state.title;
            if (playerArtist) playerArtist.textContent = state.artist;
            if (playerCover && state.coverUrl) {
                playerCover.style.backgroundImage = state.coverUrl;
            }

            // Restore Audio Src and Time
            if (state.audioUrl) {
                audio.src = state.audioUrl;
                audio.currentTime = state.currentTime;
                
                currentPlaylistIndex = playlist.findIndex(item => item.getAttribute('data-song-id') === state.songId);
                checkFavoriteStatus(state.songId);

                if (state.isPlaying) {
                    audio.play().then(() => {
                        isPlaying = true;
                        if (playPauseIcon) playPauseIcon.className = 'fas fa-pause';
                        playerCover?.classList.add('playing');
                    }).catch(err => {
                        console.error("Autoplay prevented:", err);
                        isPlaying = false;
                        if (playPauseIcon) playPauseIcon.className = 'fas fa-play';
                        playerCover?.classList.remove('playing');
                    });
                } else {
                    isPlaying = false;
                    if (playPauseIcon) playPauseIcon.className = 'fas fa-play';
                    playerCover?.classList.remove('playing');
                }
            }
        } catch (err) {
            console.error("Lỗi khi khôi phục trạng thái audio:", err);
        }
    }

    // Call restore on load
    restoreAudioState();
});