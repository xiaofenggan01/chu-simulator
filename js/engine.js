import { LEVELS } from './data/levels.js'
import { SIGNALS } from './data/signals.js'

const PENALTY_DECOY = 10000
const PENALTY_HINT = 15000

export function safeParse(key, fb) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fb } catch { return fb }
}

export const MAX_HP = 100
export const HP_PER_MISS = 10

export const state = {
  screen: 'title',
  levelIdx: 0,
  running: false,
  runStart: 0,
  elapsedMs: 0,
  levelStartMs: 0,
  penaltyMs: 0,
  penaltyLog: [],
  found: [],
  pending: new Set(),
  hurtKs: new Set(),
  clueList: [],
  comboMap: new Map(),
  levelStreak: 0,
  bestStreak: 0,
  lastFoundAt: 0,
  decoyHits: 0,
  hintHits: 0,
  levelDecoyHits: 0,
  levelHintHits: 0,
  hp: MAX_HP,
  dead: false,
  unlocked: Array.isArray(safeParse('achu_unlocked', [])) ? safeParse('achu_unlocked', []) : [],
}

export const hooks = { onInspect: null, onHpChange: null, onDeath: null }

export function level() { return LEVELS[state.levelIdx] }
export function clueIds() { return state.clueList.map(c => typeof c === 'number' ? c : c.id) }
export function clueIdFor(k) {
  const key = Number(k)
  return state.comboMap.get(key)?.id ?? key
}
export function clueLabel(k) {
  const id = clueIdFor(k)
  return SIGNALS[id]?.title || `线索 ${id}`
}
export function clueShortLabel(k, maxLength = 6) {
  const label = clueLabel(k).replace(/\s+/g, '')
  const chars = Array.from(label)
  return chars.length <= maxLength ? label : `${chars.slice(0, maxLength).join('')}…`
}
export function levelTotal() { return state.clueList.length }
export function levelPoints() {
  return clueIds().reduce((s, k) => s + (SIGNALS[k]?.points || 0), 0)
}
export function gainedPoints() {
  return state.found.reduce((s, k) => s + (SIGNALS[k]?.points || 0), 0)
}
export function totalMs() {
  const activeMs = state.running ? performance.now() - state.runStart : 0
  return state.elapsedMs + activeMs + state.penaltyMs
}

function activeScopes() {
  const scopes = []
  const root = document.getElementById('play-root')
  if (root) scopes.push(root)
  document.querySelectorAll('.overlay').forEach(overlay => {
    if (overlay.classList.contains('on') || overlay.querySelector('.hit[data-k]')) scopes.push(overlay)
  })
  return scopes
}

function visibleScopes() {
  const scopes = []
  const root = document.getElementById('play-root')
  if (root) scopes.push(root)
  document.querySelectorAll('.overlay.on').forEach(overlay => scopes.push(overlay))
  return scopes
}

function hitsIn(scopes, selector) {
  return [...new Set(scopes.flatMap(scope => [...scope.querySelectorAll(selector)]))]
}

function activeHits(selector) {
  return hitsIn(activeScopes(), selector)
}

function visibleHits(selector) {
  return hitsIn(visibleScopes(), selector)
}

export function isActiveHit(el) {
  return el?.matches?.('.hit[data-k]') && activeScopes().some(scope => scope.contains(el))
}

export function resumeTimer() {
  if (state.running) return
  state.running = true
  state.runStart = performance.now()
}

export function pauseTimer() {
  if (!state.running) return
  state.elapsedMs += performance.now() - state.runStart
  state.runStart = 0
  state.running = false
}

let visibilityPaused = false
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    visibilityPaused = state.running
    pauseTimer()
  } else if (visibilityPaused && state.screen === 'play') {
    visibilityPaused = false
    resumeTimer()
  }
})

export function startRun() {
  Object.assign(state, {
    screen: 'title', levelIdx: 0, running: false, runStart: 0,
    elapsedMs: 0, levelStartMs: 0, penaltyMs: 0, penaltyLog: [],
    found: [], pending: new Set(), hurtKs: new Set(), clueList: [], comboMap: new Map(),
    levelStreak: 0, bestStreak: 0, lastFoundAt: 0,
    decoyHits: 0, hintHits: 0, levelDecoyHits: 0, levelHintHits: 0,
    hp: MAX_HP, dead: false,
  })
  hooks.onHpChange?.(state.hp, 0)
  visibilityPaused = false
  clearHint()
  resetHintProgress()
}

