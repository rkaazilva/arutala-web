/**
 * ==========================================================================
 * ARUTALA - Dedicated News & Story Portal Reader (artikel.js)
 * Sesuai Desain Malala Fund / Generation Unlimited & SejutaCita Aesthetic
 * Menampilkan Halaman Baca Berita Penuh (bukan pop-up/modal)
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  initPortalArticle();
});

async function initPortalArticle() {
  // 1. Ambil ID artikel dari URL Parameter (?id=...)
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get("id") || "art-5";

  // 2. Ambil data artikel awal dari ARUTALA_DATA
  const localArticles = (window.ARUTALA_DATA && window.ARUTALA_DATA.articles) ? window.ARUTALA_DATA.articles : [];
  let cloudArticles = [];

  // Sinkronisasi data artikel dari Supabase Cloud
  if (window.ArutalaDB && typeof window.ArutalaDB.fetchArticles === "function") {
    try {
      cloudArticles = await window.ArutalaDB.fetchArticles();
    } catch (e) {
      console.warn("Gagal memuat artikel dari Supabase Cloud:", e);
    }
  }

  // Gabungkan artikel Cloud (terbaru) dengan artikel lokal
  const articles = [
    ...cloudArticles,
    ...localArticles.filter(loc => !cloudArticles.some(c => String(c.id) === String(loc.id) || c.title === loc.title))
  ];

  let currentArticle = articles.find(a => String(a.id) === String(articleId));

  // Jika belum ditemukan di cache gabungan, coba ambil langsung by ID dari Supabase
  if (!currentArticle && window.ArutalaDB && typeof window.ArutalaDB.fetchArticleById === "function") {
    try {
      currentArticle = await window.ArutalaDB.fetchArticleById(articleId);
      if (currentArticle) {
        articles.unshift(currentArticle);
      }
    } catch (e) {
      console.warn("Fetch article by id error:", e);
    }
  }

  // Fallback jika ID benar-benar tidak ditemukan
  if (!currentArticle) {
    currentArticle = articles[0] || {
      id: "art-1",
      title: "Dekonstruksi Makna Kesetaraan: Mengapa 'Keadilan' Lebih Mendesak daripada 'Kesamaan'?",
      category: "keadilan",
      categoryLabel: "Keadilan Gender",
      themeColor: "pink",
      accentColor: "#FF64C5",
      coverImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
      quoteHighlight: "Keadilan bukan memberi setiap orang ukuran sepatu sama, melainkan yang pas dengan kakinya.",
      author: "Nuzhatul Hilawah",
      authorRole: "Fasilitator Pemuda UIN Bandung",
      date: "12 Oktober 2026",
      readTime: "5 menit baca",
      summary: "Memahami perbedaan mendasar antara perlakuan sama rata dengan perlakuan adil sesuai kebutuhan spesifik.",
      content: "<p>Konten artikel sedang disiapkan.</p>",
      tags: ["Keadilan Gender", "Ruang Publik", "Edukasi Pemuda"]
    };
  }

  // 3. Update Title & Meta Tags
  document.title = `${currentArticle.title} — ARUTALA Newsroom`;
  const pageTitleEl = document.getElementById("page-title");
  if (pageTitleEl) pageTitleEl.textContent = `${currentArticle.title} — ARUTALA`;

  const metaDesc = document.getElementById("meta-description");
  if (metaDesc) metaDesc.content = currentArticle.summary;

  const ogTitle = document.getElementById("og-title");
  if (ogTitle) ogTitle.content = currentArticle.title;

  const ogDesc = document.getElementById("og-desc");
  if (ogDesc) ogDesc.content = currentArticle.summary;

  // 4. Hero & Header Section (Clean Newsroom Editorial Layout)
  const heroImg = document.getElementById("portal-hero-img");
  if (heroImg) {
    heroImg.src = currentArticle.coverImage || "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=800&q=80";
    heroImg.alt = currentArticle.title;
  }

  const quoteContainer = document.getElementById("portal-quote-container");
  const heroQuote = document.getElementById("portal-hero-quote");
  const heroSource = document.getElementById("portal-hero-source");
  if (currentArticle.quoteHighlight) {
    if (heroQuote) heroQuote.textContent = `“${currentArticle.quoteHighlight}”`;
    if (heroSource) heroSource.textContent = `Kutipan Refleksi: ${currentArticle.author} (${currentArticle.authorRole})`;
    if (quoteContainer) quoteContainer.style.display = "block";
  } else {
    if (quoteContainer) quoteContainer.style.display = "none";
  }

  // 5. Eyebrow, Title, & Author Byline
  const metaDateCat = document.getElementById("portal-meta-date-cat");
  if (metaDateCat) {
    const catName = currentArticle.categoryLabel ? currentArticle.categoryLabel.replace(/\(.*\)/, "").trim() : currentArticle.category;
    metaDateCat.textContent = `${currentArticle.date.toUpperCase()} | ${catName.toUpperCase()}`;
  }

  const metaReadTime = document.getElementById("portal-meta-readtime");
  if (metaReadTime) {
    metaReadTime.textContent = currentArticle.readTime || "5 Menit Baca";
  }

  const metaTitle = document.getElementById("portal-meta-title");
  if (metaTitle) {
    metaTitle.textContent = currentArticle.title;
  }

  const metaAuthor = document.getElementById("portal-meta-author");
  if (metaAuthor) {
    metaAuthor.textContent = currentArticle.author;
  }

  const metaRole = document.getElementById("portal-meta-role");
  if (metaRole) {
    metaRole.textContent = `${currentArticle.authorRole} • UIN Sunan Gunung Djati Bandung`;
  }

  const bylineAvatar = document.getElementById("portal-byline-avatar");
  if (bylineAvatar) {
    bylineAvatar.textContent = currentArticle.author ? currentArticle.author.charAt(0) : "A";
    bylineAvatar.style.backgroundColor = currentArticle.accentColor || "var(--primary)";
  }

  // Render Topic Pills (Tags)
  const tagsContainer = document.getElementById("portal-meta-tags");
  if (tagsContainer) {
    tagsContainer.innerHTML = "";
    const tags = currentArticle.tags || [currentArticle.categoryLabel || "Inovasi Pemuda", "ARUTALA"];
    tags.forEach(tag => {
      const pill = document.createElement("span");
      pill.className = "portal-meta-pill";
      pill.textContent = tag.toUpperCase();
      tagsContainer.appendChild(pill);
    });
  }

  // 6. Right Column (Rich Editorial Content Body)
  const leadSummary = document.getElementById("portal-lead-summary");
  if (leadSummary) {
    leadSummary.textContent = currentArticle.summary;
  }

  const contentBody = document.getElementById("portal-content-body");
  if (contentBody) {
    contentBody.innerHTML = currentArticle.content;
    if (currentArticle.docUrl) {
      contentBody.innerHTML += `
        <div style="margin-top: 32px; padding: 18px 22px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 40px; height: 40px; background: #EEF3FA; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #2F4F87;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <div>
              <strong style="color: #0F172A; font-size: 0.92rem; display: block;">Dokumen Naskah Riset / Esai Terlampir</strong>
              <span style="color: #64748B; font-size: 0.78rem;">Berkas asli terverifikasi di Cloud Storage ARUTALA</span>
            </div>
          </div>
          <a href="${currentArticle.docUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="background: #2F4F87; color: #FFFFFF; font-weight: 700; border-radius: 4px; padding: 8px 16px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
            <span>Unduh Berkas</span>
            <span>&rarr;</span>
          </a>
        </div>
      `;
    }
  }

  // Author Bio Card
  const bioAvatar = document.getElementById("portal-bio-avatar");
  if (bioAvatar) {
    bioAvatar.textContent = currentArticle.author ? currentArticle.author.charAt(0) : "A";
    bioAvatar.style.backgroundColor = currentArticle.accentColor || "var(--primary)";
  }

  const bioAuthor = document.getElementById("portal-bio-author");
  if (bioAuthor) {
    bioAuthor.textContent = currentArticle.author;
  }

  const bioRole = document.getElementById("portal-bio-role");
  if (bioRole) {
    bioRole.textContent = `${currentArticle.authorRole} • UIN Sunan Gunung Djati Bandung`;
  }

  // 7. Share Action Buttons
  setupShareButtons(currentArticle);

  // 8. Render Related Stories
  renderRelatedArticles(articles, currentArticle.id);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setupShareButtons(article) {
  const btnShareWa = document.getElementById("btn-share-wa");
  if (btnShareWa) {
    btnShareWa.addEventListener("click", () => {
      const pageUrl = window.location.href;
      const text = `Baca tulisan menarik di ARUTALA: "${article.title}"\n${pageUrl}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    });
  }

  const btnCopyLink = document.getElementById("btn-copy-link");
  if (btnCopyLink) {
    btnCopyLink.addEventListener("click", () => {
      const pageUrl = window.location.href;
      navigator.clipboard.writeText(pageUrl).then(() => {
        showPortalToast("Tautan artikel berhasil disalin ke papan klip!");
      }).catch(() => {
        // Fallback jika navigator.clipboard diblokir
        const dummy = document.createElement("input");
        document.body.appendChild(dummy);
        dummy.value = pageUrl;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        showPortalToast("Tautan artikel berhasil disalin ke papan klip!");
      });
    });
  }
}

function getCategoryThemeColor(category) {
  switch ((category || "").toLowerCase()) {
    case "bersuara": return "#FF64C5";
    case "pandai": return "#66BB6A";
    case "cerdas": return "#89BBEE";
    case "berdaya": return "#2F4F87";
    default: return "#2F4F87";
  }
}

function renderRelatedArticles(allArticles, currentId) {
  const container = document.getElementById("portal-related-container");
  if (!container) return;

  container.innerHTML = "";
  const relatedList = allArticles.filter(a => a.id !== currentId).slice(0, 3);

  relatedList.forEach(item => {
    const card = document.createElement("div");
    const catColor = getCategoryThemeColor(item.category);
    card.className = `article-card cat-${item.category}`;
    card.setAttribute("data-category", item.category);
    card.style.borderTop = `3px solid ${catColor}`;
    card.style.cursor = "pointer";

    card.innerHTML = `
      <div class="article-cover-wrap">
        <img src="${item.coverImage}" alt="${item.title}" class="article-cover-img" loading="lazy">
        <div class="article-cover-overlay"></div>
        <span class="article-floating-badge" style="background: ${catColor}; color: #FFFFFF;">
          ${item.categoryLabel || item.category}
        </span>
        <span class="article-read-pill">${item.readTime || '5 menit baca'}</span>
      </div>

      <div class="article-body">
        <div class="article-meta">
          <span class="article-date">${item.date}</span>
          <span class="article-accent-dot" style="background: ${catColor};"></span>
          <span class="article-category-name" style="color: ${catColor};">
            ${item.tags ? item.tags[0] : 'Literasi'}
          </span>
        </div>

        <h3 class="article-title">${item.title}</h3>
        <p class="article-summary">${item.summary}</p>
      </div>

      <div class="article-footer">
        <div class="author-info">
          <div class="author-avatar" style="background: ${catColor};">
            ${item.author ? item.author.charAt(0) : 'A'}
          </div>
          <div class="author-text">
            <h5>${item.author}</h5>
            <span>${item.authorRole || 'Kontributor'}</span>
          </div>
        </div>
        <span class="read-more-btn">
          Baca Cerita <span class="arrow">&rarr;</span>
        </span>
      </div>
    `;

    card.addEventListener("click", () => {
      window.location.href = `artikel.html?id=${encodeURIComponent(item.id)}`;
    });

    container.appendChild(card);
  });
}

function showPortalToast(message) {
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
