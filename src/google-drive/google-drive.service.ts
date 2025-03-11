import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import axios from 'axios';
import { PassThrough } from 'stream';

@Injectable()
export class GoogleDriveService {
  private readonly driveClient: drive_v3.Drive;
  private readonly logger = new Logger(GoogleDriveService.name);
  private readonly folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  constructor() {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI || !GOOGLE_REFRESH_TOKEN) {
      throw new InternalServerErrorException('Missing required Google OAuth environment variables');
    }

    const auth = new google.auth.OAuth2({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: GOOGLE_REDIRECT_URI,
    });

    auth.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
    this.driveClient = google.drive({ version: 'v3', auth });
  }

  async uploadFileFromUrl(fileUrl: string, fileName: string): Promise<{ webViewLink: string; webContentLink: string }> {
    try {
      const response = await axios.get(fileUrl, { responseType: 'stream', timeout: 10000 });
      const mimeType = response.headers['content-type'] || 'application/octet-stream';
      
      if (!mimeType || mimeType.includes('text/html')) {
        throw new InternalServerErrorException(`Invalid file type: ${mimeType}`);
      }

      const passthrough = new PassThrough();
      response.data.pipe(passthrough);

      const uploadResponse = await this.driveClient.files.create({
        requestBody: { name: fileName, parents: this.folderId ? [this.folderId] : undefined },
        media: { body: passthrough, mimeType },
        fields: 'id, webViewLink, webContentLink',
      });

      if (!uploadResponse.data.id) {
        throw new InternalServerErrorException('Failed to upload file to Google Drive');
      }

      return {
        webViewLink: uploadResponse.data.webViewLink ?? '',
        webContentLink: uploadResponse.data.webContentLink ?? '',
      };
    } catch (error) {
      this.logger.error(`Error uploading file to Google Drive: ${error.message}`);
      throw new InternalServerErrorException(`Error uploading file to Google Drive: ${error.message}`);
    }
  }
}
