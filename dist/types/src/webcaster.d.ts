/**
 * @license
 *
 *  nanoStream Webcaster
 *  (c) 2023, nanocosmos gmbh
 *  https://www.nanocosmos.de/support
 *
 *  LEGAL NOTICE:
 *  This material is subject to the terms and conditions defined in
 *  separate license conditions found at https://www.nanocosmos.de/terms or in a separate agreement.
 *  All information contained herein is, and remains the property of nanocosmos GmbH and its suppliers if any.
 *  The intellectual and technical concepts contained herein are proprietary to nanocosmos GmbH,
 *  and are protected by trade secret or copyright law. Dissemination of this information or reproduction
 *  of this material is strictly forbidden unless prior written permission is obtained from nanocosmos.
 */
import { Config, MutedConfig } from './config';
import { MediaStreamSettings, UpstreamConnectionStatus } from './upstreamConnection';
import { Disposable } from './helpers/utilTypes';
import { MetricsFunnelResultData } from './stats/MetricsFunnel';
export type MetadataHandlerName = 'onMetaData' | 'onCuePoint';
export declare class Webcaster implements Disposable {
    private _upstreamConnection;
    private _whipClient;
    private _metricsFunnel;
    private _config;
    private _previewVidElList;
    /**
     * @param {Config} config imutable. partially optional fields.
     */
    constructor(config: Config);
    /**
     * override this at runtime with user-app listener
     */
    onStateChange(): void;
    /**
     * override this at runtime with user-app listener
     */
    onError(error: Error): void;
    /**
     * override this at runtime with user-app listener
     */
    onMetrics(metrics: MetricsFunnelResultData): void;
    /**
     * Creates media stream if it's not passed.
     * Must be called before any further usage of the API.
     * @returns mutable clone of internal defaults-applied required config
     */
    setup(): Promise<Required<Config>>;
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
    isMuted(): MutedConfig;
    /**
     * Full stop - resets everything to the pre-setup phase and stops broadcasting if it's enabled.
     * In order to use the Webcaster instance again - calling setup is required.
     * Can only be called after setup.
     */
    dispose(withMediaStream?: boolean): Promise<void>;
    /**
     *
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
    private _addPreviewVideoEl;
    private _emitOnStateChange;
    private _emitOnError;
    private _emitOnMetrics;
    private _handleStreamError;
    private _assertHaveMediaStream;
    private _assertHaveRemoteDescription;
}
