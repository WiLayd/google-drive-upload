import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { Queue } from 'bull';
import { UploadFileDto } from 'src/file/dto/uploadFileDto.dto';
import { FileService } from 'src/file/file.service';

@Controller('file')
export class FileController {
  constructor(
    @InjectQueue('file-upload') private readonly fileQueue: Queue,
    private readonly fileService: FileService
  ) {}

  @Post('upload')
  async uploadFile(@Body() body: UploadFileDto): Promise<{ message: string }> {
    if (!body.fileUrl || !body.fileName) {
      throw new BadRequestException('File URL and File Name are required.');
    }
    
    await this.fileQueue.add('upload', {
      fileUrl: body.fileUrl,
      fileName: body.fileName,
    });

    return { message: 'File has been added to the queue for upload' };
  }

  @Get('list')
  async getFileLinks() {
    return this.fileService.getAllFiles();
  }
}