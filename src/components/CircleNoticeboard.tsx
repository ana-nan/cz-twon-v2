import './circle-noticeboard.css';

export function CircleNoticeboard({ onOpen }: { onOpen: () => void }) {
  return <button className="circle-noticeboard" onClick={onOpen} aria-label="创智圈板报：查看讨论与分享">
    <span className="noticeboard-shadow" aria-hidden="true"/>
    <span className="noticeboard-post post-left" aria-hidden="true"/>
    <span className="noticeboard-post post-right" aria-hidden="true"/>
    <span className="noticeboard-frame">
      <strong className="noticeboard-title">创智圈 <span>›</span></strong>
      <span className="noticeboard-papers" aria-hidden="true">
        <svg viewBox="0 0 144 72" fill="none">
          <path fill="#68472c" opacity=".2" d="M9 9h39v52H9zM57 12h33v29H57zM98 6h38v44H98zM62 48h29v20H62z"/>
          <path fill="#fff8df" d="M6 5h39v52H6z"/>
          <path fill="#9ec9d2" d="M10 9h31v25H10z"/>
          <path fill="#6b9577" d="m10 34 10-13 8 7 6-5 7 11z"/>
          <path fill="#f9df92" d="M32 12h6v6h-6z"/>
          <path stroke="#afaa87" strokeWidth="2" d="M12 42h27M12 47h20"/>
          <path fill="#f3dfa2" d="M54 8h33v29H54z"/>
          <path stroke="#b2a16c" strokeWidth="2" d="M60 18h21M60 24h17M60 30h12"/>
          <path fill="#dce5c7" d="M95 3h38v43H95z"/>
          <path stroke="#678d6c" strokeWidth="2" d="M114 37V14"/>
          <path fill="#82a279" d="M114 25c-12 0-12-11-12-11 12 0 12 11 12 11m0 7c12 0 12-11 12-11-12 0-12 11-12 11"/>
          <path fill="#f2cbc0" d="M59 44h29v20H59z"/>
          <path stroke="#b49181" strokeWidth="2" d="M64 52h19M64 57h12"/>
          <path fill="#fff3cc" d="M100 54h28v4h-28zM100 62h20v3h-20z"/>
          <path fill="#a35e46" d="M23 3h4v5h-4zM69 6h4v5h-4zM112 1h4v5h-4zM72 42h4v5h-4z"/>
        </svg>
      </span>
    </span>
  </button>;
}
