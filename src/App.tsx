import { readWorldStyle, type WorldStyle } from './data/worldStyle';
import { IdentityMenu } from './components/IdentityMenu';
import { usePublicIdentity } from './hooks/usePublicIdentity';
import { HonorCelebration } from './components/HonorCelebration';
import { HonorWall } from './components/HonorWall';
import { useHonors } from './hooks/useHonors';
import { useEffect, useRef, useState } from 'react';
import { asset, currentScene, outfits, getPlace, loadCustomDragon, saveCustomDragon, type Outfit, type Place, type Post } from './data/town';
import { startBgm, stopBgm } from './audio/bgm';
import { usePosts } from './hooks/usePosts';
import { useUnread } from './hooks/useUnread';
import { DailyBriefing } from './components/DailyBriefing';
import { DragonPainter } from './components/DragonPainter';
import { GameScene } from './components/GameScene';
import { BulletinBoard } from './components/BulletinBoard';
import { PlayerDock } from './components/PlayerDock';
import { Icon } from './components/Icon';
import { Modal } from './components/Modal';
import { PostComposer } from './components/PostComposer';
import { PostDiscussion } from './components/PostDiscussion';
import { SceneSettings } from './components/SceneSettings';
import { TownMap } from './components/TownMap';
import { PlaceExperience } from './components/PlaceExperience';
import { GameGlyph } from './components/GameGlyph';

type Dialog = null | { type: 'honors' | 'briefing' | 'compose' | 'wardrobe' | 'painter' | 'map' | 'settings' | 'help' | 'board' } | { type: 'post'; id: string } | { type: 'place'; place: Place };
function initialOutfit(): Outfit {
  try {
    const saved = localStorage.getItem('chuangzhi-outfit');
    if (saved === 'custom') return loadCustomDragon() ? 'custom' : 'player';
    if (outfits.some(item => item.id === saved)) return saved as Outfit;
  } catch { /* use the default outfit */ }
  return 'player';
}

