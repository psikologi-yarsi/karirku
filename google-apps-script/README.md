# Integrasi Google Sheets KarirKu

## Isi
- `Code.gs`: backend Google Apps Script untuk menerima submission RIASEC dan memperbarui feedback.
- Database dibuat otomatis oleh fungsi `setupKarirKu()`.

## Cara menyiapkan
1. Buat Google Spreadsheet kosong dengan akun institusi yang akan menjadi pemilik database.
2. Buka **Extensions → Apps Script**.
3. Ganti isi `Code.gs` dengan isi file `Code.gs` dari repository ini.
4. Simpan project.
5. Pilih fungsi `setupKarirKu` lalu klik **Run**. Berikan izin akses Google Sheets.
6. Buka **Execution log** dan salin URL spreadsheet yang dibuat.
7. Klik **Deploy → New deployment → Web app**.
8. Pilih **Execute as: Me**.
9. Pilih **Who has access: Anyone** agar peserta dapat mengirim data tanpa login Google. Ini membuat endpoint publik; jangan kirim nama, email, nomor telepon, atau identitas langsung melalui endpoint ini.
10. Klik Deploy, berikan izin yang diminta, lalu salin URL Web App yang berakhiran `/exec`.

## Tab yang dibuat
- `Participants`: kode partisipan dan waktu pertama tercatat.
- `Submissions`: satu baris per pengisian; respons mentah, profil, skor, hasil, consent, dan feedback tersimpan sebagai JSON.

Nama dan email tidak dikirim atau disimpan pada kedua tab. Batasi akses spreadsheet hanya untuk tim yang berwenang.

## Action API
- `saveSubmission`: menyimpan pengisian setelah consent.
- `updateFeedback`: memperbarui feedback untuk submission yang sudah tersimpan.
- GET pada URL Web App: pemeriksaan status API.

Permintaan POST harus menggunakan `Content-Type: text/plain;charset=utf-8` dan `redirect: follow` agar tidak memicu preflight CORS.

## Catatan
Ini adalah backend awal untuk pengumpulan data anonim/pseudonim dengan volume rendah hingga menengah. URL Web App bersifat publik. Validasi di Apps Script membantu menjaga struktur data, tetapi bukan autentikasi kuat. Hindari mengirim data identitas atau data sensitif. Uji dahulu dengan data dummy sebelum dipakai pada peserta sungguhan.
