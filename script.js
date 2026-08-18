// ==========================================================
// WRONGULATOR — SCRIPT
// Catatan penting: nama fungsi & variabel INTERNAL (ekspresi,
// tingkatSesat, gantiTingkat, dst) sengaja TETAP bahasa Indonesia
// seperti versi sebelumnya, supaya logika lama (localStorage,
// peluang jawaban sesat) gak perlu dibongkar ulang.
// Yang baru cuma LAPISAN TAMPILAN: teks yang dilihat user
// sekarang diambil dari kamus terjemahan "i18n" di bawah.
// ==========================================================


// ----------------------------------------------------------
// 1. KAMUS TERJEMAHAN (i18n)
// Setiap key di sini dipakai lewat atribut data-i18n="key"
// di HTML, atau lewat fungsi t("key") di JS.
//
// CARA NAMBAH BAHASA BARU (misal Jepang):
//   1. Tambah blok "ja: { ... }" di bawah, isi semua key-nya.
//   2. Di array "daftarBahasa", ubah kode "ja" jadi tersedia:true.
// Selesai, gak perlu ubah HTML/CSS sama sekali.
// ----------------------------------------------------------
const i18n = {

    en: {
        tagline: "Calculates fast. Rarely correct.",

        settingsTitle: "Settings",
        menuAppearanceTitle: "Appearance",
        menuTrustTitle: "Trust Level",
        menuAbsurdTitle: "Absurd Answers",
        menuLanguageTitle: "Language",
        menuAboutTitle: "About",

        themeLabel: "Theme",
        themeDark: "Dark",
        themeLight: "Light",
        switchTo: "Switch to",

        trustSubtitle: "How much should you trust the answer?",
        levelReliableName: "Reliable",
        levelReliableDesc: "Always correct",
        levelShakyName: "Shaky",
        levelShakyDesc: "Mostly correct",
        levelShadyName: "Shady",
        levelShadyDesc: "Coin-flip honesty",
        levelUnhingedName: "Unhinged",
        levelUnhingedDesc: "Expect chaos",

        absurdSubtitle: "Add your own nonsense the calculator can throw back at you.",
        absurdPlaceholder: "Type an absurd answer...",
        absurdAddBtn: "Add Answer",
        absurdCountSuffix: "answers",
        absurdFallback: "😶 Emptiness is the answer",
        absurdDeleteConfirm: "Delete this answer?",

        languageSoon: "Soon",

        versionLabel: "Version",
        creditMadeBy: "Made by",
        creditDevSupport: "Development Support",
        creditPoweredBy: "Powered by",
        footerText: "Made with coffee, bugs, and questionable math.",

        stampWrong: "Miscalculated",
        stampAbsurd: "Nonsense",
        stampError: "Rejected",

        easterBlackHole: "🕳️ Black Hole",
        easterMathConfused: "🤯 Math is Confused",
        errorText: "Error"
    },

    id: {
        tagline: "Menghitung cepat. Jarang benar.",

        settingsTitle: "Pengaturan",
        menuAppearanceTitle: "Tampilan",
        menuTrustTitle: "Tingkat Kepercayaan",
        menuAbsurdTitle: "Jawaban Absurd",
        menuLanguageTitle: "Bahasa",
        menuAboutTitle: "Tentang",

        themeLabel: "Tema",
        themeDark: "Gelap",
        themeLight: "Terang",
        switchTo: "Ganti ke",

        trustSubtitle: "Seberapa bisa kamu percaya jawabannya?",
        levelReliableName: "Andal",
        levelReliableDesc: "Selalu benar",
        levelShakyName: "Goyah",
        levelShakyDesc: "Kebanyakan benar",
        levelShadyName: "Mencurigakan",
        levelShadyDesc: "Jujur-jujuran koin",
        levelUnhingedName: "Kacau",
        levelUnhingedDesc: "Siap-siap kacau",

        absurdSubtitle: "Tambahkan omong kosong yang bisa dilempar balik kalkulator ke kamu.",
        absurdPlaceholder: "Tulis jawaban absurd...",
        absurdAddBtn: "Tambah Jawaban",
        absurdCountSuffix: "jawaban",
        absurdFallback: "😶 Kekosongan adalah jawaban",
        absurdDeleteConfirm: "Hapus jawaban ini?",

        languageSoon: "Segera",

        versionLabel: "Versi",
        creditMadeBy: "Dibuat oleh",
        creditDevSupport: "Dukungan Pengembangan",
        creditPoweredBy: "Didukung oleh",
        footerText: "Dibuat dengan kopi, bug, dan matematika yang meragukan.",

        stampWrong: "Salah Hitung",
        stampAbsurd: "Omong Kosong",
        stampError: "Ditolak",

        easterBlackHole: "🕳️ Lubang Hitam",
        easterMathConfused: "🤯 Matematika Bingung",
        errorText: "Error"
    }

    // ja: { ... }  <- Jepang, tinggal isi nanti
    // zh: { ... }  <- Mandarin, tinggal isi nanti
};

