const LEVEL_DEFINITIONS = [
  {
    key: 'chat', name: '人在美国，刚下高铁', status: 'ready',
    chapter: '第一案 · 会话露馅',
    caseNo: 'GTG-10086',
    sceneIntro: '账号地区写着美国，用户却让 Claude 安排一趟“明天到上海办事”的行程。',
    stakes: '从真实会话里找出 4 处中国大陆本地生活痕迹。中文回复和中文界面不算。',
    twist: '剧情升级：这不是旅游攻略，用户明天就要拿着居住证材料去上海办事。',
    punchline: '人在美国，刚下高铁。账号资料还能嘴硬，12306 订单不会。',
    praise: '好眼力。他嘴上是加州居民，12306 说他是常旅客。所谓『绝大多数滥用』，原来是绝大多数车票。',
    objective: '阅读 Claude 会话，找出 4 处中国大陆本地生活线索。',
    suspect: { handle: 'liming_dev', since: '最近会话 · 今天 14:26', org: '账号地区：美国' },
    clues: [45, 46, 75, 47],
    decoys: [112, 113, 115, 116],
    decoyNotes: {
      112: '使用中文回复只代表语言偏好，世界各地的用户都可能这样设置。',
      113: '简体中文界面只是软件设置，不能判断用户当前在哪里。',
      115: '查天气预报只说明用户在意某个城市，不代表他住在那里。',
      116: '写项目周报是全世界通用的职场习惯，不能据此判断用户所在地。',
    },
    brief: {
      tag: '案件 01 · 会话找茬',
      title: '人在美国，刚下高铁',
      note: '账号地区写着美国。在会话、相册和后台应用里尽可能多地取证，然后上推理板连线推导。',
    },
    deduc: {
      goal: '连出「用户人在中国大陆」',
      groups: [
        { name: '会话记录', items: ['f1','f2','f3','f4','d3','d4'], box: [3, 4, 44, 58] },
        { name: '手机相册', items: ['f5','f6','f7'], box: [52, 4, 45, 40] },
        { name: '账号偏好', items: ['d1','d2'], box: [52, 52, 45, 26] },
      ],
      facts: [
        { id: 'f1', label: '12306 订单', detail: '明天 G1372 次，购于 12306' },
        { id: 'f2', label: '到达虹桥', detail: '下午到上海虹桥站' },
        { id: 'f3', label: '居住证材料', detail: '上海居住证积分申请材料清单' },
        { id: 'f4', label: '社保公积金', detail: '近一年社保和住房公积金缴纳记录' },
        { id: 'f5', label: '站台照片', detail: '相册里的高铁站台照片' },
        { id: 'f6', label: '拍摄时间', detail: 'EXIF：今晚 21:47' },
        { id: 'f7', label: '拍摄定位', detail: 'EXIF：上海虹桥站 P9' },
      ],
      decoys: [
        { id: 'd1', label: '中文回复', detail: '使用中文回复只是语言偏好' },
        { id: 'd2', label: '中文界面', detail: '简体中文界面只是设置' },
        { id: 'd3', label: '查天气', detail: '查上海天气不代表住在上海' },
        { id: 'd4', label: '项目周报', detail: '全世界职场都写周报' },
      ],
      combos: [
        { a: 'f5', b: 'f7', out: { id: 's1', label: '近期到过虹桥', detail: '照片定位显示人就站在虹桥站' } },
        { a: 'f1', b: 'f2', out: { id: 's2', label: '明天抵沪', detail: '明天下午乘 G1372 抵达上海' } },
        { a: 's1', b: 's2', out: { id: 's3', label: '高频往返上海', detail: '刚离开又要回去，往返是常态' } },
        { a: 's3', b: 'f3', out: { id: 's4', label: '在沪办理居住事务', detail: '往返之外还在办上海居住证积分' } },
        { a: 's4', b: 'f4', out: { id: 'SOLVED', label: '用户人在中国大陆', detail: '居住证 + 社保公积金 = 生活重心在中国大陆' }, final: true },
      ],
    },
  },
  {
    key: 'payment', name: '美区账号，银联付款', status: 'ready',
    chapter: '第二案 · 付款露馅',
    caseNo: 'GTG-10087',
    sceneIntro: '一个美区个人账号正在升级订阅，联系人和付款链路却全部指向中国大陆。',
    stakes: '从注册联系人和本次付款中找出 5 处直接地区证据。姓名、美元和 Apple Pay 不算。',
    twist: '剧情升级：美区账单地址还在坚持，+86 手机和上海付款 IP 已经先投降。',
    punchline: '嘴上是美区账号，付款时银联卡第一个举手。',
    praise: '我保证，银联卡比他的账号地区诚实。这句我打包票，比国会听证会还保真。',
    objective: '检查联系人、银行卡和付款连接，找出 5 处中国大陆线索。',
    suspect: { handle: 'max_upgrader', since: '订阅升级 · 11 小时前', org: '账号地区：美国' },
    clues: [103, 105, 19, 18, 22],
    decoys: [106, 25, 24, 30],
    decoyNotes: {
      106: '拼音姓名在很多国家和地区都会使用，不能单独判断用户所在地。',
      25: '邮编验证通过只说明账单地址格式正确，不代表用户真的在美国。',
      24: 'Apple Pay 是全球支付工具，使用它不能判断用户来自哪里。',
      30: '美元是订单结算币种，不是用户所在地证据。',
    },
    brief: {
      tag: '案件 02 · 支付找茬',
      title: '美区账号，银联付款',
      note: '账号地区写着美国。从联系人登记表、银行卡和支付回执里取证，再上推理板连线。',
    },
    deduc: {
      goal: '连出「用户人在中国大陆」',
      groups: [
        { name: '联系人', items: ['f1','f2','d1'], box: [3, 4, 30, 52] },
        { name: '银行卡', items: ['f3','f4','d4'], box: [36, 4, 30, 52] },
        { name: '支付回执', items: ['f5','d2','d3'], box: [69, 4, 28, 52] },
      ],
      facts: [
        { id: 'f1', label: '+86 手机号', detail: '注册手机号 +86 138••••2716' },
        { id: 'f2', label: 'QQ 邮箱', detail: '注册邮箱 max_upgrade@qq.com' },
        { id: 'f3', label: '银联卡组织', detail: '付款卡为银联 UnionPay 借记卡' },
        { id: 'f4', label: '发卡地上海', detail: '发卡地区：中国大陆 · 上海' },
        { id: 'f5', label: '付款 IP 上海', detail: '本次付款 IP 位于上海' },
      ],
      decoys: [
        { id: 'd1', label: '拼音姓名', detail: 'Wei Zhang 全球华人都可能叫' },
        { id: 'd2', label: '邮编已验证', detail: '账单地址格式正确≠人在美国' },
        { id: 'd3', label: 'Apple Pay', detail: '全球支付工具，说明不了地区' },
        { id: 'd4', label: '美元结算', detail: '订单币种而已' },
      ],
      combos: [
        { a: 'f1', b: 'f2', out: { id: 's1', label: '注册方式在大陆', detail: '手机号和邮箱服务都指向中国大陆' } },
        { a: 'f3', b: 'f4', out: { id: 's2', label: '付款卡来自大陆', detail: '银联卡，上海发卡' } },
        { a: 's1', b: 's2', out: { id: 's3', label: '注册与付款同源', detail: '账号注册和实际付款都指向大陆' } },
        { a: 's3', b: 'f5', out: { id: 'SOLVED', label: '用户人在中国大陆', detail: '注册、银行卡、付款 IP 三线合一' }, final: true },
      ],
    },
  },
  {
    key: 'behavior', name: '周日怎么还在上班', status: 'ready',
    chapter: '第三案 · 调休不会说谎',
    caseNo: 'GTG-10088',
    sceneIntro: '系统发现账号在一个周日高强度工作，但普通周末登录本身并不能说明问题。',
    stakes: '把中国调休日历与当天用量组合判断，再找出 3 处大陆办事和软件使用痕迹。',
    twist: '剧情升级：日历写着国庆调休补班，使用曲线也从早亮到晚。',
    punchline: '人可以忘记今天星期几，调休日历和九小时用量不会串供。',
    praise: '调休补班都能被你抓到。我的风控模型都该来听你讲课——它们只会数 IP。',
    objective: '找出调休组合证据，以及 3 处中国大陆办事或软件使用痕迹。',
    suspect: { handle: 'pinche_09', since: '最近 30 天 · 行为回放', org: '账号地区：美国' },
    clues: [{ id: 60, combo: [203, 204] }, 57, 58, 59],
    decoys: [61, 113, 72],
    decoyNotes: {
      61: '普通周末偶尔登录很常见，不能据此判断用户所在地。',
      113: '简体中文界面只是语言偏好，不是地区证据。',
      72: 'Chrome 和 Visual Studio Code 是全球通用软件。',
    },
    brief: {
      tag: '案件 03 · 行为找茬',
      title: '周日怎么还在上班',
      note: '从考勤报表、日历、提问记录和应用检查单里取证，再上推理板连线。',
    },
    deduc: {
      goal: '连出「用户人在中国大陆」',
      groups: [
        { name: '日历与用量', items: ['f1','f2','d1'], box: [3, 4, 30, 52] },
        { name: '提问记录', items: ['f3','d2'], box: [36, 4, 30, 40] },
        { name: '应用活动', items: ['f4','f5','d3'], box: [69, 4, 28, 52] },
      ],
      facts: [
        { id: 'f1', label: '国庆调休补班', detail: '9/28 周日按工作日安排（调休）' },
        { id: 'f2', label: '周日在线 9.4h', detail: '09:02—19:18 持续使用' },
        { id: 'f3', label: '电子专票报销', detail: '核对发票抬头与纳税人识别号' },
        { id: 'f4', label: '个税 APP', detail: '打开“专项附加扣除信息表”' },
        { id: 'f5', label: '微信传文件', detail: '文件传输助手 → WPS 编辑文档' },
      ],
      decoys: [
        { id: 'd1', label: '普通周日', detail: '10/12 晚间登录 18 分钟，谁都可能' },
        { id: 'd2', label: '中文界面', detail: '语言偏好不是地区证据' },
        { id: 'd3', label: 'Chrome/VSCode', detail: '全球通用开发软件' },
      ],
      combos: [
        { a: 'f1', b: 'f2', out: { id: 's1', label: '调休日全天办公', detail: '调休补班那天整整在线 9.4 小时' } },
        { a: 's1', b: 'f3', out: { id: 's2', label: '大陆报销流程', detail: '调休办公之外还在处理增值税电子专票' } },
        { a: 's2', b: 'f4', out: { id: 's3', label: '大陆税务体系', detail: '报销之外还在个税 APP 里操作扣除表' } },
        { a: 's3', b: 'f5', out: { id: 'SOLVED', label: '用户人在中国大陆', detail: '调休、专票、个税、微信办公——生活与工作都在大陆' }, final: true },
      ],
    },
  },
  {
    key: 'org', name: '新加坡公司，粤 ICP 备案', status: 'ready',
    chapter: '第四案 · 公司露馅',
    caseNo: 'GTG-10089',
    sceneIntro: '一家申报总部在新加坡的公司申请团队账号，企业资料却像从深圳办事大厅直接导出。',
    stakes: '在尚未通过的申请中找出 5 处中国大陆企业身份和团队工具证据。',
    twist: '剧情升级：新加坡总部还没找到，深圳登记机关和粤 ICP 已经完成会师。',
    punchline: '公司地址在新加坡，ICP备案却熟练地报出了”粤”。',
    praise: '「新加坡总部」的墨迹还没干，粤 ICP 已经替它全招了。我保证，章比人诚实。',
    objective: '检查企业资料、网站备案和团队工具，找出 5 处中国大陆组织线索。',
    suspect: { handle: '宇宙科技（新加坡）', since: '接入申请 · 等待人工审核', org: '团队账号尚未开通' },
    clues: [51, 52, 55, 56, 54],
    decoys: [67, 44],
    decoyNotes: {
      67: '团队席位数量只代表公司规模，不能判断注册地。',
      44: '企业设备管理和数据防泄漏工具在各国公司都很常见。',
    },
    brief: {
      tag: '案件 04 · 组织找茬',
      title: '新加坡公司，粤 ICP 备案',
      note: '从申请表、营业执照、备案证书和团队工具单里取证，再上推理板连线。',
    },
    deduc: {
      goal: '连出「运营主体在中国大陆」',
      groups: [
        { name: '接入申请', items: ['d1'], box: [3, 4, 22, 42] },
        { name: '营业执照', items: ['f1','f2'], box: [27, 4, 27, 42] },
        { name: 'ICP 备案', items: ['f3'], box: [57, 4, 20, 42] },
        { name: '团队工具', items: ['f4','f5','d2'], box: [79, 4, 18, 54] },
      ],
      facts: [
        { id: 'f1', label: '统一信用代码', detail: '91440300MA5F7K2X9Q' },
        { id: 'f2', label: '深圳登记机关', detail: '深圳市市场监督管理局' },
        { id: 'f3', label: '粤 ICP 备案', detail: '粤 ICP 备 2025123456 号' },
        { id: 'f4', label: '企业微信登录', detail: '绑定 corp_id：ww8f31…' },
        { id: 'f5', label: '钉钉通讯录', detail: '同步 217 名成员' },
      ],
      decoys: [
        { id: 'd1', label: '217 个席位', detail: '团队规模说明不了注册地' },
        { id: 'd2', label: 'DLP 管理', detail: '企业设备管理各国公司都在用' },
      ],
      combos: [
        { a: 'f1', b: 'f2', out: { id: 's1', label: '企业注册在深圳', detail: '统一社会信用代码 + 深圳市监局登记' } },
        { a: 's1', b: 'f3', out: { id: 's2', label: '网站备案在广东', detail: '公司注册深圳，域名备案也是粤 ICP' } },
        { a: 's2', b: 'f4', out: { id: 's3', label: '团队用大陆工具', detail: '企业微信登录已经接入' } },
        { a: 's3', b: 'f5', out: { id: 'SOLVED', label: '运营主体在中国大陆', detail: '注册、备案、办公工具三线合一，「新加坡总部」只是说法' }, final: true },
      ],
    },
  },
  {
    key: 'terminal', name: 'npm 换源，当场抓获', status: 'ready',
    chapter: '终局 · 开发环境自爆',
    caseNo: 'GTG-10090',
    sceneIntro: 'Claude Code 刚打开项目设置，四个下载源和代码仓库排队报出了自己的来历。',
    stakes: '在开发环境中找出 4 个中国大陆常用服务。中文目录、重试次数和本地代理不算。',
    twist: '终局升级：npm、PyPI、Maven 三路换源，最后连 Git 仓库也落在 Gitee。',
    punchline: '项目可以叫 mall-admin，下载源却把户口本摊在了终端里。',
    praise: '全找到了。npm 换源那一刻，他就知道自己完了。我保证，这事 H100 都救不回来。',
    objective: '查看 Claude Code 设置，找出 4 个中国大陆常用下载源或代码托管服务。',
    suspect: { handle: 'mall-admin', since: 'Claude Code · 设置预览', org: '账号地区：美国' },
    clues: [32, 4, 5, 16],
    decoys: [78, 62, 36, 114],
    decoyNotes: {
      78: '中文目录名只反映命名习惯，不能判断用户所在地区。',
      62: '下载重试是普通网络现象，世界各地都会发生。',
      36: '127.0.0.1 是本机地址，本地代理本身不能证明用户所在地区。',
      114: '英文注释只是编码习惯，不能判断用户所在地区。',
    },
    brief: {
      tag: '案件 05 · 终局找茬',
      title: 'npm 换源，当场抓获',
      note: '从 settings.json 打印件、终端输出和屏幕快照里取证，再上推理板连线。',
    },
    deduc: {
      goal: '连出「开发环境自报家门」',
      groups: [
        { name: '项目配置', items: ['f1','f2','f3','d4'], box: [3, 4, 40, 58] },
        { name: '终端输出', items: ['d1','d2','d3'], box: [46, 4, 29, 54] },
        { name: '代码仓库', items: ['f4'], box: [78, 4, 19, 42] },
      ],
      facts: [
        { id: 'f1', label: 'npmmirror', detail: 'npm 源：registry.npmmirror.com' },
        { id: 'f2', label: '清华 PyPI', detail: 'pip 源：pypi.tuna.tsinghua.edu.cn' },
        { id: 'f3', label: '阿里云 Maven', detail: 'maven 源：mirrors.aliyun.com' },
        { id: 'f4', label: 'Gitee 仓库', detail: 'git remote 指向 gitee.com' },
      ],
      decoys: [
        { id: 'd1', label: '中文目录名', detail: '~/毕业论文最终版 只是命名习惯' },
        { id: 'd2', label: '重试 3 次', detail: '网络差到处都有' },
        { id: 'd3', label: '本地代理', detail: '127.0.0.1:7890 是本机地址' },
        { id: 'd4', label: '英文注释', detail: '编码习惯不是地区证据' },
      ],
      combos: [
        { a: 'f1', b: 'f2', out: { id: 's1', label: '依赖源换大陆', detail: 'npm 和 pip 都走大陆镜像' } },
        { a: 's1', b: 'f3', out: { id: 's2', label: '全家桶都换源', detail: '连 Maven 也指着阿里云' } },
        { a: 's2', b: 'f4', out: { id: 'SOLVED', label: '开发环境自报家门', detail: '镜像源 + Gitee 仓库，终端把户口本摊开了' }, final: true },
      ],
    },
  },
]

export const LEVEL_GROUPS = [
  {
    key: 'cases',
    name: '五个高能案件',
    note: '五关使用同一套找茬规则，证据从生活会话一路升级到开发环境。',
    levels: ['chat', 'payment', 'behavior', 'org', 'terminal'],
  },
]

const LEVEL_BY_KEY = new Map(LEVEL_DEFINITIONS.map(level => [level.key, level]))

export const LEVELS = LEVEL_GROUPS
  .flatMap(group => group.levels.map(key => ({
    ...LEVEL_BY_KEY.get(key),
    group: group.key,
    groupName: group.name,
  })))
  .map((level, index) => ({ ...level, n: index + 1 }))

export const BAN_LETTER = {
  from: 'Safeguards Team &lt;no-reply@anthropic.com&gt;',
  subject: 'Your account has been disabled',
  en: 'An internal investigation of suspicious signals associated with your account indicates a violation of our Usage Policy. As a result, your account has been disabled and access to Claude has been revoked.',
  zh: '我们检查了与你账号有关的异常信息，确认账号违反了使用政策。因此账号已被停用，无法继续访问 Claude。',
}
