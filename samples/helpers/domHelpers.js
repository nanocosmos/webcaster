import {
    getDeviceIndicesFromURL,
    applyURLParamsTo,
    encodeConfigToURL
} from './index.js';

const MAX_LOG_LINES = 10;

const { HelperUtils } = window.WebcasterApiV6;

let UI;

/**
 * Initializes and returns references to UI elements.
 * @returns {Object} An object containing references to various DOM elements.
 */
export function initializeUIElements(initConfig, version, sha) {
    UI = {
        configInEl: document.querySelector('#config'),
        settingsOutEl: document.querySelector('#settings-out'),
        statusOutEl: document.querySelector('#status-out'),
        metricsOutEl: document.querySelector('#metrics-out'),
        errorlogsOutEl: document.querySelector('#error-logs-out'),
        serverInfoOutEl: document.querySelector('#server-info-out'),
        instanceStatusEl: document.querySelector('#instance-status'),
        streamStatusEl: document.querySelector('#stream-status'),
        reconnectionStatusEl: document.querySelector('#reconnection-status'),
        createNewEl: document.getElementById('create-new-btn'),
        startPreviewEl: document.getElementById('start-preview-btn'),
        startBroadcastEl: document.getElementById('start-broadcast-btn'),
        stopBroadcastEl: document.getElementById('stop-broadcast-btn'),
        disposeEl: document.getElementById('dispose-btn'),
        recoverEl: document.getElementById('recover-btn'),
        toggleAudioEl: document.getElementById('toggle-audio-btn'),
        audioBitrateEl: document.getElementById('audio-bitrate'),
        videoBitrateEl: document.getElementById('video-bitrate'),
        videoFramerateEl: document.getElementById('video-framerate'),
        connectionRTTEl: document.getElementById('connection-rtt'),
        connectionPacketLossEl: document.getElementById('connection-packet-loss'),

    };

    try {
        applyURLParamsTo(initConfig);
    } catch (error) {
        renderErrorInStatus(error);
    }

    renderClientVersion(version, sha);
    reloadPlayerIframe(initConfig.streamName);

    UI.errorlogsOutEl.data = [];

    return UI;
}

export function initializeUIConfig(initConfig) {
    const { configInEl } = UI;

    configInEl.addEventListener('keyup', onConfigChange);
    configInEl.addEventListener('change', onConfigChange);
    configInEl.addEventListener('paste', onConfigChange);

    // Remove streamName and auth from DOM config as they need to be passed as query params
    const { streamName, auth, ...domConfig  } = initConfig;
    configInEl.value = HelperUtils.prettyPrintJson(domConfig);

    function onConfigChange(event) {
        try {
            const domConfig = JSON.parse(configInEl.value);

            encodeConfigToURL(domConfig);

            applyURLParamsTo(domConfig);

            initConfig = domConfig;
            clearErrorFromStatus();
        } catch(err) {
            const errMsg = `Error updating config: ${err.message}`;
            renderErrorInStatus(errMsg);
            if (event.type === 'change') {
                alert(errMsg);
            }
            return;
        }
        console.debug('Config updated:', HelperUtils.prettyPrintJson(initConfig));
    }
}

/**
 * Populates the UI with device dropdowns and updates the initial configuration.
 * @param {Object} devices - The filtered video and audio devices.
 * @param {Object} initConfig - The initial configuration object.
 * @param {HTMLElement} configInEl - The configuration input element.
 */
export function populateDeviceDropdowns(devices, initConfig) {
    console.debug('Available devices:', devices);

    const videoDevicesSelect = createDevicesDropdown(devices.videoDevices);
    const audioDevicesSelect = createDevicesDropdown(devices.audioDevices);
    const videoDevicesLabel = document.createElement('label');
    videoDevicesLabel.innerText = 'video devices: ';
    const audioDevicesLabel = document.createElement('label');
    audioDevicesLabel.innerText = 'audio devices: ';

    document.querySelector('#devices').appendChild(videoDevicesLabel);
    document.querySelector('#devices').appendChild(videoDevicesSelect);
    document.querySelector('#devices').appendChild(document.createElement('br'));
    document.querySelector('#devices').appendChild(audioDevicesLabel);
    document.querySelector('#devices').appendChild(audioDevicesSelect);

    const deviceIndicesFromURL = getDeviceIndicesFromURL();
    videoDevicesSelect.selectedIndex = (deviceIndicesFromURL[0] < videoDevicesSelect.length) ? deviceIndicesFromURL[0] : 0;
    audioDevicesSelect.selectedIndex = (deviceIndicesFromURL[1] < audioDevicesSelect.length) ? deviceIndicesFromURL[1] : 0;

    try {
        initConfig.inputCfg.mediaStreamCfg.videoDeviceId = videoDevicesSelect.value;
        initConfig.inputCfg.mediaStreamCfg.audioDeviceId = audioDevicesSelect.value;
    } catch (err) {
        throw new Error(`Failed to update config with selected device ids: ${err.message}`);
    }
    UI.configInEl.value = HelperUtils.prettyPrintJson(initConfig);

    [audioDevicesSelect, videoDevicesSelect].forEach((select, arrayIndex) => {
        select.addEventListener('change', function(event) {
            const deviceId = event.currentTarget.value;
            console.log('Selected Device ID:', deviceId);
            try {
                arrayIndex === 0 ?
                    initConfig.inputCfg.mediaStreamCfg.audioDeviceId = deviceId
                    : initConfig.inputCfg.mediaStreamCfg.videoDeviceId = deviceId;
            } catch (err) {
                throw new Error(`Failed to update config with selected device id: ${err.message}`);
            }
            UI.configInEl.value = HelperUtils.prettyPrintJson(initConfig);
        });
    });
}

