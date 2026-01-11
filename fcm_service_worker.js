// ============================================================================
// FIREBASE MESSAGING SERVICE WORKER
// ============================================================================
// Este archivo debe estar en la raíz del proyecto
// Maneja las notificaciones en segundo plano

// Importar Firebase SDK (versión 10.7.1)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ============================================================================
// CONFIGURACIÓN DE FIREBASE
// ============================================================================
// ⚠️ IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar Messaging
const messaging = firebase.messaging();

// ============================================================================
// MANEJO DE NOTIFICACIONES EN SEGUNDO PLANO
// ============================================================================

// Cuando llega un mensaje en segundo plano (app cerrada o en otra pestaña)
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] Mensaje recibido en segundo plano:', payload);

  // Extraer datos del payload
  const notificationTitle = payload.notification?.title || payload.data?.title || '🔔 Trading Alert';
  
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Nueva señal detectada',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.data?.symbol || 'trading-alert',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      ...payload.data
    },
    actions: [
      {
        action: 'open',
        title: 'Ver Detalles'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  // Mostrar notificación
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ============================================================================
// MANEJO DE CLICS EN NOTIFICACIONES
// ============================================================================

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Clic en notificación:', event);

  event.notification.close();

  if (event.action === 'close') {
    // Usuario cerró la notificación
    return;
  }

  // Abrir o enfocar la app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// ============================================================================
// INSTALACIÓN DEL SERVICE WORKER
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(clients.claim());
});

// ============================================================================
// LOGS DE DEBUG
// ============================================================================

console.log('[Service Worker] Firebase Messaging Service Worker cargado');
console.log('[Service Worker] Versión: 3.0 Pro Scalping');