import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { DeviceCard } from '@/components/DeviceCard';
import { tuyaAPI } from '@/lib/tuya-api';
import { TuyaDevice } from '@/lib/types';
import { MagnifyingGlass, Router, CheckCircle, XCircle, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';

function App() {
  const [devices, setDevices] = useKV<TuyaDevice[]>('tuya-devices', []);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useKV<string>('last-scan-time', '');
  const [error, setError] = useState<string | null>(null);

  const scanForDevices = async () => {
    setIsScanning(true);
    setError(null);
    
    try {
      const result = await tuyaAPI.discoverDevices();
      setDevices(result.devices);
      setLastScan(result.timestamp.toISOString());
      
      toast.success(`Found ${result.devices.length} device${result.devices.length !== 1 ? 's' : ''}`);
    } catch (err) {
      const errorMessage = 'Failed to discover devices. Check network connection.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeviceToggle = async (deviceId: string, turnOn: boolean) => {
    const action = turnOn ? 'turn_on' : 'turn_off';
    
    setDevices(currentDevices => 
      currentDevices.map(device => 
        device.id === deviceId 
          ? { ...device, isOn: turnOn }
          : device
      )
    );

    try {
      const response = await tuyaAPI.controlDevice({ deviceId, action });
      
      if (!response.success) {
        setDevices(currentDevices => 
          currentDevices.map(device => 
            device.id === deviceId 
              ? { ...device, isOn: !turnOn }
              : device
          )
        );
        
        toast.error(response.error || 'Failed to control device');
        return;
      }

      setDevices(currentDevices => 
        currentDevices.map(device => 
          device.id === deviceId 
            ? { ...device, isOn: response.newState, lastSeen: new Date() }
            : device
        )
      );

      toast.success(`${turnOn ? 'Turned on' : 'Turned off'} device`);
    } catch (err) {
      setDevices(currentDevices => 
        currentDevices.map(device => 
          device.id === deviceId 
            ? { ...device, isOn: !turnOn }
            : device
        )
      );
      
      toast.error('Network error. Please try again.');
    }
  };

  useEffect(() => {
    if (devices.length === 0) {
      scanForDevices();
    }
  }, []);

  const onlineDevices = devices.filter(device => device.isOnline);
  const offlineDevices = devices.filter(device => !device.isOnline);
  const activeDevices = devices.filter(device => device.isOn && device.isOnline);

  const formatLastScan = (isoString: string) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tuya Device Controller</h1>
              <p className="text-muted-foreground mt-1">
                Discover and control your smart home devices
              </p>
            </div>
            
            <Button 
              onClick={scanForDevices} 
              disabled={isScanning}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Scanning...
                </>
              ) : (
                <>
                  <MagnifyingGlass size={16} className="mr-2" />
                  Scan for Devices
                </>
              )}
            </Button>
          </div>
        </header>

        <div className="grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Router size={16} className="mr-2" />
                Total Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{devices.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle size={16} className="mr-2 text-accent" />
                Online
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{onlineDevices.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <XCircle size={16} className="mr-2 text-destructive" />
                Offline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{offlineDevices.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle size={16} className="mr-2 text-accent" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{activeDevices.length}</div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert className="mb-6 border-destructive">
            <Warning size={16} />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Devices</h2>
            <p className="text-sm text-muted-foreground">
              Last scan: {formatLastScan(lastScan)}
            </p>
          </div>
          
          {devices.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {onlineDevices.length} of {devices.length} online
              </Badge>
            </div>
          )}
        </div>

        {isScanning && devices.length === 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : devices.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Router size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Devices Found</h3>
              <p className="text-muted-foreground mb-4">
                Make sure your Tuya devices are powered on and connected to the same network.
              </p>
              <Button onClick={scanForDevices} disabled={isScanning}>
                <MagnifyingGlass size={16} className="mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {devices.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
                onToggle={handleDeviceToggle}
                isLoading={isScanning}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;