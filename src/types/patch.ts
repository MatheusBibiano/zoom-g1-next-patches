// TypeScript type representing a complete guitar patch persisted in the SQLite database
export type Patch = {
  id: number;
  songName: string;
  artist: string;
  patchLevel: number | null;
  compType: string | null;
  compPrm: number | null;
  driveType: string | null;
  driveGain: number | null;
  eqLow: number | null;
  eqMid: number | null;
  eqHigh: number | null;
  znrType: string | null;
  znrPrm: number | null;
  modType: string | null;
  modPrm1: number | null;
  modRate: number | null;
  delayType: string | null;
  delayPrm1: number | null;
  delayTime: number | null;
  reverbType: string | null;
  reverbPrm1: number | null;
  reverbDecay: number | null;
  createdAt: string;
  updatedAt: string;
};

// Represents the data sent when creating or updating a patch
export type PatchFormData = Omit<Patch, 'id' | 'createdAt' | 'updatedAt'>;

// Represents the snake_case JSON format for importing and exporting patches
export type PatchJson = {
  song_name: string;
  artist: string;
  patch_level: number | null;
  comp_type: string | null;
  comp_prm: number | null;
  drive_type: string | null;
  drive_gain: number | null;
  eq_low: number | null;
  eq_mid: number | null;
  eq_high: number | null;
  znr_type: string | null;
  znr_prm: number | null;
  mod_type: string | null;
  mod_prm1: number | null;
  mod_rate: number | null;
  delay_type: string | null;
  delay_prm1: number | null;
  delay_time: number | null;
  reverb_type: string | null;
  reverb_prm1: number | null;
  reverb_decay: number | null;
};

