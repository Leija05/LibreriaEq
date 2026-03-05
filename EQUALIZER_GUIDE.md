# Librería de ecualizador reutilizable

Este módulo (`equalizer.ts`) te permite montar un ecualizador de 10 bandas con Web Audio API para usarlo en apps web, desktop (Electron) o híbridas.

## 1) Crear una instancia

```ts
import { EqualizerEngine, equalizerPresets } from './equalizer';

const audio = new Audio('https://ejemplo.com/song.mp3');
audio.crossOrigin = 'anonymous';

const context = new AudioContext();
const source = context.createMediaElementSource(audio);
const eq = new EqualizerEngine(context);

source.connect(eq.input);
eq.connect(context.destination);
```

## 2) Mover bandas desde sliders

```ts
eq.setBandGain('64', 5);   // +5 dB
eq.setBandGain('1k', -2);  // -2 dB
```

Rango recomendado por banda: `-12dB` a `+12dB`.

## 3) Aplicar presets

```ts
eq.setPreset(equalizerPresets.bassBoost);
```

## 4) Guardar configuración por usuario

```ts
const gains = eq.getBandGains();
localStorage.setItem('eq-gains', JSON.stringify(gains));
```

## 5) Restaurar configuración

```ts
const saved = localStorage.getItem('eq-gains');
if (saved) {
  const parsed = JSON.parse(saved) as Record<string, number>;
  for (const [band, gain] of Object.entries(parsed)) {
    eq.setBandGain(band, gain);
  }
}
```

## 6) Integración rápida para `<audio>`

Si quieres crear todo en una sola llamada:

```ts
import { createMediaElementEqualizer } from './equalizer';

const context = new AudioContext();
const audio = document.querySelector('audio')!;
const eq = createMediaElementEqualizer(context, audio);
```

## Recomendaciones para usar en cualquier app de música

- Exponer un wrapper propio (`MusicEqualizerService`) para desacoplar UI y audio engine.
- Sincronizar presets + gains en backend para que el usuario mantenga su perfil.
- Usar `context.resume()` cuando el usuario dé play (autoplay policies del navegador).
- En móvil, inicializar el `AudioContext` después de un gesto táctil.

## 7) Ejemplo real: app separada con Vite

En este repositorio tienes una app de ejemplo en `example-app/` que consume la librería mediante un módulo ESM (`equalizer.browser.js`).

```bash
cd example-app
python3 -m http.server 5173
```

Luego abre `http://localhost:5173` en el navegador.

Esto levanta un reproductor simple con:

- selector de presets (`equalizerPresets`)
- preamp global
- sliders por banda conectados a `setBandGain`
- opción para subir una canción local (`<input type="file" accept="audio/*">`) y reproducirla al instante
