export interface EqualizerBand {
    id: string;
    frequency: number;
    gain: number;
    q?: number;
    type?: BiquadFilterType;
}
export interface EqualizerPreset {
    name: string;
    gains: Record<string, number>;
}
export interface EqualizerOptions {
    bands?: EqualizerBand[];
    preampGain?: number;
}
export declare class EqualizerEngine {
    readonly context: AudioContext;
    readonly input: GainNode;
    readonly output: GainNode;
    private preamp;
    private filters;
    private bypassed;
    private bypassConnection;
    private currentPreampDb;
    constructor(context: AudioContext, options?: EqualizerOptions);
    connect(destination: AudioNode): void;
    disconnect(): void;
    setBandGain(bandId: string, gain: number): void;
    setPreset(preset: EqualizerPreset): void;
    setPreampGain(gainDb: number): void;
    getPreampGainDb(): number;
    getBandGains(): Record<string, number>;
    getAllGains(): {
        bands: Record<string, number>;
        preamp: number;
    };
    setAllGains(gains: Record<string, number>): void;
    reset(): void;
    bypass(): void;
    enable(): void;
    isBypassed(): boolean;
    getFrequencyResponse(frequencyArray?: Float32Array): {
        frequencies: Float32Array;
        magnitudes: Float32Array;
        phases: Float32Array;
    };
    getBands(): EqualizerBand[];
    destroy(): void;
    private toLinearGain;
}
export declare const equalizerPresets: Record<string, EqualizerPreset>;
export declare const createMediaElementEqualizer: (context: AudioContext, mediaElement: HTMLMediaElement, options?: EqualizerOptions) => EqualizerEngine;
