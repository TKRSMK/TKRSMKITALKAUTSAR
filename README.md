# Website Resmi TKR SMK IT Al Kautsar Blitar

Situs statis untuk Program Keahlian Teknik Kendaraan Ringan (TKR) SMK IT Al Kautsar Blitar. Situs memuat halaman Beranda dengan dasbor, Profil Jurusan, Tenaga Pendidik dan Pengajar, Lulusan dan Alumni, Pengumuman, serta Berita. Situs tidak memerlukan server atau basis data sehingga dapat dihosting gratis melalui GitHub Pages.

## Susunan berkas

| Berkas | Fungsi |
| --- | --- |
| `index.html` | Halaman situs untuk pengunjung |
| `admin.html` | Panel kelola konten |
| `konten.js` | Seluruh isi situs (teks, data guru, pengumuman, berita) |
| `gaya.css` | Tampilan situs |
| `situs.js` | Transisi pembuka dan penampilan halaman |
| `admin.js` | Logika panel kelola |
| `logo-tkr.png` | Logo jurusan TKR |
| `logo-sekolah.png` | Logo SMK IT Al Kautsar |
| `gambar/` | Folder foto yang dibuat otomatis saat foto pertama diterbitkan |
| `.nojekyll` | Penanda agar GitHub Pages tidak memproses ulang berkas |

## Mengganti logo

Situs menggunakan dua logo, yaitu logo jurusan TKR dan logo SMK IT Al Kautsar. Keduanya sudah dipasang dengan latar transparan. Apabila logo perlu diganti, buka `admin.html`, pilih menu Identitas situs, unggah logo baru pada bidang Logo jurusan TKR atau Logo sekolah, lalu terbitkan. Cara lain adalah menimpa berkas `logo-tkr.png` atau `logo-sekolah.png` dengan berkas baru bernama sama.

## Menayangkan situs melalui GitHub Pages

1. Buat akun di github.com apabila belum memiliki akun.
2. Buat repository baru bersifat Public, misalnya dengan nama `tkr-alkautsar`.
3. Pada halaman repository, pilih Add file, kemudian Upload files. Tekan choose your files, pilih seluruh berkas sekaligus (Ctrl + A), lalu tekan Commit changes. Semua berkas berada dalam satu folder sehingga tidak ada subfolder yang perlu diunggah.
4. Buka Settings, lalu Pages. Pada bagian Build and deployment, pilih Source: Deploy from a branch, Branch: `main`, folder `/ (root)`, kemudian Save.
5. Setelah 1 sampai 3 menit, situs dapat diakses pada alamat `https://nama-akun.github.io/tkr-alkautsar/`.

Domain sendiri (misalnya `tkr.smkitalkautsar.sch.id`) dapat dihubungkan melalui kolom Custom domain pada menu Pages, dengan menambahkan data CNAME yang mengarah ke `nama-akun.github.io` pada pengelola domain sekolah.

## Mengelola konten

Panel kelola dibuka melalui alamat situs ditambah `/admin.html`, atau melalui tautan Kelola konten di bagian bawah situs.

1. Pilih menu yang akan diubah, misalnya Berita, lalu tekan Tulis berita baru.
2. Isi judul, tanggal, kategori, ringkasan, dan isi berita. Paragraf dipisahkan dengan satu baris kosong. Gambar dapat diunggah langsung dari komputer atau ponsel dan otomatis diperkecil.
3. Setiap perubahan tersimpan otomatis sebagai draf pada peramban yang sedang digunakan. Tombol Pratinjau menampilkan situs dengan draf tersebut.
4. Buka menu Simpan dan terbitkan untuk menayangkan perubahan.

### Penerbitan langsung ke GitHub (disarankan)

Penerbitan langsung memerlukan token akses GitHub yang dibuat satu kali.

1. Buka github.com, pilih foto profil, Settings, Developer settings, Personal access tokens, Fine-grained tokens, lalu Generate new token.
2. Isi nama token, tentukan masa berlaku, pilih Only select repositories, kemudian pilih repository situs.
3. Pada Repository permissions, atur Contents menjadi Read and write, lalu buat token dan salin.
4. Pada panel kelola, isi nama akun GitHub, nama repository, cabang `main`, dan token, kemudian tekan Terbitkan ke GitHub.

Gambar baru akan diunggah ke folder `gambar/` dan `konten.js` diperbarui. Perubahan tampil di situs dalam 1 sampai 3 menit. Apabila belum tampil, muat ulang halaman dengan Ctrl + F5.

### Penerbitan manual

Tekan Unduh konten.js pada panel kelola, lalu unggah berkas tersebut ke repository melalui Add file, Upload files, sehingga menggantikan berkas lama.

## Catatan keamanan

Panel kelola dapat dibuka oleh siapa saja, tetapi perubahan hanya dapat diterbitkan oleh pemilik token GitHub. Token tidak boleh dibagikan atau dituliskan di dalam berkas situs. Fitur Ingat token sebaiknya hanya digunakan pada perangkat pribadi. Apabila token diduga bocor, hapus token tersebut pada halaman pengaturan GitHub dan buat token baru.

## Data contoh

Nama guru, alumni, angka statistik, alamat, nomor telepon, mitra industri, serta berita yang tersedia saat ini merupakan data contoh. Seluruh data tersebut perlu diganti dengan data resmi sekolah melalui panel kelola sebelum situs diumumkan.
