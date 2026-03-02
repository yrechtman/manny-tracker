import { google } from 'googleapis';

function getAuth() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not set');

  const credentials = JSON.parse(key);

  return new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;

// Quote sheet names that contain spaces for the Sheets API
function q(sheetName: string): string {
  if (sheetName.includes(' ')) return `'${sheetName}'`;
  return sheetName;
}

// Ensure the required tabs exist, creating/renaming as needed
async function ensureTab(sheetName: string) {
  const sheets = getSheets();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existing = meta.data.sheets?.map((s) => s.properties?.title) || [];

  if (existing.includes(sheetName)) return;

  // If this is the first tab we need and there's only a default "Sheet1", rename it
  if (sheetName === 'Raw Logs' && existing.includes('Sheet1') && existing.length <= 2) {
    const sheet1 = meta.data.sheets?.find((s) => s.properties?.title === 'Sheet1');
    if (sheet1?.properties?.sheetId !== undefined) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              updateSheetProperties: {
                properties: { sheetId: sheet1.properties.sheetId, title: sheetName },
                fields: 'title',
              },
            },
          ],
        },
      });
      return;
    }
  }

  // Otherwise add a new tab
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [{ addSheet: { properties: { title: sheetName } } }],
    },
  });
}

export async function appendRow(sheetName: string, values: string[]) {
  await ensureTab(sheetName);
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${q(sheetName)}!A:A`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

export async function getRows(sheetName: string, range?: string): Promise<string[][]> {
  await ensureTab(sheetName);
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: range || `${q(sheetName)}!A:ZZ`,
  });
  return (res.data.values as string[][]) || [];
}

export async function deleteRowByUuid(sheetName: string, uuid: string) {
  const sheets = getSheets();

  const rows = await getRows(sheetName);
  const rowIndex = rows.findIndex((row) => row[0] === uuid);
  if (rowIndex === -1) throw new Error('Row not found');

  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === sheetName);
  const sheetId = sheet?.properties?.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });
}

export async function ensureHeaders(sheetName: string, headers: string[]) {
  await ensureTab(sheetName);
  const sheets = getSheets();
  const rows = await getRows(sheetName);

  if (rows.length === 0) {
    // Empty sheet — write headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${q(sheetName)}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });
    return;
  }

  // Check if first row looks like a header (starts with "ID" or "id")
  const firstCell = (rows[0][0] || '').trim().toLowerCase();
  if (firstCell === 'id') return; // headers already exist

  // Data exists without headers — insert a row at the top for headers
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === sheetName);
  const sheetId = sheet?.properties?.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
            inheritFromBefore: false,
          },
        },
      ],
    },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${q(sheetName)}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [headers] },
  });
}
