/**
 * Configuración de una banda de frecuencia del ecualizador
 */
export interface EqualizerBand {
    /** Identificador único de la banda */
    id: string;
    /** Frecuencia central en Hz */
    frequency: number;
    /** Ganancia en dB (-12 a +12) */
    gain: number;
    /** Factor Q (ancho de banda) */
    q?: number;
    /** Tipo de filtro */
    type?: BiquadFilterType;
}

/**
 * Preset de ecualizador con configuración predefinida
 */
export interface EqualizerPreset {
    /** Nombre descriptivo del preset */
    name: string;
    /** Mapa de ganancias por ID de banda */
    gains: Record<string, number>;
}

/**
 * Opciones de configuración para el EqualizerEngine
 */
export interface EqualizerOptions {
    /** Bandas personalizadas (opcional, usa bandas por defecto si no se especifica) */
    bands?: EqualizerBand[];
    /** Ganancia inicial del preamp en dB (opcional, por defecto 0) */
    preampGain?: number;
}

/**
 * Motor de ecualizador de audio de 10 bandas
 * Basado en Web Audio API con soporte completo para control de frecuencias
 */
export declare class EqualizerEngine {
    /** Contexto de audio */
    readonly context: AudioContext;
    /** Nodo de entrada (conectar source aquí) */
    readonly input: GainNode;
    /** Nodo de salida (conectar a destination) */
    readonly output: GainNode;

    /**
     * Crea una nueva instancia del ecualizador
     * @param context - AudioContext de Web Audio API
     * @param options - Opciones de configuración (opcional)
     */
    constructor(context: AudioContext, options?: EqualizerOptions);

    /**
     * Conecta la salida del ecualizador a un nodo de destino
     * @param destination - Nodo de audio de destino
     */
    connect(destination: AudioNode): void;

    /**
     * Desconecta la salida del ecualizador
     */
    disconnect(): void;

    /**
     * Establece la ganancia de una banda específica
     * @param bandId - ID de la banda ('32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k')
     * @param gain - Ganancia en dB (-12 a +12)
     */
    setBandGain(bandId: string, gain: number): void;

    /**
     * Aplica un preset predefinido
     * @param preset - Objeto de preset con configuración de ganancias
     */
    setPreset(preset: EqualizerPreset): void;

    /**
     * Establece la ganancia del preamp
     * @param gainDb - Ganancia en dB
     */
    setPreampGain(gainDb: number): void;

    /**
     * Obtiene la ganancia actual del preamp
     * @returns Ganancia en dB
     */
    getPreampGainDb(): number;

    /**
     * Obtiene las ganancias actuales de todas las bandas
     * @returns Objeto con pares bandId: gain
     */
    getBandGains(): Record<string, number>;

    /**
     * Obtiene todas las ganancias incluyendo preamp
     * @returns Objeto con bandas y preamp
     */
    getAllGains(): { bands: Record<string, number>; preamp: number };

    /**
     * Establece múltiples ganancias de bandas a la vez
     * @param gains - Objeto con pares bandId: gain
     */
    setAllGains(gains: Record<string, number>): void;

    /**
     * Resetea todas las bandas y el preamp a 0dB
     */
    reset(): void;

    /**
     * Desactiva el ecualizador (bypass sin latencia)
     */
    bypass(): void;

    /**
     * Reactiva el ecualizador después de bypass
     */
    enable(): void;

    /**
     * Verifica si el ecualizador está en modo bypass
     * @returns true si está en bypass, false si está activo
     */
    isBypassed(): boolean;

    /**
     * Obtiene la respuesta de frecuencia del ecualizador
     * @param frequencyArray - Array opcional de frecuencias a evaluar
     * @returns Objeto con arrays de frecuencias, magnitudes y fases
     */
    getFrequencyResponse(frequencyArray?: Float32Array): {
        frequencies: Float32Array;
        magnitudes: Float32Array;
        phases: Float32Array;
    };

    /**
     * Obtiene información completa de todas las bandas
     * @returns Array de objetos EqualizerBand
     */
    getBands(): EqualizerBand[];

    /**
     * Limpia y desconecta todos los nodos de audio
     */
    destroy(): void;
}

/**
 * Colección de presets predefinidos
 */
export declare const equalizerPresets: {
    /** Sin cambios (todas las bandas a 0dB) */
    flat: EqualizerPreset;
    /** Énfasis en graves */
    bassBoost: EqualizerPreset;
    /** Énfasis en agudos */
    trebleBoost: EqualizerPreset;
    /** Realce de voces (250Hz-2kHz) */
    vocalBoost: EqualizerPreset;
    /** Perfil para música electrónica */
    electronic: EqualizerPreset;
    /** Perfil para rock y metal */
    rock: EqualizerPreset;
    /** Perfil para jazz y blues */
    jazz: EqualizerPreset;
    /** Perfil para música clásica */
    classical: EqualizerPreset;
    /** Perfil para pop moderno */
    pop: EqualizerPreset;
    /** Perfil para hip-hop y trap */
    hipHop: EqualizerPreset;
    /** Perfil para música acústica */
    acoustic: EqualizerPreset;
    /** Perfil optimizado para voz hablada */
    podcast: EqualizerPreset;
    /** Perfil para música latina */
    latin: EqualizerPreset;
};

/**
 * Crea un ecualizador conectado a un elemento HTML de audio
 * @param context - AudioContext de Web Audio API
 * @param mediaElement - Elemento <audio> o <video> de HTML
 * @param options - Opciones de configuración (opcional)
 * @returns Instancia de EqualizerEngine ya conectada
 */
export declare function createMediaElementEqualizer(
    context: AudioContext,
    mediaElement: HTMLMediaElement,
    options?: EqualizerOptions
): EqualizerEngine;