// Daftar bahasa yang muncul di menu Settings > Language.
// "tersedia:false" bikin tombolnya nonaktif dengan label "Soon".
const daftarBahasa = [
    { kode: "en", nama: "English", tersedia: true },
    { kode: "id", nama: "Bahasa Indonesia", tersedia: true },
    { kode: "ja", nama: "日本語", tersedia: false },
    { kode: "zh", nama: "中文", tersedia: false }
];


// ----------------------------------------------------------
// 2. VARIABEL & INISIALISASI
// ----------------------------------------------------------
let ekspresi = "";
let tingkatSesat = localStorage.getItem("tingkatSesat") || "normal";
let temaAktif = localStorage.getItem("tema") || "dark";
let bahasaAktif = localStorage.getItem("bahasa") || "en"; // default: Inggris
const SIMPAN_DATA = true;

let absurd = [];
if (SIMPAN_DATA) {
    absurd = JSON.parse(localStorage.getItem("absurd")) || [];
}


// ----------------------------------------------------------
// 3. HELPER TERJEMAHAN
// t("key") = ambil teks sesuai bahasa aktif.
// Kalau key gak ketemu di bahasa aktif, otomatis fallback ke English,
// biar bahasa yang belum lengkap terjemahannya (mis. Jepang nanti)
// gak nampilin kosong/error.
// ----------------------------------------------------------
function t(key) {
    let kamus = i18n[bahasaAktif] || i18n.en;
    return kamus[key] || i18n.en[key] || key;
}

// Terapkan semua teks di halaman sesuai bahasa aktif
function terapkanBahasa() {
    document.documentElement.lang = bahasaAktif;

    // Semua elemen teks biasa yang punya data-i18n
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
        el.textContent = t(el.getAttribute("data-i18n"));
    });

    // Elemen placeholder input (mis. #inputAbsurd)
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
        el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });

    updateThemeButtonLabel();
    updateTrustBadge();
    updateMenuHome();
    renderPilihanBahasa();
}


// ----------------------------------------------------------
// 4. SAAT HALAMAN DIBUKA
// ----------------------------------------------------------
window.onload = function () {

    // Terapkan Tema Terakhir
    if (temaAktif === "light") {
        document.body.classList.add("light");
    } else {
        document.body.classList.remove("light");
    }

    // Terapkan Tingkat Kepercayaan Terakhir
    let tombolAktif = document.querySelector(`.levelBtn.${tingkatSesat}`);
    gantiTingkat(tingkatSesat, tombolAktif);

    tampilkan();
    tampilkanAbsurd();
    terapkanBahasa();
};


