# Чек-лист разработки LearnUs

## 🚀 Перед началом работы
- [ ] Запустить `npm run check-all` - убедиться, что проект в чистом состоянии
- [ ] Создать новую ветку для фичи
- [ ] Обновить зависимости если нужно

## 📝 При создании новых файлов

### Value Objects
- [ ] Использовать шаблон `templates/ValueObject.template.ts`
- [ ] Добавить методы `value` и `equals`
- [ ] Написать тесты ПЕРЕД реализацией
- [ ] Проверить импорты: `import { ValueObject } from '@shared/types/value-object'`

### Entities
- [ ] Использовать шаблон `templates/Entity.template.ts`
- [ ] Следовать DDD принципам
- [ ] Написать тесты ПЕРЕД реализацией
- [ ] Проверить импорты: `import { Entity } from '@shared/types/entity'`

### Use Cases
- [ ] Использовать шаблон `templates/UseCase.template.ts`
- [ ] Следовать Result pattern
- [ ] Написать тесты ПЕРЕД реализацией
- [ ] Проверить импорты: `import { Result } from '@shared/types/result'`

## 🔍 Промежуточные проверки
После каждого значимого изменения:
- [ ] `npm run type-check` - проверка TypeScript
- [ ] `npm run lint` - проверка ESLint
- [ ] `npm test` - запуск тестов
- [ ] Проверить архитектуру (DDD + Hexagonal)

## 🎯 Перед коммитом
- [ ] `npm run check-all` - полная проверка
- [ ] Убедиться, что все тесты проходят
- [ ] Проверить покрытие тестами
- [ ] Обновить документацию если нужно

## 🚨 Частые ошибки
- ❌ Неправильные импорты (`@/` вместо `@shared/`)
- ❌ Вызов `isFailure()` вместо `isFailure`
- ❌ `Result.fail<User>()` вместо `Result.fail()`
- ❌ Отсутствие методов `value` и `equals` в Value Objects
- ❌ Использование `container.resolve()` вместо `container.get()`

## 📚 Полезные команды
```bash
# Быстрая проверка (без тестов)
npm run check-quick

# Полная проверка
npm run check-all

# Безопасная разработка
npm run dev:safe

# Исправление линтера
npm run lint:fix
```
