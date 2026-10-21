import { useEffect, useRef, useState } from 'react';

const PALETTE = ['#35516a', '#e2557b', '#4f929a', '#e6bc71', '#7fae72', '#8b7ec8'];
const WIDTHS = [4, 9, 16];
const SIZE = 320;

type Props = { saved: string | null; onSave: (dataUrl: string) => void; onWear: () => void };

export function DragonPainter({ saved, onSave, onWear }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(PALETTE[0]);
  const [width, setWidth] = useState(WIDTHS[1]);
  const [eraser, setEraser] = useState(false);
  const [inked, setInked] = useState(false);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, SIZE, SIZE);
  }, []);

  const pointOf = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * SIZE / rect.width, y: (event.clientY - rect.top) * SIZE / rect.height };
  };
  const strokeTo = (point: { x: number; y: number }) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !last.current) return;
    ctx.globalCompositeOperation = eraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = eraser ? width * 2.2 : width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    last.current = point;
  };
  const clear = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, SIZE, SIZE);
    setInked(false);
  };

  return <div className="dragon-painter">
    <canvas
      ref={canvasRef} width={SIZE} height={SIZE} className={`painter-board ${eraser ? 'is-eraser' : ''}`}
      aria-label="小龙手绘板"
      onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); drawing.current = true; last.current = pointOf(event); strokeTo(last.current); setInked(true); }}
      onPointerMove={event => { if (drawing.current) strokeTo(pointOf(event)); }}
      onPointerUp={() => { drawing.current = false; last.current = null; }}
      onPointerCancel={() => { drawing.current = false; last.current = null; }}
    />
    <div className="painter-tools">
      <div className="painter-colors">{PALETTE.map(item => <button key={item} className={`painter-color ${!eraser && color === item ? 'active' : ''}`} style={{ background: item }} aria-label={`换颜色`} onClick={() => { setColor(item); setEraser(false); }} />)}</div>
      <div className="painter-widths">{WIDTHS.map(item => <button key={item} className={`painter-width ${!eraser && width === item ? 'active' : ''}`} aria-label="换笔粗细" onClick={() => { setWidth(item); setEraser(false); }}><i style={{ width: item + 3, height: item + 3 }} /></button>)}</div>
      <button className={`painter-eraser ${eraser ? 'active' : ''}`} aria-pressed={eraser} onClick={() => setEraser(value => !value)}>橡皮擦</button>
      <button className="painter-clear" onClick={clear}>重画</button>
    </div>
    <div className="painter-actions">
      <button className="painter-save" disabled={!inked} onClick={() => { const url = canvasRef.current?.toDataURL('image/png'); if (url) onSave(url); }}>保存并穿上</button>
      {saved && <button className="painter-wear" onClick={onWear}>穿上上次的手绘</button>}
    </div>
    <p className="painter-hint">棋盘格表示透明区域，不会保存到图片里。画完点「保存并穿上」即可。</p>
  </div>;
}
