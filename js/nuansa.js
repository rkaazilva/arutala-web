/**
 * ==========================================================================
 * ARUTALA - Pilar NUANSA Controller (js/nuansa.js)
 * Mengelola:
 * 1. Literasi Keagamaan Kontekstual (Al-'Adl, Ukhuwah, Rahmah, Maslahah)
 * 2. Kuis Refleksi Etika Sosial-Keagamaan
 * 3. Video Edukasi Sosial-Keagamaan & Modal Player
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  initNuansaVideos();
  initNuansaLiteracyQuiz();
  initNuansaLiveChat();
  setupNuansaNavDrawer();
  initScrollReveal();
  setupFloatingBackToTop();
  syncPillarPdfDocument("nuansa");
});

// DATASET LITERASI KONTEKSTUAL & KUIS REFLEKSI (4 NILAI ETIS)
const NUANSA_DATA = {
  values: [
    {
      id: "adl",
      title: "Al-'Adl (Keadilan & Kesetaraan Gender)",
      sub: "Membangun Kesetaraan Berdasarkan Martabat Kemanusiaan",
      desc: "Keadilan bukan sekadar memperlakukan semua orang persis sama, melainkan menempatkan hak dan kesempatan secara proporsional sesuai kebutuhan dan mitigasi kerentanan sosial.",
      readTime: "6 Menit Refleksi",
      content: `
        <h4>1. Konsep Keadilan Hakiki (Al-'Adl)</h4>
        <p>Dalam khazanah etika Islam, <em>al-'adl</em> berarti menempatkan sesuatu pada tempatnya yang tepat dan proporsional. Keadilan gender menegaskan bahwa perempuan dan laki-laki adalah subjek moral yang setara di hadapan Tuhan (QS. An-Nahl: 97), dengan hak yang sama untuk berkembang, memimpin, dan berkontribusi.</p>
        
        <h4>2. Relasi Kesalingan (Mubadalah)</h4>
        <p>Konsep mubadalah mengajarkan bahwa hubungan antar-manusia—baik dalam keluarga, organisasi kampus, maupun masyarakat—harus berlandaskan kesalingan: saling menghormati, saling melindungi, dan saling mendukung tanpa ada relasi kuasa yang menindas.</p>
        
        <blockquote>"Keadilan bukan memberi setiap orang sepatu nomor yang sama, melainkan memberikan sepatu yang pas dengan ukuran kaki masing-masing."</blockquote>
      `,
      quiz: {
        question: "Mengapa pemberian fasilitas seperti gerbong khusus perempuan atau ruang laktasi di ruang publik selaras dengan prinsip Al-'Adl (Keadilan)?",
        options: [
          "Karena merupakan bentuk diskriminasi yang memanjakan kelompok tertentu",
          "Karena merupakan langkah keadilan afirmatif (equity) untuk memitigasi risiko pelecehan dan menjamin rasa aman setara",
          "Karena perempuan dianggap tidak mampu beradaptasi dengan fasilitas umum biasa",
          "Hanya sekadar formalitas aturan tanpa urgensi perlindungan nyata"
        ],
        correctIndex: 1,
        explanation: "Prinsip Al-'Adl (Keadilan Afirmatif/Equity) menuntut kita memahami hambatan dan kerentanan struktural yang dihadapi individu sebelum membuat kebijakan publik, demi mewujudkan perlindungan yang adil dan beradab."
      }
    },
    {
      id: "ukhuwah",
      title: "Ukhuwah (Persaudaraan & Toleransi Aktif)",
      sub: "Merajut Kebinekaan di Atas Karamah Insaniyyah",
      desc: "Ukhuwah melampaui sekat primordial: mencakup Ukhuwah Islamiyyah (keagamaan), Ukhuwah Wathaniyyah (kebangsaan), dan Ukhuwah Insaniyyah (kemanusiaan universal).",
      readTime: "5 Menit Refleksi",
      content: `
        <h4>1. Tiga Dimensi Ukhuwah</h4>
        <p>KH. Achmad Siddiq merumuskan trilogi ukhuwah yang menjadi panduan toleransi pemuda: ukhuwah islamiyyah (sesama muslim), ukhuwah wathaniyyah (sesama anak bangsa), dan ukhuwah basyariyyah/insaniyyah (sesama manusia). Perbedaan keyakinan tidak boleh menjadi alasan lunturnya etika kemanusiaan.</p>
        
        <h4>2. Dialog Damai Mahasiswa</h4>
        <p>Pemuda kampus dipanggil untuk menjadi jembatan perjumpaan lintas iman dan budaya, mengutamakan titik temu (kalimatun sawa') demi kemaslahatan bangsa.</p>
      `,
      quiz: {
        question: "Ketika terjadi perbedaan pandangan keagamaan atau identitas budaya di lingkungan kampus, sikap yang paling mencerminkan Ukhuwah Wathaniyyah adalah...",
        options: [
          "Menghindari interaksi dengan teman yang berbeda latar belakang",
          "Membuka ruang dialog yang hangat, mencari titik temu kemaslahatan, dan saling menghargai perbedaan",
          "Memaksakan pendapat kelompok sendiri sebagai satu-satunya kebenaran mutlak",
          "Menyebarkan prasangka di media sosial demi memperkuat kelompok sendiri"
        ],
        correctIndex: 1,
        explanation: "Ukhuwah Wathaniyyah menempatkan dialog damai dan penghormatan atas keberagaman sebagai modal sosial untuk menjaga persatuan bangsa."
      }
    },
    {
      id: "rahmah",
      title: "Rahmah (Kasih Sayang Semesta & Anti-Kekerasan)",
      sub: "Menolak Kekerasan Fisik, Verbal, Maupun Pelecehan Seksual",
      desc: "Agama hadir sebagai rahmat bagi semesta alam (rahmatan lil 'alamin). Segala bentuk intimidasi, perundungan, dan kekerasan adalah pengingkaran terhadap substansi rahmah.",
      readTime: "5 Menit Refleksi",
      content: `
        <h4>1. Pesan Damai Rahmatan lil 'Alamin</h4>
        <p>Kasih sayang (rahmah) adalah ruh dari ajaran agama. Nabi Muhammad SAW bersabda: <em>'Orang yang berbelas kasih akan dikasihi oleh Yang Maha Pengasih. Sayangilah siapa pun yang ada di bumi, niscaya yang ada di langit akan menyayangimu.'</em></p>
        
        <h4>2. Anti-Kekerasan dalam Ruang Kampus</h4>
        <p>Mewujudkan prinsip rahmah berarti berani bersuara menolak segala bentuk kekerasan seksual, perundungan (bullying), dan kekerasan verbal berbasis gender di ruang akademik maupun daring.</p>
      `,
      quiz: {
        question: "Bagaimana wujud nyata penerapan prinsip Rahmah (Welas Asih) oleh seorang pemuda saat melihat temannya mengalami perundungan atau pelecehan?",
        options: [
          "Mendiamkannya agar tidak ikut terlibat dalam masalah",
          "Menjadi saksi aktif (active bystander), memberi dukungan moral pada korban, dan melapor ke pihak berwenang",
          "Merekam kejadian untuk dijadikan konten viral demi popularitas pribadi",
          "Menyalahkan korban karena dianggap kurang berhati-hati"
        ],
        correctIndex: 1,
        explanation: "Rahmah menuntut tindakan empati aktif dengan melindungi korban dan tidak membiarkan kezaliman berlangsung di sekitar kita."
      }
    },
    {
      id: "maslahah",
      title: "Maslahah (Kemaslahatan Umum & Kearifan Budaya)",
      sub: "Memadukan Nilai Universal Agama dengan Kearifan Nusantara",
      desc: "Tujuan syariat (maqashid al-syari'ah) adalah terwujudnya kemaslahatan umat manusia: menjaga agama, jiwa, akal, keturunan/kehormatan, dan harta benda.",
      readTime: "6 Menit Refleksi",
      content: `
        <h4>1. Maqashid Syari'ah: Perlindungan Martabat</h4>
        <p>Kemaslahatan (maslahah) menuntut setiap kebijakan dan norma sosial berorientasi pada perlindungan martabat jiwa (hifzh al-nafs) dan kehormatan manusia (hifzh al-'irdh). Kearifan lokal Nusantara seperti gotong royong dan <em>Silih Asah, Silih Asih, Silih Asuh</em> adalah manifestasi kultural dari kemaslahatan ini.</p>
        
        <h4>2. Mengintegrasikan Tradisi dan Kemajuan</h4>
        <p>Menghargai tradisi leluhur yang mengangkat derajat kemanusiaan dan merawat harmoni alam adalah bukti keluhuran budi pemuda beragama.</p>
      `,
      quiz: {
        question: "Filosofi Sunda 'Silih Asah, Silih Asih, Silih Asuh' selaras dengan prinsip Maslahah dalam Islam karena...",
        options: [
          "Mengutamakan kepentingan individu di atas kepentingan masyarakat",
          "Menciptakan ekosistem sosial yang saling mencerdaskan, mengasihi dengan kelembutan, dan saling membimbing demi kebaikan bersama",
          "Menolak semua inovasi modern demi menjaga masa lalu",
          "Membatasi peran perempuan hanya di sektor rumah tangga"
        ],
        correctIndex: 1,
        explanation: "Silih Asah, Asih, Asuh adalah kearifan budaya yang secara substansial mewujudkan kemaslahatan umum (jalb al-mashalih) dan menghilangkan kemudaratan (dar' al-mafasid)."
      }
    }
  ]
};

let NUANSA_LMS_ITEMS = [];
let CURRENT_NUANSA_TOPIC_INDEX = 0;
let SELECTED_QUIZ_OPT = null;

async function initNuansaLiteracyQuiz() {
  const tabsContainer = document.getElementById("nuansa-topic-tabs");
  if (!tabsContainer) return;

  // 1. Ambil data dinamis dari Supabase / Local Storage
  if (window.ArutalaDB && typeof window.ArutalaDB.fetchLmsItems === "function") {
    NUANSA_LMS_ITEMS = await window.ArutalaDB.fetchLmsItems("nuansa");
  } else {
    NUANSA_LMS_ITEMS = window.ArutalaDB.getDefaultLmsItems("nuansa");
  }

  tabsContainer.innerHTML = "";
  NUANSA_LMS_ITEMS.forEach((item, idx) => {
    const isQuiz = item.type === "quiz";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `nuansa-tab-btn ${idx === CURRENT_NUANSA_TOPIC_INDEX ? 'active' : ''}`;
    const label = isQuiz ? (item.title.split(":")[0] || 'KUIS') : `0${idx + 1}. ${(item.title || "").split(" ")[0]} ${(item.title.includes("(") ? "(" + item.title.split("(")[1] : "")}`;
    btn.innerHTML = `<span>${isQuiz ? 'KUIS' : '0' + (idx + 1)}</span> ${item.code || 'NUA'}: ${(item.title || '').substring(0, 24)}...`;
    btn.addEventListener("click", () => {
      CURRENT_NUANSA_TOPIC_INDEX = idx;
      document.querySelectorAll(".nuansa-tab-btn").forEach((b, i) => {
        b.classList.toggle("active", i === idx);
      });
      loadNuansaTopic(idx);
    });
    tabsContainer.appendChild(btn);
  });

  loadNuansaTopic(0);
}

function loadNuansaTopic(idx) {
  const item = NUANSA_LMS_ITEMS[idx];
  if (!item) return;

  const titleEl = document.getElementById("nuansa-topic-title");
  const subEl = document.getElementById("nuansa-topic-sub");
  const readtimeEl = document.getElementById("nuansa-topic-readtime");
  const bodyEl = document.getElementById("nuansa-topic-body");
  const quizBox = document.querySelector(".nuansa-content-card .lms-quiz-panel");

  if (titleEl) titleEl.textContent = item.title;
  if (subEl) subEl.textContent = item.subtitle || "";
  if (readtimeEl) readtimeEl.textContent = item.duration || "45 Menit";

  // JIKA TIPE KUIS INTERAKTIF
  if (item.type === "quiz") {
    if (quizBox) quizBox.style.display = "none";
    renderNuansaMultiQuiz(item, bodyEl);
    return;
  }

  // JIKA TIPE MODUL / VIDEO
  if (quizBox) quizBox.style.display = "none";

  // Video embed (jika ada video)
  let videoEmbedHtml = "";
  if (item.videoUrl) {
    const embedUrl = formatNuansaVideoEmbed(item.videoUrl);
    videoEmbedHtml = `
      <div class="lms-video-embed-wrap">
        <iframe src="${embedUrl}" title="${item.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    `;
  }

  // Ringkasan Materi (Summary)
  const paragraphs = (item.summary || item.content || "Materi refleksi sedang disiapkan oleh fasilitator.")
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
        <div class="download-icon-box" style="background:#E0F2FE; color:#0369A1; font-weight: 800; font-size: 0.85rem;">PDF</div>
        <div class="download-card-text">
          <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #0369A1; display: block; margin-bottom: 2px;">
            DOKUMEN RESMI MODUL NUANSA
          </span>
          <h4>${item.docName || item.title + '.pdf'}</h4>
          <p>${item.docSize || 'File PDF Lengkap'} - Pustaka literasi keagamaan inklusif &amp; studi kasus etika sosial.</p>
        </div>
      </div>
      <div>
        ${item.docUrl ? `
          <a href="${item.docUrl}" target="_blank" rel="noopener" class="btn-download-pdf" style="background:#0369A1;">
            <span>Unduh Modul Lengkap (PDF)</span>
          </a>
        ` : `
          <button type="button" class="btn-download-pdf" style="opacity: 0.6; cursor: not-allowed; background:#0369A1;" title="File PDF sedang disiapkan">
            <span>PDF Segera Diunggah</span>
          </button>
        `}
      </div>
    </div>
  `;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="summary-body-wrap">
        ${videoEmbedHtml}
        <div style="background: #F0F9FF; border-left: 4px solid #0369A1; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
          <span style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #0369A1; display: block; margin-bottom: 3px;">
            RINGKASAN LITERASI &amp; NILAI KEAGAMAAN KONTEKSTUAL
          </span>
          <p style="font-size: 0.94rem; color: #334155; margin: 0; line-height: 1.5;">
            Simak ringkasan nilai etis di bawah ini dan pelajari modul PDF lengkap untuk pendalaman refleksi kelompok.
          </p>
        </div>
        ${summaryHtml}
        ${downloadCardHtml}
      </div>
    `;
  }
}

function renderNuansaMultiQuiz(item, container) {
  if (!container) return;
  const questions = Array.isArray(item.questions) ? item.questions : [];

  if (questions.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; background: #F8FAFC; border-radius: 12px;">
        <h4>Kuis Refleksi Sedang Disiapkan</h4>
        <p style="color: #64748B;">Admin belum mengunggah butir soal untuk kuis ini.</p>
      </div>
    `;
    return;
  }

  let questionsHtml = "";
  questions.forEach((q, qIdx) => {
    questionsHtml += `
      <div class="lms-single-question-card" id="nuansa-qcard-${qIdx}">
        <div class="single-q-header">
          <span class="single-q-number" style="background:#E0F2FE; color:#0369A1;">Studi Kasus #${qIdx + 1} dari ${questions.length}</span>
          <span style="font-size: 0.78rem; color: #64748B;">Refleksi Etika</span>
        </div>
        <h4 class="single-q-text">${q.question}</h4>
        <div class="single-q-options">
          ${(q.options || []).map((optText, optIdx) => `
            <label class="single-q-option" id="nuansa-optlabel-${qIdx}-${optIdx}">
              <input type="radio" name="nuansa_quiz_q_${qIdx}" value="${optIdx}">
              <span class="single-q-option-label">
                <strong>${String.fromCharCode(65 + optIdx)}.</strong> ${optText}
              </span>
            </label>
          `).join("")}
        </div>
        <div class="single-q-explanation" id="nuansa-expl-${qIdx}" style="border-left-color: #0369A1;">
          <strong>Refleksi Nilai:</strong> ${q.explanation || "Jawaban sesuai dengan nilai moderasi dan etika Islam rahmah."}
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="lms-multi-quiz-panel">
      <div class="lms-quiz-summary-card" id="nuansa-quiz-banner" style="background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border-color: rgba(3, 105, 161, 0.2);">
        <div>
          <span style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #0369A1; display: block; margin-bottom: 4px;">
            KUIS REFLEKSI ETIKA SOSIAL &amp; AGAMA
          </span>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin: 0 0 6px;">
            Uji Sikap &amp; Resolusi Dilema Etika (${questions.length} Soal)
          </h3>
          <p style="font-size: 0.92rem; color: #475569; margin: 0; line-height: 1.5;">
            Pilih respons tindakan yang paling mencerminkan nilai Al-'Adl, Ukhuwah, Rahmah, dan Maslahah dalam studi kasus di bawah ini.
          </p>
        </div>
        <div style="text-align: right;" id="nuansa-score-badge-area">
          <div class="quiz-score-badge" style="color: #0369A1;">${questions.length}</div>
          <div class="quiz-score-label">Studi Kasus</div>
        </div>
      </div>

      <form id="form-nuansa-quiz" onsubmit="submitNuansaMultiQuiz(event, ${questions.length})">
        ${questionsHtml}

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; flex-wrap: wrap; gap: 16px;">
          <button type="submit" class="btn btn-primary btn-pill" id="btn-submit-nuansa-multiquiz" style="background: #0369A1; color: #FFFFFF; font-size: 1rem; font-weight: 700; padding: 14px 32px; box-shadow: 0 6px 18px rgba(3, 105, 161, 0.3);">
            Periksa Jawaban Refleksi &rarr;
          </button>
          <button type="button" class="btn btn-secondary btn-pill" id="btn-reset-nuansa-quiz" onclick="loadNuansaTopic(${CURRENT_NUANSA_TOPIC_INDEX})" style="display: none; background: #FFFFFF; border: 1.5px solid #CBD5E1; color: #334155; font-weight: 700; padding: 12px 24px;">
            Ulangi Refleksi
          </button>
        </div>
      </form>
    </div>
  `;
}

function submitNuansaMultiQuiz(event, totalQ) {
  event.preventDefault();
  const item = NUANSA_LMS_ITEMS[CURRENT_NUANSA_TOPIC_INDEX];
  if (!item || !Array.isArray(item.questions)) return;

  const form = document.getElementById("form-nuansa-quiz");
  let correctCount = 0;

  item.questions.forEach((q, qIdx) => {
    const selectedInput = form.querySelector(`input[name="nuansa_quiz_q_${qIdx}"]:checked`);
    const userAns = selectedInput ? Number(selectedInput.value) : null;
    const correctAns = Number(q.correctIndex);
    const explBox = document.getElementById(`nuansa-expl-${qIdx}`);
    if (explBox) explBox.classList.add("show");

    (q.options || []).forEach((_, optIdx) => {
      const optLabel = document.getElementById(`nuansa-optlabel-${qIdx}-${optIdx}`);
      if (!optLabel) return;
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

  const finalScore = Math.round((correctCount / totalQ) * 100);
  const isPassed = finalScore >= 70;

  const badgeArea = document.getElementById("nuansa-score-badge-area");
  if (badgeArea) {
    badgeArea.innerHTML = `
      <div class="quiz-score-badge" style="color: ${isPassed ? '#166534' : '#DC2626'};">${finalScore}%</div>
      <div class="quiz-score-label">${correctCount} dari ${totalQ} Benar</div>
    `;
  }

  const submitBtn = document.getElementById("btn-submit-nuansa-multiquiz");
  const resetBtn = document.getElementById("btn-reset-nuansa-quiz");
  if (submitBtn) submitBtn.style.display = "none";
  if (resetBtn) resetBtn.style.display = "inline-flex";

  form.querySelectorAll("input[type='radio']").forEach(r => r.disabled = true);
  document.getElementById("nuansa-quiz-banner")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function formatNuansaVideoEmbed(url) {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
}

// HELPER EKSTRAKSI ID YOUTUBE
function extractYouTubeId(url) {
  if (!url) return null;
  url = url.trim();
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  if (match && match[1]) {
    return match[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }
  return null;
}

// VIDEO EDUKASI SOSIAL-KEAGAMAAN (FITUR 2)
function initNuansaVideos() {
  const container = document.getElementById("nuansa-videos-container");
  if (!container) return;

  const customVideos = JSON.parse(localStorage.getItem("arutala_custom_videos") || "[]");
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
          takeaways: "Menjelaskan urgensi platform dinamis pemuda dalam mempromosikan moderasi beragama, kearifan budaya, dan kesetaraan gender bagi Gen Z.",
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

  // Gabungkan custom videos di paling atas (tanpa duplikasi) dan filter video yang dihapus
  const videoList = [
    ...customVideos,
    ...defaultVideos.filter(dv => !customVideos.some(cv => cv.youtubeId === dv.youtubeId || cv.id === dv.id))
  ].filter(v => !deletedIds.includes(String(v.id)) && v.youtubeId !== "dQw4w9WgXcQ");

  container.innerHTML = `
    <div class="video-carousel-track">
      ${videoList.map(vid => `
        <div class="video-card reveal">
          <div class="video-thumbnail-wrap" style="position: relative; width: 100%; height: 200px; background: #0F172A; cursor: pointer; overflow: hidden;" onclick="openNuansaVideoModal('${vid.videoUrl}', '${encodeURIComponent(vid.title)}', '${encodeURIComponent(vid.takeaways)}')">
            <img src="${vid.thumbnail}" alt="${vid.title}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.88;" loading="lazy">
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
              <div class="play-overlay">
                ▶
              </div>
            </div>
            <span style="position: absolute; bottom: 10px; right: 12px; background: rgba(15, 23, 42, 0.85); color: #FFFFFF; font-size: 0.74rem; font-weight: 700; padding: 2px 8px; border-radius: 4px;">
              ${vid.duration || 'Video Edukasi'}
            </span>
          </div>
          <div style="padding: 20px;">
            <span style="display: inline-block; padding: 3px 10px; font-size: 0.7rem; font-weight: 800; border-radius: 4px; background: #EEF3FA; color: #2F4F87; text-transform: uppercase; margin-bottom: 8px;">
              ${vid.category}
            </span>
            <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; color: #0F172A; line-height: 1.35; margin-bottom: 6px;">
              ${vid.title}
            </h4>
            <small style="color: #64748B; display: block; margin-bottom: 12px; font-weight: 600;">Kanal: ${vid.channel}</small>
            <div style="background: #F8FAFC; border-left: 3px solid #66BB6A; padding: 10px 14px; border-radius: 0 6px 6px 0; font-size: 0.82rem; color: #334155; line-height: 1.5;">
              <strong>Poin Refleksi:</strong> ${vid.takeaways}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  if (typeof initScrollReveal === "function") {
    initScrollReveal();
  }
  if (typeof initAutoScrollVideoCarousel === "function") {
    initAutoScrollVideoCarousel();
  }
}

function openNuansaVideoModal(url, encodedTitle, encodedDesc) {
  const modal = document.getElementById("modal-video-player");
  const iframe = document.getElementById("modal-video-iframe");
  const titleEl = document.getElementById("modal-video-title");
  const descEl = document.getElementById("modal-video-desc");

  if (!modal || !iframe) return;

  if (titleEl) titleEl.textContent = decodeURIComponent(encodedTitle);
  if (descEl) descEl.textContent = decodeURIComponent(encodedDesc);
  iframe.src = url;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeNuansaVideoModal() {
  const modal = document.getElementById("modal-video-player");
  const iframe = document.getElementById("modal-video-iframe");

  if (modal) modal.classList.remove("active");
  if (iframe) iframe.src = "";
  document.body.style.overflow = "";
}

// MODAL UPLOAD VIDEO YOUTUBE
function openUploadVideoModal() {
  const modal = document.getElementById("modal-upload-video");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeUploadVideoModal() {
  const modal = document.getElementById("modal-upload-video");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
  const form = document.getElementById("form-upload-video");
  if (form) form.reset();
  const previewBox = document.getElementById("yt-preview-box");
  if (previewBox) previewBox.style.display = "none";
  const statusBox = document.getElementById("yt-video-status");
  if (statusBox) statusBox.style.display = "none";
}

function setupNuansaUploadVideoModal() {
  const urlInput = document.getElementById("yt-video-url");
  const previewBox = document.getElementById("yt-preview-box");
  const previewThumb = document.getElementById("yt-preview-thumb");
  const form = document.getElementById("form-upload-video");
  const statusBox = document.getElementById("yt-video-status");

  // Live Thumbnail Preview on URL Input
  if (urlInput && previewBox && previewThumb) {
    urlInput.addEventListener("input", () => {
      const ytId = extractYouTubeId(urlInput.value);
      if (ytId) {
        previewThumb.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        previewBox.style.display = "flex";
      } else {
        previewBox.style.display = "none";
      }
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const urlVal = urlInput ? urlInput.value.trim() : "";
      const titleVal = document.getElementById("yt-video-title")?.value.trim() || "";
      const channelVal = document.getElementById("yt-video-channel")?.value.trim() || "Kontributor Pemuda";
      const catVal = document.getElementById("yt-video-category")?.value || "Moderasi & Gender";
      const takeawaysVal = document.getElementById("yt-video-takeaways")?.value.trim() || "";
      const submitBtn = document.getElementById("btn-submit-upload-video");

      const ytId = extractYouTubeId(urlVal);
      if (!ytId) {
        if (statusBox) {
          statusBox.style.display = "block";
          statusBox.style.backgroundColor = "#FEE2E2";
          statusBox.style.color = "#991B1B";
          statusBox.style.border = "1px solid #FCA5A5";
          statusBox.textContent = "Format tautan YouTube tidak dikenali. Mohon masukkan link YouTube yang valid (contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/...)";
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Menyimpan Video...";
      }

      const newVideo = {
        id: "vid-" + Date.now(),
        youtubeId: ytId,
        title: titleVal,
        channel: channelVal,
        duration: "Video Edukasi",
        thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        takeaways: takeawaysVal,
        category: catVal,
        videoUrl: `https://www.youtube.com/embed/${ytId}`
      };

      // 1. Simpan ke localStorage agar tampil di pilar NUANSA dan Landing Page (index.html)
      try {
        const customVideos = JSON.parse(localStorage.getItem("arutala_custom_videos") || "[]");
        customVideos.unshift(newVideo);
        localStorage.setItem("arutala_custom_videos", JSON.stringify(customVideos));
      } catch (err) {
        console.warn("Gagal menyimpan video ke localStorage:", err);
      }

      // 2. Perbarui memori ARUTALA_DATA jika aktif
      if (window.ARUTALA_DATA && Array.isArray(window.ARUTALA_DATA.videos)) {
        window.ARUTALA_DATA.videos.unshift(newVideo);
      }

      // 3. Render ulang grid video di halaman Nuansa
      initNuansaVideos();

      // 4. Tutup modal dan beri konfirmasi
      closeUploadVideoModal();
      alert("Selamat! Video edukasi YouTube berhasil ditambahkan.\nVideo ini langsung muncul di Pojok Video NUANSA dan di Beranda Utama (Landing Page)!");

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Tayangkan Video";
      }
    });
  }

  const modalUpload = document.getElementById("modal-upload-video");
  if (modalUpload) {
    modalUpload.addEventListener("click", (e) => {
      if (e.target === modalUpload) closeUploadVideoModal();
    });
  }
}

function setupNuansaNavDrawer() {
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

  const closeVidBtn = document.getElementById("btn-close-video-modal");
  if (closeVidBtn) closeVidBtn.addEventListener("click", closeNuansaVideoModal);
}

/**
 * ==========================================================================
 * GLOBAL HELPER: Scroll Video Carousel (Smooth Horizontal Scroll)
 * ==========================================================================
 */
