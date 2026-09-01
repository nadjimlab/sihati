/**
 * Service Worker Registration & Offline State Management
 */

type NetworkStatusCallback = (isOnline: boolean) => void;

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<NetworkStatusCallback> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notifyListeners();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notifyListeners();
  };

  private notifyListeners() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.isOnline);
      } catch (e) {
        console.warn('Error in network listener callback:', e);
      }
    });
  }

  public register(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Register after page load for optimal performance
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          this.registration = reg;
          console.info('[SW] Service Worker registered successfully with scope:', reg.scope);

          // Listen for new worker installed
          reg.addEventListener('updatefound', () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.info('[SW] New content is available; refreshing in background.');
                  installingWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('[SW] Service Worker registration failed (normal in restricted iframes):', error);
        });

      // Reload once when the new Service Worker takes control so users receive the latest bundle.
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }

  public subscribeNetworkStatus(callback: NetworkStatusCallback): () => void {
    this.listeners.add(callback);
    callback(this.isOnline);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }
}

export const swManager = new ServiceWorkerManager();
