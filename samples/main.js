const {Webcaster, HelperUtils, DeviceUtils, overrideOnLogCallback} = window.WebcasterApiV6;

const AUDIO_RATE_KBPS = 128;
const VIDEO_RATE_KBPS = 2000;

const TCODE_AUDIO_RATE_KBPS = 64;

const MAX_LOG_LINES = 10;

let videoDeviceIndex = 0;
let audioDeviceIndex = 0;

// Config for the NanoWebcaster library.
// Bitrates have to be set in bits per second (bps),
// eg. `2000000` (2 Mbps) for maxVideoBitrateBps and `128000` (128 kbs) for maxAudioBitrateBps.
// In below example we use HelperUtils to convert from kbs to bps.
let initConfig = {
    inputCfg: {
        mediaStream: null,
        upstreamCfg: {
            audioDeviceId: '',
            videoDeviceId: '',
            maxAudioBitrateBps: HelperUtils.kbps(AUDIO_RATE_KBPS),
            maxVideoBitrateBps: HelperUtils.kbps(VIDEO_RATE_KBPS),
            maxFramerate: 30,
            resolution: [1280, 720],
            audioVideoOnly: false,
            audioConstraints: {
                autoGainControl: true,
                channelsCount: 1,
                echoCancellation: true,
                noiseSuppression: true
            },
            transcodeAudioBitrateBps: HelperUtils.kbps(TCODE_AUDIO_RATE_KBPS),
        },
    },
    ingestUrl: 'rtmp://bintu-stream.nanocosmos.de:1935/live',
    serverUrl: 'https://bintu-webrtc.nanocosmos.de/p/webrtc',
    previewVideoElId: 'preview',
};

applyUrlParams(initConfig);

let createNew;
let startPreview;
let startBroadcast;
let stopBroadcast;
let dispose;
let recover;
let setMuted;


document.addEventListener('DOMContentLoaded', async () => {

    const configInEl = document.querySelector('#config');
    const settingsOutEl = document.querySelector('#settings-out');
    const statusOutEl = document.querySelector('#status-out');
    const metricsOutEl = document.querySelector('#metrics-out');
    const errorlogsOutEl = document.querySelector('#error-logs-out');
    const playerContainerEl = document.getElementById('player-container');

    mountPlayerIframe(playerContainerEl, initConfig.streamName);

    errorlogsOutEl.data = [];

    try {
        // We call getUserMedia here in order to request device permissions once,
        // so device labels can be properly rendered in dropdown lists.
        await navigator.mediaDevices?.getUserMedia({audio: true, video: true});
    } catch (err) {
        console.error(`Error caling getUserMedia: ${err.message}`);
    }

    DeviceUtils.getAvailableMediaDevices().then(devices => {
        const videoDevices = DeviceUtils.filterDevices(devices, ['videoinput']);
        const audioDevices = DeviceUtils.filterDevices(devices, ['audioinput']);

        console.debug('Available devices:', devices);

        const videoDevicesSelect = createDevicesDropdown(videoDevices);
        const audioDevicesSelect = createDevicesDropdown(audioDevices);
        const videoDevicesLabel = document.createElement('label');
        videoDevicesLabel.innerText = 'video devices: ';
        const audioDevicesLabel = document.createElement('label');
        audioDevicesLabel.innerText = 'audio devices: ';
        document.querySelector('#devices').appendChild(videoDevicesLabel);
        document.querySelector('#devices').appendChild(videoDevicesSelect);
        document.querySelector('#devices').appendChild(document.createElement('br'));
        document.querySelector('#devices').appendChild(audioDevicesLabel);
        document.querySelector('#devices').appendChild(audioDevicesSelect);

        videoDevicesSelect.selectedIndex = (videoDeviceIndex < videoDevicesSelect.length) ? videoDeviceIndex : 0;
        audioDevicesSelect.selectedIndex = (audioDeviceIndex < audioDevices.length) ? audioDeviceIndex : 0;

        try {
            initConfig.inputCfg.upstreamCfg.videoDeviceId = videoDevicesSelect.value;
            initConfig.inputCfg.upstreamCfg.audioDeviceId = audioDevicesSelect.value;
        } catch (err) {
            console.error(`Error updating config with selected device ids: ${err.message}`);
            return;
        }
        configInEl.value = HelperUtils.prettyPrintJson(initConfig);

        // Handle the onchange event
        [audioDevicesSelect, videoDevicesSelect].forEach((select, arrayIndex) => {
            select.addEventListener('change', function(event) {
                const selectedOption = event.currentTarget;
                const deviceId = selectedOption.value;
                const index = select.selectedIndex;
                console.log('Selected Device ID:', deviceId);
                console.log('Selected Device index:', index);
                try {
                    arrayIndex === 0 ?
                        initConfig.inputCfg.upstreamCfg.audioDeviceId = deviceId
                        : initConfig.inputCfg.upstreamCfg.videoDeviceId = deviceId;
                } catch (err) {
                    console.error(`Error updating config with selected device id: ${err.message}`);
                    return;
                }
                configInEl.value = HelperUtils.prettyPrintJson(initConfig);
            });
        });

    });

    overrideOnLogCallback((...msg) => {
        if (msg[0] !== 'error') {
            return;
        }

        if (errorlogsOutEl.data.length >= MAX_LOG_LINES) {
            errorlogsOutEl.data.shift();
        }

        errorlogsOutEl.data = [
            ...errorlogsOutEl.data,
            HelperUtils.cloneSerializable(msg.slice(1))
        ];
    });

    // Remove streamName and auth from DOM config as they need to be passed as query params
    const { streamName, auth, ...domConfig  } = initConfig;
    configInEl.value = HelperUtils.prettyPrintJson(domConfig);

    configInEl.addEventListener('change', onConfigChange);
    configInEl.addEventListener('keyup', onConfigChange);
    function onConfigChange(event) {
        try {
            const domConfig = JSON.parse(configInEl.value);
            applyUrlParams(domConfig);

            initConfig = domConfig;
        } catch(err) {
            const errMsg = `Error updating config: ${err.message}`;
            console.error(errMsg);
            if (event.type === 'change') {
                alert(errMsg);
            }
            return;
        }
        console.debug('Config updated:', HelperUtils.prettyPrintJson(initConfig));
    }

    let client;

    createNew = () => {
        if (client) {
            throw new Error('Client already exists, call dispose first');
        }

        // Create a Webcaster instance
        client = window.client = new Webcaster(initConfig);

        client.setup().then(() => {
            const settings = client.getMediaStreamSettings();
            console.log('Webcaster.setup done -> getMediaStreamSettings:', settings);
            settingsOutEl.data = settings;
        });

        client.onStateChange = () => {
            statusOutEl.data = client.getUpstreamStatus();
        };

        client.onError = (err) => {
            console.error('Webcaster.onError:', err);
        };

        client.onMetrics = (metrics) => {
            metricsOutEl.data = metrics;
        };
    };

    function assertCreated() {
        if (!client) {
            alert('Create client instance first');
            return false;
        }
        return true;
    }

    startPreview = async () => {
        if (!assertCreated()) return;
        try {
            await client.startPreview();
        } catch (err) {
            console.error('Error starting preview:', err);
        }
    };

    startBroadcast = async () => {
        if (!assertCreated()) return;
        try {
            await client.startBroadcast();
        } catch (err) {
            console.error('Error starting broadcast:', err);
        }
    };

    stopBroadcast = async () => {
        if (!assertCreated()) return;
        try {
            await client.stopBroadcast();
        } catch (err) {
            console.error('Error stopping broadcast:', err);
        }
    };

    dispose = async () => {
        if (!assertCreated()) return;
        try {
            await client.dispose();
        } catch (err) {
            console.error('Error disposing client:', err);
        } finally {
            client = null;
        }
    };

    recover = async () => {
        if (!assertCreated()) return;
        try {
            await client.recover();
        } catch (err) {
            console.error('Error recovering client:', err);
        }
    };

    setMuted = async () => {
        if (!assertCreated()) return;
        try {
            await client.setMuted({
                audio: true,
                video: true
            });
        } catch (err) {
            console.error('Error recovering client:', err);
        }
    };
});

