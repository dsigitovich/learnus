#!/usr/bin/env ts-node

import { initializeDatabase, checkDatabaseHealth } from '../lib/db/index';

async function main() {
  console.log('🚀 Инициализация базы данных...');
  
  try {
    // Инициализация
    await initializeDatabase();
    console.log('✅ База данных успешно инициализирована');
    
    // Небольшая задержка для завершения операций
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Проверка состояния
    const health = await checkDatabaseHealth();
    console.log('\n📊 Состояние базы данных:');
    console.log(`   Статус: ${health.isHealthy ? '✅ Здоровая' : '❌ Проблемы'}`);
    console.log(`   Таблицы: ${health.tables.join(', ')}`);
    
    if (!health.isHealthy && health.error) {
      console.error(`   Ошибка: ${health.error}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error);
    process.exit(1);
  }
}

main();
