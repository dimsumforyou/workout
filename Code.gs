/**
 * Iron Log — Google Sheets sync backend (Apps Script)
 *
 * Setup:
 *  1. Extensions → Apps Script (on your "Iron Log Data" sheet) → paste this in, replacing
 *     any sample/placeholder code.
 *  2. Change SECRET below to your own random string.
 *  3. Deploy → New deployment → type: Web app → Execute as: Me → Who has access: Anyone.
 *  4. Copy the URL ending in /exec, paste it (with your secret) into the app's
 *     Data tab → Cloud sync.
 *
 * IMPORTANT: any time you edit this file, you must push a NEW VERSION of the
 * deployment for the change to take effect on the existing /exec URL:
 *   Deploy → Manage deployments → pencil icon → Version: New version → Deploy.
 * Saving the script alone does NOT update a live web app deployment.
 */

const SECRET = 'change-me';

const DATA_SHEET = 'data';
const LOG_SHEET = 'log';
const CHUNK_SIZE = 40000; // stay under Sheets' ~50k char/cell limit

const DAY_NAMES = { u1: 'Upper #1', l1: 'Lower #1', u2: 'Upper #2', l2: 'Lower #2', ax: 'Arms & Weak Points' };

function doGet(e) {
  return respond(handleGet(e));
}

function doPost(e) {
  return respond(handlePost(e));
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleGet(e) {
  const token = (e && e.parameter && e.parameter.token) || '';
  if (token !== SECRET) return { error: 'bad token' };
  try {
    return { state: readState() };
  } catch (err) {
    return { error: 'read failed: ' + err.message };
  }
}

function handlePost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return { error: 'bad request body' };
  }
  if (!body || body.token !== SECRET) return { error: 'bad token' };

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return { error: 'server busy, try again' };
  }
  try {
    writeState(body.state);
    rebuildLog(body.state);
    return { ok: true };
  } catch (err) {
    return { error: 'write failed: ' + err.message };
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateSheet(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function readState() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(DATA_SHEET);
  if (!sh || sh.getLastRow() < 1) return null;
  const chunks = sh.getRange(1, 1, sh.getLastRow(), 1).getValues()
    .map(r => r[0]).filter(v => v !== '' && v != null);
  if (!chunks.length) return null;
  try {
    return JSON.parse(chunks.join(''));
  } catch (err) {
    // Tab has non-JSON content (stray label, partial write, manual edit).
    // Treat as "no data yet" instead of blocking every future sync.
    return null;
  }
}

function writeState(state) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = getOrCreateSheet(ss, DATA_SHEET);
  sh.clearContents();
  const raw = JSON.stringify(state);
  const rows = [];
  for (let i = 0; i < raw.length; i += CHUNK_SIZE) rows.push([raw.slice(i, i + CHUNK_SIZE)]);
  if (rows.length) sh.getRange(1, 1, rows.length, 1).setValues(rows);
}

function fmtW(w) {
  return (w === null || w === undefined) ? 'BW' : w;
}

function rebuildLog(state) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = getOrCreateSheet(ss, LOG_SHEET);
  sh.clearContents();

  const rows = [['Cycle', 'Week', 'Day', 'Exercise', 'Sets (weight×reps)', 'Top set', 'Notes']];
  const logs = (state && state.logs) || {};
  const keys = Object.keys(logs).sort((a, b) => {
    const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
    return pa[0] - pb[0] || pa[1] - pb[1];
  });

  keys.forEach(k => {
    const parts = k.split('.');
    const c = parts[0], w = parts[1], d = parts[2], ex = parts[3];
    const sets = (logs[k].sets || []).filter(s => s.r != null || s.w != null);
    if (!sets.length) return;

    const setsStr = sets.map(s => fmtW(s.w) + '×' + (s.r == null ? '?' : s.r)).join(', ');
    let best = null;
    sets.forEach(s => {
      if (s.w == null || s.r == null) return;
      if (!best || s.w > best.w || (s.w === best.w && s.r > best.r)) best = s;
    });
    const topStr = best ? fmtW(best.w) + '×' + best.r : '';
    const notes = sets.map(s => s.n).filter(Boolean).join('; ');

    rows.push([c, w, DAY_NAMES[d] || d, ex, setsStr, topStr, notes]);
  });

  if (rows.length) sh.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
}
