export type Sect = '纯阳' | '万花' | '七秀' | '天策' | '少林';

export interface Stats {
  health: number; // 气血
  maxHealth: number;
  energy: number; // 内力
  maxEnergy: number;
  strength: number; // 根骨 (影响气血和防御)
  agility: number; // 身法 (影响闪避和出手)
  intelligence: number; // 悟性 (影响事件判定和内力)
  luck: number; // 机缘 (影响随机事件)
  charm: number; // 魅力 (影响NPC交互)
}

export interface Player {
  name: string;
  sect: Sect;
  gender: '男' | '女';
  stats: Stats;
  title: string;
  money: number; // 金币/碎银
  inventory: string[];
  achievements: string[];
  flags: Record<string, boolean>; // 剧情标记
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  rarity: 'common' | 'rare' | 'legendary';
}

export interface Effect {
  stats?: Partial<Stats>;
  money?: number;
  addItem?: string;
  removeItem?: string;
  setFlag?: string;
  addAchievement?: string;
  timePass?: number; // 消耗行动力，默认1
}

export interface Choice {
  id: string;
  text: string;
  description?: string; // 鼠标悬停提示
  requirement?: {
    stats?: Partial<Stats>;
    item?: string;
    flag?: string;
    sect?: Sect;
  };
  nextEventId: string; // 跳转到下一个事件ID
  effects?: Effect; // 选择后的直接效果
  chance?: number; // 成功率 (0-1)
  successEventId?: string; // 成功后跳转
  failEventId?: string; // 失败后跳转
  log: string; // 历史记录显示的文本
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  image?: string; // 图片路径或关键词
  type: 'story' | 'battle' | 'shop' | 'rest';
  choices: Choice[];
  bgMusic?: string;
}

export interface GameState {
  player: Player | null;
  currentEventId: string;
  history: { text: string; type: 'info' | 'success' | 'danger' | 'warning' }[];
  turn: number;
  days: number; // 当前天数
  actionsLeft: number; // 当日剩余行动力
  maxActions: number; // 最大行动力
  isGameOver: boolean;
  gameEnding?: string;
  gameScore?: number; // 最终评分
  gameRank?: string; // 最终称号
  
  // Actions
  startGame: (name: string, sect: Sect) => void;
  loadGame: () => void;
  makeChoice: (choice: Choice) => void;
  resetGame: () => void;
}
