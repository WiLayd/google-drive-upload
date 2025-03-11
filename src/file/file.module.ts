import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { GoogleDriveModule } from 'src/google-drive/google-drive.module';
import { BullModule } from '@nestjs/bull';
import { FileProcessor } from 'src/queue/file.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from 'src/file/entity/file.entity';

@Module({
  imports: [
    GoogleDriveModule,
    BullModule.registerQueue({ name: 'file-upload' }),
    TypeOrmModule.forFeature([FileEntity]),
  ],
  controllers: [FileController],
  providers: [FileService, FileProcessor],
})
export class FileModule {}