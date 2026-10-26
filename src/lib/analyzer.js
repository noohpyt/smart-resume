const ACTION_WORDS = ['负责', '主导', '推动', '设计', '搭建', '优化', '重构', '协调', '落地', '实现', '提升', '降低', '增长', '带领', '规划', '建立', '完成', '开发', '分析', '改进', 'managed', 'led', 'built', 'designed', 'improved', 'launched', 'developed'];

const KEYWORDS = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Next.js', 'Java', 'Python', 'Go', 'C++', 'C#', 'PHP', 'Swift', 'Kotlin', 'SQL', 'MySQL', 'PostgreSQL', 'Redis', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git', 'Linux', 'Figma', 'Axure', 'Sketch', 'Photoshop', 'Excel', 'PowerPoint', 'Tableau', 'Power BI', 'SPSS', 'A/B 测试', '数据分析', '用户研究', '产品规划', '产品设计', '增长策略', '项目管理', '跨团队协作', '团队管理', '需求分析', '用户体验', '交互设计', '视觉设计', '平面设计', '品牌设计', '内容运营', '用户运营', '活动运营', '新媒体运营', '私域运营', '电商运营', '市场营销', '市场推广', '商务拓展', '客户关系', '销售管理', '财务分析', '预算管理', '风险控制', '人力资源', '招聘', '绩效管理', '机器学习', '深度学习', '自然语言处理', '大模型', '数据挖掘', '数据可视化', '自动化测试', '性能优化', '微服务', '分布式', '高并发', '响应式', '留存', '转化率', '敏捷开发', 'Scrum', '英语', '日语',
];

const clean = (value) => (value || '').trim();
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lines = (value) => clean(value).split(/\n+/).map((line) => line.replace(/^[-•·\s]+/, '').trim()).filter(Boolean);

