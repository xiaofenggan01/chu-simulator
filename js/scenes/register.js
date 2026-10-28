export function render(root) {
  root.innerHTML = `
  <div class="sim scene-register scene-workbench">
    <div class="sim-head">
      <svg class="logo"><use href="#i-logo"/></svg>
      <span class="t">注册资料</span>
      <span class="r">注册记录 · 47 分钟前</span>
    </div>
    <div class="sim-body">
      <div class="register-workbench">
        <section class="work-panel identity-panel">
          <div class="work-panel-head">
            <div><span class="panel-kicker">身份信息</span><b>用户填写的注册资料</b></div>
            <span class="capture-status">第 3 / 3 步</span>
          </div>
          <div class="form-record"><span>手机号</span><b class="mono"><span class="hit" data-k="103"><span class="spot">+86</span></span> 138 0013 8000</b><i>短信验证</i></div>
          <div class="form-record"><span>法定姓名</span><b class="mono hit" data-k="106" data-decoy="1"><span class="spot">Wei Zhang</span></b><i>账单姓名</i></div>
          <div class="form-record"><span>邮箱</span><b class="mono">zhangwei2008@<span class="hit" data-k="105"><span class="spot">qq.com</span></span></b><i>已验证</i></div>
          <div class="form-record"><span>国家或地区</span><b>美国</b><i>已选择</i></div>
        </section>
        <section class="work-panel verification-panel">
          <div class="work-panel-head">
            <div><span class="panel-kicker">身份验证</span><b>系统收到的证件资料</b></div>
            <span class="capture-status">已读取</span>
          </div>
          <div class="verification-summary">
            <span>证件类型</span><b>居民身份证</b>
            <span>签发地区</span><b class="hit" data-k="100"><span class="spot">中国大陆</span></b>
            <span>验证结果</span><b>地区不受支持</b>
            <span>验证状态</span><b class="hit" data-k="110" data-decoy="1"><span class="spot">已完成</span></b>
          </div>
        </section>
      </div>
    </div>
    <footer><span>注册资料：只读</span><b>点击可疑信息立即判断</b></footer>
  </div>`
}
