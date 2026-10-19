// ==========================================================================
// GLOBAL HANDLERS: MODAL & INTERAKSI TOMBOL ARUTALA
// ==========================================================================

function openModalById(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    modal.style.display = "flex";
    modal.style.opacity = "1";
    modal.style.visibility = "visible";
    modal.style.pointerEvents = "auto";
    document.body.classList.add("has-active-modal");
  }
}

function closeModalById(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    modal.style.display = "none";
    modal.style.opacity = "0";
    modal.style.visibility = "hidden";
    modal.style.pointerEvents = "none";
  }
  const remaining = document.querySelector(".modal-overlay.active");
  if (!remaining) {
    document.body.classList.remove("has-active-modal");
  }
}

window.closeAllModals = function() {
  document.querySelectorAll(".modal-overlay").forEach(modal => {
    modal.classList.remove("active");
    modal.style.display = "none";
    modal.style.opacity = "0";
    modal.style.visibility = "hidden";
    modal.style.pointerEvents = "none";
  });
  document.body.classList.remove("has-active-modal");
};

window.openSubmitArticleModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  openModalById("modal-submit-article");
  setTimeout(() => {
    const titleInput = document.getElementById("article-title-input");
    if (titleInput) titleInput.focus();
  }, 100);
};

window.closeSubmitArticleModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  closeModalById("modal-submit-article");
};

window.openSubmitActionModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  openModalById("modal-submit-action");
};

window.closeSubmitActionModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  closeModalById("modal-submit-action");
};

window.openAskQAModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  openModalById("modal-ask-qa");
};

window.closeAskQAModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  closeModalById("modal-ask-qa");
};

window.openVideoModal = function(videoUrl, title, takeaways) {
  const iframe = document.getElementById("modal-video-iframe");
  const titleEl = document.getElementById("modal-video-title");
  const descEl = document.getElementById("modal-video-desc");
  if (iframe && videoUrl) iframe.src = videoUrl;
  if (titleEl && title) titleEl.textContent = title;
  if (descEl && takeaways) descEl.textContent = takeaways;
  openModalById("modal-video-player");
};

window.closeVideoModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const iframe = document.getElementById("modal-video-iframe");
  if (iframe) iframe.src = "";
  closeModalById("modal-video-player");
};

window.getArticleKeyPoints = function(art) {
  if (art && Array.isArray(art.keyPoints) && art.keyPoints.length > 0) {
    return art.keyPoints;
  }
  
  // Ekstraksi otomatis dari HTML content atau teks jika belum ada keyPoints terdefinisi
  const points = [];
  if (art && art.content) {
    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = art.content;
      
      // 1. Coba cari tag heading h3, h4
      const headings = tempDiv.querySelectorAll("h3, h4");
      if (headings.length > 0) {
        headings.forEach((h, i) => {
          if (i < 4) {
            let nextP = h.nextElementSibling;
            while (nextP && nextP.tagName !== "P" && nextP.tagName !== "UL" && nextP.tagName !== "H3" && nextP.tagName !== "H4") {
              nextP = nextP.nextElementSibling;
            }
            const desc = (nextP ? nextP.textContent.trim() : (art.summary || ""));
            points.push({
              title: h.textContent.trim(),
              desc: desc.length > 175 ? desc.substring(0, 172) + "..." : desc
            });
          }
        });
      }
      
      // 2. Coba cari list li jika tidak ada heading
      if (points.length === 0) {
        const listItems = tempDiv.querySelectorAll("li");
        if (listItems.length > 0) {
          listItems.forEach((li, i) => {
            if (i < 4) {
              const strong = li.querySelector("strong, b");
              const title = strong ? strong.textContent.replace(/:$/, "").trim() : `Poin Pokok #${i + 1}`;
              const desc = li.textContent.replace(title, "").replace(/^[:\s-]+/, "").trim();
              points.push({
                title: title,
                desc: desc.length > 175 ? desc.substring(0, 172) + "..." : desc
              });
            }
          });
        }
      }

      // 3. Fallback ke pemotongan paragraf jika tidak ada h3/li
      if (points.length === 0) {
        const paras = tempDiv.querySelectorAll("p");
        paras.forEach((p, i) => {
          const text = p.textContent.trim();
          if (text && i < 3) {
            const sentences = text.split(/(?<=[.?!])\s+/);
            const firstSentence = sentences[0] || `Pokok Pikiran #${i + 1}`;
            const rest = sentences.slice(1).join(" ") || text;
            points.push({
              title: firstSentence.length > 60 ? firstSentence.substring(0, 57) + "..." : firstSentence,
              desc: rest.length > 175 ? rest.substring(0, 172) + "..." : rest
            });
          }
        });
      }
    } catch (e) {
      console.warn("Gagal ekstraksi poin artikel:", e);
    }
  }

  // 4. Fallback default jika teks kosong
  if (points.length === 0) {
    points.push(
      { title: "Intisari Gagasan Pokok", desc: (art && art.summary) || "Gagasan penting literasi pemuda untuk menciptakan ruang tumbuh yang setara dan adil." },
      { title: "Konteks & Relevansi Sosial", desc: "Pentingnya memperkuat kesadaran kritis, empati sebaya, dan perlindungan ruang aman bersama." },
      { title: "Langkah Transformasi Pemuda", desc: "Menerapkan nilai-nilai kepemimpinan inklusif dalam kehidupan kampus, organisasi, dan ranah digital." }
    );
  }

  return points;
};

window.buildArticleKeyPointsHtml = function(art) {
  if (!art) return "";
  const points = window.getArticleKeyPoints(art);
  const actionNote = art.actionNote || (art.quoteHighlight ? art.quoteHighlight : "Terapkan intisari pemikiran ini dalam langkah aksi nyata pemuda di lingkungan sekitarmu.");
  
  const docDownloadHtml = art.docUrl ? `
    <div class="keypoints-doc-box">
      <div class="keypoints-doc-info">
        <div class="keypoints-doc-icon" style="font-weight: 800; font-size: 0.82rem; color: #2F4F87;">PDF</div>
        <div>
          <strong style="color: #0F172A; font-size: 0.88rem; display: block;">Dokumen Naskah / Jurnal Terlampir</strong>
          <span style="color: #64748B; font-size: 0.74rem;">Tersimpan resmi di Cloud Storage ARUTALA</span>
        </div>
      </div>
      <a href="${art.docUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="background: #2F4F87; color: #FFFFFF; font-weight: 700; border-radius: 6px; padding: 7px 14px; text-decoration: none; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">
        <span>Unduh Naskah</span> &rarr;
      </a>
    </div>
  ` : "";

  return `
    <div class="article-keypoints-box">
      <div class="keypoints-top-banner">
        <div class="keypoints-badge">
          <span class="keypoints-badge-text">POIN-POIN BESAR GAGASAN UTAMA</span>
        </div>
        <span class="keypoints-meta-tag">Format Baca Cepat Pemuda</span>
      </div>

      <div class="keypoints-lead-text">
        ${art.summary || 'Berikut adalah intisari gagasan pokok tulisan ini yang disajikan secara terarah dan aplikatif:'}
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

      <div class="keypoints-accordion-wrapper">
        <button type="button" class="btn-toggle-fulltext" onclick="window.toggleArticleFullText(this)">
          <span class="toggle-text">Buka Naskah Narasi Lengkap</span>
          <span class="toggle-icon">▼</span>
        </button>
        <div class="fulltext-collapse-container" style="display: none;">
          <div class="fulltext-inner-content">
            ${art.content || `<p style="color: #64748B; font-style: italic;">Tidak ada naskah narasi tambahan.</p>`}
          </div>
        </div>
      </div>
    </div>
  `;
};

window.toggleArticleFullText = function(btn) {
  if (!btn) return;
  const container = btn.nextElementSibling;
  const icon = btn.querySelector(".toggle-icon");
  const text = btn.querySelector(".toggle-text");
  if (!container) return;
  
  const isHidden = container.style.display === "none" || !container.style.display;
  if (isHidden) {
    container.style.display = "block";
    if (icon) icon.textContent = "▲";
    if (text) text.textContent = "Tutup Naskah Narasi Lengkap";
  } else {
    container.style.display = "none";
    if (icon) icon.textContent = "▼";
    if (text) text.textContent = "Buka Naskah Narasi Lengkap";
  }
};

window.openArticleReaderModalById = function(id) {
  const art = (window.AppState && window.AppState.articles && window.AppState.articles.find(a => String(a.id) === String(id))) || 
              (window.ARUTALA_DATA && window.ARUTALA_DATA.articles && window.ARUTALA_DATA.articles.find(a => String(a.id) === String(id)));
  if (art) {
    window.openArticleReaderModal(art);
  } else {
    window.location.href = `artikel.html?id=${encodeURIComponent(id)}`;
  }
};

window.openArticleReaderModal = function(art) {
  if (!art) return;
  const modalTitle = document.getElementById("modal-article-title");
  const modalCat = document.getElementById("modal-article-cat");
  const modalDate = document.getElementById("modal-article-date");
  const modalReadtime = document.getElementById("modal-article-readtime");
  const modalBody = document.getElementById("modal-article-body");
  const coverWrap = document.getElementById("modal-article-cover-wrap");
  const coverImg = document.getElementById("modal-article-img");
  const quoteWrap = document.getElementById("modal-article-quote-wrap");
  const quoteText = document.getElementById("modal-article-quote");
  const modalAvatar = document.getElementById("modal-article-avatar");
  const modalAuthor = document.getElementById("modal-article-author");
  const modalRole = document.getElementById("modal-article-role");

  if (modalTitle) modalTitle.textContent = art.title || "Artikel";
  if (modalCat) {
    modalCat.textContent = typeof getCategoryLabelClean === 'function' ? getCategoryLabelClean(art.category) : (art.categoryLabel || "MODERASI BERAGAMA");
    modalCat.className = `badge ${typeof getCategoryBadgeClass === 'function' ? getCategoryBadgeClass(art.category) : 'badge-blue'}`;
  }
  if (modalDate) modalDate.textContent = art.date || "Oktober 2026";
  if (modalReadtime) modalReadtime.textContent = art.readTime || "5 menit baca";
  
  // Render format Poin-Poin Besar (Key Takeaways)
  if (modalBody) {
    modalBody.innerHTML = window.buildArticleKeyPointsHtml(art);
  }

  if (coverWrap && coverImg) {
    if (art.coverImage) {
      coverImg.src = art.coverImage;
      coverWrap.style.display = "block";
    } else {
      coverWrap.style.display = "none";
    }
  }

  if (quoteWrap && quoteText) {
    if (art.quoteHighlight) {
      quoteText.textContent = `“${art.quoteHighlight}”`;
      quoteWrap.style.borderLeftColor = art.accentColor || "var(--prisma-coral)";
      quoteWrap.style.display = "block";
    } else {
      quoteWrap.style.display = "none";
    }
  }

  if (modalAvatar) {
    modalAvatar.textContent = (art.author || "A").charAt(0);
    modalAvatar.style.background = art.accentColor || "var(--prisma-navy)";
  }
  if (modalAuthor) modalAuthor.textContent = art.author || "Penulis";
  if (modalRole) modalRole.textContent = art.authorRole || "";

  const modalFullLink = document.getElementById("modal-article-full-link");
  if (modalFullLink) {
    modalFullLink.href = `artikel.html?id=${encodeURIComponent(art.id)}`;
  }

  openModalById("modal-article-reader");
};

