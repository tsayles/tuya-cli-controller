import { TuyaDevice, DeviceDiscoveryResult, DeviceControlRequest, DeviceControlResponse } from './types';

const mockDevices: TuyaDevice[] = [
  {
    id: 'device_001',
    name: 'Living Room Light',
    type: 'light',
    isOnline: true,
    isOn: false,
    ip: '192.168.1.101',
    model: 'Tuya Smart Bulb v2',
    lastSeen: new Date()
  },
  {
    id: 'device_002', 
    name: 'Kitchen Outlet',
    type: 'outlet',
    isOnline: true,
    isOn: true,
    ip: '192.168.1.102',
    model: 'Smart Plug Pro',
    lastSeen: new Date()
  },
  {
    id: 'device_003',
    name: 'Bedroom Fan',
    type: 'fan', 
    isOnline: false,
    isOn: false,
    ip: '192.168.1.103',
    model: 'Ceiling Fan Controller',
    lastSeen: new Date(Date.now() - 300000) // 5 minutes ago
  },
  {
    id: 'device_004',
    name: 'Patio Switch',
    type: 'switch',
    isOnline: true,
    isOn: false,
    ip: '192.168.1.104', 
    model: 'Outdoor Smart Switch',
    lastSeen: new Date()
  }
];

class TuyaAPIService {
  private devices: Map<string, TuyaDevice> = new Map();

  constructor() {
    mockDevices.forEach(device => {
      this.devices.set(device.id, { ...device });
    });
  }

  async discoverDevices(): Promise<DeviceDiscoveryResult> {
    await this.simulateNetworkDelay(1500, 3000);
    
    const devices = Array.from(this.devices.values()).map(device => ({
      ...device,
      lastSeen: device.isOnline ? new Date() : device.lastSeen
    }));

    return {
      devices,
      timestamp: new Date()
    };
  }

  async controlDevice(request: DeviceControlRequest): Promise<DeviceControlResponse> {
    await this.simulateNetworkDelay(200, 800);

    const device = this.devices.get(request.deviceId);
    
    if (!device) {
      return {
        success: false,
        deviceId: request.deviceId,
        newState: false,
        error: 'Device not found'
      };
    }

    if (!device.isOnline) {
      return {
        success: false,
        deviceId: request.deviceId, 
        newState: device.isOn,
        error: 'Device is offline'
      };
    }

    if (Math.random() < 0.05) {
      return {
        success: false,
        deviceId: request.deviceId,
        newState: device.isOn,
        error: 'Communication timeout'
      };
    }

    const newState = request.action === 'turn_on';
    device.isOn = newState;
    device.lastSeen = new Date();
    this.devices.set(request.deviceId, device);

    return {
      success: true,
      deviceId: request.deviceId,
      newState
    };
  }

  async getDeviceStatus(deviceId: string): Promise<TuyaDevice | null> {
    await this.simulateNetworkDelay(500, 1200);
    
    const device = this.devices.get(deviceId);
    if (!device) return null;

    // Simulate a chance for offline devices to come back online during status check
    if (!device.isOnline && Math.random() < 0.3) {
      device.isOnline = true;
      device.lastSeen = new Date();
      this.devices.set(deviceId, device);
    }
    
    return { ...device };
  }

  private async simulateNetworkDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  simulateDeviceOffline(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.isOnline = false;
      this.devices.set(deviceId, device);
    }
  }

  simulateDeviceOnline(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.isOnline = true;
      device.lastSeen = new Date();
      this.devices.set(deviceId, device);
    }
  }
}

export const tuyaAPI = new TuyaAPIService();