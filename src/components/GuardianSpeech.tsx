import { useEffect, useRef, useState } from 'react';
import type { Point } from '../data/town';
import type { WorldStyle } from '../data/worldStyle';
import { requestGuardianReply } from '../services/guardianSpeech';
import { Icon } from './Icon';

type Props = { anchor: Point; viewport: { width: number; height: number }; worldStyle: WorldStyle; onClose: () => void };

export function GuardianSpeech({ anchor, viewport, worldStyle, onClose }: Props) {
  const root = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const composing = useRef(false);
  const [draft, setDraft] = useState('');
  const [answer, setAnswer] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const width = Math.min(330, viewport.width - 32);
  const left = Math.max(16, Math.min(anchor.x - width - 22, viewport.width - width - 16));
  const top = Math.max(150, Math.min(anchor.y + 25, viewport.height - 190));

  useEffect(() => {
    input.current?.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      if (!root.current?.contains(event.target) && !event.target.closest('.knowledge-guardian')) close.current();
    };
    document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('pointerdown', outside); request.current?.abort(); };
  }, []);

  const send = async () => {
    const utterance = draft.trim();
    if (!utterance || request.current || composing.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setAnswer('');
    setError('');
    setDraft('');
    try {
      const reply = await requestGuardianReply(utterance, controller.signal);
      if (!controller.signal.aborted) setAnswer(reply);
    } catch {
      if (!controller.signal.aborted) { setError('没听清，再试一次'); setDraft(current => current || utterance); }
    } finally {
      if (request.current === controller) request.current = null;
      if (!controller.signal.aborted) setPending(false);
    }
  };

  return <section ref={root} id="guardian-speech" className={`guardian-speech guardian-speech-${worldStyle}`} style={{ left, top, width }} aria-label="对创智小龙说话"
    onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); onClose(); document.querySelector<HTMLButtonElement>('.knowledge-guardian')?.focus({ preventScroll: true }); } }}>
    {(pending || answer || error) && <div className="guardian-speech-bubble" role="status" aria-live="polite">
      <small>创智小龙</small>
      {pending ? <span className="guardian-thinking" aria-label="正在回应"><i/><i/><i/></span> : <p>{error || answer}</p>}
    </div>}
    <form className="guardian-speech-input" onSubmit={event => { event.preventDefault(); void send(); }}>
      <input ref={input} value={draft} onChange={event => setDraft(event.target.value)} placeholder="对小龙说句话…" aria-label="对小龙说句话" maxLength={500} autoComplete="off"
        onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
        onKeyDown={event => { if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)) event.preventDefault(); }}/>
      <button type="submit" className="guardian-speech-send" disabled={!draft.trim() || pending} aria-label="说给小龙听"><Icon name="send" size={18}/></button>
      <button type="button" className="guardian-speech-close" onClick={onClose} aria-label="结束说话"><Icon name="close" size={17}/></button>
    </form>
  </section>;
}
