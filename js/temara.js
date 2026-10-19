/**
 * ==========================================================================
 * ARUTALA - Pilar TEMARA Controller (js/temara.js)
 * Mengelola:
 * 1. Modul dan Panduan Fasilitator (Perangkat Pelaksanaan Circle & Aksi Sosial)
 * 2. Fitur Rekrutmen Fasilitator Sebaya (Integrasi Supabase & Fallback Storage)
 * 3. Mobile Navigation Drawer
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  initTemaraToolkit();
  initTemaraRecruitmentForm();
  setupTemaraDrawer();
  syncPillarPdfDocument("temara");
});

// --------------------------------------------------------------------------
// 1. DATASET MODUL & PANDUAN FASILITATOR (6 PERANGKAT PELAKSANAAN)
// --------------------------------------------------------------------------
const TEMARA_TOOLKIT_DATA = [
  {
    id: "tujuan-kompetensi",
    tabLabel: "01. Tujuan & Kompetensi",
    badge: "Kerangka Standar",
    title: "Tujuan Kegiatan & Standar Kompetensi Fasilitator Sebaya",
    subtitle: "Fondasi Etika dan Kapasitas Utama Fasilitator ARUTALA",
    body: `
      <h4>1. Filosofi dan Tujuan Kaderisasi Fasilitator</h4>
      <p>
        TEMARA dirancang bukan sekadar mencetak panitia kegiatan, melainkan melahirkan <strong>fasilitator sebaya transformatif</strong> yang mampu mendampingi teman sebayanya secara bermakna, empatik, dan bebas prasangka. Fasilitator menjadi jembatan penghubung nilai luhur keagamaan dengan keadilan sosial di ruang nyata.
      </p>

      <h4>2. 5 Standar Kompetensi Fasilitator Sebaya</h4>
      <ul>
        <li><strong>Active & Empathetic Listening:</strong> Kemampuan mendengarkan cerita teman sebaya secara utuh tanpa memotong, menghakimi, atau langsung memberikan ceramah sepihak.</li>
        <li><strong>Safe Space Guardian:</strong> Kemampuan membangun dan memelihara rasa aman psikologis dalam kelompok sehingga setiap orang berani bercerita tanpa takut dihakimi.</li>
        <li><strong>Gender & Diversity Awareness:</strong> Memahami konsep keadilan gender, mitigasi kerentanan, serta menghormati perbedaan latar belakang identitas peserta.</li>
        <li><strong>Moderasi Beragama:</strong> Berpijak pada nilai-nilai rahmah, ukhuwah, dan kemaslahatan bersama tanpa fanatisme sempit.</li>
        <li><strong>Social Action Catalyzer:</strong> Mampu memantik ide kreatif kelompok untuk mewujudkan pembelajaran menjadi proyek aksi sosial nyata.</li>
      </ul>

      <div class="callout-box">
        <h5>Prinsip Emas Fasilitator: Silih Asah, Silih Asih, Silih Asuh</h5>
        <p style="margin: 0; font-size: 0.94rem; color: #334155;">
          Fasilitator bukan guru serba tahu, melainkan teman bertumbuh yang saling mencerdaskan (asah), mengasihi dengan kehangatan (asih), dan saling mendampingi (asuh).
        </p>
      </div>
    `
  },
  {
    id: "panduan-diskusi",
    tabLabel: "02. Panduan Diskusi Circle",
    badge: "SOP Fasilitasi",
    title: "Panduan Moderasi Lingkaran Diskusi (ARUTALA Circle)",
    subtitle: "Struktur Pelaksanaan Sesi Pendampingan Sebaya yang Aman & Nyaman",
    body: `
      <h4>1. Alur 4 Tahap Sesi ARUTALA Circle (Durasi 60-90 Menit)</h4>
      <ol>
        <li>
          <strong>Tahap 1: Pembukaan &amp; Ground Rules (10-15 Menit)</strong>
          <p>Buka sesi dengan salam hangat. Sepakati 'Perjanjian Ruang Aman': saling mendengarkan, tidak menghakimi, apa yang dibagikan di lingkaran tetap berada di lingkaran (asas kerahasiaan), dan penggunaan kata ganti 'Saya' saat menyampaikan pengalaman pribadi.</p>
        </li>
        <li>
          <strong>Tahap 2: Check-in Cuaca Hati / Emosi (15 Menit)</strong>
          <p>Minta setiap peserta menggambarkan kondisi perasaannya hari ini (misal: 'Hari ini cuaca hati saya mendung berawan karena tugas menumpuk'). Sesi ini mencairkan suasana dan menumbuhkan empati antar-anggota.</p>
        </li>
        <li>
          <strong>Tahap 3: Eksplorasi Tema &amp; Dialog Kontekstual (35-45 Menit)</strong>
          <p>Angkat salah satu modul ARUTALA (misal: Mengenal Batasan Diri / Mengikis Bias Gender / Spirit Rahmah). Fasilitator melempar pertanyaan pemantik terbuka (open-ended question) dan membagi giliran bicara secara setara.</p>
        </li>
        <li>
          <strong>Tahap 4: Refleksi &amp; Komitmen Penutup (15 Menit)</strong>
          <p>Tutup dengan mengajak setiap anggota membagikan 1 hal berharga yang mereka pelajari dan 1 komitmen kecil yang akan dilakukan di minggu ini.</p>
        </li>
      </ol>

      <div class="callout-box">
        <h5>Tips Praktis Menghadapi Peserta Pendiam</h5>
        <p style="margin: 0; font-size: 0.94rem; color: #334155;">
          Jangan memaksa atau menodong peserta yang pemalu di depan umum. Berikan waktu mereka menuliskan gagasannya terlebih dahulu di kertas catatan, lalu tawarkan giliran berbagi secara santai.
        </p>
      </div>
    `
  },
  {
    id: "lembar-aktivitas",
    tabLabel: "03. Lembar Aktivitas",
    badge: "Worksheet Kelompok",
    title: "Lembar Aktivitas Interaktif untuk Peserta Circle",
    subtitle: "Instrumen Praktik Mandiri dan Diskusi Kelompok",
    body: `
      <h4>1. Lembar Kerja: Peta Batasan Diri (Personal Boundaries)</h4>
      <p>
        Aktivitas ini membantu peserta mengenali zona kenyamanan interaksi sosial dan emosional mereka. Peserta menggambar 3 lingkaran konsentris:
      </p>
      <ul>
        <li><strong>Lingkaran Inti (Sangat Personal):</strong> Hal-hal privasi, emosi mendalam, dan nilai inti yang hanya boleh diakses diri sendiri dan orang paling dipercaya.</li>
        <li><strong>Lingkaran Tengah (Ruang Teman &amp; Komunitas):</strong> Interaksi perkuliahan, hobi, dan diskusi organisasi.</li>
        <li><strong>Lingkaran Luar (Ruang Publik / Digital):</strong> Opini umum dan konten publik. Mengetahui kapan harus berkata 'tidak' terhadap hal yang melanggar batas.</li>
      </ul>

      <h4>2. Aktivitas Kelompok: Roda Empati Lintas Perspektif</h4>
      <p>
        Peserta diberikan kartu peran fiktif dengan latar belakang yang berbeda (misal: santri perantau, mahasiswa difabel, korban stereotip gender). Kelompok diajak berdiskusi tentang bagaimana menciptakan fasilitas dan pergaulan yang ramah bagi karakter tersebut.
      </p>
    `
  },
  {
    id: "studi-kasus",
    tabLabel: "04. Studi Kasus Sebaya",
    badge: "Simulasi Nyata",
    title: "Studi Kasus Penanganan Masalah Teman Sebaya",
    subtitle: "Simulasi Tantangan Nyata di Kampus & Komunitas Beserta Respons Etis",
    body: `
      <h4>Kasus 1: Perundungan Daring &amp; Pengucilan Teman</h4>
      <p><strong>Skenario:</strong> Seorang mahasiswi baru menjadi bahan olok-olokan di grup WhatsApp angkatan karena aksen bicaranya dan gaya pakaiannya yang sederhana. Ia menjadi takut masuk kelas dan merasa terisolasi.</p>
      <div class="callout-box">
        <h5>Rekomendasi Langkah Fasilitator Sebaya:</h5>
        <ul>
          <li><strong>Beri Ruang Aman Personal:</strong> Temui ia secara empatik di tempat tenang, dengarkan perasaannya tanpa menyalahkan.</li>
          <li><strong>Peran Active Bystander:</strong> Fasilitator bersama teman sebaya lainnya berani menegur candaan yang merendahkan di grup secara sopan namun tegas.</li>
          <li><strong>Eskalasi Jika Diperlukan:</strong> Jika perundungan berlanjut ke intimidasi fisik/psikis berat, dampingi untuk melapor ke Unit Layanan Terpadu kampus.</li>
        </ul>
      </div>

      <h4>Kasus 2: Bias Gender dalam Pembagian Tugas Kepanitiaan</h4>
      <p><strong>Skenario:</strong> Dalam musyawarah organisasi, anggota perempuan selalu otomatis diarahkan menjadi seksi konsumsi atau sekretaris, sedangkan posisi ketua dan pengambil keputusan strategis dimonopoli laki-laki.</p>
      <div class="callout-box">
        <h5>Rekomendasi Langkah Fasilitator Sebaya:</h5>
        <ul>
          <li>Ajak forum merefleksikan prinsip Al-'Adl: kapasitas kepemimpinan dinilai berdasarkan kompetensi dan komitmen, bukan stereotip gender.</li>
          <li>Dorong rotasi peran dan pendampingan mentor bagi kader perempuan yang ingin maju memimpin.</li>
        </ul>
      </div>
    `
  },
  {
    id: "metode-refleksi",
    tabLabel: "05. Metode Refleksi",
    badge: "Evaluasi Pembelajaran",
    title: "Metode Refleksi Mendalam 4F (Facts, Feelings, Findings, Future)",
    subtitle: "Mengubah Pengalaman Menjadi Kesadaran dan Aksi Nyata",
    body: `
      <h4>Kerangka Kerja Refleksi 4F</h4>
      <p>
        Untuk memastikan proses belajar tidak berhenti sebagai teori hafalan, fasilitator menggunakan kerangka 4F karya Dr. Roger Greenaway:
      </p>
      <ol>
        <li><strong>Facts (Fakta Peristiwa):</strong> Apa kegiatan atau peristiwa nyata yang telah kita jalankan bersama hari ini?</li>
        <li><strong>Feelings (Perasaan):</strong> Bagaimana perasaanmu saat sesi berlangsung? Apakah ada rasa cemas, terinspirasi, lega, atau tertantang?</li>
        <li><strong>Findings (Pembelajaran Berharga):</strong> Wawasan baru apa yang kamu dapatkan mengenai dirimu, temanmu, atau nilai sosial di sekitarmu?</li>
        <li><strong>Future (Aksi Masa Depan):</strong> Apa satu langkah kecil namun nyata yang akan kamu praktikkan setelah meninggalkan ruangan ini?</li>
      </ol>

      <div class="callout-box">
        <h5>Ritual Penutup: Menyalakan Lentera Apresiasi</h5>
        <p style="margin: 0; font-size: 0.94rem; color: #334155;">
          Di akhir sesi, setiap peserta saling menuliskan satu kalimat apresiasi tulus kepada teman di sebelah kanannya. Ini membangun energi positif dan rasa saling memiliki yang mendalam.
        </p>
      </div>
    `
  },
  {
    id: "aksi-sosial",
    tabLabel: "06. Aksi Sosial Lapangan",
    badge: "Social Action Blueprint",
    title: "Petunjuk Pelaksanaan Proyek Aksi Sosial Kemasyarakatan",
    subtitle: "Panduan Lapangan Menggerakkan Inisiatif Komunitas Berkelanjutan",
    body: `
      <h4>1. Siklus Perencanaan Aksi Sosial Pemuda</h4>
      <ul>
        <li><strong>Asesmen Kebutuhan Nyata:</strong> Jangan membuat program berdasarkan asumsi sendiri. Wawancarai warga, remaja desa, atau teman kampus tentang apa kebutuhan mendesak mereka.</li>
        <li><strong>Penyusunan Rencana Aksi Sederhana:</strong> Buat tujuan terukur (SMART), pembagian peran yang adil, jadwal realistis, dan anggaran transparan.</li>
        <li><strong>Kolaborasi Multistakeholder:</strong> Gandeng pengurus masjid, organisasi kampus, aparatur desa, atau komunitas seni setempat.</li>
      </ul>

      <h4>2. SOP Keselamatan &amp; Etika Pelaksanaan Lapangan</h4>
      <ul>
        <li>Menghormati norma adat istiadat dan kearifan lokal setempat.</li>
        <li>Menjamin kegiatan inklusif dan ramah bagi kelompok rentan / difabel.</li>
        <li>Mendokumentasikan kegiatan secara etis (selalu meminta izin sebelum mengambil foto/video warga).</li>
        <li>Melaporkan capaian dan dokumentasi aksi ke platform website ARUTALA.</li>
      </ul>
    `
  }
];

let TEMARA_LMS_ITEMS = [];
let CURRENT_TOOLKIT_INDEX = 0;

async function initTemaraToolkit() {
  const tabsContainer = document.getElementById("toolkit-nav-tabs");
  if (!tabsContainer) return;

  // 1. Ambil data dinamis dari Supabase / Local Storage
  if (window.ArutalaDB && typeof window.ArutalaDB.fetchLmsItems === "function") {
    TEMARA_LMS_ITEMS = await window.ArutalaDB.fetchLmsItems("temara");
  } else {
    TEMARA_LMS_ITEMS = window.ArutalaDB.getDefaultLmsItems("temara");
  }

  tabsContainer.innerHTML = "";
  TEMARA_LMS_ITEMS.forEach((item, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `toolkit-tab-btn ${idx === CURRENT_TOOLKIT_INDEX ? "active" : ""}`;
    btn.textContent = `0${idx + 1}. ${(item.title || "").split(" ")[0]} ${(item.code ? `[${item.code}]` : "")}`;
    btn.addEventListener("click", () => {
      CURRENT_TOOLKIT_INDEX = idx;
      document.querySelectorAll(".toolkit-tab-btn").forEach((b, i) => {
        b.classList.toggle("active", i === idx);
      });
      loadToolkitContent(idx);
    });
    tabsContainer.appendChild(btn);
  });

  loadToolkitContent(0);
}

function loadToolkitContent(idx) {
  const item = TEMARA_LMS_ITEMS[idx];
  if (!item) return;

  const titleEl = document.getElementById("toolkit-title");
  const subEl = document.getElementById("toolkit-sub");
  const catEl = document.getElementById("toolkit-category");
  const bodyEl = document.getElementById("toolkit-content-body");

  if (titleEl) titleEl.textContent = item.title;
  if (subEl) subEl.textContent = item.subtitle || "Perangkat Standar Pelaksanaan Lingkaran Teman Sebaya";
  if (catEl) catEl.textContent = item.duration || "SOP Fasilitator";

  // Ringkasan Materi (Summary)
  const paragraphs = (item.summary || item.content || "Panduan fasilitator sedang disiapkan.")
    .split("\n\n")
    .filter(p => p.trim() !== "");

  const summaryHtml = paragraphs.map(p => {
    if (p.startsWith("<") && p.endsWith(">")) return p;
    return `<p style="font-size: 1.05rem; line-height: 1.75; color: #334155; margin-bottom: 18px;">${p.replace(/\n/g, "<br>")}</p>`;
  }).join("");

  // Download Card
  const downloadCardHtml = `
    <div class="lms-download-card">
      <div class="download-card-info">
        <div class="download-icon-box" style="background:#FEF3C7; color:#B45309; font-weight: 800; font-size: 0.85rem;">PDF</div>
        <div class="download-card-text">
          <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #B45309; display: block; margin-bottom: 2px;">
            DOKUMEN RESMI PANDUAN FASILITATOR TEMARA
          </span>
          <h4>${item.docName || item.title + '.pdf'}</h4>
          <p>${item.docSize || 'File PDF Lengkap'} - Perangkat SOP &amp; panduan pelaksanaan lingkaran sebaya.</p>
        </div>
      </div>
      <div>
        ${item.docUrl ? `
          <a href="${item.docUrl}" target="_blank" rel="noopener" class="btn-download-pdf" style="background:#B45309;">
            <span>Unduh Panduan Lengkap (PDF)</span>
          </a>
        ` : `
          <button type="button" class="btn-download-pdf" style="opacity: 0.6; cursor: not-allowed; background:#B45309;" title="File PDF sedang disiapkan">
            <span>PDF Segera Diunggah</span>
          </button>
        `}
      </div>
    </div>
  `;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="summary-body-wrap">
        <div style="background: #FFFBEB; border-left: 4px solid #B45309; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
          <span style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #B45309; display: block; margin-bottom: 3px;">
            RINGKASAN PERANGKAT &amp; PANDUAN FASILITATOR SEBAYA
          </span>
          <p style="font-size: 0.94rem; color: #334155; margin: 0; line-height: 1.5;">
            Pelajari ringkasan prosedur di bawah ini dan unduh dokumen PDF lengkap untuk panduan operasional di lapangan.
          </p>
        </div>
        ${summaryHtml}
        ${downloadCardHtml}
      </div>
    `;
  }
}


// --------------------------------------------------------------------------
// 2. FITUR REKRUTMEN FASILITATOR SEBAYA (INTEGRASI SUPABASE & LOCAL STORAGE)
// --------------------------------------------------------------------------
function initTemaraRecruitmentForm() {
  const form = document.getElementById("form-rekrutmen-fasilitator");
  const statusBox = document.getElementById("fac-form-status");
  const submitBtn = document.getElementById("btn-submit-fasilitator");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullname = document.getElementById("fac-fullname")?.value.trim() || "";
    const ageRange = document.getElementById("fac-age")?.value || "";
    const institution = document.getElementById("fac-institution")?.value.trim() || "";
    const contact = document.getElementById("fac-contact")?.value.trim() || "";
    const focusPillar = document.getElementById("fac-focus-pillar")?.value || "";
    const experience = document.getElementById("fac-experience")?.value.trim() || "-";
    const motivation = document.getElementById("fac-motivation")?.value.trim() || "";
    const agreement = document.getElementById("fac-agreement")?.checked;

    if (!fullname || !ageRange || !institution || !contact || !motivation) {
      showStatus("Mohon lengkapi seluruh kolom bertanda bintang (*) sebelum mengirim formulir.", "error");
      return;
    }

    if (!agreement) {
      showStatus("Mohon centang pernyataan komitmen Ruang Aman (Safe Space) terlebih dahulu.", "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Mengirim Data Pendaftaran...";
    }

    const payload = {
      circle_id: "temara-kaderisasi",
      circleId: "temara-kaderisasi",
      role: "fasilitator",
      fullname: fullname,
      name: fullname,
      age_range: ageRange,
      ageRange: ageRange,
      institution: institution,
      contact: contact,
      interest_or_exp: `Fokus: ${focusPillar} | Pengalaman: ${experience}`,
      interestOrExp: `Fokus: ${focusPillar} | Pengalaman: ${experience}`,
      commitment: motivation
    };

    try {
      let savedViaSupabase = false;
      if (window.ARUTALA_SUPABASE && typeof window.ARUTALA_SUPABASE.insertRegistration === "function") {
        try {
          const res = await window.ARUTALA_SUPABASE.insertRegistration(payload);
          if (res) savedViaSupabase = true;
        } catch (supaErr) {
          console.warn("Supabase insert registration failed, falling back to local storage:", supaErr);
        }
      }

      // Selalu simpan cadangan ke localStorage
      const existing = JSON.parse(localStorage.getItem("arutala_facilitator_registrations") || "[]");
      existing.push({
        ...payload,
        id: "fac-" + Date.now(),
        createdAt: new Date().toISOString(),
        synced: savedViaSupabase
      });
      localStorage.setItem("arutala_facilitator_registrations", JSON.stringify(existing));

      showStatus(
        `Pendaftaran Fasilitator Berhasil! Terima kasih, <strong>${fullname}</strong>. Data kamu telah tercatat di sistem kaderisasi ARUTALA. Tim Seleksi akan menghubungi melalui WhatsApp di nomor <strong>${contact}</strong> untuk tahap pembekalan.`,
        "success"
      );

      form.reset();
    } catch (err) {
      console.error("Error submitting facilitator recruitment:", err);
      showStatus("Terjadi kesalahan sistem saat mengirim pendaftaran. Silakan coba kembali beberapa saat lagi.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Kirim Formulir Rekrutmen Fasilitator Sebaya";
      }
    }
  });

  function showStatus(message, type) {
    if (!statusBox) return;
    statusBox.style.display = "block";
    if (type === "success") {
      statusBox.style.backgroundColor = "#DCFCE7";
      statusBox.style.color = "#166534";
      statusBox.style.border = "1px solid #86EFAC";
    } else {
      statusBox.style.backgroundColor = "#FEE2E2";
      statusBox.style.color = "#991B1B";
      statusBox.style.border = "1px solid #FCA5A5";
    }
    statusBox.innerHTML = message;
    statusBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// --------------------------------------------------------------------------
// 3. MOBILE NAVIGATION DRAWER
// --------------------------------------------------------------------------
function setupTemaraDrawer() {
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

window.closeTemaraDrawer = function() {
  const drawer = document.getElementById("uss-side-drawer");
  const overlay = document.getElementById("uss-drawer-overlay");
  if (drawer) drawer.classList.remove("open");
  if (overlay) overlay.style.display = "none";
  document.body.style.overflow = "";
};

// --------------------------------------------------------------------------
// SYNC DOKUMEN PDF DENGAN PENGATURAN ADMIN (ZERO-DATABASE USAGE)
// --------------------------------------------------------------------------
function syncPillarPdfDocument(pillarKey) {
  try {
    const raw = localStorage.getItem("arutala_pdf_settings");
    if (!raw) return;
    const allSettings = JSON.parse(raw);
    const config = allSettings[pillarKey];
    if (!config || !config.pdfUrl) return;

    function getConvertedPdfUrls(url) {
      if (!url) return null;
      const trimmed = url.trim();
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
          viewUrl: `https://drive.google.com/file/d/${gdriveId}/view`
        };
      }

      if (trimmed.includes("dropbox.com")) {
        const embed = trimmed.replace("dl=0", "raw=1");
        return { embedUrl: embed, downloadUrl: embed, viewUrl: trimmed };
      }

      const embed = trimmed.includes("#") ? trimmed : `${trimmed}#toolbar=1&navpanes=0&scrollbar=1`;
      return { embedUrl: embed, downloadUrl: trimmed, viewUrl: trimmed };
    }

    const urls = getConvertedPdfUrls(config.pdfUrl);
    if (!urls) return;

    // 1. Update Title and Subtitle if configured
    const titleEl = document.querySelector("#workspace-modul .lms-pdf-header-info h2");
    if (titleEl && config.title) titleEl.textContent = config.title;

    const subEl = document.querySelector("#workspace-modul .lms-pdf-header-info p");
    if (subEl && config.subtitle) subEl.textContent = config.subtitle;

    // 2. Update iframe src
    const iframe = document.querySelector("#workspace-modul iframe.lms-standalone-pdf-frame");
    if (iframe) {
      iframe.src = urls.embedUrl;
      if (config.title) iframe.title = config.title;
    }

    // 3. Update Buka Tab Baru links
    const openLinks = document.querySelectorAll("#workspace-modul a[title='Buka Tab Baru'], #workspace-modul .lms-pdf-mobile-btn-primary");
    openLinks.forEach(link => {
      link.href = urls.viewUrl;
    });

    // 4. Update Unduh PDF links
    const downloadLinks = document.querySelectorAll("#workspace-modul a[title='Unduh File PDF'], #workspace-modul .lms-pdf-mobile-btn-secondary");
    downloadLinks.forEach(link => {
      link.href = urls.downloadUrl;
      if (config.downloadName) {
        link.setAttribute("download", config.downloadName);
      }
    });

    // 5. Update mobile fallback title
    const mobileTitleEl = document.querySelector("#workspace-modul .lms-pdf-mobile-title");
    if (mobileTitleEl && config.title) {
      mobileTitleEl.textContent = config.title;
    }
  } catch (err) {
    console.warn("syncPillarPdfDocument error:", err);
  }
}

window.syncPillarPdfDocument = syncPillarPdfDocument;
