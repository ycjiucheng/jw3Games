import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Player, Choice, Sect, Stats } from '../types/game';
import { achievements } from '../data/achievements';

// 初始属性生成函数
const generateInitialStats = (sect: Sect): Stats => {
  // 根据门派给一些偏置，然后随机
  const baseStats: Stats = {
    health: 100, maxHealth: 100,
    energy: 100, maxEnergy: 100,
    strength: 10 + Math.floor(Math.random() * 10),
    agility: 10 + Math.floor(Math.random() * 10),
    intelligence: 10 + Math.floor(Math.random() * 10),
    luck: 10 + Math.floor(Math.random() * 10),
    charm: 10 + Math.floor(Math.random() * 10),
  };
  
  // 门派修正
  if (sect === '少林') { baseStats.strength += 10; baseStats.health += 50; }
  if (sect === '七秀') { baseStats.charm += 10; baseStats.agility += 5; }
  if (sect === '纯阳') { baseStats.intelligence += 10; baseStats.energy += 20; }
  if (sect === '天策') { baseStats.strength += 5; baseStats.agility += 5; }
  if (sect === '万花') { baseStats.intelligence += 5; baseStats.health += 20; }
  
  baseStats.maxHealth = baseStats.health;
  baseStats.maxEnergy = baseStats.energy;
  return baseStats;
};

const checkAchievements = (player: Player, days: number) => {
    const unlocked = [...player.achievements];
    let newUnlocked = false;

    Object.values(achievements).forEach(ach => {
      if (unlocked.includes(ach.id)) return;
      
      let earned = false;
      if (ach.id === 'rich_man' && player.money >= 1000) earned = true;
      if (ach.id === 'master_killer') {
          const sum = player.stats.strength + player.stats.agility + player.stats.intelligence + player.stats.luck + player.stats.charm;
          if (sum >= 200) earned = true; // 降低一点难度以便测试
      }
      if (ach.id === 'survivor' && days >= 30) earned = true;
      if (ach.id === 'immortal' && days >= 180) earned = true;
      
      if (earned) {
          unlocked.push(ach.id);
          newUnlocked = true;
      }
    });
    return { achievements: unlocked, newUnlocked };
};

const calculateScore = (player: Player, days: number, achievementsCount: number) => {
    let score = 0;
    score += player.stats.strength * 10;
    score += player.stats.agility * 10;
    score += player.stats.intelligence * 10;
    score += player.stats.luck * 10;
    score += player.stats.charm * 10;
    score += player.money * 0.1;
    score += achievementsCount * 100;
    return Math.floor(score);
};

