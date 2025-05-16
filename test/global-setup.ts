import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { initializeDataSource } from '../src/database/data-source';

dotenv.config({ path: '.env.test.local' });

module.exports = async () => {
  console.log('\nConfiguração GLOBAL de testes...');
  
  try {
    const adminDataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'postgres',
    });
    
    await adminDataSource.initialize();
    await adminDataSource.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
    await adminDataSource.destroy();

    const configService = { get: (key: string) => process.env[key] };
    const dataSource = await initializeDataSource(configService as any);
    await dataSource.initialize();
    await dataSource.runMigrations();
    await dataSource.destroy();
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Banco de testes já existe, prosseguindo...');
    } else {
      console.error('Erro na configuração global:', error);
      throw error;
    }
  }
};