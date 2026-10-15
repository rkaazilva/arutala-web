/**
 * ARUTALA - Data Awal & Kurasi Konten
 * Berisi dataset artikel, video kurasi, 7 modul pembelajaran, kuis, dan data Q&A
 */

const ARUTALA_DATA = {
  // 1. DATASET ARTIKEL LITERASI (Inspirasi Malala Fund, Gen-U Stories & Pancawala)
  articles: [
    {
      id: "art-1",
      title: "Menguji Keadilan vs Kesetaraan Gender di Ruang Publik: Refleksi Transportasi Kota",
      category: "bersuara",
      categoryLabel: "Bersuara (Gender)",
      themeColor: "coral",
      accentColor: "#FF64C5",
      accentBg: "#FFF0F9",
      coverImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
      quoteHighlight: "Keadilan bukan memberi setiap orang ukuran sepatu sama, melainkan yang pas dengan kakinya.",
      author: "Nuzhatul Hilawah",
      authorRole: "Fasilitator Pemuda UIN Bandung",
      date: "12 Oktober 2026",
      readTime: "5 menit baca",
      summary: "Memahami perbedaan mendasar antara perlakuan sama rata (equality) dengan perlakuan adil sesuai kebutuhan spesifik (equity) pada ruang aman publik.",
      content: `
        <p>Sering kali diskursus mengenai gender berhenti pada asumsi sederhana: "kesetaraan berarti memperlakukan laki-laki dan perempuan dengan cara yang persis sama tanpa pembedaan". Namun, realitas sosial di lapangan menunjukkan bahwa perlakuan yang sama persis tidak otomatis menghadirkan rasa aman dan keadilan.</p>
        
        <h3>Kesetaraan (Equality) vs Keadilan (Equity)</h3>
        <p>Dalam konteks fasilitas publik seperti transportasi massal, gerbong khusus perempuan atau ruang laktasi bukanlah bentuk diskriminasi terhadap laki-laki, melainkan langkah afirmasi (equity) untuk memitigasi kerentanan berbasis data empiris pelecehan seksual. Keadilan gender menuntut kita memetakan titik berangkat dan hambatan struktural yang dihadapi masing-masing individu sebelum menentukan kebijakan.</p>
        
        <blockquote>"Keadilan bukan memberi setiap orang sepatu dengan nomor yang sama, melainkan memberikan sepatu yang pas dengan ukuran kaki masing-masing."</blockquote>

        <h3>Menghapus Polarisasi: Peran Laki-laki sebagai Sekutu (Allies)</h3>
        <p>Edukasi kesetaraan gender bukanlah ajang persaingan antar-gender. Justru, pemuda laki-laki memiliki peran yang sangat krusial sebagai sekutu (allies) dalam menciptakan norma pergaulan kampus dan komunitas yang menghargai martabat manusia, menolak 'locker room talk' yang merendahkan, serta bersama-sama menumbuhkan empati aktif.</p>
      `,
      tags: ["Keadilan Gender", "Ruang Publik", "Edukasi Pemuda"]
    },
    {
      id: "art-2",
      title: "Spirit Rahmah dan Moderasi Beragama: Membina Dialog Lintas Iman Mahasiswa",
      category: "pandai",
      categoryLabel: "PANDAI (Moderasi)",
      themeColor: "emerald",
      accentColor: "#66BB6A",
      accentBg: "#F1F9F2",
      coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
      quoteHighlight: "Kesalehan beragama senantiasa berbanding lurus dengan kehangatan dalam merangkul martabat sesama.",
      author: "Alfath Fadillah Ridwannur",
      authorRole: "Inisiator ARUTALA",
      date: "08 Oktober 2026",
      readTime: "6 menit baca",
      summary: "Bagaimana nilai-nilai luhur keagamaan seperti rahmah (kasih sayang) dan martabat kemanusiaan menjadi fondasi utama dalam merajut keberagaman anak bangsa.",
      content: `
        <p>Agama diturunkan sebagai rahmat bagi semesta alam (rahmatan lil 'alamin). Prinsip ini menempatkan penghormatan terhadap martabat manusia (karamah insaniyyah) di atas segala sekat identitas formal. Di tengah arus polarisasi media sosial, mahasiswa dan pemuda dipanggil untuk menjadi duta perdamaian yang mengedepankan dialog konstruktif.</p>

        <h3>Empat Indikator Moderasi Beragama dalam Praktik Nyata</h3>
        <p>Kementerian Agama merumuskan empat pilar moderasi yang sangat aplikatif bagi pemuda kampus:</p>
        <ul>
          <li><strong>Komitmen Kebangsaan:</strong> Menjaga konsensus kebangsaan dan persatuan di atas kebinekaan.</li>
          <li><strong>Toleransi:</strong> Menghormati perbedaan keyakinan tanpa harus mengorbankan keyakinan sendiri.</li>
          <li><strong>Anti-Kekerasan:</strong> Menolak segala bentuk pemaksaan kehendak, intimidasi verbal, maupun kekerasan fisik.</li>
          <li><strong>Akomodatif terhadap Budaya Lokal:</strong> Menghargai kearifan tradisi nusantara yang selaras dengan kemaslahatan bersama.</li>
        </ul>

        <p>Melalui dialog damai, kita membuktikan bahwa kesalehan beragama senantiasa berbanding lurus dengan kepedulian sosial dan kehangatan dalam merangkul sesama.</p>
      `,
      tags: ["Moderasi Beragama", "Toleransi", "Dialog Damai"]
    },
    {
      id: "art-3",
      title: "Kearifan Budaya Lokal 'Silih Asah, Silih Asih, Silih Asuh' dalam Resolusi Konflik Sebaya",
      category: "cerdas",
      categoryLabel: "CERDAS (Budaya)",
      themeColor: "blue",
      accentColor: "#8ABCEE",
      accentBg: "#F0F6FD",
      coverImage: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80",
      quoteHighlight: "Mengubah budaya saling menjatuhkan di jagat digital menjadi tradisi saling membesarkan hati.",
      author: "M. Rifqi Nurhidayat",
      authorRole: "Tim Riset Sosial UIN Bandung",
      date: "04 Oktober 2026",
      readTime: "4 menit baca",
      summary: "Menggali filosofi kesundaan sebagai landasan etis dalam membangun komunikasi inklusif dan ruang aman di lingkungan organisasi kepemudaan.",
      content: `
        <p>Masyarakat Jawa Barat mewarisi pilar kebijaksanaan luhur yang dikenal sebagai <em>Silih Asah</em> (saling mencerdaskan dan mempertajam pikiran), <em>Silih Asih</em> (saling mengasihi dengan kelembutan hati), dan <em>Silih Asuh</em> (saling menjaga, membimbing, dan mendampingi).</p>

        <h3>Menghidupkan Budaya Lokal di Era Digital</h3>
        <p>Di masa kini, friksi antar pemuda sering kali dipicu oleh gesekan di dunia maya. Mengadopsi kearifan lokal ini berarti mengubah pola perdebatan yang saling menjatuhkan menjadi budaya diskusi yang saling membesarkan hati. Ketika ada teman sebaya yang terpuruk atau merasa tidak berdaya, ekosistem pemuda hadir untuk mengasuh dan menguatkan, bukan menghakimi.</p>
      `,
      tags: ["Kearifan Lokal", "Budaya Sunda", "Resolusi Konflik"]
    },
    {
      id: "art-4",
      title: "Membangun Batasan Diri dan Relasi Sehat: Menghindari Modus di Era Digital",
      category: "berdaya",
      categoryLabel: "BERDAYA (Ruang Aman)",
      themeColor: "amber",
      accentColor: "#2F4F87",
      accentBg: "#EEF3FA",
      coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
      quoteHighlight: "Menetapkan batasan pribadi bukan ketidaksopanan, melainkan bentuk tertinggi penghargaan diri.",
      author: "Wanda Faring",
      authorRole: "Kontributor Pemuda",
      date: "29 September 2026",
      readTime: "5 menit baca",
      summary: "Memahami pentingnya persetujuan (consent), batasan pribadi (boundaries), dan langkah perlindungan diri dari kekerasan berbasis gender online (KBGO).",
      content: `
        <p>Ruang digital membuka peluang tak terbatas bagi pemuda untuk berjejaring dan berkarya. Namun di sisi lain, ketidakmampuan mengenali batas pribadi dan manipulasi kepercayaan kerap kali menyeret pemuda ke dalam relasi yang toksik maupun modus penipuan online.</p>

        <h3>Prinsip Mengenali Batasan Pribadi (Personal Boundaries)</h3>
        <p>Setiap orang memiliki hak penuh atas ruang fisik, emosional, dan informasi digitalnya. Menetapkan batasan bukanlah bentuk ketidaksopanan, melainkan bentuk tertinggi dari penghargaan diri (self-respect). Konsen harus bersifat sadar, suka rela, dapat ditarik kapan saja, dan tidak di bawah paksaan manipulatif.</p>

        <p>Jika kamu merasa tidak nyaman terhadap percakapan daring atau tuntutan foto pribadi di luar kesepakatan, kamu berhak menolak secara tegas dan mencari pertolongan kepada fasilitator sebaya atau lembaga pendamping terpercaya.</p>
      `,
      tags: ["Ruang Aman", "Keamanan Digital", "Relasi Sehat"]
    },
    {
      id: "art-5",
      title: "Dari Santri Menjadi Inovator Sosial: Kisah Sukses Menggerakkan Edukasi Inklusif di Desa",
      category: "bersuara",
      categoryLabel: "Bersuara (Aksi Nyata)",
      themeColor: "purple",
      accentColor: "#FF64C5",
      accentBg: "#FFF0F9",
      coverImage: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=800&q=80",
      quoteHighlight: "Perubahan nyata terjadi saat pemuda tidak menunggu panggung, melainkan merangkul desanya.",
      author: "Siti Rahmawati",
      authorRole: "Alumni Circle ARUTALA 2025",
      date: "24 September 2026",
      readTime: "7 menit baca",
      summary: "Bagaimana pelatihan modul kepemimpinan dan kesetaraan gender mendorong santriwati memimpin kelas literasi digital gratis bagi 150 remaja perempuan pedesaan.",
      content: `
        <p>Memadukan wawasan keagamaan yang mendalam dengan kesadaran gender kontemporer telah membuktikan bahwa santriwati memiliki kapasitas transformatif luar biasa di tengah masyarakat.</p>

        <h3>Langkah Awal: Menghadirkan Ruang Belajar Ramah Remaja</h3>
        <p>Bermula dari diskusi kecil di serambi pesantren, Rahmawati menginisiasi program pendampingan sebaya mingguan untuk membantu remaja perempuan yang terancam putus sekolah agar memiliki keterampilan literasi dan pemahaman hak asasi dasar.</p>
      `,
      tags: ["Santri Inovator", "Pendidikan Desa", "Inklusi Sosial"]
    },
    {
      id: "art-6",
      title: "Menepis Stigma 'Peran Domestik': Kolaborasi Berkeadilan dalam Kemitraan Keluarga Muda",
      category: "pandai",
      categoryLabel: "PANDAI (Keluarga Sakinah)",
      themeColor: "teal",
      accentColor: "#66BB6A",
      accentBg: "#F1F9F2",
      coverImage: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
      quoteHighlight: "Membangun rumah tangga berkeadilan adalah ibadah sosial yang memuliakan kedua belah pihak.",
      author: "Ahmad Fauzan & Larasati",
      authorRole: "Pegiat Parenting Inklusif",
      date: "18 September 2026",
      readTime: "5 menit baca",
      summary: "Mengupas konsep mubadalah (kesalingan) dalam pembagian peran rumah tangga yang adil, suportif, dan selaras dengan sunnah kemitraan keluarga.",
      content: `
        <p>Konsep kesalingan (mubadalah) mengingatkan kita bahwa kebahagiaan keluarga berakar dari gotong royong dan apresiasi setara antara suami dan istri tanpa ada salah satu pihak yang merasa dieksploitasi tenaganya.</p>
      `,
      tags: ["Keluarga Sakinah", "Mubadalah", "Kesetaraan Gender"]
    }
  ],

  // 2. DATASET KURASI VIDEO EDUKASI (Pojok Video / Inspirasi VIRAL Pancawala)
  videos: [
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
    }
  ],

  // 3. PUSTAKA 7 MODUL PEMBELAJARAN ARUTALA (Sesuai Proposal OASE III)
  modules: [
    {
      id: 1,
      code: "MOD-01",
      title: "Mengenali Diri dan Potensi",
      subtitle: "Fondasi Self-Love, Identifikasi Bakat, dan Perencanaan Masa Depan",
      duration: "45 Menit",
      themeColor: "#2F4F87",
      summary: "Refleksi mendalam untuk mengenali kekuatan, hambatan psikologis, serta membangun penerimaan diri tanpa terjebak insecurity.",
      content: `
        <h4>1.1 Mengapa Mengenal Diri Itu Penting?</h4>
        <p>Banyak pemuda mengalami kebingungan arah hidup (quarter-life crisis) karena belum tuntas mengenali apa yang menjadi kekuatan dan kebutuhan batin mereka. Tahap 'Belajar' menempatkan kesadaran diri (self-awareness) sebagai anak tangga pertama menuju kepemimpinan.</p>
        
        <h4>1.2 Praktik Self-Compassion</h4>
        <p>Mencintai diri bukan berarti egois. Ini adalah kesediaan memperlakukan diri sendiri dengan kebaikan yang sama seperti kita memperlakukan seorang sahabat yang sedang gagal atau terluka.</p>
        
        <h4>1.3 Lembar Kerja Refleksi: Pohon Potensi</h4>
        <p>Identifikasi 3 akar (nilai hidup yang kamu yakini), batang (keterampilan utamamu), daun (kebiasaan harian), dan buah (dampak yang ingin kamu ciptakan bagi sekitarmu).</p>
      `,
      quiz: {
        question: "Apa tujuan utama dari proses self-compassion dalam tahap mengenali diri?",
        options: [
          "Mencari alasan untuk membenarkan segala kesalahan tanpa perlu berbenah",
          "Menerima kekurangan diri dengan kebaikan hati sebagai fondasi untuk bertumbuh positif",
          "Membandingkan kelemahan diri dengan kesuksesan orang lain agar merasa tertantang",
          "Mengabaikan kritik membangun dari orang lain demi menjaga rasa nyaman"
        ],
        correctIndex: 1,
        explanation: "Self-compassion adalah sikap welas asih pada diri sendiri saat menghadapi kesulitan, mengakui ketidaksempurnaan sebagai bagian manusiawi, lalu memperbaikinya dengan cinta bukan kebencian diri."
      }
    },
    {
      id: 2,
      code: "MOD-02",
      title: "Nilai Keagamaan, Keadilan, dan Martabat Manusia",
      subtitle: "Prinsip Rahmah, Keadilan Hakiki, dan Tanggung Jawab Moral Pemuda",
      duration: "50 Menit",
      themeColor: "#8ABCEE",
      summary: "Membumikan ajaran agama agar berwujud nyata dalam kepedulian sosial, keadilan, dan pembelaan terhadap kelompok yang rentan.",
      content: `
        <h4>2.1 Esensi Karamah Insaniyyah (Kemuliaan Manusia)</h4>
        <p>Tuhan menganugerahkan kemuliaan kepada seluruh manusia tanpa memandang jenis kelamin, ras, maupun latar belakang sosial. Menghargai orang lain adalah manifestasi langsung dari penghormatan kita kepada Sang Pencipta.</p>

        <h4>2.2 Keadilan Sosial sebagai Perintah Agama</h4>
        <p>Beragama tidak cukup hanya dalam ruang ibadah ritual (mahdhah), tetapi menuntut ibadah sosial (muamalah) berupa penegakan keadilan, pembebasan dari kezaliman, dan perlindungan terhadap kaum yang terpinggirkan (mustadh'afin).</p>
      `,
      quiz: {
        question: "Prinsip 'Karamah Insaniyyah' dalam nilai keagamaan mengandung arti bahwa...",
        options: [
          "Penghormatan martabat manusia hanya berlaku untuk anggota komunitas sendiri",
          "Setiap manusia memiliki martabat bawaan yang wajib dihormati dan dilindungi dari segala penindasan",
          "Martabat manusia dinilai berdasarkan status ekonomi dan jabatan formal di masyarakat",
          "Keadilan hanya perlu ditegakkan jika kelompok mayoritas menyetujuinya"
        ],
        correctIndex: 1,
        explanation: "Karamah Insaniyyah adalah doktrin hak asasi berbasis teologis bahwa seluruh anak cucu Adam dianugerahi martabat suci yang melarang segala bentuk perendahan dan kekerasan."
      }
    },
    {
      id: 3,
      code: "MOD-03",
      title: "Moderasi Beragama dalam Kehidupan Pemuda",
      subtitle: "Komitmen Kebangsaan, Toleransi Aktif, dan Resolusi Tanpa Kekerasan",
      duration: "60 Menit",
      themeColor: "#66BB6A",
      summary: "Menerapkan 4 indikator moderasi beragama dalam kehidupan kampus dan masyarakat, membendung ekstremisme serta ujaran kebencian.",
      content: `
        <h4>3.1 Apa itu Sikap Moderat (Wasathiyah)?</h4>
        <p>Moderat bukanlah kompromi akidah atau sikap plin-plan, melainkan sikap adil dan seimbang (tawazun) di antara dua kutub ekstrem: ekstremisme kaku (tatharruf) dan permisifisme tanpa nilai.</p>

        <h4>3.2 Praktik Dialog Konstruktif</h4>
        <p>Ketika menghadapi pandangan yang berbeda, seorang pemuda moderat tidak merespons dengan stigma atau vonis sesat, melainkan membuka ruang tabayyun (klarifikasi) dan dialog yang bermartabat.</p>
      `,
      quiz: {
        question: "Manakah di bawah ini yang BUKAN merupakan indikator moderasi beragama menurut Kementerian Agama RI?",
        options: [
          "Komitmen kebangsaan terhadap Pancasila dan NKRI",
          "Toleransi terhadap perbedaan keyakinan dan ekspresi keagamaan",
          "Penolakan terhadap segala bentuk kekerasan fisik dan verbal",
          "Menyeragamkan seluruh keyakinan agama menjadi satu bentuk ibadah yang sama"
        ],
        correctIndex: 3,
        explanation: "Moderasi beragama tidak pernah bertujuan menyeragamkan agama, melainkan mengelola keragaman dengan sikap saling menghargai dan rukun dalam bingkai kebangsaan."
      }
    },
    {
      id: 4,
      code: "MOD-04",
      title: "Kesetaraan Gender dan Mendobrak Stereotip",
      subtitle: "Mengenali Bias, Peran Kaku, dan Memperluas Kesempatan Pemuda",
      duration: "55 Menit",
      themeColor: "#FF64C5",
      summary: "Membedah konstruksi sosial yang membatasi mimpi pemuda, membedakan seks vs gender, dan membangun budaya kemitraan yang setara.",
      content: `
        <h4>4.1 Membedakan Seks dan Gender</h4>
        <p><strong>Seks</strong> merujuk pada perbedaan biologis yang kodrati dan universal (seperti kemampuan perempuan mengandung dan melahirkan). Sedangkan <strong>Gender</strong> adalah peran, sifat, dan tanggung jawab yang dibentuk oleh budaya masyarakat yang bisa berubah dari masa ke masa.</p>

        <h4>4.2 Bahaya Stereotip Gender</h4>
        <p>Stereotip bahwa 'laki-laki tidak boleh menangis/mengekspresikan kesedihan' memicu krisis kesehatan mental pada pemuda. Sebaliknya, stereotip bahwa 'perempuan tidak cocok menjadi pemimpin' membatasi potensi separuh populasi bangsa. ARUTALA mendorong ruang tumbuh di mana setiap orang dinilai dari integritas dan kompetensinya.</p>
      `,
      quiz: {
        question: "Mengapa pembedaan antara 'seks' dan 'gender' sangat krusial dalam kajian kesetaraan?",
        options: [
          "Agar kita bisa menolak seluruh ketentuan biologis alamiah manusia",
          "Agar kita memahami bahwa peran sosial yang diskriminatif adalah buatan manusia yang bisa diubah demi keadilan",
          "Untuk membuktikan bahwa perempuan lebih unggul daripada laki-laki di segala aspek",
          "Hanya sekadar istilah akademis tanpa ada dampaknya bagi kehidupan nyata"
        ],
        correctIndex: 1,
        explanation: "Dengan memahami gender sebagai konstruksi sosial, kita menyadari bahwa ketidakadilan peran (seperti pembatasan hak belajar atau beban ganda) bukanlah takdir kodrati, melainkan dapat direformasi menuju keadilan."
      }
    },
    {
      id: 5,
      code: "MOD-05",
      title: "Komunikasi Inklusif dan Ruang Aman",
      subtitle: "Mendengar Aktif, Konsen, Batasan Pribadi, dan Anti-Bullying",
      duration: "50 Menit",
      themeColor: "#2F4F87",
      summary: "Menciptakan iklim komunitas yang bebas dari perundungan, pelecehan, dan penghakiman, dengan mengedepankan etika mendengar empatik.",
      content: `
        <h4>5.1 Elemen Ruang Aman (Safe Space)</h4>
        <p>Ruang aman tercipta jika memenuhi 3 pilar: kerahasiaan terjaga (confidentiality), tidak menghakimi (non-judgmental), dan kesetaraan kesempatan berbicara bagi yang pemalu maupun yang vokal.</p>

        <h4>5.2 Memahami Batasan (Boundaries) & Konsen</h4>
        <p>Konsen berlaku dalam interaksi fisik, verbal, hingga privasi percakapan. Jika ada teman yang menolak menceritakan masalah pribadinya, kita wajib menghormati batasan tersebut tanpa memaksa.</p>
      `,
      quiz: {
        question: "Tindakan manakah yang mencerminkan penerapan prinsip 'Mendengar Aktif' dalam fasilitasi sebaya?",
        options: [
          "Langsung memotong pembicaraan teman untuk segera memberikan nasihat menurut pengalaman kita",
          "Mendengarkan dengan penuh perhatian tanpa sibuk menyiapkan sanggahan di kepala, lalu memvalidasi perasaan teman",
          "Mencatat semua ucapan teman untuk kemudian dijadikan bahan gosip di kelompok lain",
          "Menyuruh teman untuk berhenti menangis karena menganggap masalahnya sepele"
        ],
        correctIndex: 1,
        explanation: "Mendengar aktif mengutamakan kehadiran utuh, empati, serta memvalidasi pengalaman orang lain sebelum memberikan pertimbangan solusi secara bijak."
      }
    },
    {
      id: 6,
      code: "MOD-06",
      title: "Kolaborasi, Kepemimpinan, dan Partisipasi",
      subtitle: "Kerja Tim Inklusif, Pengambilan Keputusan Bersama, dan Resolusi Konflik",
      duration: "55 Menit",
      themeColor: "#8ABCEE",
      summary: "Keterampilan kepemimpinan partisipatif, teknik fasilitasi musyawarah yang menghargai suara minoritas, dan kepemimpinan berhati pelayan.",
      content: `
        <h4>6.1 Kepemimpinan Partisipatif vs Otoriter</h4>
        <p>Pemimpin yang tangguh di era digital bukan yang paling dominan memerintah, melainkan yang mampu memfasilitasi setiap anggota tim untuk berkontribusi dengan kemampuan terbaiknya.</p>

        <h4>6.2 Musyawarah Inklusif di Organisasi</h4>
        <p>Sering kali dalam rapat organisasi kampus, suara mahasiswi atau anggota baru terabaikan. Pemimpin ARUTALA dilatih menggunakan teknik 'Round-Robin' dan 'Silent Brainstorming' agar semua suara terakomodir.</p>
      `,
      quiz: {
        question: "Ciri utama dari gaya kepemimpinan partisipatif yang inklusif adalah...",
        options: [
          "Keputusan selalu diambil sepihak oleh ketua demi efisiensi waktu",
          "Membuka ruang bagi semua anggota untuk urun rembuk dan mempertimbangkan dampak keputusan bagi kelompok terdampak",
          "Menghindari pembuatan keputusan sama sekali agar tidak ada yang tersinggung",
          "Menyerahkan seluruh beban kerja kepada anggota tanpa arahan yang jelas"
        ],
        correctIndex: 1,
        explanation: "Kepemimpinan partisipatif mengedepankan musyawarah bermakna, transparansi, serta pelibatan aktif seluruh anggota tim dalam merumuskan arah bersama."
      }
    },
    {
      id: 7,
      code: "MOD-07",
      title: "Desain Aksi Sosial Berdampak",
      subtitle: "Problem Tree Analysis, Pemetaan Pemangku Kepentingan, dan Mini-Proposal",
      duration: "65 Menit",
      themeColor: "#66BB6A",
      summary: "Menerjemahkan seluruh wawasan modul 1-6 menjadi aksi nyata di kampus atau lingkungan sekitar melalui perancangan proposal mini.",
      content: `
        <h4>7.1 Mengapa Harus Aksi Nyata (ARUTALA Action)?</h4>
        <p>Pembelajaran tanpa aksi hanya akan menjadi retorika. Siklus ARUTALA mewajibkan setiap lingkaran pemuda melahirkan intervensi sosial kecil namun solutif dan berkelanjutan.</p>

        <h4>7.2 Matriks Desain Aksi</h4>
        <p>Gunakan rumus <strong>5W + 1H Solutif:</strong><br>
        1. Masalah spesifik yang ditemukan di lingkungan sekitar.<br>
        2. Siapa kelompok yang paling dirugikan?<br>
        3. Apa akar penyebab masalahnya?<br>
        4. Kegiatan nyata apa yang bisa diselesaikan dalam 2–4 minggu?<br>
        5. Siapa mitra kolaborasi (BEM, Rohis, Karang Taruna, Komunitas)?<br>
        6. Apa indikator keberhasilan yang bisa diukur?</p>
      `,
      quiz: {
        question: "Langkah pertama yang paling tepat sebelum merancang sebuah aksi sosial di masyarakat adalah...",
        options: [
          "Langsung memesan spanduk dan mengadakan acara seremonial besar",
          "Melakukan asesmen pemetaan kebutuhan dan akar masalah bersama kelompok sasaran",
          "Menentukan anggaran biaya setinggi-tingginya agar terlihat profesional",
          "Mengasumsikan bahwa kita sudah tahu semua masalah masyarakat tanpa perlu bertanya"
        ],
        correctIndex: 1,
        explanation: "Aksi sosial yang efektif selalu berakar dari pemetaan empiris (needs assessment) agar solusi yang ditawarkan benar-benar menjawab kebutuhan riil masyarakat."
      }
    }
  ],

  // 4. FORUM TANYA JAWAB (Q&A Corner)
  qaList: [
    {
      id: "qa-1",
      author: "Fajar_UIN23",
      question: "Bagaimana cara menyikapi teman sekelompok organisasi yang sering melontarkan lelucon seksis di grup WhatsApp?",
      tags: ["Ruang Aman", "Etika Komunikasi"],
      answersCount: 2,
      upvotes: 18,
      date: "2 hari lalu",
      bestAnswer: {
        author: "Nuzhatul Hilawah (Fasilitator)",
        content: "Gunakan pendekatan 'Call-In' secara santun di jalur pribadi (japri) terlebih dahulu. Jelaskan bahwa lelucon tersebut membuat situasi tidak nyaman tanpa harus menyerang karakternya di depan umum. Jika berulang, bawa ke forum evaluasi organisasi dengan menegaskan kesepakatan kode etik ruang aman bersama."
      }
    },
    {
      id: "qa-2",
      author: "Salma_Kreatif",
      question: "Apakah laki-laki boleh mendaftar menjadi Tutor Sebaya di ARUTALA Circle?",
      tags: ["Pendaftaran", "Tutor Sebaya"],
      answersCount: 1,
      upvotes: 24,
      date: "3 hari lalu",
      bestAnswer: {
        author: "Tim Seleksi ARUTALA",
        content: "Sangat diperbolehkan dan sangat dianjurkan! ARUTALA adalah ruang inklusif lintas gender. Keterlibatan pemuda laki-laki sebagai fasilitator sebaya justru menjadi kunci penting dalam membangun budaya saling menghargai dan kemitraan setara."
      }
    },
    {
      id: "qa-3",
      author: "Bayu_Bandung",
      question: "Apa bedanya pendaftaran 'Peserta Belajar' dengan 'Tutor Sebaya / Konselor Pemuda' di formulir bawah?",
      tags: ["Info Circle", "Panduan"],
      answersCount: 1,
      upvotes: 15,
      date: "5 hari lalu",
      bestAnswer: {
        author: "M. Rifqi (Admin ARUTALA)",
        content: "Peserta Belajar (Mentee) fokus pada proses belajar mandiri 7 modul dan didampingi dalam kelompok kecil 5-8 orang. Sedangkan Tutor Sebaya adalah pemuda yang siap dilatih modul fasilitasi untuk mendampingi satu kelompok lingkaran sebaya selama 4 minggu pertemuan."
      }
    }
  ],

  // 5. SHOWCASE CONTOH ARUTALA ACTION (Dokumentasi Aksi Nyata Komunitas - WePresent Style)
  actions: [
    {
      id: "act-1",
      circleName: "Circle Arutala Pasundan",
      title: "Pedoman Rapat Mahasiswa Inklusif & Tata Tertib Ruang Aman Tanpa Pelecehan",
      location: "Kampus UIN SGD Bandung",
      impact: "Telah diadopsi oleh 4 Himpunan Mahasiswa Jurusan (HMJ)",
      badge: "Inklusivitas Kampus",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85",
      description: "Menyusun pakta integritas pertemuan ormawa yang menjamin keterlibatan setara, pembagian tugas tanpa bias gender, dan mekanisme pelaporan aman.",
      date: "12 Oktober 2026",
      participants: "85 Mahasiswa",
      submitter: "Alfath F. & Kawan Circle"
    },
    {
      id: "act-2",
      circleName: "Karang Taruna Cibiru Harmoni",
      title: "Workshop Literasi Digital: Menghindari Modus & Hoaks bagi Remaja",
      location: "Kelurahan Cipadung, Bandung Timur",
      impact: "Menjangkau 45 remaja perempuan & laki-laki",
      badge: "Literasi Digital",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=85",
      description: "Pelatihan simulasi mengenali modus manipulasi daring, batasan konsen percakapan media sosial, dan etika menyebarkan konten perdamaian.",
      date: "5 Oktober 2026",
      participants: "45 Remaja",
      submitter: "Rian Hidayat (Ketua Pemuda)"
    },
    {
      id: "act-3",
      circleName: "Circle Priangan Timur",
      title: "Pojok Baca Inklusif & Dialog Lintas Tradisi Pemuda Pedesaan",
      location: "Desa Ciburial, Kab. Bandung",
      impact: "Menyediakan 120 buku & ruang kumpul ramah pemuda desa",
      badge: "Pemberdayaan Desa",
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=85",
      description: "Mengubah balai pertemuan menjadi ruang literasi publik bersama pemuda desa untuk mendiskusikan nilai kearifan Silih Asah, Silih Asih, Silih Asuh.",
      date: "28 September 2026",
      participants: "110 Warga & Pemuda",
      submitter: "Nuzhatul & Relawan Desa"
    },
    {
      id: "act-4",
      circleName: "Kolektif Remaja Welas Asih",
      title: "Konseling Sebaya & Sosialisasi Anti-Bullying Berbasis Welas Asih",
      location: "SMKN 1 Katapang, Bandung",
      impact: "Melatih 24 konselor sebaya tingkat sekolah menengah",
      badge: "Kesehatan Mental",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85",
      description: "Pembentukan ruang curhat aman di sekolah dengan panduan empati aktif guna mencegah perundungan dan kekerasan verbal antarpelajar.",
      date: "20 September 2026",
      participants: "24 Konselor & 150 Siswa",
      submitter: "Salma Aulia (Fasilitator Sebaya)"
    },
    {
      id: "act-5",
      circleName: "Aliansi Mahasiswa Lintas Iman",
      title: "Kemah Dialog Harmoni: Merajut Keberagaman Lewat Kerja Bakti",
      location: "Kaki Gunung Manglayang, Sumedang",
      impact: "Diikuti 60 pemuda dari 5 organisasi kemahasiswaan",
      badge: "Moderasi Beragama",
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=85",
      description: "Inisiatif berkemah bersama dengan agenda bedah toleransi beragama dan aksi penanaman bibit pohon di lereng kritis.",
      date: "14 September 2026",
      participants: "60 Mahasiswa",
      submitter: "Fajar Nugraha (Koordinator Aksi)"
    },
    {
      id: "act-6",
      circleName: "Lingkar Belajar Putri Tangguh",
      title: "Kelas Advokasi Kemandirian & Keterampilan Coding bagi Santriwati",
      location: "Pondok Pesantren Al-Ihsan, Cibiru",
      impact: "40 santriwati menyelesaikan modul literasi digital dasar",
      badge: "Kemandirian Pemuda",
      image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=85",
      description: "Pelatihan pengenalan pembuatan website sederhana dan penulisan artikel advokasi agar santriwati memiliki medium bersuara di internet.",
      date: "05 September 2026",
      participants: "40 Santriwati",
      submitter: "Siti Rahmawati (Alumni ARUTALA)"
    }
  ],

  // 6. DUKUNGAN DONASI GERAKAN PEMUDA
  donations: [
    {
      id: "don-1",
      donorName: "Hamba Allah (Alumni UIN)",
      amount: 100000,
      targetPackage: "Paket Pendampingan 2 Mentee Sebaya",
      message: "Semoga gerakan ruang aman ini terus meluas dan memberkahi adik-adik mahasiswa.",
      time: "10 menit lalu",
      isAnonymous: true
    },
    {
      id: "don-2",
      donorName: "Siti Rahmawati",
      amount: 50000,
      targetPackage: "Paket Ruang Belajar Modul",
      message: "Keren banget gagasannya! Semangat untuk tim OASE III PTKIN.",
      time: "1 jam lalu",
      isAnonymous: false
    },
    {
      id: "don-3",
      donorName: "Fajar Nugraha",
      amount: 25000,
      targetPackage: "Dukungan Aksi Sosial Desa",
      message: "Sedekah pemuda untuk masa depan yang lebih adil dan toleran.",
      time: "3 jam lalu",
      isAnonymous: false
    }
  ],

  // 6. DIREKTORI RUJUKAN BANTUAN RESMI (Guardrail Layanan Darurat)
  referrals: [
    {
      name: "SAPA 129 (KemenPPPA)",
      type: "Layanan Pengaduan Perempuan & Anak RI",
      contact: "Hotline 129 / WhatsApp 08111-129-129",
      hours: "24 Jam Setiap Hari",
      desc: "Layanan resmi Kementerian Pemberdayaan Perempuan dan Perlindungan Anak untuk konsultasi darurat dan penanganan kekerasan."
    },
    {
      name: "Pusat Layanan Konseling Mahasiswa Kampus",
      type: "Konseling Psikologis Akademik",
      contact: "Gedung PKM Lt. 2 Kampus UIN SGD Bandung",
      hours: "Senin - Jumat (08.00 - 16.00 WIB)",
      desc: "Layanan konseling tatap muka bersama psikolog pendidikan untuk masalah kecemasan, akademik, dan penyesuaian diri."
    },
    {
      name: "Komnas Perempuan RI",
      type: "Lembaga Hak Asasi Manusia",
      contact: "Telp: (021) 3903963 / komnasperempuan.go.id",
      hours: "Hari Kerja",
      desc: "Lembaga independen penegakan hak asasi manusia dan pencegahan diskriminasi berbasis gender di Indonesia."
    }
  ]
};

// Ekspor ke window global untuk kemudahan prototipe
window.ARUTALA_DATA = ARUTALA_DATA;
