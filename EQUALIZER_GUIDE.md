# Guía Rápida del Ecualizador

Esta es una guía de referencia rápida. Para documentación completa, ver [README.md](README.md)

---

## 🚀 Uso Básico

### 1) Crear una instancia

```javascript
import { EqualizerEngine } from './equalizer.browser.js';

const audio = document.querySelector('audio');
const context = new AudioContext();
const source = context.createMediaElementSource(audio);
const eq = new EqualizerEngine(context);

source.connect(eq.input);
eq.connect(context.destination);
```

### 2) Ajustar bandas

```javascript
eq.setBandGain('64', 5);   // +5 dB en 64Hz
eq.setBandGain('1k', -2);  // -2 dB en 1kHz
```

Rango: `-12dB` a `+12dB` por banda.

### 3) Aplicar presets

```javascript
import { equalizerPresets } from './equalizer.browser.js';

eq.setPreset(equalizerPresets.bassBoost);
eq.setPreset(equalizerPresets.rock);
eq.setPreset(equalizerPresets.jazz);
```

**Presets disponibles:**
- `flat` - Sin cambios
- `bassBoost` - Graves potentes
- `trebleBoost` - Agudos brillantes
- `vocalBoost` - Realce de voces
- `electronic` - Música electrónica
- `rock` - Rock y metal
- `jazz` - Jazz y blues
- `classical` - Música clásica
- `pop` - Pop moderno
- `hipHop` - Hip-hop y trap
- `acoustic` - Música acústica
- `podcast` - Voz hablada
- `latin` - Música latina

### 4) Control de Preamp

```javascript
eq.setPreampGain(3);              // +3dB
const preamp = eq.getPreampGainDb();  // Obtener valor actual
```

### 5) Guardar configuración

```javascript
const gains = eq.getAllGains();
localStorage.setItem('eq-config', JSON.stringify(gains));
```

### 6) Restaurar configuración

```javascript
const saved = localStorage.getItem('eq-config');
if (saved) {
  const config = JSON.parse(saved);
  eq.setAllGains(config.bands);
  eq.setPreampGain(config.preamp);
}
```

### 7) Resetear ecualizador

```javascript
eq.reset();  // Todo a 0dB (flat)
```

### 8) Bypass (desactivar temporalmente)

```javascript
eq.bypass();           // Desactivar
eq.enable();           // Reactivar
if (eq.isBypassed()) {
  console.log('EQ desactivado');
}
```

### 9) Visualización

```javascript
const response = eq.getFrequencyResponse();

// response.frequencies = array de frecuencias (20Hz - 20kHz)
// response.magnitudes = array de magnitudes (factor lineal)
// response.phases = array de fases

// Convertir magnitud a dB
for (let i = 0; i < response.magnitudes.length; i++) {
  const db = 20 * Math.log10(response.magnitudes[i]);
  // Usar para graficar
}
```

### 10) Atajo para `<audio>`

```javascript
import { createMediaElementEqualizer } from './equalizer.browser.js';

const context = new AudioContext();
const audio = document.querySelector('audio');
const eq = createMediaElementEqualizer(context, audio);

// ¡Listo para usar!
```

---

## 📊 Bandas de Frecuencia

| ID | Frecuencia | Tipo de Sonido |
|----|-----------|----------------|
| `'32'` | 32 Hz | Sub-graves (vibración) |
| `'64'` | 64 Hz | Graves profundos (bombo) |
| `'125'` | 125 Hz | Graves (bajo) |
| `'250'` | 250 Hz | Graves medios |
| `'500'` | 500 Hz | Medios bajos |
| `'1k'` | 1 kHz | Medios (voces fundamentales) |
| `'2k'` | 2 kHz | Medios altos (presencia vocal) |
| `'4k'` | 4 kHz | Agudos (claridad, sibilantes) |
| `'8k'` | 8 kHz | Agudos altos (brillo) |
| `'16k'` | 16 kHz | Súper agudos (aire) |

---

## 🎨 Crear Preset Personalizado

