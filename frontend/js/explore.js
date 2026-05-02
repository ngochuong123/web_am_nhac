// Logic render danh sách bài hát theo châu lục được gọi khi nhấn vào bản đồ

function selectContinent(id) {
    const songs = window.__SONGS_BY_CONTINENT__ && window.__SONGS_BY_CONTINENT__[id];
    const wrapper = document.getElementById('continent-songs-wrapper');
    const container = document.getElementById('continent-songs-container');
    const title = document.getElementById('continent-songs-title');
    
    // Tên hiển thị
    const continentNames = {
        'asia': 'Châu Á',
        'europe': 'Châu Âu',
        'america': 'Châu Mỹ',
        'africa': 'Châu Phi',
        'oceania': 'Châu Đại Dương'
    };

    if (songs && songs.length > 0) {
        title.innerHTML = `Âm Nhạc ${continentNames[id] || id.toUpperCase()} <span style="font-size: 0.8rem; color: #888; font-weight: normal;">(${songs.length} bài)</span>`;
        
        let html = '';
        songs.forEach((song, index) => {
            html += `
            <div class="song-item-row music-card" data-song-id="${song.id}" data-title="${song.title}" data-artist="${song.artist}" data-cover="${song.cover_url}" data-audio="${song.audio_url}">
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
                    ${song.genre}
                </div>

                <div class="row-actions">
                    <i class="fas fa-heart favorite-btn" data-id="${song.id}"></i>
                    <span class="row-duration">${song.duration}</span>
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `;
        });
        
        container.innerHTML = html;
        wrapper.style.display = 'block';
        
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

        // Gắn lại sự kiện click phát nhạc cho các card vừa tạo (tái sử dụng script.js nếu có thể, hoặc dispatch sự kiện)
        // Gọi lại logic gắn sự kiện từ script.js bằng cách giả lập hoặc yêu cầu tải lại, 
        // Tuy nhiên do script.js chạy lúc DOMContentLoaded, ta cần attach event thủ công cho danh sách mới này
        const newCards = container.querySelectorAll('.music-card');
        newCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('favorite-btn')) {
                    // Logic thả tim
                    e.stopPropagation();
                    const songId = e.target.getAttribute('data-id');
                    fetch(`/api/favorite/${songId}`, { method: 'POST' })
                        .then(r => r.json())
                        .then(d => {
                            if(d.success) e.target.style.color = d.isFavorite ? 'var(--accent-red, #ff3b30)' : '#fff';
                            else alert(d.message);
                        });
                    return;
                }
                
                // Kích hoạt playSong toàn cục nếu có (do script.js không expose playSong, 
                // ta mô phỏng click bằng cách gọi audio player hoặc dispatch một custom event)
                // Một thủ thuật là để playSong thành global trong script.js, nhưng hiện tại nó đang bị đóng gói.
                // Thôi thì tự kích hoạt
                window.playSongGlobal && window.playSongGlobal(card);
            });
        });

    } else {
        wrapper.style.display = 'block';
        title.textContent = `Âm Nhạc ${continentNames[id] || id.toUpperCase()}`;
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #888; width: 100%;">
                <i class="fas fa-wind" style="font-size: 3rem; color: var(--accent-cyan); margin-bottom: 20px;"></i>
                <h3>Nơi này tĩnh lặng, chưa có âm thanh nào...</h3>
            </div>
        `;
        wrapper.scrollIntoView({ behavior: 'smooth' });
    }
}