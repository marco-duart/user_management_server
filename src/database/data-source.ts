import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const initializeDataSource = async (configService: ConfigService) => {
  const adminDataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: +configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: 'postgres',
  });

  const dbName = configService.get('DB_NAME');
  try {
    await adminDataSource.initialize();
    const dbExists = await adminDataSource.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`,
    );

    if (dbExists.length === 0) {
      await adminDataSource.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Banco de dados "${dbName}" criado com sucesso.`);
    }
    await adminDataSource.destroy();
  } catch (error) {
    console.error('Erro ao verificar/criar o banco:', error);
    throw error;
  }

  return new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: +configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: dbName,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  });
};
