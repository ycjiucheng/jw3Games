import React from 'react';
import { GameEvent, Choice } from '../types/game';
import { useGameStore } from '../store/gameStore';

interface EventCardProps {
  event: GameEvent;
  onChoice: (choice: Choice) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onChoice }) => {
  const { actionsLeft, player } = useGameStore();

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-8 animate-in fade-in duration-500">
      <div className="w-full text-center border-b-2 border-jx3-secondary pb-4 mb-6 relative">
          <h1 className="font-title text-4xl text-jx3-primary tracking-widest">{event.title}</h1>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-jx3-secondary opacity-50"></div>
      </div>
      
      <p className="text-lg leading-relaxed text-center max-w-2xl mb-8 whitespace-pre-wrap font-serif text-jx3-ink">
        {event.description}
      </p>
      
      <div className="grid gap-4 w-full max-w-md">
        {event.choices.map((choice) => {
          const cost = choice.effects?.timePass ?? 1;
          const isEnergyAffordable = actionsLeft >= cost || cost === 0;
          
          let isMoneyAffordable = true;
          if (choice.effects?.money && choice.effects.money < 0) {
              isMoneyAffordable = (player?.money || 0) >= Math.abs(choice.effects.money);
          }

          const isRest = event.type === 'rest';
          const disabled = !isRest && (!isEnergyAffordable || !isMoneyAffordable);

          return (
          <button
            key={choice.id}
            onClick={() => onChoice(choice)}
            disabled={disabled}
            className={`group relative w-full py-4 px-6 border-2 transition-all duration-300 rounded overflow-hidden shadow-sm 
                ${disabled 
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60' 
                    : 'bg-jx3-paper border-jx3-primary/30 hover:border-jx3-secondary hover:bg-white hover:shadow-md'
                }`}
          >
            {!disabled && <div className="absolute inset-0 w-1 bg-jx3-secondary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>}
            <div className="flex justify-between items-center relative z-10">
                <span className={`font-bold text-lg ${disabled ? 'text-gray-400' : 'text-jx3-primary group-hover:text-jx3-secondary'}`}>{choice.text}</span>
                <div className="flex flex-col items-end gap-1">
                    {cost > 0 && !isRest && (
                        <span className={`text-xs font-bold px-2 py-1 rounded ${!isEnergyAffordable ? 'bg-red-100 text-red-500' : 'bg-jx3-primary/10 text-jx3-primary'}`}>
                            -{cost} 精力
                        </span>
                    )}
                    {choice.effects?.money && choice.effects.money < 0 && (
                        <span className={`text-xs font-bold px-2 py-1 rounded ${!isMoneyAffordable ? 'bg-red-100 text-red-500' : 'bg-yellow-100 text-yellow-700'}`}>
                            {choice.effects.money} 金
                        </span>
                    )}
                </div>
            </div>
            {choice.description && (
                <span className={`block text-xs mt-1 text-left ${disabled ? 'text-gray-400' : 'text-jx3-ink/50 group-hover:text-jx3-ink/70'}`}>{choice.description}</span>
            )}
          </button>
        )})}
      </div>
    </div>
  );
};
