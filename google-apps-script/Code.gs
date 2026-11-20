/**
 * KarirKu Google Sheets Backend
 * Deploy as Web App: Execute as Me; access Anyone.
 * Stores pseudonymised assessment data only. Do not send names or emails here.
 */

const KK = {
  PROP_ID: 'KARIRKU_SPREADSHEET_ID',
  PARTICIPANTS: 'Participants',
  SUBMISSIONS: 'Submissions',
  CONTACTS: 'ParticipantContacts',
  EMAIL_LOGS: 'EmailLogs',
  SENDER_PROP: 'KARIRKU_SENDER_EMAIL',
  VERSION: '1.1',
  MAX_BYTES: 180000
};

const HEADERS = {
  Participants: [
    'participant_code', 'first_seen_at', 'instrument_slug'
  ],
  Submissions: [
    'submission_uuid', 'participant_code', 'instrument_slug',
    'instrument_version', 'submitted_at', 'started_at',
    'duration_seconds', 'consent_given', 'consent_version',
    'consented_at', 'demographics_json', 'responses_json',
    'scores_json', 'result_json', 'feedback_json', 'source_page',
    'last_feedback_update'
  ],
  ParticipantContacts: [
    'participant_code', 'email', 'first_sent_at', 'last_sent_at', 'instrument_slug'
  ],
  EmailLogs: [
    'participant_code', 'sent_at', 'status', 'detail'
  ]
};

/**
 * Run once from the Apps Script editor.
 * Creates a new spreadsheet and saves its ID in Script Properties.
 */
function setupKarirKu() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(KK.PROP_ID);
  let ss;

  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create('Database KarirKu');
    id = ss.getId();
    props.setProperty(KK.PROP_ID, id);
  }

  ensureSheet_(ss, KK.PARTICIPANTS, HEADERS.Participants);
  ensureSheet_(ss, KK.SUBMISSIONS, HEADERS.Submissions);
  ensureSheet_(ss, KK.CONTACTS, HEADERS.ParticipantContacts);
  ensureSheet_(ss, KK.EMAIL_LOGS, HEADERS.EmailLogs);

  Logger.log('Spreadsheet KarirKu: ' + ss.getUrl());
  return ss.getUrl();
}

