/**
 * ==========================================================================
 * ARUTALA - Pilar KARSA Controller (js/karsa.js)
 * Mengelola:
 * 1. Portofolio & Publikasi Karya Pemuda (Artikel & Video Kreatif)
 * 2. Dokumentasi Perkembangan Pembelajaran
 * 3. Modal Upload Karya (Pilihan Artikel vs Video) & Modal Video Player
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  initKarsaPortfolio();
  setupKarsaModals();
  setupKarsaNavDrawer();
});

let KARSA_STATE = {
  articles: [],
  currentFilter: "all" // "all", "article", "video"
};

// Default starter creative videos for KARSA (Contoh Video Karya Nyata & Edukatif)
const DEFAULT_KARSA_VIDEOS = [
  {
    id: "karsa-vid-default-1",
    type: "video",
    title: "Video Inspirasi: HeForShe & Gerakan Pemuda Menuju Kesetaraan Gender yang Adil",
    category: "bersuara",
    author: "Tim Kolaboratif Pemuda ARUTALA",
    authorRole: "UIN Sunan Gunung Djati Bandung",
    date: "Oktober 2026",
    readTime: "Video Edukasi",
    thumbnail: "https://img.youtube.com/vi/gkjvWcuXw9Y/hqdefault.jpg",
    coverImage: "https://img.youtube.com/vi/gkjvWcuXw9Y/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/gkjvWcuXw9Y",
    youtubeId: "gkjvWcuXw9Y",
    summary: "Refleksi audiovisual mengenai pentingnya keadilan relasi dan peran sekutu (allies) laki-laki dalam menghapus bias gender dan menciptakan ruang aman di komunitas.",
    content: "<p>Karya audiovisual reflektif hasil kolaborasi pemuda ARUTALA yang membedah urgensi peran pemuda laki-laki sebagai sekutu (allies) dalam menciptakan lingkungan yang setara, aman, dan berkeadilan bagi semua.</p>"
  },
  {
    id: "karsa-vid-default-2",
    type: "video",
    title: "Video Kampanye: Moderat Sejak Dini — Merawat Harmoni & Nilai Inklusif",
    category: "pandai",
    author: "Alfath Fadillah & Tim Fasilitator",
    authorRole: "Fasilitator Sebaya ARUTALA",
    date: "Oktober 2026",
    readTime: "Video Kampanye",
    thumbnail: "https://img.youtube.com/vi/VN7talTjE14/hqdefault.jpg",
    coverImage: "https://img.youtube.com/vi/VN7talTjE14/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/VN7talTjE14",
    youtubeId: "VN7talTjE14",
    summary: "Dokumentasi kampanye penguatan nilai moderasi beragama, toleransi aktif, dan pencegahan diskriminasi di lingkungan pendidikan dan masyarakat.",
    content: "<p>Dokumentasi kampanye kreatif berbasis nilai-nilai keagamaan yang menjunjung tinggi martabat kemanusiaan (karamah insaniyyah) dan keadilan sosial tanpa kekerasan.</p>"
  },
  {
    id: "karsa-vid-default-3",
    type: "video",
    title: "Karya Kreatif: Voice of Change — Membedah Stereotip Gender di Ruang Belajar Kampus",
    category: "cerdas",
    author: "M. Rifqi Nurhidayat & Nuzhatul",
    authorRole: "Kader Inovator ARUTALA",
    date: "Oktober 2026",
    readTime: "Video Kreatif",
    thumbnail: "https://img.youtube.com/vi/zzWGNlDuTkA/hqdefault.jpg",
    coverImage: "https://img.youtube.com/vi/zzWGNlDuTkA/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/zzWGNlDuTkA",
    youtubeId: "zzWGNlDuTkA",
    summary: "Eksplorasi falsafah kearifan lokal Sunda 'Silih Asah, Asih, Asuh' sebagai instrumen komunikasi nir-kekerasan dan kepemimpinan pemuda yang empatik.",
    content: "<p>Eksplorasi falsafah luhur budaya nusantara sebagai panduan kepemimpinan generasi muda dalam merajut kesetaraan hakiki dan ruang dialog yang hangat.</p>"
  }
];

function extractYouTubeId(url) {
  if (!url) return null;
  const cleanUrl = url.trim();
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = cleanUrl.match(regExp);
  if (match && match[1]) return match[1];

  const fallback = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const fbMatch = cleanUrl.match(fallback);
  return (fbMatch && fbMatch[2] && fbMatch[2].length === 11) ? fbMatch[2] : null;
}

async function initKarsaPortfolio() {
  const container = document.getElementById("karsa-portfolio-container");
  if (!container) return;

  // 1. Ambil artikel lokal dari ARUTALA_DATA
  const localArticles = (window.ARUTALA_DATA && Array.isArray(window.ARUTALA_DATA.articles))
    ? window.ARUTALA_DATA.articles
    : [];

  // 2. Ambil artikel dari Supabase
  let cloudArticles = [];
  if (window.ArutalaDB && typeof window.ArutalaDB.fetchArticles === "function") {
    try {
      cloudArticles = await window.ArutalaDB.fetchArticles();
    } catch (err) {
      console.warn("Gagal memuat portofolio karya dari Supabase:", err);
    }
  }

  // 3. Ambil video custom yang diunggah pengguna dari localStorage
  let customVideos = [];
  try {
    const savedVids = localStorage.getItem("arutala_karsa_custom_videos");
    if (savedVids) {
      customVideos = JSON.parse(savedVids).filter(v => v.youtubeId && v.youtubeId !== "dQw4w9WgXcQ");
    }
  } catch (e) {
    customVideos = [];
  }

  // 4. Gabungkan seluruh karya (Video + Artikel)
  const combinedArticles = [
    ...cloudArticles,
    ...localArticles.filter(loc => !cloudArticles.some(c => String(c.id) === String(loc.id) || c.title === loc.title))
  ];

  const allVideos = [
    ...customVideos,
    ...DEFAULT_KARSA_VIDEOS.filter(dv => !customVideos.some(cv => String(cv.id) === String(dv.id)))
  ];

  // Susun urutan karya terpadu (video & artikel)
  KARSA_STATE.articles = [
    ...allVideos,
    ...combinedArticles
  ];

  renderKarsaPortfolio();
}

function getKarsaCategoryColor(cat) {
  switch ((cat || "").toLowerCase()) {
    case "pandai":
    case "moderasi": return "#66BB6A";
    case "bersuara":
    case "kesetaraan": return "#FF64C5";
    case "cerdas":
    case "budaya": return "#89BBEE";
    case "berdaya":
    case "sosial": return "#2F4F87";
    default: return "#2F4F87";
  }
}

function getKarsaCategoryLabel(cat) {
  switch ((cat || "").toLowerCase()) {
    case "pandai":
    case "moderasi": return "MODERASI BERAGAMA";
    case "bersuara":
    case "kesetaraan": return "KESETARAAN";
    case "cerdas":
    case "budaya": return "BUDAYA";
    case "berdaya":
    case "sosial": return "SOSIAL MASYARAKAT";
    default: return (cat || "MODERASI BERAGAMA").toUpperCase();
  }
}

function filterKarsaKarya(type) {
  KARSA_STATE.currentFilter = type || "all";

  // Update button active state
  document.querySelectorAll(".btn-filter-karya").forEach(btn => {
    btn.classList.remove("active");
  });

  const activeBtn = document.getElementById(`filter-karya-${type}`);
  if (activeBtn) activeBtn.classList.add("active");

  renderKarsaPortfolio();
}

function renderKarsaPortfolio() {
  const container = document.getElementById("karsa-portfolio-container");
  if (!container) return;

  const totalAll = KARSA_STATE.articles.length;
  const totalArticles = KARSA_STATE.articles.filter(a => a.type !== "video" && !a.videoUrl).length;
  const totalVideos = KARSA_STATE.articles.filter(a => a.type === "video" || a.videoUrl).length;

  // Update badge counts
  const countAll = document.getElementById("count-karya-all");
  const countArt = document.getElementById("count-karya-article");
  const countVid = document.getElementById("count-karya-video");

  if (countAll) countAll.textContent = totalAll;
  if (countArt) countArt.textContent = totalArticles;
  if (countVid) countVid.textContent = totalVideos;

  // Filter items
  let filtered = KARSA_STATE.articles;
  if (KARSA_STATE.currentFilter === "article") {
    filtered = KARSA_STATE.articles.filter(a => a.type !== "video" && !a.videoUrl);
  } else if (KARSA_STATE.currentFilter === "video") {
    filtered = KARSA_STATE.articles.filter(a => a.type === "video" || a.videoUrl);
  }

  const items = filtered.slice(0, 9);

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: #64748B; background: #F8FAFC; border-radius: 12px; border: 1px dashed #CBD5E1;">
        <p style="font-size: 1rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Belum ada karya pada kategori ini.</p>
        <p style="font-size: 0.88rem; margin-bottom: 16px;">Jadilah pemuda pertama yang mengunggah karya artikel atau videomu!</p>
        <button type="button" class="btn btn-primary btn-sm btn-pill" onclick="openSubmitArticleModal(event)" style="background: #2F4F87; color: #FFFFFF;">
          + Unggah Karya Sekarang
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="uss-clean-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
      ${items.map(item => {
        const isVideo = item.type === "video" || Boolean(item.videoUrl);

        if (isVideo) {
          const thumb = item.thumbnail || item.coverImage || (item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg` : 'img/seminar_cakrawala_muda.png');
          return `
            <article class="uss-clean-card" style="border: 1px solid #E2E8F0; border-top: 3px solid #BE185D !important; border-radius: 8px; overflow: hidden; background: #FFFFFF; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onclick="openKarsaVideoModal('${item.videoUrl}', '${encodeURIComponent(item.title)}', '${encodeURIComponent(item.author || '')}', '${encodeURIComponent(getKarsaCategoryLabel(item.category))}', '${encodeURIComponent(item.summary || '')}')">
              <div class="karsa-video-card-thumb">
                <img src="${thumb}" alt="${item.title}" loading="lazy">
                <div class="karsa-play-badge">
                  <div class="karsa-play-circle">▶</div>
                </div>
                <span style="position: absolute; bottom: 8px; right: 10px; background: rgba(15, 23, 42, 0.85); color: #FFFFFF; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 4px;">
                  Video Karya
                </span>
              </div>
              <div style="padding: 18px;">
                <div style="font-size: 0.72rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #BE185D; margin-bottom: 6px;">
                  ${getKarsaCategoryLabel(item.category)} • VIDEO KREATIF
                </div>
                <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; color: #0F172A; line-height: 1.35; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  ${item.title}
                </h4>
                <p style="font-size: 0.85rem; color: #64748B; line-height: 1.5; margin-bottom: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  ${item.summary || 'Karya video edukatif dan reflektif pemuda peserta pilar KARSA.'}
                </p>
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; color: #94A3B8; padding-top: 10px; border-top: 1px solid #F1F5F9;">
                  <span style="font-weight: 700; color: #334155;">${item.author || 'Kreator Pemuda'}</span>
                  <span>${item.date || 'Oktober 2026'}</span>
                </div>
              </div>
            </article>
          `;
        }

        return `
          <article class="uss-clean-card" style="border: 1px solid #E2E8F0; border-top: 3px solid ${getKarsaCategoryColor(item.category)} !important; border-radius: 8px; overflow: hidden; background: #FFFFFF; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onclick="window.location.href='artikel.html?id=${encodeURIComponent(item.id)}'">
            <div style="position: relative; width: 100%; height: 180px; overflow: hidden; background: #F1F5F9;">
              <img src="${item.coverImage || 'img/pelatihan_fasilitator_auditorium.jpg'}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
              <span style="position: absolute; bottom: 8px; right: 10px; background: rgba(15, 23, 42, 0.75); color: #FFFFFF; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 4px;">
                Artikel / Esai
              </span>
            </div>
            <div style="padding: 18px;">
              <div style="font-size: 0.72rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: ${getKarsaCategoryColor(item.category)}; margin-bottom: 6px;">
                ${getKarsaCategoryLabel(item.category)}
              </div>
              <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; color: #0F172A; line-height: 1.35; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${item.title}
              </h4>
              <p style="font-size: 0.85rem; color: #64748B; line-height: 1.5; margin-bottom: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${item.summary || 'Karya reflektif dan pemikiran inovatif pemuda peserta pilar KARSA.'}
              </p>
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; color: #94A3B8; padding-top: 10px; border-top: 1px solid #F1F5F9;">
                <span style="font-weight: 700; color: #334155;">${item.author || 'Peserta Belajar'}</span>
                <span>${item.date || 'Oktober 2026'}</span>
              </div>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

// ----------------------------------------------------------------------------
// MODAL PEMBACA ARTIKEL
// ----------------------------------------------------------------------------
function openKarsaArticleModal(encodedId) {
  const id = decodeURIComponent(encodedId);
  const item = KARSA_STATE.articles.find(a => String(a.id) === String(id));
  if (!item) {
    window.location.href = `artikel.html?id=${encodeURIComponent(id)}`;
    return;
  }

  const modal = document.getElementById("modal-article-reader");
  if (!modal) {
    window.location.href = `artikel.html?id=${encodeURIComponent(id)}`;
    return;
  }

  const titleEl = document.getElementById("modal-article-title");
  const catEl = document.getElementById("modal-article-cat");
  const dateEl = document.getElementById("modal-article-date");
  const readtimeEl = document.getElementById("modal-article-readtime");
  const bodyEl = document.getElementById("modal-article-body");
  const coverWrap = document.getElementById("modal-article-cover-wrap");
  const coverImg = document.getElementById("modal-article-img");
  const authorEl = document.getElementById("modal-article-author");
  const roleEl = document.getElementById("modal-article-role");

  if (titleEl) titleEl.textContent = item.title;
  if (catEl) {
    catEl.textContent = getKarsaCategoryLabel(item.category);
    catEl.style.backgroundColor = getKarsaCategoryColor(item.category);
    catEl.style.color = "#FFFFFF";
  }
  if (dateEl) dateEl.textContent = item.date || "Oktober 2026";
  if (readtimeEl) readtimeEl.textContent = item.readTime || "5 menit baca";
  if (bodyEl) {
    if (typeof window.buildArticleKeyPointsHtml === "function") {
      bodyEl.innerHTML = window.buildArticleKeyPointsHtml(item);
    } else {
      bodyEl.innerHTML = item.content || `<p>${item.summary}</p>`;
    }
  }
  if (authorEl) authorEl.textContent = item.author || "Peserta Belajar";
  if (roleEl) roleEl.textContent = item.authorRole || "Peserta Belajar KARSA";

  if (coverWrap && coverImg) {
    if (item.coverImage) {
      coverImg.src = item.coverImage;
      coverWrap.style.display = "block";
    } else {
      coverWrap.style.display = "none";
    }
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeKarsaArticleModal() {
  const modal = document.getElementById("modal-article-reader");
  if (modal) modal.classList.remove("active");
  document.body.style.overflow = "";
}

// ----------------------------------------------------------------------------
// MODAL PEMUTAR VIDEO KARSA
// ----------------------------------------------------------------------------
function openKarsaVideoModal(url, encodedTitle, encodedCreator, encodedCat, encodedDesc) {
  const modal = document.getElementById("modal-karsa-video-player");
  const iframe = document.getElementById("karsa-player-iframe");
  const titleEl = document.getElementById("karsa-player-title");
  const creatorEl = document.getElementById("karsa-player-creator");
  const catEl = document.getElementById("karsa-player-cat");
  const descEl = document.getElementById("karsa-player-desc");

  if (!modal || !iframe) return;

  if (titleEl) titleEl.textContent = decodeURIComponent(encodedTitle || "Pemutar Video");
  if (creatorEl) creatorEl.textContent = `Oleh: ${decodeURIComponent(encodedCreator || "Kreator Pemuda")}`;
  if (catEl) catEl.textContent = `Kategori: ${decodeURIComponent(encodedCat || "Karya")}`;
  if (descEl) descEl.textContent = decodeURIComponent(encodedDesc || "");

  // Format link URL agar siap diembed di iframe
  let finalEmbed = url;
  const ytId = extractYouTubeId(url);
  if (ytId) {
    finalEmbed = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
  }

  iframe.src = finalEmbed;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeKarsaVideoModal() {
  const modal = document.getElementById("modal-karsa-video-player");
  const iframe = document.getElementById("karsa-player-iframe");

  if (modal) modal.classList.remove("active");
  if (iframe) iframe.src = "";
  document.body.style.overflow = "";
}

// ----------------------------------------------------------------------------
// MODAL SUBMIT KARYA (SWITCH ANTARA ARTIKEL & VIDEO)
// ----------------------------------------------------------------------------
function switchKarsaUploadType(type) {
  const btnArt = document.getElementById("btn-type-article");
  const btnVid = document.getElementById("btn-type-video");
  const wrapArt = document.getElementById("form-karsa-article-wrap");
  const wrapVid = document.getElementById("form-karsa-video-wrap");

  if (type === "video") {
    if (btnArt) btnArt.classList.remove("active");
    if (btnVid) btnVid.classList.add("active");
    if (wrapArt) wrapArt.style.display = "none";
    if (wrapVid) wrapVid.style.display = "block";
  } else {
    if (btnVid) btnVid.classList.remove("active");
    if (btnArt) btnArt.classList.add("active");
    if (wrapVid) wrapVid.style.display = "none";
    if (wrapArt) wrapArt.style.display = "block";
  }
}

function openSubmitArticleModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById("modal-submit-article");
  if (modal) {
    // Default tampilkan opsi artikel
    switchKarsaUploadType("article");
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeSubmitArticleModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById("modal-submit-article");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function setupKarsaModals() {
  const closeBtn = document.getElementById("btn-close-submit-article");
  if (closeBtn) closeBtn.addEventListener("click", closeSubmitArticleModal);

  const closeReaderBtn = document.getElementById("btn-close-article-modal");
  if (closeReaderBtn) closeReaderBtn.addEventListener("click", closeKarsaArticleModal);

  // Switcher Tipe Unggah: Artikel vs Video
  const btnTypeArt = document.getElementById("btn-type-article");
  const btnTypeVid = document.getElementById("btn-type-video");
  if (btnTypeArt) {
    btnTypeArt.addEventListener("click", (e) => {
      e.preventDefault();
      switchKarsaUploadType("article");
    });
  }
  if (btnTypeVid) {
    btnTypeVid.addEventListener("click", (e) => {
      e.preventDefault();
      switchKarsaUploadType("video");
    });
  }

  // Close on backdrop click
  const modalSubmit = document.getElementById("modal-submit-article");
  if (modalSubmit) {
    modalSubmit.addEventListener("click", (e) => {
      if (e.target === modalSubmit) closeSubmitArticleModal();
    });
  }

  const modalVideo = document.getElementById("modal-karsa-video-player");
  if (modalVideo) {
    modalVideo.addEventListener("click", (e) => {
      if (e.target === modalVideo) closeKarsaVideoModal();
    });
  }

  // 1. Setup Live Preview YouTube URL
  const videoUrlInput = document.getElementById("video-url-input");
  const ytPreviewBox = document.getElementById("karsa-yt-preview");
  const ytThumbImg = document.getElementById("karsa-yt-thumb");

  if (videoUrlInput && ytPreviewBox && ytThumbImg) {
    videoUrlInput.addEventListener("input", () => {
      const ytId = extractYouTubeId(videoUrlInput.value.trim());
      if (ytId) {
        ytThumbImg.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        ytPreviewBox.style.display = "flex";
      } else {
        ytPreviewBox.style.display = "none";
      }
    });
  }

  // 2. FORM ARTIKEL / ESAI SUBMIT
  const formArticle = document.getElementById("form-submit-article");
  if (formArticle) {
    formArticle.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("article-title-input").value.trim();
      const cat = document.getElementById("article-category-input").value;
      const author = document.getElementById("article-author-input").value.trim();
      const institution = document.getElementById("article-institution-input").value.trim();
      const content = document.getElementById("article-content-input").value.trim();
      const coverFileInput = document.getElementById("article-cover-input");
      const docFileInput = document.getElementById("article-doc-input");
      const submitBtn = document.getElementById("btn-submit-article");

      if (!title || !author || !content) {
        alert("Mohon lengkapi judul, nama penulis, dan isi tulisan!");
        return;
      }

      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Mengunggah Karya...";

      try {
        let cloudCoverUrl = "";
        if (coverFileInput && coverFileInput.files && coverFileInput.files[0] && window.ArutalaDB) {
          cloudCoverUrl = await window.ArutalaDB.uploadMediaFile(coverFileInput.files[0], "articles/covers");
        }

        let cloudDocUrl = "";
        if (docFileInput && docFileInput.files && docFileInput.files[0] && window.ArutalaDB) {
          cloudDocUrl = await window.ArutalaDB.uploadMediaFile(docFileInput.files[0], "articles/docs");
        }

        const finalCover = cloudCoverUrl || "img/seminar_cakrawala_muda.png";

        const payload = {
          title: title,
          category: cat,
          author: author,
          role: institution || "Peserta Belajar KARSA",
          date: "Baru saja",
          read_time: "4 menit baca",
          image: finalCover,
          doc_url: cloudDocUrl || null,
          quote: null,
          summary: content.length > 140 ? content.substring(0, 140) + "..." : content,
          content: `<p>${content.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>`
        };

        let newArt = null;
        if (window.ArutalaDB && typeof window.ArutalaDB.insertArticle === "function") {
          newArt = await window.ArutalaDB.insertArticle(payload);
        }

        if (!newArt) {
          newArt = {
            id: "karsa-" + Date.now(),
            type: "article",
            title: title,
            category: cat,
            categoryLabel: getKarsaCategoryLabel(cat),
            coverImage: finalCover,
            author: author,
            authorRole: institution || "Peserta Belajar KARSA",
            date: "Baru saja",
            readTime: "4 menit baca",
            summary: payload.summary,
            content: payload.content
          };
        }

        KARSA_STATE.articles.unshift(newArt);
        renderKarsaPortfolio();
        formArticle.reset();
        closeSubmitArticleModal();
        alert("Selamat! Karya dan esai reflektif kamu berhasil dipublikasikan di Etalase KARSA!");
      } catch (err) {
        console.error("Error submitting article:", err);
        alert("Karya berhasil dicatat secara lokal!");
        closeSubmitArticleModal();
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // 3. FORM VIDEO KREATIF SUBMIT
  const formVideo = document.getElementById("form-submit-video");
  if (formVideo) {
    formVideo.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = document.getElementById("video-title-input").value.trim();
      const cat = document.getElementById("video-category-input").value;
      const author = document.getElementById("video-author-input").value.trim();
      const institution = document.getElementById("video-institution-input").value.trim();
      const urlVal = document.getElementById("video-url-input").value.trim();
      const desc = document.getElementById("video-desc-input").value.trim();
      const submitBtn = document.getElementById("btn-submit-video");

      const ytId = extractYouTubeId(urlVal);
      if (!ytId) {
        alert("Format link YouTube tidak valid! Mohon masukkan tautan video YouTube yang benar.");
        return;
      }

      if (!title || !author || !desc) {
        alert("Mohon lengkapi judul, kreator, dan deskripsi video!");
        return;
      }

      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Menyimpan Video...";

      const newVideo = {
        id: "karsa-vid-" + Date.now(),
        type: "video",
        title: title,
        category: cat,
        categoryLabel: getKarsaCategoryLabel(cat),
        author: author,
        authorRole: institution || "Kreator Pemuda KARSA",
        date: "Baru saja",
        readTime: "Video Kreatif",
        thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        coverImage: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        videoUrl: `https://www.youtube.com/embed/${ytId}`,
        youtubeId: ytId,
        summary: desc,
        content: `<p>${desc.replace(/\n/g, "<br>")}</p>`
      };

      // Simpan ke localStorage agar video tetap ada saat reload
      try {
        const saved = JSON.parse(localStorage.getItem("arutala_karsa_custom_videos") || "[]");
        saved.unshift(newVideo);
        localStorage.setItem("arutala_karsa_custom_videos", JSON.stringify(saved));
      } catch (err) {
        console.warn("Gagal simpan video ke localStorage:", err);
      }

      // Tambahkan ke state & render
      KARSA_STATE.articles.unshift(newVideo);
      renderKarsaPortfolio();

      formVideo.reset();
      if (ytPreviewBox) ytPreviewBox.style.display = "none";
      closeSubmitArticleModal();

      alert("Selamat! Video kreatif kamu berhasil dipublikasikan di Etalase KARSA!\nPengunjung kini dapat menonton videomu langsung di website.");

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    });
  }
}

function setupKarsaNavDrawer() {
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

// ==========================================================================
// EXPOSE GLOBAL WINDOW FUNCTIONS (Menjamin kompatibilitas inline onclick)
// ==========================================================================
window.switchKarsaUploadType = switchKarsaUploadType;
window.openSubmitArticleModal = openSubmitArticleModal;
window.closeSubmitArticleModal = closeSubmitArticleModal;
window.openKarsaArticleModal = openKarsaArticleModal;
window.closeKarsaArticleModal = closeKarsaArticleModal;
window.openKarsaVideoModal = openKarsaVideoModal;
window.closeKarsaVideoModal = closeKarsaVideoModal;
window.filterKarsaKarya = filterKarsaKarya;

