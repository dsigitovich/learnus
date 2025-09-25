// Тест API курса
const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3005,
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

async function testCourseAPI() {
  console.log('🧪 Тестирование API курса...\n');

  try {
    // Тест 1: Проверка аутентификации
    console.log('1️⃣ Проверка аутентификации...');
    const authResponse = await makeRequest('/api/auth/me');
    console.log(`   Статус: ${authResponse.status}`);
    console.log(`   Ответ: ${authResponse.body}`);
    
    if (authResponse.status === 401) {
      console.log('   ❌ Не аутентифицирован');
      console.log('   💡 Войдите в систему через браузер: http://localhost:3005/auth/signin');
      return;
    }
    
    console.log('   ✅ Аутентификация успешна\n');

    // Тест 2: Получение курса
    console.log('2️⃣ Получение курса...');
    const courseResponse = await makeRequest('/api/courses/test-course-1');
    console.log(`   Статус: ${courseResponse.status}`);
    console.log(`   Ответ: ${courseResponse.body}`);
    
    if (courseResponse.status === 200) {
      console.log('   ✅ Курс получен успешно\n');
    } else {
      console.log('   ❌ Ошибка получения курса\n');
    }

    // Тест 3: Получение прогресса курса
    console.log('3️⃣ Получение прогресса курса...');
    const progressResponse = await makeRequest('/api/courses/test-course-1/progress');
    console.log(`   Статус: ${progressResponse.status}`);
    console.log(`   Ответ: ${progressResponse.body}`);
    
    if (progressResponse.status === 200) {
      console.log('   ✅ Прогресс получен успешно\n');
    } else {
      console.log('   ❌ Ошибка получения прогресса\n');
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

testCourseAPI();
