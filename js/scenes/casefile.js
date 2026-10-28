export function render(root) {
  root.innerHTML = `
  <div class="sim scene-casefile scene-workbench">
    <div class="sim-head"><svg class="logo"><use href="#i-logo"/></svg><span class="t">Claude Project 文件检查</span><span class="r">项目：研究生申请材料 · 7 个文件</span></div>
    <div class="sim-body">
      <div class="scene-baseline"><span class="baseline-label">项目文件</span><span><b>账号地区</b> 加拿大</span><span><b>用途</b> 整理申请资料</span><span><b>状态</b> Claude 正在读取文件名</span></div>
      <div class="project-shell">
        <aside class="project-sidebar">
          <div class="project-title"><span>P</span><div><b>研究生申请材料</b><small>Project knowledge</small></div></div>
          <button type="button">＋ 添加内容</button>
          <div class="project-nav"><b>项目文件</b><span>自定义指令</span><span>最近对话</span></div>
        </aside>
        <section class="project-files">
          <div class="project-files-head"><div><b>项目知识</b><span>Claude 可在对话中使用这些文件</span></div><span>7 个文件</span></div>
          <div class="file-grid">
            <div class="file-card hit" data-k="81"><span class="spot"><i>PDF</i><b>教育部学历证书电子注册备案表.pdf</b><small>来源：学信网</small></span></div>
            <div class="file-card hit" data-k="83"><span class="spot"><i>PDF</i><b>全国大学英语六级考试成绩单.pdf</b><small>成绩证明</small></span></div>
            <div class="file-card hit" data-k="84"><span class="spot"><i>PDF</i><b>全国硕士研究生招生考试准考证.pdf</b><small>考试材料</small></span></div>
            <div class="file-card hit" data-k="85"><span class="spot"><i>RIS</i><b>中国知网导出参考文献.ris</b><small>文献列表</small></span></div>
            <div class="file-card hit" data-k="86"><span class="spot"><i>DOC</i><b>国家自然科学基金申请书.docx</b><small>研究计划</small></span></div>
            <div class="file-card hit" data-k="87" data-decoy="1"><span class="spot"><i>PDF</i><b>arXiv 论文预印本.pdf</b><small>公开论文</small></span></div>
            <div class="file-card hit" data-k="82" data-decoy="1"><span class="spot"><i>TXT</i><b>ORCID researcher profile.txt</b><small>研究者资料</small></span></div>
          </div>
        </section>
      </div>
    </div>
    <footer><span>项目文件：7 / 7</span><b>找出中国大陆特有的教育与科研材料</b></footer>
  </div>`
}
