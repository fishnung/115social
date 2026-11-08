const ANSWERS_SHEET = '作答紀錄';
const QUIZ_SHEET = '測驗歷程';

const ANSWER_HEADERS = [
  '提交編號','接收時間','紀錄編號','學生代碼','班級','座號','單元','學習階段',
  '題目代碼','概念代碼','學生答案','是否正確','使用提示','嘗試次數','作答時間'
];

const QUIZ_HEADERS = [
  '提交編號','接收時間','學生代碼','班級','座號','單元','第幾次作答',
  '本次成績','首次成績','目前最高分','提交時間'
];

const ALLOWED_UNITS = {
  G5U3: '501',
  G6U3: '601'
};

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('請從目標 Google 試算表開啟 Apps Script，再執行 setup。');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  ensureSheet_(ss, ANSWERS_SHEET, ANSWER_HEADERS);
  ensureSheet_(ss, QUIZ_SHEET, QUIZ_HEADERS);
}

function doGet() {
  return json_({ ok: true, service: 'G5U3 learning records', time: new Date().toISOString() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    validatePayload_(payload);
    const ss = openSpreadsheet_();
    const answers = ensureSheet_(ss, ANSWERS_SHEET, ANSWER_HEADERS);
    const quiz = ensureSheet_(ss, QUIZ_SHEET, QUIZ_HEADERS);
    const receivedAt = new Date();
    appendAnswerRecords_(answers, payload.records || [], receivedAt);
    if (payload.eventType === 'quiz_attempt' && payload.quiz) {
      appendQuizAttempt_(quiz, payload, receivedAt);
    }
    return json_({ ok: true, eventId: payload.eventId });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function openSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('尚未完成 setup，請先在 Apps Script 編輯器執行 setup。');
  return SpreadsheetApp.openById(id);
}

function validatePayload_(payload) {
  if (!payload || payload.schemaVersion !== 1) throw new Error('不支援的資料版本');
  const expectedClass = ALLOWED_UNITS[payload.unitId];
  if (!expectedClass || payload.classCode !== expectedClass) throw new Error('單元或班級不符');
  if (String(payload.studentKey || '') !== `${expectedClass}-${String(payload.seat || '')}`) throw new Error('學生代碼格式錯誤');
  if (!/^\d{2}$/.test(String(payload.seat || ''))) throw new Error('座號格式錯誤');
  if (!Array.isArray(payload.records) || payload.records.length > 200) throw new Error('作答資料格式錯誤');
  if (!String(payload.eventId || '')) throw new Error('缺少提交編號');
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#dff5ef');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function existingIds_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return new Set();
  return new Set(sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues().flat().filter(String));
}

function appendAnswerRecords_(sheet, records, receivedAt) {
  const existing = existingIds_(sheet);
  const rows = [];
  records.forEach(record => {
    const id = String(record.submissionKey || '');
    if (!id || existing.has(id)) return;
    existing.add(id);
    rows.push([
      id, receivedAt, record.recordId || '', record.studentKey || '', record.classCode || '',
      record.seat || '', record.unitId || '', record.stage || '', record.questionId || '',
      record.conceptId || '', record.selectedAnswer == null ? '' : String(record.selectedAnswer),
      Boolean(record.isCorrect), Boolean(record.hintUsed), Number(record.attemptNumber || 0),
      record.answeredAt ? new Date(record.answeredAt) : ''
    ]);
  });
  if (rows.length) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, ANSWER_HEADERS.length).setValues(rows);
}

function appendQuizAttempt_(sheet, payload, receivedAt) {
  const existing = existingIds_(sheet);
  if (existing.has(payload.eventId)) return;
  const q = payload.quiz;
  sheet.appendRow([
    payload.eventId, receivedAt, payload.studentKey, payload.classCode, payload.seat, payload.unitId,
    Number(q.attemptNumber || 0), Number(q.score || 0), Number(q.firstScore || 0),
    Number(q.bestScore || 0), q.submittedAt ? new Date(q.submittedAt) : ''
  ]);
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
