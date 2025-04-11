import * as Tone from "tone";

let synth: Tone.Synth | null = null;
let plucky: Tone.PluckSynth | null = null;
let membrane: Tone.MembraneSynth | null = null;
let initialized = false;
let lastPlayTime = 0; // Track the last play time globally

// Initialize audio context and synthesizers
export const initializeAudio = () => {
  if (initialized) return;
  
  // Start audio context
  Tone.start();
  
  // Create synthesizers
  synth = new Tone.Synth({
    oscillator: {
      type: "sine"
    },
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.1
    }
  }).toDestination();
  
  plucky = new Tone.PluckSynth({
    attackNoise: 1,
    dampening: 4000,
    resonance: 0.9
  }).toDestination();
  
  membrane = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0.01,
      release: 1.4,
      attackCurve: "exponential"
    }
  }).toDestination();
  
  initialized = true;
  lastPlayTime = Tone.now();
};

// Get a safe time that's guaranteed to be after the last play time
const getSafeTime = () => {
  const now = Tone.now();
  // Ensure the new time is at least 10ms after the last play time
  const safeTime = Math.max(now, lastPlayTime + 0.01);
  lastPlayTime = safeTime;
  return safeTime;
};

// Play pop sound with random pitch
export const playPopSound = () => {
  if (!initialized || !plucky) return;
  
  const now = getSafeTime();
  
  // Generate a random note in a pleasing range
  const notes = ["C5", "D5", "E5", "G5", "A5", "C6"];
  const randomNote = notes[Math.floor(Math.random() * notes.length)];
  
  // Play a short pluck sound
  plucky.triggerAttackRelease(randomNote, "16n", now);
  
  // Occasionally add a synth sound for variety with a guaranteed later start time
  if (Math.random() > 0.7 && synth) {
    const synthTime = getSafeTime(); // Get another safe time for the synth
    synth.triggerAttackRelease(randomNote, "32n", synthTime);
  }
};

// Play swipe sound effect
export const playSwipeSound = () => {
  if (!initialized) return;
  
  const baseTime = getSafeTime();
  
  // Play a swoosh sound using membrane synth
  if (membrane) {
    membrane.volume.value = -10; // Lower volume for swipe
    membrane.triggerAttackRelease("C2", "16n", baseTime);
  }
  
  // Add some high notes for the cutting effect with guaranteed increasing times
  if (synth) {
    synth.volume.value = -15;
    const time1 = getSafeTime(); // Get a safe time for the first note
    synth.triggerAttackRelease("G6", "32n", time1);
    
    const time2 = getSafeTime(); // Get a safe time for the second note
    synth.triggerAttackRelease("A6", "32n", time2);
  }
};

// Play multiple bubble pops in sequence
export const playMultiPopSound = (count: number) => {
  if (!initialized || !plucky || !synth) return;
  
  const notes = ["C5", "D5", "E5", "G5", "A5", "C6"];
  
  // Play a sequence of pops based on count (max 5 for performance)
  const popCount = Math.min(count, 5);
  
  for (let i = 0; i < popCount; i++) {
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    
    // Get a safe time for each plucky sound
    const pluckyTime = getSafeTime();
    plucky.triggerAttackRelease(randomNote, "16n", pluckyTime);
    
    // Add occasional synth for variety with a guaranteed later start time
    if (i % 2 === 0) {
      const synthTime = getSafeTime(); // Get another safe time for the synth
      synth.triggerAttackRelease(randomNote, "32n", synthTime);
    }
  }
};