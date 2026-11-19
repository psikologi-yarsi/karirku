(function () {
  function initKarirKu() {
    // KarirKu | Tempelkan seluruh isi file ini ke tab JavaScript Gutenberg
    const app = document.getElementById('karirku-app');
    if (!app) console.warn('KarirKu: #karirku-app tidak ditemukan.');
    // TODO: Ganti dengan URL Web App Apps Script setelah di-deploy
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzmGE-gfMYeVSg11K5dLhvIiiG66lLFebVWtAFsqcABS6OUY5rtGgMO5fceyedc-K3d/exec';
    
    // ========== DATA ==========
    const SECTIONS = [
      { key:'R', name:'Realistic', icon:'🔧', desc:'Suka aktivitas fisik, alat, mesin, dan bekerja di luar ruangan', color:'var(--r)', fill:'var(--r-soft)' },
      { key:'I', name:'Investigative', icon:'🔬', desc:'Suka menganalisis, meneliti, dan memecahkan masalah kompleks', color:'var(--i)', fill:'var(--i-soft)' },
      { key:'A', name:'Artistic', icon:'🎨', desc:'Suka ekspresi kreatif, estetika, dan kebebasan berimajinasi', color:'var(--a)', fill:'var(--a-soft)' },
      { key:'S', name:'Social', icon:'🤝', desc:'Suka membantu, mengajar, dan berinteraksi dengan orang lain', color:'var(--s)', fill:'var(--s-soft)' },
      { key:'E', name:'Enterprising', icon:'🚀', desc:'Suka memimpin, mempengaruhi orang, dan menjalankan bisnis', color:'var(--e)', fill:'var(--e-soft)' },
      { key:'C', name:'Conventional', icon:'📊', desc:'Suka keteraturan, data, dan prosedur yang terstruktur', color:'var(--c)', fill:'var(--c-soft)' }
    ];
    
    const QUESTIONS = [
      // R
      { s:'R', q:'Saya menikmati pekerjaan yang menggunakan tangan seperti memperbaiki peralatan atau membangun sesuatu.' },
      { s:'R', q:'Saya lebih suka bekerja di luar ruangan daripada di dalam kantor.' },
      { s:'R', q:'Saya tertarik mempelajari cara kerja mesin atau peralatan teknis.' },
      { s:'R', q:'Saya suka kegiatan yang membutuhkan keterampilan fisik atau atletik.' },
      { s:'R', q:'Saya merasa puas ketika berhasil membuat atau memperbaiki sesuatu secara fisik.' },
      { s:'R', q:'Saya lebih nyaman bekerja dengan benda-benda konkret daripada ide-ide abstrak.' },
      { s:'R', q:'Saya tertarik pada bidang pertanian, kehutanan, atau konservasi alam.' },
      // I
      { s:'I', q:'Saya sangat suka menganalisis data dan mencari pola di dalamnya.' },
      { s:'I', q:'Saya tertarik melakukan riset atau eksperimen untuk menemukan jawaban baru.' },
      { s:'I', q:'Membaca artikel ilmiah atau buku pengetahuan adalah hal yang saya nikmati.' },
      { s:'I', q:'Saya sering bertanya "mengapa" dan ingin memahami bagaimana sesuatu bekerja.' },
      { s:'I', q:'Saya menyukai tantangan intelektual yang membutuhkan pemikiran mendalam.' },
      { s:'I', q:'Saya tertarik pada matematika, sains, atau pemrograman komputer.' },
      { s:'I', q:'Saya suka memecahkan teka-teki atau masalah yang kompleks.' },
      // A
      { s:'A', q:'Saya menikmati kegiatan kreatif seperti menggambar, menulis, atau bermain musik.' },
      { s:'A', q:'Saya lebih suka pekerjaan yang memberi saya kebebasan berekspresi.' },
      { s:'A', q:'Saya sangat memperhatikan estetika dan keindahan dalam kehidupan sehari-hari.' },
      { s:'A', q:'Saya mudah terinspirasi oleh seni, sastra, film, atau pertunjukan.' },
      { s:'A', q:'Saya suka menghasilkan sesuatu yang orisinal dan unik.' },
      { s:'A', q:'Saya merasa lingkungan kerja yang fleksibel dan kreatif sangat penting bagi saya.' },
      { s:'A', q:'Saya tertarik pada desain, fotografi, atau dunia fesyen.' },
      // S
      { s:'S', q:'Saya mendapatkan energi dari membantu orang lain mengatasi masalah mereka.' },
      { s:'S', q:'Saya suka mengajar, melatih, atau membimbing orang lain.' },
      { s:'S', q:'Saya sangat peduli terhadap kesejahteraan orang-orang di sekitar saya.' },
      { s:'S', q:'Saya lebih suka bekerja dalam tim daripada bekerja sendiri.' },
      { s:'S', q:'Saya tertarik pada bidang konseling, psikologi, atau pekerjaan sosial.' },
      { s:'S', q:'Saya sering menjadi orang yang pertama kali ditanyai ketika teman butuh saran.' },
      { s:'S', q:'Membuat orang lain merasa baik adalah sesuatu yang memberi saya kepuasan.' },
      // E
      { s:'E', q:'Saya suka memimpin proyek dan mengambil keputusan penting.' },
      { s:'E', q:'Saya tertarik pada bisnis, kewirausahaan, dan cara menghasilkan uang.' },
      { s:'E', q:'Saya merasa nyaman mempresentasikan ide di depan banyak orang.' },
      { s:'E', q:'Saya suka bernegosiasi dan meyakinkan orang untuk mendukung ide saya.' },
      { s:'E', q:'Saya bermimpi memiliki bisnis sendiri suatu hari nanti.' },
      { s:'E', q:'Saya tertarik pada politik, hukum, atau manajemen organisasi.' },
      { s:'E', q:'Saya merasa ambisius dan selalu ingin mencapai lebih banyak.' },
      // C
      { s:'C', q:'Saya suka pekerjaan yang terstruktur, jelas prosedurnya, dan memiliki standar baku.' },
      { s:'C', q:'Saya menikmati bekerja dengan angka, tabel, dan laporan keuangan.' },
      { s:'C', q:'Saya sangat rapi dan terorganisir dalam kehidupan sehari-hari.' },
      { s:'C', q:'Saya tertarik pada akuntansi, administrasi, atau manajemen database.' },
      { s:'C', q:'Saya lebih suka mengikuti prosedur yang sudah terbukti daripada mencoba hal baru.' },
      { s:'C', q:'Saya merasa nyaman mengerjakan tugas yang detail dan memerlukan ketelitian tinggi.' },
      { s:'C', q:'Saya suka memeriksa kembali pekerjaan saya untuk memastikan tidak ada kesalahan.' }
    ];
    
    // Urutan item diacak untuk setiap sesi; bank QUESTIONS tetap menjadi sumber item asli.
    let quizQuestions = QUESTIONS.slice();
    
    const CAREERS = [
      {id:'career-insinyur-mesin', icon:'⚙️', title:'Insinyur Mesin', riasec:['R','I','C'], cluster:'Engineering & Technical', evidenceLevel:'DIRECT', description:'Merancang, mengembangkan, menguji, dan memperbaiki mesin serta sistem mekanik.', rationale:{R:'Bekerja dengan mesin, peralatan, dan sistem fisik.',I:'Menganalisis masalah teknis dan menerapkan prinsip rekayasa.',C:'Menggunakan spesifikasi, standar, perhitungan, dan dokumentasi teknis.'}},
        {id:'career-teknisi-teknik-industri', icon:'🔧', title:'Teknisi Teknik Industri', riasec:['R','C','I'], cluster:'Engineering & Technical', evidenceLevel:'DIRECT', description:'Mendukung pengoperasian, pengujian, dan perbaikan proses serta sistem industri.', rationale:{R:'Berinteraksi dengan peralatan dan proses fisik.',C:'Mengikuti prosedur, standar, dan pengendalian kualitas.',I:'Menganalisis proses untuk menemukan cara kerja yang lebih baik.'}},
        {id:'career-pilot-pesawat', icon:'✈️', title:'Pilot Pesawat', riasec:['R','C','E'], cluster:'Engineering & Technical', evidenceLevel:'DIRECT', description:'Mengoperasikan pesawat dengan mengikuti prosedur keselamatan dan membuat keputusan operasional.', rationale:{R:'Mengoperasikan sistem dan peralatan fisik.',C:'Sangat bergantung pada checklist, prosedur, dan standar keselamatan.',E:'Membutuhkan pengambilan keputusan dan koordinasi operasional.'}},
        {id:'career-arsitek', icon:'🏛️', title:'Arsitek', riasec:['R','C','A'], cluster:'Engineering & Technical', evidenceLevel:'DIRECT', description:'Merancang bangunan dan lingkungan fisik dengan menggabungkan kebutuhan teknis dan desain.', rationale:{R:'Berhubungan dengan bangunan dan lingkungan fisik.',C:'Menggunakan standar teknis, regulasi, dan spesifikasi.',A:'Mengembangkan konsep dan solusi desain yang kreatif.'}},
        {id:'career-ilmuwan-lingkungan', icon:'🌱', title:'Ilmuwan Lingkungan', riasec:['I','R','C'], cluster:'Science & Analytics', evidenceLevel:'DIRECT', description:'Mempelajari kondisi lingkungan dan menggunakan data ilmiah untuk memahami serta menangani masalah lingkungan.', rationale:{I:'Melakukan pengamatan, analisis, dan penelitian ilmiah.',R:'Berinteraksi dengan lingkungan dan sistem fisik.',C:'Menggunakan prosedur pengukuran, data, dan dokumentasi.'}},
        {id:'career-insinyur-pertanian', icon:'🌾', title:'Insinyur Pertanian', riasec:['R','I'], cluster:'Engineering & Technical', evidenceLevel:'DIRECT', description:'Menerapkan prinsip teknik untuk sistem, peralatan, dan proses pertanian.', rationale:{R:'Bekerja dengan peralatan dan sistem fisik di bidang pertanian.',I:'Memecahkan masalah teknis menggunakan prinsip sains dan rekayasa.'}},
      {id:'career-ilmuwan-biologi', icon:'🧬', title:'Ilmuwan Biologi', riasec:['I','R'], cluster:'Science & Analytics', evidenceLevel:'ADAPTED', description:'Meneliti organisme hidup, proses biologis, dan fenomena kehidupan menggunakan metode ilmiah.', rationale:{I:'Menekankan penelitian, observasi, analisis, dan pemecahan masalah ilmiah.',R:'Melibatkan kerja laboratorium, spesimen, atau lingkungan fisik.'}},
        {id:'career-data-scientist', icon:'📊', title:'Data Scientist', riasec:['I','C'], cluster:'Science & Analytics', evidenceLevel:'DIRECT', description:'Menganalisis data, menemukan pola, dan membangun model untuk menjawab pertanyaan atau mendukung keputusan.', rationale:{I:'Menggunakan analisis, pemodelan, dan pemecahan masalah kompleks.',C:'Mengelola dataset, proses analisis, dan dokumentasi secara sistematis.'}},
        {id:'career-astrofisikawan', icon:'🌌', title:'Astrofisikawan', riasec:['I','R','C'], cluster:'Science & Analytics', evidenceLevel:'ADAPTED', description:'Mempelajari fenomena fisik di alam semesta melalui teori, observasi, dan analisis data.', rationale:{I:'Menekankan penelitian dan penalaran ilmiah.',R:'Berhubungan dengan sistem dan fenomena fisik.',C:'Membutuhkan analisis data, perhitungan, dan dokumentasi sistematis.'}},
        {id:'career-kimiawan', icon:'⚗️', title:'Kimiawan', riasec:['I','R','C'], cluster:'Science & Analytics', evidenceLevel:'DIRECT', description:'Mempelajari komposisi, sifat, dan perubahan materi melalui eksperimen dan analisis.', rationale:{I:'Melakukan penelitian dan pemecahan masalah ilmiah.',R:'Melakukan eksperimen dan bekerja dengan bahan serta peralatan.',C:'Mengikuti prosedur laboratorium dan mencatat hasil secara sistematis.'}},
        {id:'career-ai-engineer', icon:'🤖', title:'AI Engineer', riasec:['I','R','C'], cluster:'Technology & Digital Design', evidenceLevel:'PROXY', description:'Mengembangkan dan menerapkan sistem kecerdasan buatan untuk menyelesaikan masalah teknis.', rationale:{I:'Memerlukan analisis, pemodelan, dan pemecahan masalah kompleks.',R:'Berhubungan dengan penerapan teknologi dan sistem teknis.',C:'Memerlukan struktur data, pengujian, dokumentasi, dan proses yang sistematis.'}},
        {id:'career-farmakolog', icon:'💊', title:'Farmakolog', riasec:['I','R'], cluster:'Science & Analytics', evidenceLevel:'ADAPTED', description:'Mempelajari efek obat dan senyawa terhadap organisme melalui penelitian eksperimental.', rationale:{I:'Menekankan penelitian dan analisis ilmiah.',R:'Melibatkan eksperimen, bahan, dan sistem biologis fisik.'}},
      {id:'career-desainer-grafis', icon:'🎨', title:'Desainer Grafis', riasec:['A','C'], cluster:'Creative & Media', evidenceLevel:'DIRECT', description:'Mengembangkan konsep visual dan materi komunikasi grafis untuk berbagai kebutuhan.', rationale:{A:'Membutuhkan kreativitas, estetika, dan ekspresi visual.',C:'Mengikuti spesifikasi, format, kebutuhan klien, dan proses revisi.'}},
        {id:'career-penulis', icon:'✍️', title:'Penulis', riasec:['A','E'], cluster:'Creative & Media', evidenceLevel:'DIRECT', description:'Menghasilkan tulisan untuk menyampaikan gagasan, informasi, atau cerita kepada pembaca.', rationale:{A:'Membutuhkan ekspresi, imajinasi, dan pengembangan gagasan.',E:'Sering melibatkan komunikasi dengan audiens dan tujuan publikasi.'}},
        {id:'career-direktur-kreatif', icon:'💡', title:'Direktur Kreatif', riasec:['A','E'], cluster:'Creative & Media', evidenceLevel:'ADAPTED', description:'Memimpin arah kreatif dan mengembangkan konsep komunikasi atau kampanye.', rationale:{A:'Menentukan konsep dan arah kreatif.',E:'Memimpin proses dan memengaruhi keputusan serta hasil proyek.'}},
        {id:'career-musisi-komposer', icon:'🎼', title:'Musisi / Komposer', riasec:['A','E'], cluster:'Creative & Media', evidenceLevel:'ADAPTED', description:'Menciptakan, mengaransemen, atau membawakan karya musik.', rationale:{A:'Berpusat pada ekspresi dan penciptaan artistik.',E:'Dapat melibatkan pertunjukan, promosi, dan pengelolaan aktivitas profesional.'}},
        {id:'career-fotografer', icon:'📷', title:'Fotografer', riasec:['R','A'], cluster:'Creative & Media', evidenceLevel:'DIRECT', description:'Menghasilkan gambar untuk kebutuhan artistik, dokumentasi, editorial, atau komersial.', rationale:{R:'Menggunakan kamera, peralatan, lokasi, dan proses produksi fisik.',A:'Membutuhkan komposisi visual, estetika, dan kreativitas.'}},
        {id:'career-sutradara-film', icon:'🎬', title:'Sutradara Film', riasec:['A','E'], cluster:'Creative & Media', evidenceLevel:'ADAPTED', description:'Mengarahkan aspek kreatif produksi film dan mengoordinasikan keputusan artistik.', rationale:{A:'Menentukan visi dan bahasa artistik.',E:'Memimpin orang dan mengoordinasikan proses produksi.'}},
      {id:'career-psikolog-klinis-konseling', icon:'🧠', title:'Psikolog Klinis/Konseling', riasec:['S','I'], cluster:'Helping & Human Services', evidenceLevel:'ADAPTED', description:'Membantu individu memahami dan menangani masalah psikologis melalui asesmen dan intervensi.', rationale:{S:'Berfokus pada membantu dan memahami orang lain.',I:'Menggunakan asesmen, penalaran, dan pemahaman ilmiah.'}},
        {id:'career-guru', icon:'👨‍🏫', title:'Guru', riasec:['S'], cluster:'Helping & Human Services', evidenceLevel:'DIRECT', description:'Mengajar, membimbing, dan mendukung perkembangan peserta didik.', rationale:{S:'Pekerjaan utamanya melibatkan pengajaran, bimbingan, dan interaksi dengan orang lain.'}},
        {id:'career-pekerja-sosial', icon:'🤝', title:'Pekerja Sosial', riasec:['S'], cluster:'Helping & Human Services', evidenceLevel:'DIRECT', description:'Membantu individu, keluarga, dan komunitas menghadapi masalah sosial serta meningkatkan kesejahteraan.', rationale:{S:'Berpusat pada pelayanan, dukungan, dan pemberdayaan orang lain.'}},
        {id:'career-konselor-karir', icon:'🗣️', title:'Konselor Karir', riasec:['S','C','E'], cluster:'Helping & Human Services', evidenceLevel:'ADAPTED', description:'Membantu individu mengeksplorasi pilihan pendidikan dan karier serta membuat keputusan.', rationale:{S:'Melibatkan konseling dan bantuan langsung kepada individu.',C:'Mengorganisasi informasi pendidikan dan pekerjaan secara sistematis.',E:'Membantu individu menetapkan arah dan mengambil keputusan.'}},
        {id:'career-manajer-layanan-sosial-komunitas', icon:'🌍', title:'Manajer Layanan Sosial & Komunitas', riasec:['E','S','C'], cluster:'Helping & Human Services', evidenceLevel:'ADAPTED', description:'Mengelola program layanan sosial dan kegiatan yang mendukung komunitas.', rationale:{E:'Mengelola program, sumber daya, dan keputusan organisasi.',S:'Berorientasi pada pelayanan masyarakat.',C:'Membutuhkan administrasi, perencanaan, dan pengelolaan program.'}},
        {id:'career-terapis-okupasi', icon:'🧑‍🦽', title:'Terapis Okupasi', riasec:['S','I'], cluster:'Helping & Human Services', evidenceLevel:'ADAPTED', description:'Membantu individu meningkatkan kemampuan menjalankan aktivitas sehari-hari melalui intervensi terapeutik.', rationale:{S:'Berfokus pada bantuan langsung dan hubungan terapeutik.',I:'Menggunakan asesmen dan pemecahan masalah klinis.'}},
      {id:'career-entrepreneur-pemilik-bisnis', icon:'🚀', title:'Entrepreneur / Pemilik Bisnis', riasec:['E','S','A'], cluster:'Business, Management & Law', evidenceLevel:'PROXY', description:'Membangun dan mengelola usaha dengan mengambil keputusan, mengembangkan peluang, dan mengoordinasikan sumber daya.', rationale:{E:'Berorientasi pada inisiatif, kepemimpinan, dan peluang bisnis.',S:'Melibatkan relasi dengan pelanggan, mitra, dan tim.',A:'Dalam banyak usaha, kreativitas digunakan untuk mengembangkan produk atau strategi.'}},
        {id:'career-manajer-operasi-bisnis', icon:'💼', title:'Manajer Operasi / Bisnis', riasec:['E','C','S'], cluster:'Business, Management & Law', evidenceLevel:'ADAPTED', description:'Mengelola operasi organisasi, sumber daya, proses, dan pencapaian tujuan bisnis.', rationale:{E:'Memimpin dan mengambil keputusan.',C:'Mengandalkan perencanaan, sistem, dan pengendalian proses.',S:'Mengoordinasikan orang dan tim.'}},
        {id:'career-pengacara', icon:'⚖️', title:'Pengacara', riasec:['E','C','I'], cluster:'Business, Management & Law', evidenceLevel:'DIRECT', description:'Menganalisis persoalan hukum, menyusun argumentasi, dan mewakili kepentingan klien.', rationale:{E:'Melibatkan persuasi, advokasi, dan negosiasi.',C:'Membutuhkan ketelitian terhadap aturan dan dokumen.',I:'Memerlukan analisis masalah dan penalaran.'}},
        {id:'career-marketing-manager', icon:'📣', title:'Marketing Manager', riasec:['E','C'], cluster:'Business, Management & Law', evidenceLevel:'DIRECT', description:'Merencanakan dan mengarahkan kegiatan pemasaran untuk mencapai tujuan organisasi.', rationale:{E:'Melibatkan strategi, persuasi, dan pengambilan keputusan.',C:'Menggunakan perencanaan, data, target, dan evaluasi.'}},
        {id:'career-analis-investasi', icon:'📈', title:'Analis Investasi', riasec:['C','E','I'], cluster:'Business, Management & Law', evidenceLevel:'ADAPTED', description:'Menganalisis informasi keuangan dan investasi untuk mendukung keputusan investasi.', rationale:{C:'Memerlukan ketelitian terhadap angka, data, dan laporan.',E:'Berhubungan dengan keputusan bisnis dan investasi.',I:'Memerlukan analisis informasi dan penalaran kuantitatif.'}},
        {id:'career-spesialis-hubungan-masyarakat', icon:'📢', title:'Spesialis Hubungan Masyarakat', riasec:['E','A'], cluster:'Business, Management & Law', evidenceLevel:'ADAPTED', description:'Mengelola komunikasi organisasi dengan publik dan berbagai pemangku kepentingan.', rationale:{E:'Berorientasi pada persuasi, hubungan, dan representasi organisasi.',A:'Membutuhkan kemampuan menyusun pesan dan materi komunikasi kreatif.'}},
      {id:'career-akuntan-auditor', icon:'🧾', title:'Akuntan / Auditor', riasec:['C','E','I'], cluster:'Finance, Administration & Information', evidenceLevel:'DIRECT', description:'Mencatat, memeriksa, dan menganalisis informasi keuangan serta kepatuhan terhadap standar.', rationale:{C:'Berpusat pada angka, ketelitian, prosedur, dan dokumentasi.',E:'Dapat melibatkan konsultasi dan komunikasi profesional.',I:'Membutuhkan analisis informasi keuangan.'}},
        {id:'career-analis-keuangan', icon:'💹', title:'Analis Keuangan', riasec:['C','E','I'], cluster:'Finance, Administration & Information', evidenceLevel:'DIRECT', description:'Menganalisis data dan informasi keuangan untuk membantu pengambilan keputusan.', rationale:{C:'Menggunakan data, laporan, dan prosedur yang sistematis.',E:'Mendukung keputusan bisnis dan investasi.',I:'Memerlukan analisis dan interpretasi informasi.'}},
        {id:'career-database-administrator', icon:'🗄️', title:'Database Administrator', riasec:['C','I'], cluster:'Technology & Digital Design', evidenceLevel:'DIRECT', description:'Mengelola, menjaga, dan memastikan kinerja serta keamanan sistem basis data.', rationale:{C:'Membutuhkan struktur, prosedur, dokumentasi, dan ketelitian.',I:'Melibatkan pemecahan masalah teknis dan analisis sistem.'}},
        {id:'career-manajer-layanan-administrasi', icon:'📋', title:'Manajer Layanan Administrasi', riasec:['E','C','S'], cluster:'Finance, Administration & Information', evidenceLevel:'DIRECT', description:'Merencanakan dan mengoordinasikan layanan administratif organisasi.', rationale:{E:'Mengelola sumber daya dan keputusan operasional.',C:'Mengandalkan sistem dan prosedur administratif.',S:'Mengoordinasikan kebutuhan orang dan unit kerja.'}},
        {id:'career-spesialis-pajak', icon:'💰', title:'Spesialis Pajak', riasec:['C','E'], cluster:'Finance, Administration & Information', evidenceLevel:'ADAPTED', description:'Menganalisis kewajiban pajak dan membantu memastikan kepatuhan terhadap peraturan perpajakan.', rationale:{C:'Memerlukan ketelitian terhadap angka, dokumen, dan aturan.',E:'Melibatkan konsultasi dan pengambilan keputusan profesional.'}},
        {id:'career-ux-web-interface-designer', icon:'🖥️', title:'UX / Web & Digital Interface Designer', riasec:['I','A','C'], cluster:'Technology & Digital Design', evidenceLevel:'DIRECT', description:'Merancang dan menguji antarmuka digital dengan memperhatikan kebutuhan pengguna, fungsi, teknologi, dan desain visual.', rationale:{I:'Melibatkan riset pengguna, analisis, pengujian, dan pemecahan masalah.',A:'Membutuhkan kreativitas, desain visual, dan pengembangan konsep antarmuka.',C:'Melibatkan standar teknis, dokumentasi, pengujian, dan proses yang terstruktur.'}}
    ];
    
    const RIASEC_TIE_ORDER = ['R','I','A','S','E','C'];
    
    function validateCareerDatabase() {
      const validCodes = new Set(RIASEC_TIE_ORDER);
      const ids = new Set();
      const errors = [];
      CAREERS.forEach((career, index) => {
        if (!career.id) errors.push('Missing career id: ' + (career.title || index + 1));
        if (ids.has(career.id)) errors.push('Duplicate career id: ' + career.id);
        ids.add(career.id);
        if (!Array.isArray(career.riasec) || career.riasec.length < 1 || career.riasec.length > 3) {
          errors.push('Invalid RIASEC length: ' + career.title);
        }
        if (Array.isArray(career.riasec) ? career.riasec.some(code => !validCodes.has(code)) : false) {
          errors.push('Invalid RIASEC code: ' + career.title);
        }
      });
      if (errors.length) console.error('Career database validation:', errors);
      return errors;
    }
    
    
    // ========== DEVELOPER TEST MODE ==========
    // Hanya untuk pengembangan/QA. Aktif melalui URL ?testmode=<scenario>.
    // Jangan dipertahankan pada build produksi.
    function getTestModeScenario() {
      const params = new URLSearchParams(window.location.search);
      const value = (params.get('testmode') || '').toLowerCase().trim();
      const allowed = ['balanced', 'ria', 'sec', 'allhigh', 'alllow'];
      return allowed.includes(value) ? value : null;
    }
    
    function buildTestAnswers(scenario) {
      const patterns = {
        balanced: [5, 5, 5, 5, 5, 5],
        ria:      [7, 6, 5, 2, 2, 2],
        sec:      [2, 2, 2, 5, 7, 6],
        allhigh:  [7, 7, 7, 7, 7, 7],
        alllow:   [1, 1, 1, 1, 1, 1]
      };
      const pattern = patterns[scenario];
      if (!pattern) return null;
    
      // 7 item per dimensi: R, I, A, S, E, C.
      return Array.from({ length: 42 }, (_, i) => pattern[Math.floor(i / 7)]);
    }
    
    function startDeveloperTestMode() {
      const scenario = getTestModeScenario();
      if (!scenario) return false;
    
      quizQuestions = QUESTIONS.slice(); // skenario QA memakai urutan baku R-I-A-S-E-C
      answers = buildTestAnswers(scenario);
      if (!answers) return false;
    
      // Hitung skor dengan mekanisme scoring yang sama seperti tes normal.
      scores = {R:0, I:0, A:0, S:0, E:0, C:0};
      answers.forEach((value, index) => {
        const section = SECTIONS[Math.floor(index / 7)];
        if (section ? section.key : false) scores[section.key] += Number(value) || 0;
      });
    
      // Tampilkan hasil langsung tanpa melewati 42 item.
      showResult();
      console.info('[KarirKu Developer Test Mode]', scenario, scores);
      return true;
    }
    
    
    // ========== DEMOGRAPHIC CHECKLIST LIMIT ==========
    function enforceMaxThree(group, checkbox) {
      const boxes = Array.from(app.querySelectorAll(`input[type="checkbox"][data-check-group="${group}"]`));
      if (boxes.filter(cb => cb.checked).length > 3) {
        checkbox.checked = false;
        alert('Maksimal 3 pilihan yang dapat dipilih.');
        return false;
      }
      return true;
    }
    
    function initDemographicChecklistLimits() {
      app.querySelectorAll('input[type="checkbox"][data-demographic]').forEach(cb => {
        const group = cb.dataset.demographic;
        cb.dataset.checkGroup = group;
        cb.addEventListener('change', () => enforceMaxThree(group, cb));
      });
    }
    
    // ========== STATE ==========
    let currentQ = 0;
    let answers = new Array(42).fill(null);
    let scores = {R:0,I:0,A:0,S:0,E:0,C:0};
    let radarChart = null, trendChart = null, ageChart = null, genderChart = null;
    let tableFilter = 'semua';
    
    // ========== NAV ==========
    validateCareerDatabase();
    
    function goPage(p) {
      app.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
      document.getElementById('page-'+p).classList.add('active');
      if (p === 'quiz') initQuiz();
      if (p === 'admin') initAdmin();
    }
    
    // ========== CONSENT ==========
    // participantConsent: status persetujuan consent, ikut disimpan sebagai bukti riset
    let participantConsent = false;
    let participantConsentedAt = null;
    
    function toggleConsentBtn() {
      const checked = document.getElementById('consent-check').checked;
      participantConsent = checked;
      participantConsentedAt = checked ? new Date().toISOString() : null;
      document.getElementById('consent-btn').disabled = !checked;
    }
    
    // ========== SEND RESULT VIA EMAIL (opsional, email tidak disimpan) ==========
    function sendResultEmail() {
      const emailInput = document.getElementById('result-email-input');
      const email = emailInput.value.trim();
      const statusEl = document.getElementById('email-result-status');
      const btn = document.getElementById('send-email-btn');
    
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        statusEl.textContent = 'Masukkan alamat email yang valid.';
        statusEl.className = 'email-result-status error';
        return;
      }
    
      btn.disabled = true;
      btn.textContent = 'Mengirim...';
      statusEl.textContent = '';
      statusEl.className = 'email-result-status';
    
      // Kirim ke Apps Script HANYA untuk trigger pengiriman email.
      // Email TIDAK disertakan dalam data yang tersimpan permanen (participantProfile / sheet utama).
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'sendResultEmail',
          email: email,
          typeCode: document.getElementById('result-badge').textContent.trim(),
          typeName: document.getElementById('result-type-name').textContent,
          description: document.getElementById('result-desc').textContent
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data ? data.success : false) {
          statusEl.textContent = 'Hasil berhasil dikirim ke email kamu ✓';
          statusEl.className = 'email-result-status success';
          emailInput.value = '';
        } else {
          throw new Error((data ? data.message : null) || 'Gagal mengirim');
        }
      })
      .catch(() => {
        statusEl.textContent = 'Gagal mengirim email. Coba lagi nanti.';
        statusEl.className = 'email-result-status error';
      })
      .finally(() => {
        btn.disabled = false;
        btn.textContent = 'Kirim';
      });
    }
    
    // ========== PROFILE ==========
    // participantName: HANYA untuk tampilan di halaman hasil, TIDAK pernah dimasukkan ke payload data yang dikirim ke database
    let participantName = '';
    // participantProfile: data yang akan ikut disimpan ke database (tidak termasuk nama)
    let participantProfile = {};
    // participantUserId: kode acak unik per partisipan, dipakai sebagai pengganti identitas asli
    let participantUserId = '';
    // participantResult: hasil kuis (tipe dominan, skor, rekomendasi) yang akan ikut disimpan ke database
    let participantResult = {};
    // quizStartTime: waktu mulai kuis, dipakai menghitung durasi pengerjaan
    let quizStartTime = null;
    // participantFeedback: feedback pasca-hasil yang akan ikut disimpan ke database
    let participantFeedback = { akurasi: 0, relevansi: 0, komentar: '' };
    let participantSubmissionId = '';
    let participantSubmissionSaved = false;
    let submissionSavePromise = null;
    
    function setFeedbackRating(type, value) {
      participantFeedback[type] = value;
      const wrap = document.getElementById('fb-' + type);
      wrap.querySelectorAll('button').forEach((btn, i) => {
        btn.classList.toggle('active', i < value);
      });
      const statusEl = app.querySelector('.feedback-sent-note');
      if (statusEl) statusEl.textContent = 'Penilaian belum dikirim.';
    }
    
    function generateUserId() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa karakter ambigu (0/O, 1/I)
      let id = 'KK-';
      for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
      return id;
    }
    
    function updateJenjangFields() {
      const status = document.getElementById('p-status').value;
      const isSchool = status === 'SMA' || status === 'SMK';
      const isStudent = status === 'Mahasiswa';
      document.getElementById('field-kelas').classList.toggle('show', isSchool);
      document.getElementById('field-peminatan').classList.toggle('show', status === 'SMA');
      document.getElementById('field-jurusan-smk').classList.toggle('show', status === 'SMK');
      document.getElementById('field-semester').classList.toggle('show', isStudent);
      document.getElementById('field-prodi').classList.toggle('show', isStudent);
      document.getElementById('field-organisasi-sekolah').classList.toggle('show', isSchool);
      document.getElementById('field-organisasi-kampus').classList.toggle('show', isStudent);
    }
    
    function autoSetPeminatan() {
      const kelas = document.getElementById('p-kelas').value;
      const status = document.getElementById('p-status').value;
      const peminatan = document.getElementById('p-peminatan');
      if ([status === 'SMA', kelas === 'Kelas 10', !peminatan.value].every(Boolean)) {
        peminatan.value = 'Belum ada peminatan';
      }
    }
    
    function getCheckedValues(name) {
      return Array.from(app.querySelectorAll('input[name="' + name + '"]:checked'))
        .map(input => input.value);
    }
    
    function getCheckedValuesWithOther(name, otherId) {
      const values = getCheckedValues(name);
      if (values.includes('Lainnya')) {
        const other = document.getElementById(otherId)?.value.trim();
        if (other) values.push('Lainnya: ' + other);
      }
      return values;
    }
    
    function toggleOtherField(checkbox, fieldId) {
      const field = document.getElementById(fieldId);
      if (!field) return;
      field.style.display = checkbox.checked ? 'block' : 'none';
      if (!checkbox.checked) {
        const input = field.querySelector('input');
        if (input) input.value = '';
      }
    }
    
    function submitProfile() {
      const status = document.getElementById('p-status').value;
      const usia = document.getElementById('p-usia').value;
      const institusi = document.getElementById('p-institusi').value.trim();
      const domisili = document.getElementById('p-domisili').value.trim();
    
      if (!status || !usia || !institusi || !domisili) {
        alert('Mohon lengkapi Usia, Status Pendidikan, Asal Sekolah/Kampus, dan Domisili sebelum melanjutkan.');
        return;
      }
      if ([status === 'SMA', !document.getElementById('p-kelas').value || !document.getElementById('p-peminatan').value].every(Boolean)) {
        alert('Mohon lengkapi Kelas dan Peminatan.');
        return;
      }
      if ([status === 'SMK', !document.getElementById('p-kelas').value || !document.getElementById('p-jurusan-smk').value.trim()].every(Boolean)) {
        alert('Mohon lengkapi Kelas dan Jurusan/Kompetensi Keahlian.');
        return;
      }
      if ([status === 'Mahasiswa', !document.getElementById('p-semester').value || !document.getElementById('p-prodi').value.trim()].every(Boolean)) {
        alert('Mohon lengkapi Semester dan Program Studi.');
        return;
      }
    
      // Nama disimpan HANYA di variabel lokal untuk tampilan hasil, tidak masuk participantProfile
      participantName = document.getElementById('p-nama').value.trim();
      participantUserId = generateUserId();
      participantSubmissionId = '';
      participantSubmissionSaved = false;
    
      participantProfile = {
        usia: usia,
        status_pendidikan: status,
        kelas: (status === 'SMA' || status === 'SMK') ? document.getElementById('p-kelas').value : '',
        semester: status === 'Mahasiswa' ? document.getElementById('p-semester').value : '',
        peminatan_sma: status === 'SMA' ? document.getElementById('p-peminatan').value : '',
        jurusan_smk: status === 'SMK' ? document.getElementById('p-jurusan-smk').value.trim() : '',
        program_studi: status === 'Mahasiswa' ? document.getElementById('p-prodi').value.trim() : '',
        asal_institusi: institusi,
        domisili: domisili,
        hobi: getCheckedValuesWithOther('hobi', 'p-hobi-lainnya'),
        kegiatan_ekstrakurikuler: (status === 'SMA' || status === 'SMK') ? getCheckedValuesWithOther('ekskul', 'p-ekskul-lainnya') : [],
        unit_kegiatan_mahasiswa: status === 'Mahasiswa' ? getCheckedValuesWithOther('ukm', 'p-ukm-lainnya') : [],
        cita_cita_karier: document.getElementById('p-cita-cita').value.trim(),
        mata_pelajaran_favorit: getCheckedValuesWithOther('mapel', 'p-mapel-lainnya'),
        sumber_info: document.getElementById('p-sumber').value,
        device_type: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
      };
    
      quizStartTime = Date.now();
      goPage('quiz');
    }
    
    // ========== QUIZ ==========
    function shuffleQuestions(items) {
      const shuffled = items.slice();
      // Fisher-Yates: setiap item muncul tepat satu kali dalam urutan acak.
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }
    
    function initQuiz() {
      currentQ = 0;
      quizQuestions = shuffleQuestions(QUESTIONS);
      answers = new Array(quizQuestions.length).fill(null);
      scores = {R:0,I:0,A:0,S:0,E:0,C:0};
      renderQuestion();
      renderLiveScores();
    }
    
    function renderQuestion() {
      const q = quizQuestions[currentQ];
      document.getElementById('q-num').textContent = 'Pertanyaan ' + String(currentQ+1).padStart(2,'0');
      document.getElementById('q-text').textContent = q.q;
      document.getElementById('prog-label').textContent = 'Progres tes: ' + (currentQ+1) + ' dari 42';
      document.getElementById('prog-count').textContent = '';
      document.getElementById('prog-fill').style.width = (((currentQ+1)/42)*100)+'%';
    
      const btns = app.querySelectorAll('.likert-btn');
      btns.forEach(b => b.classList.remove('selected'));
      if (answers[currentQ] !== null) {
        btns[answers[currentQ]-1].classList.add('selected');
        document.getElementById('btn-next').classList.add('enabled');
      } else {
        document.getElementById('btn-next').classList.remove('enabled');
      }
      document.getElementById('btn-back').style.opacity = currentQ === 0 ? '0.3' : '1';
      document.getElementById('btn-next').textContent = currentQ === 41 ? 'Lihat Hasil ✨' : 'Lanjut →';
    
      const card = document.getElementById('quiz-card');
      card.style.animation = 'none'; void card.offsetWidth; card.style.animation = 'slideIn 0.35s cubic-bezier(0.4,0,0.2,1)';
    }
    
    function selectAnswer(val) {
      answers[currentQ] = val;
      const s = quizQuestions[currentQ].s;
      // Recalculate section score
      scores = {R:0,I:0,A:0,S:0,E:0,C:0};
      quizQuestions.forEach((q,i) => { if(answers[i] !== null) scores[q.s] += answers[i]; });
      app.querySelectorAll('.likert-btn').forEach(b => b.classList.remove('selected'));
      app.querySelectorAll('.likert-btn[data-val="'+val+'"]')[0].classList.add('selected');
      document.getElementById('btn-next').classList.add('enabled');
      renderLiveScores();
    }
    
    function renderLiveScores() {
      const wrap = document.getElementById('live-scores');
      wrap.innerHTML = SECTIONS.map(s => {
        const max = 35, pct = Math.min(100, (scores[s.key]/max)*100);
        return `<div class="score-pill" style="border-color:${s.color}22">
          <span style="font-size:14px">${s.icon}</span>
          <span style="color:${s.color}">${s.key}</span>
          <div class="pill-bar"><div class="pill-fill" style="width:${pct}%;background:${s.color}"></div></div>
        </div>`;
      }).join('');
    }
    
    function nextQ() {
      if (answers[currentQ] === null) return;
      if (currentQ === 41) { showResult(); return; }
      currentQ++;
      renderQuestion();
    }
    
    function prevQ() {
      if (currentQ === 0) return;
      currentQ--;
      renderQuestion();
    }
    
    // ========== RESULT ==========
    // ========== CAREER MATCHING ==========
    // Career profile dapat memiliki 1, 2, atau 3 dimensi.
    // Bobot 50/30/20 diterapkan hanya pada dimensi yang tersedia, lalu
    // dinormalisasi agar career dengan profile pendek tidak dirugikan.
    // Formula ini adalah aturan matching aplikasi, bukan cut-off psikometrik.
    function calculateCareerMatch(scores, career) {
      const baseWeights = [0.50, 0.30, 0.20];
      const weights = career.riasec.map((_, i) => baseWeights[i] ?? 0);
      const weightTotal = weights.reduce((sum, w) => sum + w, 0);
      if (!weightTotal) return 0;
    
      const weighted = career.riasec.reduce((sum, code, i) => {
        const score = Math.max(0, Math.min(35, Number(scores[code]) || 0));
        return sum + (score / 35) * (weights[i] / weightTotal);
      }, 0);
    
      // Penalti kecil jika dimensi pendukung sangat rendah.
      const supportScores = career.riasec.slice(1).map(code =>
        Math.max(0, Math.min(35, Number(scores[code]) || 0)) / 35
      );
      const meanSupport = supportScores.length ? supportScores.reduce((a,b)=>a+b,0)/supportScores.length : 1;
      const supportPenalty = supportScores.length ? Math.max(0, 0.35 - meanSupport) * 0.12 : 0;
    
      return Math.round(Math.max(0, Math.min(1, weighted - supportPenalty)) * 100);
    }
    
    function getCareerMatchLabel(score, maxScore) {
      const relativeGap = maxScore - score;
      if ([score >= 70, relativeGap <= 5].every(Boolean)) return 'Sangat Selaras';
      if ([score >= 60, relativeGap <= 12].every(Boolean)) return 'Selaras';
      if ([score >= 50, relativeGap <= 20].every(Boolean)) return 'Cukup Selaras';
      return 'Kurang Selaras';
    }
    
    function getAllCareers() { return CAREERS; }
    
    function rankCareers(scores) {
      const scored = getAllCareers().map(career => ({ ...career, matchScore: calculateCareerMatch(scores, career) }));
      const maxScore = Math.max(...scored.map(c => c.matchScore), 0);
      return scored
        .map(career => ({ ...career, matchLabel: getCareerMatchLabel(career.matchScore, maxScore) }))
        .sort((a,b) => {
          if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
          const aPrimary = scores[a.riasec[0]] || 0;
          const bPrimary = scores[b.riasec[0]] || 0;
          if (bPrimary !== aPrimary) return bPrimary - aPrimary;
          return a.title.localeCompare(b.title, 'id');
        });
    }
    
    function rankRIASEC(scoreMap) {
      return Object.entries(scoreMap).sort((a,b) => {
        const diff = b[1] - a[1];
        if (diff !== 0) return diff;
        return RIASEC_TIE_ORDER.indexOf(a[0]) - RIASEC_TIE_ORDER.indexOf(b[0]);
      });
    }
    
    function escapeHTML(value) {
      return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;',"\"":'&quot;'}[c]));
    }
    
    function buildCareerRationale(career, scores) {
      return career.riasec.map(code => {
        const text = career.rationale?.[code];
        return text ? `<div style="margin-top:4px"><strong>${code}</strong> — ${escapeHTML(text)}</div>` : '';
      }).join('');
    }
    
    // ========== 3-LETTER RIASEC NARRATIVE ==========
    function buildRIASECNarrative(profileSections, profileCode) {
      const [primary, secondary, tertiary] = profileSections;
      const names = profileSections.map(s => s.name).join(', ');
      return `Kode RIASEC-mu adalah ${profileCode}, dengan ${primary.name} sebagai minat utama, diikuti ${secondary.name} dan ${tertiary.name}. Profil ini menggabungkan ketertarikan pada ${primary.desc.toLowerCase()}, sekaligus ${secondary.desc.toLowerCase()} serta ${tertiary.desc.toLowerCase()}. Gunakan kombinasi ini sebagai gambaran pola minat untuk mengeksplorasi bidang studi dan karier yang relevan.`;
    }
    
    // ========== RESULT ==========
    function showResult() {
      scores = {R:0,I:0,A:0,S:0,E:0,C:0};
      quizQuestions.forEach((q,i) => { if(answers[i] !== null) scores[q.s] += answers[i]; });
    
      const sorted = rankRIASEC(scores);
      const top = sorted[0][0], second = sorted[1][0], third = sorted[2][0];
      const topSec = SECTIONS.find(s => s.key === top);
      const profileCode = top + second + third;
      const profileSections = [top, second, third].map(code => SECTIONS.find(s => s.key === code));
    
      // Narasi hasil mengikuti seluruh 3-letter RIASEC profile, bukan hanya dimensi pertama.
      const profileNarrative = buildRIASECNarrative(profileSections, profileCode);
    
      participantResult = {
        tipe_dominan: profileCode,
        skor_r: scores.R, skor_i: scores.I, skor_a: scores.A,
        skor_s: scores.S, skor_e: scores.E, skor_c: scores.C,
        rekomendasi_karir: '',
        waktu_pengerjaan_detik: quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : ''
      };
    
      participantFeedback = { akurasi: 0, relevansi: 0, komentar: '' };
      participantSubmissionId = (window.crypto ? crypto.randomUUID : null) ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random()*16|0; return (c==='x'?r:(r&0x3|0x8)).toString(16); });
      participantSubmissionSaved = false;
      submissionSavePromise = null;
      document.getElementById('fb-komentar').value = '';
      const feedbackStatus = app.querySelector('.feedback-sent-note');
      if (feedbackStatus) feedbackStatus.textContent = 'Isi penilaian, lalu klik Kirim Penilaian.';
      const feedbackButton = document.getElementById('send-feedback-btn');
      if (feedbackButton) {
        feedbackButton.disabled = false;
        feedbackButton.textContent = 'Kirim Penilaian';
      }
      ['akurasi','relevansi'].forEach(type => document.getElementById('fb-' + type).querySelectorAll('button').forEach(btn => btn.classList.remove('active')));
    
      const badge = document.getElementById('result-badge');
      badge.textContent = topSec.icon+' '+profileCode+' — '+topSec.name;
      badge.style.background = topSec.fill; badge.style.color = topSec.color; badge.style.border = '1px solid '+topSec.color+'44';
    
      document.getElementById('result-greeting').textContent = participantName ? ('Hasil untuk ' + participantName) : '';
      document.getElementById('result-type-name').textContent = profileCode;
      document.getElementById('result-title').innerHTML = 'Profil minatmu <span style="color:'+topSec.color+'">'+escapeHTML(profileCode)+'</span>';
      document.getElementById('result-desc').textContent = profileNarrative;
      document.getElementById('riasec-profile-breakdown').innerHTML = profileSections.map((section, index) => {
        const role = index === 0 ? 'Utama' : index === 1 ? 'Kedua' : 'Ketiga';
        return `<div class="riasec-profile-item">
          <div class="riasec-profile-code" style="color:${section.color}">${section.key} · ${role}</div>
          <div class="riasec-profile-name">${escapeHTML(section.name)}</div>
          <div class="riasec-profile-role">${escapeHTML(section.desc)}</div>
        </div>`;
      }).join('');
    
      const maxScore = Math.max(...Object.values(scores));
      document.getElementById('score-bars').innerHTML = SECTIONS.map(s => {
        const pct = maxScore > 0 ? Math.round((scores[s.key]/maxScore)*100) : 0;
        return `<div class="score-bar-item"><div class="sbi-label" style="background:${s.fill};color:${s.color}">${s.key}</div><span class="sbi-name">${s.name}</span><div class="sbi-bar-bg"><div class="sbi-bar-fill" style="width:${pct}%;background:${s.color}"></div></div><span class="sbi-score" style="color:${s.color}">${scores[s.key]}</span></div>`;
      }).join('');
    
      const rankedCareers = rankCareers(scores);
      const careers = rankedCareers.slice(0, 6);
      participantResult.rekomendasi_karir = careers.map(c => c.title).join('; ');
    
      document.getElementById('careers-grid').innerHTML = careers.map(c => {
        const matchClass = c.matchLabel === 'Sangat Selaras' ? 'match-high' :
          c.matchLabel === 'Selaras' ? 'match-med' :
          c.matchLabel === 'Cukup Selaras' ? 'match-low' : 'match-poor';
        const code = c.riasec.join('');
        return `<div class="career-card" title="Profil RIASEC: ${code}">
          <div class="career-icon">${c.icon}</div>
          <div class="career-title">${escapeHTML(c.title)}</div>
          <div style="font-size:10px;color:var(--muted);margin:4px 0 6px">RIASEC: <strong>${code}</strong> · ${escapeHTML(c.cluster)}</div>
          <span class="career-match ${matchClass}">${c.matchLabel}</span>
          <div style="font-size:11px;margin-top:6px;opacity:.82">Skor keselarasan profil: ${c.matchScore}/100</div>
          <div style="font-size:11px;line-height:1.5;margin-top:8px;color:var(--muted)">${escapeHTML(c.description)}</div>
          <div style="font-size:10.5px;line-height:1.45;margin-top:7px;color:var(--muted)">${buildCareerRationale(c, scores)}</div>
        </div>`;
      }).join('');
    
      document.getElementById('traits-wrap').innerHTML = profileSections.map(section => `<span class="trait-tag">${escapeHTML(section.name)}</span>`).join('');
      document.getElementById('env-wrap').innerHTML = profileSections.map(section => `<span class="trait-tag">${escapeHTML(section.desc)}</span>`).join('');
    
      goPage('result');
    
      setTimeout(() => {
        if (radarChart) radarChart.destroy();
        const ctx = document.getElementById('radarChart').getContext('2d');
        radarChart = new Chart(ctx, {
          type:'radar',
          data:{labels:SECTIONS.map(s=>s.name),datasets:[{data:SECTIONS.map(s=>scores[s.key]),backgroundColor:'rgba(123,97,255,0.2)',borderColor:'#7B61FF',pointBackgroundColor:SECTIONS.map(s=>({R:'#FF6B6B',I:'#FFB347',A:'#C77DFF',S:'#56CFE1',E:'#FF9F1C',C:'#80ED99'})[s.key]),pointRadius:5,borderWidth:2}]},
          options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{r:{min:0,max:35,grid:{color:'rgba(255,255,255,0.08)'},angleLines:{color:'rgba(255,255,255,0.08)'},ticks:{display:false},pointLabels:{color:'#F0EFF8',font:{family:'Syne',size:12,weight:'700'}}}}}
        });
        addToAdminDB(top, second, scores);
      },100);
    
      submissionSavePromise = saveSubmissionToSheets();
    }
    
    
    /* ========== GOOGLE SHEETS DATABASE ========== */
    async function postKarirKuData(payload) {
      if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('TEMPELKAN_URL')) {
        throw new Error('URL Google Apps Script belum dipasang.');
      }
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); }
      catch (_) { throw new Error('Respons server bukan JSON. Periksa deployment Apps Script.'); }
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Data tidak berhasil disimpan.');
      }
      return data;
    }
    
    async function saveSubmissionToSheets() {
      const statusEl = app.querySelector('.submission-save-status');
      if (statusEl) statusEl.textContent = 'Menyimpan hasil kuesioner ke database...';
      const responses = quizQuestions.map((q, i) => ({
        item_no: QUESTIONS.indexOf(q) + 1,
        dimension: q.s,
        item: q.q,
        response: answers[i]
      }));
      const payload = {
        action: 'saveSubmission',
        submission_uuid: participantSubmissionId,
        participant_code: participantUserId,
        instrument_slug: 'riasec',
        instrument_version: '1.0',
        started_at: quizStartTime ? new Date(quizStartTime).toISOString() : '',
        duration_seconds: participantResult.waktu_pengerjaan_detik || 0,
        consent_given: participantConsent === true,
        consent_version: '1.0',
        consented_at: participantConsentedAt,
        demographics: participantProfile,
        responses: responses,
        scores: {
          R: scores.R, I: scores.I, A: scores.A,
          S: scores.S, E: scores.E, C: scores.C
        },
        result: participantResult,
        feedback: participantFeedback,
        source_page: window.location.href
      };
    
      try {
        const data = await postKarirKuData(payload);
        participantSubmissionSaved = true;
        if (statusEl) statusEl.textContent = 'Hasil kuesioner berhasil tersimpan. Kode partisipan: ' + (data.participant_code || participantUserId);
        return true;
      } catch (error) {
        console.error('KarirKu database save error:', error);
        if (statusEl) statusEl.textContent = 'Hasil kuesioner belum berhasil tersimpan. Kode partisipan: ' + participantUserId;
        return false;
      }
    }
    
    async function submitFeedback() {
      const statusEl = app.querySelector('.feedback-sent-note');
      const button = document.getElementById('send-feedback-btn');
      if (!participantFeedback.akurasi || !participantFeedback.relevansi) {
        if (statusEl) statusEl.textContent = 'Mohon isi kedua penilaian sebelum mengirim. Komentar bersifat opsional.';
        return;
      }
    
      if (button) {
        button.disabled = true;
        button.textContent = 'Mengirim...';
      }
      if (statusEl) statusEl.textContent = 'Mengirim penilaian...';
    
      try {
        if (!participantSubmissionSaved) {
          const saved = submissionSavePromise ? await submissionSavePromise : false;
          if (!saved || !participantSubmissionSaved) {
            throw new Error('Hasil kuesioner belum tersimpan. Silakan coba lagi beberapa saat.');
          }
        }
    
        await postKarirKuData({
          action: 'updateFeedback',
          submission_uuid: participantSubmissionId,
          feedback: participantFeedback
        });
    
        if (statusEl) statusEl.textContent = 'Penilaian berhasil dikirim. Terima kasih!';
        if (button) button.textContent = 'Penilaian Terkirim ✓';
      } catch (error) {
        console.error('KarirKu feedback save error:', error);
        if (statusEl) statusEl.textContent = 'Penilaian belum berhasil dikirim: ' + error.message;
        if (button) {
          button.disabled = false;
          button.textContent = 'Coba Kirim Lagi';
        }
      }
    }
    
    function retakeQuiz() {
      participantSubmissionId = '';
      participantSubmissionSaved = false;
      submissionSavePromise = null;
      quizStartTime = Date.now();
      goPage('quiz');
    }
    
    async function downloadResult() {
      const btn = app.querySelector('.result-cta .btn-share');
      const originalText = btn ? btn.textContent : '';
      let clone = null;
    
      try {
        // Give the browser a moment to finish drawing the result dashboard.
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    
        if (typeof window.html2canvas !== 'function' || !window.jspdf || typeof window.jspdf.jsPDF !== 'function') {
          alert('Komponen PDF belum termuat. Pastikan internet aktif, lalu muat ulang halaman dan coba lagi.');
          return;
        }
    
        const source = app.querySelector('#page-result .result-wrap');
        if (!source) {
          alert('Hasil tes belum siap untuk dibuat PDF. Silakan tampilkan halaman hasil terlebih dahulu.');
          return;
        }
    
        if (btn) {
          btn.disabled = true;
          btn.textContent = '⏳ Menyiapkan PDF...';
        }
    
        clone = source.cloneNode(true);
    
        // PDF hanya berisi hasil; email, feedback, dan tombol aksi tidak ikut.
        clone.querySelectorAll('.email-result-box, .feedback-box, .result-cta').forEach(el => el.remove());
    
        // html2canvas tidak selalu membawa bitmap canvas ketika elemen di-clone.
        // Buat ulang radar khusus PDF dengan latar putih dan label gelap agar terbaca saat dicetak.
        const originalRadar = document.getElementById('radarChart');
        const clonedRadar = clone.querySelector('#radarChart');
        if ([originalRadar, clonedRadar, originalRadar ? originalRadar.width : 0, originalRadar ? originalRadar.height : 0, window.Chart].every(Boolean)) {
          const pdfRadarCanvas = document.createElement('canvas');
          pdfRadarCanvas.width = originalRadar.width;
          pdfRadarCanvas.height = originalRadar.height;
          const pdfRadarChart = new Chart(pdfRadarCanvas.getContext('2d'), {
            type: 'radar',
            data: {
              labels: SECTIONS.map(s => s.name),
              datasets: [{
                data: SECTIONS.map(s => scores[s.key]),
                backgroundColor: 'rgba(123,97,255,0.16)',
                borderColor: '#7054D8',
                pointBackgroundColor: SECTIONS.map(s => ({R:'#D94B4B',I:'#C47A16',A:'#9450C8',S:'#1595A8',E:'#D97706',C:'#269B55'})[s.key]),
                pointRadius: 5,
                borderWidth: 2
              }]
            },
            options: {
              responsive: false,
              maintainAspectRatio: false,
              animation: false,
              plugins: { legend: { display: false } },
              scales: {
                r: {
                  min: 0, max: 35,
                  grid: { color: 'rgba(40,45,60,0.16)' },
                  angleLines: { color: 'rgba(40,45,60,0.20)' },
                  ticks: { display: false },
                  pointLabels: { color: '#303344', font: { family: 'Arial', size: 12, weight: '600' } }
                }
              }
            }
          });
          await new Promise(resolve => requestAnimationFrame(resolve));
          const radarImg = document.createElement('img');
          radarImg.src = pdfRadarCanvas.toDataURL('image/png');
          radarImg.width = pdfRadarCanvas.width;
          radarImg.height = pdfRadarCanvas.height;
          radarImg.style.width = getComputedStyle(originalRadar).width;
          radarImg.style.height = getComputedStyle(originalRadar).height;
          radarImg.style.display = 'block';
          clonedRadar.replaceWith(radarImg);
          pdfRadarChart.destroy();
        }
    
        // Override tampilan khusus salinan PDF: latar putih, kartu putih, teks gelap.
        const printStyle = document.createElement('style');
        printStyle.textContent = `
          .result-wrap { background: #ffffff !important; color: #202333 !important; }
          .result-hero, .result-hero p, .result-greeting { color: #303344 !important; }
          .result-card, .riasec-profile-item, .career-card {
            background: #ffffff !important; border-color: #d9dce5 !important;
            box-shadow: none !important; color: #202333 !important;
          }
          .result-card h3, .sbi-name, .career-title, .riasec-profile-name,
          .riasec-profile-role, .trait-tag, .result-note {
            color: #303344 !important;
          }
          .result-note, .trait-tag { background: #f5f6fa !important; border-color: #d9dce5 !important; }
          .sbi-bar-bg { background: #e7e9ef !important; }
          .career-card [style*="color:var(--muted)"],
          .career-card [style*="color: var(--muted)"] { color: #505568 !important; }
        `;
        clone.appendChild(printStyle);
    
        clone.style.width = '900px';
        clone.style.maxWidth = '900px';
        clone.style.margin = '0';
        clone.style.padding = '40px';
        clone.style.background = '#ffffff';
        clone.style.color = '#202333';
        clone.style.position = 'absolute';
        clone.style.left = '-100000px';
        clone.style.top = '0';
        clone.style.zIndex = '-1';
        app.appendChild(clone);
    
        // Pastikan font/image dan layout clone selesai sebelum ditangkap.
        if (document.fonts ? document.fonts.ready : false) await document.fonts.ready;
        await new Promise(resolve => setTimeout(resolve, 300));
    
        const canvas = await window.html2canvas(clone, {
          scale: Math.min(2, window.devicePixelRatio || 1.5),
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: false,
          logging: false,
          imageTimeout: 15000,
          windowWidth: 1000
        });
    
        clone.remove();
        clone = null;
    
        if (!canvas.width || !canvas.height) {
          throw new Error('Canvas PDF kosong.');
        }
    
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const usableWidth = pageWidth - margin * 2;
        const usableHeight = pageHeight - margin * 2;
        const pxPerMm = canvas.width / usableWidth;
        const pageSlicePx = Math.floor(usableHeight * pxPerMm);
    
        let sourceY = 0;
        let pageIndex = 0;
    
        while (sourceY < canvas.height) {
          if (pageIndex > 0) pdf.addPage();
    
          const sliceHeightPx = Math.min(pageSlicePx, canvas.height - sourceY);
          const slice = document.createElement('canvas');
          slice.width = canvas.width;
          slice.height = sliceHeightPx;
    
          const ctx = slice.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, slice.width, slice.height);
          ctx.drawImage(
            canvas,
            0, sourceY, canvas.width, sliceHeightPx,
            0, 0, slice.width, sliceHeightPx
          );
    
          const sliceData = slice.toDataURL('image/png');
          const sliceMmHeight = sliceHeightPx / pxPerMm;
          pdf.addImage(sliceData, 'PNG', margin, margin, usableWidth, sliceMmHeight, undefined, 'FAST');
    
          sourceY += sliceHeightPx;
          pageIndex++;
        }
    
        const code = (document.getElementById('result-type-name')?.textContent || 'RIASEC').trim();
        pdf.save('KarirKu-Hasil-' + code + '.pdf');
    
      } catch (err) {
        console.error('PDF generation error:', err);
        alert('PDF belum dapat dibuat. Pastikan halaman hasil sudah tampil dan koneksi internet aktif, kemudian coba lagi.');
      } finally {
        if (clone ? clone.parentNode : false) clone.remove();
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText || '⬇ Unduh PDF';
        }
      }
    }
    
    // ========== ADMIN DB ==========
    const NAMES = ['Budi Santoso','Siti Rahayu','Ahmad Fauzi','Dewi Putri','Rizky Pratama','Anisa Maharani','Fajar Nugroho','Citra Lestari','Dimas Arya','Nadia Puspita','Eko Wahyudi','Fitri Handayani','Galang Saputra','Hana Wijaya','Irfan Kusuma','Jihan Rachmawati'];
    const LEVELS = ['Siswa SMA','Mahasiswa Baru','Mahasiswa Tingkat 2'];
    
    let adminDB = [];
    function seedDB() {
      if (adminDB.length > 0) return;
      for (let i = 0; i < 47; i++) {
        const s = SECTIONS[Math.floor(Math.random()*6)];
        const s2 = SECTIONS.filter(x => x.key !== s.key)[Math.floor(Math.random()*5)];
        const sc = {};
        SECTIONS.forEach(sec => { sc[sec.key] = Math.floor(Math.random()*22)+8; });
        sc[s.key] = Math.floor(Math.random()*8)+28;
        const d = new Date(2025, 10 + Math.floor(i/16), (i % 28) + 1);
        adminDB.push({
          id: 'RK'+String(1000+i).slice(1),
          name: NAMES[i % NAMES.length],
          age: Math.floor(Math.random()*6)+16,
          level: LEVELS[Math.floor(Math.random()*3)],
          t1: s.key, t2: s2.key, scores: sc,
          gender: Math.random()>0.48?'P':'L',
          date: d.toLocaleDateString('id-ID')
        });
      }
    }
    
    function addToAdminDB(t1, t2, sc) {
      adminDB.unshift({
        id: 'RK'+Date.now().toString().slice(-4),
        name: 'Anda (Demo)',
        age: 18, level: 'Siswa SMA',
        t1, t2, scores: {...sc},
        gender: '-',
        date: new Date().toLocaleDateString('id-ID')
      });
      document.getElementById('kpi-total').textContent = adminDB.length;
    }
    
    // ========== ADMIN ==========
    function doLogin() {
      const u = document.getElementById('login-user').value;
      const p = document.getElementById('login-pass').value;
      if ([u === 'admin', p === 'admin123'].every(Boolean)) {
        document.getElementById('admin-login').style.display = 'none';
        initAdminCharts();
      } else {
        document.getElementById('login-user').style.borderColor = 'var(--r)';
        document.getElementById('login-pass').style.borderColor = 'var(--r)';
        setTimeout(() => {
          document.getElementById('login-user').style.borderColor = '';
          document.getElementById('login-pass').style.borderColor = '';
        }, 1000);
      }
    }
    document.getElementById('login-user').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
    document.getElementById('login-pass').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
    
    function initAdmin() { seedDB(); }
    
    function initAdminCharts() {
      seedDB();
      document.getElementById('kpi-total').textContent = adminDB.length;
    
      // Top type
      const typeCounts = {R:0,I:0,A:0,S:0,E:0,C:0};
      adminDB.forEach(r => typeCounts[r.t1]++);
      const topType = Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])[0][0];
      const topSec = SECTIONS.find(s => s.key === topType);
      document.getElementById('kpi-dom').innerHTML = `<span style="color:${topSec.color}">${topSec.icon} ${topType}</span>`;
    
      // Distribution bars
      const total = adminDB.length;
      const colorMap = {R:'var(--r)',I:'var(--i)',A:'var(--a)',S:'var(--s)',E:'var(--e)',C:'var(--c)'};
      document.getElementById('dist-bars').innerHTML = SECTIONS.map(s => {
        const cnt = typeCounts[s.key];
        const pct = Math.round((cnt/total)*100);
        return `<div class="dist-bar-item">
          <span class="dist-label" style="color:${colorMap[s.key]}">${s.key}</span>
          <div class="dist-bar-bg"><div class="dist-bar-fill" style="width:${pct}%;background:${colorMap[s.key]}"></div></div>
          <span class="dist-pct">${pct}% (${cnt})</span>
        </div>`;
      }).join('');
    
      // Trend chart
      if (trendChart) trendChart.destroy();
      const trendCtx = document.getElementById('trendChart').getContext('2d');
      trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: ['Okt','Nov','Des','Jan','Feb','Mar'],
          datasets: [{
            label: 'Responden',
            data: [6,9,12,8,14,adminDB.length > 47 ? adminDB.length - 42 + 12 : 12],
            borderColor: '#7B61FF',
            backgroundColor: 'rgba(123,97,255,0.1)',
            pointBackgroundColor: '#7B61FF',
            tension: 0.4, fill: true, pointRadius: 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color:'rgba(255,255,255,0.05)' }, ticks: { color:'rgba(240,239,248,0.5)', font:{size:11} } },
            y: { grid: { color:'rgba(255,255,255,0.05)' }, ticks: { color:'rgba(240,239,248,0.5)', font:{size:11} }, min:0 }
          }
        }
      });
    
      // Age chart
      if (ageChart) ageChart.destroy();
      const ageCtx = document.getElementById('ageChart').getContext('2d');
      const ageBuckets = {'15-16':0,'17-18':0,'19-20':0,'21-22':0};
      adminDB.forEach(r => {
        if(r.age<=16) ageBuckets['15-16']++;
        else if(r.age<=18) ageBuckets['17-18']++;
        else if(r.age<=20) ageBuckets['19-20']++;
        else ageBuckets['21-22']++;
      });
      ageChart = new Chart(ageCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(ageBuckets),
          datasets: [{ data: Object.values(ageBuckets), backgroundColor: ['#7B61FF','#FF61D2','#56CFE1','#80ED99'], borderRadius: 6 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display:false }, ticks: { color:'rgba(240,239,248,0.5)', font:{size:11} } },
            y: { grid: { color:'rgba(255,255,255,0.05)' }, ticks: { color:'rgba(240,239,248,0.5)', font:{size:11} }, min:0 }
          }
        }
      });
    
      // Gender chart
      if (genderChart) genderChart.destroy();
      const gCtx = document.getElementById('genderChart').getContext('2d');
      const laki = adminDB.filter(r=>r.gender==='L').length;
      const perempuan = adminDB.filter(r=>r.gender==='P').length;
      const lainnya = adminDB.filter(r=>r.gender==='-').length;
      genderChart = new Chart(gCtx, {
        type: 'doughnut',
        data: {
          labels: ['Laki-laki','Perempuan','Lainnya'],
          datasets: [{ data: [laki,perempuan,lainnya], backgroundColor:['#7B61FF','#FF61D2','#56CFE1'], hoverOffset:4, borderWidth:2, borderColor:'#13132A' }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'bottom', labels: { color:'rgba(240,239,248,0.7)', font:{size:12}, padding:12, boxWidth:12 } }
          },
          cutout: '65%'
        }
      });
    
      renderTable();
    }
    
    function renderTable() {
      const search = document.getElementById('search-box').value.toLowerCase();
      const colorMap = {R:'var(--r)',I:'var(--i)',A:'var(--a)',S:'var(--s)',E:'var(--e)',C:'var(--c)'};
      const softMap  = {R:'var(--r-soft)',I:'var(--i-soft)',A:'var(--a-soft)',S:'var(--s-soft)',E:'var(--e-soft)',C:'var(--c-soft)'};
      const filtered = adminDB.filter(r => {
        const matchFilter = tableFilter === 'semua' || r.t1 === tableFilter;
        const matchSearch = !search || r.name.toLowerCase().includes(search) || r.id.toLowerCase().includes(search);
        return [matchFilter, matchSearch].every(Boolean);
      });
      document.getElementById('table-body').innerHTML = filtered.map(r => `
        <tr>
          <td><span class="table-code">${escapeHTML(r.id)}</span></td>
          <td>${escapeHTML(r.name)}</td>
          <td>${escapeHTML(r.age)}</td>
          <td>${escapeHTML(r.level)}</td>
          <td><span class="table-badge" style="background:${softMap[r.t1]};color:${colorMap[r.t1]}">${escapeHTML(r.t1)}</span></td>
          <td><span class="table-badge" style="background:${softMap[r.t2]};color:${colorMap[r.t2]}">${escapeHTML(r.t2)}</span></td>
          ${SECTIONS.map(s=>`<td style="color:${colorMap[s.key]};font-weight:600">${r.scores[s.key]}</td>`).join('')}
          <td style="color:var(--muted);font-size:12px">${escapeHTML(r.date)}</td>
        </tr>`).join('');
    }
    
    function setFilter(f, el) {
      tableFilter = f;
      app.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
      renderTable();
    }
    
    function filterTable() { renderTable(); }
    
    function exportCSV() {
      const headers = ['Kode','Nama','Usia','Tingkat','Tipe1','Tipe2','R','I','A','S','E','C','Tanggal'];
      const rows = adminDB.map(r => [r.id,r.name,r.age,r.level,r.t1,r.t2,...SECTIONS.map(s=>r.scores[s.key]),r.date]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], {type:'text/csv'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'riasec-data.csv'; a.click();
    }
    
    function scrollInfo() {
      const modal = document.getElementById('riasec-modal');
      if (!modal) return;
      modal.classList.add('show');
      app.style.overflow = 'hidden';
      const closeBtn = modal.querySelector('.riasec-modal-close');
      if (closeBtn) closeBtn.focus();
    }
    
    function closeRIASECInfo(event) {
      if (event ? event.target !== event.currentTarget : false) return;
      const modal = document.getElementById('riasec-modal');
      if (!modal) return;
      modal.classList.remove('show');
      app.style.overflow = '';
    }
    
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') closeRIASECInfo();
    });
    
    // Developer Test Mode boot.
    // Delay one tick so the normal page/app initialization has completed.
    const runAfterLoad = (callback) => {
      if (document.readyState === 'complete') callback();
      else window.addEventListener('load', callback, { once: true });
    };
    runAfterLoad(() => {
      if (getTestModeScenario()) setTimeout(() => startDeveloperTestMode(), 150);
    });
    
    
    runAfterLoad(() => {
      const scenario = getTestModeScenario();
      if (!scenario) return;
      const badge = document.createElement('div');
      badge.className = 'karirku-testmode-badge';
      badge.textContent = 'TEST MODE · ' + scenario.toUpperCase();
      badge.title = 'Hanya untuk pengujian developer';
      app.appendChild(badge);
    });
    
    
    initDemographicChecklistLimits();
    


  // Ekspos fungsi yang dipanggil langsung dari atribut onclick/onchange HTML.
  Object.assign(window, {
    validateCareerDatabase,
    getTestModeScenario,
    buildTestAnswers,
    startDeveloperTestMode,
    enforceMaxThree,
    initDemographicChecklistLimits,
    goPage,
    toggleConsentBtn,
    sendResultEmail,
    setFeedbackRating,
    generateUserId,
    updateJenjangFields,
    autoSetPeminatan,
    getCheckedValues,
    getCheckedValuesWithOther,
    toggleOtherField,
    submitProfile,
    shuffleQuestions,
    initQuiz,
    renderQuestion,
    selectAnswer,
    renderLiveScores,
    nextQ,
    prevQ,
    calculateCareerMatch,
    getCareerMatchLabel,
    getAllCareers,
    rankCareers,
    rankRIASEC,
    escapeHTML,
    buildCareerRationale,
    buildRIASECNarrative,
    showResult,
    postKarirKuData,
    saveSubmissionToSheets,
    submitFeedback,
    retakeQuiz,
    downloadResult,
    seedDB,
    addToAdminDB,
    doLogin,
    initAdmin,
    initAdminCharts,
    renderTable,
    setFilter,
    filterTable,
    exportCSV,
    scrollInfo,
    closeRIASECInfo
  });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKarirKu, { once: true });
  } else {
    initKarirKu();
  }
})();
