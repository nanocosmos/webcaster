//@ts-ignore
import { z } from 'zod';

export declare enum LogLevel {
	"TRACE" = 6,
	"DEBUG" = 5,
	"LOG" = 4,
	"INFO" = 3,
	"WARN" = 2,
	"ERROR" = 1,
	"OFF" = 0
}
export interface LoggerConfig {
	level: LogLevel;
	domain: string;
	prefix: string;
	withLevel?: boolean;
	enableDebug: boolean;
}
export type LoggerFunc = (...msg: any[]) => void;
export declare function overrideLoggerDefaults(config: Partial<LoggerConfig>, persist?: boolean): void;
export interface Logger {
	trace: LoggerFunc;
	debug: LoggerFunc;
	log: LoggerFunc;
	info: LoggerFunc;
	warn: LoggerFunc;
	error: LoggerFunc;
}
export declare function getLogger(configOrCategory: LoggerConfig | string): Logger;
export declare function getLogDumpData(): [
	LogLevel,
	number,
	string
][];
export declare function overrideOnLogCallback(callback: (...msg: any[]) => void): void;
export type Nullable<T> = T | null;
export type TrackKind = "audio" | "video";
export type ErrorCb = (err: Error) => void;
export interface Disposable {
	dispose(): void;
}
/**
 * Defines audio constraints for MediaTracks.
 */
