'use client';

import { useEffect } from 'react';

export function PerformanceOptimizer() {
  useEffect(() => {
    // Prefetch важных ресурсов
    const prefetchResources = () => {
      // Prefetch API routes
      const apiRoutes = ['/api/chat'];
      
      apiRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    };

    // Оптимизация для мобильных устройств
    const optimizeForMobile = () => {
      if (typeof window !== 'undefined') {
        // Отключаем zoom на double tap для iOS
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
          const now = (new Date()).getTime();
          if (now - lastTouchEnd <= 300) {
            event.preventDefault();
          }
          lastTouchEnd = now;
        }, false);

        // Оптимизация скролла для iOS
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // Предотвращение bounce эффекта на iOS
        document.addEventListener('touchmove', (e) => {
          if (e.scale !== 1) {
            e.preventDefault();
          }
        }, { passive: false });

        // Улучшение производительности анимаций
        const style = document.createElement('style');
        style.textContent = `
          * {
            -webkit-backface-visibility: hidden;
            -webkit-transform: translate3d(0, 0, 0);
          }
        `;
        document.head.appendChild(style);
      }
    };

    // Lazy loading для изображений
    const setupImageLazyLoading = () => {
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
              }
            }
          });
        });

        // Observe all images with lazy class
        document.querySelectorAll('img.lazy').forEach(img => {
          imageObserver.observe(img);
        });
      }
    };

    // Memory management
    const setupMemoryManagement = () => {
      // Очистка неиспользуемых ресурсов при скрытии страницы
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // Приостанавливаем анимации
          document.querySelectorAll('.animate-pulse').forEach(el => {
            (el as HTMLElement).style.animationPlayState = 'paused';
          });
        } else {
          // Возобновляем анимации
          document.querySelectorAll('.animate-pulse').forEach(el => {
            (el as HTMLElement).style.animationPlayState = 'running';
          });
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    };

    // Инициализация всех оптимизаций
    prefetchResources();
    optimizeForMobile();
    setupImageLazyLoading();
    const cleanupMemoryManagement = setupMemoryManagement();

    // Cleanup
    return () => {
      cleanupMemoryManagement?.();
    };
  }, []);

  return null;
}