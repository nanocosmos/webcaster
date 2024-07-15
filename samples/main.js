const { Webcaster, HelperUtils, DeviceUtils, overrideOnLogCallback, SHA, VERSION } = window.WebcasterApiV6;

const AUDIO_RATE_KBPS = 128;
const VIDEO_RATE_KBPS = 2000;

const TRANSCO_AUDIO_RATE_KBPS = 64;

const MAX_LOG_LINES = 10;

const TIMEOUT_IFRAME_RELOAD_MS = 1000;

let videoDeviceIndex = 0;
let audioDeviceIndex = 0;
let iframeReloadTimeoutId;

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
                channelCount: 1,
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

// Info elements
let instanceStatusEl;
let streamStatusEl;
let reconnectionStatusEl;
let errorStatusEl;

document.addEventListener('DOMContentLoaded', async () => {

    const configInEl = document.querySelector('#config');
    applyUrlParams(initConfig);
    const settingsOutEl = document.querySelector('#settings-out');
    const statusOutEl = document.querySelector('#status-out');
    const metricsOutEl = document.querySelector('#metrics-out');
    const errorlogsOutEl = document.querySelector('#error-logs-out');
    const playerContainerEl = document.getElementById('player-container');

    instanceStatusEl = document.querySelector('#instance-status');
    streamStatusEl = document.querySelector('#stream-status');
    reconnectionStatusEl = document.querySelector('#reconnection-status');
    errorStatusEl = document.querySelector('#error-status');

    renderClientVersion();
    reMountPlayerIframe(playerContainerEl, initConfig.streamName);

    errorlogsOutEl.data = [];

    try {
        // We call getUserMedia here in order to request device permissions once,
        // so device labels can be properly rendered in dropdown lists.
        // Requesting a high resolution here fixes a Chrome related issue,
        // where Chrome returns too low resolutions in subsequent calls to getUserMedia.
        let tempStream = await navigator.mediaDevices?.getUserMedia({
            audio: true,
            video: {
                width: 4096,
                height: 2160,
            }
        });
        tempStream.getTracks().forEach(track => track.stop());
    } catch (err) {
        showError(`Error caling getUserMedia: ${err.message}`);
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
            initConfig.inputCfg.mediaStreamCfg.videoDeviceId = videoDevicesSelect.value;
            initConfig.inputCfg.mediaStreamCfg.audioDeviceId = audioDevicesSelect.value;
        } catch (err) {
            showError(`Error updating config with selected device ids: ${err.message}`);
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
                        initConfig.inputCfg.mediaStreamCfg.audioDeviceId = deviceId
                        : initConfig.inputCfg.mediaStreamCfg.videoDeviceId = deviceId;
                } catch (err) {
                    showError(`Error updating config with selected device id: ${err.message}`);
                    return;
                }
                configInEl.value = HelperUtils.prettyPrintJson(initConfig);
            });
        });

    });

    overrideOnLogCallback((...msg) => {
        // this should be part of configuration
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
    configInEl.addEventListener('paste', onConfigChange);
    function onConfigChange(event) {
        try {
            const domConfig = JSON.parse(configInEl.value);
            writeConfigToUrl(domConfig);
            applyUrlParams(domConfig);

            initConfig = domConfig;
            clearError();
        } catch(err) {
            const errMsg = `Error updating config: ${err.message}`;
            showError(errMsg);
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
            showError('Error: Client already exists, call dispose first');
            return;
        }

        clearError();

        // Create a Webcaster instance
        console.log('Init config: ', initConfig);

        try {
            client = window.client = new Webcaster(initConfig);
            clearError();
        } catch (error) {
            showError('Failed to create new instance, look into \'Error logs\' section...');
            console.error(`${error}`); // Formats differently if passed without explicit conversion to string
            return;
        }


        client.setup().then((config) => {
            const settings = client.getMediaStreamSettings();
            console.log('Resulting config: ', config);
            console.log('Webcaster.setup done -> getMediaStreamSettings:', settings);
            settingsOutEl.data = settings;

            renderServerVersion(config.serverUrl);

            instanceStatusEl.innerHTML = 'created';
            updateToggleAudioBtn(client);
        });


        client.onConnectionStateChange = (newState) => {
            if (newState === 'connecting') {
                clearError();
            }

            if (newState === 'connected') {
                setTimeout(() => {
                    reMountPlayerIframe(playerContainerEl, initConfig.streamName);
                }, TIMEOUT_IFRAME_RELOAD_MS);
            }
        };

        client.onStateChange = () => {
            const upstreamStatus = client.getUpstreamStatus();

            statusOutEl.data = upstreamStatus;
            streamStatusEl.innerHTML = upstreamStatus.connectionState || 'none';
        };

        client.onReconnectionStateChange = (newState) => {
            reconnectionStatusEl.innerHTML = newState;
        };

        client.onError = (err) => {
            showError('Webcaster.onError: ' + err);
        };

        client.onMetrics = (metrics) => {
            metricsOutEl.data = metrics;
        };
    };

    function assertCreated() {
        if (!client) {
            showError('Error: Create client instance first');
            return false;
        }
        return true;
    }

    startPreview = async () => {
        if (!assertCreated()) return;
        try {
            await client.startPreview();
            clearError();
        } catch (err) {
            showError('Error starting preview: ' + err);
        }
    };

    startBroadcast = async () => {
        if (!assertCreated()) return;
        try {
            await client.startBroadcast();
            clearError();
        } catch (err) {
            showError('Error starting broadcast: ' + err);
        }
    };

    stopBroadcast = async () => {
        if (!assertCreated()) return;
        try {
            await client.stopBroadcast();
            iframeReloadTimeoutId = null;
            clearError();
        } catch (err) {
            showError('Error stopping broadcast: ' + err); // Q: Such messages to be clean as it is duplicated in error emit
        }
    };

    dispose = async () => {
        if (!assertCreated()) return;
        try {
            await client.dispose(true);
            clearError();
        } catch (err) {
            showError('Error disposing client: ' + err);
        } finally {
            client = null;
            iframeReloadTimeoutId = null;
            clearInfo();
        }
    };

    recover = async () => {
        if (!assertCreated()) return;
        try {
            await client.recover();
            clearError();
        } catch (err) {
            showError('Error recovering client: ' + err);
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
            updateToggleAudioBtn(client);
            clearError();
        } catch (err) {
            showError('Error recovering client: ' + err);
        }
    };
});

