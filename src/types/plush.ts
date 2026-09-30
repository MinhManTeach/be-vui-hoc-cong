import { WorldId } from './math';

export interface PlushFriend {
  id: string;
  name: string;
  species: string;
  title: string;
  personality: string;
  worldId: WorldId;
  checkpointId: string;
  requiredLevel: number;
  worldName: string;
  themeColor: string;
  badgeName: string;
  greeting: string;
  encouragements: string[];
  favoriteFoodOrToy: string;
  miniGamePrompt: string;
  roomSlot: {
    x: number; // percentage in room (0-100)
    y: number; // percentage in room (0-100)
    spotName: string;
  };
}

export interface PlushCollectionSet {
  id: string;
  name: string;
  description: string;
  plushIds: string[];
  badgeIcon: string;
  badgeName: string;
}
