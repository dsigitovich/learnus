'use client';

import { Course } from '@/lib/types';
import { BookOpen, Target, FileText, CheckCircle } from 'lucide-react';

interface CourseViewProps {
  course: Course;
  onStartLearning: () => void;
}

export default function CourseView({ course, onStartLearning }: CourseViewProps) {
  return (
    <div className="h-full overflow-y-auto mobile-scroll">
      <div className="max-w-4xl mx-auto p-4 md:p-6 pt-16 md:pt-6">
        {/* Заголовок курса */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-start md:items-center gap-3">
            <BookOpen className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1 md:mt-0" size={24} />
            <span className="leading-tight">{course.title}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-lg mb-4 leading-relaxed">{course.description}</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs md:text-sm font-medium w-fit">
              {course.level === 'Beginner' ? 'Начинающий' : course.level === 'Intermediate' ? 'Средний' : 'Продвинутый'}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
              {course.modules.length} модулей • {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} уроков
            </span>
          </div>
        </div>

        {/* Кнопка начала обучения */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={onStartLearning}
            className="w-full sm:w-auto px-6 py-3 md:py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 touch-manipulation min-h-[48px]"
          >
            Начать обучение
          </button>
        </div>

        {/* Модули курса */}
        <div className="space-y-4 md:space-y-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">Содержание курса</h2>
        
          {course.modules.map((module, moduleIndex) => (
            <div key={moduleIndex} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 md:p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                  Модуль {moduleIndex + 1}: {module.title}
                </h3>
              
                {/* Цели обучения */}
                <div className="mb-3">
                  <h4 className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Target size={14} />
                    Цели обучения:
                  </h4>
                  <ul className="space-y-1">
                    {module.learning_objectives.map((objective, index) => (
                      <li key={index} className="text-xs md:text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2 leading-relaxed">
                        <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">•</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Уроки */}
              <div className="p-4 md:p-5 space-y-3">
                <h4 className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FileText size={14} />
                  Уроки:
                </h4>
                {module.lessons.map((lesson, lessonIndex) => (
                  <div key={lessonIndex} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                      lesson.type === 'theory' 
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                        : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    }`}>
                      {lessonIndex + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {lesson.title}
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {lesson.type === 'theory' ? 'Теория' : 'Практика'}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Итоговое задание модуля */}
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h5 className="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <CheckCircle size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>Рефлексивный опрос</span>
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {module.module_summary.questions.length} вопросов для закрепления материала
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Финальное задание */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4 md:p-5">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Итоговое задание курса
            </h3>
            {course.course_summary.final_assessment.map((assessment, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <h4 className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
                  {assessment.title}
                </h4>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                  {assessment.content}
                </p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500 italic">
                  Ожидаемый результат: {assessment.expected_outcome}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}