export default function App() {
  const [worldStyle,setWorldStyle] = useState<WorldStyle>(readWorldStyle);
  useEffect(()=>{try{localStorage.setItem('town-world-style',worldStyle);}catch{/* Keep the session preference. */}},[worldStyle]);
  const [birthdayVisible, setBirthdayVisible] = useState(() => { try { return localStorage.getItem('chuangzhi-birthday-visible') !== 'false'; } catch { return true; } });
  const [night, setNight] = useState(() => { try { return localStorage.getItem('chuangzhi-light-mode') !== 'day'; } catch { return true; } });
  const [musicOn, setMusicOn] = useState(() => { try { return localStorage.getItem('chuangzhi-music') !== 'false'; } catch { return true; } });
  const [zoom, setZoom] = useState(1);
  const [outfit, setOutfit] = useState<Outfit>(initialOutfit);
  const publicIdentity = usePublicIdentity(outfit);
  const [customDragon, setCustomDragon] = useState<string | null>(loadCustomDragon);
  const [selected, setSelected] = useState<Place | null>(null);
  const [travel] = useState<{ place: Place; sequence: number } | null>(null);
  const [dialog, setDialog] = useState<Dialog>({ type: 'briefing' });
  const [dailyBoard, setDailyBoard] = useState('home');
  const [postFromBriefing, setPostFromBriefing] = useState(false);
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState('');
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { posts, createPost, replyToPost, voteOnPost, storageError } = usePosts({name:publicIdentity.identity.name,avatar:(publicIdentity.identity.avatar??'player') as Outfit,customAvatar:publicIdentity.identity.image});
  const honors = useHonors();
  const vote = (id: string, option: number) => { const post = posts.find(item=>item.id===id); if(post?.poll && post.poll.selected===undefined && post.poll.options[option]) {voteOnPost(id,option); honors.record('vote',id);} };
  const { unread, markRead } = useUnread(posts);
  const today = new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', weekday: 'long', timeZone: 'Asia/Shanghai' }).format(new Date());
  const activePost = dialog?.type === 'post' ? posts.find(post => post.id === dialog.id) : null;

  useEffect(() => { try { localStorage.setItem('chuangzhi-light-mode', night ? 'night' : 'day'); } catch { /* Session remains usable. */ } }, [night]);
  useEffect(() => { try { localStorage.setItem('chuangzhi-outfit', outfit); } catch { /* keep the current session usable */ } }, [outfit]);
  useEffect(() => { try { localStorage.setItem('chuangzhi-birthday-visible', String(birthdayVisible)); } catch { /* Keep the switch usable without storage. */ } }, [birthdayVisible]);
  useEffect(() => {
    try { localStorage.setItem('chuangzhi-music', String(musicOn)); } catch { /* Keep the switch usable without storage. */ }
    if (musicOn) startBgm(); else stopBgm();
  }, [musicOn]);
  // Browsers block audio until a gesture; the first tap or keypress anywhere unlocks the loop.
  useEffect(() => {
    if (!musicOn) return;
    const unlock = () => startBgm();
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
    return () => { document.removeEventListener('pointerdown', unlock); document.removeEventListener('keydown', unlock); };
  }, [musicOn]);
  useEffect(() => () => { if (messageTimer.current) clearTimeout(messageTimer.current); if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const notify = (text: string) => { setToast(text); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 2800); };
  const speak = (text: string) => { setMessage(text); if (messageTimer.current) clearTimeout(messageTimer.current); messageTimer.current = setTimeout(() => setMessage(''), 4200); };
  const visit = (place: Place) => {
    setSelected(place);
    if(place.id==='heart') honors.record('island');
    if (place.id === 'heart') setDialog({ type: 'place', place });
    else { setDailyBoard(place.id === 'voice' ? 'voice' : 'home'); setDialog({ type: 'briefing' }); }

    (document.activeElement as HTMLElement)?.blur();
  };
  const openPost = (post: Post, fromBriefing = false) => { honors.record('read',post.id); markRead([post]); setPostFromBriefing(fromBriefing); setDialog({ type: 'post', id: post.id }); };
  const closeDialog = () => setDialog(dialog?.type === 'post' && postFromBriefing ? { type: 'briefing' } : null);

  return <div className={`town-app immersive-app style-${worldStyle} ${night ? 'is-night' : 'is-day'}`}>
    <header className="app-header">
      <a className="brand" href="#" onClick={event => { event.preventDefault(); closeDialog(); }}><img className="brand-logo" src={asset('ui/chuangzhi-town-logo.png')} alt="创智小镇"/></a>
      <div className="world-status"><span className="presence"><i/><span className="presence-copy">4 人在<small>{currentScene.name}</small></span></span><span className="status-divider"/><span className="daylight-symbol" aria-label={night ? '夜晚' : '白天'}>{night ? '☾' : '☀'}</span><span className="hud-date">{today}</span></div>
      <div className="header-tools"><button className="scene-settings-button honor-entry" aria-label="荣誉墙" title="荣誉墙" onClick={()=>setDialog({type:'honors'})}><span aria-hidden="true">♜</span></button><button className="header-map-button classic-mode-button" title="经典模式（待开放）" disabled><Icon name="book" size={26}/><span>经典模式<small>待开放</small></span></button><button className="scene-settings-button" aria-label="场景设置" title="场景设置" onClick={() => setDialog({ type: 'settings' })}><span aria-hidden="true">⚙</span></button><button className="hud-activity-button" aria-label={`创智圈，${unread.length} 条未读`} title="创智圈" onClick={() => setDialog({ type: 'briefing' })}><Icon name="book" size={23}/>{unread.length > 0 && <b className="hud-count">{unread.length}</b>}</button><button className="header-map-button" onClick={() => setDialog({ type: 'map' })}><GameGlyph name="map"/><span>小镇地图</span></button><button className="icon-button help-button" aria-label="操作说明" onClick={() => setDialog({ type: 'help' })}><Icon name="help" size={20}/></button></div>
    </header>

    <main className="game-world">
      <GameScene key={worldStyle} worldStyle={worldStyle} zoom={zoom} night={night} outfit={outfit} disabled={!!dialog} travel={travel} selected={selected} message={message} birthdayVisible={birthdayVisible} onVisit={visit} onInteract={visit}/>
    </main>
    <PlayerDock outfit={outfit} onOutfit={value => { setOutfit(value); notify(`已换上${outfits.find(item => item.id === value)?.name}`); }} onWardrobe={() => setDialog({ type: 'wardrobe' })} onMessage={speak}/>

    {dialog?.type === 'honors' && <Modal wide title="荣誉墙" kicker="MY LITTLE MILESTONES" onClose={closeDialog}><HonorWall progress={honors.progress} saveError={honors.saveError}/></Modal>}
    {dialog?.type === 'briefing' && <Modal drawer title="创智圈" headerActions={<IdentityMenu profile={publicIdentity.identity} onSave={publicIdentity.save}/>} onClose={closeDialog}><DailyBriefing onVote={vote} initialBoard={dailyBoard} onCompose={() => { setSelected(getPlace(dailyBoard === 'voice' ? 'voice' : 'notice')); setDialog({ type: 'compose' }); }} onBoard={setDailyBoard} posts={posts} unread={unread} onPost={post => openPost(post, true)} onDismiss={closeDialog} onMarkAll={() => markRead(posts)}/></Modal>}
    {dialog?.type === 'board' && <Modal wide title="小镇消息墙" kicker="LITTLE NOTES, BIG CONNECTIONS" onClose={closeDialog}><BulletinBoard posts={posts} onPost={openPost} onCompose={() => setDialog({ type: 'compose' })}/></Modal>}
    {dialog?.type === 'compose' && <Modal title={selected?.id === 'heart' ? '发起活动' : '发布动态'} onClose={closeDialog}><PostComposer publicName={publicIdentity.identity.name} publicAvatar={publicIdentity.identity.image??asset(`characters/${publicIdentity.identity.avatar??'player'}.png`)} initialCategory={selected?.id} onSubmit={(title, body, category, noticeType, images, poll, anonymousName, identity) => { createPost(title, body, category, noticeType, images, poll, anonymousName, identity); honors.record('publish',crypto.randomUUID()); setSelected(getPlace(category)); if (category === 'heart') setDialog({ type: 'place', place: getPlace(category) }); else { setDailyBoard(category === 'voice' ? 'voice' : 'home'); setDialog({ type: 'briefing' }); } notify(category === 'bottle' ? '漂流瓶已经出发，期待一份回应。' : category === 'voice' ? '已用匿名身份发出。' : `已分享到「${getPlace(category).name}」`); }}/></Modal>}
    {dialog?.type === 'post' && activePost && <Modal drawer={postFromBriefing} title={activePost.title} kicker={getPlace(activePost.category).name} onClose={closeDialog}><PostDiscussion onVote={option=>vote(activePost.id,option)} post={activePost} onReply={text => { replyToPost(activePost.id, text); honors.record('reply',activePost.id); }}/></Modal>}
    {dialog?.type === 'place' && <Modal title={dialog.place.name} kicker={dialog.place.subtitle} onClose={closeDialog}><PlaceExperience key={dialog.place.id} place={dialog.place} posts={posts} onPost={openPost} onCompose={() => { setSelected(dialog.place); setDialog({ type: 'compose' }); }}/></Modal>}
    {dialog?.type === 'wardrobe' && <Modal wide title="今天，穿哪一套？" kicker="YOUR LITTLE WARDROBE" onClose={closeDialog}><p className="dialog-intro">每一种样子，都是你。</p><div className="outfit-grid">{outfits.map(item => item.id === 'custom' ? <button key={item.id} className={`outfit-card outfit-card-draw ${outfit === item.id ? 'selected' : ''}`} aria-pressed={outfit === item.id} onClick={() => setDialog({ type: 'painter' })}>{customDragon ? <img src={customDragon} alt=""/> : <span className="draw-slot"><Icon name="plus" size={40}/></span>}<strong>{item.name}</strong><span>{item.description}</span><small>{outfit === item.id ? '✓ 正在穿' : customDragon ? '重新画一只' : '打开画板'}</small></button> : <button key={item.id} className={`outfit-card ${outfit === item.id ? 'selected' : ''}`} aria-pressed={outfit === item.id} onClick={() => { setOutfit(item.id); notify(`已换上${item.name}`); }}><img src={asset(`characters/${item.id}.png`)} alt=""/><strong>{item.name}</strong><span>{item.description}</span><small>{outfit === item.id ? '✓ 正在穿' : '试试看'}</small></button>)}</div></Modal>}
    {dialog?.type === 'painter' && <Modal title="自己画一只小龙" kicker="DRAW YOUR DRAGON" onClose={closeDialog}><DragonPainter saved={customDragon} onSave={url => { saveCustomDragon(url); setCustomDragon(url); setOutfit('custom'); setDialog(null); notify('你的手绘小龙上线啦'); }} onWear={() => { setOutfit('custom'); setDialog(null); notify('已换上自己画的小龙'); }}/></Modal>}
    {dialog?.type === 'map' && <Modal wide title="小镇地图" kicker="CHUANGZHI TOWN · 世界导览" onClose={closeDialog}><TownMap onEnter={() => setDialog(null)}/></Modal>}
    {dialog?.type === 'settings' && <Modal title="小镇氛围" kicker="按你的节奏，慢慢逛" onClose={closeDialog}><SceneSettings worldStyle={worldStyle} onWorldStyle={setWorldStyle} night={night} onNight={setNight} birthday={birthdayVisible} onBirthday={() => setBirthdayVisible(v => !v)} music={musicOn} onMusic={() => setMusicOn(v => !v)} zoom={zoom} onZoom={setZoom}/></Modal>}
    {dialog?.type === 'help' && <Modal title="在小镇里，慢慢逛" kicker="MAKE YOURSELF AT HOME" onClose={closeDialog}><div className="help-steps"><p><b>01</b><span><strong>走到想去的地方</strong>点击广场地面，或按 WASD / 方向键移动。</span></p><p><b>02</b><span><strong>推开一扇门</strong>点建筑查看动态，靠近后按 E 进入讨论。</span></p><p><b>03</b><span><strong>和小伙伴碰个面</strong>点击小龙，或按空格打开表情轮盘；底部可以聊天和换装。</span></p><p><b>04</b><span><strong>留下你的小故事</strong>到消息墙发帖、回复，分享今天的新鲜事。</span></p></div></Modal>}
    {storageError && <div className="post-storage-warning" role="alert">浏览器存储空间不足，新内容仅在本次打开期间保留。请减少上传图片大小。</div>}
    <HonorCelebration honor={honors.celebration} onDismiss={honors.dismissCelebration} surface={dialog?.type ?? 'scene'}/>
    <div className={`toast ${toast ? 'show' : ''}`} role="status">{toast && <><Icon name="sparkle" size={17}/>{toast}</>}</div>
  </div>;
}
