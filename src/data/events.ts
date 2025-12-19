import { GameEvent } from '../types/game';

export const events: Record<string, GameEvent> = {
  'start': {
    id: 'start',
    title: '初入江湖',
    description: '稻香村的风，还是那么温柔。你站在村口，背着一把生锈的铁剑，准备踏上江湖之路。',
    type: 'story',
    choices: [
      {
        id: 'c1',
        text: '前往大侠墓祭拜',
        nextEventId: 'tomb_visit',
        effects: { timePass: 0 },
        log: '你决定先去祭拜大侠墓，缅怀先人。'
      },
      {
        id: 'c2',
        text: '直接找村长辞行',
        nextEventId: 'village_chief',
        effects: { timePass: 0 },
        log: '你归心似箭，直接去找村长辞行。'
      }
    ]
  },
  'tomb_visit': {
    id: 'tomb_visit',
    title: '大侠墓',
    description: '墓碑上刻着“侠之大者，为国为民”。你感到一股浩然正气。',
    type: 'story',
    choices: [
      {
        id: 'c1',
        text: '恭敬磕头',
        nextEventId: 'village_chief',
        effects: { stats: { luck: 5 }, timePass: 0 }, // 增加机缘
        log: '你恭敬地磕了三个响头，感觉运气变好了。'
      },
      {
        id: 'c2',
        text: '感悟剑意',
        nextEventId: 'village_chief',
        requirement: { stats: { intelligence: 15 } }, // 需要悟性
        effects: { stats: { strength: 3, energy: 10 }, timePass: 0 },
        log: '你盯着墓碑上的剑痕，若有所悟。'
      }
    ]
  },
  'village_chief': {
    id: 'village_chief',
    title: '村长的嘱托',
    description: '村长刘洋看着你长大的，眼中满是不舍。“江湖险恶，这本《半本秘籍》你拿着吧。”',
    type: 'story',
    choices: [
      {
        id: 'c1',
        text: '谢过村长',
        nextEventId: 'adventure_start',
        effects: { addItem: '半本秘籍', timePass: 0 },
        log: '你收下了村长的礼物，踏上了征程。'
      }
    ]
  },
  'adventure_start': {
     id: 'adventure_start',
     title: '江湖路远',
     description: '出了稻香村，前面的路分成了两条。',
     type: 'story',
     choices: [
         {
             id: 'c1',
             text: '走官道',
             nextEventId: 'capital_city',
             effects: { timePass: 1 },
             log: '你选择了宽阔的官道，一路平平安安。'
         },
         {
             id: 'c2',
             text: '走小路',
             nextEventId: 'forest_encounter',
             effects: { timePass: 1 },
             log: '你选择了幽静的小路，希望能有奇遇。'
         }
     ]
  },
  'capital_city': {
    id: 'capital_city',
    title: '繁华扬州',
    description: '你来到了扬州城，这里人声鼎沸，热闹非凡。',
    type: 'story',
    choices: [
      {
        id: 'c1',
        text: '去茶馆喝茶',
        nextEventId: 'daily_tea',
        effects: { timePass: 0 },
        log: '你走进了热闹的茶馆。'
      },
      {
        id: 'c2',
        text: '寻找副本队伍',
        nextEventId: 'daily_dungeon',
        log: '你来到副本门口寻找队友。'
      },
      {
        id: 'c3',
        text: '回客栈休息',
        nextEventId: 'rest_inn',
        effects: { timePass: 0 },
        log: '你感觉有些累了，决定去休息。'
      },
      {
        id: 'merchant_run',
        text: '跑商 (押金-150金)',
        nextEventId: 'merchant_eval',
        effects: { money: -150, timePass: 2 },
        log: '你决定跑一趟商，预付了押金。'
      }
    ]
  },
  'merchant_success': {
    id: 'merchant_success',
    title: '跑商成功',
    description: '一路太平，生意顺利，你拿回了丰厚的银两。',
    type: 'story',
    choices: [
      {
        id: 'c1',
        text: '收钱回城 (+300金)',
        nextEventId: 'capital_city',
        effects: { money: 0, timePass: 0 },
        log: '你满载而归，盘点收益。'
      }
    ]
  },
  'merchant_robbed': {
    id: 'merchant_robbed',
    title: '遭遇劫镖',
    description: '半路杀出劫匪，你未能保住货物，押金不予返还。',
    type: 'story',
    choices: [
      {
        id: 'c1',
        text: '认栽回城',
        nextEventId: 'capital_city',
        effects: { timePass: 0 },
        log: '你无奈返回，损失了押金。'
      }
    ]
  },
  'merchant_counterkill': {
    id: 'merchant_counterkill',
    title: '反杀劫匪',
    description: '你力挽狂澜，击退了劫匪，额外收获赏金。',
    type: 'story',
    choices: [
      {
        id: 'c1',
        text: '清点收益 (+400金)',
        nextEventId: 'capital_city',
        effects: { timePass: 0 },
        log: '你收取赏金，心满意足地回城。'
      }
    ]
  },
  'rest_inn': {
    id: 'rest_inn',
    title: '客栈休息',
    description: '天色已晚，你找了一家客栈休息。',
    type: 'rest',
    choices: [
      {
        id: 'rest_confirm',
        text: '好好睡一觉',
        nextEventId: 'capital_city', // 第二天回到扬州
        log: '你进入梦乡，恢复了体力。',
        effects: { timePass: 0 } // 休息不消耗行动力，store 中处理恢复逻辑
      }
    ]
  },
  'daily_tea': {
    id: 'daily_tea',
    title: '扬州茶馆',
    description: '茶馆里三教九流汇聚，老板娘赵云睿正忙着招呼客人。',
    type: 'story',
    choices: [
      {
        id: 'drink_tea',
        text: '喝茶听书 (-10金)',
        nextEventId: 'capital_city',
        effects: { money: -10, stats: { energy: 10, maxEnergy: 5, intelligence: 2 }, timePass: 0 },
        log: '你一边喝茶一边听着江湖八卦，内力有所精进，内力上限提升了。'
      },
      {
        id: 'inquire',
        text: '打听消息 (-50金)',
        nextEventId: 'capital_city',
        effects: { money: -50, timePass: 1 },
        chance: 0.4,
        successEventId: 'secret_news',
        failEventId: 'secret_news_fail',
        log: '你塞给小二一大笔银子，想打听点不一样的。'
      },
      {
        id: 'leave',
        text: '离开',
        nextEventId: 'capital_city',
        effects: { timePass: 0 },
        log: '你离开了茶馆。'
      }
    ]
  },
  'secret_news': {
    id: 'secret_news',
    title: '江湖秘闻',
    description: '小二悄悄告诉你：“听说城外小树林里，有人看到了一本遗落的武功秘籍...”',
    type: 'story',
    choices: [
      {
        id: 'go_search',
        text: '去碰碰运气',
        nextEventId: 'capital_city',
        effects: { stats: { luck: 10 }, addItem: '残缺的秘籍', timePass: 2 },
        log: '你根据线索找到了一本残缺的秘籍。'
      }
    ]
  },
  'secret_news_fail': {
    id: 'secret_news_fail',
    title: '消息零碎',
    description: '打听了一圈，都是些七拼八凑的碎话，并无实质线索。',
    type: 'story',
    choices: [
      {
        id: 'back',
        text: '回扬州',
        nextEventId: 'capital_city',
        effects: { timePass: 0 },
        log: '你摇了摇头，决定改日再来打听。'
      }
    ]
  },
  'daily_dungeon': {
    id: 'daily_dungeon',
    title: '大战！英雄副本',
    description: '今日的大战副本招募中！来T来奶来老板！',
    type: 'battle',
    choices: [
      {
        id: 'join_party',
        text: '进组开打',
        nextEventId: 'dungeon_win', // 简化
        chance: 0.7,
        successEventId: 'dungeon_win',
        failEventId: 'dungeon_fail',
        effects: { stats: { energy: -20 }, timePass: 0 },
        log: '你加入了队伍，开始攻略副本。'
      },
      {
        id: 'leave',
        text: '下次一定',
        nextEventId: 'capital_city',
        effects: { timePass: 0 },
        log: '你觉得自己装备太差，还是算了。'
      }
    ]
  },
  'dungeon_win': {
    id: 'dungeon_win',
    title: '副本通关',
    description: '经过一番苦战，你们成功击败了BOSS！',
    type: 'story',
    choices: [
      {
        id: 'loot',
        text: '摸装备',
        nextEventId: 'capital_city',
        effects: { money: 100, stats: { strength: 5 }, timePass: 0 },
        log: '你运气不错，分到了不少金币和装备。'
      }
    ]
  },
  'dungeon_fail': {
    id: 'dungeon_fail',
    title: '灭团了',
    description: '因为队友的失误（当然不是你的锅），你们灭团了。',
    type: 'story',
    choices: [
      {
        id: 'blame',
        text: '骂骂咧咧退出',
        nextEventId: 'capital_city',
        effects: { stats: { health: -10 }, timePass: 0 },
        log: '你修装备花了不少钱，心情很差。'
      }
    ]
  },
  'qiyu_sanshan': {
    id: 'qiyu_sanshan',
    title: '【奇遇】三山四海',
    description: '你在路边挖宝时，突然挖到了一个古老的老头！他说他有好东西给你。',
    type: 'story',
    choices: [
      {
        id: 'accept',
        text: '接受传承',
        nextEventId: 'capital_city',
        effects: { 
            stats: { strength: 20, agility: 20, intelligence: 20, luck: 20 },
            addItem: '披风·山河入画',
            addAchievement: 'lucky_dog'
        },
        log: '你完成了旷世奇遇，获得了绝世披风！'
      }
    ]
  },
  'qiyu_yinyang': {
    id: 'qiyu_yinyang',
    title: '【奇遇】阴阳两界',
    description: '你本该命丧黄泉，却在弥留之际被勾魂使者拦下。“你命不该绝，回去吧！”',
    type: 'story',
    choices: [
      {
        id: 'revive',
        text: '重返人间',
        nextEventId: 'capital_city',
        effects: { 
            stats: { health: 50, maxHealth: 20 },
            addAchievement: 'lucky_dog'
        },
        log: '你奇迹般地活了过来，并感觉身体更强壮了。'
      }
    ]
  },
  'forest_encounter': {
    id: 'forest_encounter',
    title: '林中异响',
    description: '树林里突然窜出一只野猪！',
    type: 'battle',
    choices: [
      {
        id: 'c1',
        text: '拔剑战斗',
        nextEventId: 'battle_win_boar', // 简化战斗，直接跳结果，后期改为跳转到 Battle View
        chance: 0.8,
        successEventId: 'battle_win_boar',
        failEventId: 'battle_lose_boar',
        effects: { stats: { energy: -15, health: -5 } },
        log: '你拔剑冲向野猪，消耗了内力和气血。'
      },
      {
        id: 'c2',
        text: '逃跑',
        nextEventId: 'capital_city',
        effects: { stats: { agility: 1 } },
        log: '好汉不吃眼前亏，你溜得比兔子还快。'
      }
    ]
  },
  'battle_win_boar': {
    id: 'battle_win_boar',
    title: '战胜野猪',
    description: '你成功击败了野猪，获得了一些猪肉。',
    type: 'story',
    choices: [
      {
        id: 'c1',
        text: '烤了吃',
        nextEventId: 'capital_city',
        effects: { stats: { health: 20 } },
        log: '真香！你的气血恢复了。'
      }
    ]
  },
  'battle_lose_boar': {
    id: 'battle_lose_boar',
    title: '被猪拱了',
    description: '你没打过野猪，狼狈逃窜，受了点轻伤。',
    type: 'story',
    choices: [
      {
        id: 'c1',
        text: '忍痛赶路',
        nextEventId: 'capital_city',
        effects: { stats: { health: -20 } },
        log: '你带着伤来到了扬州城。'
      }
    ]
  }
};
