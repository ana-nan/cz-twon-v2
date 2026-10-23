export type AnonymousIdentity = { name: string; symbol: string; color: string; avatar?: string; image?: string };
export const identityAvatars = ['player','mushroom','explorer','campus','kitty','batman','simpson','jojo'];
export const validAvatarImage = (value: unknown): value is string => typeof value === 'string' && value.length < 450000 && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value);
export const identitySymbols = ['☾','✦','☁','❋','◇','☀'];
export const identityColors = ['#617e91','#7f739e','#71927e','#b48b62','#a97483','#65768c'];
export const anonymousPresets: AnonymousIdentity[] = [
  {name:'月光小龙',symbol:'☾',color:identityColors[0]},
  {name:'星际旅人',symbol:'✦',color:identityColors[1]},
  {name:'云朵来客',symbol:'☁',color:identityColors[2]},
  {name:'匿名小龙',symbol:'◇',color:identityColors[5]},
];
export function normalizeIdentity(value: unknown): AnonymousIdentity {
  const data=(value && typeof value==='object'?value:{}) as Partial<AnonymousIdentity>;
  return {avatar:identityAvatars.includes(data.avatar??'')?data.avatar:undefined,image:validAvatarImage(data.image)?data.image:undefined,name:typeof data.name==='string'&&data.name.trim()?data.name.trim().slice(0,20):'匿名小龙',symbol:identitySymbols.includes(data.symbol??'')?data.symbol!:'◇',color:identityColors.includes(data.color??'')?data.color!:identityColors[5]};
}
export function readAnonymousIdentity():AnonymousIdentity {
  try {const saved=localStorage.getItem('town-anonymous-identity-v1');return normalizeIdentity(saved?JSON.parse(saved):{name:localStorage.getItem('town-anonymous-name')});} catch {return normalizeIdentity(null);}
}
