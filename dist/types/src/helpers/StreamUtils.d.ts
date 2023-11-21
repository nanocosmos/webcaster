import { Nullable } from './utilTypes';
export declare class StreamUtils {
    static createStream(constraints?: MediaStreamConstraints): Promise<MediaStream>;
    static disposeStream(stream: MediaStream): void;
    static hasAudio(stream: MediaStream): boolean;
    static hasVideo(stream: MediaStream): boolean;
    static getAudioTrackSettings(stream: MediaStream): Nullable<MediaTrackSettings>;
    static getVideoTrackSettings(stream: MediaStream): Nullable<MediaTrackSettings>;
}
