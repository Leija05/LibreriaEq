import { EqualizerEngine, equalizerPresets } from './equalizer.browser.js';

const player = document.querySelector('#player');
const presetSelect = document.querySelector('#preset');
const bandsContainer = document.querySelector('#bands');
const preampSlider = document.querySelector('#preamp');
const preampValue = document.querySelector('#preamp-value');
const localFileInput = document.querySelector('#local-file');
const trackName = document.querySelector('#track-name');
const trackArt = document.querySelector('#track-art');
const playlist = document.querySelector('#playlist');
const playBtn = document.querySelector('#play-btn');
const prevBtn = document.querySelector('#prev-btn');
const nextBtn = document.querySelector('#next-btn');
const progress = document.querySelector('#progress');
const currentTimeLabel = document.querySelector('#current-time');
const durationLabel = document.querySelector('#duration');
const uploadContentbox = document.querySelector('#upload-contentbox');
const resetBtn = document.querySelector('#reset-btn');
const bypassBtn = document.querySelector('#bypass-btn');
const visualizerCanvas = document.querySelector('#visualizer');

if (
  !player ||
  !presetSelect ||
  !bandsContainer ||
  !preampSlider ||
  !preampValue ||
  !localFileInput ||
  !trackName ||
  !trackArt ||
  !playlist ||
  !playBtn ||
  !prevBtn ||
  !nextBtn ||
  !progress ||
  !currentTimeLabel ||
  !durationLabel ||
  !uploadContentbox ||
  !resetBtn ||
  !bypassBtn ||
  !visualizerCanvas
) {
  throw new Error('No se encontraron elementos de la UI');
}

const context = new AudioContext();
const source = context.createMediaElementSource(player);
const eq = new EqualizerEngine(context);
source.connect(eq.input);
eq.connect(context.destination);

const bandOrder = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

const ICONS = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14l8-7-8-7zm9 0h3v14h-3z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 5v14l-8-7 8-7zM6 5h3v14H6z"/></svg>',
};

const DEFAULT_TRACK = {
  name: 'Demo remota (Hello.ogg)',
  src: 'https://upload.wikimedia.org/wikipedia/commons/4/45/En-us-hello.ogg',
  art: createArtDataUrl('HELLO'),
};

let queue = [DEFAULT_TRACK];
let currentIndex = 0;

// Configuración del visualizador
const ctx = visualizerCanvas.getContext('2d');
if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');

