import {
    getServerVersion,
    reloadPlayerIframe,
    renderErrorInStatus,
    clearErrorFromStatus,
    populateDeviceDropdowns,
    addErrorToStack,
    clearInfo,
    updateToggleAudioBtn,
    renderMetrics,
    renderUpstreamStatus,
    renderServerVersion,
    renderMediaStreamSettings,
    renderReconnectionState,
    renderInstanceCreatedStatus,
    initializeUIElements,
    initializeUIConfig,
} from './helpers/index.js';

const { Webcaster, HelperUtils, DeviceUtils, overrideOnLogCallback, VERSION, SHA } = window.WebcasterApiV6;

const AUDIO_RATE_KBPS = 128;
const VIDEO_RATE_KBPS = 2000;

const TRANSCO_AUDIO_RATE_KBPS = 64;

const TIMEOUT_IFRAME_RELOAD_MS = 1000;

// Config for the NanoWebcaster library.
// Bitrates have to be set in bits per second (bps),
// eg. `2000000` (2 Mbps) for maxVideoBitrateBps and `128000` (128 kbs) for maxAudioBitrateBps.
// In below example we use HelperUtils to convert from kbs to bps.
let initConfig = {
    inputCfg: {
        mediaStreamCfg: {
            audioDeviceId: '',
            videoDeviceId: '',
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
            transcodeAudioBitrateBps: HelperUtils.kbps(TRANSCO_AUDIO_RATE_KBPS),
            maxAudioBitrateBps: HelperUtils.kbps(AUDIO_RATE_KBPS),
            maxVideoBitrateBps: HelperUtils.kbps(VIDEO_RATE_KBPS),
            maxEncodingFramerate: 30,
        }
    },
    previewVideoElId: 'preview',
    reconnect: true
};


let createNew;
let startPreview;
let startBroadcast;
let stopBroadcast;
let dispose;
let recover;
let toggleAudio;

// Main entry point
document.addEventListener('DOMContentLoaded', async () => {
    const { createNewEl,
        startPreviewEl,
        startBroadcastEl,
        stopBroadcastEl,
        disposeEl,
        recoverEl,
        toggleAudioEl }
         = initializeUIElements(initConfig, VERSION, SHA);

    try {
        await initializeDeviceDropdowns();
    } catch (err) {
        renderErrorInStatus(`Error initializing device dropdowns: ${err.message}`);
    }

    overrideOnLogCallback((...msg) => {
        if (msg[0] !== 'error') {
            return;
        }

        // log only errors to dom
        addErrorToStack(msg);
    });

    initializeUIConfig(initConfig);


    let client;

    createNew = () => {
        if (client) {
            renderErrorInStatus('Error: Client already exists, call dispose first');
            return;
        }

        clearErrorFromStatus();

        // Create a Webcaster instance
        console.log('Init config: ', initConfig);

        try {
            client = window.client = new Webcaster(initConfig);

            // DOM
            clearErrorFromStatus();
        } catch (error) {
            renderErrorInStatus('Failed to create new instance, look into \'Error logs\' section...');
            console.error(`${error}`); // Formats differently if passed without explicit conversion to string
            return;
        }


        client.setup().then((config) => {
            const settings = client.getMediaStreamSettings();

            console.log('Resulting config: ', config);
            console.log('Webcaster.setup done -> getMediaStreamSettings:', settings);

            // DOM
            renderMediaStreamSettings(settings);
            getServerVersion(config.serverUrl).then(renderServerVersion);
            renderInstanceCreatedStatus();
            updateToggleAudioBtn(client.isMuted());
        });


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

        client.onStateChange = () => {
            const upstreamStatus = client.getUpstreamStatus();

            renderUpstreamStatus(upstreamStatus);
        };

        client.onReconnectionStateChange = (newState) => {
            renderReconnectionState(newState);
        };

        client.onError = (err) => {
            renderErrorInStatus('Webcaster.onError: ' + err);
        };

        client.onMetrics = (metrics) => {
            renderMetrics(metrics);
        };
    };

    function assertCreated() {
        if (!client) {
            renderErrorInStatus('Error: Create client instance first');

            return false;
        }
        return true;
    }

    startPreview = async () => {
        if (!assertCreated()) return;
        try {
            await client.startPreview();

            // DOM
            clearErrorFromStatus();
        } catch (err) {
            renderErrorInStatus('Error starting preview: ' + err);
        }
    };

    startBroadcast = async () => {
        if (!assertCreated()) return;
        try {
            await client.startBroadcast();

            // DOM
            clearErrorFromStatus();
        } catch (err) {
            renderErrorInStatus('Error starting broadcast: ' + err);
        }
    };

    stopBroadcast = async () => {
        if (!assertCreated()) return;
        try {
            await client.stopBroadcast();

            // DOM
            clearErrorFromStatus();
        } catch (err) {
            renderErrorInStatus('Error stopping broadcast: ' + err); // Q: Such messages to be clean as it is duplicated in error emit
        }
    };

    dispose = async () => {
        if (!assertCreated()) return;
        try {
            await client.dispose(true);

            // DOM
            clearErrorFromStatus();
        } catch (err) {
            renderErrorInStatus('Error disposing client: ' + err);
        } finally {
            client = null;
            clearInfo();
        }
    };

    recover = async () => {
        if (!assertCreated()) return;
        try {
            await client.recover();

            // DOM
            clearErrorFromStatus();
        } catch (err) {
            renderErrorInStatus('Error recovering client: ' + err);
        }
    };

    toggleAudio = async () => {
        if (!assertCreated()) return;
        try {
            const isMutedState = client.isMuted();
            const newState = {
                audio: !isMutedState.audio,
                video: isMutedState.video
            };
            await client.setMuted(newState);

            // DOM
            updateToggleAudioBtn(client.isMuted());
            clearErrorFromStatus();
        } catch (err) {
            renderErrorInStatus('Error recovering client: ' + err);
        }
    };

    createNewEl.addEventListener('click', createNew);
    startPreviewEl.addEventListener('click', startPreview);
    startBroadcastEl.addEventListener('click', startBroadcast);
    stopBroadcastEl.addEventListener('click', stopBroadcast);
    disposeEl.addEventListener('click', dispose);
    recoverEl.addEventListener('click', recover);
    toggleAudioEl.addEventListener('click', toggleAudio);
});


async function initializeDeviceDropdowns() {
    let devices;
    try {
        devices = await DeviceUtils.getAvailableMediaDevices();
    } catch (err) {
        throw new Error(`Failed to request available devices: ${err.message}`);
    }

    const videoDevices = DeviceUtils.filterDevices(devices, ['videoinput']);
    const audioDevices = DeviceUtils.filterDevices(devices, ['audioinput']);

    populateDeviceDropdowns({ videoDevices, audioDevices }, initConfig);
}