window.closeArticleReaderModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  closeModalById("modal-article-reader");
};

window.openReferralModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (typeof window.renderReferralsGlobal === "function") {
    window.renderReferralsGlobal();
  }
  openModalById("modal-referral");
};

window.closeReferralModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  closeModalById("modal-referral");
};

window.setCircleRegistrationRole = function(role) {
  const roleMenteeBtn = document.getElementById("role-mentee");
  const roleTutorBtn = document.getElementById("role-tutor");
  const modalRoleMenteeBtn = document.getElementById("modal-role-mentee");
  const modalRoleTutorBtn = document.getElementById("modal-role-tutor");
  const regRoleInput = document.getElementById("reg-role-input");
  const menteeFields = document.getElementById("mentee-specific-fields");
  const tutorFields = document.getElementById("tutor-specific-fields");
  const regInterest = document.getElementById("reg-interest");
  const regExperience = document.getElementById("reg-experience");

  if (role === "tutor") {
    if (roleTutorBtn) roleTutorBtn.classList.add("active");
    if (roleMenteeBtn) roleMenteeBtn.classList.remove("active");
    if (modalRoleTutorBtn) modalRoleTutorBtn.classList.add("active");
    if (modalRoleMenteeBtn) modalRoleMenteeBtn.classList.remove("active");
    if (regRoleInput) regRoleInput.value = "tutor";
    if (menteeFields) menteeFields.style.display = "none";
    if (tutorFields) tutorFields.style.display = "block";
    if (regInterest) { regInterest.required = false; regInterest.disabled = true; }
    if (regExperience) { regExperience.required = true; regExperience.disabled = false; }
  } else {
    if (roleMenteeBtn) roleMenteeBtn.classList.add("active");
    if (roleTutorBtn) roleTutorBtn.classList.remove("active");
    if (modalRoleMenteeBtn) modalRoleMenteeBtn.classList.add("active");
    if (modalRoleTutorBtn) modalRoleTutorBtn.classList.remove("active");
    if (regRoleInput) regRoleInput.value = "mentee";
    if (menteeFields) menteeFields.style.display = "block";
    if (tutorFields) tutorFields.style.display = "none";
    if (regInterest) { regInterest.required = true; regInterest.disabled = false; }
    if (regExperience) { regExperience.required = false; regExperience.disabled = true; }
  }
};

window.openCircleRegistrationModal = function(role, e) {
  if (e && e.preventDefault) e.preventDefault();
  if (role) {
    window.setCircleRegistrationRole(role);
  }
  const form = document.getElementById("modal-circle-reg-form");
  const successBox = document.getElementById("modal-circle-reg-success");
  if (form) form.style.display = "block";
  if (successBox) successBox.style.display = "none";
  openModalById("modal-circle-registration");
};

window.closeCircleRegistrationModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  closeModalById("modal-circle-registration");
};

window.filterArticlesAndScroll = function(cat, e) {
  if (e && e.preventDefault) e.preventDefault();
  const targetUrl = 'artikel.html' + (cat && cat !== 'all' ? '?category=' + encodeURIComponent(cat) : '');
  window.location.href = targetUrl;
};

// ==========================================================================
// USS FEED HEADER HANDLERS (Drawer, Dropdown & Top Quick Search)
// ==========================================================================
window.openUssDrawer = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const drawer = document.getElementById("uss-side-drawer");
  const overlay = document.getElementById("uss-drawer-overlay");
  if (drawer) drawer.classList.add("active");
  if (overlay) overlay.classList.add("active");
  document.body.classList.add("has-active-modal");
};

window.closeUssDrawer = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const drawer = document.getElementById("uss-side-drawer");
  const overlay = document.getElementById("uss-drawer-overlay");
  if (drawer) drawer.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
  document.body.classList.remove("has-active-modal");
};

window.toggleUssSearch = function(force) {
  const searchBar = document.getElementById("uss-header-search-bar");
  const searchInput = document.getElementById("uss-top-search-input");
  if (!searchBar) return;
  const isHidden = searchBar.style.display === "none" || !searchBar.style.display;
  const shouldOpen = force !== undefined ? force : isHidden;
  searchBar.style.display = shouldOpen ? "block" : "none";
  if (shouldOpen && searchInput) {
    setTimeout(() => searchInput.focus(), 60);
  }
};

// ==========================================================================
// DONATION SYSTEM HANDLERS
// ==========================================================================
window.selectedDonationAmountValue = 10000;
window.selectedDonationPackageName = "1 Paket Modul Belajar";

const DONATION_PACKAGES = {
  10000: "1 Paket Modul Belajar",
  25000: "1 Sesi Konseling Sebaya",
  50000: "Paket Ruang Aman Kampus",
  100000: "Inkubasi Aksi Sosial Desa"
};

window.selectDonationAmount = function(amount, el) {
  document.querySelectorAll(".donation-pill").forEach(p => p.classList.remove("active"));
  if (el) el.classList.add("active");
  const customInput = document.getElementById("custom-donation-amount");
  if (customInput) customInput.value = "";
  window.selectedDonationAmountValue = parseInt(amount, 10);
  window.selectedDonationPackageName = DONATION_PACKAGES[amount] || "Dukungan Gerakan Pemuda";
};

window.handleCustomDonationInput = function(el) {
  document.querySelectorAll(".donation-pill").forEach(p => p.classList.remove("active"));
  const val = parseInt(el.value, 10);
  if (!isNaN(val) && val > 0) {
    window.selectedDonationAmountValue = val;
    window.selectedDonationPackageName = "Dukungan Khusus Gerakan ARUTALA";
  } else {
    window.selectedDonationAmountValue = 10000;
    window.selectedDonationPackageName = "1 Paket Modul Belajar";
  }
};

window.toggleAnonymousDonor = function(el) {
  const nameInput = document.getElementById("donor-name-input");
  if (!nameInput) return;
  if (el.checked) {
    nameInput.dataset.prevName = nameInput.value;
    nameInput.value = "Hamba Allah (Anonim)";
    nameInput.readOnly = true;
  } else {
    nameInput.value = nameInput.dataset.prevName || "";
    nameInput.readOnly = false;
  }
};

window.handleDonationSubmit = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const nameInput = document.getElementById("donor-name-input");
  const isAnon = document.getElementById("donor-anonymous-checkbox")?.checked;
  const donorName = (isAnon ? "Hamba Allah" : (nameInput ? nameInput.value.trim() : "Donatur Dermawan")) || "Hamba Allah";
  const messageInput = document.getElementById("donor-message-input");
  const donorMessage = messageInput ? messageInput.value.trim() : "";

  window.currentDonationData = {
    name: donorName,
    amount: window.selectedDonationAmountValue,
    package: window.selectedDonationPackageName,
    message: donorMessage,
    isAnonymous: !!isAnon
  };

  const amountDisplay = document.getElementById("donasi-modal-amount-display");
  const packageDisplay = document.getElementById("donasi-modal-package-display");
  if (amountDisplay) {
    amountDisplay.textContent = "Rp " + window.selectedDonationAmountValue.toLocaleString("id-ID");
  }
  if (packageDisplay) {
    packageDisplay.textContent = window.selectedDonationPackageName;
  }

  openModalById("modal-donasi-payment");
};

window.closeDonationPaymentModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  closeModalById("modal-donasi-payment");
};

window.copyAccountNumber = function(text, btn) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.textContent;
      btn.textContent = "Tersalin!";
      setTimeout(() => {
        btn.textContent = orig;
      }, 2000);
      if (typeof showToast === "function") {
        showToast("Nomor rekening berhasil disalin!", "success");
      }
    }).catch(() => {
      prompt("Salin nomor rekening:", text);
    });
  } else {
    prompt("Salin nomor rekening:", text);
  }
};

window.confirmDonationCompleted = async function() {
  const data = window.currentDonationData || {
    name: "Donatur ARUTALA",
    amount: 25000,
    package: "1 Sesi Konseling Sebaya",
    message: "Semoga barokah dan bermanfaat untuk pemuda.",
    isAnonymous: false
  };

  let newDonation = null;

  // 1. Simpan ke Supabase Cloud Database
  if (window.ArutalaDB && typeof window.ArutalaDB.insertDonation === "function") {
    try {
      newDonation = await window.ArutalaDB.insertDonation({
        donor_name: data.name,
        amount: data.amount,
        package_name: data.package,
        message: data.message,
        is_anonymous: data.isAnonymous
      });
      console.log("Donasi berhasil disimpan ke Supabase Cloud.");
    } catch (err) {
      console.warn("Gagal simpan donasi ke Supabase, fallback lokal:", err);
    }
  }

  if (!newDonation) {
    newDonation = {
      id: "don-" + Date.now(),
      donorName: data.name,
      amount: data.amount,
      targetPackage: data.package,
      message: data.message || "Bismillah, mendukung ruang aman pemuda.",
      time: "Baru saja",
      isAnonymous: data.isAnonymous
    };
  }

  if (window.ARUTALA_DATA && Array.isArray(window.ARUTALA_DATA.donations)) {
    window.ARUTALA_DATA.donations.unshift(newDonation);
  }
  if (typeof window.renderDonorsFeedGlobal === "function") {
    window.renderDonorsFeedGlobal();
  }

  // Update target progress bar
  const totalAmountEl = document.getElementById("donation-current-amount");
  const progressBarEl = document.getElementById("donation-progress-bar");
  const progressPercentEl = document.getElementById("donation-progress-percent");

  if (totalAmountEl && progressBarEl && progressPercentEl) {
    let cur = window._currentDonationTotal || 18750000;
    cur += data.amount;
    window._currentDonationTotal = cur;
    const target = 25000000;
    const pct = Math.min(100, Math.round((cur / target) * 100));

    totalAmountEl.textContent = "Rp " + cur.toLocaleString("id-ID");
    progressBarEl.style.width = pct + "%";
    progressPercentEl.textContent = pct + "% Terkumpul";
  }

  closeModalById("modal-donasi-payment");

  // Reset form
  const form = document.getElementById("donation-form");
  if (form) form.reset();
  document.querySelectorAll(".donation-pill").forEach((p, idx) => {
    if (idx === 0) p.classList.add("active");
    else p.classList.remove("active");
  });
  window.selectedDonationAmountValue = 10000;
  window.selectedDonationPackageName = "1 Paket Modul Belajar";

  if (typeof showToast === "function") {
    showToast(`Alhamdulillah! Terima kasih kak ${data.name}, donasimu sebesar Rp ${data.amount.toLocaleString("id-ID")} telah tercatat permanen di cloud.`, "success");
  }
};

