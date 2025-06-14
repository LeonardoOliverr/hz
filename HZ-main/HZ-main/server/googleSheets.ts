import { google } from 'googleapis';
import { HzVaccineResponse } from '@shared/schema';

interface GoogleSheetsConfig {
  apiKey: string;
  spreadsheetId: string;
}

export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;

  constructor(config: GoogleSheetsConfig) {
    this.sheets = google.sheets({
      version: 'v4',
      auth: config.apiKey
    });
    this.spreadsheetId = config.spreadsheetId;
  }

  async initializeSheet() {
    try {
      // Check if sheet exists and has headers
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A1:M1',
      });

      if (!response.data.values || response.data.values.length === 0) {
        // Add headers if sheet is empty
        await this.addHeaders();
      }
    } catch (error) {
      console.error('Error initializing Google Sheet:', error);
      throw new Error('Failed to initialize Google Sheet');
    }
  }

  private async addHeaders() {
    const headers = [
      'ID',
      'Sexo',
      'Idade',
      'Família teve HZ',
      'Conhece vacina',
      'Aceitou explicação',
      'Interesse vacina',
      'Interesse vacinar',
      'Vacinou local',
      'Retornar outro dia',
      'Motivo não vacinar',
      'Período',
      'Movimento loja',
      'Data/Hora'
    ];

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: 'A1:N1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [headers]
      }
    });
  }

  async addResponse(response: HzVaccineResponse) {
    try {
      const timestamp = new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const values = [
        response.id,
        response.sexo,
        response.idade,
        response.familia_hz,
        response.conhece_vacina,
        response.aceitou_explicacao,
        response.interesse_vacina,
        response.interesse_vacinar,
        response.vacinou_local,
        response.retornar_outro_dia,
        response.motivo_nao_vacinar || '',
        response.periodo,
        response.movimento_loja,
        timestamp
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'A:N',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [values]
        }
      });

      console.log('Data successfully added to Google Sheets');
    } catch (error) {
      console.error('Error adding data to Google Sheets:', error);
      throw new Error('Failed to sync data with Google Sheets');
    }
  }
}

let googleSheetsService: GoogleSheetsService | null = null;

export function initializeGoogleSheets() {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!apiKey || !spreadsheetId) {
    console.warn('Google Sheets integration disabled: Missing API credentials');
    return null;
  }

  try {
    googleSheetsService = new GoogleSheetsService({ apiKey, spreadsheetId });
    return googleSheetsService;
  } catch (error) {
    console.error('Failed to initialize Google Sheets service:', error);
    return null;
  }
}

export function getGoogleSheetsService() {
  return googleSheetsService;
}