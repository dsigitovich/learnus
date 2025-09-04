'use client';

import React from 'react';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

export function ProgressBar({
  percentage,
  height = 8,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  showPercentage = false,
  showLabel = false,
  label,
  className = '',
  animated = true,
}: ProgressBarProps) {
  // Нормализуем процент от 0 до 100
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className={`w-full ${className}`}>
      {/* Заголовок и процент */}
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {showLabel && label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700">
              {Math.round(normalizedPercentage)}%
            </span>
          )}
        </div>
      )}
      
      {/* Прогресс-бар */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ 
          height: `${height}px`, 
          backgroundColor 
        }}
      >
        <div
          className={`h-full rounded-full ${animated ? 'transition-all duration-500 ease-out' : ''}`}
          style={{
            width: `${normalizedPercentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

// Многосегментный прогресс-бар
interface SegmentedProgressBarProps {
  segments: {
    value: number;
    color: string;
    label?: string;
  }[];
  height?: number;
  backgroundColor?: string;
  showLabels?: boolean;
  className?: string;
  animated?: boolean;
}

export function SegmentedProgressBar({
  segments,
  height = 8,
  backgroundColor = '#e5e7eb',
  showLabels = false,
  className = '',
  animated = true,
}: SegmentedProgressBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  
  return (
    <div className={`w-full ${className}`}>
      {/* Лейблы сегментов */}
      {showLabels && (
        <div className="flex justify-between items-center mb-2 text-xs">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gray-600">
                {segment.label} ({segment.value})
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Прогресс-бар */}
      <div
        className="w-full rounded-full overflow-hidden flex"
        style={{ 
          height: `${height}px`, 
          backgroundColor 
        }}
      >
        {segments.map((segment, index) => {
          const percentage = total > 0 ? (segment.value / total) * 100 : 0;
          return (
            <div
              key={index}
              className={`h-full ${animated ? 'transition-all duration-500 ease-out' : ''}`}
              style={{
                width: `${percentage}%`,
                backgroundColor: segment.color,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Прогресс-бар с шагами
interface SteppedProgressBarProps {
  currentStep: number;
  totalSteps: number;
  completedColor?: string;
  currentColor?: string;
  pendingColor?: string;
  showStepNumbers?: boolean;
  className?: string;
}

export function SteppedProgressBar({
  currentStep,
  totalSteps,
  completedColor = '#10b981',
  currentColor = '#3b82f6',
  pendingColor = '#e5e7eb',
  showStepNumbers = false,
  className = '',
}: SteppedProgressBarProps) {
  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            {/* Шаг */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                  step < currentStep
                    ? 'text-white'
                    : step === currentStep
                    ? 'text-white'
                    : 'text-gray-400'
                }`}
                style={{
                  backgroundColor:
                    step < currentStep
                      ? completedColor
                      : step === currentStep
                      ? currentColor
                      : pendingColor,
                }}
              >
                {showStepNumbers ? step : (step < currentStep ? '✓' : step)}
              </div>
              {showStepNumbers && (
                <span className="text-xs text-gray-500 mt-1">
                  Step {step}
                </span>
              )}
            </div>
            
            {/* Соединительная линия */}
            {index < steps.length - 1 && (
              <div
                className="flex-1 h-1 mx-2 rounded transition-colors duration-200"
                style={{
                  backgroundColor: step < currentStep ? completedColor : pendingColor,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Вертикальный прогресс-бар
export function VerticalProgressBar({
  percentage,
  width = 8,
  height = 200,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  showPercentage = false,
  className = '',
  animated = true,
}: Omit<ProgressBarProps, 'height'> & { width?: number; height?: number }) {
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Вертикальный бар */}
      <div
        className="rounded-full overflow-hidden flex flex-col-reverse"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor,
        }}
      >
        <div
          className={`rounded-full ${animated ? 'transition-all duration-500 ease-out' : ''}`}
          style={{
            height: `${normalizedPercentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      
      {/* Процент */}
      {showPercentage && (
        <span className="text-sm font-medium text-gray-700 mt-2">
          {Math.round(normalizedPercentage)}%
        </span>
      )}
    </div>
  );
}