export function analyzeResume(resume) {
  const { profile } = resume;
  const descriptions = [...resume.experience, ...resume.projects].flatMap((item) => lines(item.description));
  const identityFields = ['name', 'title', 'city', 'phone', 'email'];
  const identityDone = identityFields.filter((key) => clean(profile[key])).length;
  const basics = Math.round((identityDone / identityFields.length) * 10);
  const completenessParts = [clean(profile.summary).length >= 40, resume.experience.length > 0, resume.projects.length > 0, resume.education.length > 0, resume.skills.length >= 3];
  const completeness = Math.round((completenessParts.filter(Boolean).length / completenessParts.length) * 25);
  const quantified = descriptions.filter((line) => /\d|%|％|倍|余|多/.test(line)).length;
  const impact = descriptions.length ? Math.round(clamp(quantified / Math.max(3, descriptions.length), 0, 1) * 25) : 0;
  const active = descriptions.filter((line) => ACTION_WORDS.some((word) => line.toLowerCase().includes(word.toLowerCase()))).length;
  const summaryQuality = clean(profile.summary).length >= 50 && clean(profile.summary).length <= 180 ? 5 : clean(profile.summary) ? 3 : 0;
  const expression = Math.min(20, (descriptions.length ? Math.round((active / descriptions.length) * 15) : 0) + summaryQuality);
  const skillScore = Math.round(clamp(resume.skills.length / 6, 0, 1) * 10);
  const total = clamp(basics + completeness + impact + expression + skillScore, 0, 100);
  const suggestions = [];
  if (!clean(profile.email) || !/^\S+@\S+\.\S+$/.test(profile.email)) suggestions.push({ type: 'warning', title: '补充有效联系邮箱', text: '邮箱是招聘方联系你的重要方式，请检查格式是否正确。', section: 'profile' });
  if (clean(profile.summary).length < 50) suggestions.push({ type: 'tip', title: '让个人优势更具体', text: '建议用 50–180 字概括年限、领域、核心能力和一项代表成果。', section: 'summary' });
  if (!resume.experience.length) suggestions.push({ type: 'warning', title: '添加一段工作或实习经历', text: '从最近的经历开始，写清职责、行动和结果。', section: 'experience' });
  if (descriptions.length && quantified < descriptions.length / 2) suggestions.push({ type: 'tip', title: '用结果证明你的价值', text: `当前 ${descriptions.length} 条经历中有 ${quantified} 条包含量化信息。可补充效率、规模、转化率等真实数据。`, section: 'experience' });
  if (descriptions.length && active < descriptions.length / 2) suggestions.push({ type: 'tip', title: '以行动动词开头', text: '使用“主导、设计、推动、优化”等动词，让贡献更直观。', section: 'experience' });
  if (resume.skills.length < 5) suggestions.push({ type: 'tip', title: '完善专业技能', text: '列出 5–10 项与目标岗位相关的技能，避免只写“学习能力强”。', section: 'skills' });
  if (!resume.projects.length) suggestions.push({ type: 'tip', title: '用项目补充竞争力', text: '选择最能体现岗位能力的项目，说明你的角色和最终成果。', section: 'projects' });
  if (clean(profile.summary).length > 180) suggestions.push({ type: 'tip', title: '精简个人优势', text: '摘要超过 180 字，建议保留最相关的经验、能力和成果。', section: 'summary' });
  if (!suggestions.length) suggestions.push({ type: 'success', title: '简历基础已经很扎实', text: '接下来粘贴目标岗位描述，针对关键词进一步提升匹配度。', section: 'analysis' });
  return {
    score: total,
    label: total >= 85 ? '很有竞争力' : total >= 70 ? '表现良好' : total >= 50 ? '继续完善' : '需要完善',
    dimensions: [
      { key: 'basics', label: '联系信息', value: basics, max: 10 },
      { key: 'completeness', label: '内容完整度', value: completeness, max: 25 },
      { key: 'impact', label: '成果量化', value: impact, max: 25 },
      { key: 'expression', label: '表达质量', value: expression, max: 20 },
      { key: 'skills', label: '技能丰富度', value: skillScore, max: 10 },
    ],
    suggestions: suggestions.slice(0, 5),
    quantified,
    totalBullets: descriptions.length,
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function includesKeyword(text, keyword) {
  if (/^[a-z0-9.+# ]+$/i.test(keyword)) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(keyword)}([^a-z0-9]|$)`, 'i').test(text);
  }
  return text.toLowerCase().includes(keyword.toLowerCase());
}

export function extractKeywords(jobDescription) {
  const text = clean(jobDescription);
  const found = KEYWORDS.filter((keyword) => includesKeyword(text, keyword));
  const english = text.match(/[A-Za-z][A-Za-z0-9.+#-]{1,}/g) || [];
  english.forEach((word) => {
    if (!/^(and|or|the|with|for|you|are|our|will|have|has|from|that|this|years?|plus|ability|experience|work|team|good|strong|familiar|above)$/i.test(word)) {
      if (!found.some((keyword) => keyword.toLowerCase() === word.toLowerCase())) found.push(word);
    }
  });
  return [...new Set(found)].slice(0, 18);
}

export function analyzeJobMatch(resume) {
  const jobDescription = clean(resume.jobDescription);
  if (jobDescription.length < 12) return null;
  const keywords = extractKeywords(jobDescription);
  if (!keywords.length) return { score: 0, matched: [], missing: [], keywords: [] };
  const resumeText = [profileText(resume.profile), ...resume.experience.flatMap((item) => [item.role, item.company, item.description]), ...resume.projects.flatMap((item) => [item.name, item.role, item.description]), ...resume.education.flatMap((item) => [item.major, item.description]), ...resume.skills].join('\n');
  const matched = keywords.filter((keyword) => includesKeyword(resumeText, keyword));
  const missing = keywords.filter((keyword) => !matched.includes(keyword));
  const score = Math.round((matched.length / keywords.length) * 100);
  return { score, matched, missing, keywords };
}

function profileText(profile) {
  return Object.values(profile).join('\n');
}

export function optimizeBullet(text) {
  const original = clean(text);
  if (!original) return '';
  const replacements = [
    [/^负责[，,:：\s]*/u, '负责 '],
    [/^参与[，,:：\s]*/u, '参与 '],
    [/^做[了]?[，,:：\s]*/u, '完成 '],
    [/\s+/g, ' '],
  ];
  return lines(original).map((rawLine) => {
    let line = rawLine;
    replacements.forEach(([pattern, replacement]) => { line = line.replace(pattern, replacement); });
    if (!ACTION_WORDS.some((word) => line.toLowerCase().startsWith(word.toLowerCase()))) line = `负责 ${line}`;
    line = line.replace(/[;；]\s*/g, '；').replace(/[,，]\s*/g, '，');
    return `${line.replace(/[。；;\s]+$/, '')}。`;
  }).join('\n');
}
