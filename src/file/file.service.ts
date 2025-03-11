import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from 'src/file/entity/file.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>
  ) {}

  async saveFile(fileName: string, fileUrl: string) {
    const file = this.fileRepository.create({ fileName, fileUrl });
    await this.fileRepository.save(file);
  }

  async getAllFiles() {
    return this.fileRepository.find();
  }
}