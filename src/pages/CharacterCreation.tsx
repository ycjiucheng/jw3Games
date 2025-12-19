import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Layout } from '../components/Layout';
import { Sect } from '../types/game';
import { ChevronRight, Dices } from 'lucide-react';

const sects: { id: Sect; desc: string; color: string }[] = [
  { id: '纯阳', desc: '以气御剑，化三清。主修根骨与内力。', color: 'text-blue-700' },
  { id: '万花', desc: '妙手仁心，点穴截脉。主修悟性与根骨。', color: 'text-purple-700' },
  { id: '七秀', desc: '剑舞动四方。主修魅力与身法。', color: 'text-pink-600' },
  { id: '天策', desc: '长枪独守大唐魂。主修力道与身法。', color: 'text-red-700' },
  { id: '少林', desc: '古刹钟声，金刚不坏。主修根骨与气血。', color: 'text-amber-600' },
];

export const CharacterCreation: React.FC = () => {
  const navigate = useNavigate();
  const { startGame } = useGameStore();
  
  const [name, setName] = useState('');
  const [selectedSect, setSelectedSect] = useState<Sect | null>(null);

  const handleStart = () => {
    if (!name || !selectedSect) return;
    startGame(name, selectedSect);
    navigate('/game');
  };

  const randomName = () => {
      const surnames = ['李', '王', '张', '叶', '唐', '陆', '沈', '穆'];
      const names = ['复', '寻', '云', '雪', '风', '无忌', '莫愁', '雨', '墨', '白'];
      setName(surnames[Math.floor(Math.random() * surnames.length)] + names[Math.floor(Math.random() * names.length)]);
  }

  return (
    <Layout>
      <div className="flex flex-col h-full max-w-lg mx-auto w-full">
        <h1 className="font-title text-4xl text-jx3-primary mb-8 text-center">创建角色</h1>
        
        <div className="space-y-6 flex-1">
          <div className="space-y-2">
            <label className="block text-lg font-bold">大侠尊姓大名</label>
            <div className="flex gap-2">
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入名字"
                className="w-full p-3 bg-white border-2 border-jx3-primary/30 rounded focus:border-jx3-secondary outline-none font-serif"
                maxLength={6}
                />
                <button onClick={randomName} className="p-3 bg-jx3-paper border-2 border-jx3-primary/30 rounded hover:bg-white text-jx3-primary">
                    <Dices className="w-5 h-5" />
                </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-bold">选择门派</label>
            <div className="grid grid-cols-1 gap-3">
              {sects.map((sect) => (
                <button
                  key={sect.id}
                  onClick={() => setSelectedSect(sect.id)}
                  className={`p-4 border-2 rounded text-left transition-all relative overflow-hidden group ${
                    selectedSect === sect.id
                      ? 'border-jx3-secondary bg-jx3-secondary/10'
                      : 'border-jx3-primary/20 hover:border-jx3-primary/50 bg-white/50'
                  }`}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <span className={`font-title text-xl ${sect.color}`}>{sect.id}</span>
                    {selectedSect === sect.id && <div className="w-2 h-2 rounded-full bg-jx3-secondary" />}
                  </div>
                  <p className="text-sm text-jx3-ink/70 mt-1 relative z-10">{sect.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleStart}
            disabled={!name || !selectedSect}
            className={`w-full py-4 rounded text-xl font-bold flex items-center justify-center gap-2 transition-all ${
              !name || !selectedSect
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-jx3-primary text-white hover:bg-jx3-primary/90 shadow-lg'
            }`}
          >
            踏入江湖 <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </Layout>
  );
};