function showError(errorMsg) {
    console.error(errorMsg);
    errorStatusEl.innerHTML = errorMsg;
}

function clearError() {
    errorStatusEl.innerHTML = '';
}

function clearInfo() {
    instanceStatusEl.innerHTML = 'none';
    streamStatusEl.innerHTML = 'none';
    reconnectionStatusEl.innerHTML = 'none';
}

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

    let configFromUrl = readConfigFromUrl();
    if (configFromUrl) {
        // We can not simply asssign configFromUrl to configIn here,
        // because configIn is passed in by reference.
        for (const prop of Object.getOwnPropertyNames(configIn)) {
            delete configIn[prop];
        }
        Object.assign(configIn, configFromUrl);
    }

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const maxAudioBitrateBps = urlParams.get('maxAudioBitrateBps');
    const maxVideoBitrateBps = urlParams.get('maxVideoBitrateBps');
    const transcodeAudioBitrateBps = urlParams.get('transcodeAudioBitrateBps');
    const maxEncodingFramerate = urlParams.get('maxEncodingFramerate');

    const maxFramerate = urlParams.get('maxFramerate');
    const audioVideoOnly = urlParams.get('audioVideoOnly');
    const ingestUrl = urlParams.get('ingestUrl');
    const serverUrl = urlParams.get('serverUrl');
    const token = urlParams.get('token');

    // Mandatory
    const streamName = urlParams.get('streamName') ?? configIn?.streamName;

    if (!streamName) {
        alert('streamName must be passed as a query parameter');
    }

    videoDeviceIndex = urlParams.get('videoDeviceIndex') || videoDeviceIndex;
    audioDeviceIndex = urlParams.get('audioDeviceIndex') || audioDeviceIndex;

    configIn.inputCfg ??= {};
    configIn.inputCfg.mediaStreamCfg ??= {};
    configIn.inputCfg.broadcastCfg ??= {};


    Object.assign(configIn.inputCfg.mediaStreamCfg, {
        ...(maxFramerate && { maxFramerate: Number(maxFramerate) }),
        ...(audioVideoOnly && { audioVideoOnly })
    });

    Object.assign(configIn.inputCfg.broadcastCfg, {
        ...(maxAudioBitrateBps && { maxAudioBitrateBps: Number(maxAudioBitrateBps) }),
        ...(maxVideoBitrateBps && { maxVideoBitrateBps: Number(maxVideoBitrateBps) }),
        ...(maxEncodingFramerate && { maxEncodingFramerate: Number(maxEncodingFramerate) }),
        ...(transcodeAudioBitrateBps && { transcodeAudioBitrateBps: Number(transcodeAudioBitrateBps) }),
    });

    configIn.serverUrl = serverUrl ?? configIn.serverUrl;
    configIn.ingestUrl = ingestUrl ?? configIn.ingestUrl;
    configIn.streamName = streamName;

    if (token) {
        configIn.auth ??= {};
        configIn.auth.token = token;
    }

    return configIn;
}

