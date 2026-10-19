/**
 * ==========================================================================
 * ARUTALA - Dedicated News & Story Portal Reader (js/artikel.js)
 * 1. Menampilkan 4 Kartu Besar Kategori Tema Utama
 * 2. Feed Daftar Artikel dengan Filter Kategori & Pencarian
 * 3. Tampilan Detail Baca Poin-Poin Pokok Gagasan Utama (Key Takeaways)
 * 4. Fitur Upload Artikel / Esai Pemuda (Supabase & LocalStorage Sync)
 * ==========================================================================
 */

(function () {
  'use strict';

  // State Portal Artikel
  const PortalState = {
    articles: [],
    currentCategory: "all",
    searchQuery: "",
    activeArticle: null
  };

  document.addEventListener("DOMContentLoaded", () => {
    initPortalArticle();
    setupUploadArticleForm();
  });

  async function initPortalArticle() {
    // 1. Ambil URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get("id");
    const categoryParam = urlParams.get("category");

    // 2. Kumpulkan Artikel: Default Data + Custom LocalStorage + Supabase Cloud
    const localArticles = (window.ARUTALA_DATA && Array.isArray(window.ARUTALA_DATA.articles)) 
      ? window.ARUTALA_DATA.articles 
      : [];

    const customArticles = JSON.parse(localStorage.getItem("arutala_custom_articles") || "[]");

    let cloudArticles = [];
    if (window.ArutalaDB && typeof window.ArutalaDB.fetchArticles === "function") {
      try {
        cloudArticles = await window.ArutalaDB.fetchArticles();
      } catch (e) {
        console.warn("Gagal memuat artikel dari Cloud:", e);
      }
    }

    let deletedIds = [];
    try {
      deletedIds = JSON.parse(localStorage.getItem("arutala_deleted_articles") || "[]");
    } catch (e) {
      deletedIds = [];
    }

    // Gabungkan & dedup berdasarkan id / title (customArticles prioritas teratas)
    const merged = [
      ...customArticles,
      ...cloudArticles,
      ...localArticles
    ];

    const uniqueMap = new Map();
    merged.forEach(item => {
      const key = String(item.id || item.title);
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    PortalState.articles = Array.from(uniqueMap.values()).filter(art => !deletedIds.includes(String(art.id)));

    // 3. Update Angka Hitungan di 4 Kartu Pilar
    updatePillarCounts();

    // 4. Setup Input Pencarian
    const searchInput = document.getElementById("portal-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        PortalState.searchQuery = e.target.value.trim().toLowerCase();
        renderHubArticles();
      });
    }

    // 5. Cek apakah ada param ?id=...
    if (articleId) {
      const found = PortalState.articles.find(a => String(a.id) === String(articleId));
      if (found) {
        openArticleDetail(found.id, false);
        return;
      }
    }

    // Default: Tampilkan Hub 4 Kartu Besar
    const initialCat = categoryParam || "all";
    showArticleHub(initialCat);
  }

  // Hitung jumlah artikel per kategori pilar
  function updatePillarCounts() {
    const counts = {
      pandai: 0,
      bersuara: 0,
      cerdas: 0,
      berdaya: 0
    };

    PortalState.articles.forEach(art => {
      const cat = (art.category || "").toLowerCase();
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });

    const elPandai = document.getElementById("count-pandai");
    const elBersuara = document.getElementById("count-bersuara");
    const elCerdas = document.getElementById("count-cerdas");
    const elBerdaya = document.getElementById("count-berdaya");

    if (elPandai) elPandai.textContent = `${counts.pandai} Naskah Tulisan`;
    if (elBersuara) elBersuara.textContent = `${counts.bersuara} Naskah Tulisan`;
    if (elCerdas) elCerdas.textContent = `${counts.cerdas} Naskah Tulisan`;
    if (elBerdaya) elBerdaya.textContent = `${counts.berdaya} Naskah Tulisan`;
  }

  // ==========================================================================
  // VIEW SWITCHER: HUB (4 PILAR) VS READER (POIN POKOK)
  // ==========================================================================
  window.showArticleHub = function (category) {
    const hubView = document.getElementById("portal-hub-view");
    const readerView = document.getElementById("portal-reader-view");

    if (hubView) hubView.style.display = "block";
    if (readerView) readerView.style.display = "none";

    // Update URL tanpa reload
    if (window.history.pushState) {
      const newUrl = window.location.pathname + (category && category !== "all" ? `?category=${category}` : "");
      window.history.pushState({ view: "hub" }, "", newUrl);
    }

    document.title = "Pustaka Gagasan & Jurnal Utama — ARUTALA";

    filterHubCategory(category || PortalState.currentCategory || "all", false);
  };

  window.filterHubCategory = function (category, shouldScroll = true) {
    PortalState.currentCategory = category || "all";

    // Update Pill Buttons
    const pills = document.querySelectorAll("#portal-filter-pills .uss-filter-pill");
    pills.forEach(pill => {
      if (pill.dataset.category === PortalState.currentCategory) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });

    // Update Judul & Subtitle Feed
    const titleLabel = document.getElementById("portal-feed-title-label");
    const subtitleLabel = document.getElementById("portal-feed-subtitle-label");

    if (titleLabel && subtitleLabel) {
      switch (PortalState.currentCategory) {
        case "pandai":
          titleLabel.textContent = "Pustaka Moderasi Beragama";
          subtitleLabel.textContent = "Kurasi pemikiran kritis nilai Rahmah, toleransi aktif, dan komitmen kebangsaan pemuda.";
          break;
        case "bersuara":
          titleLabel.textContent = "Pustaka Kesetaraan Gender";
          subtitleLabel.textContent = "Analisis dekonstruksi bias gender, keadilan hakiki, dan ruang publik aman bermartabat.";
          break;
        case "cerdas":
          titleLabel.textContent = "Pustaka Budaya Nusantara";
          subtitleLabel.textContent = "Kearifan lokal etno-pedagogi, tradisi gotong royong, dan pelestarian identitas nusantara.";
          break;
        case "berdaya":
          titleLabel.textContent = "Pustaka Sosial Masyarakat";
          subtitleLabel.textContent = "Riset aksi pemberdayaan pemuda, advokasi kelompok rentan, dan kepemimpinan inklusif.";
          break;
        default:
          titleLabel.textContent = "Semua Naskah & Gagasan Pemuda";
          subtitleLabel.textContent = "Klik kartu tulisan mana pun untuk langsung menelaah intisari poin-poin besarnya.";
          break;
      }
    }

    renderHubArticles();

    if (shouldScroll) {
      const feedSection = document.getElementById("portal-feed-section");
      if (feedSection) {
        feedSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  function renderHubArticles() {
    const container = document.getElementById("portal-hub-articles-container");
    if (!container) return;

    const filtered = PortalState.articles.filter(art => {
      const matchCat = (PortalState.currentCategory === "all") || (art.category === PortalState.currentCategory);
      const q = PortalState.searchQuery;
      const matchSearch = !q ||
        (art.title && art.title.toLowerCase().includes(q)) ||
        (art.author && art.author.toLowerCase().includes(q)) ||
        (art.summary && art.summary.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #64748B;">
          <div style="font-size: 1.1rem; font-weight: 700; color: #0F172A; margin-bottom: 6px;">Belum Ada Naskah di Kategori Ini</div>
          <p style="font-size: 0.88rem; max-width: 480px; margin: 0 auto 18px;">
            Jadilah yang pertama mengunggah naskah atau esai pemikiranmu di pilar ini!
          </p>
          <button type="button" class="btn btn-primary btn-sm btn-pill" onclick="openUploadArticleModal(event)" style="background: #2F4F87; color: #FFFFFF;">
            + Unggah Tulisan Sekarang
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(art => {
      const catColor = getCategoryThemeColor(art.category);
      const catLabel = getPortalCategoryLabel(art.category, art.categoryLabel);
      const coverImg = art.coverImage || "img/pelatihan_fasilitator_auditorium.jpg";

      return `
        <div class="uss-clean-card cat-${art.category}" onclick="openArticleDetail('${art.id}')" style="display: block; cursor: pointer; border-top: 3px solid ${catColor} !important;">
          <div class="clean-card-media">
            <img src="${coverImg}" alt="${art.title}" class="clean-card-img" loading="lazy">
          </div>
          <div class="clean-card-body">
            <div class="clean-cat-label" style="color: ${catColor}; font-weight: 800; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 6px;">
              ${catLabel}
            </div>
            <h4 class="clean-card-title" style="font-size: 1.05rem; font-weight: 800; color: #0F172A; line-height: 1.4; margin-bottom: 8px;">
              ${art.title}
            </h4>
            <p class="clean-card-summary" style="font-size: 0.86rem; color: #475569; line-height: 1.55; margin-bottom: 14px;">
              ${art.summary || 'Klik untuk menelaah poin gagasan utama.'}
            </p>
            <div class="clean-card-meta" style="font-size: 0.76rem; color: #64748B; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; padding-top: 10px; border-top: 1px solid #F1F5F9;">
              <span class="author-name" style="font-weight: 700; color: #1E293B;">${art.author}</span>
              <span class="read-action" style="font-weight: 700; color: ${catColor}; display: inline-flex; align-items: center; gap: 4px;">
                Baca Poin Pokok &rarr;
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // VIEW 2: TAMPILAN DETAIL BACA POIN-POIN POKOK
  // ==========================================================================
  window.openArticleDetail = function (articleId, shouldUpdateHistory = true) {
    const article = PortalState.articles.find(a => String(a.id) === String(articleId));
    if (!article) return;

    PortalState.activeArticle = article;

    const hubView = document.getElementById("portal-hub-view");
    const readerView = document.getElementById("portal-reader-view");

    if (hubView) hubView.style.display = "none";
    if (readerView) readerView.style.display = "block";

    // Update History URL
    if (shouldUpdateHistory && window.history.pushState) {
      window.history.pushState({ view: "reader", id: article.id }, "", `?id=${encodeURIComponent(article.id)}`);
    }

    // Update Title
    document.title = `${article.title} — ARUTALA`;

    // 1. Meta Eyebrow & Readtime
    const metaDateCat = document.getElementById("portal-meta-date-cat");
    if (metaDateCat) {
      const catLabel = getPortalCategoryLabel(article.category, article.categoryLabel);
      metaDateCat.textContent = `${(article.date || "BARU SAJA").toUpperCase()} | ${catLabel}`;
    }
    const metaReadtime = document.getElementById("portal-meta-readtime");
    if (metaReadtime) {
      metaReadtime.textContent = article.readTime || "4 Menit Baca";
    }

    // 2. Judul Utama
    const metaTitle = document.getElementById("portal-meta-title");
    if (metaTitle) metaTitle.textContent = article.title;

    // 3. Penulis & Byline
    const metaAuthor = document.getElementById("portal-meta-author");
    if (metaAuthor) metaAuthor.textContent = article.author;
    const metaRole = document.getElementById("portal-meta-role");
    if (metaRole) metaRole.textContent = article.authorRole || article.role || "Kontributor Pemuda ARUTALA";

    const bylineAvatar = document.getElementById("portal-byline-avatar");
    if (bylineAvatar) {
      bylineAvatar.textContent = article.author ? article.author.charAt(0).toUpperCase() : "A";
      bylineAvatar.style.backgroundColor = getCategoryThemeColor(article.category);
    }

    // 4. Foto Sampul Besar (Natural 16:9)
    const heroImg = document.getElementById("portal-hero-img");
    if (heroImg) {
      heroImg.src = article.coverImage || "img/pelatihan_fasilitator_auditorium.jpg";
      heroImg.alt = article.title;
    }

    // 5. Kutipan Refleksi
    const quoteContainer = document.getElementById("portal-quote-container");
    const heroQuote = document.getElementById("portal-hero-quote");
    const heroSource = document.getElementById("portal-hero-source");
    if (article.quoteHighlight) {
      if (heroQuote) heroQuote.textContent = `“${article.quoteHighlight}”`;
      if (heroSource) heroSource.textContent = `Kutipan Refleksi: ${article.author} (${article.authorRole || 'Kontributor Pemuda'})`;
      if (quoteContainer) quoteContainer.style.display = "block";
    } else {
      if (quoteContainer) quoteContainer.style.display = "none";
    }

    // 6. Topic Tags
    const tagsContainer = document.getElementById("portal-meta-tags");
    if (tagsContainer) {
      tagsContainer.innerHTML = "";
      const tags = article.tags || [getPortalCategoryLabel(article.category), "ARUTALA Pemuda", "Literasi Kritis"];
      tags.forEach(tag => {
        const pill = document.createElement("span");
        pill.className = "portal-meta-pill";
        pill.textContent = tag.toUpperCase();
        tagsContainer.appendChild(pill);
      });
    }

    // 7. Lead Summary
    const leadSummary = document.getElementById("portal-lead-summary");
    if (leadSummary) {
      leadSummary.textContent = article.summary || "";
    }

    // 8. KOTAK POIN-POIN BESAR GAGASAN UTAMA (KEY TAKEAWAYS 01, 02, 03)
    const contentBody = document.getElementById("portal-content-body");
    if (contentBody) {
      const points = (typeof window.getArticleKeyPoints === "function") 
        ? window.getArticleKeyPoints(article) 
        : (article.keyPoints || [
            { title: "Intisari Gagasan Pokok", desc: article.summary || "Gagasan pokok literasi pemuda." },
            { title: "Konteks & Relevansi Sosial", desc: "Pentingnya memperkuat kesadaran kritis dan perlindungan ruang aman bersama." },
            { title: "Langkah Transformasi Pemuda", desc: "Menerapkan nilai kepemimpinan inklusif dalam kehidupan sehari-hari." }
          ]);

      const actionNote = article.actionNote || (article.quoteHighlight ? article.quoteHighlight : "Terapkan intisari pemikiran ini dalam langkah aksi nyata di lingkungan terdekatmu.");

      const docDownloadHtml = article.docUrl ? `
        <div class="keypoints-doc-box">
          <div class="keypoints-doc-info">
            <div class="keypoints-doc-icon" style="font-weight: 800; font-size: 0.82rem; color: #2F4F87;">PDF</div>
            <div>
              <strong style="color: #0F172A; font-size: 0.9rem; display: block;">Dokumen Naskah / Jurnal Terlampir</strong>
              <span style="color: #64748B; font-size: 0.76rem;">Berkas asli terverifikasi di Cloud ARUTALA</span>
            </div>
          </div>
          <a href="${article.docUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="background: #2F4F87; color: #FFFFFF; font-weight: 700; border-radius: 6px; padding: 7px 16px; text-decoration: none; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 6px;">
            <span>Unduh Berkas</span> &rarr;
          </a>
        </div>
      ` : "";

      contentBody.innerHTML = `
        <div class="article-keypoints-box">
          <div class="keypoints-top-banner">
            <div class="keypoints-badge">
              <span class="keypoints-badge-text">POIN-POIN BESAR GAGASAN UTAMA</span>
            </div>
            <span class="keypoints-meta-tag">Intisari Pembelajaran Pemuda</span>
          </div>

          <div class="keypoints-list">
            ${points.map((pt, idx) => `
              <div class="keypoint-card">
                <div class="keypoint-num-badge">${String(idx + 1).padStart(2, '0')}</div>
                <div class="keypoint-card-content">
                  <h5 class="keypoint-card-title">${pt.title}</h5>
                  <p class="keypoint-card-desc">${pt.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="keypoints-action-callout">
            <div class="action-callout-header">
              <strong>REFLEKSI &amp; AKSI NYATA PEMUDA:</strong>
            </div>
            <p class="action-callout-text">${actionNote}</p>
          </div>

          ${docDownloadHtml}

          <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="showArticleHub()" style="background: #F1F5F9; color: #2F4F87; border: 1px solid #CBD5E1; font-weight: 700; border-radius: 6px; padding: 8px 16px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
              <span>&larr; Kembali ke Daftar Kategori &amp; Tulisan</span>
            </button>
            <a href="karsa.html" class="btn btn-outline-primary btn-sm" style="color: #2F4F87; border: 1px solid #2F4F87; font-weight: 700; border-radius: 6px; padding: 8px 16px; text-decoration: none; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 6px;">
              <span>Jelajahi Portofolio KARSA &rarr;</span>
            </a>
          </div>
        </div>
      `;
    }

    // 9. Bio Penulis
    const bioAvatar = document.getElementById("portal-bio-avatar");
    if (bioAvatar) {
      bioAvatar.textContent = article.author ? article.author.charAt(0).toUpperCase() : "A";
      bioAvatar.style.backgroundColor = getCategoryThemeColor(article.category);
    }
    const bioAuthor = document.getElementById("portal-bio-author");
    if (bioAuthor) bioAuthor.textContent = article.author;
    const bioRole = document.getElementById("portal-bio-role");
    if (bioRole) bioRole.textContent = article.authorRole || article.role || "Kontributor Pemuda ARUTALA";

    // 10. Related Articles
    renderRelatedArticles(PortalState.articles, article.id);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function renderRelatedArticles(allArticles, currentId) {
    const container = document.getElementById("portal-related-container");
    if (!container) return;

    container.innerHTML = "";
    const relatedList = allArticles.filter(a => String(a.id) !== String(currentId)).slice(0, 3);

    container.innerHTML = relatedList.map(item => {
      const catColor = getCategoryThemeColor(item.category);
      const catLabel = getPortalCategoryLabel(item.category, item.categoryLabel);
      const coverImg = item.coverImage || "img/seminar_cakrawala_muda.png";

      return `
        <div class="uss-clean-card cat-${item.category}" onclick="openArticleDetail('${item.id}')" style="cursor: pointer; border-top: 3px solid ${catColor} !important;">
          <div class="clean-card-media">
            <img src="${coverImg}" alt="${item.title}" class="clean-card-img" loading="lazy">
          </div>
          <div class="clean-card-body">
            <div class="clean-cat-label" style="color: ${catColor}; font-weight: 800; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 6px;">
              ${catLabel}
            </div>
            <h4 class="clean-card-title" style="font-size: 1.05rem; font-weight: 800; color: #0F172A; line-height: 1.4; margin-bottom: 8px;">
              ${item.title}
            </h4>
            <p class="clean-card-summary" style="font-size: 0.86rem; color: #475569; line-height: 1.55; margin-bottom: 12px;">
              ${item.summary || 'Klik untuk menelaah poin gagasan pokok.'}
            </p>
            <div style="font-size: 0.76rem; font-weight: 700; color: ${catColor};">
              Baca Poin Pokok &rarr;
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // FITUR UPLOAD ARTIKEL / ESAI PEMUDA
  // ==========================================================================
  window.openUploadArticleModal = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    const modal = document.getElementById("modal-upload-article");
    if (modal) {
      modal.classList.add("active");
      modal.style.display = "flex";
      document.body.classList.add("has-active-modal");
    }
  };

  window.closeUploadArticleModal = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    const modal = document.getElementById("modal-upload-article");
    if (modal) {
      modal.classList.remove("active");
      modal.style.display = "none";
      document.body.classList.remove("has-active-modal");
    }
  };

  function setupUploadArticleForm() {
    const form = document.getElementById("form-upload-article-portal");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("upload-article-title").value.trim();
      const cat = document.getElementById("upload-article-category").value;
      const author = document.getElementById("upload-article-author").value.trim();
      const institution = document.getElementById("upload-article-institution").value.trim();
      const summary = document.getElementById("upload-article-summary").value.trim();

      const pt1Title = document.getElementById("upload-article-pt1-title").value.trim();
      const pt1Desc = document.getElementById("upload-article-pt1-desc").value.trim();
      const pt2Title = document.getElementById("upload-article-pt2-title").value.trim();
      const pt2Desc = document.getElementById("upload-article-pt2-desc").value.trim();
      const pt3Title = document.getElementById("upload-article-pt3-title").value.trim();
      const pt3Desc = document.getElementById("upload-article-pt3-desc").value.trim();

      const actionNote = document.getElementById("upload-article-action").value.trim();
      const coverInput = document.getElementById("upload-article-cover");
      const docInput = document.getElementById("upload-article-doc");
      const submitBtn = document.getElementById("btn-submit-upload-portal");

      if (!title || !author || !summary) {
        alert("Mohon lengkapi judul naskah, nama penulis, dan ringkasan!");
        return;
      }

      const origText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Memproses &amp; Mengunggah...";

      try {
        let cloudCoverUrl = "";
        if (coverInput && coverInput.files && coverInput.files[0] && window.ArutalaDB) {
          cloudCoverUrl = await window.ArutalaDB.uploadMediaFile(coverInput.files[0], "articles/covers");
        }

        let cloudDocUrl = "";
        if (docInput && docInput.files && docInput.files[0] && window.ArutalaDB) {
          cloudDocUrl = await window.ArutalaDB.uploadMediaFile(docInput.files[0], "articles/docs");
        }

        const finalCover = cloudCoverUrl || "img/pelatihan_fasilitator_auditorium.jpg";

        const newArt = {
          id: "art-user-" + Date.now(),
          title: title,
          category: cat,
          categoryLabel: getPortalCategoryLabel(cat),
          author: author,
          authorRole: institution || "Kontributor Pemuda ARUTALA",
          date: "Baru saja",
          readTime: "4 menit baca",
          coverImage: finalCover,
          docUrl: cloudDocUrl || null,
          summary: summary,
          keyPoints: [
            { title: pt1Title || "Gagasan Pokok Utama", desc: pt1Desc || summary },
            { title: pt2Title || "Analisis Kritis & Konteks", desc: pt2Desc || "Penguatan literasi dan pemahaman inklusif pemuda." },
            { title: pt3Title || "Langkah Advokasi & Transformasi", desc: pt3Desc || "Implementasi aksi kolaboratif di lingkungan masyarakat." }
          ],
          actionNote: actionNote || "Jadikan gagasan ini sebagai inspirasi langkah nyata di sekitarmu.",
          tags: [getPortalCategoryLabel(cat), "Karya Pemuda", "Inspirasi"]
        };

        // Simpan ke Supabase jika tersedia
        if (window.ArutalaDB && typeof window.ArutalaDB.insertArticle === "function") {
          try {
            await window.ArutalaDB.insertArticle({
              title: newArt.title,
              category: newArt.category,
              author: newArt.author,
              role: newArt.authorRole,
              date: newArt.date,
              read_time: newArt.readTime,
              image: newArt.coverImage,
              doc_url: newArt.docUrl,
              quote: null,
              summary: newArt.summary,
              content: `<p>${summary}</p>`
            });
          } catch (errDb) {
            console.warn("Notice insert Supabase:", errDb);
          }
        }

        // Simpan ke LocalStorage agar tidak hilang saat refresh
        const existingCustom = JSON.parse(localStorage.getItem("arutala_custom_articles") || "[]");
        existingCustom.unshift(newArt);
        localStorage.setItem("arutala_custom_articles", JSON.stringify(existingCustom));

        // Masukkan ke State Lokal
        PortalState.articles.unshift(newArt);

        // Reset form & tutup modal
        form.reset();
        closeUploadArticleModal();
        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;

        // Notifikasi Sukses
        showPortalToast("Karya tulisan pemuda berhasil dipublikasikan!");

        // Update counts & feed
        updatePillarCounts();

        // Langsung buka artikel baru tersebut untuk melihat poin pokoknya!
        setTimeout(() => {
          openArticleDetail(newArt.id);
        }, 350);

      } catch (err) {
        console.error("Gagal unggah artikel:", err);
        alert("Terjadi kendala saat mengunggah. Silakan coba kembali.");
        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;
      }
    });
  }

  // ==========================================================================
  // HELPERS & UTILITIES
  // ==========================================================================
  function getCategoryThemeColor(category) {
    switch ((category || "").toLowerCase()) {
      case "bersuara": return "#FF64C5";
      case "pandai": return "#10B981";
      case "cerdas": return "#0284C7";
      case "berdaya": return "#F59E0B";
      default: return "#2F4F87";
    }
  }

  function getPortalCategoryLabel(category, fallback) {
    switch ((category || "").toLowerCase()) {
      case "pandai":
      case "moderasi": return "MODERASI BERAGAMA";
      case "bersuara":
      case "kesetaraan": return "KESETARAAN";
      case "cerdas":
      case "budaya": return "BUDAYA";
      case "berdaya":
      case "sosial": return "SOSIAL MASYARAKAT";
      default: return (fallback || category || "MODERASI BERAGAMA").toUpperCase();
    }
  }

  function showPortalToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast toast-success";
    toast.style.cssText = "background: #0F172A; color: #FFFFFF; padding: 14px 20px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); margin-top: 10px; font-size: 0.88rem; font-weight: 700; display: flex; align-items: center; gap: 10px; border-left: 4px solid #10B981;";
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

})();
