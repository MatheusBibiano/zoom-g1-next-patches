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