const getRankTitle = (score: number) => {
    if (score < 500) return '江湖虾米';
    if (score < 1000) return '后起之秀';
    if (score < 2000) return '一代宗师';
    return '独步天下';
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      player: null,
      currentEventId: 'start',
      history: [],
      turn: 0,
      days: 1,
      actionsLeft: 10,
      maxActions: 10,
      isGameOver: false,
      gameEnding: undefined,
      gameScore: 0,
      gameRank: '',

      startGame: (name, sect) => {
        const stats = generateInitialStats(sect);
        const player: Player = {
          name,
          sect,
          gender: '男', // 简化
          stats,
          title: '初出茅庐',
          money: 100,
          inventory: [],
          achievements: [],
          flags: {},
        };
        set({
          player,
          currentEventId: 'start',
          history: [{ text: `你叫${name}，是${sect}的一名弟子。今天是你下山的日子。`, type: 'info' }],
          turn: 1,
          days: 1,
          actionsLeft: 10,
          maxActions: 10,
          isGameOver: false,
          gameEnding: undefined,
          gameScore: 0,
          gameRank: '',
        });
      },

      loadGame: () => {
        const state = get();
        if (!state.player) {
           set({ history: [...state.history, { text: '暂无存档', type: 'warning' }] });
        }
      },

      resetGame: () => {
        set({ player: null, currentEventId: 'start', history: [], turn: 0, days: 1, actionsLeft: 10, maxActions: 10, isGameOver: false, gameEnding: undefined, gameScore: 0, gameRank: '' });
      },

      makeChoice: (choice: Choice) => {
        const state = get();
        if (!state.player) return;

        const newPlayer = { ...state.player };
        const newStats = { ...newPlayer.stats };
        let logText = choice.log;
        let nextEventId = choice.nextEventId;
        
        // 消耗行动力
        const timePass = choice.effects?.timePass ?? 1;
        let newActionsLeft = state.actionsLeft - timePass;
        let newDays = state.days;

        // 自动休息逻辑：如果行动力不足且不是特殊事件（如战斗中），强制进入休息或结算
        // 这里简化逻辑：如果行动力 < 0，只是扣除，但在 UI 上会限制。
        // 或者：如果事件是 "rest" 类型，恢复行动力。
        
        if (choice.id === 'rest_confirm') { // 假设有个休息选项
             newDays += 1;
             newActionsLeft = state.maxActions;
             newStats.health = Math.min(newStats.maxHealth, newStats.health + 20);
             newStats.energy = Math.min(newStats.maxEnergy, newStats.energy + 20);
             logText += " (休息了一晚，精神焕发)";
        }

        // 应用效果
        if (choice.effects) {
          if (choice.effects.stats) {
            Object.entries(choice.effects.stats).forEach(([key, value]) => {
              const k = key as keyof Stats;
              const v = value ?? 0;
              newStats[k] = (newStats[k] as number) + v;
            });
          }
          if (choice.effects.money) newPlayer.money += choice.effects.money;
          if (choice.effects.addItem) newPlayer.inventory.push(choice.effects.addItem);
          if (choice.effects.addAchievement && !newPlayer.achievements.includes(choice.effects.addAchievement)) {
              newPlayer.achievements.push(choice.effects.addAchievement);
              logText += ` [解锁成就: ${achievements[choice.effects.addAchievement]?.title || choice.effects.addAchievement}]`;
          }
        }
        
        // 更新最大值
        if (newStats.health > newStats.maxHealth) newStats.health = newStats.maxHealth;
        if (newStats.energy > newStats.maxEnergy) newStats.energy = newStats.maxEnergy;
        
        // 死亡判定
        if (newStats.health <= 0) {
            // 阴阳两界奇遇判定 (假设 10% 概率)
            if (newStats.luck > 20 && Math.random() < 0.1) {
                 nextEventId = 'qiyu_yinyang';
                 newStats.health = 1; // 苟活
                 logText = "你重伤倒地，意识模糊间，似乎看到了黑白无常...";
            } else {
                const score = calculateScore(newPlayer, newDays, newPlayer.achievements.length);
                set({ 
                    isGameOver: true, 
                    gameEnding: '死于非命', 
                    player: { ...newPlayer, stats: newStats },
                    gameScore: score,
                    gameRank: getRankTitle(score)
                });
                return;
            }
        }

        // 结局判定 (180天)
        if (newDays > 180) {
             const score = calculateScore(newPlayer, newDays, newPlayer.achievements.length);
             set({ 
                isGameOver: true, 
                gameEnding: '退隐江湖', 
                player: { ...newPlayer, stats: newStats },
                gameScore: score,
                gameRank: getRankTitle(score)
             });
             return;
        }

        newPlayer.stats = newStats;

        if (choice.id === 'merchant_run') {
            const robbed = Math.random() < 0.5;
            if (!robbed) {
                newPlayer.money += 300;
                nextEventId = 'merchant_success';
                logText += ' (一路平安)';
            } else {
                const combatPower = newStats.strength * 0.4 + newStats.agility * 0.4 + newStats.intelligence * 0.2;
                const counterChance = Math.min(0.9, 0.1 + combatPower / 100);
                if (Math.random() < counterChance) {
                    newPlayer.money += 400;
                    nextEventId = 'merchant_counterkill';
                    logText += ' (反杀成功)';
                } else {
                    nextEventId = 'merchant_robbed';
                    logText += ' (押金不退)';
                }
            }
        }

        // 处理概率跳转
        if (choice.chance !== undefined && choice.id !== 'merchant_run') {
             const roll = Math.random();
             if (roll <= choice.chance && choice.successEventId) {
                 nextEventId = choice.successEventId;
                 logText += " (成功)";
             } else if (choice.failEventId) {
                 nextEventId = choice.failEventId;
                 logText += " (失败)";
             }
        }
        
        // 奇遇触发判定 (如果当前不是奇遇，且下个事件不是特殊事件)
        if (!nextEventId.startsWith('qiyu_') && !state.currentEventId.startsWith('qiyu_')) {
            // 简单判定：每回合 1% 概率，受机缘影响
            const qiyuChance = 0.01 + (newPlayer.stats.luck * 0.001);
            if (Math.random() < qiyuChance) {
                // 随机选一个奇遇 (这里只有一个三山四海)
                nextEventId = 'qiyu_sanshan';
                logText += " (触发奇遇！)";
            }
        }

        // 检查成就
        const { achievements: updatedAchievements, newUnlocked } = checkAchievements(newPlayer, newDays);
        if (newUnlocked) {
             newPlayer.achievements = updatedAchievements;
             // 可以加个 log，但这里简单处理
        }

        set((state) => ({
          player: newPlayer,
          currentEventId: nextEventId,
          history: [...state.history, { text: logText, type: 'info' }],
          turn: state.turn + 1,
          days: newDays,
          actionsLeft: newActionsLeft
        }));
      },
    }),
    {
      name: 'jx3-game-storage',
    }
  )
);
