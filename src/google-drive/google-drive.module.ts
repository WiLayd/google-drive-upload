import { Module } from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';

@Module({
  providers: [GoogleDriveService],
  controllers: [],
  exports: [GoogleDriveService],
})
export class GoogleDriveModule {}
