import { Nullable, TrackKind } from './helpers/utilTypes';
/**
 * Defines audio constraints for MediaTracks.
 */
export type AudioConstraints = Pick<MediaTrackConstraintSet, 'autoGainControl' | 'echoCancellation' | 'noiseSuppression' | 'channelCount'>;
/**  */
export interface UpstreamConfig {
    /** Resolution of the video [width, height]. */
    resolution?: [width: number, height: number];
    /** Maximum framerate of the video in frames per second. */
    maxFramerate?: number;
    /** Maximum video upstream bitrate in bits per second. */
    maxVideoBitrateBps?: number;
    /** Maximum audio upstream bitrate in bits per second. */
    maxAudioBitrateBps?: number;
    /** Force either audio-only or video-only ingest. */
    audioVideoOnly?: TrackKind;
    /** Constraints to be applied to the audio track. */
    audioConstraints?: AudioConstraints;
    /** Server-side audio transcoding bitrate in bits per second. */
    transcodeAudioBitrateBps?: number;
    /** Identifier for the audio device to create an AudioTrack from.
     * It corresponds to the `deviceId` property of an audio device within the `MediaDeviceInfo` class.
     * You can retrieve a list of attached devices (instances of `MediaDeviceInfo`)
     * by invoking the `enumerateDevices` method on `MediaDevices` (accessible through `navigator.mediaDevices?.enumerateDevices()`).
     */
    audioDeviceId?: string;
    /** Identifier for the video device to create a VideoTrack from.
     * It corresponds to the `deviceId` property of a video device within the `MediaDeviceInfo` class.
     * You can retrieve a list of attached devices (instances of `MediaDeviceInfo`)
     * by invoking the `enumerateDevices` method on `MediaDevices` (accessible through `navigator.mediaDevices?.enumerateDevices()`).
     */
    videoDeviceId?: string;
}
/**
 * Configuration for muted video or audio.
 */
export interface MutedConfig {
    /** Indicates that audio is muted. */
    audio?: boolean;
    /** Indicates that video is muted. */
    video?: boolean;
}
/**
 * Defines the configuration for input media streams.
 */
export interface InputConfig {
    muted?: MutedConfig;
    mediaStream?: MediaStream;
    upstreamCfg?: UpstreamConfig;
}
/**
 * Configuration for authorizing against the server.
 */
export interface AuthConfig {
    token: string;
}
/**
 * Main configuration interface for the API.
 */
export interface Config {
    /** URL of the server. */
    serverUrl: string;
    /** Authorization config. */
    auth?: Nullable<AuthConfig>;
    /** Name of the stream. */
    streamName?: string;
    /** URL of the stream. */
    ingestUrl?: string;
    /** Configuration for input media streams. */
    inputCfg?: Nullable<InputConfig>;
    /** Identifier for the video preview element in the DOM. */
    previewVideoElId?: string;
}
export declare const defaultConfig: Required<Config>;
/**
 * Clones internally -> result is a copy of input
 */
export declare function applyConfigDefaults(config: Config): Required<Config>;
export declare function validateConfig(config: Config): void;
