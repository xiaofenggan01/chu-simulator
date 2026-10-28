import * as E from './engine.js'
import { toast } from './ui.js'
import { LEVELS } from './data/levels.js'

const BOARD_KEY = 'achu_board'
const safeParse = E.safeParse

export function verdictTitle(hits, hints) {
  if (hits === 0 && hints === 0) return ['全部正确', `${LEVELS.length} 关全部判断正确，并且没有使用提示。`]
  if (hits === 0) return ['准确完成', '没有误选任何正常信息。']
  if (hints >= 8) return ['提示较多', '完成了全部关卡，但使用提示的次数较多。']
  if (hits <= 5) return ['基本正确', '完成了全部关卡，但仍有少量误选。']
  if (hits <= 12) return ['误选较多', '误选数量较多，建议重新核对证据含义。']
  return ['需要重试', '误选数量超过正确证据，请重新体验并仔细核对。']
}

function loadBoard() {
  const b = safeParse(BOARD_KEY, [])
  return Array.isArray(b) ? b : []
}
function saveBoard(b) { localStorage.setItem(BOARD_KEY, JSON.stringify(b)) }

export function showEnding(app) {
  E.pauseTimer()
  const finalMs = E.totalMs()
  const [title, subtitle] = verdictTitle(E.state.decoyHits, E.state.hintHits)
  const total = E.fmt(finalMs)
  const zeroInnocent = E.state.decoyHits === 0
  const ref = 'REF-' + Math.random().toString(36).slice(2, 8).toUpperCase()

  app.innerHTML = `
  <section class="screen on">
    <div class="ending">
      <div class="end-head">
        <svg class="logo"><use href="#i-logo"/></svg>
        <h2>游戏完成</h2>
        <div class="end-sub">五个高能案件已经全部完成。</div>
      </div>

      <div class="end-board">
        <div class="eb-item"><b>11,400,000</b><span>同期全平台账号停用</span></div>
        <div class="eb-item"><b>42,000</b><span>申诉后恢复（0.37%）</span></div>
        <div class="eb-item eb-wolf"><b>未退还</b><span>被停用账号的本月剩余订阅费</span></div>
      </div>

      <div class="report-card">
        <div class="rc-head">游戏成绩单</div>
        <div class="rc-title">${title}</div>
        <div class="rc-sub">${subtitle}</div>
        <div class="rc-grid">
          <div><b>${E.state.hp}</b><span>达里奥剩余血量</span></div>
          <div><b>${total}</b><span>总用时</span></div>
          <div><b>${E.state.decoyHits}</b><span>误选次数</span></div>
          <div><b>${LEVELS.length}</b><span>完成关卡</span></div>
        </div>
        <div class="rc-foot">本报告由自动系统生成 · 不接受申诉 · 参考编号：${ref}</div>
      </div>

      ${zeroInnocent ? `
      <div class="egg-card">
        <div class="egg-tag">隐藏结局 · 已达成（全程零误选）</div>
        <div class="egg-title">解封道歉信</div>
        <div class="egg-body">“您的账号此前被自动系统停用。我们确认这是一次错误，现已恢复您的账号。对此我们深表歉意。”</div>
        <div class="egg-foot">先停用账号，后道歉，补偿 10 美元。你全程没有误选过正常信息，所以解锁了这封道歉信。</div>
      </div>` : ''}

      <div class="end-actions">
        <button class="btn ghost" id="end-restart">再玩一次</button>
      </div>

      <div class="leaderboard">
        <div class="lb-title">本地排行榜</div>
        <div class="lb-form">
          <input id="lb-name" maxlength="16" placeholder="输入玩家名称">
          <button class="btn" id="lb-save" style="padding:10px 22px;font-size:14px">保存成绩</button>
          <button class="lb-clear" id="lb-clear" title="清空排行榜">清空</button>
        </div>
        <ol class="lb-list" id="lb-list"></ol>
      </div>

      <div class="disclaimer" style="margin-top:34px">本作品为讽刺戏仿（parody），与 Anthropic 无关。界面仿绘仅用于批评与评论目的；全部线索、数据、引文均来自公开报道与社区讨论，出处见游戏内评分卡。</div>
    </div>
  </section>`

  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))

  renderBoard()

  document.getElementById('lb-save').onclick = saveEntry
  document.getElementById('lb-name').addEventListener('keydown', e => { if (e.key === 'Enter') saveEntry() })
  document.getElementById('lb-clear').onclick = () => {
    if (!confirm('确定清空本地排行榜吗？')) return
    saveBoard([])
    renderBoard()
    toast('本地排行榜已清空')
  }
  document.getElementById('end-restart').onclick = () => { E.startRun(); location.hash = ''; showBriefFromEnding(app) }

  let savedAt = 0
  function saveEntry() {
    const now = Date.now()
    if (now - savedAt < 1500) return
    savedAt = now
    const name = document.getElementById('lb-name').value.trim() || '匿名玩家'
    const board = loadBoard()
    if (board.some(r => r.name === name && r.hp === E.state.hp && r.ms === finalMs)) {
      toast('这条成绩已经保存')
      return
    }
    board.push({ name, ms: finalMs, hp: E.state.hp, decoys: E.state.decoyHits, ts: now })
    board.sort((a, b) => b.hp - a.hp || a.ms - b.ms)
    saveBoard(board.slice(0, 10))
    document.getElementById('lb-name').value = ''
    renderBoard()
    toast('成绩已保存')
  }

  function renderBoard() {
    const board = loadBoard()
    const list = document.getElementById('lb-list')
    list.innerHTML = board.length
      ? board.map((r, i) => {
          const tie = i > 0 && r.hp === board[i - 1].hp
          const rank = tie ? '并列' : String(i + 1)
          return `<li><span class="lb-rank">${rank}</span><span class="lb-name">${escapeHtml(r.name)}</span><span class="lb-time mono">${r.hp} HP</span><span class="lb-dec">误选 ${r.decoys} · ${E.fmt(r.ms)}</span></li>`
        }).join('')
      : '<li class="lb-empty">还没有成绩记录。</li>'
  }
}

