export function render(root) {
  root.innerHTML = `
  <div class="sim scene-device scene-workbench">
    <div class="sim-head">
      <svg class="logo"><use href="#i-logo"/></svg>
      <span class="t">设备信息</span>
      <span class="r">设备记录 #7723 · 6 分钟前</span>
    </div>
    <div class="sim-body">
      <div class="scene-baseline">
        <span class="baseline-label">本次检测</span>
        <span><b>来源</b> Claude 网页与 Claude Code</span>
        <span><b>方式</b> 浏览器和设备自动读取</span>
        <span><b>时间</b> 6 分钟前</span>
      </div>

      <section class="work-panel device-matrix">
        <div class="work-panel-head">
          <div><span class="panel-kicker">设备检测</span><b>本次使用中读取到的信息</b></div>
          <span class="capture-status">8 项信息</span>
        </div>
        <div class="matrix-head">
          <span>检查项</span><span>读取方式</span><span>系统读取值</span><span>记录编号</span>
        </div>
        <div class="matrix-row hit" data-k="31">
          <span data-label="检查项">时区</span>
          <span data-label="读取方式">操作系统时间</span>
          <b data-label="系统读取值" class="spot mono">Asia/Shanghai · 中国标准时间（UTC+8）</b>
          <span data-label="记录编号" class="mono sample-code">TZ-02</span>
        </div>
        <div class="matrix-row hit" data-k="34">
          <span data-label="检查项">系统字体</span>
          <span data-label="读取方式">浏览器字体检测</span>
          <b data-label="系统读取值" class="spot font-sample"><i>微软雅黑</i><i>宋体</i><i>MiSans</i><i>HarmonyOS Sans</i></b>
          <span data-label="记录编号" class="mono sample-code">FT-14</span>
        </div>
        <div class="matrix-row hit" data-k="35">
          <span data-label="检查项">系统地区</span>
          <span data-label="读取方式">浏览器地区接口</span>
          <b data-label="系统读取值" class="spot mono">中国大陆 · 地区代码 CN</b>
          <span data-label="记录编号" class="mono sample-code">RG-07</span>
        </div>
        <div class="matrix-row hit" data-k="37">
          <span data-label="检查项">浏览器信息</span>
          <span data-label="读取方式">访问请求</span>
          <b data-label="系统读取值" class="spot mono">Android 14 · 微信浏览器 8.0.49</b>
          <span data-label="记录编号" class="mono sample-code">UA-18</span>
        </div>
        <div class="matrix-row hit" data-k="38">
          <span data-label="检查项">设备型号</span>
          <span data-label="读取方式">设备信息接口</span>
          <b data-label="系统读取值" class="spot mono">华为 Mate 60 Pro</b>
          <span data-label="记录编号" class="mono sample-code">HW-22</span>
        </div>
        <div class="matrix-row hit" data-k="39" data-decoy="1">
          <span data-label="检查项">表情显示样式</span>
          <span data-label="读取方式">画布渲染</span>
          <b data-label="系统读取值" class="spot emoji-sample"><svg viewBox="0 0 24 24" class="emoji-face"><circle cx="12" cy="12" r="10" fill="#f7dd11"/><circle cx="8.5" cy="10" r="1.4"/><circle cx="15.5" cy="10" r="1.4"/><path d="M8 14.5q4 3 8 0" stroke="#000" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg> 第 8 种样式</b>
          <span data-label="记录编号" class="mono sample-code">EM-08</span>
        </div>
        <div class="matrix-row hit" data-k="43" data-decoy="1">
          <span data-label="检查项">屏幕分辨率</span>
          <span data-label="读取方式">浏览器屏幕接口</span>
          <b data-label="系统读取值" class="spot mono">2400 × 1080</b>
          <span data-label="记录编号" class="mono sample-code">SC-03</span>
        </div>
        <div class="matrix-row hit" data-k="33" data-decoy="1">
          <span data-label="检查项">外观模式</span>
          <span data-label="读取方式">浏览器显示设置</span>
          <b data-label="系统读取值" class="spot mono">深色模式</b>
          <span data-label="记录编号" class="mono sample-code">UI-01</span>
        </div>
      </section>
    </div>
    <footer><span>检查进度：8 / 8</span><b>点击可疑信息立即判断</b></footer>
  </div>`
}
