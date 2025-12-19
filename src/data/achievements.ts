import { Achievement } from '../types/game';

export const achievements: Record<string, Achievement> = {
  'first_blood': {
    id: 'first_blood',
    title: '初出茅庐',
    description: '成功离开稻香村，踏入江湖。',
    rarity: 'common',
    icon: 'Sword'
  },
  'survivor': {
    id: 'survivor',
    title: '江湖儿女',
    description: '在江湖中生存超过30天。',
    rarity: 'common',
    icon: 'User'
  },
  'rich_man': {
    id: 'rich_man',
    title: '腰缠万贯',
    description: '拥有的金币超过 1000。',
    rarity: 'rare',
    icon: 'Coins'
  },
  'lucky_dog': {
    id: 'lucky_dog',
    title: '鸿运当头',
    description: '触发一次奇遇事件。',
    rarity: 'rare',
    icon: 'Sparkles'
  },
  'master_killer': {
    id: 'master_killer',
    title: '武林高手',
    description: '气血、内力、根骨、身法、悟性总和超过 500。',
    rarity: 'legendary',
    icon: 'Trophy'
  },
  'immortal': {
    id: 'immortal',
    title: '长生不老',
    description: '存活至180天并通关。',
    rarity: 'legendary',
    icon: 'Crown'
  },
  'pig_slayer': {
    id: 'pig_slayer',
    title: '野猪杀手',
    description: '战胜野猪，获得猪肉。',
    rarity: 'common',
    icon: 'Utensils'
  }
};
