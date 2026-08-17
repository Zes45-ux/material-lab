const MATERIAL_GROUPS = [
  {
    key: "base",
    label: "基础材料",
    items: ["Empty", "Wall", "Sand", "Water", "Stone", "Ice", "Gas"],
  },
  {
    key: "life",
    label: "生命材料",
    items: ["Wood", "Plant", "Fungus", "Seed", "Mite"],
  },
  {
    key: "energy",
    label: "能量材料",
    items: ["Fire", "Lava", "Acid", "Dust", "Oil", "Gunpowder"],
  },
  {
    key: "special",
    label: "特殊材料",
    items: ["Cloner", "Rocket"],
  },
];

const MATERIAL_DETAILS = {
  Empty: {
    label: "清空",
    family: "工具",
    intro: "擦除画布上的材料，为新的实验留出空间。",
    note: "适合快速修正边缘，或重新开始一小块区域。",
    reactions: [
      { material: "其他材料", result: "接触位置被擦除" },
    ],
  },
  Wall: {
    label: "墙",
    family: "基础材料",
    intro: "不可破坏的固定材料，用来搭建容器、边界和支撑结构。",
    note: "墙不会移动，也不会被常规材料穿过。",
    reactions: [
      { material: "其他材料", result: "阻挡移动，形成边界" },
      { material: "酸", result: "酸会绕开墙" },
    ],
  },
  Sand: {
    label: "沙",
    family: "基础材料",
    intro: "会向下沉降的颗粒材料，适合观察堆积、滑落和置换。",
    note: "沙会让水、气体、油和酸从下方被挤出。",
    reactions: [
      { material: "水", result: "沙下沉，水被顶起" },
      { material: "气体 / 油 / 酸", result: "沙下沉并发生置换" },
    ],
  },
  Water: {
    label: "水",
    family: "基础材料",
    intro: "会流动和铺开的液体，是多数生长与冷却实验的基础。",
    note: "水会优先填入下方和侧面的空隙。",
    reactions: [
      { material: "火", result: "火熄灭" },
      { material: "熔岩", result: "熔岩冷却为石头" },
      { material: "油", result: "油被水托起" },
      { material: "冰", result: "水参与结冰过程" },
    ],
  },
  Stone: {
    label: "石头",
    family: "基础材料",
    intro: "较重的固体材料，可以搭建结构，也会在高压下碎成沙。",
    note: "石头能形成拱形支撑，适合测试材料的重量关系。",
    reactions: [
      { material: "水 / 气体 / 油 / 酸", result: "被挤开并保持结构" },
      { material: "高压", result: "转化为沙" },
    ],
  },
  Ice: {
    label: "冰",
    family: "基础材料",
    intro: "低温固体，会让周围的水冻结，也会被热量融化。",
    note: "冰面还能让移动中的材料滑行。",
    reactions: [
      { material: "水", result: "水冻结为冰" },
      { material: "火 / 熔岩", result: "冰融化为水" },
    ],
  },
  Gas: {
    label: "气体",
    family: "基础材料",
    intro: "轻盈的漂浮材料，会在空隙中扩散并向上移动。",
    note: "气体能被火点燃，也会被沙和石头置换。",
    reactions: [
      { material: "火", result: "气体被点燃" },
      { material: "沙 / 石头", result: "气体被挤开" },
    ],
  },
  Wood: {
    label: "木头",
    family: "生命材料",
    intro: "稳定的有机材料，可以成为植物和真菌扩散的支点。",
    note: "木头燃烧后会留下火焰和烟雾。",
    reactions: [
      { material: "火 / 熔岩", result: "木头燃烧" },
      { material: "植物", result: "植物沿木头生长" },
      { material: "真菌", result: "真菌在木头之间扩散" },
      { material: "螨虫", result: "螨虫啃食木头" },
    ],
  },
  Plant: {
    label: "植物",
    family: "生命材料",
    intro: "会在潮湿环境中生长的生命材料，能沿木头和真菌扩散。",
    note: "给植物水分和空间，它会慢慢改变画布的形状。",
    reactions: [
      { material: "水", result: "植物生长并扩散" },
      { material: "木头", result: "沿木头延伸" },
      { material: "火 / 熔岩", result: "植物燃烧" },
      { material: "螨虫", result: "螨虫啃食植物" },
    ],
  },
  Fungus: {
    label: "真菌",
    family: "生命材料",
    intro: "会覆盖周围材料并持续扩散的生命材料，喜欢潮湿和木质结构。",
    note: "真菌适合用来观察连续的蔓延路径。",
    reactions: [
      { material: "木头", result: "向相邻木头扩散" },
      { material: "水", result: "真菌更容易繁殖" },
      { material: "火 / 熔岩", result: "真菌燃烧" },
    ],
  },
  Seed: {
    label: "种子",
    family: "生命材料",
    intro: "会在沙、植物和真菌上发芽的生命起点，也会随水流移动。",
    note: "种子需要落在合适的材料上才会开始生长。",
    reactions: [
      { material: "沙 / 植物 / 真菌", result: "种子发芽" },
      { material: "水", result: "种子随水移动" },
      { material: "火 / 熔岩", result: "种子燃烧" },
      { material: "螨虫", result: "螨虫啃食种子" },
    ],
  },
  Mite: {
    label: "螨虫",
    family: "生命材料",
    intro: "会主动寻找食物的小型生物，能在冰面上滑动。",
    note: "螨虫会改变周围植物材料的形态。",
    reactions: [
      { material: "木头 / 植物 / 种子", result: "螨虫啃食材料" },
      { material: "粉尘", result: "螨虫会被粉尘吸引" },
      { material: "冰", result: "螨虫沿冰面滑行" },
      { material: "火 / 熔岩 / 水 / 油", result: "螨虫消失" },
    ],
  },
  Fire: {
    label: "火",
    family: "能量材料",
    intro: "短暂而活跃的热源，会点燃可燃材料并被水扑灭。",
    note: "火焰会自然衰减，适合测试连锁反应。",
    reactions: [
      { material: "水", result: "火熄灭" },
      { material: "木头 / 植物 / 油", result: "材料被点燃" },
      { material: "气体 / 粉尘", result: "火焰扩散" },
    ],
  },
  Lava: {
    label: "熔岩",
    family: "能量材料",
    intro: "高温且较重的流体，会向下流动并点燃周围材料。",
    note: "熔岩遇水会迅速冷却，留下石头。",
    reactions: [
      { material: "水", result: "熔岩冷却为石头" },
      { material: "气体 / 粉尘", result: "产生火焰" },
      { material: "木头 / 植物 / 油", result: "材料被点燃" },
    ],
  },
  Acid: {
    label: "酸",
    family: "能量材料",
    intro: "会腐蚀周围材料的流体，适合做清除和穿透实验。",
    note: "酸会避开墙和其他酸，沿可用的空隙继续流动。",
    reactions: [
      { material: "大多数材料", result: "腐蚀并清除" },
      { material: "墙 / 酸", result: "酸停止腐蚀并绕开" },
    ],
  },
  Dust: {
    label: "粉尘",
    family: "能量材料",
    intro: "轻盈易飘散的助燃颗粒，可被火焰点燃并帮助火焰向相邻位置传播；承受高压时立即转为火焰。",
    note: "适合扩散火势；没有引信，也不产生火药式强冲击。",
    reactions: [
      { material: "火", result: "粉尘帮助火焰向相邻位置传播" },
      { material: "高压", result: "粉尘立即转为火焰并产生较弱压力" },
      { material: "水", result: "粉尘被水置换" },
    ],
  },
  Oil: {
    label: "油",
    family: "能量材料",
    intro: "会漂浮和流动的可燃液体，点燃后会产生上升的热流。",
    note: "油适合与水配合，观察液体的分层和燃烧。",
    reactions: [
      { material: "火 / 熔岩", result: "油燃烧并产生热流" },
      { material: "水", result: "油浮在水面" },
      { material: "沙 / 石头", result: "被固体材料置换" },
    ],
  },
  Gunpowder: {
    label: "火药",
    family: "能量材料",
    intro: "会沉降的可燃颗粒，点燃后进入约 5 秒的短引信并产生强压力爆炸。",
    note: "适合布置延时爆破；普通引信可被相邻水格熄灭；最后一 tick 或压力超过 120 时不可阻止爆炸。",
    reactions: [
      { material: "火 / 熔岩", result: "点燃短引信并开始倒计时" },
      { material: "水", result: "八方向相邻水格可熄灭 rb=250..2 的普通引信" },
      { material: "粉尘 / 石头 / 冰", result: "爆炸压力产生联动" },
      { material: "酸", result: "被酸腐蚀" },
    ],
  },
  Cloner: {
    label: "复制器",
    family: "特殊材料",
    intro: "会记住第一个接触到的材料，并持续复制它。",
    note: "复制器本身不会复制墙、空白和另一个复制器。",
    reactions: [
      { material: "其他材料", result: "记录并复制接触到的材料" },
      { material: "墙 / 空白 / 复制器", result: "不记录" },
    ],
  },
  Rocket: {
    label: "火箭",
    family: "特殊材料",
    intro: "会锁定接触到的材料并沿路径发射，留下多个复制品。",
    note: "先让火箭接触目标材料，再观察它的发射方向。",
    reactions: [
      { material: "其他材料", result: "锁定材料并复制" },
      { material: "空白", result: "开始移动和发射" },
      { material: "火 / 火箭", result: "允许火箭继续穿行" },
    ],
  },
  Wind: {
    label: "风",
    family: "工具",
    intro: "推动轻质材料的工具，不会在画布上留下颗粒。",
    note: "按住画布拖动风，可以把气体、粉尘和火焰吹向侧面。",
    reactions: [
      { material: "轻质材料", result: "产生位移和扩散" },
      { material: "重质材料", result: "影响较小" },
    ],
  },
};

const getMaterialDetails = (name) =>
  MATERIAL_DETAILS[name] || MATERIAL_DETAILS.Empty;

export { MATERIAL_GROUPS, MATERIAL_DETAILS, getMaterialDetails };
