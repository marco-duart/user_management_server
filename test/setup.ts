import * as dotenv from 'dotenv';
import { initializeDataSource } from '../src/database/data-source';

dotenv.config({ path: '.env.test.local' });

module.exports = async () => {
  console.log('\nPreparando ambiente para teste...');

  const configService = { get: (key: string) => process.env[key] };
  const dataSource = await initializeDataSource(configService as any);
  
  await dataSource.initialize();
  await dataSource.synchronize();
  await dataSource.destroy();
};