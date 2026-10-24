import { memo } from 'react';
import { asset } from '../data/town';
import type { WorldStyle } from '../data/worldStyle';
import { guardianPlacements } from '../world/guardian';
import './knowledge-guardian.css';

type Props = { worldStyle: WorldStyle; nearby: boolean; speaking: boolean; disabled: boolean; onOpen: () => void };

export const KnowledgeGuardian = memo(function KnowledgeGuardian({ worldStyle, nearby, speaking, disabled, onOpen }: Props) {
  const { anchor, size, image, eyes, tail, core } = guardianPlacements[worldStyle];
  return <button type="button" className={`knowledge-guardian guardian-${worldStyle} ${nearby ? 'is-nearby' : ''}`}
    style={{ left: anchor.x, top: anchor.y, width: size, height: size, zIndex: anchor.y }}
    aria-label="和创智小龙说句话" aria-expanded={speaking} aria-controls={speaking ? 'guardian-speech' : undefined} disabled={disabled} onClick={onOpen}>
    <span className="guardian-art" aria-hidden="true">
      <img src={asset(image)} alt="" draggable={false}/>
      <svg className="guardian-face" viewBox="0 0 1000 1000" focusable="false">
        {eyes.map((eye, index) => <g key={index} className="guardian-eyelid">
          <ellipse cx={eye.x} cy={eye.y} rx={eye.rx + 3} ry={eye.ry + 3} fill="#e5f8ff"/>
          <path d={`M${eye.x - eye.rx * .75} ${eye.y} Q${eye.x} ${eye.y + 12} ${eye.x + eye.rx * .75} ${eye.y - 2}`} fill="none" stroke="#246eae" strokeWidth="5" strokeLinecap="round"/>
        </g>)}
      </svg>
    </span>
    <span className="guardian-tail-light" aria-hidden="true" style={{ left: `${tail.x / 10}%`, top: `${tail.y / 10}%` }}/>
    <span className="guardian-core-light" aria-hidden="true" style={{ left: `${core.x / 10}%`, top: `${core.y / 10}%` }}/>
    <span className="guardian-ground-light" aria-hidden="true"/>
    <span className="guardian-label"><i aria-hidden="true"/><span>创智小龙</span><b aria-hidden="true">聊聊 ›</b></span>
  </button>;
});
