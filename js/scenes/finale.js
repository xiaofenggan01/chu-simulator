export function render(root) {
  root.innerHTML = `
  <div class="sim scene-finale scene-workbench">
    <div class="sim-head"><svg class="logo"><use href="#i-logo"/></svg><span class="t">当前会话上下文</span><span class="r">最终关 · 实时读取</span></div>
    <div class="sim-body">
      <div class="scene-baseline"><span class="baseline-label">最终审核</span><span><b>账号地区</b> 美国</span><span><b>当前请求</b> 安排今晚的个人事务</span><span><b>审核结果</b> 待你判断</span></div>
      <div class="finale-workbench">
        <section class="work-panel live-request-panel">
          <div class="work-panel-head"><div><span class="panel-kicker">用户刚刚发送</span><b>帮我安排今晚的事情</b></div><span class="capture-status">Claude 正在读取上下文</span></div>
          <div class="request-bubble">结合我刚才打开的应用和通知，按时间顺序列一个今晚的待办清单。</div>
        </section>
        <section class="work-panel context-panel">
          <div class="work-panel-head"><div><span class="panel-kicker">可用上下文</span><b>当前打开的应用与通知</b></div><span class="panel-count">9 项</span></div>
          <div class="context-grid">
            <div class="context-item hit" data-k="69"><span class="spot"><i class="context-icon map">高德</i><div><b>高德地图</b><small>驾车去北京市朝阳区望京</small></div></span></div>
            <div class="context-item hit" data-k="74"><span class="spot"><i class="context-icon meituan">美团</i><div><b>美团外卖</b><small>订单预计 19:10 送达</small></div></span></div>
            <div class="context-item hit" data-k="88"><span class="spot"><i class="context-icon cainiao">菜鸟</i><div><b>菜鸟驿站</b><small>取件码 3-2-4081</small></div></span></div>
            <div class="context-item hit" data-k="89"><span class="spot"><i class="context-icon didi">滴滴</i><div><b>滴滴出行</b><small>18:35 前往望京 SOHO</small></div></span></div>
            <div class="context-item hit" data-k="90"><span class="spot"><i class="context-icon traffic">交管</i><div><b>交管 12123</b><small>车辆年检提醒</small></div></span></div>
            <div class="context-item hit" data-k="93"><span class="spot"><i class="context-icon health">医保</i><div><b>国家医保服务平台</b><small>医保电子凭证待使用</small></div></span></div>
            <div class="context-item hit" data-k="92" data-decoy="1"><span class="spot"><i class="context-icon spotify">S</i><div><b>Spotify</b><small>继续播放每日推荐</small></div></span></div>
            <div class="context-item hit" data-k="96" data-decoy="1"><span class="spot"><i class="context-icon github">GH</i><div><b>GitHub</b><small>2 个 Pull Request 待查看</small></div></span></div>
            <div class="context-item hit" data-k="97" data-decoy="1"><span class="spot"><i class="context-icon slack">S</i><div><b>Slack</b><small>设计频道有 4 条新消息</small></div></span></div>
          </div>
        </section>
      </div>
    </div>
    <footer><span>最终审核：尚未作出处置</span><b>找出只在中国大陆生活场景中出现的应用与服务</b></footer>
  </div>`
}
