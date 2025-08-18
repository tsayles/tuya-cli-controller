export interface TuyaDevice {
  id: string;
  name: string;
  type: 'switch' | 'light' | 'outlet' | 'fan' | 'other';
  isOnline: boolean;
  isOn: boolean;
  ip?: string;
  model?: string;
  lastSeen: Date;
}

export interface DeviceDiscoveryResult {
  devices: TuyaDevice[];
  timestamp: Date;
}

export interface DeviceControlRequest {
  deviceId: string;
  action: 'turn_on' | 'turn_off';
}

export interface DeviceControlResponse {
  success: boolean;
  deviceId: string;
  newState: boolean;
  error?: string;
}