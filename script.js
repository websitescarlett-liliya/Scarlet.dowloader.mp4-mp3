document.addEventListener('DOMContentLoaded', () => {
    const TIKWM_BASE = 'https://www.tikwm.com';

    // DATABASE PRESET LOKAL - Tinggal kamu isi
    const PRESET_DATA = [
        { id: 1, judul: "Preset Cinematic Dark", hashtag: "#preset #cinematic", caption: "tone gelap buat malam hari", cover: "https://picsum.photos/400/500?random=1", link: "https://www.tiktok.com/tag/preset" },
        { id: 2, judul: "Preset 5MB Aesthetic", hashtag: "#preset5mb #aesthetic", caption: "ringan dan estetik buat feed", cover: "https://picsum.photos/400/500?random=2", link: "https://www.tiktok.com/tag/preset5mb" },
        { id: 3, judul: "Preset XML Moody", hashtag: "#presetxml #moody", caption: "warna biru keunguan", cover: "https://picsum.photos/400/500?random=3", link: "https://www.tiktok.com/tag/presetxml" },
        { id: 4, judul: "Preset AM Warm", hashtag: "#presetam #warm", caption: "tone hangat sunset", cover: "https://picsum.photos/400/500?random=4", link: "https://www.tiktok.com/tag/presetam" },
        { id: 5, judul: "Preset Dark Vibes", hashtag: "#preset #dark", caption: "cocok buat video malam", cover: "https://picsum.photos/400/500?random=5", link: "https://www.tiktok.com/tag/dark" },
        { id: 6, judul: "Preset Pink Aesthetic", hashtag: "#preset #pink", caption: "tone pink soft aesthetic", cover: "https://picsum.photos/400/500?random=6", link: "https://www.tiktok.com/tag/pink" },
    ];

    // Inisialisasi Fuse.js untuk search "kaya google"
    const fuse = new Fuse(PRESET_DATA, {
        keys: ['judul', 'hashtag', 'caption'], // cari di 3 field ini
        threshold: 0.4, // 0.0 = harus sama persis, 1.0 = acak. 0.4 = toleran typo
        includeScore: true
    });

    // 1. Ripple + Sound
    const clickSound = new Audio('https://www.soundjay.com/buttons/sounds/button-16a.mp3');
    function playClickSound() { clickSound.currentTime = 0; clickSound.play().catch(() => {}); }
    document.body.addEventListener('click', function(e) {
        const btn = e.target.closest('button');
        if (btn) { playClickSound(); createRipple(e, btn); }
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

    // 2. Profile + Theme + Magnetic - kode kamu tetap sama
    const profileBtn = document.getElementById('profileBtn');
    const imageInput = document.getElementById('imageInput');
    const profileImage = document.getElementById('profileImage');
    const profileNameDisplay = document.getElementById('profileNameDisplay');
    const editNameBtn = document.getElementById('editNameBtn');
    const savedAvatar = localStorage.getItem('scarlet_user_avatar');
    const savedName = localStorage.getItem('scarlet_user_name');
    if (savedAvatar) profileImage.src = savedAvatar;
    if (savedName) profileNameDisplay.innerText = savedName;
    if (profileBtn) profileBtn.addEventListener('click', () => imageInput.click());
    if (imageInput) imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                profileImage.src = evt.target.result;
                localStorage.setItem('scarlet_user_avatar', evt.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
    if (editNameBtn) editNameBtn.addEventListener('click', () => {
        const newName = prompt('Masukkan nama pengguna baru:', profileNameDisplay.innerText);
        if (newName && newName.trim() !== '') {
            profileNameDisplay.innerText = newName.trim();
            localStorage.setItem('scarlet_user_name', newName.trim());
        }
    });
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.body.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.body.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0px, 0px)'; });
    });

    // 3. TikTok Downloader - tetap pakai API
    const fetchBtn = document.getElementById('fetchBtn');
    const tiktokUrl = document.getElementById('tiktokUrl');
    const downloadContainer = document.getElementById('downloadContainer');
    const authorAvatar = document.getElementById('authorAvatar');
    const authorName = document.getElementById('authorName');
    const soundTitle = document.getElementById('soundTitle');
    const dlMp4 = document.getElementById('dlMp4');
    const dlMp3 = document.getElementById('dlMp3');
    function triggerDownload(url, filename) {
        if (!url) return alert('Link download tidak tersedia.');
        const fullUrl = url.startsWith('http') ? url : `${TIKWM_BASE}${url}`;
        const a = document.createElement('a');
        a.href = fullUrl; a.target = '_blank'; a.download = filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
    if (fetchBtn) fetchBtn.addEventListener('click', async () => {
        const url = tiktokUrl.value.trim();
        if (!url) return alert('Silakan masukkan URL TikTok!');
        fetchBtn.innerText = 'Memuat...';
        try {
            const formData = new FormData();
            formData.append('url', url); formData.append('hd', '1');
            const res = await fetch(`${TIKWM_BASE}/api/`, { method: 'POST', body: formData });
            const json = await res.json();
            if (json.code === 0 && json.data) {
                const data = json.data;
                authorAvatar.src = data.author?.avatar || 'https://via.placeholder.com/45';
                authorName.innerText = `@${data.author?.unique_id} (${data.author?.nickname})`;
                soundTitle.innerHTML = `<i class="fas fa-music"></i> ${data.music_info?.title || 'Original Sound'}`;
                dlMp4.onclick = () => triggerDownload(data.play, `video.mp4`);
                dlMp3.onclick = () => triggerDownload(data.music, `audio.mp3`);
                downloadContainer.classList.remove('hidden');
            } else { alert('Gagal mengambil data video. Pastikan link valid!'); }
        } catch (err) { alert('Terjadi kesalahan koneksi API.'); } 
        finally { fetchBtn.innerText = 'Cek Video'; }
    });

    // 4. SEARCH PRESET BARU - PAKAI DATABASE LOKAL
    const presetGrid = document.getElementById('presetGrid');
    const presetSearchInput = document.getElementById('presetSearchInput');
    const presetSearchBtn = document.getElementById('presetSearchBtn');
    const chips = document.querySelectorAll('.chip');

    function tampilkanPreset(data) {
        if (!presetGrid) return;
        if (data.length === 0) {
            presetGrid.innerHTML = '<p class="preset-notfound">Preset tidak ditemukan. Coba kata kunci lain</p>';
            return;
        }
        presetGrid.innerHTML = '';
        data.slice(0, 6).forEach(p => {
            const card = document.createElement('div');
            card.className = 'preset-card';
            card.innerHTML = `
                <img src="${p.cover}" alt="${p.judul}" onerror="this.src='https://via.placeholder.com/300x400'">
                <div class="preset-info-overlay">
                    <p class="preset-title">${p.judul}</p>
                    <div class="preset-stats"><i class="fas fa-hashtag"></i> ${p.hashtag}</div>
                </div>
            `;
            card.onclick = () => window.open(p.link, '_blank');
            presetGrid.appendChild(card);
        });
    }

    function cariPreset(query) {
        if (!query) { tampilkanPreset(PRESET_DATA); return; }
        const hasil = fuse.search(query);
        tampilkanPreset(hasil.map(h => h.item));
    }

    if (presetSearchBtn) presetSearchBtn.addEventListener('click', () => {
        cariPreset(presetSearchInput.value.trim());
    });
    if (presetSearchInput) presetSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') cariPreset(presetSearchInput.value.trim());
    });
    chips.forEach(chip => chip.addEventListener('click', function() {
        chips.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        const tag = this.dataset.tag;
        presetSearchInput.value = '#' + tag;
        cariPreset(tag);
    }));

    // Load awal
    tampilkanPreset(PRESET_DATA);
});
