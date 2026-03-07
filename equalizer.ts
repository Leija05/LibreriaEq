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

const DEFAULT_BANDS: EqualizerBand[] = [
    { id: '32', frequency: 32, gain: 0 },
    { id: '64', frequency: 64, gain: 0 },
    { id: '125', frequency: 125, gain: 0 },
    { id: '250', frequency: 250, gain: 0 },
    { id: '500', frequency: 500, gain: 0 },
    { id: '1k', frequency: 1000, gain: 0 },
    { id: '2k', frequency: 2000, gain: 0 },
    { id: '4k', frequency: 4000, gain: 0 },
    { id: '8k', frequency: 8000, gain: 0 },
    { id: '16k', frequency: 16000, gain: 0 }
];

const clampGain = (gain: number): number => Math.min(12, Math.max(-12, gain));

export class EqualizerEngine {
    readonly context: AudioContext;
    readonly input: GainNode;
    readonly output: GainNode;

    private preamp: GainNode;
    private filters: Map<string, BiquadFilterNode>;
    private bypassed: boolean = false;
    private bypassConnection: AudioNode | null = null;
    private currentPreampDb: number = 0;

    constructor(context: AudioContext, options: EqualizerOptions = {}) {
        this.context = context;
        this.input = context.createGain();
        this.output = context.createGain();
        this.preamp = context.createGain();
        this.filters = new Map();

        const bands = options.bands ?? DEFAULT_BANDS;
        this.currentPreampDb = options.preampGain ?? 0;
        this.preamp.gain.value = this.toLinearGain(this.currentPreampDb);

        this.input.connect(this.preamp);
        let previousNode: AudioNode = this.preamp;

        for (const band of bands) {
            const filter = context.createBiquadFilter();
            filter.type = band.type ?? 'peaking';
            filter.frequency.value = band.frequency;
            filter.gain.value = clampGain(band.gain);
            filter.Q.value = band.q ?? 1;
            previousNode.connect(filter);
            previousNode = filter;
            this.filters.set(band.id, filter);
        }

        previousNode.connect(this.output);
    }

    connect(destination: AudioNode): void {
        this.output.connect(destination);
    }

    disconnect(): void {
        this.output.disconnect();
    }

    setBandGain(bandId: string, gain: number): void {
        const filter = this.filters.get(bandId);
        if (!filter) return;
        filter.gain.value = clampGain(gain);
    }

    setPreset(preset: EqualizerPreset): void {
        // Primero resetear todas las bandas a 0
        for (const [bandId, filter] of this.filters.entries()) {
            filter.gain.value = 0;
        }
        // Luego aplicar las ganancias del preset
        for (const [bandId, gain] of Object.entries(preset.gains)) {
            this.setBandGain(bandId, gain);
        }
    }

    setPreampGain(gainDb: number): void {
        this.currentPreampDb = gainDb;
        this.preamp.gain.value = this.toLinearGain(gainDb);
    }

    getPreampGainDb(): number {
        return this.currentPreampDb;
    }

    getBandGains(): Record<string, number> {
        const result: Record<string, number> = {};
        for (const [bandId, filter] of this.filters.entries()) {
            result[bandId] = filter.gain.value;
        }
        return result;
    }

    getAllGains(): { bands: Record<string, number>; preamp: number } {
        return {
            bands: this.getBandGains(),
            preamp: this.currentPreampDb
        };
    }

    setAllGains(gains: Record<string, number>): void {
        for (const [bandId, gain] of Object.entries(gains)) {
            this.setBandGain(bandId, gain);
        }
    }

    reset(): void {
        for (const [bandId, filter] of this.filters.entries()) {
            filter.gain.value = 0;
        }
        this.setPreampGain(0);
    }

    bypass(): void {
        if (this.bypassed) return;
        this.bypassed = true;
        
        // Desconectar la cadena de filtros
        this.input.disconnect();
        
        // Conectar directamente input a output
        this.input.connect(this.output);
    }

    enable(): void {
        if (!this.bypassed) return;
        this.bypassed = false;
        
        // Desconectar el bypass
        this.input.disconnect();
        
        // Reconectar la cadena de filtros
        this.input.connect(this.preamp);
    }

    isBypassed(): boolean {
        return this.bypassed;
    }

    getFrequencyResponse(frequencyArray?: Float32Array): { frequencies: Float32Array; magnitudes: Float32Array; phases: Float32Array } {
        const length = frequencyArray?.length ?? 1024;
        const frequencies = frequencyArray ?? new Float32Array(length);
        
        if (!frequencyArray) {
            // Generar array de frecuencias logarítmico de 20Hz a 20kHz
            const minFreq = Math.log10(20);
            const maxFreq = Math.log10(20000);
            for (let i = 0; i < length; i++) {
                const t = i / (length - 1);
                frequencies[i] = Math.pow(10, minFreq + t * (maxFreq - minFreq));
            }
        }
        
        const magnitudes = new Float32Array(length);
        const phases = new Float32Array(length);
        
        // Inicializar con valores neutros
        magnitudes.fill(1);
        phases.fill(0);
        
        // Aplicar respuesta de cada filtro
        for (const filter of this.filters.values()) {
            const tempMag = new Float32Array(length);
            const tempPhase = new Float32Array(length);
            filter.getFrequencyResponse(frequencies, tempMag, tempPhase);
            
            for (let i = 0; i < length; i++) {
                magnitudes[i] *= tempMag[i];
                phases[i] += tempPhase[i];
            }
        }
        
        // Aplicar preamp
        const preampLinear = this.preamp.gain.value;
        for (let i = 0; i < length; i++) {
            magnitudes[i] *= preampLinear;
        }
        
        return { frequencies, magnitudes, phases };
    }

