import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config({ path: '.env.test.local' });

module.exports = async () => {
  console.log('\nLimpando ambiente de testes...');
  
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
    await adminDataSource.query(`DROP DATABASE IF EXISTS "${process.env.DB_NAME}"`);
    await adminDataSource.destroy();
    
  } catch (error) {
    console.error('Erro ao limpar banco de testes:', error.message);
  }
};