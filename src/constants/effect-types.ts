// Predefined effect lists for each module on the Zoom G1 pedal
export const COMP_EFX_TYPES = [
  'OFF',
  'Compressor (C)',
  'Auto Wah (A)',
  'Booster (b)',
  'Tremolo (t)',
  'Phaser (P)',
  'Ring Mod (r)',
  'Slow Attack (S)',
  'Pedal Vox (u)',
  'Pedal Cry (c)',
] as const;

export const DRIVE_TYPES = [
  'OFF',
  'FD COMBO (Fd)',
  'VX COMBO (u∥)',
  'US BLUES (bL)',
  'BG CRUNCH (bG)',
  'HW STACK (HⱯ)',
  'MS CRUNCH (ΠC)',
  'MS DRIVE (Πd)',
  'PV DRIVE (Pu)',
  'DZ DRIVE (dd)',
  'BG DRIVE (bd)',
  'OVER DRIVE (od)',
  'GOVERNOR (Gu)',
  'SQUEAK (Sq)',
  'FUZZ SMILE (FS)',
  'HOT BOX (Hb)',
  'Z CLEAN (≡C)',
  'Z MP1 (≡Π)',
  'Z NEOS (≡n)',
  'LEAD (Ld)',
  'Extreme DS (Ed)',
  'Aco. Sim. (Ac)',
] as const;

export const ZNR_AMP_TYPES = [
  'OFF',
  'ZNR',
  'Combo & ZNR (C)',
  'Bright Combo & ZNR (b)',
  'Stack & ZNR (S)',
] as const;

export const MODULATION_TYPES = [
  'OFF',
  'Chorus (C)',
  'Ensemble (E)',
  'Flanger (F)',
  'Step (S)',
  'Pitch Shift (P)',
  'Mono Pitch (Π)',
  'HPS (Harmonized Pitch Shifter) (H)',
  'Vibrato (u)',
  'Pitch Bend (b)',
  'Delay (d)',
] as const;

export const DELAY_TYPES = [
  'OFF',
  'Delay (d)',
  'Tape Echo (t)',
  'Analog Delay (A)',
  'Ping Pong (P)',
] as const;

export const REVERB_TYPES = [
  'OFF',
  'Hall (H)',
  'Room (r)',
  'Spring (S)',
  'Arena (A)',
  'Tiled Room (t)',
] as const;
