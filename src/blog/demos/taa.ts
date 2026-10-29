import markup from './taa.html?raw';
import rawData from './taa-data.json';
import gemData from './gem-data.json';

type Point = { date: string; entry: string | null; exit: string | null; spy: number; bil: number; ief: number; tip: number; r: Record<string, number> | null };
const points = (rawData as { points: Point[] }).points;
const colors: Record<string, string> = { above: 'var(--chart-warm)', below: 'var(--chart-rose)', buy: 'var(--bone)', tip: 'var(--chart-blue)', haa: 'var(--chart-blue)', momentum: 'var(--chart-warm)', tipOnly: 'var(--chart-green)' };
const labels: Record<string, string> = { above: 'SPY on positive return', buy: 'SPY buy and hold', tip: 'TIP filter', haa: 'SPY and TIP trends', momentum: 'SPY based on SPY trend', tipOnly: 'SPY based on TIP trend' };
const byId = <T extends Element>(root: ParentNode, id: string) => root.querySelector<T>(`#${id}`)!;
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

function averageMomentum(i: number, asset: 'spy' | 'bil' | 'ief' | 'tip') {
  if (i < 12) return null;
  const value = points[i][asset];
  return [1, 3, 6, 12].reduce((sum, n) => sum + value / points[i - n][asset] - 1, 0) / 4;
}
function sma(i: number, asset: 'spy' | 'tip', lookback: number) {
  if (i < lookback - 1) return null;
  return points.slice(i - lookback + 1, i + 1).reduce((sum, point) => sum + point[asset], 0) / lookback;
}
function selectedKeys(root: ParentNode) {
  return [...root.querySelectorAll<HTMLInputElement>('[data-strategy]:checked')].map((input) => input.dataset.strategy!);
}
function assetFor(key: string, i: number, lookback: number) {
  const row = points[i];
  const spyAverage = sma(i, 'spy', lookback);
  const tipAverage = sma(i, 'tip', lookback);
  const defensive = (averageMomentum(i, 'ief') || 0) > (averageMomentum(i, 'bil') || 0) ? 'ief' : 'bil';
  if (key === 'buy') return 'spy';
  if (key === 'momentum') return averageMomentum(i, 'spy')! > 0 ? 'spy' : defensive;
  if (key === 'tipOnly') return averageMomentum(i, 'tip')! > 0 ? 'spy' : defensive;
  if (key === 'haa') return averageMomentum(i, 'spy')! > 0 && averageMomentum(i, 'tip')! > 0 ? 'spy' : defensive;
  if (key === 'tip') return row.spy > spyAverage! && row.tip > tipAverage! ? 'spy' : 'bil';
  const positive = row.spy > points[i-lookback].spy;
  return positive ? 'spy' : 'bil';
}
function series(key: string, lookback = 12, start = 12) {
  const result: { i: number; value: number; dd: number; asset: string; ret: number }[] = [];
  let value = 100, peak = 100, previousAsset = '';
  for (let i = Math.max(start, lookback); i < points.length; i++) {
    const row = points[i]; if (!row.r) break;
    const asset = assetFor(key, i, lookback);
    const gross = row.r[asset];
    const sides = previousAsset ? (previousAsset === asset ? 0 : 2) : 1;
    const net = (1 + gross) * (1 - sides * .001) - 1;
    value *= 1 + net; peak = Math.max(peak, value);
    result.push({ i, value, dd: value / peak - 1, asset, ret: net });
    previousAsset = asset;
  }
  return result;
}
function metrics(items: ReturnType<typeof series>) {
  if (!items.length) return { cagr: 0, drawdown: 0, total: 0 };
  const years = items.length / 12;
  const finalValue = items[items.length - 1].value;
  return { cagr: (finalValue / 100) ** (1 / years) - 1, drawdown: Math.min(...items.map((x) => x.dd)), total: finalValue / 100 - 1 };
}
function sameCloseSeries() {
  const rows: ReturnType<typeof series> = [];
  let value=100,peak=100,previous='';
  for(let i=12;i<points.length-1&&points[i].r;i++){
    const asset=assetFor('above',i,12) as 'spy' | 'bil',gross=points[i+1][asset]/points[i][asset]-1;
    const sides=previous?(previous===asset?0:2):1,ret=(1+gross)*(1-sides*.001)-1;
    value*=1+ret;peak=Math.max(peak,value);rows.push({i,value,dd:value/peak-1,asset,ret});previous=asset;
  }
  return rows;
}
function path(items: { i: number; value: number }[], width = 620, height = 180, padding = 24) {
  if (!items.length) return '';
  const values = items.map((x) => x.value), min = Math.min(...values), max = Math.max(...values);
  const spread = max - min || 1;
  return items.map((item, index) => `${index ? 'L' : 'M'}${padding + index / Math.max(1, items.length - 1) * (width - padding * 2)},${height - padding - (item.value - min) / spread * (height - padding * 2)}`).join(' ');
}
function lineChart(svg: SVGSVGElement, keys: string[], kind: 'value' | 'dd', lookback = 12, cursor = points.length - 1) {
  const width = 620, height = 180, pad = 24;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const curves = keys.map((key) => ({ key, items: series(key, lookback) }));
  if (kind === 'dd') {
    const all = curves.flatMap((c) => c.items.map((x) => x.dd));
    const min = Math.min(-.01, ...all), max = 0, range = Math.abs(min) || 1;
    const content = curves.map(({ key, items }) => {
      const pts = items.map((item, n) => `${pad + n / Math.max(1, items.length - 1) * (width - pad * 2)},${pad + (0 - item.dd) / range * (height - pad * 2)}`).join(' ');
      return `<polyline fill="none" stroke="${colors[key]}" stroke-width="2" points="${pts}"/>`;
    }).join('');
    svg.innerHTML = `<line x1="${pad}" y1="${pad}" x2="${width-pad}" y2="${pad}" stroke="var(--line)"/><text x="${pad}" y="${height-4}" fill="var(--muted-text)" font-size="11">${(min * 100).toFixed(0)}%</text>${content}<line x1="${pad + (cursor - 12) / Math.max(1, points.length - 14) * (width - pad*2)}" y1="${pad}" x2="${pad + (cursor - 12) / Math.max(1, points.length - 14) * (width - pad*2)}" y2="${height-pad}" stroke="var(--line-strong)" stroke-dasharray="3 4"/>`;
    return;
  }
  const combined = curves.flatMap((c) => c.items.map((x) => x.value));
  const min = Math.min(100, ...combined), max = Math.max(100, ...combined), range = max - min || 1;
  const content = curves.map(({ key, items }) => `<polyline fill="none" stroke="${colors[key]}" stroke-width="2.2" stroke-linejoin="round" points="${items.map((item,n) => `${pad+n/Math.max(1,items.length-1)*(width-pad*2)},${height-pad-(item.value-min)/range*(height-pad*2)}`).join(' ')}"/>`).join('');
  const cursorX = pad + (cursor - 12) / Math.max(1, points.length - 14) * (width - pad * 2);
  svg.innerHTML = `<line x1="${pad}" y1="${height-pad}" x2="${width-pad}" y2="${height-pad}" stroke="var(--line)"/><text x="${pad}" y="${pad+8}" fill="var(--muted-text)" font-size="11">${max.toFixed(0)}</text><text x="${pad}" y="${height-4}" fill="var(--muted-text)" font-size="11">${min.toFixed(0)}</text>${content}<line x1="${cursorX}" y1="${pad}" x2="${cursorX}" y2="${height-pad}" stroke="var(--line-strong)" stroke-dasharray="3 4"/>`;
}
function contextChart(svg: SVGSVGElement, lookback: number, cursor: number) {
  const width=620,height=180,pad=24,from=0,to=points.length-1,slice=points.slice(from,to+1);
  const values=slice.map(p=>p.spy),ma=slice.map((_,j)=>sma(j,'spy',lookback));
  const validMa=ma.filter((x):x is number=>x!==null),lo=Math.min(...values,...validMa),hi=Math.max(...values,...validMa),range=hi-lo||1;
  const y=(v:number)=>height-pad-(v-lo)/range*(height-pad*2),x=(i:number)=>pad+i/Math.max(1,slice.length-1)*(width-pad*2);
  const price=slice.map((v,i)=>`${i?'L':'M'}${x(i)},${y(v.spy)}`).join(' ');
  const avg=ma.flatMap((v,i)=>v===null?[]:[{i,value:v}]).map((v,j)=>`${j?'L':'M'}${x(v.i)},${y(v.value)}`).join(' ');
  const idx=Math.min(cursor,slice.length-1),above=points[cursor].spy>sma(cursor,'spy',lookback)!;
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  svg.innerHTML=`<path fill="none" stroke="var(--bone)" stroke-width="2" d="${price}"/><path fill="none" stroke="var(--chart-warm)" stroke-width="2" stroke-dasharray="5 4" d="${avg}"/><line x1="${x(idx)}" y1="${pad}" x2="${x(idx)}" y2="${height-pad}" stroke="var(--line-strong)" stroke-dasharray="3 4"/><text x="${pad}" y="${height-4}" fill="var(--muted-text)" font-size="11">${points[0].date.slice(0,4)}</text><text x="${width-pad-36}" y="${height-4}" fill="var(--muted-text)" font-size="11">${points[to].date.slice(0,4)}</text><text x="${width-pad-150}" y="${pad+8}" fill="var(--muted-text)" font-size="11">${above?'Above':'Below'} the ${lookback}-month average</text>`;
}
function conditionalRows() {
  const groups: Record<string, number[]> = { upUp: [], upDown: [], downUp: [], downDown: [] };
  for(let i=12;i<points.length-1;i++){
    const row=points[i]; if(!row.r)continue;
    const tm=averageMomentum(i,'tip')!, sm=averageMomentum(i,'spy')!;
    groups[`${sm>0?'up':'down'}${tm>0?'Up':'Down'}`].push(row.r.spy);
  }
  const outcome=(values:number[])=>{const mean=values.reduce((a,b)=>a+b,0)/values.length;return `${pct(mean)} average next SPY return · ${values.length} months`};
  return `<table class="signal-matrix"><thead><tr><th>SPY momentum</th><th>TIP UP</th><th>TIP DOWN</th></tr></thead><tbody><tr><th>SPY UP</th><td>${outcome(groups.upUp)}</td><td>${outcome(groups.upDown)}</td></tr><tr><th>SPY DOWN</th><td>${outcome(groups.downUp)}</td><td>${outcome(groups.downDown)}</td></tr></tbody></table>`;
}

