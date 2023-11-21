import { getLogDumpData, getLogger, overrideLoggerDefaults, overrideOnLogCallback, LogLevel } from './logger';
import { Webcaster } from './webcaster';
import { StreamUtils } from './helpers/StreamUtils';
import * as DeviceUtils from './helpers/MediaDevices';
import * as HelperUtils from './helpers/utilFuncs';
declare const WebcasterApiV6: {
    Webcaster: typeof Webcaster;
    StreamUtils: typeof StreamUtils;
    DeviceUtils: typeof DeviceUtils;
    HelperUtils: typeof HelperUtils;
    LogLevel: typeof LogLevel;
    overrideLoggerDefaults: typeof overrideLoggerDefaults;
    overrideOnLogCallback: typeof overrideOnLogCallback;
    getLogger: typeof getLogger;
    getLogDumpData: typeof getLogDumpData;
    readonly VERSION: string;
};
export default WebcasterApiV6;
