/**
 * Brownie's voice, made by the browser itself (Web Audio): no audio files, no libraries.
 *
 * Browsers only allow sound after the visitor has clicked, tapped or pressed a key on the page,
 * so before that these calls quietly do nothing. A mute choice is remembered between visits.
 */

type Kind = "woof" | "yip";

const KEY = "sarana_sound";
const listeners = new Set<() => void>();
let ctx: AudioContext | null = null;

export function getSoundOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // storage can be blocked; the choice then lasts only for this visit
  }
  listeners.forEach((fn) => fn());
}

export function subscribeSound(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) onChange();
  };
  addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    removeEventListener("storage", onStorage);
  };
}

function audio(): AudioContext | null {
  if (!navigator.userActivation?.hasBeenActive) return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * One bark. "woof" is a low, round bark; "yip" is a short, bright one. `pitch` shifts it up or down,
 * so two woofs in a row can sound like two different barks.
 */
export function playBark(kind: Kind = "woof", pitch = 1) {
  if (!getSoundOn()) return;
  const ac = audio();
  if (!ac) return;

  const t = ac.currentTime + 0.01;
  const woof = kind === "woof";
  const length = woof ? 0.2 : 0.11;

  // Voice: a buzzing wave that falls in pitch, shaped by a filter that moves like an "ow" vowel.
  const voice = ac.createOscillator();
  voice.type = "sawtooth";
  voice.frequency.setValueAtTime((woof ? 470 : 840) * pitch, t);
  voice.frequency.exponentialRampToValueAtTime((woof ? 190 : 560) * pitch, t + length);

  const vowel = ac.createBiquadFilter();
  vowel.type = "bandpass";
  vowel.Q.value = 2.2;
  vowel.frequency.setValueAtTime(woof ? 720 : 1250, t);
  vowel.frequency.linearRampToValueAtTime(woof ? 430 : 920, t + length);

  const level = ac.createGain();
  level.gain.setValueAtTime(0.0001, t);
  level.gain.exponentialRampToValueAtTime(woof ? 1.1 : 0.7, t + 0.012);
  level.gain.exponentialRampToValueAtTime(0.0001, t + length);

  voice.connect(vowel).connect(level).connect(ac.destination);
  voice.start(t);
  voice.stop(t + length + 0.03);

  // Breath: a very short puff of noise as the bark starts.
  const puffLength = 0.07;
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * puffLength), ac.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const puff = ac.createBufferSource();
  puff.buffer = buffer;
  const puffFilter = ac.createBiquadFilter();
  puffFilter.type = "bandpass";
  puffFilter.frequency.value = 1800;
  const puffLevel = ac.createGain();
  puffLevel.gain.setValueAtTime(0.0001, t);
  puffLevel.gain.exponentialRampToValueAtTime(0.35, t + 0.006);
  puffLevel.gain.exponentialRampToValueAtTime(0.0001, t + puffLength);
  puff.connect(puffFilter).connect(puffLevel).connect(ac.destination);
  puff.start(t);
}

/** "Woof woof!" Two barks, the second a little higher. */
export function playWoofWoof() {
  playBark("woof", 1);
  setTimeout(() => playBark("woof", 1.12), 250);
}
