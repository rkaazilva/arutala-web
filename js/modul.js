/**
 * ==========================================================================
 * ARUTALA - Dedicated Learning Management System (modul.js)
 * Mengelola ruang belajar mandiri Modul KARSA & Kuis Terpadu Dinamis
 * Terhubung Supabase Cloud & Sinkronisasi Back-Office Admin Studio
 * ==========================================================================
 */

let LMS_STATE = {
  track: (window.ARUTALA_CURRENT_TRACK || (new URLSearchParams(window.location.search).get("track")) || "karsa").toLowerCase(),
  modules: [],
  currentModuleId: null,
  completedModules: [],
  userQuizAnswers: {} // { [questionIdx]: selectedOptIdx }
};

function getTrackTheme(track) {
  const t = (track || "karsa").toLowerCase();
  if (t === "nuansa") {
    return {
      name: "NUANSA",
      accent: "#0369A1",
      accentBg: "#E0F2FE",
      accentBorder: "#BAE6FD",
      badgeText: "#0369A1",
      docLabel: "DOKUMEN RESMI MODUL NUANSA",
      syllabusTitle: "Silabus Pembelajaran NUANSA",
      syllabusSub: "Pilih modul, video, atau kuis untuk belajar"
    };
  } else if (t === "temara") {
    return {
      name: "TEMARA",
      accent: "#B45309",
      accentBg: "#FEF3C7",
      accentBorder: "#FDE68A",
      badgeText: "#B45309",
      docLabel: "DOKUMEN RESMI PANDUAN FASILITATOR TEMARA",
      syllabusTitle: "Silabus Pembelajaran TEMARA",
      syllabusSub: "Pilih modul atau panduan fasilitator"
    };
  } else {
    return {
      name: "KARSA",
      accent: "#2F4F87",
      accentBg: "#EEF3FA",
      accentBorder: "rgba(47, 79, 135, 0.2)",
      badgeText: "#2F4F87",
      docLabel: "DOKUMEN RESMI MODUL KARSA",
      syllabusTitle: "Silabus Pembelajaran KARSA",
      syllabusSub: "Pilih modul atau kuis untuk belajar"
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLmsPlatform();
});

async function initLmsPlatform() {
  // Pastikan track sinkron
  if (window.ARUTALA_CURRENT_TRACK) {
    LMS_STATE.track = window.ARUTALA_CURRENT_TRACK.toLowerCase();
  }

  // 1. Ambil data modul & kuis dari Supabase / Local Storage
  if (window.ArutalaDB && typeof window.ArutalaDB.fetchLmsItems === "function") {
    LMS_STATE.modules = await window.ArutalaDB.fetchLmsItems(LMS_STATE.track);
  } else if (window.ARUTALA_DATA && Array.isArray(window.ARUTALA_DATA.modules)) {
    LMS_STATE.modules = window.ARUTALA_DATA.modules;
  } else {
    LMS_STATE.modules = [];
  }


  // 2. Ambil progres dari LocalStorage
  try {
    const saved = localStorage.getItem(`arutala_completed_${LMS_STATE.track}`);
    if (saved) {
      LMS_STATE.completedModules = JSON.parse(saved);
    }
  } catch (e) {
    LMS_STATE.completedModules = [];
  }

  // 3. Ambil ID modul dari URL Parameter (?id=...)
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = urlParams.get("id");

  if (targetId && LMS_STATE.modules.some(m => String(m.id) === String(targetId))) {
    LMS_STATE.currentModuleId = targetId;
  } else if (LMS_STATE.modules.length > 0) {
    LMS_STATE.currentModuleId = LMS_STATE.modules[0].id;
  }

  // 4. Render Komponen
  updateLmsProgress();
  renderLmsSidebar();
  if (LMS_STATE.currentModuleId) {
    loadModuleContent(LMS_STATE.currentModuleId);
  }

  // 5. Setup Circle Registration Form
  setupLmsCircleRegistration();
}

// ----------------------------------------------------------------------------
// PROGRESS BAR
// ----------------------------------------------------------------------------
function updateLmsProgress() {
  const total = LMS_STATE.modules.length || 1;
  const completed = LMS_STATE.completedModules.length;
  const percent = Math.min(100, Math.round((completed / total) * 100));

  const percentEl = document.getElementById("lms-progress-percent");
  const labelEl = document.getElementById("lms-progress-label");
  const barEl = document.getElementById("lms-progress-bar");

  if (percentEl) percentEl.textContent = `${percent}%`;
  if (labelEl) labelEl.textContent = `${completed} dari ${total} modul & kuis diselesaikan`;
  if (barEl) barEl.style.width = `${percent}%`;
}

// ----------------------------------------------------------------------------
// SIDEBAR SILABUS
// ----------------------------------------------------------------------------
function renderLmsSidebar() {
  const listContainer = document.getElementById("lms-modules-list");
  if (!listContainer) return;

  const theme = getTrackTheme(LMS_STATE.track);
  const sidebarHeaderTitle = document.querySelector(".lms-sidebar-header h4");
  const sidebarHeaderSub = document.querySelector(".lms-sidebar-header span");
  if (sidebarHeaderTitle) sidebarHeaderTitle.textContent = theme.syllabusTitle;
  if (sidebarHeaderSub) sidebarHeaderSub.textContent = theme.syllabusSub;

  listContainer.innerHTML = "";

  LMS_STATE.modules.forEach((mod, index) => {
    const isCompleted = LMS_STATE.completedModules.includes(String(mod.id));
    const isActive = String(mod.id) === String(LMS_STATE.currentModuleId);
    const isQuiz = mod.type === "quiz";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `lms-module-item-btn ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isQuiz ? 'quiz-item-btn' : ''}`;

    let badgeIcon = mod.orderNum || (index + 1);
    if (isCompleted) {
      badgeIcon = "OK";
    } else if (isQuiz) {
      badgeIcon = "KUIS";
    }

    btn.innerHTML = `
      <div class="mod-badge-num">
        ${badgeIcon}
      </div>
      <div class="mod-text-info">
        <span class="mod-code">${mod.code || (isQuiz ? 'KUIS' : 'MOD')} / ${mod.duration || '45 Menit'}</span>
        <span class="mod-title">${mod.title}</span>
      </div>
    `;

    btn.addEventListener("click", () => {
      if (String(mod.id) !== String(LMS_STATE.currentModuleId)) {
        LMS_STATE.currentModuleId = mod.id;
        renderLmsSidebar();
        loadModuleContent(mod.id);
        const workspace = document.getElementById("workspace-modul");
        if (workspace) {
          workspace.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });

    listContainer.appendChild(btn);
  });
}

// ----------------------------------------------------------------------------
// READER CONTENT & QUIZ DISPATCHER
// ----------------------------------------------------------------------------
function loadModuleContent(modId) {
  const mod = LMS_STATE.modules.find(m => String(m.id) === String(modId));
  if (!mod) return;

  const theme = getTrackTheme(LMS_STATE.track);

  // Update URL tanpa reload
  const newUrl = `${window.location.pathname}?id=${encodeURIComponent(mod.id)}`;
  window.history.replaceState({ path: newUrl }, "", newUrl);

  const codeEl = document.getElementById("mod-code");
  const durEl = document.getElementById("mod-duration");
  const titleEl = document.getElementById("mod-title");
  const subEl = document.getElementById("mod-subtitle");
  const bodyEl = document.getElementById("mod-body");
  const pageTitleEl = document.getElementById("lms-page-title");
  const quizPanel = document.getElementById("mod-quiz-panel");

  if (codeEl) {
    codeEl.textContent = mod.code || "MOD";
    codeEl.style.backgroundColor = theme.accentBg;
    codeEl.style.color = theme.accent;
  }
  if (durEl) durEl.textContent = mod.duration || "45 Menit";
  if (titleEl) titleEl.textContent = mod.title;
  if (subEl) subEl.textContent = mod.subtitle || "";
  if (pageTitleEl) pageTitleEl.textContent = `${mod.code || 'MOD'}: ${mod.title} — ARUTALA ${theme.name}`;

  // JIKA TIPE KUIS INTERAKTIF
  if (mod.type === "quiz") {
    if (quizPanel) quizPanel.style.display = "none";
    renderInteractiveMultiQuiz(mod, bodyEl);
    return;
  }

  // JIKA TIPE MODUL BACAAN (Ringkasan + Download PDF + Video)
  if (quizPanel) quizPanel.style.display = "none";
  renderModuleSummaryWithDownload(mod, bodyEl);
}

// ----------------------------------------------------------------------------
// RENDER SUMMARY & DOWNLOAD MODUL (DENGAN VIDEO & TEMA DINAMIS)
// ----------------------------------------------------------------------------
function renderModuleSummaryWithDownload(mod, container) {
  if (!container) return;
  const theme = getTrackTheme(LMS_STATE.track);

  // 1. Embed Video (Jika ada link video)
  let videoEmbedHtml = "";
  if (mod.videoUrl) {
    const embedUrl = formatVideoUrl(mod.videoUrl);
    videoEmbedHtml = `
      <div class="lms-video-embed-wrap">
        <iframe src="${embedUrl}" title="${mod.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    `;
  }

  // 2. Format teks ringkasan materi (dukung multiline & paragraf)
  const paragraphs = (mod.summary || mod.content || "Materi sedang disiapkan oleh fasilitator.")
    .split("\n\n")
    .filter(p => p.trim() !== "");

  const summaryHtml = paragraphs.map(p => {
    if (p.startsWith("<") && p.endsWith(">")) return p;
    return `<p style="font-size: 1.05rem; line-height: 1.75; color: #334155; margin-bottom: 18px;">${p.replace(/\n/g, "<br>")}</p>`;
  }).join("");

  // 3. Download Card dengan Aksen Tema
  const downloadCardHtml = `
    <div class="lms-download-card">
      <div class="download-card-info">
        <div class="download-icon-box" style="background:${theme.accentBg}; color:${theme.accent}; font-weight:800; font-size:0.85rem;">PDF</div>
        <div class="download-card-text">
          <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: ${theme.accent}; display: block; margin-bottom: 2px;">
            ${theme.docLabel}
          </span>
          <h4>${mod.docName || mod.title + '.pdf'}</h4>
          <p>${mod.docSize || 'File PDF Resmi'} - Lengkap dengan silabus, lembar kerja refleksi, dan panduan praktik mandiri.</p>
        </div>
      </div>
      <div>
        ${mod.docUrl ? `
          <a href="${mod.docUrl}" target="_blank" rel="noopener" class="btn-download-pdf" style="background:${theme.accent};">
            <span>Unduh Modul Lengkap (PDF)</span>
          </a>
        ` : `
          <button type="button" class="btn-download-pdf" style="opacity: 0.6; cursor: not-allowed; background:${theme.accent};" title="File PDF sedang dalam proses kurasi">
            <span>PDF Segera Diunggah</span>
          </button>
        `}
      </div>
    </div>
  `;

  // 4. Tombol Selesai Membaca & Lanjut Modul Berikutnya
  const currentIndex = LMS_STATE.modules.findIndex(m => String(m.id) === String(mod.id));
  const hasNext = currentIndex >= 0 && currentIndex < LMS_STATE.modules.length - 1;
  const nextItem = hasNext ? LMS_STATE.modules[currentIndex + 1] : null;

  const nextActionHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 36px; padding-top: 24px; border-top: 1px solid #E2E8F0; flex-wrap: wrap; gap: 14px;">
      <button type="button" class="btn btn-secondary btn-sm" onclick="markCurrentModuleComplete('${mod.id}')" style="background: #F1F5F9; color: #0F172A; border: 1px solid #CBD5E1; font-weight: 700; padding: 10px 18px; border-radius: 8px;">
        ${LMS_STATE.completedModules.includes(String(mod.id)) ? 'Selesai Dibaca' : 'Tandai Selesai Dibaca'}
      </button>

      ${nextItem ? `
        <button type="button" class="btn btn-primary btn-sm" onclick="goToNextModule('${nextItem.id}')" style="background: ${theme.accent}; color: #FFFFFF; font-weight: 700; padding: 10px 22px; border-radius: 8px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
          ${nextItem.type === 'quiz' ? 'Lanjut ke Kuis Evaluasi &rarr;' : 'Lanjut ke Modul Berikutnya &rarr;'}
        </button>
      ` : `
        <span style="font-size: 0.88rem; font-weight: 700; color: #166534;">Kamu telah mencapai akhir silabus ${theme.name}!</span>
      `}
    </div>
  `;

  container.innerHTML = `
    <div class="summary-body-wrap" style="padding: 10px 0;">
      ${videoEmbedHtml}

      <div style="background: ${theme.accentBg}; border-left: 4px solid ${theme.accent}; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
        <span style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: ${theme.accent}; display: block; margin-bottom: 3px;">
          RINGKASAN EKSEKUTIF MATERI (EXECUTIVE SUMMARY)
        </span>
        <p style="font-size: 0.94rem; color: #334155; margin: 0; line-height: 1.5;">
          Pelajari poin-poin inti di bawah ini sebelum mengunduh modul lengkap untuk bahan diskusi kelompok lingkaran sebaya.
        </p>
      </div>

      ${summaryHtml}

      ${downloadCardHtml}

      ${nextActionHtml}
    </div>
  `;
}

function formatVideoUrl(url) {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
}

// ----------------------------------------------------------------------------
// RENDER KUIS INTERAKTIF TERPADU (SLOT KUIS)
// ----------------------------------------------------------------------------
function renderInteractiveMultiQuiz(mod, container) {
  if (!container) return;

  const theme = getTrackTheme(LMS_STATE.track);
  LMS_STATE.userQuizAnswers = {};
  const questions = Array.isArray(mod.questions) ? mod.questions : [];

  if (questions.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 50px 20px; background: #F8FAFC; border-radius: 12px;">
        <h3 style="font-size: 1.2rem; font-weight: 800; color: #0F172A; margin-bottom: 8px;">Soal Kuis Sedang Disiapkan</h3>
        <p style="font-size: 0.9rem; color: #64748B; margin-bottom: 20px;">Admin belum menambahkan butir soal kuis untuk pilar ini.</p>
        <a href="admin.html?track=${LMS_STATE.track}" class="btn btn-primary btn-sm" style="background: ${theme.accent}; color: #FFFFFF;">
          Kelola Soal di Admin Studio &rarr;
        </a>
      </div>
    `;
    return;
  }

  let questionsHtml = "";
  questions.forEach((q, qIdx) => {
    questionsHtml += `
      <div class="lms-single-question-card" id="quiz-card-q-${qIdx}">
        <div class="single-q-header">
          <span class="single-q-number">Pertanyaan ${qIdx + 1} dari ${questions.length}</span>
          <span style="font-size: 0.78rem; color: #64748B;">Bobot 1 Poin</span>
        </div>
        <h4 class="single-q-text">${q.question}</h4>

        <div class="single-q-options">
          ${(q.options || []).map((optText, optIdx) => `
            <label class="single-q-option" id="opt-label-${qIdx}-${optIdx}">
              <input type="radio" name="${LMS_STATE.track}_quiz_q_${qIdx}" value="${optIdx}" onchange="selectUserQuizOption(${qIdx}, ${optIdx})">
              <span class="single-q-option-label">
                <strong>${String.fromCharCode(65 + optIdx)}.</strong> ${optText}
              </span>
            </label>
          `).join("")}
        </div>

        <div class="single-q-explanation" id="expl-box-${qIdx}">
          <strong>Pembahasan:</strong> ${q.explanation || "Jawaban yang benar sesuai dengan modul materi pembelajaran ARUTALA."}
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="lms-multi-quiz-panel">
      <!-- Quiz Header Card -->
      <div class="lms-quiz-summary-card" id="quiz-score-banner" style="background: linear-gradient(135deg, ${theme.accentBg} 0%, #FFFFFF 100%); border-color: ${theme.accentBorder};">
        <div>
          <span style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: ${theme.accent}; display: block; margin-bottom: 4px;">
            EVALUASI AKHIR PILAR ${theme.name}
          </span>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin: 0 0 6px;">
            Uji Pemahaman Mandiri (${questions.length} Butir Soal)
          </h3>
          <p style="font-size: 0.92rem; color: #475569; margin: 0; max-width: 620px; line-height: 1.5;">
            Jawab seluruh pertanyaan pilihan ganda di bawah ini. Skor kelulusan adalah 70%. Nilai dan pembahasan kunci jawaban akan langsung ditampilkan setelah kamu menekan tombol periksa jawaban.
          </p>
        </div>
        <div style="text-align: right;" id="quiz-score-badge-area">
          <div class="quiz-score-badge" style="font-size: 1.8rem; color: ${theme.accent};">${questions.length}</div>
          <div class="quiz-score-label">Total Pertanyaan</div>
        </div>
      </div>

      <!-- Questions List -->
      <form id="form-interactive-quiz" onsubmit="submitInteractiveQuiz(event)">
        ${questionsHtml}

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; flex-wrap: wrap; gap: 16px;">
          <button type="submit" class="btn btn-primary btn-pill" id="btn-submit-all-quiz" style="background: ${theme.accent}; color: #FFFFFF; font-size: 1rem; font-weight: 700; padding: 14px 32px; box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);">
            Periksa &amp; Kumpulkan Jawaban Kuis &rarr;
          </button>
          <button type="button" class="btn btn-secondary btn-pill" id="btn-reset-quiz" onclick="resetInteractiveQuiz()" style="display: none; background: #FFFFFF; border: 1.5px solid #CBD5E1; color: #334155; font-weight: 700; padding: 12px 24px;">
            Ulangi Pengerjaan Kuis
          </button>
        </div>
      </form>
    </div>
  `;
}

function selectUserQuizOption(qIdx, optIdx) {
  LMS_STATE.userQuizAnswers[qIdx] = Number(optIdx);

  // Update UI selected styling
  const currentCard = document.getElementById(`quiz-card-q-${qIdx}`);
  if (currentCard) {
    currentCard.querySelectorAll(".single-q-option").forEach((opt, idx) => {
      if (idx === optIdx) {
        opt.classList.add("selected");
      } else {
        opt.classList.remove("selected");
      }
    });
  }
}

function submitInteractiveQuiz(event) {
  event.preventDefault();
  const currentMod = LMS_STATE.modules.find(m => String(m.id) === String(LMS_STATE.currentModuleId));
  if (!currentMod || !Array.isArray(currentMod.questions)) return;

  const questions = currentMod.questions;
  const answeredCount = Object.keys(LMS_STATE.userQuizAnswers).length;

  if (answeredCount < questions.length) {
    if (!confirm(`Kamu baru menjawab ${answeredCount} dari ${questions.length} pertanyaan. Yakin ingin mengumpulkan sekarang?`)) {
      return;
    }
  }

  // Hitung Skor
  let correctCount = 0;
  questions.forEach((q, qIdx) => {
    const userAns = LMS_STATE.userQuizAnswers[qIdx];
    const correctAns = Number(q.correctIndex);
    const explBox = document.getElementById(`expl-box-${qIdx}`);

    if (explBox) explBox.classList.add("show");

    (q.options || []).forEach((_, optIdx) => {
      const optLabel = document.getElementById(`opt-label-${qIdx}-${optIdx}`);
      if (!optLabel) return;

      // Reset
      optLabel.classList.remove("correct", "wrong");

      if (optIdx === correctAns) {
        optLabel.classList.add("correct");
      } else if (userAns === optIdx && userAns !== correctAns) {
        optLabel.classList.add("wrong");
      }
    });

    if (userAns === correctAns) {
      correctCount++;
    }
  });

  const finalScore = Math.round((correctCount / questions.length) * 100);
  const isPassed = finalScore >= 70;

  // Update Score Banner
  const scoreBanner = document.getElementById("quiz-score-banner");
  const badgeArea = document.getElementById("quiz-score-badge-area");
  if (badgeArea) {
    badgeArea.innerHTML = `
      <div class="quiz-score-badge" style="color: ${isPassed ? '#166534' : '#DC2626'};">${finalScore}%</div>
      <div class="quiz-score-label">${correctCount} dari ${questions.length} Benar (${isPassed ? 'LULUS' : 'REMIDI'})</div>
    `;
  }

  if (scoreBanner) {
    scoreBanner.style.background = isPassed
      ? "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
      : "linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)";
  }

  // Tandai selesai jika lulus
  if (isPassed) {
    markCurrentModuleComplete(currentMod.id);
  }

  // Tampilkan Tombol Reset & Nonaktifkan Radio
  const submitBtn = document.getElementById("btn-submit-all-quiz");
  const resetBtn = document.getElementById("btn-reset-quiz");
  if (submitBtn) submitBtn.style.display = "none";
  if (resetBtn) resetBtn.style.display = "inline-flex";

  const form = document.getElementById("form-interactive-quiz");
  if (form) {
    form.querySelectorAll("input[type='radio']").forEach(r => r.disabled = true);
  }

  // Smooth scroll ke atas skor
  if (scoreBanner) {
    scoreBanner.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function resetInteractiveQuiz() {
  const currentMod = LMS_STATE.modules.find(m => String(m.id) === String(LMS_STATE.currentModuleId));
  if (currentMod) {
    loadModuleContent(currentMod.id);
  }
}

// ----------------------------------------------------------------------------
// NAVIGATION & COMPLETION HELPERS
// ----------------------------------------------------------------------------
function markCurrentModuleComplete(modId) {
  const idStr = String(modId);
  if (!LMS_STATE.completedModules.includes(idStr)) {
    LMS_STATE.completedModules.push(idStr);
    try {
      localStorage.setItem(`arutala_completed_${LMS_STATE.track}`, JSON.stringify(LMS_STATE.completedModules));
    } catch (e) {}
    updateLmsProgress();
    renderLmsSidebar();
  }
}

function goToNextModule(nextId) {
  LMS_STATE.currentModuleId = nextId;
  renderLmsSidebar();
  loadModuleContent(nextId);
  const workspace = document.getElementById("workspace-modul");
  if (workspace) {
    workspace.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ----------------------------------------------------------------------------
// CIRCLE REGISTRATION MODAL
// ----------------------------------------------------------------------------
function setupLmsCircleRegistration() {
  const regForm = document.getElementById("form-lms-circle-reg");
  if (!regForm) return;

  regForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("lms-reg-name")?.value || "Kawan Pemuda";
    const role = document.getElementById("lms-reg-role")?.value || "mentee";

    alert(`Terima kasih ${name}! Pendaftaranmu sebagai ${role.toUpperCase()} di ARUTALA Circle telah kami catat.`);
    regForm.reset();
  });
}
