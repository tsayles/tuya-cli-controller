import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Power, Wifi, WifiOff, Lightbulb, Zap, Fan, ToggleLeft } from '@phosphor-icons/react';
import { TuyaDevice } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DeviceCardProps {
  device: TuyaDevice;
  onToggle: (deviceId: string, turnOn: boolean) => Promise<void>;
  isLoading?: boolean;
}

const deviceIcons = {
  light: Lightbulb,
  outlet: Zap,
  fan: Fan,
  switch: ToggleLeft,
  other: Power
};

export function DeviceCard({ device, onToggle, isLoading = false }: DeviceCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const IconComponent = deviceIcons[device.type];

  const handleToggle = async () => {
    if (isToggling || !device.isOnline) return;
    
    setIsToggling(true);
    try {
      await onToggle(device.id, !device.isOn);
    } finally {
      setIsToggling(false);
    }
  };

  const formatLastSeen = (date: Date | string) => {
    const now = new Date();
    const lastSeenDate = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      !device.isOnline && "opacity-60",
      device.isOn && device.isOnline && "ring-2 ring-accent/20"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              device.isOn && device.isOnline 
                ? "bg-accent text-accent-foreground" 
                : "bg-muted text-muted-foreground"
            )}>
              <IconComponent size={20} weight={device.isOn ? "fill" : "regular"} />
            </div>
            <div>
              <h3 className="font-medium text-lg leading-tight">{device.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{device.type}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {device.isOnline ? (
              <Wifi size={16} className="text-accent" />
            ) : (
              <WifiOff size={16} className="text-destructive" />
            )}
            <Badge variant={device.isOnline ? "default" : "secondary"}>
              {device.isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">
              {device.isOn ? "On" : "Off"}
            </span>
            <span className="text-xs text-muted-foreground">
              Last seen: {formatLastSeen(device.lastSeen)}
            </span>
            {device.model && (
              <span className="text-xs text-muted-foreground">
                {device.model}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Switch
              checked={device.isOn}
              onCheckedChange={handleToggle}
              disabled={!device.isOnline || isToggling || isLoading}
              className="data-[state=checked]:bg-accent"
            />
            
            {(!device.isOnline) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-xs"
              >
                Retry
              </Button>
            )}
          </div>
        </div>
        
        {device.ip && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">IP: {device.ip}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}