/**
 * ArcTrade waitlist → Google Sheet
 *
 * Paste ONLY this file's contents into Apps Script (Code.gs).
 * Do not paste the filename. Save, then Deploy → New deployment → Web app
 * (Execute as: Me, Who has access: Anyone).
 */

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Waitlist");
  if (!sheet) sheet = ss.insertSheet("Waitlist");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Email", "Source"]);
    sheet.getRange(1, 1, 1, 3).setFontWeight("bold");
  }
  return sheet;
}

function save_(email, source) {
  const value = String(email || "")
    .trim()
    .toLowerCase();
  if (!value || value.indexOf("@") === -1) {
    return { ok: false, error: "invalid" };
  }

  const sheet = sheet_();
  const last = sheet.getLastRow();
  if (last > 1) {
    const existing = sheet
      .getRange(2, 2, last - 1, 1)
      .getValues()
      .flat()
      .map(function (v) {
        return String(v).trim().toLowerCase();
      });
    if (existing.indexOf(value) !== -1) {
      return { ok: true, duplicate: true };
    }
  }

  sheet.appendRow([new Date(), value, source || "waitlist"]);
  return { ok: true };
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function doGet(e) {
  const email = e && e.parameter ? e.parameter.email : "";
  const source = e && e.parameter ? e.parameter.source : "waitlist";
  return json_(save_(email, source));
}

function doPost(e) {
  var email = "";
  var source = "waitlist";
  try {
    if (e && e.postData && e.postData.contents) {
      var data = JSON.parse(e.postData.contents);
      email = data.email;
      source = data.source || source;
    }
  } catch (err) {
    email = "";
  }
  if (!email && e && e.parameter) {
    email = e.parameter.email;
    source = e.parameter.source || source;
  }
  return json_(save_(email, source));
}