export function enterLevel(i) {
  state.levelIdx = i
  state.found = []
  state.pending = new Set()
  state.hurtKs = new Set()
  state.levelStreak = 0
  state.lastFoundAt = 0
  state.levelDecoyHits = 0
  state.levelHintHits = 0
  state.clueList = LEVELS[i].clues
  state.comboMap = new Map()
  for (const c of state.clueList) {
    if (typeof c !== 'number') for (const m of c.combo) state.comboMap.set(m, c)
  }
  clearHint()
  resetHintProgress()
  state.levelStartMs = totalMs()
  state.screen = 'play'
  resumeTimer()
}

export function finishLevel() {
  pauseTimer()
  visibilityPaused = false
  state.screen = 'result'
}

export function addPenalty(ms, label) {
  state.penaltyMs += ms
  state.penaltyLog.push({ ms, label, at: fmt(totalMs()) })
}

function updateStreak(fromHint) {
  if (fromHint) {
    state.levelStreak = 0
    state.lastFoundAt = 0
    return 0
  }
  const now = performance.now()
  state.levelStreak = state.lastFoundAt && now - state.lastFoundAt <= 8000
    ? state.levelStreak + 1
    : 1
  state.lastFoundAt = now
  state.bestStreak = Math.max(state.bestStreak, state.levelStreak)
  return state.levelStreak
}

function finishInspection(result, el) {
  result.complete = state.found.length >= levelTotal()
  result.remaining = Math.max(0, levelTotal() - state.found.length)
  if (result.complete) finishLevel()
  hooks.onInspect?.(result, el)
  return result
}

export function inspectHit(el, { fromHint = false } = {}) {
  if (!isActiveHit(el) || el.classList.contains('found') || el.classList.contains('decoyed')) return { changed: false }
  if (currentHint?.el === el || currentHint?.el?.contains(el) || el.contains(currentHint?.el)) clearHint()

  const k = +el.dataset.k
  const clueId = clueIdFor(k)
  const label = clueLabel(clueId)
  if (isDecoy(el)) {
    if (state.hurtKs.has(k)) return { changed: false }
    el.classList.add('decoyed')
    state.hurtKs.add(k)
    state.decoyHits++
    state.levelDecoyHits++
    state.levelStreak = 0
    state.lastFoundAt = 0
    addPenalty(PENALTY_DECOY, '误选')
    const dead = applyDamage()
    markEl(el, 'gray')
    return finishInspection({
      changed: true,
      type: 'decoy',
      k,
      clueId,
      label,
      streak: 0,
      hpLost: HP_PER_MISS,
      dead,
      reason: level().decoyNotes?.[k] || '这条信息与本关目标无关。',
      fromHint,
    }, el)
  }

  const combo = state.comboMap.get(k)
  if (combo) {
    if (state.found.includes(combo.id)) return { changed: false }
    state.pending.add(k)
    const completeCombo = combo.combo.every(member => state.pending.has(member))
    if (!completeCombo) {
      el.classList.add('pending')
      markEl(el, 'amber')
      return finishInspection({ changed: true, type: 'partial', k, clueId, label, streak: state.levelStreak, fromHint }, el)
    }

    state.found.push(combo.id)
    unlock(combo.id)
    for (const member of combo.combo) {
      state.pending.delete(member)
      activeHits(`.hit[data-k="${member}"]`).forEach(memberEl => {
        memberEl.classList.remove('pending')
        memberEl.classList.add('found')
        markEl(memberEl, 'red')
      })
    }
    return finishInspection({
      changed: true,
      type: 'found',
      k,
      clueId: combo.id,
      label,
      streak: updateStreak(fromHint),
      fromHint,
    }, el)
  }

  if (state.found.includes(k)) return { changed: false }
  state.found.push(k)
  unlock(k)
  el.classList.add('found')
  markEl(el, 'red')
  return finishInspection({
    changed: true,
    type: 'found',
    k,
    clueId,
    label,
    streak: updateStreak(fromHint),
    fromHint,
  }, el)
}

function isDecoy(el) { return !!el.dataset.decoy }

