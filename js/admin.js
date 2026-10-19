/**
 * ==========================================================================
 * ARUTALA - Admin Studio LMS Controller (js/admin.js)
 * Mengelola Back-Office Modul, Video, PDF Download & Kuis Dinamis
 * ==========================================================================
 */

let ADMIN_STATE = {
  currentTrack: "articles", // "articles" | "nuansa-video" | "temara-registrations" | "pdf-modules" | "donations"
  trackItems: {
    articles: []
  },
  editingItemId: null,
  selectedType: "module",
  quizQuestions: [],
  articlesCategoryFilter: "all",
  articlesSearchQuery: "",
  uploadedCoverDataUrl: null,
  facilitatorSearchQuery: "",
  facilitatorStatusFilter: "all",
  facilitatorPillarFilter: "all",
  editingFacilitatorId: null
};

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();
  initAdminDashboard();
});

// ----------------------------------------------------------------------------
// 1. AUTHENTICATION & SESSION
// ----------------------------------------------------------------------------
function checkAdminAuth() {
  const isAuth = sessionStorage.getItem("arutala_admin_session");
  const overlay = document.getElementById("admin-auth-overlay");
  if (!isAuth) {
    if (overlay) overlay.style.display = "flex";
  } else {
    if (overlay) overlay.style.display = "none";
  }
}

function handleAdminLogin(event) {
  event.preventDefault();
  const inputPin = document.getElementById("admin-pin-input")?.value?.trim();
  // PIN default yang ramah pengujian
  if (inputPin === "admin123" || inputPin === "arutala2026" || inputPin === "admin") {
    sessionStorage.setItem("arutala_admin_session", "true");
    const overlay = document.getElementById("admin-auth-overlay");
    if (overlay) overlay.style.display = "none";
    showToast("Selamat datang di ARUTALA Studio LMS!", "success");
    initAdminDashboard();
  } else {
    alert("PIN Admin salah! Gunakan: admin123 atau arutala2026");
  }
}

function handleAdminLogout() {
  if (confirm("Apakah kamu yakin ingin keluar dari Studio Admin?")) {
    sessionStorage.removeItem("arutala_admin_session");
    window.location.reload();
  }
}

// ----------------------------------------------------------------------------
// 2. DASHBOARD INITIALIZATION & TRACK SWITCHING
// ----------------------------------------------------------------------------
async function initAdminDashboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const trackParam = urlParams.get("track");
  if (trackParam && ["articles", "nuansa-video", "temara-registrations", "pdf-modules", "donations"].includes(trackParam.toLowerCase())) {
    ADMIN_STATE.currentTrack = trackParam.toLowerCase();
  }

  // Setup input live preview untuk upload video NUANSA
  setupAdminVideoUrlListener();

  // Setup live preview cover image untuk artikel
  setupAdminArticleCoverListeners();

  // Load semua data count untuk badges
  await loadAllTrackCounts();

  // Load dan render track aktif
  await switchTrack(ADMIN_STATE.currentTrack, false);
}

function getNuansaVideosList() {
  if (Array.isArray(window.ARUTALA_CACHED_VIDEOS) && window.ARUTALA_CACHED_VIDEOS.length > 0) {
    return window.ARUTALA_CACHED_VIDEOS;
  }
  let customVideos = [];
  try {
    customVideos = JSON.parse(localStorage.getItem("arutala_custom_videos") || "[]");
  } catch (e) {
    customVideos = [];
  }

  if (customVideos.length > 0) {
    return customVideos;
  }

  if (window.ArutalaDB && typeof window.ArutalaDB.getDefaultNuansaVideos === "function") {
    return window.ArutalaDB.getDefaultNuansaVideos();
  }

  const defaultVideos = (window.ARUTALA_DATA && Array.isArray(window.ARUTALA_DATA.videos))
    ? window.ARUTALA_DATA.videos
    : [];

  return defaultVideos;
}

async function loadAllTrackCounts() {
  // Sync Video NUANSA dari Cloud jika belum
  if (!window.ARUTALA_CACHED_VIDEOS && window.ArutalaDB && typeof window.ArutalaDB.fetchNuansaVideos === "function") {
    try {
      window.ARUTALA_CACHED_VIDEOS = await window.ArutalaDB.fetchNuansaVideos();
    } catch (e) {}
  }

  // Sync Artikel dari Cloud jika belum
  if (!window.ARUTALA_CLOUD_ARTICLES && window.ArutalaDB && typeof window.ArutalaDB.fetchArticles === "function") {
    try {
      window.ARUTALA_CLOUD_ARTICLES = await window.ArutalaDB.fetchArticles();
    } catch (e) {}
  }
  if (typeof refreshAdminArticlesCache === "function") {
    refreshAdminArticlesCache();
  }

  // Count untuk Video NUANSA
  const videoList = getNuansaVideosList();
  const videoBadge = document.getElementById("badge-count-nuansa-video");
  if (videoBadge) videoBadge.textContent = `${videoList.length} Video`;

  // Count untuk Artikel & Jurnal
  const articleList = getAdminArticlesList();
  const articlesBadge = document.getElementById("badge-count-articles");
  if (articlesBadge) articlesBadge.textContent = `${articleList.length} Artikel`;

  // Count untuk Pendaftar Circle (TEMARA)
  const facList = getFacilitatorRegistrations();
  const facBadge = document.getElementById("badge-count-temara-registrations");
  if (facBadge) facBadge.textContent = `${facList.length} Pendaftar`;

  // Count untuk Modul & Dokumen PDF
  const pdfSettings = getPdfSettings();
  const pdfBadge = document.getElementById("badge-count-pdf-modules");
  if (pdfBadge) pdfBadge.textContent = `${Object.keys(pdfSettings).length} Modul`;

  // Status Donasi
  const donationsBadge = document.getElementById("badge-count-donations");
  if (donationsBadge) donationsBadge.textContent = "Aktif";
}

async function switchTrack(track, shouldPushState = true) {
  ADMIN_STATE.currentTrack = track;

  // 1. Update Tab Buttons UI
  ["articles", "nuansa-video", "temara-registrations", "pdf-modules", "donations"].forEach(t => {
    const tab = document.getElementById(`tab-btn-${t}`);
    if (tab) {
      tab.classList.remove("active-articles", "active-nuansa-video", "active-temara-registrations", "active-pdf-modules", "active-donations");
      if (t === track) {
        tab.classList.add(`active-${t}`);
      }
    }
  });

  // 2. Update Track Banner & Links
  const banner = document.getElementById("track-banner-info");
  const bannerTitle = document.getElementById("track-banner-title");
  const bannerDesc = document.getElementById("track-banner-desc");
  const visitBtn = document.getElementById("btn-visit-current-track");
  const linkPreview = document.getElementById("link-preview-page");
  const trackHeading = document.getElementById("current-track-heading");
  const btnReset = document.getElementById("btn-reset-default");
  const btnHeaderAddText = document.getElementById("btn-header-add-text");
  const btnCardAddText = document.getElementById("btn-card-add-text");

  if (banner) {
    banner.className = `track-banner track-banner-${track}`;
  }

  if (track === "articles") {
    // Mode Khusus: Manajemen Artikel & Jurnal Literasi
    if (bannerTitle) bannerTitle.textContent = "Pustaka Literasi & Jurnal Utama (Kelola Artikel & Foto)";
    if (bannerDesc) bannerDesc.textContent = "Kelola naskah tulisan, esai pemikiran kritis pemuda, dan jurnal 4 pilar (Moderasi, Kesetaraan, Budaya, Sosial). Anda dapat menyunting naskah yang kurang sesuai, mengganti foto sampul, menambah naskah baru, atau menghapus artikel yang tidak sesuai.";
    if (visitBtn) {
      visitBtn.href = "artikel.html";
      visitBtn.textContent = "Buka Portal Bacaan (artikel.html) →";
    }
    if (linkPreview) linkPreview.href = "artikel.html";
    if (trackHeading) trackHeading.textContent = "Daftar Naskah & Artikel Terpublikasi";
    if (btnHeaderAddText) btnHeaderAddText.textContent = "+ Tulis / Tambah Artikel Baru";
    if (btnCardAddText) btnCardAddText.textContent = "+ Tambah Artikel";
    if (btnReset) btnReset.style.display = "none";

    await renderArticlesInAdmin();
    return;
  }

  if (track === "nuansa-video") {
    // Mode Khusus: Pojok Video NUANSA (Terpisah dari silabus modul)
    if (bannerTitle) bannerTitle.textContent = "Pojok Video Edukasi Sosial-Keagamaan (Pilar NUANSA)";
    if (bannerDesc) bannerDesc.textContent = "Kelola video YouTube edukatif tentang moderasi beragama, kesetaraan gender, dan toleransi. Video yang diunggah di sini tampil di etalase Pojok Video NUANSA (bagian bawah halaman nuansa.html).";
    if (visitBtn) {
      visitBtn.href = "nuansa.html#video-edukasi";
      visitBtn.textContent = "Lihat Pojok Video di NUANSA →";
    }
    if (linkPreview) linkPreview.href = "nuansa.html#video-edukasi";
    if (trackHeading) trackHeading.textContent = "Daftar Video YouTube Aktif (Pojok NUANSA)";
    if (btnHeaderAddText) btnHeaderAddText.textContent = "+ Upload Video YouTube ke NUANSA";
    if (btnCardAddText) btnCardAddText.textContent = "+ Upload Video Baru";
    if (btnReset) btnReset.style.display = "none";

    renderNuansaVideosInAdmin();
    return;
  }

  if (track === "temara-registrations") {
    // Mode Khusus: Data Pendaftar Circle Mentoring Sebaya
    if (bannerTitle) bannerTitle.textContent = "Data Pendaftar Circle Mentoring Sebaya (Pilar TEMARA)";
    if (bannerDesc) bannerDesc.textContent = "Kelola data calon fasilitator dan peserta circle mentoring sebaya dari mahasiswa dan pemuda berbagai kampus. Anda dapat meninjau naskah motivasi, memperbarui status seleksi, dan menghubungi calon via WhatsApp.";
    if (visitBtn) {
      visitBtn.href = "temara.html#rekrutmen-fasilitator";
      visitBtn.textContent = "Buka Form di temara.html →";
    }
    if (linkPreview) linkPreview.href = "temara.html#rekrutmen-fasilitator";
    if (trackHeading) trackHeading.textContent = "Daftar Calon Fasilitator & Pendaftar Circle (TEMARA)";
    if (btnHeaderAddText) btnHeaderAddText.textContent = "Unduh Rekap CSV Pendaftar";
    if (btnCardAddText) btnCardAddText.textContent = "Ekspor CSV";
    if (btnReset) btnReset.style.display = "none";

    renderFacilitatorsInAdmin();
    return;
  }

  if (track === "pdf-modules") {
    // Mode Khusus: Manajemen Modul & Dokumen PDF 3 Pilar
    if (bannerTitle) bannerTitle.textContent = "Pusat Kelola Modul & Dokumen PDF (Pilar KARSA, NUANSA & TEMARA)";
    if (bannerDesc) bannerDesc.textContent = "Ganti atau perbarui dokumen PDF pilar secara bebas tanpa membebani kuota penyimpanan database. Menggunakan tautan Google Drive / Cloud Eksternal / Berkas Lokal dengan 0 Bytes penggunaan penyimpanan database cloud.";
    if (visitBtn) {
      visitBtn.href = "karsa.html#workspace-modul";
      visitBtn.textContent = "Lihat Penampil di KARSA →";
    }
    if (linkPreview) linkPreview.href = "karsa.html#workspace-modul";
    if (trackHeading) trackHeading.textContent = "Konfigurasi Dokumen Modul PDF 3 Pilar";
    if (btnHeaderAddText) btnHeaderAddText.textContent = "Simpan Semua Pengaturan Dokumen";
    if (btnCardAddText) btnCardAddText.textContent = "Simpan Modul PDF";
    if (btnReset) btnReset.style.display = "none";

    renderPdfModulesInAdmin();
    return;
  }

  if (track === "donations") {
    // Mode Khusus: Pengaturan Donasi & QRIS
    if (bannerTitle) bannerTitle.textContent = "Pengaturan Kanal Donasi Resmi, Rekening Bank & QRIS Nasional";
    if (bannerDesc) bannerDesc.textContent = "Atur nama rekening lembaga, nomor rekening bank, e-wallet, gambar QRIS, dan pesan peruntukan donasi. Konfigurasi ini otomatis tersinkronisasi dan tampil di modal pembayaran donasi pada halaman publik (aksara.html).";
    if (visitBtn) {
      visitBtn.href = "aksara.html#donasi-sosial";
      visitBtn.textContent = "Buka Halaman Donasi (aksara.html) →";
    }
    if (linkPreview) linkPreview.href = "aksara.html#donasi-sosial";
    if (trackHeading) trackHeading.textContent = "Konfigurasi Rekening & QRIS Donasi ARUTALA";
    if (btnHeaderAddText) btnHeaderAddText.textContent = "Simpan Pengaturan Donasi";
    if (btnCardAddText) btnCardAddText.textContent = "Simpan Donasi";
    if (btnReset) btnReset.style.display = "none";

    renderDonationsInAdmin();
    return;
  }

  // Mode Modul & Kuis Standar (KARSA / NUANSA / TEMARA)
  if (btnReset) btnReset.style.display = "inline-flex";
  if (btnHeaderAddText) btnHeaderAddText.textContent = "+ Tambah Modul / Kuis Baru";
  if (btnCardAddText) btnCardAddText.textContent = "+ Tambah Item";

  if (track === "karsa") {
    if (bannerTitle) bannerTitle.textContent = "Pilar KARSA: Ruang Pengembangan Diri (Kehendak & Daya Cipta)";
    if (bannerDesc) bannerDesc.textContent = "Struktur: Ringkasan materi per modul + Tombol Unduh PDF Lengkap + Slot Kuis Interaktif Terpadu di akhir.";
    if (visitBtn) {
      visitBtn.href = "karsa.html";
      visitBtn.textContent = "Buka Tampilan KARSA →";
    }
    if (linkPreview) linkPreview.href = "karsa.html";
    if (trackHeading) trackHeading.textContent = "Daftar Modul & Kuis Aktif (KARSA)";
  } else if (track === "nuansa") {
    if (bannerTitle) bannerTitle.textContent = "Pilar NUANSA: Ruang Kesadaran Sosial-Keagamaan (Kepekaan & Harmoni Nilai)";
    if (bannerDesc) bannerDesc.textContent = "Struktur Silabus: Ringkasan materi etika keagamaan + Unduh Modul PDF + Kuis Refleksi Etika.";
    if (visitBtn) {
      visitBtn.href = "nuansa.html";
      visitBtn.textContent = "Buka Tampilan NUANSA →";
    }
    if (linkPreview) linkPreview.href = "nuansa.html";
    if (trackHeading) trackHeading.textContent = "Daftar Silabus Modul & Kuis (NUANSA)";
  } else if (track === "temara") {
    if (bannerTitle) bannerTitle.textContent = "Pilar TEMARA: Ruang Tutor Sebaya (Lentera & Kawan Bermakna)";
    if (bannerDesc) bannerDesc.textContent = "Struktur: Perangkat Pelaksanaan & SOP Fasilitator Sebaya (Murni Modul & Lembar Aksi, Tanpa Kuis).";
    if (visitBtn) {
      visitBtn.href = "temara.html";
      visitBtn.textContent = "Buka Tampilan TEMARA →";
    }
    if (linkPreview) linkPreview.href = "temara.html";
    if (trackHeading) trackHeading.textContent = "Daftar Modul & Panduan Aktif (TEMARA)";
  }

  // 3. Load & Render Items
  await renderTrackItems(track);
}

