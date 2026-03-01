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

export async function appendRow(sheetName: string, values: string[]) {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:A`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

export async function getRows(sheetName: string, range?: string): Promise<string[][]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: range || `${sheetName}!A:ZZ`,
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
  const rows = await getRows(sheetName);
  if (rows.length === 0) {
    const sheets = getSheets();
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });
  }
}
