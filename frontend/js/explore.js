// Logic render danh sách bài hát theo châu lục được gọi khi nhấn vào bản đồ

function selectContinent(id) {
    const songs = window.__SONGS_BY_CONTINENT__ && window.__SONGS_BY_CONTINENT__[id];
    const wrapper = document.getElementById('continent-songs-wrapper');
    const container = document.getElementById('continent-songs-container');
    const title = document.getElementById('continent-songs-title');

    // Tên hiển thị (Dùng getTranslation để lấy từ điển mới)
    const continentNames = {
        'asia': getTranslation('asia_name'),
        'europe': getTranslation('europe_name'),
        'america': getTranslation('america_name'),
        'africa': getTranslation('africa_name'),
        'oceania': getTranslation('oceania_name')
    };

    if (songs && songs.length > 0) {
        const musicOf = getTranslation('music_of');
        const songCountSuffix = getTranslation('songs_count');
        title.innerHTML = `${musicOf} ${continentNames[id] || id.toUpperCase()} <span style="font-size: 0.8rem; color: #888; font-weight: normal;">(${songs.length} ${songCountSuffix})</span>`;

        let html = '';
        songs.forEach((song, index) => {
            html += `
            <div class="song-item-row music-card explore-song-item" 
                 data-song-id="${song.id}" 
                 data-title="${song.title}" 
                 data-artist="${song.artist}" 
                 data-cover="${song.cover_url}" 
                 data-audio="${song.audio_url}">
                <div class="row-number">${index + 1}</div>
                
                <div class="row-info">
                    <div class="row-cover" style="background-image: url('${song.cover_url}');">
                        <div class="row-play-overlay">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                    <div class="row-text">
                        <h3>${song.title}</h3>
                        <p>${song.artist}</p>
                    </div>
                </div>

                <div class="row-meta">
                    ${song.genre || ''}
                </div>

                <div class="row-actions">
                    <i class="fas fa-heart favorite-btn" data-id="${song.id}"></i>
                    <span class="row-duration">${song.duration || '0:00'}</span>
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `;
        });

        container.innerHTML = html;
        wrapper.style.display = 'block';
        // GẮN SỰ KIỆN DUY NHẤT CHO DANH SÁCH MỚI
        const newCards = container.querySelectorAll('.explore-song-item');
        newCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // 1. Xử lý riêng nếu click vào nút thả tim
                const favBtn = e.target.closest('.favorite-btn');
                if (favBtn) {
                    e.stopPropagation();
                    if (window.createHeartAnimationGlobal) {
                        window.createHeartAnimationGlobal(e);
                    }
                    const songId = favBtn.getAttribute('data-id');
                    fetch(`/api/favorite/${songId}`, { method: 'POST' })
                        .then(r => r.json())
                        .then(d => {
                            if (d.success) favBtn.style.color = d.isFavorite ? '#ff3b30' : '#fff';
                        });
                    return;
                }

                // 2. Gọi hàm phát nhạc toàn cục
                if (window.playSongGlobal) {
                    window.playSongGlobal(card);
                } else {
                    console.error("Lỗi: Hệ thống nhạc chưa sẵn sàng!");
                }
            });
        });

        // Set trạng thái favorite ban đầu
        const favBtns = container.querySelectorAll('.favorite-btn');
        favBtns.forEach(async (btn) => {
            const songId = btn.getAttribute('data-id');
            try {
                const res = await fetch(`/api/favorite/${songId}`);
                const data = await res.json();
                if (data.success && data.isFavorite) {
                    btn.style.color = 'var(--accent-red, #ff3b30)';
                }
            } catch (err) { console.error('Lỗi check favorite:', err); }
        });

        // Cuộn xuống danh sách
        wrapper.scrollIntoView({ behavior: 'smooth' });

    }
}