export type AudioConstraints = Pick<MediaTrackConstraintSet, "autoGainControl" | "echoCancellation" | "noiseSuppression" | "channelCount">;
/**  */
export interface MediaStreamConfig {
	/** Resolution of the video [width, height]. */
	resolution?: [
		width: number,
		height: number
	];
	/** Maximum framerate of the video in frames per second. */
	maxFramerate?: number;
	/** Force either audio-only or video-only ingest. */
	audioVideoOnly?: TrackKind;
	/** Constraints to be applied to the audio track. */
	audioConstraints?: AudioConstraints;
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
export interface BroadcastConfig {
	/** Server-side audio transcoding bitrate in bits per second. */
	transcodeAudioBitrateBps?: number;
	/** Maximum video upstream bitrate in bits per second. */
	maxVideoBitrateBps?: number;
	/** Maximum audio upstream bitrate in bits per second. */
	maxAudioBitrateBps?: number;
	/** Maximum framerate of the encoded video in frames per second. */
	maxEncodingFramerate?: number;
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
 *
 * When mediaStream and mediaStreamCfg are not passed, mediaStream is created with default constraints.
 */
export interface InputConfig {
	/** if defined, mediaStreamCfg will be ignored */
	mediaStream?: Nullable<MediaStream>;
	/** only used when mediaStream is undefined */
	mediaStreamCfg?: Nullable<MediaStreamConfig>;
	muted?: MutedConfig;
	broadcastCfg?: Nullable<BroadcastConfig>;
}
/**
 * Configuration for authorizing against the server.
 */
export interface AuthConfig {
	token: string;
}
/**
 * Metrics Credentials configuration.
 */
export interface MetricsCredentialsConfig {
	accountId: string;
	accountKey: string;
}
/** Reconnection config */
export interface ReconnectConfig {
	/** Minimum delay for a reconnect attempt in seconds. Min value: 1 */
	minDelaySec?: number;
	/** Maximum delay for a reconnect attempt in seconds. Min value: 1 */
	maxDelaySec?: number;
	/** Maximum amount of successive attempts to reconnect a broken broadcast before failure. Min value: 1 */
	maxRetries?: number;
}
/**
 * Main configuration interface for the API.
 */
export interface Config {
	/** URL of the server. */
	serverUrl?: string;
	/** Authorization config. Note: Disabled for now.   */
	auth?: Nullable<AuthConfig>;
	/** Name of the stream.  */
	streamName?: Nullable<string>;
	/** URL of the stream. */
	ingestUrl?: string;
	/** Configuration for input media streams and broadcast. */
	inputCfg?: Nullable<InputConfig>;
	/** Identifier for the video preview element in the DOM. */
	previewVideoElId?: Nullable<string>;
	/** Metrics credentials */
	metrics?: Nullable<MetricsCredentialsConfig>;
	/** Reconnection config. */
	reconnect?: Nullable<ReconnectConfig> | boolean;
}
export type ResultConfig = z.output<typeof configSchema>;
export type ResultMutedConfig = z.infer<typeof mutedConfigSchema>;
declare const mutedConfigSchema: z.ZodOptional<z.ZodObject<{
	audio: z.ZodOptional<z.ZodBoolean>;
	video: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
	audio?: boolean | undefined;
	video?: boolean | undefined;
}, {
	audio?: boolean | undefined;
	video?: boolean | undefined;
}>>;
declare const configSchema: z.ZodEffects<z.ZodObject<{
	serverUrl: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, string, string | undefined>;
	auth: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodObject<{
		token: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		token: string;
	}, {
		token: string;
	}>>>, {
		token: string;
	} | null, {
		token: string;
	} | null | undefined>;
	streamName: z.ZodDefault<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
	ingestUrl: z.ZodDefault<z.ZodOptional<z.ZodString>>;
	inputCfg: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodObject<{
		mediaStream: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodUnknown, MediaStream, unknown>>>, MediaStream | null, unknown>;
		mediaStreamCfg: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodObject<{
			resolution: z.ZodOptional<z.ZodTuple<[
				z.ZodNumber,
				z.ZodNumber
			], null>>;
			maxFramerate: z.ZodOptional<z.ZodNumber>;
			audioVideoOnly: z.ZodOptional<z.ZodUnion<[
				z.ZodLiteral<"audio">,
				z.ZodLiteral<"video">
			]>>;
			audioConstraints: z.ZodOptional<z.ZodObject<{
				autoGainControl: z.ZodOptional<z.ZodAny>;
				echoCancellation: z.ZodOptional<z.ZodAny>;
				noiseSuppression: z.ZodOptional<z.ZodAny>;
				channelCount: z.ZodOptional<z.ZodAny>;
			}, "strip", z.ZodTypeAny, {
				autoGainControl?: any;
				echoCancellation?: any;
				noiseSuppression?: any;
				channelCount?: any;
			}, {
				autoGainControl?: any;
				echoCancellation?: any;
				noiseSuppression?: any;
				channelCount?: any;
			}>>;
			audioDeviceId: z.ZodOptional<z.ZodString>;
			videoDeviceId: z.ZodOptional<z.ZodString>;
		}, "strip", z.ZodTypeAny, {
			resolution?: [
				number,
				number
			] | undefined;
			maxFramerate?: number | undefined;
			audioVideoOnly?: "audio" | "video" | undefined;
			audioConstraints?: {
				autoGainControl?: any;
				echoCancellation?: any;
				noiseSuppression?: any;
				channelCount?: any;
			} | undefined;
			audioDeviceId?: string | undefined;
			videoDeviceId?: string | undefined;
		}, {
			resolution?: [
				number,
				number
			] | undefined;
			maxFramerate?: number | undefined;
			audioVideoOnly?: "audio" | "video" | undefined;
			audioConstraints?: {
				autoGainControl?: any;
				echoCancellation?: any;
				noiseSuppression?: any;
				channelCount?: any;
			} | undefined;
			audioDeviceId?: string | undefined;
			videoDeviceId?: string | undefined;
		}>>>, {
			resolution?: [
				number,
				number
			] | undefined;
			maxFramerate?: number | undefined;
			audioVideoOnly?: "audio" | "video" | undefined;
			audioConstraints?: {
				autoGainControl?: any;
				echoCancellation?: any;
				noiseSuppression?: any;
				channelCount?: any;
			} | undefined;
			audioDeviceId?: string | undefined;
			videoDeviceId?: string | undefined;
		} | null, {
			resolution?: [
				number,
				number
			] | undefined;
			maxFramerate?: number | undefined;
			audioVideoOnly?: "audio" | "video" | undefined;
			audioConstraints?: {
				autoGainControl?: any;
				echoCancellation?: any;
				noiseSuppression?: any;
				channelCount?: any;
			} | undefined;
			audioDeviceId?: string | undefined;
			videoDeviceId?: string | undefined;
		} | null | undefined>;
		muted: z.ZodOptional<z.ZodObject<{
			audio: z.ZodOptional<z.ZodBoolean>;
			video: z.ZodOptional<z.ZodBoolean>;
		}, "strip", z.ZodTypeAny, {
			audio?: boolean | undefined;
			video?: boolean | undefined;
		}, {
			audio?: boolean | undefined;
			video?: boolean | undefined;
		}>>;
		broadcastCfg: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodObject<{
			transcodeAudioBitrateBps: z.ZodOptional<z.ZodNumber>;
			maxVideoBitrateBps: z.ZodOptional<z.ZodNumber>;
			maxAudioBitrateBps: z.ZodOptional<z.ZodNumber>;
			maxEncodingFramerate: z.ZodOptional<z.ZodNumber>;
		}, "strip", z.ZodTypeAny, {
			transcodeAudioBitrateBps?: number | undefined;
			maxVideoBitrateBps?: number | undefined;
			maxAudioBitrateBps?: number | undefined;
			maxEncodingFramerate?: number | undefined;
		}, {
			transcodeAudioBitrateBps?: number | undefined;
			maxVideoBitrateBps?: number | undefined;
			maxAudioBitrateBps?: number | undefined;
			maxEncodingFramerate?: number | undefined;
		}>>>, {
			transcodeAudioBitrateBps?: number | undefined;
			maxVideoBitrateBps?: number | undefined;
			maxAudioBitrateBps?: number | undefined;
			maxEncodingFramerate?: number | undefined;
		} | null, {
			transcodeAudioBitrateBps?: number | undefined;
			maxVideoBitrateBps?: number | undefined;
			maxAudioBitrateBps?: number | undefined;
			maxEncodingFramerate?: number | undefined;
		} | null | undefined>;
	}, "strip", z.ZodTypeAny, {
		mediaStream: MediaStream | null;
		mediaStreamCfg: {
			resolution?: [
				number,
				number
			] | undefined;
			maxFramerate?: number | undefined;
			audioVideoOnly?: "audio" | "video" | undefined;
			audioConstraints?: {
				autoGainControl?: any;
				echoCancellation?: any;
				noiseSuppression?: any;
				channelCount?: any;
			} | undefined;
			audioDeviceId?: string | undefined;
			videoDeviceId?: string | undefined;
		} | null;
		broadcastCfg: {
			transcodeAudioBitrateBps?: number | undefined;
			maxVideoBitrateBps?: number | undefined;
			maxAudioBitrateBps?: number | undefined;
			maxEncodingFramerate?: number | undefined;
		} | null;
		muted?: {
			audio?: boolean | undefined;
			video?: boolean | undefined;
		} | undefined;
	}, {
		mediaStream?: unknown;
		mediaStreamCfg?: {
			resolution?: [
				number,
				number
			] | undefined;
			maxFramerate?: number | undefined;
			audioVideoOnly?: "audio" | "video" | undefined;
			audioConstraints?: {
				autoGainControl?: any;
				echoCancellation?: any;
				noiseSuppression?: any;
				channelCount?: any;
			} | undefined;
			audioDeviceId?: string | undefined;
			videoDeviceId?: string | undefined;
		} | null | undefined;
		muted?: {
			audio?: boolean | undefined;
			video?: boolean | undefined;
		} | undefined;
		broadcastCfg?: {
			transcodeAudioBitrateBps?: number | undefined;
			maxVideoBitrateBps?: number | undefined;
			maxAudioBitrateBps?: number | undefined;
			maxEncodingFramerate?: number | undefined;
		} | null | undefined;
	}>>>, {
		mediaStream: MediaStream | null;
		mediaStreamCfg: {
			resolution?: [
				number,
				number
			] | undefined;
			maxFramerate?: number | undefined;
			audioVideoOnly?: "audio" | "video" | undefined;
			audioConstraints?: {
				autoGainControl?: any;
				echoCancellation?: any;
				noiseSuppression?: any;
				channelCount?: any;
			} | undefined;
			audioDeviceId?: string | undefined;
			videoDeviceId?: string | undefined;
		} | null;
		broadcastCfg: {
			transcodeAudioBitrateBps?: number | undefined;
			maxVideoBitrateBps?: number | undefined;
			maxAudioBitrateBps?: number | undefined;
			maxEncodingFramerate?: number | undefined;
		} | null;
		muted?: {
			audio?: boolean | undefined;
			video?: boolean | undefined;
		} | undefined;
	}, {
		mediaStream?: unknown;
		mediaStreamCfg?: {
			resolution?: [
				number,
				number
			] | undefined;
			maxFramerate?: number | undefined;
			audioVideoOnly?: "audio" | "video" | undefined;
			audioConstraints?: {
				autoGainControl?: any;
				echoCancellation?: any;
				noiseSuppression?: any;
				channelCount?: any;
			} | undefined;
			audioDeviceId?: string | undefined;
			videoDeviceId?: string | undefined;
		} | null | undefined;
		muted?: {
			audio?: boolean | undefined;
			video?: boolean | undefined;
		} | undefined;
		broadcastCfg?: {
			transcodeAudioBitrateBps?: number | undefined;
			maxVideoBitrateBps?: number | undefined;
			maxAudioBitrateBps?: number | undefined;
			maxEncodingFramerate?: number | undefined;
		} | null | undefined;
	} | null | undefined>;
	previewVideoElId: z.ZodDefault<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
	metrics: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodObject<{
		accountId: z.ZodString;
		accountKey: z.ZodString;
	}, "strip", z.ZodTypeAny, {
		accountId: string;
		accountKey: string;
	}, {
		accountId: string;
		accountKey: string;
	}>>>, {
		accountId: string;
		accountKey: string;
	}, {
		accountId: string;
		accountKey: string;
	} | null | undefined>;
	reconnect: z.ZodEffects<z.ZodUnion<[
		z.ZodEffects<z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodObject<{
			minDelaySec: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
			maxDelaySec: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
			maxRetries: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
		}, "strip", z.ZodTypeAny, {
			minDelaySec: number;
			maxDelaySec: number;
			maxRetries: number;
		}, {
			minDelaySec?: number | undefined;
			maxDelaySec?: number | undefined;
			maxRetries?: number | undefined;
		}>>>, {
			minDelaySec: number;
			maxDelaySec: number;
			maxRetries: number;
		} | null, {
			minDelaySec?: number | undefined;
			maxDelaySec?: number | undefined;
			maxRetries?: number | undefined;
		} | null | undefined>, {
			minDelaySec: number;
			maxDelaySec: number;
			maxRetries: number;
		} | null, {
			minDelaySec?: number | undefined;
			maxDelaySec?: number | undefined;
			maxRetries?: number | undefined;
		} | null | undefined>,
		z.ZodEffects<z.ZodBoolean, {
			minDelaySec: number;
			maxDelaySec: number;
			maxRetries: number;
		} | null, boolean>
	]>, {
		minDelaySec: number;
		maxDelaySec: number;
		maxRetries: number;
	} | {
		minDelaySec: number;
		maxDelaySec: number;
		maxRetries: number;
	} | null, unknown>;
}, "strict", z.ZodTypeAny, {
	auth: {
		token: string;
	} | null;
	serverUrl: string;
	streamName: string | null;
	ingestUrl: string;
	inputCfg: {
		mediaStream: MediaStream | null;
		mediaStreamCfg: {
			resolution?: [
				number,
				number
			] | undefined;
			maxFramerate?: number | undefined;
			audioVideoOnly?: "audio" | "video" | undefined;
			audioConstraints?: {
				autoGainControl?: any;
				echoCancellation?: any;
				noiseSuppression?: any;
				channelCount?: any;
			} | undefined;
			audioDeviceId?: string | undefined;
			videoDeviceId?: string | undefined;
		} | null;
		broadcastCfg: {
			transcodeAudioBitrateBps?: number | undefined;
			maxVideoBitrateBps?: number | undefined;
			maxAudioBitrateBps?: number | undefined;
			maxEncodingFramerate?: number | undefined;
		} | null;
		muted?: {
			audio?: boolean | undefined;
			video?: boolean | undefined;
		} | undefined;
	};
	previewVideoElId: string | null;
	metrics: {
		accountId: string;
		accountKey: string;
	};
	reconnect: (({
		minDelaySec: number;
		maxDelaySec: number;
		maxRetries: number;
	} | {
		minDelaySec: number;
		maxDelaySec: number;
		maxRetries: number;
	}) & ({
		minDelaySec: number;
		maxDelaySec: number;
		maxRetries: number;
	} | {
		minDelaySec: number;
		maxDelaySec: number;
		maxRetries: number;
	} | undefined)) | null;
}, {
	serverUrl?: string | undefined;
	auth?: {
		token: string;
	} | null | undefined;
	streamName?: string | null | undefined;
	ingestUrl?: string | undefined;
	inputCfg?: {
		mediaStream?: unknown;
		mediaStreamCfg?: {
			resolution?: [
				number,
				number
			] | undefined;
			maxFramerate?: number | undefined;
			audioVideoOnly?: "audio" | "video" | undefined;
			audioConstraints?: {
				autoGainControl?: any;
				echoCancellation?: any;
				noiseSuppression?: any;
				channelCount?: any;
			} | undefined;
			audioDeviceId?: string | undefined;
			videoDeviceId?: string | undefined;
		} | null | undefined;
		muted?: {
			audio?: boolean | undefined;
			video?: boolean | undefined;
		} | undefined;
		broadcastCfg?: {
			transcodeAudioBitrateBps?: number | undefined;
			maxVideoBitrateBps?: number | undefined;
			maxAudioBitrateBps?: number | undefined;
			maxEncodingFramerate?: number | undefined;
		} | null | undefined;
	} | null | undefined;
	previewVideoElId?: string | null | undefined;
	metrics?: {
		accountId: string;
		accountKey: string;
	} | null | undefined;
	reconnect?: unknown;
}>, {
	auth: {
		token: string;
	} | null;
	serverUrl: string;
	streamName: string | null;
	ingestUrl: string;
	inputCfg: {
		mediaStream: MediaStream | null;
		mediaStreamCfg: {
			resolution?: [
				number,
				number
			] | undefined;
			maxFramerate?: number | undefined;
			audioVideoOnly?: "audio" | "video" | undefined;
			audioConstraints?: {
				autoGainControl?: any;
				echoCancellation?: any;
				noiseSuppression?: any;
				channelCount?: any;
			} | undefined;
			audioDeviceId?: string | undefined;
			videoDeviceId?: string | undefined;
		} | null;
		broadcastCfg: {
			transcodeAudioBitrateBps?: number | undefined;
			maxVideoBitrateBps?: number | undefined;
			maxAudioBitrateBps?: number | undefined;
			maxEncodingFramerate?: number | undefined;
		} | null;
		muted?: {
			audio?: boolean | undefined;
			video?: boolean | undefined;
		} | undefined;
	};
	previewVideoElId: string | null;
	metrics: {
		accountId: string;
		accountKey: string;
	};
	reconnect: (({
		minDelaySec: number;
		maxDelaySec: number;
		maxRetries: number;
	} | {
		minDelaySec: number;
		maxDelaySec: number;
		maxRetries: number;
	}) & ({
		minDelaySec: number;
		maxDelaySec: number;
		maxRetries: number;
	} | {
		minDelaySec: number;
		maxDelaySec: number;
		maxRetries: number;
	} | undefined)) | null;
}, {
	serverUrl?: string | undefined;
	auth?: {
		token: string;
	} | null | undefined;
	streamName?: string | null | undefined;
	ingestUrl?: string | undefined;
	inputCfg?: {
		mediaStream?: unknown;
		mediaStreamCfg?: {
			resolution?: [
				number,
				number
			] | undefined;
			maxFramerate?: number | undefined;
			audioVideoOnly?: "audio" | "video" | undefined;
			audioConstraints?: {
				autoGainControl?: any;
				echoCancellation?: any;
				noiseSuppression?: any;
				channelCount?: any;
			} | undefined;
			audioDeviceId?: string | undefined;
			videoDeviceId?: string | undefined;
		} | null | undefined;
		muted?: {
			audio?: boolean | undefined;
			video?: boolean | undefined;
		} | undefined;
		broadcastCfg?: {
			transcodeAudioBitrateBps?: number | undefined;
			maxVideoBitrateBps?: number | undefined;
			maxAudioBitrateBps?: number | undefined;
			maxEncodingFramerate?: number | undefined;
		} | null | undefined;
	} | null | undefined;
	previewVideoElId?: string | null | undefined;
	metrics?: {
		accountId: string;
		accountKey: string;
	} | null | undefined;
	reconnect?: unknown;
}>;
declare abstract class WebcasterError extends Error {
	private readonly _code;
	private readonly _metadata?;
	get code(): number;
	constructor(message: string, _code: number, _metadata?: unknown);
	toString(): string;
}
export type UserAgentInfo = {
	document: {
		origin?: string;
		pathName?: string;
		referrer?: string;
		search?: string;
	};
	browser: {
		name?: string;
		version?: string;
		engine?: string;
		engineVersion?: string;
	};
	os: {
		name?: string;
		version?: string;
	};
	cpu: {
		architecture?: string;
	};
	device: {
		model?: string;
		type?: string;
		vendor?: string;
	};
};
export type ServerInfo = {
	url: string;
	host: string;
	resourceId: string;
};
export type StreamInfo = {
	name: string;
	url: string;
};
export type MediaStreamInfo = {
	audioTrack?: {
		muted: boolean;
	};
	videoTrack?: {
		muted: boolean;
	};
};
export type StatusInfo = {
	iceConnectionState: string;
	iceGatheringState: string;
	peerConnectionState: string;
	startUpTime: number;
	totalTime: number;
	reconnects: number;
};
export type MetricsFunnelResultData = {
	clientVersion: string;
	webcasterId: number;
	message?: string;
	errorMessage?: string;
	errorCode?: number;
	stream: StreamInfo;
	server: ServerInfo;
	userAgent: Nullable<UserAgentInfo>;
	broadcastStatus: StatusInfo;
	mediaStream?: MediaStreamInfo;
	rtcstats: {
		video: {
			bitrate: RtcStatsCollectorResultEntry;
			codec: RtcStatsCollectorResultEntry;
			framerate: RtcStatsCollectorResultEntry;
			height: RtcStatsCollectorResultEntry;
			width: RtcStatsCollectorResultEntry;
			jitter: RtcStatsCollectorResultEntry;
			rtt: RtcStatsCollectorResultEntry;
			sendDelay: RtcStatsCollectorResultEntry;
		};
		audio: {
			bitrate: RtcStatsCollectorResultEntry;
			codec: RtcStatsCollectorResultEntry;
			jitter: RtcStatsCollectorResultEntry;
			rtt: RtcStatsCollectorResultEntry;
		};
		connection: {
			rtt: RtcStatsCollectorResultEntry;
			packetLoss: RtcStatsCollectorResultEntry;
		};
	};
};
export interface RtcStatsCollectorResultEntry {
	value: number | string | undefined;
	min?: number;
	max?: number;
	avg?: number;
}
export interface MediaStreamSettings {
	audio: Nullable<MediaTrackSettings>;
	video: Nullable<MediaTrackSettings>;
}
export interface UpstreamConnectionStatus {
	readonly iceState: Nullable<RTCIceConnectionState>;
	readonly gatheringState: Nullable<RTCIceGatheringState>;
	readonly connectionState: Nullable<RTCPeerConnectionState>;
	readonly localDescription: Nullable<RTCSessionDescription>;
	readonly remoteDescription: Nullable<RTCSessionDescription>;
}
export type IsMutedStatus = NonNullable<Required<ResultMutedConfig>>;
export type MetadataHandlerName = "onMetaData" | "onCuePoint";
declare enum ReconnectionState {
	/** Initial state, nothing is happening.  */
	Idle = "idle",
	/** Connection failed, trying to reconnect. */
	Reconnecting = "reconnecting",
	/** Retry limit reached, stopped.  */
	Failed = "failed"
}
export declare class Webcaster implements Disposable {
	private _upstreamConnection;
	private _whipClient;
	private _metricsFunnel;
	private _config;
	private _previewVidElList;
	private _reconnectionState;
	private _reconnects;
	private _webcasterId;
	private _visibilityChangeHandler;
	private _beforeUnloadHandler;
	/**
	 * @param {Config} config imutable. partially optional fields.
	 */
	constructor(config: Config);
	/**
	 * override this at runtime with user-app listener
	 */
	onReconnectionStateChange(newState: ReconnectionState): void;
	/**
	 * override this at runtime with user-app listener
	 */
	onConnectionStateChange(newState: RTCPeerConnectionState): void;
	/**
	 * override this at runtime with user-app listener
	 */
	onStateChange(): void;
	/**
	 * override this at runtime with user-app listener
	 */
	onError(error: WebcasterError): void;
	/**
	 * override this at runtime with user-app listener
	 */
	onMetrics(metrics: MetricsFunnelResultData): void;
	/**
	 * Creates media stream if it's not passed.
	 * Must be called before any further usage of the API.
	 * @returns mutable clone of internal defaults-applied required config
	 */
	setup(): Promise<ResultConfig>;
	/**
	 * Attach media stream to HTMLVideoElement.
	 * Can only be called after setup.
	 * @param videoElId Optional. If not passed - tries to use Config.previewVideoElId
	 */
	startPreview(videoElId?: string): void;
	/**
	 * Initiate the starting of broadcast.
	 * Actual offer-answer exchange happens here.
	 * Can only be called after setup.
	 */
	startBroadcast(): Promise<void>;
	/**
	 * Stop broadcasting by closing the peerConnection.
	 * It keeps the posibility to start new broadcasts with existing media stream.
	 * Can only be called after setup.
	 */
	stopBroadcast(): Promise<void>;
	getConfiguredConstraints(): Nullable<MediaStreamConstraints>;
	/**
	 * Return applied settings to the MediaStream.
	 * Uses functionality of MediaStreamTrack.getSettings() on both audio and video tracks.
	 * Can only be called after setup.
	 * @returns applied settings for audio and video tracks
	 */
	getMediaStreamSettings(): MediaStreamSettings;
	/**
	 * Can be called any time.
	 */
	getUpstreamStatus(): UpstreamConnectionStatus;
	/**
	 * May be called before setup.
	 * If not called before, configured value will be applied to MediaStream on setup.
	 */
	setMuted(isMuted: MutedConfig): void;
	isMuted(): IsMutedStatus;
	/**
	 * Full stop - resets everything to the pre-setup phase and stops broadcasting if it's enabled.
	 * In order to use the Webcaster instance again - calling setup is required.
	 * Can only be called after setup.
	 */
	dispose(withMediaStream?: boolean): Promise<void>;
	/**
	 * Try to reconnect if it's configured. It's triggered when connection fails
	 * @returns Indicates successful reconnection.
	 */
	_startReconnecting(): Promise<boolean>;
	/**
	* Attempts a single reconnect operation.
	*/
	_reconnect(delay: number): Promise<boolean>;
	/**
	 * @param disposeMediaStream default is false, when set true will effectively stop all tracks on the current active MediaStream (if any, will not have effect before `setup` called). If that media-stream was user-provided, this will make the recovery fail therefore (attempting to reuse the thus stopped media-stream for a new broadcast session). Otherwise, a new media-stream is created, eventually based on configured constraint params.
	 */
	recover(disposeMediaStream?: boolean): Promise<void>;
	/**
	 * Adds live meta data to a broadcast stream.
	 * @param handlerName Name of the meta data handler. Other types are not supported.
	 * @param metadata  The data to be sent. The parameter can contain a maximum object depth of 6.
	 */
	sendMetadata(handlerName: MetadataHandlerName, metadata: Record<string, unknown>): Promise<void>;
	private _init;
	private _removeWindowEventHandlers;
	/**
	 * Starts reconnecting or stops the broadcast gracefully if the conneciton went to failed.
	 */
	private _handleConnectionFailed;
	private _handleOnBeforeUnload;
	private _handleVisibilityChange;
	private _addPreviewVideoEl;
	private _emitOnStateChange;
	private _emitOnError;
	private _emitOnMetrics;
	private _emitOnConnectionStateChange;
	private _emitOnReconnectionStateChange;
	/**
	 *
	 * @param msg Message to append to error
	 * @param errorIn Error to handle
	 * @param metricsMessage Optional, if passed then error would be put to metrics with the message
	 */
	private _handleError;
	private _assertHaveMediaStream;
	private _assertHaveRemoteDescription;
}
export declare class StreamUtils {
	static createStream(constraints?: MediaStreamConstraints): Promise<MediaStream>;
	static disposeStream(stream: MediaStream): void;
	static hasAudio(stream: MediaStream): boolean;
	static hasVideo(stream: MediaStream): boolean;
	static getAudioTrackSettings(stream: MediaStream): Nullable<MediaTrackSettings>;
	static getVideoTrackSettings(stream: MediaStream): Nullable<MediaTrackSettings>;
	static getSyntheticMediaStreamConstraints(stream: MediaStream): MediaStreamConstraints;
	/**
	 * Sets the enable property on audio tracks to {isEnabled} value.
	 * @param stream
	 * @param isEnabled
	 */
	static setAudioTracksTo(stream: MediaStream, isEnabled: boolean): void;
	/**
	 * Sets the enable property on video tracks to {isEnabled} value.
	 * @param stream
	 * @param enabled
	 */
	static setVideoTracksTo(stream: MediaStream, enabled: boolean): void;
	/**
	 *
	 * Checks if any audio track in a MediaStream is enabled.
	 */
	static audioEnabled(stream: MediaStream): Nullable<boolean>;
	/**
	 * Checks if any video track in a MediaStream is enabled.
	 */
	static videoEnabled(stream: MediaStream): Nullable<boolean>;
}
export interface MediaDevicePermissionQuery extends PermissionDescriptor {
	deviceId: string;
	label: string;
}
export interface MediaDevicePermissionResult extends MediaDevicePermissionQuery {
	status: PermissionState;
}
export type MediaDevicesFunc = "getSupportedConstraints" | "enumerateDevices" | "getUserMedia";
export declare class DeviceUtils {
	static isSupported(method: MediaDevicesFunc): boolean;
	static assertSupported(method: MediaDevicesFunc): void;
	static getSupportedConstraints(): MediaTrackSupportedConstraints;
	/**
	 * Uses global Permissions API. @see https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API
	 * Get device permissions (checking only audioinput & videoinput kinds)
	 * on Chromium browsers for Desktop & Android.
	 * Use getUserMedia on Firefox and iOS.
	 * @param devices Devices where to check permissions can be obtained for camera & microphone.
	 */
	static getDevicePermissions(devices: MediaDeviceInfo[], onRejection?: ErrorCb): Promise<MediaDevicePermissionResult[]>;
	static getAvailableMediaDevices(): Promise<MediaDeviceInfo[]>;
	/**
	 * @param devices Array of device descriptors
	 * @param deviceKinds Filter for specific kinds of devices
	 * @param groupId Filter by group. A groupId specifies devices belonging together, eg. camera and microphone of a single webcam
	 * @param deviceId Filter by deviceId. Each device, cameras and microphones, has its unique id.
	 * @returns List of media device descriptors resulting
	 */
	static filterDevices(devices: MediaDeviceInfo[], deviceKinds?: MediaDeviceKind[], groupId?: string, deviceId?: string): MediaDeviceInfo[];
}
export declare class HelperUtils {
	static noop: () => undefined;
	static isBoolean(val: unknown): val is boolean;
	static isUndefined(val: unknown): val is undefined;
	static isDefined(val: unknown): boolean;
	static isNumber(val: unknown): boolean;
	static isObject(val: unknown): val is object;
	static isString(val: unknown): val is string;
	static orNull<T>(val?: T): T | null;
	static orZero(val: any): number;
	static orInfinity(val: any, negative?: boolean): number;
	/**
	* @returns 0 only for values strict equal 0, and 1 for everything else (also non-number values).
	**/
	static oneBitQuantize(val: unknown): 0 | 1;
	/**
	* Number.toFixed returns a string, using this func avoids parsing back to number.
	**/
	static roundToPrecision(num: number, digits?: number): number;
	/**
	* @returns Bps (bits per second)
	*/
	static kbps(rateKbps: number): number;
	/**
	* @returns Bps (bits per second)
	*/
	static mbps(rateMbps: number): number;
	static cloneSerializable<T>(obj: T): T;
	static isEmpty(obj: object): boolean;
	static prettyPrintJson(obj: unknown): string;
	static msToSecs(millis: number): number;
	static minBy<T>(array: T[], iteratee: (o: T) => number): T | undefined;
	static maxBy<T>(array: T[], iteratee: (o: T) => number): T | undefined;
	static meanBy<T>(array: T[], iteratee: (o: T) => number): number;
	static wait: (ms: number) => Promise<unknown>;
	/**
	 * Assign value from source, if property is defined in init at same key,
	 * *and* when the types correspond. Otherwise init data prop stays untouched.
	 * It isnt possible to set any prop undefined that is defined by init obj.
	 * Recurses on nested objects. These only get recursed/overriden when the source also has them obviously.
	 * Optionally: Overrides top-level init null-values with any object from source. Otherwise null-refs count as undefined.
	 * Using that option will remove type-safety as being leveraged, since the override value may or may not comply
	 * to what was specified by the initTyped object/interface declaration.
	 */
	static assignInitTypedProps<O extends object>(initTyped: O, sourceData: any, overrideNullRefs?: boolean): void;
	/**
	 * Filter any input by mask object (recurses), results in mask return type.
	 * Input & Mask do not get mutated (output is clone of mask).
	 */
	static filterObjectByMask<T extends object>(input: object, mask: T, overrideNullRefs?: boolean): T;
	static removeLastPathPart(inUrl: string): string;
	static removeTrailingSlash(inUrl: string): string;
	/**
	 * Calculates the base of an exponential function given a range and number of steps.
	 * @param sideA Beginning of the range
	 * @param sideB End of the range
	 * @param steps Number of steps to
	 * @returns Base of the exponential function
	 */
	static exponentialBaseOnRange(sideA: number, sideB: number, steps: number): number;
	/**
	 *
	 * @param min Lower bound (inclusively)
	 * @param max Upper bound (exclusively)
	 * @returns A random integer number between min and max
	 */
	static getRandInt(min: number, max: number): number;
}
export declare const VERSION: string;
export declare const SHA: string;

export {};
