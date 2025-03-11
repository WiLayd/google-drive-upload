import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';
import { FileService } from 'src/file/file.service';

@Injectable()
@Processor('file-upload')
export class FileProcessor {
  private readonly logger = new Logger(FileProcessor.name);

  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly fileService: FileService
  ) {}

  @Process('upload')
  async handleFileUpload(job: Job<{ fileUrl: string; fileName: string }>) {
    this.logger.log(`Starting file upload: ${job.data.fileName}`);
    
    try {
      const result = await this.googleDriveService.uploadFileFromUrl(
        job.data.fileUrl,
        job.data.fileName
      );
      
      await this.fileService.saveFile(job.data.fileName, result.webViewLink);
      this.logger.log(`File uploaded and saved to DB: ${result.webViewLink}`);
    } catch (error) {
      this.logger.error(`Error uploading file ${job.data.fileName}: ${error.message}`);
    }
  }
}