    getBands(): EqualizerBand[] {
        const bands: EqualizerBand[] = [];
        for (const [id, filter] of this.filters.entries()) {
            bands.push({
                id,
                frequency: filter.frequency.value,
                gain: filter.gain.value,
                q: filter.Q.value,
                type: filter.type as BiquadFilterType
            });
        }
        return bands;
    }

    destroy(): void {
        this.disconnect();
        this.input.disconnect();
        this.preamp.disconnect();
        for (const filter of this.filters.values()) {
            filter.disconnect();
        }
        this.filters.clear();
    }

    private toLinearGain(db: number): number {
        return Math.pow(10, db / 20);
    }
}

export const equalizerPresets: Record<string, EqualizerPreset> = {
    flat: {
        name: 'Flat',
        gains: {}
    },
    bassBoost: {
        name: 'Bass Boost',
        gains: {
            '32': 6,
            '64': 5,
            '125': 3,
            '250': 1,
            '500': 0,
            '1k': -1,
            '2k': -2,
            '4k': -1,
            '8k': 1,
            '16k': 2
        }
    },
    trebleBoost: {
        name: 'Treble Boost',
        gains: {
            '32': -2,
            '64': -1,
            '125': 0,
            '250': 0,
            '500': 1,
            '1k': 2,
            '2k': 4,
            '4k': 5,
            '8k': 6,
            '16k': 6
        }
    },
    vocalBoost: {
        name: 'Vocal Boost',
        gains: {
            '32': -2,
            '64': -1,
            '125': 0,
            '250': 2,
            '500': 3,
            '1k': 4,
            '2k': 3,
            '4k': 1,
            '8k': -1,
            '16k': -2
        }
    },
    electronic: {
        name: 'Electronic',
        gains: {
            '32': 4,
            '64': 3,
            '125': 1,
            '250': -1,
            '500': -2,
            '1k': 0,
            '2k': 2,
            '4k': 3,
            '8k': 4,
            '16k': 3
        }
    },
    rock: {
        name: 'Rock',
        gains: {
            '32': 5,
            '64': 3,
            '125': 2,
            '250': -1,
            '500': -2,
            '1k': -1,
            '2k': 2,
            '4k': 4,
            '8k': 5,
            '16k': 4
        }
    },
    jazz: {
        name: 'Jazz',
        gains: {
            '32': 2,
            '64': 2,
            '125': 1,
            '250': 1,
            '500': -1,
            '1k': -1,
            '2k': 0,
            '4k': 2,
            '8k': 3,
            '16k': 3
        }
    },
    classical: {
        name: 'Classical',
        gains: {
            '32': 0,
            '64': 0,
            '125': 0,
            '250': 0,
            '500': 0,
            '1k': 0,
            '2k': -1,
            '4k': -1,
            '8k': -2,
            '16k': -3
        }
    },
    pop: {
        name: 'Pop',
        gains: {
            '32': 2,
            '64': 3,
            '125': 2,
            '250': 0,
            '500': -1,
            '1k': -1,
            '2k': 1,
            '4k': 3,
            '8k': 4,
            '16k': 3
        }
    },
    hipHop: {
        name: 'Hip-Hop',
        gains: {
            '32': 6,
            '64': 5,
            '125': 3,
            '250': 2,
            '500': 0,
            '1k': -1,
            '2k': -1,
            '4k': 1,
            '8k': 2,
            '16k': 3
        }
    },
    acoustic: {
        name: 'Acoustic',
        gains: {
            '32': 3,
            '64': 2,
            '125': 1,
            '250': 0,
            '500': 1,
            '1k': 2,
            '2k': 3,
            '4k': 3,
            '8k': 2,
            '16k': 1
        }
    },
    podcast: {
        name: 'Podcast',
        gains: {
            '32': -3,
            '64': -2,
            '125': 0,
            '250': 2,
            '500': 3,
            '1k': 3,
            '2k': 2,
            '4k': 0,
            '8k': -2,
            '16k': -3
        }
    },
    latin: {
        name: 'Latin',
        gains: {
            '32': 4,
            '64': 3,
            '125': 2,
            '250': 1,
            '500': 0,
            '1k': 1,
            '2k': 2,
            '4k': 3,
            '8k': 4,
            '16k': 4
        }
    }
};

export const createMediaElementEqualizer = (
    context: AudioContext,
    mediaElement: HTMLMediaElement,
    options?: EqualizerOptions
): EqualizerEngine => {
    const source = context.createMediaElementSource(mediaElement);
    const engine = new EqualizerEngine(context, options);
    source.connect(engine.input);
    engine.connect(context.destination);
    return engine;
};
