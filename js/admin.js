/**
 * ==========================================================================
 * ARUTALA - Admin Studio LMS Controller (js/admin.js)
 * Mengelola Back-Office Modul, Video, PDF Download & Kuis Dinamis
 * ==========================================================================
 */

let ADMIN_STATE = {
  currentTrack: "karsa", // "karsa" | "nuansa" | "temara"
  trackItems: {
    karsa: [],
    nuansa: [],
    temara: []
  },
  editingItemId: null,
  selectedType: "module", // "module" | "video" | "quiz"
  quizQuestions: []
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
  // Ambil parameter track dari URL jika ada (?track=nuansa atau ?track=nuansa-video)
  const urlParams = new URLSearchParams(window.location.search);
  const trackParam = urlParams.get("track");
  if (trackParam && ["karsa", "nuansa", "temara", "nuansa-video"].includes(trackParam.toLowerCase())) {
    ADMIN_STATE.currentTrack = trackParam.toLowerCase();
  }

  // Setup input live preview untuk upload video NUANSA
  setupAdminVideoUrlListener();

  // Load semua data count untuk badges
  await loadAllTrackCounts();

  // Load dan render track aktif
  await switchTrack(ADMIN_STATE.currentTrack, false);
}

function getNuansaVideosList() {
  let customVideos = [];
  try {
    customVideos = JSON.parse(localStorage.getItem("arutala_custom_videos") || "[]");
  } catch (e) {
    customVideos = [];
  }

  let deletedIds = [];
  try {
    deletedIds = JSON.parse(localStorage.getItem("arutala_deleted_videos") || "[]");
  } catch (e) {
    deletedIds = [];
  }

  const defaultVideos = (window.ARUTALA_DATA && Array.isArray(window.ARUTALA_DATA.videos))
    ? window.ARUTALA_DATA.videos
    : [
        {
          id: "vid-1",
          youtubeId: "VN7talTjE14",
          title: "Video Kampanye: Moderat Sejak Dini — Menjalin Harmoni & Kesetaraan",
          channel: "Kementerian Agama RI",
          duration: "04:15",
          thumbnail: "https://img.youtube.com/vi/VN7talTjE14/hqdefault.jpg",
          takeaways: "Menjelaskan urgensi internalisasi nilai moderasi beragama, toleransi aktif, dan kesetaraan hakiki bagi generasi muda bangsa.",
          category: "Moderasi & Gender",
          videoUrl: "https://www.youtube.com/embed/VN7talTjE14"
        },
        {
          id: "vid-2",
          youtubeId: "gkjvWcuXw9Y",
          title: "HeForShe: Membangun Gerakan Solidaritas Pemuda untuk Keadilan Gender",
          channel: "UN Women Global",
          duration: "11:45",
          thumbnail: "https://img.youtube.com/vi/gkjvWcuXw9Y/hqdefault.jpg",
          takeaways: "Pidato reflektif bersejarah mengenai pentingnya keterlibatan laki-laki sebagai sekutu (allies) dalam kesetaraan gender.",
          category: "Moderasi & Gender",
          videoUrl: "https://www.youtube.com/embed/gkjvWcuXw9Y"
        },
        {
          id: "vid-3",
          youtubeId: "zzWGNlDuTkA",
          title: "Karya Pemuda: Voice of Change — Ruang Aman Bebas Diskriminasi di Kampus",
          channel: "ARUTALA Youth Media",
          duration: "05:18",
          thumbnail: "https://img.youtube.com/vi/zzWGNlDuTkA/hqdefault.jpg",
          takeaways: "Simulasi studi kasus cara pemuda merespons perilaku diskriminatif dan membangun aturan organisasi kemahasiswaan yang inklusif.",
          category: "Inklusivitas Kampus",
          videoUrl: "https://www.youtube.com/embed/zzWGNlDuTkA"
        }
      ];

  // Gabungkan custom dan default yang belum dihapus
  const merged = [
    ...customVideos,
    ...defaultVideos.filter(dv => !customVideos.some(cv => cv.youtubeId === dv.youtubeId || cv.id === dv.id))
  ];

  return merged.filter(v => !deletedIds.includes(v.id) && v.youtubeId !== "dQw4w9WgXcQ");
}

async function loadAllTrackCounts() {
  const tracks = ["karsa", "nuansa", "temara"];
  for (const t of tracks) {
    try {
      const items = await window.ArutalaDB.fetchLmsItems(t);
      ADMIN_STATE.trackItems[t] = items;
      const badge = document.getElementById(`badge-count-${t}`);
      if (badge) badge.textContent = `${items.length} Item`;
    } catch (e) {
      console.warn(`Error loading track ${t}:`, e);
    }
  }

  // Count untuk Video NUANSA
  const videoList = getNuansaVideosList();
  const videoBadge = document.getElementById("badge-count-nuansa-video");
  if (videoBadge) videoBadge.textContent = `${videoList.length} Video`;
}

