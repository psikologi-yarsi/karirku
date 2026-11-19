/**
 * KarirKu Google Sheets Backend
 * Deploy as Web App: Execute as Me; access Anyone.
 * Stores pseudonymised assessment data only. Do not send names or emails here.
 */

const KK = {
  PROP_ID: 'KARIRKU_SPREADSHEET_ID',
  PARTICIPANTS: 'Participants',
  SUBMISSIONS: 'Submissions',
  VERSION: '1.0',
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
