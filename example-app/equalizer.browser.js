const DEFAULT_BANDS = [
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

const clampGain = (gain) => Math.min(12, Math.max(-12, gain));

export class EqualizerEngine {
  constructor(context, options = {}) {
    this.context = context;
    this.input = context.createGain();
    this.output = context.createGain();
    this.preamp = context.createGain();
    this.filters = new Map();

    const bands = options.bands ?? DEFAULT_BANDS;
    this.preamp.gain.value = this.toLinearGain(options.preampGain ?? 0);

    this.input.connect(this.preamp);
    let previousNode = this.preamp;

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

  connect(destination) {
    this.output.connect(destination);
  }

  disconnect() {
    this.output.disconnect();
  }

  setBandGain(bandId, gain) {
    const filter = this.filters.get(bandId);
    if (!filter) return;
    filter.gain.value = clampGain(gain);
  }

  setPreset(preset) {
    const presetGains = preset?.gains ?? {};
    for (const [bandId] of this.filters.entries()) {
      const gain = presetGains[bandId] ?? 0;
      this.setBandGain(bandId, gain);
    }

    if (typeof preset?.preamp === 'number') {
      this.setPreampGain(preset.preamp);
    }
  }

  setPreampGain(gainDb) {
    this.preamp.gain.value = this.toLinearGain(gainDb);
  }

  getPreampGainDb() {
    return 20 * Math.log10(this.preamp.gain.value || 1);
  }

  getBandGains() {
    const result = {};
    for (const [bandId, filter] of this.filters.entries()) {
      result[bandId] = filter.gain.value;
    }
    return result;
  }

  toLinearGain(db) {
    return Math.pow(10, db / 20);
  }
}

export const equalizerPresets = {
  flat: { name: 'Flat', preamp: 0, gains: {} },
  bassBoost: {
    name: 'Bass Boost',
    preamp: -1,
    gains: { '32': 6, '64': 5, '125': 3, '250': 1, '500': 0, '1k': -1, '2k': -2, '4k': -1, '8k': 1, '16k': 2 }
  },
  vocalBoost: {
    name: 'Vocal Boost',
    preamp: 0,
    gains: { '32': -2, '64': -1, '125': 0, '250': 2, '500': 3, '1k': 4, '2k': 3, '4k': 1, '8k': -1, '16k': -2 }
  },
  electronic: {
    name: 'Electronic',
    preamp: -0.5,
    gains: { '32': 4, '64': 3, '125': 1, '250': -1, '500': -2, '1k': 0, '2k': 2, '4k': 3, '8k': 4, '16k': 3 }
  }
};

export const createMediaElementEqualizer = (context, mediaElement, options) => {
  const source = context.createMediaElementSource(mediaElement);
  const engine = new EqualizerEngine(context, options);
  source.connect(engine.input);
  engine.connect(context.destination);
  return engine;
};
