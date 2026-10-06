export interface Sticker {
  id: string;
  name: string;
  description: string;
  unlockSource: 'daily_adventure';
  assetReference: string;
}
/** Placeholder artwork references, with rewards disclosed in the adventure definition. */
export const STICKERS: readonly Sticker[] = [
  { id: 'sticker_bunny', name: 'Thỏ vui vẻ', description: 'Một người bạn cùng học.', unlockSource: 'daily_adventure', assetReference: 'emoji:🐰' },
  { id: 'sticker_flower', name: 'Hoa nhỏ', description: 'Bông hoa của chuyến khám phá.', unlockSource: 'daily_adventure', assetReference: 'emoji:🌼' },
  { id: 'sticker_apple', name: 'Táo đỏ', description: 'Quả táo học tập.', unlockSource: 'daily_adventure', assetReference: 'emoji:🍎' },
  { id: 'sticker_train', name: 'Tàu nhỏ', description: 'Chuyến tàu vui.', unlockSource: 'daily_adventure', assetReference: 'emoji:🚂' },
  { id: 'sticker_rainbow', name: 'Cầu vồng', description: 'Màu sắc của khám phá.', unlockSource: 'daily_adventure', assetReference: 'emoji:🌈' },
  { id: 'sticker_rocket', name: 'Tên lửa', description: 'Bay cùng kiến thức mới.', unlockSource: 'daily_adventure', assetReference: 'emoji:🚀' },
];
