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
      case "pandai":
      case "moderasi": return "MODERASI BERAGAMA";
      case "bersuara":
      case "kesetaraan": return "KESETARAAN";
      case "cerdas":
      case "budaya": return "BUDAYA";
      case "berdaya":
      case "sosial": return "SOSIAL MASYARAKAT";
      default: return "MODERASI BERAGAMA";
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
          coverImage: row.image || "img/pelatihan_fasilitator_auditorium.jpg",
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
          coverImage: data.image || "img/pelatihan_fasilitator_auditorium.jpg",
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
          image: row.image || "img/pelatihan_fasilitator_auditorium.jpg",
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
    },

    // ------------------------------------------------------------------------
    // 6. DYNAMIC LMS MODULES & QUIZZES (KARSA, NUANSA, TEMARA)
    // ------------------------------------------------------------------------
    getDefaultLmsItems(track) {
      const t = (track || "karsa").toLowerCase();
      if (t === "karsa") {
        return [
          {
            id: "karsa-mod-1",
            track: "karsa",
            type: "module",
            code: "MOD-01",
            orderNum: 1,
            title: "Mengenali Diri dan Potensi",
            subtitle: "Fondasi Self-Love, Identifikasi Bakat, dan Perencanaan Masa Depan",
            duration: "45 Menit",
            summary: "Tahap awal pembentukan kapasitas pemuda berfokus pada kesadaran diri (self-awareness) dan penerimaan diri secara positif. Melalui pendekatan self-compassion, pemuda diajak memetakan kekuatan internal, mengelola ekspektasi pribadi tanpa terjebak insecurity, serta merancang peta jalan kontribusi sosial yang selaras dengan minat dan bakat alaminya.",
            docUrl: "https://drive.google.com/file/d/1demo-karsa-modul-1/view",
            docName: "MODUL-01-Mengenali-Diri-dan-Potensi.pdf",
            docSize: "2.4 MB"
          },
          {
            id: "karsa-mod-2",
            track: "karsa",
            type: "module",
            code: "MOD-02",
            orderNum: 2,
            title: "Nilai Keagamaan, Keadilan, dan Martabat Manusia",
            subtitle: "Prinsip Rahmah, Keadilan Hakiki, dan Tanggung Jawab Moral Pemuda",
            duration: "50 Menit",
            summary: "Menggali nilai kemuliaan manusia (karamah insaniyyah) sebagai mandat moral keagamaan. Modul ini menegaskan bahwa kesalehan spiritual harus berwujud nyata dalam penghormatan terhadap hak asasi, keadilan sosial, dan pembelaan terhadap kelompok marjinal demi terwujudnya tatanan sosial yang berkeadaban.",
            docUrl: "https://drive.google.com/file/d/1demo-karsa-modul-2/view",
            docName: "MODUL-02-Nilai-Keagamaan-dan-Martabat.pdf",
            docSize: "2.8 MB"
          },
          {
            id: "karsa-mod-3",
            track: "karsa",
            type: "module",
            code: "MOD-03",
            orderNum: 3,
            title: "Moderasi Beragama dalam Kehidupan Pemuda",
            subtitle: "4 Pilar Kemenag: Kebangsaan, Toleransi, Anti-Kekerasan, Budaya Lokal",
            duration: "60 Menit",
            summary: "Membekali pemuda dengan pemahaman moderasi beragama sebagai jalan tengah (wasathiyyah). Membedah empat indikator utama Kementerian Agama: penguatan komitmen kebangsaan, penegakan toleransi aktif lintas iman, penolakan mutlak terhadap radikalisme/kekerasan, serta sikap akomodatif terhadap tradisi budaya nusantara.",
            docUrl: "https://drive.google.com/file/d/1demo-karsa-modul-3/view",
            docName: "MODUL-03-Moderasi-Beragama-Pemuda.pdf",
            docSize: "3.1 MB"
          },
          {
            id: "karsa-mod-4",
            track: "karsa",
            type: "module",
            code: "MOD-04",
            orderNum: 4,
            title: "Kesetaraan Gender dan Mendobrak Stereotip",
            subtitle: "Membedakan Kodrat vs Gender, Keadilan Relasi, dan Peran Sekutu (Allies)",
            duration: "55 Menit",
            summary: "Panduan praktis mengurai konstruksi sosial gender dari faktor biologis alami. Menjelaskan pentingnya keadilan gender (gender equity) dalam pembagian peran kepemimpinan, penghapusan bias di ruang organisasi kampus, serta memotivasi laki-laki menjadi sekutu aktif (allies) dalam menciptakan lingkungan yang adil.",
            docUrl: "https://drive.google.com/file/d/1demo-karsa-modul-4/view",
            docName: "MODUL-04-Kesetaraan-Gender-dan-Stereotip.pdf",
            docSize: "2.7 MB"
          },
          {
            id: "karsa-mod-5",
            track: "karsa",
            type: "module",
            code: "MOD-05",
            orderNum: 5,
            title: "Komunikasi Inklusif dan Ruang Aman",
            subtitle: "Active Listening, Bahasa Bebas Stigma, dan Mitigasi Micromisogyny",
            duration: "50 Menit",
            summary: "Keterampilan mendengarkan aktif (active listening) dengan empati penuh tanpa menghakimi. Mengajarkan cara mengenali dan menghentikan humor bernada seksis, lelucon mikro-agresi, serta membangun protokol ruang aman psikologis di setiap perkumpulan anak muda.",
            docUrl: "https://drive.google.com/file/d/1demo-karsa-modul-5/view",
            docName: "MODUL-05-Komunikasi-Inklusif-Ruang-Aman.pdf",
            docSize: "2.2 MB"
          },
          {
            id: "karsa-mod-6",
            track: "karsa",
            type: "module",
            code: "MOD-06",
            orderNum: 6,
            title: "Kearifan Budaya Lokal 'Silih Asah, Asih, Asuh'",
            subtitle: "Filosofi Sunda untuk Solidaritas, Resolusi Konflik, dan Kohesi Sosial",
            duration: "45 Menit",
            summary: "Menghidupkan filosofi luhur masyarakat Sunda dalam interaksi modern: Silih Asah (saling mencerdaskan nalar), Silih Asih (saling mengasihi dengan kelembutan), dan Silih Asuh (saling membimbing dan melindungi). Menjadikan kearifan lokal sebagai instrumen mediasi konflik sebaya.",
            docUrl: "https://drive.google.com/file/d/1demo-karsa-modul-6/view",
            docName: "MODUL-06-Kearifan-Lokal-Silih-Asah-Asih-Asuh.pdf",
            docSize: "2.5 MB"
          },
          {
            id: "karsa-mod-7",
            track: "karsa",
            type: "module",
            code: "MOD-07",
            orderNum: 7,
            title: "Aksi Nyata dan Kolaborasi Inovasi Sosial",
            subtitle: "Dari Wacana ke Lapangan: Desain Inisiatif Berdampak di Masyarakat",
            duration: "60 Menit",
            summary: "Mengonversi pengetahuan teoritis menjadi portofolio aksi nyata. Memandu pembentukan tim inisiatif pemuda, pemetaan masalah sosial di lapangan (social mapping), penyusunan anggaran hemat biaya, serta pemanfaatan media digital untuk menyebarkan pesan positif ke publik luas.",
            docUrl: "https://drive.google.com/file/d/1demo-karsa-modul-7/view",
            docName: "MODUL-07-Aksi-Nyata-Inovasi-Sosial.pdf",
            docSize: "3.4 MB"
          },
          {
            id: "karsa-quiz-eval",
            track: "karsa",
            type: "quiz",
            code: "KUIS-01",
            orderNum: 8,
            title: "Kuis Evaluasi Terpadu: Kapasitas & Kepemimpinan Pemuda",
            subtitle: "Uji Pemahaman Komprehensif Seluruh Modul 1 sampai 7",
            duration: "15 Menit Kuis",
            summary: "Kuis interaktif ini dirancang khusus untuk mengukur kedalaman pemahamanmu atas materi kepemimpinan, keadilan gender, moderasi beragama, dan etika komunikasi inklusif yang telah dipelajari.",
            questions: [
              {
                id: 1,
                question: "Apa esensi dari prinsip self-compassion dalam tahap mengenali potensi diri?",
                options: [
                  "Mencari pembenaran atas semua kesalahan tanpa berusaha introspeksi",
                  "Memperlakukan diri dengan welas asih saat gagal dan menjadikannya titik tolak perbaikan positif",
                  "Membandingkan kelemahan pribadi dengan keunggulan orang lain agar merasa tertantang",
                  "Mengabaikan saran dan masukan sahabat demi mempertahankan ego"
                ],
                correctIndex: 1,
                explanation: "Self-compassion adalah kesadaran untuk bersikap baik pada diri sendiri di saat sulit, menerima ketidaksempurnaan sebagai proses belajar, dan bertumbuh dengan penuh kasih sayang."
              },
              {
                id: 2,
                question: "Perbedaan mendasar antara 'Kesetaraan Gender' (Equality) dan 'Keadilan Gender' (Equity) adalah:",
                options: [
                  "Kesetaraan memberikan hak yang sama persis tanpa melihat kebutuhan, sedangkan Keadilan memberikan afirmasi adil sesuai hambatan nyata yang dihadapi",
                  "Kesetaraan hanya berlaku untuk perempuan, sedangkan keadilan berlaku untuk laki-laki",
                  "Kesetaraan mengharuskan pembagian peran yang terbalik antara peran domestik dan publik",
                  "Tidak ada perbedaan sama sekali, kedua istilah memiliki makna hukum yang identik"
                ],
                correctIndex: 0,
                explanation: "Keadilan gender (equity) memperhitungkan titik awal dan kerentanan historis/struktural yang dihadapi individu sehingga kebijakan yang adil sering kali memerlukan perlakuan afirmasi khusus (seperti ruang laktasi, gerbong khusus) demi terwujudnya keadilan substantif."
              },
              {
                id: 3,
                question: "Manakah tindakan di lingkungan kampus yang paling tepat mencerminkan peran pemuda laki-laki sebagai 'Sekutu' (Allies) kesetaraan gender?",
                options: [
                  "Tetap diam ketika mendengar lelucon seksis di grup obrolan agar tidak merusak suasana",
                  "Secara tegas menegur dan menolak budaya 'locker room talk' yang merendahkan martabat perempuan",
                  "Menyerahkan seluruh tanggung jawab advokasi ruang aman hanya kepada mahasiswi",
                  "Menganggap isu pelecehan seksual hanyalah persoalan privasi personal"
                ],
                correctIndex: 1,
                explanation: "Menjadi sekutu (allies) berarti berani bersuara dan mengintervensi norma pergaulan yang keliru, menolak pembiaran terhadap lelucon yang melecehkan, serta aktif menciptakan rasa aman bersama."
              },
              {
                id: 4,
                question: "Empat indikator moderasi beragama menurut Kementerian Agama RI meliputi:",
                options: [
                  "Komitmen Kebangsaan, Toleransi, Anti-Kekerasan, dan Akomodatif terhadap Budaya Lokal",
                  "Penyeragaman ritual ibadah, isolasi budaya, ketaatan dogmatis, dan eksklusivisme komunitas",
                  "Liberalisasi ajaran, penolakan tradisi lokal, kompromi teologis, dan formalisme hukum",
                  "Sekularisasi kampus, pemisahan total nilai etis, pluralisme pasif, dan kepatuhan buta"
                ],
                correctIndex: 0,
                explanation: "Empat pilar moderasi beragama Kemenag RI adalah: Komitmen Kebangsaan, Toleransi, Anti-Kekerasan, dan Sikap Akomodatif terhadap Budaya Lokal."
              },
              {
                id: 5,
                question: "Filosofi Sunda 'Silih Asah, Silih Asih, Silih Asuh' dalam konteks ruang aman pemuda bermakna:",
                options: [
                  "Saling bersaing ketat, saling menuntut kesempurnaan, dan saling mengawasi kesalahan",
                  "Saling mencerdaskan nalar, saling menyayangi dengan kelembutan hati, dan saling melindungi serta mendampingi",
                  "Saling mengabaikan perbedaan demi keseragaman pendapat yang kaku",
                  "Saling membebankan tugas organisasi tanpa pembagian tanggung jawab yang jelas"
                ],
                correctIndex: 1,
                explanation: "Silih Asah bermakna saling mengasah intelektual, Silih Asih saling menebar kasih sayang empati, dan Silih Asuh saling mengayomi serta menjaga sesama."
              }
            ]
          }
        ];
      } else if (t === "nuansa") {
        return [
          {
            id: "nuansa-mod-1",
            track: "nuansa",
            type: "module",
            code: "NUA-01",
            orderNum: 1,
            title: "Al-'Adl (Keadilan & Kesetaraan Gender)",
            subtitle: "Membangun Kesetaraan Berdasarkan Martabat Luhur Kemanusiaan",
            duration: "45 Menit",
            summary: "Nilai Al-'Adl (Keadilan) dalam teologi Islam menempatkan laki-laki dan perempuan sebagai hamba yang setara di hadapan Sang Pencipta, dengan kemuliaan yang diukur dari ketakwaan dan amal kebajikannya, bukan jenis kelamin. Membedah prinsip kesetaraan relasi keluarga, hak mengenyam pendidikan tinggi, serta kepemimpinan sosial.",
            docUrl: "https://drive.google.com/file/d/1demo-nuansa-modul-1/view",
            docName: "NUANSA-01-Al-Adl-Keadilan-Gender.pdf",
            docSize: "2.6 MB",
            videoUrl: "https://www.youtube.com/embed/zzWGNlDuTkA"
          },
          {
            id: "nuansa-mod-2",
            track: "nuansa",
            type: "module",
            code: "NUA-02",
            orderNum: 2,
            title: "Ukhuwah Insaniyyah (Persaudaraan Lintas Keragaman)",
            subtitle: "Melampaui Sekat Formalitas: Merangkul Kemajemukan Anak Bangsa",
            duration: "50 Menit",
            summary: "Persaudaraan kemanusiaan universal (ukhuwah insaniyyah / basyariyyah) menegaskan bahwa setiap individu berhak atas perlakuan yang bermartabat. Modul ini mengajarkan keterampilan berdialog lintas keyakinan, membangun empati kultural, dan menolak prasangka diskriminatif di lingkungan pergaulan.",
            docUrl: "https://drive.google.com/file/d/1demo-nuansa-modul-2/view",
            docName: "NUANSA-02-Ukhuwah-Insaniyyah.pdf",
            docSize: "2.9 MB",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
          },
          {
            id: "nuansa-mod-3",
            track: "nuansa",
            type: "module",
            code: "NUA-03",
            orderNum: 3,
            title: "Ar-Rahmah (Kasih Sayang & Ruang Aman Anti-Kekerasan)",
            subtitle: "Menerjemahkan Spirit Rahmatan Lil 'Alamin ke dalam Etika Anti-Pelecehan",
            duration: "45 Menit",
            summary: "Prinsip rahmah menolak keras segala wujud kekerasan, intimidasi psikologis, pelecehan seksual, maupun pemaksaan kehendak. Modul ini membimbing pemuda merumuskan kode etik pertemanan yang sehat, melindungi teman yang sedang terancam, dan mengikis budaya bystander effect.",
            docUrl: "https://drive.google.com/file/d/1demo-nuansa-modul-3/view",
            docName: "NUANSA-03-Ar-Rahmah-Ruang-Aman.pdf",
            docSize: "2.3 MB",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
          },
          {
            id: "nuansa-mod-4",
            track: "nuansa",
            type: "module",
            code: "NUA-04",
            orderNum: 4,
            title: "Al-Maslahah (Kebaikan Publik & Advokasi Sosial)",
            subtitle: "Menghadirkan Keberkahan Nyata bagi Kehidupan Bersama",
            duration: "55 Menit",
            summary: "Memahami tolok ukur kemaslahatan umum (maslahah 'ammah) dalam merancang program pemuda. Mengajak mahasiswa menjadi agen penggerak yang peka terhadap penderitaan sesama, mengadvokasi ruang publik inklusif ramah disabilitas dan perempuan, serta menjaga kohesi sosial masyarakat.",
            docUrl: "https://drive.google.com/file/d/1demo-nuansa-modul-4/view",
            docName: "NUANSA-04-Al-Maslahah-Kebaikan-Publik.pdf",
            docSize: "3.1 MB",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
          },
          {
            id: "nuansa-quiz-eval",
            track: "nuansa",
            type: "quiz",
            code: "KUIS-NUA",
            orderNum: 5,
            title: "Kuis Refleksi Etika Sosial & Nilai Keagamaan Moderat",
            subtitle: "Evaluasi Sikap Etis dan Studi Kasus Pemuda Berbasis Spirit Rahmah",
            duration: "12 Menit Kuis",
            summary: "Kuis refleksi studi kasus untuk menguji kepekaan nurani dan pemahaman etikamu dalam menyelesaikan dilema moral pemuda sehari-hari.",
            questions: [
              {
                id: 1,
                question: "Berdasarkan prinsip Al-'Adl (Keadilan), bagaimana pandangan etika keagamaan terhadap kesempatan kepemimpinan organisasi kemahasiswaan bagi perempuan?",
                options: [
                  "Kepemimpinan organisasi hanya diperuntukkan bagi laki-laki demi tradisi",
                  "Perempuan dan laki-laki berhak memimpin berdasarkan kapasitas kepemimpinan, integritas etis, dan kapabilitas karya",
                  "Perempuan hanya boleh mengisi posisi kepanitiaan domestik seperti logistik dan konsumsi",
                  "Kepemimpinan perempuan hanya diperbolehkan bila tidak ada satupun kandidat laki-laki"
                ],
                correctIndex: 1,
                explanation: "Prinsip Al-'Adl memandang kemuliaan dan kepemimpinan sosial berdasar pada kapasitas, akhlak mulia, dan amal nyata, bukan diskriminasi berbasis gender."
              },
              {
                id: 2,
                question: "Ketika terjadi perdebatan panas antar-mahasiswa berbeda keyakinan di kampus, sikap yang paling sesuai dengan spirit Ukhuwah Insaniyyah adalah:",
                options: [
                  "Menghasut kawan-kawan seagama untuk mengisolasi kelompok yang berbeda keyakinan",
                  "Memfasilitasi ruang dialog damai yang mencari titik temu nilai universal kemanusiaan tanpa saling menghakimi keyakinan teologis masing-masing",
                  "Memaksa lawan bicara untuk mengakui kelemahan ajaran agamanya",
                  "Menyebarkan potongan obrolan ke media sosial untuk memancing amarah publik"
                ],
                correctIndex: 1,
                explanation: "Ukhuwah Insaniyyah mengedepankan dialog santun, saling memahami perspektif keberagaman, dan menjaga persaudaraan di atas kemanusiaan bersama."
              },
              {
                id: 3,
                question: "Penerapan prinsip Ar-Rahmah (Kasih Sayang) yang paling nyata ketika mengetahui seorang teman menjadi korban pelecehan di kampus adalah:",
                options: [
                  "Menyalahkan korban atas gaya pakaiannya (victim blaming)",
                  "Menyediakan pendampingan ruang aman psikologis, menjaga kerahasiaan identitas korban, dan membantunya lapor ke pihak berwenang/satgas",
                  "Meminta korban memaafkan pelaku dan mengubur masalah tersebut tanpa sanksi apa pun",
                  "Menghindari korban karena takut reputasi pertemanan ikut tercoreng"
                ],
                correctIndex: 1,
                explanation: "Rahmah berarti menghadirkan empati nyata dan perlindungan bagi yang lemah, menolak victim blaming, dan membantu pemulihan serta keadilan korban."
              }
            ]
          }
        ];
      } else if (t === "temara") {
        return [
          {
            id: "temara-mod-1",
            track: "temara",
            type: "module",
            code: "TEM-01",
            orderNum: 1,
            title: "SOP & Etika Fasilitator Sebaya ARUTALA",
            subtitle: "Standar Operasional Prosedur Pendampingan & Prinsip Kerahasiaan Safe Space",
            duration: "40 Menit",
            summary: "Panduan baku bagi konselor sebaya dalam membuka sesi lingkaran belajar (Circle 5–8 orang). Mengatur batas kompetensi, kode etik kerahasiaan tanpa syarat (confidentiality agreement), etika menyambut cerita mentee, serta rujukan krisis bila terjadi indikasi darurat kekerasan.",
            docUrl: "https://drive.google.com/file/d/1demo-temara-modul-1/view",
            docName: "TEMARA-01-SOP-Fasilitator-Sebaya.pdf",
            docSize: "2.1 MB"
          },
          {
            id: "temara-mod-2",
            track: "temara",
            type: "module",
            code: "TEM-02",
            orderNum: 2,
            title: "Panduan Moderasi Dialog & Ice Breaking Inklusif",
            subtitle: "Teknik Memecah Kebekuan, Menggugah Partisipasi Pasif, dan Validasi Emosi",
            duration: "45 Menit",
            summary: "Metode praktis memoderasi diskusi kelompok kecil agar setiap anggota berani mengungkapkan gagasan tanpa takut dihakimi. Dilengkapi kumpulan lembar permainan ice-breaking inklusif dan teknik validasi perasaan teman sebaya.",
            docUrl: "https://drive.google.com/file/d/1demo-temara-modul-2/view",
            docName: "TEMARA-02-Panduan-Moderasi-Dialog.pdf",
            docSize: "2.7 MB"
          },
          {
            id: "temara-mod-3",
            track: "temara",
            type: "module",
            code: "TEM-03",
            orderNum: 3,
            title: "Manajemen Konflik & Konsensus Komunitas",
            subtitle: "Teknik Mediasi Nir-Kekerasan dan Penyelesaian Perselisihan Dinamika Kelompok",
            duration: "50 Menit",
            summary: "Membekali fasilitator instrumen mediasi ketika terjadi perbedaan pendapat tajam antar peserta. Menerapkan prinsip non-violent communication (NVC) untuk menemukan akar kebutuhan yang tak terpenuhi dan menyepakati resolusi win-win.",
            docUrl: "https://drive.google.com/file/d/1demo-temara-modul-3/view",
            docName: "TEMARA-03-Manajemen-Konflik-Sebaya.pdf",
            docSize: "2.4 MB"
          },
          {
            id: "temara-mod-4",
            track: "temara",
            type: "module",
            code: "TEM-04",
            orderNum: 4,
            title: "Panduan Advokasi & Eksekusi Aksi Sosial Lapangan",
            subtitle: "Manajemen Proyek Komunitas: Kampanye Kreatif, Logistik, dan Dokumentasi Dampak",
            duration: "60 Menit",
            summary: "Tahap final kaderisasi fasilitator temara: merancang dan mengawal aksi sosial bersama mentee di desa mitra atau komunitas kampus. Memandu penyusunan Key Performance Indicators (KPI) dampak sosial, advokasi pemangku kebijakan, dan publikasi akuntabilitas publik.",
            docUrl: "https://drive.google.com/file/d/1demo-temara-modul-4/view",
            docName: "TEMARA-04-Panduan-Aksi-Sosial-Lapangan.pdf",
            docSize: "3.2 MB"
          }
        ];
      }
      return [];
    },

    async fetchLmsItems(track = "karsa") {
      const t = (track || "karsa").toLowerCase();
      const cacheKey = `arutala_lms_cache_${t}`;

      // 1. Coba ambil dari Supabase
      if (client) {
        try {
          const { data, error } = await client
            .from("lms_items")
            .select("*")
            .eq("track", t)
            .order("order_num", { ascending: true });

          if (!error && Array.isArray(data) && data.length > 0) {
            const mapped = data.map(row => ({
              id: row.id,
              track: row.track,
              type: row.type || "module",
              code: row.code || `MOD-${String(row.order_num).padStart(2, "0")}`,
              orderNum: Number(row.order_num) || 1,
              title: row.title,
              subtitle: row.subtitle || "",
              duration: row.duration || "45 Menit",
              summary: row.summary || "",
              docUrl: row.doc_url || "",
              docName: row.doc_name || `${row.title}.pdf`,
              docSize: row.doc_size || "PDF Dokumen",
              videoUrl: row.video_url || "",
              questions: Array.isArray(row.questions) ? row.questions : (typeof row.questions === "string" ? JSON.parse(row.questions || "[]") : []),
              isFromCloud: true
            }));
            try {
              localStorage.setItem(cacheKey, JSON.stringify(mapped));
            } catch (e) {}
            return mapped;
          }
        } catch (err) {
          console.warn(`Supabase lms_items (${t}) query fallback to local:`, err);
        }
      }

      // 2. Fallback: Ambil dari localStorage
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}

      // 3. Fallback: Gunakan Default Seed Data
      const defaults = this.getDefaultLmsItems(t);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(defaults));
      } catch (e) {}
      return defaults;
    },

    async saveLmsItem(item) {
      if (!item || !item.track) return null;
      const t = item.track.toLowerCase();
      const cacheKey = `arutala_lms_cache_${t}`;

      const payload = {
        id: item.id || `${t}-item-${Date.now()}`,
        track: t,
        type: item.type || "module",
        code: item.code || (item.type === "quiz" ? "KUIS-01" : "MOD-01"),
        orderNum: Number(item.orderNum) || 1,
        title: item.title || "Judul Modul Baru",
        subtitle: item.subtitle || "",
        duration: item.duration || "45 Menit",
        summary: item.summary || "",
        docUrl: item.docUrl || "",
        docName: item.docName || `${item.title || "Modul"}.pdf`,
        docSize: item.docSize || "PDF Dokumen",
        videoUrl: item.videoUrl || "",
        questions: Array.isArray(item.questions) ? item.questions : []
      };

      // 1. Simpan ke Local Cache
      let currentItems = await this.fetchLmsItems(t);
      const existingIdx = currentItems.findIndex(i => String(i.id) === String(payload.id));
      if (existingIdx >= 0) {
        currentItems[existingIdx] = { ...currentItems[existingIdx], ...payload };
      } else {
        currentItems.push(payload);
      }
      currentItems.sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0));
      try {
        localStorage.setItem(cacheKey, JSON.stringify(currentItems));
      } catch (e) {}

      // 2. Simpan ke Supabase jika terhubung
      if (client) {
        try {
          const dbRow = {
            id: payload.id,
            track: payload.track,
            type: payload.type,
            code: payload.code,
            order_num: payload.orderNum,
            title: payload.title,
            subtitle: payload.subtitle,
            duration: payload.duration,
            summary: payload.summary,
            doc_url: payload.docUrl,
            doc_name: payload.docName,
            doc_size: payload.docSize,
            video_url: payload.videoUrl,
            questions: payload.questions
          };
          await client.from("lms_items").upsert([dbRow]);
        } catch (err) {
          console.warn("Supabase upsert lms_item warning (saved locally):", err);
        }
      }

      return payload;
    },

    async deleteLmsItem(id, track) {
      if (!id || !track) return false;
      const t = track.toLowerCase();
      const cacheKey = `arutala_lms_cache_${t}`;

      let currentItems = await this.fetchLmsItems(t);
      currentItems = currentItems.filter(i => String(i.id) !== String(id));
      // Re-index order numbers
      currentItems.forEach((item, idx) => {
        item.orderNum = idx + 1;
        if (item.type !== "quiz" && !item.code.startsWith("KUIS")) {
          item.code = `MOD-${String(idx + 1).padStart(2, "0")}`;
        }
      });

      try {
        localStorage.setItem(cacheKey, JSON.stringify(currentItems));
      } catch (e) {}

      if (client) {
        try {
          await client.from("lms_items").delete().eq("id", id);
        } catch (err) {
          console.warn("Supabase delete lms_item warning:", err);
        }
      }

      return true;
    },

    async resetLmsTrackToDefault(track) {
      const t = (track || "karsa").toLowerCase();
      const cacheKey = `arutala_lms_cache_${t}`;
      const defaults = this.getDefaultLmsItems(t);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(defaults));
      } catch (e) {}
      return defaults;
    }
  };

  // Ekspos ke global window
  window.ArutalaDB = ArutalaDB;
  window.formatRelativeTime = formatRelativeTime;
  window.formatDisplayDate = formatDisplayDate;
})();
