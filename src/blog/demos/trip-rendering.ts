const descriptions = [
  'The page appears with a placeholder hero and incomplete navigation.',
  'The hero loads and “List your property” appears in the navigation.',
  'A search field appears in the header.',
  'The promotional messages change to a different set of guarantees.',
];

export function init(element: HTMLElement) {
  const root = element.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>
    :host{display:block;margin:1.5rem 0 2rem;color:var(--bone);font:inherit}
    *{box-sizing:border-box}.comparison{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:clamp(1rem,3vw,1.4rem)}
    .panels{display:grid;gap:.8rem}.panel{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:1rem;align-items:start;min-width:0}.panel h3{font-size:.95rem;margin:0 0 .25rem}.panel p,.note{color:var(--bone);font-size:.8rem;line-height:1.5;margin:.3rem 0 .5rem}.shot{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:5px;background:var(--bright-snow)}.mock{position:relative;min-width:0}.mock .mask{position:absolute;background:#e2e5eb;border-radius:2px}.mock .search{left:18.4%;top:1%;width:17.3%;height:11%}.mock .property{left:46.8%;top:2%;width:11%;height:10%;background:#fff}.mock .icon{top:85%;width:3%;height:10%}.mock .icon:nth-of-type(3){left:36.6%}.mock .icon:nth-of-type(4){left:45.4%}.mock .icon:nth-of-type(5){left:54.1%}.mock .icon:nth-of-type(6){left:62.9%}.mock .icon:nth-of-type(7){left:71.7%}.mock .icon:nth-of-type(8){left:80.5%}.mock .promos{left:34%;top:56%;width:49%;height:11%;background:#2863d9;display:flex;align-items:center;justify-content:center;gap:2%;border-radius:0}.promos i{display:block;width:25%;height:23%;border-radius:2px;background:#9ab9ef}.mock.ready .mask{display:none}
    .controls{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:1rem;margin:1rem 0 .4rem}button{font:inherit;font-size:.85rem;color:var(--carbon-black);background:var(--bone);border:0;border-radius:6px;min-height:44px;padding:.5rem 1rem;cursor:pointer;white-space:nowrap}button:focus-visible,input:focus-visible{outline:2px solid var(--bright-snow);outline-offset:3px}.scrub{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:.7rem;min-width:0;font-size:.85rem}.scrub span,.scrub output{white-space:nowrap}.scrub input{display:block;width:100%;min-width:0;margin:0;accent-color:var(--pine-text)}.note{margin:.7rem 0 0}@media(max-width:580px){.panel{grid-template-columns:1fr;gap:.3rem}}@media(max-width:420px){.controls{grid-template-columns:1fr}.controls button{justify-self:start}}
  </style><section class="comparison" aria-label="Homepage rendering comparison">
    <div class="panels"><div class="panel"><div><h3>Observed: four states</h3><p>Trip.com screenshots, shown in sequence</p><p id="caption" aria-live="polite"></p></div><img class="shot" id="observed" src="/images/feature-flag-flicker/frame-1.png" alt="Trip.com homepage, first captured state"></div>
    <div class="panel"><div><h3>Hypothetical: better placeholders</h3><p>An illustrated loading state, followed by the final capture. Not a tested implementation.</p></div><div class="mock" id="mock"><img class="shot" id="concept" src="/images/feature-flag-flicker/frame-4.png" alt="Illustrated loading state with placeholders for search, promotions and travel icons"><span class="mask search"></span><span class="mask property"></span><span class="mask icon"></span><span class="mask icon"></span><span class="mask icon"></span><span class="mask icon"></span><span class="mask icon"></span><span class="mask icon"></span><span class="mask promos"><i></i><i></i><i></i></span></div></div>
    <div class="panel"><div><h3>Hypothetical: final state first</h3><p>The final captured state shown from the start. Not a tested implementation.</p></div><img class="shot" src="/images/feature-flag-flicker/frame-4.png" alt="Trip.com homepage in its final captured state"></div></div>
    <div class="controls"><button type="button" id="play">Play sequence</button><label class="scrub"><span>Frame</span><input id="frame" type="range" min="1" max="4" step="1" value="1"><output id="number">1 / 4</output></label></div><p class="note">Playback spacing is illustrative, not a measurement of loading time.</p></section>`;
  const input = root.querySelector<HTMLInputElement>('#frame')!;
  const image = root.querySelector<HTMLImageElement>('#observed')!;
  const concept = root.querySelector<HTMLImageElement>('#concept')!;
  const mock = root.querySelector<HTMLElement>('#mock')!;
  const caption = root.querySelector<HTMLElement>('#caption')!;
  const number = root.querySelector<HTMLOutputElement>('#number')!;
  const button = root.querySelector<HTMLButtonElement>('#play')!;
  let timer: ReturnType<typeof setInterval> | undefined;
  const stop = () => { clearInterval(timer); timer = undefined; button.textContent = 'Replay sequence'; };
  const render = () => {
    const frame = Number(input.value);
    image.src = `/images/feature-flag-flicker/frame-${frame}.png`;
    image.alt = `Trip.com homepage, captured state ${frame} of 4`;
    mock.classList.toggle('ready', frame === 4);
    concept.alt = frame === 4 ? 'Trip.com homepage in its final captured state' : 'Illustrated loading state with placeholders for search, promotions and travel icons';
    caption.textContent = descriptions[frame - 1];
    number.value = `${frame} / 4`;
  };
  input.addEventListener('input', () => { stop(); render(); });
  button.addEventListener('click', () => {
    if (timer) { stop(); return; }
    input.value = '1'; render(); button.textContent = 'Pause';
    timer = setInterval(() => {
      input.value = String(Number(input.value) + 1); render();
      if (input.value === '4') stop();
    }, 1100);
  });
  render();
}
