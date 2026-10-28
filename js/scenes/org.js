// L4 证物板：接入申请表 / 营业执照 / ICP 备案证书 / 团队工具单
export function render(root) {
  root.innerHTML = `
  <div class="sim scene-org">
    <div class="sim-head"><svg class="logo"><use href="#i-logo"/></svg><span class="t">证物板 · 案件 GTG-10089</span><span class="r">申报总部：新加坡 · 申请 #ORG-4471</span></div>
    <div class="ev-board">
      <div class="ev-item ev-paper" style="left:3%;top:6%;width:31%;--tilt:-2deg">
        <span class="pin-tack ev-tack"></span>
        <div class="ev-paper-head">组织接入申请表<small>ORG ONBOARDING</small></div>
        <div class="ev-reg">
          <div class="ev-reg-row"><span>组织名称</span><b>宇宙科技（新加坡）有限公司</b></div>
          <div class="ev-reg-row"><span>申报总部</span><b>Singapore · 新加坡</b></div>
          <div class="ev-reg-row"><span>申请套餐</span><b class="dd-node" data-clue="d1">团队版 · 217 席位</b></div>
          <div class="ev-reg-row"><span>经办人签字</span><b>Wei Zhang</b></div>
        </div>
        <div class="ev-stamp-ghost">待人工审核</div>
      </div>

      <div class="ev-item ev-paper ev-license" style="left:41%;top:8%;width:29%;--tilt:1.6deg">
        <span class="pin-tack ev-tack gold"></span>
        <div class="ev-license-head">营业执照<small>（副本 · 扫描件）</small></div>
        <div class="ev-license-body">
          <p>统一社会信用代码</p>
          <b class="dd-node" data-clue="f1">91440300MA5F7K2X9Q</b>
          <p>登记机关</p>
          <b class="dd-node" data-clue="f2">深圳市市场监督管理局</b>
        </div>
        <div class="ev-license-seal">营业执照</div>
      </div>

      <div class="ev-item ev-paper" style="left:76%;top:14%;width:21%;--tilt:-1deg">
        <span class="pin-tack ev-tack"></span>
        <div class="ev-paper-head">ICP 备案证书<small>工信部备案系统</small></div>
        <div class="ev-reg">
          <div class="ev-reg-row"><span>网站域名</span><b>yuzhou-tech.com</b></div>
          <div class="ev-reg-row"><span>备案号</span><b class="dd-node" data-clue="f3">粤 ICP 备 2025123456 号</b></div>
        </div>
        <div class="ev-paper-foot">「粤」字开头的备案号，是广东省的身份证</div>
      </div>

      <div class="ev-item ev-paper ev-checklist" style="left:28%;top:45%;width:32%;--tilt:1.2deg">
        <span class="pin-tack ev-tack"></span>
        <div class="ev-paper-head">团队工具检查单<small>申请启用</small></div>
        <div class="ev-dock">
          <span class="ev-dock-item"><img class="app-ic" src="assets/icons/wecom.webp" alt="企业微信" draggable="false"><small class="dd-node" data-clue="f4">企业微信登录 · corp_id ww8f31…</small></span>
          <span class="ev-dock-item"><img class="app-ic" src="assets/icons/dingtalk.webp" alt="钉钉" draggable="false"><small class="dd-node" data-clue="f5">钉钉通讯录同步 · 217 人</small></span>
          <span class="ev-dock-item dim"><svg class="ic ev-dlp"><use href="#i-shield"/></svg><small class="dd-node" data-clue="d2">DLP 企业设备管理</small></span>
        </div>
      </div>
    </div>
    <footer><span>证物来源：组织接入申请</span><b>登记机关、备案号、办公工具，三样对得上才算实锤</b></footer>
  </div>`
}