```javascript
const miPreset = {
  name: 'Mi Sonido',
  gains: {
    '32': 6,    // +6dB
    '64': 4,    // +4dB
    '125': 2,   // +2dB
    '250': 0,   // 0dB (sin cambio)
    '500': -1,  // -1dB
    '1k': 0,
    '2k': 2,
    '4k': 3,
    '8k': 4,
    '16k': 3
  }
};

eq.setPreset(miPreset);
```

---

## 🔄 Sincronizar UI con Ecualizador

```javascript
function actualizarSliders() {
  const gains = eq.getBandGains();
  
  // Actualizar cada slider
  Object.keys(gains).forEach(bandId => {
    const slider = document.querySelector(`[data-band="${bandId}"]`);
    if (slider) {
      slider.value = gains[bandId];
      
      // Actualizar label
      const label = slider.nextElementSibling;
      if (label) {
        label.textContent = gains[bandId].toFixed(1) + ' dB';
      }
    }
  });
}

// Llamar después de cambiar preset
eq.setPreset(equalizerPresets.rock);
actualizarSliders();
```

---

## 📱 Compatibilidad con Móviles

En dispositivos móviles, el AudioContext necesita ser activado por un gesto del usuario:

```javascript
audio.addEventListener('play', () => {
  if (context.state === 'suspended') {
    context.resume();
  }
});
```

---

## 🧹 Limpieza de Recursos

Cuando termines de usar el ecualizador:

```javascript
eq.destroy();
context.close();
```

---

## 📁 Estructura de Archivos

```
/
├── equalizer.ts              # Código fuente TypeScript
├── equalizer.browser.js      # Versión JavaScript para navegadores
├── package.json              # Configuración NPM
├── README.md                 # Documentación completa
├── EQUALIZER_GUIDE.md        # Esta guía rápida
├── example-app/              # Ejemplo completo con visualizador
│   ├── index.html
│   ├── main.js
│   ├── styles.css
│   └── equalizer.browser.js
└── simple-example/           # Ejemplo minimalista
    ├── index.html
    ├── script.js
    └── style.css
```

---

## ⚡ Ejemplos Incluidos

### Ejemplo 1: App Completa (`/example-app/`)
- Reproductor con playlist
- Visualizador de frecuencias en tiempo real
- 12 presets
- Control completo de todas las bandas
- Soporte para archivos locales

**Ejecutar:**
```bash
cd example-app
python3 -m http.server 5173
```

### Ejemplo 2: Página Simple (`/simple-example/`)
- Integración básica
- Código limpio y comentado
- Ideal para aprender

**Ejecutar:**
```bash
cd simple-example
python3 -m http.server 5174
```

---

## 🎯 Consejos de Uso

### Para Música
- **Graves potentes:** Sube 32Hz, 64Hz y 125Hz
- **Voces claras:** Sube 1kHz y 2kHz
- **Brillo:** Sube 8kHz y 16kHz
- **Calidez:** Sube un poco los medios-bajos (250Hz-500Hz)

### Para Podcast/Voz
- Reduce graves (32Hz-125Hz) para quitar ruido
- Sube medios (1kHz-2kHz) para claridad
- Reduce agudos extremos (16kHz) para suavizar

### Para Video/Streaming
- Usa el preset `podcast` para voz hablada
- Usa el preset `bassBoost` para efectos dramáticos
- El preamp ayuda a nivelar volumen general

---

## 🐛 Solución de Problemas

### No se escucha audio
1. Verifica que `context.state !== 'suspended'`
2. Llama a `context.resume()` después de interacción del usuario
3. Verifica las conexiones: `source -> eq.input` y `eq.output -> destination`

### El ecualizador no tiene efecto
1. Verifica que no esté en bypass: `eq.isBypassed()`
2. Prueba valores extremos (+12dB) para confirmar que funciona
3. Usa `eq.reset()` y empieza de nuevo

### Problemas en móviles
1. Siempre resume el contexto en el evento 'play'
2. No inicialices AudioContext hasta que el usuario interactúe
3. Usa `crossorigin="anonymous"` en elementos `<audio>`

---

## 📚 Más Información

Ver [README.md](README.md) para:
- API completa con todos los métodos
- Ejemplos de integración con React, Vue
- Casos de uso avanzados
- Información de licencia y contribuciones

---

**¡Disfruta ecualizando tu audio! 🎵**
