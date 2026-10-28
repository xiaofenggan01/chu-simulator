import { state, levelTotal, useHint, fmt, totalMs, clueIdFor, clueShortLabel } from './engine.js'

const FACES = {
  idle: 'assets/dario-idle.webp',
  praise: 'assets/dario-thumbsup.webp',
  sad: 'assets/dario-sad.webp',
  dead: 'assets/dario-ko.webp',
}

const PRAISE_WORDS = ['漂亮，这条站得住。', '就是这个，记下来。', '判断准确，继续。', '嗯，这条能当证据。', '稳。下一条。']
const HURT_WORDS = ['这条无罪，你误伤了。', '冷静，看清楚再点。', '它不构成证据。', '这一笔记你档案里了。', '手滑也是要扣血的。']

let faceTimer = null

function ensureBar() {
  let bar = document.getElementById('dario-bar')
  if (bar) return bar
  bar = document.createElement('div')
  bar.id = 'dario-bar'
  bar.innerHTML = `
    <div class="dario-face" data-face="idle">
      <img src="${FACES.idle}" alt="Dario Amodei" />
      <span class="dario-face-ring"></span>
    </div>
    <div class="dario-hp-cells" data-hp-cells aria-label="剩余血量">
      ${Array.from({ length: 10 }, () => '<i></i>').join('')}
    </div>
    <div class="dario-meta">
      <div class="dario-top"><b>D. Amodei</b><span class="dario-say" data-dario-say>&nbsp;</span><span class="dario-ev-count" data-dario-ev>0/${levelTotal()}</span></div>
      <div class="dario-ev-slots" data-dario-slots></div>
    </div>
    <button class="dario-hint" id="tool-hint" title="连续使用会从区域提示推进到准确位置和直接揭晓，每次达里奥 -1 滴血">
      <svg class="ic"><use href="#i-bulb"/></svg><span>提示</span><small>-1 血</small>
    </button>`
  document.body.appendChild(bar)
  // 预载全部表情，保证点击瞬间切换（否则抖动动画会先于网络图片跑完）
  Object.values(FACES).forEach(src => { const i = new Image(); i.src = src })
  document.getElementById('tool-hint').onclick = () => {
    // 推理模式通过 achu:hint-request 接管；无人接管时走旧找茬提示
    if (document.dispatchEvent(new CustomEvent('achu:hint-request', { cancelable: true }))) useHint()
  }
  return bar
}

function setFace(kind, say) {
  const bar = ensureBar()
  const face = bar.querySelector('.dario-face')
  face.querySelector('img').src = FACES[kind] || FACES.idle
  face.dataset.face = kind
  face.classList.remove('pop')
  void face.offsetWidth
  face.classList.add('pop')
  const sayEl = bar.querySelector('[data-dario-say]')
  if (say != null) {
    sayEl.textContent = say
    sayEl.classList.remove('flash')
    void sayEl.offsetWidth
    sayEl.classList.add('flash')
  }
  clearTimeout(faceTimer)
  if (kind !== 'idle') faceTimer = setTimeout(() => { setFace('idle', '') }, 700)
}

function setHp(hp) {
  const bar = ensureBar()
  const cells = [...bar.querySelectorAll('[data-hp-cells] i')]
  const lit = Math.round(hp / 10)
  cells.forEach((c, i) => {
    c.classList.toggle('on', i < lit)
    c.classList.toggle('low', hp <= 30)
  })
}

function faceShake() {
  const face = ensureBar().querySelector('.dario-face')
  face.classList.remove('shake')
  void face.offsetWidth
  face.classList.add('shake')
  setTimeout(() => face.classList.remove('shake'), 520)
}

export function refreshEvidence() {
  const bar = ensureBar()
  const count = bar.querySelector('[data-dario-ev]')
  const slots = bar.querySelector('[data-dario-slots]')
  if (!count || !slots) return
  const seen = new Set()
  const items = [
    ...state.found.map(k => ({ k, tone: 'confirmed' })),
    ...[...state.pending].map(k => ({ k, tone: 'pending' })),
  ].map(item => ({ ...item, id: clueIdFor(item.k) })).filter(i => (seen.has(i.id) ? false : seen.add(i.id)))
  const total = Math.max(1, Math.max(levelTotal(), items.length))
  count.textContent = `${items.length}/${levelTotal()}`
  slots.style.gridTemplateColumns = `repeat(${total},minmax(0,1fr))`
  slots.innerHTML = Array.from({ length: total }, (_, idx) => {
    const it = items[idx]
    if (!it) return `<span class="ev-slot empty"><i>${idx + 1}</i></span>`
    return `<span class="ev-slot ${it.tone}">${clueShortLabel(it.id, 5)}</span>`
  }).join('')
}

export function renderDarioBar() { ensureBar() }
export function hideDarioBar() { document.getElementById('dario-bar')?.classList.remove('on') }
export function showDarioBar() { ensureBar().classList.add('on') }
export function darioPraise(text) { setFace('praise', text || PRAISE_WORDS[Math.floor(Math.random() * PRAISE_WORDS.length)]) }
export function darioHurt(text) {
  setFace('sad', text || HURT_WORDS[Math.floor(Math.random() * HURT_WORDS.length)])
  const img = ensureBar().querySelector('.dario-face img')
  const shake = () => requestAnimationFrame(faceShake)
  if (img.complete && img.naturalWidth > 0) shake()
  else img.addEventListener('load', shake, { once: true })
}
export function darioDeath() { setFace('dead', '我倒下了。这一局，作废。'); clearTimeout(faceTimer) }
export function darioTick() {
  const el = ensureBar().querySelector('[data-dario-clock]')
  if (el) el.textContent = fmt(totalMs())
}
export function darioSetHp(hp) { setHp(hp) }
