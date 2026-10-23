import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

export function Modal({ title, kicker, onClose, children, wide, drawer, headerActions }: { title: string; kicker?: string; headerActions?: ReactNode; onClose: () => void; children: ReactNode; wide?: boolean; drawer?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current!; element.showModal(); return () => element.close(); }, []);
  return <dialog className={`town-dialog ${wide ? 'wide' : ''} ${drawer ? 'daily-drawer' : ''}`} ref={dialog} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === dialog.current) { const rect = dialog.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }} aria-labelledby="dialog-title">
    <div className="dialog-heading">{kicker && <span className="small-eyebrow">{kicker}</span>}{headerActions && <div className="dialog-header-actions">{headerActions}</div>}<button className="icon-button" onClick={onClose} aria-label="关闭窗口"><Icon name="close" size={20}/></button><h2 id="dialog-title">{title}</h2></div>
    {drawer ? <div className="daily-sheet-body">{children}</div> : children}
  </dialog>;
}
