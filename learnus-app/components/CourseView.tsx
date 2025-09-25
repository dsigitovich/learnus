'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, BookOpenIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import ProgressTab from './ProgressTab';
import ChatTab from './ChatTab';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  modules: Array<{
    id: string;
    title: string;
    learningObjectives: string[];
    lessons: Array<{
      id: string;
      title: string;
      type: 'theory' | 'exercise';
      content: string;
      promptsForUser: string[];
      expectedOutcome: string;
      hints?: string[];
    }>;
  }>;
}

interface CourseViewProps {
  courseId: string;
}

type TabType = 'progress' | 'chat';

export default function CourseView({ courseId }: CourseViewProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('progress');
  const router = useRouter();

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}`);
      const data = await response.json();
      
      if (data.success) {
        setCourse(data.course);
      } else {
        console.error('Error fetching course:', data.error);
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'Начинающий';
      case 'intermediate':
        return 'Средний';
      case 'advanced':
        return 'Продвинутый';
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка курса...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Курс не найден</h1>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  // Flatten all lessons from all modules
  const allLessons = course.modules.flatMap(module => 
    module.lessons.map(lesson => ({
      ...lesson,
      moduleTitle: module.title,
    }))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-600">{course.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.level)}`}>
                {getLevelText(course.level)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'progress'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BookOpenIcon className="w-5 h-5" />
                <span>Прогресс</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>Чат с ИИ</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'progress' && (
          <ProgressTab
            courseId={courseId}
            courseTitle={course.title}
            lessons={allLessons}
          />
        )}
        
        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow h-96">
            <ChatTab
              courseId={courseId}
              courseTitle={course.title}
            />
          </div>
        )}
      </div>
    </div>
  );
}