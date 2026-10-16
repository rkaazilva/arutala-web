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
  setupNuansaNavDrawer();
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

let CURRENT_NUANSA_TOPIC_INDEX = 0;
let SELECTED_QUIZ_OPT = null;

function initNuansaLiteracyQuiz() {
  const tabsContainer = document.getElementById("nuansa-topic-tabs");
  if (!tabsContainer) return;

  tabsContainer.innerHTML = "";
  NUANSA_DATA.values.forEach((val, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `nuansa-tab-btn ${idx === CURRENT_NUANSA_TOPIC_INDEX ? 'active' : ''}`;
    btn.innerHTML = `<span>0${idx + 1}</span> ${val.title.split(" ")[0]} (${val.title.split("(")[1].replace(")", "")}`;
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
  const val = NUANSA_DATA.values[idx];
  if (!val) return;

  const titleEl = document.getElementById("nuansa-topic-title");
  const subEl = document.getElementById("nuansa-topic-sub");
  const readtimeEl = document.getElementById("nuansa-topic-readtime");
  const bodyEl = document.getElementById("nuansa-topic-body");
  const questionEl = document.getElementById("nuansa-quiz-question");
  const optionsEl = document.getElementById("nuansa-quiz-options");
  const feedbackEl = document.getElementById("nuansa-quiz-feedback");
  const submitBtn = document.getElementById("btn-submit-nuansa-quiz");

  if (titleEl) titleEl.textContent = val.title;
  if (subEl) subEl.textContent = val.sub;
  if (readtimeEl) readtimeEl.textContent = val.readTime;
  if (bodyEl) bodyEl.innerHTML = val.content;

  // Render Quiz
  SELECTED_QUIZ_OPT = null;
  if (feedbackEl) {
    feedbackEl.style.display = "none";
    feedbackEl.innerHTML = "";
  }
  if (questionEl) questionEl.textContent = val.quiz.question;

  if (optionsEl) {
    optionsEl.innerHTML = "";
    val.quiz.options.forEach((optText, oIdx) => {
      const optDiv = document.createElement("div");
      optDiv.className = "lms-quiz-opt";
      optDiv.innerHTML = `<strong>${String.fromCharCode(65 + oIdx)}.</strong> <span>${optText}</span>`;
      optDiv.addEventListener("click", () => {
        SELECTED_QUIZ_OPT = oIdx;
        document.querySelectorAll("#nuansa-quiz-options .lms-quiz-opt").forEach((o, i) => {
          o.classList.toggle("selected", i === oIdx);
        });
      });
      optionsEl.appendChild(optDiv);
    });
  }

  if (submitBtn) {
    submitBtn.onclick = () => {
      if (SELECTED_QUIZ_OPT === null) {
        alert("Silakan pilih salah satu opsi jawaban terlebih dahulu!");
        return;
      }

      const isCorrect = SELECTED_QUIZ_OPT === val.quiz.correctIndex;
      const opts = document.querySelectorAll("#nuansa-quiz-options .lms-quiz-opt");

      opts.forEach((o, i) => {
        if (i === val.quiz.correctIndex) {
          o.classList.add("correct");
        } else if (i === SELECTED_QUIZ_OPT && !isCorrect) {
          o.classList.add("wrong");
        }
      });

      if (feedbackEl) {
        feedbackEl.style.display = "block";
        if (isCorrect) {
          feedbackEl.style.backgroundColor = "#DCFCE7";
          feedbackEl.style.color = "#166534";
          feedbackEl.style.border = "1px solid #86EFAC";
          feedbackEl.innerHTML = `<strong>✓ Luar Biasa, Jawaban Kamu Tepat!</strong><p style="margin: 6px 0 0;">${val.quiz.explanation}</p>`;
        } else {
          feedbackEl.style.backgroundColor = "#FEE2E2";
          feedbackEl.style.color = "#991B1B";
          feedbackEl.style.border = "1px solid #FCA5A5";
          feedbackEl.innerHTML = `<strong>✕ Jawaban Kurang Tepat</strong><p style="margin: 6px 0 0;">${val.quiz.explanation}</p>`;
        }
      }
    };
  }
}

// VIDEO EDUKASI SOSIAL-KEAGAMAAN (FITUR 2)
function initNuansaVideos() {
  const container = document.getElementById("nuansa-videos-container");
  if (!container) return;

  const videoList = (window.ARUTALA_DATA && Array.isArray(window.ARUTALA_DATA.videos))
    ? window.ARUTALA_DATA.videos
    : [
        {
          id: "vid-1",
          youtubeId: "zzWGNlDuTkA",
          title: "Video Profil PANCAWALA: Media Literasi Pemuda & Moderasi Beragama",
          channel: "Pancawala",
          duration: "06:12",
          thumbnail: "https://img.youtube.com/vi/zzWGNlDuTkA/hqdefault.jpg",
          takeaways: "Menjelaskan urgensi platform dinamis pemuda dalam mempromosikan moderasi beragama, kearifan budaya, dan kesetaraan gender bagi Gen Z.",
          category: "Moderasi & Gender",
          videoUrl: "https://www.youtube.com/embed/zzWGNlDuTkA"
        },
        {
          id: "vid-2",
          youtubeId: "YOUTUBE_DEMO_2",
          title: "Girls4Change: Membangun Masa Depan Berdaya bagi Remaja Perempuan",
          channel: "RISE Foundation & Let's Read",
          duration: "04:45",
          thumbnail: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
          takeaways: "Penerapan metodologi peer facilitation, self-love, dan ruang aman untuk mendorong kepemimpinan remaja perempuan di komunitas.",
          category: "Pemberdayaan Sebaya",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
          id: "vid-3",
          youtubeId: "YOUTUBE_DEMO_3",
          title: "Pemuda Bergerak: Menghapus Bias Gender dan Diskriminasi di Kampus",
          channel: "ARUTALA Youth Media",
          duration: "05:18",
          thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
          takeaways: "Simulasi studi kasus cara pemuda merespons perilaku diskriminatif dan membangun aturan organisasi kemahasiswaan yang inklusif.",
          category: "Inklusivitas Kampus",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
          id: "vid-4",
          youtubeId: "YOUTUBE_DEMO_4",
          title: "Harmoni Keberagaman: Menghidupkan Kearifan Silih Asah, Asih, Asuh",
          channel: "UIN SGD Youth Movement",
          duration: "05:40",
          thumbnail: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80",
          takeaways: "Menghubungkan nilai Islam dan kearifan lokal Sunda sebagai etika memperlakukan sesama, menghormati martabat kemanusiaan, dan memperkuat kohesi sosial.",
          category: "Toleransi & Nilai",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        }
      ];

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
      ${videoList.map(vid => `
        <div class="video-card" style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #FFFFFF; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04); transition: transform 0.2s, box-shadow 0.2s;">
          <div style="position: relative; width: 100%; height: 200px; background: #0F172A; cursor: pointer; overflow: hidden;" onclick="openNuansaVideoModal('${vid.videoUrl}', '${encodeURIComponent(vid.title)}', '${encodeURIComponent(vid.takeaways)}')">
            <img src="${vid.thumbnail}" alt="${vid.title}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.88;" loading="lazy">
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: #2F4F87; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; box-shadow: 0 4px 14px rgba(0,0,0,0.3); transition: transform 0.2s;">
                ▶
              </div>
            </div>
            <span style="position: absolute; bottom: 10px; right: 12px; background: rgba(15, 23, 42, 0.85); color: #FFFFFF; font-size: 0.74rem; font-weight: 700; padding: 2px 8px; border-radius: 4px;">
              ${vid.duration}
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
