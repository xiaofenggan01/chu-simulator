// L2 证物板：联系人登记表 / 银行卡实体 / 支付回执
export function render(root) {
  root.innerHTML = `
  <div class="sim scene-payment">
    <div class="sim-head"><svg class="logo"><use href="#i-logo"/></svg><span class="t">证物板 · 案件 GTG-10087</span><span class="r">账号声明：美国 · 订单 #PRO-6214</span></div>
    <div class="ev-board">
      <div class="ev-item ev-paper" style="left:3%;top:7%;width:33%;--tilt:-2deg">
        <span class="pin-tack ev-tack"></span>
        <div class="ev-paper-head">联系人登记表<small>注册验证资料</small></div>
        <div class="ev-reg">
          <div class="ev-reg-row"><span>手机号码</span><b class="dd-node" data-clue="f1">+86 138 •••• 2716</b></div>
          <div class="ev-reg-row"><span>注册邮箱</span><b class="dd-node" data-clue="f2">max_upgrade@qq.com</b></div>
          <div class="ev-reg-row"><span>联系人姓名</span><b class="dd-node" data-clue="d1">Wei Zhang</b></div>
        </div>
        <div class="ev-paper-foot">姓名只是拼音，哪国华人都可能这么叫</div>
      </div>

      <div class="ev-item ev-bankcard" style="left:46%;top:12%;width:28%;--tilt:1.5deg">
        <span class="pin-tack ev-tack gold"></span>
        <div class="ev-bc-chip"></div>
        <div class="ev-bc-no">6214 83•• •••• 0021</div>
        <div class="ev-bc-meta">
          <span class="dd-node" data-clue="f3"><svg class="ic"><use href="#i-unionpay"/></svg>银联 UnionPay</span>
          <span class="dd-node" data-clue="f4">发卡地区 中国大陆 · 上海</span>
          <span class="dd-node" data-clue="d4">USD 结算</span>
        </div>
        <div class="ev-bc-tag">付款银行卡 · 实体制式</div>
      </div>

      <div class="ev-item ev-paper" style="left:24%;top:46%;width:33%;--tilt:-1deg">
        <span class="pin-tack ev-tack"></span>
        <div class="ev-paper-head">支付回执单<small>本次订阅升级</small></div>
        <div class="ev-reg">
          <div class="ev-reg-row"><span>付款 IP</span><b class="dd-node" data-clue="f5">中国大陆 · 上海</b></div>
          <div class="ev-reg-row"><span>付款钱包</span><b class="dd-node" data-clue="d3">Apple Pay</b></div>
          <div class="ev-reg-row"><span>账单地址</span><b class="dd-node" data-clue="d2">美国邮编 94105 · 已验证</b></div>
        </div>
        <div class="ev-paper-foot">钱包品牌和邮编格式都不构成地区证据</div>
      </div>
    </div>
    <footer><span>证物来源：支付连接记录</span><b>能下结论的是号码、邮箱、银行卡和 IP</b></footer>
  </div>`
}
