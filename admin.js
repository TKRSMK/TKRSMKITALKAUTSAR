(function () {
  "use strict";
  var KUNCI_DRAF = "tkr-draf", KUNCI_GH = "tkr-github";
  var asli = JSON.parse(JSON.stringify(window.KONTEN || {}));
  var data;
  try { data = JSON.parse(localStorage.getItem(KUNCI_DRAF)) || null; } catch (e) { data = null; }
  var adaDraf = !!data;
  if (!data) data = JSON.parse(JSON.stringify(asli));

  /* ---------- Skema formulir ---------- */
  var F = {
    situs: [
      { k: "judulSambutan", l: "Judul sambutan" }, { k: "namaSingkat", l: "Nama singkat" },
      { k: "kepanjangan", l: "Nama program keahlian" }, { k: "slogan", l: "Slogan" },
      { k: "sambutan", l: "Teks sambutan di beranda", t: "area" },
      { k: "logo", l: "Logo jurusan TKR", t: "gambar", bantu: "Gunakan berkas PNG berlatar transparan agar tampil rapi." },
      { k: "logoSekolah", l: "Logo sekolah", t: "gambar", bantu: "Gunakan berkas PNG berlatar transparan agar tampil rapi." },
      { k: "latarBeranda", l: "Gambar latar beranda", t: "gambar", maks: 1920, bantu: "Foto mendatar (landscape), misalnya suasana bengkel atau gedung sekolah. Gambar ditampilkan samar di belakang judul beranda." },
      { k: "kesamaranLatar", l: "Kejelasan gambar latar (persen)", t: "angka", bantu: "0 berarti tidak terlihat, 100 berarti jelas penuh. Nilai yang disarankan 10 sampai 25. Bila dikosongkan, dipakai 15." },
      { k: "alamatWeb", l: "Alamat website (opsional)", bantu: "Kosongkan bila memakai alamat github.io. Isi hanya bila memakai domain sendiri, contoh: https://tkr.smkitalkautsar.sch.id/" },
      { k: "alamat", l: "Alamat" }, { k: "telepon", l: "Telepon" }, { k: "email", l: "Email" },
      { k: "instagram", l: "Tautan Instagram" }, { k: "youtube", l: "Tautan YouTube" }
    ],
    statistik: [{ k: "label", l: "Keterangan" }, { k: "nilai", l: "Nilai" }, { k: "satuan", l: "Satuan", bantu: "Tulis \"persen\" agar ditampilkan sebagai meter persentase." }],
    galeri: [{ k: "gambar", l: "Gambar", t: "gambar", maks: 1920, bantu: "Foto mendatar, misalnya bengkel praktik, kegiatan siswa, atau gedung sekolah." }, { k: "keterangan", l: "Keterangan singkat (opsional)", bantu: "Tampil di bawah judul Dasbor jurusan saat gambar ini aktif." }],
    kompetensi: [{ k: "judul", l: "Nama kompetensi" }, { k: "uraian", l: "Uraian", t: "area" }],
    fasilitas: [{ k: "nama", l: "Nama fasilitas" }, { k: "uraian", l: "Uraian", t: "area" }],
    pendidik: [{ k: "nama", l: "Nama lengkap dan gelar" }, { k: "jabatan", l: "Jabatan" }, { k: "bidang", l: "Bidang atau mata pelajaran" }, { k: "pendidikan", l: "Pendidikan terakhir" }, { k: "foto", l: "Foto", t: "gambar" }],
    serapan: [{ k: "label", l: "Kategori" }, { k: "persen", l: "Persentase", t: "angka" }],
    daftarAlumni: [{ k: "nama", l: "Nama alumni" }, { k: "angkatan", l: "Tahun lulus" }, { k: "posisi", l: "Posisi atau status" }, { k: "tempat", l: "Tempat kerja atau studi" }, { k: "testimoni", l: "Testimoni", t: "area" }, { k: "foto", l: "Foto", t: "gambar" }],
    pengumuman: [{ k: "judul", l: "Judul" }, { k: "tanggal", l: "Tanggal", t: "tanggal" }, { k: "kategori", l: "Kategori" }, { k: "penting", l: "Tandai sebagai penting", t: "cek" }, { k: "isi", l: "Isi pengumuman", t: "area", bantu: "Pisahkan paragraf dengan satu baris kosong." }],
    berita: [{ k: "judul", l: "Judul berita" }, { k: "tanggal", l: "Tanggal", t: "tanggal" }, { k: "kategori", l: "Kategori" }, { k: "penulis", l: "Penulis" }, { k: "gambar", l: "Gambar utama", t: "gambar" }, { k: "ringkasan", l: "Ringkasan singkat", t: "area" }, { k: "isi", l: "Isi berita", t: "area", bantu: "Pisahkan paragraf dengan satu baris kosong." }]
  };

  /* ---------- Utilitas ---------- */
  function el(tag, atr, anak) {
    var e = document.createElement(tag);
    for (var a in (atr || {})) { if (a === "text") e.textContent = atr[a]; else if (a.indexOf("on") === 0) e.addEventListener(a.slice(2), atr[a]); else e.setAttribute(a, atr[a]); }
    (anak || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  var tNotif;
  function notif(t) { var n = document.getElementById("notif"); n.textContent = t; n.classList.add("tampil"); clearTimeout(tNotif); tNotif = setTimeout(function () { n.classList.remove("tampil"); }, 3200); }
  var tSimpan;
  function ubah() {
    clearTimeout(tSimpan);
    tSimpan = setTimeout(function () {
      try { localStorage.setItem(KUNCI_DRAF, JSON.stringify(data)); adaDraf = true; perbaruiStatus("Draf tersimpan di peramban ini, belum diterbitkan."); }
      catch (e) { perbaruiStatus("Draf terlalu besar untuk disimpan di peramban. Kurangi ukuran gambar atau terbitkan sekarang."); }
    }, 400);
  }
  function perbaruiStatus(t) { var s = document.getElementById("status"); if (s) s.textContent = t; }
  function hariIni() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

  function kompres(file, maksUkuran) {
    return new Promise(function (ok, gagal) {
      var r = new FileReader();
      r.onerror = gagal;
      r.onload = function () {
        var img = new Image();
        img.onerror = gagal;
        img.onload = function () {
          var maks = maksUkuran || 1200, s = Math.min(1, maks / Math.max(img.width, img.height));
          var c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          ok(/png|svg/.test(file.type) ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.82));
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  /* ---------- Pembuat bidang ---------- */
  function bidang(obj, f, segar) {
    var w = el("div", { "class": "bidang" }), id = "f" + Math.random().toString(36).slice(2);
    w.appendChild(el("label", { "for": id, text: f.l }));
    var inp;
    if (f.t === "area") {
      inp = el("textarea", { id: id }); inp.value = obj[f.k] || "";
      inp.addEventListener("input", function () { obj[f.k] = inp.value; ubah(); if (segar) segar(); });
    } else if (f.t === "cek") {
      w.innerHTML = "";
      inp = el("input", { type: "checkbox", id: id }); inp.checked = !!obj[f.k];
      inp.addEventListener("change", function () { obj[f.k] = inp.checked; ubah(); });
      w.appendChild(el("label", { "for": id }, [inp, " " + f.l]));
      return w;
    } else if (f.t === "gambar") {
      var pv = el("img", { alt: "" }); var area = el("div", { "class": "pratayang" });
      var teks = el("input", { type: "text", id: id, placeholder: "contoh: gambar/foto-kegiatan.jpg" });
      var nilai = obj[f.k] || "";
      teks.value = /^data:/.test(nilai) ? "(gambar baru, akan diunggah saat diterbitkan)" : nilai;
      var tampilPv = function () { var v = obj[f.k]; pv.style.display = v ? "" : "none"; if (v) pv.src = /^data:|^https?:/.test(v) ? v : v; };
      teks.addEventListener("input", function () { obj[f.k] = teks.value.trim(); tampilPv(); ubah(); });
      var berkas = el("input", { type: "file", accept: "image/*" });
      berkas.addEventListener("change", function () {
        if (!berkas.files[0]) return;
        kompres(berkas.files[0], f.maks).then(function (url) { obj[f.k] = url; teks.value = "(gambar baru, akan diunggah saat diterbitkan)"; tampilPv(); ubah(); notif("Gambar ditambahkan."); })
          .catch(function () { notif("Berkas tidak dapat dibaca sebagai gambar."); });
      });
      var hapus = el("button", { type: "button", "class": "tombol hapus kecil", text: "Hapus gambar", onclick: function () { obj[f.k] = ""; teks.value = ""; tampilPv(); ubah(); } });
      area.appendChild(pv); area.appendChild(berkas); area.appendChild(hapus);
      w.appendChild(teks); w.appendChild(area); tampilPv();
      if (f.bantu) w.appendChild(el("div", { "class": "bantu", text: f.bantu }));
      return w;
    } else {
      inp = el("input", { type: f.t === "tanggal" ? "date" : f.t === "angka" ? "number" : "text", id: id });
      inp.value = obj[f.k] == null ? "" : obj[f.k];
      inp.addEventListener("input", function () { obj[f.k] = f.t === "angka" ? Number(inp.value) : inp.value; ubah(); if (segar) segar(); });
    }
    w.appendChild(inp);
    if (f.bantu) w.appendChild(el("div", { "class": "bantu", text: f.bantu }));
    return w;
  }

  function daftarObjek(arr, skema, opsi) {
    var w = el("div");
    var gambarUlang = function () { w.innerHTML = ""; isi(); };
    function isi() {
      var tambah = el("button", { type: "button", "class": "tombol", text: opsi.tambahTeks || "Tambah", onclick: function () {
        var baru = opsi.baru ? opsi.baru() : {};
        if (opsi.diAtas) arr.unshift(baru); else arr.push(baru);
        opsi._buka = baru;
        ubah(); gambarUlang(); notif("Item baru ditambahkan. Lengkapi isinya.");
      } });
      w.appendChild(el("div", { style: "margin-bottom:14px" }, [tambah]));
      if (!arr.length) w.appendChild(el("p", { "class": "status", text: "Belum ada data. Gunakan tombol di atas untuk menambahkan." }));
      arr.forEach(function (item, i) {
        var kartu = el("div", { "class": "kartu" + (arr.length > 3 && item !== opsi._buka ? " tutup" : "") });
        var judul = el("b", { text: item[opsi.judul] || "(tanpa judul)" });
        var segar = function () { judul.textContent = item[opsi.judul] || "(tanpa judul)"; };
        var naik = el("button", { type: "button", "class": "tombol dua kecil", text: "Naik", title: "Pindah ke atas", onclick: function (e) { e.stopPropagation(); if (i > 0) { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); ubah(); gambarUlang(); } } });
        var turun = el("button", { type: "button", "class": "tombol dua kecil", text: "Turun", title: "Pindah ke bawah", onclick: function (e) { e.stopPropagation(); if (i < arr.length - 1) { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); ubah(); gambarUlang(); } } });
        var hapus = el("button", { type: "button", "class": "tombol hapus", text: "Hapus", onclick: function (e) {
          e.stopPropagation();
          if (confirm("Hapus \"" + (item[opsi.judul] || "item ini") + "\"?")) { arr.splice(i, 1); ubah(); gambarUlang(); notif("Item dihapus."); }
        } });
        var atas = el("div", { "class": "kartu-atas", onclick: function () { kartu.classList.toggle("tutup"); } }, [judul, el("div", { "class": "urut" }, [naik, turun, hapus])]);
        var badan = el("div", { "class": "badan" });
        skema.forEach(function (f) { badan.appendChild(bidang(item, f, f.k === opsi.judul ? segar : null)); });
        kartu.appendChild(atas); kartu.appendChild(badan); w.appendChild(kartu);
      });
    }
    isi();
    return w;
  }

  function daftarTeks(obj, kunci, label) {
    if (!Array.isArray(obj[kunci])) obj[kunci] = [];
    var arr = obj[kunci], w = el("div", { "class": "bidang" }, [el("label", { text: label })]), isiW = el("div");
    function isi() {
      isiW.innerHTML = "";
      arr.forEach(function (t, i) {
        var inp = el("input", { type: "text", style: "width:100%;padding:10px 12px;border:1px solid #DDE4F0;border-radius:8px;font:inherit" }); inp.value = t;
        inp.addEventListener("input", function () { arr[i] = inp.value; ubah(); });
        isiW.appendChild(el("div", { "class": "baris-teks" }, [inp, el("button", { type: "button", "class": "tombol hapus", text: "Hapus", onclick: function () { arr.splice(i, 1); ubah(); isi(); } })]));
      });
    }
    isi();
    w.appendChild(isiW);
    w.appendChild(el("button", { type: "button", "class": "tombol dua kecil", text: "Tambah baris", onclick: function () { arr.push(""); ubah(); isi(); } }));
    return w;
  }

  function kartuForm(judul, anak) { return el("div", { "class": "kartu" }, [el("h2", { text: judul, style: "font-size:1.4rem;margin-bottom:10px" })].concat(anak)); }

  /* ---------- Bagian ---------- */
  var bagian = {
    situs: { t: "Identitas situs", r: function () { data.situs = data.situs || {}; return [kartuForm("Identitas dan kontak", F.situs.map(function (f) { return bidang(data.situs, f); }))]; } },
    statistik: { t: "Dasbor statistik", r: function () { data.statistik = data.statistik || []; return [el("p", { "class": "status", text: "Angka ini tampil pada dasbor di halaman beranda." }), daftarObjek(data.statistik, F.statistik, { judul: "label", tambahTeks: "Tambah statistik" })]; } },
    galeri: { t: "Gambar latar dasbor", r: function () { data.galeriDasbor = data.galeriDasbor || []; return [el("p", { "class": "status", text: "Gambar berganti otomatis setiap 6 detik di belakang dasbor beranda. Bila daftar kosong, ilustrasi bawaan yang ditampilkan." }), daftarObjek(data.galeriDasbor, F.galeri, { judul: "keterangan", tambahTeks: "Tambah gambar" })]; } },
    profil: { t: "Profil jurusan", r: function () {
      var P = data.profil = data.profil || {};
      ["kompetensi", "fasilitas"].forEach(function (k) { P[k] = P[k] || []; });
      return [
        kartuForm("Deskripsi dan visi", [bidang(P, { k: "deskripsi", l: "Deskripsi jurusan", t: "area" }), bidang(P, { k: "visi", l: "Visi", t: "area" })]),
        kartuForm("Misi", [daftarTeks(P, "misi", "Butir misi")]),
        kartuForm("Kompetensi keahlian", [daftarObjek(P.kompetensi, F.kompetensi, { judul: "judul", tambahTeks: "Tambah kompetensi" })]),
        kartuForm("Fasilitas", [daftarObjek(P.fasilitas, F.fasilitas, { judul: "nama", tambahTeks: "Tambah fasilitas" })]),
        kartuForm("Mitra industri", [daftarTeks(P, "mitra", "Nama mitra")])
      ];
    } },
    pendidik: { t: "Tenaga pendidik", r: function () { data.pendidik = data.pendidik || []; return [daftarObjek(data.pendidik, F.pendidik, { judul: "nama", tambahTeks: "Tambah tenaga pendidik" })]; } },
    alumni: { t: "Lulusan dan alumni", r: function () {
      var A = data.alumni = data.alumni || {}; A.serapan = A.serapan || []; A.daftar = A.daftar || [];
      return [
        kartuForm("Pengantar", [bidang(A, { k: "pengantar", l: "Teks pengantar", t: "area" })]),
        kartuForm("Sebaran lulusan", [daftarObjek(A.serapan, F.serapan, { judul: "label", tambahTeks: "Tambah kategori" })]),
        kartuForm("Cerita alumni", [daftarObjek(A.daftar, F.daftarAlumni, { judul: "nama", tambahTeks: "Tambah alumni", diAtas: true })])
      ];
    } },
    pengumuman: { t: "Pengumuman", r: function () { data.pengumuman = data.pengumuman || []; return [daftarObjek(data.pengumuman, F.pengumuman, { judul: "judul", tambahTeks: "Tambah pengumuman", diAtas: true, baru: function () { return { id: "p" + Date.now(), judul: "", tanggal: hariIni(), kategori: "Umum", penting: false, isi: "" }; } })]; } },
    berita: { t: "Berita", r: function () { data.berita = data.berita || []; return [daftarObjek(data.berita, F.berita, { judul: "judul", tambahTeks: "Tulis berita baru", diAtas: true, baru: function () { return { id: "b" + Date.now(), judul: "", tanggal: hariIni(), kategori: "Kegiatan", penulis: "Admin TKR", gambar: "", ringkasan: "", isi: "" }; } })]; } },
    terbit: { t: "Simpan dan terbitkan", r: panelTerbit }
  };

  function panelTerbit() {
    var gh; try { gh = JSON.parse(localStorage.getItem(KUNCI_GH)) || {}; } catch (e) { gh = {}; }
    gh.cabang = gh.cabang || "main";
    var token = ""; try { token = sessionStorage.getItem("tkr-token") || localStorage.getItem("tkr-token") || ""; } catch (e) {}
    var ingat = el("input", { type: "checkbox", id: "ingat" }); ingat.checked = !!localStorage.getItem("tkr-token");
    var f = { pemilik: el("input", { type: "text", placeholder: "nama-akun-github" }), repo: el("input", { type: "text", placeholder: "nama-repository" }), cabang: el("input", { type: "text" }), token: el("input", { type: "password", placeholder: "github_pat_..." }) };
    f.pemilik.value = gh.pemilik || ""; f.repo.value = gh.repo || ""; f.cabang.value = gh.cabang; f.token.value = token;
    function b(l, inp, bantu) { return el("div", { "class": "bidang" }, [el("label", { text: l }), inp, bantu ? el("div", { "class": "bantu", text: bantu }) : null]); }
    var log = el("div", { "class": "status", style: "margin-top:10px;white-space:pre-line" });
    var tombolTerbit = el("button", { type: "button", "class": "tombol", text: "Terbitkan ke GitHub", onclick: function () {
      var cfg = { pemilik: f.pemilik.value.trim(), repo: f.repo.value.trim(), cabang: f.cabang.value.trim() || "main" };
      var tk = f.token.value.trim();
      if (!cfg.pemilik || !cfg.repo || !tk) { notif("Lengkapi nama akun, repository, dan token terlebih dahulu."); return; }
      localStorage.setItem(KUNCI_GH, JSON.stringify(cfg));
      try { sessionStorage.setItem("tkr-token", tk); if (ingat.checked) localStorage.setItem("tkr-token", tk); else localStorage.removeItem("tkr-token"); } catch (e) {}
      tombolTerbit.disabled = true; log.textContent = "Memulai penerbitan...";
      terbitkan(cfg, tk, function (t) { log.textContent += "\n" + t; })
        .then(function () { log.textContent += "\nSelesai. Perubahan tampil di situs dalam 1 sampai 3 menit."; notif("Konten berhasil diterbitkan."); perbaruiStatus("Semua perubahan sudah diterbitkan."); })
        .catch(function (e) { log.textContent += "\nGagal: " + e.message; notif("Penerbitan gagal. Periksa keterangan di bawah tombol."); })
        .then(function () { tombolTerbit.disabled = false; });
    } });
    return [
      kartuForm("Pratinjau", [el("p", { text: "Lihat tampilan situs dengan draf terbaru sebelum diterbitkan." }),
        el("button", { type: "button", "class": "tombol biru", text: "Buka pratinjau", onclick: function () { localStorage.setItem(KUNCI_DRAF, JSON.stringify(data)); window.open("index.html?pratinjau=1#/", "_blank"); } })]),
      kartuForm("Cara 1: Terbitkan langsung ke GitHub", [
        el("div", { "class": "info", text: "Token hanya disimpan di peramban ini dan dikirim langsung ke GitHub. Buat token jenis fine-grained dengan izin Contents: Read and write khusus untuk repository situs ini. Jangan gunakan fitur ingat token pada komputer bersama." }),
        el("div", { "class": "dua-kol" }, [b("Nama akun atau organisasi GitHub", f.pemilik), b("Nama repository", f.repo), b("Cabang (branch)", f.cabang, "Umumnya main."), b("Token akses GitHub", f.token)]),
        el("div", { "class": "bidang" }, [el("label", { "for": "ingat" }, [ingat, " Ingat token di perangkat ini"])]),
        tombolTerbit, log
      ]),
      kartuForm("Cara 2: Unduh lalu unggah manual", [
        el("p", { text: "Unduh berkas konten.js, lalu unggah ke repository GitHub untuk menggantikan berkas lama. Gambar baru ikut tersimpan di dalam berkas sehingga ukurannya dapat menjadi besar." }),
        el("button", { type: "button", "class": "tombol dua", text: "Unduh konten.js", onclick: function () {
          var blob = new Blob([teksKonten(data)], { type: "text/javascript" });
          var a = el("a", { href: URL.createObjectURL(blob), download: "konten.js" }); document.body.appendChild(a); a.click(); a.remove();
          notif("Berkas konten.js diunduh.");
        } })
      ]),
      kartuForm("Buang draf", [el("p", { text: "Kembalikan semua isian ke versi yang sedang tayang di situs. Perubahan yang belum diterbitkan akan hilang." }),
        el("button", { type: "button", "class": "tombol hapus", text: "Buang draf", onclick: function () {
          if (!confirm("Buang semua perubahan yang belum diterbitkan?")) return;
          localStorage.removeItem(KUNCI_DRAF); data = JSON.parse(JSON.stringify(asli)); adaDraf = false; tampil("terbit"); notif("Draf dibuang.");
        } })])
    ];
  }

  /* ---------- GitHub ---------- */
  function namaBerkasBerita(id) { return String(id).replace(/[^A-Za-z0-9-]/g, "-"); }
  function sidik(t) { var h = 5381; for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  function escH(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function halamanBagi(b, dasar) {
    var abs = function (p) { return !p ? "" : /^https?:/.test(p) ? p : dasar + String(p).replace(/^\.?\//, ""); };
    var gambar = abs(b.gambar) || abs((data.situs && data.situs.logo) || "logo-tkr.png");
    var url = dasar + "berita/" + namaBerkasBerita(b.id) + ".html";
    var tujuan = "../index.html#/berita/" + encodeURIComponent(b.id);
    var judul = escH(b.judul || "Berita TKR SMK IT Al Kautsar Blitar"), desk = escH(b.ringkasan || "");
    return '<!DOCTYPE html>\n<html lang="id">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      "<title>" + judul + " | TKR SMK IT Al Kautsar Blitar</title>\n" +
      '<meta name="description" content="' + desk + '">\n' +
      '<meta property="og:type" content="article">\n<meta property="og:site_name" content="TKR SMK IT Al Kautsar Blitar">\n' +
      '<meta property="og:title" content="' + judul + '">\n<meta property="og:description" content="' + desk + '">\n' +
      '<meta property="og:image" content="' + escH(gambar) + '">\n<meta property="og:url" content="' + escH(url) + '">\n' +
      '<meta name="twitter:card" content="summary_large_image">\n' +
      '<meta http-equiv="refresh" content="0; url=' + escH(tujuan) + '">\n</head>\n<body>\n' +
      '<p><a href="' + escH(tujuan) + '">Buka berita: ' + judul + "</a></p>\n" +
      "<script>location.replace(" + JSON.stringify(tujuan) + ");</script>\n</body>\n</html>\n";
  }
  function teksKonten(d) { return "window.KONTEN = " + JSON.stringify(d, null, 2) + ";\n"; }
  function keBase64(teks) { var by = new TextEncoder().encode(teks), s = ""; for (var i = 0; i < by.length; i += 0x8000) s += String.fromCharCode.apply(null, by.subarray(i, i + 0x8000)); return btoa(s); }
  function api(cfg, tk, jalur, metode, badan) {
    return fetch("https://api.github.com/repos/" + encodeURIComponent(cfg.pemilik) + "/" + encodeURIComponent(cfg.repo) + "/contents/" + jalur + (metode === "GET" ? "?ref=" + encodeURIComponent(cfg.cabang) : ""), {
      method: metode, headers: { "Authorization": "Bearer " + tk, "Accept": "application/vnd.github+json" }, body: badan ? JSON.stringify(badan) : undefined
    }).then(function (r) {
      if (r.status === 404 && metode === "GET") return null;
      return r.json().then(function (j) {
        if (!r.ok) { var p = r.status === 401 ? "Token tidak valid atau kedaluwarsa." : r.status === 403 ? "Token tidak memiliki izin menulis ke repository ini." : r.status === 404 ? "Repository atau cabang tidak ditemukan. Periksa penulisan nama." : (j.message || "Kesalahan " + r.status); throw new Error(p); }
        return j;
      });
    });
  }
  function tulis(cfg, tk, jalur, base64, pesan) {
    return api(cfg, tk, jalur, "GET").then(function (ada) {
      return api(cfg, tk, jalur, "PUT", { message: pesan, content: base64, branch: cfg.cabang, sha: ada && ada.sha ? ada.sha : undefined });
    });
  }
  function terbitkan(cfg, tk, catat) {
    var antre = [], n = 0;
    (function cari(o) {
      if (!o || typeof o !== "object") return;
      Object.keys(o).forEach(function (k) {
        if (typeof o[k] === "string" && /^data:image\//.test(o[k])) antre.push({ o: o, k: k });
        else cari(o[k]);
      });
    })(data);
    var rantai = Promise.resolve();
    antre.forEach(function (it) {
      rantai = rantai.then(function () {
        var png = /^data:image\/png/.test(it.o[it.k]);
        var nama = "gambar/" + hariIni() + "-" + Date.now().toString(36) + (n++) + (png ? ".png" : ".jpg");
        catat("Mengunggah " + nama);
        return tulis(cfg, tk, nama, it.o[it.k].split(",")[1], "Tambah gambar " + nama).then(function () { it.o[it.k] = nama; });
      });
    });
    var dasar = (data.situs && data.situs.alamatWeb) ? String(data.situs.alamatWeb).replace(/\/?$/, "/") : "https://" + cfg.pemilik.toLowerCase() + ".github.io/" + cfg.repo + "/";
    (data.berita || []).forEach(function (b) {
      rantai = rantai.then(function () {
        var tanda = sidik([dasar, b.id, b.judul, b.ringkasan, b.gambar, data.situs && data.situs.logo].join("|"));
        if (b.halamanBagi === tanda) return;
        var nama = "berita/" + namaBerkasBerita(b.id) + ".html";
        catat("Membuat halaman bagikan " + nama);
        return tulis(cfg, tk, nama, keBase64(halamanBagi(b, dasar)), "Halaman bagikan " + (b.judul || b.id)).then(function () { b.halamanBagi = tanda; });
      });
    });
    return rantai.then(function () {
      catat("Menyimpan konten.js");
      return tulis(cfg, tk, "konten.js", keBase64(teksKonten(data)), "Perbarui konten situs " + hariIni());
    }).then(function () {
      asli = JSON.parse(JSON.stringify(data));
      localStorage.removeItem(KUNCI_DRAF); adaDraf = false;
    });
  }

  /* ---------- Tata letak ---------- */
  var aktif = "berita";
  function tampil(k) {
    aktif = k;
    var tabs = document.getElementById("tabs"); tabs.innerHTML = "";
    Object.keys(bagian).forEach(function (kk) {
      tabs.appendChild(el("button", { type: "button", "class": "tab" + (kk === k ? " aktif" : "") + (kk === "terbit" ? " terbit" : ""), text: bagian[kk].t, onclick: function () { tampil(kk); } }));
    });
    var p = document.getElementById("panel"); p.innerHTML = "";
    p.appendChild(el("div", { "class": "kepala" }, [
      el("div", {}, [el("h2", { text: bagian[k].t }), el("div", { "class": "status", id: "status", text: adaDraf ? "Ada perubahan yang belum diterbitkan." : "Isian sama dengan versi yang tayang." })]),
      k === "terbit" ? null : el("div", { style: "display:flex;gap:8px;flex-wrap:wrap" }, [
        el("button", { type: "button", "class": "tombol dua", text: "Pratinjau", onclick: function () { localStorage.setItem(KUNCI_DRAF, JSON.stringify(data)); window.open("index.html?pratinjau=1#/", "_blank"); } }),
        el("button", { type: "button", "class": "tombol", text: "Simpan dan terbitkan", onclick: function () { tampil("terbit"); } })
      ])
    ]));
    bagian[k].r().forEach(function (n) { p.appendChild(n); });
    window.scrollTo(0, 0);
  }
  tampil(aktif);
})();
