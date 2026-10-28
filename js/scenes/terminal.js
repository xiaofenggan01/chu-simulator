// L5 证物板：settings.json 打印件 / 终端输出纸 / 屏幕快照
export function render(root) {
  root.innerHTML = `
  <div class="sim scene-terminal">
    <div class="sim-head"><svg class="logo"><use href="#i-logo"/></svg><span class="t">证物板 · 案件 GTG-10090</span><span class="r">终局 · Claude Code 环境</span></div>
    <div class="ev-board">
      <div class="ev-item ev-paper ev-code" style="left:3%;top:6%;width:40%;--tilt:-1.8deg">
        <span class="pin-tack ev-tack gold"></span>
        <div class="ev-paper-head">settings.json<small>项目配置 · 打印件</small></div>
        <pre class="ev-code-body"><code>{
  "npm_registry": <b class="dd-node" data-clue="f1">"https://registry.npmmirror.com"</b>,
  "pip_index": <b class="dd-node" data-clue="f2">"https://pypi.tuna.tsinghua.edu.cn/simple"</b>,
  "maven_mirror": <b class="dd-node" data-clue="f3">"https://mirrors.aliyun.com/maven"</b>,
  "comment_style": <b class="dd-node" data-clue="d4">"english-only"</b>
}</code></pre>
        <div class="ev-paper-foot">注释语言只是习惯，下载源才是户口本</div>
      </div>

      <div class="ev-item ev-term" style="left:50%;top:10%;width:31%;--tilt:1.4deg">
        <span class="pin-tack ev-tack"></span>
        <div class="ev-term-bar"><i class="r"></i><i class="y"></i><i class="g"></i><span>zsh — mall-admin</span></div>
        <pre class="ev-term-body">$ npm install
<span class="dim">项目依赖下载缓慢，正在读取镜像设置…</span>
registry: <b class="dd-node" data-clue="f1">registry.npmmirror.com</b>
重试 <b class="dd-node" data-clue="d2">3 次</b> · 本地代理 <b class="dd-node" data-clue="d3">127.0.0.1:7890</b>
工作目录 <b class="dd-node" data-clue="d1">~/毕业论文最终版</b></pre>
      </div>

      <div class="ev-item ev-snap" style="left:38%;top:46%;width:24%;--tilt:-1.2deg">
        <span class="pin-tack ev-tack"></span>
        <div class="ev-snap-img">
          <div class="ev-snap-term">
            <div class="ev-snap-line">$ git remote -v</div>
            <div class="ev-snap-line ok dd-node" data-clue="f4">origin  https://gitee.com/yuzhou/mall-admin.git</div>
            <div class="ev-snap-line">$ _</div>
          </div>
        </div>
        <div class="ev-pola-caption">屏幕快照 · git remote</div>
      </div>
    </div>
    <footer><span>证物来源：Claude Code 环境读取</span><b>目录名、重试次数、本地代理都不是地区证据</b></footer>
  </div>`
}
