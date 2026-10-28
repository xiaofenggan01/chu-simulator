export function render(root) {
  root.innerHTML = `
  <div class="sim scene-network scene-workbench">
    <div class="sim-head">
      <svg class="logo"><use href="#i-logo"/></svg>
      <span class="t">网络检查台</span>
      <span class="r">第 4 次连接 · 近 30 天</span>
    </div>
    <div class="sim-body">
      <div class="scene-baseline">
        <span class="baseline-label">账号与账单设置</span>
        <span><b>账单地区</b> 美国 · 加利福尼亚</span>
        <span><b>账号时区</b> 美国西部时间（UTC-8）</span>
        <span><b>最近登录地区</b> 新加坡</span>
      </div>

      <div class="network-workbench">
        <section class="work-panel route-panel">
          <div class="work-panel-head">
            <div><span class="panel-kicker">本次连接</span><b>网络经过的地区</b></div>
            <span class="capture-status">记录时间 18:42:06</span>
          </div>
          <div class="route-stack">
            <div class="route-hop">
              <span class="route-index">01</span>
              <div><b>浏览器</b><small>Chrome 134 · 加密连接</small></div>
              <span class="route-latency">0 ms</span>
            </div>
            <div class="route-hop hit" data-k="17">
              <span class="route-index">02</span>
              <div><b class="spot mono">116.226.74.19</b><small>中国电信 · 上海</small></div>
              <span class="route-latency">7 ms</span>
            </div>
            <div class="route-hop hit" data-k="8">
              <span class="route-index">03</span>
              <div><b>香港代理服务器</b><small class="spot mono">47 人正在共用</small></div>
              <span class="route-latency">42 ms</span>
            </div>
            <div class="route-hop hit" data-k="7">
              <span class="route-index">04</span>
              <div><b>东京数据中心</b><small class="spot mono">Amazon 服务器网络</small></div>
              <span class="route-latency">91 ms</span>
            </div>
            <div class="route-hop hit" data-k="201">
              <span class="route-index">05</span>
              <div><b>新加坡住宅网络</b><small class="spot mono">新加坡 · 家庭宽带</small></div>
              <span class="route-latency">116 ms</span>
            </div>
            <div class="route-hop">
              <span class="route-index">06</span>
              <div><b>Anthropic 服务</b><small>连接成功</small></div>
              <span class="route-latency">129 ms</span>
            </div>
          </div>
        </section>

        <section class="work-panel network-observations">
          <div class="work-panel-head">
            <div><span class="panel-kicker">交叉核对</span><b>其他连接记录</b></div>
            <span class="panel-count">6 条记录</span>
          </div>
          <div class="observation-row hit" data-k="15">
            <span>实际连接地区</span>
            <div class="spot compact-records">
              <span><small>网页连接</small><b>新加坡</b></span>
              <span><small>浏览器直接连接</small><b>中国 · 116.226.x</b></span>
              <span><small>域名查询</small><b>中国 · 中国电信</b></span>
            </div>
          </div>
          <div class="observation-row hit" data-k="9">
            <span>30 天登录地区</span>
            <div class="ip-sequence spot mono"><i>美国 1</i><i>美国 2</i><i>新加坡</i><i>日本</i><i>新加坡</i></div>
          </div>
          <div class="observation-row hit activity-record" data-k="202">
            <span>24 小时使用时间</span>
            <div class="spot activity-chart" aria-label="北京时间 09 至 18 点活跃">
              <div class="activity-hours">${Array.from({ length: 24 }, (_, i) => `<i class="${i >= 9 && i < 18 ? 'busy' : ''}" style="--v:${i >= 9 && i < 18 ? 7 + (i % 3) : 1 + (i % 2)}"></i>`).join('')}</div>
              <small><span>00</span><b>北京时间 · 09—18</b><span>24</span></small>
            </div>
          </div>
          <div class="observation-row hit" data-k="12" data-decoy="1">
            <span>出差记录</span><b class="spot mono">旧金山 ⇄ 新德里 · 周三—周一</b>
          </div>
          <div class="observation-row hit" data-k="11" data-decoy="1">
            <span>代理网络</span><b class="spot mono">NordVPN · 始终开启</b>
          </div>
          <div class="observation-row hit" data-k="14" data-decoy="1">
            <span>客服网站</span><b class="spot mono">intercom.com · 未使用代理</b>
          </div>
        </section>
      </div>
    </div>
    <footer><span>连接记录：完整</span><b>点击可疑信息立即判断</b></footer>
  </div>`
}
