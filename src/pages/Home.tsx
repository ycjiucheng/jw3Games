import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Layout } from '../components/Layout';
import { Scroll, Sword, RotateCcw, Trophy, X } from 'lucide-react';
import { achievements } from '../data/achievements';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { player, loadGame, resetGame } = useGameStore();
  const [showAchievements, setShowAchievements] = useState(false);

  const handleNewGame = () => {
    resetGame();
    navigate('/create');
  };

  const handleContinue = () => {
    loadGame();
    if (player) {
      navigate('/game');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full flex-1">
        <h1 className="font-title text-6xl md:text-8xl text-jx3-primary mb-2 tracking-widest text-shadow">剑网三</h1>
        <h2 className="font-serif text-2xl md:text-3xl text-jx3-secondary mb-12 tracking-wider">江湖模拟器</h2>
        
        <div className="flex flex-col gap-6 w-full max-w-xs">
          {player && (
            <button
              onClick={handleContinue}
              className="flex items-center justify-center gap-2 py-4 px-8 bg-jx3-primary text-white rounded shadow-lg hover:bg-jx3-primary/90 transition-all text-xl font-bold border-2 border-jx3-gold"
            >
              <Sword className="w-5 h-5" />
              继续江湖路
            </button>
          )}
          
          <button
            onClick={handleNewGame}
            className="flex items-center justify-center gap-2 py-4 px-8 bg-jx3-paper text-jx3-primary border-2 border-jx3-primary rounded shadow-lg hover:bg-white transition-all text-xl font-bold"
          >
            <Scroll className="w-5 h-5" />
            初入江湖
          </button>

          <button
            onClick={() => setShowAchievements(true)}
            className="flex items-center justify-center gap-2 py-3 px-8 bg-white text-jx3-secondary border border-jx3-secondary/50 rounded shadow hover:bg-gray-50 transition-all font-bold"
          >
            <Trophy className="w-5 h-5" />
            江湖成就
          </button>

          {player && (
             <button
                onClick={() => {
                    if(confirm("确定要重置存档吗？")) {
                        resetGame();
                    }
                }}
                className="flex items-center justify-center gap-2 py-2 px-8 text-jx3-ink/50 hover:text-jx3-accent text-sm"
             >
                 <RotateCcw className="w-4 h-4" />
                 重置存档
             </button>
          )}
        </div>
        
        <div className="mt-16 text-jx3-ink/40 text-sm">
          <p>© 2025 JX3 Fan Game. Powered by React & Zustand.</p>
        </div>
      </div>

      {showAchievements && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-jx3-paper w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-lg shadow-2xl border-2 border-jx3-primary flex flex-col animate-in fade-in zoom-in duration-200">
             <div className="flex justify-between items-center p-6 border-b border-jx3-primary/20 bg-jx3-primary/5">
                <h3 className="font-title text-3xl text-jx3-primary flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-jx3-gold" /> 江湖成就
                </h3>
                <button onClick={() => setShowAchievements(false)} className="text-jx3-ink/50 hover:text-jx3-accent transition-colors">
                    <X className="w-8 h-8" />
                </button>
             </div>
             <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {Object.values(achievements).map(ach => {
                   const unlocked = player?.achievements?.includes(ach.id) || false;
                   return (
                     <div key={ach.id} className={`p-4 border-2 rounded-lg flex items-center gap-4 transition-all ${unlocked ? 'border-jx3-gold bg-amber-50 shadow-md' : 'border-gray-200 bg-gray-50 opacity-60 grayscale'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${unlocked ? 'bg-jx3-gold text-white' : 'bg-gray-200 text-gray-400'}`}>
                            {unlocked ? '🏆' : '?'}
                        </div>
                        <div>
                           <h4 className={`font-bold text-lg ${unlocked ? 'text-jx3-primary' : 'text-gray-500'}`}>{ach.title}</h4>
                           <p className="text-sm text-jx3-ink/70">{ach.description}</p>
                           {unlocked && <span className="text-xs text-jx3-gold font-bold mt-1 block">已达成</span>}
                        </div>
                     </div>
                   )
                })}
             </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
