// Single-turn demo adapter: only the current utterance is passed to the responder.
export function requestGuardianReply(_utterance: string, signal: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve('你好');
    }, 550);
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    signal.addEventListener('abort', abort, { once: true });
  });
}