export function applyDamage() {
  state.hp = Math.max(0, state.hp - HP_PER_MISS)
  hooks.onHpChange?.(state.hp, HP_PER_MISS)
  if (state.hp === 0 && !state.dead) {
    state.dead = true
    state.running = false
    hooks.onDeath?.()
    return true
  }
  return false
}

export function markReplay(scope) {
  scope.querySelectorAll('.hit[data-k]').forEach(el => {
    const k = +el.dataset.k
    if (isDecoy(el)) {
      if (state.hurtKs.has(k)) { el.classList.add('decoyed'); markEl(el, 'gray') }
    } else if (state.found.includes(clueIdFor(k))) {
      el.classList.add('found'); markEl(el, 'red')
    } else if (state.pending.has(k)) {
      el.classList.add('pending'); markEl(el, 'amber')
    }
  })
}

function unlock(k) {
  if (!state.unlocked.includes(k)) {
    state.unlocked.push(k)
    localStorage.setItem('achu_unlocked', JSON.stringify(state.unlocked))
  }
}

function markEl(el, tone) {
  const host = el.querySelector('.spot, .key') || el
  host.querySelectorAll(':scope > .ring, :scope > .mark').forEach(x => x.remove())
  const ring = document.createElement('span')
  ring.className = 'ring' + (tone === 'gray' ? ' gray' : tone === 'amber' ? ' amber' : '')
  ring.innerHTML = '<svg viewBox="0 0 100 40" preserveAspectRatio="none"><rect x="1.5" y="1.5" width="97" height="37" rx="7"/></svg>'
  host.appendChild(ring)
  const m = document.createElement('span')
  m.className = 'mark ' + tone
  m.innerHTML = tone === 'red'
    ? '<svg class="ic"><use href="#i-ban"/></svg>'
    : tone === 'amber'
      ? '<svg class="ic"><use href="#i-clock"/></svg>'
      : '<svg class="ic"><use href="#i-alert"/></svg>'
  host.appendChild(m)
}

let currentHint = null
let hintProgress = null

function resetHintProgress() {
  hintProgress = null
}

export function clearHint() {
  if (!currentHint) return
  currentHint.el?.classList.remove('hint-glow', 'hint-exact')
  currentHint.flag?.remove()
  currentHint = null
}

function showHint(el, { message, exact = false, flagText = '扫描区域' }) {
  clearHint()
  const hit = el.closest?.('.hit[data-k]') || el
  const target = exact
    ? (hit.querySelector?.('.spot, .key') || hit)
    : (hit.closest?.('.scan-region') || hit)
  const flag = document.createElement('span')
  flag.className = 'hint-flag'
  flag.textContent = flagText
  target.appendChild(flag)
  target.classList.add('hint-glow')
  if (exact) target.classList.add('hint-exact')
  target.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' })
  const hud = document.getElementById('hud')
  if (hud && !hud.hidden) {
    const targetRect = target.getBoundingClientRect()
    const hudRect = hud.getBoundingClientRect()
    const overlapsHud = targetRect.right > hudRect.left && targetRect.left < hudRect.right
    if (overlapsHud && targetRect.bottom > hudRect.top - 16) {
      window.scrollBy({ top: targetRect.bottom - hudRect.top + 16, behavior: 'auto' })
    }
  }
  currentHint = { el: target, flag, expiresAt: performance.now() + 6500 }
  document.dispatchEvent(new CustomEvent('achu:toast', { detail: message }))
}

function clueDefinition(id) {
  return state.clueList.find(clue => (typeof clue === 'number' ? clue : clue.id) === id)
}

function clueMemberKeys(id) {
  const clue = clueDefinition(id)
  return typeof clue === 'object' ? clue.combo : [id]
}

function isMemberBagged(k) {
  return state.pending.has(k)
}

function clueNeedsHelp(id) {
  if (state.found.includes(id)) return false
  return clueMemberKeys(id).some(k => !isMemberBagged(k))
}

function candidateClueIds() {
  return clueIds().filter(id => {
    if (!clueNeedsHelp(id)) return false
    return clueMemberKeys(id).some(k => visibleHits(`.hit[data-k="${k}"]`).some(el => (
      !el.classList.contains('found')
      && !el.classList.contains('pending')
      && !el.classList.contains('decoyed')
    )))
  })
}

