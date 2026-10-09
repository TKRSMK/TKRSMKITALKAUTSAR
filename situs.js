(function () {
  "use strict";

  /* ---------- Data ---------- */
  var K = window.KONTEN || {};
  var pratinjau = /[?&]pratinjau=1/.test(location.search);
  if (pratinjau) {
    try {
      var d = localStorage.getItem("tkr-draf");
      if (d) { K = JSON.parse(d); document.getElementById("banner-pratinjau").hidden = false; }
    } catch (e) {}
  }
  var S = K.situs || {};
  var LOGO_CADANGAN = "logo-tkr.png", LOGO_SEKOLAH_CADANGAN = "logo-sekolah.png";

  /* ---------- Utilitas ---------- */
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function paragraf(t) {
    return String(t || "").split(/\n\s*\n/).map(function (p) {
      return "<p>" + esc(p.trim()).replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }
  function tgl(s, opsi) {
    if (!s) return "";
    var d = new Date(s + "T00:00:00");
    if (isNaN(d)) return esc(s);
    return d.toLocaleDateString("id-ID", opsi || { day: "numeric", month: "long", year: "numeric" });
  }
  function urutTanggal(a) { return (a || []).slice().sort(function (x, y) { return String(y.tanggal).localeCompare(String(x.tanggal)); }); }
  function inisial(n) {
    var bersih = String(n || "").replace(/,.*$/, "").replace(/\b(Drs?|Ir|H|Hj)\.?\s/gi, "").trim().split(/\s+/);
    return esc(((bersih[0] || "?")[0] + ((bersih[1] || "")[0] || "")).toUpperCase());
  }
  var ikonMobil = '<svg viewBox="0 0 64 40" fill="#fff" aria-hidden="true"><path d="M10 26l5-12c1-3 3-4 6-4h22c3 0 5 1 6 4l5 12h2c2 0 3 1 3 3v5h-6a6 6 0 0 1-12 0H23a6 6 0 0 1-12 0H5v-5c0-2 1-3 3-3zm7 0h30l-4-10H21z"/></svg>';
  function gambar(src, kelas) {
    if (!src) return '<div class="gambar kosong ' + (kelas || "") + '">' + ikonMobil + "</div>";
    return '<div class="gambar ' + (kelas || "") + '"><img src="' + esc(src) + '" alt="" loading="lazy"></div>';
  }

  /* ---------- Logo & footer ---------- */
  function pasangLogo(ids, nilai, cadangan) {
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.onerror = function () { if (el.getAttribute("src") !== cadangan) el.src = cadangan; };
      if (nilai) el.src = nilai;
    });
  }
  pasangLogo(["logoNav", "logoKaki", "introLogo"], S.logo, LOGO_CADANGAN);
  pasangLogo(["logoNavSekolah", "logoKakiSekolah", "introLogoSekolah"], S.logoSekolah, LOGO_SEKOLAH_CADANGAN);
  document.getElementById("tahun").textContent = new Date().getFullYear();
  document.getElementById("kakiKontak").innerHTML =
    "<p><b style='color:#fff'>Alamat</b><br>" + esc(S.alamat) + "</p>" +
    "<p>Telepon: " + esc(S.telepon) + "<br>Email: <a href='mailto:" + esc(S.email) + "'>" + esc(S.email) + "</a></p>" +
    "<p>" + (S.instagram ? "<a href='" + esc(S.instagram) + "' target='_blank' rel='noopener'>Instagram</a>" : "") +
    (S.youtube ? " &nbsp; <a href='" + esc(S.youtube) + "' target='_blank' rel='noopener'>YouTube</a>" : "") + "</p>";

  /* ---------- Transisi pembuka ---------- */
  (function intro() {
    var box = document.getElementById("intro");
    var hemat = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var sudah = false;
    try { sudah = sessionStorage.getItem("tkr-intro") === "1"; } catch (e) {}
    if (sudah || hemat || pratinjau) { box.classList.add("selesai"); return; }
    try { sessionStorage.setItem("tkr-intro", "1"); } catch (e) {}
    document.body.style.overflow = "hidden";

    var tutup = function () {
      if (box.classList.contains("keluar")) return;
      box.classList.add("keluar");
      setTimeout(function () { box.classList.add("selesai"); document.body.style.overflow = ""; }, 1200);
    };
    document.getElementById("introLewati").addEventListener("click", tutup);
    setTimeout(tutup, 3000);
  })();

  /* ---------- Menu ---------- */
  var menuBtn = document.getElementById("menuBtn"), nav = document.getElementById("nav");
  menuBtn.addEventListener("click", function () {
    var b = nav.classList.toggle("buka");
    menuBtn.setAttribute("aria-expanded", b ? "true" : "false");
  });

  /* ---------- Halaman ---------- */
  function kepala(judul, desk, remah) {
    return '<section class="kepala-hal"><div class="wadah">' +
      '<div class="remah"><a href="#/">Beranda</a> / ' + (remah || esc(judul)) + "</div>" +
      "<h1>" + esc(judul) + "</h1>" + (desk ? "<p>" + esc(desk) + "</p>" : "") + "</div></section>";
  }

  function meter(st) {
    var C = 2 * Math.PI * 28, busur = C * 0.75;
    var n = parseFloat(String(st.nilai).replace(",", ".")) || 0;
    var persen = /persen|%/i.test(st.satuan || "");
    var frac = persen ? Math.min(1, n / 100) : 1;
    return '<div class="meter"><svg viewBox="0 0 70 70" aria-hidden="true">' +
      '<circle class="jalur" cx="35" cy="35" r="28" stroke-dasharray="' + busur + " " + C + '" transform="rotate(135 35 35)"/>' +
      '<circle class="isi" cx="35" cy="35" r="28" stroke-dasharray="' + busur + " " + C + '" stroke-dashoffset="' + busur + '" data-akhir="' + (busur * (1 - frac)) + '" transform="rotate(135 35 35)"/>' +
      '</svg><div><div class="meter-n">' + esc(st.nilai) + (persen ? "%" : "") + '</div><div class="meter-l">' + esc(st.label) + '</div>' +
      (persen ? "" : '<div class="meter-s">' + esc(st.satuan) + "</div>") + "</div></div>";
  }

  function itemUmum(p, buka) {
    var d = new Date((p.tanggal || "") + "T00:00:00");
    var blok = isNaN(d) ? "" : '<div class="tanggal-blok"><b>' + d.getDate() + "</b><small>" +
      d.toLocaleDateString("id-ID", { month: "short" }) + "</small></div>";
    return '<details class="umum"' + (buka ? " open" : "") + ' id="' + esc(p.id) + '"><summary><div class="umum-baris">' + blok + '<div style="flex:1">' +
      '<div class="umum-atas">' + (p.penting ? '<span class="lencana penting">Penting</span>' : "") +
      '<span class="lencana">' + esc(p.kategori || "Umum") + "</span><span>" + tgl(p.tanggal) + "</span></div>" +
      "<h3>" + esc(p.judul) + "</h3></div></div></summary><div class='umum-teks'>" + paragraf(p.isi) + "</div></details>";
  }

  function kartuBerita(b, unggul) {
    return '<a class="kartu-berita' + (unggul ? " unggulan" : "") + '" href="#/berita/' + encodeURIComponent(b.id) + '">' +
      gambar(b.gambar) + '<div class="badan"><div class="meta">' + esc(b.kategori || "Berita") + " | " + tgl(b.tanggal) + "</div>" +
      "<h3>" + esc(b.judul) + "</h3><p>" + esc(b.ringkasan) + "</p></div></a>";
  }

  var hal = {
    "": function () {
      var umum = urutTanggal(K.pengumuman).sort(function (a, b) { return (b.penting ? 1 : 0) - (a.penting ? 1 : 0); }).slice(0, 3);
      var berita = urutTanggal(K.berita).slice(0, 3);
      var kata = String(S.judulSambutan || "").replace(/^Selamat Datang Di Website Resmi\s*/i, "");
      return '<section class="hero"><div class="hero-isi"><div>' +
        '<p class="hero-sapa">' + esc(S.kepanjangan || "Teknik Kendaraan Ringan") + "</p>" +
        '<h1><span class="sub">Selamat Datang Di Website Resmi</span>' + esc(kata || S.judulSambutan) + "</h1>" +
        '<p class="hero-desk">' + esc(S.sambutan) + "</p>" +
        '<div class="tombol-baris"><a class="tombol utama" href="#/profil">Lihat profil jurusan</a>' +
        '<a class="tombol garis-t" href="#/pengumuman">Baca pengumuman</a></div></div>' +
        '<div class="hero-logo"><img class="lt" src="' + esc(S.logo || LOGO_CADANGAN) + '" onerror="this.src=\'' + LOGO_CADANGAN + '\'" alt="Logo TKR SMK IT Al Kautsar Blitar">' +
        '<img class="ls" src="' + esc(S.logoSekolah || LOGO_SEKOLAH_CADANGAN) + '" onerror="this.src=\'' + LOGO_SEKOLAH_CADANGAN + '\'" alt="Logo SMK IT Al Kautsar Blitar"></div></div></section>' +
        '<section class="dasbor" aria-label="Dasbor jurusan"><div class="dasbor-isi">' + (K.statistik || []).map(meter).join("") + "</div></section>" +
        '<section class="bagian"><div class="wadah kisi-2">' +
        '<div class="panel"><div class="kepala-bag"><h2>Pengumuman</h2><a class="lihat" href="#/pengumuman">Semua pengumuman</a></div>' +
        (umum.length ? umum.map(function (p) { return itemUmum(p, false); }).join("") : '<p class="kosong-pesan">Belum ada pengumuman.</p>') + "</div>" +
        '<div><div class="kepala-bag"><h2>Berita terbaru</h2><a class="lihat" href="#/berita">Semua berita</a></div>' +
        '<div class="kisi-berita" style="grid-template-columns:1fr 1fr">' +
        (berita.length ? berita.map(function (b, i) { return kartuBerita(b, i === 0); }).join("") : '<p class="kosong-pesan">Belum ada berita.</p>') +
        "</div></div></div></section>" +
        '<section class="bagian" style="padding-top:0"><div class="wadah"><div class="visi"><small>Slogan jurusan</small>' + esc(S.slogan) + "</div></div></section>";
    },

    profil: function () {
      var P = K.profil || {};
      return kepala("Profil Jurusan", S.kepanjangan + " SMK IT Al Kautsar Blitar") +
        '<section class="bagian"><div class="wadah kisi-2" style="align-items:start">' +
        '<div><h2>Tentang TKR</h2>' + paragraf(P.deskripsi) + "</div>" +
        '<div class="visi"><small>Visi</small>' + esc(P.visi) + "</div></div></section>" +
        '<section class="bagian" style="padding-top:0"><div class="wadah"><h2>Misi</h2><ol class="daftar-misi">' +
        (P.misi || []).map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + "</ol></div></section>" +
        '<section class="bagian" style="padding-top:0"><div class="wadah"><h2>Kompetensi keahlian</h2><div class="kisi-4">' +
        (P.kompetensi || []).map(function (k) { return '<div class="kotak"><h3>' + esc(k.judul) + "</h3><p>" + esc(k.uraian) + "</p></div>"; }).join("") +
        "</div></div></section>" +
        '<section class="bagian" style="padding-top:0"><div class="wadah"><h2>Fasilitas</h2><div class="kisi-4">' +
        (P.fasilitas || []).map(function (k) { return '<div class="kotak"><h3>' + esc(k.nama) + "</h3><p>" + esc(k.uraian) + "</p></div>"; }).join("") +
        "</div></div></section>" +
        '<section class="bagian" style="padding-top:0"><div class="wadah"><h2>Mitra industri</h2><div class="mitra">' +
        (P.mitra || []).map(function (m) { return "<span>" + esc(m) + "</span>"; }).join("") + "</div></div></section>";
    },

    pendidik: function () {
      var L = K.pendidik || [];
      return kepala("Tenaga Pendidik dan Pengajar", "Guru dan tenaga kependidikan yang membimbing pembelajaran teori dan praktik di bengkel TKR.") +
        '<section class="bagian"><div class="wadah">' + (L.length ? '<div class="kisi-guru">' + L.map(function (g) {
          return '<article class="guru"><div class="guru-foto">' + (g.foto ? '<img src="' + esc(g.foto) + '" alt="Foto ' + esc(g.nama) + '" loading="lazy">' : '<div class="inisial">' + inisial(g.nama) + "</div>") +
            '</div><div class="badan"><h3>' + esc(g.nama) + '</h3><div class="jab">' + esc(g.jabatan) + '</div><p class="bid">' + esc(g.bidang) +
            (g.pendidikan ? "<br>" + esc(g.pendidikan) : "") + "</p></div></article>";
        }).join("") + "</div>" : '<p class="kosong-pesan">Data tenaga pendidik belum ditambahkan.</p>') + "</div></section>";
    },

    alumni: function () {
      var A = K.alumni || {};
      return kepala("Lulusan dan Alumni", A.pengantar) +
        '<section class="bagian"><div class="wadah kisi-2" style="align-items:start"><div><h2>Sebaran lulusan</h2><p style="color:var(--abu)">Persentase kegiatan lulusan setelah menyelesaikan pendidikan.</p></div>' +
        '<div class="panel serapan">' + (A.serapan || []).map(function (s) {
          return '<div><div class="batang-l"><span>' + esc(s.label) + "</span><span>" + esc(s.persen) + '%</span></div><div class="batang"><i data-w="' + (parseFloat(s.persen) || 0) + '"></i></div></div>';
        }).join("") + "</div></div></section>" +
        '<section class="bagian" style="padding-top:0"><div class="wadah"><h2>Cerita alumni</h2><div class="kisi-alumni">' +
        (A.daftar || []).map(function (a) {
          return '<article class="alum"><blockquote>' + esc(a.testimoni) + '</blockquote><div class="alum-orang">' +
            (a.foto ? '<img src="' + esc(a.foto) + '" alt="">' : '<div class="inisial">' + inisial(a.nama) + "</div>") +
            "<div><b>" + esc(a.nama) + "</b><small>Angkatan " + esc(a.angkatan) + "</small><small>" + esc(a.posisi) + (a.tempat ? ", " + esc(a.tempat) : "") + "</small></div></div></article>";
        }).join("") + "</div></div></section>";
    },

    pengumuman: function (id) {
      var L = urutTanggal(K.pengumuman);
      return kepala("Pengumuman", "Informasi resmi untuk peserta didik, orang tua, dan calon peserta didik.") +
        '<section class="bagian"><div class="wadah" style="max-width:860px"><div class="panel">' +
        (L.length ? L.map(function (p, i) { return itemUmum(p, id ? p.id === id : i === 0); }).join("") : '<p class="kosong-pesan">Belum ada pengumuman.</p>') +
        "</div></div></section>";
    },

    berita: function (id) {
      var L = urutTanggal(K.berita);
      if (id) {
        var b = L.filter(function (x) { return String(x.id) === id; })[0];
        if (!b) return kepala("Berita tidak ditemukan", "Berita mungkin telah dihapus.", '<a href="#/berita">Berita</a>') + '<section class="bagian"><div class="wadah"><a class="tombol utama" href="#/berita">Kembali ke daftar berita</a></div></section>';
        var lain = L.filter(function (x) { return x.id !== b.id; }).slice(0, 3);
        return kepala(b.judul, (b.kategori || "Berita") + " | " + tgl(b.tanggal) + (b.penulis ? " | " + b.penulis : ""), '<a href="#/berita">Berita</a>') +
          '<section class="bagian"><article class="wadah artikel">' + gambar(b.gambar) + '<div class="artikel-teks">' + paragraf(b.isi) + "</div>" +
          '<p><a class="tombol garis-t" href="#/berita">Kembali ke daftar berita</a></p></article></section>' +
          (lain.length ? '<section class="bagian" style="padding-top:0"><div class="wadah"><h2>Berita lainnya</h2><div class="kisi-berita">' + lain.map(function (x) { return kartuBerita(x); }).join("") + "</div></div></section>" : "");
      }
      var kat = [];
      L.forEach(function (x) { if (x.kategori && kat.indexOf(x.kategori) < 0) kat.push(x.kategori); });
      return kepala("Berita", "Kegiatan, prestasi, dan kabar terbaru dari program keahlian TKR.") +
        '<section class="bagian"><div class="wadah"><div class="cari"><label class="sr" for="q">Cari berita</label><input id="q" type="search" placeholder="Cari judul berita">' +
        '<label class="sr" for="k">Kategori</label><select id="k"><option value="">Semua kategori</option>' + kat.map(function (k) { return "<option>" + esc(k) + "</option>"; }).join("") + "</select></div>" +
        '<div class="kisi-berita" id="daftarBerita"></div></div></section>';
    }
  };

  function setelRender(r, id) {
    requestAnimationFrame(function () {
      document.querySelectorAll(".meter .isi").forEach(function (c) { c.style.strokeDashoffset = c.getAttribute("data-akhir"); });
      document.querySelectorAll(".batang i").forEach(function (b) { b.style.width = b.getAttribute("data-w") + "%"; });
    });
    if (r === "berita" && !id) {
      var q = document.getElementById("q"), k = document.getElementById("k"), w = document.getElementById("daftarBerita");
      var tampil = function () {
        var t = q.value.toLowerCase(), kv = k.value;
        var L = urutTanggal(K.berita).filter(function (b) {
          return (!kv || b.kategori === kv) && (!t || (b.judul + " " + b.ringkasan).toLowerCase().indexOf(t) > -1);
        });
        w.innerHTML = L.length ? L.map(function (b, i) { return kartuBerita(b, i === 0 && !t && !kv); }).join("") : '<p class="kosong-pesan" style="grid-column:1/-1">Tidak ada berita yang sesuai pencarian.</p>';
      };
      q.addEventListener("input", tampil); k.addEventListener("change", tampil); tampil();
    }
  }

  var judulDasar = "TKR SMK IT Al Kautsar Blitar";
  var namaHal = { profil: "Profil Jurusan", pendidik: "Tenaga Pendidik", alumni: "Lulusan dan Alumni", pengumuman: "Pengumuman", berita: "Berita" };

  function jalankan() {
    var h = location.hash.replace(/^#\/?/, "").split("/");
    var r = h[0] || "", id = h[1] ? decodeURIComponent(h[1]) : "";
    if (!hal[r]) r = "";
    var main = document.getElementById("isi");
    main.classList.remove("ganti"); void main.offsetWidth; main.classList.add("ganti");
    main.innerHTML = hal[r](id);
    setelRender(r, id);
    document.querySelectorAll(".nav a").forEach(function (a) { a.classList.toggle("aktif", a.getAttribute("data-r") === r); });
    nav.classList.remove("buka"); menuBtn.setAttribute("aria-expanded", "false");
    document.title = (r ? namaHal[r] + " | " : "Beranda | ") + judulDasar;
    if (r === "pengumuman" && id) { var el = document.getElementById(id); if (el) el.scrollIntoView(); }
    else window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", jalankan);
  jalankan();
})();
