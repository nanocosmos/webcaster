import { ErrorCb } from './utilTypes';
export interface MediaDevicePermissionQuery extends PermissionDescriptor {
    deviceId: string;
    label: string;
}
export interface MediaDevicePermissionResult extends MediaDevicePermissionQuery {
    status: PermissionState;
}
export type MediaDevicesFunc = 'getSupportedConstraints' | 'enumerateDevices' | 'getUserMedia';
export declare function isSupported(method: MediaDevicesFunc): boolean;
export declare function assertSupported(method: MediaDevicesFunc): void;
export declare function getSupportedConstraints(): MediaTrackSupportedConstraints;
/**
 * Uses global Permissions API. @see https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API
 * Get device permissions (checking only audioinput & videoinput kinds)
 * on Chromium browsers for Desktop & Android.
 * Use getUserMedia on Firefox and iOS.
 * @param devices Devices where to check permissions can be obtained for camera & microphone.
 */
export declare function getDevicePermissions(devices: MediaDeviceInfo[], onRejection?: ErrorCb): Promise<MediaDevicePermissionResult[]>;
export declare function getAvailableMediaDevices(): Promise<MediaDeviceInfo[]>;
export declare function filterDevices(devices: MediaDeviceInfo[], deviceKinds?: MediaDeviceKind[], groupId?: string, deviceId?: string): MediaDeviceInfo[];
