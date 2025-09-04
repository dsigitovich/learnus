'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface LazyLoadProps {
  children: ReactNode;
  height?: string;
  className?: string;
  placeholder?: ReactNode;
  threshold?: number;
}

export function LazyLoad({ 
  children, 
  height = 'auto', 
  className = '', 
  placeholder,
  threshold = 0.1 
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold]);

  return (
    <div 
      ref={elementRef} 
      className={className} 
      style={{ height: isVisible ? 'auto' : height }}
    >
      {isVisible ? children : (placeholder || (
        <div 
          className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded"
          style={{ height }}
        />
      ))}
    </div>
  );
}