function createDevicesDropdown(devices) {
    // Create a select element
    const selectElement = document.createElement('select');

    devices.forEach(device => {
        const optionElement = document.createElement('option');
        optionElement.value = device.deviceId;
        optionElement.textContent = `${device.label || 'Unknown Device'} - id: ${device.deviceId}` ;
        selectElement.appendChild(optionElement);
    });

    return selectElement;
}

function applyUrlParams(configIn) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const maxAudioBitrateBps = urlParams.get('maxAudioBitrateBps');
    const maxVideoBitrateBps = urlParams.get('maxVideoBitrateBps');
    const maxFramerate = urlParams.get('maxFramerate');
    const audioVideoOnly = urlParams.get('audioVideoOnly');
    const transcodeAudioBitrateBps = urlParams.get('transcodeAudioBitrateBps');
    const ingestUrl = urlParams.get('ingestUrl');
    const token = urlParams.get('token');

    // Mandatory
    const streamName = urlParams.get('streamName');

    if (!streamName) {
        alert('streamName must be passed as a query parameter');
    }

    videoDeviceIndex = urlParams.get('videoDeviceIndex') || videoDeviceIndex;
    audioDeviceIndex = urlParams.get('audioDeviceIndex') || audioDeviceIndex;

    Object.assign(configIn.inputCfg.upstreamCfg, {
        ...(maxAudioBitrateBps && { maxAudioBitrateBps: Number(maxAudioBitrateBps) }),
        ...(maxVideoBitrateBps && { maxVideoBitrateBps: Number(maxVideoBitrateBps) }),
        ...(maxFramerate && { maxFramerate: Number(maxFramerate) }),
        ...(transcodeAudioBitrateBps && { transcodeAudioBitrateBps: Number(transcodeAudioBitrateBps) }),
        ...(audioVideoOnly && { audioVideoOnly })
    });

    configIn.ingestUrl = ingestUrl ?? configIn.ingestUrl;
    configIn.streamName = streamName;
    configIn.auth = { token };

    return configIn;
}

function mountPlayerIframe(playerContainerEl, streamName) {
    const iframe = document.createElement('iframe');
    iframe.id = 'player';
    const srcUrl = `https://demo.nanocosmos.de/nanoplayer/release/nanoplayer.html?bintu.streamname=${streamName}&bintu.apiurl=https://bintu.nanocosmos.de&style.width=543px&style.height=305px`;
    iframe.src = srcUrl;

    playerContainerEl.appendChild(iframe);
}
