'use client';

import React, { useState } from 'react';
import { ProgressDashboard } from '@presentation/components/progress/ProgressDashboard';
import { CircularProgress, GradientCircularProgress, MiniCircularProgress } from '@presentation/components/progress/CircularProgress';
import { ProgressBar, SegmentedProgressBar, SteppedProgressBar, VerticalProgressBar } from '@presentation/components/progress/ProgressBar';
import { ProgressStats, CompactProgressStats } from '@presentation/components/progress/ProgressStats';
import { useTrackProgress, LessonProgressStatus } from '@presentation/hooks/useProgress';

// Mock данные для демонстрации
const mockStatistics = {
  totalModulesStarted: 5,
  totalModulesCompleted: 2,
  totalLessonsCompleted: 18,
  totalTimeSpent: 12600, // 3.5 hours
  currentStreak: 7,
  longestStreak: 14,
  averageTimePerLesson: 700, // ~12 minutes
  completionRate: 40,
  formattedTotalTime: '3h 30m',
  formattedAverageTime: '12m',
};

const mockModuleProgresses = [
  {
    moduleId: 'react-basics',
    progress: {
      completedLessons: 8,
      totalLessons: 10,
      completionPercentage: 80,
      isCompleted: false,
      totalTimeSpent: 4800,
      formattedTimeSpent: '1h 20m',
    },
    startedAt: '2024-01-15T10:00:00Z',
    lastAccessedAt: '2024-01-20T14:30:00Z',
    currentLessonId: 'lesson-9',
    nextLessonId: 'lesson-9',
  },
  {
    moduleId: 'javascript-advanced',
    progress: {
      completedLessons: 6,
      totalLessons: 6,
      completionPercentage: 100,
      isCompleted: true,
      totalTimeSpent: 3600,
      formattedTimeSpent: '1h',
    },
    startedAt: '2024-01-10T09:00:00Z',
    lastAccessedAt: '2024-01-18T16:00:00Z',
    completedAt: '2024-01-18T16:00:00Z',
  },
  {
    moduleId: 'typescript-intro',
    progress: {
      completedLessons: 4,
      totalLessons: 12,
      completionPercentage: 33.33,
      isCompleted: false,
      totalTimeSpent: 2400,
      formattedTimeSpent: '40m',
    },
    startedAt: '2024-01-20T11:00:00Z',
    lastAccessedAt: '2024-01-21T15:00:00Z',
    currentLessonId: 'lesson-5',
    nextLessonId: 'lesson-5',
  },
];

