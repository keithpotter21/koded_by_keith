/**
 * Koded by Keith contact-form endpoint for Google Apps Script.
 * Store CONTACT_SHARED_SECRET in Script Properties before deployment.
 */
const SHEET_NAME = 'Leads';
const EXPECTED_FIELDS = ['name', 'business', 'email', 'phone', 'website', 'interest', 'message', 'sourcePage', 'utmSource', 'utmMedium', 'utmCampaign', 'userAgent'];

function doPost(event) {
  try {
    const data = JSON.parse(event.postData.contents || '{}');
    const secret = PropertiesService.getScriptProperties().getProperty('CONTACT_SHARED_SECRET');
    if (!secret || data.secret !== secret) return response({ ok: false, error: 'Unauthorized' });
    if (!data.name || !data.business || !data.email || !data.phone || !data.website || !data.interest || !data.message) {
      return response({ ok: false, error: 'Missing required fields' });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error(`Missing sheet: ${SHEET_NAME}`);
    sheet.appendRow([new Date(), ...EXPECTED_FIELDS.map((field) => String(data[field] || ''))]);
    return response({ ok: true });
  } catch (error) {
    console.error(error);
    return response({ ok: false, error: 'Unable to process request' });
  }
}

function response(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
