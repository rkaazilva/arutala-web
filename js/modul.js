/**
 * ==========================================================================
 * ARUTALA - Dedicated Learning Management System (modul.js)
 * Mengelola ruang belajar mandiri 7 Modul Kapasitas Pemuda
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  initLmsPlatform();
});

let LMS_STATE = {
  modules: [],
  currentModuleId: 1,
  completedModules: [],
  selectedQuizOption: null
};

function initLmsPlatform() {
  // 1. Ambil modul dari data.js
  LMS_STATE.modules = (window.ARUTALA_DATA && Array.isArray(window.ARUTALA_DATA.modules))
    ? window.ARUTALA_DATA.modules
    : [];

  // 2. Ambil progres dari LocalStorage
  try {
    const saved = localStorage.getItem("arutala_completed_modules");
    if (saved) {
      LMS_STATE.completedModules = JSON.parse(saved);
    }
  } catch (e) {
    LMS_STATE.completedModules = [];
  }

  // 3. Ambil ID modul dari URL Parameter (?id=...)
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = parseInt(urlParams.get("id"), 10);

  if (targetId && LMS_STATE.modules.some(m => m.id === targetId)) {
    LMS_STATE.currentModuleId = targetId;
  } else {
    LMS_STATE.currentModuleId = LMS_STATE.modules[0] ? LMS_STATE.modules[0].id : 1;
  }

  // 4. Render Komponen
  updateLmsProgress();
  renderLmsSidebar();
  loadModuleContent(LMS_STATE.currentModuleId);

  // 5. Setup Kuis Event Listeners
  setupQuizEventListeners();

  // 6. Setup Circle Registration Form
  setupLmsCircleRegistration();
}

function updateLmsProgress() {
  const total = LMS_STATE.modules.length || 7;
  const completed = LMS_STATE.completedModules.length;
  const percent = Math.round((completed / total) * 100);

  const percentEl = document.getElementById("lms-progress-percent");
  const labelEl = document.getElementById("lms-progress-label");
  const barEl = document.getElementById("lms-progress-bar");

  if (percentEl) percentEl.textContent = `${percent}%`;
  if (labelEl) labelEl.textContent = `${completed} dari ${total} modul diselesaikan`;
  if (barEl) barEl.style.width = `${percent}%`;
}

function renderLmsSidebar() {
  const listContainer = document.getElementById("lms-modules-list");
  if (!listContainer) return;

  listContainer.innerHTML = "";

  LMS_STATE.modules.forEach(mod => {
    const isCompleted = LMS_STATE.completedModules.includes(mod.id);
    const isActive = mod.id === LMS_STATE.currentModuleId;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `lms-module-item-btn ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;

    btn.innerHTML = `
      <div class="mod-badge-num">
        ${isCompleted ? '✓' : mod.id}
      </div>
      <div class="mod-text-info">
        <span class="mod-code">${mod.code} • ${mod.duration}</span>
        <span class="mod-title">${mod.title}</span>
      </div>
    `;

    btn.addEventListener("click", () => {
      if (mod.id !== LMS_STATE.currentModuleId) {
        LMS_STATE.currentModuleId = mod.id;
        renderLmsSidebar();
        loadModuleContent(mod.id);
        window.scrollTo({ top: 320, behavior: "smooth" });
      }
    });

    listContainer.appendChild(btn);
  });
}

function loadModuleContent(modId) {
  const mod = LMS_STATE.modules.find(m => m.id === modId);
  if (!mod) return;

  // Update URL tanpa reload
  const newUrl = `${window.location.pathname}?id=${mod.id}`;
  window.history.replaceState({ path: newUrl }, "", newUrl);

  // Update Header Modul
  const codeEl = document.getElementById("mod-code");
  const durEl = document.getElementById("mod-duration");
  const titleEl = document.getElementById("mod-title");
  const subEl = document.getElementById("mod-subtitle");
  const bodyEl = document.getElementById("mod-body");
  const pageTitleEl = document.getElementById("lms-page-title");

  if (codeEl) codeEl.textContent = mod.code;
  if (durEl) durEl.textContent = mod.duration;
  if (titleEl) titleEl.textContent = mod.title;
  if (subEl) subEl.textContent = mod.subtitle;
  if (bodyEl) bodyEl.innerHTML = mod.content;
  if (pageTitleEl) pageTitleEl.textContent = `${mod.code}: ${mod.title} — ARUTALA Learning Hub`;

  // Reset Kuis
  LMS_STATE.selectedQuizOption = null;
  const feedbackBox = document.getElementById("quiz-feedback-box");
  if (feedbackBox) {
    feedbackBox.className = "lms-quiz-feedback";
    feedbackBox.style.display = "none";
    feedbackBox.innerHTML = "";
  }

  const btnNext = document.getElementById("btn-next-module");
  if (btnNext) {
    const isCompleted = LMS_STATE.completedModules.includes(mod.id);
    const hasNext = LMS_STATE.modules.some(m => m.id === mod.id + 1);
    btnNext.style.display = (isCompleted && hasNext) ? "inline-flex" : "none";
  }

  // Render Kuis Soal & Opsi
  const quizText = document.getElementById("quiz-question-text");
  const optsContainer = document.getElementById("quiz-options-container");

  if (mod.quiz && quizText && optsContainer) {
    quizText.textContent = mod.quiz.question;
    optsContainer.innerHTML = "";

    mod.quiz.options.forEach((optText, idx) => {
      const optLabel = document.createElement("label");
      optLabel.className = "lms-quiz-opt";
      optLabel.innerHTML = `
        <input type="radio" name="quiz_opt" value="${idx}">
        <span><strong>${String.fromCharCode(65 + idx)}.</strong> ${optText}</span>
      `;

      optLabel.addEventListener("click", () => {
        document.querySelectorAll(".lms-quiz-opt").forEach(l => l.classList.remove("selected"));
        optLabel.classList.add("selected");
        const radio = optLabel.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        LMS_STATE.selectedQuizOption = idx;
      });

      optsContainer.appendChild(optLabel);
    });
  }
}

function setupQuizEventListeners() {
  const btnSubmit = document.getElementById("btn-submit-quiz");
  const btnNext = document.getElementById("btn-next-module");

  if (btnSubmit) {
    btnSubmit.addEventListener("click", () => {
      const mod = LMS_STATE.modules.find(m => m.id === LMS_STATE.currentModuleId);
      if (!mod || !mod.quiz) return;

      if (LMS_STATE.selectedQuizOption === null) {
        showLmsToast("Silakan pilih salah satu opsi jawaban kuis terlebih dahulu.");
        return;
      }

      const feedbackBox = document.getElementById("quiz-feedback-box");
      const isCorrect = LMS_STATE.selectedQuizOption === mod.quiz.correctIndex;

      if (isCorrect) {
        feedbackBox.className = "lms-quiz-feedback correct";
        feedbackBox.innerHTML = `
          <strong>Jawaban Benar! 🎉</strong><br>
          ${mod.quiz.explanation}
        `;

        // Tandai modul sebagai selesai jika belum
        if (!LMS_STATE.completedModules.includes(mod.id)) {
          LMS_STATE.completedModules.push(mod.id);
          try {
            localStorage.setItem("arutala_completed_modules", JSON.stringify(LMS_STATE.completedModules));
          } catch (e) {}
          updateLmsProgress();
          renderLmsSidebar();
          showLmsToast(`Selamat! Kamu telah menyelesaikan ${mod.code}: ${mod.title}`);
        }

        // Tampilkan tombol modul berikutnya jika masih ada
        const nextMod = LMS_STATE.modules.find(m => m.id === mod.id + 1);
        if (btnNext && nextMod) {
          btnNext.style.display = "inline-flex";
          btnNext.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      } else {
        feedbackBox.className = "lms-quiz-feedback incorrect";
        feedbackBox.innerHTML = `
          <strong>Jawaban Belum Tepat.</strong><br>
          ${mod.quiz.explanation}
        `;
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", () => {
      const nextId = LMS_STATE.currentModuleId + 1;
      if (LMS_STATE.modules.some(m => m.id === nextId)) {
        LMS_STATE.currentModuleId = nextId;
        renderLmsSidebar();
        loadModuleContent(nextId);
        window.scrollTo({ top: 320, behavior: "smooth" });
      }
    });
  }
}

function showLmsToast(message) {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" style="color: #66BB6A; flex-shrink: 0;">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function setupLmsCircleRegistration() {
  const roleMenteeBtn = document.getElementById("lms-role-mentee");
  const roleTutorBtn = document.getElementById("lms-role-tutor");
  const regRoleInput = document.getElementById("lms-reg-role-input");
  const menteeFields = document.getElementById("lms-mentee-fields");
  const tutorFields = document.getElementById("lms-tutor-fields");
  const form = document.getElementById("lms-circle-reg-form");
  const successBox = document.getElementById("lms-circle-reg-success");
  const btnReset = document.getElementById("lms-btn-reset-reg");
  const regInterest = document.getElementById("lms-reg-interest");
  const regExperience = document.getElementById("lms-reg-experience");

  function setLmsRole(role) {
    if (role === "tutor") {
      if (roleTutorBtn) roleTutorBtn.classList.add("active");
      if (roleMenteeBtn) roleMenteeBtn.classList.remove("active");
      if (regRoleInput) regRoleInput.value = "tutor";
      if (menteeFields) menteeFields.style.display = "none";
      if (tutorFields) tutorFields.style.display = "block";
      if (regInterest) { regInterest.required = false; regInterest.disabled = true; }
      if (regExperience) { regExperience.required = true; regExperience.disabled = false; }
    } else {
      if (roleMenteeBtn) roleMenteeBtn.classList.add("active");
      if (roleTutorBtn) roleTutorBtn.classList.remove("active");
      if (regRoleInput) regRoleInput.value = "mentee";
      if (menteeFields) menteeFields.style.display = "block";
      if (tutorFields) tutorFields.style.display = "none";
      if (regInterest) { regInterest.required = true; regInterest.disabled = false; }
      if (regExperience) { regExperience.required = false; regExperience.disabled = true; }
    }
  }

  if (roleMenteeBtn) roleMenteeBtn.addEventListener("click", () => setLmsRole("mentee"));
  if (roleTutorBtn) roleTutorBtn.addEventListener("click", () => setLmsRole("tutor"));

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (form) {
        form.reset();
        form.style.display = "block";
      }
      if (successBox) successBox.style.display = "none";
      setLmsRole("mentee");
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const role = regRoleInput ? regRoleInput.value : "mentee";
      const name = document.getElementById("lms-reg-fullname")?.value.trim() || "Peserta Belajar";
      const ageRange = document.getElementById("lms-reg-age")?.value || "-";
      const institution = document.getElementById("lms-reg-institution")?.value.trim() || "-";
      const contact = document.getElementById("lms-reg-contact")?.value.trim() || "-";
      const interestOrExp = role === "mentee"
        ? (document.getElementById("lms-reg-interest")?.value || "-")
        : (document.getElementById("lms-reg-experience")?.value || "-");
      const commitment = role === "mentee"
        ? "Mengikuti Pendampingan Modul"
        : (document.getElementById("lms-reg-commitment")?.value || "4-weeks");

      const circleId = "ARUTALA-CR-" + Math.floor(1000 + Math.random() * 9000);
      const roleText = role === "mentee" ? "Peserta Belajar (Mentee)" : "Tutor Sebaya / Konselor Pemuda";

      // 1. Simpan ke Supabase Cloud
      if (window.ArutalaDB && typeof window.ArutalaDB.insertRegistration === "function") {
        try {
          await window.ArutalaDB.insertRegistration({
            circle_id: circleId,
            role: role,
            fullname: name,
            age_range: ageRange,
            institution: institution,
            contact: contact,
            interest_or_exp: interestOrExp,
            commitment: commitment
          });
          console.log("Pendaftaran Modul Circle tersimpan ke Supabase Cloud.");
        } catch (err) {
          console.warn("Gagal simpan ke Supabase Cloud, fallback ke lokal:", err);
        }
      }

      // 2. Simpan cadangan ke LocalStorage
      const record = {
        circleId,
        name,
        role: roleText,
        institution,
        source: "modul_page",
        registeredAt: new Date().toLocaleDateString("id-ID")
      };
      try {
        localStorage.setItem("arutala_user_circle", JSON.stringify(record));
      } catch (err) {}

      const successId = document.getElementById("lms-reg-success-id");
      const successName = document.getElementById("lms-reg-success-name");
      const successRole = document.getElementById("lms-reg-success-role");
      const successInst = document.getElementById("lms-reg-success-inst");

      if (successId) successId.textContent = circleId;
      if (successName) successName.textContent = name;
      if (successRole) {
        successRole.textContent = role === "mentee" ? "Peserta Belajar (Mentee)" : "Tutor Sebaya";
        successRole.className = role === "mentee" ? "badge badge-green" : "badge badge-coral";
      }
      if (successInst) successInst.textContent = institution;

      form.style.display = "none";
      if (successBox) successBox.style.display = "block";

      showLmsToast(`Pendaftaran Berhasil! Kamu resmi terdaftar di ${circleId} sebagai ${roleText}.`);
    });
  }
}
