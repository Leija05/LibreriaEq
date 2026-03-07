// Importar la librería del ecualizador desde el directorio padre
import { EqualizerEngine, equalizerPresets } from '../equalizer.browser.js';

const audio = document.getElementById('audio');
const fileInput = document.getElementById('file-input');
const presetSelect = document.getElementById('preset-select');
const preampSlider = document.getElementById('preamp');
const preampValue = document.getElementById('preamp-value');
const resetBtn = document.getElementById('reset-btn');
const bypassBtn = document.getElementById('bypass-btn');
const bandsContainer = document.getElementById('bands-container');

if (!audio || !fileInput || !presetSelect || !preampSlider || !preampValue || !resetBtn || !bypassBtn || !bandsContainer) {
    console.error('No se encontraron todos los elementos necesarios en el DOM');
    throw new Error('Elementos del DOM faltantes');
}

// Configuración del Web Audio API
const audioContext = new AudioContext();
const source = audioContext.createMediaElementSource(audio);

// Crear instancia del ecualizador
const equalizer = new EqualizerEngine(audioContext);

// Conectar: source -> equalizer -> destination
source.connect(equalizer.input);
equalizer.connect(audioContext.destination);

// Bandas de frecuencia
const bands = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

// Crear sliders para cada banda
bands.forEach(bandId => {
    const bandDiv = document.createElement('div');
    bandDiv.className = 'band';
    
    const label = document.createElement('label');
    label.textContent = bandId + ' Hz';
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '-12';
    slider.max = '12';
    slider.step = '0.5';
    slider.value = '0';
    slider.dataset.bandId = bandId;
    
    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'band-value';
    valueDisplay.textContent = '0 dB';
    
    // Event listener para actualizar el ecualizador
    slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        equalizer.setBandGain(bandId, value);
        valueDisplay.textContent = (value >= 0 ? '+' : '') + value.toFixed(1) + ' dB';
    });
    
    bandDiv.appendChild(label);
    bandDiv.appendChild(slider);
    bandDiv.appendChild(valueDisplay);
    bandsContainer.appendChild(bandDiv);
});

// Función para sincronizar sliders con el ecualizador
function syncSliders() {
    const gains = equalizer.getBandGains();
    const sliders = bandsContainer.querySelectorAll('input[type="range"]');
    
    sliders.forEach(slider => {
        const bandId = slider.dataset.bandId;
        const value = gains[bandId] || 0;
        slider.value = value;
        
        const valueDisplay = slider.nextElementSibling;
        if (valueDisplay) {
            valueDisplay.textContent = (value >= 0 ? '+' : '') + value.toFixed(1) + ' dB';
        }
    });
}

presetSelect.addEventListener('change', (e) => {
    const presetName = e.target.value;
    const preset = equalizerPresets[presetName];
    
    if (preset) {
        equalizer.setPreset(preset);
        syncSliders();
        console.log('Preset aplicado:', preset.name);
    }
});

preampSlider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    equalizer.setPreampGain(value);
    preampValue.textContent = (value >= 0 ? '+' : '') + value.toFixed(1);
});

resetBtn.addEventListener('click', () => {
    equalizer.reset();
    syncSliders();
    preampSlider.value = '0';
    preampValue.textContent = '0';
    presetSelect.value = 'flat';
    console.log('Ecualizador reseteado');
});

bypassBtn.addEventListener('click', () => {
    if (equalizer.isBypassed()) {
        equalizer.enable();
        bypassBtn.textContent = 'Bypass';
        bypassBtn.classList.remove('active');
        console.log('Ecualizador activado');
    } else {
        equalizer.bypass();
        bypassBtn.textContent = 'Enable';
        bypassBtn.classList.add('active');
        console.log('Ecualizador en bypass');
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        audio.src = url;
        audio.load();
        console.log('Archivo cargado:', file.name);
    }
});

audio.addEventListener('play', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
});

console.log('Ecualizador inicializado correctamente');
console.log('Bandas disponibles:', bands);
console.log('Presets disponibles:', Object.keys(equalizerPresets));