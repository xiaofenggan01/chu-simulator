// L1 证物板场景：软木板上钉着对话打印件 / 拍立得 / 设备检查单，点击收集
export function render(root) {
  root.innerHTML = `
  <div class="sim scene-chat">
    <div class="sim-head"><svg class="logo"><use href="#i-logo"/></svg><span class="t">证物板 · 案件 GTG-10086</span><span class="r">账号声明：美国 · 调取时间 今天 14:26</span></div>
    <div class="ev-board">
      <div class="ev-item ev-paper" style="left:3%;top:6%;width:46%;--tilt:-2.2deg">
        <span class="pin-tack ev-tack"></span>
        <div class="ev-paper-head">会话打印件 · 整理明天的行程<small>用户 ↔ Claude</small></div>
        <div class="ev-talk">
          <p class="u">帮我整理明天的行程。我在 <b class="dd-node" data-clue="f1">12306 上买了 G1372 次车票</b>，下午到 <b class="dd-node" data-clue="f2">上海虹桥站</b>。别排太紧，下车还要办事。</p>
          <p class="a">可以。我会按出发、到达和后续事项整理。到站后还有需要办理的事情吗？</p>
          <p class="u">有。列一份 <b class="dd-node" data-clue="f3">上海居住证积分申请材料</b>清单，再提醒我下载近一年的 <b class="dd-node" data-clue="f4">社保和住房公积金缴纳记录</b>。材料少一份又要白跑。</p>
          <p class="u">顺便查一下 <b class="dd-node" data-clue="d3">明天上海的天气</b>，怕下雨。</p>
          <p class="a dim">（历史会话：修改项目周报 · 昨天 —— <b class="dd-node" data-clue="d4">修改项目周报</b>）</p>
        </div>
        <div class="ev-paper-foot">账号偏好：回复语言 <b class="dd-node" data-clue="d1">中文</b> · 界面语言 <b class="dd-node" data-clue="d2">简体中文</b></div>
      </div>

      <div class="ev-item ev-polaroid" style="left:56%;top:8%;width:26%;--tilt:1.8deg">
        <span class="pin-tack ev-tack gold"></span>
        <div class="ev-pola-img"><img class="dd-node" data-clue="f5" src="assets/photo-hongqiao.webp" alt="站台照片" draggable="false"></div>
        <div class="ev-pola-caption">相册最新一张</div>
        <div class="ev-exif">
          <span class="dd-node" data-clue="f6"><b>时间</b>今晚 21:47</span>
          <span class="dd-node" data-clue="f7"><b>定位</b>虹桥站 P9</span>
        </div>
      </div>

      <div class="ev-item ev-paper ev-checklist" style="left:52%;top:46%;width:32%;--tilt:-1.2deg">
        <span class="pin-tack ev-tack"></span>
        <div class="ev-paper-head">设备检查单<small>后台运行 · 最近 24 小时</small></div>
        <div class="ev-dock">
          <span class="ev-dock-item"><svg class="app-ic"><use href="#i-wechat"/></svg><small>微信 · 常驻</small></span>
          <span class="ev-dock-item"><svg class="app-ic"><use href="#i-chrome"/></svg><small>Chrome</small></span>
          <span class="ev-dock-item dim"><span class="app-ic dd-app-tile">12306</span><small>未在后台</small></span>
        </div>
        <div class="ev-paper-foot">点击证物上的高亮文字即可取证</div>
      </div>
    </div>
    <footer><span>证物来源：账号数据调取</span><b>有用的没用的都收，凑齐再上推理板</b></footer>
  </div>`
}
