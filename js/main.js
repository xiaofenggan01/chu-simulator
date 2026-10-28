import { LEVELS, LEVEL_GROUPS } from './data/levels.js'
import { SCENES } from './scenes/index.js'
import * as E from './engine.js'
import { hideHud } from './hud.js'
import { showLevelComplete, toast, clearToast, closeAllOverlays, esc } from './ui.js'
import { showEnding } from './endings.js'
import { startReview } from './review-mode.js'
import { mountCollection, openBoard, detachHint } from './deduction-board.js'
import { renderDarioBar, showDarioBar, hideDarioBar, darioPraise, darioHurt, darioDeath, refreshEvidence, darioTick, darioSetHp } from './dario-bar.js'
import {
  handleEvidenceKey,
  prepareInvestigationScene,
  pulseScan,
  showInspectFeedback,
} from './investigation.js'

const app = document.getElementById('app')
const cleared = new Set()
let runActive = false
let completing = false
const TUTORIAL_KEY = 'achu-tutorial-seen'

function mount(html) {
  document.getElementById('pin-tray')?.remove()
  document.getElementById('ov-deduction')?.remove()
  detachHint()
  E.clearHint()
  closeAllOverlays({ clear: true, restoreFocus: false })
  clearToast()
  app.innerHTML = html
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

function showTitle() {
  hideHud()
  hideDarioBar()
  const next = [...LEVELS.keys()].find(j => !cleared.has(j))
  const inProgress = runActive && next !== undefined
  const tutorialSeen = localStorage.getItem(TUTORIAL_KEY) === '1'
  const unlocked = localStorage.getItem('achu_review_done') === '1'
  mount(`
  <section class="screen on">
    <div class="title-hero">
      <div class="title-kicker"><span class="live-dot"></span> SAFEGUARDS TEAM · 夜班记录 ${new Date().getFullYear()}</div>
      <div class="title-layout">
        <div class="title-copy">
          <div class="title-mark"><svg class="logo"><use href="#i-logo"/></svg><span>CASE FILE  /  005</span></div>
          <h1>A 畜<br><em>模拟器</em></h1>
          <p class="title-lede">你将扮演一名安全审查员，帮助达里奥找到潜藏的中国用户。</p>
          <div class="title-actions">
            <button class="btn" id="btn-review">值班速裁<svg class="ic"><use href="#i-arrow-r"/></svg></button>
            <button class="btn ${unlocked ? '' : 'locked'}" id="btn-start">
              ${unlocked ? (inProgress ? '继续断案' : '进阶 · 开始断案') : '进阶 · 断案模式'}
              ${unlocked ? '<svg class="ic"><use href="#i-arrow-r"/></svg>' : '<svg class="ic"><use href="#i-lock"/></svg>'}
            </button>
          </div>
          ${unlocked ? '' : '<p class="title-lock-note">完成一轮值班速裁后解锁进阶断案</p>'}
        </div>
        <div class="title-board-wrap">
          <div class="title-board">
            <img src="assets/caseboard-hero.webp" alt="调查桌面" />
            <div class="board-stamp">EVIDENCE<br>ONLY</div>
            <div class="board-caption"><span>今日值班任务</span><b>找到潜藏的中国用户</b></div>
          </div>
          <div class="board-signer">
            <img src="assets/dario-avatar.webp" alt="签发人头像" />
            <div class="signer-copy"><b>D. Amodei</b><span>值班签发 · Safeguards</span></div>
          </div>
        </div>
      </div>
      <div class="title-footer"><span>本作品为讽刺戏仿（parody），与 Anthropic 无关</span></div>
    </div>
  </section>`)
  document.getElementById('btn-review').onclick = startReview
  const startBtn = document.getElementById('btn-start')
  if (unlocked) startBtn.onclick = () => {
    E.startRun(); cleared.clear(); runActive = true
    if (tutorialSeen) startPlay(0)
    else showTutorial({ onDone: () => startPlay(0) })
  }
  else startBtn.onclick = () => toast('完成一轮「值班速裁」后解锁进阶断案')
}

function state2() { return E.state }

function showTutorial({ onDone }) {
  mount(`
  <section class="screen on">
    <div class="tutorial-shell">
      <div class="tutorial-head"><span class="title-kicker"><span class="live-dot"></span> TRAINING ROOM · 00</span><button class="btn text-btn" id="tutorial-skip">跳过教学</button></div>
      <div class="tutorial-grid">
        <div class="tutorial-copy">
          <span class="eyebrow">新手案 · 30 秒上手</span>
          <h2>先别急着封号，<br><em>先找一条能站住的证据。</em></h2>
          <p>这里的玩法很简单：点击具体事实。地点、付款渠道、办事记录可以成为证据；语言、姓名和“看起来很像”只能算干扰。</p>
          <div class="tutorial-rules"><span><b>01</b> 点中证据</span><span><b>02</b> 看即时反馈</span><span><b>03</b> 找齐过关</span></div>
        </div>
        <div class="tutorial-board">
          <div class="tutorial-board-head"><b>训练样本 · 账号资料</b><span>点击卡片检查</span></div>
          <div class="tutorial-card-list">
            <button class="tutorial-card" data-tutorial="correct"><span class="tutorial-icon">¥</span><span><small>付款方式</small><b>银联借记卡</b></span><i>?</i></button>
            <button class="tutorial-card" data-tutorial="decoy"><span class="tutorial-icon">文</span><span><small>回复偏好</small><b>使用中文回复</b></span><i>?</i></button>
            <button class="tutorial-card" data-tutorial="correct"><span class="tutorial-icon">沪</span><span><small>行程记录</small><b>上海虹桥站</b></span><i>?</i></button>
          </div>
          <div class="tutorial-feedback" id="tutorial-feedback">等待你的第一次判断。</div>
          <button class="btn tutorial-enter" id="tutorial-enter" disabled>点击上方卡片开始 <svg class="ic"><use href="#i-arrow-r"/></svg></button>
        </div>
      </div>
    </div>
  </section>`)

  const cards = [...document.querySelectorAll('.tutorial-card')]
  const feedback = document.getElementById('tutorial-feedback')
  const enter = document.getElementById('tutorial-enter')
  let found = 0
  cards.forEach(card => {
    card.onclick = () => {
      if (card.classList.contains('checked')) return
      card.classList.add('checked')
      if (card.dataset.tutorial === 'correct') {
        found += 1
        card.classList.add('is-correct')
        card.querySelector('i').textContent = '✓'
        feedback.innerHTML = found === 2 ? '<b>教学完成。</b> 你已经知道“具体事实”和“语言偏好”的区别。' : '这是具体事实，可以继续保留。'
      } else {
        card.classList.add('is-decoy')
        card.querySelector('i').textContent = '×'
        feedback.innerHTML = '<b>干扰项。</b> 中文只是语言偏好，不能直接判断用户在哪。'
      }
      if (found === 2) { enter.disabled = false; enter.textContent = ''; enter.innerHTML = '进入第一案 <svg class="ic"><use href="#i-arrow-r"/></svg>' }
    }
  })
  const finish = () => {
    localStorage.setItem(TUTORIAL_KEY, '1')
    onDone()
  }
  document.getElementById('tutorial-skip').onclick = finish
  enter.onclick = finish
}

function showCaseIntro(i) {
  hideDarioBar()
  const level = LEVELS[i]
  mount(`
  <section class="screen on cinema-screen">
    <div class="case-cinema">
      <figure class="case-comic">
        <img src="assets/comic-l${level.n}.webp" alt="第 ${level.n} 关四格漫画" />
      </figure>
      <button class="btn cinema-enter" id="case-enter">进入现场 <svg class="ic"><use href="#i-arrow-r"/></svg></button>
    </div>
  </section>`)
  document.getElementById('case-enter').onclick = () => renderLevel(i)
}

function startPlay(i) {
  completing = false
  showCaseIntro(i)
}

function renderLevel(i) {
  E.enterLevel(i)
  mount('<section class="screen on"><div id="play-root"></div></section>')
  const root = document.getElementById('play-root')
  const lv = E.level()
  SCENES[lv.key](root)
  if (lv.deduc) {
    // 推理模式：收集 + 拼板，不走即时取证
    mountCollection(lv, root)
    document.addEventListener('achu:deduction-solved', () => {
      if (!completing) { completing = true; setTimeout(advanceCompletedLevel, 500) }
    }, { once: true })
  } else {
    prepareInvestigationScene(root, lv)
    E.markReplay(root)
  }
  hideHud()
  renderDarioBar()
  showDarioBar()
  refreshEvidence()
  darioSetHp(E.state.hp)
  const next = LEVELS[i + 1]
  if (next) { const pre = new Image(); pre.src = `assets/comic-l${next.n}.webp` }
}

document.addEventListener('click', e => {
  const spot = e.target.closest('.spot')
  if (spot) {
    const hit = spot.closest('.hit[data-k]')
    if (!hit || e.target.closest('button:not(.spot), a, input, select, textarea')) return
    E.inspectHit(hit)
    return
  }
  const body = e.target.closest('.sim-body')
  if (body && !e.target.closest('button, a, input, select, textarea')) pulseScan(e.target, { empty: true })
})
document.addEventListener('keydown', handleEvidenceKey)

function showGameOver() {
  hideHud()
  hideDarioBar()
  closeAllOverlays({ clear: true, restoreFocus: false })
  clearToast()
  E.pauseTimer()
  mount(`
  <section class="screen on">
    <div class="gameover">
      <div class="go-face"><img src="assets/dario-ko.webp" alt="Dario 殉职" /></div>
      <div class="go-kicker">SAFEGUARDS · 值班中断</div>
      <h2>达里奥殉职了</h2>
      <p class="go-copy">血条归零。他在第 <b>${E.state.levelIdx + 1}</b> 关倒下，本局成绩作废。<br>历史不会记录这次值班。</p>
      <div class="go-actions">
        <button class="btn" id="go-retry">重新值班<svg class="ic"><use href="#i-arrow-r"/></svg></button>
        <button class="btn ghost" id="go-home">回大厅</button>
      </div>
    </div>
  </section>`)
  document.getElementById('go-retry').onclick = () => { E.startRun(); cleared.clear(); runActive = true; startPlay(0) }
  document.getElementById('go-home').onclick = showTitle
}

function advanceCompletedLevel() {
  hideHud()
  closeAllOverlays({ clear: true, restoreFocus: false })
  clearToast()
  const i = E.state.levelIdx
  cleared.add(i)
  const hasNext = LEVELS[i + 1] && LEVELS[i + 1].status === 'ready'
  const isFinal = i === LEVELS.length - 1
  showLevelComplete({
    level: LEVELS[i],
    nextLevel: hasNext ? LEVELS[i + 1] : null,
    isFinal,
    onContinue: () => {
      if (isFinal) {
        runActive = false
        E.pauseTimer()
        showEnding(app)
      } else if (hasNext) startPlay(i + 1)
      else showRoadmap()
    },
  })
}

function showRoadmap() {
  hideHud()
  mount(`
  <section class="screen on">
    <div class="roadmap">
      <h2>关卡列表</h2>
      <div class="sub">从聊天露馅一路查到代码环境。五关规则一致，剧情和证据逐步升级。</div>
      <div id="rm-list">${LEVEL_GROUPS.map(group => {
        const levels = LEVELS.filter(level => level.group === group.key)
        return `
          <section class="rm-group" aria-labelledby="rm-${group.key}">
            <div class="rm-group-head">
              <h3 id="rm-${group.key}">${group.name}</h3>
              <p>${group.note}</p>
            </div>
            <ol>${levels.map(lv => {
              const index = LEVELS.indexOf(lv)
              return `
                <li class="${cleared.has(index) ? 'done' : ''}">
                  <button type="button" class="rm-btn" data-idx="${index}">
                    <span class="no">${String(lv.n).padStart(2, '0')}</span>${lv.name}
                    <span class="st">${cleared.has(index) ? '已完成' : '未完成'}</span>
                  </button>
                </li>`
            }).join('')}</ol>
          </section>`
      }).join('')}</div>
      <div class="back"><button class="btn ghost" id="btn-title">返回大厅</button></div>
    </div>
  </section>`)
  document.getElementById('rm-list').onclick = e => {
    const button = e.target.closest('.rm-btn[data-idx]')
    if (!button) return
    if (!runActive) { E.startRun(); cleared.clear(); runActive = true }
    startPlay(+button.dataset.idx)
  }
  document.getElementById('btn-title').onclick = showTitle
}

document.addEventListener('achu:restart', () => { E.startRun(); cleared.clear(); runActive = true; startPlay(0) })
document.addEventListener('achu:title', showTitle)
document.addEventListener('achu:toast', e => toast(e.detail))
document.addEventListener('achu:hp', e => darioSetHp(e.detail))

E.hooks.onInspect = (result, hit) => {
  showInspectFeedback(hit, result)
  refreshEvidence()
  if (result.type === 'decoy') {
    toast(result.reason)
    darioHurt()
    if (result.dead) {
      darioDeath()
      setTimeout(showGameOver, 900)
    }
  } else if (result.type === 'found') {
    darioPraise()
  }
  if (result.complete && !completing && !result.dead) {
    completing = true
    setTimeout(advanceCompletedLevel, 650)
  }
}
E.hooks.onHpChange = (hp) => {
  document.dispatchEvent(new CustomEvent('achu:hp', { detail: hp }))
}
document.addEventListener('achu:tick', darioTick)
E.hooks.onDeath = () => {
  darioDeath()
  setTimeout(showGameOver, 900)
}
E.loop()
showTitle()
