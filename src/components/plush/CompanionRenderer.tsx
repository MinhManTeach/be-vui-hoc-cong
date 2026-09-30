import React from 'react';
import { ALL_PLUSH_FRIENDS } from '../../data/plushFriends';
import { PlushFriendRenderer } from './PlushFriendRenderer';
import { sound } from '../../utils/sound';

interface CompanionRendererProps {
  companionId: string | null;
  size?: number; // default 56
  showBadge?: boolean;
  canSpeakOnClick?: boolean;
  className?: string;
}

export const CompanionRenderer: React.FC<CompanionRendererProps> = ({
  companionId,
  size = 56,
  showBadge = true,
  canSpeakOnClick = true,
  className = '',
}) => {
  if (!companionId) return null;

  const friend = ALL_PLUSH_FRIENDS.find((f) => f.id === companionId);
  if (!friend) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canSpeakOnClick) return;

    sound.playTap();
    const randomEncouragement =
      friend.encouragements[Math.floor(Math.random() * friend.encouragements.length)];
    sound.speak(`${friend.name} động viên con: ${randomEncouragement}`, {
      eventType: 'UI_CLICK',
      forceReplay: true,
    });
  };

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex flex-col items-center select-none cursor-pointer transition-transform hover:scale-105 active:scale-95 ${className}`}
      title={`${friend.name} - Bạn đồng hành`}
    >
      <div className="relative">
        <PlushFriendRenderer plushId={friend.id} size={size} animationState="happy" />

        {showBadge && (
          <div className="absolute -bottom-1 -right-1 bg-amber-400 border border-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-sm text-amber-950 flex items-center gap-0.5">
            <span>⭐</span>
            <span className="hidden sm:inline">Bạn Thân</span>
          </div>
        )}
      </div>
    </div>
  );
};
