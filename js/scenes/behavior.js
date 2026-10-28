// L3 证物板：调休日历 / 用量报表 / 提问打印件 / 应用检查单
export function render(root) {
  root.innerHTML = `
  <div class="sim scene-behavior">
    <div class="sim-head"><svg class="logo"><use href="#i-logo"/></svg><span class="t">证物板 · 案件 GTG-10088</span><span class="r">账号声明：美国 · 行为回放 30 天</span></div>
    <div class="ev-board">
      <div class="ev-item ev-paper ev-cal" style="left:3%;top:6%;width:29%;--tilt:-1.8deg">
        <span class="pin-tack ev-tack"></span>
        <div class="ev-paper-head">企业日历 · 十月<small>调休安排</small></div>
        <div class="ev-cal-grid">
          ${Array.from({length: 31}, (_, i) => {
            const d = i + 1
            const cls = d === 28 ? 'day workday' : (d === 1 || d === 2 || d === 3 || d === 4 || d === 5 || d === 6 || d === 7) ? 'day holiday' : 'day'
            return `<span class="${cls}">${d}</span>`
          }).join('')}
        </div>
        <div class="ev-cal-note"><span class="dd-node" data-clue="f1">9/28 周日 · 国庆调休补班</span></div>
      </div>

      <div class="ev-item ev-paper" style="left:38%;top:8%;width:29%;--tilt:1.2deg">
        <span class="pin-tack ev-tack gold"></span>
        <div class="ev-paper-head">用量报表<small>9/28 周日</small></div>
        <div class="ev-usage">
          <div class="ev-usage-row dd-node" data-clue="f2">
            <span>09:02 — 19:18 持续在线</span>
            <b>9.4 小时</b>
            <div class="ev-bars">${Array.from({length: 12}, (_, i) => `<i class="${i > 0 && i < 11 ? 'on' : ''}"></i>`).join('')}</div>
          </div>
          <div class="ev-usage-row dim dd-node" data-clue="d1">
            <span>10/12 周日 晚间登录</span>
            <b>18 分钟</b>
            <div class="ev-bars">${Array.from({length: 12}, () => `<i></i>`).join('')}</div>
          </div>
        </div>
        <div class="ev-paper-foot">对照行：普通周日的零散使用说明不了什么</div>
      </div>

      <div class="ev-item ev-paper" style="left:71%;top:6%;width:26%;--tilt:2deg">
        <span class="pin-tack ev-tack"></span>
        <div class="ev-paper-head">提问记录 · 打印件<small>已隐藏隐私</small></div>
        <div class="ev-talk">
          <p class="u dd-node" data-clue="f3">帮我核对这张<b>电子专票的发票抬头、纳税人识别号和含税价</b>，整理成报销说明。</p>
          <p class="a dim dd-node" data-clue="d2">把界面语言改成简体中文，回答保持简洁。</p>
        </div>
      </div>

      <div class="ev-item ev-paper ev-checklist" style="left:30%;top:45%;width:32%;--tilt:-1.5deg">
        <span class="pin-tack ev-tack"></span>
        <div class="ev-paper-head">应用检查单<small>后台 · 近 7 天</small></div>
        <div class="ev-dock">
          <span class="ev-dock-item"><img class="app-ic" src="assets/icons/tax.webp" alt="个税" draggable="false"><small class="dd-node" data-clue="f4">个人所得税 APP · 6 次</small></span>
          <span class="ev-dock-item"><svg class="app-ic"><use href="#i-wechat"/></svg><small class="dd-node" data-clue="f5">微信文件传输助手 → WPS · 23 次</small></span>
          <span class="ev-dock-item dim"><svg class="app-ic"><use href="#i-chrome"/></svg><small class="dd-node" data-clue="d3">Chrome → VS Code · 41 次</small></span>
        </div>
      </div>
    </div>
    <footer><span>证物来源：使用节奏回放</span><b>调休日历必须和当天用量组合判断</b></footer>
  </div>`
}
