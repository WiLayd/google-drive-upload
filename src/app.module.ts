import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import googleConfig from 'src/common/config/google.config';
import redisConfig from 'src/common/config/redis.config';
import { FileModule } from 'src/file/file.module';
import { GoogleDriveModule } from 'src/google-drive/google-drive.module';
import { BullModule } from '@nestjs/bull';
import databaseConfig from 'src/common/config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [
    FileModule,
    GoogleDriveModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || '127.0.0.1', 
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
    ConfigModule.forRoot({ load: [googleConfig, redisConfig, databaseConfig] }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class AppModule {}
