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
  initAksaraLiveChat();
  initNewDialogModalForm();
  setupAksaraDrawer();
});

// --------------------------------------------------------------------------
// 1. PENGAJUAN DANA PROYEK SOSIAL PEMUDA (FITUR 1) - TANPA FOTO DUMMY
// --------------------------------------------------------------------------
const DEFAULT_ACTIONS_DATA = [];

let ALL_PROJECTS = [];
let CURRENT_PROJECT_FILTER = "all";

async function initAksaraProjects() {
  const container = document.getElementById("aksara-proposals-container") || document.getElementById("aksara-bento-container");
  if (!container) return;

  ALL_PROJECTS = [...DEFAULT_ACTIONS_DATA];

  try {
    if (window.ArutalaDB && typeof window.ArutalaDB.fetchActions === "function") {
      const cloudActions = await window.ArutalaDB.fetchActions();
      if (Array.isArray(cloudActions) && cloudActions.length > 0) {
        const formattedCloud = cloudActions.map(act => ({
          id: act.id,
          ticketId: act.ticketId || act.ticket_id || ("PROP-" + String(act.id).slice(-4)),
          title: act.title,
          category: act.category || "gender",
          categoryLabel: act.categoryLabel || act.category_label || "Aksi Sosial",
          circleName: act.circleName || act.circle_name || act.submitter || "Komunitas Pengusung",
          picName: act.picName || act.pic_name || act.initiator || "PIC Komunitas",
          contact: act.contact || "-",
          email: act.email || "-",
          location: act.location || "Indonesia",
          rawBudget: Number(act.rawBudget || act.budget || 0),
          budgetAmount: act.budgetAmount || (act.budget ? Number(act.budget).toLocaleString('id-ID') : "-"),
          beneficiaries: act.beneficiaries || "Penerima Manfaat",
          duration: act.duration || "1 Bulan",
          description: act.description || "",
          docLink: act.docLink || act.doc_link || "",
          bankInfo: act.bankInfo || act.bank_info || "-",
          status: act.status || "review",
          statusLabel: act.statusLabel || "Menunggu Kurasi Review Tim ARUTALA",
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

  renderAksaraProposals();

  const filterBtns = document.querySelectorAll(".aksara-filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      CURRENT_PROJECT_FILTER = btn.getAttribute("data-filter") || "all";
      renderAksaraProposals();
    });
  });
}

function renderAksaraProposals() {
  const container = document.getElementById("aksara-proposals-container") || document.getElementById("aksara-bento-container");
  if (!container) return;

  const filtered = ALL_PROJECTS.filter(p => {
    if (CURRENT_PROJECT_FILTER === "all") return true;
    return p.category === CURRENT_PROJECT_FILTER || (p.description && p.description.toLowerCase().includes(CURRENT_PROJECT_FILTER));
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="proposals-empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="46" height="46">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h4 class="empty-state-title">Belum Ada Pengajuan Proposal Proyek Sosial</h4>
        <p class="empty-state-desc">
          Komunitas atau kelompok pemudamu memiliki rencana aksi nyata yang membutuhkan pendanaan dan pendampingan? Daftarkan ide proyekmu sekarang untuk ditinjau oleh tim kurator ARUTALA.
        </p>
        <button type="button" class="btn btn-primary btn-pill" onclick="openProposalModal()" style="padding: 12px 26px; font-weight: 700; background: #2F4F87; color: #FFFFFF;">
          + Ajukan Proposal Pendanaan Sekarang
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(prop => {
    const isApproved = prop.status === "approved";
    const statusText = prop.statusLabel || (isApproved ? "Disetujui &amp; Didanai" : "Menunggu Kurasi Review");
    const statusClass = isApproved ? "status-approved" : "status-review";
    const ticket = prop.ticketId || prop.id || "PROP-2026";
    const budgetDisplay = prop.rawBudget ? `Rp ${Number(prop.rawBudget).toLocaleString('id-ID')}` : (prop.budgetAmount || "-");

    return `
      <div class="proposal-card-item">
        <div class="prop-card-header">
          <div class="prop-card-badge-row">
            <span class="prop-badge-cat">${prop.categoryLabel || prop.category || 'Aksi Sosial'}</span>
            <span class="prop-badge-status ${statusClass}">${statusText}</span>
          </div>
          <span class="prop-card-ticket">#${ticket}</span>
        </div>

        <h3 class="prop-card-title">${prop.title}</h3>

        <div class="prop-card-meta-grid">
          <div class="prop-meta-item">
            <span class="prop-meta-label">Komunitas Pengusung</span>
            <strong class="prop-meta-val">${prop.circleName || 'Komunitas ARUTALA'}</strong>
          </div>
          <div class="prop-meta-item">
            <span class="prop-meta-label">Penanggung Jawab (PIC)</span>
            <strong class="prop-meta-val">${prop.picName || '-'} (${prop.contact || '-'})</strong>
          </div>
          <div class="prop-meta-item">
            <span class="prop-meta-label">Lokasi &amp; Penerima Manfaat</span>
            <strong class="prop-meta-val">${prop.location || 'Indonesia'} • ${prop.beneficiaries || '-'}</strong>
          </div>
          <div class="prop-meta-item">
            <span class="prop-meta-label">Nominal Dana Yang Diajukan</span>
            <strong class="prop-meta-val prop-budget-highlight">${budgetDisplay}</strong>
          </div>
        </div>

        <div class="prop-card-desc">
          <p>${prop.description}</p>
        </div>

        <div class="prop-card-footer">
          <span class="prop-card-date">Diajukan: ${prop.date || 'Baru saja'}</span>
          <div>
            ${prop.docLink ? `
              <a href="${prop.docLink}" target="_blank" rel="noopener noreferrer" class="prop-doc-btn">
                Buka Dokumen Proposal &rarr;
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Backward-compatibility alias
function renderBentoProjects() {
  renderAksaraProposals();
}

function initProposalSubmission() {
  const form = document.getElementById("form-submit-proposal");
  const statusBox = document.getElementById("prop-status-box");
  const submitBtn = document.getElementById("btn-submit-proposal");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("prop-title")?.value.trim() || "";
    const category = document.getElementById("prop-category")?.value || "gender";
    const categoryLabel = document.getElementById("prop-category")?.selectedOptions[0]?.text || "Aksi Sosial";
    const location = document.getElementById("prop-location")?.value.trim() || "";
    const initiator = document.getElementById("prop-initiator")?.value.trim() || "";
    const picName = document.getElementById("prop-pic-name")?.value.trim() || initiator;
    const contact = document.getElementById("prop-contact")?.value.trim() || "";
    const email = document.getElementById("prop-email")?.value.trim() || "";
    const budgetRaw = document.getElementById("prop-budget")?.value.trim() || "0";
    const beneficiaries = document.getElementById("prop-beneficiaries")?.value.trim() || "-";
    const duration = document.getElementById("prop-duration")?.value.trim() || "1 Bulan";
    const desc = document.getElementById("prop-desc")?.value.trim() || "";
    const docLink = document.getElementById("prop-doc-link")?.value.trim() || "";
    const bankInfo = document.getElementById("prop-bank-info")?.value.trim() || "-";

    if (!title || !location || !initiator || !picName || !contact || !desc || !budgetRaw) {
      showStatus("Mohon lengkapi seluruh kolom wajib bertanda bintang (*).", "error");
      return;
    }

    const budgetNum = Number(budgetRaw) || 0;
    const ticketId = "PROP-2026-" + Math.floor(1000 + Math.random() * 9000);

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Mengirim Pengajuan Proposal...";
    }

    const payload = {
      title: title,
      ticket_id: ticketId,
      location: location,
      circle_name: initiator,
      submitter: initiator,
      pic_name: picName,
      contact: contact,
      email: email,
      budget: budgetNum,
      beneficiaries: beneficiaries,
      duration: duration,
      doc_link: docLink,
      bank_info: bankInfo,
      status: "review",
      description: desc
    };

    try {
      if (window.ArutalaDB && typeof window.ArutalaDB.insertAction === "function") {
        try {
          await window.ArutalaDB.insertAction(payload);
        } catch (supaErr) {
          console.warn("Supabase insertAction error, fallback to local:", supaErr);
        }
      }

      const newProposalItem = {
        id: "prop-" + Date.now(),
        ticketId: ticketId,
        title: title,
        category: category,
        categoryLabel: categoryLabel,
        location: location,
        circleName: initiator,
        picName: picName,
        contact: contact,
        email: email,
        rawBudget: budgetNum,
        budgetAmount: `Rp ${budgetNum.toLocaleString('id-ID')}`,
        beneficiaries: beneficiaries,
        duration: duration,
        description: desc,
        docLink: docLink,
        bankInfo: bankInfo,
        status: "review",
        statusLabel: "Menunggu Kurasi Review Tim ARUTALA",
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      };

      const existingLocal = JSON.parse(localStorage.getItem("arutala_proposals_local") || "[]");
      existingLocal.unshift(newProposalItem);
      localStorage.setItem("arutala_proposals_local", JSON.stringify(existingLocal));

      ALL_PROJECTS.unshift(newProposalItem);
      renderAksaraProposals();

      showStatus(`<strong>Pengajuan Berhasil Dikirim!</strong><br>No. Tiket: <strong>#${ticketId}</strong>. Tim Kurasi ARUTALA akan menghubungi penanggung jawab (PIC) via WhatsApp (${contact}) dalam 2x24 jam kerja.`, "success");
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
        submitBtn.textContent = "Kirim Pengajuan Proposal Dana →";
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
// 2. PLATFORM DONASI SOSIAL KEMANUSIAAN (CROWDFUNDING ALA KITABISA - FITUR 2)
// --------------------------------------------------------------------------
const AKSARA_SOCIAL_CAMPAIGNS = [
  {
    id: "camp-medis-korban",
    category: "DARURAT KEMANUSIAAN",
    title: "Dana Darurat Medis & Trauma Healing Korban Kekerasan Seksual & KDRT",
    shortTitle: "Bantuan Korban Kekerasan & KDRT",
    organizer: "Layanan Sahabat ARUTALA & Pendamping Hukum",
    verified: true,
    image: "img/circle_mentoring_sebaya.jpg",
    target: 35000000,
    collected: 26250000,
    donorCount: 248,
    daysLeft: 12,
    description: "Biaya visum medis forensik, sewa safe house (rumah aman), pendampingan psikologis intensif, dan bantuan hukum bagi penyintas kekerasan berbasis gender.",
    highlightDoc: "img/circle_mentoring_sebaya.jpg",
    docCaption: "Penyaluran Nyata: Ruang Aman & Konseling Pendampingan Sebaya"
  },
  {
    id: "camp-beasiswa-difabel",
    category: "PENDIDIKAN INKLUSIF",
    title: "Pojok Baca Inklusif, Buku Dongeng & Perlengkapan Kreatif Anak",
    shortTitle: "Pojok Baca & Literasi Anak Komunitas",
    organizer: "Komunitas Relawan Literasi Pemuda ARUTALA",
    verified: true,
    image: "img/pojok_baca_anak.jpg",
    target: 20000000,
    collected: 16400000,
    donorCount: 186,
    daysLeft: 19,
    description: "Pengadaan buku bacaan anak inklusif, alat mewarnai, origami edukatif, dan rak buku pojok baca untuk anak-anak prasejahtera di berbagai pelosok komunitas.",
    highlightDoc: "img/pojok_baca_anak.jpg",
    docCaption: "Penyaluran Nyata: Pojok Baca & Dongeng Bersama Anak Komunitas"
  },
  {
    id: "camp-sembako-lansia",
    category: "PANGAN & DHUAFA",
    title: "Paket Sembako & Nutrisi Lansia Sebatang Kara serta Ibu Tunggal",
    shortTitle: "Sembako Lansia & Ibu Tunggal Dhuafa",
    organizer: "Dapur Berkah ARUTALA Peduli",
    verified: true,
    image: "img/santriwati_galeri_rasulullah.png",
    target: 15000000,
    collected: 12150000,
    donorCount: 142,
    daysLeft: 8,
    description: "Distribusi rutin paket beras, minyak, susu berkalsium, telur, dan santunan langsung kebutuhan harian bagi lansia dhuafa yang hidup sebatang kara.",
    highlightDoc: "img/santriwati_galeri_rasulullah.png",
    docCaption: "Penyaluran Nyata: Pemberdayaan Santriwati & Bantuan Sosial"
  },
  {
    id: "camp-tanggap-bencana",
    category: "TANGGAP BENCANA",
    title: "Dana Siaga Kemanusiaan & Hygiene Kit Darurat Bencana Sosial",
    shortTitle: "Dana Tanggap Darurat & Pengungsi",
    organizer: "Tim Relawan Tanggap Bencana ARUTALA",
    verified: true,
    image: "img/harmoni_pemuda_aljabbar.png",
    target: 25000000,
    collected: 18900000,
    donorCount: 215,
    daysLeft: 25,
    description: "Dana siaga cepat untuk pemenuhan kebutuhan darurat perempuan & anak saat krisis: popok bayi, pembalut, selimut hangat, air bersih, dan posko ramah anak.",
    highlightDoc: "img/harmoni_pemuda_aljabbar.png",
    docCaption: "Penyaluran Nyata: Solidaritas Kemanusiaan Lintas Pemuda"
  }
];

const DEFAULT_DONORS_DATA = [
  {
    id: "don-1",
    donorName: "Hamba Allah (Alumni UIN)",
    amount: 100000,
    targetPackage: "Bantuan Korban Kekerasan & KDRT",
    campaignId: "camp-medis-korban",
    message: "Bismillah untuk biaya visum dan kesembuhan adik kita. Kamu kuat dan tidak sendirian!",
    time: "8 menit lalu",
    initial: "H"
  },
  {
    id: "don-2",
    donorName: "Siti Nurhaliza",
    amount: 50000,
    targetPackage: "Beasiswa & Alat Bantu Difabel Dhuafa",
    campaignId: "camp-beasiswa-difabel",
    message: "Semoga gawai ramah disabilitas ini membuka jalan adik-adik meraih cita-cita. Semangat!",
    time: "35 menit lalu",
    initial: "S"
  },
  {
    id: "don-3",
    donorName: "Fajar Nugraha",
    amount: 25000,
    targetPackage: "Sembako Lansia & Ibu Tunggal Dhuafa",
    campaignId: "camp-sembako-lansia",
    message: "Sedekah untuk nenek dhuafa sebatang kara, semoga sehat selalu dan barokah untuk kita semua.",
    time: "2 jam lalu",
    initial: "F"
  },
  {
    id: "don-4",
    donorName: "dr. Hendra Pratama",
    amount: 150000,
    targetPackage: "Bantuan Korban Kekerasan & KDRT",
    campaignId: "camp-medis-korban",
    message: "Lekas pulih fisik dan psikisnya. Terus dampingi korban sampai tuntas!",
    time: "3 jam lalu",
    initial: "H"
  },
  {
    id: "don-5",
    donorName: "Hamba Allah (Keluarga Berkah)",
    amount: 50000,
    targetPackage: "Dana Tanggap Darurat & Pengungsi",
    campaignId: "camp-tanggap-bencana",
    message: "Semoga saudara kita yang terdampak krisis selalu diberi ketabahan dan perlindungan.",
    time: "5 jam lalu",
    initial: "H"
  }
];

let ACTIVE_CAMPAIGNS = [];
let CURRENT_DONORS = [];
let SELECTED_CAMPAIGN_ID = "camp-medis-korban";
let SELECTED_DONATION_AMOUNT = 10000;

async function initAksaraDonations() {
  const localCamps = JSON.parse(localStorage.getItem("arutala_social_campaigns_local") || "null");
  if (Array.isArray(localCamps) && localCamps.length > 0) {
    ACTIVE_CAMPAIGNS = localCamps;
  } else {
    ACTIVE_CAMPAIGNS = [...AKSARA_SOCIAL_CAMPAIGNS];
  }

  CURRENT_DONORS = [...DEFAULT_DONORS_DATA];

  try {
    if (window.ArutalaDB && typeof window.ArutalaDB.fetchDonations === "function") {
      const cloudDonations = await window.ArutalaDB.fetchDonations();
      if (Array.isArray(cloudDonations) && cloudDonations.length > 0) {
        const formatted = cloudDonations.map(d => ({
          id: d.id,
          donorName: d.donorName || d.donor_name || "Hamba Allah",
          amount: Number(d.amount) || 50000,
          targetPackage: d.targetPackage || d.package_name || "Program Kemanusiaan",
          campaignId: d.campaignId || d.campaign_id || "camp-medis-korban",
          message: d.message || "Semoga bermanfaat dan berkah bagi sesama.",
          time: d.time || "Baru saja",
          initial: (d.donorName || d.donor_name) ? (d.donorName || d.donor_name).charAt(0).toUpperCase() : "H"
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

  renderSocialCampaigns();
  populateCampaignDropdown();
  selectAksaraCampaign(SELECTED_CAMPAIGN_ID, false);
  renderDonorsFeed();
}

function renderSocialCampaigns() {
  const container = document.getElementById("social-campaigns-container");
  if (!container) return;

  container.innerHTML = ACTIVE_CAMPAIGNS.map(camp => {
    const isSelected = camp.id === SELECTED_CAMPAIGN_ID;
    const percent = Math.min(100, Math.round((camp.collected / camp.target) * 100));

    return `
      <div class="social-campaign-card ${isSelected ? 'active-selected' : ''}" id="card-${camp.id}" onclick="selectAksaraCampaign('${camp.id}', true)">
        <div class="campaign-card-thumb-wrap">
          <img src="${camp.image}" alt="${camp.title}" class="campaign-card-thumb-img" loading="lazy">
          <span class="campaign-cat-pill">${camp.category}</span>
          ${isSelected ? `<span class="campaign-selected-badge">Dipilih</span>` : ''}
        </div>
        <div class="campaign-card-content">
          <div class="campaign-verified-row">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Terverifikasi ARUTALA Care</span>
          </div>
          <h4 class="campaign-card-title" title="${camp.title}">${camp.title}</h4>
          <div class="campaign-card-organizer">
            <span>Oleh: <strong>${camp.organizer}</strong></span>
          </div>

          <div class="campaign-card-progress">
            <div class="campaign-card-bar-bg">
              <div class="campaign-card-bar-fill" style="width: ${percent}%;"></div>
            </div>
            <div class="campaign-card-amounts">
              <div>
                <span style="font-size: 0.68rem; color: #64748B; display: block;">Terkumpul:</span>
                <span class="campaign-card-collected">Rp ${camp.collected.toLocaleString('id-ID')}</span>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.68rem; color: #64748B; display: block;">Target:</span>
                <span class="campaign-card-target">Rp ${camp.target.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div class="campaign-card-meta">
              <span>${camp.donorCount} Donatur</span>
              <span style="color: #D97706; font-weight: 700;">${camp.daysLeft} Hari lagi</span>
            </div>
            <button type="button" class="campaign-btn-select">
              ${isSelected ? 'Program Sedang Dipilih' : 'Donasi Program Ini &rarr;'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function populateCampaignDropdown() {
  const select = document.getElementById("don-program-select");
  if (!select) return;

  select.innerHTML = ACTIVE_CAMPAIGNS.map(camp => `
    <option value="${camp.id}" ${camp.id === SELECTED_CAMPAIGN_ID ? 'selected' : ''}>
      ${camp.title} (Terkumpul Rp ${camp.collected.toLocaleString('id-ID')})
    </option>
  `).join("");
}

window.selectAksaraCampaign = function(campaignId, scrollDown) {
  const found = ACTIVE_CAMPAIGNS.find(c => c.id === campaignId);
  if (!found) return;

  SELECTED_CAMPAIGN_ID = campaignId;

  document.querySelectorAll(".social-campaign-card").forEach(card => {
    card.classList.remove("active-selected");
    const badge = card.querySelector(".campaign-selected-badge");
    if (badge) badge.remove();
    const btn = card.querySelector(".campaign-btn-select");
    if (btn) btn.textContent = "Donasi Program Ini →";
  });

  const activeCard = document.getElementById(`card-${campaignId}`);
  if (activeCard) {
    activeCard.classList.add("active-selected");
    const thumbWrap = activeCard.querySelector(".campaign-card-thumb-wrap");
    if (thumbWrap && !thumbWrap.querySelector(".campaign-selected-badge")) {
      const badge = document.createElement("span");
      badge.className = "campaign-selected-badge";
      badge.innerHTML = "Dipilih";
      thumbWrap.appendChild(badge);
    }
    const btn = activeCard.querySelector(".campaign-btn-select");
    if (btn) btn.textContent = "Program Sedang Dipilih";
  }

  const dropdown = document.getElementById("don-program-select");
  if (dropdown) dropdown.value = campaignId;

  const kicker = document.getElementById("active-campaign-badge");
  if (kicker) kicker.textContent = `PROGRAM PILIHAN: ${found.category}`;

  const titleEl = document.getElementById("active-campaign-title");
  if (titleEl) titleEl.textContent = found.title;

  const photoEl = document.getElementById("active-campaign-hero-photo");
  if (photoEl && found.highlightDoc) photoEl.src = found.highlightDoc;

  const captionEl = document.getElementById("active-campaign-photo-caption");
  if (captionEl && found.docCaption) captionEl.textContent = found.docCaption;

  updateAksaraDonationProgress();

  if (scrollDown) {
    const station = document.getElementById("donation-interactive-station");
    if (station) {
      station.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
};

window.onSelectCampaignFromDropdown = function(campaignId) {
  selectAksaraCampaign(campaignId, false);
};

function renderDonorsFeed() {
  const container = document.getElementById("donor-feed-list");
  if (!container) return;

  container.innerHTML = CURRENT_DONORS.slice(0, 6).map(item => `
    <div class="donor-feed-item">
      <div class="donor-avatar" style="background: #2F4F87; color: #FFFFFF;">${item.initial || 'H'}</div>
      <div class="donor-info">
        <div class="donor-name-row">
          <strong class="donor-name">${item.donorName}</strong>
          <span class="donor-amount-badge">Rp ${Number(item.amount).toLocaleString('id-ID')}</span>
        </div>
        <div class="donor-package-tag" style="color: #15803D; font-weight: 700;">${item.targetPackage}</div>
        <p class="donor-message">“${item.message || 'Semoga barokah dan meringankan beban sesama.'}”</p>
        <span class="donor-time">${item.time}</span>
      </div>
    </div>
  `).join("");
}

function updateAksaraDonationProgress() {
  const currentCamp = ACTIVE_CAMPAIGNS.find(c => c.id === SELECTED_CAMPAIGN_ID) || ACTIVE_CAMPAIGNS[0];
  if (!currentCamp) return;

  const target = currentCamp.target;
  const total = currentCamp.collected;
  const percent = Math.min(100, Math.round((total / target) * 100));

  const amountEl = document.getElementById("donation-current-amount");
  const targetEl = document.getElementById("donation-target-amount");
  const barEl = document.getElementById("donation-progress-bar");
  const percentEl = document.getElementById("donation-progress-percent");
  const donorsCountEl = document.getElementById("donation-donors-count");

  if (amountEl) amountEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
  if (targetEl) targetEl.textContent = `Target Rp ${target.toLocaleString('id-ID')}`;
  if (barEl) barEl.style.width = `${percent}%`;
  if (percentEl) percentEl.textContent = `${percent}% Tercapai`;
  if (donorsCountEl) donorsCountEl.textContent = `${currentCamp.donorCount} Donasi Kebaikan`;
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

  const currentCamp = ACTIVE_CAMPAIGNS.find(c => c.id === SELECTED_CAMPAIGN_ID) || ACTIVE_CAMPAIGNS[0];

  const modalAmountEl = document.getElementById("qris-modal-amount");
  const modalDonorEl = document.getElementById("qris-modal-donor");
  const modalProgEl = document.getElementById("qris-modal-program");

  if (modalAmountEl) modalAmountEl.textContent = `Rp ${SELECTED_DONATION_AMOUNT.toLocaleString('id-ID')}`;
  if (modalDonorEl) modalDonorEl.textContent = `Oleh: ${donorName}`;
  if (modalProgEl && currentCamp) modalProgEl.innerHTML = `Peruntukan: <strong>${currentCamp.title}</strong>`;

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
    btn.textContent = "Tersalin!";
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
  const currentCamp = ACTIVE_CAMPAIGNS.find(c => c.id === SELECTED_CAMPAIGN_ID) || ACTIVE_CAMPAIGNS[0];
  const programName = currentCamp ? currentCamp.shortTitle : "Bantuan Kemanusiaan";
  const message = messageInput?.value.trim() || "Infaq kebaikan sosial, semoga membawa berkah dan bermanfaat bagi sesama.";
  const amount = SELECTED_DONATION_AMOUNT;

  const payload = {
    donor_name: donorName,
    name: donorName,
    amount: amount,
    package_name: programName,
    package: programName,
    campaign_id: SELECTED_CAMPAIGN_ID,
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

    if (currentCamp) {
      currentCamp.collected += amount;
      currentCamp.donorCount += 1;
      localStorage.setItem("arutala_social_campaigns_local", JSON.stringify(ACTIVE_CAMPAIGNS));
    }

    const newDonItem = {
      id: "don-" + Date.now(),
      donorName: donorName,
      amount: amount,
      targetPackage: programName,
      campaignId: SELECTED_CAMPAIGN_ID,
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
    renderSocialCampaigns();

    closeQRISPaymentModal();
    alert(`Terima kasih banyak, ${donorName}! Konfirmasi donasi sebesar Rp ${amount.toLocaleString('id-ID')} untuk '${currentCamp.title}' telah tercatat di transparansi ARUTALA Peduli.`);

    if (nameInput) nameInput.value = "";
    if (messageInput) messageInput.value = "";
    const anonCheckbox = document.getElementById("don-anonymous-checkbox");
    if (anonCheckbox) anonCheckbox.checked = false;
    if (nameInput) nameInput.disabled = false;
  } catch (e) {
    console.error("Donation confirmation error:", e);
    alert("Gagal mencatat konfirmasi donasi.");
  }
};

// --------------------------------------------------------------------------
// 3. RUANG DIALOG & LIVE CHAT LINTAS KEBERAGAMAN (FITUR 3 REAL-TIME)
// --------------------------------------------------------------------------
const DEFAULT_AKSARA_CHATS = [
  {
    id: "chat-aksara-1",
    senderName: "Rian Satria",
    senderRole: "peserta",
    roleLabel: "Kader Kampus",
    avatarInitial: "RS",
    time: "13:40 WIB",
    text: "Halo kawan-kawan! Mau minta saran dong, di organisasi kami di kampus sering ada candaan bernada seksis saat rapat proker. Gimana cara menegurnya secara elegan tanpa bikin suasana jadi canggung atau memicu konflik ya?",
    likes: 6,
    isLiked: false,
    replyTo: null
  },
  {
    id: "chat-aksara-2",
    senderName: "Fasilitator Sebaya ARUTALA",
    senderRole: "facilitator",
    roleLabel: "Fasilitator Sebaya",
    avatarInitial: "FA",
    time: "13:42 WIB",
    text: "Halo Rian! Terima kasih sudah mengangkat ini. Coba gunakan metode 'Call in, bukan Call out'. Ajak ia ngobrol santai empat mata setelah rapat, fokus ke perasaan dan kenyamanan kawan lain, bukan menghakimi karakternya. Sampaikan: 'Eh bro, guyonan tadi agak bikin kawan-kawan gak nyaman lho, ruang rapat kita kan rumah aman bersama'.",
    likes: 18,
    isLiked: false,
    replyTo: {
      name: "Rian Satria",
      text: "Gimana cara menegurnya secara elegan tanpa bikin suasana jadi canggung..."
    }
  },
  {
    id: "chat-aksara-3",
    senderName: "Fatimah Zahra",
    senderRole: "peserta",
    roleLabel: "Mahasiswi UIN",
    avatarInitial: "FZ",
    time: "13:45 WIB",
    text: "Sepakat banget sama masukan kak Fasilitator! Dulu di komisariat saya juga pernah coba cara obrolan santai personal itu, hasilnya jauh lebih diterima dan teman yang bersangkutan justru berterima kasih karena diingatkan secara baik-baik tanpa dipermalukan.",
    likes: 11,
    isLiked: false,
    replyTo: {
      name: "Fasilitator Sebaya ARUTALA",
      text: "Ajak ia ngobrol santai empat mata setelah rapat, fokus ke perasaan dan kenyamanan kawan lain..."
    }
  },
  {
    id: "chat-aksara-4",
    senderName: "Fajar Pratama",
    senderRole: "peserta",
    roleLabel: "Inisiator Komunitas",
    avatarInitial: "FP",
    time: "13:48 WIB",
    text: "Izin bertanya juga kak, untuk proposal proyek sosial di atas, apakah komunitas kami boleh berkolaborasi dengan kawan-kawan pemuda lintas agama dari gereja sekitar untuk aksi bedah sanitasi desa?",
    likes: 8,
    isLiked: false,
    replyTo: null
  },
  {
    id: "chat-aksara-5",
    senderName: "Fasilitator Sebaya ARUTALA",
    senderRole: "facilitator",
    roleLabel: "Fasilitator Sebaya",
    avatarInitial: "FA",
    time: "13:50 WIB",
    text: "Sangat dianjurkan dan dipersilakan, Fajar! Aksi sosial kemanusiaan lintas keyakinan adalah implementasi nyata dari Ukhuwah Wathaniyyah dan prinsip Ta'awun 'alal birri wat taqwa. Silakan langsung submit lewat tombol '+ Ajukan Proyek' di atas ya, tim kurasi kami sangat mendukung inisiatif kolaboratif seperti ini!",
    likes: 22,
    isLiked: false,
    replyTo: {
      name: "Fajar Pratama",
      text: "apakah komunitas kami boleh berkolaborasi dengan kawan-kawan pemuda lintas agama..."
    }
  }
];

let ALL_AKSARA_CHATS = [];
let AKSARA_REPLY_TARGET = null;

function initAksaraLiveChat() {
  const container = document.getElementById("aksara-livechat-container");
  if (!container) return;

  const stored = localStorage.getItem("arutala_livechat_aksara");
  if (stored) {
    try {
      ALL_AKSARA_CHATS = JSON.parse(stored);
    } catch (e) {
      ALL_AKSARA_CHATS = [...DEFAULT_AKSARA_CHATS];
    }
  } else {
    ALL_AKSARA_CHATS = [...DEFAULT_AKSARA_CHATS];
  }

  renderAksaraChatUI();
}

function renderAksaraChatUI() {
  const container = document.getElementById("aksara-livechat-container");
  if (!container) return;

  const savedName = localStorage.getItem("arutala_chat_user_name") || "";

  container.innerHTML = `
    <div class="arutala-live-chat-card">
      <!-- Chat Header -->
      <div class="chat-room-header">
        <div class="chat-room-title-wrap">
          <div class="chat-live-pulse-dot" title="Live Aktif"></div>
          <h3 class="chat-room-name">
            # Ruang-Dialog-Keberagaman
          </h3>
          <span class="chat-room-online-badge">● 28 Pemuda Aktif</span>
        </div>
        <div class="chat-room-tags">
          <span class="chat-room-tag">#KesetaraanGender</span>
          <span class="chat-room-tag">#AntiKekerasan</span>
          <span class="chat-room-tag">#ModerasiBeragama</span>
          <span class="chat-room-tag">#SilihAsahAsihAsuh</span>
        </div>
      </div>

      <!-- Messages Stream -->
      <div class="chat-messages-container" id="aksara-messages-stream">
        ${ALL_AKSARA_CHATS.map(msg => {
          const isFacil = msg.senderRole === "facilitator";
          const avatarClass = isFacil ? "chat-avatar facilitator" : "chat-avatar";
          const roleBadgeClass = isFacil ? "chat-sender-role badge-facil" : "chat-sender-role";
          const roleText = isFacil ? "Fasilitator Sebaya" : (msg.roleLabel || "Peserta");
          const likedClass = msg.isLiked ? "chat-btn-action chat-btn-like liked" : "chat-btn-action chat-btn-like";

          return `
            <div class="chat-message-bubble ${msg.isSelf ? 'is-self' : ''}" id="${msg.id}">
              <div class="${avatarClass}" title="${msg.senderName}">
                ${msg.avatarInitial || msg.senderName.charAt(0).toUpperCase()}
              </div>
              <div class="chat-body">
                <div class="chat-header-row">
                  <span class="chat-sender-name">${escapeAksaraHTML(msg.senderName)}</span>
                  <span class="${roleBadgeClass}">${roleText}</span>
                  <span class="chat-time">${msg.time}</span>
                </div>

                ${msg.replyTo ? `
                  <div class="chat-reply-quote">
                    ↳ Membalas <strong>@${escapeAksaraHTML(msg.replyTo.name)}</strong>: "${escapeAksaraHTML(msg.replyTo.text)}"
                  </div>
                ` : ""}

                <p class="chat-text">${escapeAksaraHTML(msg.text)}</p>

                <div class="chat-action-row">
                  <button type="button" class="${likedClass}" onclick="toggleAksaraChatLike('${msg.id}')" title="Sukai tanggapan ini">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="${msg.isLiked ? '#BE185D' : 'none'}" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:3px;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> <span>${msg.likes || 0}</span>
                  </button>
                  <button type="button" class="chat-btn-action" onclick="setAksaraChatReply('${msg.id}')" title="Balas pesan ini">
                    Balas
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <!-- Reply Banner (Jika sedang membalas) -->
      <div class="chat-reply-banner" id="aksara-reply-banner" style="${AKSARA_REPLY_TARGET ? 'display:flex;' : 'display:none;'}">
        <span id="aksara-reply-banner-text">
          ${AKSARA_REPLY_TARGET ? `↳ Membalas <strong>@${escapeAksaraHTML(AKSARA_REPLY_TARGET.name)}</strong>: "${escapeAksaraHTML(AKSARA_REPLY_TARGET.text)}"` : ''}
        </span>
        <button type="button" class="chat-btn-cancel-reply" onclick="cancelAksaraChatReply()" title="Batalkan balasan">Batal</button>
      </div>

      <!-- Input Bar -->
      <form class="chat-input-bar" id="aksara-chat-form" onsubmit="handleSendAksaraChat(event)">
        <div class="chat-input-row-top">
          <input 
            type="text" 
            id="aksara-chat-name-input" 
            class="chat-name-input" 
            placeholder="Nama / Panggilanmu" 
            value="${escapeAksaraHTML(savedName)}" 
            required
            title="Nama pengirim pesan"
          >
          <span style="font-size: 0.74rem; color: #64748B;">
            Berbagi gagasan dan saling menanggapi dengan etika <em>Silih Asih, Silih Asah, Silih Asuh</em>.
          </span>
        </div>
        <div class="chat-input-row-main">
          <input 
            type="text" 
            id="aksara-chat-text-input" 
            class="chat-text-input" 
            placeholder="Tulis pesan atau tanggapanmu di sini... (Tekan Enter untuk kirim)" 
            autocomplete="off" 
            required
          >
          <button type="submit" class="chat-send-btn" id="aksara-chat-send-btn">
            <span>Kirim</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </form>
    </div>
  `;

  scrollAksaraChatToBottom();
}

function scrollAksaraChatToBottom() {
  setTimeout(() => {
    const stream = document.getElementById("aksara-messages-stream");
    if (stream) {
      stream.scrollTop = stream.scrollHeight;
    }
  }, 50);
}

function escapeAksaraHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.handleSendAksaraChat = function(e) {
  if (e) e.preventDefault();

  const nameInput = document.getElementById("aksara-chat-name-input");
  const textInput = document.getElementById("aksara-chat-text-input");

  const nameVal = nameInput ? nameInput.value.trim() : "";
  const textVal = textInput ? textInput.value.trim() : "";

  if (!nameVal) {
    alert("Silakan masukkan nama atau panggilanmu terlebih dahulu.");
    if (nameInput) nameInput.focus();
    return;
  }

  if (!textVal) {
    if (textInput) textInput.focus();
    return;
  }

  // Simpan nama pengguna agar tidak perlu ketik ulang
  localStorage.setItem("arutala_chat_user_name", nameVal);

  // Buat initial
  const initials = nameVal.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "KP";

  // Waktu saat ini
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

  const newChat = {
    id: "chat-aksara-" + Date.now(),
    senderName: nameVal,
    senderRole: "peserta",
    roleLabel: "Peserta Live",
    avatarInitial: initials,
    time: timeStr,
    text: textVal,
    likes: 0,
    isLiked: false,
    isSelf: true,
    replyTo: AKSARA_REPLY_TARGET ? {
      name: AKSARA_REPLY_TARGET.name,
      text: AKSARA_REPLY_TARGET.text
    } : null
  };

  ALL_AKSARA_CHATS.push(newChat);
  localStorage.setItem("arutala_livechat_aksara", JSON.stringify(ALL_AKSARA_CHATS));

  // Reset reply target & text input
  AKSARA_REPLY_TARGET = null;

  renderAksaraChatUI();

  // Kembalikan fokus ke text input
  const newTextInput = document.getElementById("aksara-chat-text-input");
  if (newTextInput) newTextInput.focus();
};

window.setAksaraChatReply = function(msgId) {
  const target = ALL_AKSARA_CHATS.find(m => m.id === msgId);
  if (!target) return;

  const snippet = target.text.length > 60 ? target.text.slice(0, 57) + "..." : target.text;

  AKSARA_REPLY_TARGET = {
    id: target.id,
    name: target.senderName,
    text: snippet
  };

  const banner = document.getElementById("aksara-reply-banner");
  const bannerText = document.getElementById("aksara-reply-banner-text");

  if (banner && bannerText) {
    bannerText.innerHTML = `↳ Membalas <strong>@${escapeAksaraHTML(AKSARA_REPLY_TARGET.name)}</strong>: "${escapeAksaraHTML(AKSARA_REPLY_TARGET.text)}"`;
    banner.style.display = "flex";
  }

  const textInput = document.getElementById("aksara-chat-text-input");
  if (textInput) {
    textInput.placeholder = `Balas pesan @${target.senderName}...`;
    textInput.focus();
  }
};

window.cancelAksaraChatReply = function() {
  AKSARA_REPLY_TARGET = null;
  const banner = document.getElementById("aksara-reply-banner");
  if (banner) banner.style.display = "none";

  const textInput = document.getElementById("aksara-chat-text-input");
  if (textInput) {
    textInput.placeholder = "Tulis pesan atau tanggapanmu di sini... (Tekan Enter untuk kirim)";
  }
};

window.toggleAksaraChatLike = function(msgId) {
  const msg = ALL_AKSARA_CHATS.find(m => m.id === msgId);
  if (!msg) return;

  if (msg.isLiked) {
    msg.isLiked = false;
    msg.likes = Math.max(0, (msg.likes || 1) - 1);
  } else {
    msg.isLiked = true;
    msg.likes = (msg.likes || 0) + 1;
  }

  localStorage.setItem("arutala_livechat_aksara", JSON.stringify(ALL_AKSARA_CHATS));
  renderAksaraChatUI();
};

function initNewDialogModalForm() {
  // Kompatibilitas modal jika dipanggil dari luar
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