function reMountPlayerIframe(playerContainerEl, streamName) {
    if (playerContainerEl.children.length) {
        playerContainerEl.removeChild(playerContainerEl.firstElementChild);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'player';
    iframe.allowFullscreen = true;
    const srcUrl = `https://demo.nanocosmos.de/nanoplayer/release/nanoplayer.html?bintu.streamname=${streamName}&bintu.apiurl=https://bintu.nanocosmos.de&style.width=543px&style.height=305px&playback.latencyControlMode=fastadaptive`;
    iframe.src = srcUrl;

    playerContainerEl.appendChild(iframe);
}

function renderClientVersion() {
    const packageVersionEl = document.getElementById('package-version');
    const commitShaEl = document.getElementById('commit-sha');

    packageVersionEl.innerText = `client version: ${VERSION}`;
    commitShaEl.innerText = `commit SHA: ${SHA}`;
}

async function renderServerVersion(url) {
    const serverInfoOutEl = document.querySelector('#server-info-out');

    let serverResponse = await fetch(url + '/status.json');
    if (!serverResponse.ok) {
        serverInfoOutEl.data = `server version: error fetching version, HTTP status: ${serverResponse.status}`;
        return;
    }
    let responseData = await serverResponse.json();
    serverInfoOutEl.data = {
        serverVersion: responseData.server_version
    };
}

function readConfigFromUrl() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const config = urlParams.get('webcasterconfig');

    if (config) {
        try {
            return JSON.parse(atob(config));
        } catch (err) {
            showError(`could not parse config from url: ${err.message}`);
        }
    }
}

function writeConfigToUrl(config) {
    const url = new URL(location);
    const configClone = HelperUtils.cloneSerializable(config);
    delete configClone?.inputCfg?.mediaStreamCfg?.audioDeviceId;
    delete configClone?.inputCfg?.mediaStreamCfg?.videoDeviceId;
    const configBase64 = btoa(JSON.stringify(configClone));
    url.searchParams.set('webcasterconfig', configBase64);
    if (typeof history.pushState === 'function') {
        history.pushState({}, '', url);
    } else {
        showError('history.pushState() is not supported');
    }
}

function updateToggleAudioBtn(client) {
    const btn = document.getElementById('toggle-audio-btn');
    const isMuted = client.isMuted();
    btn.innerText = isMuted.audio ? 'Unmute audio' : 'Mute audio';
}
