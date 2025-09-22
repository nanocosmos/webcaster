import {
    getServerVersion,
    renderClientVersion,
    reloadPlayerIframe,
    updateConfigWithURLParams,
    renderErrorInStatus,
    clearErrorFromStatus
} from '../helpers/index.js';

const {Webcaster, HelperUtils, DeviceUtils, overrideOnLogCallback, VERSION, SHA} = window.WebcasterApiV6;

const AUDIO_RATE_KBPS = 128;
const VIDEO_RATE_KBPS = 2000;

const TCODE_AUDIO_RATE_KBPS = 64;

const MAX_LOG_LINES = 10;

const TIMEOUT_IFRAME_RELOAD_MS = 3000;

let client;

// Info elements
let instanceStatusEl;
let streamStatusEl;
let reconnectionStatusEl;
let serverVersionEl;
let setupBtn;

document.addEventListener('DOMContentLoaded', async () => {

    const videoTag = document.querySelector('video');

    instanceStatusEl = document.querySelector('#instance-status');
    streamStatusEl = document.querySelector('#stream-status');
    reconnectionStatusEl = document.querySelector('#reconnection-status');
    serverVersionEl = document.getElementById('server-version');
    setupBtn = document.getElementById('setup-button');

    renderClientVersion(VERSION, SHA);

    setupBtn.addEventListener('click', doSetup);

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

});

// Firefox requires transient activation from a user gesture for getDisplayMedia,
// that's why we need to call this function on a button click.
async function doSetup() {
    const errorLogsOutEl = document.getElementById('error-logs-out');
    const setupBtn = document.getElementById('setup-button');

    // We construct a new MediaStream from a MediaStreamTrack for video (screen share)
    // and a MediaStreamTrack for audio (microphone).
    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioTrack = audioStream.getAudioTracks()[0];
    const videoStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const videoTrack = videoStream.getVideoTracks()[0];
    const mediaStream = new MediaStream([audioTrack, videoTrack]);

    setupBtn.disabled = true;

    // Config for the NanoWebcaster library
    // Bitrates have to be set in bits per second (bps),
    // eg. `2000000` (2 Mbps) for maxVideoBitrateBps and `128000` (128 kbs) for maxAudioBitrateBps.
    // In below example we use HelperUtils to convert from kbs to bps.
    let initConfig = {
        inputCfg: {
            mediaStream: mediaStream,
            broadcastCfg: {
                maxAudioBitrateBps: HelperUtils.kbps(AUDIO_RATE_KBPS),
                maxVideoBitrateBps: HelperUtils.kbps(VIDEO_RATE_KBPS),
                maxEncodingFramerate: 30,
                transcodeAudioBitrateBps: HelperUtils.kbps(TCODE_AUDIO_RATE_KBPS),
            },
        },
        reconnect: true,
        previewVideoElId: 'my-preview-video-tag-id',
    };

    console.log('Init config: ', initConfig);

    updateConfigWithURLParams(initConfig);

    client = new Webcaster(initConfig);

    reloadPlayerIframe(initConfig.streamName);

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

        if (newState === 'connected') {
            setTimeout(() => {
                reloadPlayerIframe(initConfig.streamName);
            }, TIMEOUT_IFRAME_RELOAD_MS);
        }
    };

    client.onError = (err) => {
        renderErrorInStatus('Webcaster.onError: ' + err);
    };
}
