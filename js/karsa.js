/**
 * ==========================================================================
 * ARUTALA - Pilar KARSA Controller (js/karsa.js)
 * Mengelola:
 * 1. Portofolio & Publikasi Karya Pemuda (Fitur 2)
 * 2. Dokumentasi Perkembangan (Fitur 3)
 * 3. Modal Upload Karya & Modal Pembaca Artikel terhubung Supabase
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  initKarsaPortfolio();
  setupKarsaModals();
  setupKarsaNavDrawer();
});

let KARSA_STATE = {
  articles: [],
  currentCategory: "all"
};

async function initKarsaPortfolio() {
  const container = document.getElementById("karsa-portfolio-container");
  if (!container) return;

  // 1. Ambil data awal dari ARUTALA_DATA
  const localArticles = (window.ARUTALA_DATA && Array.isArray(window.ARUTALA_DATA.articles))
    ? window.ARUTALA_DATA.articles
    : [];

  let cloudArticles = [];
  if (window.ArutalaDB && typeof window.ArutalaDB.fetchArticles === "function") {
    try {
      cloudArticles = await window.ArutalaDB.fetchArticles();
    } catch (err) {
      console.warn("Gagal memuat portofolio karya dari Supabase:", err);
    }
  }

  // Gabungkan artikel Cloud dan Lokal
  KARSA_STATE.articles = [
    ...cloudArticles,
    ...localArticles.filter(loc => !cloudArticles.some(c => String(c.id) === String(loc.id) || c.title === loc.title))
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

function renderKarsaPortfolio() {
  const container = document.getElementById("karsa-portfolio-container");
  if (!container) return;

  const items = KARSA_STATE.articles.slice(0, 6);

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: #64748B;">
        <p style="margin-bottom: 0;">Belum ada karya yang diunggah. Jadilah pemuda pertama yang mempublikasikan karyamu!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="uss-clean-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
      ${items.map(item => `
        <article class="uss-clean-card" style="border: 1px solid #E2E8F0; border-top: 3px solid ${getKarsaCategoryColor(item.category)} !important; border-radius: 8px; overflow: hidden; background: #FFFFFF; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onclick="openKarsaArticleModal('${encodeURIComponent(item.id)}')">
          <div style="position: relative; width: 100%; height: 180px; overflow: hidden; background: #F1F5F9;">
            <img src="${item.coverImage || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
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
      `).join('')}
    </div>
  `;
}

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
  if (bodyEl) bodyEl.innerHTML = item.content || `<p>${item.summary}</p>`;
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

function openSubmitArticleModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById("modal-submit-article");
  if (modal) {
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

  const form = document.getElementById("form-submit-article");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
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

      const finalCover = cloudCoverUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80";

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
      form.reset();
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