window.heroSlideStep = function(step) {
  if (typeof window._internalHeroStep === "function") {
    window._internalHeroStep(step);
  }
};

window.heroPrevSlide = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (e && e.stopPropagation) e.stopPropagation();
  window.heroSlideStep(-1);
};

window.heroNextSlide = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (e && e.stopPropagation) e.stopPropagation();
  window.heroSlideStep(1);
};

window.filterArticles = function(cat, btnEl) {
  document.querySelectorAll("#article-filter-pills .filter-btn").forEach(b => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
  if (window.AppState) {
    window.AppState.currentCategory = cat;
  }
  if (typeof window.renderArticlesGlobal === "function") {
    window.renderArticlesGlobal();
  }
};

window.scrollToSection = function(sectionId, e) {
  if (e && e.preventDefault) e.preventDefault();
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
    document.querySelectorAll(".bottom-dock-item").forEach(item => {
      if (item.dataset.target === sectionId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================================
  // 0. FIXED THEME SETUP (Permanent Gen-U & Malala Story Style)
  // ==========================================================================
  document.body.setAttribute("data-theme", "genu");

  // ==========================================================================
  // HERO STAGE SLIDER CAROUSEL (Sesuai Referensi Gambar)
  // ==========================================================================
  const heroSlides = [
    {
      eyebrow: "LOKAKARYA ARUTALA INDONESIA",
      title: "ARUTALA Batch 1",
      desc: "Bandung, Indonesia — ARUTALA merupakan inisiatif kolaboratif pengembangan kapasitas pemuda yang inklusif dari UIN Sunan Gunung Djati Bandung, berbasis nilai keagamaan yang moderat, keadilan gender, dan pendampingan tutor sebaya.",
      btnText: "Selengkapnya",
      btnLink: "#pustaka-modul"
    },
    {
      eyebrow: "KOMUNITAS & PENDAMPINGAN SEBAYA",
      title: "Lingkaran Sebaya (ARUTALA Circle)",
      desc: "Membangun ruang aman dan dialog setara bagi mahasiswa untuk mendobrak stereotip gender, memupuk relasi sehat, dan melatih fasilitator muda berdaya.",
      btnText: "Gabung Circle Sebaya",
      btnLink: "#registrasi-circle"
    },
    {
      eyebrow: "GERAKAN SOSIAL KEPEMUDAAN",
      title: "Aksi Nyata Pemuda Inklusif",
      desc: "Melahirkan transformasi sosial nyata dari kampus ke masyarakat pedesaan berbasis prinsip kearifan lokal Silih Asah, Silih Asih, dan Silih Asuh.",
      btnText: "Lihat ARUTALA Action",
      btnLink: "#aksi-sosial"
    }
  ];

  let currentSlideIndex = 0;
  const slideBgs = document.querySelectorAll(".hero-bg-slide");
  const heroTitleEl = document.getElementById("hero-title-text");
  const heroDescEl = document.getElementById("hero-desc-text");
  const heroBtnEl = document.getElementById("hero-btn-selengkapnya");
  const heroEyebrowEl = document.querySelector(".hero-top-eyebrow");
  const btnPrevSlide = document.getElementById("hero-arrow-prev");
  const btnNextSlide = document.getElementById("hero-arrow-next");

  if (slideBgs && slideBgs.length > 0 && heroTitleEl) {
    function showSlide(index) {
      if (index < 0) index = heroSlides.length - 1;
      if (index >= heroSlides.length) index = 0;
      currentSlideIndex = index;

      slideBgs.forEach((bg, i) => {
        if (i === currentSlideIndex) {
          bg.classList.add("active");
        } else {
          bg.classList.remove("active");
        }
      });

      const data = heroSlides[currentSlideIndex];
      if (heroTitleEl) heroTitleEl.textContent = data.title;
      if (heroDescEl) heroDescEl.textContent = data.desc;
      if (heroEyebrowEl) heroEyebrowEl.textContent = data.eyebrow;
      if (heroBtnEl) {
        heroBtnEl.textContent = data.btnText;
        heroBtnEl.setAttribute("href", data.btnLink);
      }
    }

    window._internalHeroStep = function(step) {
      showSlide(currentSlideIndex + step);
    };

    if (btnPrevSlide) {
      btnPrevSlide.addEventListener("click", (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        showSlide(currentSlideIndex - 1);
      });
    }
    if (btnNextSlide) {
      btnNextSlide.addEventListener("click", (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        showSlide(currentSlideIndex + 1);
      });
    }

    // Auto slide every 7 seconds
    setInterval(() => {
      showSlide(currentSlideIndex + 1);
    }, 7000);
  } else {
    window._internalHeroStep = function() {};
  }

  window.heroPrevSlide = function(e) { if (e && e.preventDefault) e.preventDefault(); };
  window.heroNextSlide = function(e) { if (e && e.preventDefault) e.preventDefault(); };

  // Nav Search & USS Header Quick Search
  const navGlobalSearch = document.getElementById("nav-global-search");
  const btnNavSearch = document.getElementById("btn-nav-search");
  const ussTopSearchInput = document.getElementById("uss-top-search-input");
  const btnUssSearchToggle = document.getElementById("btn-uss-search-toggle");
  const btnUssSearchClose = document.getElementById("btn-uss-search-close");
  const btnUssMenuToggle = document.getElementById("btn-uss-menu-toggle");
  const btnUssDrawerClose = document.getElementById("btn-uss-drawer-close");
  const ussDrawerOverlay = document.getElementById("uss-drawer-overlay");
  const dropdownArtikelWrapper = document.getElementById("dropdown-artikel-wrapper");
  const btnNavDropdownArtikel = document.getElementById("btn-nav-dropdown-artikel");

  function triggerGlobalSearch(query) {
    const q = (typeof query === "string" ? query : (ussTopSearchInput ? ussTopSearchInput.value : "")).trim();
    if (AppState) {
      AppState.searchQuery = q;
    }
    const articleSearchInput = document.getElementById("article-search-input");
    if (articleSearchInput) articleSearchInput.value = q;
    if (typeof renderArticles === "function") renderArticles();
    const articlesSection = document.getElementById("artikel-opini");
    if (articlesSection) {
      articlesSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Hamburger drawer listeners
  if (btnUssMenuToggle) {
    btnUssMenuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      window.openUssDrawer(e);
    });
  }
  if (btnUssDrawerClose) {
    btnUssDrawerClose.addEventListener("click", window.closeUssDrawer);
  }
  if (ussDrawerOverlay) {
    ussDrawerOverlay.addEventListener("click", window.closeUssDrawer);
  }

  // Search icon & input listeners
  if (btnUssSearchToggle) {
    btnUssSearchToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      window.toggleUssSearch();
    });
  }
  if (btnUssSearchClose) {
    btnUssSearchClose.addEventListener("click", () => window.toggleUssSearch(false));
  }
  if (ussTopSearchInput) {
    ussTopSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        triggerGlobalSearch(ussTopSearchInput.value);
      }
    });
    ussTopSearchInput.addEventListener("input", () => {
      if (AppState) {
        AppState.searchQuery = ussTopSearchInput.value.trim();
        if (typeof renderArticles === "function") renderArticles();
      }
    });
  }

  // Dropdown artikel toggle for touch / click
  if (btnNavDropdownArtikel && dropdownArtikelWrapper) {
    btnNavDropdownArtikel.addEventListener("click", (e) => {
      // Jika yang diklik adalah ikon panah kecil dropdown, toggle menu dropdown di HP
      if (e.target.closest(".dropdown-arrow-icon")) {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = dropdownArtikelWrapper.classList.toggle("active");
        btnNavDropdownArtikel.setAttribute("aria-expanded", isOpen ? "true" : "false");
        return;
      }
      // Jika teks ARTIKEL & JURNAL diklik, langsung pindah halaman ke artikel.html
      window.location.href = "artikel.html";
    });

    document.addEventListener("click", (e) => {
      if (!dropdownArtikelWrapper.contains(e.target)) {
        dropdownArtikelWrapper.classList.remove("active");
        btnNavDropdownArtikel.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (navGlobalSearch) {
    navGlobalSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") triggerGlobalSearch(navGlobalSearch.value);
    });
  }
  if (btnNavSearch) {
    btnNavSearch.addEventListener("click", () => {
      if (navGlobalSearch) triggerGlobalSearch(navGlobalSearch.value);
    });
  }

  const customVidsInitial = JSON.parse(localStorage.getItem("arutala_custom_videos") || "[]");
  const baseVidsInitial = (typeof ARUTALA_DATA !== "undefined" && Array.isArray(ARUTALA_DATA.videos)) ? ARUTALA_DATA.videos : [];
  const mergedVidsInitial = [
    ...customVidsInitial,
    ...baseVidsInitial.filter(bv => !customVidsInitial.some(cv => cv.youtubeId === bv.youtubeId || cv.id === bv.id))
  ];

  // State Manager
  const AppState = {
    articles: [...ARUTALA_DATA.articles],
    videos: mergedVidsInitial,
    modules: [...ARUTALA_DATA.modules],
    qaList: [...ARUTALA_DATA.qaList],
    actions: [...ARUTALA_DATA.actions],
    currentCategory: "all",
    searchQuery: "",
    activeModuleId: 1,
    selectedQuizOption: null,
    completedModules: JSON.parse(localStorage.getItem("arutala_completed_modules") || "[]")
  };
  window.AppState = AppState;

  // ==========================================================================
  // 1. TOAST NOTIFICATION UTILITY
  // ==========================================================================
  function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ==========================================================================
  // 2. ARTIKEL & OPINI (LITERASI UGC)
  // ==========================================================================
  const articlesContainer = document.getElementById("articles-container");
  const filterPills = document.querySelectorAll("#article-filter-pills .filter-btn");
  const searchInput = document.getElementById("article-search-input");

  function getCategoryColor(category) {
    switch (category) {
      case "bersuara": return "#FF64C5"; // Pink ARUTALA
      case "pandai": return "#66BB6A";   // Green ARUTALA
      case "cerdas": return "#89BBEE";   // Sky Blue ARUTALA
      case "berdaya": return "#2F4F87";  // Navy Blue ARUTALA
      default: return "#2F4F87";
    }
  }

  function getCategoryLabelClean(category) {
    switch ((category || "").toLowerCase()) {
      case "pandai":
      case "moderasi": return "MODERASI BERAGAMA";
      case "bersuara":
      case "kesetaraan": return "KESETARAAN";
      case "cerdas":
      case "budaya": return "BUDAYA";
      case "berdaya":
      case "sosial": return "SOSIAL MASYARAKAT";
      default: return (category || "MODERASI BERAGAMA").toUpperCase();
    }
  }

  function renderArticles() {
    if (!articlesContainer) return;
    articlesContainer.innerHTML = "";
    
    const filtered = AppState.articles.filter(art => {
      const matchCat = AppState.currentCategory === "all" || art.category === AppState.currentCategory;
      const matchSearch = art.title.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
                          art.author.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
                          art.summary.toLowerCase().includes(AppState.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      articlesContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #64748B;">
          <div style="font-size: 1.1rem; font-weight: 700; color: #0F172A; margin-bottom: 8px;">Tidak ada artikel yang cocok</div>
          <p style="font-size: 0.9rem;">Coba sesuaikan kata kunci pencarian atau pilih kategori lain.</p>
        </div>
      `;
      return;
    }

    const featured = filtered[0];
    const rest = filtered.slice(1);

    // 1. Featured Article (2 Kolom: Kiri foto besar, Kanan kategori, judul besar, ringkasan, nama penulis)
    const featuredHtml = `
      <a href="artikel.html?id=${encodeURIComponent(featured.id)}" class="uss-featured-card reveal" style="display: grid; text-decoration: none; color: inherit; cursor: pointer;">
        <div class="featured-media-col">
          <div class="featured-img-wrap">
            <img src="${featured.coverImage || 'img/harmoni_pemuda_aljabbar.png'}" 
                 alt="${featured.title}" class="featured-cover-img" loading="eager">
          </div>
        </div>
        <div class="featured-content-col">
          <div class="clean-cat-label" style="color: ${getCategoryColor(featured.category)};">
            ${getCategoryLabelClean(featured.category)}
          </div>
          <h3 class="featured-headline">${featured.title}</h3>
          <p class="featured-summary">${featured.summary}</p>
          <div class="featured-meta-row">
            <span class="meta-author-name">${featured.author}</span>
            <span class="meta-sep" style="opacity: 0.35; margin: 0 4px;">/</span>
            <span class="meta-author-role">${featured.authorRole || 'Kontributor Pemuda'}</span>
            <span class="meta-sep" style="opacity: 0.35; margin: 0 4px;">/</span>
            <span class="meta-date">${featured.date || 'Oktober 2026'}</span>
          </div>
          <div class="featured-action-link">
            <span>Baca Poin-Poin Pokok</span>
            <span class="arrow">&rarr;</span>
          </div>
        </div>
      </a>
    `;

    // 2. Clean 3-Column Grid di bawahnya (tanpa border, menyatu dengan background putih)
    let gridHtml = "";
    if (rest.length > 0) {
      gridHtml = `
        <div class="uss-clean-grid">
          ${rest.map(art => `
            <a href="artikel.html?id=${encodeURIComponent(art.id)}" class="uss-clean-card cat-${art.category} reveal" data-category="${art.category}" style="display: block; text-decoration: none; color: inherit; cursor: pointer; border-top: 3px solid ${getCategoryColor(art.category)} !important;">
              <div class="clean-card-media">
                <img src="${art.coverImage || 'img/pelatihan_fasilitator_auditorium.jpg'}" 
                     alt="${art.title}" class="clean-card-img" loading="lazy">
              </div>
              <div class="clean-card-body">
                <div class="clean-cat-label" style="color: ${getCategoryColor(art.category)};">
                  ${getCategoryLabelClean(art.category)}
                </div>
                <h4 class="clean-card-title">${art.title}</h4>
                <p class="clean-card-summary">${art.summary}</p>
                <div class="clean-card-meta">
                  <span class="author-name">${art.author}</span>
                  <span class="meta-sep" style="opacity: 0.35; margin: 0 4px;">/</span>
                  <span class="date">${art.date || 'Oktober 2026'}</span>
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      `;
    }

    articlesContainer.innerHTML = featuredHtml + gridHtml;
    if (typeof initScrollReveal === "function") {
      initScrollReveal();
    }
  }
  window.renderArticlesGlobal = renderArticles;

  // Immediate initial render for articles
  try {
    renderArticles();
  } catch (err) {
    console.warn("Initial renderArticles notice:", err);
  }

  function getCategoryBadgeClass(category) {
    switch (category) {
      case "pandai": return "badge-green";
      case "cerdas": return "badge-blue";
      case "bersuara": return "badge-coral";
      case "berdaya": return "badge-gold";
      default: return "badge-blue";
    }
  }

  // Filter Buttons Event & Global API
  window.filterArticles = function(category, btnElement) {
    AppState.currentCategory = category || "all";
    
    // Update active class in section filter pills
    const pills = document.querySelectorAll("#article-filter-pills .uss-filter-pill, #article-filter-pills .filter-btn");
    pills.forEach(p => p.classList.remove("active"));
    if (btnElement) {
      btnElement.classList.add("active");
    } else {
      pills.forEach(p => {
        if (p.getAttribute("data-category") === category) p.classList.add("active");
      });
    }

    // Also update sub-header bar links
    const subbarLinks = document.querySelectorAll(".subbar-filter-link");
    subbarLinks.forEach(link => {
      if (link.getAttribute("data-category") === category) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    renderArticles();
  };

  window.filterArticlesAndScroll = function(category, event) {
    if (event && event.preventDefault) event.preventDefault();
    const targetUrl = 'artikel.html' + (category && category !== 'all' ? '?category=' + encodeURIComponent(category) : '');
    window.location.href = targetUrl;
  };

  const articleFilterButtons = document.querySelectorAll("#article-filter-pills button");
  articleFilterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category || "all";
      window.filterArticles(cat, btn);
    });
  });

  // Search Input Event
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value.trim();
      renderArticles();
    });
  }

  // Modal Article Reader
  const modalReader = document.getElementById("modal-article-reader");
  const btnCloseReader = document.getElementById("btn-close-article-modal");

  function openArticleReader(art) {
    if (typeof window.openArticleReaderModal === "function") {
      window.openArticleReaderModal(art);
    }
  }

  if (btnCloseReader && modalReader) {
    btnCloseReader.addEventListener("click", () => {
      modalReader.classList.remove("active");
      document.body.classList.remove("has-active-modal");
    });
  }
  if (modalReader) {
    modalReader.addEventListener("click", (e) => {
      if (e.target === modalReader) {
        modalReader.classList.remove("active");
        document.body.classList.remove("has-active-modal");
      }
    });
  }


  // Modal Submit Article ("Kirim Tulisan")
  const modalSubmitArticle = document.getElementById("modal-submit-article");
  const btnOpenSubmitArticle = document.getElementById("btn-open-submit-article");
  const btnCloseSubmitArticle = document.getElementById("btn-close-submit-article");
  const formSubmitArticle = document.getElementById("form-submit-article");
  const coverDropzone = document.getElementById("cover-dropzone");
  const coverFileInput = document.getElementById("article-cover-file");
  const coverPreview = document.getElementById("article-cover-preview");
  const coverPrompt = document.getElementById("cover-upload-prompt");
  const docFileInput = document.getElementById("article-doc-file");
  const docAttachedInfo = document.getElementById("doc-attached-info");
  const docFileName = document.getElementById("doc-file-name");

  let uploadedCoverUrl = "";

  if (coverDropzone && coverFileInput) {
    coverDropzone.addEventListener("click", (e) => {
      if (e.target !== coverFileInput) {
        coverFileInput.click();
      }
    });
    coverFileInput.addEventListener("click", (e) => e.stopPropagation());
    coverFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          uploadedCoverUrl = loadEvt.target.result;
          if (coverPreview) {
            coverPreview.src = uploadedCoverUrl;
            coverPreview.style.display = "block";
          }
          if (coverPrompt) {
            coverPrompt.style.display = "none";
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (docFileInput) {
    docFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file && docAttachedInfo && docFileName) {
        docFileName.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB) / File Terlampir`;
        docAttachedInfo.style.display = "inline-flex";

        const contentInput = document.getElementById("article-content-input");
        if (contentInput && !contentInput.value.trim()) {
          contentInput.value = `[Naskah Lengkap Terlampir dalam Berkas Dokumen: ${file.name}]\n\nGagasan ini diajukan untuk memperkuat literasi pemuda mengenai kesetaraan, moderasi nilai, dan ruang aman bersama di lingkungan kampus dan masyarakat.`;
        }
      }
    });
  }

  if (btnOpenSubmitArticle && modalSubmitArticle) {
    btnOpenSubmitArticle.addEventListener("click", (e) => {
      window.openSubmitArticleModal(e);
    });
  }
  if (btnCloseSubmitArticle && modalSubmitArticle) {
    btnCloseSubmitArticle.addEventListener("click", (e) => {
      window.closeSubmitArticleModal(e);
    });
  }
  if (modalSubmitArticle) {
    modalSubmitArticle.addEventListener("click", (e) => {
      if (e.target === modalSubmitArticle) {
        window.closeSubmitArticleModal(e);
      }
    });
  }

  if (formSubmitArticle) {
    formSubmitArticle.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("article-title-input")?.value || "Opini Pemuda";
      const cat = document.getElementById("article-category-input")?.value || "pandai";
      const author = document.getElementById("article-author-input")?.value || "Kontributor Pemuda";
      const institution = document.getElementById("article-institution-input")?.value || "";
      const content = document.getElementById("article-content-input")?.value || "";

      const submitBtn = formSubmitArticle.querySelector('button[type="submit"]');
      const origBtnHtml = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Mengunggah Naskah ke Cloud...";
      }

      // Brand Category Label & Accent Color
      let catLabel = "MODERASI BERAGAMA";
      let accentColor = "#66BB6A";
      let fallbackImage = "img/harmoni_pemuda_aljabbar.png";

      if (cat === "pandai") {
        catLabel = "MODERASI BERAGAMA";
        accentColor = "#66BB6A";
        fallbackImage = "img/harmoni_pemuda_aljabbar.png";
      } else if (cat === "cerdas") {
        catLabel = "BUDAYA";
        accentColor = "#89BBEE";
        fallbackImage = "img/seminar_cakrawala_muda.png";
      } else if (cat === "bersuara") {
        catLabel = "KESETARAAN";
        accentColor = "#FF64C5";
        fallbackImage = "img/pelatihan_fasilitator_auditorium.jpg";
      } else if (cat === "berdaya") {
        catLabel = "SOSIAL MASYARAKAT";
        accentColor = "#2F4F87";
        fallbackImage = "img/circle_mentoring_sebaya.jpg";
      }

      // 1. Upload Cover Image ke Supabase Storage Bucket 'arutala-media'
      let cloudCoverUrl = "";
      const coverFile = coverFileInput && coverFileInput.files ? coverFileInput.files[0] : null;
      if (coverFile && window.ArutalaDB && typeof window.ArutalaDB.uploadMediaFile === "function") {
        try {
          cloudCoverUrl = await window.ArutalaDB.uploadMediaFile(coverFile, "articles/covers");
        } catch (uploadErr) {
          console.warn("Cover upload warning, fallback to local preview:", uploadErr);
        }
      }
      const finalCover = cloudCoverUrl || uploadedCoverUrl || fallbackImage;

      // 2. Upload Naskah Dokumen ke Supabase Storage Bucket 'arutala-media'
      let cloudDocUrl = null;
      const docFile = docFileInput && docFileInput.files ? docFileInput.files[0] : null;
      if (docFile && window.ArutalaDB && typeof window.ArutalaDB.uploadMediaFile === "function") {
        try {
          cloudDocUrl = await window.ArutalaDB.uploadMediaFile(docFile, "articles/docs");
        } catch (uploadDocErr) {
          console.warn("Document upload warning:", uploadDocErr);
        }
      }

      // 3. Simpan Data Artikel ke Tabel Supabase 'articles'
      const articlePayload = {
        title: title,
        category: cat,
        author: author,
        role: institution || "Kontributor Pemuda",
        date: window.formatDisplayDate ? window.formatDisplayDate(new Date()) : "Baru saja",
        read_time: "4 menit baca",
        image: finalCover,
        doc_url: cloudDocUrl,
        quote: null,
        summary: content.length > 140 ? content.substring(0, 140) + "..." : content,
        content: `<p>${content.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>`
      };

      let newArt = null;
      if (window.ArutalaDB && typeof window.ArutalaDB.insertArticle === "function") {
        try {
          newArt = await window.ArutalaDB.insertArticle(articlePayload);
          console.log("Artikel berhasil tersimpan di Supabase Cloud Database:", newArt);
        } catch (insertErr) {
          console.warn("Gagal simpan artikel ke Supabase, fallback lokal:", insertErr);
        }
      }

      if (!newArt) {
        newArt = {
          id: "art-user-" + Date.now(),
          title: title,
          category: cat,
          categoryLabel: catLabel,
          accentColor: accentColor,
          coverImage: finalCover,
          docUrl: cloudDocUrl,
          author: author,
          authorRole: institution || "Kontributor Pemuda",
          date: "Baru saja",
          readTime: "4 menit baca",
          summary: articlePayload.summary,
          content: articlePayload.content,
          tags: [catLabel.split(" ")[0], "Kontributor", "Opini Pemuda"]
        };
      }

      AppState.articles.unshift(newArt);
      if (window.ARUTALA_DATA && Array.isArray(window.ARUTALA_DATA.articles)) {
        window.ARUTALA_DATA.articles.unshift(newArt);
      }

      renderArticles();
      formSubmitArticle.reset();
      uploadedCoverUrl = "";
      if (coverPreview) {
        coverPreview.src = "";
        coverPreview.style.display = "none";
      }
      if (coverPrompt) {
        coverPrompt.style.display = "flex";
      }
      if (docAttachedInfo) {
        docAttachedInfo.style.display = "none";
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
      window.closeSubmitArticleModal();
      showToast("Naskah dan foto berhasil dikirim dan tersimpan di database cloud!", "success");

      const articlesSection = document.getElementById("artikel-opini");
      if (articlesSection) {
        articlesSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // ==========================================================================
  // 3. RUANG VIDEO EDUKASI (Inspirasi VIRAL Pancawala)
  // ==========================================================================
  const videosContainer = document.getElementById("videos-container");
  const modalVideo = document.getElementById("modal-video-player");
  const btnCloseVideo = document.getElementById("btn-close-video-modal");
  const modalVideoIframe = document.getElementById("modal-video-iframe");
  const modalVideoTitle = document.getElementById("modal-video-title");
  const modalVideoDesc = document.getElementById("modal-video-desc");

  async function renderVideos() {
    if (!videosContainer) return;

    let allVideos = [];
    if (window.ArutalaDB && typeof window.ArutalaDB.fetchNuansaVideos === "function") {
      try {
        allVideos = await window.ArutalaDB.fetchNuansaVideos();
      } catch (e) {}
    }

    if (!allVideos || allVideos.length === 0) {
      const customVideos = JSON.parse(localStorage.getItem("arutala_custom_videos") || "[]");
      let deletedIds = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem("arutala_deleted_videos") || "[]");
      } catch (e) {
        deletedIds = [];
      }
      const currentVideos = AppState.videos || (window.ARUTALA_DATA && window.ARUTALA_DATA.videos) || [];

      allVideos = [
        ...customVideos,
        ...currentVideos.filter(cv => !customVideos.some(uv => uv.youtubeId === cv.youtubeId || uv.id === cv.id))
      ].filter(v => !deletedIds.includes(String(v.id)) && v.youtubeId !== "dQw4w9WgXcQ");
    }

    videosContainer.innerHTML = "";
    allVideos.forEach(vid => {
      const card = document.createElement("div");
      card.className = "video-card reveal";
      card.innerHTML = `
        <div class="video-thumbnail-wrap">
          <img src="${vid.thumbnail}" alt="${vid.title}" loading="lazy">
          <div class="play-overlay">▶</div>
          <span class="video-duration">${vid.duration || 'Video Edukasi'}</span>
        </div>
        <div class="video-info">
          <span class="badge badge-teal" style="font-size: 0.72rem; margin-bottom: 8px;">${vid.category}</span>
          <h3>${vid.title}</h3>
          <small style="color: var(--text-muted); display: block; margin-bottom: 6px;">Oleh: ${vid.channel}</small>
          <div class="video-takeaway">
            <strong>Poin Pembelajaran:</strong> ${vid.takeaways}
          </div>
        </div>
      `;

      const thumb = card.querySelector(".video-thumbnail-wrap");
      if (thumb) {
        thumb.addEventListener("click", () => {
          if (modalVideoTitle) modalVideoTitle.textContent = vid.title;
          if (modalVideoDesc) modalVideoDesc.textContent = vid.takeaways;
          if (modalVideoIframe) modalVideoIframe.src = vid.videoUrl;
          if (modalVideo) {
            modalVideo.classList.add("active");
            document.body.classList.add("has-active-modal");
          }
        });
      }

      videosContainer.appendChild(card);
    });

    if (typeof initScrollReveal === "function") {
      initScrollReveal();
    }
    if (typeof initAutoScrollVideoCarousel === "function") {
      initAutoScrollVideoCarousel();
    }
  }

  // Immediate initial render for videos
  try {
    renderVideos();
  } catch (err) {
    console.warn("Initial renderVideos notice:", err);
  }

  if (btnCloseVideo && modalVideo) {
    btnCloseVideo.addEventListener("click", () => {
      modalVideo.classList.remove("active");
      document.body.classList.remove("has-active-modal");
      if (modalVideoIframe) modalVideoIframe.src = "";
    });
  }
  if (modalVideo) {
    modalVideo.addEventListener("click", (e) => {
      if (e.target === modalVideo) {
        modalVideo.classList.remove("active");
        document.body.classList.remove("has-active-modal");
        if (modalVideoIframe) modalVideoIframe.src = "";
      }
    });
  }

  // ==========================================================================
  // 4. LMS: 7 MODUL PEMBELAJARAN ARUTALA
  // ==========================================================================
  const modulesNavList = document.getElementById("modules-nav-list");
  const moduleProgressStat = document.getElementById("module-progress-stat");
  const moduleHeaderContent = document.getElementById("module-header-content");
  const moduleBodyContent = document.getElementById("module-body-content");
  const quizQuestionText = document.getElementById("quiz-question-text");
  const quizOptionsContainer = document.getElementById("quiz-options-container");
  const quizFeedbackBox = document.getElementById("quiz-feedback-box");
  const btnSubmitQuiz = document.getElementById("btn-submit-quiz");
  const btnNextModule = document.getElementById("btn-next-module");

  function updateModuleProgress() {
    if (!moduleProgressStat) return;
    const total = AppState.modules.length;
    const completed = AppState.completedModules.length;
    moduleProgressStat.textContent = `${completed} dari ${total} modul diselesaikan (${Math.round((completed/total)*100)}%)`;
  }

  function renderModulesNav() {
    if (!modulesNavList) return;
    // Preserve header
    const header = modulesNavList.querySelector(".module-nav-header");
    modulesNavList.innerHTML = "";
    if (header) modulesNavList.appendChild(header);

    AppState.modules.forEach(mod => {
      const isCompleted = AppState.completedModules.includes(mod.id);
      const isActive = mod.id === AppState.activeModuleId;

      const item = document.createElement("button");
      item.className = `module-nav-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`;
      item.innerHTML = `
        <div class="mod-num">${isCompleted ? "&#10003;" : mod.id}</div>
        <div class="mod-title-text">${mod.title}</div>
      `;

      item.addEventListener("click", () => {
        AppState.activeModuleId = mod.id;
        AppState.selectedQuizOption = null;
        renderModulesNav();
        renderActiveModule();
      });

      modulesNavList.appendChild(item);
    });

    updateModuleProgress();
  }

  function renderActiveModule() {
    if (!moduleHeaderContent || !moduleBodyContent) return;
    const mod = AppState.modules.find(m => m.id === AppState.activeModuleId) || AppState.modules[0];
    if (!mod) return;
    
    moduleHeaderContent.innerHTML = `
      <span class="module-code-badge">${mod.code} / ${mod.duration}</span>
      <h2>${mod.title}</h2>
      <div class="subtitle">${mod.subtitle}</div>
    `;

    moduleBodyContent.innerHTML = `
      <p style="font-weight: 600; color: var(--primary); margin-bottom: 16px;">
        Ringkasan Kompetensi: ${mod.summary}
      </p>
      ${mod.content}
    `;

    // Render Quiz
    if (quizQuestionText && quizOptionsContainer && quizFeedbackBox && btnNextModule) {
      quizQuestionText.textContent = mod.quiz.question;
      quizOptionsContainer.innerHTML = "";
      quizFeedbackBox.className = "quiz-feedback";
      quizFeedbackBox.style.display = "none";
      btnNextModule.style.display = "none";
      AppState.selectedQuizOption = null;

      mod.quiz.options.forEach((optText, index) => {
        const optDiv = document.createElement("div");
        optDiv.className = "quiz-option";
        optDiv.textContent = `${String.fromCharCode(65 + index)}. ${optText}`;

        optDiv.addEventListener("click", () => {
          quizOptionsContainer.querySelectorAll(".quiz-option").forEach(o => o.classList.remove("selected"));
          optDiv.classList.add("selected");
          AppState.selectedQuizOption = index;
        });

        quizOptionsContainer.appendChild(optDiv);
      });
    }
  }

  if (btnSubmitQuiz) {
    btnSubmitQuiz.addEventListener("click", () => {
      if (AppState.selectedQuizOption === null) {
        showToast("Silakan pilih salah satu opsi jawaban terlebih dahulu!", "error");
        return;
      }

      const mod = AppState.modules.find(m => m.id === AppState.activeModuleId);
      const options = quizOptionsContainer ? quizOptionsContainer.querySelectorAll(".quiz-option") : [];
      
      if (AppState.selectedQuizOption === mod.quiz.correctIndex) {
        // Benar
        if (options[AppState.selectedQuizOption]) {
          options[AppState.selectedQuizOption].classList.add("correct");
        }
        if (quizFeedbackBox) {
          quizFeedbackBox.className = "quiz-feedback success show";
          quizFeedbackBox.innerHTML = `
            <strong>Jawaban Tepat!</strong><br>
            ${mod.quiz.explanation}
          `;
        }

        if (!AppState.completedModules.includes(mod.id)) {
          AppState.completedModules.push(mod.id);
          localStorage.setItem("arutala_completed_modules", JSON.stringify(AppState.completedModules));
          if (typeof renderModulesNav === "function") renderModulesNav();
          showToast(`Selamat! Kamu telah menyelesaikan ${mod.code}: ${mod.title}`);
        }

        if (btnNextModule) {
          if (AppState.activeModuleId < AppState.modules.length) {
            btnNextModule.style.display = "inline-flex";
          } else {
            showToast("Luar biasa! Kamu telah menuntaskan seluruh 7 Modul Kapasitas Pemuda ARUTALA!", "success");
          }
        }
      } else {
        // Salah
        if (options[AppState.selectedQuizOption]) {
          options[AppState.selectedQuizOption].classList.add("wrong");
        }
        if (quizFeedbackBox) {
          quizFeedbackBox.className = "quiz-feedback error show";
          quizFeedbackBox.innerHTML = `
            <strong>Jawaban Belum Tepat</strong><br>
            Yuk coba telaah kembali narasi materi modul di atas, lalu pilih jawaban terbaik.
          `;
        }
      }
    });
  }

  if (btnNextModule) {
    btnNextModule.addEventListener("click", () => {
      if (AppState.activeModuleId < AppState.modules.length) {
        AppState.activeModuleId++;
        if (typeof renderModulesNav === "function") renderModulesNav();
        if (typeof renderActiveModule === "function") renderActiveModule();
        const pustakaEl = document.getElementById("pustaka-modul");
        if (pustakaEl) pustakaEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // ==========================================================================
  // ==========================================================================
  // 5. REGISTRASI ARUTALA CIRCLE (Formulir Terpadu Langsung di Halaman)
  // ==========================================================================
  const roleMenteeBtn = document.getElementById("role-mentee");
  const roleTutorBtn = document.getElementById("role-tutor");
  const regRoleInput = document.getElementById("reg-role-input");
  const menteeFields = document.getElementById("mentee-specific-fields");
  const tutorFields = document.getElementById("tutor-specific-fields");
  const circleRegForm = document.getElementById("circle-reg-form");
  const circleRegSuccess = document.getElementById("circle-reg-success");
  const btnResetRegForm = document.getElementById("btn-reset-reg-form");

  function setCircleRegistrationRole(role) {
    const regInterest = document.getElementById("reg-interest");
    const regExperience = document.getElementById("reg-experience");

    if (role === "tutor") {
      if (roleTutorBtn) roleTutorBtn.classList.add("active");
      if (roleMenteeBtn) roleMenteeBtn.classList.remove("active");
      if (regRoleInput) regRoleInput.value = "tutor";
      if (menteeFields) menteeFields.style.display = "none";
      if (tutorFields) tutorFields.style.display = "block";

      // Hilangkan atribut required dari elemen tersembunyi agar validasi HTML5 tidak memblokir submit!
      if (regInterest) {
        regInterest.required = false;
        regInterest.disabled = true;
      }
      if (regExperience) {
        regExperience.required = true;
        regExperience.disabled = false;
      }
    } else {
      if (roleMenteeBtn) roleMenteeBtn.classList.add("active");
      if (roleTutorBtn) roleTutorBtn.classList.remove("active");
      if (regRoleInput) regRoleInput.value = "mentee";
      if (menteeFields) menteeFields.style.display = "block";
      if (tutorFields) tutorFields.style.display = "none";

      if (regInterest) {
        regInterest.required = true;
        regInterest.disabled = false;
      }
      if (regExperience) {
        regExperience.required = false;
        regExperience.disabled = true;
      }
    }
  }

  // Event listener tombol tab peran langsung di formulir
  if (roleMenteeBtn) {
    roleMenteeBtn.addEventListener("click", () => setCircleRegistrationRole("mentee"));
  }
  if (roleTutorBtn) {
    roleTutorBtn.addEventListener("click", () => setCircleRegistrationRole("tutor"));
  }

  // Set default awal sebagai mentee
  setCircleRegistrationRole("mentee");

  // Tombol reset pendaftaran untuk mendaftar lagi
  if (btnResetRegForm) {
    btnResetRegForm.addEventListener("click", () => {
      if (circleRegForm) {
        circleRegForm.reset();
        circleRegForm.style.display = "block";
      }
      if (circleRegSuccess) {
        circleRegSuccess.style.display = "none";
      }
      setCircleRegistrationRole("mentee");
      const regSection = document.getElementById("registrasi-circle");
      if (regSection) regSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Handle Form Submit Langsung di Halaman
  if (circleRegForm) {
    circleRegForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const role = regRoleInput ? regRoleInput.value : "mentee";
      const nameInput = document.getElementById("reg-fullname");
      const instInput = document.getElementById("reg-institution");
      const name = nameInput ? nameInput.value.trim() : "Peserta";
      const institution = instInput ? instInput.value.trim() : "-";

      const circleId = "ARUTALA-CR-" + Math.floor(1000 + Math.random() * 9000);
      const roleText = role === "mentee" ? "Peserta Belajar (Mentee)" : "Tutor Sebaya / Konselor Pemuda";

      // Simpan di local storage
      const registrationRecord = {
        circleId,
        name,
        role: roleText,
        institution,
        registeredAt: new Date().toLocaleDateString("id-ID")
      };
      localStorage.setItem("arutala_user_circle", JSON.stringify(registrationRecord));

      // Isi data ke tampilan sukses langsung di halaman
      const regSuccessId = document.getElementById("reg-success-id");
      const regSuccessName = document.getElementById("reg-success-name");
      const regSuccessRole = document.getElementById("reg-success-role");
      const regSuccessInst = document.getElementById("reg-success-inst");

      if (regSuccessId) regSuccessId.textContent = circleId;
      if (regSuccessName) regSuccessName.textContent = name;
      if (regSuccessRole) {
        regSuccessRole.textContent = role === "mentee" ? "Peserta (Mentee)" : "Tutor Sebaya";
        regSuccessRole.className = role === "mentee" ? "badge badge-green" : "badge badge-coral";
      }
      if (regSuccessInst) regSuccessInst.textContent = institution;

      circleRegForm.style.display = "none";
      if (circleRegSuccess) {
        circleRegSuccess.style.display = "block";
      }

      showToast(`Registrasi Berhasil! Kamu tergabung dalam ${circleId} sebagai ${roleText}.`, "success");

      // Gulir halus ke kartu konfirmasi pendaftaran
      const regSection = document.getElementById("registrasi-circle");
      if (regSection) {
        regSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // ==========================================================================
  // 6. SHOWCASE & PENGAJUAN ARUTALA ACTION
  // ==========================================================================
  const actionsContainer = document.getElementById("actions-container");
  const modalSubmitAction = document.getElementById("modal-submit-action");
  const btnOpenSubmitAction = document.getElementById("btn-open-submit-action");
  const btnCloseSubmitAction = document.getElementById("btn-close-submit-action");
  const formSubmitAction = document.getElementById("form-submit-action");

  // Handle action photo file input
  const actionFileInput = document.getElementById("action-photo-file-input");
  let actionUploadedUrl = "";
  if (actionFileInput) {
    actionFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          actionUploadedUrl = loadEvt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  function renderActions() {
    if (!actionsContainer) return;
    actionsContainer.innerHTML = "";
    const list = (window.AppState && window.AppState.actions) || (window.ARUTALA_DATA && window.ARUTALA_DATA.actions) || [];

    list.forEach((act, idx) => {
      const isSpan2 = (idx === 0 || idx === 3 || idx === 5);
      const item = document.createElement("div");
      item.className = `bento-item ${isSpan2 ? 'bento-span-2' : ''}`;
      
      const submitterName = act.submitter || act.circleName || "Komunitas ARUTALA";
      const locationText = act.location || "Bandung, Jawa Barat";

      item.innerHTML = `
        <div class="bento-media">
          <img src="${act.image || 'img/pelatihan_fasilitator_auditorium.jpg'}" 
               alt="${act.title}" class="bento-img" loading="lazy">
          <span class="bento-badge">${act.badge || 'Dokumentasi Aksi'}</span>
        </div>

        <div class="bento-overlay">
          <div class="bento-overlay-body">
            <div class="bento-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${locationText}</span>
            </div>
            <h3 class="bento-title">${act.title}</h3>
            <p class="bento-description">${act.description || ''}</p>
            <div class="bento-credit">
              <span class="credit-label">Dokumentasi oleh</span>
              <strong class="credit-name">${submitterName}</strong>
            </div>
          </div>
        </div>
      `;

      actionsContainer.appendChild(item);
    });
  }
  window.renderActionsGlobal = renderActions;

  // Immediate initial render for actions
  try {
    renderActions();
  } catch (err) {
    console.warn("Initial renderActions notice:", err);
  }

  if (btnOpenSubmitAction) {
    btnOpenSubmitAction.addEventListener("click", (e) => {
      window.openSubmitActionModal(e);
    });
  }
  if (btnCloseSubmitAction) {
    btnCloseSubmitAction.addEventListener("click", (e) => {
      window.closeSubmitActionModal(e);
    });
  }
  if (modalSubmitAction) {
    modalSubmitAction.addEventListener("click", (e) => {
      if (e.target === modalSubmitAction) {
        window.closeSubmitActionModal(e);
      }
    });
  }

  if (formSubmitAction) {
    formSubmitAction.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("action-title-input")?.value || "Aksi Nyata Pemuda";
      const location = document.getElementById("action-location-input")?.value || "Bandung, Jawa Barat";
      const submitter = document.getElementById("action-circle-input")?.value || "Komunitas ARUTALA";
      const desc = document.getElementById("action-desc-input")?.value || "Dokumentasi kegiatan aksi nyata kepemudaan.";

      const submitBtn = formSubmitAction.querySelector('button[type="submit"]');
      const origBtnHtml = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Mengunggah Dokumentasi...";
      }

      // 1. Upload Foto Dokumentasi ke Supabase Storage Bucket 'arutala-media'
      let photoUrl = "";
      const actionFile = actionFileInput && actionFileInput.files ? actionFileInput.files[0] : null;
      if (actionFile && window.ArutalaDB && typeof window.ArutalaDB.uploadMediaFile === "function") {
        try {
          const uploadedUrl = await window.ArutalaDB.uploadMediaFile(actionFile, "actions");
          if (uploadedUrl) photoUrl = uploadedUrl;
        } catch (uploadErr) {
          console.warn("Gagal unggah foto aksi ke cloud storage:", uploadErr);
        }
      }

      if (!photoUrl) {
        photoUrl = actionUploadedUrl || document.getElementById("action-photo-url-input")?.value || "img/pelatihan_fasilitator_auditorium.jpg";
      }

      // 2. Simpan Data Aksi ke Supabase Tabel 'actions'
      const actionPayload = {
        title: title,
        location: location,
        circle_name: submitter,
        image: photoUrl,
        description: desc
      };

      let newAction = null;
      if (window.ArutalaDB && typeof window.ArutalaDB.insertAction === "function") {
        try {
          newAction = await window.ArutalaDB.insertAction(actionPayload);
          console.log("Dokumentasi Aksi tersimpan di Supabase Cloud Database:", newAction);
        } catch (insertErr) {
          console.warn("Gagal simpan aksi ke Supabase, fallback lokal:", insertErr);
        }
      }

      if (!newAction) {
        newAction = {
          id: "act-" + Date.now(),
          circleName: submitter,
          submitter: submitter,
          title: title,
          location: location,
          impact: "Dokumentasi kegiatan komunitas terverifikasi",
          badge: "Dokumentasi Komunitas",
          image: photoUrl,
          description: desc,
          date: "Baru saja",
          participants: "Pemuda Komunitas"
        };
      }

      if (window.AppState && Array.isArray(window.AppState.actions)) {
        window.AppState.actions.unshift(newAction);
      }
      if (window.ARUTALA_DATA && Array.isArray(window.ARUTALA_DATA.actions)) {
        window.ARUTALA_DATA.actions.unshift(newAction);
      }

      renderActions();
      formSubmitAction.reset();
      actionUploadedUrl = "";
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
      window.closeSubmitActionModal();
      if (typeof showToast === "function") {
        showToast("Dokumentasi kegiatan berhasil ditayangkan dan tersimpan permanen di cloud!", "success");
      }
    });
  }

  // ==========================================================================
  // 7. FORUM TANYA JAWAB (Q&A CORNER)
  // ==========================================================================
  const qaContainer = document.getElementById("qa-container");
  const modalAskQA = document.getElementById("modal-ask-qa");
  const btnOpenAskQA = document.getElementById("btn-open-ask-modal");
  const btnCloseAskQA = document.getElementById("btn-close-ask-qa");
  const formAskQA = document.getElementById("form-ask-qa");

  function renderQA() {
    if (!qaContainer) return;
    qaContainer.innerHTML = "";
    AppState.qaList.forEach(q => {
      const card = document.createElement("div");
      card.className = "qa-card";
      card.innerHTML = `
        <div class="qa-vote-col">
          <button class="vote-btn" title="Dukung pertanyaan ini">▲</button>
          <div class="vote-count">${q.upvotes}</div>
          <small style="font-size: 0.68rem; color: var(--text-muted);">Suara</small>
        </div>
        <div class="qa-main-col">
          <div class="qa-tags">
            ${q.tags.map(t => `<span class="qa-tag">#${t}</span>`).join("")}
            <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: auto;">${q.date} oleh <strong>${q.author}</strong></span>
          </div>
          <h3>${q.question}</h3>
          ${q.bestAnswer ? `
            <div class="qa-best-answer">
              <strong>Tanggapan Fasilitator Sebaya (${q.bestAnswer.author}):</strong>
              ${q.bestAnswer.content}
            </div>
          ` : `
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 8px; font-style: italic;">
              Menunggu tanggapan dari fasilitator sebaya...
            </div>
          `}
        </div>
      `;

      card.querySelector(".vote-btn").addEventListener("click", () => {
        q.upvotes++;
        card.querySelector(".vote-count").textContent = q.upvotes;
        if (window.ArutalaDB && typeof window.ArutalaDB.updateQAVote === "function" && typeof q.id === "number") {
          window.ArutalaDB.updateQAVote(q.id, q.upvotes);
        }
        showToast("Terima kasih atas dukunganmu pada pertanyaan ini!");
      });

      qaContainer.appendChild(card);
    });
  }

  if (btnOpenAskQA) {
    btnOpenAskQA.addEventListener("click", (e) => {
      window.openAskQAModal(e);
    });
  }
  if (btnCloseAskQA) {
    btnCloseAskQA.addEventListener("click", (e) => {
      window.closeAskQAModal(e);
    });
  }
  if (modalAskQA) {
    modalAskQA.addEventListener("click", (e) => {
      if (e.target === modalAskQA) {
        window.closeAskQAModal(e);
      }
    });
  }

  if (formAskQA) {
    formAskQA.addEventListener("submit", async (e) => {
    e.preventDefault();
    const author = document.getElementById("qa-author-input").value;
    const question = document.getElementById("qa-question-input").value;
    const tag = document.getElementById("qa-tag-input").value;

    const submitBtn = formAskQA.querySelector('button[type="submit"]');
    const origBtnHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Menayangkan...";
    }

    // Simpan ke Supabase Tabel 'qa_posts'
    let newQ = null;
    if (window.ArutalaDB && typeof window.ArutalaDB.insertQAPost === "function") {
      try {
        newQ = await window.ArutalaDB.insertQAPost({
          author: author,
          question: question,
          tag: tag,
          votes: 1
        });
        console.log("Pertanyaan Q&A tersimpan di Supabase Cloud Database:", newQ);
      } catch (err) {
        console.warn("Gagal simpan Q&A ke Supabase, fallback lokal:", err);
      }
    }

    if (!newQ) {
      newQ = {
        id: "qa-" + Date.now(),
        author: author,
        question: question,
        tags: [tag],
        answersCount: 0,
        upvotes: 1,
        date: "Baru saja",
        bestAnswer: null
      };
    }

    AppState.qaList.unshift(newQ);
    renderQA();
    formAskQA.reset();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnHtml;
    }
    if (modalAskQA) modalAskQA.classList.remove("active");
    showToast("Pertanyaanmu telah ditayangkan dan tersimpan di database cloud!", "success");
  });
}

  // ==========================================================================
  // 8. DIREKTORI RUJUKAN BANTUAN RESMI
  // ==========================================================================
  const modalReferral = document.getElementById("modal-referral");
  const btnOpenReferral = document.getElementById("btn-open-referral");
  const btnCloseReferral = document.getElementById("btn-close-referral-modal");
  const referralListContainer = document.getElementById("referral-list-container");

  function renderReferrals() {
    if (!referralListContainer) return;
    referralListContainer.innerHTML = "";
    ARUTALA_DATA.referrals.forEach(ref => {
      const item = document.createElement("div");
      item.style.cssText = "background: var(--bg-subtle); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px;";
      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
          <h4 style="font-size: 1rem; color: var(--text-primary); font-weight: 700;">${ref.name}</h4>
          <span class="badge badge-rose" style="font-size: 0.72rem;">${ref.type}</span>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">${ref.desc}</p>
        <div style="font-size: 0.82rem; font-weight: 600; color: var(--primary);">
          Kontak: ${ref.contact} | ${ref.hours}
        </div>
      `;
      referralListContainer.appendChild(item);
    });
  }
  window.renderReferralsGlobal = renderReferrals;

  if (btnOpenReferral) {
    btnOpenReferral.addEventListener("click", () => {
      renderReferrals();
      modalReferral.classList.add("active");
      document.body.classList.add("has-active-modal");
    });
  }
  if (btnCloseReferral) {
    btnCloseReferral.addEventListener("click", () => {
      modalReferral.classList.remove("active");
      document.body.classList.remove("has-active-modal");
    });
  }
  if (modalReferral) {
    modalReferral.addEventListener("click", (e) => {
      if (e.target === modalReferral) {
        modalReferral.classList.remove("active");
        document.body.classList.remove("has-active-modal");
      }
    });
  }

  // Mobile Nav Toggle (if present)
  const mobileToggle = document.getElementById("btn-mobile-toggle");
  const mainNavLinks = document.getElementById("main-nav-links");

  if (mobileToggle && mainNavLinks) {
    mobileToggle.addEventListener("click", () => {
      if (mainNavLinks.style.display === "flex") {
        mainNavLinks.style.display = "none";
      } else {
        mainNavLinks.style.display = "flex";
        mainNavLinks.style.flexDirection = "column";
        mainNavLinks.style.position = "absolute";
        mainNavLinks.style.top = "72px";
        mainNavLinks.style.left = "0";
        mainNavLinks.style.right = "0";
        mainNavLinks.style.background = "#FFFFFF";
        mainNavLinks.style.padding = "20px";
        mainNavLinks.style.borderBottom = "1px solid var(--border)";
        mainNavLinks.style.boxShadow = "var(--shadow-lg)";
      }
    });
  }

  // Mobile Bottom Navigation Dock Interaction & Active Section Observer
  const bottomDockItems = document.querySelectorAll(".bottom-dock-item");
  if (bottomDockItems.length > 0) {
    bottomDockItems.forEach(item => {
      item.addEventListener("click", (e) => {
        const href = item.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth" });
            bottomDockItems.forEach(b => b.classList.remove("active"));
            item.classList.add("active");
          }
        }
      });
    });

    // Observer to update active dock item on scroll
    const sectionsToObserve = ["beranda", "nilai-dasar", "artikel-opini", "pustaka-modul", "registrasi-circle"];
    const sectionElements = sectionsToObserve.map(id => document.getElementById(id)).filter(Boolean);

    if ("IntersectionObserver" in window && sectionElements.length > 0) {
      const dockObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const currentId = entry.target.id;
            bottomDockItems.forEach(item => {
              if (item.dataset.target === currentId) {
                item.classList.add("active");
              } else {
                item.classList.remove("active");
              }
            });
          }
        });
      }, {
        threshold: 0.25,
        rootMargin: "-20% 0px -40% 0px"
      });

      sectionElements.forEach(sec => dockObserver.observe(sec));
    }
  }

  // Tutup Modal via Tombol Escape & Klik Area Backdrop
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        window.closeAllModals();
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.closeAllModals();
    }
  });

  // ==========================================================================
  // MODAL REGISTRASI ARUTALA CIRCLE HANDLER
  // ==========================================================================
  const modalCircleRegForm = document.getElementById("modal-circle-reg-form");
  if (modalCircleRegForm) {
    modalCircleRegForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const roleInput = document.getElementById("reg-role-input");
      const role = roleInput ? roleInput.value : "mentee";
      const nameInput = document.getElementById("reg-fullname");
      const ageInput = document.getElementById("reg-age");
      const instInput = document.getElementById("reg-institution");
      const contactInput = document.getElementById("reg-contact");
      const interestInput = document.getElementById("reg-interest");
      const expInput = document.getElementById("reg-experience");
      const skillInput = document.getElementById("reg-skill");

      const name = nameInput ? nameInput.value.trim() : "Peserta";
      const ageRange = ageInput ? ageInput.value : "-";
      const institution = instInput ? instInput.value.trim() : "-";
      const contact = contactInput ? contactInput.value.trim() : "-";
      const interestOrExp = role === "mentee"
        ? (interestInput ? interestInput.value : "-")
        : (expInput ? expInput.value : "-");
      const commitment = role === "mentee" ? "Mengikuti Lingkaran Belajar" : (skillInput ? skillInput.value : "4-weeks");

      const circleId = "ARUTALA-CR-" + Math.floor(1000 + Math.random() * 9000);
      const roleText = role === "mentee" ? "Peserta Belajar (Mentee)" : "Tutor Sebaya / Konselor Pemuda";

      // 1. Simpan ke Supabase Tabel 'registrations'
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
          console.log("Pendaftaran Circle tersimpan ke Supabase Cloud.");
        } catch (err) {
          console.warn("Gagal simpan ke Supabase, fallback ke localStorage:", err);
        }
      }

      // 2. Simpan cadangan ke localStorage
      const record = {
        circleId,
        name,
        role: roleText,
        institution,
        registeredAt: new Date().toLocaleDateString("id-ID")
      };
      try {
        localStorage.setItem("arutala_user_circle", JSON.stringify(record));
      } catch (err) {}

      // Update modal success view
      const successId = document.getElementById("modal-reg-success-id");
      const successName = document.getElementById("modal-reg-success-name");
      const successRole = document.getElementById("modal-reg-success-role");
      const successInst = document.getElementById("modal-reg-success-inst");
      const successBox = document.getElementById("modal-circle-reg-success");

      if (successId) successId.textContent = circleId;
      if (successName) successName.textContent = name;
      if (successRole) {
        successRole.textContent = role === "mentee" ? "Peserta Belajar (Mentee)" : "Tutor Sebaya";
        successRole.className = role === "mentee" ? "badge badge-green" : "badge badge-coral";
      }
      if (successInst) successInst.textContent = institution;

      modalCircleRegForm.style.display = "none";
      if (successBox) successBox.style.display = "block";

      if (typeof showToast === "function") {
        showToast(`Pendaftaran Berhasil & Tersimpan di Cloud! ID Circle: ${circleId}`, "success");
      }
    });
  }

  // ==========================================================================
  // DONOR LIVE FEED RENDERER
  // ==========================================================================
  function renderDonorsFeed() {
    const container = document.getElementById("donor-feed-list");
    if (!container) return;
    container.innerHTML = "";

    const donations = (window.ARUTALA_DATA && Array.isArray(window.ARUTALA_DATA.donations))
      ? window.ARUTALA_DATA.donations
      : [];

    if (donations.length === 0) {
      container.innerHTML = '<p style="color: #64748B; font-size: 0.85rem; text-align: center; padding: 20px 0;">Belum ada donasi tercatat. Jadilah donatur pertama!</p>';
      return;
    }

    donations.forEach(don => {
      const item = document.createElement("div");
      item.className = "donor-feed-item";
      const initial = don.isAnonymous ? "H" : (don.donorName ? don.donorName.charAt(0).toUpperCase() : "D");
      const avatarBg = don.isAnonymous ? "#64748B" : "#2F4F87";

      item.innerHTML = `
        <div class="donor-avatar" style="background: ${avatarBg};">${initial}</div>
        <div class="donor-info">
          <div class="donor-name-row">
            <strong class="donor-name">${don.donorName}</strong>
            <span class="donor-amount-badge">Rp ${don.amount.toLocaleString("id-ID")}</span>
          </div>
          <div class="donor-package-tag">${don.targetPackage}</div>
          ${don.message ? `<p class="donor-message">“${don.message}”</p>` : ''}
          <span class="donor-time">${don.time}</span>
        </div>
      `;
      container.appendChild(item);
    });
  }
  window.renderDonorsFeedGlobal = renderDonorsFeed;

  // ==========================================================================
  // SINKRONISASI DATA SUPABASE CLOUD (Smart Fallback: Initial Data + Cloud Data)
  // ==========================================================================
  async function syncWithSupabaseCloud() {
    if (!window.ArutalaDB) return;

    // 1. Sinkronisasi Artikel dari Cloud
    try {
      const cloudArticles = await window.ArutalaDB.fetchArticles();
      if (cloudArticles && cloudArticles.length > 0) {
        const defaultArticles = ARUTALA_DATA.articles.filter(
          def => !cloudArticles.some(c => String(c.id) === String(def.id) || c.title === def.title)
        );
        AppState.articles = [...cloudArticles, ...defaultArticles];
        window.ARUTALA_DATA.articles = AppState.articles;
        renderArticles();
      }
    } catch (e) {
      console.warn("Gagal sinkronisasi artikel dari cloud:", e);
    }

    // 2. Sinkronisasi Aksi Nyata (Actions) dari Cloud
    try {
      const cloudActions = await window.ArutalaDB.fetchActions();
      if (cloudActions && cloudActions.length > 0) {
        const defaultActions = ARUTALA_DATA.actions.filter(
          def => !cloudActions.some(c => String(c.id) === String(def.id) || c.title === def.title)
        );
        AppState.actions = [...cloudActions, ...defaultActions];
        window.ARUTALA_DATA.actions = AppState.actions;
        renderActions();
      }
    } catch (e) {
      console.warn("Gagal sinkronisasi aksi dari cloud:", e);
    }

    // 3. Sinkronisasi Donasi (Donations) dari Cloud
    try {
      const cloudDonations = await window.ArutalaDB.fetchDonations();
      if (cloudDonations && cloudDonations.length > 0) {
        const defaultDonations = (window.ARUTALA_DATA && window.ARUTALA_DATA.donations) || [];
        const mergedDonations = [...cloudDonations, ...defaultDonations];
        window.ARUTALA_DATA.donations = mergedDonations;

        // Hitung total akumulasi donasi
        const cloudTotal = cloudDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        let cur = 18750000 + cloudTotal;
        window._currentDonationTotal = cur;

        const totalAmountEl = document.getElementById("donation-current-amount");
        const progressBarEl = document.getElementById("donation-progress-bar");
        const progressPercentEl = document.getElementById("donation-progress-percent");
        if (totalAmountEl && progressBarEl && progressPercentEl) {
          const target = 25000000;
          const pct = Math.min(100, Math.round((cur / target) * 100));
          totalAmountEl.textContent = "Rp " + cur.toLocaleString("id-ID");
          progressBarEl.style.width = pct + "%";
          progressPercentEl.textContent = pct + "% Terkumpul";
        }

        renderDonorsFeed();
      }
    } catch (e) {
      console.warn("Gagal sinkronisasi donasi dari cloud:", e);
    }

    // 4. Sinkronisasi Q&A (Forum Diskusi) dari Cloud
    try {
      const cloudQA = await window.ArutalaDB.fetchQAPosts();
      if (cloudQA && cloudQA.length > 0) {
        const defaultQA = ARUTALA_DATA.qaList.filter(
          def => !cloudQA.some(c => String(c.id) === String(def.id) || c.question === def.question)
        );
        AppState.qaList = [...cloudQA, ...defaultQA];
        window.ARUTALA_DATA.qaList = AppState.qaList;
        renderQA();
      }
    } catch (e) {
      console.warn("Gagal sinkronisasi Q&A dari cloud:", e);
    }
  }

  // Initial Render (Instan)
  renderArticles();
  renderVideos();
  if (modulesNavList) {
    renderModulesNav();
    renderActiveModule();
  }
  renderActions();
  renderDonorsFeed();
  renderQA();

  // Background Cloud Sync (Real-time Cloud Data)
  syncWithSupabaseCloud();

  // Interactive Animations & Controls
  initScrollReveal();
  setupFloatingBackToTop();

  console.log("ARUTALA Application Initialized Successfully.");
});

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
    ".uss-clean-card",
    ".uss-featured-card",
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
