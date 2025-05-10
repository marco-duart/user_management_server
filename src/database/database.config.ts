import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { initializeDataSource } from './data-source';

export const typeOrmConfigAsync: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const dataSource = await initializeDataSource(configService);
    return dataSource.options;
  },
};