function createDevicesDropdown(devices) {
    const selectElement = document.createElement('select');
    devices.forEach(device => {
        const optionElement = document.createElement('option');
        optionElement.value = device.deviceId;
        optionElement.textContent = `${device.label || 'Unknown Device'} - id: ${device.deviceId}`;
        selectElement.appendChild(optionElement);
    });
    return selectElement;
}


/**
 * Replaces the current player iframe with a new one in order to trigger stream playout.
 * @param {string} streamName - The stream name to use in the iframe source URL.
 */
export function reloadPlayerIframe(streamName) {
    const playerContainerEl = document.getElementById('player-container');

    if (playerContainerEl.children.length) {
        playerContainerEl.removeChild(playerContainerEl.firstElementChild);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'player';
    iframe.allowFullscreen = true;
    const srcUrl = `https://demo.nanocosmos.de/nanoplayer/release/nanoplayer.html?entry.h5live.rtmp.streamname=${streamName}\
&entry.bintu.apiurl=https://bintu.nanocosmos.de\
&style.width=543px&style.height=305px\
&playback.faststart=1\
&playback.latencyControlMode=fastadaptive\
&playback.metadata=1`;
    iframe.src = srcUrl;

    playerContainerEl.appendChild(iframe);
}

function updateMainStatsWith({ audio, video, connection }) {
    const defaultString = 'idle';
    UI.audioBitrateEl.textContent = audio.bitrate.value
        ? `${audio.bitrate.value} Kbps`
        : defaultString;
    UI.videoBitrateEl.textContent = video.bitrate.value
        ? `${video.bitrate.value} Kbps`
        : defaultString;
    UI.videoFramerateEl.textContent = video.framerate.value
        ? `${video.framerate.value} fps`
        : defaultString;
    UI.connectionRTTEl.textContent = connection.rtt.value
        ? `${connection.rtt.value} ms`
        : defaultString;

    UI.connectionPacketLossEl.textContent = connection.packetLoss.value != null
        ? `${connection.packetLoss.value.toFixed(2)} %`
        : defaultString;

}

/**
 * Renders the client version and commit SHA.
 * @param {string} version - The client version to display.
 * @param {string} sha - The commit SHA to display.
 */
export function renderClientVersion(version, sha) {
    const packageVersionEl = document.getElementById('package-version');
    const commitShaEl = document.getElementById('commit-sha');

    packageVersionEl.innerText = `client version: ${version}`;
    commitShaEl.innerText = `commit SHA: ${sha}`;
}

export function addErrorToStack(msg) {
    const { errorlogsOutEl } = UI;


    if (UI.errorlogsOutEl.data.length >= MAX_LOG_LINES) {
        errorlogsOutEl.data.shift();
    }

    UI.errorlogsOutEl.data = [
        ...errorlogsOutEl.data,
        HelperUtils.cloneSerializable(msg.slice(1))
    ];
}

/**
 * Displays an error message in the DOM element.
 * @param {string} errorMsg - The error message to display.
 */
export function renderErrorInStatus(errorMsg) {
    const errorStatusEl = document.querySelector('#error-status');

    console.error(errorMsg);
    errorStatusEl.innerHTML = errorMsg;
}

/**
 * Clears the error message from the DOM element.
 */
export function clearErrorFromStatus() {
    const errorStatusEl = document.querySelector('#error-status');

    errorStatusEl.innerHTML = '';
}

export function clearInfo() {
    UI.instanceStatusEl.innerHTML = 'none';
    UI.streamStatusEl.innerHTML = 'none';
    UI.reconnectionStatusEl.innerHTML = 'none';
}

export function renderInstanceCreatedStatus() {
    UI.instanceStatusEl.innerHTML = 'created';
}

export function updateToggleAudioBtn(isMuted) {
    UI.toggleAudioEl.innerText = isMuted.audio ? 'Unmute audio' : 'Mute audio';
}

export function renderMediaStreamSettings(settings) {
    UI.settingsOutEl.data = settings;
}

export function renderServerVersion(version) {
    UI.serverInfoOutEl.data = {
        serverVersion: version
    };
}

export function renderUpstreamStatus(status) {
    UI.statusOutEl.data = status;
    UI.streamStatusEl.innerHTML = status.connectionState || 'none';
}

export function renderReconnectionState(newState) {
    UI.reconnectionStatusEl.innerHTML = newState;
}

export function renderMetrics(metrics) {
    UI.metricsOutEl.data = metrics;
    updateMainStatsWith(metrics.rtcstats);
}





