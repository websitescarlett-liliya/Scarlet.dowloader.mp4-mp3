document.addEventListener('DOMContentLoaded', () => {
    const TIKWM_BASE = 'https://www.tikwm.com';
    const CORS_PROXY = 'https://corsproxy.io/?';

    // 1. Audio Click Sound & Ripple Setup
    const clickSound = new Audio('https://www.soundjay.com/buttons/sounds/button-16a.mp3');
    
    function playClickSound() {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
    }

    document.body.addEventListener('click', function(e) {
        const btn = e.target.closest('button');
        if (btn) {
            playClickSound();
            createRipple(e, btn);
        }
    });

    function createRipple(e, element) {
        const circle = document.createElement('span');
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;

        const rect = element.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('ripple');

        const ripple = element.getElementsByClassName('ripple')[0];
        if (ripple) ripple.remove();

        element.appendChild(circle);
    }

    // 2. Profile Photo Upload Handler
    const profileBtn = document.getElementById('profileBtn');
    const imageInput = document.getElementById('imageInput');
    const profileImage = document.getElementById('profileImage');

    if (profileBtn && imageInput) {
        profileBtn.addEventListener('click', () => imageInput.click());

        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    profileImage.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 3. Dark/Light Mode Switcher
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            if (currentTheme === 'light') {
                document.body.removeAttribute('data-theme');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            } else {
                document.body.setAttribute('data-theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        });
    }

    // 4. Magnetic Buttons Effect
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });

    // Helper untuk auto download MP4 / MP3
    function triggerDownload(url, filename) {
        if (!url) return alert('Link download tidak tersedia.');
        const fullUrl = url.startsWith('http') ? url : `${TIKWM_BASE}${url}`;
        const a = document.createElement('a');
        a.href = fullUrl;
        a.target = '_blank';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // 5. TikTok Downloader via TikWM API
    const fetchBtn = document.getElementById('fetchBtn');
    const tiktokUrl = document.getElementById('tiktokUrl');
    const downloadContainer = document.getElementById('downloadContainer');
    const authorAvatar = document.getElementById('authorAvatar');
    const authorName = document.getElementById('authorName');
    const soundTitle = document.getElementById('soundTitle');
    const dlMp4 = document.getElementById('dlMp4');
    const dlMp3 = document.getElementById('dlMp3');

    if (fetchBtn) {
        fetchBtn.addEventListener('click', async () => {
            const url = tiktokUrl.value.trim();
            if (!url) return alert('Silakan masukkan URL TikTok!');

            fetchBtn.innerText = 'Memuat...';

            try {
                const formData = new FormData();
                formData.append('url', url);
                formData.append('hd', '1');

                const res = await fetch(`${TIKWM_BASE}/api/`, {
                    method: 'POST',
                    body: formData
                });
                const json = await res.json();

                if (json.code === 0 && json.data) {
                    const data = json.data;
                    const avatar = data.author?.avatar || 'https://via.placeholder.com/45';
                    const uniqueId = data.author?.unique_id || 'user';
                    const nickname = data.author?.nickname || '';
                    const musicName = data.music_info?.title || 'Original Sound';

                    authorAvatar.src = avatar.startsWith('http') ? avatar : `${TIKWM_BASE}${avatar}`;
                    authorName.innerText = `@${uniqueId} (${nickname})`;
                    soundTitle.innerHTML = `<i class="fas fa-music"></i> ${musicName}`;

                    dlMp4.onclick = () => triggerDownload(data.play, `${uniqueId}_video.mp4`);
                    dlMp3.onclick = () => triggerDownload(data.music || data.music_info?.play, `${uniqueId}_audio.mp3`);

                    downloadContainer.classList.remove('hidden');
                } else {
                    alert('Gagal mengambil data video. Pastikan link valid!');
                }
            } catch (err) {
                console.error('Error Download:', err);
                alert('Terjadi kesalahan koneksi API.');
            } finally {
                fetchBtn.innerText = 'Cek Video';
            }
        });
    }

    // 6. Search Presets via TikWM Feed API (Proxy Fallback & CORS Fix)
    const presetGrid = document.getElementById('presetGrid');
    const presetSearchInput = document.getElementById('presetSearchInput');
    const presetSearchBtn = document.getElementById('presetSearchBtn');
    const chips = document.querySelectorAll('.chip');

    async function loadPresets(keywords) {
        if (!presetGrid) return;
        presetGrid.innerHTML = '<p style="grid-column: span 2; text-align: center; font-size: 0.8rem;">Memuat preset...</p>';
        
        try {
            const formData = new FormData();
            formData.append('keywords', keywords);
            formData.append('count', '12');
            formData.append('cursor', '0');

            const targetApi = `${TIKWM_BASE}/api/feed/search`;
            
            // Coba fetch langsung dulu, jika gagal/CORS gunakan Proxy
            let res;
            try {
                res = await fetch(targetApi, { method: 'POST', body: formData });
            } catch (e) {
                res = await fetch(CORS_PROXY + encodeURIComponent(targetApi), { method: 'POST', body: formData });
            }

            const json = await res.json();

            if (json.code === 0 && json.data && json.data.videos && json.data.videos.length > 0) {
                presetGrid.innerHTML = '';
                json.data.videos.slice(0, 6).forEach(video => {
                    const rawCover = video.cover || video.origin_cover || '';
                    const coverUrl = rawCover.startsWith('http') ? rawCover : `${TIKWM_BASE}${rawCover}`;
                    const likes = video.digg_count ? (video.digg_count > 999 ? (video.digg_count / 1000).toFixed(1) + 'K' : video.digg_count) : '0';
                    const videoTitle = video.title || 'Preset TikTok';
                    const authorId = video.author?.unique_id || 'tiktok';

                    const card = document.createElement('div');
                    card.className = 'preset-card';
                    card.innerHTML = `
                        <img src="${coverUrl}" alt="Preset Cover" onerror="this.src='https://via.placeholder.com/300x400?text=No+Cover'">
                        <div class="preset-info-overlay">
                            <p class="preset-title">${videoTitle}</p>
                            <div class="preset-stats">
                                <i class="fas fa-heart" style="color: #ff4757;"></i> ${likes}
                            </div>
                        </div>
                    `;
                    card.style.cursor = 'pointer';
                    card.onclick = () => {
                        const videoLink = video.play 
                            ? (video.play.startsWith('http') ? video.play : `${TIKWM_BASE}${video.play}`) 
                            : `https://www.tiktok.com/@${authorId}/video/${video.video_id}`;
                        window.open(videoLink, '_blank');
                    };
                    
                    presetGrid.appendChild(card);
                });
            } else {
                presetGrid.innerHTML = '<p style="grid-column: span 2; text-align: center; font-size: 0.8rem;">Preset tidak ditemukan.</p>';
            }
        } catch (err) {
            console.error('Error Search Preset:', err);
            presetGrid.innerHTML = '<p style="grid-column: span 2; text-align: center; font-size: 0.8rem; color: #ff6b6b;">Gagal memuat preset. Coba lagi nanti.</p>';
        }
    }

    if (presetSearchBtn && presetSearchInput) {
        presetSearchBtn.addEventListener('click', () => {
            const query = presetSearchInput.value.trim();
            if (query) {
                chips.forEach(c => c.classList.remove('active'));
                loadPresets(query);
            }
        });

        presetSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                presetSearchBtn.click();
            }
        });
    }

    chips.forEach(chip => {
        chip.addEventListener('click', function() {
            chips.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            const tag = this.dataset.tag;
            if (presetSearchInput) presetSearchInput.value = '#' + tag;
            loadPresets(tag);
        });
    });

    // Inisialisasi awal
    loadPresets('preset');
});

                
