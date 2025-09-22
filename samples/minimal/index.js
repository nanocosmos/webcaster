
import {
    getServerVersion,
    renderClientVersion,
    updateConfigWithURLParams,
    renderErrorInStatus,
    clearErrorFromStatus
} from '../helpers/index.js';

const {Webcaster, HelperUtils, DeviceUtils, overrideOnLogCallback, VERSION, SHA} = window.WebcasterApiV6;

const AUDIO_RATE_KBPS = 128;
const VIDEO_RATE_KBPS = 2000;

const TCODE_AUDIO_RATE_KBPS = 64;

const MAX_LOG_LINES = 10;

// Config for the NanoWebcaster library
// Bitrates have to be set in bits per second (bps),
// eg. `2000000` (2 Mbps) for maxVideoBitrateBps and `128000` (128 kbs) for maxAudioBitrateBps.
// In below example we use HelperUtils to convert from kbs to bps.
let initConfig = {
    inputCfg: {
        mediaStreamCfg: {
            maxFramerate: 30,
            resolution: [1280, 720],
            audioConstraints: {
                autoGainControl: true,
                channelCount: 2,
                echoCancellation: true,
                noiseSuppression: true
            },
        },
        broadcastCfg: {
            transcodeAudioBitrateBps: HelperUtils.kbps(TCODE_AUDIO_RATE_KBPS),
            maxAudioBitrateBps: HelperUtils.kbps(AUDIO_RATE_KBPS),
            maxVideoBitrateBps: HelperUtils.kbps(VIDEO_RATE_KBPS),
            maxEncodingFramerate: 30,
        }
    },
    reconnect: true,
    previewVideoElId: 'my-preview-video-tag-id',
};

// Info elements
let instanceStatusEl;
let streamStatusEl;
let reconnectionStatusEl;
let serverVersionEl;

renderClientVersion(VERSION, SHA);
updateConfigWithURLParams(initConfig);

console.log('Init config: ', initConfig);
const client = new Webcaster(initConfig);

document.addEventListener('DOMContentLoaded', async () => {
    const errorLogsOutEl = document.getElementById('error-logs-out');

    instanceStatusEl = document.querySelector('#instance-status');
    streamStatusEl = document.querySelector('#stream-status');
    reconnectionStatusEl = document.querySelector('#reconnection-status');
    serverVersionEl = document.getElementById('server-version');

    overrideOnLogCallback((...msg) => {
        if (msg[0] !== 'error') {
            return;
        }

        if (errorLogsOutEl.children.length >= MAX_LOG_LINES) {
            errorLogsOutEl.removeChild(errorLogsOutEl.firstChild);
        }

        const logElement = document.createElement('p');
        logElement.textContent = msg.join(' - ');

        errorLogsOutEl.appendChild(logElement);
    });

    client.setup().then(async (fullConfig) => {
        const settings = client.getMediaStreamSettings();
        console.log('Webcaster.setup done.',
            'Full applied config:', fullConfig,
            '-> getMediaStreamSettings:', settings);

        client.startPreview();

        var videoTag = document.querySelector('video');

        videoTag.addEventListener('play', async () => {
            console.log('Broadcast has started.');
            await client.startBroadcast();
            clearErrorFromStatus();
        });

        videoTag.addEventListener('pause', async () => {
            console.log('Broadcast has stopped.');
            await client.stopBroadcast();
            clearErrorFromStatus();
        });

        instanceStatusEl.innerHTML = 'created';

        const serverVersion = await getServerVersion(fullConfig.serverUrl);
        serverVersionEl.innerText = `server version: ${serverVersion}`;
    });

    client.onStateChange = () => {
        const upstreamStatus = client.getUpstreamStatus();
        console.log('Webcaster.onStateChange:', upstreamStatus);

        streamStatusEl.innerHTML = upstreamStatus.connectionState || 'none';
    };

    client.onReconnectionStateChange = (newState) => {
        reconnectionStatusEl.innerHTML = newState;
    };

    client.onConnectionStateChange = (newState) => {
        if (newState === 'connecting') {
            clearErrorFromStatus();
        }
    };

    client.onError = (err) => {
        renderErrorInStatus('Webcaster.onError: ' + err);
    };
});