function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) }

function showBriefFromEnding(app) {
  document.dispatchEvent(new CustomEvent('achu:restart'))
}

function exportCard(title, total, ref) {
  const c = document.createElement('canvas')
  c.width = 800; c.height = 1000
  const x = c.getContext('2d')
  x.fillStyle = '#F5F4EF'; x.fillRect(0, 0, 800, 1000)
  x.strokeStyle = '#E8E6DC'; x.lineWidth = 2; x.strokeRect(24, 24, 752, 952)

  x.fillStyle = '#D97757'
  for (let i = 0; i < 12; i++) {
    x.save(); x.translate(400, 120); x.rotate(i * Math.PI / 6)
    const w = i % 2 ? 6 : 9, h = i % 2 ? 38 : 50
    x.beginPath()
    if (x.roundRect) x.roundRect(-w / 2, -h, w, h, w / 2)
    else x.rect(-w / 2, -h, w, h)
    x.fill(); x.restore()
  }

  x.textAlign = 'center'
  x.fillStyle = '#1F1E1D'
  x.font = '600 34px Georgia, "Songti SC", serif'
  x.fillText('A 畜模拟器 · 游戏成绩单', 400, 240)
  x.fillStyle = '#6B6A65'
  x.font = '16px -apple-system, "PingFang SC", sans-serif'
  x.fillText('全部关卡完成 · 2026 年', 400, 274)

  x.fillStyle = '#B4532F'
  x.font = '600 52px Georgia, "Songti SC", serif'
  x.fillText(title, 400, 400)

  x.fillStyle = '#1F1E1D'
  x.font = '600 64px ui-monospace, Menlo, monospace'
  x.fillText(total, 400, 520)
  x.fillStyle = '#6B6A65'
  x.font = '16px -apple-system, "PingFang SC", sans-serif'
  x.fillText('总用时（含罚时）', 400, 552)

  const stats = [[String(LEVELS.length), '完成关卡'], [String(E.state.decoyHits), '误选次数'], [String(E.state.hintHits), '使用提示']]
  stats.forEach((s, i) => {
    const cx = 400 + (i - 1) * 210
    x.fillStyle = '#1F1E1D'; x.font = '600 44px ui-monospace, Menlo, monospace'
    x.fillText(s[0], cx, 660)
    x.fillStyle = '#6B6A65'; x.font = '15px -apple-system, "PingFang SC", sans-serif'
    x.fillText(s[1], cx, 690)
  })

  x.strokeStyle = '#E8E6DC'
  x.beginPath(); x.moveTo(120, 760); x.lineTo(680, 760); x.stroke()
  x.fillStyle = '#98968E'; x.font = '14px -apple-system, "PingFang SC", sans-serif'
  x.fillText('同期全平台账号停用 11,400,000 · 恢复率 0.37%', 400, 800)
  x.fillText('本作品为讽刺戏仿（parody），与 Anthropic 无关', 400, 826)
  x.fillStyle = '#D97757'; x.font = '600 15px ui-monospace, monospace'
  x.fillText(ref, 400, 900)

  const a = document.createElement('a')
  a.download = 'achu-performance.png'
  a.href = c.toDataURL('image/png')
  a.click()
}
