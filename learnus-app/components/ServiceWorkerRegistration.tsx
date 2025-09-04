'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          console.log('SW: Registering service worker...');
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });

          console.log('SW: Service worker registered successfully', registration);

          // Обработка обновлений Service Worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              console.log('SW: New service worker found, installing...');
              
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('SW: New service worker installed, prompting for reload');
                  
                  // Показываем уведомление об обновлении
                  if (confirm('Доступно обновление приложения. Перезагрузить страницу?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });

          // Обработка активации нового Service Worker
          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            refreshing = true;
            console.log('SW: Controller changed, reloading page');
            window.location.reload();
          });

        } catch (error) {
          console.error('SW: Service worker registration failed', error);
        }
      };

      // Регистрируем Service Worker после загрузки страницы
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }

      // Cleanup
      return () => {
        window.removeEventListener('load', registerSW);
      };
    }
  }, []);

  return null; // Этот компонент не рендерит ничего
}