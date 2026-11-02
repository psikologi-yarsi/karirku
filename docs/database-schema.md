# KarirKu — Rancangan Database Final (logical model)

## Prinsip
1. Multi-instrumen: satu registri instrumen, banyak versi, banyak pengisian.
2. Pseudonimisasi: kode partisipan menggantikan nama pada data penelitian.
3. Pemisahan identitas: nama/email berada di tabel terpisah dengan akses admin terbatas.
4. Satu pengisian = satu submission: jawaban item, demografi, skor, hasil, consent, feedback, dan metadata proses terikat pada submission.
5. Sinkronisasi Google Sheets adalah salinan/ekspor, bukan satu-satunya penyimpanan utama. WordPress database menjadi source of truth.
6. Consent disimpan bersama submission sebagai bukti versi persetujuan dan waktu persetujuan.

## Entitas dan relasi
```text
INSTRUMENTS 1 ────────< SUBMISSIONS >──────── 1 PARTICIPANTS
                               |
                               | participant_id
                               |
PARTICIPANTS 1 ──────── 0..1 PARTICIPANT_IDENTITIES

INSTRUMENTS 1 ────────< INSTRUMENT_VERSIONS (fase berikutnya)
```

## Tabel
| Tabel | Grain | Isi utama |
|---|---|---|
| `wp_karirku_instruments` | Satu baris per instrumen | slug, nama, versi aktif, status |
| `wp_karirku_participants` | Satu baris per orang berkode | participant_code, status, created_at |
| `wp_karirku_identities` | Maksimal satu baris per partisipan | nama, email, catatan identitas; terpisah |
| `wp_karirku_submissions` | Satu baris per pengisian instrumen | instrument, version, consent, demografi, respons, skor, hasil, feedback, waktu, sync status |

## Aturan data
- Kode partisipan dibuat server dan tidak memuat nama/inisial/tanggal lahir.
- Untuk pengisian instrumen berikutnya, partisipan dapat memakai kode yang sama melalui mekanisme lookup/tautan undangan pada fase berikutnya; jangan membuat akun wajib bila desain penelitian tidak memerlukannya.
- Identitas hanya dikumpulkan jika ada kebutuhan penelitian yang jelas dan dijelaskan pada informed consent.
- Jangan kirim nama/email ke Google Sheets penelitian. Jika identitas perlu diekspor, lakukan ekspor terpisah oleh admin berwenang.
- Setiap perubahan instrumen yang memengaruhi item/scoring menaikkan `instrument_version`.
- Simpan respons item mentah; jangan hanya menyimpan skor akhir.
- Consent wajib diberikan sebelum submit. Simpan versi teks consent dan timestamp; arsip teks consent sebaiknya dikelola sebagai dokumen versi.
- Data riset dan identitas perlu kebijakan retensi, koreksi, penarikan persetujuan, penghapusan, backup, dan audit akses.

## Field minimum per submission
- Identitas relasional: submission_uuid, participant_code (via participants), instrument_slug, instrument_version.
- Proses: started_at, submitted_at, duration_seconds, source_origin.
- Etik: consent_given, consent_version, consented_at.
- Profil: demographics JSON.
- Data mentah: responses JSON.
- Hasil: scores JSON, result_summary JSON.
- Evaluasi: feedback JSON.
- Operasional: sync_status, sync_message.

## Keputusan teknis
- WordPress MySQL/MariaDB sebagai penyimpanan utama.
- Google Sheets sebagai mirror untuk analisis/monitoring dengan akses terbatas.
- Plugin WordPress menjadi lapisan API dan dashboard.
- REST endpoint publik hanya menerima submission yang sudah menyatakan consent; identitas tidak pernah ditampilkan pada dashboard penelitian.