const analyser = context.createAnalyser();
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.8;
eq.output.connect(analyser);

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);
  
  analyser.getByteFrequencyData(dataArray);
  
  const width = visualizerCanvas.width;
  const height = visualizerCanvas.height;
  
  ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
  ctx.fillRect(0, 0, width, height);
  
  // Dibujar curva de respuesta del ecualizador
  const response = eq.getFrequencyResponse();
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for (let i = 0; i < response.frequencies.length; i++) {
    const freq = response.frequencies[i];
    const mag = response.magnitudes[i];
    const x = (Math.log10(freq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * width;
    const db = 20 * Math.log10(mag);
    const y = height / 2 - (db / 24) * height / 2;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  
  // Dibujar línea central (0dB)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
  
  // Dibujar barras de frecuencia
  const barWidth = width / bufferLength * 2.5;
  let barHeight;
  let x = 0;
  
  for (let i = 0; i < bufferLength; i++) {
    barHeight = (dataArray[i] / 255) * height * 0.8;
    
    const hue = (i / bufferLength) * 60 + 180;
    ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.6)`;
    ctx.fillRect(x, height - barHeight, barWidth, barHeight);
    
    x += barWidth + 1;
  }
  
  // Dibujar etiquetas de frecuencia
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Arial';
  ctx.textAlign = 'center';
  const freqLabels = [32, 64, 125, 250, 500, '1k', '2k', '4k', '8k', '16k'];
  const freqValues = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  
  freqLabels.forEach((label, idx) => {
    const freq = freqValues[idx];
    const xPos = (Math.log10(freq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * width;
    ctx.fillText(String(label), xPos, height - 5);
  });
}

drawVisualizer();

function createArtDataUrl(label) {
  const safeLabel = String(label).slice(0, 14);
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#22d3ee'/>
        <stop offset='100%' stop-color='#8b5cf6'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' rx='28' fill='url(#g)'/>
    <circle cx='160' cy='160' r='88' fill='rgba(2,6,23,.55)'/>
    <circle cx='160' cy='160' r='18' fill='#22d3ee'/>
    <text x='50%' y='88%' fill='#f8fafc' font-size='28' font-family='Arial' text-anchor='middle'>${safeLabel}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = String(total % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function parseSynchsafeInt(bytes) {
  return ((bytes[0] & 0x7f) << 21) | ((bytes[1] & 0x7f) << 14) | ((bytes[2] & 0x7f) << 7) | (bytes[3] & 0x7f);
}

function extractMp3Artwork(file) {
  if (!(file instanceof File) || !file.type.includes('audio')) {
    return Promise.resolve(null);
  }

  return file
    .arrayBuffer()
    .then((buffer) => {
      const bytes = new Uint8Array(buffer);
      if (bytes.length < 10 || String.fromCharCode(...bytes.slice(0, 3)) !== 'ID3') {
        return null;
      }

      const majorVersion = bytes[3];
      const tagSize = parseSynchsafeInt(bytes.slice(6, 10));
      let offset = 10;
      const limit = Math.min(bytes.length, 10 + tagSize);

      while (offset + 10 <= limit) {
        const frameId = String.fromCharCode(...bytes.slice(offset, offset + 4));
        if (!frameId.trim()) break;

        const frameSize =
          majorVersion === 4
            ? parseSynchsafeInt(bytes.slice(offset + 4, offset + 8))
            : (bytes[offset + 4] << 24) | (bytes[offset + 5] << 16) | (bytes[offset + 6] << 8) | bytes[offset + 7];

        if (frameSize <= 0 || offset + 10 + frameSize > bytes.length) break;

        if (frameId === 'APIC' || frameId === 'PIC') {
          const frameData = bytes.slice(offset + 10, offset + 10 + frameSize);
          const encoding = frameData[0] ?? 0;
          let cursor = 1;

          let mime = 'image/jpeg';
          if (frameId === 'APIC') {
            let mimeEnd = cursor;
            while (mimeEnd < frameData.length && frameData[mimeEnd] !== 0x00) mimeEnd++;
            mime = new TextDecoder('latin1').decode(frameData.slice(cursor, mimeEnd)) || mime;
            cursor = mimeEnd + 1;
          } else {
            const format = new TextDecoder('latin1').decode(frameData.slice(cursor, cursor + 3)).toLowerCase();
            mime = format === 'png' ? 'image/png' : 'image/jpeg';
            cursor += 3;
          }

          cursor += 1;
          if (encoding === 0 || encoding === 3) {
            while (cursor < frameData.length && frameData[cursor] !== 0x00) cursor++;
            cursor += 1;
          } else {
            while (cursor + 1 < frameData.length && !(frameData[cursor] === 0x00 && frameData[cursor + 1] === 0x00)) cursor += 2;
            cursor += 2;
          }

          const imageBytes = frameData.slice(cursor);
          if (!imageBytes.length) return null;
          const blob = new Blob([imageBytes], { type: mime });
          return URL.createObjectURL(blob);
        }

        offset += 10 + frameSize;
      }

      return null;
    })
    .catch(() => null);
}

function setPlayIcon(isPlaying) {
  playBtn.innerHTML = isPlaying ? ICONS.pause : ICONS.play;
}

prevBtn.innerHTML = ICONS.prev;
nextBtn.innerHTML = ICONS.next;
setPlayIcon(false);

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

  const output = document.createElement('span');
  output.className = 'band-value';
  output.textContent = '0 dB';

  const label = document.createElement('label');
  label.textContent = bandId;

  input.addEventListener('input', () => {
    const value = Number(input.value);
    output.textContent = `${value > 0 ? '+' : ''}${value} dB`;
    eq.setBandGain(bandId, value);
  });

  wrapper.append(label, input, output);
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
    const value = Number(gains[bandId] ?? 0);
    slider.value = String(value);
    const output = slider.parentElement?.querySelector('.band-value');
    if (output) output.textContent = `${value > 0 ? '+' : ''}${value} dB`;
  });
};

const syncPreampWithEngine = () => {
  const gain = Number(eq.getPreampGainDb().toFixed(1));
  preampSlider.value = String(gain);
  preampValue.textContent = `${gain > 0 ? '+' : ''}${gain}`;
};

function loadTrack(index) {
  const track = queue[index];
  if (!track) return;

  currentIndex = index;
  player.src = track.src;
  player.load();
  trackName.textContent = track.name;
  trackArt.src = track.art;
  trackArt.alt = `Portada de ${track.name}`;
  renderPlaylist();
}

function renderPlaylist() {
  playlist.innerHTML = '';
  queue.forEach((track, index) => {
    const item = document.createElement('li');
    item.className = index === currentIndex ? 'track active' : 'track';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'track-btn';
    button.innerHTML = `
      <img src="${track.art}" alt="" aria-hidden="true" />
      <span class="track-copy">
        <strong>${track.name}</strong>
        <small>${index === currentIndex ? 'Reproduciendo' : index > currentIndex ? 'Siguiente' : 'Anterior'}</small>
      </span>
    `;

    button.addEventListener('click', async () => {
      loadTrack(index);
      await startPlayback();
    });

    item.append(button);
    playlist.append(item);
  });
}

async function startPlayback() {
  if (context.state !== 'running') {
    await context.resume();
  }
  try {
    await player.play();
  } catch {
    setPlayIcon(false);
  }
}

function playNext() {
  if (!queue.length) return;
  const nextIndex = (currentIndex + 1) % queue.length;
  loadTrack(nextIndex);
  startPlayback();
}

function playPrev() {
  if (!queue.length) return;
  const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
  loadTrack(prevIndex);
  startPlayback();
}

presetSelect.addEventListener('change', () => {
  const selectedPreset = equalizerPresets[presetSelect.value];
  if (!selectedPreset) return;
  eq.setPreset(selectedPreset);
  syncSlidersWithEngine();
  syncPreampWithEngine();
});

preampSlider.addEventListener('input', () => {
  const gain = Number(preampSlider.value);
  preampValue.textContent = `${gain > 0 ? '+' : ''}${gain}`;
  eq.setPreampGain(gain);
});

localFileInput.addEventListener('change', async () => {
  const files = Array.from(localFileInput.files ?? []);
  if (!files.length) return;

  const uploadedTracks = await Promise.all(
    files.map(async (file) => {
      const artFromFile = await extractMp3Artwork(file);
      return {
        name: file.name,
        src: URL.createObjectURL(file),
        art: artFromFile ?? createArtDataUrl(file.name.replace(/\.[^/.]+$/, '').toUpperCase().slice(0, 10)),
      };
    })
  );

  const uploadedNames = uploadedTracks.map((track) => track.name).join(' · ');
  uploadContentbox.textContent = `${uploadedTracks.length} canción(es): ${uploadedNames}`;

  queue = [...queue, ...uploadedTracks];
  loadTrack(queue.length - uploadedTracks.length);
  startPlayback();
  localFileInput.value = '';
});

playBtn.addEventListener('click', async () => {
  if (player.paused) {
    await startPlayback();
    return;
  }
  player.pause();
});

nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);

player.addEventListener('play', () => setPlayIcon(true));
player.addEventListener('pause', () => setPlayIcon(false));
player.addEventListener('ended', playNext);

player.addEventListener('timeupdate', () => {
  const ratio = player.duration ? (player.currentTime / player.duration) * 100 : 0;
  progress.value = String(ratio);
  currentTimeLabel.textContent = formatTime(player.currentTime);
});

player.addEventListener('loadedmetadata', () => {
  durationLabel.textContent = formatTime(player.duration);
});

progress.addEventListener('input', () => {
  if (!player.duration) return;
  const target = (Number(progress.value) / 100) * player.duration;
  player.currentTime = target;
});

loadTrack(0);
renderPlaylist();
syncPreampWithEngine();
