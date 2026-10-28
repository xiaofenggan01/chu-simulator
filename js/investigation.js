import { state, clueIdFor, clueLabel } from './engine.js'
import { LEVELS } from './data/levels.js'

let root = null
let activeLevel = null

const esc = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]))

export function prepareInvestigationScene(sceneRoot, level) {
  root = sceneRoot
  activeLevel = level
  root.classList.add('investigation-root')

  const sim = root.querySelector('.sim')
  if (!sim) return

  const strap = document.createElement('div')
  strap.className = 'case-strap'
  strap.innerHTML = `
    <div class="case-id"><span>案件</span>${level.n} / ${LEVELS.length}</div>
    <div class="case-copy">
      <span class="case-chapter">${esc(level.chapter)}</span>
      <b class="case-meme">${esc(level.name)}</b>
      <span>${esc(level.sceneIntro)}</span>
      <p class="case-stakes">${esc(level.stakes)}</p>
    </div>
    <div class="case-target"><span>待找</span><b>${level.clues.length} 处</b></div>`
  const storyBeat = document.createElement('div')
  storyBeat.className = 'story-beat'
  storyBeat.setAttribute('role', 'status')
  storyBeat.setAttribute('aria-live', 'polite')
  storyBeat.innerHTML = `<span>新进展</span><b>${esc(level.twist)}</b>`
  sim.before(strap, storyBeat)

  const hits = [...root.querySelectorAll('.hit[data-k]')]
  for (const hit of hits) prepareHit(hit)
  prepareRegions(root)
}

export function prepareOverlay(scope) {
  scope.querySelectorAll('.hit[data-k]').forEach(prepareHit)
  prepareRegions(scope)
}

function prepareHit(hit) {
  if (hit.dataset.investigationReady) return
  hit.dataset.investigationReady = '1'
  hit.classList.add('evidence-host')

  const spots = [...hit.querySelectorAll('.key, .spot')]
  for (const spot of new Set(spots)) {
    spot.classList.add('spot')
    spot.setAttribute('role', 'button')
    spot.setAttribute('tabindex', '0')
    spot.setAttribute('aria-label', `证据：${clueLabel(hit.dataset.k)}`)
  }
}

function prepareRegions(scope) {
  const selectors = [
    '.field', '.plan', '.report', '.pay-main', '.pay-side', '.net-topo', '.net-logs',
    '.bhv-col', '.bhv-foot', '.org-banner', '.org-grid', '.chat-flow', '.chat-input',
    '.env-rows', '.terminal-body', '.doc', '.fn-policy', '.fn-board', '.fn-timeline',
    '.fn-sec', '.scene-baseline', '.work-panel', '.matrix-row', '.route-stack',
    '.observation-row', '.shift-record', '.prompt-record', '.software-record', '.transaction-row',
    '.org-proof-list', '.org-site-preview', '.org-tool-grid', '.claude-shell', '.claude-thread',
    '.code-workbench', '.settings-sheet', '.terminal-context', '.project-shell', '.file-grid',
    '.live-request-panel', '.context-grid',
    '.sim footer', '.modal',
  ]
  scope.querySelectorAll(selectors.join(',')).forEach((region, index) => {
    region.classList.add('scan-region')
    if (!region.dataset.scanRegion) region.dataset.scanRegion = String(index + 1)
  })
}

export function handleEvidenceKey(event) {
  if (event.key !== 'Enter' && event.key !== ' ') return false
  const spot = event.target.closest('.spot')
  if (!spot) return false
  event.preventDefault()
  spot.click()
  return true
}

export function pulseScan(target, { empty = false } = {}) {
  const host = target?.closest?.('.sim-body, .modal, .sim') || target
  if (!host) return
  const targetRect = target.getBoundingClientRect()
  const hostRect = host.getBoundingClientRect()
  const pulse = document.createElement('span')
  pulse.className = `scan-pulse${empty ? ' empty' : ''}`
  pulse.style.left = `${targetRect.left - hostRect.left + targetRect.width / 2}px`
  pulse.style.top = `${targetRect.top - hostRect.top + targetRect.height / 2}px`
  host.appendChild(pulse)
  pulse.addEventListener('animationend', () => pulse.remove(), { once: true })
}

export function showInspectFeedback(target, result) {
  if (!result?.changed) return
  const spot = target.matches?.('.spot, .key') ? target : (target.querySelector?.('.spot, .key') || target)
  pulseScan(spot, { empty: result.type === 'decoy' })
  const label = document.createElement('span')
  label.className = `inspect-label ${result.type}${result.fromHint ? ' revealed' : ''}`
  if (result.type === 'found') {
    label.textContent = result.fromHint
      ? `已揭晓「${result.label}」`
      : `找到「${result.label}」${result.streak > 1 ? ` · 连击 x${result.streak}` : ''}`
  } else if (result.type === 'partial') {
    label.textContent = '找到一部分 · 还差另一处'
  } else {
    label.textContent = '不是证据 · +10s'
  }
  spot.appendChild(label)
  requestAnimationFrame(() => {
    const rect = label.getBoundingClientRect()
    const gutter = 8
    const shift = rect.left < gutter
      ? gutter - rect.left
      : rect.right > window.innerWidth - gutter
        ? window.innerWidth - gutter - rect.right
        : 0
    label.style.setProperty('--inspect-shift', `${Math.round(shift)}px`)
    label.classList.add('on')
  })
  setTimeout(() => label.remove(), 900)
}

export function refreshInvestigation() {
  if (!root) return
  root.querySelectorAll('.hit[data-k]').forEach(hit => {
    const k = +hit.dataset.k
    hit.classList.toggle('found', state.found.includes(clueIdFor(k)))
    hit.classList.toggle('pending', state.pending.has(k))
    hit.classList.toggle('decoyed', state.hurtKs.has(k))
  })
  const storyBeat = root.querySelector('.story-beat')
  if (storyBeat && activeLevel) {
    const revealAt = Math.ceil(activeLevel.clues.length / 2)
    storyBeat.classList.toggle('revealed', state.found.length >= revealAt)
  }
}