export function init(element: HTMLElement) {
  const root=element.shadowRoot || element.attachShadow({mode:'open'}); root.innerHTML=markup;
  const panel=element.dataset.demo!;
  const selected=root.querySelector<HTMLTemplateElement>(`template[data-panel="${panel}"]`);
  const fragment=selected?.content.cloneNode(true);
  root.innerHTML='';
  if(fragment) root.appendChild(fragment);
  const css=document.createElement('style'); css.textContent=`:host{display:block;color:var(--bone)}.taa{border:1px solid var(--line);border-radius:18px;padding:clamp(1rem,3vw,1.6rem);margin:1rem 0 2rem;background:var(--surface)}.demo-kicker{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--pine-text)}.taa h2{font-size:clamp(1.3rem,3vw,1.8rem);line-height:1.2;margin:.55rem 0}.demo-intro,.small-note,.data-note{color:var(--bone);font-size:.9rem;line-height:1.65}.controls{display:flex;flex-wrap:wrap;gap:.5rem 1rem;margin:1rem 0}.controls label{display:flex;align-items:center;gap:.35rem;font-size:.78rem;cursor:pointer}.controls input{accent-color:var(--chart-rose)}.swatch{display:inline-block;width:.8rem;height:.18rem;background:var(--swatch)}.swatch.above{--swatch:var(--chart-warm)}.swatch.below{--swatch:var(--chart-rose)}.swatch.buy{--swatch:var(--bone)}.swatch.tip{--swatch:var(--chart-blue)}.swatch.haa{--swatch:var(--chart-blue)}.date-control,.lookback-control{display:grid;grid-template-columns:1fr auto;gap:.3rem .8rem;align-items:center;margin:1.1rem 0}.date-control label,.lookback-control label{font-size:.85rem}.date-control output,.lookback-control output{color:var(--bone)}.date-control input,.lookback-control input{grid-column:1/-1;width:100%;accent-color:var(--chart-blue)}.date-control span,.lookback-control span{grid-column:1/-1;color:var(--muted-text);font-size:.73rem}.charts{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.charts figure{margin:0;min-width:0;border-top:1px solid var(--line);padding-top:.6rem}.charts figcaption{font-size:.82rem;margin-bottom:.4rem}.charts figcaption span{display:block;color:var(--muted-text);font-size:.7rem;margin-top:.15rem}.charts svg{width:100%;height:auto;min-height:130px;overflow:visible}.allocations{display:grid;gap:.55rem;padding:.55rem 0}.allocation{display:flex;align-items:center;gap:.55rem;font-size:.78rem}.allocation b{font-weight:500}.dot{width:.6rem;height:.6rem;border-radius:50%}.metrics{overflow:auto;margin-top:.8rem}.metrics table{border-collapse:collapse;width:100%;font-size:.75rem}.metrics th,.metrics td{text-align:right;padding:.45rem;border-bottom:1px solid var(--line);white-space:nowrap}.metrics th:first-child,.metrics td:first-child{text-align:left}.metrics th{color:var(--muted-text);font-weight:500}.metrics i{display:inline-block;width:.55rem;height:.15rem;margin-right:.35rem;vertical-align:middle}.data-note{border-top:1px solid var(--line);padding-top:.6rem;font-size:.72rem}.canary-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.7rem}.canary-grid>div{border:1px solid var(--line);border-radius:10px;padding:.8rem;display:grid;gap:.4rem}.canary-grid small,.canary-grid span{color:var(--muted-text);font-size:.72rem}.canary-grid strong{font-size:1.35rem;font-weight:500}.canary-summary>p{font-size:.7rem;color:var(--muted-text);line-height:1.6}.timing-control{display:flex;gap:.5rem;flex-wrap:wrap}.timing-control button,.pipeline button{border:1px solid var(--line);border-radius:999px;background:transparent;color:var(--bone);padding:.55rem .8rem;font:inherit;font-size:.75rem;cursor:pointer}.timing-control button[aria-pressed=true],.pipeline button[aria-pressed=true]{background:var(--bone);color:var(--carbon-black);border-color:var(--bone)}.timeline{display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem;margin:1rem 0}.timeline div{border-top:2px solid var(--muted-text);padding:.65rem .15rem;color:var(--muted-text);font-size:.7rem;line-height:1.5}.timeline div.active{border-color:var(--chart-warm);color:var(--bright-snow)}.timeline b{display:block;color:inherit;font-size:.76rem}.overfit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.overfit-grid svg{width:100%;height:auto}.overfit-grid .metrics{margin:0}.pipeline{display:flex;gap:.45rem;flex-wrap:wrap}.pipeline button{display:grid;text-align:left;border-radius:10px}.pipeline button span{font-size:.62rem;opacity:.7}.pipeline-copy{min-height:3em;padding:.85rem 1rem;background:var(--surface-raised);border-radius:10px;color:var(--bone);font-size:.82rem;line-height:1.6}.small-note{font-size:.77rem}.focusable:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid var(--pine-text);outline-offset:3px}@media(max-width:620px){.charts,.overfit-grid{grid-template-columns:1fr}.charts svg{min-height:110px}.canary-grid{grid-template-columns:1fr}.timeline{grid-template-columns:repeat(2,1fr)}.controls{display:grid;grid-template-columns:1fr 1fr}}`;
  css.textContent += `.canary-decision{display:flex;flex-wrap:wrap;gap:1.5rem;margin:1rem 0}.canary-decision small,.canary-decision strong{display:block}.canary-decision small{font-size:.75rem;color:var(--bone)}.canary-decision strong{font-size:1.3rem}#canary-equity{width:100%;height:auto}.canary-summary details{margin-top:1rem}summary{cursor:pointer;font-size:.85rem}.taa h3{font-size:1rem;margin:1.2rem 0 .5rem}.taa input,.taa button{font-family:inherit}`;
  css.textContent += `.month-picker{display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin:1.2rem 0}.month-picker label{font-size:.9rem}.month-picker select{font:inherit;color:inherit;background:var(--surface-raised);border:1px solid var(--line-strong);padding:.5rem .7rem;border-radius:.4rem}.decision-summary{font-size:1rem;line-height:1.6;border-left:3px solid var(--chart-warm);padding:.5rem 1rem;margin:1rem 0}.metrics caption{text-align:left;color:var(--bone);font-size:.8rem;padding:.5rem 0}.wide-chart{width:100%;height:auto}.taa details{margin:1rem 0}.timing-comparison table{table-layout:fixed;font-size:.8rem}.timing-comparison th,.timing-comparison td{white-space:normal;text-align:left;vertical-align:top;line-height:1.6;padding:.7rem}.timing-comparison th:first-child{width:22%}.timing-bad{background:color-mix(in srgb, var(--chart-warm) 10%, transparent)}.timing-good{background:color-mix(in srgb, var(--chart-blue) 10%, transparent)}.workflow{display:grid;gap:.9rem;padding-left:1.5rem;font-size:.9rem}.workflow li{padding-left:.3rem}.workflow b,.workflow span{display:block}.workflow span{color:var(--bone);line-height:1.6}.action-button,.example-buttons button{font:inherit;font-size:.8rem;padding:.55rem .8rem;border:1px solid var(--line-strong);border-radius:.4rem;background:var(--surface-raised);color:inherit;cursor:pointer}.example-buttons{display:flex;gap:.5rem;flex-wrap:wrap}.action-button:hover,.example-buttons button:hover{background:var(--surface-raised)}@media(max-width:480px){.timing-comparison th,.timing-comparison td{padding:.45rem;font-size:.72rem}.timing-comparison th:first-child{width:24%}}`;
  css.textContent += `.outcome-cards{display:flex;flex-wrap:wrap;gap:.7rem}.outcome-card{flex:1 1 150px;border:1px solid var(--line);border-top:3px solid;padding:.8rem;border-radius:.4rem;display:grid;gap:.6rem;font-size:.85rem}.outcome-card b{font-weight:500}.outcome-card span{display:flex;justify-content:space-between;gap:.6rem;color:var(--bone)}.outcome-card strong{color:var(--bone)}.time-axis,.time-events,.trade-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem}.time-axis{font-size:.7rem;color:var(--muted-text);border-bottom:1px solid var(--line-strong);padding-bottom:.5rem}.time-events{margin-top:.8rem}.time-events b,.time-events span{display:block;font-size:.8rem;line-height:1.5}.time-events span{color:var(--bone);font-size:.75rem;margin-top:.4rem}.trade-lane{margin-top:1rem;padding-top:.5rem;border-top:1px solid var(--line)}.trade-lane h3{margin:.2rem 0 .6rem}.trade-steps{align-items:center;font-size:.75rem;line-height:1.5}.trade-event{padding:.6rem;border:1px solid currentColor;border-radius:.4rem}.invalid .trade-event,.backward-fill{color:var(--chart-warm)}.valid .trade-event{color:var(--chart-green)}.backward-fill{grid-column:2/4}.search-head,.search-row{display:grid;grid-template-columns:55px minmax(0,1fr) minmax(0,1fr);gap:.6rem;padding:.35rem .5rem;font-size:.75rem;align-items:center}.search-head{margin-bottom:.5rem}.search-head small{color:var(--bone);font-size:.65rem}.search-row.chosen{outline:1px solid var(--bone);border-radius:.3rem;background:var(--surface-raised)}.search-bar{height:23px;position:relative;display:flex;align-items:center}.search-bar i{height:100%;display:block;opacity:.4;border-radius:.15rem}.search-bar em{position:absolute;left:.4rem;font-style:normal;font-size:.7rem}.search-bar .hidden-result{opacity:.5}@media(max-width:480px){.time-axis,.time-events,.trade-steps{gap:.4rem}.time-events b{font-size:.73rem}.time-events span,.trade-steps{font-size:.68rem}.trade-event{padding:.35rem}.search-head,.search-row{grid-template-columns:42px minmax(0,1fr) minmax(0,1fr);gap:.35rem}}`;
  root.prepend(css);
  css.textContent += `.example-buttons button[aria-pressed=true]{background:var(--bone);color:var(--carbon-black);border-color:var(--bone)}`;
  css.textContent += `.taa{font-size:1rem;line-height:1.6}.demo-kicker{font-size:.8rem}.demo-intro,.small-note,.data-note{font-size:.95rem}.controls label,.date-control label,.lookback-control label,.outcome-card,.workflow{font-size:1rem}.date-control span,.lookback-control span,.canary-decision small,.time-axis,.time-events span,.trade-steps,.search-head,.search-row,.search-bar em,.search-head small{font-size:.9rem}.time-events b,.charts figcaption,.charts figcaption span,.metrics table,.timing-impact table,.timing-impact th,.timing-impact td{font-size:.95rem}.taa svg text{font-size:18px}.search-bar{height:30px}.outcome-card{min-width:0}@media(max-width:480px){.time-events b,.time-events span,.trade-steps,.timing-impact th,.timing-impact td{font-size:.85rem}.search-head,.search-row{font-size:.85rem}.search-bar em{font-size:.8rem}}`;
  css.textContent += `.signal-matrix{width:100%;border-collapse:collapse;margin:.7rem 0 1rem;font-size:.78rem}.signal-matrix th,.signal-matrix td{border:1px solid var(--line);padding:.55rem;text-align:left;vertical-align:top;line-height:1.5}.signal-matrix thead th{background:var(--surface-raised);color:var(--bone)}.signal-matrix td small{display:block;margin-top:.35rem;color:var(--bone);font-size:.68rem}.timing-impact{overflow:auto}.timing-impact table{width:100%;border-collapse:collapse;font-size:.78rem}.timing-impact th,.timing-impact td{text-align:left;padding:.6rem;border-bottom:1px solid var(--line)}.timing-impact td:not(:first-child),.timing-impact th:not(:first-child){text-align:right}.timing-impact .timing-bad td{color:var(--chart-warm)}.timing-impact .timing-good td{color:var(--chart-green)}@media(max-width:480px){.signal-matrix{font-size:.67rem}.signal-matrix th,.signal-matrix td{padding:.35rem}.timing-impact th,.timing-impact td{font-size:.68rem;padding:.4rem}}`;
  css.textContent += `.timing-impact table,.timing-impact th,.timing-impact td{font-size:.95rem}@media(max-width:480px){.timing-impact th,.timing-impact td{font-size:.85rem}}`;
  css.textContent += `.search-metric{display:grid;gap:.2rem;min-width:0}.search-metric small{color:var(--bone);font-size:.8rem;line-height:1.4}`;
  if (panel === 'demo-taa-main') {
    const date=byId<HTMLInputElement>(root,'taa-date');
    const dateLabel=byId<HTMLOutputElement>(root,'taa-date-label');
    date.max=String(points.length-2);
    date.value=String(points.findIndex(p=>p.date==='2008-09-30'));
    const refresh=()=>{
      const keys=['above','buy'],i=Number(date.value),row=points[i];
      dateLabel.textContent=row.date;
      byId(root,'taa-alloc').innerHTML=`<p class="small-note">What followed: ${row.entry} → ${row.exit}</p><div class="outcome-cards">${keys.map(key=>{
        const item=series(key).find(x=>x.i===i)!;
        return `<div class="outcome-card" style="border-top-color:${colors[key]}"><b>${labels[key]}</b><span>Position <strong>${item.asset.toUpperCase()}</strong></span><span>Return after costs <strong>${pct(item.ret)}</strong></span></div>`;
      }).join('')}</div>${keys.length?'':'<p>Select at least one rule to compare its decision.</p>'}`;
      lineChart(byId(root,'taa-equity'),keys,'value',12,i);lineChart(byId(root,'taa-dd'),keys,'dd',12,i);
      byId(root,'taa-metrics').innerHTML=`<table><thead><tr><th>Rule</th><th>Annualized return</th><th>Monthly max drawdown</th><th>Final value</th></tr></thead><tbody>${keys.map(key=>{const m=metrics(series(key));return `<tr><td><i style="background:${colors[key]}"></i>${labels[key]}</td><td>${pct(m.cagr)}</td><td>${pct(m.drawdown)}</td><td>${(100*(1+m.total)).toFixed(0)}</td></tr>`}).join('')}</tbody></table>`;
    };
    date.addEventListener('input',refresh);
    refresh();
  }
  if (panel === 'demo-taa-timing') {
    const bad=metrics(sameCloseSeries()),good=metrics(series('above'));
    byId(root,'timing-impact').innerHTML=`<table><thead><tr><th>Execution assumption</th><th>Annualized return</th><th>Monthly max drawdown</th><th>Final value from 100</th></tr></thead><tbody><tr class="timing-bad"><td>Same-close (lookahead)</td><td>${pct(bad.cagr)}</td><td>${pct(bad.drawdown)}</td><td>${(100*(1+bad.total)).toFixed(0)}</td></tr><tr class="timing-good"><td>Next-session close</td><td>${pct(good.cagr)}</td><td>${pct(good.drawdown)}</td><td>${(100*(1+good.total)).toFixed(0)}</td></tr></tbody></table><p class="small-note">The difference is caused by assumed prices, not a change in the signal. Same-close figures are deliberately invalid because the signal uses that close.</p>`;
  }
  if (panel === 'demo-taa-crossasset') {
    const date=byId<HTMLInputElement>(root,'canary-date'),dateLabel=byId<HTMLOutputElement>(root,'canary-date-label');
    date.max=String(points.length-2);
    date.value=String(points.findIndex((p,i)=>i>=12&&p.r&&averageMomentum(i,'spy')!>0&&averageMomentum(i,'tip')!<=0));
    const refresh=()=>{
      const i=Number(date.value);
      dateLabel.textContent=points[i].date;
      const keys=['momentum','tipOnly','haa','buy'];
      byId(root,'canary-outcome').innerHTML=`<p class="small-note">${points[i].date} · next period ${points[i].entry} → ${points[i].exit}</p><div class="outcome-cards">${keys.map(k=>{const item=series(k).find(x=>x.i===i)!;return `<div class="outcome-card" style="border-top-color:${colors[k]}"><b>${labels[k]}</b><span>Hold <strong>${item.asset.toUpperCase()}</strong></span><span>Return after costs <strong>${pct(item.ret)}</strong></span></div>`}).join('')}</div>`;
      lineChart(byId(root,'canary-equity'),keys,'value',10,i);
      byId(root,'canary-metrics').innerHTML=`<table><thead><tr><th>Rule</th><th>Annualized return</th><th>Monthly max drawdown</th></tr></thead><tbody>${keys.map(k=>{const m=metrics(series(k));return `<tr><td><i style="background:${colors[k]}"></i>${labels[k]}</td><td>${pct(m.cagr)}</td><td>${pct(m.drawdown)}</td></tr>`}).join('')}</tbody></table>`;
    };
    date.addEventListener('input',refresh);
    refresh();
  }
  if (panel === 'demo-taa-overfit') {
    const early=byId<HTMLButtonElement>(root,'gem-early'),later=byId<HTMLButtonElement>(root,'gem-later');
    const render=(key:'early'|'later')=>{
      const data=gemData[key], chart=byId<SVGSVGElement>(root,'gem-chart');
      early.setAttribute('aria-pressed',String(key==='early'));later.setAttribute('aria-pressed',String(key==='later'));
      byId(root,'gem-period').textContent=key==='early'?'Original backtest period · 1974–2013':'After publication · 2015–July 2026';
      const w=620,h=230,pad=34,all=data.chart.flatMap(x=>[x.gem,x.buy]),min=Math.log(Math.min(...all,100)),max=Math.log(Math.max(...all,100)),range=max-min||1;
      const lines=(['gem','buy'] as const).map(name=>`<polyline fill="none" stroke="${name==='gem'?'var(--chart-warm)':'var(--bone)'}" stroke-width="3" stroke-linejoin="round" points="${data.chart.map((p,i)=>`${pad+i/(data.chart.length-1)*(w-2*pad)},${h-pad-(Math.log(p[name])-min)/range*(h-2*pad)}`).join(' ')}"/>`).join('');
      chart.setAttribute('viewBox',`0 0 ${w} ${h}`);chart.innerHTML=`<line x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}" stroke="var(--line)"/>${lines}<text x="${pad}" y="${h-5}" fill="var(--muted-text)">${key==='early'?'1974':'2015'}</text><text x="${w-pad-55}" y="${h-5}" fill="var(--muted-text)">${key==='early'?'2013':'2026'}</text>`;
      byId(root,'gem-metrics').innerHTML=`<table><thead><tr><th>Rule</th><th>Annualized return</th><th>Monthly max drawdown</th><th>Value from 100</th></tr></thead><tbody>${(['gem','buy'] as const).map(name=>`<tr><td><i style="background:${name==='gem'?'var(--chart-warm)':'var(--bone)'}"></i>${name==='gem'?'GEM':'US stocks buy-and-hold'}</td><td>${pct(data.metrics[name].cagr)}</td><td>${pct(data.metrics[name].drawdown)}</td><td>${data.chart[data.chart.length-1][name].toFixed(0)}</td></tr>`).join('')}</tbody></table>`;
    };
    early.addEventListener('click',()=>render('early'));later.addEventListener('click',()=>render('later'));render('early');
  }
}
