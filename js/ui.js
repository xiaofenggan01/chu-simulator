import { SIGNALS } from './data/signals.js'
import { LEVELS } from './data/levels.js'
import { state } from './engine.js'

const CONF_CN = { confirmed: '已确认', reported: '社区反馈', speculated: '未经证实' }
const overlayFocus = new Map()

function setBackgroundInert(value) {
  for (const id of ['app', 'hud']) {
    const el = document.getElementById(id)
    if (!el) continue
    el.inert = value
    if (value) el.setAttribute('aria-hidden', 'true')
    else el.removeAttribute('aria-hidden')
  }
}

export function closeOverlay(id, { restoreFocus = true, clear = false } = {}) {
  const overlay = document.getElementById(id)
  if (!overlay) return
  overlay.classList.remove('on')
  overlay.setAttribute('aria-hidden', 'true')
  if (clear) overlay.querySelector('.modal')?.replaceChildren()
  const previousFocus = overlayFocus.get(id)
  overlayFocus.delete(id)
  if (!document.querySelector('.overlay.on')) {
    document.body.style.overflow = ''
    setBackgroundInert(false)
  }
  if (restoreFocus && previousFocus?.isConnected) previousFocus.focus()
}

export function closeAllOverlays({ clear = false, restoreFocus = false } = {}) {
  document.querySelectorAll('.overlay').forEach(overlay => {
    closeOverlay(overlay.id, { clear, restoreFocus: restoreFocus && overlay.classList.contains('on') })
  })
}

export function openOverlay(id, { initialFocus, closable = true } = {}) {
  closeAllOverlays({ restoreFocus: false })
  const overlay = document.getElementById(id)
  if (!overlay) return
  overlayFocus.set(id, document.activeElement)
  overlay.dataset.closable = String(closable)
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-hidden', 'false')
  overlay.classList.add('on')
  document.body.style.overflow = 'hidden'
  setBackgroundInert(true)
  const target = typeof initialFocus === 'string'
    ? overlay.querySelector(initialFocus)
    : initialFocus
  const fallback = overlay.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])')
  ;(target || fallback || overlay).focus()
}

document.addEventListener('keydown', event => {
  const overlays = [...document.querySelectorAll('.overlay.on')]
  const active = overlays.at(-1)
  if (!active) return
  if (event.key === 'Escape') {
    if (active.dataset.closable === 'false') return
    event.preventDefault()
    closeOverlay(active.id)
    return
  }
  if (event.key !== 'Tab') return
  const focusable = [...active.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])')]
    .filter(el => !el.hidden && el.getClientRects().length)
  if (!focusable.length) {
    event.preventDefault()
    active.focus()
    return
  }
  const first = focusable[0]
  const last = focusable.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
})

export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function launchConfetti(origin) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  document.querySelectorAll('.confetti-layer').forEach(layer => layer.remove())
  const rect = origin.getBoundingClientRect()
  const layer = document.createElement('div')
  const colors = ['#D97757', '#E5484D', '#E7B95E', '#4A7040', '#F5F4EF']
  layer.className = 'confetti-layer'
  layer.setAttribute('aria-hidden', 'true')
  layer.style.setProperty('--origin-x', `${rect.left + rect.width / 2}px`)
  layer.style.setProperty('--origin-y', `${rect.top + rect.height / 2}px`)
  const fragment = document.createDocumentFragment()

  for (let index = 0; index < 64; index++) {
    const particle = document.createElement('i')
    const angle = (Math.PI * 2 * index) / 64 + (Math.random() - 0.5) * 0.35
    const distance = 130 + Math.random() * 260
    const rise = 80 + Math.random() * 150
    const spreadX = Math.cos(angle) * distance
    const driftX = spreadX * (1.05 + Math.random() * 0.4)
    const fallY = 180 + Math.random() * 360
    particle.className = `confetti-piece shape-${index % 3}`
    particle.style.setProperty('--burst-x', `${spreadX.toFixed(1)}px`)
    particle.style.setProperty('--burst-y', `${(-rise - Math.abs(Math.sin(angle)) * 80).toFixed(1)}px`)
    particle.style.setProperty('--fall-x', `${driftX.toFixed(1)}px`)
    particle.style.setProperty('--fall-y', `${fallY.toFixed(1)}px`)
    const spin = Math.round((Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720))
    particle.style.setProperty('--mid-spin', `${Math.round(spin * 0.55)}deg`)
    particle.style.setProperty('--spin', `${spin}deg`)
    particle.style.setProperty('--delay', `${Math.round(Math.random() * 90)}ms`)
    particle.style.setProperty('--duration', `${Math.round(850 + Math.random() * 420)}ms`)
    particle.style.setProperty('--confetti-color', colors[index % colors.length])
    fragment.appendChild(particle)
  }

  layer.appendChild(fragment)
  document.body.appendChild(layer)
  window.setTimeout(() => layer.remove(), 1500)
}

const APPLAUSE_FACES = {
  1: { img: 'assets/dario-thumbsup.webp', rings: 1 },
  2: { img: 'assets/dario-eyebrow.webp', rings: 2 },
  3: { img: 'assets/dario-clap.webp', rings: 3 },
  4: { img: 'assets/dario-ovation.webp', rings: 4 },
  5: { img: 'assets/dario-salute.webp', rings: 5 },
}

