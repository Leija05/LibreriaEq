import { EqualizerEngine, equalizerPresets } from '../equalizer.browser.js';

const player = document.querySelector('#player');
const presetSelect = document.querySelector('#preset');
const bandsContainer = document.querySelector('#bands');
const preampSlider = document.querySelector('#preamp');
const preampValue = document.querySelector('#preamp-value');
const localFileInput = document.querySelector('#local-file');
const trackName = document.querySelector('#track-name');

if (!player || !presetSelect || !bandsContainer || !preampSlider || !preampValue || !localFileInput || !trackName) {
  throw new Error('No se encontraron elementos de la UI');
}

const context = new AudioContext();
const source = context.createMediaElementSource(player);
const eq = new EqualizerEngine(context);

source.connect(eq.input);
eq.connect(context.destination);

const bandOrder = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
let objectUrl = null;

const buildBandSlider = (bandId) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'band';

  const input = document.createElement('input');
  input.type = 'range';
  input.min = '-12';
  input.max = '12';
  input.step = '0.5';
  input.value = '0';
  input.dataset.bandId = bandId;

  const label = document.createElement('label');
  label.textContent = bandId;

  input.addEventListener('input', () => {
    eq.setBandGain(bandId, Number(input.value));
  });

  wrapper.append(input, label);
  return wrapper;
};

bandOrder.forEach((bandId) => {
  bandsContainer.append(buildBandSlider(bandId));
});

const syncSlidersWithEngine = () => {
  const gains = eq.getBandGains();
  const sliders = bandsContainer.querySelectorAll('input[type="range"]');
  sliders.forEach((slider) => {
    const bandId = slider.dataset.bandId;
    if (!bandId) return;
    slider.value = String(gains[bandId] ?? 0);
  });
};

presetSelect.addEventListener('change', () => {
  const selectedPreset = equalizerPresets[presetSelect.value];
  if (!selectedPreset) return;
  eq.setPreset(selectedPreset);
  syncSlidersWithEngine();
});

preampSlider.addEventListener('input', () => {
  const gain = Number(preampSlider.value);
  preampValue.textContent = String(gain);
  eq.setPreampGain(gain);
});

localFileInput.addEventListener('change', () => {
  const file = localFileInput.files?.[0];
  if (!file) return;

  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }

  objectUrl = URL.createObjectURL(file);
  player.src = objectUrl;
  player.load();
  trackName.textContent = `Archivo actual: ${file.name}`;
  player.play().catch(() => {
    trackName.textContent = `Archivo cargado: ${file.name} (pulsa play para iniciar)`;
  });
});

player.addEventListener('play', async () => {
  if (context.state !== 'running') {
    await context.resume();
  }
});
