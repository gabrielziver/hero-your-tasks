import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export type NotificationPermission = 'default' | 'granted' | 'denied';

interface NotificationSettings {
  enabled: boolean;
  streakReminder: boolean;
  dailyQuestReminder: boolean;
  reminderTime: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  streakReminder: true,
  dailyQuestReminder: true,
  reminderTime: '09:00',
};

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Verifica permissão atual
    if ('Notification' in window) {
      setPermission(Notification.permission as NotificationPermission);
    }

    // Carrega configurações do localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('Notificações não são suportadas neste navegador');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
      
      if (result === 'granted') {
        toast.success('Notificações ativadas!');
        const newSettings = { ...settings, enabled: true };
        setSettings(newSettings);
        localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
        return true;
      } else {
        toast.error('Permissão negada para notificações');
        return false;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao solicitar permissão');
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') {
      console.warn('Permissão de notificação não concedida');
      return;
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options: {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          ...options,
        },
      });
    } else {
      // Fallback para notificação direta
      new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options,
      });
    }
  };

  const scheduleStreakReminder = () => {
    if (!settings.enabled || !settings.streakReminder) return;

    const now = new Date();
    const [hours, minutes] = settings.reminderTime.split(':').map(Number);
    const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    // Se o horário já passou hoje, agenda para amanhã
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilReminder = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      sendNotification('🔥 Mantenha seu Streak!', {
        body: 'Não esqueça de completar suas missões hoje para manter sua sequência!',
        tag: 'streak-reminder',
        requireInteraction: true,
      });
      
      // Agenda próximo lembrete
      scheduleStreakReminder();
    }, timeUntilReminder);
  };

  const scheduleDailyQuestReminder = () => {
    if (!settings.enabled || !settings.dailyQuestReminder) return;

    const now = new Date();
    const [hours, minutes] = settings.reminderTime.split(':').map(Number);
    const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours + 2, minutes);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilReminder = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      sendNotification('⚔️ Missões Diárias', {
        body: 'Você tem missões pendentes. Complete-as para ganhar XP e ouro!',
        tag: 'quest-reminder',
        requireInteraction: false,
      });
      
      scheduleDailyQuestReminder();
    }, timeUntilReminder);
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('notificationSettings', JSON.stringify(updated));

    // Reagenda lembretes com novas configurações
    if (updated.enabled) {
      if (updated.streakReminder) scheduleStreakReminder();
      if (updated.dailyQuestReminder) scheduleDailyQuestReminder();
    }
  };

  useEffect(() => {
    if (settings.enabled && permission === 'granted') {
      if (settings.streakReminder) scheduleStreakReminder();
      if (settings.dailyQuestReminder) scheduleDailyQuestReminder();
    }
  }, [settings.enabled, permission]);

  return {
    permission,
    settings,
    requestPermission,
    sendNotification,
    updateSettings,
  };
};
