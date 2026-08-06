// =========================
// KALKULATOR SESAT
// =========================
const absurdDefault = [
];

// -------------------------
// VARIABEL & INISIALISASI
// -------------------------
let ekspresi = "";
let tingkatSesat = localStorage.getItem("tingkatSesat") || "normal";
let temaAktif = localStorage.getItem("tema") || "dark";
const SIMPAN_DATA = true;

let absurd = [...absurdDefault];
if (SIMPAN_DATA) {
    absurd = JSON.parse(localStorage.getItem("absurd")) || [...absurdDefault];
}

// -------------------------
// SAAT HALAMAN DIBUKA
// -------------------------
window.onload = function () {
    // Terapkan Tema Terakhir
    if (temaAktif === "light") {
        document.body.classList.add("light");
    } else {
        document.body.classList.remove("light");
    }

    // Terapkan Tingkat Sesat Terakhir
    let tombolAktif = document.querySelector(`.levelBtn.${tingkatSesat}`);
    gantiTingkat(tingkatSesat, tombolAktif);

    tampilkan();
    tampilkanAbsurd();
};


// -------------------------
// DISPLAY
// -------------------------
function tampilkan() {
    let display = ekspresi
        .replace(/\*/g, "×")
        .replace(/\//g, "÷");
    let hasil = document.getElementById("hasil");
if (hasil) {
    hasil.value = display === "" ? "0" : display;
  }
}

// -------------------------
// INPUT ANGKA
// -------------------------
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

// KOLOM TAMBAH ABSURD
function tambahAbsurd(){
    let input =
    document.getElementById("inputAbsurd");
    let text = input.value.trim();
    if(text==""){
        return;
    }
    absurd.push(text);
    tampilkanAbsurd();
if(SIMPAN_DATA){
localStorage.setItem(
    "absurd",
    JSON.stringify(absurd)
    );
}
    input.value="";
}

function resetAbsurd(){
    absurd = [...absurdDefault];
    tampilkanAbsurd();
    if(SIMPAN_DATA){
        localStorage.setItem(
            "absurd",
            JSON.stringify(absurd)
        );
    }
}

function tampilkanAbsurd(){
    let list =
    document.getElementById("listAbsurd");
    if(!list) return;
    list.innerHTML = "";
    absurd.forEach(function(item,index){
        list.innerHTML +=
        `<div class="itemAbsurd">
            <span>${item}</span>
        <button
        class="hapusAbsurdBtn"
        onclick="hapusAbsurd(${index})">
        ❌
        </button>
        </div>`;
    });
}

// -------------------------
// KURUNG
// -------------------------
function tambahKurungBuka() {
    ekspresi += "(";
    tampilkan();
}

function tambahKurungTutup() {
    ekspresi += ")";
    tampilkan();
}

// -------------------------
// OPERATOR
// -------------------------
function setOperator(op) {
    if (ekspresi === "") return;
    
    if (op === "%") {
        let terakhir = ekspresi.slice(-1);
        
        if ("+-*/%.".includes(terakhir)) return;
        
        ekspresi += "%";
        tampilkan();
        return;
    }

    // Untuk operator +, -, *, /
    let terakhir = ekspresi.slice(-1);
    
    if ("+-*/".includes(terakhir)) {
        ekspresi = ekspresi.slice(0, -1) + op;
    } else {
        ekspresi += op;
    }
    tampilkan();
}


// -------------------------
// DELETE
// -------------------------
function hapus() {
    if (ekspresi.length > 0) {
        ekspresi =
            ekspresi.slice(0, -1);
    }

    tampilkan();

}

function hapusAbsurd(index){
    if(!confirm("Hapus Jawaban Ini")){
        
        return;
    }
    absurd.splice(index,1);
    tampilkanAbsurd();
    if(SIMPAN_DATA){
        localStorage.setItem(
            "absurd",
            JSON.stringify(absurd)
        );
    }
}

// -------------------------
// RESET
// -------------------------
function resetKalkulator() {
    ekspresi = "";
    tampilkan();
}

// -------------------------
// HITUNG
// -------------------------
function hitung() {
    if (ekspresi === "") return;
    
    let rumus = ekspresi;
    try {
         rumus = rumus.replace(/(\d+(\.\d+)?)\s*([+-])\s*(\d+(\.\d+)?)%/g, "$1 $3 ($1 * $4 / 100)");
         rumus = rumus.replace(/(\d+(\.\d+)?)%/g, "($1/100)");
         
        let hasil = eval(rumus);

        // Easter Egg
        if (tingkatSesat === "brutal") {
            if (rumus === "1/0") {
                document.getElementById("hasil").value = "🕳️ Lubang Hitam";
                ekspresi = "";
                return;
            }
            if (rumus === "0/0") {
                document.getElementById("hasil").value = "🤯 Matematika Bingung";
                ekspresi = "";
                return;
            }
        }

        // Mode Normal
        if (tingkatSesat === "normal") {
            document.getElementById("hasil").value = hasil;
            ekspresi = "";
            return;
        }

        // Penentuan Peluang Berdasarkan Tingkat Sesat
        let benar = 0.8;
        let sesat = 0.15;

        if (tingkatSesat === "ringan") {
            benar = 0.85;
            sesat = 0.15;
        } else if (tingkatSesat === "sedang") {
            benar = 0.5;
            sesat = 0.35;
        } else if (tingkatSesat === "brutal") {
            benar = 0.1;
            sesat = 0.4;
        }

        let random = Math.random();

        // 1. Jawaban Benar
        if (random < benar) {
            document.getElementById("hasil").value = hasil;
        }
        // 2. Jawaban Sesat (Matematika Salah)
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
            document.getElementById("hasil").value =
                jawabanSesat[Math.floor(Math.random() * jawabanSesat.length)];
        }
        // 3. Jawaban Absurd (Teks Kustom)
        else {
            if (absurd.length === 0) {
                document.getElementById("hasil").value = "😶 Kekosongan adalah jawaban";
            } else {
                document.getElementById("hasil").value =
                    absurd[Math.floor(Math.random() * absurd.length)];
            }
        }
    } catch {
        document.getElementById("hasil").value = "Error";
    }
    ekspresi = "";
}


// -------------------------
// TINGKAT KESESATAN
// -------------------------
function gantiTingkat(level, tombol) {
    tingkatSesat = level;
    
    // Simpan tingkat sesat ke localStorage
    localStorage.setItem("tingkatSesat", level);

    document.body.classList.remove("normal", "ringan", "sedang", "brutal");
    document.body.classList.add(level);

    document.querySelectorAll(".levelBtn").forEach(function (btn) {
        btn.classList.remove("active");
    });

    if (tombol) {
        tombol.classList.add("active");
    }

    let judul = document.querySelector(".judul");
    if (judul) {
        if (level === "brutal") {
            judul.innerText = "😈 KALKULATOR SESAT 👿";
        } else {
            judul.innerText = "KALKULATOR SESAT";
        }
    }
}


// -------------------------
// SETTINGS
// -------------------------
function bukaSetting(){
    let setting = document.getElementById("setting");
    setting.classList.toggle("show");
}


// -------------------------
// TEMA
// -------------------------
function gantiTema() {
    document.body.classList.toggle("light");
    
    // Simpan status tema ke localStorage
    if (document.body.classList.contains("light")) {
        localStorage.setItem("tema", "light");
    } else {
        localStorage.setItem("tema", "dark");
    }
}


// -------------------------
// KEYBOARD SUPPORT
// -------------------------
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
});

// -------------------------
// INISIALISASI
// -------------------------
tampilkan();