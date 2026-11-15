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
  easy: { id: 'easy', label: '轻装', tag: '从容翻页', choice: 30, sort: 50, match: 46, score: 0.9, note: '时间充裕 · 积分 ×0.9' },
  normal: { id: 'normal', label: '标准', tag: '风雨夜读', choice: 25, sort: 42, match: 38, score: 1, note: '标准节奏 · 积分 ×1.0' },
  hard: { id: 'hard', label: '铁血', tag: '急行夜读', choice: 19, sort: 34, match: 31, score: 1.25, note: '限时更短 · 积分 ×1.25' }
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
    name: '于都出发', short: '于都', date: '1934.10', place: '江西·于都', key: false,
    intro: '十月十七日 · 阴，有雨 · 于都河畔',
    caption: '雨夜渡河，母亲给的布鞋没舍得穿。',
    note: '1934年10月，中央红军8.6万余人从于都河畔出发，开始战略转移。于都河被称为“长征第一渡”。',
    variants: [
      {
        type: 'choice',
        q: '{{blank}}，我们被迫离开于都，战略转移开始了。在这之前，我们被满山而来的敌人包围，子弹也打光了。我心头一颤，怕回不到河南老家。',
        options: ['一九三四年十月', '一九三五年一月', '一九三六年十月', '一九三四年八月'],
        a: 0,
        hint: '战略转移开始于1934年秋；遵义会议在1935年初，三大主力会师在1936年秋。',
        why: '1934年10月，中央红军主力从江西于都出发，开始战略转移。于都河因此被称为“长征第一渡”。'
      }
    ]
  },
  {
    name: '血战湘江', short: '湘江', date: '1934.11', place: '广西·湘江', key: false,
    intro: '十一月三十日 · 阴 · 湘江边',
    caption: '江水红了，浮桥断了。',
    note: '湘江战役是长征途中最为惨烈的一战。中央红军由出发时的8.6万余人锐减至3万余人。',
    variants: [
      {
        type: 'choice',
        q: '十一月末，湘江。江水是红的，浮桥断了。{{blank}}。我们连只剩七个人，我把名字写在绑腿上，怕死后没人认得。',
        options: ['中央红军由八万六千人锐减到三万余人', '中央红军由八万六千人增加到十万余人', '中央红军由三万人锐减到八千人', '中央红军在湘江边全军覆没'],
        a: 0,
        hint: '出发时八万六千人，湘江一战之后只剩三万余人。',
        why: '1934年11月底至12月初，湘江战役在广西全州、兴安一带展开。中央红军由出发时的8.6万余人锐减至3万余人，是长征中损失最惨重的一战。'
      }
    ]
  },
  {
    name: '遵义会议', short: '遵义', date: '1935.01', place: '贵州·遵义', key: true,
    intro: '一月十五日 · 阴 · 遵义城',
    caption: '城里的灯亮了一夜。',
    note: '1935年1月，遵义会议在极端危急的历史关头挽救了党、挽救了红军、挽救了中国革命，是党的历史上一个生死攸关的转折点。',
    variants: [
      {
        type: 'choice',
        q: '一月，遵义。城里的电灯亮了一夜。听说会上定了，{{blank}}。战士们不懂大道理，只知道队伍又有了主心骨。',
        options: ['毛泽东同志又回来指挥我们了', '蒋介石答应停止内战了', '红军决定就在贵州扎根', '苏联派来了新的军事顾问'],
        a: 0,
        hint: '遵义会议确立了毛泽东同志在党中央和红军的领导地位。',
        why: '1935年1月，遵义会议在极端危急的关头召开，确立了毛泽东同志在党中央和红军的领导地位，是党的历史上生死攸关的转折点。'
      }
    ]
  },
  {
    name: '四渡赤水', short: '赤水', date: '1935.01—03', place: '川黔滇边', key: false,
    intro: '二月 · 雨 · 赤水河',
    caption: '草鞋磨穿，敌人被牵着走。',
    note: '1935年初，中央红军在川黔滇边四次渡过赤水河，以灵活机动的战术变被动为主动。',
    variants: [
      {
        type: 'choice',
        q: '二月，赤水河。我们来回渡了四趟，草鞋磨穿了。{{blank}}。敌人追得凶，我们却从他们的缝隙里钻了出去。',
        options: ['我们假装要打贵阳', '我们攻下了贵阳城', '我们北渡长江成功了', '我们在河上修了一座桥'],
        a: 0,
        hint: '四渡赤水时，红军佯攻贵阳，调出滇军，再趁虚西进。',
        why: '1935年1月至3月，中央红军在川黔滇边四次渡过赤水河，声东击西、灵活机动，变被动为主动。佯攻贵阳是其中的关键一着。'
      }
    ]
  },
  {
    name: '巧渡金沙江', short: '金沙江', date: '1935.05', place: '云南·皎平渡', key: false,
    intro: '五月 · 晴 · 金沙江皎平渡',
    caption: '七条小船，九天九夜。',
    note: '1935年5月，中央红军在皎平渡等渡口，仅靠7条小船，历时9天9夜渡过金沙江，跳出了数十万敌军的包围圈。',
    variants: [
      {
        type: 'choice',
        q: '五月，金沙江。江水吼得听不见人话。{{blank}}，九天九夜，我们全过了江。船工说，你们是神兵。',
        options: ['只找到七条小船', '缴获了七艘军舰', '架起了一座铁索桥', '从上游徒步蹚了过去'],
        a: 0,
        hint: '皎平渡只有七条小船，船工昼夜摆渡。',
        why: '1935年5月，中央红军在皎平渡等渡口，仅靠7条小船，历时9天9夜渡过金沙江，跳出了数十万敌军的包围圈。'
      }
    ]
  },
  {
    name: '飞夺泸定桥', short: '泸定桥', date: '1935.05', place: '四川·泸定', key: true,
    intro: '五月二十九日 · 雨 · 泸定桥',
    caption: '十三根铁索，二十二个人。',
    note: '1935年5月29日，22名突击队员冒着枪林弹雨攀踏十三根铁索，夺下泸定桥，为红军北上打开了通道。',
    variants: [
      {
        type: 'choice',
        q: '五月二十九，泸定桥。桥板被敌人抽了，只剩十三根铁索。{{blank}}。我趴在桥头，看见第一个冲上去的是二连的廖大珠。',
        options: ['二十二名勇士攀着铁索往前爬', '工兵连夜把桥板重新铺好', '我们坐船从桥下绕了过去', '敌人自己放火烧断了铁索'],
        a: 0,
        hint: '夺桥的是二十二名突击队员，廖大珠是队长。',
        why: '1935年5月29日，22名突击队员冒着枪林弹雨，攀踏泸定桥13根铁索夺下桥头，为红军北上打开了通道。'
      }
    ]
  },
  {
    name: '翻越夹金山', short: '夹金山', date: '1935.06', place: '四川·宝兴', key: false,
    intro: '六月 · 雪 · 夹金山',
    caption: '雪没过膝盖，风像刀子。',
    note: '夹金山海拔4000多米，终年积雪、空气稀薄，是中央红军长征中翻越的第一座大雪山。',
    variants: [
      {
        type: 'choice',
        q: '六月，夹金山。山上空气薄，走三步就要歇一歇。{{blank}}。老班长把最后一把炒面塞给我，说，别停下。',
        options: ['这是我们翻过的第一座大雪山', '山上开满了映山红', '我们在山顶宿营了一夜', '这是长征中最后一座雪山'],
        a: 0,
        hint: '夹金山海拔4000多米，是中央红军长征中翻越的第一座大雪山。',
        why: '1935年6月，中央红军翻越长征途中第一座大雪山——夹金山。夹金山位于四川宝兴与小金之间，海拔4000多米，终年积雪、空气稀薄。'
      }
    ]
  },
  {
    name: '穿越草地', short: '草地', date: '1935.08', place: '四川·松潘', key: false,
    intro: '八月 · 阴 · 松潘草地',
    caption: '草下面是泥，泥下面是命。',
    note: '松潘草地位于四川阿坝，今若尔盖一带。这里沼泽密布、气候多变，红军在这里付出了巨大牺牲。',
    variants: [
      {
        type: 'choice',
        q: '八月，松潘草地。看上去是草，踩下去是泥。{{blank}}。小周陷下去的时候，只来得及把枪递给我。',
        options: ['我们挖野菜、煮皮带充饥', '草地上到处是青稞面', '我们骑马走了三天', '前面就是陕北的窑洞'],
        a: 0,
        hint: '草地补给断绝，战士们挖野菜、煮皮带。',
        why: '1935年8月，红军穿越松潘草地（今四川若尔盖一带）。草地沼泽密布、气候无常、补给困难，红军挖野菜、煮皮带，付出巨大牺牲。'
      }
    ]
  },
  {
    name: '突破腊子口', short: '腊子口', date: '1935.09', place: '甘肃·迭部', key: true,
    intro: '九月 · 雨 · 腊子口',
    caption: '两山夹一线，天亮前攀上崖。',
    note: '腊子口位于甘肃甘南迭部县，是甘川古道上的险要关隘。攻克腊子口，为红军北上陕甘打开了通道。',
    variants: [
      {
        type: 'choice',
        q: '九月，腊子口。两山夹着一道缝，敌人的机枪架在崖顶。{{blank}}。天亮前，我们攀上了后山。',
        options: ['我们摸黑从悬崖上爬了上去', '我们从正面强攻了七天', '敌人主动让开了路', '我们绕道青海走了三个月'],
        a: 0,
        hint: '红军攀绝壁迂回到敌人侧后，前后夹击。',
        why: '1935年9月，红军攻克甘肃迭部腊子口。突击队攀绝壁迂回，前后夹击，打开了北上陕甘的通道。'
      }
    ]
  },
  {
    name: '吴起镇会师', short: '吴起镇', date: '1935.10', place: '陕西·吴起', key: false,
    intro: '十月十九日 · 晴 · 陕北吴起镇',
    caption: '看见窑洞和红旗，有人哭了。',
    note: '1935年10月19日，中央红军到达陕北吴起镇，宣告中央红军长征胜利结束。',
    variants: [
      {
        type: 'choice',
        q: '十月十九，吴起镇。看见窑洞和红旗，有人蹲在地上哭。{{blank}}。我把草鞋脱下来，脚上全是血泡。',
        options: ['我们走了二万五千里', '我们只走了一千里', '我们还要继续北上', '我们在这里住了十年'],
        a: 0,
        hint: '中央红军历时一年，纵横十一个省，行程约二万五千里。',
        why: '1935年10月19日，中央红军到达陕北吴起镇，宣告中央红军长征胜利结束。中央红军历时一年，纵横十一个省，行程约二万五千里。'
      }
    ]
  },
  {
    name: '会宁会师', short: '会宁', date: '1936.10', place: '甘肃·会宁', key: false,
    intro: '一九三六年十月 · 晴 · 甘肃会宁',
    caption: '帽子抛上天，抱住不放。',
    note: '1936年10月，红一、红二、红四方面军在甘肃会宁和将台堡地区会师，标志着红军长征胜利结束。',
    variants: [
      {
        type: 'choice',
        q: '一九三六年十月，会宁。我们和红二、红四方面军的兄弟抱在一起。{{blank}}。有人把帽子抛上天，有人只是哭。',
        options: ['三大主力终于会师了', '红军开始第二次长征', '敌人攻下了会宁城', '我们与东北军开战了'],
        a: 0,
        hint: '1936年10月，红一、红二、红四方面军在会宁、将台堡会师。',
        why: '1936年10月，红一、红二、红四方面军在甘肃会宁和将台堡地区会师，标志着红军长征胜利结束。'
      }
    ]
  },
  {
    name: '星火相传', short: '星火', date: '1936.10.22', place: '甘肃·会宁', key: true,
    intro: '十月二十二日 · 夜 · 会宁',
    caption: '油布包好日记，留给后人。',
    note: '从1936年到2026年，长征胜利九十周年。这本日记留下的，不只是一个战士的经历。',
    variants: [
      {
        type: 'choice',
        q: '十月二十二，会宁。夜里，我把这本日记用油布包好。{{blank}}。等革命胜利了，我想让后人看看，我们是怎样走过来的。',
        options: ['我想把它留给后来的人', '我想把它寄回河南老家', '我想把它交给部队的文书', '我想把它带进延安的窑洞'],
        a: 0,
        hint: '日记不是私产，他想让后人看见这条路。',
        why: '从1936年到2026年，长征胜利九十周年。这本日记留下的，不只是一个人的经历，更是一代人对理想与信念的坚守。'
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
    date: '1936.10.22 · 甘肃会宁',
    title: '最后一页：把日记留给后人',
    facts: [
      '1936年10月，红军三大主力在会宁、将台堡会师，长征胜利结束。',
      '这本日记没有留下主人的姓名。像他一样普通的红军战士，走完了二万五千里。'
    ]
  }
];

const MARKS = [
  { id: 'first', seal: '记', name: '合上日记', desc: '完成一次完整征途' },
  { id: 'streak', seal: '连', name: '连补三笔', desc: '最高连捷达到 3 次' },
  { id: 'swift', seal: '疾', name: '落笔如飞', desc: '5 秒内补对一处' },
  { id: 'tools', seal: '友', name: '战友相助', desc: '一局用尽三样办法' },
  { id: 'key', seal: '关', name: '难页过关', desc: '补对全部四道难页' },
  { id: 'perfect', seal: '全', name: '十二页全对', desc: '单局补对全部 12 处' },
  { id: 'blaze', seal: '燎', name: '星火燎原', desc: '触发一次燎原时刻' },
  { id: 'veteran', seal: '铁', name: '铁血夜读', desc: '铁血难度下补对 8 页以上' }
];

const RANKS = [
  { min: 12, title: '星火传人', line: '十二页全对。你补上的不只是字，更是一个普通战士走过的二万五千里。' },
  { min: 10, title: '长征先锋', line: '山河为纸，脚步作笔。你已经把这段历史，写进了自己的心里。' },
  { min: 8, title: '红军战士', line: '一路风雨兼程，你把大多数日子都认了出来。再翻一遍，会更接近那个年代。' },
  { min: 6, title: '行军学员', line: '日记翻过大半，字迹渐渐清楚。回头看看补错的地方，那些地名与年份会重新亮起来。' },
  { min: 0, title: '星火新兵', line: '第一次翻开这本日记，难免认错几个字。历史从不催促赶路的人，读懂每一页，再出发。' }
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

const TYPE_LABELS = { choice: '补字', sort: '排序', match: '配对' };

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
  diaryCaption: $('#diaryCaption'),
  rainNote: $('#rainNote'),
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
const letter = i => '甲乙丙丁戊'[i] || String.fromCharCode(65 + i);
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

/* 日记正文：{{blank}} 是雨水洇开、需要玩家补上的那一处。 */
function diaryHtml(text) {
  const raw = String(text || '');
  const parts = raw.split('{{blank}}');
  const before = escapeHtml(parts[0] || '');
  const after = escapeHtml(parts.slice(1).join('{{blank}}') || '');
  if (parts.length === 1) return before;
  return `${before}<span class="rain-blank" id="rainBlank" role="textbox" aria-readonly="true" aria-label="被雨水洇开的字迹，待补写"><span class="rain-smudge" aria-hidden="true"></span><span class="rain-hint" aria-hidden="true">雨渍</span></span>${after}`;
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
  const statusText = status === 'done' ? '已翻过' : status === 'current' ? '正在读' : '未翻开';
  return `第 ${index + 1} 页 ${stage.short}，${statusText}。按回车查看那一页。`;
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

function initMobileRoute() {
  const track = document.getElementById('mobileRouteTrack');
  if (!track) return;
  track.innerHTML = STAGES.map((stage, index) => (
    `<span class="mr-stop${stage.key ? ' is-key' : ''}" style="--i:${index}">
      <i aria-hidden="true"></i><b>${escapeHtml(stage.short)}</b>
    </span>`
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
  el.dossierMeta.textContent = `${stage.date} · ${stage.place} · ${stage.key ? '难页' : `第 ${index + 1} 页`}`;
  el.dossierIntro.textContent = stage.intro;
  if (status === 'wait') {
    el.dossierNote.textContent = '还没翻到这一页。读到这里时，这一段字迹才会清楚。';
    el.dossierNote.classList.add('is-locked');
    el.dossierStatus.textContent = '尚未读到';
    el.dossierStatus.className = 'dossier-status';
  } else {
    el.dossierNote.textContent = stage.note;
    el.dossierNote.classList.remove('is-locked');
    el.dossierStatus.textContent = status === 'current' ? '正在读' : '已翻过';
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
    let text = '慢慢认字';
    if (remaining <= 0) text = '雨声盖过了字';
    else if (critical) text = '墨迹要散了';
    else if (low) text = '快些补上';
    else if (ratio <= 0.55 || seconds <= 12) text = '别让雨再淋';
    if (state.current && state.current.key && remaining > 0) text = `难页 · ${text}`;
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
  el.comboText.textContent = `连补 ×${state.streak}`;
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
  showToast('星火燎原 · 这一页积分 ×2，时限 +10 秒');
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
    choice: ['排除两项', '询问战友：战友帮你排除两个记错的选项'],
    sort: ['点出首项', '询问战友：战友点出排序正确的第一项'],
    match: ['连对一组', '询问战友：战友帮你连成一组正确配对']
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
      showToast('战友想了想，指了指两个选项：这两个不对。');
    } else if (type === 'sort') {
      const first = state.current.order[0];
      state.sortPinned = first;
      state.sortSelection = [first];
      updateSortState();
      showToast('战友说：第一个该是它。');
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
        showToast('战友说：这一组不会错。');
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
  if (el.diaryCaption) el.diaryCaption.textContent = item.stage.caption || '';
  el.questionText.innerHTML = diaryHtml(item.q);
  if (el.rainNote) el.rainNote.hidden = !item.q.includes('{{blank}}');
  el.cardStationName.textContent = item.stage.name;
  el.cardIndex.textContent = `${pad2(state.index + 1)} / ${STAGES.length}`;
  el.hudStationNo.textContent = pad2(state.index + 1);
  el.hudStationName.textContent = item.stage.name;
  el.hudStationMeta.textContent = `${item.stage.date} · ${item.stage.place}${item.key ? ' · 难页' : ''} · ${MODES[state.mode].label}`;
  el.nextLabel.textContent = state.index === state.run.length - 1 ? '合上日记' : '翻到下一页';
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
  updateJourneyStatus(`第 ${state.index + 1} 页${item.key ? ' · 难页' : ''} · ${item.stage.name}`);
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
  if (type === 'choice') return '按 1—4 补字 · Q 问战友 · W 疾行 · E 参谋 · R 燎原';
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
  const blank = document.getElementById('rainBlank');
  if (blank) {
    blank.textContent = state.current.options[index].text;
    blank.classList.remove('is-empty');
    blank.classList.add('is-filled', correct ? 'is-correct' : 'is-wrong');
    blank.setAttribute('aria-label', `已补写：${state.current.options[index].text}`);
  }
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
  if (item.key) tags.push('难页 ×1.5');
  if (usedBlaze) tags.push('燎原 ×2');
  if (MODES[state.mode].score !== 1) tags.push(`难度 ×${MODES[state.mode].score}`);
  return tags;
}

function answerTextFor(item, pickedIndex, sortPicked, matchPairs) {
  if (item.type === 'choice') {
    return `应补：<b>${letter(item.correctIndex)}. ${escapeHtml(item.options[item.correctIndex].text)}</b>`;
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
  el.sourceCardKicker.textContent = `史料附页 · 第 ${pad2(stageIndex + 1)} 张 / 共 ${HISTORY_CARDS.length} 张`;
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

  const badge = timeout ? '雨声盖过了字' : correct ? '补对了' : '补错了';
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
    ? `补对 ${item.stage.short} · 翻到下一页`
    : `记住 ${item.stage.short} · 继续往前`);
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
    const blank = document.getElementById('rainBlank');
    if (blank) {
      blank.textContent = item.options[item.correctIndex].text;
      blank.classList.remove('is-empty');
      blank.classList.add('is-filled', 'is-timeout');
      blank.setAttribute('aria-label', `正确答案：${item.options[item.correctIndex].text}`);
    }
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
  updateJourneyStatus('日记合上了 · 会宁会师');
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
  el.modeNote.textContent = `${mode.label} · 每页 ${mode.choice} 秒 · 积分 ×${mode.score}`;
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
  updateJourneyStatus('等待出发 · 十二页日记');
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
  el.briefingNo.textContent = `第 ${pad2(state.index + 1)} 页 · 难页`;
  el.briefingTitle.textContent = item.stage.name;
  el.briefingMeta.textContent = `${item.stage.date} · ${item.stage.place}`;
  el.briefingIntro.textContent = `${item.stage.intro}。这一页的雨更急，字迹更难认。`;
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
  const headline = state.correctCount >= 10 ? '合上日记' : state.correctCount >= 6 ? '走到会宁' : '雨还没停';
  el.resultTitle.textContent = headline;
  el.resultSub.textContent = state.correctCount === total
    ? '十二页全部补对。一个普通战士的二万五千里，被你一字一句认了出来。'
    : '日记翻到了最后一页。有些字还模糊着，但路已经走完了。';
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
    stop.title = `第 ${index + 1} 页${answer.key ? ' · 难页' : ''} · ${answer.stageShort}：${answer.correct ? '补对了' : answer.timeout ? '超时未补' : '补错了'}`;
    el.resultRoute.appendChild(stop);
  });
  const rightCount = state.answers.filter(answer => answer.correct).length;
  el.resultRoute.setAttribute('aria-label', `十二页日记补字结果：补对 ${rightCount} 页，未补对 ${state.answers.length - rightCount} 页`);
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
    name.textContent = `第 ${pad2(answer.stageIndex + 1)} 页 · ${answer.stageShort}${answer.key ? ' · 难页' : ''} · ${TYPE_LABELS[answer.type] || ''}`;
    const verdict = document.createElement('span');
    verdict.className = `review-verdict${answer.timeout ? ' is-timeout' : ''}`;
    verdict.textContent = answer.timeout ? '超时未补' : '补错了';
    meta.append(name, verdict);

    const title = document.createElement('h4');
    title.textContent = answer.question.replace('{{blank}}', '（雨水洇开处）');

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
  const text = `我翻完了《一个红军战士的日记》，补对 ${state.correctCount}/${state.run.length} 处被雨水洇开的字，通过 ${state.keyCorrect}/${KEY_STAGES.size} 道难页，获得「${rank.title}」，行军积分 ${fmt(state.score)} 分。\n难度：${MODES[state.mode].label} · 最高连补 ×${state.bestStreak} · 触发燎原 ${state.blazeUsed} 次${markLine}\n从于都到会宁，十二页，二万五千里。\n纪念中国工农红军长征胜利九十周年。`;
  if (navigator.share) {
    try {
      await navigator.share({ title: '一个红军战士的日记', text });
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

/* ---------- 启动 ---------- */
function init() {
  initRail();
  initMobileRoute();
  initMap();
  updateSoundUI();
  renderBest();
  renderMarkShelf();
  updateModeUI();
  initEvents();
  showScreen('start');
  exposeDebug();
}

init();

})();
