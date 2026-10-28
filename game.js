(function(){
/* =========================================================
   核心工具 · 数据 · 状态
   ========================================================= */
'use strict';

const STORAGE = {
  sound: 'longmarch_sound_v2',
  marks: 'longmarch_marks_v2',
  mode: 'longmarch_mode_v2',
  best: 'longmarch_best_v2_',
  intro: 'longmarch_intro_v2'
};

const MODES = {
  easy: { id: 'easy', label: '轻装', tag: '从容识途', choice: 30, sort: 50, match: 46, score: 0.9, note: '时间充裕 · 积分 ×0.9' },
  normal: { id: 'normal', label: '标准', tag: '风雨兼程', choice: 25, sort: 42, match: 38, score: 1, note: '标准节奏 · 积分 ×1.0' },
  hard: { id: 'hard', label: '铁血', tag: '向死而生', choice: 19, sort: 34, match: 31, score: 1.25, note: '限时更短 · 积分 ×1.25' }
};

const KEY_STAGES = new Set([2, 5, 8, 11]);
const KEY_TIME_FACTOR = 0.8;
const KEY_MULTIPLIER = 1.5;
const TOOL_TIME_BONUS = 10;
const SPARK_MAX = 5;
const BLAZE_TIME_BONUS = 10;
const BLAZE_MULTIPLIER = 2;

const STAGES = [
  {
    name: '于都出发', short: '于都出发', date: '1934.10', place: '江西·于都', key: false,
    intro: '1934年10月，中央红军主力告别中央苏区，踏上远征。',
    note: '1934年10月，中央红军8.6万余人从于都河畔出发，踏上战略转移之路。于都河也被称为“长征第一渡”。',
    variants: [
      {
        type: 'choice',
        q: '中央红军长征的集结出发地是哪里？',
        options: ['江西于都', '湖南韶山', '陕西吴起镇', '贵州遵义'],
        a: 0,
        hint: '于都河被称为“长征第一渡”，出发地就在江西。',
        why: '1934年10月，中央红军主力从江西于都等地出发，开始长征。于都河也因此被称为“长征第一渡”。'
      },
      {
        type: 'choice',
        q: '中央红军开始长征的时间是？',
        options: ['1935年1月', '1934年10月', '1935年10月', '1936年10月'],
        a: 1,
        hint: '战略转移始于1934年秋，三大主力会师则在1936年。',
        why: '1934年10月，中央红军开始战略转移；1936年10月，红军三大主力会师，宣告长征胜利结束。'
      }
    ]
  },
  {
    name: '血战湘江', short: '血战湘江', date: '1934.11', place: '广西·湘江', key: false,
    intro: '湘江两岸，红军以巨大牺牲掩护中央纵队渡江。',
    note: '湘江战役是长征途中最为惨烈的一战。中央红军由出发时的8.6万余人锐减至3万余人。',
    variants: [
      {
        type: 'choice',
        q: '长征途中，中央红军损失最惨重的一次战役是？',
        options: ['湘江战役', '四渡赤水', '腊子口战役', '直罗镇战役'],
        a: 0,
        hint: '这场战役发生在湘江两岸，是长征中最沉重的一页。',
        why: '湘江战役中，中央红军由出发时的8.6万余人锐减至3万余人，付出了极其惨重的代价。'
      },
      {
        type: 'choice',
        q: '湘江战役后，中央红军人数由出发时的8.6万余人锐减到约多少？',
        options: ['5万余人', '3万余人', '1万余人', '8万余人'],
        a: 1,
        hint: '出发时8.6万余人，此战之后只剩三万余人。',
        why: '血战湘江后，红军广大干部战士对“左”倾错误路线的怀疑和不满日益增长，为遵义会议的召开创造了条件。'
      }
    ]
  },
  {
    name: '遵义会议', short: '遵义会议', date: '1935.01', place: '贵州·遵义', key: true,
    intro: '长征途中，一场会议改变了中国革命的航向。',
    note: '1935年1月，遵义会议在极端危急的历史关头挽救了党、挽救了红军、挽救了中国革命，是党的历史上一个生死攸关的转折点。',
    variants: [
      {
        type: 'sort',
        q: '请按时间先后，排列下列长征途中的事件。',
        challengeHint: '按时间先后依次点选，选满即判定',
        items: [
          { id: 'xiangjiang', text: '湘江战役' },
          { id: 'tongdao', text: '通道转兵' },
          { id: 'liping', text: '黎平会议' },
          { id: 'zunyi', text: '遵义会议' }
        ],
        order: ['xiangjiang', 'tongdao', 'liping', 'zunyi'],
        hint: '湘江之战后，红军先经通道转兵，又在黎平召开会议，最后才进入遵义。',
        why: '1934年11月湘江战役后，中央红军经通道转兵、黎平会议，于1935年1月召开遵义会议，实现了伟大转折。'
      }
    ]
  },
  {
    name: '四渡赤水', short: '四渡赤水', date: '1935.01—03', place: '川黔滇边', key: false,
    intro: '赤水河畔，红军声东击西，在运动中寻找生机。',
    note: '1935年初，中央红军在川黔滇边四次渡过赤水河，以灵活机动的战术变被动为主动，被誉为毛泽东军事指挥的“得意之笔”。',
    variants: [
      {
        type: 'choice',
        q: '四渡赤水战役主要发生在哪一区域？',
        options: ['川黔滇边界', '湘鄂赣边界', '陕甘宁边界', '闽粤赣边界'],
        a: 0,
        hint: '赤水河连接贵州、四川、云南三省边界。',
        why: '四渡赤水战役在贵州、四川、云南交界的赤水河流域展开。红军声东击西、机动作战，摆脱了国民党重兵的围追堵截。'
      },
      {
        type: 'choice',
        q: '四渡赤水常被誉为什么？',
        options: ['中国革命的“宣言书”', '毛泽东军事指挥的“得意之笔”', '抗日战争的“第一枪”', '人民军队的“摇篮”'],
        a: 1,
        hint: '毛泽东本人对这场灵活机动的战役颇为自得。',
        why: '四渡赤水是中央红军长征中的经典战例。红军在毛泽东等指挥下以灵活机动的战术变被动为主动，常被誉为毛泽东军事指挥的“得意之笔”。'
      }
    ]
  },
  {
    name: '巧渡金沙江', short: '巧渡金沙', date: '1935.05', place: '云南·皎平渡', key: false,
    intro: '金沙江畔，七条小船承载着红军的命运。',
    note: '1935年5月，中央红军在皎平渡等渡口，仅靠7条小船，历时9天9夜渡过金沙江，跳出了数十万敌军的包围圈。',
    variants: [
      {
        type: 'choice',
        q: '红军巧渡金沙江的主要渡口是？',
        options: ['安顺场', '将台堡', '皎平渡', '于都河'],
        a: 2,
        hint: '渡口名中有一个“皎”字，取“皎洁”之意。',
        why: '1935年5月，中央红军在皎平渡等渡口，仅靠7条小船，历时9天9夜渡过金沙江，跳出了数十万敌军的包围圈。'
      },
      {
        type: 'choice',
        q: '巧渡金沙江的战略意义是什么？',
        options: ['建立陕甘革命根据地', '宣告长征胜利结束', '实现国共第二次合作', '跳出敌军包围圈，取得战略转移主动权'],
        a: 3,
        hint: '渡江之后，红军跳出了数十万敌军的包围圈。',
        why: '渡过金沙江后，中央红军摆脱了数十万国民党军队的围追堵截，取得了战略转移中具有决定意义的胜利。'
      }
    ]
  },
  {
    name: '飞夺泸定桥', short: '飞夺泸定桥', date: '1935.05', place: '四川·泸定', key: true,
    intro: '大渡河上，十三根铁索横在枪林弹雨之间。',
    note: '1935年5月29日，22名突击队员冒着枪林弹雨攀踏十三根铁索，夺下泸定桥，为红军北上打开了通道。',
    variants: [
      {
        type: 'match',
        q: '将下列渡口、桥梁与其发生的史实配对。',
        challengeHint: '先点左侧，再点右侧，连成一组',
        pairs: [
          { id: 'anshun', left: '安顺场', right: '十七勇士强渡大渡河' },
          { id: 'luding', left: '泸定桥', right: '二十二勇士攀铁索夺桥' },
          { id: 'jiaoping', left: '皎平渡', right: '七条小船九天九夜' }
        ],
        hint: '泸定桥的勇士是二十二名，安顺场是十七名，皎平渡靠的是七条小船。',
        why: '1935年5月，中央红军在皎平渡巧渡金沙江，在安顺场强渡大渡河，又飞夺泸定桥，粉碎了敌人妄图让红军成为“石达开第二”的企图。'
      }
    ]
  },
  {
    name: '翻越夹金山', short: '翻越夹金', date: '1935.06', place: '四川·宝兴', key: false,
    intro: '夹金山终年积雪，空气稀薄，人迹罕至。',
    note: '夹金山海拔4000多米，终年积雪、空气稀薄，是中央红军长征中翻越的第一座大雪山。',
    variants: [
      {
        type: 'choice',
        q: '中央红军长征中翻越的第一座大雪山是？',
        options: ['六盘山', '夹金山', '岷山', '泰山'],
        a: 1,
        hint: '它位于四川宝兴，海拔4000多米，终年积雪。',
        why: '夹金山位于四川，海拔4000多米，终年积雪、空气稀薄。红军以顽强意志翻越雪山，创造了人间奇迹。'
      },
      {
        type: 'choice',
        q: '夹金山主要位于今天的哪个省？',
        options: ['云南', '贵州', '四川', '甘肃'],
        a: 2,
        hint: '宝兴县与小金县都在这个省。',
        why: '夹金山位于四川省雅安市宝兴县与小金县之间，是中央红军长征翻越的第一座大雪山。'
      }
    ]
  },
  {
    name: '穿越草地', short: '穿越草地', date: '1935.08', place: '四川·松潘', key: false,
    intro: '松潘草地，沼泽遍布，气候变化无常。',
    note: '松潘草地位于四川阿坝，今若尔盖一带。这里沼泽密布、气候多变，红军在这里付出了巨大牺牲。',
    variants: [
      {
        type: 'choice',
        q: '红军长征中穿越的松潘草地主要位于今天的哪个地区？',
        options: ['四川阿坝', '甘肃敦煌', '青海西宁', '宁夏固原'],
        a: 0,
        hint: '若尔盖沼泽就在这一带，位于四川西北。',
        why: '松潘草地位于四川阿坝地区，今若尔盖一带。这里沼泽密布、气候多变，红军在这里付出了巨大牺牲。'
      },
      {
        type: 'choice',
        q: '过草地时，红军面对的主要困难是什么？',
        options: ['敌军舰炮轰击', '沼泽密布、补给困难', '台风与海潮', '沙漠缺水'],
        a: 1,
        hint: '这里没有海，也没有沙漠，最危险的是脚下的泥沼。',
        why: '草地泥沼遍布，稍有不慎就会陷落，粮食补给又极其困难。红军战士挖野菜、煮皮带，以惊人毅力走出草地。'
      }
    ]
  },
  {
    name: '突破腊子口', short: '突破腊子口', date: '1935.09', place: '甘肃·迭部', key: true,
    intro: '腊子口两山夹峙，是北上的最后一道天险。',
    note: '腊子口位于甘肃甘南迭部县，是甘川古道上的险要关隘。攻克腊子口，为红军北上陕甘打开了通道。',
    variants: [
      {
        type: 'sort',
        q: '请按时间先后，排列中央红军北上途中的行军节点。',
        challengeHint: '按时间先后依次点选，选满即判定',
        items: [
          { id: 'jinsha', text: '巧渡金沙江' },
          { id: 'luding', text: '飞夺泸定桥' },
          { id: 'jiajin', text: '翻越夹金山' },
          { id: 'lazi', text: '突破腊子口' }
        ],
        order: ['jinsha', 'luding', 'jiajin', 'lazi'],
        hint: '金沙江、大渡河、雪山、腊子口，是北上路上先后要闯的关。',
        why: '1935年5月至9月，中央红军先后巧渡金沙江、飞夺泸定桥、翻越夹金山、突破腊子口，为北上陕甘打开了通道。'
      }
    ]
  },
  {
    name: '吴起镇会师', short: '吴起镇', date: '1935.10', place: '陕西·吴起', key: false,
    intro: '1935年10月，中央红军抵达陕北吴起镇。',
    note: '1935年10月19日，中央红军到达陕北吴起镇，宣告中央红军长征胜利结束。不久后，中央红军与陕北红军会师。',
    variants: [
      {
        type: 'choice',
        q: '1935年10月，中央红军到达陕北吴起镇，标志着什么？',
        options: ['中央红军长征胜利结束', '长征正式开始', '红军三大主力会师', '抗日战争全面爆发'],
        a: 0,
        hint: '这是中央红军长征的终点，但还不是三大主力会师的时刻。',
        why: '1935年10月19日，中央红军到达陕北吴起镇，宣告中央红军长征胜利结束；不久后，中央红军与陕北红军会师。'
      },
      {
        type: 'choice',
        q: '中央红军长征的行程约为多少？',
        options: ['一万里', '二万五千里', '五万里', '十万里'],
        a: 1,
        hint: '纵横十一个省，历时一年，被称为“二万五千里长征”。',
        why: '中央红军历时一年，纵横十一个省，行程约二万五千里，完成了举世闻名的长征。'
      }
    ]
  },
  {
    name: '会宁会师', short: '会宁会师', date: '1936.10', place: '甘肃·会宁', key: false,
    intro: '1936年10月，三大主力在西北大地胜利会师。',
    note: '1936年10月，红一、红二、红四方面军在甘肃会宁和将台堡地区会师，标志着红军长征胜利结束。',
    variants: [
      {
        type: 'choice',
        q: '1936年10月，红军三大主力在哪一地区会师，宣告长征胜利结束？',
        options: ['陕西吴起镇', '甘肃会宁、将台堡地区', '贵州遵义', '江西井冈山'],
        a: 1,
        hint: '会宁与将台堡，都在甘肃。',
        why: '1936年10月，红一、红二、红四方面军在甘肃会宁和将台堡地区会师，标志着红军长征胜利结束。'
      },
      {
        type: 'choice',
        q: '参加长征的红军三大主力是哪三支部队？',
        options: ['红一、红三、红五方面军', '红二、红四、红五方面军', '红一、红二、红四方面军', '红一、红二、红三方面军'],
        a: 2,
        hint: '红一、红二、红四，没有“红三方面军”。',
        why: '红军三大主力是红一方面军、红二方面军、红四方面军。红二十五军也进行了长征，是最先到达陕北的红军部队。'
      }
    ]
  },
  {
    name: '星火相传', short: '星火相传', date: '2026', place: '新时代', key: true,
    intro: '从1936到2026，九十年过去，长征精神依然滚烫。',
    note: '从1936到2026，九十年过去。长征精神——坚定信念、独立自主、军民同心、舍己为人——依然滚烫。',
    variants: [
      {
        type: 'match',
        q: '将长征故事与其体现的精神配对。',
        challengeHint: '先点左侧，再点右侧，连成一组',
        pairs: [
          { id: 'quilt', left: '半条被子', right: '军民鱼水、同人民风雨同舟' },
          { id: 'match', left: '七根火柴', right: '信念如炬、把希望留给战友' },
          { id: 'hook', left: '金色鱼钩', right: '舍己为人、忠诚担当' }
        ],
        hint: '半条被子讲军民，七根火柴讲信念，金色鱼钩讲牺牲。',
        why: '长征精神体现在军民同心、坚定信念与舍己为人的无数细节里。九十年过去，这些故事仍然滚烫。'
      }
    ]
  }
];

const HISTORY_CARDS = [
  {
    date: '1934.10 · 江西于都',
    title: '于都河：长征第一渡',
    facts: [
      '1934年10月，中央红军主力8.6万余人从于都河等地出发，开始战略转移。',
      '于都河被称为“长征第一渡”；当地群众拆下门板、床板，帮助红军架设浮桥。'
    ]
  },
  {
    date: '1934.11—12 · 广西湘江',
    title: '湘江战役：最沉重的一页',
    facts: [
      '1934年11月27日至12月1日，湘江战役在广西全州、兴安一带展开。',
      '中央红军由出发时的8.6万余人锐减至3万余人，是长征中损失最惨重的一战。'
    ]
  },
  {
    date: '1935.01 · 贵州遵义',
    title: '遵义会议：生死攸关的转折点',
    facts: [
      '1935年1月15日至17日，遵义会议在贵州遵义召开。',
      '会议在极端危急的关头挽救了党、挽救了红军、挽救了中国革命，是党的历史上一个生死攸关的转折点。'
    ]
  },
  {
    date: '1935.01—03 · 川黔滇边',
    title: '四渡赤水：得意之笔',
    facts: [
      '1935年1月至3月，中央红军在川黔滇边四次渡过赤水河。',
      '红军声东击西、灵活机动，变被动为主动，被誉为毛泽东军事指挥的“得意之笔”。'
    ]
  },
  {
    date: '1935.05 · 云南皎平渡',
    title: '七条小船，九天九夜',
    facts: [
      '1935年5月，中央红军在皎平渡等渡口，仅靠7条小船，历时9天9夜渡过金沙江。',
      '渡过金沙江后，红军跳出了数十万国民党军队的围追堵截，取得战略转移的主动权。'
    ]
  },
  {
    date: '1935.05 · 四川泸定',
    title: '飞夺泸定桥：十三根铁索',
    facts: [
      '1935年5月29日，22名突击队员攀踏泸定桥13根铁索，冒着枪林弹雨夺下桥头。',
      '泸定桥横跨大渡河；红军强渡大渡河、飞夺泸定桥，粉碎了敌人让红军成为“石达开第二”的企图。'
    ]
  },
  {
    date: '1935.06 · 四川宝兴',
    title: '夹金山：第一座大雪山',
    facts: [
      '1935年6月，中央红军翻越长征途中第一座大雪山——夹金山。',
      '夹金山位于四川宝兴与小金之间，海拔4000多米，终年积雪、空气稀薄。'
    ]
  },
  {
    date: '1935.08 · 四川松潘',
    title: '松潘草地：沼泽与信仰',
    facts: [
      '1935年8月，红军穿越松潘草地（今四川若尔盖一带）。',
      '草地沼泽密布、气候无常、补给困难，红军挖野菜、煮皮带，付出巨大牺牲。'
    ]
  },
  {
    date: '1935.09 · 甘肃迭部',
    title: '腊子口：北上的最后天险',
    facts: [
      '1935年9月，红军攻克甘肃迭部腊子口。',
      '腊子口是甘川古道上的险要关隘；突破后，红军打开了北上陕甘的通道。'
    ]
  },
  {
    date: '1935.10 · 陕西吴起',
    title: '吴起镇：中央红军长征胜利结束',
    facts: [
      '1935年10月19日，中央红军到达陕北吴起镇，宣告中央红军长征胜利结束。',
      '中央红军历时一年，纵横十一个省，行程约二万五千里。'
    ]
  },
  {
    date: '1936.10 · 甘肃会宁',
    title: '会宁会师：三大主力胜利会师',
    facts: [
      '1936年10月，红一、红二、红四方面军在甘肃会宁、将台堡地区会师。',
      '三大主力会师，标志着红军长征胜利结束。'
    ]
  },
  {
    date: '1936—2026 · 九十年',
    title: '星火相传：长征精神',
    facts: [
      '从1936年到2026年，长征胜利九十周年。',
      '长征精神包括坚定信念、独立自主、军民同心、舍己为人；半条被子、七根火柴等故事流传至今。'
    ]
  }
];

const MARKS = [
  { id: 'first', seal: '捷', name: '首战告捷', desc: '完成一次完整征途' },
  { id: 'streak', seal: '连', name: '连中三元', desc: '最高连捷达到 3 次' },
  { id: 'swift', seal: '疾', name: '疾如星火', desc: '5 秒内答对一题' },
  { id: 'tools', seal: '囊', name: '锦囊妙计', desc: '一局用尽三枚锦囊' },
  { id: 'key', seal: '关', name: '险关破阵', desc: '答对全部四道险关' },
  { id: 'perfect', seal: '胜', name: '十二站全胜', desc: '单局答对全部 12 题' },
  { id: 'blaze', seal: '燎', name: '燎原之火', desc: '触发一次燎原时刻' },
  { id: 'veteran', seal: '铁', name: '铁血征途', desc: '铁血难度下答对 8 站以上' }
];

const RANKS = [
  { min: 12, title: '星火传人', line: '十二站全胜。你走过的，不只是二万五千里，更是一条理想与信念的路。' },
  { min: 10, title: '长征先锋', line: '山河为卷，脚步作答。你已经把这段历史，走成了自己的精神坐标。' },
  { min: 8, title: '红军战士', line: '一路风雨兼程，你把大多数历史坐标牢牢记住。再走一次，会更接近胜利。' },
  { min: 6, title: '行军学员', line: '征途过半，星火已燃。翻回错题看看，那些地名与年份会重新亮起来。' },
  { min: 0, title: '星火新兵', line: '第一次出征，难免迷路。历史从不催促赶路的人，读懂每一站，再出发。' }
];

const MAP_POINTS = [
  { x: 402, y: 552, side: 'right' },
  { x: 336, y: 502, side: 'right' },
  { x: 262, y: 450, side: 'right' },
  { x: 203, y: 392, side: 'left' },
  { x: 159, y: 333, side: 'left' },
  { x: 126, y: 273, side: 'right' },
  { x: 156, y: 214, side: 'right' },
  { x: 219, y: 163, side: 'right' },
  { x: 290, y: 120, side: 'left' },
  { x: 375, y: 84, side: 'right' },
  { x: 310, y: 51, side: 'left' },
  { x: 402, y: 25, side: 'right' }
];

const NODE_ICONS = [
  '<path d="M6.5 21V3.5"/><path d="M6.5 4.4c3.2-1.7 5.8 1.6 11-.5v7.4c-5.2 2.1-7.8-1.2-11 .5"/>',
  '<path d="M3 10.5h6.2M14.8 10.5H21"/><path d="M4.8 10.5v5M8.2 10.5v5M15.8 10.5v5M19.2 10.5v5"/><path d="M3 19.4c2-1.1 4-1.1 6 0s4 1.1 6 0 4-1.1 6 0"/>',
  '<path d="M3.8 9.8 12 4l8.2 5.8"/><path d="M5.8 10v8.4M9.5 10v8.4M14.5 10v8.4M18.2 10v8.4"/><path d="M3 20.4h18"/><path d="M10.3 20.4v-4.2h3.4v4.2"/>',
  '<path d="M3 6.6c2.4-1.6 4.8 1.6 7.2 0s4.8-1.6 7.2 0M3 11.3c2.4-1.6 4.8 1.6 7.2 0s4.8-1.6 7.2 0M3 16c2.4-1.6 4.8 1.6 7.2 0s4.8-1.6 7.2 0M3 20.7c2.4-1.6 4.8 1.6 7.2 0s4.8-1.6 7.2 0"/>',
  '<path d="M3.5 14.6h17l-2.8 4.3H6.3z"/><path d="M12.2 14.2V4"/><path d="M12.2 5c4 .4 6.2 2.5 6.2 5.2h-6.2"/><path d="M3 21.4c2-1.1 4-1.1 6 0s4 1.1 6 0 4-1.1 6 0"/>',
  '<path d="M4.2 4v17M19.8 4v17"/><path d="M4.2 7.2c4.4 6.2 11.2 6.2 15.6 0"/><path d="M4.2 14.2h15.6"/><path d="M8.2 14.2v3.2M12 14.2v3.6M15.8 14.2v3.2"/>',
  '<path d="M2.8 20.5 9.2 7l3.1 6.1L15 9.2l6.2 11.3z"/><path d="m9.2 7-1.2 3.1 2.3.9 2-1.2"/>',
  '<path d="M3 20.5h18"/><path d="M5.2 20.5c.3-4.1-.2-7.4 1.2-10.4M9.1 20.5c-.2-5.6 1.1-9.7 3.3-12.9M13.2 20.5c.6-4.5 2.2-7.7 4.6-9.8M17.4 20.5c-.1-2.8.7-5.1 2.4-7"/>',
  '<path d="M3 20.5V5.2l5.2 6.4M21 20.5V5.2l-5.2 6.4"/><path d="M3 20.5h18"/><path d="M9.4 15.8h5.2M12.4 13.2l2.6 2.6-2.6 2.6"/>',
  '<path d="M3.5 12.4 8.4 8l4.9 4.4v8.2H3.5z"/><path d="M13.3 13.4 17.1 10l4.4 3.6v7H13.3z"/><path d="M6.3 20.6v-4.1h3v4.1M15.8 20.6v-3.2h2.4v3.2"/>',
  '<path d="M4.5 21V4.2M19.5 21V4.2"/><path d="M4.5 4.6h5.6v5.2H4.5M19.5 4.6h-5.6v5.2h5.6"/><path d="M10.1 7.2h3.8"/>',
  '<path class="solid" d="M12 4.2l1.85 3.75 4.14.6-3 2.92.71 4.13L12 13.65l-3.7 1.95.71-4.13-3-2.92 4.14-.6z"/><path d="M12 17.6v2.8M5.3 18.8l1.5 1.1M18.7 18.8l-1.5 1.1"/>'
];

const TYPE_LABELS = { choice: '单选', sort: '排序', match: '配对' };

/* ---------- DOM ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const el = {
  body: document.body,
  prologue: $('#prologue'),
  proInner: $('#proInner'),
  proScene: $('#proScene'),
  proStars: $('#proStars'),
  proConstellation: $('#proConstellation'),
  pcNodes: $('#pcNodes'),
  introSkip: $('#introSkip'),
  proEnter: $('#proEnter'),
  proAuto: $('#proAuto'),
  proHint: $('#proHint'),
  proProgressBar: $('#proProgressBar'),
  proReveal: $('#proReveal'),
  bgStars: $('#bgStars'),
  topbar: $('#topbar'),
  helpBtn: $('#helpBtn'),
  soundToggle: $('#soundToggle'),
  routeToggle: $('#routeToggle'),
  modeChip: $('#modeChip'),
  modeSelect: $('#modeSelect'),
  modeNote: $('#modeNote'),
  bestModeLabel: $('#bestModeLabel'),
  bestScoreText: $('#bestScoreText'),
  bestNote: $('#bestNote'),
  marksCount: $('#marksCount'),
  startMarks: $('#startMarks'),
  startBtn: $('#startBtn'),
  previewBtn: $('#previewBtn'),
  journeyPanel: $('#journeyPanel'),
  routeClose: $('#routeClose'),
  backdrop: $('#backdrop'),
  routeMap: $('#routeMap'),
  journeyStatusText: $('#journeyStatusText'),
  startScreen: $('#startScreen'),
  gameScreen: $('#gameScreen'),
  resultScreen: $('#resultScreen'),
  hudStationNo: $('#hudStationNo'),
  hudStationName: $('#hudStationName'),
  hudStationMeta: $('#hudStationMeta'),
  scoreValue: $('#scoreValue'),
  scoreFloat: $('#scoreFloat'),
  timeRing: $('#timeRing'),
  ringFill: $('#ringFill'),
  timeLabel: $('#timeLabel'),
  timeFill: $('#timeFill'),
  timeState: $('#timeState'),
  journeyRail: $('#journeyRail'),
  sparkPips: $('#sparkPips'),
  comboText: $('#comboText'),
  blazeBtn: $('#blazeBtn'),
  blazeActive: $('#blazeActive'),
  questionCard: $('#questionCard'),
  cardStationName: $('#cardStationName'),
  typeTag: $('#typeTag'),
  keyTag: $('#keyTag'),
  cardIndex: $('#cardIndex'),
  stageIntro: $('#stageIntro'),
  questionText: $('#questionText'),
  toolStrip: $('#toolStrip'),
  toolEye: $('#toolEye'),
  toolTime: $('#toolTime'),
  toolHint: $('#toolHint'),
  hintBox: $('#hintBox'),
  hintText: $('#hintText'),
  challenge: $('#challenge'),
  feedback: $('#feedback'),
  feedbackBadge: $('#feedbackBadge'),
  feedbackPoints: $('#feedbackPoints'),
  answerLine: $('#answerLine'),
  sourceCard: $('#sourceCard'),
  sourceCardKicker: $('#sourceCardKicker'),
  sourceCardDate: $('#sourceCardDate'),
  sourceCardTitle: $('#sourceCardTitle'),
  sourceCardFacts: $('#sourceCardFacts'),
  sourceCardSource: $('#sourceCardSource'),
  explanation: $('#explanation'),
  keyboardHint: $('#keyboardHint'),
  nextBtn: $('#nextBtn'),
  nextLabel: $('#nextLabel'),
  resultTitle: $('#resultTitle'),
  resultSub: $('#resultSub'),
  rankSeal: $('#rankSeal'),
  rankTitle: $('#rankTitle'),
  rankMode: $('#rankMode'),
  rankLine: $('#rankLine'),
  finalScore: $('#finalScore'),
  bestNoteResult: $('#bestNoteResult'),
  resultRoute: $('#resultRoute'),
  statCorrect: $('#statCorrect'),
  statAccuracy: $('#statAccuracy'),
  statStreak: $('#statStreak'),
  statKey: $('#statKey'),
  resultMarks: $('#resultMarks'),
  resultMarksRow: $('#resultMarksRow'),
  perfectNote: $('#perfectNote'),
  retryBtn: $('#retryBtn'),
  shareBtn: $('#shareBtn'),
  reviewToggle: $('#reviewToggle'),
  reviewToggleText: $('#reviewToggleText'),
  reviewList: $('#reviewList'),
  homeBtn: $('#homeBtn'),
  dossier: $('#dossier'),
  dossierBackdrop: $('#dossierBackdrop'),
  dossierClose: $('#dossierClose'),
  dossierIndex: $('#dossierIndex'),
  dossierTitle: $('#dossierTitle'),
  dossierMeta: $('#dossierMeta'),
  dossierIntro: $('#dossierIntro'),
  dossierNote: $('#dossierNote'),
  dossierStatus: $('#dossierStatus'),
  briefing: $('#briefing'),
  briefingNo: $('#briefingNo'),
  briefingTitle: $('#briefingTitle'),
  briefingMeta: $('#briefingMeta'),
  briefingIntro: $('#briefingIntro'),
  briefingEnter: $('#briefingEnter'),
  help: $('#help'),
  helpBackdrop: $('#helpBackdrop'),
  helpClose: $('#helpClose'),
  helpOk: $('#helpOk'),
  toast: $('#toast'),
  fx: $('#fx')
};

/* ---------- 工具函数 ---------- */
const pad2 = n => String(n).padStart(2, '0');
const fmt = n => Number(n).toLocaleString('zh-CN');
const letter = i => String.fromCharCode(65 + i);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => window.matchMedia('(max-width: 1023px)').matches;
const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function loadString(key) {
  try { return localStorage.getItem(key); } catch (err) { return null; }
}
function saveValue(key, value) {
  try { localStorage.setItem(key, String(value)); } catch (err) { /* 本地存储不可用时静默 */ }
}
function loadNumber(key) {
  try {
    const value = Number(localStorage.getItem(key) || 0);
    return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
  } catch (err) { return 0; }
}
function loadMode() {
  const stored = loadString(STORAGE.mode);
  return stored && MODES[stored] ? stored : 'normal';
}
function loadMarks() {
  try {
    const parsed = JSON.parse(loadString(STORAGE.marks) || '[]');
    const valid = new Set(MARKS.map(mark => mark.id));
    if (Array.isArray(parsed)) return new Set(parsed.filter(id => valid.has(id)));
  } catch (err) { /* 忽略损坏数据 */ }
  try {
    const legacy = JSON.parse(loadString('longmarch_marks_v1') || '[]');
    const valid = new Set(MARKS.map(mark => mark.id));
    if (Array.isArray(legacy)) return new Set(legacy.filter(id => valid.has(id)));
  } catch (err) { /* 忽略 */ }
  return new Set();
}
function saveMarks() {
  saveValue(STORAGE.marks, JSON.stringify(Array.from(unlockedMarks)));
}
function bestKey(mode) { return STORAGE.best + mode; }
function loadBest(mode) {
  let value = loadNumber(bestKey(mode));
  if (!value && mode === 'normal') value = loadNumber('longmarch_best_v1');
  return value;
}
function saveBest(mode, score) {
  const previous = loadBest(mode);
  if (score > previous) saveValue(bestKey(mode), score);
}

/* ---------- 状态 ---------- */
const state = {
  screen: 'start',
  mode: loadMode(),
  run: [],
  index: 0,
  current: null,
  score: 0,
  correctCount: 0,
  streak: 0,
  bestStreak: 0,
  sparks: 0,
  blazeArmed: false,
  blazeUsed: 0,
  answers: [],
  locked: true,
  timerActive: false,
  deadline: 0,
  raf: 0,
  limitMs: 0,
  extraTimeMs: 0,
  tools: { eye: false, time: false, hint: false },
  toolsUsed: 0,
  fastestCorrect: null,
  keyCorrect: 0,
  typeCorrect: { sort: false, match: false },
  sortSelection: [],
  sortPinned: null,
  sortTimer: 0,
  matchPairs: {},
  matchSelected: null,
  matchLocked: new Set(),
  matchConfirmed: false,
  routePausedAt: 0,
  lastResult: null
};
const pauseReasons = new Set();

let soundOn = false; // 每次进入默认静音，仅在用户点击音效按钮后开启。
let unlockedMarks = loadMarks();
let bestScore = loadBest(state.mode);
let routePath = null;
let routeProgress = null;
let routeLength = 0;
let mapFractions = [];
let mapNodes = [];
let pendingCelebration = null;
let toastTimer = 0;
let currentDossier = -1;
let helpReturnFocus = null;
let dossierReturnFocus = null;
let matchResizeObserver = null;

/* ---------- 音效 ---------- */
let audioCtx = null;

function initAudio() {
  if (!soundOn) return null;
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch (err) {
    audioCtx = null;
    return null;
  }
}

function tone(freq, duration, type, gain, delay, slideTo) {
  if (!soundOn || !audioCtx) return;
  try {
    const start = audioCtx.currentTime + (delay || 0);
    const osc = audioCtx.createOscillator();
    const vol = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
    vol.gain.setValueAtTime(0.0001, start);
    vol.gain.linearRampToValueAtTime(gain || 0.03, start + 0.016);
    vol.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(vol);
    vol.connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  } catch (err) { /* 静默失败 */ }
}

function sfxClick() { tone(340, 0.05, 'sine', 0.016); }
function sfxTool() { tone(720, 0.1, 'triangle', 0.022); tone(1080, 0.18, 'triangle', 0.015, 0.065); }
function sfxCorrect() {
  tone(659.25, 0.13, 'triangle', 0.03);
  tone(880, 0.18, 'triangle', 0.021, 0.075);
  tone(1174.66, 0.22, 'triangle', 0.012, 0.15);
}
function sfxWrong() { tone(196, 0.17, 'sine', 0.038); tone(146.83, 0.26, 'sine', 0.028, 0.12); }
function sfxTimeout() { tone(220, 0.16, 'sine', 0.034); tone(164.81, 0.3, 'sine', 0.028, 0.13); }
function sfxBlaze() {
  tone(196, 0.5, 'sawtooth', 0.012, 0, 392);
  tone(523.25, 0.16, 'triangle', 0.024, 0.02);
  tone(783.99, 0.2, 'triangle', 0.02, 0.1);
  tone(1046.5, 0.3, 'triangle', 0.015, 0.2);
}
function sfxStar() { tone(1318.51, 0.18, 'sine', 0.016); tone(1760, 0.25, 'sine', 0.009, 0.06); }
function sfxComplete() {
  [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, index) => {
    tone(freq, 0.4, 'triangle', 0.027, index * 0.12);
  });
}
function sfxDraw() { tone(440, 0.06, 'sine', 0.008); }

function vibrate(pattern) {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (err) { /* 不支持 */ }
  }
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add('is-show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.toast.classList.remove('is-show'), 2400);
}


/* =========================================================
   星野引擎 · 柔和升星 / 流星
   ========================================================= */
class Starfield {
  constructor(canvas, options) {
    this.canvas = canvas;
    this.ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    this.opts = Object.assign({
      divisor: 9000,
      min: 54,
      max: 170,
      horizon: 0.66,
      topFade: 70,
      depthSpeed: 11,
      baseSpeed: 2.2,
      alpha: 0.9,
      shooting: true,
      shootingEvery: [6500, 14000],
      pointerGlow: false,
      tintCool: 0.14
    }, options || {});
    this.stars = [];
    this.shooters = [];
    this.running = false;
    this.raf = 0;
    this.last = 0;
    this.w = 0;
    this.h = 0;
    this.dpr = 1;
    this.nextShoot = 0;
    this.pointer = { x: -999, y: -999 };
    this.warmSprite = this.makeSprite('#fff4da');
    this.coolSprite = this.makeSprite('#dfe8f5');
    if (this.ctx) this.refresh();
  }

  makeSprite(color) {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, color);
    grad.addColorStop(0.14, color);
    grad.addColorStop(0.32, 'rgba(255,232,190,.35)');
    grad.addColorStop(0.62, 'rgba(255,214,150,.07)');
    grad.addColorStop(1, 'rgba(255,214,150,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return c;
  }

  refresh() {
    if (!this.canvas || !this.ctx) return;
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width || this.canvas.clientWidth || window.innerWidth);
    const h = Math.max(1, rect.height || this.canvas.clientHeight || window.innerHeight);
    this.w = w;
    this.h = h;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.max(1, Math.round(w * this.dpr));
    this.canvas.height = Math.max(1, Math.round(h * this.dpr));
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.seed();
    if (prefersReduced) this.drawStatic();
  }

  seed() {
    const area = this.w * this.h;
    const count = clamp(Math.round(area / this.opts.divisor), this.opts.min, this.opts.max);
    this.stars = Array.from({ length: count }, () => this.makeStar(true));
    this.shooters = [];
    this.nextShoot = performance.now() + 3200 + Math.random() * 4200;
  }

  makeStar(initial) {
    const depth = 0.18 + Math.random() * 0.82;
    const horizonY = this.h * this.opts.horizon;
    return {
      x: Math.random() * this.w,
      y: initial ? Math.random() * Math.max(1, horizonY) : horizonY + Math.random() * 30,
      depth,
      size: (0.55 + depth * 1.65) * (this.w < 700 ? 0.86 : 1),
      baseAlpha: (0.16 + depth * 0.62) * this.opts.alpha,
      speed: this.opts.baseSpeed + depth * this.opts.depthSpeed,
      age: initial ? Math.random() * 4 - 1.5 : -Math.random() * 1.5,
      fadeIn: 3.2 + Math.random() * 2.8,
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.14 + Math.random() * 0.3,
      sway: 14 + Math.random() * 32,
      swaySpeed: 0.035 + Math.random() * 0.06,
      cool: Math.random() < this.opts.tintCool,
      bright: depth > 0.86
    };
  }

  start() {
    if (!this.ctx || this.running) return;
    if (prefersReduced) { this.drawStatic(); return; }
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame.bind(this));
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  setPointer(x, y) {
    this.pointer.x = x;
    this.pointer.y = y;
  }

  clearPointer() {
    this.pointer.x = -999;
    this.pointer.y = -999;
  }

  drawStatic() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.globalCompositeOperation = 'lighter';
    this.stars.forEach(star => {
      const alpha = star.baseAlpha * (0.7 + 0.3 * Math.sin(star.phase));
      const sprite = star.cool ? this.coolSprite : this.warmSprite;
      const size = star.size * 7;
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, star.x - size / 2, star.y - size / 2, size, size);
    });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  spawnShooting(now) {
    const fromLeft = Math.random() > 0.38;
    const speed = 380 + Math.random() * 260;
    const angle = (fromLeft ? 1 : -1) * (0.18 + Math.random() * 0.16);
    this.shooters.push({
      x: fromLeft ? this.w * (0.12 + Math.random() * 0.5) : this.w * (0.5 + Math.random() * 0.4),
      y: this.h * (0.06 + Math.random() * this.opts.horizon * 0.62),
      vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 1.05 + Math.random() * 0.6,
      length: 90 + Math.random() * 100
    });
    this.nextShoot = now + this.opts.shootingEvery[0] + Math.random() * (this.opts.shootingEvery[1] - this.opts.shootingEvery[0]);
  }

  frame(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000));
    this.last = now;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.globalCompositeOperation = 'lighter';

    const horizon = this.h * this.opts.horizon;
    const topFade = this.opts.topFade;
    const pointer = this.pointer;
    const pointerGlow = this.opts.pointerGlow;

    for (const star of this.stars) {
      star.age += dt;
      star.y -= star.speed * dt;
      if (star.y < -8) {
        Object.assign(star, this.makeStar(false));
        star.y = horizon + Math.random() * 26;
      }
      const fadeIn = clamp(star.age / star.fadeIn, 0, 1);
      const fadeInSoft = fadeIn * fadeIn * (3 - 2 * fadeIn);
      const fadeOut = clamp(star.y / topFade, 0, 1);
      const twinkle = 0.84 + Math.sin(now * 0.001 * star.twinkle + star.phase) * 0.11 + Math.sin(now * 0.00031 + star.phase * 2.3) * 0.05;
      let alpha = star.baseAlpha * fadeInSoft * fadeOut * twinkle;
      const travel = clamp(1 - star.y / Math.max(1,horizon),0,1);
      const x = star.x + Math.sin(travel * Math.PI * 1.2 + star.phase) * star.sway + Math.sin(star.age * .18 + star.phase) * 3;

      if (pointerGlow) {
        const dx = x - pointer.x;
        const dy = star.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 170) {
          const near = 1 - dist / 170;
          alpha += near * near * 0.26 * star.depth;
        }
      }
      alpha = clamp(alpha, 0, 1);
      if (alpha <= 0.004) continue;

      const sprite = star.cool ? this.coolSprite : this.warmSprite;
      const size = star.size * (star.bright ? 9 : 6.4);
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, x - size / 2, star.y - size / 2, size, size);

      if (star.bright) {
        ctx.globalAlpha = alpha * 0.22;
        ctx.strokeStyle = 'rgba(255,242,212,1)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(x - star.size * 3.2, star.y);
        ctx.lineTo(x + star.size * 3.2, star.y);
        ctx.moveTo(x, star.y - star.size * 3.2);
        ctx.lineTo(x, star.y + star.size * 3.2);
        ctx.stroke();
      }
    }

    if (this.opts.shooting) {
      if (!this.shooters.length && now > this.nextShoot && now - this.last < 100) this.spawnShooting(now);
      for (let i = this.shooters.length - 1; i >= 0; i -= 1) {
        const shot = this.shooters[i];
        shot.life += dt;
        const t = shot.life / shot.maxLife;
        if (t >= 1) { this.shooters.splice(i, 1); continue; }
        shot.x += shot.vx * dt;
        shot.y += shot.vy * dt;
        const nx = shot.vx / Math.hypot(shot.vx, shot.vy);
        const ny = shot.vy / Math.hypot(shot.vx, shot.vy);
        const tailX = shot.x - nx * shot.length;
        const tailY = shot.y - ny * shot.length;
        const fade = Math.sin(Math.PI * Math.min(1, t * 1.15)) * 0.8;
        const grad = ctx.createLinearGradient(shot.x, shot.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255,248,228,${fade})`);
        grad.addColorStop(0.35, `rgba(247,216,160,${fade * 0.5})`);
        grad.addColorStop(1, 'rgba(247,216,160,0)');
        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.1;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(shot.x, shot.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.globalAlpha = fade;
        ctx.fillStyle = '#fff8e8';
        ctx.beginPath();
        ctx.arc(shot.x, shot.y, 1.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    this.raf = requestAnimationFrame(this.frame.bind(this));
  }
}

/* ---------- 星野实例 ---------- */
const proStarfield = el.proStars ? new Starfield(el.proStars, {
  divisor: 7600,
  min: 58,
  max: 176,
  horizon: 0.64,
  topFade: 78,
  depthSpeed: 12,
  baseSpeed: 2.4,
  alpha: 0.98,
  shooting: true,
  shootingEvery: [5200, 11500],
  pointerGlow: true,
  tintCool: 0.16
}) : null;

const bgStarfield = el.bgStars ? new Starfield(el.bgStars, {
  divisor: 21000,
  min: 26,
  max: 82,
  horizon: 1,
  topFade: 30,
  depthSpeed: 6,
  baseSpeed: 1.3,
  alpha: 0.56,
  shooting: true,
  shootingEvery: [14000, 26000],
  pointerGlow: false,
  tintCool: 0.1
}) : null;


/* =========================================================
   序章控制 · 星图 · 柔和转场
   ========================================================= */
const PROLOGUE_TIMES = {
  cards: [500, 4300, 7800, 11300, 14800],
  final: 19000,
  auto: 25500,
  duration: 25500
};
const PRO_CARDS = $$('.pro-card', el.prologue || document);
const PRO_FINAL = $('[data-pro-final]', el.prologue || document);
const PRO_DOTS = $$('[data-act-dot]', el.prologue || document);

let proActive = false;
let proFinished = false;
let proRevealAnimRaf = 0;
let proTimers = [];
let proAudio = null;
let proAudioStopTimer = 0;
let proHintTimer = 0;
let proPointerRaf = 0;
let proRevealRaf = 0;
let proRevealParts = [];
let proRevealCtx = null;
let proRevealW = 0;
let proRevealH = 0;
let proRevealDpr = 1;
let proRevealRadius = 0;
let proRevealLast = 0;

function setPrologueBehindInert(active) {
  [el.topbar, document.querySelector('.app')].forEach(node => {
    if (!node) return;
    node.inert = active;
    if (active) node.setAttribute('aria-hidden', 'true');
    else node.removeAttribute('aria-hidden');
  });
}

function proLater(callback, delay) {
  proTimers.push(window.setTimeout(callback, delay));
}

function clearPrologueTimers() {
  proTimers.forEach(timer => window.clearTimeout(timer));
  proTimers = [];
  window.clearTimeout(proHintTimer);
}

function buildConstellation() {
  if (!el.pcNodes) return;
  const path = $('#pcRoute');
  if (!path || typeof path.getTotalLength !== 'function') return;
  try {
    const total = path.getTotalLength();
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 12; i += 1) {
      const point = path.getPointAtLength((total * i) / 11);
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.style.setProperty('--i', String(i));
      const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      halo.setAttribute('class', 'pc-halo');
      halo.setAttribute('cx', point.x.toFixed(2));
      halo.setAttribute('cy', point.y.toFixed(2));
      halo.setAttribute('r', '0');
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('class', 'pc-dot');
      dot.setAttribute('cx', point.x.toFixed(2));
      dot.setAttribute('cy', point.y.toFixed(2));
      dot.setAttribute('r', '0');
      group.append(halo, dot);
      if([2,5,10].includes(i)){
        const icon=document.createElementNS('http://www.w3.org/2000/svg','g');
        icon.setAttribute('class','cinema-landmark');
        icon.setAttribute('transform',`translate(${point.x-26} ${point.y-62}) scale(2.2)`);
        icon.innerHTML=NODE_ICONS[i];group.appendChild(icon);
      }
      fragment.appendChild(group);
    }
    el.pcNodes.appendChild(fragment);
  } catch (err) { /* SVG 计算失败时保留简单星图 */ }
}

function updateActDots(index) {
  PRO_DOTS.forEach((dot, i) => dot.classList.toggle('is-on', i <= index));
}

function showProCard(index) {
  if (!proActive) return;
  PRO_CARDS.forEach((card, i) => {
    const active = i === index;
    card.classList.toggle('is-on', active);
    card.setAttribute('aria-hidden', active ? 'false' : 'true');
  });
  if (PRO_FINAL) {
    PRO_FINAL.classList.remove('is-on');
    PRO_FINAL.setAttribute('aria-hidden', 'true');
  }
  el.prologue.classList.remove('is-final');
  el.prologue.classList.toggle('is-constellation', index >= 1);
  updateActDots(index);
}

function showProFinal() {
  if (!proActive) return;
  PRO_CARDS.forEach(card => {
    card.classList.remove('is-on');
    card.setAttribute('aria-hidden', 'true');
  });
  if (!PRO_FINAL) return;
  PRO_FINAL.classList.add('is-on');
  PRO_FINAL.setAttribute('aria-hidden', 'false');
  el.prologue.classList.add('is-final');
  el.prologue.classList.add('is-constellation');
  updateActDots(PRO_DOTS.length - 1);
  if (soundOn && audioCtx) {
    [523.25, 783.99, 1046.5].forEach((freq, i) => tone(freq, 1.1, 'sine', 0.017, i * 0.16));
  }
  if (el.proEnter) el.proEnter.focus({ preventScroll: true });
}

function showPrologueHint() {
  if (!proActive || !soundOn || proAudio || !el.proHint) return;
  el.prologue.classList.add('is-hint');
  window.clearTimeout(proHintTimer);
  proHintTimer = window.setTimeout(() => el.prologue.classList.remove('is-hint'), 6200);
}

function createPrologueNoise(context, seconds) {
  const length = Math.max(1, Math.floor(context.sampleRate * seconds));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.1;
  }
  return buffer;
}

function markPrologueSoundOn() {
  if (!el.proHint) return;
  const label = el.proHint.querySelector('span');
  if (label) label.textContent = '声效已开启';
  el.prologue.classList.remove('is-hint');
  void el.proHint.offsetWidth;
  el.prologue.classList.add('is-hint');
  window.clearTimeout(proHintTimer);
  proHintTimer = window.setTimeout(() => el.prologue.classList.remove('is-hint'), 1600);
}

function ensurePrologueAudio() { return; // Opening remains silent, including pointer/keyboard gestures.

  if (!soundOn) return null;
  initAudio();
  if (!audioCtx) return null;
  if (audioCtx.state === 'suspended') {
    try { audioCtx.resume(); } catch (err) { /* 自动播放限制 */ }
  }
  if (proAudio) {
    markPrologueSoundOn();
    return proAudio;
  }
  try {
    const now = audioCtx.currentTime;
    const master = audioCtx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.12, now + 3.2);
    master.connect(audioCtx.destination);
    const noise = createPrologueNoise(audioCtx, 2.4);
    const sources = [];

    const droneFilter = audioCtx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 190;
    droneFilter.Q.value = 0.7;
    const droneGain = audioCtx.createGain();
    droneGain.gain.value = 0.065;
    droneFilter.connect(droneGain);
    droneGain.connect(master);
    [55, 82.41, 110].forEach((frequency, index) => {
      const osc = audioCtx.createOscillator();
      osc.type = index === 1 ? 'triangle' : 'sine';
      osc.frequency.value = frequency;
      const voice = audioCtx.createGain();
      voice.gain.value = index === 0 ? 1 : (index === 1 ? 0.44 : 0.28);
      osc.connect(voice);
      voice.connect(droneFilter);
      osc.start(now);
      sources.push(osc);
    });
    const drift = audioCtx.createOscillator();
    drift.type = 'sine';
    drift.frequency.value = 0.04;
    const driftGain = audioCtx.createGain();
    driftGain.gain.value = 65;
    drift.connect(driftGain);
    driftGain.connect(droneFilter.frequency);
    drift.start(now);
    sources.push(drift);

    const wind = audioCtx.createBufferSource();
    wind.buffer = noise;
    wind.loop = true;
    const windFilter = audioCtx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 420;
    windFilter.Q.value = 0.58;
    const windGain = audioCtx.createGain();
    windGain.gain.value = 0.028;
    wind.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(master);
    const windLfo = audioCtx.createOscillator();
    windLfo.type = 'sine';
    windLfo.frequency.value = 0.075;
    const windLfoGain = audioCtx.createGain();
    windLfoGain.gain.value = 0.014;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windGain.gain);
    windLfo.start(now);
    wind.start(now);
    sources.push(windLfo, wind);

    proAudio = { master, sources };
    markPrologueSoundOn();
    return proAudio;
  } catch (err) {
    proAudio = null;
    return null;
  }
}

function stopPrologueAudio(fade) {
  window.clearTimeout(proAudioStopTimer);
  const audio = proAudio;
  proAudio = null;
  if (!audio || !audioCtx) return;
  const duration = typeof fade === 'number' ? fade : 2;
  try {
    const now = audioCtx.currentTime;
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.setValueAtTime(Math.max(0.0001, audio.master.gain.value), now);
    audio.master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  } catch (err) { /* 忽略已关闭的音频上下文 */ }
  proAudioStopTimer = window.setTimeout(() => {
    audio.sources.forEach(source => {
      try { source.stop(); } catch (err) { /* 已停止 */ }
    });
    try { audio.master.disconnect(); } catch (err) { /* 已断开 */ }
  }, (duration + 0.3) * 1000);
}

/* ---------- 转场画布 ---------- */
function initRevealCanvas() {
  const canvas = el.proReveal;
  if (!canvas || !canvas.getContext || prefersReduced) {
    proRevealCtx = null;
    return;
  }
  proRevealCtx = canvas.getContext('2d');
  proRevealW = window.innerWidth;
  proRevealH = window.innerHeight;
  proRevealDpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(proRevealW * proRevealDpr);
  canvas.height = Math.round(proRevealH * proRevealDpr);
  canvas.style.width = proRevealW + 'px';
  canvas.style.height = proRevealH + 'px';
  proRevealCtx.setTransform(proRevealDpr, 0, 0, proRevealDpr, 0, 0);
  proRevealParts = [];
  proRevealRadius = 0;
  proRevealLast = performance.now();
}

function drawRevealFrame(now) {
  if (!proRevealCtx) return;
  const ctx = proRevealCtx;
  const dt = Math.min(0.05, Math.max(0.001, (now - proRevealLast) / 1000));
  proRevealLast = now;
  const cx = proRevealW / 2;
  const cy = proRevealH * 0.52;
  const radius = proRevealRadius;
  ctx.clearRect(0, 0, proRevealW, proRevealH);
  ctx.globalCompositeOperation = 'lighter';

  if (radius > 16) {
    const spawn = 3 + Math.round(Math.min(4, radius / 180));
    for (let i = 0; i < spawn; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const r = radius * (0.96 + (Math.random() - 0.5) * 0.08);
      const warm = Math.random();
      proRevealParts.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: Math.cos(angle) * (25 + Math.random() * 90) + (Math.random() - 0.5) * 13,
        vy: Math.sin(angle) * (25 + Math.random() * 90) - 8 - Math.random() * 22,
        age: 0,
        life: 0.7 + Math.random() * 0.9,
        size: 0.7 + Math.random() * 1.7,
        gold: warm > 0.32,
        red: warm < 0.12
      });
    }
    if (proRevealParts.length > 420) proRevealParts.splice(0, proRevealParts.length - 420);
  }

  for (let i = proRevealParts.length - 1; i >= 0; i -= 1) {
    const part = proRevealParts[i];
    part.age += dt;
    if (part.age >= part.life) { proRevealParts.splice(i, 1); continue; }
    const px = part.x;
    const py = part.y;
    part.vy += 20 * dt;
    part.vx *= 0.992;
    part.x += part.vx * dt;
    part.y += part.vy * dt;
    const fade = 1 - part.age / part.life;
    const alpha = fade * fade * 0.9;
    if (part.red) ctx.strokeStyle = `rgba(255,132,88,${alpha.toFixed(3)})`;
    else if (part.gold) ctx.strokeStyle = `rgba(255,214,146,${alpha.toFixed(3)})`;
    else ctx.strokeStyle = `rgba(255,244,218,${alpha.toFixed(3)})`;
    ctx.lineWidth = part.size;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(part.x, part.y);
    ctx.stroke();
  }

  if (radius > 20) {
    const glow = ctx.createRadialGradient(cx, cy, Math.max(0, radius - 90), cx, cy, radius + 110);
    glow.addColorStop(0, 'rgba(255,196,120,0)');
    glow.addColorStop(0.72, 'rgba(255,196,120,0)');
    glow.addColorStop(0.9, 'rgba(255,206,134,.05)');
    glow.addColorStop(1, 'rgba(255,206,134,0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, proRevealW, proRevealH);
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  proRevealRaf = requestAnimationFrame(drawRevealFrame);
}

function startRevealCanvas() {
  if (prefersReduced) return;
  initRevealCanvas();
  if (!proRevealCtx) return;
  proRevealLast = performance.now();
  cancelAnimationFrame(proRevealRaf);
  proRevealRaf = requestAnimationFrame(drawRevealFrame);
}

function stopRevealCanvas() {
  cancelAnimationFrame(proRevealRaf);
  proRevealParts = [];
  if (proRevealCtx) proRevealCtx.clearRect(0, 0, proRevealW, proRevealH);
}

/* ---------- 启程 / 收尾 ---------- */
function finishPrologue() {
  stopCinema();
  if (proFinished || !el.prologue || el.prologue.hidden) return;
  proFinished = true;
  cancelAnimationFrame(proRevealAnimRaf);
  cancelAnimationFrame(proRevealRaf);
  window.clearTimeout(proAudioStopTimer);
  stopPrologueAudio(0.4);
  proStarfield && proStarfield.stop();
  stopRevealCanvas();
  el.prologue.classList.add('is-gone');
  document.body.classList.remove('prologue-open');
  document.body.classList.add('prologue-done');
  setPrologueBehindInert(false);
  window.removeEventListener('resize', handlePrologueResize);
  window.removeEventListener('pointermove', handleProloguePointerMove);
  window.removeEventListener('pointerdown', handleProloguePointerDown);
  document.removeEventListener('keydown', handlePrologueKey);
  window.setTimeout(() => {
    el.prologue.hidden = true;
    startBgStars();
    document.body.classList.add('app-entered');
    try { el.startBtn.focus({ preventScroll: true }); } catch (err) { /* 忽略 */ }
  }, prefersReduced ? 0 : 120);
}

function startPrologueReveal(fast, overrideDuration) {
  fadeSceneAudio();
  if (!proActive || !el.prologue) return;
  proActive = false;
  clearPrologueTimers();
  window.clearTimeout(proHintTimer);
  el.prologue.classList.remove('is-hint');
  el.prologue.classList.add('is-revealing');
  el.prologue.style.setProperty('--burn', '0px');
  startBgStars();
  stopPrologueAudio(fast ? 0.6 : 2.2);
  // Restrained crossfade instead of radial burn and particle burst.
  const duration = prefersReduced ? 30 : (fast ? 150 : 650);
  const startedAt = performance.now();
  const maxRadius = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 150;
  const step = now => {
    if (proFinished) return;
    const progress = clamp((now - startedAt) / duration, 0, 1);
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    proRevealRadius = eased * maxRadius;
    el.prologue.style.setProperty('--burn', proRevealRadius.toFixed(1) + 'px');
    if (progress < 1) {
      proRevealAnimRaf = requestAnimationFrame(step);
    } else {
      finishPrologue();
    }
  };
  proRevealAnimRaf = requestAnimationFrame(step);
  window.setTimeout(() => {
    if (el.prologue && !el.prologue.hidden && el.prologue.classList.contains('is-revealing')) finishPrologue();
  }, duration + 700);
}

/* ---------- 事件 ---------- */
function handlePrologueResize() {
  proStarfield && proStarfield.refresh();
  if (proRevealCtx) initRevealCanvas();
}

function handleProloguePointerMove(event) {
  if (!proActive || !proStarfield) return;
  if (proPointerRaf) return;
  proPointerRaf = requestAnimationFrame(() => {
    proPointerRaf = 0;
    proStarfield.setPointer(event.clientX, event.clientY);
  });
}

function handleProloguePointerDown(event) {
  if (!proActive) return;
  if (event.target && event.target.closest && event.target.closest('button')) return;
  ensurePrologueAudio();
}

function handlePrologueKey(event) {
  if (!proActive) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    skipPrologueImmediately();
    return;
  }
  if (el.prologue.classList.contains('is-final') && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    startPrologueReveal(false, 1700);
    return;
  }
  if (event.key === 'Tab' || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.target && event.target.closest && event.target.closest('button')) return;
  ensurePrologueAudio();
}

function skipPrologueImmediately() {
  stopCinema();
  cancelAnimationFrame(proRevealAnimRaf);
  window.removeEventListener('resize', handlePrologueResize);
  window.removeEventListener('pointermove', handleProloguePointerMove);
  window.removeEventListener('pointerdown', handleProloguePointerDown);
  document.removeEventListener('keydown', handlePrologueKey);
  if (proFinished) return;
  proFinished = true;
  proActive = false;
  clearPrologueTimers();
  stopPrologueAudio(0.1);
  proStarfield && proStarfield.stop();
  el.prologue.hidden = true;
  document.body.classList.remove('prologue-open');
  document.body.classList.add('prologue-done');
  setPrologueBehindInert(false);
  startBgStars();
  document.body.classList.add('app-entered');
  try { el.startBtn.focus({ preventScroll: true }); } catch (err) { /* 忽略 */ }
}

function initPrologue() {
  if (!el.prologue) { startBgStars(); return; }
  buildConstellation();
  const params = new URLSearchParams(window.location.search);
  const skip = prefersReduced || params.get('intro') === '0' || params.get('nointro') === '1';
  if (skip) {
    if(prefersReduced && params.get('intro')!=='0' && params.get('nointro')!=='1'){
      startCinemaCloth(); setPrologueBehindInert(true);
      el.introSkip.addEventListener('click',skipPrologueImmediately);
      const reducedKey=e=>{if(e.key==='Escape'){e.preventDefault();skipPrologueImmediately();}};
      document.addEventListener('keydown',reducedKey,{once:true});
      window.setTimeout(()=>{document.removeEventListener('keydown',reducedKey);skipPrologueImmediately();},450);
    }else skipPrologueImmediately();
    return;
  }

  proActive = true;
  startCinemaCloth();
  setPrologueBehindInert(true);
  el.prologue.focus({ preventScroll: true });
  proStarfield && proStarfield.refresh();
  proStarfield && proStarfield.start();
  updateActDots(0);

  PROLOGUE_TIMES.cards.forEach((at, index) => proLater(() => showProCard(index), at));
  proLater(showProFinal, PROLOGUE_TIMES.final);
  proLater(() => startPrologueReveal(false, 2500), PROLOGUE_TIMES.auto);
  proLater(showPrologueHint, 1600);

  window.addEventListener('resize', handlePrologueResize);
  window.addEventListener('pointermove', handleProloguePointerMove, { passive: true });
  window.addEventListener('pointerdown', handleProloguePointerDown, { passive: true });
  document.addEventListener('keydown', handlePrologueKey);

  if (el.introSkip) {
    el.introSkip.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      skipPrologueImmediately();
    });
  }
  if (el.proEnter) {
    el.proEnter.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      startPrologueReveal(false, 1700);
    });
  }
}


/* =========================================================
   路线图 · 行军手记 · 浮层暂停
   ========================================================= */
function pauseFor(reason) {
  if (!state.timerActive) return;
  if (pauseReasons.size === 0) {
    state.pausedAt = performance.now();
    cancelAnimationFrame(state.raf);
    el.timeRing.classList.add('is-paused');
    if (el.timeState) el.timeState.textContent = '计时暂停';
  }
  pauseReasons.add(reason);
}

function resumeFor(reason) {
  if (!pauseReasons.has(reason)) return;
  pauseReasons.delete(reason);
  if (pauseReasons.size > 0) return;
  el.timeRing.classList.remove('is-paused');
  if (!state.timerActive) return;
  if (state.pausedAt) {
    state.deadline += performance.now() - state.pausedAt;
    state.pausedAt = 0;
  }
  setTimerUI(Math.max(0, state.deadline - performance.now()));
  state.raf = requestAnimationFrame(tick);
}

function clearPauseReasons() {
  pauseReasons.clear();
  state.pausedAt = 0;
  el.timeRing.classList.remove('is-paused');
}

function syncOverlayOpen() {
  const routeOpen = document.body.classList.contains('route-open');
  const dossierOpen = el.dossier && !el.dossier.hidden;
  const helpOpen = el.help && !el.help.hidden;
  const briefOpen = el.briefing && !el.briefing.hidden;
  const open = !!(routeOpen || dossierOpen || helpOpen || briefOpen);
  document.body.classList.toggle('overlay-open', open);
  if (bgStarted && bgStarfield) {
    if (open || document.hidden) bgStarfield.stop();
    else bgStarfield.start();
  }
}

function smoothPath(points) {
  if (!points.length) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  const tension = 0.16;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) * tension;
    const c1y = p1.y + (p2.y - p0.y) * tension;
    const c2x = p2.x - (p3.x - p1.x) * tension;
    const c2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function starPath(cx, cy, outer, inner) {
  let d = '';
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return `${d}Z`;
}

function nodeStatus(index) {
  if (state.screen === 'result') return 'done';
  if (state.screen === 'game') {
    if (index < state.index) return 'done';
    if (index === state.index) return 'current';
  }
  return 'wait';
}

function nodeAria(index) {
  const stage = STAGES[index];
  const status = nodeStatus(index);
  const statusText = status === 'done' ? '已抵达' : status === 'current' ? '正在此地' : '待出发';
  return `第 ${index + 1} 站 ${stage.short}，${statusText}。按回车查看行军手记。`;
}

function initMap() {
  const d = smoothPath(MAP_POINTS);
  const gridLines = [];
  for (let x = 80; x < 520; x += 80) gridLines.push(`<line class="grid-line" x1="${x}" y1="8" x2="${x - 24}" y2="612"/>`);
  for (let y = 70; y < 620; y += 80) gridLines.push(`<line class="grid-line" x1="-10" y1="${y}" x2="540" y2="${y - 16}"/>`);

  const nodes = MAP_POINTS.map((point, index) => {
    const stage = STAGES[index];
    const dx = point.side === 'left' ? -33 : 33;
    const anchor = point.side === 'left' ? 'end' : 'start';
    const sparklets = Array.from({ length: 8 }, (_, i) => {
      const sx = (Math.random() * 36 - 18).toFixed(1);
      const sy = (-10 - Math.random() * 32).toFixed(1);
      return `<circle class="sparklet" cx="0" cy="0" r="${(0.7 + Math.random() * 1.2).toFixed(2)}" style="--sx:${sx}px;--sy:${sy}px;--d:${i}"></circle>`;
    }).join('');
    return `
      <g class="map-node${stage.key ? ' is-key' : ''}" data-index="${index}" transform="translate(${point.x} ${point.y})" tabindex="0" role="button" aria-label="${escapeHtml(nodeAria(index))}">
        <circle class="node-hit" r="38"></circle>
        <circle class="outer-glow" r="110"></circle><circle class="node-glow" r="86"></circle>
        <circle class="halo" r="25"></circle>
        <circle class="node-ring" r="21"></circle>
        <circle class="flare" r="24"></circle>
        <circle class="badge" r="${stage.key ? 27 : 23}"></circle>
        <g class="node-icon" transform="translate(-19.8 -19.8) scale(1.65)" aria-hidden="true">${NODE_ICONS[index]}</g>
        <path class="completion-star" d="${starPath(0, 0, 12, 5.2)}"></path>
        <g class="node-sparks">${sparklets}</g>
        <text class="node-name" x="${dx}" y="7" text-anchor="${anchor}" aria-hidden="true">${escapeHtml(stage.short)}</text>
      </g>`;
  }).join('');

  const svg = `
    <svg viewBox="0 0 520 620" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="长征路线星站"> 
      <defs>
        <linearGradient id="routeGold" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stop-color="#b42d20"/>
          <stop offset="52%" stop-color="#d99a45"/>
          <stop offset="100%" stop-color="#f3d8a1"/>
        </linearGradient>
        <linearGradient id="badgeGold" x1="0" y1="0" x2=".8" y2="1">
          <stop offset="0%" stop-color="#f9e7bb"/>
          <stop offset="52%" stop-color="#e3b65f"/>
          <stop offset="100%" stop-color="#b9822f"/>
        </linearGradient>
        <radialGradient id="nodeGlow">
          <stop offset="0%" stop-color="#f3d39a" stop-opacity=".85"/>
          <stop offset="45%" stop-color="#e8c485" stop-opacity=".26"/>
          <stop offset="100%" stop-color="#e8c485" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <g class="map-decor">
        ${gridLines.join('')}
        <path class="contour" d="M-30 500 C50 455 98 516 170 478 S306 410 398 452 S500 420 550 382"/>
        <path class="contour" d="M-20 536 C62 494 116 548 190 512 S330 446 420 484 S522 450 560 420"/>
        <path class="contour" d="M-30 430 C60 390 100 442 190 404 S330 352 430 390"/>
        <path class="mountain" d="M-10 574 L38 514 L82 556 L136 479 L198 556 L250 515 L310 580 L367 506 L428 572 L484 521 L540 571 L540 620 L-10 620 Z"/>
        <path class="mountain" d="M-10 598 L65 548 L124 590 L190 536 L255 596 L326 551 L394 604 L458 560 L540 608 L540 620 L-10 620 Z" opacity=".7"/>
        <path class="river" d="M-10 592 C80 566 124 608 206 580 S348 532 430 570 S508 558 540 538"/>
        <path class="faint-star" d="${starPath(66, 140, 42, 18)}"/>
        <path class="faint-star" d="${starPath(454, 330, 26, 11)}"/>
      </g>
      <path class="map-route-base" d="${d}"/>
      <path class="map-route-progress" id="routeProgress" d="${d}" stroke="url(#routeGold)"/>
      <g class="map-nodes">${nodes}</g>
    </svg>`;

  el.routeMap.innerHTML = svg;
  routePath = $('#routeMap .map-route-base');
  routeProgress = $('#routeProgress');
  routeLength = routePath.getTotalLength();
  routeProgress.style.strokeDasharray = String(routeLength);
  routeProgress.style.strokeDashoffset = String(routeLength);
  mapNodes = $$('.map-node');
  mapFractions = MAP_POINTS.map(point => {
    let best = 0;
    let bestDistance = Infinity;
    for (let i = 0; i <= 1000; i += 1) {
      const at = routePath.getPointAtLength((routeLength * i) / 1000);
      const dx = at.x - point.x;
      const dy = at.y - point.y;
      const distance = dx * dx + dy * dy;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i / 1000;
      }
    }
    return best;
  });

  el.routeMap.addEventListener('click', event => {
    const node = event.target.closest && event.target.closest('.map-node');
    if (!node) return;
    sfxClick();
    openDossier(Number(node.dataset.index));
  });
  el.routeMap.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const node = event.target.closest && event.target.closest('.map-node');
    if (!node) return;
    event.preventDefault();
    sfxClick();
    openDossier(Number(node.dataset.index));
  });
}

function updateMap(index, mode) {
  if (mode === 'complete') {
    pendingCelebration = null;
    el.routeToggle.classList.remove('has-light');
  }
  mapNodes.forEach((node, i) => {
    node.classList.remove('is-done', 'is-current');
    if (mode === 'complete') {
      node.classList.add('is-done');
    } else if (mode === 'game') {
      if (i < index) node.classList.add('is-done');
      if (i === index) node.classList.add('is-current');
    }
    node.setAttribute('aria-label', nodeAria(i));
  });
  updateRail(index, mode);
  if (mode === 'idle') resetCelebrations();
  if (!routeProgress) return;
  let fraction = 0;
  if (mode === 'complete') fraction = 1;
  else if (mode === 'game' && index > 0) fraction = mapFractions[index] || 0;
  routeProgress.style.strokeDashoffset = String(routeLength * (1 - fraction));
}

function updateRail(index, mode) {
  if (!el.journeyRail) return;
  $$('.rail-dot', el.journeyRail).forEach((dot, i) => {
    dot.classList.toggle('is-done', mode === 'complete' || (mode === 'game' && i < index));
    dot.classList.toggle('is-current', mode === 'game' && i === index);
  });
}

function initRail() {
  if (!el.journeyRail) return;
  el.journeyRail.innerHTML = STAGES.map((stage, index) => (
    `<span class="rail-dot${stage.key ? ' is-key' : ''}" title="第 ${index + 1} 站 · ${escapeHtml(stage.short)}"></span>`
  )).join('');
}

function playStageCelebration(index) {
  const node = mapNodes[index];
  if (!node) return;
  node.classList.remove('is-celebrating');
  void node.getBoundingClientRect();
  node.classList.add('is-celebrating');
  window.clearTimeout(node.celebrateTimer);
  node.celebrateTimer = window.setTimeout(() => node.classList.remove('is-celebrating'), 3400);
}

function completeMapStage(index) {
  const node = mapNodes[index];
  if (!node) return;
  node.classList.add('is-done');
  node.setAttribute('aria-label', nodeAria(index));
  if (isMobile() && !document.body.classList.contains('route-open')) {
    pendingCelebration = index;
    el.routeToggle.classList.add('has-light');
    return;
  }
  playStageCelebration(index);
}

function flushPendingCelebration() {
  if (pendingCelebration === null) return;
  const index = pendingCelebration;
  pendingCelebration = null;
  el.routeToggle.classList.remove('has-light');
  if (isMobile() && !document.body.classList.contains('route-open')) {
    pendingCelebration = index;
    el.routeToggle.classList.add('has-light');
    return;
  }
  playStageCelebration(index);
}

function resetCelebrations() {
  pendingCelebration = null;
  el.routeToggle.classList.remove('has-light');
  mapNodes.forEach(node => {
    window.clearTimeout(node.celebrateTimer);
    node.classList.remove('is-celebrating');
  });
}

function updateJourneyStatus(text) {
  el.journeyStatusText.textContent = text;
}

/* ---------- 行军手记 ---------- */
function openDossier(index) {
  const stage = STAGES[index];
  if (!stage) return;
  currentDossier = index;
  dossierReturnFocus = document.activeElement;
  const status = nodeStatus(index);
  el.dossierIndex.textContent = pad2(index + 1);
  el.dossierTitle.textContent = stage.name;
  el.dossierMeta.textContent = `${stage.date} · ${stage.place} · ${stage.key ? '险关' : `第 ${index + 1} 站`}`;
  el.dossierIntro.textContent = stage.intro;
  if (status === 'wait') {
    el.dossierNote.textContent = '抵达此地后，解锁这一段行军手记。历史就在前方，继续向前。';
    el.dossierNote.classList.add('is-locked');
    el.dossierStatus.textContent = '尚未抵达';
    el.dossierStatus.className = 'dossier-status';
  } else {
    el.dossierNote.textContent = stage.note;
    el.dossierNote.classList.remove('is-locked');
    el.dossierStatus.textContent = status === 'current' ? '正在此地' : '已抵达';
    el.dossierStatus.className = `dossier-status ${status === 'current' ? 'is-current' : 'is-done'}`;
  }
  el.dossier.hidden = false;
  el.dossier.classList.remove('is-open');
  void el.dossier.offsetWidth;
  el.dossier.classList.add('is-open');
  syncOverlayOpen();
  pauseFor('dossier');
  sfxDraw();
  requestAnimationFrame(() => el.dossierClose.focus({ preventScroll: true }));
}

function closeDossier() {
  if (!el.dossier || el.dossier.hidden) return;
  el.dossier.classList.remove('is-open');
  resumeFor('dossier');
  syncOverlayOpen();
  const focusTarget = dossierReturnFocus;
  dossierReturnFocus = null;
  window.setTimeout(() => {
    if (el.dossier.classList.contains('is-open')) return;
    el.dossier.hidden = true;
    if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus({ preventScroll: true });
    currentDossier = -1;
    syncOverlayOpen();
  }, prefersReduced ? 0 : 300);
}

/* ---------- 路线抽屉 ---------- */
function openRoute() {
  if (!isMobile()) {
    el.journeyPanel.classList.remove('map-spotlight');
    void el.journeyPanel.offsetWidth;
    el.journeyPanel.classList.add('map-spotlight');
    flushPendingCelebration();
    return;
  }
  if (document.body.classList.contains('route-open')) return;
  pauseFor('route');
  document.body.classList.add('route-open');
  el.routeToggle.setAttribute('aria-expanded', 'true');
  el.routeToggle.setAttribute('aria-label', '关闭长征路线');
  syncOverlayOpen();
  sfxClick();
  requestAnimationFrame(() => el.routeClose.focus({ preventScroll: true }));
  window.setTimeout(flushPendingCelebration, 460);
}

function closeRoute() {
  if (!document.body.classList.contains('route-open')) return;
  document.body.classList.remove('route-open');
  el.routeToggle.setAttribute('aria-expanded', 'false');
  el.routeToggle.setAttribute('aria-label', '查看长征路线');
  syncOverlayOpen();
  resumeFor('route');
  if (document.activeElement === el.routeClose || !document.activeElement) {
    el.routeToggle.focus({ preventScroll: true });
  }
  sfxClick();
}

function syncRouteForViewport() {
  if (!isMobile()) {
    if (document.body.classList.contains('route-open')) closeRoute();
    el.routeToggle.setAttribute('aria-expanded', 'false');
    if (pendingCelebration !== null) flushPendingCelebration();
  }
}


/* =========================================================
   答题流程 · 三种题型 · 星火与燎原
   ========================================================= */
const RING_CIRCUMFERENCE = 2 * Math.PI * 20.5;

function getLimit(item) {
  const mode = MODES[state.mode];
  const base = mode[item.type] || mode.choice;
  const limit = item.key ? base * KEY_TIME_FACTOR : base;
  return Math.max(8, Math.round(limit));
}

function buildRun() {
  return STAGES.map((stage, stageIndex) => {
    const source = stage.variants[Math.floor(Math.random() * stage.variants.length)];
    const key = KEY_STAGES.has(stageIndex);
    const item = {
      stage,
      stageIndex,
      type: source.type,
      key,
      q: source.q,
      hint: source.hint,
      explanation: source.why,
      challengeHint: source.challengeHint || '',
      multiplier: key ? KEY_MULTIPLIER : 1
    };
    if (source.type === 'choice') {
      const options = shuffle(source.options.map((text, index) => ({ text, correct: index === source.a })));
      item.options = options;
      item.correctIndex = options.findIndex(option => option.correct);
    } else if (source.type === 'sort') {
      item.items = shuffle(source.items.slice());
      item.order = source.order.slice();
    } else if (source.type === 'match') {
      item.pairs = source.pairs.slice();
      const lefts = shuffle(source.pairs.map(pair => ({ id: pair.id, text: pair.left })));
      let rights = shuffle(source.pairs.map(pair => ({ id: pair.id, text: pair.right })));
      let guard = 0;
      while (rights.every((right, index) => right.id === lefts[index].id) && guard < 8) {
        rights = shuffle(rights);
        guard += 1;
      }
      item.lefts = lefts;
      item.rights = rights;
    }
    return item;
  });
}

function setTimerUI(remaining) {
  const total = Math.max(1, state.limitMs + state.extraTimeMs);
  const ratio = clamp(remaining / total, 0, 1);
  const seconds = Math.max(0, Math.ceil(remaining / 1000));
  el.ringFill.style.strokeDasharray = String(RING_CIRCUMFERENCE);
  el.ringFill.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - ratio));
  el.timeLabel.textContent = String(seconds);
  if (el.timeFill) el.timeFill.style.transform = `scaleX(${ratio.toFixed(4)})`;
  const low = ratio <= 0.3 || seconds <= 8;
  const critical = (ratio <= 0.16 || seconds <= 5) && remaining > 0;
  el.timeRing.classList.toggle('is-low', low);
  el.timeRing.classList.toggle('is-critical', critical);
  el.timeRing.classList.toggle('is-key', !!(state.current && state.current.key));
  if (el.timeState) {
    let text = '从容作答';
    if (remaining <= 0) text = '时间到';
    else if (critical) text = '最后冲刺';
    else if (low) text = '时间告急';
    else if (ratio <= 0.55 || seconds <= 12) text = '注意时间';
    if (state.current && state.current.key && remaining > 0) text = `险关 · ${text}`;
    el.timeState.textContent = text;
  }
}

function tick() {
  if (!state.timerActive) return;
  const remaining = state.deadline - performance.now();
  setTimerUI(Math.max(0, remaining));
  if (remaining <= 0) {
    timeUp();
    return;
  }
  state.raf = requestAnimationFrame(tick);
}

function startTimer() {
  if (state.screen !== 'game' || !state.current || state.locked || state.timerActive) return;
  if (document.hidden || pauseReasons.size > 0 || document.body.classList.contains('route-open')
    || (el.dossier && !el.dossier.hidden) || (el.help && !el.help.hidden) || (el.briefing && !el.briefing.hidden)) {
    window.clearTimeout(state.startDelayTimer);
    state.startDelayTimer = window.setTimeout(startTimer, 280);
    return;
  }
  window.clearTimeout(state.startDelayTimer);
  state.limitMs = getLimit(state.current) * 1000;
  state.extraTimeMs = 0;
  state.deadline = performance.now() + state.limitMs;
  state.timerActive = true;
  setTimerUI(state.limitMs);
  cancelAnimationFrame(state.raf);
  state.raf = requestAnimationFrame(tick);
  syncTools();
  updateSparkUI();
}

function stopTimer() {
  state.timerActive = false;
  cancelAnimationFrame(state.raf);
}

function showScoreFloat(points) {
  if (prefersReduced || points <= 0) return;
  el.scoreFloat.textContent = `+${fmt(points)}`;
  el.scoreFloat.classList.remove('is-show');
  void el.scoreFloat.offsetWidth;
  el.scoreFloat.classList.add('is-show');
}

function updateHud() {
  el.scoreValue.textContent = fmt(state.score);
  el.scoreValue.classList.remove('is-bumped');
  void el.scoreValue.offsetWidth;
  el.scoreValue.classList.add('is-bumped');
}

function updateSparkUI(newSparks) {
  if (!el.sparkPips) return;
  const previous = typeof newSparks === 'number' ? newSparks : -1;
  el.sparkPips.innerHTML = Array.from({ length: SPARK_MAX }, (_, i) => {
    const on = i < state.sparks;
    const fresh = previous >= 0 && i >= previous && on;
    return `<i class="${on ? 'is-on' : ''}${fresh ? ' is-new' : ''}" style="animation-delay:${i * 45}ms"></i>`;
  }).join('');
  el.comboText.textContent = `连捷 ×${state.streak}`;
  el.comboText.classList.toggle('is-hot', state.streak >= 2);
  const ready = state.sparks >= SPARK_MAX && !state.blazeArmed && !state.locked && state.timerActive;
  el.blazeBtn.disabled = !ready;
  el.blazeBtn.classList.toggle('is-ready', ready);
  el.blazeActive.hidden = !state.blazeArmed;
  if (state.current) {
    el.questionCard.classList.toggle('is-blaze', state.blazeArmed);
  }
}

function activateBlaze() {
  if (state.sparks < SPARK_MAX || state.blazeArmed || state.locked || !state.timerActive || state.screen !== 'game') return;
  state.sparks = 0;
  state.blazeArmed = true;
  state.blazeUsed += 1;
  state.deadline += BLAZE_TIME_BONUS * 1000;
  state.extraTimeMs += BLAZE_TIME_BONUS * 1000;
  setTimerUI(state.deadline - performance.now());
  updateSparkUI(0);
  el.questionCard.classList.add('is-blaze');
  sfxBlaze();
  vibrate([16, 30, 16]);
  showToast('星星之火，可以燎原 · 本题积分 ×2，时限 +10 秒');
  const rect = el.blazeBtn.getBoundingClientRect();
  burstStars(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
}

function markToolUsed(name) {
  state.tools[name] = true;
  state.toolsUsed += 1;
  syncTools();
}

function toolAvailable(name) {
  if (state.screen !== 'game' || state.locked || !state.current || !state.timerActive) return false;
  if (state.tools[name]) return false;
  const type = state.current.type;
  if (name === 'eye') {
    if (type === 'choice') return $$('.option:not(.is-gone)', el.challenge).length >= 3;
    if (type === 'sort') return !state.sortPinned && state.sortSelection.length < state.current.items.length;
    if (type === 'match') {
      const all = state.current.pairs.every(pair => state.matchPairs[pair.id] === pair.id && state.matchLocked.has(`left:${pair.id}`));
      return !all && Object.keys(state.matchPairs).length < state.current.pairs.length;
    }
    return false;
  }
  if (name === 'time') return state.timerActive;
  return true;
}

function syncTools() {
  const type = state.current ? state.current.type : 'choice';
  const eyeLabels = {
    choice: ['排除两项', '火眼：排除两个错误选项'],
    sort: ['点出首项', '火眼：点出排序正确的第一项'],
    match: ['连对一组', '火眼：自动连成一组正确配对']
  };
  const eyeMeta = eyeLabels[type] || eyeLabels.choice;
  const meta = {
    eye: eyeMeta[0],
    time: '+10 秒',
    hint: '一条线索'
  };
  $$('.tool-btn', el.toolStrip).forEach(button => {
    const name = button.dataset.tool;
    const spent = state.tools[name];
    const available = toolAvailable(name);
    button.disabled = spent || !available;
    button.classList.toggle('is-spent', spent);
    button.querySelector('.tool-count').textContent = spent ? '0' : '1';
    const small = button.querySelector('.tool-copy small');
    if (small) small.textContent = meta[name] || '';
    const label = {
      eye: `${eyeMeta[1]}，${spent ? '本局已使用' : available ? '可用' : '当前不可用'}`,
      time: `疾行：本题延长 10 秒，${spent ? '本局已使用' : available ? '可用' : '当前不可用'}`,
      hint: `参谋：给出一条线索，${spent ? '本局已使用' : '可用'}`
    }[name];
    button.setAttribute('aria-label', label);
  });
}

function useTool(name) {
  if (!toolAvailable(name)) return;
  const type = state.current.type;
  if (name === 'eye') {
    if (type === 'choice') {
      const indexes = state.current.options.map((option, index) => index).filter(index => index !== state.current.correctIndex);
      shuffle(indexes).slice(0, 2).forEach(index => {
        const button = $$('.option', el.challenge)[index];
        if (!button) return;
        button.classList.add('is-gone');
        button.disabled = true;
        button.setAttribute('aria-disabled', 'true');
      });
      showToast('火眼 · 已排除两个错误选项');
    } else if (type === 'sort') {
      const first = state.current.order[0];
      state.sortPinned = first;
      state.sortSelection = [first];
      updateSortState();
      showToast('火眼 · 已点出第一项');
    } else if (type === 'match') {
      const pair = state.current.pairs.find(item => state.matchPairs[item.id] !== item.id && !state.matchLocked.has(`left:${item.id}`));
      if (pair) {
        Object.keys(state.matchPairs).forEach(leftId => {
          if (leftId === pair.id || state.matchPairs[leftId] === pair.id) delete state.matchPairs[leftId];
        });
        state.matchPairs[pair.id] = pair.id;
        state.matchLocked.add(`left:${pair.id}`);
        state.matchLocked.add(`right:${pair.id}`);
        state.matchSelected = null;
        updateMatchState();
        showToast('火眼 · 已连成一组正确配对');
      }
    }
    markToolUsed('eye');
    sfxTool();
    return;
  }
  if (name === 'time') {
    state.deadline += TOOL_TIME_BONUS * 1000;
    state.extraTimeMs += TOOL_TIME_BONUS * 1000;
    setTimerUI(state.deadline - performance.now());
    markToolUsed('time');
    sfxTool();
    showToast('疾行 · 本题时限延长 10 秒');
    return;
  }
  if (name === 'hint') {
    el.hintText.textContent = state.current.hint;
    el.hintBox.hidden = false;
    markToolUsed('hint');
    sfxTool();
    showToast('参谋 · 已呈上一条线索');
    if (isMobile()) el.hintBox.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'nearest' });
  }
}

/* ---------- 渲染 ---------- */
function renderQuestion() {
  const item = state.run[state.index];
  if (!item) return;
  if (matchResizeObserver) {
    matchResizeObserver.disconnect();
    matchResizeObserver = null;
  }
  state.current = item;
  state.locked = false;
  state.timerActive = false;
  state.transitioning = false;
  state.briefingPending = false;
  state.sortSelection = [];
  state.sortPinned = null;
  state.sortTimer = 0;
  state.matchPairs = {};
  state.matchSelected = null;
  state.matchLocked = new Set();
  state.matchConfirmed = false;
  state.blazeArmed = false;
  clearPauseReasons();
  stopTimer();
  window.clearTimeout(state.startDelayTimer);
  el.questionCard.classList.remove('is-out', 'is-key', 'is-blaze');
  el.toast.classList.remove('is-show');
  el.questionCard.classList.toggle('is-key', item.key);
  el.feedback.hidden = true;
  el.sourceCard.hidden = true;
  el.feedback.classList.remove('is-wrong');
  el.nextBtn.hidden = true;
  el.hintBox.hidden = true;
  el.hintText.textContent = '';
  el.keyTag.hidden = !item.key;
  el.typeTag.textContent = TYPE_LABELS[item.type];
  el.stageIntro.textContent = item.stage.intro;
  el.questionText.textContent = item.q;
  el.cardStationName.textContent = item.stage.name;
  el.cardIndex.textContent = `${pad2(state.index + 1)} / ${STAGES.length}`;
  el.hudStationNo.textContent = pad2(state.index + 1);
  el.hudStationName.textContent = item.stage.name;
  el.hudStationMeta.textContent = `${item.stage.date} · ${item.stage.place}${item.key ? ' · 险关' : ''} · ${MODES[state.mode].label}`;
  el.nextLabel.textContent = state.index === state.run.length - 1 ? '完成长征' : '前往下一站';
  el.keyboardHint.textContent = keyboardHintFor(item.type);
  el.timeRing.classList.remove('is-low', 'is-critical', 'is-paused');
  state.limitMs = getLimit(item) * 1000;
  state.extraTimeMs = 0;
  setTimerUI(state.limitMs);
  el.challenge.innerHTML = '';
  if (item.type === 'choice') renderChoice(item);
  else if (item.type === 'sort') renderSort(item);
  else renderMatch(item);
  updateHud();
  updateSparkUI();
  syncTools();
  updateMap(state.index, 'game');
  updateJourneyStatus(`第 ${state.index + 1} 站${item.key ? ' · 险关' : ''} · ${item.stage.name}`);
  el.questionCard.classList.remove('is-enter');
  void el.questionCard.offsetWidth;
  el.questionCard.classList.add('is-enter');
  window.scrollTo({ top: 0, behavior: 'auto' });
  requestAnimationFrame(() => {
    el.questionText.focus({ preventScroll: true });
    if (item.key) showBriefing(item);
    else {
      state.startDelayTimer = window.setTimeout(startTimer, prefersReduced ? 60 : 480);
    }
  });
}

function keyboardHintFor(type) {
  if (type === 'choice') return '按 1—4 作答 · Q/W/E 锦囊 · R 燎原';
  if (type === 'sort') return '按 1—4 依次点选 · Q/W/E 锦囊 · R 燎原';
  return '点选左右配对 · Q/W/E 锦囊 · R 燎原';
}

function renderChoice(item) {
  const wrap = document.createElement('div');
  wrap.className = 'options';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-labelledby', 'questionText');
  item.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option';
    button.dataset.index = String(index);
    button.style.setProperty('--i', String(index));
    button.setAttribute('aria-label', `${letter(index)}. ${option.text}`);
    button.innerHTML = `
      <span class="option-key" aria-hidden="true">${letter(index)}</span>
      <span class="option-text"></span>
      <span class="option-icon" aria-hidden="true">
        <svg class="mark-ok" viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9"/></svg>
        <svg class="mark-no" viewBox="0 0 20 20"><path d="M5 5l10 10M15 5L5 15"/></svg>
      </span>`;
    button.querySelector('.option-text').textContent = option.text;
    button.addEventListener('click', () => selectChoice(index));
    wrap.appendChild(button);
  });
  el.challenge.appendChild(wrap);
}

function renderSort(item) {
  const wrap = document.createElement('div');
  wrap.className = 'sort-wrap';
  const hint = document.createElement('p');
  hint.className = 'challenge-hint';
  hint.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M4 12h14M4 17h7"/><path d="M18 5v6M15.5 8.5L18 11l2.5-2.5"/></svg>';
  hint.appendChild(document.createTextNode(item.challengeHint || '按时间先后依次点选'));
  wrap.appendChild(hint);
  const list = document.createElement('div');
  list.className = 'sort-list';
  list.id = 'sortList';
  list.setAttribute('role', 'group');
  list.setAttribute('aria-label', '排序词条，按时间先后依次点选');
  item.items.forEach((entry, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sort-item';
    button.dataset.id = entry.id;
    button.style.setProperty('--i', String(index));
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = '<span class="sort-order" aria-hidden="true"></span><span class="sort-text"></span>';
    button.querySelector('.sort-text').textContent = entry.text;
    button.addEventListener('click', () => pickSort(entry.id));
    list.appendChild(button);
  });
  wrap.appendChild(list);
  const actions = document.createElement('div');
  actions.className = 'sort-actions';
  const status = document.createElement('span');
  status.className = 'sort-status';
  status.id = 'sortStatus';
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'sort-reset';
  reset.id = 'sortReset';
  reset.textContent = '重新排序';
  reset.addEventListener('click', resetSort);
  actions.append(status, reset);
  wrap.appendChild(actions);
  el.challenge.appendChild(wrap);
  updateSortState();
}

function renderMatch(item) {
  const wrap = document.createElement('div');
  wrap.className = 'match-wrap';
  const hint = document.createElement('p');
  hint.className = 'challenge-hint';
  hint.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7H5a3 3 0 000 6h4M15 7h4a3 3 0 010 6h-4"/><path d="M8 10h8"/></svg>';
  hint.appendChild(document.createTextNode(item.challengeHint || '先点左侧，再点右侧，连成一组'));
  wrap.appendChild(hint);

  const board = document.createElement('div');
  board.className = 'match-board';
  board.id = 'matchBoard';
  const left = document.createElement('div');
  left.className = 'match-col left';
  left.innerHTML = '<p class="match-head">词条 / 地点</p>';
  item.lefts.forEach((entry, index) => {
    left.appendChild(matchButton('left', entry, index));
  });
  const right = document.createElement('div');
  right.className = 'match-col right';
  right.innerHTML = '<p class="match-head">史实 / 精神</p>';
  item.rights.forEach((entry, index) => {
    right.appendChild(matchButton('right', entry, index));
  });
  const lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  lines.setAttribute('class', 'match-lines');
  lines.id = 'matchLines';
  lines.setAttribute('aria-hidden', 'true');
  board.append(left, right, lines);
  wrap.appendChild(board);

  const actions = document.createElement('div');
  actions.className = 'match-actions';
  const status = document.createElement('span');
  status.className = 'match-status';
  status.id = 'matchStatus';
  const rightActions = document.createElement('span');
  rightActions.style.display = 'inline-flex';
  rightActions.style.gap = '6px';
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'match-reset';
  reset.textContent = '重连';
  reset.addEventListener('click', resetMatch);
  const confirm = document.createElement('button');
  confirm.type = 'button';
  confirm.className = 'match-confirm';
  confirm.id = 'matchConfirm';
  confirm.textContent = '确认配对';
  confirm.disabled = true;
  confirm.addEventListener('click', confirmMatch);
  rightActions.append(reset, confirm);
  actions.append(status, rightActions);
  wrap.appendChild(actions);
  el.challenge.appendChild(wrap);

  board.addEventListener('click', event => {
    const button = event.target.closest && event.target.closest('.match-item');
    if (!button) return;
    selectMatch(button.dataset.side, button.dataset.id);
  });

  updateMatchState();
  requestAnimationFrame(updateMatchLines);
  if (matchResizeObserver) matchResizeObserver.disconnect();
  if (window.ResizeObserver) {
    matchResizeObserver = new ResizeObserver(() => updateMatchLines());
    matchResizeObserver.observe(board);
  }
}

function matchButton(side, entry, index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'match-item';
  button.dataset.side = side;
  button.dataset.id = entry.id;
  button.style.setProperty('--i', String(index));
  button.setAttribute('aria-pressed', 'false');
  button.innerHTML = '<span class="match-num" aria-hidden="true"></span><span class="match-text"></span>';
  button.querySelector('.match-text').textContent = entry.text;
  return button;
}

/* ---------- 选择 / 排序 / 配对 ---------- */
function selectChoice(index) {
  if (state.locked || state.screen !== 'game' || !state.current || state.current.type !== 'choice') return;
  state.locked = true;
  stopTimer();
  const correct = index === state.current.correctIndex;
  const buttons = $$('.option', el.challenge);
  buttons.forEach((button, i) => {
    button.disabled = true;
    if (i === state.current.correctIndex) button.classList.add('is-correct');
    if (i === index) {
      button.classList.add('is-picked');
      if (!correct) button.classList.add('is-wrong');
    } else if (i !== state.current.correctIndex) {
      button.classList.add('is-dimmed');
    }
  });
  resolveRound(correct, { pickedIndex: index, timeout: false });
}

function updateSortState() {
  const list = $('#sortList');
  if (!list) return;
  const selection = state.sortSelection;
  $$('.sort-item', list).forEach(button => {
    const id = button.dataset.id;
    const index = selection.indexOf(id);
    const picked = index >= 0;
    const pinned = state.sortPinned === id;
    button.classList.toggle('is-picked', picked);
    button.classList.toggle('is-pinned', pinned);
    button.querySelector('.sort-order').textContent = picked ? String(index + 1) : '';
    button.setAttribute('aria-pressed', String(picked));
    button.setAttribute('aria-label', `${picked ? `第 ${index + 1} 位，` : ''}${button.querySelector('.sort-text').textContent}${pinned ? '，已锁定为首项' : ''}`);
  });
  const status = $('#sortStatus');
  if (status) {
    status.textContent = selection.length === state.current.items.length
      ? '排序完成，正在判定'
      : `已选 ${selection.length} / ${state.current.items.length} · 依次点选`;
  }
  const reset = $('#sortReset');
  if (reset) reset.disabled = state.locked || selection.length === 0 || selection.length === state.current.items.length;
  syncTools();
}

function pickSort(id) {
  if (state.locked || state.screen !== 'game' || !state.current || state.current.type !== 'sort') return;
  if (state.sortPinned === id) return;
  if (state.sortSelection.length === state.current.items.length) return;
  const index = state.sortSelection.indexOf(id);
  if (index >= 0) {
    state.sortSelection.splice(index, 1);
    updateSortState();
    sfxClick();
    return;
  }
  state.sortSelection.push(id);
  updateSortState();
  sfxClick();
  if (state.sortSelection.length === state.current.items.length) {
    window.clearTimeout(state.sortTimer);
    state.sortTimer = window.setTimeout(evaluateSort, prefersReduced ? 30 : 380);
    const reset = $('#sortReset');
    if (reset) reset.disabled = true;
  }
}

function resetSort() {
  if (state.locked) return;
  state.sortSelection = state.sortPinned ? [state.sortPinned] : [];
  updateSortState();
  sfxClick();
}

function evaluateSort() {
  if (state.locked || !state.current || state.current.type !== 'sort') return;
  window.clearTimeout(state.sortTimer);
  state.locked = true;
  stopTimer();
  const picked = state.sortSelection.slice();
  const order = state.current.order;
  const correct = picked.length === order.length && picked.every((id, index) => id === order[index]);
  $$('.sort-item', el.challenge).forEach(button => {
    const id = button.dataset.id;
    const pickedIndex = picked.indexOf(id);
    if (pickedIndex >= 0 && pickedIndex === order.indexOf(id)) button.classList.add('is-correct');
    else if (pickedIndex >= 0) button.classList.add('is-wrong');
    else button.classList.add('is-dimmed');
    button.disabled = true;
  });
  const status = $('#sortStatus');
  if (status) status.textContent = correct ? '判定完成 · 顺序正确' : '判定完成 · 顺序有误';
  const reset = $('#sortReset');
  if (reset) reset.disabled = true;
  resolveRound(correct, {
    pickedIndex: null,
    timeout: false,
    sortPicked: picked,
    sortOrder: order.slice()
  });
}

function matchKey(side, id) { return `${side}:${id}`; }

function reversePairs() {
  const reverse = {};
  Object.keys(state.matchPairs).forEach(leftId => {
    reverse[state.matchPairs[leftId]] = leftId;
  });
  return reverse;
}

function updateMatchState() {
  const board = $('#matchBoard');
  if (!board) return;
  const reverse = reversePairs();
  const leftOrder = state.current.lefts.map(entry => entry.id);
  $$('.match-item', board).forEach(button => {
    const side = button.dataset.side;
    const id = button.dataset.id;
    let leftId = null;
    let rightId = null;
    if (side === 'left') {
      if (state.matchPairs[id]) {
        leftId = id;
        rightId = state.matchPairs[id];
      }
    } else if (reverse[id]) {
      leftId = reverse[id];
      rightId = id;
    }
    const paired = !!(leftId && rightId);
    const selected = !!(state.matchSelected && state.matchSelected.side === side && state.matchSelected.id === id);
    const locked = state.matchLocked.has(matchKey(side, id));
    let pairIndex = -1;
    if (paired) pairIndex = leftOrder.indexOf(leftId);
    button.classList.toggle('is-selected', selected);
    button.classList.toggle('is-paired', paired);
    button.classList.toggle('is-locked', locked);
    button.setAttribute('aria-pressed', String(selected || paired));
    button.classList.remove('pair-0', 'pair-1', 'pair-2', 'is-correct', 'is-wrong', 'is-missed');
    if (paired && pairIndex >= 0 && !state.matchConfirmed) button.classList.add(`pair-${pairIndex % 3}`);
    if (state.matchConfirmed) {
      if (paired) button.classList.add(leftId === rightId ? 'is-correct' : 'is-wrong');
      else button.classList.add('is-missed');
    }
    const num = button.querySelector('.match-num');
    if (num) num.textContent = paired && pairIndex >= 0 ? String(pairIndex + 1) : '';
  });
  const count = Object.keys(state.matchPairs).length;
  const status = $('#matchStatus');
  if (status) {
    let text = state.matchConfirmed ? '配对已判定' : `已连 ${count} / ${state.current.pairs.length} 组`;
    if (!state.matchConfirmed && count < state.current.pairs.length) text += ' · 左右各点一项';
    status.textContent = text;
  }
  const confirm = $('#matchConfirm');
  if (confirm) confirm.disabled = state.locked || count < state.current.pairs.length;
  const reset = $('.match-reset', board.parentElement);
  if (reset) reset.disabled = state.locked || Object.keys(state.matchPairs).length === 0;
  updateMatchLines();
  syncTools();
}

function updateMatchLines() {
  const board = $('#matchBoard');
  const lines = $('#matchLines');
  if (!board || !lines) return;
  const boardRect = board.getBoundingClientRect();
  const width = boardRect.width;
  const height = boardRect.height;
  if (!width || !height) return;
  lines.setAttribute('viewBox', `0 0 ${width} ${height}`);
  lines.setAttribute('width', String(width));
  lines.setAttribute('height', String(height));
  const paths = [];
  Object.keys(state.matchPairs).forEach(leftId => {
    const rightId = state.matchPairs[leftId];
    const leftButton = $(`.match-item[data-side="left"][data-id="${leftId}"]`, board);
    const rightButton = $(`.match-item[data-side="right"][data-id="${rightId}"]`, board);
    if (!leftButton || !rightButton) return;
    const lr = leftButton.getBoundingClientRect();
    const rr = rightButton.getBoundingClientRect();
    const x1 = lr.right - boardRect.left - 2;
    const y1 = lr.top + lr.height / 2 - boardRect.top;
    const x2 = rr.left - boardRect.left + 2;
    const y2 = rr.top + rr.height / 2 - boardRect.top;
    const gap = Math.max(8, (x2 - x1) * 0.48);
    const leftOrder = state.current.lefts.map(entry => entry.id);
    const pairIndex = leftOrder.indexOf(leftId);
    let klass = `match-line pair-${pairIndex < 0 ? 0 : pairIndex % 3}`;
    if (state.matchConfirmed) klass += leftId === rightId ? ' is-correct' : ' is-wrong';
    paths.push(`<path class="${klass}" d="M${x1.toFixed(1)} ${y1.toFixed(1)} C${(x1 + gap).toFixed(1)} ${y1.toFixed(1)}, ${(x2 - gap).toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}"/>`);
  });
  lines.innerHTML = paths.join('');
}

function selectMatch(side, id) {
  if (state.locked || state.screen !== 'game' || !state.current || state.current.type !== 'match' || state.matchConfirmed) return;
  if (state.matchLocked.has(matchKey(side, id))) return;
  const reverse = reversePairs();
  const paired = side === 'left' ? !!state.matchPairs[id] : !!reverse[id];
  if (paired) {
    if (side === 'left') delete state.matchPairs[id];
    else {
      const leftId = reverse[id];
      if (leftId) delete state.matchPairs[leftId];
    }
    state.matchSelected = null;
    updateMatchState();
    sfxClick();
    return;
  }
  if (!state.matchSelected) {
    state.matchSelected = { side, id };
    updateMatchState();
    sfxClick();
    return;
  }
  if (state.matchSelected.side === side) {
    state.matchSelected = { side, id };
    updateMatchState();
    sfxClick();
    return;
  }
  const leftId = side === 'left' ? id : state.matchSelected.id;
  const rightId = side === 'right' ? id : state.matchSelected.id;
  Object.keys(state.matchPairs).forEach(existingLeft => {
    if (existingLeft === leftId || state.matchPairs[existingLeft] === rightId) delete state.matchPairs[existingLeft];
  });
  state.matchPairs[leftId] = rightId;
  state.matchSelected = null;
  updateMatchState();
  sfxClick();
}

function resetMatch() {
  if (state.locked) return;
  const locked = state.matchLocked;
  state.matchPairs = {};
  locked.forEach(key => {
    const [side, id] = key.split(':');
    if (side === 'left' && id) state.matchPairs[id] = id;
  });
  state.matchSelected = null;
  updateMatchState();
  sfxClick();
}

function confirmMatch() {
  if (state.locked || !state.current || state.current.type !== 'match' || state.matchConfirmed) return;
  if (Object.keys(state.matchPairs).length < state.current.pairs.length) return;
  state.locked = true;
  state.matchConfirmed = true;
  state.matchSelected = null;
  stopTimer();
  const pairs = Object.assign({}, state.matchPairs);
  const correct = state.current.pairs.every(pair => pairs[pair.id] === pair.id);
  updateMatchState();
  resolveRound(correct, {
    pickedIndex: null,
    timeout: false,
    matchPairs: pairs,
    matchCorrectPairs: state.current.pairs.reduce((acc, pair) => { acc[pair.id] = pair.id; return acc; }, {})
  });
}

/* ---------- 判定 ---------- */
function currentRemaining() {
  return Math.max(0, state.deadline - performance.now());
}

function pointsFor(item, remaining) {
  const total = Math.max(1, state.limitMs + state.extraTimeMs);
  const ratio = clamp(remaining / total, 0, 1);
  const base = item.type === 'choice' ? 100 : 140;
  const timeBonus = Math.round((item.type === 'choice' ? 55 : 65) * ratio);
  const streakBonus = Math.min(Math.max(state.streak - 1, 0) * 20, 80);
  let points = base + timeBonus + streakBonus;
  if (item.key) points *= KEY_MULTIPLIER;
  if (state.blazeArmed) points *= BLAZE_MULTIPLIER;
  points *= MODES[state.mode].score;
  return Math.round(points);
}

function pointsTags(item, usedBlaze) {
  const tags = [];
  if (item.key) tags.push('险关 ×1.5');
  if (usedBlaze) tags.push('燎原 ×2');
  if (MODES[state.mode].score !== 1) tags.push(`难度 ×${MODES[state.mode].score}`);
  return tags;
}

function answerTextFor(item, pickedIndex, sortPicked, matchPairs) {
  if (item.type === 'choice') {
    return `正确答案：<b>${letter(item.correctIndex)}. ${escapeHtml(item.options[item.correctIndex].text)}</b>`;
  }
  if (item.type === 'sort') {
    const lookup = {};
    item.items.forEach(entry => { lookup[entry.id] = entry.text; });
    const text = item.order.map((id, index) => `${index + 1}. ${escapeHtml(lookup[id] || '')}`).join('　');
    if (sortPicked && sortPicked.some((id, index) => id !== item.order[index])) {
      return `正确顺序：<b>${text}</b>`;
    }
    return `正确顺序：<b>${text}</b>`;
  }
  if (item.type === 'match') {
    const text = item.pairs.map(pair => `${escapeHtml(pair.left)} ↔ ${escapeHtml(pair.right)}`).join('；');
    return `正确配对：<b>${text}</b>`;
  }
  return '';
}

function renderSourceCard(stageIndex) {
  const card = HISTORY_CARDS[stageIndex];
  if (!card || !el.sourceCard) {
    if (el.sourceCard) el.sourceCard.hidden = true;
    return;
  }
  el.sourceCard.hidden = false;
  el.sourceCardKicker.textContent = `史料卡 · 第 ${pad2(stageIndex + 1)} 张 / 共 ${HISTORY_CARDS.length} 张`;
  el.sourceCardDate.textContent = card.date;
  el.sourceCardTitle.textContent = card.title;
  el.sourceCardFacts.textContent = '';
  card.facts.forEach(fact => {
    const li = document.createElement('li');
    li.textContent = fact;
    el.sourceCardFacts.appendChild(li);
  });
  el.sourceCardSource.textContent = '据中共中央党史和文献研究院等公开资料整理 · 本卡为学习辅助';
}

function resolveRound(correct, meta) {
  const item = state.current;
  if (!item) return;
  state.locked = true;
  el.toast.classList.remove('is-show');
  const wasTimerRunning = state.timerActive;
  stopTimer();
  state.timerActive = false;
  window.clearTimeout(state.sortTimer);
  const timeout = !!meta.timeout;
  const remaining = wasTimerRunning || !timeout ? currentRemaining() : 0;
  const elapsed = Math.max(0, state.limitMs + state.extraTimeMs - remaining);
  const usedBlaze = state.blazeArmed;
  const prevSparks = state.sparks;
  let points = 0;
  let sparkGain = 0;

  if (correct) {
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.fastestCorrect = state.fastestCorrect === null ? elapsed : Math.min(state.fastestCorrect, elapsed);
    points = pointsFor(item, remaining);
    state.score += points;
    state.correctCount += 1;
    if (item.key) state.keyCorrect += 1;
    if (item.type === 'sort' || item.type === 'match') state.typeCorrect[item.type] = true;
    sparkGain = 1 + (state.streak >= 3 ? 1 : 0);
    state.sparks = clamp(prevSparks + sparkGain, 0, SPARK_MAX);
    sfxCorrect();
    vibrate(16);
  } else {
    state.streak = 0;
    state.sparks = Math.max(0, prevSparks - 1);
    if (timeout) { sfxTimeout(); vibrate([36, 60, 36]); }
    else { sfxWrong(); vibrate([26, 40, 26]); }
  }
  state.blazeArmed = false;
  el.questionCard.classList.remove('is-blaze');

  updateHud();
  if (points > 0) showScoreFloat(points);
  updateSparkUI(prevSparks);

  const badge = timeout ? '时限已到' : correct ? '回答正确' : '回答有误';
  el.feedback.hidden = false;
  el.feedback.classList.toggle('is-wrong', !correct);
  el.feedbackBadge.textContent = badge;
  const tags = pointsTags(item, usedBlaze);
  el.feedbackPoints.textContent = points > 0
    ? `+${fmt(points)} 分${tags.length ? ' · ' + tags.join(' · ') : ''}`
    : (usedBlaze ? '燎原未成 · 未得分' : '未得分');
  el.answerLine.innerHTML = answerTextFor(item, meta.pickedIndex, meta.sortPicked, meta.matchPairs);
  el.explanation.textContent = item.explanation;
  renderSourceCard(item.stageIndex);
  el.nextBtn.hidden = false;
  el.keyboardHint.textContent = '按 Enter 继续';
  updateJourneyStatus(correct
    ? `通过 ${item.stage.name} · 继续前进`
    : `记住 ${item.stage.name} · 继续前进`);
  completeMapStage(state.index);

  state.answers.push({
    stageIndex: state.index,
    stageShort: item.stage.short,
    stageName: item.stage.name,
    type: item.type,
    question: item.q,
    options: item.options || null,
    correctIndex: item.correctIndex,
    pickedIndex: meta.pickedIndex,
    sortPicked: meta.sortPicked || null,
    sortOrder: item.type === 'sort' ? item.order.slice() : null,
    sortItems: item.type === 'sort' ? item.items.map(entry => ({ id: entry.id, text: entry.text })) : null,
    matchPairs: meta.matchPairs || null,
    matchCorrect: item.type === 'match' ? item.pairs.map(pair => ({ id: pair.id, left: pair.left, right: pair.right })) : null,
    timeout,
    correct,
    key: item.key,
    points,
    explanation: item.explanation,
    sparks: state.sparks
  });

  syncTools();
  requestAnimationFrame(() => {
    if (isMobile()) el.feedback.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'nearest' });
    el.nextBtn.focus({ preventScroll: isMobile() });
  });
}

function revealTimeoutAnswer() {
  const item = state.current;
  if (!item) return;
  if (item.type === 'choice') {
    $$('.option', el.challenge).forEach((button, index) => {
      button.disabled = true;
      if (index === item.correctIndex) button.classList.add('is-correct');
      else button.classList.add('is-dimmed');
    });
  } else if (item.type === 'sort') {
    $$('.sort-item', el.challenge).forEach(button => {
      button.disabled = true;
      button.classList.remove('is-picked');
      button.classList.add('is-dimmed');
    });
    const status = $('#sortStatus');
    if (status) status.textContent = '时限已到 · 顺序已揭示';
  } else if (item.type === 'match') {
    state.matchConfirmed = true;
    state.matchSelected = null;
    updateMatchState();
  }
}

function timeUp() {
  if (state.locked || state.screen !== 'game' || !state.current) return;
  state.locked = true;
  state.timerActive = false;
  cancelAnimationFrame(state.raf);
  setTimerUI(0);
  revealTimeoutAnswer();
  syncTools();
  resolveRound(false, { pickedIndex: null, timeout: true });
}

function nextQuestion() {
  if (!state.locked || el.nextBtn.hidden || state.transitioning) return;
  if (state.screen !== 'game') return;
  sfxClick();
  if (state.index >= state.run.length - 1) {
    endGame();
    return;
  }
  state.transitioning = true;
  el.questionCard.classList.add('is-out');
  window.setTimeout(() => {
    state.index += 1;
    renderQuestion();
  }, prefersReduced ? 0 : 190);
}

function endGame() {
  stopTimer();
  state.locked = true;
  cancelAnimationFrame(state.raf);
  syncTools();
  const rank = getRank();
  const previousBest = bestScore;
  const isRecord = state.score > previousBest;
  saveBest(state.mode, state.score);
  bestScore = loadBest(state.mode);
  const newMarks = evaluateMarks();
  const rankIndex = RANKS.indexOf(rank);
  state.lastResult = { rank, isRecord, previousBest, newMarks };
  renderResult(rank, isRecord, newMarks);
  showScreen('result');
  updateMap(STAGES.length - 1, 'complete');
  updateJourneyStatus('征途完成 · 胜利会师');
  sfxComplete();
  if (state.correctCount >= 8) sparkBurst();
  requestAnimationFrame(() => {
    el.resultTitle.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });
  if (rankIndex === 0) {
    window.setTimeout(() => { if (state.screen === 'result') sparkBurst(); }, 700);
  }
}


/* =========================================================
   界面渲染 · 结算 · 浮层 · 事件
   ========================================================= */
let bgStarted = false;
let bgResizeTimer = 0;

function startBgStars() {
  if (bgStarted) return;
  bgStarted = true;
  if (!bgStarfield) return;
  bgStarfield.refresh();
  bgStarfield.start();
}

function renderBest() {
  const mode = MODES[state.mode];
  if (bestScore > 0) {
    el.bestScoreText.textContent = fmt(bestScore);
    el.bestNote.textContent = `历史最佳 · ${mode.label}`;
  } else {
    el.bestScoreText.textContent = '—';
    el.bestNote.textContent = '尚未启程';
  }
  el.bestModeLabel.textContent = mode.label;
}

function renderMarkShelf() {
  if (!el.startMarks) return;
  el.startMarks.textContent = '';
  MARKS.forEach(mark => {
    const unlocked = unlockedMarks.has(mark.id);
    const item = document.createElement('span');
    item.className = `mark${unlocked ? ' is-unlocked' : ''}`;
    item.title = `${mark.name} · ${mark.desc}`;
    item.setAttribute('aria-label', `行军印记：${mark.name}，${unlocked ? '已点亮' : '未点亮'}`);
    const seal = document.createElement('i');
    seal.textContent = mark.seal;
    const name = document.createElement('em');
    name.textContent = mark.name;
    item.append(seal, name);
    el.startMarks.appendChild(item);
  });
  el.marksCount.textContent = `${unlockedMarks.size} / ${MARKS.length}`;
}

function updateModeUI() {
  const mode = MODES[state.mode];
  $$('.mode-card', el.modeSelect).forEach(card => {
    card.setAttribute('aria-checked', String(card.dataset.mode === state.mode));
  });
  el.modeNote.textContent = `${mode.label} · 单选 ${mode.choice} 秒 / 排序 ${mode.sort} 秒 · 积分 ×${mode.score}`;
  el.modeChip.textContent = mode.label;
}

function selectMode(mode) {
  if (!MODES[mode] || mode === state.mode) return;
  state.mode = mode;
  saveValue(STORAGE.mode, mode);
  bestScore = loadBest(mode);
  updateModeUI();
  renderBest();
  sfxClick();
}

function renderStart() {
  bestScore = loadBest(state.mode);
  updateModeUI();
  renderBest();
  renderMarkShelf();
  updateMap(-1, 'idle');
  updateJourneyStatus('等待出发 · 十二站征途');
  el.modeChip.hidden = true;
}

function showScreen(name) {
  state.screen = name;
  el.startScreen.hidden = name !== 'start';
  el.gameScreen.hidden = name !== 'game';
  el.resultScreen.hidden = name !== 'result';
  el.modeChip.hidden = name === 'start';
  document.body.classList.toggle('is-playing', name === 'game');
  if (name === 'start') {
    renderStart();
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    if (!document.body.classList.contains('prologue-open')) {
      requestAnimationFrame(() => el.startBtn.focus({ preventScroll: true }));
    }
  }
  if (name === 'game') {
    el.modeChip.hidden = false;
    el.modeChip.textContent = MODES[state.mode].label;
  }
}

function startGame() {
  initAudio();
  sfxClick();
  closeRoute();
  closeDossier();
  hideHelp();
  state.run = buildRun();
  state.index = 0;
  state.current = null;
  state.score = 0;
  state.correctCount = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.sparks = 0;
  state.blazeArmed = false;
  state.blazeUsed = 0;
  state.answers = [];
  state.locked = true;
  state.timerActive = false;
  state.tools = { eye: false, time: false, hint: false };
  state.toolsUsed = 0;
  state.fastestCorrect = null;
  state.keyCorrect = 0;
  state.typeCorrect = { sort: false, match: false };
  state.answers = [];
  state.transitioning = false;
  clearPauseReasons();
  cancelAnimationFrame(state.raf);
  window.clearTimeout(state.startDelayTimer);
  window.clearTimeout(state.sortTimer);
  bestScore = loadBest(state.mode);
  el.scoreValue.textContent = '0';
  el.scoreFloat.classList.remove('is-show');
  el.feedback.hidden = true;
  el.nextBtn.hidden = true;
  el.hintBox.hidden = true;
  el.questionCard.classList.remove('is-out', 'is-key', 'is-blaze');
  showScreen('game');
  renderQuestion();
}

function goHome() {
  closeRoute();
  closeDossier();
  hideHelp();
  stopTimer();
  state.locked = true;
  clearPauseReasons();
  showScreen('start');
}

/* ---------- 险关预告 ---------- */
function showBriefing(item) {
  if (!item || !el.briefing) return;
  state.briefingPending = true;
  el.briefingNo.textContent = `第 ${pad2(state.index + 1)} 站 · 险关`;
  el.briefingTitle.textContent = item.stage.name;
  el.briefingMeta.textContent = `${item.stage.date} · ${item.stage.place}`;
  el.briefingIntro.textContent = item.stage.intro;
  el.briefing.hidden = false;
  el.briefing.classList.remove('is-open');
  void el.briefing.offsetWidth;
  el.briefing.classList.add('is-open');
  syncOverlayOpen();
  if (el.gameScreen) el.gameScreen.inert = true;
  requestAnimationFrame(() => el.briefingEnter.focus({ preventScroll: true }));
}

function enterBriefing() {
  if (!el.briefing || el.briefing.hidden || !state.briefingPending) return;
  state.briefingPending = false;
  el.briefing.classList.remove('is-open');
  if (el.gameScreen) el.gameScreen.inert = false;
  syncOverlayOpen();
  sfxClick();
  window.setTimeout(() => {
    el.briefing.hidden = true;
    syncOverlayOpen();
    el.questionText.focus({ preventScroll: true });
    startTimer();
  }, prefersReduced ? 0 : 280);
}

/* ---------- 玩法说明 ---------- */
function showHelp() {
  if (!el.help || !el.help.hidden) return;
  helpReturnFocus = document.activeElement;
  pauseFor('help');
  el.help.hidden = false;
  el.help.classList.remove('is-open');
  void el.help.offsetWidth;
  el.help.classList.add('is-open');
  syncOverlayOpen();
  sfxClick();
  requestAnimationFrame(() => el.helpClose.focus({ preventScroll: true }));
}

function hideHelp() {
  if (!el.help || el.help.hidden) return;
  el.help.classList.remove('is-open');
  resumeFor('help');
  syncOverlayOpen();
  const target = helpReturnFocus;
  helpReturnFocus = null;
  window.setTimeout(() => {
    if (!el.help.classList.contains('is-open')) el.help.hidden = true;
    syncOverlayOpen();
    if (target && typeof target.focus === 'function') target.focus({ preventScroll: true });
  }, prefersReduced ? 0 : 300);
}

/* ---------- 成就 / 结算 ---------- */
function getRank() {
  return RANKS.find(rank => state.correctCount >= rank.min) || RANKS[RANKS.length - 1];
}

function evaluateMarks() {
  const passed = {
    first: true,
    streak: state.bestStreak >= 3,
    swift: state.fastestCorrect !== null && state.fastestCorrect <= 5000,
    tools: state.toolsUsed >= 3,
    key: state.keyCorrect === KEY_STAGES.size,
    perfect: state.correctCount === state.run.length,
    blaze: state.blazeUsed > 0,
    veteran: state.mode === 'hard' && state.correctCount >= 8
  };
  const fresh = [];
  MARKS.forEach(mark => {
    if (!unlockedMarks.has(mark.id) && passed[mark.id]) {
      unlockedMarks.add(mark.id);
      fresh.push(mark);
    }
  });
  if (fresh.length) saveMarks();
  renderMarkShelf();
  return fresh;
}

function renderNewMarks(newMarks) {
  el.resultMarks.hidden = newMarks.length === 0;
  el.resultMarksRow.textContent = '';
  newMarks.forEach(mark => {
    const item = document.createElement('span');
    item.className = 'new-mark';
    const seal = document.createElement('i');
    seal.textContent = mark.seal;
    const copy = document.createElement('span');
    const name = document.createElement('b');
    name.textContent = mark.name;
    const desc = document.createElement('small');
    desc.textContent = mark.desc;
    copy.append(name, desc);
    item.append(seal, copy);
    el.resultMarksRow.appendChild(item);
  });
}

function renderResult(rank, isRecord, newMarks) {
  const total = state.run.length;
  const accuracy = Math.round((state.correctCount / total) * 100);
  const headline = state.correctCount >= 10 ? '胜利会师' : state.correctCount >= 6 ? '征途完成' : '星火初燃';
  el.resultTitle.textContent = headline;
  el.resultSub.textContent = state.correctCount === total
    ? '十二站全胜。你用知识走完了二万五千里。'
    : '你已抵达终点，长征精神仍在路上。';
  el.rankSeal.textContent = '';
  Array.from(rank.title).forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    el.rankSeal.appendChild(span);
  });
  el.rankTitle.textContent = rank.title;
  el.rankMode.textContent = MODES[state.mode].label;
  el.rankLine.textContent = rank.line;
  el.statCorrect.textContent = `${state.correctCount} / ${total}`;
  el.statAccuracy.textContent = `${accuracy}%`;
  el.statStreak.textContent = `×${state.bestStreak}`;
  el.statKey.textContent = `${state.keyCorrect} / ${KEY_STAGES.size}`;
  el.bestNoteResult.textContent = isRecord && state.score > 0
    ? '新纪录'
    : bestScore > 0 ? `历史最佳 ${fmt(bestScore)}` : '';
  el.finalScore.textContent = '0';
  animateNumber(el.finalScore, state.score);
  renderResultRoute();
  renderNewMarks(newMarks);
  renderReview();
}

function animateNumber(element, target) {
  if (prefersReduced || target === 0) {
    element.textContent = fmt(target);
    return;
  }
  const start = performance.now();
  const duration = 1000;
  const step = now => {
    const progress = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = fmt(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function renderResultRoute() {
  el.resultRoute.innerHTML = '';
  state.answers.forEach((answer, index) => {
    const stop = document.createElement('span');
    const kind = answer.correct ? 'is-correct' : answer.timeout ? 'is-timeout' : 'is-wrong';
    stop.className = `result-stop ${kind}${answer.key ? ' is-key' : ''}`;
    stop.title = `第 ${index + 1} 站${answer.key ? ' · 险关' : ''} · ${answer.stageShort}：${answer.correct ? '回答正确' : answer.timeout ? '超时未答' : '回答错误'}`;
    el.resultRoute.appendChild(stop);
  });
  const rightCount = state.answers.filter(answer => answer.correct).length;
  el.resultRoute.setAttribute('aria-label', `十二站答题结果：答对 ${rightCount} 站，未答对 ${state.answers.length - rightCount} 站`);
}

function sortTextFromIds(ids, items) {
  if (!Array.isArray(ids) || !Array.isArray(items)) return '';
  const lookup = {};
  items.forEach(item => { lookup[item.id] = item.text; });
  return ids.map(id => lookup[id]).filter(Boolean).join(' → ');
}

function matchTextFromPairs(pairs, correctPairs) {
  if (!pairs || !correctPairs) return '';
  const lookup = {};
  correctPairs.forEach(pair => { lookup[pair.id] = pair; });
  return Object.keys(pairs).map(leftId => {
    const left = lookup[leftId];
    const right = correctPairs.find(pair => pair.id === pairs[leftId]);
    return `${left ? left.left : leftId} ↔ ${right ? right.right : pairs[leftId]}`;
  }).join('；');
}

function renderReview() {
  const wrongs = state.answers.filter(answer => !answer.correct);
  el.reviewList.innerHTML = '';
  el.reviewToggle.hidden = wrongs.length === 0;
  el.perfectNote.hidden = wrongs.length !== 0;
  el.reviewToggle.setAttribute('aria-expanded', 'false');
  el.reviewToggleText.textContent = wrongs.length ? `查看错题（${wrongs.length}）` : '查看错题';
  el.reviewList.hidden = true;

  wrongs.forEach(answer => {
    const article = document.createElement('article');
    article.className = 'review-item';

    const meta = document.createElement('div');
    meta.className = 'review-meta';
    const name = document.createElement('span');
    name.textContent = `第 ${pad2(answer.stageIndex + 1)} 站 · ${answer.stageShort}${answer.key ? ' · 险关' : ''} · ${TYPE_LABELS[answer.type] || ''}`;
    const verdict = document.createElement('span');
    verdict.className = `review-verdict${answer.timeout ? ' is-timeout' : ''}`;
    verdict.textContent = answer.timeout ? '超时未答' : '回答有误';
    meta.append(name, verdict);

    const title = document.createElement('h4');
    title.textContent = answer.question;

    const picked = document.createElement('p');
    picked.className = 'review-answer';
    const pickedLabel = document.createElement('b');
    pickedLabel.textContent = '你的作答';
    const pickedText = document.createElement('span');
    if (answer.timeout) {
      pickedText.textContent = '超时未作答';
    } else if (answer.type === 'choice') {
      pickedText.textContent = answer.pickedIndex === null ? '未作答' : `${letter(answer.pickedIndex)}. ${answer.options[answer.pickedIndex].text}`;
    } else if (answer.type === 'sort') {
      pickedText.textContent = sortTextFromIds(answer.sortPicked, answer.sortItems);
    } else {
      pickedText.textContent = matchTextFromPairs(answer.matchPairs, answer.matchCorrect);
    }
    picked.append(pickedLabel, pickedText);

    const right = document.createElement('p');
    right.className = 'review-answer is-correct';
    const rightLabel = document.createElement('b');
    rightLabel.textContent = '正确答案';
    const rightText = document.createElement('span');
    if (answer.type === 'choice') {
      rightText.textContent = `${letter(answer.correctIndex)}. ${answer.options[answer.correctIndex].text}`;
    } else if (answer.type === 'sort') {
      rightText.textContent = sortTextFromIds(answer.sortOrder, answer.sortItems);
    } else {
      rightText.textContent = answer.matchCorrect.map(pair => `${pair.left} ↔ ${pair.right}`).join('；');
    }
    right.append(rightLabel, rightText);

    const why = document.createElement('p');
    why.className = 'review-why';
    why.textContent = answer.explanation;

    article.append(meta, title, picked, right, why);
    el.reviewList.appendChild(article);
  });
}

/* ---------- 分享 ---------- */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
    area.remove();
    return copied;
  }
}

async function shareResult() {
  const rank = (state.lastResult && state.lastResult.rank) || getRank();
  const fresh = (state.lastResult && state.lastResult.newMarks) || [];
  const markLine = fresh.length ? `\n新得行军印记：${fresh.map(mark => mark.name).join('、')}` : '';
  const text = `我在「星火长征 · 重走长征路」中答对 ${state.correctCount}/${state.run.length} 题，通过 ${state.keyCorrect}/${KEY_STAGES.size} 道险关，获得「${rank.title}」，行军积分 ${fmt(state.score)} 分。\n难度：${MODES[state.mode].label} · 最高连捷 ×${state.bestStreak} · 触发燎原 ${state.blazeUsed} 次${markLine}\n从于都到会宁，十二站，二万五千里。\n纪念中国工农红军长征胜利九十周年。`;
  if (navigator.share) {
    try {
      await navigator.share({ title: '星火长征 · 重走长征路', text });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }
  const copied = await copyText(text);
  showToast(copied ? '战绩已复制，去分享吧' : '复制失败，请截图分享');
}

/* ---------- 粒子 ---------- */
function sparkBurst() {
  if (prefersReduced) return;
  for (let i = 0; i < 30; i += 1) {
    const spark = document.createElement('i');
    spark.className = 'spark';
    spark.style.left = `${Math.random() * 100}vw`;
    spark.style.width = `${3 + Math.random() * 4}px`;
    spark.style.height = `${Math.random() > 0.62 ? 9 : 5}px`;
    spark.style.background = i % 4 === 0 ? 'var(--red-bright)' : i % 3 === 0 ? 'var(--gold-bright)' : 'var(--gold)';
    spark.style.animationDelay = `${Math.random() * 0.6}s`;
    spark.style.animationDuration = `${2.4 + Math.random() * 1.8}s`;
    spark.style.opacity = String(0.4 + Math.random() * 0.5);
    el.fx.appendChild(spark);
    window.setTimeout(() => spark.remove(), 4800);
  }
}

function burstStars(x, y, count) {
  if (prefersReduced) return;
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement('i');
    star.className = 'star-burst';
    const angle = Math.random() * Math.PI * 2;
    const distance = 26 + Math.random() * 70;
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.setProperty('--bx', `${Math.cos(angle) * distance}px`);
    star.style.setProperty('--by', `${Math.sin(angle) * distance}px`);
    star.style.animationDelay = `${Math.random() * 120}ms`;
    el.fx.appendChild(star);
    window.setTimeout(() => star.remove(), 1200);
  }
}

/* ---------- 音效 UI ---------- */
function updateSoundUI() {
  el.soundToggle.setAttribute('aria-pressed', String(soundOn));
  el.soundToggle.setAttribute('aria-label', soundOn ? '关闭音效' : '开启音效');
  el.soundToggle.setAttribute('title', soundOn ? '关闭音效' : '开启音效');
}

/* ---------- 键盘 ---------- */
function handleGlobalKey(event) {
  if (!document.getElementById('expeditionModal').hidden) return;
  if (el.help && !el.help.hidden) {
    if (event.key === 'Escape') {
      event.preventDefault();
      hideHelp();
    }
    return;
  }
  if (el.dossier && !el.dossier.hidden) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDossier();
    }
    return;
  }
  if (el.briefing && !el.briefing.hidden) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      event.preventDefault();
      enterBriefing();
    }
    return;
  }
  if (document.body.classList.contains('route-open')) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeRoute();
    }
    return;
  }
  if (state.screen !== 'game') return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const target = event.target;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

  if ((event.key === 'Enter' || event.key === ' ') && target && target.closest('button,a,[role=button],[role=radio]')) return;

  if (state.locked) {
    if ((event.key === 'Enter' || event.key === ' ') && !el.nextBtn.hidden) {
      event.preventDefault();
      nextQuestion();
    }
    return;
  }

  const key = event.key.toLowerCase();
  if (key === 'r') {
    event.preventDefault();
    activateBlaze();
    return;
  }
  const toolKey = { q: 'eye', w: 'time', e: 'hint' }[key];
  if (toolKey) {
    if (toolAvailable(toolKey)) {
      event.preventDefault();
      useTool(toolKey);
    }
    return;
  }
  if (state.current && state.current.type === 'choice') {
    let index = -1;
    if (key >= '1' && key <= '4') index = Number(key) - 1;
    else if (key >= 'a' && key <= 'd') index = key.charCodeAt(0) - 97;
    if (index >= 0 && index < state.current.options.length) {
      event.preventDefault();
      const buttons = $$('.option', el.challenge);
      if (buttons[index] && !buttons[index].disabled) selectChoice(index);
    }
    return;
  }
  if (state.current && state.current.type === 'sort') {
    if (key >= '1' && key <= '4') {
      const index = Number(key) - 1;
      const buttons = $$('.sort-item', el.challenge);
      if (buttons[index]) {
        event.preventDefault();
        pickSort(buttons[index].dataset.id);
      }
    }
  }
}

/* ---------- 事件绑定 ---------- */
function initEvents() {
  el.startBtn.addEventListener('click', startGame);
  el.retryBtn.addEventListener('click', startGame);
  el.homeBtn.addEventListener('click', goHome);
  el.nextBtn.addEventListener('click', nextQuestion);
  el.shareBtn.addEventListener('click', shareResult);
  el.previewBtn.addEventListener('click', openRoute);
  el.routeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('route-open')) closeRoute();
    else openRoute();
  });
  el.routeClose.addEventListener('click', closeRoute);
  el.backdrop.addEventListener('click', closeRoute);
  el.dossierClose.addEventListener('click', closeDossier);
  el.dossierBackdrop.addEventListener('click', closeDossier);
  el.helpBtn.addEventListener('click', showHelp);
  el.helpClose.addEventListener('click', hideHelp);
  el.helpBackdrop.addEventListener('click', hideHelp);
  el.helpOk.addEventListener('click', hideHelp);
  el.briefingEnter.addEventListener('click', enterBriefing);

  el.modeSelect.addEventListener('click', event => {
    const card = event.target.closest && event.target.closest('.mode-card');
    if (!card) return;
    selectMode(card.dataset.mode);
  });

  $$('.tool-btn', el.toolStrip).forEach(button => {
    button.addEventListener('click', () => useTool(button.dataset.tool));
  });
  el.blazeBtn.addEventListener('click', activateBlaze);

  el.soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    saveValue(STORAGE.sound, soundOn ? '1' : '0');
    updateSoundUI();
    if (soundOn) {
      initAudio();
      sfxClick();
    }
  });

  el.reviewToggle.addEventListener('click', () => {
    const open = el.reviewList.hidden;
    el.reviewList.hidden = !open;
    el.reviewToggle.setAttribute('aria-expanded', String(open));
    el.reviewToggleText.textContent = open
      ? '收起错题'
      : `查看错题（${state.answers.filter(answer => !answer.correct).length}）`;
    if (open) sfxClick();
  });

  document.addEventListener('keydown', handleGlobalKey);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseFor('hidden');
      if (proActive) proStarfield && proStarfield.stop();
      if (bgStarted) bgStarfield && bgStarfield.stop();
    } else {
      resumeFor('hidden');
      if (proActive) proStarfield && proStarfield.start();
      if (bgStarted && !document.body.classList.contains('overlay-open')) bgStarfield && bgStarfield.start();
    }
  });

  window.addEventListener('resize', () => {
    syncRouteForViewport();
    if (state.screen === 'game' && state.current && state.current.type === 'match') updateMatchLines();
    window.clearTimeout(bgResizeTimer);
    bgResizeTimer = window.setTimeout(() => {
      if (bgStarted && bgStarfield) bgStarfield.refresh();
    }, 280);
  });
}

/* ---------- 调试接口（仅 ?debug=1 时暴露） ---------- */
function exposeDebug() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('debug') !== '1') return;
  window.__LM = {
    state,
    el,
    STAGES,
    MODES,
    buildRun,
    startGame,
    renderQuestion,
    nextQuestion,
    showScreen,
    openDossier,
    closeDossier,
    openRoute,
    closeRoute,
    showBriefing,
    enterBriefing,
    startTimer,
    activateBlaze,
    useTool,
    jump(index) {
      if (state.screen !== 'game') startGame();
      state.run = state.run.length ? state.run : buildRun();
      state.index = clamp(index, 0, state.run.length - 1);
      renderQuestion();
    },
    forceResult() {
      if (state.screen !== 'game') startGame();
      endGame();
    },
    answerCorrect() {
      if (state.screen !== 'game' || state.locked || !state.current) return false;
      const item = state.current;
      if (item.type === 'choice') {
        selectChoice(item.correctIndex);
      } else if (item.type === 'sort') {
        item.order.forEach((id, i) => {
          const button = $(`.sort-item[data-id="${id}"]`, el.challenge);
          if (button) button.click();
        });
      } else if (item.type === 'match') {
        item.pairs.forEach(pair => {
          const left = $(`.match-item[data-side="left"][data-id="${pair.id}"]`, el.challenge);
          const right = $(`.match-item[data-side="right"][data-id="${pair.id}"]`, el.challenge);
          if (left) left.click();
          if (right) right.click();
        });
        const confirm = $('#matchConfirm');
        if (confirm) confirm.click();
      }
      return true;
    },
    answerWrong() {
      if (state.screen !== 'game' || state.locked || !state.current) return false;
      const item = state.current;
      if (item.type === 'choice') {
        selectChoice((item.correctIndex + 1) % item.options.length);
      } else if (item.type === 'sort') {
        const wrongOrder = item.order.slice().reverse();
        wrongOrder.forEach(id => {
          const button = $(`.sort-item[data-id="${id}"]`, el.challenge);
          if (button) button.click();
        });
      } else if (item.type === 'match') {
        item.pairs.forEach((pair, index) => {
          const other = item.pairs[(index + 1) % item.pairs.length];
          const left = $(`.match-item[data-side="left"][data-id="${pair.id}"]`, el.challenge);
          const right = $(`.match-item[data-side="right"][data-id="${other.id}"]`, el.challenge);
          if (left) left.click();
          if (right) right.click();
        });
        const confirm = $('#matchConfirm');
        if (confirm) confirm.click();
      }
      return true;
    }
  };
}


/* 细节修订：模态层键盘焦点边界与模式组方向键。 */
document.addEventListener('keydown', event => {
  if (event.key === 'Tab') {
    const panel = [document.getElementById('expeditionModal'), el.help, el.briefing, el.dossier].find(node => node && !node.hidden)
      || (document.body.classList.contains('route-open') ? el.journeyPanel : null)
      || (document.body.classList.contains('prologue-open') ? document.querySelector('.prologue') : null);
    if (!panel) return;
    const controls = Array.from(panel.querySelectorAll('button:not(:disabled),a[href],[tabindex]:not([tabindex="-1"])'))
      .filter(node => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
    if (!controls.length) return;
    const first = controls[0], last = controls[controls.length - 1];
    const active = document.activeElement;
    if (!panel.contains(active) || (event.shiftKey ? active === first : active === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus({preventScroll:true});
    }
  }
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)
      && event.target.matches('.mode-card')) {
    event.preventDefault();
    const modes = Array.from(el.modeSelect.querySelectorAll('.mode-card'));
    const current = modes.indexOf(event.target);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? modes.length - 1
      : (current + (['ArrowLeft','ArrowUp'].includes(event.key) ? -1 : 1) + modes.length) % modes.length;
    modes[next].click();
    modes[next].focus();
  }
}, true);

/* 行军筹划：仅是知识游戏规则，不模拟或改写真实历史路线。 */
// 以双层会址、铁索桥与会师城楼替换泛化符号；其余保留渡船、雪山和草地。
NODE_ICONS[2]='<path d="M3 8h18L19 5H5zM5 8v13M19 8v13M3 21h18M4 13h16M7 10h2M11 10h2M15 10h2M7 15h2M15 15h2M10 21v-5h4v5"/>';
NODE_ICONS[5]='<path d="M3 3v18M21 3v18M3 6Q12 17 21 6M3 9Q12 20 21 9M3 17h18M6 11v6M9 13v4M12 14v3M15 13v4M18 11v6M4 21h16"/>';
NODE_ICONS[10]='<path d="M2 21h20M4 21V11h16v10M3 11h18L18 8H6zM6 8V5h12v3M5 5h14l-2-2H7zM10 21v-5a2 2 0 0 1 4 0v5M7 13h2M15 13h2"/>';
const expedition = { supplies:3, cap:6, bonus:0, timedStage:-1, camps:new Set(), log:[], gained:0, spent:0, drills:[], drillIndex:0, drillHits:0, returnFocus:null };
const supplyBar = document.createElement('section');
supplyBar.className='supply-ledger';
supplyBar.setAttribute('aria-label','行军补给与本站目标');
supplyBar.innerHTML='<div class="ledger-row"><span>行军补给 <b id="supplyCount">3 / 6</b></span><span id="supplyEffect">锦囊每次消耗 1</span></div><p id="stationGoal"></p>';
el.questionCard.before(supplyBar);
const modal = document.createElement('div');
modal.id='expeditionModal'; modal.className='expedition-modal'; modal.hidden=true;
modal.innerHTML='<section class="expedition-panel" role="dialog" aria-modal="true" aria-labelledby="expeditionTitle"><p class="kicker" id="expeditionKicker"></p><h2 id="expeditionTitle" tabindex="-1"></h2><p id="expeditionLead"></p><div id="expeditionBody"></div><button type="button" class="btn btn-ghost" id="expeditionClose">稍后再练</button></section>';
document.body.appendChild(modal);
const expTitle=$('#expeditionTitle'), expBody=$('#expeditionBody'), expLead=$('#expeditionLead'), expClose=$('#expeditionClose');
let expeditionKind='', continuation=null;
function supplyChange(amount){const old=expedition.supplies;expedition.supplies=clamp(old+amount,0,expedition.cap);const delta=expedition.supplies-old;if(delta>0)expedition.gained+=delta;else expedition.spent-=delta;renderLedger();return delta;}
function renderLedger(){
 $('#supplyCount').textContent=`${expedition.supplies} / ${expedition.cap}`;
 $('#supplyEffect').textContent=expedition.supplies===0?'补给不足仍可答题 · 下一处休整免费补充':'锦囊每次消耗 1 · 三连答补给 +1';
 const item=state.current;
 $('#stationGoal').textContent=item?`第 ${pad2(state.index+1)} 站目标 · ${item.type==='sort'?'按时间先后还原事件':item.type==='match'?'连成全部史实配对':'辨明一项关键史实'}${expedition.timedStage===state.index?' · 侦察生效：时限 +12 秒':''}`:'';
}
function openExpedition(kind,title,lead){
 expeditionKind=kind; expedition.returnFocus=document.activeElement;
 $('#expeditionKicker').textContent=kind==='camp'?'行军筹划 / 游戏策略':'温故知新 / 不计积分';
 expTitle.textContent=title;expLead.textContent=lead;expBody.replaceChildren();
 expClose.hidden=kind==='camp';modal.hidden=false;document.body.classList.add('overlay-open');
 pauseFor('expedition');requestAnimationFrame(()=>expTitle.focus({preventScroll:true}));
}
function closeExpedition(){
 modal.hidden=true;expeditionKind='';resumeFor('expedition');syncOverlayOpen();
 const back=expedition.returnFocus;if(back&&back.isConnected)back.focus({preventScroll:true});
}
function addExpButton(title,detail,action,disabled=false){
 const button=document.createElement('button');button.type='button';button.className='exp-choice';button.disabled=disabled;
 const strong=document.createElement('strong'), small=document.createElement('span');strong.textContent=title;small.textContent=detail;button.append(strong,small);button.addEventListener('click',action);expBody.appendChild(button);return button;
}
function chooseCamp(action){
 if(expeditionKind!=='camp')return;
 let text='';
 if(action==='rest'){const gain=supplyChange(2);text=`整顿补给 +${gain}`;}
 else if(action==='scout'){
   if(expedition.supplies<1)return;supplyChange(-1);expedition.bonus=12;expedition.timedStage=state.index+1;text='提前侦察：下一站 +12 秒';
 }else{
   const tool=action.split(':')[1];if(!state.tools[tool]||expedition.supplies<2)return;
   supplyChange(-2);state.tools[tool]=false;text=`整理锦囊：${{eye:'火眼',time:'疾行',hint:'参谋'}[tool]}恢复一次`;
 }
 expedition.camps.add(state.index);expedition.log.push(text);
 const go=continuation;continuation=null;closeExpedition();syncTools();showToast(text);if(go)go();
}
function openCamp(go){
 continuation=go;
 const next=state.run[state.index+1];
 openExpedition('camp',`抵达${state.current.stage.short} · 休整抉择`,`下一站：${next.stage.name}。选一种准备方式，不改变历史路线。补给 ${expedition.supplies}/${expedition.cap}；任何情况下都能继续。`);
 addExpButton('整顿补给','免费 · 补给 +2（最多6） · 保留锦囊供险关使用',()=>chooseCamp('rest'));
 addExpButton('提前侦察','消耗1补给 · 下一站时限 +12秒，给排序和配对多一点思考时间',()=>chooseCamp('scout'),expedition.supplies<1);
 const spent=Object.keys(state.tools).filter(key=>state.tools[key]);
 if(!spent.length){const note=document.createElement('p');note.className='exp-note';note.textContent='使用过的锦囊可在休整时消耗2补给恢复。每次休整仅选一项。';expBody.appendChild(note);}
 spent.forEach(key=>addExpButton(`整理锦囊 · ${{eye:'火眼',time:'疾行',hint:'参谋'}[key]}`,'消耗2补给 · 恢复该锦囊一次；实际使用时仍消耗1补给',()=>chooseCamp('tool:'+key),expedition.supplies<2));
}
const originalStartGame=startGame;
startGame=function(){
 Object.assign(expedition,{supplies:3,bonus:0,timedStage:-1,camps:new Set(),log:[],gained:0,spent:0});
 if(!modal.hidden)closeExpedition();originalStartGame();renderLedger();
};
const originalToolAvailable=toolAvailable;
toolAvailable=function(name){return expedition.supplies>=1&&originalToolAvailable(name);};
const originalMarkToolUsed=markToolUsed;
markToolUsed=function(name){supplyChange(-1);originalMarkToolUsed(name);};
const originalSyncTools=syncTools;
syncTools=function(){originalSyncTools();$$('.tool-btn',el.toolStrip).forEach(button=>{
 const name=button.dataset.tool;button.title=state.tools[name]?'已使用 · 休整时可恢复':expedition.supplies<1?'补给不足 · 仍可直接答题':'消耗1补给 · 本局一次，休整可恢复';
 button.setAttribute('aria-label',button.getAttribute('aria-label')+'；'+button.title);
});};
const originalGetLimit=getLimit;
getLimit=function(item){return originalGetLimit(item)+(expedition.timedStage===state.index?expedition.bonus:0);};
const originalRenderQuestion=renderQuestion;
renderQuestion=function(){originalRenderQuestion();renderLedger();el.cardIndex.textContent=`${pad2(state.index+1)} / ${state.run.length}`;};
const originalResolveRound=resolveRound;
resolveRound=function(correct,meta){
 originalResolveRound(correct,meta);
 if(correct&&state.streak%3===0){const gain=supplyChange(1);el.feedbackPoints.textContent+=gain?' · 三连答：补给 +1':' · 三连答：补给已满';}
 renderLedger();
};
const originalNextQuestion=nextQuestion;
nextQuestion=function(){
 if(!modal.hidden)return;
 if(state.screen==='game'&&state.locked&&!state.transitioning&&state.index<state.run.length-1
   &&(state.index+1)%3===0&&!expedition.camps.has(state.index)) {openCamp(originalNextQuestion);return;}
 originalNextQuestion();
};
const recap=document.createElement('section');recap.className='exp-recap';
const drillButton=document.createElement('button');drillButton.type='button';drillButton.className='btn btn-ghost';drillButton.id='drillBtn';
el.reviewToggle.before(recap,drillButton);
const originalRenderResult=renderResult;
renderResult=function(...args){originalRenderResult(...args);
 const missed=state.answers.filter(a=>!a.correct).length;
 drillButton.hidden=missed===0;drillButton.textContent=`错题重练 · ${missed} 站`;
 recap.textContent=`行军筹划 · 结余 ${expedition.supplies} 补给 · 使用 ${expedition.spent} · 连答补充 ${expedition.gained-expedition.log.filter(x=>x.startsWith('整顿')).reduce((s,x)=>s+Number(x.match(/\+(\d+)/)?.[1]||0),0)}\n${expedition.log.join(' → ')||'尚无休整记录'}`;
};
function practiceOptions(item){
 if(item.type==='choice')return {q:item.q,options:shuffle(item.options.map(o=>({text:o.text,correct:o.correct})))};
 if(item.type==='sort'){
   const ids=item.order, text=order=>order.map(id=>item.items.find(x=>x.id===id).text).join(' → ');
   const candidates=[ids,ids.slice().reverse(),[...ids.slice(1),ids[0]],[ids[1],ids[0],...ids.slice(2)]];
   const unique=[...new Map(candidates.map((ids,i)=>[text(ids),{text:text(ids),correct:i===0}])).values()];
   return {q:item.q+'（请选择正确顺序）',options:shuffle(unique)};
 }
 const pair=item.pairs[expedition.drillIndex%item.pairs.length];
 return {q:`${item.q} · 「${pair.left}」对应哪项？`,options:shuffle(item.pairs.map(p=>({text:p.right,correct:p.id===pair.id})))};
}
function showDrill(){
 const item=expedition.drills[expedition.drillIndex];
 if(!item){
   expTitle.textContent='温故知新 · 本轮完成';expLead.textContent=`首答掌握 ${expedition.drillHits} / ${expedition.drills.length} 站。不改写本局战绩；可再次挑战十二站。`;
   expBody.replaceChildren();addExpButton('返回行军战报','保留原始积分与错题记录',closeExpedition);return;
 }
 const quiz=practiceOptions(item);
 expTitle.textContent=`${item.stage.short} · ${expedition.drillIndex+1}/${expedition.drills.length}`;
 expLead.textContent=quiz.q;expBody.replaceChildren();
 let done=false;
 quiz.options.forEach(option=>addExpButton(option.text,'选择后查看史实解析',()=>{
   if(done)return;done=true;if(option.correct)expedition.drillHits++;
   expBody.querySelectorAll('button').forEach((b,i)=>{b.disabled=true;b.classList.toggle('is-answer',quiz.options[i].correct);});
   const explain=document.createElement('p');explain.className='drill-explanation';explain.setAttribute('role','status');
   explain.textContent=(option.correct?'回答正确。':'再记住这一站。')+' 正确答案：'+quiz.options.find(o=>o.correct).text+'。'+item.explanation;expBody.appendChild(explain);
   const next=addExpButton('下一题 / 完成','继续复习，不计时、不消耗补给',()=>{expedition.drillIndex++;showDrill();});next.focus();
 }));requestAnimationFrame(()=>expTitle.focus({preventScroll:true}));
}
drillButton.addEventListener('click',()=>{
 expedition.drills=state.answers.filter(a=>!a.correct).map(a=>state.run[a.stageIndex]);expedition.drillIndex=0;expedition.drillHits=0;
 openExpedition('drill','错题重练','');showDrill();
});
expClose.addEventListener('click',closeExpedition);
document.addEventListener('keydown',event=>{
 if(modal.hidden)return;
 if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();if(expeditionKind==='drill')closeExpedition();else showToast('请选择一项准备方式；整顿补给始终免费');}
 if(event.key==='Enter'&&event.target===expTitle){event.preventDefault();expBody.querySelector('button:not(:disabled)')?.focus();}
},true);
// Explanation is visible before the first start, not hidden behind a long manual.
const rules=document.createElement('div');rules.className='exp-rules';
rules.innerHTML='<b>这一程，由你筹划</b><p>十二站史实问答，答后解析；每三站休整：补充补给、侦察延时或恢复锦囊。开局3补给，每次锦囊消耗1，三连答补给+1；补给为0仍可答题。集满星火可发动燎原。完成后可重练错题，或选更高难度再出发。</p><small>筹划仅是学习游戏策略，不代表真实历史行动或历史物资数量。</small>';
el.startBtn.closest('.launch-panel').after(rules);
const helpSection=document.createElement('section');helpSection.innerHTML='<h3>行军筹划与重练</h3><p>每三站的休整只能选一项：免费补给+2，花1补给为下一题加12秒，或花2补给恢复一枚已用锦囊。恢复后使用仍需1补给。补给上限6，不扣错题补给，不会阻挡前进。三连答补给+1与原有星火奖励并行。结算可重练本局错题，重练不计分、不改写纪录。</p>';
$('.help-grid').appendChild(helpSection);
if(new URLSearchParams(location.search).get('debug')==='1')window.__EXP={expedition,chooseCamp,modal};


const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
  || (navigator.deviceMemory && navigator.deviceMemory <= 4)
  || !!navigator.connection?.saveData || new URLSearchParams(location.search).get('lowpower')==='1';
document.body.classList.toggle('low-power',Boolean(lowPower));
if(lowPower){
 for(const field of [proStarfield,bgStarfield])if(field){Object.assign(field.opts,{min:18,max:40,divisor:28000,shooting:false,pointerGlow:false});}
}
if(proStarfield)proStarfield.opts.shooting=false;
/* Shared-vertex cloth mesh: wave travels from the fixed hoist towards the free edge.
   No group rotation, no detached emblem, no displacement of the rigid pole or hands. */
let cinemaRaf=0;
function startCinemaCloth(){
 const mesh=document.getElementById('cinemaCloth'), edge=document.getElementById('cinemaFlagEdge');
 if(!mesh)return;
 cancelAnimationFrame(cinemaRaf);mesh.replaceChildren();
 const ns='http://www.w3.org/2000/svg', columns=lowPower?28:48;
 const strips=Array.from({length:columns},()=>{const p=document.createElementNS(ns,'path');mesh.appendChild(p);return p;});
 const start=performance.now();let last=0;
 function draw(now){
  const seconds=(now-start)/1000;
  const unfold=prefersReduced?1:clamp((seconds-1.1)/2.3,0,1);
  const spread=100+340*(1-Math.pow(1-unfold,3));
  const t=prefersReduced?1.7:seconds;
  function vertex(u,v){
   const phase=u*8-t*2.8;
   const gust=prefersReduced?0:sceneEnvelope(seconds);
   const amplitude=u*(7+unfold*10+gust*3.5);
   const wave=Math.sin(phase+v*.7)*amplitude+Math.sin(u*13-t*2.8+v)*u*3;
   return [207+spread*u+Math.sin(phase+v*.9)*u*5,70+v*146+wave+u*u*12];
  }
  const point=(u,v)=>vertex(u,v).map(x=>x.toFixed(2)).join(' ');
  for(let i=0;i<columns;i++){
   const a=i/columns,b=(i+1)/columns;
   const normal=Math.sin((a+b)*4-t*2.8);
   const light=Math.pow(normal*.5+.5,1.3);
   const red=Math.round(116+light*87),green=Math.round(23+light*21),blue=Math.round(21+light*14);
   strips[i].setAttribute('d',`M${point(a,0)}L${point(b,0)}L${point(b,1)}L${point(a,1)}Z`);
   strips[i].setAttribute('fill',`rgb(${red},${green},${blue})`);
   strips[i].setAttribute('stroke',`rgb(${red},${green},${blue})`);strips[i].setAttribute('stroke-width','.5');
  }
  edge.setAttribute('d',Array.from({length:columns+1},(_,i)=>(i?'L':'M')+point(i/columns,0)).join(' '));
  if(!prefersReduced&&!proFinished&&!el.prologue.hidden)cinemaRaf=requestAnimationFrame(frame);
 }
 function frame(now){if(now-last<(lowPower?65:30)){cinemaRaf=requestAnimationFrame(frame);return;}last=now;draw(now);}
 draw(start);
}
function stopCinema(){cancelAnimationFrame(cinemaRaf);}


/* Opening sound is opt-in only; its private context never changes gameplay sound preferences. */
let sceneAudio=null, sceneGeneration=0, sceneEpoch=0, sceneMuted=true;
const sceneBursts=Array.from({length:24},(_,i)=>({at:1.35+i*.235+Math.random()*.16,duration:.12+Math.random()*.19,strength:.35+Math.random()*.65}));
function sceneEnvelope(t){return sceneBursts.reduce((sum,b)=>{const x=(t-b.at)/b.duration;return sum+(x>0&&x<1?Math.pow(Math.sin(x*Math.PI),2)*b.strength:0);},0);}
const sceneControls=document.createElement('div');sceneControls.className='scene-audio-controls';
sceneControls.innerHTML='<div id="sceneAudioChoices"><button type="button" id="sceneSoundStart">有声启程</button><button type="button" id="sceneSilentStart">静音启程</button></div><button type="button" id="sceneAudioToggle" aria-pressed="false">声音：关</button><span id="sceneAudioStatus" role="status">默认静音 · 开场自动继续</span>';
el.prologue.querySelector('.pro-ui').appendChild(sceneControls);
const sceneToggle=document.getElementById('sceneAudioToggle'),sceneStatus=document.getElementById('sceneAudioStatus');
function sceneSoundUI(text){sceneToggle.textContent=sceneMuted?'声音：关':'声音：开';sceneToggle.setAttribute('aria-pressed',String(!sceneMuted));sceneStatus.textContent=text||(sceneMuted?'静音开场':'旗布与环境声已开启');}
function fadeSceneAudio(reason='声音已停止'){
 sceneGeneration++;sceneMuted=true;sceneSoundUI(reason);
 const a=sceneAudio;sceneAudio=null;if(!a)return;
 cancelAnimationFrame(a.raf);a.stopping=true;
 try{const now=a.ctx.currentTime;a.master.gain.cancelScheduledValues(now);a.master.gain.setTargetAtTime(0,now,.055);}catch(e){}
 a.cleanup=window.setTimeout(()=>{for(const source of a.sources){try{source.stop();source.disconnect();}catch(e){}}try{a.master.disconnect();}catch(e){}if(a.ctx.state!=='closed')a.ctx.close().catch(()=>{});},230);
}
async function enableSceneAudio(){
 if(proFinished||el.prologue.hidden||document.hidden)return;
 if(sceneAudio){if(!sceneAudio.stopping)return;}
 const Audio=window.AudioContext||window.webkitAudioContext;
 if(!Audio){sceneSoundUI('当前浏览器不支持音频，静音继续');return;}
 const generation=++sceneGeneration;
 let ctx;
 try{
  ctx=new Audio({latencyHint:'interactive'});
  const master=ctx.createGain();master.gain.value=0;
  const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-14;limiter.knee.value=12;limiter.ratio.value=8;limiter.attack.value=.006;limiter.release.value=.16;
  master.connect(limiter);limiter.connect(ctx.destination);
  const a={ctx,master,limiter,sources:[],raf:0,stopping:false,layers:[]};sceneAudio=a;
  await ctx.resume();
  if(generation!==sceneGeneration||document.hidden||proFinished||el.prologue.hidden){if(sceneAudio===a)fadeSceneAudio();else if(ctx.state!=='closed')ctx.close().catch(()=>{});return;}
  // Independent filtered noise channels provide width without phase inversion; mono remains intact.
  function noiseLayer({cut,high,gain,pan,type='lowpass'}){
   const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),data=buffer.getChannelData(0);let brown=0;
   for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.07)/1.03;data[i]=brown*3;}
   const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;
   const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=high;
   const filter=ctx.createBiquadFilter();filter.type=type;filter.frequency.value=cut;filter.Q.value=.65;
   const level=ctx.createGain();level.gain.value=gain;
   const position=ctx.createStereoPanner?ctx.createStereoPanner():ctx.createGain();if(position.pan)position.pan.value=pan;
   source.connect(hp);hp.connect(filter);filter.connect(level);level.connect(position);position.connect(master);source.start(0,Math.random()*2);
   a.sources.push(source);const layer={source,filter,level,position};a.layers.push(layer);return layer;
  }
  const farL=noiseLayer({cut:470,high:95,gain:.12,pan:-.65}),farR=noiseLayer({cut:560,high:100,gain:.12,pan:.65});
  const cloth=noiseLayer({cut:1600,high:260,gain:0,pan:0,type:'bandpass'});
  const flutter=noiseLayer({cut:2700,high:650,gain:0,pan:0});
  const bass=ctx.createOscillator(),bassGain=ctx.createGain();bass.type='sine';bass.frequency.value=61;bassGain.gain.value=.014;bass.connect(bassGain);bassGain.connect(master);bass.start();a.sources.push(bass);
  master.gain.setTargetAtTime(.52,ctx.currentTime,.28);sceneMuted=false;sceneSoundUI();document.getElementById('sceneAudioChoices').hidden=true;
  function update(){
   if(sceneAudio!==a||a.stopping)return;
   if(document.hidden||proFinished||el.prologue.hidden){fadeSceneAudio();return;}
   const t=(performance.now()-sceneEpoch)/1000,now=ctx.currentTime;
   const burst=sceneEnvelope(t),wave=.5+.5*Math.sin(t*2.8-6.4);
   const envelope=(.018+burst*.19)*(.65+.35*wave);
   cloth.level.gain.setTargetAtTime(envelope,now,.023);flutter.level.gain.setTargetAtTime(burst*.055,now,.018);
   cloth.filter.frequency.setTargetAtTime(880+wave*700+burst*170,now,.04);
   const box=document.getElementById('cinemaCloth').getBoundingClientRect();
   const pan=clamp(((box.left+box.width*.5)/innerWidth-.5)*.95,-.4,.4);
   for(const layer of [cloth,flutter])if(layer.position.pan)layer.position.pan.setTargetAtTime(pan,now,.12);
   farL.level.gain.setTargetAtTime(.1+Math.sin(t*.7)*.018,now,.1);farR.level.gain.setTargetAtTime(.1+Math.cos(t*.63)*.018,now,.1);
   a.raf=requestAnimationFrame(update);
  }update();
 }catch(error){if(sceneAudio?.ctx===ctx)fadeSceneAudio('声音不可用，静音继续');else if(ctx&&ctx.state!=='closed')ctx.close().catch(()=>{});sceneSoundUI('声音不可用，静音继续');}
}
document.getElementById('sceneSoundStart').addEventListener('click',enableSceneAudio);
document.getElementById('sceneSilentStart').addEventListener('click',()=>{document.getElementById('sceneAudioChoices').hidden=true;fadeSceneAudio('静音开场');});
sceneToggle.addEventListener('click',()=>sceneMuted?enableSceneAudio():fadeSceneAudio('静音开场'));
document.addEventListener('visibilitychange',()=>{if(document.hidden)fadeSceneAudio('页面隐藏，声音已停止');});
window.addEventListener('pagehide',()=>fadeSceneAudio());
// lifecycle hooks always fade, even if skip happens while resume() is pending.
const sceneOldStop=stopCinema;stopCinema=function(){fadeSceneAudio();sceneOldStop();};
const sceneOldCloth=startCinemaCloth;startCinemaCloth=function(){fadeSceneAudio();sceneEpoch=performance.now();sceneOldCloth();};
if(new URLSearchParams(location.search).get('debug')==='1')window.__SCENE={get audio(){return sceneAudio},get epoch(){return sceneEpoch},get muted(){return sceneMuted},envelope:sceneEnvelope,stop:fadeSceneAudio};

/* ---------- 启动 ---------- */
function init() {
  initRail();
  initMap();
  updateSoundUI();
  renderBest();
  renderMarkShelf();
  updateModeUI();
  initEvents();
  showScreen('start');
  initPrologue();
  exposeDebug();
}

init();

})();