function nextHintTarget() {
  if (hintProgress && clueNeedsHelp(hintProgress.clueId)) return hintProgress
  const candidates = candidateClueIds()
  if (!candidates.length) {
    resetHintProgress()
    return null
  }
  hintProgress = {
    clueId: candidates[Math.floor(Math.random() * candidates.length)],
    stage: 0,
  }
  return hintProgress
}

function visibleHitForClue(id) {
  for (const k of clueMemberKeys(id)) {
    if (isMemberBagged(k)) continue
    const hit = visibleHits(`.hit[data-k="${k}"]`).find(el => (
      !el.classList.contains('found')
      && !el.classList.contains('pending')
      && !el.classList.contains('decoyed')
    ))
    if (hit) return hit
  }
  return null
}

function exactHintText(hit) {
  const exact = hit.querySelector('.spot, .key') || hit
  const exactText = (exact.innerText || exact.textContent || '').trim().replace(/\s+/g, ' ')
  if (exactText) return exactText

  const copy = hit.cloneNode(true)
  copy.querySelectorAll('.hint-flag, .ring, .mark, .inspect-label, .scan-pulse').forEach(node => node.remove())
  return (copy.innerText || copy.textContent || '').trim().replace(/\s+/g, ' ') || clueLabel(hit.dataset.k)
}

export function useHint() {
  if (state.found.length >= levelTotal()) {
    document.dispatchEvent(new CustomEvent('achu:toast', { detail: '本关证据已经全部找到了' }))
    return false
  }

  const progress = nextHintTarget()
  if (!progress) {
    const waiting = state.pending.size
    document.dispatchEvent(new CustomEvent('achu:toast', {
      detail: waiting
        ? '已经找到组合线索的一部分，请继续寻找另一处'
        : '当前界面没有可提示的新线索，请检查已打开的内容',
    }))
    return false
  }

  state.hintHits++
  state.levelHintHits++
  const hintDead = applyDamage()
  progress.stage = Math.min(3, progress.stage + 1)
  const { clueId, stage } = progress
  const label = clueLabel(clueId)

  if (stage === 1) {
    const target = visibleHitForClue(clueId)
    if (!target) return false
    showHint(target, {
      message: `提示 1/3：已圈出「${label}」所在区域，再点一次提示可查看准确位置（达里奥 -1 滴血）`,
      flagText: '扫描区域',
    })
    return true
  }

  const target = visibleHitForClue(clueId)
  if (!target) {
    resetHintProgress()
    return false
  }

  if (stage === 2) {
    showHint(target, {
      exact: true,
      flagText: '答案位置',
      message: `提示 2/3：「${label}」就是“${exactHintText(target)}”，点击红框即可确认；再点一次提示可直接揭晓（达里奥 -1 滴血）`,
    })
    return true
  }

  let result = { type: 'partial' }
  for (const member of clueMemberKeys(clueId)) {
    if (state.found.includes(clueId) || state.pending.has(member)) continue
    const memberTarget = visibleHits(`.hit[data-k="${member}"]`).find(el => (
      !el.classList.contains('found')
      && !el.classList.contains('pending')
      && !el.classList.contains('decoyed')
    ))
    if (memberTarget) result = inspectHit(memberTarget, { fromHint: true })
  }
  document.dispatchEvent(new CustomEvent('achu:toast', {
    detail: state.found.includes(clueId) || result.type === 'found'
      ? `提示 3/3：已为你揭晓「${label}」（达里奥 -1 滴血）`
      : `提示 3/3：已揭晓「${label}」当前可见的部分（达里奥 -1 滴血）`,
  }))
  resetHintProgress()
  if (hintDead) document.dispatchEvent(new CustomEvent('achu:toast', { detail: '提示用多了——达里奥失血过多，倒下了。' }))
  return true
}

export function fmt(ms) {
  const t = Math.max(0, ms)
  const m = Math.floor(t / 60000)
  const s = Math.floor((t % 60000) / 1000)
  const d = Math.floor((t % 1000) / 100)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${d}`
}

export function loop() {
  if (currentHint && performance.now() >= currentHint.expiresAt) clearHint()
  document.dispatchEvent(new CustomEvent('achu:tick'))
  requestAnimationFrame(loop)
}
