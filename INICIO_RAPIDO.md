# 🚀 Inicio Rápido - Librería de Ecualizador de Audio

## 📥 Paso 1: Obtener la Librería

Copia el archivo `equalizer.browser.js` a tu proyecto:

```bash
# Desde este repositorio
cp /app/equalizer.browser.js tu-proyecto/
```

## 📝 Paso 2: HTML Básico

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mi Reproductor con Ecualizador</title>
</head>
<body>
    <audio id="audio" controls crossorigin="anonymous">
        <source src="tu-cancion.mp3" type="audio/mpeg">
    </audio>

    <script type="module" src="app.js"></script>
</body>
</html>
```

## 💻 Paso 3: JavaScript Básico

Crea `app.js`:

```javascript
import { EqualizerEngine, equalizerPresets } from './equalizer.browser.js';

// 1. Obtener elementos
const audio = document.getElementById('audio');

// 2. Configurar Web Audio API
const audioContext = new AudioContext();
const source = audioContext.createMediaElementSource(audio);

// 3. Crear ecualizador
const eq = new EqualizerEngine(audioContext);

// 4. Conectar: audio -> ecualizador -> speakers
source.connect(eq.input);
eq.connect(audioContext.destination);

// 5. ¡Listo! Ahora controla el ecualizador
eq.setBandGain('32', 5);  // +5dB en 32Hz (graves)
eq.setPreset(equalizerPresets.bassBoost);

// Reanudar contexto en móviles
audio.addEventListener('play', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
});
```

## 🎛️ Paso 4: Agregar Controles (Opcional)

```html
<!-- Selector de presets -->
<select id="preset-select">
    <option value="flat">Flat</option>
    <option value="bassBoost">Bass Boost</option>
    <option value="rock">Rock</option>
    <option value="jazz">Jazz</option>
</select>

<!-- Slider de banda -->
<input type="range" id="bass-slider" min="-12" max="12" step="0.5" value="0">
<span id="bass-value">0 dB</span>

<script type="module">
import { EqualizerEngine, equalizerPresets } from './equalizer.browser.js';

// ... (código anterior)

// Cambiar preset
document.getElementById('preset-select').addEventListener('change', (e) => {
    const preset = equalizerPresets[e.target.value];
    eq.setPreset(preset);
});

// Controlar banda
document.getElementById('bass-slider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    eq.setBandGain('32', value);
    document.getElementById('bass-value').textContent = value.toFixed(1) + ' dB';
});
</script>
```

## 🎨 Presets Disponibles

```javascript
// 13 presets listos para usar:
eq.setPreset(equalizerPresets.flat);        // Sin cambios
eq.setPreset(equalizerPresets.bassBoost);   // Graves potentes
eq.setPreset(equalizerPresets.trebleBoost); // Agudos brillantes
eq.setPreset(equalizerPresets.vocalBoost);  // Voces claras
eq.setPreset(equalizerPresets.electronic);  // Música electrónica
eq.setPreset(equalizerPresets.rock);        // Rock
eq.setPreset(equalizerPresets.jazz);        // Jazz
eq.setPreset(equalizerPresets.classical);   // Clásica
eq.setPreset(equalizerPresets.pop);         // Pop
eq.setPreset(equalizerPresets.hipHop);      // Hip-Hop
eq.setPreset(equalizerPresets.acoustic);    // Acústica
eq.setPreset(equalizerPresets.podcast);     // Podcast
eq.setPreset(equalizerPresets.latin);       // Latina
```

## 🎯 Funciones Útiles

```javascript
// Resetear a flat
eq.reset();

// Desactivar ecualizador
eq.bypass();

// Reactivar
eq.enable();

// Guardar configuración
const config = eq.getAllGains();
localStorage.setItem('eq-config', JSON.stringify(config));

// Restaurar configuración
const saved = JSON.parse(localStorage.getItem('eq-config'));
if (saved) {
    eq.setAllGains(saved.bands);
    eq.setPreampGain(saved.preamp);
}
```

## 📚 Bandas de Frecuencia

| ID | Frecuencia | Control |
|----|-----------|---------|
| `'32'` | 32 Hz | Sub-graves |
| `'64'` | 64 Hz | Graves profundos |
| `'125'` | 125 Hz | Graves |
| `'250'` | 250 Hz | Graves medios |
| `'500'` | 500 Hz | Medios bajos |
| `'1k'` | 1 kHz | Medios |
| `'2k'` | 2 kHz | Medios altos |
| `'4k'` | 4 kHz | Agudos |
| `'8k'` | 8 kHz | Agudos altos |
| `'16k'` | 16 kHz | Súper agudos |

## 🎓 Ejemplos Completos

### Ver Ejemplo Completo
```bash
cd example-app
python3 -m http.server 5173
# Abrir http://localhost:5173
```

### Ver Ejemplo Simple
```bash
cd simple-example
python3 -m http.server 5174
# Abrir http://localhost:5174
```

## 📖 Más Información

- **README.md** - Documentación completa
- **EQUALIZER_GUIDE.md** - Guía rápida
- **ESTRUCTURA.md** - Estructura del proyecto
- **RESUMEN_MEJORAS.md** - Lista de todas las mejoras

## 💡 Tips

### En Móviles
```javascript
// Siempre reanudar el contexto
audio.addEventListener('play', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
});
```

### Con Archivos Locales
```javascript
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        audio.src = URL.createObjectURL(file);
    }
});
```

### Con Spotify/SoundCloud API
```javascript
// Conecta cualquier fuente de audio
const source = audioContext.createMediaElementSource(audioElement);
source.connect(eq.input);
eq.connect(audioContext.destination);
```

## ✅ ¡Eso es todo!

Con estos 3 pasos ya tienes un ecualizador funcionando. Para más funcionalidades, revisa la documentación completa en **README.md**.

---

**¿Necesitas ayuda?** Revisa los ejemplos incluidos o lee la documentación completa.
