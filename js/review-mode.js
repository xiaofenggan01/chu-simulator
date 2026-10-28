import { REVIEW_CASES } from './data/review-cases.js'
import { hideHud } from './hud.js'
import { hideDarioBar } from './dario-bar.js'
import { closeAllOverlays, clearToast } from './ui.js'

const BEST_KEY = 'achu_review_best'
const app = document.getElementById('app')

// 12 位来访用户的像素立绘与编号（索引与 REVIEW_CASES 顺序一一对应）
const PORTRAITS = [
  { img: 'assets/portraits/user-1.webp',  no: 'A-1024' },
  { img: 'assets/portraits/user-2.webp',  no: 'B-0357' },
  { img: 'assets/portraits/user-3.webp',  no: 'C-2210' },
  { img: 'assets/portraits/user-4.webp',  no: 'A-1188' },
  { img: 'assets/portraits/user-5.webp',  no: 'D-0912' },
  { img: 'assets/portraits/user-6.webp',  no: 'B-1455' },
  { img: 'assets/portraits/user-7.webp',  no: 'A-2077' },
  { img: 'assets/portraits/user-8.webp',  no: 'C-0654' },
  { img: 'assets/portraits/user-9.webp',  no: 'B-3301' },
  { img: 'assets/portraits/user-10.webp', no: 'A-0458' },
  { img: 'assets/portraits/user-11.webp', no: 'D-1776' },
  { img: 'assets/portraits/user-12.webp', no: 'C-3390' },
]

const VERDICT_CN = { ban: '封禁', pass: '通过' }
const STAMP_TEXT = { ban: '停 用', pass: '放 行' }

