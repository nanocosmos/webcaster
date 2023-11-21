/// <reference types="node" />
export declare function getGlobalThis(): Window | Global;
export declare const noop: () => undefined;
export declare function isBoolean(val: any): val is boolean;
export declare function isUndefined(val: any): val is undefined;
export declare function isDefined(val: any): boolean;
export declare function isNumber(val: any): boolean;
export declare function isObject(val: any): boolean;
export declare function isString(val: any): val is string;
export declare function orNull<T>(val?: T): T | null;
export declare function orZero(val: any): number;
export declare function orInfinity(val: any, negative?: boolean): number;
/**
 * @returns 0 only for values strict equal 0, and 1 for everything else (also non-number values).
 */
export declare function oneBitQuantize(val: any): 0 | 1;
/**
 * Number.toFixed returns a string, using this func avoids parsing back to number.
 */
export declare function roundToPrecision(num: number, digits?: number): number;
export declare function kbps(rateKbps: number): number;
export declare function mbps(rateKbps: number): number;
export declare function cloneSerializable<T>(obj: T): T;
export declare function isEmpty(obj: object): boolean;
export declare function prettyPrintJson(obj: any): string;
export declare function msToSecs(millis: number): number;
export declare function minBy<T>(array: T[], iteratee: (o: T) => number): T | undefined;
export declare function maxBy<T>(array: T[], iteratee: (o: T) => number): T | undefined;
export declare function meanBy<T>(array: T[], iteratee: (o: T) => number): number;
/**
 * Assign value from source, if property is defined in init at same key,
 * *and* when the types correspond. Otherwise init data prop stays untouched.
 * It isnt possible to set any prop undefined that is defined by init obj.
 * Recurses on nested objects. These only get recursed/overriden when the source also has them obviously.
 * Optionally: Overrides init null-values with any object from source. Otherwise null-refs count as undefined.
 * Using that option will remove type-safety as being leveraged, since the override value may or may not comply
 * to what was specified by the initTyped object/interface declaration.
 */
export declare function assignInitTypedProps<O extends object>(initTyped: O, sourceData: any, overrideNullRefs?: boolean): void;
/**
 * Filter any input by mask object (recurses), results in mask return type.
 * Input & Mask do not get mutated (output is clone).
 */
export declare function filterObjectByMask<T extends object>(input: object, mask: T, overrideNullRefs?: boolean): T;
export declare function trimUrlTrailingSlash(inUrl: string): string;
