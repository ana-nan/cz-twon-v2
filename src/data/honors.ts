import type { HonorEvent } from '../hooks/useHonors';
export const honors: {id:string;event:HonorEvent;goal:number;symbol:string;name:string;description:string}[] = [
 {id:'welcome',event:'arrival',goal:1,symbol:'✦',name:'小镇新居民',description:'第一次来到创智小镇'},
 {id:'island',event:'island',goal:1,symbol:'⚑',name:'初访活动岛',description:'进入活动岛查看活动'},
 {id:'reader',event:'read',goal:3,symbol:'▤',name:'认真读过',description:'打开 3 篇不同帖子的全文'},
 {id:'author',event:'publish',goal:1,symbol:'✎',name:'第一份分享',description:'发布 1 篇自己的帖子'},
 {id:'reply',event:'reply',goal:3,symbol:'❞',name:'温暖的回声',description:'在 3 篇不同帖子下回复'},
 {id:'vote',event:'vote',goal:1,symbol:'✓',name:'我的一票',description:'参与 1 次小镇投票'},
 {id:'regular',event:'read',goal:10,symbol:'✧',name:'小镇常客',description:'阅读 10 篇不同帖子的全文'},
 {id:'writer',event:'publish',goal:5,symbol:'❋',name:'故事收藏家',description:'累计发布 5 篇帖子'},
];
