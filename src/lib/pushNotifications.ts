/**
 * Push Notification utilities for the admin panel.
 * Handles service worker registration, push subscription, and permission management.
 */

// This will be replaced with your actual VAPID public key from Firebase or web-push
const VAPID_PUBLIC_KEY = "BGtTeZn_9ugnK94-lbH3hPU8XKIi7jBIodYY4JBLjcBrVLiOb2xdDiO_p6bLOurt_QyjkT1fbAWv6jwNePCEbgs";

/**
 * Convert a base64 VAPID key to a Uint8Array for the PushManager API
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Register the admin service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/admin-sw.js", {
      scope: "/admin",
    });
    console.log("Admin SW registered:", registration.scope);
    return registration;
  } catch (error) {
    console.error("Admin SW registration failed:", error);
    return null;
  }
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/**
 * Get the current notification permission status
 */
export function getPermissionStatus(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/**
 * Get the current push subscription if one exists
 */
export async function getSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

/**
 * Subscribe to push notifications.
 * Requests permission, creates a push subscription, and sends it to the backend.
 */
export async function subscribeToPush(): Promise<boolean> {
  if (!isPushSupported()) {
    console.warn("Push notifications not supported");
    return false;
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return false;
    }

    // Wait for the service worker to be ready
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create a new push subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
    }

    // Send the subscription to our backend
    const response = await fetch("/api/admin/push-subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))
          ),
        },
      }),
    });

    if (!response.ok) {
      console.error("Failed to save subscription to server");
      return false;
    }

    console.log("Push subscription saved successfully");
    return true;
  } catch (error) {
    console.error("Failed to subscribe to push:", error);
    return false;
  }
}

/**
 * Unsubscribe from push notifications.
 * Removes the subscription both locally and from the backend.
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Remove from backend first
      await fetch("/api/admin/push-subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      // Then unsubscribe locally
      await subscription.unsubscribe();
    }

    return true;
  } catch (error) {
    console.error("Failed to unsubscribe:", error);
    return false;
  }
}

/**
 * Send a test push notification
 */
export async function sendTestNotification(): Promise<boolean> {
  try {
    const response = await fetch("/api/admin/push-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send test notification:", error);
    return false;
  }
}