export default function ProgressDemoPage() {
  const [selectedDemo, setSelectedDemo] = useState('dashboard');
  const { trackProgress, loading, error } = useTrackProgress();

  const handleTrackProgress = async () => {
    try {
      await trackProgress({
        userId: 'demo-user',
        moduleId: 'react-basics',
        lessonId: 'lesson-9',
        status: LessonProgressStatus.COMPLETED,
        timeSpent: 900, // 15 minutes
        completedAt: new Date(),
      });
      alert('Progress tracked successfully!');
    } catch (err) {
      console.error('Failed to track progress:', err);
    }
  };

  const demos = [
    { id: 'dashboard', name: 'Progress Dashboard', description: 'Complete dashboard with all components' },
    { id: 'circular', name: 'Circular Progress', description: 'Various circular progress indicators' },
    { id: 'bars', name: 'Progress Bars', description: 'Different types of progress bars' },
    { id: 'stats', name: 'Statistics', description: 'Progress statistics components' },
    { id: 'interactive', name: 'Interactive Demo', description: 'Test progress tracking functionality' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Progress System Demo</h1>
          <p className="text-gray-600 mt-2">
            Demonstration of the complete progress tracking and visualization system
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setSelectedDemo(demo.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDemo === demo.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {demo.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {demos.find(d => d.id === selectedDemo)?.description}
          </p>
        </div>

        {/* Demo Content */}
        <div className="space-y-8">
          {selectedDemo === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Progress Dashboard</h2>
              <ProgressDashboard
                userId="demo-user"
                moduleId="react-basics"
                totalLessons={10}
              />
            </div>
          )}

          {selectedDemo === 'circular' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Circular Progress Indicators</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Basic Circular Progress */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Basic Circular Progress</h3>
                  <div className="flex justify-center space-x-4">
                    <CircularProgress percentage={25} size={80} />
                    <CircularProgress percentage={50} size={80} />
                    <CircularProgress percentage={75} size={80} />
                    <CircularProgress percentage={100} size={80} color="#10b981" />
                  </div>
                </div>

                {/* Gradient Circular Progress */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Gradient Circular Progress</h3>
                  <div className="flex justify-center space-x-4">
                    <GradientCircularProgress percentage={30} size={80} />
                    <GradientCircularProgress percentage={70} size={80} />
                  </div>
                </div>

                {/* Mini Circular Progress */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Mini Circular Progress</h3>
                  <div className="flex justify-center space-x-4">
                    <MiniCircularProgress percentage={20} />
                    <MiniCircularProgress percentage={45} />
                    <MiniCircularProgress percentage={80} />
                    <MiniCircularProgress percentage={100} color="#10b981" />
                  </div>
                </div>

                {/* Custom Content */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Custom Content</h3>
                  <div className="flex justify-center">
                    <CircularProgress percentage={67} size={120} showPercentage={false}>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">8</div>
                        <div className="text-xs text-gray-500">of 12</div>
                      </div>
                    </CircularProgress>
                  </div>
                </div>

                {/* Different Sizes */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Different Sizes</h3>
                  <div className="flex justify-center items-center space-x-4">
                    <CircularProgress percentage={60} size={60} strokeWidth={6} />
                    <CircularProgress percentage={60} size={100} strokeWidth={8} />
                    <CircularProgress percentage={60} size={140} strokeWidth={10} />
                  </div>
                </div>

                {/* Color Variations */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Color Variations</h3>
                  <div className="flex justify-center space-x-4">
                    <CircularProgress percentage={75} size={80} color="#ef4444" />
                    <CircularProgress percentage={75} size={80} color="#f59e0b" />
                    <CircularProgress percentage={75} size={80} color="#10b981" />
                    <CircularProgress percentage={75} size={80} color="#8b5cf6" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedDemo === 'bars' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress Bars</h2>
              
              <div className="space-y-8">
                {/* Basic Progress Bars */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Basic Progress Bars</h3>
                  <div className="space-y-4">
                    <ProgressBar percentage={25} showLabel={true} label="JavaScript Basics" showPercentage={true} />
                    <ProgressBar percentage={60} showLabel={true} label="React Fundamentals" showPercentage={true} />
                    <ProgressBar percentage={90} showLabel={true} label="CSS Styling" showPercentage={true} />
                    <ProgressBar percentage={100} showLabel={true} label="HTML Structure" showPercentage={true} color="#10b981" />
                  </div>
                </div>

                {/* Segmented Progress Bar */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Segmented Progress Bar</h3>
                  <SegmentedProgressBar
                    segments={[
                      { value: 8, color: '#10b981', label: 'Completed' },
                      { value: 3, color: '#3b82f6', label: 'In Progress' },
                      { value: 2, color: '#6b7280', label: 'Not Started' },
                    ]}
                    showLabels={true}
                    height={12}
                  />
                </div>

                {/* Stepped Progress Bar */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Stepped Progress Bar</h3>
                  <div className="space-y-6">
                    <SteppedProgressBar
                      currentStep={3}
                      totalSteps={5}
                      showStepNumbers={true}
                    />
                    <SteppedProgressBar
                      currentStep={7}
                      totalSteps={10}
                      showStepNumbers={false}
                    />
                  </div>
                </div>

                {/* Vertical Progress Bar */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Vertical Progress Bar</h3>
                  <div className="flex justify-center space-x-8">
                    <VerticalProgressBar percentage={30} showPercentage={true} />
                    <VerticalProgressBar percentage={65} showPercentage={true} color="#f59e0b" />
                    <VerticalProgressBar percentage={90} showPercentage={true} color="#10b981" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedDemo === 'stats' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress Statistics</h2>
              
              <div className="space-y-8">
                {/* Full Statistics */}
                <ProgressStats
                  statistics={mockStatistics}
                  moduleProgresses={mockModuleProgresses}
                />

                {/* Compact Statistics */}
                <CompactProgressStats statistics={mockStatistics} />
              </div>
            </div>
          )}

          {selectedDemo === 'interactive' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Interactive Progress Tracking</h2>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Test Progress Tracking API</h3>
                <p className="text-gray-600 mb-4">
                  Click the button below to test the progress tracking functionality.
                  This will attempt to track completion of lesson-9 in the react-basics module.
                </p>
                
                <button
                  onClick={handleTrackProgress}
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Tracking Progress...' : 'Track Lesson Progress'}
                </button>
                
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">Error: {error}</p>
                    <p className="text-sm text-red-600 mt-2">
                      Note: This is expected in demo mode as the database may not be initialized.
                    </p>
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">API Endpoints Available:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• POST /api/progress/track - Track lesson progress</li>
                    <li>• GET /api/progress/user/[userId] - Get user progress</li>
                    <li>• GET /api/progress/module - Calculate module progress</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}