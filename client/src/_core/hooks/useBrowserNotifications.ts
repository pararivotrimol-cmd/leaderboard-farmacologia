/**
 * Browser Notifications Hook
 * Handles Notification API and user preferences for push notifications
 */

import { useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

interface NotificationPreferences {
  enabledTypes: string[];
  quietHoursStart: number; // 0-23
  quietHoursEnd: number; // 0-23
  enabled: boolean;
}

export function useBrowserNotifications(memberId: number) {
  const { data: preferences } = trpc.studentNotifications.getPreferences.useQuery(
    { memberId },
    { enabled: memberId > 0 }
  );

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  const isInQuietHours = useCallback(() => {
    if (!preferences) return false;
    const now = new Date();
    const currentHour = now.getHours();
    const { quietHoursStart, quietHoursEnd } = preferences;

    if (quietHoursStart < quietHoursEnd) {
      return currentHour >= quietHoursStart && currentHour < quietHoursEnd;
    } else {
      // Quiet hours span midnight (e.g., 22:00 to 06:00)
      return currentHour >= quietHoursStart || currentHour < quietHoursEnd;
    }
  }, [preferences]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!preferences?.enabled || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;
      if (isInQuietHours()) return;

      new Notification(title, {
        icon: "/logo.png",
        badge: "/logo.png",
        ...options,
      });
    },
    [preferences, isInQuietHours]
  );

  return {
    preferences,
    sendNotification,
    isInQuietHours: isInQuietHours(),
    hasPermission: typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted",
  };
}
