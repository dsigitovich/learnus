// Простой тест API прогресса
const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testProgressAPI() {
  console.log('🧪 Тестирование API прогресса курса...\n');

  try {
    // Тест 1: Проверка аутентификации
    console.log('1️⃣ Проверка аутентификации...');
    const authResponse = await makeRequest('/api/auth/me');
    console.log(`   Статус: ${authResponse.status}`);
    console.log(`   Ответ: ${authResponse.body}`);
    
    if (authResponse.status === 401) {
      console.log('   ❌ Не аутентифицирован');
      console.log('   💡 Войдите в систему через браузер: http://localhost:3000/auth/signin');
      return;
    }
    
    console.log('   ✅ Аутентификация успешна\n');

    // Тест 2: Получение прогресса курса
    console.log('2️⃣ Получение прогресса курса...');
    const progressResponse = await makeRequest('/api/courses/test-course-1/progress');
    console.log(`   Статус: ${progressResponse.status}`);
    console.log(`   Ответ: ${progressResponse.body}`);
    
    if (progressResponse.status === 200) {
      console.log('   ✅ Прогресс получен успешно\n');
    } else {
      console.log('   ❌ Ошибка получения прогресса\n');
    }

    // Тест 3: Обновление прогресса урока
    console.log('3️⃣ Обновление прогресса урока...');
    const updateResponse = await makeRequest('/api/courses/test-course-1/progress', 'PUT', {
      lessonId: 'lesson-1',
      status: 'in_progress'
    });
    console.log(`   Статус: ${updateResponse.status}`);
    console.log(`   Ответ: ${updateResponse.body}`);
    
    if (updateResponse.status === 200) {
      console.log('   ✅ Прогресс обновлен успешно\n');
    } else {
      console.log('   ❌ Ошибка обновления прогресса\n');
    }

    // Тест 4: Повторное получение прогресса
    console.log('4️⃣ Повторное получение прогресса...');
    const progressResponse2 = await makeRequest('/api/courses/test-course-1/progress');
    console.log(`   Статус: ${progressResponse2.status}`);
    console.log(`   Ответ: ${progressResponse2.body}`);
    
    if (progressResponse2.status === 200) {
      console.log('   ✅ Обновленный прогресс получен успешно\n');
    } else {
      console.log('   ❌ Ошибка получения обновленного прогресса\n');
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

testProgressAPI();
