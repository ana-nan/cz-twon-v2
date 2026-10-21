import type { EditorialBoard } from './editorial';
export const WORLD = { width: 1600, height: 900 };
// Active scene metadata: the HUD location label reads from here, so new terrains/maps only need a new entry.
export const currentScene = { name: '创智龙广场' };
export const asset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`;
export type Point = { x: number; y: number };
export type PlaceId = 'heart' | 'voice' | 'notice' | 'bottle';
export type Place = {
  id: PlaceId; name: string; description: string; image: string;
  position: Point; width: number; height: number; approach: Point; color: string; number: string; action: string; subtitle: string;
};

// All scene coordinates describe the feet of an object on the same 1600 × 900 map.
export const places: Place[] = [
  { id: 'heart', name: '活动岛', subtitle: '一起参加小活动', description: '找一个喜欢的小活动，和同频的人碰个面。', image: 'heart-gazebo.png', position: { x: 247, y: 390 }, width: 310, height: 280, approach: { x: 245, y: 337 }, color: '#df9eb2', number: '01', action: '发起小活动' },
  { id: 'voice', name: '匿名开麦', subtitle: '把心里话说出来', description: '不显示昵称和装扮，想说的话就在这里说。', image: 'open-stage.png', position: { x: 1410, y: 405 }, width: 350, height: 240, approach: { x: 1020, y: 631 }, color: '#c4a7e4', number: '02', action: '匿名说一句' },
  { id: 'notice', name: '小镇公告', subtitle: '匿名开麦 · 小镇精选', description: '新鲜资讯、活动海报和招募消息，一站看见。', image: 'poster-kiosk.png', position: { x: 138, y: 682 }, width: 260, height: 240, approach: { x: 485, y: 706 }, color: '#e6bc71', number: '03', action: '贴一张公告' },
  { id: 'bottle', name: '漂流瓶', subtitle: '遇见一份小分享', description: '把日常和发现装进瓶子，等一个偶然的回应。', image: 'bottle-station.png', position: { x: 1460, y: 700 }, width: 275, height: 265, approach: { x: 1115, y: 706 }, color: '#83d8d1', number: '04', action: '投一只漂流瓶' },
];

export type Outfit = 'player' | 'custom' | 'mushroom' | 'explorer' | 'campus' | 'kitty' | 'simpson' | 'batman' | 'jojo';
export const outfits: { id: Outfit; name: string; description: string }[] = [
  { id: 'custom', name: '自己画的小龙', description: '亲手画的样子，独一无二' },
  { id: 'player', name: '晴天卫衣', description: '轻轻松松，出门散步' },
  { id: 'mushroom', name: '蘑菇漫游者', description: '背上背包，去找小惊喜' },
  { id: 'explorer', name: '灵感探险家', description: '下一站，会有什么呢' },
  { id: 'kitty', name: '猫猫头套小龙', description: '粉色蝴蝶结和软乎乎的猫耳' },
  { id: 'simpson', name: '辛普森小龙', description: '黄色刺猬头，今天有点搞怪' },
  { id: 'batman', name: '蝙蝠侠小龙', description: '披上黑色披风，夜巡广场' },
  { id: 'jojo', name: 'JOJO 星尘战士', description: '粗重墨线、夸张姿势和漫画气场' },
];

// The player's hand-drawn dragon lives in localStorage as a PNG data URL, with a module-level cache.
const customDragonKey = 'chuangzhi-custom-dragon';
let customDragonCache: string | null | undefined;
export const loadCustomDragon = (): string | null => {
  if (customDragonCache === undefined) {
    try { customDragonCache = localStorage.getItem(customDragonKey); } catch { customDragonCache = null; }
  }
  return customDragonCache;
};
export const saveCustomDragon = (dataUrl: string) => {
  customDragonCache = dataUrl;
  try { localStorage.setItem(customDragonKey, dataUrl); } catch { /* stay in memory only */ }
};
export const neighbors: { name: string; outfit: Outfit; position: Point; greeting: string; height: number }[] = [
  { name: '小蓝子', outfit: 'mushroom', position: { x: 662, y: 679 }, greeting: '要来参加今晚的活动岛散步吗？', height: 91 },
  { name: '阿柚', outfit: 'explorer', position: { x: 952, y: 754 }, greeting: '刚在日报读到一个有趣的小故事～', height: 96 },
  { name: '程序龙', outfit: 'campus', position: { x: 1040, y: 680 }, greeting: '公告栏贴了新的创客活动，一起去吧！', height: 90 },
];
export type Reply = { id: string; text: string; author: string };
export type NoticeType = 'signal' | 'poster';
export type Poll = { question: string; options: { label: string; votes: number }[]; selected?: number };
export type Post = { id: string; category: PlaceId; title: string; body: string; author: string; time: string; replies: number; avatar: Outfit; comments: Reply[]; noticeType?: NoticeType; editorialBoard?: EditorialBoard; images?: string[]; poll?: Poll };
export const initialPosts: Post[] = [
  { id:'daily-poll-weekend', category:'notice', editorialBoard:'heart', title:'下一场活动，听听大家的想法', body:'给周末留一段一起玩的时间。你最想在活动岛参加哪一种活动？投一票，也欢迎在评论里补充想法。', author:'活动岛小组', time:'本周征集', avatar:'mushroom', replies:0, comments:[], images:[asset('plaza-island-clean-day.png')], poll:{question:'这个周末，你想怎么过？',options:[{label:'湖边音乐与落日野餐',votes:0},{label:'旧书交换与阅读分享',votes:0},{label:'桌游与新朋友见面会',votes:0},{label:'手作小物与创意市集',votes:0}]} },
  { id:'daily-culture', category:'notice', editorialBoard:'culture', title:'周末骑行之后，把沿途的风景留给你', body:'从湖边出发，沿着绿道慢慢骑。不赶路，遇到好看的风景就停下来。我们把路线、集合地点和出行准备整理在这里，欢迎一起补充你喜欢的校园周边路线。记得带水、戴头盔，出发前检查车况。', author:'小镇编辑部', time:'推荐阅读', avatar:'explorer', replies:0, comments:[] },
  { id:'daily-learning', category:'notice', editorialBoard:'learning', title:'一份可以反复使用的文献阅读笔记模板', body:'读论文时，可以先记录四件事：研究问题、关键方法、主要结论，以及还没想明白的问题。最后加一句“这篇文章能怎样帮助我的课题”。不用一开始就写得很完整，先留下自己的理解，再慢慢补充。收藏起来，下次读文献时试试看。', author:'学习互助小组', time:'推荐阅读', avatar:'campus', replies:0, comments:[] },
  { id:'daily-voice', category:'notice', editorialBoard:'voice', title:'本期开麦：你希望校园多一个什么空间？', body:'一个能安静看书的角落，还是一个可以放声排练的小房间？欢迎在评论中提出具体想法。若想匿名表达，可以到广场的匿名开麦区发言。', author:'小镇编辑部', time:'本期话题', avatar:'player', replies:0, comments:[] },
  { id:'daily-heart', category:'notice', editorialBoard:'heart', title:'给忙碌的一周，留半小时散步时间', body:'想参加小活动的同学，可以到心情驿站发起邀约：写清集合地点、时间和大致时长。两三个人也可以出发，聊聊天，看看湖面，让自己的节奏慢下来。', author:'小镇编辑部', time:'本期推荐', avatar:'mushroom', replies:0, comments:[] },
  { id:'daily-ideas', category:'notice', editorialBoard:'ideas', title:'从一个小问题开始，做一个有用的小作品', body:'找一个身边的小麻烦：资料总找不到、实验记录不整齐，或者活动信息太分散。先做一个能解决问题的最小版本，再邀请同学试用。欢迎在评论区分享你的想法和需要的帮助。', author:'创客互助小组', time:'推荐阅读', avatar:'campus', replies:0, comments:[] },

  { id: 'town-life-01', category: 'heart', title: '傍晚有人想一起绕湖走一圈吗', body: '六点二十在驿站旁边等，走半小时就回来。我会带一件浅蓝色外套，找不到的话在这里留个言。', author: '小满', time: '2 分钟前', replies: 2, avatar: 'mushroom', comments: [{ id: 'tl-r1', author: '阿柚', text: '算我一个，可能晚到五分钟。' }, { id: 'tl-r2', author: '小满', text: '好，我们在长椅那儿等你。' }] },
  { id: 'town-life-02', category: 'voice', title: '汇报前紧张得一直在喝水', body: '每次轮到我就忘词，明明自己排练的时候还挺顺。大家是怎么熬过开头那一分钟的？', author: '匿名小龙', time: '4 分钟前', replies: 2, avatar: 'player', comments: [{ id: 'tl-r3', author: '匿名回应', text: '我会把第一句话单独写在纸上，念完后反而能放松一点。' }, { id: 'tl-r4', author: '匿名回应', text: '先把语速放慢。我上次讲太快，三分钟就讲完了十分钟的内容。' }] },
  { id: 'town-life-03', category: 'notice', noticeType: 'poster', title: '周六旧书交换，带一本就能来', body: '周六下午两点到四点，公告栏旁边摆小桌。小说、教材、画册都行，扉页可以夹一张给下一位读者的纸条。下雨就另约时间。', author: '小蓝子', time: '8 分钟前', replies: 1, avatar: 'mushroom', comments: [{ id: 'tl-r5', author: '奶茶龙', text: '正好有两本看完的小说，我带过去。' }] },
  { id: 'town-life-04', category: 'bottle', title: '给捞到瓶子的你推荐一条小路', body: '从湖边往钟楼走，右手边第二个岔路口进去，那边有一排桂花。昨天路过的时候特别香，绕过去大概只多走三分钟。', author: '阿柚', time: '11 分钟前', replies: 0, avatar: 'explorer', comments: [] },
  { id: 'town-life-05', category: 'heart', title: '给小镇写一张生日便签', body: '在广场坐一会儿，写一件你想记住的小事。不会画画也没关系，写一句话就够了。写完可以在下面分享。', author: '云云', time: '14 分钟前', replies: 1, avatar: 'campus', comments: [{ id: 'tl-r6', author: '程序龙', text: '想记住和室友一起修好台灯的晚上。' }] },
  { id: 'town-life-06', category: 'voice', title: '今天终于把拖了很久的邮件发出去了', body: '其实只用了五分钟，但我纠结了三天。发完之后没发生什么大事，就是突然觉得可以去吃饭了。', author: '匿名小龙', time: '19 分钟前', replies: 1, avatar: 'player', comments: [{ id: 'tl-r7', author: '匿名回应', text: '懂这种感觉。先吃一顿好的。' }] },
  { id: 'town-life-07', category: 'notice', noticeType: 'signal', title: '收集大家常用的小工具，周末整理一版', body: '能帮上实际的忙就行：整理笔记、找文献、做图、记账。推荐时顺手写一句“你用它解决了什么”，比只贴链接好找很多。', author: '程序龙', time: '23 分钟前', replies: 0, avatar: 'campus', comments: [] },
  { id: 'town-life-08', category: 'bottle', title: '小猫今天又占了那块晒太阳的台阶', body: '本来想坐那里看书，结果它比我先到。最后我坐旁边，它睡了四十分钟，我只看了六页。', author: '奶茶龙', time: '28 分钟前', replies: 0, avatar: 'mushroom', comments: [] },
  { id: 'post-1', category: 'bottle', title: '送你一份今天的晚霞', body: '今天路过湖边，看到一片粉色的晚霞，就突然觉得慢一点也挺好。捞到这只瓶子的你，今天有遇见什么小小的美好吗？', author: '阿柚', time: '5 分钟前', replies: 1, avatar: 'explorer', comments: [{ id: 'r1', text: '今天买到了最后一份喜欢的面包！', author: '程序龙' }] },
  { id: 'post-2', category: 'notice', noticeType: 'poster', title: '周五创客夜，来展示你的小作品', body: '从一张手绘海报到会走路的小机器人，什么作品都欢迎。周五晚上七点，我们在创智龙广场见。', author: '小蓝子', time: '18 分钟前', replies: 0, avatar: 'mushroom', comments: [] },
  { id: 'post-3', category: 'heart', title: '日落散步，收集今天的小确幸', body: '今晚六点半，在心情驿站集合。沿着湖边走一小段，每个人带来一件今天的小确幸。不用准备，来就好。', author: '奶茶龙', time: '35 分钟前', replies: 0, avatar: 'player', comments: [] },
  { id: 'post-4', category: 'notice', noticeType: 'signal', title: '本周灵感速递：让 AI 帮你做个小作品', body: '从一个小想法开始，做一张互动明信片、一个小游戏，或者记录生活的小工具。带着你的发现，来广场交换灵感。', author: '星河', time: '42 分钟前', replies: 0, avatar: 'campus', comments: [] },
  { id: 'post-5', category: 'voice', title: '你的第一个科研坑是什么？', body: '那些踩过的坑，后来都成了故事。想听听大家第一次做项目时发生的小插曲。', author: '墨枝', time: '1 小时前', replies: 24, avatar: 'explorer', comments: [] },
  { id: 'post-6', category: 'heart', title: '给今天的心情选一个颜色', body: '这一周，一起记录心情的颜色。开心、平静、低落都可以，给自己的感受留一点位置。到驿站选一个今天的心情吧。', author: '云云', time: '1 小时前', replies: 0, avatar: 'mushroom', comments: [] },
  { id: 'post-7', category: 'bottle', title: '一个终于成功的小瞬间', body: '调了三周的小机器人，今天终于稳稳走过了十步。想把这一点点开心装进瓶子，送给正在努力的你。', author: '工仔', time: '2 小时前', replies: 0, avatar: 'campus', comments: [] },
];

export const scenePlaces = places.filter(place => place.id === 'heart' || place.id === 'notice');
export const getPlace = (id: PlaceId) => places.find(place => place.id === id)!;
