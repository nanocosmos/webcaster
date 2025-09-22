const { HelperUtils } = window.WebcasterApiV6;

/**
 * Updates the given configuration object with URL parameters.
 * @param {Object} config - The configuration object to update with URL parameters.
 * @returns {Object} - The updated configuration object.
 */
export function updateConfigWithURLParams(configIn) {
    const urlParams = new URLSearchParams(window.location.search);

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
    const streamName = urlParams.get('streamName');

    if (!streamName) {
        alert('streamName must be passed as a query parameter');
    }

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

/**
 * Updates the given configuration object with settings extracted from a URL-encoded base64 string.
 * If valid configuration parameters are found in the URL, the existing properties of `configIn`
 * are removed and replaced with those from the decoded URL configuration.
 *
 * @param {Object} configIn - The configuration object to be updated.
 * @returns {Object} - The updated configuration object with settings from the URL.
 */
export function applyURLParamsTo(configIn) {
    let configFromUrl = decodeConfigFromURL();
    if (configFromUrl) {
        // We cannot simply assign configFromUrl to configIn because configIn is passed by reference.
        for (const prop of Object.getOwnPropertyNames(configIn)) {
            delete configIn[prop];
        }
        Object.assign(configIn, configFromUrl);
    }

    updateConfigWithURLParams(configIn);

    return configIn;
}

/**
 * Encodes the specified configuration object into the URL as a base64 string.
 * @param {Object} config - The configuration object to encode into the URL.
 */
export function encodeConfigToURL(config) {
    const url = new URL(location);
    const configClone = HelperUtils.cloneSerializable(config);
    delete configClone?.inputCfg?.mediaStreamCfg?.audioDeviceId;
    delete configClone?.inputCfg?.mediaStreamCfg?.videoDeviceId;

    const configBase64 = btoa(JSON.stringify(configClone));
    url.searchParams.set('webcasterconfig', configBase64);

    if (typeof history.pushState === 'function') {
        history.pushState({}, '', url);
    } else {
        throw new Error('history.pushState() is not supported');
    }
}

/**
 * Retrieves device indices for video and audio from URL parameters.
 * @returns {number[]} - An array containing the video and audio device indices.
 */
export function getDeviceIndicesFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoDeviceIndex = Number(urlParams.get('videoDeviceIndex'));
    const audioDeviceIndex = Number(urlParams.get('audioDeviceIndex'));

    return [videoDeviceIndex, audioDeviceIndex];
}

/**
 * Decodes configuration data from a base64-encoded URL parameter.
 * @returns {Object|null} - The decoded configuration object or null if decoding fails.
 */
function decodeConfigFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const configBase64 = urlParams.get('webcasterconfig');

    if (configBase64) {
        try {
            return JSON.parse(atob(configBase64));
        } catch (err) {
            throw new Error(`Could not parse config from url: ${err.message}`);
        }
    }
    return null;
}