// ----------------------------------------------------------
// 5. DISPLAY UTAMA
// ----------------------------------------------------------
function tampilkan() {
    let display = ekspresi
        .replace(/\*/g, "×")
        .replace(/\//g, "÷");
    let hasil = document.getElementById("hasil");
    if (hasil) {
        hasil.value = display === "" ? "0" : display;
    }
}

// Tampilkan hasil akhir + jalankan efek visual (stamp/shake) sesuai outcome-nya.
// outcome: "correct" | "wrong" | "absurd" | "error"
function tampilkanHasil(nilai, outcome) {
    let hasilEl = document.getElementById("hasil");
    if (hasilEl) {
        hasilEl.value = nilai;
    }
    efekHasil(outcome);
}

// Ngatur cap/stamp dan getaran layar berdasarkan jenis jawabannya
function efekHasil(outcome) {
    let kartu = document.getElementById("displayCard");
    let cap = document.getElementById("stamp");
    if (!kartu) return;

    // Reset dulu efek sebelumnya
    kartu.classList.remove("shake");
    if (cap) {
        cap.classList.remove("show");
        void cap.offsetWidth; // paksa reflow biar animasinya bisa diulang
    }

    // Jawaban benar (atau gak ada outcome) = gak perlu efek apa-apa
    if (!outcome || outcome === "correct") return;

    let teksCap = "";
    if (outcome === "wrong") teksCap = t("stampWrong");
    else if (outcome === "absurd") teksCap = t("stampAbsurd");
    else if (outcome === "error") teksCap = t("stampError");

    if (cap && teksCap) {
        cap.textContent = teksCap;
        cap.classList.add("show");
    }

    kartu.classList.add("shake");
    setTimeout(function () {
        kartu.classList.remove("shake");
    }, 400);
}


// ----------------------------------------------------------
// 6. INPUT ANGKA
// ----------------------------------------------------------
function tambahAngka(nilai) {
    if (nilai === ".") {
        let bagian = ekspresi.split(/[+\-*/%()]/);
        let terakhir = bagian[bagian.length - 1];
        if (terakhir.includes(".")) {
            return;
        }
    }
    ekspresi += nilai;
    tampilkan();
}


// ----------------------------------------------------------
// 7. JAWABAN ABSURD (tambah, tampilkan, hapus)
// ----------------------------------------------------------
function tambahAbsurd() {
    let input = document.getElementById("inputAbsurd");
    let text = input.value.trim();
    if (text === "") {
        return;
    }
    absurd.push(text);
    tampilkanAbsurd();
    if (SIMPAN_DATA) {
        localStorage.setItem("absurd", JSON.stringify(absurd));
    }
    input.value = "";
    updateMenuHome();
}

function tampilkanAbsurd() {
    let list = document.getElementById("listAbsurd");
    if (!list) return;
    list.innerHTML = "";
    absurd.forEach(function (item, index) {
        list.innerHTML +=
            `<div class="itemAbsurd">
                <span>${item}</span>
                <button class="hapusAbsurdBtn" onclick="hapusAbsurd(${index})">❌</button>
            </div>`;
    });
}

function hapusAbsurd(index) {
    if (!confirm(t("absurdDeleteConfirm"))) {
        return;
    }
    absurd.splice(index, 1);
    tampilkanAbsurd();
    if (SIMPAN_DATA) {
        localStorage.setItem("absurd", JSON.stringify(absurd));
    }
    updateMenuHome();
}


// ----------------------------------------------------------
// 8. KURUNG
// ----------------------------------------------------------
function tambahKurungBuka() {
    ekspresi += "(";
    tampilkan();
}

function tambahKurungTutup() {
    ekspresi += ")";
    tampilkan();
}


// ----------------------------------------------------------
// 9. OPERATOR
// ----------------------------------------------------------
function setOperator(op) {
    if (ekspresi === "") return;

    if (op === "%") {
        let terakhir = ekspresi.slice(-1);
        if ("+-*/%.".includes(terakhir)) return;
        ekspresi += "%";
        tampilkan();
        return;
    }

    let terakhir = ekspresi.slice(-1);
    if ("+-*/".includes(terakhir)) {
        ekspresi = ekspresi.slice(0, -1) + op;
    } else {
        ekspresi += op;
    }
    tampilkan();
}


// ----------------------------------------------------------
// 10. DELETE & RESET
// ----------------------------------------------------------
function hapus() {
    if (ekspresi.length > 0) {
        ekspresi = ekspresi.slice(0, -1);
    }
    tampilkan();
}

function resetKalkulator() {
    ekspresi = "";
    tampilkan();
    efekHasil(null); // bersihin stamp/shake yang mungkin masih nempel
}


// ----------------------------------------------------------
// 11. HITUNG — INTI DARI "KESESATAN"
// Logika peluang PERSIS SAMA seperti sebelumnya, cuma sekarang
// tiap hasil dikirim lewat tampilkanHasil(nilai, outcome) supaya
// efek stamp/shake-nya otomatis jalan.
// ----------------------------------------------------------
function hitung() {
    if (ekspresi === "") return;

    let rumus = ekspresi;
    try {
        rumus = rumus.replace(/(\d+(\.\d+)?)\s*([+-])\s*(\d+(\.\d+)?)%/g, "$1 $3 ($1 * $4 / 100)");
        rumus = rumus.replace(/(\d+(\.\d+)?)%/g, "($1/100)");

        let hasil = eval(rumus);

        // Easter Egg (khusus level "Unhinged")
        if (tingkatSesat === "brutal") {
            if (rumus === "1/0") {
                tampilkanHasil(t("easterBlackHole"), "absurd");
                ekspresi = "";
                return;
            }
            if (rumus === "0/0") {
                tampilkanHasil(t("easterMathConfused"), "absurd");
                ekspresi = "";
                return;
            }
        }

        // Level "Reliable" (dulu normal) = selalu jujur
        if (tingkatSesat === "normal") {
            tampilkanHasil(hasil, "correct");
            ekspresi = "";
            return;
        }

        // Peluang berdasarkan trust level
        let benar = 0.8;
        let sesat = 0.15;

        if (tingkatSesat === "ringan") {        // Shaky
            benar = 0.85;
            sesat = 0.15;
        } else if (tingkatSesat === "sedang") { // Shady
            benar = 0.5;
            sesat = 0.35;
        } else if (tingkatSesat === "brutal") { // Unhinged
            benar = 0.1;
            sesat = 0.4;
        }

        let random = Math.random();

        // 1. Jawaban Benar
        if (random < benar) {
            tampilkanHasil(hasil, "correct");
        }
        // 2. Jawaban Sesat (matematika salah)
        else if (random < benar + sesat) {
            let jawabanSesat = [
                hasil + 1,
                hasil - 1,
                hasil + 7,
                hasil - 13,
                hasil * 2,
                hasil * 10,
                3, 7, 13, 21, 69, 404, 666, 999
            ];
            let pilih = jawabanSesat[Math.floor(Math.random() * jawabanSesat.length)];
            tampilkanHasil(pilih, "wrong");
        }
        // 3. Jawaban Absurd (teks kustom)
        else {
            if (absurd.length === 0) {
                tampilkanHasil(t("absurdFallback"), "absurd");
            } else {
                let pilih = absurd[Math.floor(Math.random() * absurd.length)];
                tampilkanHasil(pilih, "absurd");
            }
        }
    } catch {
        tampilkanHasil(t("errorText"), "error");
    }
    ekspresi = "";
}


// ----------------------------------------------------------
// 12. TRUST LEVEL (dulu "Tingkat Kesesatan")
// Nama internal (normal/ringan/sedang/brutal) TETAP SAMA biar
// data lama di localStorage & class CSS gak perlu dimigrasi.
// ----------------------------------------------------------
function gantiTingkat(level, tombol) {
    tingkatSesat = level;
    localStorage.setItem("tingkatSesat", level);

    document.body.classList.remove("normal", "ringan", "sedang", "brutal");
    document.body.classList.add(level);

    document.querySelectorAll(".levelBtn").forEach(function (btn) {
        btn.classList.remove("active");
    });
    if (tombol) {
        tombol.classList.add("active");
    }

    // Emoji kecil di brand cuma nongol pas level "Unhinged"
    let brandGlitch = document.getElementById("brandGlitch");
    if (brandGlitch) {
        brandGlitch.textContent = level === "brutal" ? " 😈" : "";
    }

    updateTrustBadge();
    updateMenuHome();
}

// Ubah key internal level -> key terjemahan nama levelnya
function kunciLabelLevel(level) {
    let peta = {
        normal: "levelReliableName",
        ringan: "levelShakyName",
        sedang: "levelShadyName",
        brutal: "levelUnhingedName"
    };
    return peta[level] || "levelReliableName";
}

// Update badge kecil "🟢 Reliable" di display kalkulator
function updateTrustBadge() {
    let dot = document.getElementById("trustDot");
    let label = document.getElementById("trustLabel");

    if (label) {
        label.textContent = t(kunciLabelLevel(tingkatSesat));
    }

    if (dot) {
        dot.classList.remove("dotGreen", "dotAmber", "dotRed", "dotPurple");
        let peta = {
            normal: "dotGreen",
            ringan: "dotAmber",
            sedang: "dotRed",
            brutal: "dotPurple"
        };
        dot.classList.add(peta[tingkatSesat] || "dotGreen");
    }
}


// ----------------------------------------------------------
// 13. SETTINGS: buka/tutup modal
// ----------------------------------------------------------
function bukaSetting() {
    let setting = document.getElementById("setting");
    let sedangTampil = setting.classList.contains("show");

    setting.classList.toggle("show");

    // Setiap kali dibuka, selalu mulai dari halaman menu utama
    if (!sedangTampil) {
        panelIndex = 0;
        updatePanel();
    }
}


// ----------------------------------------------------------
// 14. NAVIGASI SUB-HALAMAN SETTINGS (slide + tombol back)
// ----------------------------------------------------------
const panelUrutan = ["home", "tema", "kesulitan", "absurd", "language", "about"];
let panelIndex = 0;

function bukaPanel(nama) {
    let idx = panelUrutan.indexOf(nama);
    if (idx === -1) return;
    panelIndex = idx;
    updatePanel();
}

function tutupPanel() {
    panelIndex = 0;
    updatePanel();
}

function updatePanel() {
    let track = document.querySelector(".settingTrack");
    if (track) {
        track.style.transform = `translateX(-${panelIndex * 100}%)`;
    }
}

// Perbarui deskripsi kecil di tiap menu utama (tema, level, jumlah absurd, bahasa)
function updateMenuHome() {
    let deskTema = document.getElementById("menuDescTema");
    if (deskTema) {
        deskTema.textContent = document.body.classList.contains("light") ? t("themeLight") : t("themeDark");
    }

    let deskLevel = document.getElementById("menuDescLevel");
    if (deskLevel) {
        deskLevel.textContent = t(kunciLabelLevel(tingkatSesat));
    }

    let deskAbsurd = document.getElementById("menuDescAbsurd");
    if (deskAbsurd) {
        deskAbsurd.textContent = absurd.length + " " + t("absurdCountSuffix");
    }

    let deskBahasa = document.getElementById("menuDescLanguage");
    if (deskBahasa) {
        let aktif = daftarBahasa.find(b => b.kode === bahasaAktif);
        deskBahasa.textContent = aktif ? aktif.nama : "English";
    }
}


// ----------------------------------------------------------
// 15. TEMA (gelap/terang)
// ----------------------------------------------------------
function gantiTema() {
    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {
        localStorage.setItem("tema", "light");
    } else {
        localStorage.setItem("tema", "dark");
    }

    updateThemeButtonLabel();
    updateMenuHome();
}

// Label tombol tema selalu nunjukin TUJUAN switch-nya (bukan status sekarang)
function updateThemeButtonLabel() {
    let tombol = document.getElementById("themeSwitchBtn");
    if (!tombol) return;
    let sedangTerang = document.body.classList.contains("light");
    let tujuan = sedangTerang ? t("themeDark") : t("themeLight");
    tombol.textContent = t("switchTo") + " " + tujuan;
}


// ----------------------------------------------------------
// 16. BAHASA
// ----------------------------------------------------------
function gantiBahasa(kode) {
    bahasaAktif = kode;
    localStorage.setItem("bahasa", kode);
    terapkanBahasa();
}

// Render daftar pilihan bahasa di sub-halaman Language secara dinamis
// dari array "daftarBahasa". Nambah bahasa baru = otomatis muncul di sini.
function renderPilihanBahasa() {
    let wrap = document.getElementById("languageList");
    if (!wrap) return;

    wrap.innerHTML = "";

    daftarBahasa.forEach(function (bhs) {
        let aktif = bhs.kode === bahasaAktif;

        let btn = document.createElement("button");
        btn.className = "menuItem" + (aktif ? " active" : "") + (!bhs.tersedia ? " disabled" : "");
        btn.disabled = !bhs.tersedia;

        let kananHtml = "";
        if (aktif) {
            kananHtml = `<span class="langCheck">✓</span>`;
        } else if (!bhs.tersedia) {
            kananHtml = `<span class="soonBadge">${t("languageSoon")}</span>`;
        }

        btn.innerHTML =
            `<span class="menuBody">
                <span class="menuTitle">${bhs.nama}</span>
            </span>
            ${kananHtml}`;

        if (bhs.tersedia && !aktif) {
            btn.onclick = function () {
                gantiBahasa(bhs.kode);
            };
        }

        wrap.appendChild(btn);
    });
}


// ----------------------------------------------------------
// 17. KEYBOARD SUPPORT
// ----------------------------------------------------------
document.addEventListener("keydown", function (e) {
    if (e.key >= "0" && e.key <= "9") {
        tambahAngka(e.key);
    }
    if (e.key === ".") {
        tambahAngka(".");
    }
    if (["+", "-", "*", "/", "%"].includes(e.key)) {
        setOperator(e.key);
    }
    if (e.key === "(") {
        tambahKurungBuka();
    }
    if (e.key === ")") {
        tambahKurungTutup();
    }
    if (e.key === "Backspace") {
        hapus();
    }
    if (e.key === "Enter") {
        hitung();
    }
    if (e.key === "Escape") {
        let setting = document.getElementById("setting");
        if (setting && setting.classList.contains("show")) {
            if (panelIndex !== 0) {
                tutupPanel();
            } else {
                bukaSetting();
            }
        }
    }
});


// ----------------------------------------------------------
// 18. INISIALISASI AWAL
// ----------------------------------------------------------
tampilkan();