export function showLevelComplete({ level, nextLevel, isFinal, onContinue }) {
  const overlay = document.getElementById('ov-level-complete')
  const modal = document.getElementById('level-complete-modal')
  const buttonLabel = isFinal ? '查看最终结果' : `进入第 ${nextLevel.n} 关 · ${nextLevel.name}`
  const punchline = level.praise || level.punchline || ''
  const ap = APPLAUSE_FACES[level.n] || APPLAUSE_FACES[1]
  overlay.setAttribute('aria-labelledby', 'level-complete-title')
  overlay.removeAttribute('aria-describedby')
  modal.className = 'modal level-complete-modal'
  modal.innerHTML = `
    <div class="lc-minimal">
      <div class="lc-applaud" data-level="${level.n}">
        <img src="${ap.img}" alt="Dario ${['点头','挑眉','鼓掌','起立鼓掌','致敬'][level.n - 1] || ''}" />
        <span class="applause-rings" aria-hidden="true">${Array.from({ length: ap.rings }, () => '<i></i>').join('')}</span>
      </div>
      <span class="lc-minimal-index">第 ${String(level.n).padStart(2, '0')} 关</span>
      <h2 id="level-complete-title">${esc(level.name)}</h2>
      ${punchline ? `<p class="lc-punchline">「${esc(punchline)}」</p>` : ''}
      <button class="btn lc-continue" id="level-complete-go">
        <span>${buttonLabel}</span><svg class="ic"><use href="#i-arrow-r"/></svg>
      </button>
    </div>`

  openOverlay('ov-level-complete', { initialFocus: '#level-complete-go', closable: false })
  const button = modal.querySelector('#level-complete-go')
  let transitioning = false
  button.onclick = () => {
    if (transitioning) return
    transitioning = true
    button.disabled = true
    button.setAttribute('aria-busy', 'true')
    button.querySelector('span').textContent = isFinal ? '正在生成成绩单…' : '正在进入下一关…'
    launchConfetti(button)
    window.setTimeout(() => {
      closeOverlay('ov-level-complete', { clear: true, restoreFocus: false })
      onContinue()
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 620)
  }
}

export function toast(html) {
  const t = document.getElementById('toast')
  t.innerHTML = html
  t.classList.add('on')
  clearTimeout(toast._tm)
  toast._tm = setTimeout(() => t.classList.remove('on'), 2400)
}

export function clearToast() {
  clearTimeout(toast._tm)
  const t = document.getElementById('toast')
  t.classList.remove('on')
  t.replaceChildren()
}

export function showCodex() {
  const m = document.getElementById('codex-modal')
  const items = state.unlocked
    .slice()
    .sort((a, b) => a - b)
    .map(k => {
      const s = SIGNALS[k]
      if (!s) return ''
      return `<div class="codex-item">
        <div class="tt"><span class="no">#${String(k).padStart(3, '0')}</span>${esc(s.title)}<span class="no" style="margin-left:auto">${CONF_CN[s.conf]}</span></div>
        <div class="vd">${esc(s.verdict)}</div>
      </div>`
    })
    .join('')
  m.innerHTML = `
    <h3>证据记录 · 已找到 ${state.unlocked.length} 条</h3>
    <div class="codex-grid">${items || '<div class="codex-empty">还没有任何证据记录。点击并确认证据后即可解锁。</div>'}</div>
    <button class="btn ghost" id="cx-ok" style="margin-top:18px;width:100%;justify-content:center">合上手册</button>`
  openOverlay('ov-codex', { initialFocus: '#cx-ok' })
  m.querySelector('#cx-ok').onclick = () => closeOverlay('ov-codex', { clear: true })
}

export function banLetterHtml(letter, caseNo) {
  const ref = 'REF-' + Math.random().toString(36).slice(2, 8).toUpperCase()
  return `
    <div class="banmail">
      <div class="stamp">已停用</div>
      <div class="from">发件人：${letter.from}<br>收件人：${esc(recipient())}<br>主题：${letter.subject}</div>
      <h3>来自账号安全团队（Safeguards Team）的通知</h3>
      <div class="en">"An internal investigation of suspicious signals associated with your account indicates a violation of our Usage Policy."</div>
      <div class="zh">${letter.zh}</div>
      <div class="ref">参考编号（Reference ID）：${ref} · 关卡 ${esc(caseNo)} · 本邮件由系统自动发送，不设人工回复</div>
    </div>`
}

function recipient() {
  const map = { register: 'zhangwei2008@qq.com', chat: 'liming_dev@163.com', device: 'workspace@outlook.com', payment: 'max_upgrader@depay.io', network: 'sg_gateway@proton.me', behavior: 'pinche09@qq.com', terminal: 'cli_user@8812.dev', org: 'admin@yuniverse-sg.com', casefile: 'reader@anthropic.team', finale: 'all-users@everywhere.net' }
  return map[LEVELS[state.levelIdx]?.key] || 'user@example.com'
}