async function switchTrack(track, shouldPushState = true) {
  ADMIN_STATE.currentTrack = track;

  // 1. Update Tab Buttons UI
  ["karsa", "nuansa", "temara", "nuansa-video"].forEach(t => {
    const tab = document.getElementById(`tab-btn-${t}`);
    if (tab) {
      tab.classList.remove("active-karsa", "active-nuansa", "active-temara", "active-nuansa-video");
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

  if (track === "nuansa-video") {
    // Mode Khusus: Pojok Video NUANSA (Terpisah dari silabus modul)
    if (bannerTitle) bannerTitle.textContent = "Pojok Video Edukasi Sosial-Keagamaan (Pilar NUANSA)";
    if (bannerDesc) bannerDesc.textContent = "Kelola video YouTube edukatif tentang moderasi beragama, kesetaraan gender, dan toleransi. Video yang diunggah di sini tampil di etalase Pojok Video NUANSA (bagian bawah halaman nuansa.html), terpisah dari kurikulum modul.";
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

  // Mode Modul & Kuis Standar (KARSA / NUANSA / TEMARA)
  if (btnReset) btnReset.style.display = "inline-flex";
  if (btnHeaderAddText) btnHeaderAddText.textContent = "+ Tambah Modul / Kuis Baru";
  if (btnCardAddText) btnCardAddText.textContent = "+ Tambah Item";

  if (track === "karsa") {
    if (bannerTitle) bannerTitle.textContent = "Pilar KARSA: Karya, Aktualisasi, dan Ruang Skill";
    if (bannerDesc) bannerDesc.textContent = "Struktur: Ringkasan materi per modul + Tombol Unduh PDF Lengkap + Slot Kuis Interaktif Terpadu di akhir.";
    if (visitBtn) {
      visitBtn.href = "karsa.html";
      visitBtn.textContent = "Buka Tampilan KARSA →";
    }
    if (linkPreview) linkPreview.href = "karsa.html";
    if (trackHeading) trackHeading.textContent = "Daftar Modul & Kuis Aktif (KARSA)";
  } else if (track === "nuansa") {
    if (bannerTitle) bannerTitle.textContent = "Pilar NUANSA: Nilai Ukhuwah, Agama, dan Sosial";
    if (bannerDesc) bannerDesc.textContent = "Struktur Silabus: Ringkasan materi etika keagamaan + Unduh Modul PDF + Kuis Refleksi Etika.";
    if (visitBtn) {
      visitBtn.href = "nuansa.html";
      visitBtn.textContent = "Buka Tampilan NUANSA →";
    }
    if (linkPreview) linkPreview.href = "nuansa.html";
    if (trackHeading) trackHeading.textContent = "Daftar Silabus Modul & Kuis (NUANSA)";
  } else if (track === "temara") {
    if (bannerTitle) bannerTitle.textContent = "Pilar TEMARA: Teman Bermakna Arutala (Kader Fasilitator)";
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
            Hapus
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
  } else {
    openCreateModal();
  }
}

function renderNuansaVideosInAdmin() {
  const container = document.getElementById("admin-modules-list");
  const countBadge = document.getElementById("track-items-count-badge");
  if (!container) return;

  const videoList = getNuansaVideosList();
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
            <img src="${thumb}" alt="${escapeHtml(vid.title)}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.88;">
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
            Hapus
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
    const list = getNuansaVideosList();
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
    if (subEl) subEl.textContent = "Konten video ini akan langsung tampil di etalase Pojok Video NUANSA (bagian bawah nuansa.html).";
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

function handleSaveNuansaVideo(e) {
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

  let customVideos = [];
  try {
    customVideos = JSON.parse(localStorage.getItem("arutala_custom_videos") || "[]");
  } catch (err) {
    customVideos = [];
  }

  const videoObj = {
    id: idField || ("vid-" + Date.now()),
    youtubeId: ytId,
    title: titleVal,
    channel: channelVal,
    duration: "Video Edukasi",
    thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    takeaways: takeawaysVal,
    category: catVal,
    videoUrl: `https://www.youtube.com/embed/${ytId}`
  };

  if (idField) {
    // Mode edit
    const idx = customVideos.findIndex(v => String(v.id) === String(idField));
    if (idx !== -1) {
      customVideos[idx] = videoObj;
    } else {
      customVideos.unshift(videoObj);
    }
  } else {
    // Mode baru
    customVideos.unshift(videoObj);
  }

  localStorage.setItem("arutala_custom_videos", JSON.stringify(customVideos));

  // Sync window memory jika ada
  if (window.ARUTALA_DATA && Array.isArray(window.ARUTALA_DATA.videos)) {
    window.ARUTALA_DATA.videos.unshift(videoObj);
  }

  closeNuansaVideoModal();
  showToast("Video edukasi berhasil disimpan & ditayangkan di Pojok NUANSA!", "success");
  renderNuansaVideosInAdmin();
}

function handleDeleteNuansaVideo(id, encodedTitle) {
  const title = decodeURIComponent(encodedTitle || "Video");
  if (!confirm(`Apakah Anda yakin ingin menghapus video "${title}" dari Pojok NUANSA?`)) {
    return;
  }

  try {
    let customVideos = JSON.parse(localStorage.getItem("arutala_custom_videos") || "[]");
    customVideos = customVideos.filter(v => String(v.id) !== String(id));
    localStorage.setItem("arutala_custom_videos", JSON.stringify(customVideos));
  } catch (e) {}

  // Catat ID yang dihapus agar default video juga tersembunyi jika dihapus
  try {
    const deleted = JSON.parse(localStorage.getItem("arutala_deleted_videos") || "[]");
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem("arutala_deleted_videos", JSON.stringify(deleted));
    }
  } catch (e) {}

  showToast("Video berhasil dihapus dari Pojok NUANSA.", "normal");
  renderNuansaVideosInAdmin();
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

