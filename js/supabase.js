/**
 * ==========================================================================
 * ARUTALA - Supabase Cloud Database & Storage Client (supabase.js)
 * Mengelola integrasi database cloud real-time & penyimpanan berkas media
 * ==========================================================================
 */

(function () {
  const SUPABASE_URL = "https://dsdpagavzduwlakzeqsp.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzZHBhZ2F2emR1d2xha3plcXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNzE1NjIsImV4cCI6MjEwNzY0NzU2Mn0.BOEz8WD_og9xEWLupvf-i19E3cSCICS6cbBlZvKo4lQ";
  const STORAGE_BUCKET = "arutala-media";

  let client = null;

  // Inisialisasi Supabase SDK
  try {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log("ARUTALA: Supabase Cloud Client Connected Successfully.");
    } else {
      console.warn("ARUTALA: Supabase SDK belum dimuat. Pastikan CDN supabase-js telah disertakan.");
    }
  } catch (err) {
    console.error("ARUTALA: Gagal menginisialisasi Supabase Client:", err);
  }

  // Helper Pemformat Waktu & Tanggal Bahasa Indonesia
  function formatRelativeTime(dateStr) {
    if (!dateStr) return "Baru saja";
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (isNaN(diffSec) || diffSec < 60) return "Baru saja";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} hari lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function formatDisplayDate(dateStr) {
    if (!dateStr) return "Oktober 2026";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "Long",
      year: "numeric"
    });
  }

  function getCategoryColor(category) {
    switch ((category || "").toLowerCase()) {
      case "bersuara": return "#FF64C5";
      case "pandai": return "#66BB6A";
      case "cerdas": return "#89BBEE";
      case "berdaya": return "#2F4F87";
      default: return "#2F4F87";
    }
  }

  function getCategoryLabel(category) {
    switch ((category || "").toLowerCase()) {
      case "bersuara": return "BERSUARA (Gender)";
      case "pandai": return "PANDAI (Moderasi)";
      case "cerdas": return "CERDAS (Budaya)";
      case "berdaya": return "BERDAYA (Ruang Aman)";
      default: return "ARUTALA (Inovasi)";
    }
  }

  function getCategoryThemeColor(category) {
    switch ((category || "").toLowerCase()) {
      case "bersuara": return "coral";
      case "pandai": return "emerald";
      case "cerdas": return "blue";
      case "berdaya": return "indigo";
      default: return "blue";
    }
  }

  // ==========================================================================
  // API SERVICE ARUTALA DATABASE
  // ==========================================================================
  const ArutalaDB = {
    client: client,
    bucket: STORAGE_BUCKET,

    // ------------------------------------------------------------------------
    // 1. STORAGE UPLOAD HELPER
    // ------------------------------------------------------------------------
    async uploadMediaFile(file, folder = "uploads") {
      if (!client || !file) return null;

      try {
        const cleanName = (file.name || "file").replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = `${folder}/${Date.now()}_${cleanName}`;

        const { data, error } = await client.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false
          });

        if (error) {
          console.error("Gagal mengunggah file ke Supabase Storage:", error);
          throw error;
        }

        // Dapatkan URL publik
        const { data: publicData } = client.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);

        return publicData?.publicUrl || null;
      } catch (err) {
        console.error("Kesalahan upload file:", err);
        throw err;
      }
    },

    // ------------------------------------------------------------------------
    // 2. ARTICLES (Artikel & Jurnal)
    // ------------------------------------------------------------------------
    async fetchArticles() {
      if (!client) return [];
      try {
        const { data, error } = await client
          .from("articles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Gagal mengambil data artikel dari Supabase:", error);
          return [];
        }

        return (data || []).map((row) => ({
          id: row.id,
          title: row.title,
          category: (row.category || "pandai").toLowerCase(),
          categoryLabel: getCategoryLabel(row.category),
          themeColor: getCategoryThemeColor(row.category),
          accentColor: getCategoryColor(row.category),
          coverImage: row.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
          docUrl: row.doc_url || null,
          quoteHighlight: row.quote || null,
          author: row.author || "Kontributor Pemuda",
          authorRole: row.role || "Kontributor Pemuda",
          date: row.date || formatDisplayDate(row.created_at),
          readTime: row.read_time || "4 menit baca",
          summary: row.summary || "",
          content: row.content || "",
          tags: [getCategoryLabel(row.category).split(" ")[0], "Kontributor", "Opini Pemuda"],
          isFromCloud: true
        }));
      } catch (err) {
        console.error("Fetch articles error:", err);
        return [];
      }
    },

    async fetchArticleById(id) {
      if (!client || !id) return null;
      try {
        const { data, error } = await client
          .from("articles")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error || !data) return null;

        return {
          id: data.id,
          title: data.title,
          category: (data.category || "pandai").toLowerCase(),
          categoryLabel: getCategoryLabel(data.category),
          themeColor: getCategoryThemeColor(data.category),
          accentColor: getCategoryColor(data.category),
          coverImage: data.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
          docUrl: data.doc_url || null,
          quoteHighlight: data.quote || null,
          author: data.author || "Kontributor Pemuda",
          authorRole: data.role || "Kontributor Pemuda",
          date: data.date || formatDisplayDate(data.created_at),
          readTime: data.read_time || "4 menit baca",
          summary: data.summary || "",
          content: data.content || "",
          tags: [getCategoryLabel(data.category).split(" ")[0], "Kontributor", "Opini Pemuda"],
          isFromCloud: true
        };
      } catch (err) {
        console.error("Fetch article by id error:", err);
        return null;
      }
    },

    async insertArticle(payload) {
      if (!client) return null;
      try {
        const row = {
          title: payload.title,
          category: (payload.category || "pandai").toLowerCase(),
          author: payload.author,
          role: payload.role || payload.authorRole || "Kontributor Pemuda",
          date: payload.date || formatDisplayDate(new Date()),
          read_time: payload.read_time || payload.readTime || "4 menit baca",
          image: payload.image || payload.coverImage,
          doc_url: payload.doc_url || payload.docUrl || null,
          quote: payload.quote || payload.quoteHighlight || null,
          summary: payload.summary,
          content: payload.content
        };

        const { data, error } = await client
          .from("articles")
          .insert([row])
          .select();

        if (error) {
          console.error("Gagal menyimpan artikel ke Supabase:", error);
          throw error;
        }

        const inserted = data && data[0];
        if (inserted) {
          return {
            id: inserted.id,
            title: inserted.title,
            category: inserted.category,
            categoryLabel: getCategoryLabel(inserted.category),
            themeColor: getCategoryThemeColor(inserted.category),
            accentColor: getCategoryColor(inserted.category),
            coverImage: inserted.image,
            docUrl: inserted.doc_url,
            quoteHighlight: inserted.quote,
            author: inserted.author,
            authorRole: inserted.role,
            date: inserted.date,
            readTime: inserted.read_time,
            summary: inserted.summary,
            content: inserted.content,
            tags: [getCategoryLabel(inserted.category).split(" ")[0], "Kontributor", "Opini Pemuda"],
            isFromCloud: true
          };
        }
        return null;
      } catch (err) {
        console.error("Insert article error:", err);
        throw err;
      }
    },

    // ------------------------------------------------------------------------
    // 3. ACTIONS (ARUTALA Action Showcase)
    // ------------------------------------------------------------------------
    async fetchActions() {
      if (!client) return [];
      try {
        const { data, error } = await client
          .from("actions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Gagal mengambil data aksi dari Supabase:", error);
          return [];
        }

        return (data || []).map((row) => ({
          id: row.id,
          circleName: row.circle_name || "Komunitas ARUTALA",
          submitter: row.circle_name || "Komunitas ARUTALA",
          title: row.title,
          location: row.location || "Bandung, Jawa Barat",
          impact: "Dokumentasi kegiatan aksi nyata terverifikasi",
          badge: "Dokumentasi Komunitas",
          image: row.image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
          description: row.description || "",
          date: formatRelativeTime(row.created_at),
          participants: "Pemuda Komunitas",
          isFromCloud: true
        }));
      } catch (err) {
        console.error("Fetch actions error:", err);
        return [];
      }
    },

    async insertAction(payload) {
      if (!client) return null;
      try {
        const row = {
          title: payload.title,
          location: payload.location,
          circle_name: payload.circle_name || payload.circleName || payload.submitter || "Komunitas ARUTALA",
          image: payload.image || payload.photoUrl,
          description: payload.description || payload.desc
        };

        const { data, error } = await client
          .from("actions")
          .insert([row])
          .select();

        if (error) {
          console.error("Gagal menyimpan aksi ke Supabase:", error);
          throw error;
        }

        const inserted = data && data[0];
        if (inserted) {
          return {
            id: inserted.id,
            circleName: inserted.circle_name,
            submitter: inserted.circle_name,
            title: inserted.title,
            location: inserted.location,
            impact: "Dokumentasi kegiatan aksi nyata terverifikasi",
            badge: "Dokumentasi Komunitas",
            image: inserted.image,
            description: inserted.description,
            date: "Baru saja",
            participants: "Pemuda Komunitas",
            isFromCloud: true
          };
        }
        return null;
      } catch (err) {
        console.error("Insert action error:", err);
        throw err;
      }
    },

    // ------------------------------------------------------------------------
    // 4. REGISTRATIONS (Pendaftaran Circle & Modul)
    // ------------------------------------------------------------------------
    async insertRegistration(payload) {
      if (!client) return null;
      try {
        const row = {
          circle_id: payload.circle_id || payload.circleId,
          role: payload.role,
          fullname: payload.fullname || payload.name,
          age_range: payload.age_range || payload.ageRange,
          institution: payload.institution,
          contact: payload.contact || null,
          interest_or_exp: payload.interest_or_exp || payload.interestOrExp || null,
          commitment: payload.commitment || null
        };

        const { data, error } = await client
          .from("registrations")
          .insert([row])
          .select();

        if (error) {
          console.error("Gagal menyimpan pendaftaran ke Supabase:", error);
          throw error;
        }

        return data && data[0];
      } catch (err) {
        console.error("Insert registration error:", err);
        throw err;
      }
    },

    // ------------------------------------------------------------------------
    // 5. DONATIONS (Donasi & Doa Donatur)
    // ------------------------------------------------------------------------
    async fetchDonations() {
      if (!client) return [];
      try {
        const { data, error } = await client
          .from("donations")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Gagal mengambil donasi dari Supabase:", error);
          return [];
        }

        return (data || []).map((row) => ({
          id: row.id,
          donorName: row.is_anonymous ? "Hamba Allah" : (row.donor_name || "Hamba Allah"),
          amount: Number(row.amount) || 0,
          targetPackage: row.package_name || "Paket Pengembangan Pemuda",
          message: row.message || "",
          time: formatRelativeTime(row.created_at),
          isAnonymous: !!row.is_anonymous,
          isFromCloud: true
        }));
      } catch (err) {
        console.error("Fetch donations error:", err);
        return [];
      }
    },

    async insertDonation(payload) {
      if (!client) return null;
      try {
        const row = {
          donor_name: payload.donor_name || payload.name || "Hamba Allah",
          amount: Number(payload.amount) || 0,
          package_name: payload.package_name || payload.package || "Paket Pengembangan Pemuda",
          message: payload.message || "",
          is_anonymous: Boolean(payload.is_anonymous || payload.isAnonymous)
        };

        const { data, error } = await client
          .from("donations")
          .insert([row])
          .select();

        if (error) {
          console.error("Gagal menyimpan donasi ke Supabase:", error);
          throw error;
        }

        const inserted = data && data[0];
        if (inserted) {
          return {
            id: inserted.id,
            donorName: inserted.is_anonymous ? "Hamba Allah" : inserted.donor_name,
            amount: Number(inserted.amount) || 0,
            targetPackage: inserted.package_name,
            message: inserted.message,
            time: "Baru saja",
            isAnonymous: !!inserted.is_anonymous,
            isFromCloud: true
          };
        }
        return null;
      } catch (err) {
        console.error("Insert donation error:", err);
        throw err;
      }
    },

    // ------------------------------------------------------------------------
    // 6. QA POSTS (Forum Tanya Jawab)
    // ------------------------------------------------------------------------
    async fetchQAPosts() {
      if (!client) return [];
      try {
        const { data, error } = await client
          .from("qa_posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Gagal mengambil Q&A dari Supabase:", error);
          return [];
        }

        return (data || []).map((row) => ({
          id: row.id,
          author: row.author || "Kawan_ARUTALA",
          question: row.question,
          tags: [row.tag || "Ruang Aman"],
          answersCount: row.answer ? 1 : 0,
          upvotes: Number(row.votes) || 1,
          date: formatRelativeTime(row.created_at),
          bestAnswer: row.answer ? {
            author: "Fasilitator Sebaya ARUTALA",
            content: row.answer
          } : null,
          isFromCloud: true
        }));
      } catch (err) {
        console.error("Fetch QA error:", err);
        return [];
      }
    },

    async insertQAPost(payload) {
      if (!client) return null;
      try {
        const row = {
          author: payload.author || "Kawan_ARUTALA",
          question: payload.question,
          tag: payload.tag || (payload.tags && payload.tags[0]) || "Ruang Aman",
          votes: Number(payload.votes) || 1,
          answer: payload.answer || null
        };

        const { data, error } = await client
          .from("qa_posts")
          .insert([row])
          .select();

        if (error) {
          console.error("Gagal menyimpan Q&A ke Supabase:", error);
          throw error;
        }

        const inserted = data && data[0];
        if (inserted) {
          return {
            id: inserted.id,
            author: inserted.author,
            question: inserted.question,
            tags: [inserted.tag],
            answersCount: inserted.answer ? 1 : 0,
            upvotes: Number(inserted.votes) || 1,
            date: "Baru saja",
            bestAnswer: inserted.answer ? {
              author: "Fasilitator Sebaya ARUTALA",
              content: inserted.answer
            } : null,
            isFromCloud: true
          };
        }
        return null;
      } catch (err) {
        console.error("Insert QA error:", err);
        throw err;
      }
    },

    async updateQAVote(id, newVotes) {
      if (!client || !id) return null;
      try {
        const { data, error } = await client
          .from("qa_posts")
          .update({ votes: newVotes })
          .eq("id", id)
          .select();

        if (error) {
          console.error("Gagal mengupdate vote di Supabase:", error);
          return null;
        }
        return data && data[0];
      } catch (err) {
        console.error("Update QA vote error:", err);
        return null;
      }
    }
  };

  // Ekspos ke global window
  window.ArutalaDB = ArutalaDB;
  window.formatRelativeTime = formatRelativeTime;
  window.formatDisplayDate = formatDisplayDate;
})();
