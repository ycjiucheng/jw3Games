import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { events } from '../data/events';
import { Layout } from '../components/Layout';
import { StatusPanel } from '../components/StatusPanel';
import { EventCard } from '../components/EventCard';
import { ScrollText } from 'lucide-react';

export const GameView: React.FC = () => {
  const { player, currentEventId, makeChoice, isGameOver, gameEnding, resetGame, history, days, actionsLeft, gameScore, gameRank } = useGameStore();
  const logEndRef = useRef<HTMLDivElement>(null);
  
  // 自动滚动到底部
  useEffect(() => {
      if (logEndRef.current) {
          logEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [history]);

  if (!player) return <div>Loading...</div>; // Should redirect to home

  const currentEvent = events[currentEventId];

  if (isGameOver) {
      return (
          <Layout>
              <div className="text-center py-20 flex flex-col items-center justify-center h-full">
                  <h1 className="font-title text-6xl text-jx3-accent mb-4">江湖路断</h1>
                  <p className="text-2xl mb-4 font-serif text-jx3-ink">{gameEnding || "大侠请重新来过"}</p>
                  
                  <div className="text-xl font-bold text-jx3-primary mb-8">
                      <p>综合评分: {gameScore}</p>
                      <p className="text-2xl mt-2">江湖评价: <span className="text-jx3-accent">{gameRank}</span></p>
                  </div>
                  
                  <div className="bg-jx3-paper p-6 rounded-lg shadow-inner max-w-md w-full mb-8 border border-jx3-primary/20">
                      <h3 className="font-bold mb-4 border-b border-jx3-primary/20 pb-2">最终属性</h3>
                      <div className="grid grid-cols-2 gap-4 text-left">
                          <div>称号: {player.title}</div>
                          <div>门派: {player.sect}</div>
                          <div>银两: {player.money}</div>
                          <div>成就: {player.achievements.length}</div>
                          <div>存活: {days} 天</div>
                      </div>
                  </div>

                  <button onClick={resetGame} className="px-8 py-3 bg-jx3-primary text-white rounded font-bold text-lg hover:bg-jx3-primary/90 transition-colors shadow-lg">重新开始</button>
              </div>
          </Layout>
      )
  }

  if (!currentEvent) {
      return (
          <Layout>
              <div className="flex flex-col items-center justify-center h-full">
                  <h1 className="text-xl font-bold text-red-600 mb-4">江湖迷路了</h1>
                  <p>未找到事件: {currentEventId}</p>
                  <button onClick={resetGame} className="mt-4 px-4 py-2 bg-jx3-primary text-white rounded">返回首页</button>
              </div>
          </Layout>
      )
  }

  return (
    <Layout>
      <StatusPanel player={player} days={days} actionsLeft={actionsLeft} />
      
      <div className="flex-1 flex flex-col min-h-0">
          <EventCard event={currentEvent} onChoice={makeChoice} />
      </div>

      <div className="mt-4 pt-4 border-t border-jx3-primary/20 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2 text-jx3-ink/60">
            <ScrollText className="w-4 h-4" />
            <span className="text-sm font-bold">江湖传闻</span>
        </div>
        <div className="h-32 overflow-y-auto text-sm space-y-2 pr-2 scrollbar-thin bg-white/30 rounded p-2 shadow-inner">
            {history.map((log, idx) => (
                <div key={idx} className="text-jx3-ink/80 border-b border-dashed border-jx3-primary/10 pb-1 last:border-0">
                    <span className="text-jx3-primary/50 mr-2">[{idx + 1}]</span>
                    {log.text}
                </div>
            ))}
            <div ref={logEndRef} />
        </div>
      </div>
    </Layout>
  );
};
