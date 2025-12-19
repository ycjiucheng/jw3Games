import React from 'react';
import { Player } from '../types/game';
import { Heart, Zap, Shield, Wind, Brain, Sparkles, Smile, Sun, Clock } from 'lucide-react';

export const StatusPanel: React.FC<{ player: Player, days: number, actionsLeft: number }> = ({ player, days, actionsLeft }) => {
  return (
    <div className="bg-jx3-paper p-4 rounded border border-jx3-primary mb-4 shadow-inner relative">
      <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none font-title text-6xl text-jx3-primary">
          {player.sect}
      </div>
      <div className="flex justify-between items-center mb-2 border-b border-jx3-primary/30 pb-2 relative z-10">
        <h2 className="font-title text-xl text-jx3-primary flex items-baseline gap-2">
            {player.name} 
            <span className="text-sm text-jx3-ink/70 font-serif">[{player.title}]</span>
        </h2>
        <div className="flex gap-4">
             <div className="flex items-center gap-1 text-sm font-bold text-jx3-secondary">
                 <Sun className="w-4 h-4" /> 第 {days} 天
             </div>
             <div className="flex items-center gap-1 text-sm font-bold text-jx3-secondary">
                 <Clock className="w-4 h-4" /> 精力: {actionsLeft}/10
             </div>
             <span className="text-sm font-bold text-jx3-secondary">银两: {player.money}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm relative z-10">
        <div className="flex items-center gap-2" title="气血">
           <Heart className="w-4 h-4 text-red-600" />
           <div className="flex flex-col">
             <span className="text-xs text-jx3-ink/60">气血</span>
             <span className="font-bold">{player.stats.health}/{player.stats.maxHealth}</span>
           </div>
        </div>
        <div className="flex items-center gap-2" title="内力">
           <Zap className="w-4 h-4 text-blue-600" />
           <div className="flex flex-col">
             <span className="text-xs text-jx3-ink/60">内力</span>
             <span className="font-bold">{player.stats.energy}/{player.stats.maxEnergy}</span>
           </div>
        </div>
        <div className="flex items-center gap-2" title="根骨">
           <Shield className="w-4 h-4 text-amber-700" />
           <span>根骨: {player.stats.strength}</span>
        </div>
        <div className="flex items-center gap-2" title="身法">
           <Wind className="w-4 h-4 text-emerald-600" />
           <span>身法: {player.stats.agility}</span>
        </div>
        <div className="flex items-center gap-2" title="悟性">
           <Brain className="w-4 h-4 text-purple-600" />
           <span>悟性: {player.stats.intelligence}</span>
        </div>
        <div className="flex items-center gap-2" title="机缘">
           <Sparkles className="w-4 h-4 text-yellow-600" />
           <span>机缘: {player.stats.luck}</span>
        </div>
        <div className="flex items-center gap-2" title="魅力">
           <Smile className="w-4 h-4 text-pink-600" />
           <span>魅力: {player.stats.charm}</span>
        </div>
      </div>
    </div>
  );
};