// ----------------------------------------------------------------------------
// 3. RENDER MODULE LIST
// ----------------------------------------------------------------------------
async function renderTrackItems(track) {
  const container = document.getElementById("admin-modules-list");
  const countBadge = document.getElementById("track-items-count-badge");
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 40px; text-align: center; color: #64748B;">
      Memuat modul pilar ${track.toUpperCase()}...
    </div>
  `;

  const items = await window.ArutalaDB.fetchLmsItems(track);
  ADMIN_STATE.trackItems[track] = items;

  if (countBadge) {
    countBadge.textContent = `${items.length} Item Terdaftar`;
  }
  const trackTabBadge = document.getElementById(`badge-count-${track}`);
  if (trackTabBadge) {
    trackTabBadge.textContent = `${items.length} Item`;
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div style="padding: 50px 20px; text-align: center;">
        <p style="font-size: 1.1rem; font-weight: 700; color: #334155; margin-bottom: 8px;">Belum ada modul di pilar ini.</p>
        <p style="font-size: 0.88rem; color: #64748B; margin-bottom: 20px;">Klik tombol di bawah untuk menambahkan modul atau kuis baru.</p>
        <button type="button" class="btn-admin-primary" onclick="openCreateModal()">
          + Tambah Item Pertama
        </button>
      </div>
    `;
    return;
  }

  let html = "";
  items.forEach((item, index) => {
    const isQuiz = item.type === "quiz";
    const isVideo = item.type === "video";
    const orderNum = item.orderNum || (index + 1);
    const questionsCount = Array.isArray(item.questions) ? item.questions.length : 0;

    let badgeClass = "";
    let typeTag = "";
    if (isQuiz) {
      badgeClass = "badge-quiz";
      typeTag = `<span class="module-type-tag type-tag-quiz">Kuis Interaktif (${questionsCount} Soal)</span>`;
    } else if (isVideo) {
      badgeClass = "badge-video";
      typeTag = `<span class="module-type-tag type-tag-video">Video &amp; Materi</span>`;
    } else {
      typeTag = `<span class="module-type-tag type-tag-module">Modul Bacaan</span>`;
    }

    const summarySnippet = item.summary
      ? (item.summary.length > 170 ? item.summary.substring(0, 170) + "..." : item.summary)
      : "Belum ada ringkasan materi.";

    html += `
      <div class="module-item-row" data-id="${item.id}">
        <div class="module-left-col">
          <div class="module-order-badge ${badgeClass}" title="Urutan ke-${orderNum}">
            ${orderNum}
          </div>
          <div class="module-details">
            <div>
              ${typeTag}
              <span style="font-size: 0.74rem; font-weight: 700; color: #64748B; margin-left: 6px;">[${item.code || "MOD"}]</span>
            </div>
            <h4 class="module-title">${item.title}</h4>
            ${item.subtitle ? `<p class="module-subtitle">${item.subtitle}</p>` : ""}
            <div class="module-summary-snippet">
              <strong>Ringkasan:</strong> ${summarySnippet}
            </div>
            <div class="module-meta-chips">
              <span class="meta-chip">${item.duration || "45 Menit"}</span>
              ${item.docUrl ? `
                <span class="meta-chip">
                  <a href="${item.docUrl}" target="_blank" rel="noopener">
                    ${item.docName || "Unduh PDF Modul"}
                  </a>
                </span>
              ` : `<span class="meta-chip" style="color: #94A3B8;">Belum ada PDF</span>`}
              ${isVideo && item.videoUrl ? `
                <span class="meta-chip">
                  <a href="${item.videoUrl}" target="_blank" rel="noopener">Tonton Video</a>
                </span>
              ` : ""}
            </div>
          </div>
        </div>

        <div class="module-actions-col">
          <button type="button" class="btn-action-icon" onclick="moveItemOrder('${item.id}', -1)" title="Pindah ke Atas" ${index === 0 ? "disabled style='opacity:0.3;cursor:not-allowed;'" : ""}>
            ▲
          </button>
          <button type="button" class="btn-action-icon" onclick="moveItemOrder('${item.id}', 1)" title="Pindah ke Bawah" ${index === items.length - 1 ? "disabled style='opacity:0.3;cursor:not-allowed;'" : ""}>
            ▼
          </button>
          <button type="button" class="btn-action-edit" onclick="openEditModal('${item.id}')">
            Edit
          </button>
          <button type="button" class="btn-action-icon btn-delete" onclick="handleDeleteItem('${item.id}')" title="Hapus Modul">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ----------------------------------------------------------------------------
// 4. CREATE / EDIT MODAL & FORM BUILDER
// ----------------------------------------------------------------------------
function openCreateModal() {
  ADMIN_STATE.editingItemId = null;
  ADMIN_STATE.quizQuestions = [];

  const modal = document.getElementById("admin-module-modal");
  const form = document.getElementById("form-manage-module");
  if (form) form.reset();

  document.getElementById("modal-form-title").textContent = `Tambah Item Baru (${ADMIN_STATE.currentTrack.toUpperCase()})`;
  document.getElementById("modal-form-sub").textContent = "Tentukan apakah item ini berupa modul bacaan, materi video, atau kuis interaktif.";
  document.getElementById("field-item-id").value = "";
  document.getElementById("field-item-track").value = ADMIN_STATE.currentTrack;

  // Atur pilihan tipe yang diizinkan sesuai pilar
  setupTypePillsForTrack(ADMIN_STATE.currentTrack);

  // Default type: module
  selectContentType("module");

  // Prediksi nomor urut & kode
  const currentItems = ADMIN_STATE.trackItems[ADMIN_STATE.currentTrack] || [];
  const nextOrder = currentItems.length + 1;
  const prefix = ADMIN_STATE.currentTrack === "nuansa" ? "NUA" : (ADMIN_STATE.currentTrack === "temara" ? "TEM" : "MOD");
  document.getElementById("field-item-code").value = `${prefix}-${String(nextOrder).padStart(2, "0")}`;
  document.getElementById("field-item-duration").value = "45 Menit";

  if (modal) modal.classList.add("active");
}

async function openEditModal(itemId) {
  ADMIN_STATE.editingItemId = itemId;
  const items = ADMIN_STATE.trackItems[ADMIN_STATE.currentTrack] || [];
  const item = items.find(i => String(i.id) === String(itemId));
  if (!item) return;

  const modal = document.getElementById("admin-module-modal");
  document.getElementById("modal-form-title").textContent = `Edit: ${item.title}`;
  document.getElementById("modal-form-sub").textContent = `Ubah isi ringkasan materi, tautan berkas, atau butir kuis di pilar ${ADMIN_STATE.currentTrack.toUpperCase()}.`;

  document.getElementById("field-item-id").value = item.id;
  document.getElementById("field-item-track").value = item.track || ADMIN_STATE.currentTrack;
  document.getElementById("field-item-code").value = item.code || "";
  document.getElementById("field-item-duration").value = item.duration || "45 Menit";
  document.getElementById("field-item-title").value = item.title || "";
  document.getElementById("field-item-subtitle").value = item.subtitle || "";
  document.getElementById("field-item-summary").value = item.summary || "";
  document.getElementById("field-item-docurl").value = item.docUrl || "";
  document.getElementById("field-item-docname").value = item.docName || "";
  document.getElementById("field-item-docsize").value = item.docSize || "";
  document.getElementById("field-item-videourl").value = item.videoUrl || "";

  setupTypePillsForTrack(ADMIN_STATE.currentTrack);
  selectContentType(item.type || "module");

  // Salin questions jika quiz
  ADMIN_STATE.quizQuestions = Array.isArray(item.questions) ? JSON.parse(JSON.stringify(item.questions)) : [];
  renderQuizQuestionsInModal();

  if (modal) modal.classList.add("active");
}

function closeModuleModal() {
  const modal = document.getElementById("admin-module-modal");
  if (modal) modal.classList.remove("active");
  ADMIN_STATE.editingItemId = null;
  ADMIN_STATE.quizQuestions = [];
}

function setupTypePillsForTrack(track) {
  const btnVideo = document.getElementById("btn-type-video");
  const btnQuiz = document.getElementById("btn-type-quiz");

  // Video dikelola khusus di tab "VIDEO EDUKASI NUANSA", bukan di kurikulum modul
  if (btnVideo) btnVideo.style.display = "none";

  // Di Temara: TIDAK ADA KUIS (sesuai request user)
  if (track === "temara") {
    if (btnQuiz) btnQuiz.style.display = "none";
  } else { // karsa & nuansa
    if (btnQuiz) btnQuiz.style.display = "block";
  }
}

function selectContentType(type) {
  ADMIN_STATE.selectedType = type;

  // Update pills UI
  ["module", "video", "quiz"].forEach(t => {
    const btn = document.getElementById(`btn-type-${t}`);
    if (btn) {
      if (t === type) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  });

  const secPdf = document.getElementById("section-pdf-download");
  const secVideo = document.getElementById("section-video-embed");
  const secQuiz = document.getElementById("section-quiz-builder");

  if (type === "quiz") {
    if (secPdf) secPdf.style.display = "none";
    if (secVideo) secVideo.style.display = "none";
    if (secQuiz) secQuiz.style.display = "block";

    // Auto-adjust default label if new
    if (!ADMIN_STATE.editingItemId) {
      document.getElementById("field-item-code").value = "KUIS-01";
      document.getElementById("field-item-duration").value = "15 Menit Kuis";
      if (ADMIN_STATE.quizQuestions.length === 0) {
        addQuizQuestionField();
      }
    }
  } else if (type === "video") {
    if (secPdf) secPdf.style.display = "block";
    if (secVideo) secVideo.style.display = "block";
    if (secQuiz) secQuiz.style.display = "none";
  } else { // module
    if (secPdf) secPdf.style.display = "block";
    if (secVideo) secVideo.style.display = "none";
    if (secQuiz) secQuiz.style.display = "none";
  }
}

// ----------------------------------------------------------------------------
// 5. QUIZ QUESTIONS BUILDER
// ----------------------------------------------------------------------------
function addQuizQuestionField() {
  const newQuestion = {
    id: Date.now(),
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: ""
  };
  ADMIN_STATE.quizQuestions.push(newQuestion);
  renderQuizQuestionsInModal();
}

function removeQuizQuestionField(index) {
  if (ADMIN_STATE.quizQuestions.length <= 1) {
    alert("Minimal harus ada 1 butir soal untuk kuis.");
    return;
  }
  ADMIN_STATE.quizQuestions.splice(index, 1);
  renderQuizQuestionsInModal();
}

function renderQuizQuestionsInModal() {
  const container = document.getElementById("quiz-questions-list");
  if (!container) return;

  if (ADMIN_STATE.quizQuestions.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #64748B;">
        Belum ada butir soal. Klik "+ Tambah Butir Soal" di atas.
      </div>
    `;
    return;
  }

  let html = "";
  ADMIN_STATE.quizQuestions.forEach((q, qIdx) => {
    html += `
      <div class="quiz-question-card" data-qindex="${qIdx}">
        <div class="quiz-question-header">
          <strong>Soal Butir #${qIdx + 1}</strong>
          <button type="button" class="btn-remove-question" onclick="removeQuizQuestionField(${qIdx})">
            Hapus Soal
          </button>
        </div>

        <div class="admin-form-group" style="margin-bottom: 10px;">
          <label style="font-size: 0.8rem;">Teks Pertanyaan *</label>
          <input type="text" class="admin-form-control q-input-text" data-qindex="${qIdx}" placeholder="Contoh: Apa tujuan utama dari prinsip self-compassion?" value="${escapeHtml(q.question || "")}" required>
        </div>

        <div style="font-size: 0.78rem; font-weight: 700; color: #334155; margin-bottom: 4px;">
          Pilihan Jawaban (Pilih Radio Button untuk Jawaban Benar):
        </div>

        <div class="quiz-opt-grid">
          ${[0, 1, 2, 3].map(optIdx => `
            <div class="quiz-opt-item">
              <input type="radio" name="correct_opt_${qIdx}" value="${optIdx}" ${Number(q.correctIndex) === optIdx ? "checked" : ""} title="Tandai sebagai jawaban benar" onchange="updateCorrectAnswer(${qIdx}, ${optIdx})">
              <span style="font-weight: 800; font-size: 0.8rem; color: #64748B;">${String.fromCharCode(65 + optIdx)}:</span>
              <input type="text" class="q-opt-input" data-qindex="${qIdx}" data-optindex="${optIdx}" placeholder="Pilihan ${String.fromCharCode(65 + optIdx)}" value="${escapeHtml((q.options && q.options[optIdx]) || "")}" required>
            </div>
          `).join("")}
        </div>

        <div class="admin-form-group" style="margin-bottom: 0;">
          <label style="font-size: 0.76rem; color: #64748B;">Pembahasan Jawaban Benar (Muncul setelah kuis dijawab)</label>
          <input type="text" class="admin-form-control q-input-expl" data-qindex="${qIdx}" placeholder="Contoh: Self-compassion adalah sikap welas asih pada diri sendiri untuk bertumbuh positif." value="${escapeHtml(q.explanation || "")}">
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Bind input events to update state
  container.querySelectorAll(".q-input-text").forEach(input => {
    input.addEventListener("input", (e) => {
      const idx = Number(e.target.dataset.qindex);
      if (ADMIN_STATE.quizQuestions[idx]) {
        ADMIN_STATE.quizQuestions[idx].question = e.target.value;
      }
    });
  });

  container.querySelectorAll(".q-opt-input").forEach(input => {
    input.addEventListener("input", (e) => {
      const qIdx = Number(e.target.dataset.qindex);
      const optIdx = Number(e.target.dataset.optindex);
      if (ADMIN_STATE.quizQuestions[qIdx]) {
        if (!ADMIN_STATE.quizQuestions[qIdx].options) {
          ADMIN_STATE.quizQuestions[qIdx].options = ["", "", "", ""];
        }
        ADMIN_STATE.quizQuestions[qIdx].options[optIdx] = e.target.value;
      }
    });
  });

  container.querySelectorAll(".q-input-expl").forEach(input => {
    input.addEventListener("input", (e) => {
      const idx = Number(e.target.dataset.qindex);
      if (ADMIN_STATE.quizQuestions[idx]) {
        ADMIN_STATE.quizQuestions[idx].explanation = e.target.value;
      }
    });
  });
}

function updateCorrectAnswer(qIndex, optIndex) {
  if (ADMIN_STATE.quizQuestions[qIndex]) {
    ADMIN_STATE.quizQuestions[qIndex].correctIndex = Number(optIndex);
  }
}

// ----------------------------------------------------------------------------
// 6. SAVE & DELETE HANDLERS
// ----------------------------------------------------------------------------
async function handleSaveModule(event) {
  event.preventDefault();
  const submitBtn = document.getElementById("btn-save-module-submit");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Menyimpan ke Cloud...";
  }

  try {
    const track = document.getElementById("field-item-track").value || ADMIN_STATE.currentTrack;
    const itemId = document.getElementById("field-item-id").value;
    const type = ADMIN_STATE.selectedType || "module";

    // Siapkan data pertanyaan jika quiz
    let questions = [];
    if (type === "quiz") {
      // Sync form values
      const container = document.getElementById("quiz-questions-list");
      if (container) {
        container.querySelectorAll(".q-input-text").forEach(input => {
          const idx = Number(input.dataset.qindex);
          if (ADMIN_STATE.quizQuestions[idx]) ADMIN_STATE.quizQuestions[idx].question = input.value.trim();
        });
        container.querySelectorAll(".q-opt-input").forEach(input => {
          const qIdx = Number(input.dataset.qindex);
          const optIdx = Number(input.dataset.optindex);
          if (ADMIN_STATE.quizQuestions[qIdx]) ADMIN_STATE.quizQuestions[qIdx].options[optIdx] = input.value.trim();
        });
        container.querySelectorAll(".q-input-expl").forEach(input => {
          const idx = Number(input.dataset.qindex);
          if (ADMIN_STATE.quizQuestions[idx]) ADMIN_STATE.quizQuestions[idx].explanation = input.value.trim();
        });
      }
      questions = ADMIN_STATE.quizQuestions.filter(q => q.question && q.options && q.options.some(o => o.trim() !== ""));
    }

    // Tentukan orderNum
    let orderNum = 1;
    const currentItems = ADMIN_STATE.trackItems[track] || [];
    if (itemId) {
      const existing = currentItems.find(i => String(i.id) === String(itemId));
      orderNum = existing ? existing.orderNum : currentItems.length;
    } else {
      orderNum = currentItems.length + 1;
    }

    const payload = {
      id: itemId || `${track}-item-${Date.now()}`,
      track: track,
      type: type,
      orderNum: orderNum,
      code: document.getElementById("field-item-code").value.trim(),
      title: document.getElementById("field-item-title").value.trim(),
      subtitle: document.getElementById("field-item-subtitle").value.trim(),
      duration: document.getElementById("field-item-duration").value.trim(),
      summary: document.getElementById("field-item-summary").value.trim(),
      docUrl: document.getElementById("field-item-docurl")?.value?.trim() || "",
      docName: document.getElementById("field-item-docname")?.value?.trim() || `${document.getElementById("field-item-title").value.trim()}.pdf`,
      docSize: document.getElementById("field-item-docsize")?.value?.trim() || "PDF Dokumen",
      videoUrl: formatVideoUrl(document.getElementById("field-item-videourl")?.value?.trim() || ""),
      questions: questions
    };

    await window.ArutalaDB.saveLmsItem(payload);

    closeModuleModal();
    showToast(`Modul "${payload.title}" berhasil disimpan!`, "success");
    await renderTrackItems(track);
  } catch (err) {
    console.error("Gagal menyimpan modul:", err);
    alert("Terjadi kesalahan saat menyimpan modul: " + (err.message || err));
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Simpan Modul / Kuis";
    }
  }
}

async function handleDeleteItem(id) {
  const items = ADMIN_STATE.trackItems[ADMIN_STATE.currentTrack] || [];
  const item = items.find(i => String(i.id) === String(id));
  const title = item ? item.title : "item ini";

  if (confirm(`Apakah kamu yakin ingin menghapus "${title}"?`)) {
    try {
      await window.ArutalaDB.deleteLmsItem(id, ADMIN_STATE.currentTrack);
      showToast(`"${title}" berhasil dihapus.`, "success");
      await renderTrackItems(ADMIN_STATE.currentTrack);
    } catch (err) {
      console.error("Gagal menghapus modul:", err);
      alert("Gagal menghapus modul.");
    }
  }
}

async function moveItemOrder(id, direction) {
  const track = ADMIN_STATE.currentTrack;
  const items = ADMIN_STATE.trackItems[track] || [];
  const currentIndex = items.findIndex(i => String(i.id) === String(id));
  if (currentIndex < 0) return;

  const targetIndex = currentIndex + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return;

  // Swap
  const temp = items[currentIndex];
  items[currentIndex] = items[targetIndex];
  items[targetIndex] = temp;

  // Re-index orderNum
  items.forEach((it, idx) => {
    it.orderNum = idx + 1;
    if (it.type !== "quiz" && !it.code.startsWith("KUIS")) {
      const prefix = track === "nuansa" ? "NUA" : (track === "temara" ? "TEM" : "MOD");
      it.code = `${prefix}-${String(idx + 1).padStart(2, "0")}`;
    }
  });

  // Simpan ulang semua
  try {
    for (const it of items) {
      await window.ArutalaDB.saveLmsItem(it);
    }
    showToast("Urutan modul berhasil diperbarui!", "success");
    await renderTrackItems(track);
  } catch (err) {
    console.error("Gagal memperbarui urutan:", err);
  }
}

async function handleResetDefaults() {
  const track = ADMIN_STATE.currentTrack;
  if (confirm(`Apakah kamu yakin ingin mereset seluruh modul pilar ${track.toUpperCase()} ke draf default awal? Semua perubahan custom akan ditimpa.`)) {
    try {
      await window.ArutalaDB.resetLmsTrackToDefault(track);
      showToast(`Modul ${track.toUpperCase()} berhasil direset ke default!`, "success");
      await renderTrackItems(track);
    } catch (e) {
      alert("Gagal mereset ke default.");
    }
  }
}

// ----------------------------------------------------------------------------
// 7. UTILS & HELPERS
// ----------------------------------------------------------------------------
function formatVideoUrl(url) {
  if (!url) return "";
  // Ubah link youtube watch (https://www.youtube.com/watch?v=ID) jadi embed (https://www.youtube.com/embed/ID)
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message, type = "normal") {
  const toast = document.getElementById("admin-toast");
  const toastText = document.getElementById("admin-toast-text");
  if (!toast) return;

  if (toastText) toastText.textContent = message;
  toast.className = `admin-toast ${type}`;
  toast.style.display = "flex";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}

// ----------------------------------------------------------------------------
// 8. KHUSUS ADMIN: POJOK VIDEO EDUKASI NUANSA
// ----------------------------------------------------------------------------
function handleHeaderAddAction() {
  if (ADMIN_STATE.currentTrack === "nuansa-video") {
    openCreateNuansaVideoModal();
  } else if (ADMIN_STATE.currentTrack === "articles") {
    openAdminArticleModal();
  } else if (ADMIN_STATE.currentTrack === "temara-registrations") {
    handleExportFacilitatorCSV();
  } else if (ADMIN_STATE.currentTrack === "pdf-modules") {
    handleSaveAllPdfSettings();
  } else if (ADMIN_STATE.currentTrack === "donations") {
    handleSaveDonationSettings();
  } else {
    openCreateModal();
  }
}

async function renderNuansaVideosInAdmin() {
  const container = document.getElementById("admin-modules-list");
  const countBadge = document.getElementById("track-items-count-badge");
  if (!container) return;

  // Indikator memuat data cloud
  if (!window.ARUTALA_CACHED_VIDEOS || window.ARUTALA_CACHED_VIDEOS.length === 0) {
    container.innerHTML = `
      <div style="padding: 40px 20px; text-align: center; color: #64748B;">
        <div style="font-size: 1.5rem; margin-bottom: 8px;">⏳</div>
        <p style="font-size: 0.9rem; font-weight: 600;">Menghubungkan & memuat video dari Cloud Database...</p>
      </div>
    `;
  }

  let videoList = [];
  if (window.ArutalaDB && typeof window.ArutalaDB.fetchNuansaVideos === "function") {
    try {
      videoList = await window.ArutalaDB.fetchNuansaVideos();
      window.ARUTALA_CACHED_VIDEOS = videoList;
    } catch (e) {
      videoList = getNuansaVideosList();
    }
  } else {
    videoList = getNuansaVideosList();
  }
  window.ARUTALA_CACHED_VIDEOS = videoList;

  if (countBadge) countBadge.textContent = `${videoList.length} Video Tayang`;

  const videoBadge = document.getElementById("badge-count-nuansa-video");
  if (videoBadge) videoBadge.textContent = `${videoList.length} Video`;

  if (videoList.length === 0) {
    container.innerHTML = `
      <div style="padding: 50px 20px; text-align: center; color: #64748B;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: #F1F5F9; color: #475569; display: inline-flex; align-items: center; justify-content: center; font-size: 1.2rem; margin-bottom: 10px;">▶</div>
        <h4 style="font-size: 1.15rem; color: #0F172A; margin: 0 0 6px; font-weight: 800;">Belum Ada Video Edukasi di Pojok NUANSA</h4>
        <p style="font-size: 0.88rem; max-width: 500px; margin: 0 auto 20px; line-height: 1.55;">
          Unggah video YouTube edukatif pertama untuk mengisi galeri Pojok Video di bagian bawah halaman pilar NUANSA (nuansa.html).
        </p>
        <button type="button" class="btn-admin-primary" style="background: #BE185D; border-color: #BE185D;" onclick="openCreateNuansaVideoModal()">
          + Upload Video YouTube Sekarang
        </button>
      </div>
    `;
    return;
  }

  let html = `<div style="display: flex; flex-direction: column;">`;

  videoList.forEach((vid, index) => {
    const thumb = vid.thumbnail || `https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`;
    html += `
      <div class="module-row-item" style="display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid #E2E8F0; gap: 18px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 16px; flex: 1; min-width: 290px;">
          <!-- Thumbnail with play trigger -->
          <div style="position: relative; width: 140px; height: 80px; border-radius: 8px; overflow: hidden; background: #0F172A; flex-shrink: 0; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.12);" onclick="openAdminVideoPlayer('${vid.videoUrl}', '${encodeURIComponent(vid.title)}')">
            <img src="${thumb}" onerror="this.src='img/pelatihan_fasilitator_auditorium.jpg'" alt="${escapeHtml(vid.title)}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.88;">
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(190, 24, 93, 0.9); color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; border: 1.5px solid #FFF;">
                ▶
              </div>
            </div>
          </div>

          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
              <span style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; background: #FCE7F3; color: #BE185D; padding: 2px 8px; border-radius: 4px;">
                ${escapeHtml(vid.category || 'Moderasi & Gender')}
              </span>
              <span style="font-size: 0.74rem; color: #64748B;">
                Kanal: <strong style="color: #334155;">${escapeHtml(vid.channel || 'Inisiator Pemuda')}</strong>
              </span>
              <span style="font-size: 0.72rem; color: #94A3B8;">| ID: <code>${escapeHtml(vid.youtubeId)}</code></span>
              ${vid.isFromCloud ? '<span style="font-size: 0.68rem; font-weight: 700; background: #ECFDF5; color: #059669; padding: 1px 6px; border-radius: 3px;">Cloud Sync</span>' : ''}
            </div>

            <h4 style="font-size: 1rem; font-weight: 700; color: #0F172A; margin: 0 0 6px; line-height: 1.35;">
              ${escapeHtml(vid.title)}
            </h4>

            <p style="font-size: 0.82rem; color: #64748B; margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${escapeHtml(vid.takeaways || 'Poin pembelajaran video edukasi pilar NUANSA.')}
            </p>
          </div>
        </div>

        <div class="module-actions-col">
          <button type="button" class="btn-action-edit" style="color: #1E40AF; border-color: #BFDBFE; background: #EFF6FF;" onclick="openAdminVideoPlayer('${vid.videoUrl}', '${encodeURIComponent(vid.title)}')">
            ▶ Tonton
          </button>
          <button type="button" class="btn-action-edit" onclick="openCreateNuansaVideoModal('${vid.id}')">
            Edit
          </button>
          <button type="button" class="btn-action-icon btn-delete" onclick="handleDeleteNuansaVideo('${vid.id}', '${encodeURIComponent(vid.title)}')" title="Hapus Video dari Pojok NUANSA">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

function openCreateNuansaVideoModal(id = null) {
  const modal = document.getElementById("admin-nuansa-video-modal");
  const form = document.getElementById("form-manage-nuansa-video");
  const previewBox = document.getElementById("admin-video-preview-box");
  const previewThumb = document.getElementById("admin-video-preview-thumb");
  const titleEl = document.getElementById("modal-nuansa-video-title");
  const subEl = document.getElementById("modal-nuansa-video-sub");

  if (form) form.reset();
  if (previewBox) previewBox.style.display = "none";

  if (id) {
    const list = (Array.isArray(window.ARUTALA_CACHED_VIDEOS) && window.ARUTALA_CACHED_VIDEOS.length > 0)
      ? window.ARUTALA_CACHED_VIDEOS
      : getNuansaVideosList();
    const item = list.find(v => String(v.id) === String(id));
    if (item) {
      if (titleEl) titleEl.textContent = "Edit Video Edukasi NUANSA";
      if (subEl) subEl.textContent = `Ubah data video "${item.title}".`;
      document.getElementById("field-nuansa-video-id").value = item.id;
      document.getElementById("field-nuansa-video-url").value = `https://www.youtube.com/watch?v=${item.youtubeId}`;
      document.getElementById("field-nuansa-video-name").value = item.title;
      document.getElementById("field-nuansa-video-channel").value = item.channel || "";
      document.getElementById("field-nuansa-video-cat").value = item.category || "Moderasi & Gender";
      document.getElementById("field-nuansa-video-takeaways").value = item.takeaways || "";

      if (previewBox && previewThumb && item.youtubeId) {
        previewThumb.src = `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
        previewBox.style.display = "flex";
      }
    }
  } else {
    if (titleEl) titleEl.textContent = "Upload Video YouTube ke Pojok NUANSA";
    if (subEl) subEl.textContent = "Konten video ini akan langsung tersimpan di Cloud Database Supabase & tampil di semua browser!";
    document.getElementById("field-nuansa-video-id").value = "";
  }

  if (modal) modal.classList.add("active");
}

function closeNuansaVideoModal() {
  const modal = document.getElementById("admin-nuansa-video-modal");
  if (modal) modal.classList.remove("active");
  const form = document.getElementById("form-manage-nuansa-video");
  if (form) form.reset();
  const previewBox = document.getElementById("admin-video-preview-box");
  if (previewBox) previewBox.style.display = "none";
}

async function handleSaveNuansaVideo(e) {
  e.preventDefault();
  const idField = document.getElementById("field-nuansa-video-id").value;
  const urlVal = document.getElementById("field-nuansa-video-url").value.trim();
  const titleVal = document.getElementById("field-nuansa-video-name").value.trim();
  const channelVal = document.getElementById("field-nuansa-video-channel").value.trim();
  const catVal = document.getElementById("field-nuansa-video-cat").value;
  const takeawaysVal = document.getElementById("field-nuansa-video-takeaways").value.trim();

  // Helper YouTube ID
  let ytId = null;
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = urlVal.match(regExp);
  if (match && match[1]) {
    ytId = match[1];
  } else {
    const fallback = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const fbMatch = urlVal.match(fallback);
    if (fbMatch && fbMatch[2] && fbMatch[2].length === 11) ytId = fbMatch[2];
  }

  if (!ytId) {
    alert("Format link YouTube tidak valid! Mohon masukkan tautan video YouTube yang benar.");
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Menyimpan ke Cloud...";
  }

  const videoObj = {
    id: idField || null,
    youtubeId: ytId,
    title: titleVal,
    channel: channelVal,
    duration: "Video Edukasi",
    thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    takeaways: takeawaysVal,
    category: catVal,
    videoUrl: `https://www.youtube.com/embed/${ytId}`
  };

  // Simpan ke Supabase Cloud
  if (window.ArutalaDB && typeof window.ArutalaDB.saveNuansaVideo === "function") {
    try {
      await window.ArutalaDB.saveNuansaVideo(videoObj);
    } catch (err) {
      console.warn("Gagal simpan video ke Supabase Cloud:", err);
    }
  } else {
    // Fallback lokal jika database offline
    let customVideos = [];
    try {
      customVideos = JSON.parse(localStorage.getItem("arutala_custom_videos") || "[]");
    } catch (err) {
      customVideos = [];
    }
    if (idField) {
      const idx = customVideos.findIndex(v => String(v.id) === String(idField));
      if (idx !== -1) customVideos[idx] = videoObj;
      else customVideos.unshift(videoObj);
    } else {
      videoObj.id = "vid-" + Date.now();
      customVideos.unshift(videoObj);
    }
    localStorage.setItem("arutala_custom_videos", JSON.stringify(customVideos));
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Simpan Video";
  }

  closeNuansaVideoModal();
  showToast("Video edukasi berhasil disimpan ke Cloud Database & disinkronkan!", "success");
  await renderNuansaVideosInAdmin();
}

async function handleDeleteNuansaVideo(id, encodedTitle) {
  const title = decodeURIComponent(encodedTitle || "Video");
  if (!confirm(`Apakah Anda yakin ingin menghapus video "${title}" dari Pojok NUANSA?`)) {
    return;
  }

  if (window.ArutalaDB && typeof window.ArutalaDB.deleteNuansaVideo === "function") {
    try {
      await window.ArutalaDB.deleteNuansaVideo(id);
    } catch (err) {
      console.warn("Gagal hapus video dari Supabase:", err);
    }
  } else {
    try {
      let customVideos = JSON.parse(localStorage.getItem("arutala_custom_videos") || "[]");
      customVideos = customVideos.filter(v => String(v.id) !== String(id));
      localStorage.setItem("arutala_custom_videos", JSON.stringify(customVideos));
    } catch (e) {}
    try {
      let karsaVideos = JSON.parse(localStorage.getItem("arutala_karsa_custom_videos") || "[]");
      karsaVideos = karsaVideos.filter(v => String(v.id) !== String(id));
      localStorage.setItem("arutala_karsa_custom_videos", JSON.stringify(karsaVideos));
    } catch (e) {}
  }

  showToast("Video berhasil dihapus dari Database Cloud & Pojok NUANSA.", "normal");
  await renderNuansaVideosInAdmin();
}

function openAdminVideoPlayer(url, encodedTitle) {
  const modal = document.getElementById("admin-video-player-modal");
  const iframe = document.getElementById("admin-player-iframe");
  const titleEl = document.getElementById("admin-player-title");

  if (!modal || !iframe) return;

  if (titleEl) titleEl.textContent = decodeURIComponent(encodedTitle || "Pratinjau Video");
  iframe.src = url.includes("autoplay=1") ? url : `${url}?autoplay=1`;
  modal.classList.add("active");
}

function closeAdminVideoPlayer() {
  const modal = document.getElementById("admin-video-player-modal");
  const iframe = document.getElementById("admin-player-iframe");
  if (iframe) iframe.src = "";
  if (modal) modal.classList.remove("active");
}

function setupAdminVideoUrlListener() {
  const urlInput = document.getElementById("field-nuansa-video-url");
  const previewBox = document.getElementById("admin-video-preview-box");
  const previewThumb = document.getElementById("admin-video-preview-thumb");

  if (urlInput && previewBox && previewThumb) {
    const handleInput = () => {
      const val = urlInput.value.trim();
      let ytId = null;
      const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = val.match(regExp);
      if (match && match[1]) {
        ytId = match[1];
      } else {
        const fallback = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const fbMatch = val.match(fallback);
        if (fbMatch && fbMatch[2] && fbMatch[2].length === 11) ytId = fbMatch[2];
      }

      if (ytId) {
        previewThumb.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        previewBox.style.display = "flex";
      } else {
        previewBox.style.display = "none";
      }
    };

    urlInput.addEventListener("input", handleInput);
    urlInput.addEventListener("change", handleInput);
    urlInput.addEventListener("paste", () => setTimeout(handleInput, 50));
  }
}

// ----------------------------------------------------------------------------
// 9. KHUSUS ADMIN: MANAJEMEN ARTIKEL, NASKAH LITERASI & FOTO SAMPUL
// ----------------------------------------------------------------------------

function refreshAdminArticlesCache() {
  let customArticles = [];
  try {
    customArticles = JSON.parse(localStorage.getItem("arutala_custom_articles") || "[]");
  } catch (e) {
    customArticles = [];
  }

  let deletedIds = [];
  try {
    deletedIds = JSON.parse(localStorage.getItem("arutala_deleted_articles") || "[]");
  } catch (e) {
    deletedIds = [];
  }

  const cloudArticles = Array.isArray(window.ARUTALA_CLOUD_ARTICLES)
    ? window.ARUTALA_CLOUD_ARTICLES
    : [];

  const defaultArticles = (window.ARUTALA_DATA && Array.isArray(window.ARUTALA_DATA.articles))
    ? window.ARUTALA_DATA.articles
    : [];

  // Urutan prioritas: customArticles (diedit admin lokal), cloudArticles (database Supabase), defaultArticles (statis)
  const merged = [
    ...customArticles,
    ...cloudArticles,
    ...defaultArticles
  ];

  const uniqueMap = new Map();
  merged.forEach(item => {
    const key = String(item.id || item.title).trim().toLowerCase();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  });

  window.ARUTALA_CACHED_ARTICLES = Array.from(uniqueMap.values()).filter(art => !deletedIds.includes(String(art.id)));
  return window.ARUTALA_CACHED_ARTICLES;
}

function getAdminArticlesList() {
  if (Array.isArray(window.ARUTALA_CACHED_ARTICLES) && window.ARUTALA_CACHED_ARTICLES.length > 0) {
    return window.ARUTALA_CACHED_ARTICLES;
  }
  return refreshAdminArticlesCache();
}

function getArticleCategoryBadgeStyle(category) {
  switch ((category || "").toLowerCase()) {
    case "pandai":
    case "moderasi":
      return "background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0;";
    case "bersuara":
    case "kesetaraan":
      return "background: #FCE7F3; color: #BE185D; border: 1px solid #FBCFE8;";
    case "cerdas":
    case "budaya":
      return "background: #E0F2FE; color: #0369A1; border: 1px solid #BAE6FD;";
    case "berdaya":
    case "sosial":
      return "background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;";
    default:
      return "background: #EEF2FF; color: #3730A3; border: 1px solid #C7D2FE;";
  }
}

function getArticleCategoryText(category) {
  switch ((category || "").toLowerCase()) {
    case "pandai":
    case "moderasi":
      return "Moderasi Beragama";
    case "bersuara":
    case "kesetaraan":
      return "Kesetaraan Gender";
    case "cerdas":
    case "budaya":
      return "Budaya Nusantara";
    case "berdaya":
    case "sosial":
      return "Sosial Masyarakat";
    default:
      return (category || "MODERASI BERAGAMA").toUpperCase();
  }
}

async function renderArticlesInAdmin() {
  const container = document.getElementById("admin-modules-list");
  const countBadge = document.getElementById("track-items-count-badge");
  if (!container) return;

  // Pastikan data artikel dari Cloud Supabase termuat
  if (!window.ARUTALA_CLOUD_ARTICLES && window.ArutalaDB && typeof window.ArutalaDB.fetchArticles === "function") {
    try {
      window.ARUTALA_CLOUD_ARTICLES = await window.ArutalaDB.fetchArticles();
    } catch (e) {
      console.warn("Notice fetch cloud articles admin:", e);
    }
  }
  refreshAdminArticlesCache();

  const allArticles = getAdminArticlesList();
  const articlesBadge = document.getElementById("badge-count-articles");
  if (articlesBadge) articlesBadge.textContent = `${allArticles.length} Artikel`;

  const currentCat = ADMIN_STATE.articlesCategoryFilter || "all";
  const query = (ADMIN_STATE.articlesSearchQuery || "").toLowerCase();

  const filtered = allArticles.filter(art => {
    const matchCat = (currentCat === "all") || ((art.category || "").toLowerCase() === currentCat.toLowerCase());
    const matchSearch = !query ||
      (art.title && art.title.toLowerCase().includes(query)) ||
      (art.author && art.author.toLowerCase().includes(query)) ||
      (art.summary && art.summary.toLowerCase().includes(query));
    return matchCat && matchSearch;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} dari ${allArticles.length} Naskah`;
  }

  // Toolbar Filter Kategori & Input Pencarian
  let html = `
    <div style="padding: 16px 22px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
      <!-- Category Filter Pills -->
      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
        <button type="button" class="btn-action-edit" style="border-radius: 999px; padding: 4px 12px; font-size: 0.76rem; ${currentCat === 'all' ? 'background: #3730A3; color: #FFF; border-color: #3730A3;' : 'background: #FFF;'}" onclick="filterAdminArticlesCategory('all')">
          Semua (${allArticles.length})
        </button>
        <button type="button" class="btn-action-edit" style="border-radius: 999px; padding: 4px 12px; font-size: 0.76rem; ${currentCat === 'pandai' ? 'background: #059669; color: #FFF; border-color: #059669;' : 'background: #FFF; color: #059669;'}" onclick="filterAdminArticlesCategory('pandai')">
          Moderasi Beragama
        </button>
        <button type="button" class="btn-action-edit" style="border-radius: 999px; padding: 4px 12px; font-size: 0.76rem; ${currentCat === 'bersuara' ? 'background: #DB2777; color: #FFF; border-color: #DB2777;' : 'background: #FFF; color: #DB2777;'}" onclick="filterAdminArticlesCategory('bersuara')">
          Kesetaraan Gender
        </button>
        <button type="button" class="btn-action-edit" style="border-radius: 999px; padding: 4px 12px; font-size: 0.76rem; ${currentCat === 'cerdas' ? 'background: #0284C7; color: #FFF; border-color: #0284C7;' : 'background: #FFF; color: #0284C7;'}" onclick="filterAdminArticlesCategory('cerdas')">
          Budaya Nusantara
        </button>
        <button type="button" class="btn-action-edit" style="border-radius: 999px; padding: 4px 12px; font-size: 0.76rem; ${currentCat === 'berdaya' ? 'background: #D97706; color: #FFF; border-color: #D97706;' : 'background: #FFF; color: #D97706;'}" onclick="filterAdminArticlesCategory('berdaya')">
          Sosial Masyarakat
        </button>
      </div>

      <!-- Quick Search Input -->
      <div style="flex: 1; max-width: 290px; min-width: 200px;">
        <input type="text" id="admin-articles-search-input" class="admin-form-control" style="padding: 6px 12px; font-size: 0.82rem;" placeholder="Cari judul atau nama penulis..." value="${escapeHtml(ADMIN_STATE.articlesSearchQuery || '')}" oninput="handleAdminArticleSearch(event)">
      </div>
    </div>
  `;

  if (filtered.length === 0) {
    html += `
      <div style="padding: 60px 20px; text-align: center; color: #64748B;">
        <h4 style="font-size: 1.15rem; color: #0F172A; margin: 0 0 6px; font-weight: 800;">Tidak Ada Naskah Artikel</h4>
        <p style="font-size: 0.88rem; max-width: 480px; margin: 0 auto 20px; line-height: 1.55;">
          ${allArticles.length === 0 ? 'Belum ada artikel yang terdaftar. Tambahkan naskah tulisan baru sekarang.' : 'Tidak ditemukan artikel yang sesuai dengan filter atau kata kunci pencarian.'}
        </p>
        <button type="button" class="btn-admin-primary" style="background: #3730A3; border-color: #3730A3;" onclick="openAdminArticleModal()">
          + Tambah Naskah Baru Sekarang
        </button>
      </div>
    `;
    container.innerHTML = html;
    return;
  }

  html += `<div style="display: flex; flex-direction: column;">`;

  filtered.forEach(art => {
    const cover = art.coverImage || "img/pelatihan_fasilitator_auditorium.jpg";
    const catStyle = getArticleCategoryBadgeStyle(art.category);
    const catLabel = getArticleCategoryText(art.category);

    html += `
      <div class="module-row-item" style="display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid #E2E8F0; gap: 18px; flex-wrap: wrap;">
        <div style="display: flex; align-items: flex-start; gap: 16px; flex: 1; min-width: 290px;">
          <!-- Cover Thumbnail -->
          <div style="position: relative; width: 120px; height: 80px; border-radius: 8px; overflow: hidden; background: #0F172A; flex-shrink: 0; border: 1px solid #CBD5E1; box-shadow: 0 2px 5px rgba(0,0,0,0.06);">
            <img src="${cover}" alt="${escapeHtml(art.title)}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>

          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
              <span style="font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 8px; border-radius: 4px; ${catStyle}">
                ${catLabel}
              </span>
              <span style="font-size: 0.74rem; color: #64748B;">
                Penulis: <strong style="color: #334155;">${escapeHtml(art.author || 'Kontributor')}</strong>
              </span>
              ${art.authorRole ? `<span style="font-size: 0.72rem; color: #94A3B8;">(${escapeHtml(art.authorRole)})</span>` : ''}
              <span style="font-size: 0.72rem; color: #94A3B8;">| ${escapeHtml(art.readTime || '5 menit baca')}</span>
              ${art.isFromCloud ? '<span style="font-size: 0.68rem; font-weight: 700; background: #ECFDF5; color: #059669; padding: 1px 6px; border-radius: 3px; border: 1px solid #A7F3D0;">Cloud Database</span>' : ''}
            </div>

            <h4 style="font-size: 1rem; font-weight: 700; color: #0F172A; margin: 0 0 6px; line-height: 1.35;">
              ${escapeHtml(art.title)}
            </h4>

            <p style="font-size: 0.82rem; color: #64748B; margin: 0; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${escapeHtml(art.summary || 'Klik untuk menelaah poin gagasan utama.')}
            </p>
          </div>
        </div>

        <div class="module-actions-col">
          <a href="artikel.html?id=${encodeURIComponent(art.id)}" target="_blank" class="btn-action-edit" style="color: #4338CA; border-color: #C7D2FE; background: #EEF2FF; text-decoration: none;">
            Buka Baca &rarr;
          </a>
          <button type="button" class="btn-action-edit" onclick="openAdminArticleModal('${art.id}')">
            Sunting &amp; Ubah Foto
          </button>
          <button type="button" class="btn-action-icon btn-delete" onclick="handleDeleteArticle('${art.id}', '${encodeURIComponent(art.title)}')" title="Hapus Artikel">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

function openAdminArticleModal(id = null) {
  const modal = document.getElementById("admin-article-modal");
  const form = document.getElementById("form-manage-article");
  const titleEl = document.getElementById("modal-article-title");
  const subEl = document.getElementById("modal-article-sub");
  const coverImg = document.getElementById("admin-article-cover-img");

  if (form) form.reset();
  ADMIN_STATE.uploadedCoverDataUrl = null;

  if (id) {
    const list = getAdminArticlesList();
    const item = list.find(a => String(a.id) === String(id));
    if (item) {
      if (titleEl) titleEl.textContent = "Sunting Naskah Artikel & Foto Sampul";
      if (subEl) subEl.textContent = `Mengubah naskah "${item.title}".`;
      document.getElementById("field-article-id").value = item.id;
      document.getElementById("field-article-title").value = item.title || "";
      document.getElementById("field-article-category").value = (item.category || "pandai").toLowerCase();
      document.getElementById("field-article-readtime").value = item.readTime || "5 menit baca";
      document.getElementById("field-article-author").value = item.author || "";
      document.getElementById("field-article-role").value = item.authorRole || item.role || "";
      document.getElementById("field-article-cover-url").value = item.coverImage || "";
      document.getElementById("field-article-doc-url").value = item.docUrl || "";
      document.getElementById("field-article-quote").value = item.quoteHighlight || item.quote || "";
      document.getElementById("field-article-summary").value = item.summary || "";

      // Key points
      const points = (item.keyPoints && item.keyPoints.length > 0) ? item.keyPoints : [
        { title: "Gagasan Pokok Utama", desc: item.summary || "" },
        { title: "Analisis Kritis & Konteks", desc: "Penguatan pemahaman etika dan kepemimpinan inklusif." },
        { title: "Langkah Advokasi & Transformasi", desc: "Implementasi aksi nyata di komunitas dan masyarakat." }
      ];
      document.getElementById("field-article-pt1-title").value = (points[0] && points[0].title) || "";
      document.getElementById("field-article-pt1-desc").value = (points[0] && points[0].desc) || "";
      document.getElementById("field-article-pt2-title").value = (points[1] && points[1].title) || "";
      document.getElementById("field-article-pt2-desc").value = (points[1] && points[1].desc) || "";
      document.getElementById("field-article-pt3-title").value = (points[2] && points[2].title) || "";
      document.getElementById("field-article-pt3-desc").value = (points[2] && points[2].desc) || "";

      document.getElementById("field-article-action").value = item.actionNote || "Jadikan gagasan ini sebagai inspirasi langkah nyata di sekitarmu.";

      if (coverImg) {
        coverImg.src = item.coverImage || "img/pelatihan_fasilitator_auditorium.jpg";
      }
    }
  } else {
    if (titleEl) titleEl.textContent = "Tulis & Publikasikan Artikel Baru";
    if (subEl) subEl.textContent = "Tuliskan naskah literasi baru dan unggah foto sampul untuk Pustaka ARUTALA.";
    document.getElementById("field-article-id").value = "";
    document.getElementById("field-article-readtime").value = "5 menit baca";
    document.getElementById("field-article-cover-url").value = "img/pelatihan_fasilitator_auditorium.jpg";
    if (coverImg) {
      coverImg.src = "img/pelatihan_fasilitator_auditorium.jpg";
    }
  }

  if (modal) modal.classList.add("active");
}

function closeAdminArticleModal() {
  const modal = document.getElementById("admin-article-modal");
  if (modal) modal.classList.remove("active");
  const form = document.getElementById("form-manage-article");
  if (form) form.reset();
  ADMIN_STATE.uploadedCoverDataUrl = null;
}

function setArticleCoverPreset(presetUrl) {
  const inputUrl = document.getElementById("field-article-cover-url");
  const coverImg = document.getElementById("admin-article-cover-img");
  if (inputUrl) inputUrl.value = presetUrl;
  if (coverImg) coverImg.src = presetUrl;
  ADMIN_STATE.uploadedCoverDataUrl = null;
}

function setupAdminArticleCoverListeners() {
  const urlInput = document.getElementById("field-article-cover-url");
  const fileInput = document.getElementById("field-article-cover-file");
  const coverImg = document.getElementById("admin-article-cover-img");

  if (urlInput && coverImg) {
    const handleUrlChange = () => {
      const val = urlInput.value.trim();
      if (val) {
        coverImg.src = val;
        ADMIN_STATE.uploadedCoverDataUrl = null;
      }
    };
    urlInput.addEventListener("input", handleUrlChange);
    urlInput.addEventListener("change", handleUrlChange);
  }

  if (fileInput && coverImg) {
    fileInput.addEventListener("change", () => {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          ADMIN_STATE.uploadedCoverDataUrl = e.target.result;
          coverImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

async function handleSaveArticle(e) {
  e.preventDefault();

  const idField = document.getElementById("field-article-id")?.value?.trim();
  const title = document.getElementById("field-article-title")?.value?.trim();
  const category = document.getElementById("field-article-category")?.value;
  const readTime = document.getElementById("field-article-readtime")?.value?.trim() || "5 menit baca";
  const author = document.getElementById("field-article-author")?.value?.trim();
  const role = document.getElementById("field-article-role")?.value?.trim();
  const coverUrlInput = document.getElementById("field-article-cover-url")?.value?.trim();
  const docUrl = document.getElementById("field-article-doc-url")?.value?.trim() || null;
  const quote = document.getElementById("field-article-quote")?.value?.trim() || null;
  const summary = document.getElementById("field-article-summary")?.value?.trim();

  const pt1Title = document.getElementById("field-article-pt1-title")?.value?.trim();
  const pt1Desc = document.getElementById("field-article-pt1-desc")?.value?.trim();
  const pt2Title = document.getElementById("field-article-pt2-title")?.value?.trim();
  const pt2Desc = document.getElementById("field-article-pt2-desc")?.value?.trim();
  const pt3Title = document.getElementById("field-article-pt3-title")?.value?.trim();
  const pt3Desc = document.getElementById("field-article-pt3-desc")?.value?.trim();

  const actionNote = document.getElementById("field-article-action")?.value?.trim();

  if (!title || !author || !summary) {
    alert("Mohon lengkapi judul artikel, nama penulis, dan ringkasan!");
    return;
  }

  // Cover image: prioritaskan file base64 yang diunggah, lalu URL input, lalu fallback
  let finalCover = ADMIN_STATE.uploadedCoverDataUrl || coverUrlInput || "img/pelatihan_fasilitator_auditorium.jpg";

  // Upload ke Supabase storage jika file diunggah dan Supabase aktif
  const fileInput = document.getElementById("field-article-cover-file");
  if (fileInput && fileInput.files && fileInput.files[0] && window.ArutalaDB && typeof window.ArutalaDB.uploadMediaFile === "function") {
    try {
      const uploadedCloudUrl = await window.ArutalaDB.uploadMediaFile(fileInput.files[0], "articles/covers");
      if (uploadedCloudUrl) {
        finalCover = uploadedCloudUrl;
      }
    } catch (err) {
      console.warn("Notice upload cover to Supabase:", err);
    }
  }

  const articleId = idField || ("art-" + Date.now());

  const articleObj = {
    id: articleId,
    title: title,
    category: category,
    categoryLabel: getArticleCategoryText(category).toUpperCase(),
    author: author,
    authorRole: role || "Kontributor Pemuda ARUTALA",
    date: idField ? "Diperbarui baru saja" : "Baru saja",
    readTime: readTime,
    coverImage: finalCover,
    docUrl: docUrl,
    quoteHighlight: quote,
    summary: summary,
    keyPoints: [
      { title: pt1Title || "Gagasan Pokok Utama", desc: pt1Desc || summary },
      { title: pt2Title || "Analisis Kritis & Konteks", desc: pt2Desc || "Penguatan pemahaman etika dan kepemimpinan inklusif." },
      { title: pt3Title || "Langkah Advokasi & Transformasi", desc: pt3Desc || "Implementasi aksi nyata di komunitas dan masyarakat." }
    ],
    actionNote: actionNote || "Jadikan gagasan ini sebagai inspirasi langkah nyata di sekitarmu.",
    tags: [getArticleCategoryText(category), "Karya Pemuda", "Literasi"]
  };

  // Simpan ke localStorage arutala_custom_articles
  let customArticles = [];
  try {
    customArticles = JSON.parse(localStorage.getItem("arutala_custom_articles") || "[]");
  } catch (err) {
    customArticles = [];
  }

  const idx = customArticles.findIndex(a => String(a.id) === String(articleId));
  if (idx !== -1) {
    customArticles[idx] = articleObj;
  } else {
    customArticles.unshift(articleObj);
  }
  localStorage.setItem("arutala_custom_articles", JSON.stringify(customArticles));

  // Hapus dari deletedIds jika sebelumnya pernah dihapus
  try {
    let deletedIds = JSON.parse(localStorage.getItem("arutala_deleted_articles") || "[]");
    deletedIds = deletedIds.filter(did => String(did) !== String(articleId));
    localStorage.setItem("arutala_deleted_articles", JSON.stringify(deletedIds));
  } catch (e) {}

  // Sync Cloud Supabase jika tersedia
  if (window.ArutalaDB) {
    try {
      const isNumericId = idField && Number.isInteger(Number(idField)) && Number(idField) > 0;
      if (idField && typeof window.ArutalaDB.updateArticle === "function") {
        await window.ArutalaDB.updateArticle(isNumericId ? Number(idField) : idField, {
          title: articleObj.title,
          category: articleObj.category,
          author: articleObj.author,
          role: articleObj.authorRole,
          read_time: articleObj.readTime,
          image: articleObj.coverImage,
          doc_url: articleObj.docUrl,
          quote: articleObj.quoteHighlight,
          summary: articleObj.summary,
          content: `<p>${summary}</p>`
        });
      } else if (!idField && typeof window.ArutalaDB.insertArticle === "function") {
        const res = await window.ArutalaDB.insertArticle({
          title: articleObj.title,
          category: articleObj.category,
          author: articleObj.author,
          role: articleObj.authorRole,
          read_time: articleObj.readTime,
          image: articleObj.coverImage,
          doc_url: articleObj.docUrl,
          quote: articleObj.quoteHighlight,
          summary: articleObj.summary,
          content: `<p>${summary}</p>`
        });
        if (res && res.id) {
          articleObj.id = res.id;
        }
      }
    } catch (errDb) {
      console.warn("Notice save article Supabase:", errDb);
    }
  }

  // Refresh cache artikel cloud agar sinkron seketika
  if (window.ArutalaDB && typeof window.ArutalaDB.fetchArticles === "function") {
    try {
      window.ARUTALA_CLOUD_ARTICLES = await window.ArutalaDB.fetchArticles();
    } catch (e) {}
  }
  refreshAdminArticlesCache();

  closeAdminArticleModal();
  showToast("Artikel dan foto sampul berhasil disimpan ke Cloud Database!", "success");
  await renderArticlesInAdmin();
  await loadAllTrackCounts();
}

async function handleDeleteArticle(id, encodedTitle) {
  const title = decodeURIComponent(encodedTitle || "Artikel");
  if (!confirm(`Apakah Anda yakin ingin menghapus artikel "${title}"?\nNaskah ini akan dihapus dari portal bacaan publik.`)) {
    return;
  }

  // 1. Hapus dari customArticles di localStorage jika ada
  try {
    let customArticles = JSON.parse(localStorage.getItem("arutala_custom_articles") || "[]");
    customArticles = customArticles.filter(a => String(a.id) !== String(id));
    localStorage.setItem("arutala_custom_articles", JSON.stringify(customArticles));
  } catch (e) {}

  // 2. Catat ID di arutala_deleted_articles agar default data juga tersembunyi
  try {
    let deletedIds = JSON.parse(localStorage.getItem("arutala_deleted_articles") || "[]");
    if (!deletedIds.includes(String(id))) {
      deletedIds.push(String(id));
      localStorage.setItem("arutala_deleted_articles", JSON.stringify(deletedIds));
    }
  } catch (e) {}

  // 3. Hapus dari Supabase jika ada (terutama jika id berupa angka seperti id: 2)
  if (window.ArutalaDB && typeof window.ArutalaDB.deleteArticle === "function") {
    try {
      const isNum = Number.isInteger(Number(id)) && Number(id) > 0;
      await window.ArutalaDB.deleteArticle(isNum ? Number(id) : id);
    } catch (e) {
      console.warn("Delete article cloud warning:", e);
    }
  }

  // 4. Update memory cache
  if (Array.isArray(window.ARUTALA_CLOUD_ARTICLES)) {
    window.ARUTALA_CLOUD_ARTICLES = window.ARUTALA_CLOUD_ARTICLES.filter(a => String(a.id) !== String(id));
  }
  refreshAdminArticlesCache();

  showToast("Artikel berhasil dihapus dari Cloud Database & Pustaka.", "normal");
  await renderArticlesInAdmin();
  await loadAllTrackCounts();
}

function filterAdminArticlesCategory(category) {
  ADMIN_STATE.articlesCategoryFilter = category;
  renderArticlesInAdmin();
}

function handleAdminArticleSearch(event) {
  ADMIN_STATE.articlesSearchQuery = (event.target.value || "").trim();
  renderArticlesInAdmin();
}

// ----------------------------------------------------------------------------
// 10. KHUSUS ADMIN: PENGATURAN DONASI, REKENING BANK & QRIS NASIONAL
// ----------------------------------------------------------------------------
const DEFAULT_DONATION_SETTINGS = {
  merchantName: "ARUTALA UIN SGD BANDUNG",
  nmid: "ID1026002948192",
  qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=ARUTALA-DONASI-BENCANA-2026",
  instructions: "Scan dengan GoPay, OVO, Dana, BCA, Mandiri, BRImo, dll.",
  bank1Name: "Bank Syariah Indonesia (BSI)",
  bank1Number: "712-889-4401",
  bank1Holder: "ARUTALA Peduli",
  bank2Name: "Bank Central Asia (BCA)",
  bank2Number: "840-529-1102",
  bank2Holder: "Bendahara Arutala"
};

function getDonationSettings() {
  try {
    const saved = localStorage.getItem("arutala_donation_settings");
    if (saved) {
      return { ...DEFAULT_DONATION_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Gagal membaca donasi:", e);
  }
  return { ...DEFAULT_DONATION_SETTINGS };
}

function renderDonationsInAdmin() {
  const container = document.getElementById("admin-modules-list");
  const countBadge = document.getElementById("track-items-count-badge");
  const trackHeading = document.getElementById("current-track-heading");
  if (!container) return;

  if (countBadge) countBadge.textContent = "2 Rekening & QRIS Aktif";
  if (trackHeading) trackHeading.textContent = "Konfigurasi Rekening & QRIS Donasi ARUTALA";

  const settings = getDonationSettings();

  container.innerHTML = `
    <div style="padding: 24px;">
      <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 24px; align-items: start;">
        
        <!-- KOLOM KIRI: FORM PENGATURAN -->
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px;">
            <div>
              <h4 style="font-size: 1.05rem; font-weight: 800; color: #0F172A; margin: 0 0 2px;">
                Form Rekening &amp; QRIS
              </h4>
              <p style="font-size: 0.78rem; color: #64748B; margin: 0;">
                Ubah informasi rekening dan QR barcode yang langsung tampil di aksara.html
              </p>
            </div>
            <span style="font-size: 0.72rem; font-weight: 700; color: #166534; background: #DCFCE7; padding: 4px 10px; border-radius: 999px;">
              Live Sync Aktif
            </span>
          </div>

          <form id="form-manage-donations" onsubmit="handleSaveDonationSettings(event)">
            
            <!-- Identitas Merchant QRIS -->
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
              <span style="font-size: 0.82rem; font-weight: 800; color: #1D428A; display: block; margin-bottom: 10px; text-transform: uppercase;">
                1. Data QRIS Standar Nasional
              </span>

              <div class="admin-form-group">
                <label for="don-set-merchant">Nama Lembaga / Merchant QRIS *</label>
                <input type="text" id="don-set-merchant" class="admin-form-control" value="${escapeHtml(settings.merchantName)}" oninput="updateLiveDonationPreview()" required placeholder="Contoh: ARUTALA UIN SGD BANDUNG">
                <div class="form-hint">Nama ini tertera tepat di bawah barcode QRIS.</div>
              </div>

              <div class="admin-form-group">
                <label for="don-set-nmid">Nomor NMID (National Merchant ID) *</label>
                <input type="text" id="don-set-nmid" class="admin-form-control" value="${escapeHtml(settings.nmid)}" oninput="updateLiveDonationPreview()" required placeholder="Contoh: ID1026002948192">
              </div>

              <!-- Barcode QRIS: URL atau Upload Berkas -->
              <div class="admin-form-group" style="margin-bottom: 0;">
                <label for="don-set-qr-url">URL Gambar QR Barcode</label>
                <input type="text" id="don-set-qr-url" class="admin-form-control" value="${escapeHtml(settings.qrImageUrl)}" oninput="updateLiveDonationPreview()" placeholder="https://... atau data:image/...">
                
                <div style="margin-top: 10px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <label for="don-set-qr-file" class="btn-action-edit" style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer; margin: 0;">
                    Unggah Gambar QR dari HP / Komputer
                  </label>
                  <input type="file" id="don-set-qr-file" accept="image/*" style="display: none;" onchange="handleDonationQRISUpload(event)">
                  
                  <button type="button" class="btn-action-edit" onclick="handleGenerateQuickQR()" style="background: #EEF2F6; color: #1E293B; border-color: #CBD5E1;">
                    Generate QR Baru Otomatis
                  </button>
                </div>
                <div class="form-hint">Mendukung file foto PNG, JPG, WebP langsung dari perangkat atau link gambar internet.</div>
              </div>
            </div>

            <!-- Rekening Bank 1 (Utama) -->
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
              <span style="font-size: 0.82rem; font-weight: 800; color: #1D428A; display: block; margin-bottom: 10px; text-transform: uppercase;">
                2. Rekening Bank Utama (Pilihan 1)
              </span>

              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label for="don-set-b1-name">Nama Bank *</label>
                  <input type="text" id="don-set-b1-name" class="admin-form-control" value="${escapeHtml(settings.bank1Name)}" oninput="updateLiveDonationPreview()" required placeholder="Contoh: Bank Syariah Indonesia (BSI)">
                </div>
                <div class="admin-form-group">
                  <label for="don-set-b1-number">Nomor Rekening *</label>
                  <input type="text" id="don-set-b1-number" class="admin-form-control" value="${escapeHtml(settings.bank1Number)}" oninput="updateLiveDonationPreview()" required placeholder="Contoh: 712-889-4401">
                </div>
              </div>

              <div class="admin-form-group" style="margin-bottom: 0;">
                <label for="don-set-b1-holder">Atas Nama Pemilik Rekening *</label>
                <input type="text" id="don-set-b1-holder" class="admin-form-control" value="${escapeHtml(settings.bank1Holder)}" oninput="updateLiveDonationPreview()" required placeholder="Contoh: ARUTALA Peduli">
              </div>
            </div>

            <!-- Rekening Bank 2 (Cadangan) -->
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
              <span style="font-size: 0.82rem; font-weight: 800; color: #1D428A; display: block; margin-bottom: 10px; text-transform: uppercase;">
                3. Rekening Bank Cadangan / Alternatif (Pilihan 2)
              </span>

              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label for="don-set-b2-name">Nama Bank</label>
                  <input type="text" id="don-set-b2-name" class="admin-form-control" value="${escapeHtml(settings.bank2Name)}" oninput="updateLiveDonationPreview()" placeholder="Contoh: Bank Central Asia (BCA)">
                </div>
                <div class="admin-form-group">
                  <label for="don-set-b2-number">Nomor Rekening</label>
                  <input type="text" id="don-set-b2-number" class="admin-form-control" value="${escapeHtml(settings.bank2Number)}" oninput="updateLiveDonationPreview()" placeholder="Contoh: 840-529-1102">
                </div>
              </div>

              <div class="admin-form-group" style="margin-bottom: 0;">
                <label for="don-set-b2-holder">Atas Nama Pemilik Rekening</label>
                <input type="text" id="don-set-b2-holder" class="admin-form-control" value="${escapeHtml(settings.bank2Holder)}" oninput="updateLiveDonationPreview()" placeholder="Contoh: Bendahara Arutala">
              </div>
            </div>

            <!-- Petunjuk & Catatan -->
            <div class="admin-form-group">
              <label for="don-set-instructions">Petunjuk Scan / Aplikasi E-Wallet</label>
              <input type="text" id="don-set-instructions" class="admin-form-control" value="${escapeHtml(settings.instructions)}" oninput="updateLiveDonationPreview()" placeholder="Contoh: Scan dengan GoPay, OVO, Dana, BCA, Mandiri, BRImo, dll.">
              <div class="form-hint">Petunjuk singkat yang tampil di bagian bawah kartu barcode QRIS.</div>
            </div>

            <!-- Tombol Aksi Simpan & Reset -->
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #E2E8F0;">
              <button type="submit" class="btn-admin-primary" style="background: #166534; border-color: #166534; padding: 12px 24px; font-weight: 700;">
                Simpan Perubahan Donasi &amp; QRIS
              </button>
              <button type="button" class="btn-admin-outline" onclick="handleResetDonationSettings()">
                Reset Rekening Default
              </button>
            </div>
          </form>
        </div>

        <!-- KOLOM KANAN: PRATINJAU LANGSUNG (LIVE PREVIEW) -->
        <div style="position: sticky; top: 90px;">
          <div style="background: #FFFFFF; border: 1.5px solid #86EFAC; border-radius: 14px; padding: 22px; box-shadow: 0 4px 14px rgba(22, 101, 52, 0.08);">
            
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <span style="font-size: 0.72rem; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.05em;">
                Pratinjau Donatur Publik
              </span>
              <span style="font-size: 0.72rem; color: #64748B; background: #F1F5F9; padding: 2px 8px; border-radius: 4px;">
                Tampilan di modal aksara.html
              </span>
            </div>

            <!-- Kartu QRIS Preview -->
            <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #CBD5E1; padding-bottom: 8px; margin-bottom: 14px;">
                <span style="color: #0F172A; font-weight: 900; font-size: 1.15rem; letter-spacing: -0.02em;">QRIS</span>
                <span style="font-size: 0.68rem; color: #64748B; font-weight: 700;">STANDAR PEMBAYARAN NASIONAL</span>
              </div>

              <div style="background: #FFFFFF; padding: 10px; border-radius: 10px; display: inline-block; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
                <img id="admin-preview-qr-img" src="${escapeHtml(settings.qrImageUrl)}" alt="QRIS Preview" style="width: 170px; height: 170px; display: block; object-fit: contain;">
              </div>

              <div id="admin-preview-nmid" style="font-size: 0.84rem; font-weight: 800; color: #0F172A;">
                NMID: ${escapeHtml(settings.nmid)}
              </div>
              <div id="admin-preview-merchant" style="font-size: 0.76rem; color: #475569; font-weight: 700; margin-top: 2px;">
                ${escapeHtml(settings.merchantName)}
              </div>
              <div id="admin-preview-instructions" style="font-size: 0.72rem; color: #166534; margin-top: 6px; font-weight: 600;">
                ${escapeHtml(settings.instructions)}
              </div>
            </div>

            <!-- Rekening Preview -->
            <div>
              <div style="font-size: 0.78rem; font-weight: 700; color: #475569; margin-bottom: 8px;">
                Transfer Langsung ke Rekening:
              </div>

              <!-- Rekening 1 -->
              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <strong id="admin-preview-b1-name" style="color: #0F172A; font-size: 0.85rem; display: block;">
                    ${escapeHtml(settings.bank1Name)}
                  </strong>
                  <span id="admin-preview-b1-number" style="color: #2F4F87; font-weight: 700; font-size: 0.9rem;">
                    ${escapeHtml(settings.bank1Number)}
                  </span>
                  <span id="admin-preview-b1-holder" style="font-size: 0.74rem; color: #64748B;">
                    a.n. ${escapeHtml(settings.bank1Holder)}
                  </span>
                </div>
                <button type="button" class="btn-action-edit" style="font-size: 0.74rem; padding: 4px 8px;" onclick="testAdminCopyAcc('admin-preview-b1-number', this)">
                  Tes Salin
                </button>
              </div>

              <!-- Rekening 2 -->
              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <strong id="admin-preview-b2-name" style="color: #0F172A; font-size: 0.85rem; display: block;">
                    ${escapeHtml(settings.bank2Name)}
                  </strong>
                  <span id="admin-preview-b2-number" style="color: #2F4F87; font-weight: 700; font-size: 0.9rem;">
                    ${escapeHtml(settings.bank2Number)}
                  </span>
                  <span id="admin-preview-b2-holder" style="font-size: 0.74rem; color: #64748B;">
                    a.n. ${escapeHtml(settings.bank2Holder)}
                  </span>
                </div>
                <button type="button" class="btn-action-edit" style="font-size: 0.74rem; padding: 4px 8px;" onclick="testAdminCopyAcc('admin-preview-b2-number', this)">
                  Tes Salin
                </button>
              </div>
            </div>

            <!-- Petunjuk Link -->
            <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #CBD5E1; text-align: center;">
              <a href="aksara.html#donasi-sosial" target="_blank" style="font-size: 0.78rem; color: #166534; font-weight: 700; text-decoration: none;">
                Buka aksara.html untuk melihat hasil di web publik &rarr;
              </a>
            </div>

          </div>
        </div>

      </div>
    </div>
  `;
}

function updateLiveDonationPreview() {
  const merchant = document.getElementById("don-set-merchant")?.value || "ARUTALA UIN SGD BANDUNG";
  const nmid = document.getElementById("don-set-nmid")?.value || "ID1026002948192";
  const qrUrl = document.getElementById("don-set-qr-url")?.value || "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=ARUTALA-DONASI-BENCANA-2026";
  const instr = document.getElementById("don-set-instructions")?.value || "Scan dengan GoPay, OVO, Dana, BCA, Mandiri, BRImo, dll.";

  const b1Name = document.getElementById("don-set-b1-name")?.value || "Bank Syariah Indonesia (BSI)";
  const b1Num = document.getElementById("don-set-b1-number")?.value || "712-889-4401";
  const b1Holder = document.getElementById("don-set-b1-holder")?.value || "ARUTALA Peduli";

  const b2Name = document.getElementById("don-set-b2-name")?.value || "Bank Central Asia (BCA)";
  const b2Num = document.getElementById("don-set-b2-number")?.value || "840-529-1102";
  const b2Holder = document.getElementById("don-set-b2-holder")?.value || "Bendahara Arutala";

  const prevQrImg = document.getElementById("admin-preview-qr-img");
  if (prevQrImg) prevQrImg.src = qrUrl;

  const prevNmid = document.getElementById("admin-preview-nmid");
  if (prevNmid) prevNmid.textContent = `NMID: ${nmid}`;

  const prevMerchant = document.getElementById("admin-preview-merchant");
  if (prevMerchant) prevMerchant.textContent = merchant;

  const prevInstr = document.getElementById("admin-preview-instructions");
  if (prevInstr) prevInstr.textContent = instr;

  const prevB1Name = document.getElementById("admin-preview-b1-name");
  if (prevB1Name) prevB1Name.textContent = b1Name;
  const prevB1Num = document.getElementById("admin-preview-b1-number");
  if (prevB1Num) prevB1Num.textContent = b1Num;
  const prevB1Holder = document.getElementById("admin-preview-b1-holder");
  if (prevB1Holder) prevB1Holder.textContent = `a.n. ${b1Holder}`;

  const prevB2Name = document.getElementById("admin-preview-b2-name");
  if (prevB2Name) prevB2Name.textContent = b2Name;
  const prevB2Num = document.getElementById("admin-preview-b2-number");
  if (prevB2Num) prevB2Num.textContent = b2Num;
  const prevB2Holder = document.getElementById("admin-preview-b2-holder");
  if (prevB2Holder) prevB2Holder.textContent = `a.n. ${b2Holder}`;
}

function handleDonationQRISUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert("Ukuran berkas barcode QRIS maksimal 2 MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const urlInput = document.getElementById("don-set-qr-url");
    if (urlInput) {
      urlInput.value = dataUrl;
    }
    updateLiveDonationPreview();
    showToast("Berkas QRIS lokal berhasil diunggah ke pratinjau!", "success");
  };
  reader.readAsDataURL(file);
}

function handleGenerateQuickQR() {
  const merchant = document.getElementById("don-set-merchant")?.value || "ARUTALA";
  const code = encodeURIComponent("DONASI-" + merchant.replace(/\s+/g, "-").toUpperCase() + "-" + Date.now().toString().slice(-4));
  const newQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${code}`;
  
  const urlInput = document.getElementById("don-set-qr-url");
  if (urlInput) urlInput.value = newQrUrl;
  
  updateLiveDonationPreview();
  showToast("Barcode QRIS baru berhasil di-generate!", "success");
}

function handleSaveDonationSettings(event) {
  if (event) event.preventDefault();

  const merchantName = (document.getElementById("don-set-merchant")?.value || "").trim();
  const nmid = (document.getElementById("don-set-nmid")?.value || "").trim();
  const qrImageUrl = (document.getElementById("don-set-qr-url")?.value || "").trim();
  const instructions = (document.getElementById("don-set-instructions")?.value || "").trim();

  const bank1Name = (document.getElementById("don-set-b1-name")?.value || "").trim();
  const bank1Number = (document.getElementById("don-set-b1-number")?.value || "").trim();
  const bank1Holder = (document.getElementById("don-set-b1-holder")?.value || "").trim();

  const bank2Name = (document.getElementById("don-set-b2-name")?.value || "").trim();
  const bank2Number = (document.getElementById("don-set-b2-number")?.value || "").trim();
  const bank2Holder = (document.getElementById("don-set-b2-holder")?.value || "").trim();

  if (!merchantName) {
    alert("Silakan isi nama lembaga atau merchant QRIS.");
    return;
  }
  if (!bank1Number) {
    alert("Silakan isi nomor rekening bank utama.");
    return;
  }

  const settings = {
    merchantName: merchantName || DEFAULT_DONATION_SETTINGS.merchantName,
    nmid: nmid || DEFAULT_DONATION_SETTINGS.nmid,
    qrImageUrl: qrImageUrl || DEFAULT_DONATION_SETTINGS.qrImageUrl,
    instructions: instructions || DEFAULT_DONATION_SETTINGS.instructions,
    bank1Name: bank1Name || DEFAULT_DONATION_SETTINGS.bank1Name,
    bank1Number: bank1Number || DEFAULT_DONATION_SETTINGS.bank1Number,
    bank1Holder: bank1Holder || DEFAULT_DONATION_SETTINGS.bank1Holder,
    bank2Name: bank2Name || DEFAULT_DONATION_SETTINGS.bank2Name,
    bank2Number: bank2Number || DEFAULT_DONATION_SETTINGS.bank2Number,
    bank2Holder: bank2Holder || DEFAULT_DONATION_SETTINGS.bank2Holder
  };

  localStorage.setItem("arutala_donation_settings", JSON.stringify(settings));

  // Simpan ke Supabase jika ada
  if (window.ArutalaDB && typeof window.ArutalaDB.saveDonationSettings === "function") {
    try {
      window.ArutalaDB.saveDonationSettings(settings);
    } catch (e) {}
  }

  updateLiveDonationPreview();
  showToast("Pengaturan donasi dan QRIS berhasil disimpan dan langsung aktif!", "success");
}

function handleResetDonationSettings() {
  if (confirm("Apakah Anda yakin ingin mengembalikan rekening dan QRIS ke setelan awal default ARUTALA?")) {
    localStorage.removeItem("arutala_donation_settings");
    showToast("Pengaturan donasi dikembalikan ke default.", "normal");
    renderDonationsInAdmin();
  }
}

function testAdminCopyAcc(elementId, btn) {
  const el = document.getElementById(elementId);
  const text = el ? el.textContent.trim().replace(/[^0-9]/g, "") : "";
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = "Tersalin!";
    btn.style.background = "#DCFCE7";
    btn.style.color = "#166534";
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = "";
      btn.style.color = "";
    }, 1500);
  });
}

// ----------------------------------------------------------------------------
// 11. KHUSUS ADMIN: DAFTAR PENDAFTAR CIRCLE MENTORING SEBAYA (PILAR TEMARA)
// ----------------------------------------------------------------------------
const DEFAULT_FACILITATORS_DATA = [
  {
    id: "fac-101",
    fullname: "Alfath Fadillah",
    ageRange: "21-23",
    institution: "UIN Sunan Gunung Djati Bandung",
    contact: "081223344551",
    focusPillar: "Moderasi Beragama & Toleransi",
    experience: "Ketua Divisi Pengabdian Masyarakat DEMA Fakultas, Relawan Peace Camp Pemuda 2025.",
    motivation: "Ingin memfasilitasi dialog damai lintas iman di kalangan mahasiswa baru dan menepis prasangka intoleransi di kampus.",
    status: "accepted",
    notes: "Lolos wawancara dengan skor A. Rekomendasi fasilitator utama Circle Kampus 1.",
    createdAt: "2026-10-18T10:30:00.000Z"
  },
  {
    id: "fac-102",
    fullname: "Siti Rahmah Az-Zahra",
    ageRange: "21-23",
    institution: "Universitas Padjadjaran (Unpad)",
    contact: "085799887766",
    focusPillar: "Kesetaraan Gender & Anti-Kekerasan",
    experience: "Anggota Satgas PPKS Kampus, Konselor Sebaya Pusat Bimbingan Konseling.",
    motivation: "Membangun ruang aman bebas kekerasan berbasis gender dan menyediakan pendampingan psikososial suportif bagi sesama mahasiswi.",
    status: "interviewed",
    notes: "Tahap wawancara kedua terjadwal via Zoom.",
    createdAt: "2026-10-17T14:15:00.000Z"
  },
  {
    id: "fac-103",
    fullname: "Kevin Jonathan",
    ageRange: "18-20",
    institution: "Institut Teknologi Bandung (ITB)",
    contact: "081344556677",
    focusPillar: "Kapasitas Diri & Kepemimpinan Sebaya",
    experience: "Fasilitator Ospek Jurusan, Trainer Manajemen Waktu & Produktivitas Mahasiswa.",
    motivation: "Membantu kawan sebaya mengatasi beban mental perkuliahan dan menumbuhkan kepemimpinan pemuda yang inklusif tanpa perundungan.",
    status: "pending",
    notes: "Menunggu telaah portofolio kepemimpinan.",
    createdAt: "2026-10-19T08:00:00.000Z"
  },
  {
    id: "fac-104",
    fullname: "Nabila Putri Hidayat",
    ageRange: "18-20",
    institution: "Universitas Islam Bandung (Unisba)",
    contact: "087811223344",
    focusPillar: "Kearifan Budaya & Silih Asah Asuh",
    experience: "Komunitas Seni & Budaya Pasundan Muda, Penggiat Dialog Antar-Kultural.",
    motivation: "Mengintegrasikan nilai kearifan lokal Sunda Silih Asih, Silih Asah, Silih Asuh ke dalam resolusi konflik sebaya.",
    status: "interviewed",
    notes: "Pemahaman budaya sangat matang. Menunggu verifikasi nomor WhatsApp.",
    createdAt: "2026-10-16T16:45:00.000Z"
  },
  {
    id: "fac-105",
    fullname: "Dimas Prasetyo",
    ageRange: "24-27",
    institution: "Komunitas Pemuda Bergerak Bandung",
    contact: "082199881122",
    focusPillar: "Moderasi Beragama & Toleransi",
    experience: "Mentor Karang Taruna, Fasilitator Workshop Kepemudaan Tingkat Kecamatan.",
    motivation: "Membimbing pemuda putus sekolah dan anak muda wilayah urban agar memiliki empati keberagaman dan kepekaan sosial.",
    status: "accepted",
    notes: "Pengalaman lapangan sangat kuat. Ditugaskan fasilitator komunitas wilayah timur.",
    createdAt: "2026-10-15T11:20:00.000Z"
  }
];

function getFacilitatorRegistrations() {
  let list = [];
  try {
    const saved = localStorage.getItem("arutala_facilitator_registrations");
    if (saved) {
      list = JSON.parse(saved);
    }
  } catch (e) {
    list = [];
  }

  if (!Array.isArray(list) || list.length === 0) {
    list = [...DEFAULT_FACILITATORS_DATA];
    try {
      localStorage.setItem("arutala_facilitator_registrations", JSON.stringify(list));
    } catch (e) {}
  }
  return list;
}

function renderFacilitatorsInAdmin() {
  const container = document.getElementById("admin-modules-list");
  const countBadge = document.getElementById("track-items-count-badge");
  const trackHeading = document.getElementById("current-track-heading");
  if (!container) return;

  const allFacs = getFacilitatorRegistrations();
  const facBadge = document.getElementById("badge-count-temara-registrations");
  if (facBadge) facBadge.textContent = `${allFacs.length} Pendaftar`;

  if (trackHeading) trackHeading.textContent = "Daftar Calon Fasilitator & Pendaftar Circle (TEMARA)";

  // Filter & Search
  const query = (ADMIN_STATE.facilitatorSearchQuery || "").toLowerCase();
  const statusFilter = ADMIN_STATE.facilitatorStatusFilter || "all";

  const filtered = allFacs.filter(item => {
    const matchStatus = statusFilter === "all" || (item.status || "pending") === statusFilter;
    const matchSearch = !query ||
      (item.fullname && item.fullname.toLowerCase().includes(query)) ||
      (item.institution && item.institution.toLowerCase().includes(query)) ||
      (item.contact && item.contact.toLowerCase().includes(query)) ||
      (item.motivation && item.motivation.toLowerCase().includes(query));
    return matchStatus && matchSearch;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} dari ${allFacs.length} Pendaftar`;
  }

  // Stat metrics
  const countTotal = allFacs.length;
  const countAccepted = allFacs.filter(f => f.status === "accepted").length;
  const countInterviewed = allFacs.filter(f => f.status === "interviewed").length;
  const countPending = allFacs.filter(f => !f.status || f.status === "pending").length;

  let html = `
    <!-- 1. Ringkasan Metrik Rekrutmen -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; padding: 20px 24px; background: #FAFAFA; border-bottom: 1px solid #E2E8F0;">
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <span style="font-size: 0.74rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Total Pendaftar</span>
        <div style="font-size: 1.6rem; font-weight: 800; color: #0F172A; margin-top: 4px;">${countTotal} <span style="font-size: 0.85rem; font-weight: 600; color: #64748B;">Orang</span></div>
      </div>
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 14px 18px;">
        <span style="font-size: 0.74rem; font-weight: 700; color: #166534; text-transform: uppercase;">Diterima / Lolos</span>
        <div style="font-size: 1.6rem; font-weight: 800; color: #166534; margin-top: 4px;">${countAccepted} <span style="font-size: 0.85rem; font-weight: 600;">Calon</span></div>
      </div>
      <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 10px; padding: 14px 18px;">
        <span style="font-size: 0.74rem; font-weight: 700; color: #1D4ED8; text-transform: uppercase;">Tahap Wawancara</span>
        <div style="font-size: 1.6rem; font-weight: 800; color: #1D4ED8; margin-top: 4px;">${countInterviewed} <span style="font-size: 0.85rem; font-weight: 600;">Calon</span></div>
      </div>
      <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 14px 18px;">
        <span style="font-size: 0.74rem; font-weight: 700; color: #92400E; text-transform: uppercase;">Menunggu Review</span>
        <div style="font-size: 1.6rem; font-weight: 800; color: #92400E; margin-top: 4px;">${countPending} <span style="font-size: 0.85rem; font-weight: 600;">Calon</span></div>
      </div>
    </div>

    <!-- 2. Toolbar Pencarian & Filter Status -->
    <div style="padding: 16px 24px; background: #FFFFFF; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
      <!-- Filter Status Pills -->
      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
        <button type="button" class="btn-action-edit" style="border-radius: 999px; padding: 5px 12px; font-size: 0.78rem; ${statusFilter === 'all' ? 'background: #B45309; color: #FFF; border-color: #B45309;' : 'background: #FFF;'}" onclick="filterFacilitatorsStatus('all')">
          Semua (${allFacs.length})
        </button>
        <button type="button" class="btn-action-edit" style="border-radius: 999px; padding: 5px 12px; font-size: 0.78rem; ${statusFilter === 'pending' ? 'background: #D97706; color: #FFF; border-color: #D97706;' : 'background: #FFF; color: #92400E;'}" onclick="filterFacilitatorsStatus('pending')">
          Menunggu Review (${countPending})
        </button>
        <button type="button" class="btn-action-edit" style="border-radius: 999px; padding: 5px 12px; font-size: 0.78rem; ${statusFilter === 'interviewed' ? 'background: #2563EB; color: #FFF; border-color: #2563EB;' : 'background: #FFF; color: #1D4ED8;'}" onclick="filterFacilitatorsStatus('interviewed')">
          Wawancara (${countInterviewed})
        </button>
        <button type="button" class="btn-action-edit" style="border-radius: 999px; padding: 5px 12px; font-size: 0.78rem; ${statusFilter === 'accepted' ? 'background: #16A34A; color: #FFF; border-color: #16A34A;' : 'background: #FFF; color: #166534;'}" onclick="filterFacilitatorsStatus('accepted')">
          Lolos / Diterima (${countAccepted})
        </button>
      </div>

      <!-- Search Input & CSV Export Button -->
      <div style="display: flex; align-items: center; gap: 10px; flex: 1; max-width: 440px; min-width: 260px;">
        <input type="text" id="admin-facilitator-search-input" class="admin-form-control" style="padding: 7px 12px; font-size: 0.82rem;" placeholder="Cari nama, kampus, atau no WA..." value="${escapeHtml(ADMIN_STATE.facilitatorSearchQuery || '')}" oninput="handleFacilitatorSearch(event)">
        <button type="button" class="btn-action-edit" style="white-space: nowrap; font-size: 0.78rem; padding: 7px 12px; background: #F8FAFC;" onclick="handleExportFacilitatorCSV()" title="Unduh data dalam format CSV Spreadsheet">
          Ekspor CSV
        </button>
      </div>
    </div>
  `;

  if (filtered.length === 0) {
    html += `
      <div style="padding: 60px 20px; text-align: center; color: #64748B;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: #FEF3C7; color: #92400E; display: inline-flex; align-items: center; justify-content: center; font-size: 1.2rem; margin-bottom: 12px; font-weight: 800;">T</div>
        <h4 style="font-size: 1.15rem; color: #0F172A; margin: 0 0 6px; font-weight: 800;">Tidak Ada Data Pendaftar</h4>
        <p style="font-size: 0.88rem; max-width: 480px; margin: 0 auto 20px; line-height: 1.55;">
          ${allFacs.length === 0 ? 'Belum ada pendaftar fasilitator circle sebaya.' : 'Tidak ditemukan pendaftar yang cocok dengan kata kunci atau filter status terpilih.'}
        </p>
      </div>
    `;
    container.innerHTML = html;
    return;
  }

  html += `<div style="display: flex; flex-direction: column;">`;

  filtered.forEach(fac => {
    const initials = (fac.fullname || "F").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
    const dateFormatted = fac.createdAt ? formatIndonesianDate(fac.createdAt) : "Baru saja";
    const statusBadge = getFacilitatorStatusBadge(fac.status);

    html += `
      <div class="module-row-item" style="display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid #F1F5F9; gap: 18px; flex-wrap: wrap; transition: background 0.15s ease;">
        
        <div style="display: flex; align-items: flex-start; gap: 16px; flex: 1; min-width: 300px;">
          <!-- Avatar Initials -->
          <div style="width: 44px; height: 44px; border-radius: 10px; background: #FEF3C7; color: #92400E; font-weight: 800; font-size: 1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1.5px solid #FDE68A;">
            ${initials}
          </div>

          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
              <span style="font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; background: #EEF3FA; color: #1D428A; border: 1px solid #CBD5E1;">
                ${escapeHtml(fac.focusPillar || 'Fasilitator Sebaya')}
              </span>
              <span style="font-size: 0.75rem; color: #64748B;">
                Usia: <strong style="color: #334155;">${escapeHtml(fac.ageRange || '-')} Thn</strong>
              </span>
              <span style="font-size: 0.74rem; color: #94A3B8;">| Terdaftar: ${dateFormatted}</span>
            </div>

            <h4 style="font-size: 1.02rem; font-weight: 800; color: #0F172A; margin: 0 0 3px;">
              ${escapeHtml(fac.fullname)}
              <span style="font-size: 0.82rem; font-weight: 600; color: #64748B; margin-left: 6px;">- ${escapeHtml(fac.institution)}</span>
            </h4>

            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap;">
              <span style="font-size: 0.78rem; color: #166534; font-weight: 700;">
                WA: ${escapeHtml(fac.contact || '-')}
              </span>
              ${fac.notes ? `<span style="font-size: 0.75rem; color: #475569; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 2px 6px; border-radius: 4px;">Catatan: ${escapeHtml(fac.notes)}</span>` : ''}
            </div>

            <p style="font-size: 0.82rem; color: #475569; margin: 0; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              <strong>Motivasi:</strong> ${escapeHtml(fac.motivation || '-')}
            </p>
          </div>
        </div>

        <!-- Status & Actions Col -->
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <div>${statusBadge}</div>
          
          <button type="button" class="btn-action-edit" style="color: #92400E; border-color: #FDE68A; background: #FFFBEB;" onclick="openAdminFacilitatorModal('${fac.id}')">
            Detail &amp; Review
          </button>
          
          <a href="https://wa.me/${formatWhatsAppNumber(fac.contact)}?text=${encodeURIComponent(`Halo ${fac.fullname}, kami dari Tim ARUTALA menyapa terkait pendaftaran kamu sebagai Fasilitator Sebaya TEMARA...`)}" target="_blank" class="btn-action-edit" style="color: #15803D; border-color: #86EFAC; background: #F0FDF4; text-decoration: none;" title="Hubungi calon via WhatsApp">
            Chat WA
          </a>
          
          <button type="button" class="btn-action-icon btn-delete" onclick="handleDeleteFacilitator('${fac.id}', '${escapeHtml(fac.fullname)}')" title="Hapus Data">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>

      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

function formatWhatsAppNumber(phone) {
  if (!phone) return "";
  let clean = phone.replace(/[^0-9]/g, "");
  if (clean.startsWith("0")) {
    clean = "62" + clean.substring(1);
  }
  return clean;
}

function getFacilitatorStatusBadge(status) {
  switch (status) {
    case "accepted":
      return '<span style="font-size: 0.72rem; font-weight: 800; background: #DCFCE7; color: #166534; padding: 4px 10px; border-radius: 999px; border: 1px solid #86EFAC;">Diterima / Lolos</span>';
    case "interviewed":
      return '<span style="font-size: 0.72rem; font-weight: 800; background: #EFF6FF; color: #1D4ED8; padding: 4px 10px; border-radius: 999px; border: 1px solid #BFDBFE;">Tahap Wawancara</span>';
    case "rejected":
      return '<span style="font-size: 0.72rem; font-weight: 800; background: #F1F5F9; color: #64748B; padding: 4px 10px; border-radius: 999px; border: 1px solid #CBD5E1;">Belum Lolos</span>';
    default:
      return '<span style="font-size: 0.72rem; font-weight: 800; background: #FEF3C7; color: #92400E; padding: 4px 10px; border-radius: 999px; border: 1px solid #FDE68A;">Menunggu Review</span>';
  }
}

function formatIndonesianDate(isoString) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Baru saja";
    const day = d.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch (e) {
    return "Baru saja";
  }
}

function openAdminFacilitatorModal(id) {
  const allFacs = getFacilitatorRegistrations();
  const fac = allFacs.find(f => String(f.id) === String(id));
  if (!fac) return;

  ADMIN_STATE.editingFacilitatorId = fac.id;

  document.getElementById("field-fac-id").value = fac.id;
  document.getElementById("modal-fac-fullname").textContent = fac.fullname || "Detail Fasilitator";
  document.getElementById("modal-fac-institution").textContent = fac.institution || "-";
  document.getElementById("modal-fac-age").textContent = `${fac.ageRange || "-"} Tahun`;
  document.getElementById("modal-fac-contact").textContent = fac.contact || "-";
  document.getElementById("modal-fac-pillar").textContent = fac.focusPillar || "-";
  document.getElementById("modal-fac-experience").textContent = fac.experience || "Tidak ada catatan pengalaman khusus.";
  document.getElementById("modal-fac-motivation").textContent = fac.motivation || "Tidak ada rincian motivasi.";
  document.getElementById("field-fac-status").value = fac.status || "pending";
  document.getElementById("field-fac-notes").value = fac.notes || "";

  const waLink = document.getElementById("modal-fac-wa-link");
  if (waLink) {
    const cleanNum = formatWhatsAppNumber(fac.contact);
    waLink.href = `https://wa.me/${cleanNum}?text=${encodeURIComponent(`Halo ${fac.fullname}, kami dari Tim ARUTALA menyapa terkait pendaftaran kamu sebagai Fasilitator Sebaya TEMARA...`)}`;
  }

  const modal = document.getElementById("admin-facilitator-modal");
  if (modal) modal.classList.add("active");
}

function closeAdminFacilitatorModal() {
  ADMIN_STATE.editingFacilitatorId = null;
  const modal = document.getElementById("admin-facilitator-modal");
  if (modal) modal.classList.remove("active");
}

function handleSaveFacilitatorStatus() {
  const id = document.getElementById("field-fac-id")?.value;
  if (!id) return;

  const newStatus = document.getElementById("field-fac-status")?.value || "pending";
  const newNotes = document.getElementById("field-fac-notes")?.value || "";

  let allFacs = getFacilitatorRegistrations();
  allFacs = allFacs.map(f => {
    if (String(f.id) === String(id)) {
      return { ...f, status: newStatus, notes: newNotes };
    }
    return f;
  });

  localStorage.setItem("arutala_facilitator_registrations", JSON.stringify(allFacs));

  closeAdminFacilitatorModal();
  showToast("Status seleksi dan catatan berhasil disimpan!", "success");
  renderFacilitatorsInAdmin();
  loadAllTrackCounts();
}

function handleDeleteFacilitator(id, name) {
  if (!confirm(`Apakah Anda yakin ingin menghapus data pendaftar "${name}"?`)) {
    return;
  }

  let allFacs = getFacilitatorRegistrations();
  allFacs = allFacs.filter(f => String(f.id) !== String(id));
  localStorage.setItem("arutala_facilitator_registrations", JSON.stringify(allFacs));

  showToast("Data pendaftar berhasil dihapus.", "normal");
  renderFacilitatorsInAdmin();
  loadAllTrackCounts();
}

function handleExportFacilitatorCSV() {
  const allFacs = getFacilitatorRegistrations();
  if (allFacs.length === 0) {
    alert("Belum ada data pendaftar untuk diekspor.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "ID,Nama Lengkap,Rentang Usia,Asal Kampus / Komunitas,Kontak WhatsApp,Fokus Bidang,Status Seleksi,Catatan Reviewer,Tanggal Daftar\r\n";

  allFacs.forEach(item => {
    const row = [
      item.id || "",
      `"${(item.fullname || "").replace(/"/g, '""')}"`,
      `"${item.ageRange || ""}"`,
      `"${(item.institution || "").replace(/"/g, '""')}"`,
      `"'${item.contact || ""}"`,
      `"${(item.focusPillar || "").replace(/"/g, '""')}"`,
      `"${item.status || "pending"}"`,
      `"${(item.notes || "").replace(/"/g, '""')}"`,
      `"${item.createdAt || ""}"`
    ];
    csvContent += row.join(",") + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Data_Pendaftar_Circle_TEMARA_ARUTALA_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("Data pendaftar berhasil diekspor ke file CSV!", "success");
}

function handleFacilitatorSearch(event) {
  ADMIN_STATE.facilitatorSearchQuery = (event.target.value || "").trim();
  renderFacilitatorsInAdmin();
}

function filterFacilitatorsStatus(status) {
  ADMIN_STATE.facilitatorStatusFilter = status;
  renderFacilitatorsInAdmin();
}

// ----------------------------------------------------------------------------
// 12. KHUSUS ADMIN: MANAJEMEN MODUL & DOKUMEN PDF (PILAR KARSA, NUANSA & TEMARA)
// ----------------------------------------------------------------------------
const DEFAULT_PDF_SETTINGS = {
  karsa: {
    pillarId: "karsa",
    pillarName: "Pilar KARSA",
    pillarSub: "Ruang Edukasi & Kapasitas Pemuda",
    badgeText: "Modul Utama KARSA",
    pageUrl: "karsa.html#workspace-modul",
    pageName: "karsa.html",
    title: "Modul Pembelajaran & Kapasitas Pemuda",
    subtitle: "Pelajari modul resmi KARSA langsung di bawah ini. Dokumen dapat digulir (scroll), diperbesar, atau dibuka di layar penuh.",
    pdfUrl: "COVER KARSA.pdf",
    downloadName: "Modul-KARSA-Arutala.pdf",
    lastUpdated: "19 Oktober 2026",
    status: "active",
    themeColor: "#2F4F87",
    accentBg: "#EEF2FF",
    borderCol: "#C7D2FE",
    defaultLocalFile: "COVER KARSA.pdf"
  },
  nuansa: {
    pillarId: "nuansa",
    pillarName: "Pilar NUANSA",
    pillarSub: "Ruang Kesadaran Sosial-Keagamaan & Kebijakan",
    badgeText: "Panduan Modul NUANSA",
    pageUrl: "nuansa.html#workspace-modul",
    pageName: "nuansa.html",
    title: "Buku Panduan & Kebijakan NUANSA",
    subtitle: "Pelajari modul resmi NUANSA langsung di bawah ini. Dokumen dapat digulir (scroll), diperbesar, atau dibuka di layar penuh.",
    pdfUrl: "COVER NUANSA.pdf",
    downloadName: "Modul-NUANSA-Arutala.pdf",
    lastUpdated: "19 Oktober 2026",
    status: "active",
    themeColor: "#2E7D32",
    accentBg: "#E8F5E9",
    borderCol: "#A5D6A7",
    defaultLocalFile: "COVER NUANSA.pdf"
  },
  temara: {
    pillarId: "temara",
    pillarName: "Pilar TEMARA",
    pillarSub: "Circle Mentoring & Pendampingan Sebaya",
    badgeText: "Buku Panduan Fasilitator TEMARA",
    pageUrl: "temara.html#workspace-modul",
    pageName: "temara.html",
    title: "Buku Panduan Fasilitator Sebaya TEMARA",
    subtitle: "Buku pegangan operasional fasilitator circle mentoring sebaya untuk memandu sesi dialog dan refleksi kelompok pemuda.",
    pdfUrl: "COVER TEMARA.pdf",
    downloadName: "Panduan-Fasilitator-TEMARA-Arutala.pdf",
    lastUpdated: "19 Oktober 2026",
    status: "active",
    themeColor: "#0284C7",
    accentBg: "#F0F9FF",
    borderCol: "#BAE6FD",
    defaultLocalFile: "COVER TEMARA.pdf"
  }
};

function getPdfSettings() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem("arutala_pdf_settings") || "{}");
  } catch (e) {
    saved = {};
  }
  return {
    karsa: { ...DEFAULT_PDF_SETTINGS.karsa, ...(saved.karsa || {}) },
    nuansa: { ...DEFAULT_PDF_SETTINGS.nuansa, ...(saved.nuansa || {}) },
    temara: { ...DEFAULT_PDF_SETTINGS.temara, ...(saved.temara || {}) }
  };
}

function convertPdfUrl(url) {
  if (!url) {
    return {
      embedUrl: "",
      downloadUrl: "",
      viewUrl: "",
      type: "empty",
      displaySource: "Belum Dikonfigurasi"
    };
  }
  const trimmed = url.trim();

  // Deteksi Google Drive
  const gdriveRegex1 = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const gdriveRegex2 = /[?&]id=([a-zA-Z0-9_-]+)/;
  let gdriveId = null;
  const match1 = trimmed.match(gdriveRegex1);
  if (match1 && match1[1]) {
    gdriveId = match1[1];
  } else {
    const match2 = trimmed.match(gdriveRegex2);
    if (trimmed.includes("drive.google.com") && match2 && match2[1]) {
      gdriveId = match2[1];
    }
  }

  if (gdriveId) {
    return {
      embedUrl: `https://drive.google.com/file/d/${gdriveId}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${gdriveId}`,
      viewUrl: `https://drive.google.com/file/d/${gdriveId}/view`,
      type: "gdrive",
      fileId: gdriveId,
      displaySource: "Google Drive Cloud (0 Bytes DB)"
    };
  }

  // Deteksi Dropbox
  if (trimmed.includes("dropbox.com")) {
    const embed = trimmed.replace("dl=0", "raw=1");
    return {
      embedUrl: embed,
      downloadUrl: embed,
      viewUrl: trimmed,
      type: "dropbox",
      displaySource: "Dropbox Cloud (0 Bytes DB)"
    };
  }

  // Deteksi OneDrive
  if (trimmed.includes("1drv.ms") || trimmed.includes("onedrive.live.com")) {
    return {
      embedUrl: trimmed,
      downloadUrl: trimmed,
      viewUrl: trimmed,
      type: "onedrive",
      displaySource: "Microsoft OneDrive"
    };
  }

  // Deteksi Web URL eksternal
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const embed = trimmed.includes("#") ? trimmed : `${trimmed}#toolbar=1&navpanes=0&scrollbar=1`;
    return {
      embedUrl: embed,
      downloadUrl: trimmed,
      viewUrl: trimmed,
      type: "url",
      displaySource: "Tautan Web Eksternal"
    };
  }

  // Berkas Lokal di folder project (e.g. COVER KARSA.pdf)
  const embed = trimmed.includes("#") ? trimmed : `${trimmed}#toolbar=1&navpanes=0&scrollbar=1`;
  return {
    embedUrl: embed,
    downloadUrl: trimmed,
    viewUrl: trimmed,
    type: "local",
    displaySource: "Berkas Lokal (Folder Project)"
  };
}

function renderPdfModulesInAdmin() {
  const container = document.getElementById("admin-modules-list");
  const countBadge = document.getElementById("track-items-count-badge");
  if (!container) return;

  const pdfSettings = getPdfSettings();
  const keys = Object.keys(pdfSettings);

  if (countBadge) countBadge.textContent = `${keys.length} Dokumen PDF Aktif`;
  const tabBadge = document.getElementById("badge-count-pdf-modules");
  if (tabBadge) tabBadge.textContent = `${keys.length} Modul`;

  let cardsHtml = "";
  keys.forEach(pillarKey => {
    const item = pdfSettings[pillarKey];
    const converted = convertPdfUrl(item.pdfUrl);

    let sourceBadgeBg = "#F1F5F9";
    let sourceBadgeCol = "#475569";
    if (converted.type === "gdrive") {
      sourceBadgeBg = "#DCFCE7";
      sourceBadgeCol = "#166534";
    } else if (converted.type === "dropbox") {
      sourceBadgeBg = "#E0F2FE";
      sourceBadgeCol = "#0369A1";
    } else if (converted.type === "local") {
      sourceBadgeBg = "#FEF3C7";
      sourceBadgeCol = "#92400E";
    }

    cardsHtml += `
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 22px; margin-bottom: 22px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
        <!-- Card Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #F1F5F9; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: 6px; background: ${item.accentBg}; color: ${item.themeColor}; text-transform: uppercase;">
                ${item.pillarName}
              </span>
              <span style="font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: ${sourceBadgeBg}; color: ${sourceBadgeCol};">
                ${converted.displaySource}
              </span>
            </div>
            <h4 style="font-size: 1.15rem; font-weight: 800; color: #0F172A; margin: 0;">
              ${item.badgeText}
            </h4>
            <span style="font-size: 0.8rem; color: #64748B;">
              Target Tampilan: <a href="${item.pageUrl}" target="_blank" style="color: ${item.themeColor}; font-weight: 700; text-decoration: underline;">${item.pageName} (Bagian Workspace PDF)</a>
            </span>
          </div>

          <div style="display: flex; gap: 8px; align-items: center;">
            <button type="button" class="btn-admin-outline" onclick="testOpenPdfViewer('${pillarKey}')" style="padding: 7px 14px; font-size: 0.82rem; color: #0F766E; border-color: #99F6E4; background: #F0FDFA;">
              Uji Penampil PDF
            </button>
            <a href="${converted.viewUrl || item.pdfUrl}" target="_blank" class="btn-admin-outline" style="padding: 7px 14px; font-size: 0.82rem; text-decoration: none;">
              Buka Tab Baru &rarr;
            </a>
          </div>
        </div>

        <!-- Form Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div style="grid-column: span 2;">
            <label style="font-size: 0.82rem; font-weight: 700; color: #334155; margin-bottom: 6px; display: block;">
              Judul Dokumen di Halaman Publik:
            </label>
            <input type="text" id="pdf-title-${pillarKey}" class="admin-form-control" value="${escapeHtml(item.title || "")}" placeholder="Contoh: Modul Pembelajaran & Kapasitas Pemuda">
          </div>

          <div style="grid-column: span 2;">
            <label style="font-size: 0.82rem; font-weight: 700; color: #334155; margin-bottom: 6px; display: block;">
              Subjudul / Panduan Singkat:
            </label>
            <textarea id="pdf-subtitle-${pillarKey}" class="admin-form-control" rows="2" placeholder="Panduan cara membaca modul...">${escapeHtml(item.subtitle || "")}</textarea>
          </div>

          <div style="grid-column: span 2;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label style="font-size: 0.82rem; font-weight: 700; color: #334155; margin-bottom: 0;">
                Tautan / URL Berkas PDF (Google Drive / Berkas Lokal / Cloud Link):
              </label>
              <span style="font-size: 0.72rem; color: #059669; font-weight: 700; background: #ECFDF5; padding: 2px 8px; border-radius: 4px;">
                Bebas Kuota Database: 0 Bytes DB Digunakan
              </span>
            </div>
            <input type="text" id="pdf-url-${pillarKey}" class="admin-form-control" value="${escapeHtml(item.pdfUrl || "")}" placeholder="Tempel tautan Google Drive atau nama file lokal (contoh: COVER KARSA.pdf)">
            <div style="font-size: 0.76rem; color: #64748B; margin-top: 5px; line-height: 1.4;">
              <strong>Tips Bebas Kuota:</strong> Upload PDF ke Google Drive (15 GB gratis), atur akses 'Siapa saja yang memiliki link dapat melihat', lalu tempelkan linknya di sini. Sistem otomatis mengubahnya menjadi penampil scrollable interaktif dan tombol unduh langsung.
            </div>
          </div>

          <div>
            <label style="font-size: 0.82rem; font-weight: 700; color: #334155; margin-bottom: 6px; display: block;">
              Nama Berkas Unduhan (.pdf):
            </label>
            <input type="text" id="pdf-download-${pillarKey}" class="admin-form-control" value="${escapeHtml(item.downloadName || "")}" placeholder="Contoh: Modul-KARSA-Arutala.pdf">
          </div>

          <div>
            <label style="font-size: 0.82rem; font-weight: 700; color: #334155; margin-bottom: 6px; display: block;">
              Status Penayangan:
            </label>
            <select id="pdf-status-${pillarKey}" class="admin-form-control" style="font-weight: 700;">
              <option value="active" ${item.status === "active" ? "selected" : ""}>Aktif &amp; Terbuka untuk Pengunjung</option>
              <option value="draft" ${item.status === "draft" ? "selected" : ""}>Draft / Hanya Terbaca Admin</option>
            </select>
          </div>
        </div>

        <!-- Footer Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid #F1F5F9; flex-wrap: wrap; gap: 10px;">
          <div style="font-size: 0.76rem; color: #94A3B8;">
            Terakhir disimpan: <strong>${item.lastUpdated || "19 Oktober 2026"}</strong>
          </div>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn-admin-outline" onclick="handleResetPdfPillarSettings('${pillarKey}')" style="font-size: 0.82rem; color: #64748B;">
              Reset ke Berkas Awal
            </button>
            <button type="button" class="btn-admin-primary" onclick="handleSavePdfPillarSettings('${pillarKey}')" style="background: ${item.themeColor}; border-color: ${item.themeColor}; font-size: 0.82rem;">
              Simpan Dokumen ${item.pillarName}
            </button>
          </div>
        </div>
      </div>
    `;
  });

  const bannerZeroUsage = `
    <!-- Zero-Storage Architecture Explanation Banner -->
    <div style="background: linear-gradient(135deg, #0F766E 0%, #115E59 100%); color: #FFFFFF; border-radius: 14px; padding: 22px 24px; margin-bottom: 24px; box-shadow: 0 10px 25px -5px rgba(15, 118, 110, 0.25);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap;">
        <div style="max-width: 650px;">
          <span style="font-size: 0.72rem; font-weight: 800; background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px;">
            Penyimpanan Aman - 0 Bytes Kuota Database
          </span>
          <h3 style="font-size: 1.25rem; font-weight: 800; margin: 8px 0 6px 0; color: #FFFFFF;">
            Arsitektur Bebas Biaya: Database Tidak Akan Pernah Penuh
          </h3>
          <p style="font-size: 0.85rem; line-height: 1.6; margin: 0; color: #CCFBF1;">
            Menyimpan berkas fisik PDF (ukuran 4 MB+) langsung di database gratisan akan menghabiskan kuota dengan cepat. Sistem ARUTALA menggunakan metode Tautan Cloud Cerdas: berkas PDF dapat disimpan di Google Drive gratis (15 GB) atau berkas lokal, sementara database hanya menyimpan teks URL (~150 Bytes). Pengunjung tetap bisa membaca dan mengunduh PDF secara interaktif dan lancar!
          </p>
        </div>

        <div style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 14px 18px; min-width: 200px;">
          <div style="font-size: 0.72rem; color: #99F6E4; font-weight: 700; text-transform: uppercase;">Status Penyimpanan Cloud</div>
          <div style="font-size: 1.35rem; font-weight: 900; color: #FFFFFF; margin: 4px 0;">0 Bytes DB</div>
          <div style="font-size: 0.75rem; color: #E6FFFA;">Kapasitas database tetap 100% longgar</div>
        </div>
      </div>
    </div>
  `;

  const tutorialGuide = `
    <!-- Step by Step Google Drive Guide Card -->
    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; margin-top: 10px;">
      <h4 style="font-size: 0.95rem; font-weight: 800; color: #1E293B; margin-top: 0; margin-bottom: 12px;">
        Panduan Langkah demi Langkah: Cara Mengganti PDF dengan Google Drive
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; font-size: 0.82rem; color: #475569; line-height: 1.5;">
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px;">
          <strong style="color: #0F766E; display: block; margin-bottom: 4px;">1. Unggah PDF ke Drive</strong>
          Buka drive.google.com dengan akun Google Anda, lalu seret berkas PDF modul baru ke dalam folder Drive Anda.
        </div>
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px;">
          <strong style="color: #0F766E; display: block; margin-bottom: 4px;">2. Atur Akses Publik</strong>
          Klik kanan berkas PDF di Drive &rarr; pilih <strong>Bagikan (Share)</strong> &rarr; ubah Akses Umum menjadi <strong>Siapa saja yang memiliki link</strong>.
        </div>
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px;">
          <strong style="color: #0F766E; display: block; margin-bottom: 4px;">3. Salin &amp; Tempel Link</strong>
          Klik <strong>Salin Link (Copy link)</strong>, lalu tempelkan link tersebut ke kolom URL pilar di atas.
        </div>
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px;">
          <strong style="color: #0F766E; display: block; margin-bottom: 4px;">4. Uji &amp; Simpan</strong>
          Klik <strong>Uji Penampil PDF</strong> untuk memastikan dokumen terbaca, lalu klik <strong>Simpan</strong>. Selesai!
        </div>
      </div>
    </div>
  `;

  container.innerHTML = bannerZeroUsage + cardsHtml + tutorialGuide;
}

function testOpenPdfViewer(pillarKey) {
  const urlInput = document.getElementById(`pdf-url-${pillarKey}`);
  const currentUrl = urlInput ? urlInput.value.trim() : "";
  const pdfSettings = getPdfSettings();
  const config = pdfSettings[pillarKey] || {};
  const targetUrl = currentUrl || config.pdfUrl || "";

  if (!targetUrl) {
    alert("Silakan masukkan URL atau nama berkas PDF terlebih dahulu.");
    return;
  }

  const converted = convertPdfUrl(targetUrl);
  const modal = document.getElementById("admin-pdf-preview-modal");
  const iframe = document.getElementById("admin-pdf-preview-iframe");
  const titleEl = document.getElementById("admin-pdf-preview-title");
  const subEl = document.getElementById("admin-pdf-preview-sub");
  const noteEl = document.getElementById("admin-pdf-preview-note");

  if (titleEl) titleEl.textContent = `Uji Penampil PDF: ${config.pillarName || pillarKey.toUpperCase()}`;
  if (subEl) subEl.textContent = `Sumber: ${converted.displaySource} - ${targetUrl}`;
  if (noteEl) noteEl.textContent = `Tautan diverifikasi (${converted.displaySource}). Dokumen akan tampil di halaman ${config.pageName || "publik"}.`;
  if (iframe) iframe.src = converted.embedUrl;

  if (modal) modal.style.display = "flex";
}

function closeAdminPdfPreviewModal() {
  const modal = document.getElementById("admin-pdf-preview-modal");
  const iframe = document.getElementById("admin-pdf-preview-iframe");
  if (iframe) iframe.src = "about:blank";
  if (modal) modal.style.display = "none";
}

function handleSavePdfPillarSettings(pillarKey) {
  const allSettings = getPdfSettings();
  const existing = allSettings[pillarKey] || {};

  const titleVal = document.getElementById(`pdf-title-${pillarKey}`)?.value.trim() || existing.title || "";
  const subtitleVal = document.getElementById(`pdf-subtitle-${pillarKey}`)?.value.trim() || existing.subtitle || "";
  const urlVal = document.getElementById(`pdf-url-${pillarKey}`)?.value.trim() || existing.pdfUrl || "";
  const downloadVal = document.getElementById(`pdf-download-${pillarKey}`)?.value.trim() || existing.downloadName || "";
  const statusVal = document.getElementById(`pdf-status-${pillarKey}`)?.value || "active";

  const updatedPillar = {
    ...existing,
    title: titleVal,
    subtitle: subtitleVal,
    pdfUrl: urlVal,
    downloadName: downloadVal,
    status: statusVal,
    lastUpdated: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  };

  allSettings[pillarKey] = updatedPillar;

  try {
    localStorage.setItem("arutala_pdf_settings", JSON.stringify(allSettings));
  } catch (err) {
    console.error("Gagal menyimpan ke localStorage:", err);
  }

  showToast(`Pengaturan PDF untuk ${existing.pillarName || pillarKey.toUpperCase()} berhasil disimpan!`, "success");
  renderPdfModulesInAdmin();
}

function handleSaveAllPdfSettings() {
  const allSettings = getPdfSettings();
  ["karsa", "nuansa", "temara"].forEach(pillarKey => {
    const existing = allSettings[pillarKey] || {};
    const titleVal = document.getElementById(`pdf-title-${pillarKey}`)?.value.trim();
    const subtitleVal = document.getElementById(`pdf-subtitle-${pillarKey}`)?.value.trim();
    const urlVal = document.getElementById(`pdf-url-${pillarKey}`)?.value.trim();
    const downloadVal = document.getElementById(`pdf-download-${pillarKey}`)?.value.trim();
    const statusVal = document.getElementById(`pdf-status-${pillarKey}`)?.value;

    if (titleVal !== undefined) existing.title = titleVal;
    if (subtitleVal !== undefined) existing.subtitle = subtitleVal;
    if (urlVal !== undefined) existing.pdfUrl = urlVal;
    if (downloadVal !== undefined) existing.downloadName = downloadVal;
    if (statusVal !== undefined) existing.status = statusVal;
    existing.lastUpdated = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    allSettings[pillarKey] = existing;
  });

  try {
    localStorage.setItem("arutala_pdf_settings", JSON.stringify(allSettings));
  } catch (err) {
    console.error("Gagal menyimpan ke localStorage:", err);
  }

  showToast("Semua pengaturan dokumen PDF 3 pilar berhasil disimpan!", "success");
  renderPdfModulesInAdmin();
}

function handleResetPdfPillarSettings(pillarKey) {
  const config = DEFAULT_PDF_SETTINGS[pillarKey];
  if (!config) return;

  if (confirm(`Kembalikan dokumen PDF ${config.pillarName} ke berkas awal bawaan (${config.defaultLocalFile})?`)) {
    const allSettings = getPdfSettings();
    allSettings[pillarKey] = { ...DEFAULT_PDF_SETTINGS[pillarKey] };
    try {
      localStorage.setItem("arutala_pdf_settings", JSON.stringify(allSettings));
    } catch (e) {}
    showToast(`Dokumen PDF ${config.pillarName} dikembalikan ke default.`, "normal");
    renderPdfModulesInAdmin();
  }
}

// ==========================================================================
// EXPOSE GLOBAL WINDOW FUNCTIONS (Kompatibilitas onclick & onsubmit)
// ==========================================================================
window.switchTrack = switchTrack;
window.handleHeaderAddAction = handleHeaderAddAction;
window.openCreateModal = openCreateModal;
window.openEditModal = openEditModal;
window.closeModuleModal = closeModuleModal;
window.selectContentType = selectContentType;
window.addQuizQuestionField = addQuizQuestionField;
window.removeQuizQuestionField = removeQuizQuestionField;
window.handleSaveModule = handleSaveModule;
window.handleDeleteItem = handleDeleteItem;
window.moveItemOrder = moveItemOrder;
window.handleResetDefaults = handleResetDefaults;
window.openCreateNuansaVideoModal = openCreateNuansaVideoModal;
window.closeNuansaVideoModal = closeNuansaVideoModal;
window.handleSaveNuansaVideo = handleSaveNuansaVideo;
window.handleDeleteNuansaVideo = handleDeleteNuansaVideo;
window.openAdminVideoPlayer = openAdminVideoPlayer;
window.closeAdminVideoPlayer = closeAdminVideoPlayer;
window.handleAdminLogin = handleAdminLogin;
window.handleAdminLogout = handleAdminLogout;

// Khusus Artikel
window.openAdminArticleModal = openAdminArticleModal;
window.closeAdminArticleModal = closeAdminArticleModal;
window.setArticleCoverPreset = setArticleCoverPreset;
window.handleSaveArticle = handleSaveArticle;
window.handleDeleteArticle = handleDeleteArticle;
window.filterAdminArticlesCategory = filterAdminArticlesCategory;
window.handleAdminArticleSearch = handleAdminArticleSearch;

// Khusus Donasi & QRIS
window.renderDonationsInAdmin = renderDonationsInAdmin;
window.getDonationSettings = getDonationSettings;
window.updateLiveDonationPreview = updateLiveDonationPreview;
window.handleDonationQRISUpload = handleDonationQRISUpload;
window.handleGenerateQuickQR = handleGenerateQuickQR;
window.handleSaveDonationSettings = handleSaveDonationSettings;
window.handleResetDonationSettings = handleResetDonationSettings;
window.testAdminCopyAcc = testAdminCopyAcc;

// Khusus Pendaftar Circle (TEMARA)
window.renderFacilitatorsInAdmin = renderFacilitatorsInAdmin;
window.getFacilitatorRegistrations = getFacilitatorRegistrations;
window.openAdminFacilitatorModal = openAdminFacilitatorModal;
window.closeAdminFacilitatorModal = closeAdminFacilitatorModal;
window.handleSaveFacilitatorStatus = handleSaveFacilitatorStatus;
window.handleDeleteFacilitator = handleDeleteFacilitator;
window.handleExportFacilitatorCSV = handleExportFacilitatorCSV;
window.handleFacilitatorSearch = handleFacilitatorSearch;
window.filterFacilitatorsStatus = filterFacilitatorsStatus;

// Khusus Modul & Dokumen PDF
window.renderPdfModulesInAdmin = renderPdfModulesInAdmin;
window.getPdfSettings = getPdfSettings;
window.convertPdfUrl = convertPdfUrl;
window.testOpenPdfViewer = testOpenPdfViewer;
window.closeAdminPdfPreviewModal = closeAdminPdfPreviewModal;
window.handleSavePdfPillarSettings = handleSavePdfPillarSettings;
window.handleSaveAllPdfSettings = handleSaveAllPdfSettings;
window.handleResetPdfPillarSettings = handleResetPdfPillarSettings;




