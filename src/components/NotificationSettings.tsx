import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Flame, Target } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const NotificationSettings = () => {
  const { permission, settings, requestPermission, updateSettings } = useNotifications();

  const handleEnableNotifications = async () => {
    if (permission === 'default') {
      await requestPermission();
    } else if (permission === 'denied') {
      alert(
        'As notificações foram bloqueadas. Por favor, habilite-as nas configurações do navegador.'
      );
    }
  };

  return (
    <Card className="bg-card border-border p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {permission === 'granted' ? (
              <Bell className="w-6 h-6 text-primary" />
            ) : (
              <BellOff className="w-6 h-6 text-muted-foreground" />
            )}
            <div>
              <h3 className="text-xl font-bold text-foreground">Notificações</h3>
              <p className="text-sm text-muted-foreground">
                {permission === 'granted'
                  ? 'Notificações ativadas'
                  : 'Ative para receber lembretes'}
              </p>
            </div>
          </div>
        </div>

        {permission !== 'granted' && (
          <Button
            onClick={handleEnableNotifications}
            className="w-full bg-gradient-hero"
          >
            Ativar Notificações
          </Button>
        )}
      </div>

      {permission === 'granted' && (
        <>
          <div className="h-px bg-border" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-enabled" className="flex items-center space-x-2 cursor-pointer">
                <Bell className="w-4 h-4" />
                <span>Notificações Habilitadas</span>
              </Label>
              <Switch
                id="notifications-enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) => updateSettings({ enabled: checked })}
              />
            </div>

            {settings.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="streak-reminder" className="flex items-center space-x-2 cursor-pointer">
                    <Flame className="w-4 h-4 text-accent" />
                    <span>Lembrete de Streak</span>
                  </Label>
                  <Switch
                    id="streak-reminder"
                    checked={settings.streakReminder}
                    onCheckedChange={(checked) =>
                      updateSettings({ streakReminder: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="quest-reminder" className="flex items-center space-x-2 cursor-pointer">
                    <Target className="w-4 h-4 text-primary" />
                    <span>Lembrete de Missões</span>
                  </Label>
                  <Switch
                    id="quest-reminder"
                    checked={settings.dailyQuestReminder}
                    onCheckedChange={(checked) =>
                      updateSettings({ dailyQuestReminder: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-time">Horário dos Lembretes</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Horário para receber lembretes diários
                  </p>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default NotificationSettings;
