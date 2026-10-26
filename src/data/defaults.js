export const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const emptyResume = () => ({
  version: 1,
  profile: {
    name: '',
    title: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    summary: '',
  },
  experience: [],
  projects: [],
  education: [],
  skills: [],
  jobDescription: '',
  settings: {
    template: 'modern',
    accent: '#2f6f61',
    density: 'comfortable',
  },
});

export const sampleResume = () => ({
  version: 1,
  profile: {
    name: '林知夏',
    title: '高级产品经理',
    city: '上海',
    phone: '138 0000 6688',
    email: 'zhixia.lin@example.com',
    website: 'linkedin.com/in/zhixia',
    summary: '6 年互联网产品经验，专注于增长产品与用户生命周期运营。擅长从用户洞察和数据分析中发现机会，推动跨职能团队将策略落地。曾负责千万级用户产品的核心转化链路，持续关注业务结果与用户价值的平衡。',
  },
  experience: [
    {
      id: createId(),
      company: '星澜科技',
      role: '高级产品经理',
      start: '2022-04',
      end: '',
      current: true,
      description: '负责增长产品规划，通过用户分层与漏斗分析重构新用户激活流程，推动注册转化率提升 32%\n主导会员权益体系升级，协调设计、研发与运营共 4 个团队，上线后次月留存率提升 18%\n搭建核心指标看板与实验机制，累计推进 20+ 组 A/B 实验，将需求决策周期缩短 40%',
    },
    {
      id: createId(),
      company: '云帆网络',
      role: '产品经理',
      start: '2019-07',
      end: '2022-03',
      current: false,
      description: '负责内容社区产品迭代，基于用户访谈和行为数据优化推荐策略，使用户日均使用时长增长 25%\n从 0 到 1 设计创作者激励计划，上线 6 个月吸引 3,000+ 创作者入驻，内容供给量提升 65%\n建立用户反馈分类与优先级机制，推动核心问题月均闭环率提升至 92%',
    },
  ],
  projects: [
    {
      id: createId(),
      name: '用户增长实验平台',
      role: '产品负责人',
      start: '2023-02',
      end: '2023-10',
      description: '设计实验配置、流量分配与数据回收全流程，支持产品团队自主完成实验\n上线后实验平均配置时间由 2 天缩短至 2 小时，月均实验数量提升 3 倍',
    },
  ],
  education: [
    {
      id: createId(),
      school: '华东师范大学',
      degree: '本科',
      major: '信息管理与信息系统',
      start: '2015-09',
      end: '2019-06',
      description: '主修数据分析、信息系统设计与用户研究',
    },
  ],
  skills: ['产品规划', '用户研究', '数据分析', 'SQL', 'A/B 测试', '增长策略', '跨团队协作', 'Axure'],
  jobDescription: '我们正在寻找一位高级产品经理，负责用户增长与核心转化。要求具备 3 年以上互联网产品经验，熟悉数据分析、SQL、A/B 测试和用户研究，能够独立完成产品规划，具备良好的跨团队协作能力。有增长策略、留存或会员产品经验者优先。',
  settings: {
    template: 'modern',
    accent: '#2f6f61',
    density: 'comfortable',
  },
});

export const sectionLabels = {
  profile: '基本信息',
  summary: '个人优势',
  experience: '工作经历',
  projects: '项目经历',
  education: '教育背景',
  skills: '专业技能',
};
