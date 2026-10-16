/**
 * ==========================================================================
 * ARUTALA - Pilar AKSARA Controller (js/aksara.js)
 * Mengelola:
 * 1. Pengajuan Proyek Sosial & Galeri Bento Aksi Nyata (Supabase 'actions')
 * 2. Dukungan dan Donasi Sosial dengan QRIS & Live Doa (Supabase 'donations')
 * 3. Ruang Dialog Lintas Keberagaman / Forum Pemuda (Supabase 'qa_posts')
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  initAksaraProjects();
  initProposalSubmission();
  initAksaraDonations();
  initAksaraDialogForum();
  initNewDialogModalForm();
  setupAksaraDrawer();
});

// --------------------------------------------------------------------------
// 1. PENGAJUAN PROYEK SOSIAL & GALERI BENTO AKSI NYATA (FITUR 1)
// --------------------------------------------------------------------------
const DEFAULT_ACTIONS_DATA = [
  {
    id: "act-1",
    title: "Pojok Literasi & Edukasi Digital Ramah Difabel",
    category: "inklusi",
    categoryLabel: "Inklusi Sosial",
    badge: "Inklusi & Difabel",
    circleName: "Circle UIN Bandung x Komunitas Difabel",
    location: "Cibiru, Kota Bandung",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80",
    description: "Penyediaan modul audio dan gawai ramah disabilitas bagi 45 remaja berkebutuhan khusus untuk memperluas akses literasi keagamaan dan keterampilan digital.",
    date: "10 Oktober 2026"
  },
  {
    id: "act-2",
    title: "Gerakan Santriwati Tanggap Anti-Kekerasan Seksual",
    category: "gender",
    categoryLabel: "Kesetaraan Gender",
    badge: "Kesetaraan Gender",
    circleName: "Fasilitator Sebaya ARUTALA",
    location: "Pesantren Al-Hikmah, Jawa Barat",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80",
    description: "Pelatihan fasilitasi sebaya dan pembentukan posko pengaduan ramah santriwati untuk menciptakan lingkungan pesantren yang aman, adil, dan bermartabat.",
    date: "05 Oktober 2026"
  },
  {
    id: "act-3",
    title: "Dialog Budaya Silih Asah Asuh Pemuda Lintas Iman",
    category: "kemanusiaan",
    categoryLabel: "Solidaritas Kemanusiaan",
    badge: "Lintas Iman & Budaya",
    circleName: "Aliansi Pemuda Bandung Damai",
    location: "Balai Warga Dago, Bandung",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80",
    description: "Sarasehan budaya dan kerja bakti lintas keyakinan untuk merawat tradisi gotong royong dan memutus polarisasi di ruang akar rumput.",
    date: "28 September 2026"
  },
  {
    id: "act-4",
    title: "Aksi Bersih Sungai & Penghijauan Berkelanjutan",
    category: "lingkungan",
    categoryLabel: "Lingkungan Hidup",
    badge: "Kelestarian Alam",
    circleName: "Relawan Hijau ARUTALA",
    location: "Bantaran Sungai Citarum Hulu",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80",
    description: "Menghubungkan nilai Islam menjaga alam (hifzh al-bi'ah) dengan penanaman 500 bibit pohon keras bersama masyarakat setempat.",
    date: "20 September 2026"
  }
];

let ALL_PROJECTS = [];
let CURRENT_PROJECT_FILTER = "all";

async function initAksaraProjects() {
  const container = document.getElementById("aksara-bento-container");
  if (!container) return;

  ALL_PROJECTS = [...DEFAULT_ACTIONS_DATA];

  try {
    if (window.ArutalaDB && typeof window.ArutalaDB.fetchActions === "function") {
      const cloudActions = await window.ArutalaDB.fetchActions();
      if (Array.isArray(cloudActions) && cloudActions.length > 0) {
        const formattedCloud = cloudActions.map(act => ({
          id: act.id,
          title: act.title,
          category: "literasi",
          categoryLabel: "Proyek Terverifikasi",
          badge: act.badge || "Aksi Terverifikasi",
          circleName: act.circleName || act.submitter || "Komunitas ARUTALA",
          location: act.location || "Indonesia",
          image: act.image || "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1000&q=80",
          description: act.description || "",
          date: act.date || "Baru saja"
        }));
        ALL_PROJECTS = [...formattedCloud, ...ALL_PROJECTS];
      }
    }
  } catch (err) {
    console.warn("Supabase fetchActions failed, using fallback:", err);
  }

  const localProposals = JSON.parse(localStorage.getItem("arutala_proposals_local") || "[]");
  if (localProposals.length > 0) {
    ALL_PROJECTS = [...localProposals, ...ALL_PROJECTS];
  }

  renderBentoProjects();

  const filterBtns = document.querySelectorAll(".aksara-filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      CURRENT_PROJECT_FILTER = btn.getAttribute("data-filter") || "all";
      renderBentoProjects();
    });
  });
}

function renderBentoProjects() {
  const container = document.getElementById("aksara-bento-container");
  if (!container) return;

  const filtered = ALL_PROJECTS.filter(p => {
    if (CURRENT_PROJECT_FILTER === "all") return true;
    return p.category === CURRENT_PROJECT_FILTER || (p.description && p.description.toLowerCase().includes(CURRENT_PROJECT_FILTER));
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #F8FAFC; border-radius: 12px; border: 1px dashed #CBD5E1;">
        <h4 style="font-size: 1.1rem; color: #475569; margin-bottom: 8px;">Belum ada proyek dalam kategori ini</h4>
        <p style="color: #64748B; font-size: 0.9rem; margin-bottom: 16px;">Jadilah yang pertama mengajukan inisiatif aksi sosialmu!</p>
        <button type="button" class="btn btn-primary btn-sm btn-pill" onclick="openProposalModal()" style="background: #2F4F87; color: #FFFFFF;">
          + Ajukan Proposal Sekarang
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((act, idx) => {
    const isSpan2 = (idx === 0 || idx === 3);
    const submitter = act.circleName || act.submitter || "Komunitas ARUTALA";
    const loc = act.location || "Jawa Barat";

    return `
      <div class="bento-item ${isSpan2 ? 'bento-span-2' : ''}" onclick="alert('${act.title}\\n\\nLokasi: ${loc}\\nDokumentasi oleh: ${submitter}\\n\\n${act.description}')">
        <div class="bento-media">
          <img src="${act.image}" alt="${act.title}" class="bento-img" loading="lazy">
          <span class="bento-badge">${act.badge || 'Dokumentasi Aksi'}</span>
        </div>
        <div class="bento-overlay">
          <div class="bento-overlay-body">
            <div class="bento-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${loc}</span>
            </div>
            <h3 class="bento-title">${act.title}</h3>
            <p class="bento-description">${act.description}</p>
            <div class="bento-credit">
              <span class="credit-label">Dokumentasi oleh</span>
              <strong class="credit-name">${submitter}</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function initProposalSubmission() {
  const form = document.getElementById("form-submit-proposal");
  const statusBox = document.getElementById("prop-status-box");
  const submitBtn = document.getElementById("btn-submit-proposal");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("prop-title")?.value.trim() || "";
    const category = document.getElementById("prop-category")?.value || "literasi";
    const categoryLabel = document.getElementById("prop-category")?.selectedOptions[0]?.text || "Aksi Sosial";
    const location = document.getElementById("prop-location")?.value.trim() || "";
    const initiator = document.getElementById("prop-initiator")?.value.trim() || "";
    const contact = document.getElementById("prop-contact")?.value.trim() || "";
    const desc = document.getElementById("prop-desc")?.value.trim() || "";
    const budget = document.getElementById("prop-budget")?.value.trim() || "-";

    if (!title || !location || !initiator || !contact || !desc) {
      showStatus("Mohon lengkapi seluruh kolom wajib bertanda bintang (*).", "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Mengirim Proposal...";
    }

    const payload = {
      title: title,
      location: location,
      circle_name: initiator,
      circleName: initiator,
      submitter: initiator,
      image: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1000&q=80",
      description: `[Fokus: ${categoryLabel}] ${desc} (PIC: ${contact} | Estimasi: ${budget})`
    };

    try {
      if (window.ArutalaDB && typeof window.ArutalaDB.insertAction === "function") {
        try {
          await window.ArutalaDB.insertAction(payload);
        } catch (supaErr) {
          console.warn("Supabase insertAction error, fallback to local:", supaErr);
        }
      }

      const newActionItem = {
        id: "prop-" + Date.now(),
        title: title,
        category: category,
        categoryLabel: categoryLabel,
        badge: categoryLabel,
        circleName: initiator,
        location: location,
        image: payload.image,
        description: desc,
        date: "Baru saja diajukan"
      };

      const existingLocal = JSON.parse(localStorage.getItem("arutala_proposals_local") || "[]");
      existingLocal.unshift(newActionItem);
      localStorage.setItem("arutala_proposals_local", JSON.stringify(existingLocal));

      ALL_PROJECTS.unshift(newActionItem);
      renderBentoProjects();

      showStatus("✓ Proposal Berhasil Diajukan! Tim Kurasi ARUTALA akan meninjau dan menghubungi kontak penanggung jawab dalam 2x24 jam.", "success");
      form.reset();

      setTimeout(() => {
        closeProposalModal();
        if (statusBox) statusBox.style.display = "none";
      }, 2500);
    } catch (err) {
      console.error("Error submitting proposal:", err);
      showStatus("Terjadi gangguan jaringan saat mengirim proposal. Silakan coba kembali.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Kirim Proposal Proyek Sosial";
      }
    }
  });

  function showStatus(msg, type) {
    if (!statusBox) return;
    statusBox.style.display = "block";
    statusBox.style.backgroundColor = type === "success" ? "#DCFCE7" : "#FEE2E2";
    statusBox.style.color = type === "success" ? "#166534" : "#991B1B";
    statusBox.style.border = type === "success" ? "1px solid #86EFAC" : "1px solid #FCA5A5";
    statusBox.innerHTML = msg;
  }
}

// --------------------------------------------------------------------------
// 2. DUKUNGAN DAN DONASI SOSIAL DENGAN QRIS RESMI (FITUR 2)
// --------------------------------------------------------------------------
const DEFAULT_DONORS_DATA = [
  {
    id: "don-1",
    donorName: "Hamba Allah (Alumni UIN)",
    amount: 100000,
    targetPackage: "Paket Pendampingan Mentee Sebaya",
    message: "Semoga gerakan ruang aman ini terus meluas dan memberkahi adik-adik mahasiswa.",
    time: "10 menit lalu",
    initial: "H"
  },
  {
    id: "don-2",
    donorName: "Siti Rahmawati",
    amount: 50000,
    targetPackage: "Paket Ruang Belajar Modul",
    message: "Keren banget gagasannya! Semangat untuk tim OASE III PTKIN.",
    time: "1 jam lalu",
    initial: "S"
  },
  {
    id: "don-3",
    donorName: "Fajar Nugraha",
    amount: 25000,
    targetPackage: "Dukungan Aksi Sosial Desa",
    message: "Sedekah pemuda untuk masa depan yang lebih adil dan toleran.",
    time: "3 jam lalu",
    initial: "F"
  }
];

let CURRENT_DONORS = [];
let SELECTED_DONATION_AMOUNT = 10000;

async function initAksaraDonations() {
  const container = document.getElementById("donor-feed-list");
  if (!container) return;

  CURRENT_DONORS = [...DEFAULT_DONORS_DATA];

  try {
    if (window.ArutalaDB && typeof window.ArutalaDB.fetchDonations === "function") {
      const cloudDonations = await window.ArutalaDB.fetchDonations();
      if (Array.isArray(cloudDonations) && cloudDonations.length > 0) {
        const formatted = cloudDonations.map(d => ({
          id: d.id,
          donorName: d.donorName || "Hamba Allah",
          amount: d.amount || 50000,
          targetPackage: d.targetPackage || "Paket Edukasi Pemuda",
          message: d.message || "Semoga bermanfaat untuk gerakan pemuda.",
          time: d.time || "Baru saja",
          initial: d.donorName ? d.donorName.charAt(0).toUpperCase() : "H"
        }));
        CURRENT_DONORS = [...formatted, ...CURRENT_DONORS];
      }
    }
  } catch (err) {
    console.warn("Supabase fetchDonations failed, using fallback:", err);
  }

  const localDons = JSON.parse(localStorage.getItem("arutala_donations_local") || "[]");
  if (localDons.length > 0) {
    CURRENT_DONORS = [...localDons, ...CURRENT_DONORS];
  }

  renderDonorsFeed();
  updateAksaraDonationProgress();
}

function renderDonorsFeed() {
  const container = document.getElementById("donor-feed-list");
  if (!container) return;

  container.innerHTML = CURRENT_DONORS.slice(0, 5).map(item => `
    <div class="donor-feed-item">
      <div class="donor-avatar" style="background: #2F4F87; color: #FFFFFF;">${item.initial || 'H'}</div>
      <div class="donor-info">
        <div class="donor-name-row">
          <strong class="donor-name">${item.donorName}</strong>
          <span class="donor-amount-badge">Rp ${Number(item.amount).toLocaleString('id-ID')}</span>
        </div>
        <div class="donor-package-tag">${item.targetPackage}</div>
        <p class="donor-message">“${item.message || 'Semoga barokah dan bermanfaat bagi sesama.'}”</p>
        <span class="donor-time">${item.time}</span>
      </div>
    </div>
  `).join("");
}

function updateAksaraDonationProgress() {
  const target = 25000000;
  const baseCollected = 18750000;
  const additional = CURRENT_DONORS.reduce((sum, d) => sum + (Number(d.amount) || 0), 0) - DEFAULT_DONORS_DATA.reduce((sum, d) => sum + d.amount, 0);
  const total = Math.max(baseCollected, baseCollected + Math.max(0, additional));
  const percent = Math.min(100, Math.round((total / target) * 100));

  const amountEl = document.getElementById("donation-current-amount");
  const barEl = document.getElementById("donation-progress-bar");
  const percentEl = document.getElementById("donation-progress-percent");

  if (amountEl) amountEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
  if (barEl) barEl.style.width = `${percent}%`;
  if (percentEl) percentEl.textContent = `${percent}% Terkumpul`;
}

window.selectAksaraDonationAmount = function(amt, elem) {
  SELECTED_DONATION_AMOUNT = Number(amt);
  document.querySelectorAll(".donation-pill").forEach(p => p.classList.remove("active"));
  if (elem) elem.classList.add("active");

  const customInput = document.getElementById("custom-donation-amount");
  if (customInput) customInput.value = "";
};

window.handleAksaraCustomDonation = function(input) {
  const val = Number(input.value);
  if (val && val >= 5000) {
    SELECTED_DONATION_AMOUNT = val;
    document.querySelectorAll(".donation-pill").forEach(p => p.classList.remove("active"));
  }
};

window.toggleAksaraAnonymous = function(checkbox) {
  const nameInput = document.getElementById("don-name-input");
  if (!nameInput) return;
  if (checkbox.checked) {
    nameInput.value = "Hamba Allah";
    nameInput.disabled = true;
  } else {
    nameInput.value = "";
    nameInput.disabled = false;
  }
};

window.openQRISPaymentModal = function() {
  const nameInput = document.getElementById("don-name-input");
  const isAnonymous = document.getElementById("don-anonymous-checkbox")?.checked;
  let donorName = nameInput ? nameInput.value.trim() : "";

  if (!donorName && !isAnonymous) {
    alert("Silakan masukkan nama donatur atau centang opsi Hamba Allah.");
    if (nameInput) nameInput.focus();
    return;
  }

  if (isAnonymous || !donorName) {
    donorName = "Hamba Allah";
  }

  const modalAmountEl = document.getElementById("qris-modal-amount");
  const modalDonorEl = document.getElementById("qris-modal-donor");

  if (modalAmountEl) modalAmountEl.textContent = `Rp ${SELECTED_DONATION_AMOUNT.toLocaleString('id-ID')}`;
  if (modalDonorEl) modalDonorEl.textContent = `Oleh: ${donorName}`;

  const modal = document.getElementById("modal-qris-payment");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
};

window.closeQRISPaymentModal = function() {
  const modal = document.getElementById("modal-qris-payment");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
};

window.copyAccountNumber = function(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = "✓ Tersalin!";
    btn.style.background = "#DCFCE7";
    btn.style.color = "#166534";
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = "";
      btn.style.color = "";
    }, 2000);
  });
};

window.confirmDonationComplete = async function() {
  const isAnonymous = document.getElementById("don-anonymous-checkbox")?.checked;
  const nameInput = document.getElementById("don-name-input");
  const messageInput = document.getElementById("don-message-input");

  const donorName = isAnonymous ? "Hamba Allah" : (nameInput?.value.trim() || "Hamba Allah");
  const message = messageInput?.value.trim() || "Infaq kebaikan untuk kemajuan ekosistem pemuda.";
  const amount = SELECTED_DONATION_AMOUNT;

  const payload = {
    donor_name: donorName,
    name: donorName,
    amount: amount,
    package_name: "Paket Dukungan ARUTALA",
    package: "Paket Dukungan ARUTALA",
    message: message,
    is_anonymous: isAnonymous,
    isAnonymous: isAnonymous
  };

  try {
    if (window.ArutalaDB && typeof window.ArutalaDB.insertDonation === "function") {
      try {
        await window.ArutalaDB.insertDonation(payload);
      } catch (err) {
        console.warn("Supabase insertDonation failed, saving locally:", err);
      }
    }

    const newDonItem = {
      id: "don-" + Date.now(),
      donorName: donorName,
      amount: amount,
      targetPackage: "Paket Dukungan ARUTALA",
      message: message,
      time: "Baru saja",
      initial: donorName.charAt(0).toUpperCase()
    };

    const existingLocal = JSON.parse(localStorage.getItem("arutala_donations_local") || "[]");
    existingLocal.unshift(newDonItem);
    localStorage.setItem("arutala_donations_local", JSON.stringify(existingLocal));

    CURRENT_DONORS.unshift(newDonItem);
    renderDonorsFeed();
    updateAksaraDonationProgress();

    closeQRISPaymentModal();
    alert(`✓ Terima kasih banyak, ${donorName}! Konfirmasi donasi sebesar Rp ${amount.toLocaleString('id-ID')} telah tercatat di sistem transparansi ARUTALA.`);

    if (nameInput) nameInput.value = "";
    if (messageInput) messageInput.value = "";
  } catch (e) {
    console.error("Donation confirmation error:", e);
    alert("Gagal mencatat konfirmasi donasi.");
  }
};

// --------------------------------------------------------------------------
// 3. RUANG DIALOG LINTAS KEBERAGAMAN (FORUM Q&A PEMUDA - FITUR 3)
// --------------------------------------------------------------------------
const DEFAULT_QA_DATA = [
  {
    id: "qa-1",
    author: "Rian_UINBdg",
    question: "Bagaimana cara menyikapi teman satu organisasi yang masih sering membuat lelucon seksis di grup tanpa membuat suasana jadi canggung?",
    tags: ["Kesetaraan Gender"],
    upvotes: 14,
    date: "12 Oktober 2026",
    bestAnswer: {
      author: "Fasilitator Sebaya ARUTALA",
      content: "Gunakan pendekatan 'Call in, bukan Call out'. Ajak ia bicara santai secara personal, jelaskan dampak perasaan dari lelucon tersebut tanpa menyerang kepribadiannya. Beritahu bahwa ruang organisasi harus aman dan nyaman bagi semua kader."
    }
  },
  {
    id: "qa-2",
    author: "Fatimah_Santri",
    question: "Apakah prinsip Ukhuwah Wathaniyyah memperbolehkan kita bekerja sama dalam kegiatan sosial kemasyarakatan dengan teman yang berbeda agama?",
    tags: ["Moderasi Beragama"],
    upvotes: 21,
    date: "10 Oktober 2026",
    bestAnswer: {
      author: "Fasilitator Sebaya ARUTALA",
      content: "Sangat dianjurkan! Dalam ranah muamalah dan kemaslahatan umum (kebersihan lingkungan, bantuan bencana, pendidikan), Islam mengajarkan tolong-menolong atas dasar kebaikan (ta'awun 'alal birri wat taqwa) dan memuliakan kemanusiaan."
    }
  },
  {
    id: "qa-3",
    author: "Kawan_Dago",
    question: "Bagaimana mengintegrasikan kearifan lokal 'Silih Asah, Asih, Asuh' ketika kita menghadapi konflik perbedaan pendapat yang memanas di kampus?",
    tags: ["Kearifan Budaya"],
    upvotes: 9,
    date: "08 Oktober 2026",
    bestAnswer: {
      author: "Fasilitator Sebaya ARUTALA",
      content: "Terapkan jeda emosional (Silih Asih), lalu fokus pada substansi masalah untuk saling mencerdaskan bukan saling mengalahkan (Silih Asah), dan akhiri dengan komitmen saling menjaga persahabatan (Silih Asuh)."
    }
  }
];

let ALL_QA_POSTS = [];

async function initAksaraDialogForum() {
  const container = document.getElementById("dialog-feed-container");
  if (!container) return;

  ALL_QA_POSTS = [...DEFAULT_QA_DATA];

  try {
    if (window.ArutalaDB && typeof window.ArutalaDB.fetchQAPosts === "function") {
      const cloudQA = await window.ArutalaDB.fetchQAPosts();
      if (Array.isArray(cloudQA) && cloudQA.length > 0) {
        ALL_QA_POSTS = [...cloudQA, ...ALL_QA_POSTS];
      }
    }
  } catch (err) {
    console.warn("Supabase fetchQAPosts failed, using fallback:", err);
  }

  const localQA = JSON.parse(localStorage.getItem("arutala_qa_local") || "[]");
  if (localQA.length > 0) {
    ALL_QA_POSTS = [...localQA, ...ALL_QA_POSTS];
  }

  renderDialogFeed();
}

function renderDialogFeed() {
  const container = document.getElementById("dialog-feed-container");
  if (!container) return;

  // Render menggunakan struktur Grid resmi css/style.css:
  // Kolom 1 (56px): .qa-vote-col
  // Kolom 2 (1fr): .qa-main-col
  container.innerHTML = ALL_QA_POSTS.map(post => {
    const tag = (post.tags && post.tags[0]) || "Ruang Aman";
    const author = post.author || "Kawan_ARUTALA";
    const date = post.date || "Baru saja";
    const upvotes = post.upvotes || 1;

    return `
      <div class="qa-card" id="qa-post-${post.id}">
        <div class="qa-vote-col">
          <button type="button" class="vote-btn" onclick="upvoteDialogPost('${post.id}')" title="Dukung pertanyaan ini">▲</button>
          <div class="vote-count" id="vote-count-${post.id}">${upvotes}</div>
          <small style="font-size: 0.68rem; color: #64748B;">Suara</small>
        </div>
        <div class="qa-main-col">
          <div class="qa-tags">
            <span class="qa-tag">#${tag}</span>
            <span style="font-size: 0.75rem; color: #64748B; margin-left: auto;">${date} oleh <strong>${author}</strong></span>
          </div>
          <h3>${post.question}</h3>
          ${post.bestAnswer ? `
            <div class="qa-best-answer">
              <strong>💬 Tanggapan Fasilitator Sebaya (${post.bestAnswer.author || 'Tim ARUTALA'}):</strong>
              ${post.bestAnswer.content}
            </div>
          ` : `
            <div style="font-size: 0.82rem; color: #64748B; margin-top: 8px; font-style: italic;">
              Menunggu tanggapan dari fasilitator sebaya...
            </div>
          `}
        </div>
      </div>
    `;
  }).join("");
}

window.upvoteDialogPost = async function(id) {
  const post = ALL_QA_POSTS.find(p => String(p.id) === String(id));
  if (!post) return;

  post.upvotes = (post.upvotes || 1) + 1;
  const countEl = document.getElementById(`vote-count-${id}`);
  if (countEl) countEl.textContent = post.upvotes;

  try {
    if (window.ArutalaDB && typeof window.ArutalaDB.updateQAVote === "function") {
      await window.ArutalaDB.updateQAVote(id, post.upvotes);
    }
  } catch (err) {
    console.warn("Update vote failed on cloud:", err);
  }
};

function initNewDialogModalForm() {
  const form = document.getElementById("form-submit-dialog-modal");
  const submitBtn = document.getElementById("btn-send-dialog");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const author = document.getElementById("dlg-author-modal")?.value.trim() || "Kawan_ARUTALA";
    const tag = document.getElementById("dlg-tag-modal")?.value || "Ruang Aman";
    const question = document.getElementById("dlg-question-modal")?.value.trim() || "";

    if (!question) {
      alert("Silakan tuliskan pertanyaan atau pemantik dialogmu terlebih dahulu!");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Menayangkan...";
    }

    const payload = {
      author: author,
      question: question,
      tag: tag,
      tags: [tag],
      votes: 1,
      answer: "Terima kasih atas pertanyaanmu! Tim fasilitator sebaya sedang meninjau dialog ini untuk memberikan refleksi bersama."
    };

    try {
      if (window.ArutalaDB && typeof window.ArutalaDB.insertQAPost === "function") {
        try {
          await window.ArutalaDB.insertQAPost(payload);
        } catch (supaErr) {
          console.warn("Supabase insertQAPost error, saving locally:", supaErr);
        }
      }

      const newPostItem = {
        id: "qa-" + Date.now(),
        author: author,
        question: question,
        tags: [tag],
        upvotes: 1,
        date: "Baru saja",
        bestAnswer: {
          author: "Fasilitator Sebaya ARUTALA",
          content: "Terima kasih atas pertanyaanmu! Tim fasilitator sebaya sedang meninjau dialog ini untuk memberikan refleksi bersama."
        }
      };

      const existingLocal = JSON.parse(localStorage.getItem("arutala_qa_local") || "[]");
      existingLocal.unshift(newPostItem);
      localStorage.setItem("arutala_qa_local", JSON.stringify(existingLocal));

      ALL_QA_POSTS.unshift(newPostItem);
      renderDialogFeed();

      form.reset();
      closeAskDialogModal();
      alert("✓ Topik dialogmu berhasil ditayangkan di Forum Keberagaman ARUTALA!");
    } catch (err) {
      console.error("Error creating QA post:", err);
      alert("Terjadi kesalahan saat memposting dialog.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Tayangkan ke Forum Dialog";
      }
    }
  });
}

window.openAskDialogModal = function() {
  const modal = document.getElementById("modal-ask-dialog");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
};

window.closeAskDialogModal = function() {
  const modal = document.getElementById("modal-ask-dialog");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
};

window.openProposalModal = function() {
  const modal = document.getElementById("modal-proposal-action");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
};

window.closeProposalModal = function() {
  const modal = document.getElementById("modal-proposal-action");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
};

function setupAksaraDrawer() {
  const toggleBtn = document.getElementById("btn-uss-menu-toggle");
  const closeBtn = document.getElementById("btn-uss-drawer-close");
  const drawer = document.getElementById("uss-side-drawer");
  const overlay = document.getElementById("uss-drawer-overlay");

  if (toggleBtn && drawer && overlay) {
    toggleBtn.addEventListener("click", () => {
      drawer.classList.add("open");
      overlay.style.display = "block";
      document.body.style.overflow = "hidden";
    });
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove("open");
    if (overlay) overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);
}

window.closeAksaraDrawer = function() {
  const drawer = document.getElementById("uss-side-drawer");
  const overlay = document.getElementById("uss-drawer-overlay");
  if (drawer) drawer.classList.remove("open");
  if (overlay) overlay.style.display = "none";
  document.body.style.overflow = "";
};