function doGet() {
  try {
    const ss = getSpreadsheet_();
    return json_({
      success: true,
      service: 'KarirKu Google Sheets API',
      version: KK.VERSION,
      spreadsheet: ss.getName()
    });
  } catch (err) {
    return json_({ success: false, message: err.message });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw) throw new Error('Payload kosong.');
    if (raw.length > KK.MAX_BYTES) throw new Error('Payload terlalu besar.');

    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') throw new Error('Format payload tidak valid.');

    lock.waitLock(15000);
    let result;

    if (data.action === 'saveSubmission') {
      result = saveSubmission_(data);
    } else if (data.action === 'updateFeedback') {
      result = updateFeedback_(data);
    } else if (data.action === 'sendResultEmail') {
      result = sendResultEmail_(data);
    } else {
      throw new Error('Action tidak dikenal.');
    }

    return json_(result);
  } catch (err) {
    return json_({ success: false, message: err.message || 'Terjadi kesalahan.' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function saveSubmission_(d) {
  if (d.consent_given !== true) throw new Error('Persetujuan partisipan wajib ada.');
  if (d.instrument_slug !== 'riasec') throw new Error('Instrumen tidak dikenal.');
  if (!/^[A-Z0-9-]{6,24}$/.test(String(d.participant_code || ''))) {
    throw new Error('Kode partisipan tidak valid.');
  }
  if (!/^[0-9a-f-]{36}$/i.test(String(d.submission_uuid || ''))) {
    throw new Error('ID pengisian tidak valid.');
  }
  if (!Array.isArray(d.responses) || d.responses.length !== 42) {
    throw new Error('Jawaban harus memuat 42 item.');
  }
  if (!isObject_(d.demographics) || !isObject_(d.scores) || !isObject_(d.result)) {
    throw new Error('Profil, skor, atau hasil tidak valid.');
  }
  ['R','I','A','S','E','C'].forEach(k => {
    const n = Number(d.scores[k]);
    if (!Number.isFinite(n) || n < 0 || n > 35) {
      throw new Error('Skor RIASEC tidak valid: ' + k);
    }
  });

  const ss = getSpreadsheet_();
  const participants = ss.getSheetByName(KK.PARTICIPANTS);
  const submissions = ss.getSheetByName(KK.SUBMISSIONS);
  const uuid = String(d.submission_uuid);
  const code = String(d.participant_code);
  const now = new Date();

  if (findValue_(submissions, 1, uuid) > 0) {
    return { success: true, duplicate: true, submission_uuid: uuid };
  }

  if (findValue_(participants, 1, code) < 0) {
    participants.appendRow([code, now, 'riasec']);
  }

  const row = [
    uuid,
    code,
    'riasec',
    cleanText_(d.instrument_version || '1.0', 30),
    now,
    parseDate_(d.started_at),
    Math.max(0, Math.min(86400, Number(d.duration_seconds) || 0)),
    true,
    cleanText_(d.consent_version || '1.0', 30),
    parseDate_(d.consented_at) || now,
    JSON.stringify(d.demographics),
    JSON.stringify(d.responses),
    JSON.stringify(d.scores),
    JSON.stringify(d.result),
    JSON.stringify(d.feedback || {}),
    cleanText_(d.source_page || '', 300),
    ''
  ];

  submissions.appendRow(row);
  return {
    success: true,
    submission_uuid: uuid,
    participant_code: code,
    message: 'Pengisian berhasil disimpan.'
  };
}

function updateFeedback_(d) {
  const uuid = String(d.submission_uuid || '');
  if (!/^[0-9a-f-]{36}$/i.test(uuid)) throw new Error('ID pengisian tidak valid.');
  const feedback = d.feedback;
  if (!isObject_(feedback)) throw new Error('Feedback tidak valid.');

  ['akurasi','relevansi'].forEach(k => {
    const n = Number(feedback[k] || 0);
    if (!Number.isInteger(n) || n < 0 || n > 5) {
      throw new Error('Rating feedback tidak valid.');
    }
  });

  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName(KK.SUBMISSIONS);
  const row = findValue_(sheet, 1, uuid);
  if (row < 0) throw new Error('Pengisian tidak ditemukan.');

  sheet.getRange(row, 15).setValue(JSON.stringify({
    akurasi: Number(feedback.akurasi || 0),
    relevansi: Number(feedback.relevansi || 0),
    komentar: cleanText_(feedback.komentar || '', 2000)
  }));
  sheet.getRange(row, 17).setValue(new Date());

  return { success: true, message: 'Feedback berhasil diperbarui.' };
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty(KK.PROP_ID);
  if (!id) throw new Error('Database belum disiapkan. Jalankan setupKarirKu() terlebih dahulu.');
  return SpreadsheetApp.openById(id);
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    const first = ss.getSheets()[0];
    if (name === KK.PARTICIPANTS && first && first.getLastRow() === 0) {
      first.setName(name);
      sheet = first;
    } else {
      sheet = ss.insertSheet(name);
    }
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}

function findValue_(sheet, column, value) {
  if (sheet.getLastRow() < 2) return -1;
  const found = sheet.getRange(2, column, sheet.getLastRow() - 1, 1)
    .createTextFinder(String(value))
    .matchEntireCell(true)
    .findNext();
  return found ? found.getRow() : -1;
}

function isObject_(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cleanText_(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u001F\u007F]/g, ' ').slice(0, max);
}

function parseDate_(value) {
  if (!value) return '';
  const date = new Date(value);
  return isNaN(date.getTime()) ? '' : date;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


/**
 * Configure a sender alias. Run manually after confirming the alias is
 * available in Gmail > Settings > Accounts and Import > Send mail as.
 * Leave the property empty to use the Google account that owns this script.
 */
/** Run manually once to authorise Gmail and inspect configured sender aliases. */
function getKarirKuSenderAliases() {
  return GmailApp.getAliases();
}

function setKarirKuSenderEmail(email) {
  const value = String(email || '').trim().toLowerCase();
  if (!value) {
    PropertiesService.getScriptProperties().deleteProperty(KK.SENDER_PROP);
    return 'Pengirim dikembalikan ke akun Google pemilik Apps Script.';
  }
  if (!isValidEmail_(value)) throw new Error('Format alamat pengirim tidak valid.');
  const aliases = GmailApp.getAliases().map(x => x.toLowerCase());
  if (aliases.indexOf(value) === -1) {
    throw new Error('Alamat tersebut belum terdaftar sebagai alias Gmail. Tambahkan dan verifikasi alias terlebih dahulu.');
  }
  PropertiesService.getScriptProperties().setProperty(KK.SENDER_PROP, value);
  return 'Alias pengirim KarirKu berhasil disimpan.';
}

function sendResultEmail_(d) {
  const email = String(d.email || '').trim().toLowerCase();
  const participantCode = String(d.participant_code || '').trim();
  if (!isValidEmail_(email)) throw new Error('Alamat email tidak valid.');
  if (!/^[A-Z0-9-]{6,24}$/.test(participantCode)) {
    throw new Error('Kode partisipan tidak valid.');
  }
  if (!/^[RIASEC]{3}$/.test(String(d.typeCode || ''))) {
    throw new Error('Kode profil RIASEC tidak valid.');
  }
  if (!isObject_(d.scores)) throw new Error('Data skor tidak valid.');

  const keys = ['R','I','A','S','E','C'];
  const scores = {};
  keys.forEach(key => {
    const n = Number(d.scores[key]);
    if (!Number.isFinite(n) || n < 0 || n > 35) throw new Error('Skor tidak valid: ' + key);
    scores[key] = n;
  });

  const profileSections = Array.isArray(d.profileSections) ? d.profileSections.slice(0, 3) : [];
  const careers = Array.isArray(d.careers) ? d.careers.slice(0, 6) : [];
  if (profileSections.length !== 3 || careers.length === 0) {
    throw new Error('Komponen hasil asesmen belum lengkap.');
  }

  const safeData = {
    participantCode: participantCode,
    participantName: cleanText_(d.participantName || '', 100),
    typeCode: String(d.typeCode),
    typeName: cleanText_(d.typeName || '', 100),
    description: cleanText_(d.description || '', 1200),
    scores: scores,
    profileSections: profileSections.map(s => ({
      key: cleanText_(s.key, 1),
      name: cleanText_(s.name, 80),
      desc: cleanText_(s.desc, 300),
      role: cleanText_(s.role, 20)
    })),
    careers: careers.map(c => ({
      title: cleanText_(c.title, 120),
      icon: cleanText_(c.icon, 12),
      riasec: Array.isArray(c.riasec) ? c.riasec.map(x => cleanText_(x, 1)).join('') : '',
      cluster: cleanText_(c.cluster, 100),
      matchLabel: cleanText_(c.matchLabel, 40),
      matchScore: Math.max(0, Math.min(100, Number(c.matchScore) || 0)),
      description: cleanText_(c.description, 500),
      rationale: cleanText_(c.rationale || '', 700)
    }))
  };

  const htmlBody = buildResultEmailHtml_(safeData);
  const pdfHtml = buildResultPdfHtml_(safeData);
  const pdfBlob = HtmlService.createHtmlOutput(pdfHtml)
    .getBlob()
    .getAs(MimeType.PDF)
    .setName('KarirKu-Hasil-' + safeData.typeCode + '.pdf');

  const props = PropertiesService.getScriptProperties();
  const configuredSender = String(props.getProperty(KK.SENDER_PROP) || '').trim().toLowerCase();
  const aliases = GmailApp.getAliases().map(x => x.toLowerCase());
  const options = {
    name: 'KarirKu',
    htmlBody: htmlBody,
    attachments: [pdfBlob]
  };
  if (configuredSender && aliases.indexOf(configuredSender) !== -1) {
    options.from = configuredSender;
    options.replyTo = configuredSender;
  }

  try {
    GmailApp.sendEmail(
      email,
      'Hasil Asesmen Minat Karier KarirKu — ' + safeData.typeCode,
      'Hasil asesmen RIASEC KarirKu terlampir dalam format PDF. Silakan gunakan hasil ini sebagai bahan eksplorasi minat karier.',
      options
    );
  } catch (err) {
    logEmail_(participantCode, 'FAILED', cleanText_(err.message || err, 500));
    throw new Error('Email belum berhasil dikirim. Silakan coba kembali beberapa saat lagi.');
  }

  // Email sudah terkirim. Kegagalan pencatatan tidak boleh membuat peserta
  // menerima pesan gagal dan mengulang pengiriman yang sebenarnya berhasil.
  try {
    recordParticipantContact_(participantCode, email);
    logEmail_(participantCode, 'SENT', 'Email dan PDF berhasil dikirim.');
  } catch (recordErr) {
    console.error('Email sent, but contact/log write failed: ' + recordErr.message);
  }
  return { success: true, message: 'Hasil asesmen berhasil dikirim.' };
}

function recordParticipantContact_(participantCode, email) {
  const sheet = getSpreadsheet_().getSheetByName(KK.CONTACTS);
  const row = findValue_(sheet, 1, participantCode);
  const now = new Date();
  if (row > 0) {
    sheet.getRange(row, 2).setValue(email);
    sheet.getRange(row, 4).setValue(now);
  } else {
    sheet.appendRow([participantCode, email, now, now, 'riasec']);
  }
}

function logEmail_(participantCode, status, detail) {
  const sheet = getSpreadsheet_().getSheetByName(KK.EMAIL_LOGS);
  sheet.appendRow([participantCode, new Date(), status, cleanText_(detail, 500)]);
}

function isValidEmail_(email) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(String(email || ''));
}

function htmlEscape_(value) {
  return String(value == null ? '' : value).replace(/[&<>'"]/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
  }[c]));
}

function buildResultEmailHtml_(d) {
  const scoreRows = ['R','I','A','S','E','C'].map(key =>
    '<tr><td style="padding:7px 10px;border-bottom:1px solid #e8e8ef"><b>' + key +
    '</b></td><td style="padding:7px 10px;border-bottom:1px solid #e8e8ef">' +
    htmlEscape_(d.scores[key]) + ' / 35</td></tr>'
  ).join('');
  const top = d.profileSections.map(s =>
    '<li><b>' + htmlEscape_(s.name) + '</b> (' + htmlEscape_(s.key) +
    ') — ' + htmlEscape_(s.role) + '</li>'
  ).join('');
  const careers = d.careers.slice(0, 3).map(c =>
    '<li style="margin-bottom:8px"><b>' + htmlEscape_(c.title) + '</b> — ' +
    htmlEscape_(c.matchLabel) + ' (' + htmlEscape_(c.matchScore) + '/100)</li>'
  ).join('');
  const greeting = d.participantName ? 'Halo ' + htmlEscape_(d.participantName) + ',' : 'Halo,';
  return '<div style="font-family:Arial,sans-serif;color:#25243a;line-height:1.6;max-width:680px">' +
    '<div style="padding:22px;background:#17152f;color:#fff;border-radius:14px">' +
    '<div style="font-size:13px;opacity:.8">HASIL ASESMEN KARIRKU</div>' +
    '<div style="font-size:30px;font-weight:bold;margin-top:6px">' + htmlEscape_(d.typeCode) + '</div>' +
    '<div style="font-size:15px">' + htmlEscape_(d.typeName) + '</div></div>' +
    '<p>' + greeting + '</p><p>' + htmlEscape_(d.description) + '</p>' +
    '<h3>Dimensi minat utama</h3><ol>' + top + '</ol>' +
    '<h3>Ringkasan skor RIASEC</h3><table style="border-collapse:collapse;width:100%">' + scoreRows + '</table>' +
    '<h3>Rekomendasi karier teratas</h3><ol>' + careers + '</ol>' +
    '<p>PDF terlampir memuat profil, skor lengkap, dan enam rekomendasi karier beserta penjelasannya.</p>' +
    '<p style="font-size:12px;color:#666">Hasil ini menggambarkan pola minat, bukan kemampuan atau jaminan keberhasilan karier. Gunakan sebagai bahan eksplorasi bersama informasi lain.</p>' +
    '<p>Salam,<br><b>Tim KarirKu</b></p></div>';
}

function buildResultPdfHtml_(d) {
  const colors = {R:'#e75d5d', I:'#d9942f', A:'#a36bd0', S:'#299bad', E:'#dc8b1c', C:'#43a86a'};
  const scoreRows = ['R','I','A','S','E','C'].map(key => {
    const width = Math.round((d.scores[key] / 35) * 100);
    return '<div style="display:flex;align-items:center;gap:10px;margin:10px 0">' +
      '<b style="width:22px;color:' + colors[key] + '">' + key + '</b>' +
      '<div style="flex:1;background:#edf0f5;height:10px;border-radius:8px;overflow:hidden">' +
      '<div style="width:' + width + '%;height:10px;background:' + colors[key] + '"></div></div>' +
      '<span style="width:48px;text-align:right">' + d.scores[key] + '/35</span></div>';
  }).join('');
  const profile = d.profileSections.map(s =>
    '<div style="padding:12px;border:1px solid #e2e5ed;border-radius:10px;margin:8px 0">' +
    '<b style="color:' + (colors[s.key] || '#333') + '">' + htmlEscape_(s.key) + ' · ' +
    htmlEscape_(s.role) + ' — ' + htmlEscape_(s.name) + '</b><p style="margin:5px 0 0">' +
    htmlEscape_(s.desc) + '</p></div>'
  ).join('');
  const careers = d.careers.map((c, i) =>
    '<div style="page-break-inside:avoid;padding:12px 0;border-bottom:1px solid #e5e7eb">' +
    '<h3 style="margin:0 0 5px">' + (i + 1) + '. ' + htmlEscape_(c.icon) + ' ' + htmlEscape_(c.title) + '</h3>' +
    '<div style="font-size:11px;color:#596174">' + htmlEscape_(c.riasec) + ' · ' +
    htmlEscape_(c.cluster) + ' · ' + htmlEscape_(c.matchLabel) + ' · ' + c.matchScore + '/100</div>' +
    '<p>' + htmlEscape_(c.description) + '</p><p style="font-size:12px;color:#4b5563">' +
    htmlEscape_(c.rationale) + '</p></div>'
  ).join('');
  const name = d.participantName ? '<p style="color:#596174">Untuk: ' + htmlEscape_(d.participantName) + '</p>' : '';
  return '<html><head><meta charset="UTF-8"><style>' +
    'body{font-family:Arial,sans-serif;color:#202333;font-size:12px;line-height:1.55;margin:34px}' +
    'h1{font-size:25px;margin:0}h2{font-size:16px;margin:22px 0 8px;color:#39345d}' +
    '.hero{background:#f1efff;padding:22px;border-radius:14px;margin-bottom:20px}' +
    '.muted{color:#596174} .note{background:#f6f7fa;padding:12px;border-radius:8px;margin-top:22px;font-size:10px}' +
    '</style></head><body>' +
    '<div class="hero"><div style="font-size:10px;letter-spacing:2px;color:#6254a3">KARIRKU · LAPORAN ASESMEN</div>' +
    '<h1>Profil RIASEC ' + htmlEscape_(d.typeCode) + '</h1><p style="margin:4px 0">' +
    htmlEscape_(d.typeName) + '</p>' + name + '</div>' +
    '<h2>Gambaran profil</h2><p>' + htmlEscape_(d.description) + '</p>' +
    '<h2>Tiga dimensi minat utama</h2>' + profile +
    '<h2>Skor lengkap RIASEC</h2>' + scoreRows +
    '<h2>Rekomendasi karier</h2>' + careers +
    '<div class="note"><b>Catatan interpretasi</b><br>Profil RIASEC menggambarkan pola minat, bukan kemampuan, prestasi, atau jaminan bahwa suatu karier pasti cocok. Rekomendasi merupakan bahan eksplorasi dan perlu dipertimbangkan bersama kemampuan, nilai pribadi, pengalaman, serta informasi pendidikan dan pekerjaan.</div>' +
    '<p style="font-size:10px;color:#777;margin-top:22px">KarirKu · Eksplorasi Jalur Karier yang Selaras dengan Minatmu</p>' +
    '</body></html>';
}