window.scrollVideoCarousel = function(containerId, offset) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const track = container.querySelector(".video-carousel-track") || container;
  track.scrollBy({ left: offset, behavior: "smooth" });
};

/**
 * ==========================================================================
 * GLOBAL HELPER: Scroll Reveal (Fade In Up on Scroll)
 * ==========================================================================
 */
function initScrollReveal() {
  const selectors = [
    ".reveal",
    ".section-header",
    ".article-card",
    ".video-card",
    ".bento-item",
    ".cycle-box-card",
    ".cycle-card",
    ".value-card",
    ".toolkit-content-card",
    ".donation-card",
    ".hero-content",
    ".pillar-card"
  ];

  const elements = document.querySelectorAll(selectors.join(", "));
  if (!elements || elements.length === 0) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach(el => el.classList.add("active"));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -30px 0px"
  });

  elements.forEach(el => {
    if (!el.classList.contains("reveal")) {
      el.classList.add("reveal");
    }
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 40) {
      el.classList.add("active");
    } else {
      observer.observe(el);
    }
  });
}
window.initScrollReveal = initScrollReveal;

/**
 * ==========================================================================
 * GLOBAL HELPER: Setup Floating Back to Top Button
 * ==========================================================================
 */
function setupFloatingBackToTop() {
  let btn = document.getElementById("btn-floating-top");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "btn-floating-top";
    btn.className = "btn-floating-top";
    btn.setAttribute("aria-label", "Kembali ke atas");
    btn.setAttribute("type", "button");
    btn.innerHTML = "&#8593;";
    document.body.appendChild(btn);
  }

  window.addEventListener("scroll", () => {
    if (window.scrollY > 380) {
      btn.classList.add("show");
    } else {
      btn.classList.remove("show");
    }
  }, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
window.setupFloatingBackToTop = setupFloatingBackToTop;
window.openNuansaVideoModal = openNuansaVideoModal;
window.closeNuansaVideoModal = closeNuansaVideoModal;
window.initNuansaVideos = initNuansaVideos;

/**
 * ==========================================================================
 * FITUR 3: RUANG DISKUSI & LIVE CHAT KAJIAN NILAI ISLAM MODERAT (NUANSA)
 * ==========================================================================
 */
const DEFAULT_NUANSA_CHATS = [
  {
    id: "chat-nuansa-1",
    senderName: "Ahmad Fauzan",
    senderRole: "peserta",
    roleLabel: "Mahasiswa Santri",
    avatarInitial: "AF",
    time: "13:35 WIB",
    text: "Assalamu'alaikum kawan-kawan sekalian. Sangat berbobot penjelasan modul Al-'Adl tadi mengenai konsep 'Mubadalah' (kesalingan). Ada yang bisa berbagi contoh konkret penerapannya dalam pembagian tugas kepanitiaan organisasi mahasiswa di kampus?",
    likes: 8,
    isLiked: false,
    replyTo: null
  },
  {
    id: "chat-nuansa-2",
    senderName: "Ust. Nurul Hidayah, M.Hum",
    senderRole: "facilitator",
    roleLabel: "Fasilitator Kajian NUANSA",
    avatarInitial: "NH",
    time: "13:38 WIB",
    text: "Wa'alaikumussalam warahmatullah, Ahmad. Bentuk konkretnya: hilangkan stereotip bias gender. Jangan lagi menganggap seksi konsumsi atau sekretaris otomatis harus perempuan, sementara koordinator lapangan atau logistik harus laki-laki. Bagikan tanggung jawab berdasarkan kesepakatan, kompetensi, dan kapasitas belajar yang setara.",
    likes: 24,
    isLiked: false,
    replyTo: {
      name: "Ahmad Fauzan",
      text: "Ada yang bisa berbagi contoh konkret penerapannya dalam pembagian tugas kepanitiaan..."
    }
  },
  {
    id: "chat-nuansa-3",
    senderName: "Nadia Maharani",
    senderRole: "peserta",
    roleLabel: "Aktivis KSR Relawan",
    avatarInitial: "NM",
    time: "13:41 WIB",
    text: "Betul sekali Ustadz! Di unit kegiatan relawan kami, koordinator divisi evakuasi dan logistik bencana dipimpin oleh mahasiswi dan kinerjanya sangat taktis. Yang utama adalah keterbukaan komunikasi dan saling mendukung tanpa meremehkan.",
    likes: 14,
    isLiked: false,
    replyTo: {
      name: "Ust. Nurul Hidayah, M.Hum",
      text: "Bagikan tanggung jawab berdasarkan kesepakatan, kompetensi, dan kapasitas belajar yang setara."
    }
  },
  {
    id: "chat-nuansa-4",
    senderName: "Dimas Arya",
    senderRole: "peserta",
    roleLabel: "Kader Moderasi",
    avatarInitial: "DA",
    time: "13:46 WIB",
    text: "Mengenai prinsip Rahmah (Anti-Kekerasan), bagaimana respon etis kita sebagai pemuda muslim ketika mendapati narasi ujaran kebencian di media sosial yang mengutip potongan ayat suci di luar konteks?",
    likes: 9,
    isLiked: false,
    replyTo: null
  },
  {
    id: "chat-nuansa-5",
    senderName: "Ust. Nurul Hidayah, M.Hum",
    senderRole: "facilitator",
    roleLabel: "Fasilitator Kajian NUANSA",
    avatarInitial: "NH",
    time: "13:50 WIB",
    text: "Pegang teguh kaidah dakwah Al-Qur'an (QS. An-Nahl: 125): 'Ajaklah dengan hikmah, nasihat yang santun, dan bantahlah dengan cara yang terbaik'. Jangan membalas caci maki dengan kebencian serupa. Hadirkan kontra-narasi damai, tampilkan konteks asbabun nuzul yang utuh, dan tegakkan nilai kasih sayang (rahmatan lil 'alamin).",
    likes: 29,
    isLiked: false,
    replyTo: {
      name: "Dimas Arya",
      text: "bagaimana respon etis kita sebagai pemuda muslim ketika mendapati narasi ujaran kebencian..."
    }
  }
];

let ALL_NUANSA_CHATS = [];
let NUANSA_REPLY_TARGET = null;

function initNuansaLiveChat() {
  const container = document.getElementById("nuansa-livechat-container");
  if (!container) return;

  const stored = localStorage.getItem("arutala_livechat_nuansa");
  if (stored) {
    try {
      ALL_NUANSA_CHATS = JSON.parse(stored);
    } catch (e) {
      ALL_NUANSA_CHATS = [...DEFAULT_NUANSA_CHATS];
    }
  } else {
    ALL_NUANSA_CHATS = [...DEFAULT_NUANSA_CHATS];
  }

  renderNuansaChatUI();
}
window.initNuansaLiveChat = initNuansaLiveChat;

function renderNuansaChatUI() {
  const container = document.getElementById("nuansa-livechat-container");
  if (!container) return;

  const savedName = localStorage.getItem("arutala_chat_user_name") || "";

  container.innerHTML = `
    <div class="arutala-live-chat-card">
      <!-- Chat Header -->
      <div class="chat-room-header" style="border-top: 3px solid #0F766E;">
        <div class="chat-room-title-wrap">
          <div class="chat-live-pulse-dot" style="background: #0F766E; box-shadow: 0 0 8px #0F766E;" title="Live Aktif"></div>
          <h3 class="chat-room-name">
            # Ruang-Kajian-Nuansa
          </h3>
          <span class="chat-room-online-badge" style="background: #CCFBF1; color: #0F766E;">34 Mahasiswa &amp; Santri Aktif</span>
        </div>
        <div class="chat-room-tags">
          <span class="chat-room-tag" style="color: #0F766E; background: #E6FFFA;">#AlAdl</span>
          <span class="chat-room-tag" style="color: #0F766E; background: #E6FFFA;">#Ukhuwah</span>
          <span class="chat-room-tag" style="color: #0F766E; background: #E6FFFA;">#Rahmah</span>
          <span class="chat-room-tag" style="color: #0F766E; background: #E6FFFA;">#Maslahah</span>
          <span class="chat-room-tag" style="color: #0F766E; background: #E6FFFA;">#TafsirModerasi</span>
        </div>
      </div>

      <!-- Messages Stream -->
      <div class="chat-messages-container" id="nuansa-messages-stream">
        ${ALL_NUANSA_CHATS.map(msg => {
          const isFacil = msg.senderRole === "facilitator";
          const avatarClass = isFacil ? "chat-avatar facilitator" : "chat-avatar";
          const roleBadgeClass = isFacil ? "chat-sender-role badge-facil" : "chat-sender-role";
          const roleText = isFacil ? "Fasilitator Kajian" : (msg.roleLabel || "Mahasiswa / Santri");
          const likedClass = msg.isLiked ? "chat-btn-action chat-btn-like liked" : "chat-btn-action chat-btn-like";

          return `
            <div class="chat-message-bubble ${msg.isSelf ? 'is-self' : ''}" id="${msg.id}">
              <div class="${avatarClass}" style="${!isFacil ? 'background: #0369A1;' : ''}" title="${msg.senderName}">
                ${msg.avatarInitial || msg.senderName.charAt(0).toUpperCase()}
              </div>
              <div class="chat-body">
                <div class="chat-header-row">
                  <span class="chat-sender-name">${escapeNuansaHTML(msg.senderName)}</span>
                  <span class="${roleBadgeClass}">${roleText}</span>
                  <span class="chat-time">${msg.time}</span>
                </div>

                ${msg.replyTo ? `
                  <div class="chat-reply-quote" style="border-left-color: #0F766E;">
                    ↳ Membalas <strong>@${escapeNuansaHTML(msg.replyTo.name)}</strong>: "${escapeNuansaHTML(msg.replyTo.text)}"
                  </div>
                ` : ""}

                <p class="chat-text">${escapeNuansaHTML(msg.text)}</p>

                <div class="chat-action-row">
                  <button type="button" class="${likedClass}" onclick="toggleNuansaChatLike('${msg.id}')" title="Sukai tanggapan ini">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="${msg.isLiked ? '#BE185D' : 'none'}" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:3px;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> <span>${msg.likes || 0}</span>
                  </button>
                  <button type="button" class="chat-btn-action" onclick="setNuansaChatReply('${msg.id}')" title="Balas pesan ini">
                    Balas
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <!-- Reply Banner (Jika sedang membalas) -->
      <div class="chat-reply-banner" id="nuansa-reply-banner" style="${NUANSA_REPLY_TARGET ? 'display:flex; background: #E6FFFA; border-top-color: #99F6E4; color: #0F766E;' : 'display:none;'}">
        <span id="nuansa-reply-banner-text">
          ${NUANSA_REPLY_TARGET ? `↳ Membalas <strong>@${escapeNuansaHTML(NUANSA_REPLY_TARGET.name)}</strong>: "${escapeNuansaHTML(NUANSA_REPLY_TARGET.text)}"` : ''}
        </span>
        <button type="button" class="chat-btn-cancel-reply" onclick="cancelNuansaChatReply()" title="Batalkan balasan">Batal</button>
      </div>

      <!-- Input Bar -->
      <form class="chat-input-bar" id="nuansa-chat-form" onsubmit="handleSendNuansaChat(event)">
        <div class="chat-input-row-top">
          <input 
            type="text" 
            id="nuansa-chat-name-input" 
            class="chat-name-input" 
            placeholder="Nama / Panggilanmu" 
            value="${escapeNuansaHTML(savedName)}" 
            required
            title="Nama pengirim pesan"
          >
          <span style="font-size: 0.74rem; color: #64748B;">
            Diskusikan tafsir moderasi, nilai <em>Al-'Adl, Ukhuwah, Rahmah, Maslahah</em> dengan santun dan beradab.
          </span>
        </div>
        <div class="chat-input-row-main">
          <input 
            type="text" 
            id="nuansa-chat-text-input" 
            class="chat-text-input" 
            placeholder="Tulis refleksi atau tanggapan kajianmu di sini... (Tekan Enter untuk kirim)" 
            autocomplete="off" 
            required
          >
          <button type="submit" class="chat-send-btn" id="nuansa-chat-send-btn" style="background: #0F766E;">
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

  scrollNuansaChatToBottom();
}

function scrollNuansaChatToBottom() {
  setTimeout(() => {
    const stream = document.getElementById("nuansa-messages-stream");
    if (stream) {
      stream.scrollTop = stream.scrollHeight;
    }
  }, 50);
}

function escapeNuansaHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.handleSendNuansaChat = function(e) {
  if (e) e.preventDefault();

  const nameInput = document.getElementById("nuansa-chat-name-input");
  const textInput = document.getElementById("nuansa-chat-text-input");

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

  // Simpan nama pengguna agar konsisten di kedua ruang chat
  localStorage.setItem("arutala_chat_user_name", nameVal);

  const initials = nameVal.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "MA";
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

  const newChat = {
    id: "chat-nuansa-" + Date.now(),
    senderName: nameVal,
    senderRole: "peserta",
    roleLabel: "Peserta Kajian",
    avatarInitial: initials,
    time: timeStr,
    text: textVal,
    likes: 0,
    isLiked: false,
    isSelf: true,
    replyTo: NUANSA_REPLY_TARGET ? {
      name: NUANSA_REPLY_TARGET.name,
      text: NUANSA_REPLY_TARGET.text
    } : null
  };

  ALL_NUANSA_CHATS.push(newChat);
  localStorage.setItem("arutala_livechat_nuansa", JSON.stringify(ALL_NUANSA_CHATS));

  NUANSA_REPLY_TARGET = null;
  renderNuansaChatUI();

  const newTextInput = document.getElementById("nuansa-chat-text-input");
  if (newTextInput) newTextInput.focus();
};

window.setNuansaChatReply = function(msgId) {
  const target = ALL_NUANSA_CHATS.find(m => m.id === msgId);
  if (!target) return;

  const snippet = target.text.length > 60 ? target.text.slice(0, 57) + "..." : target.text;

  NUANSA_REPLY_TARGET = {
    id: target.id,
    name: target.senderName,
    text: snippet
  };

  const banner = document.getElementById("nuansa-reply-banner");
  const bannerText = document.getElementById("nuansa-reply-banner-text");

  if (banner && bannerText) {
    bannerText.innerHTML = `↳ Membalas <strong>@${escapeNuansaHTML(NUANSA_REPLY_TARGET.name)}</strong>: "${escapeNuansaHTML(NUANSA_REPLY_TARGET.text)}"`;
    banner.style.display = "flex";
  }

  const textInput = document.getElementById("nuansa-chat-text-input");
  if (textInput) {
    textInput.placeholder = `Balas pesan @${target.senderName}...`;
    textInput.focus();
  }
};

window.cancelNuansaChatReply = function() {
  NUANSA_REPLY_TARGET = null;
  const banner = document.getElementById("nuansa-reply-banner");
  if (banner) banner.style.display = "none";

  const textInput = document.getElementById("nuansa-chat-text-input");
  if (textInput) {
    textInput.placeholder = "Tulis refleksi atau tanggapan kajianmu di sini... (Tekan Enter untuk kirim)";
  }
};

window.toggleNuansaChatLike = function(msgId) {
  const msg = ALL_NUANSA_CHATS.find(m => m.id === msgId);
  if (!msg) return;

  if (msg.isLiked) {
    msg.isLiked = false;
    msg.likes = Math.max(0, (msg.likes || 1) - 1);
  } else {
    msg.isLiked = true;
    msg.likes = (msg.likes || 0) + 1;
  }

  localStorage.setItem("arutala_livechat_nuansa", JSON.stringify(ALL_NUANSA_CHATS));
  renderNuansaChatUI();
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