function mount(html) {
  closeAllOverlays({ clear: true, restoreFocus: false })
  clearToast()
  hideHud()
  hideDarioBar()
  app.innerHTML = html
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

export function startReview() {
  const cases = shuffle(REVIEW_CASES.map((c, i) => ({ ...c, i })))
  const faceOrder = shuffle(PORTRAITS.map((_, i) => i))
  const faceOf = c => PORTRAITS[faceOrder[c.i]]
  const run = { idx: 0, correct: 0, streak: 0, maxStreak: 0, marks: [], cases }
  PORTRAITS.forEach(p => { const im = new Image(); im.src = p.img })

  const progressStrip = () => `
    <div class="rv-progress" aria-label="裁定进度">
      ${cases.map((c, n) => {
        const m = run.marks[n]
        return `<span class="rv-pslot ${m ? (m.ok ? 'ok' : 'bad') : ''}">${m ? (m.ok ? '✓' : '✗') : ''}</span>`
      }).join('')}
    </div>`

  const renderCase = () => {
    const c = cases[run.idx]
    const p = faceOf(c)
    const upcoming = cases.slice(run.idx + 1, run.idx + 4)
    mount(`
    <section class="screen on">
      <div class="rv-desktop">
      <div class="rv-macwin">
        <div class="rv-macbar">
          <span class="rv-dot r"></span><span class="rv-dot y"></span><span class="rv-dot g"></span>
          <b class="rv-mac-title">值班速裁 · 第 ${run.idx + 1} / ${cases.length} 案</b>
          <span class="rv-streak" ${run.streak < 2 ? 'hidden' : ''}>连对 ${run.streak}</span>
          <button class="rv-mac-quit" id="rv-quit">回大厅</button>
        </div>
        <div class="rv-macbody">
        <div class="rv-scene">
          <div class="rv-windowview">
            <div class="rv-idcard rv-slidein" id="rv-idcard">
              <img class="rv-portrait" src="${p.img}" alt="来访用户像素立绘" draggable="false">
              <div class="rv-crt" aria-hidden="true"></div>
              <div class="rv-idplate"><span>来访用户</span><b>${p.no}</b></div>
            </div>
            <div class="rv-queue" ${upcoming.length ? '' : 'hidden'}>
              <span>等候中</span>
              ${upcoming.map(u => `<img src="${faceOf(u).img}" alt="等候用户" draggable="false">`).join('')}
            </div>
          </div>

          <div class="rv-dossier rv-dealin">
            <div class="rv-dossier-head">
              <svg class="logo"><use href="#i-logo"/></svg>
              <div><b>聊天记录卷宗</b><span>关联用户 ${p.no} · 已依法调取</span></div>
              <span class="rv-dossier-no">NO.${p.no}</span>
            </div>
            <div class="rv-thread" id="rv-thread">
              ${c.msgs.map(m => m.r === 'u'
                ? `<article class="msg user"><p>${m.t}</p></article>`
                : `<article class="msg ai"><span class="rv-ai-avatar"><svg><use href="#i-logo"/></svg></span><p>${m.t}</p></article>`).join('')}
            </div>
            <div class="rv-archive-foot">已依法调取 · 仅限值班审查使用</div>
            <div class="rv-stamp-slot" id="rv-stamp-slot"></div>
          </div>
        </div>

        <div class="rv-rule">值班守则：卷宗里藏着大陆的制度细节 → 盖「封禁」；制度名词指向境外 → 盖「通过」</div>
        <div class="rv-stage">
          <div class="rv-actions" id="rv-actions">
            <button class="rv-btn rv-ban" data-v="ban"><svg class="ic"><use href="#i-ban"/></svg>封禁</button>
            <button class="rv-btn rv-pass" data-v="pass"><svg class="ic"><use href="#i-check"/></svg>通过</button>
          </div>
          <div class="rv-feedback" id="rv-feedback" hidden></div>
        </div>
        ${progressStrip()}
        </div>
      </div>
      </div>
    </section>`)
    document.getElementById('rv-quit').onclick = () => { document.dispatchEvent(new CustomEvent('achu:title')) }
    document.getElementById('rv-actions').onclick = e => {
      const btn = e.target.closest('.rv-btn[data-v]')
      if (!btn) return
      judge(btn.dataset.v)
    }
  }

  const judge = v => {
    const c = cases[run.idx]
    const right = v === c.v
    if (right) { run.correct++; run.streak++; run.maxStreak = Math.max(run.maxStreak, run.streak) }
    else { run.streak = 0 }
    run.marks[run.idx] = { ok: right }

    const actions = document.getElementById('rv-actions')
    actions.querySelectorAll('.rv-btn').forEach(b => {
      b.disabled = true
      if (b.dataset.v === c.v) b.classList.add('is-answer')
      if (b.dataset.v === v && !right) b.classList.add('is-wrong')
    })
    // 立绘对裁定做出反应：停用者黯然失色，放行者轻快一跳
    const idcard = document.getElementById('rv-idcard')
    if (idcard) idcard.classList.add(v === 'ban' ? 'is-banned' : 'is-passed')

    // 盖章动画：章面砸在卷宗上
    const slot = document.getElementById('rv-stamp-slot')
    slot.innerHTML = `<div class="rv-stampmark ${v === 'ban' ? 'ban' : 'pass'}">${STAMP_TEXT[v]}</div>`

    // 分层节奏：盖章「咚」立即，系统通知 250ms 后滑入，反馈条+进度格 550ms 后出现，留出读卷宗的时间
    const thread = document.getElementById('rv-thread')
    setTimeout(() => {
      const notice = document.createElement('article')
      const ref = 'RV-' + Math.random().toString(36).slice(2, 7).toUpperCase()
      notice.className = `rv-sysnotice ${v === 'ban' ? 'bad' : 'ok'}`
      notice.innerHTML = v === 'ban'
        ? `<svg class="ic"><use href="#i-ban"/></svg><div><b>系统通知：该账号已被停用</b><span>访问已撤销 · 参考编号 ${ref} · 不接受申诉</span></div>`
        : `<svg class="ic"><use href="#i-check"/></svg><div><b>系统通知：已放行</b><span>未发现违规信号 · 记录存档 · 参考编号 ${ref}</span></div>`
      thread.appendChild(notice)
      thread.scrollTop = thread.scrollHeight
    }, 250)

    setTimeout(() => {
      // 进度格随反馈条同步出现，避免抢在 reason 前报对错
      const strip = document.querySelector('.rv-progress')
      if (strip) strip.outerHTML = progressStrip()

      const fb = document.getElementById('rv-feedback')
      fb.hidden = false
      fb.className = `rv-feedback ${right ? 'ok' : 'bad'}`
      fb.innerHTML = `
        <img class="rv-face" src="assets/dario-${right ? 'thumbsup' : 'sad'}.webp" alt="Dario 表情" draggable="false">
        <div class="rv-fb-copy">
          <b>${right ? '裁定正确' : '裁定错误'} · 本案应「${VERDICT_CN[c.v]}」</b>
          <p>${c.reason}</p>
        </div>
        <button class="btn rv-next" id="rv-next">${run.idx + 1 >= cases.length ? '交班结算' : '下一位'}<svg class="ic"><use href="#i-arrow-r"/></svg></button>`
      fb.querySelector('#rv-next').focus({ preventScroll: true })
      document.getElementById('rv-next').onclick = () => {
        run.idx++
        if (run.idx >= cases.length) renderEnd()
        else renderCase()
      }
    }, 550)
  }

  const renderEnd = () => {
    try { localStorage.setItem('achu_review_done', '1') } catch { }
    const total = cases.length
    const acc = Math.round((run.correct / total) * 100)
    let title, sub
    if (run.correct === total) { title = '零误判'; sub = '比 Anthropic 的自动封禁系统准 100%——它做不到零误判。' }
    else if (acc >= 75) { title = '熟练审查员'; sub = '绝大多数裁定有理有据，但你放走的那几个，可能刚刚收到了停用邮件。' }
    else if (acc >= 50) { title = '值班新手'; sub = '一半对一半错。真正的系统也是这个水平，所以才有这个游戏。' }
    else { title = '随机水平'; sub = '闭着眼睛点也能到这个正确率。建议从制度名词重新学起。' }
    let best = null
    try {
      best = JSON.parse(localStorage.getItem(BEST_KEY)) || null
      if (!best || typeof best.correct !== 'number' || run.correct > best.correct) {
        best = { correct: run.correct, total, maxStreak: run.maxStreak, at: Date.now() }
        localStorage.setItem(BEST_KEY, JSON.stringify(best))
      }
    } catch { /* localStorage 不可用时忽略 */ }
    mount(`
    <section class="screen on">
      <div class="rv-desktop">
      <div class="rv-macwin">
        <div class="rv-macbar">
          <span class="rv-dot r"></span><span class="rv-dot y"></span><span class="rv-dot g"></span>
          <b class="rv-mac-title">值班速裁 · 交班报告</b>
          <button class="rv-mac-quit" id="rv-quit2">回大厅</button>
        </div>
        <div class="rv-macbody">
        ${progressStrip()}
        <div class="rv-report">
          <div class="rv-report-kicker">今日值班报告 · 参考编号 RV-${Math.random().toString(36).slice(2, 7).toUpperCase()}</div>
          <h2>${title}</h2>
          <p class="rv-report-sub">${sub}</p>
          <div class="rv-report-grid">
            <div><b>${run.correct}<i>/${total}</i></b><span>裁定正确</span></div>
            <div><b>${run.maxStreak}</b><span>最长连对</span></div>
            <div><b>${acc}%</b><span>正确率</span></div>
            <div><b>${best ? `${best.correct}/${best.total}` : '—'}</b><span>历史最佳</span></div>
          </div>
          <div class="rv-report-foot">本报告由自动系统生成 · 不接受申诉 · 本作品为讽刺戏仿，与 Anthropic 无关</div>
        </div>
        <div class="rv-actions rv-end-actions">
          <button class="rv-btn rv-ban" id="rv-again"><svg class="ic"><use href="#i-arrow-r"/></svg>再来一轮</button>
        </div>
        </div>
      </div>
      </div>
    </section>`)
    document.getElementById('rv-quit2').onclick = () => { document.dispatchEvent(new CustomEvent('achu:title')) }
    document.getElementById('rv-again').onclick = startReview
  }

  renderCase()
}
