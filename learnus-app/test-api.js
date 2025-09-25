const fetch = require('node-fetch');

async function testAPI() {
    console.log('Тестирование API прогресса курса...');
    
    try {
        // Тест 1: Проверка аутентификации
        console.log('\n1. Проверка аутентификации...');
        const authResponse = await fetch('http://localhost:3000/api/auth/me');
        console.log('Статус:', authResponse.status);
        const authData = await authResponse.text();
        console.log('Ответ:', authData);
        
        if (authResponse.status === 401) {
            console.log('❌ Не аутентифицирован. Нужно войти в систему через браузер.');
            console.log('Откройте http://localhost:3000/auth/signin и войдите в систему.');
            return;
        }
        
        // Тест 2: Получение прогресса курса
        console.log('\n2. Получение прогресса курса...');
        const progressResponse = await fetch('http://localhost:3000/api/courses/1/progress');
        console.log('Статус:', progressResponse.status);
        const progressData = await progressResponse.text();
        console.log('Ответ:', progressData);
        
        // Тест 3: Обновление прогресса урока
        console.log('\n3. Обновление прогресса урока...');
        const updateResponse = await fetch('http://localhost:3000/api/courses/1/progress', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lessonId: 'lesson-1',
                status: 'in_progress'
            })
        });
        console.log('Статус:', updateResponse.status);
        const updateData = await updateResponse.text();
        console.log('Ответ:', updateData);
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    }
}

testAPI();
