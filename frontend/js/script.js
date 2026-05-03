// Đợi cho đến khi toàn bộ nội dung HTML được tải xong
document.addEventListener('DOMContentLoaded', () => {

    // 1. XỬ LÝ TRẠNG THÁI ACTIVE THEO URL
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;

    const menuItems = document.querySelectorAll('.sidebar .menu-item');
    const topNavItems = document.querySelectorAll('.top-nav span');

    // Xóa hết active ban đầu
    menuItems.forEach(i => i.classList.remove('active'));
    topNavItems.forEach(i => i.classList.remove('active'));

    // Bật sáng Sidebar (5 mục: Radio, Playlist, Thư viện, Yêu thích, Lịch sử)
    if (currentPath === '/favorites') {
        if (menuItems[3]) menuItems[3].classList.add('active');
    } else if (currentPath === '/history') {
        if (menuItems[4]) menuItems[4].classList.add('active');
    } else if (currentPath === '/coming-soon') {
        if (currentSearch.includes('radio') && menuItems[0]) menuItems[0].classList.add('active');
        else if (currentSearch.includes('playlist') && menuItems[1]) menuItems[1].classList.add('active');
        else if (currentSearch.includes('library') && menuItems[2]) menuItems[2].classList.add('active');
    }

    // Bật sáng Top Nav
    if (currentPath === '/') {
        if (topNavItems[0]) topNavItems[0].classList.add('active');
    } else if (currentPath === '/explore') {
        if (topNavItems[1]) topNavItems[1].classList.add('active');
    } else if (currentPath.includes('/category/genre')) {
        if (topNavItems[2]) topNavItems[2].classList.add('active');
    } else if (currentPath.includes('/category/artist')) {
        if (topNavItems[3]) topNavItems[3].classList.add('active');
    }

    // Xử lý nút logout (nếu đã đăng nhập)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            // 1. Hiện màn hình load
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.style.display = 'flex';
                overlay.style.animation = 'fadeIn 0.5s forwards';
            }

            // 2. Gọi API đăng xuất
            try {
                await fetch('/api/logout', { method: 'POST' });
            } catch (err) {
                console.error('Lỗi đăng xuất:', err);
            }

            // 3. Đợi 2 giây rồi mới tải lại trang
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        });
    }

    // 2. Hiệu ứng chuyển cảnh Khám phá
    const videoContainer = document.getElementById('transition-container');
    const video = document.getElementById('transition-video');
    const mist = document.getElementById('mist-swipe');

    function startDiscoveryTransition(targetUrl) {
        if (!videoContainer || !video || !mist) {
            window.location.href = targetUrl;
            return;
        }
        videoContainer.style.display = 'flex';
        video.play();
        video.onended = () => {
            mist.classList.add('mist-active');
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 800);
        };
    }

    // --- GẮN SỰ KIỆN CHO CÁC NÚT ---

    // 1. Ô Tìm kiếm (Search)
    const searchInput = document.getElementById('search-input'); // ID của ô nhập
    const searchResults = document.getElementById('search-results'); // ID của vùng hiện kết quả

    searchInput.addEventListener('input', async (e) => {
        const value = e.target.value.trim();

        if (value.length > 0) {
            const response = await fetch(`/api/search-live?q=${encodeURIComponent(value)}`);
            const data = await response.json();

            if (data.success) {
                renderLiveResults(data.songs);
            }
        } else {
            searchResults.innerHTML = ''; // Xóa kết quả nếu ô nhập trống
        }
    });

    function renderLiveResults(songs) {
        // Xóa kết quả cũ và hiển thị danh sách bài hát mới bên dưới thanh tìm kiếm
        searchResults.innerHTML = songs.map(song => `
        <div class="search-item" onclick="playSong('${song.id}')">
            <img src="${song.cover_url}" alt="${song.title}">
            <div>
                <p class="title">${song.title}</p>
                <p class="artist">${song.artist}</p>
            </div>
        </div>
    `).join('');
    }

    // 2. Chuyển trang Sidebar (5 mục: Radio, Playlist, Thư viện, Yêu thích, Lịch sử)
    const sidebarItems = document.querySelectorAll('.sidebar .menu-item');
    const sidebarLinks = ['/coming-soon?ref=radio', '/coming-soon?ref=playlist', '/coming-soon?ref=library', '/favorites', '/history'];
    sidebarItems.forEach((item, index) => {
        if (index < sidebarLinks.length) {
            item.addEventListener('click', () => {
                window.location.href = sidebarLinks[index];
            });
        }
    });

    // 3. Chuyển trang Top Nav
    const topNavItemsNode = document.querySelectorAll('.top-nav span');
    if (topNavItemsNode.length >= 4) {
        topNavItemsNode[1].addEventListener('click', () => startDiscoveryTransition('/explore'));
        topNavItemsNode[2].addEventListener('click', () => window.location.href = '/category/genre');
        topNavItemsNode[3].addEventListener('click', () => window.location.href = '/category/artist');
    }

    // 4. Nút Khám phá ngay (Hero Banner)
    const heroBtn = document.querySelector('.btn-play-now');
    if (heroBtn) {
        heroBtn.addEventListener('click', (e) => {
            e.preventDefault();
            startDiscoveryTransition('/explore');
        });
    }

    // ==========================================
    // MUSIC PLAYER LOGIC
    // ==========================================
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

    let isPlaying = false;
    let currentSongId = null;
    let isShuffle = false;
    let repeatMode = 0; // 0: off, 1: repeat all, 2: repeat one
    let currentPlaylistIndex = -1;

    // Thu thập tất cả bài hát trên trang thành một playlist
    const allSongCards = document.querySelectorAll('.music-card, .rank-item, .song-item-row');
    const playlist = Array.from(allSongCards);

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    function playSong(card) {
        const title = card.getAttribute('data-title');
        const artist = card.getAttribute('data-artist');
        const cover = card.getAttribute('data-cover');
        const audioUrl = card.getAttribute('data-audio');
        const songId = card.getAttribute('data-song-id');

        if (!audioUrl || audioUrl === '') {
            alert('Bài hát này chưa có dữ liệu âm thanh!');
            return;
        }

        if (playerBar && !playerBar.classList.contains('active')) {
            playerBar.classList.add('active');
        }

        if (playerTitle) playerTitle.textContent = title;
        if (playerArtist) playerArtist.textContent = artist;
        if (playerCover) playerCover.style.backgroundImage = `url('${cover}')`;

        // Check trạng thái favorite cho player button
        if (playerFavBtn) {
            fetch(`/api/favorite/${songId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        playerFavBtn.style.color = data.isFavorite ? 'var(--accent-red, #ff3b30)' : '';
                    }
                })
                .catch(err => console.error('Lỗi check favorite:', err));
        }

        const idx = playlist.indexOf(card);
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
        }).catch(err => {
            console.error('Lỗi phát nhạc:', err);
            alert('Không thể phát bài hát này!');
        });
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
        if (audio && audio.currentTime > 3) { audio.currentTime = 0; return; }
        if (isShuffle) {
            let r = Math.floor(Math.random() * playlist.length);
            if (playlist.length > 1) while (r === currentPlaylistIndex) r = Math.floor(Math.random() * playlist.length);
            currentPlaylistIndex = r;
        } else {
            currentPlaylistIndex = (currentPlaylistIndex - 1 + playlist.length) % playlist.length;
        }
        playSong(playlist[currentPlaylistIndex]);
    }

    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);

    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    if (btnNext) btnNext.addEventListener('click', playNext);
    if (btnPrev) btnPrev.addEventListener('click', playPrev);

    // Nút Shuffle (Trộn bài)
    const btnShuffle = document.querySelector('.fa-random');
    if (btnShuffle) {
        btnShuffle.addEventListener('click', () => {
            isShuffle = !isShuffle;
            btnShuffle.style.color = isShuffle ? 'var(--accent-cyan, #00f2ff)' : '';
        });
    }

    // Nút Repeat (Lặp lại)
    const btnRepeat = document.querySelector('.fa-redo-alt');
    if (btnRepeat) {
        btnRepeat.addEventListener('click', () => {
            repeatMode = (repeatMode + 1) % 3;
            if (repeatMode === 0) btnRepeat.style.color = '';
            else if (repeatMode === 1) btnRepeat.style.color = 'var(--accent-cyan, #00f2ff)';
            else btnRepeat.style.color = '#fdd835';
        });
    }

    // Nút Yêu thích trên Player Bar
    const playerFavBtn = document.getElementById('player-favorite-btn');
    if (playerFavBtn) {
        playerFavBtn.addEventListener('click', async () => {
            if (!currentSongId) return;
            try {
                const res = await fetch(`/api/favorite/${currentSongId}`, { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                    playerFavBtn.style.color = data.isFavorite ? 'var(--accent-red, #ff3b30)' : '';
                } else {
                    alert(data.message);
                }
            } catch (err) { console.error(err); }
        });
    }

    // Gắn sự kiện click cho tất cả card bài hát
    allSongCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('favorite-btn')) return;
            playSong(card);
        });
    });

    // Xử lý nút Thả Tim trên các card
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    favoriteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const songId = btn.getAttribute('data-id');
            if (!songId) return;
            try {
                const res = await fetch(`/api/favorite/${songId}`, { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                    btn.style.color = data.isFavorite ? 'var(--accent-red, #ff3b30)' : '';
                } else {
                    alert(data.message);
                }
            } catch (err) { console.error(err); }
        });
    });

    // Set trạng thái ban đầu cho favorite buttons
    favoriteBtns.forEach(async (btn) => {
        const songId = btn.getAttribute('data-id');
        if (!songId) return;
        try {
            const res = await fetch(`/api/favorite/${songId}`);
            const data = await res.json();
            if (data.success && data.isFavorite) {
                btn.style.color = 'var(--accent-red, #ff3b30)';
            }
        } catch (err) { console.error('Lỗi check favorite:', err); }
    });

    // Thanh tiến trình
    if (audio) {
        audio.addEventListener('timeupdate', () => {
            const current = audio.currentTime;
            const duration = audio.duration;
            if (duration) {
                if (progressBar) progressBar.value = (current / duration) * 100;
                if (currentTimeEl) currentTimeEl.textContent = formatTime(current);
            }
        });

        audio.addEventListener('loadedmetadata', () => {
            if (totalTimeEl) totalTimeEl.textContent = formatTime(audio.duration);
        });

        // Khi hết bài
        audio.addEventListener('ended', () => {
            if (repeatMode === 2) {
                audio.currentTime = 0;
                audio.play();
            } else if (repeatMode === 1 || currentPlaylistIndex < playlist.length - 1) {
                playNext();
            } else {
                isPlaying = false;
                if (playPauseIcon) playPauseIcon.className = 'fas fa-play';
                if (playerCover) playerCover.classList.remove('playing');
                if (progressBar) progressBar.value = 0;
                if (currentTimeEl) currentTimeEl.textContent = "0:00";
            }
        });
    }

    // Kéo thanh tiến trình
    if (progressBar && audio) {
        progressBar.addEventListener('input', (e) => {
            if (audio.duration) audio.currentTime = (e.target.value / 100) * audio.duration;
        });
    }

    // Chỉnh âm lượng
    if (volumeBar && audio) {
        volumeBar.addEventListener('input', (e) => {
            audio.volume = e.target.value / 100;
            if (audio.volume === 0) muteBtn.className = 'fas fa-volume-mute';
            else if (audio.volume < 0.5) muteBtn.className = 'fas fa-volume-down';
            else muteBtn.className = 'fas fa-volume-up';
        });
    }

    // Nút Mute
    if (muteBtn && audio) {
        muteBtn.addEventListener('click', () => {
            if (audio.volume > 0) {
                audio.dataset.savedVolume = audio.volume;
                audio.volume = 0;
                volumeBar.value = 0;
                muteBtn.className = 'fas fa-volume-mute';
            } else {
                const savedVol = audio.dataset.savedVolume || 1;
                audio.volume = savedVol;
                volumeBar.value = savedVol * 100;
                muteBtn.className = savedVol < 0.5 ? 'fas fa-volume-down' : 'fas fa-volume-up';
            }
        });
    }
});