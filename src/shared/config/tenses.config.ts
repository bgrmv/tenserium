export type TenseId =
  | 'present-simple'
  | 'present-continuous'
  | 'present-perfect'
  | 'present-perfect-continuous'
  | 'past-simple'
  | 'past-continuous'
  | 'past-perfect'
  | 'past-perfect-continuous'
  | 'future-simple'
  | 'future-continuous'
  | 'future-perfect'
  | 'future-perfect-continuous';

export interface TenseConfig {
  id: TenseId;
  hotkey: `F${number}`;
  order: number;
}

export const TENSES: TenseConfig[] = [
  { id: 'present-simple', hotkey: 'F1', order: 1 },
  { id: 'present-continuous', hotkey: 'F2', order: 2 },
  { id: 'present-perfect', hotkey: 'F3', order: 3 },
  { id: 'present-perfect-continuous', hotkey: 'F4', order: 4 },
  { id: 'past-simple', hotkey: 'F5', order: 5 },
  { id: 'past-continuous', hotkey: 'F6', order: 6 },
  { id: 'past-perfect', hotkey: 'F7', order: 7 },
  { id: 'past-perfect-continuous', hotkey: 'F8', order: 8 },
  { id: 'future-simple', hotkey: 'F9', order: 9 },
  { id: 'future-continuous', hotkey: 'F10', order: 10 },
  { id: 'future-perfect', hotkey: 'F11', order: 11 },
  { id: 'future-perfect-continuous', hotkey: 'F12', order: 12 },
];
