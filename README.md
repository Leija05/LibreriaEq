# 🎵 Librería de Ecualizador de Audio

<div align="center">

**Librería profesional de ecualizador de audio de 10 bandas para aplicaciones web**

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-Compatible-green.svg)
![License](https://img.shields.io/badge/License-MIT-purple.svg)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Instalación](#-instalación)
- [Inicio Rápido](#-inicio-rápido)
- [Ejemplos](#-ejemplos)
- [API Completa](#-api-completa)
- [Presets Disponibles](#-presets-disponibles)
- [Integración con Frameworks](#-integración-con-frameworks)
- [Casos de Uso](#-casos-de-uso)

---

## ✨ Características

✅ **10 bandas de frecuencia** (32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz)  
✅ **Control de preamp** (-12dB a +12dB)  
✅ **12 presets profesionales** incluidos  
✅ **Función de bypass** sin latencia  
✅ **Respuesta de frecuencia** para visualización  
✅ **TypeScript** con tipos completos  
✅ **Zero dependencias** externas  
✅ **Compatible con todos los navegadores** modernos  
✅ **Funciones de guardado/restauración** de configuración  

---

## 📦 Instalación

### Opción 1: Usar directamente en tu proyecto

```bash
# Copiar los archivos necesarios
cp equalizer.browser.js tu-proyecto/
```

### Opción 2: Importar como módulo ES6

```javascript
import { EqualizerEngine, equalizerPresets } from './equalizer.browser.js';
```

### Opción 3: TypeScript

```typescript
import { EqualizerEngine, equalizerPresets, EqualizerPreset } from './equalizer';
```

---

## 🚀 Inicio Rápido

### Ejemplo básico con elemento `<audio>`

```javascript
import { EqualizerEngine, equalizerPresets } from './equalizer.browser.js';

// 1. Crear contexto de audio
const audioContext = new AudioContext();

// 2. Obtener elemento de audio
const audio = document.querySelector('audio');

// 3. Crear source desde el elemento
const source = audioContext.createMediaElementSource(audio);

// 4. Crear instancia del ecualizador
const eq = new EqualizerEngine(audioContext);

// 5. Conectar: source -> equalizer -> speakers
source.connect(eq.input);
eq.connect(audioContext.destination);

// 6. ¡Listo! Ahora puedes controlar el ecualizador
eq.setBandGain('1k', 3);  // +3dB en 1kHz
eq.setPreset(equalizerPresets.bassBoost);
```

### Atajo para elementos `<audio>`

```javascript
import { createMediaElementEqualizer } from './equalizer.browser.js';

const audioContext = new AudioContext();
const audio = document.querySelector('audio');

// Todo en una línea
const eq = createMediaElementEqualizer(audioContext, audio);
```

---

## 📚 Ejemplos

### Ejemplo 1: Reproductor Completo con Visualizador
📁 **Ubicación:** `/example-app/`

Reproductor de música completo con:
- Playlist con múltiples canciones
- Visualizador de frecuencias en tiempo real
- 12 presets predefinidos
- Controles de preamp y bypass
- Sliders verticales para cada banda
- Soporte para archivos locales

**Ejecutar:**
```bash
cd example-app
python3 -m http.server 5173
# Abrir http://localhost:5173
```

### Ejemplo 2: Página Web Simple
📁 **Ubicación:** `/simple-example/`

Ejemplo minimalista ideal para aprender:
- Integración básica y limpia
- Código comentado paso a paso
- UI moderna y responsive
- Menos de 150 líneas de código

**Ejecutar:**
```bash
cd simple-example
python3 -m http.server 5174
# Abrir http://localhost:5174
```

---

## 🔧 API Completa

### Constructor

```javascript
new EqualizerEngine(context, options)
```

**Parámetros:**
- `context`: AudioContext - Contexto de Web Audio API
- `options`: Object (opcional)
  - `bands`: Array de objetos EqualizerBand (opcional)
  - `preampGain`: number - Ganancia inicial del preamp en dB (opcional)

**Ejemplo:**
```javascript
const eq = new EqualizerEngine(audioContext, {
  preampGain: -2,  // Iniciar con -2dB de preamp
  bands: [
    { id: 'custom1', frequency: 100, gain: 2, q: 1 }
    // ... más bandas personalizadas
  ]
});
```

---

### Métodos de Control de Bandas

#### `setBandGain(bandId, gain)`
Ajusta la ganancia de una banda específica.

```javascript
eq.setBandGain('32', 6);    // +6dB en 32Hz
eq.setBandGain('1k', -3);   // -3dB en 1kHz
```

**Parámetros:**
- `bandId`: string - ID de la banda ('32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k')
- `gain`: number - Ganancia en dB (-12 a +12)

---

#### `getBandGains()`
Obtiene las ganancias actuales de todas las bandas.

```javascript
const gains = eq.getBandGains();
// { '32': 0, '64': 0, '125': 0, ... }
```

**Retorna:** Object - Objeto con pares bandId: gain

---

#### `setAllGains(gains)`
Establece múltiples ganancias de bandas a la vez.

```javascript
eq.setAllGains({
  '32': 5,
  '64': 4,
  '125': 3
});
```

---

#### `getAllGains()`
Obtiene todas las ganancias incluyendo el preamp.

```javascript
const allGains = eq.getAllGains();
// { bands: { '32': 0, '64': 0, ... }, preamp: 0 }
```

---

### Métodos de Presets

#### `setPreset(preset)`
Aplica un preset predefinido.

```javascript
eq.setPreset(equalizerPresets.rock);
eq.setPreset(equalizerPresets.bassBoost);
```

**Parámetros:**
- `preset`: EqualizerPreset - Objeto de preset

---

### Control de Preamp

#### `setPreampGain(gainDb)`
Ajusta la ganancia del preamp.

```javascript
eq.setPreampGain(3);   // +3dB
eq.setPreampGain(-2);  // -2dB
```

#### `getPreampGainDb()`
Obtiene la ganancia actual del preamp.

```javascript
const preamp = eq.getPreampGainDb();  // Retorna número en dB
```

---

### Funciones de Utilidad

#### `reset()`
Resetea todas las bandas y el preamp a 0dB.

```javascript
eq.reset();  // Todo a flat
```

---

#### `bypass()`
Desactiva el ecualizador (bypass sin latencia).

```javascript
eq.bypass();  // Audio pasa sin procesamiento
```

---

#### `enable()`
Reactiva el ecualizador después de bypass.

```javascript
eq.enable();  // Vuelve a aplicar el ecualizador
```

---

#### `isBypassed()`
Verifica si el ecualizador está en bypass.

```javascript
if (eq.isBypassed()) {
  console.log('Ecualizador desactivado');
}
```

---

### Visualización

#### `getFrequencyResponse(frequencyArray?)`
Obtiene la respuesta de frecuencia del ecualizador para visualización.

```javascript
const response = eq.getFrequencyResponse();
// response.frequencies: Float32Array de frecuencias
// response.magnitudes: Float32Array de magnitudes
// response.phases: Float32Array de fases

// Usar para dibujar en canvas
for (let i = 0; i < response.frequencies.length; i++) {
  const freq = response.frequencies[i];
  const mag = response.magnitudes[i];
  const db = 20 * Math.log10(mag);
  // ... dibujar gráfico
}
```

---

#### `getBands()`
Obtiene información completa de todas las bandas.

```javascript
const bands = eq.getBands();
// Array de objetos: [{ id, frequency, gain, q, type }, ...]
```

---

### Gestión de Recursos

#### `destroy()`
Limpia y desconecta todos los nodos de audio.

```javascript
eq.destroy();  // Llamar cuando ya no necesites el ecualizador
```

---

## 🎨 Presets Disponibles

La librería incluye **12 presets profesionales**:

| Preset | Descripción | Uso Recomendado |
|--------|-------------|-----------------|
| **flat** | Sin cambios (0dB todas las bandas) | Referencia, audio sin procesar |
| **bassBoost** | Énfasis en graves | Hip-Hop, EDM, Dubstep |
| **trebleBoost** | Énfasis en agudos | Música clásica, Jazz |
| **vocalBoost** | Realce de voces (250Hz-2kHz) | Podcast, Audiolibros, Voces |
| **electronic** | Perfil en V (graves + agudos) | House, Techno, Trance |
| **rock** | Potencia y presencia | Rock, Metal, Alternativo |
| **jazz** | Calidez y claridad | Jazz, Blues, Soul |
| **classical** | Balance natural | Clásica, Orquesta |
| **pop** | Brillo y punch | Pop, R&B, Top 40 |
| **hipHop** | Graves profundos | Hip-Hop, Rap, Trap |
| **acoustic** | Calidez acústica | Folk, Acústico, Singer-Songwriter |
| **podcast** | Claridad vocal | Podcast, Charlas, Radio |
| **latin** | Energía y brillo | Reggaeton, Salsa, Bachata |

### Usar presets

```javascript
import { equalizerPresets } from './equalizer.browser.js';

// Aplicar preset
eq.setPreset(equalizerPresets.rock);

// Listar todos los presets
Object.keys(equalizerPresets).forEach(key => {
  console.log(equalizerPresets[key].name);
});
```

---

## 🎯 Integración con Frameworks

### React

```jsx
import { useEffect, useRef } from 'react';
import { EqualizerEngine, equalizerPresets } from './equalizer.browser.js';

function MusicPlayer() {
  const audioRef = useRef(null);
  const eqRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    // Inicializar
    contextRef.current = new AudioContext();
    const source = contextRef.current.createMediaElementSource(audioRef.current);
    eqRef.current = new EqualizerEngine(contextRef.current);
    
    source.connect(eqRef.current.input);
    eqRef.current.connect(contextRef.current.destination);

    // Cleanup
    return () => {
      eqRef.current?.destroy();
      contextRef.current?.close();
    };
  }, []);

  const handlePresetChange = (presetName) => {
    eqRef.current?.setPreset(equalizerPresets[presetName]);
  };

  return (
    <div>
      <audio ref={audioRef} src="song.mp3" controls />
      <button onClick={() => handlePresetChange('rock')}>Rock</button>
      <button onClick={() => handlePresetChange('jazz')}>Jazz</button>
    </div>
  );
}
```

### Vue 3

```vue
<template>
  <div>
    <audio ref="audioElement" src="song.mp3" controls></audio>
    <button @click="applyPreset('rock')">Rock</button>
    <button @click="applyPreset('jazz')">Jazz</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { EqualizerEngine, equalizerPresets } from './equalizer.browser.js';

const audioElement = ref(null);
let equalizer = null;
let audioContext = null;

onMounted(() => {
  audioContext = new AudioContext();
  const source = audioContext.createMediaElementSource(audioElement.value);
  equalizer = new EqualizerEngine(audioContext);
  
  source.connect(equalizer.input);
  equalizer.connect(audioContext.destination);
});

onUnmounted(() => {
  equalizer?.destroy();
  audioContext?.close();
});

const applyPreset = (presetName) => {
  equalizer?.setPreset(equalizerPresets[presetName]);
};
</script>
```

### Vanilla JavaScript (sin framework)

```javascript
// Ver /simple-example/ para código completo

import { EqualizerEngine, equalizerPresets } from './equalizer.browser.js';

const audio = document.querySelector('audio');
const audioContext = new AudioContext();
const source = audioContext.createMediaElementSource(audio);
const eq = new EqualizerEngine(audioContext);

source.connect(eq.input);
eq.connect(audioContext.destination);

// Controlar desde botones
document.querySelector('#btn-rock').addEventListener('click', () => {
  eq.setPreset(equalizerPresets.rock);
});
```

---

## 💡 Casos de Uso

### 1. Guardar/Restaurar Configuración del Usuario

```javascript
// Guardar en localStorage
function saveEQSettings() {
  const settings = eq.getAllGains();
  localStorage.setItem('eq-settings', JSON.stringify(settings));
}

// Restaurar
function loadEQSettings() {
  const saved = localStorage.getItem('eq-settings');
  if (saved) {
    const settings = JSON.parse(saved);
    eq.setAllGains(settings.bands);
    eq.setPreampGain(settings.preamp);
  }
}

// Usar
window.addEventListener('beforeunload', saveEQSettings);
loadEQSettings();  // Al cargar la página
```

### 2. Crear Preset Personalizado

```javascript
const myCustomPreset = {
  name: 'Mi Preset',
  gains: {
    '32': 4,
    '64': 3,
    '125': 2,
    '250': 0,
    '500': -1,
    '1k': 0,
    '2k': 2,
    '4k': 3,
    '8k': 4,
    '16k': 3
  }
};

eq.setPreset(myCustomPreset);
```

### 3. Sincronizar UI con el Ecualizador

```javascript
// Después de aplicar un preset, actualizar sliders
function syncUI() {
  const gains = eq.getBandGains();
  
  Object.keys(gains).forEach(bandId => {
    const slider = document.querySelector(`[data-band="${bandId}"]`);
    if (slider) {
      slider.value = gains[bandId];
    }
  });
  
  // Actualizar preamp
  const preampSlider = document.querySelector('#preamp');
  preampSlider.value = eq.getPreampGainDb();
}

// Llamar después de setPreset()
eq.setPreset(equalizerPresets.rock);
syncUI();
```

### 4. Análisis de Frecuencia en Tiempo Real

```javascript
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;

// Conectar después del ecualizador
eq.output.connect(analyser);

const dataArray = new Uint8Array(analyser.frequencyBinCount);

function draw() {
  requestAnimationFrame(draw);
  analyser.getByteFrequencyData(dataArray);
  
  // Dibujar en canvas
  // ... código de visualización
}

draw();
```

### 5. Cambio Suave de Presets

```javascript
async function smoothPresetChange(preset) {
  // Fade out
  eq.bypass();
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Cambiar preset
  eq.setPreset(preset);
  
  // Fade in
  eq.enable();
}

smoothPresetChange(equalizerPresets.jazz);
```

---

## 📱 Compatibilidad

✅ **Navegadores Modernos:**
- Chrome 34+
- Firefox 25+
- Safari 7+
- Edge 12+
- Opera 21+

✅ **Dispositivos Móviles:**
- iOS Safari 7+
- Chrome Android
- Samsung Internet

⚠️ **Nota:** Web Audio API requiere interacción del usuario antes de reproducir audio en móviles.

```javascript
// Reanudar contexto en móviles
audio.addEventListener('play', () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
});
```

---

## 🛠️ Desarrollo

### Compilar TypeScript

```bash
npm run build
# Genera equalizer.d.ts (archivo de tipos)
```

### Ejecutar ejemplos

```bash
# Ejemplo completo
npm run dev

# Ejemplo simple
npm run dev:simple
```

---

## 📄 Licencia

MIT License - Libre para uso personal y comercial

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras bugs o tienes ideas para mejoras:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📞 Soporte

¿Preguntas? ¿Problemas?

- 📧 Email: tu-email@ejemplo.com
- 🐛 Issues: [GitHub Issues](https://github.com/tuusuario/audio-equalizer-library/issues)
- 📖 Documentación: Este README

---

## 🎓 Recursos Adicionales

- [Web Audio API - MDN](https://developer.mozilla.org/es/docs/Web/API/Web_Audio_API)
- [BiquadFilterNode - MDN](https://developer.mozilla.org/es/docs/Web/API/BiquadFilterNode)
- [Teoría de Ecualización](https://en.wikipedia.org/wiki/Equalization_(audio))

---

<div align="center">

**Hecho con ❤️ para la comunidad de desarrollo web**

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub! ⭐

</div>
