import {
  state,
  level,
  levelTotal,
  useHint,
  fmt,
  totalMs,
  clueIdFor,
  clueLabel,
  clueShortLabel,
} from './engine.js'
import { showCodex } from './ui.js'
import { refreshInvestigation } from './investigation.js'
import { LEVELS } from './data/levels.js'

const el = () => document.getElementById('hud')

export function renderHud() {
  const h = el()
  h.hidden = false
  const lv = level()
  h.innerHTML = `
    <div class="hud-case">
      <div class="hud-brand"><svg><use href="#i-logo"/></svg>证据检查 <b>${lv.n}/${LEVELS.length}</b></div>
      <div class="hud-progress"><span>已找到</span><b data-hud-progress>${state.found.length}/${levelTotal()}</b></div>
    </div>
    <div class="evidence-tray">
      <span class="tray-label">证据袋</span>
      <div class="evidence-slots" aria-live="polite"></div>
    </div>
    <div class="hud-streak" data-hud-streak><span>连击</span><b>—</b></div>
    <div class="hud-time">
      <div class="clock">${fmt(totalMs())}<span class="pen">${state.penaltyMs ? '+' + (state.penaltyMs / 1000) + 's' : ''}</span></div>
    </div>
    <div class="tools">
      <button class="tool" id="tool-hint" title="连续使用会从区域提示推进到准确位置和直接揭晓"><svg class="ic"><use href="#i-bulb"/></svg><span>提示</span><small>+15s</small></button>
      <button class="tool" id="tool-codex" title="打开证据图鉴"><svg class="ic"><use href="#i-book"/></svg><span>图鉴</span><small>${state.unlocked.length}</small></button>
    </div>`
  document.getElementById('tool-hint').onclick = () => { useHint(); refreshHud(); refreshClock() }
  document.getElementById('tool-codex').onclick = showCodex
  refreshHud()
}

export function hideHud() { el().hidden = true }

export function refreshClock() {
  const c = el().querySelector('.clock')
  if (!c) return
  c.childNodes[0].nodeValue = fmt(totalMs())
  const pen = c.querySelector('.pen')
  if (pen) pen.textContent = state.penaltyMs ? `+${state.penaltyMs / 1000}s 罚时` : ''
}

export function refreshHud() {
  const streak = el().querySelector('[data-hud-streak]')
  if (streak) {
    streak.querySelector('b').textContent = state.levelStreak > 1 ? `x${state.levelStreak}` : '—'
    streak.classList.toggle('hot', state.levelStreak > 1)
  }
  refreshEvidenceTray()
  refreshInvestigation()
}

function refreshEvidenceTray() {
  const tray = el().querySelector('.evidence-slots')
  const progress = el().querySelector('[data-hud-progress]')
  if (!tray || !progress) return

  progress.textContent = `${state.found.length}/${levelTotal()}`
  const seen = new Set()
  const items = [
    ...state.found.map(k => ({ k, tone: 'confirmed', label: '已找到' })),
    ...[...state.pending].map(k => ({ k, tone: 'pending', label: '待组合' })),
  ].map(item => ({ ...item, clueId: clueIdFor(item.k) })).filter(item => {
    if (seen.has(item.clueId)) return false
    seen.add(item.clueId)
    return true
  })
  const size = Math.max(levelTotal(), items.length)
  tray.innerHTML = Array.from({ length: size }, (_, index) => {
    const item = items[index]
    if (!item) return '<span class="evidence-slot empty" aria-hidden="true">---</span>'
    const fullLabel = clueLabel(item.clueId)
    const shortLabel = clueShortLabel(item.clueId)
    return `<span class="evidence-slot ${item.tone}" title="${fullLabel} · ${item.label}" aria-label="${fullLabel}，${item.label}">${shortLabel}</span>`
  }).join('')
}

export function initHudTick() {
  document.addEventListener('achu:tick', refreshClock)
}
