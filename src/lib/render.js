import { analyzeJobMatch, analyzeResume } from './analyzer.js';
import { sectionLabels } from '../data/defaults.js';

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

const paths = {
  logo: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  user: '<path d="M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/>',
  sparkle: '<path d="m12 3-1.3 3.7L7 8l3.7 1.3L12 13l1.3-3.7L17 8l-3.7-1.3L12 3ZM5 14l-.9 2.1L2 17l2.1.9L5 20l.9-2.1L8 17l-2.1-.9L5 14ZM19 13l-.7 1.3L17 15l1.3.7L19 17l.7-1.3L21 15l-1.3-.7L19 13Z"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
  school: '<path d="m2 10 10-5 10 5-10 5L2 10ZM6 12v5c3 2 9 2 12 0v-5M22 10v6"/>',
  skills: '<path d="m14.7 6.3 3-3a4.2 4.2 0 0 1-5.6 5.6l-7.5 7.5a2.1 2.1 0 0 0 3 3l7.5-7.5a4.2 4.2 0 0 0 5.6-5.6l-3 3-3-3Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  undo: '<path d="M9 7 4 12l5 5M4 12h9a7 7 0 0 1 7 7"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M5 20h14"/>',
  printer: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 1.9Z"/>',
  pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  bulb: '<path d="M9 18h6M10 22h4M8.5 14.5a6 6 0 1 1 7 0c-1 .7-1.5 1.8-1.5 3.5h-4c0-1.7-.5-2.8-1.5-3.5Z"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  wand: '<path d="m15 4 5 5L8 21H3v-5L15 4ZM6 15l5 5M6 3v4M4 5h4M19 15v4M17 17h4"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  palette: '<path d="M12 3a9 9 0 0 0 0 18h1.5a1.5 1.5 0 0 0 0-3H12a2 2 0 0 1 0-4h2a7 7 0 0 0 7-7c0-2.2-4-4-9-4Z"/><circle cx="7.5" cy="10" r=".8"/><circle cx="10" cy="6.5" r=".8"/><circle cx="15" cy="6.5" r=".8"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  alert: '<path d="M10.3 3.7 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.7a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
};

export function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.file}</svg>`;
}

export function renderShell() {
  return `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand-block">
          <div class="brand-mark">${icon('logo')}</div>
          <div class="brand-name">简智<span>JIANZHI</span></div>
          <span class="topbar-divider"></span>
          <span class="workspace-name">智能简历工作台 <span class="beta-tag">MVP</span></span>
        </div>
        <div class="header-actions">
          <span id="save-status" class="save-status">${icon('check-circle')}<span>已自动保存</span></span>
          <button class="icon-button" data-action="undo" title="撤销上一步" aria-label="撤销" disabled>${icon('undo')}</button>
          <span class="action-divider"></span>
          <button class="button button-ghost desktop-action" data-action="import">${icon('upload')}导入</button>
          <button class="button button-ghost desktop-action" data-action="export">${icon('download')}备份</button>
          <button class="button button-primary" data-action="print">${icon('printer')}<span>导出 PDF</span></button>
          <button class="icon-button mobile-more" data-action="mobile-menu" aria-label="更多操作">${icon('down')}</button>
          <input id="import-file" type="file" accept="application/json,.json" hidden />
        </div>
      </header>
      <div class="mobile-actions" id="mobile-actions" hidden>
        <button data-action="import">${icon('upload')}导入备份</button>
        <button data-action="export">${icon('download')}导出备份</button>
        <button data-action="reset-menu">${icon('file')}简历数据</button>
      </div>
      <main class="workspace">
        <aside class="control-panel">
          <div class="panel-tabs" role="tablist" aria-label="工作台功能">
            <button class="panel-tab active" data-panel="editor" role="tab" aria-selected="true">${icon('file')}编辑简历</button>
            <button class="panel-tab" data-panel="analysis" role="tab" aria-selected="false">${icon('sparkle')}智能分析<span id="analysis-dot" class="notification-dot"></span></button>
            <button class="panel-tab" data-panel="design" role="tab" aria-selected="false">${icon('palette')}排版设计</button>
          </div>
          <div id="panel-content" class="panel-content"></div>
          <div class="panel-footer">
            <span>${icon('info')}数据仅保存在当前浏览器</span>
            <button data-action="reset-menu">简历数据${icon('chevron')}</button>
          </div>
        </aside>
        <section class="preview-stage" aria-label="简历实时预览">
          <div class="preview-toolbar">
            <div><span class="live-dot"></span><strong>实时预览</strong><span class="preview-divider">/</span><span id="preview-template-name">现代专业</span></div>
            <div class="preview-tools"><span>A4 · 210 × 297 mm</span><button class="icon-button" data-action="print" title="导出 PDF">${icon('download')}</button></div>
          </div>
          <div class="preview-scroll"><div id="resume-container" class="resume-container"></div></div>
          <div class="preview-hint">${icon('check-circle')}内容与排版已同步，导出效果与预览一致</div>
        </section>
      </main>
    </div>`;
}

const sectionIcons = { profile: 'user', summary: 'sparkle', experience: 'briefcase', projects: 'folder', education: 'school', skills: 'skills' };

export function renderPanel(state, ui) {
  if (ui.panel === 'analysis') return renderAnalysis(state, ui.analysisTab);
  if (ui.panel === 'design') return renderDesign(state);
  return renderEditor(state, ui.section);
}

function renderEditor(state, activeSection) {
  const completeness = {
    profile: state.profile.name && state.profile.email,
    summary: state.profile.summary.length >= 40,
    experience: state.experience.length > 0,
    projects: state.projects.length > 0,
    education: state.education.length > 0,
    skills: state.skills.length >= 3,
  };
  return `<div class="editor-layout">
    <nav class="section-nav" aria-label="简历分区">
      <div class="section-nav-title">简历内容</div>
      ${Object.entries(sectionLabels).map(([key, label]) => `<button class="section-nav-item ${key === activeSection ? 'active' : ''}" data-section="${key}">${icon(sectionIcons[key])}<span>${label}</span><i class="section-status ${completeness[key] ? 'complete' : ''}">${completeness[key] ? icon('check') : ''}</i></button>`).join('')}
      <div class="editor-progress"><div class="progress-heading"><span>内容完成度</span><strong>${Object.values(completeness).filter(Boolean).length}/6</strong></div><div class="mini-progress"><i style="width:${Object.values(completeness).filter(Boolean).length / 6 * 100}%"></i></div><p>完整、真实的经历更能打动招聘方</p></div>
    </nav>
    <div class="editor-content">${renderActiveSection(state, activeSection)}</div>
  </div>`;
}

function renderActiveSection(state, section) {
  if (section === 'summary') return renderSummary(state);
  if (section === 'experience') return renderExperience(state);
  if (section === 'projects') return renderProjects(state);
  if (section === 'education') return renderEducation(state);
  if (section === 'skills') return renderSkills(state);
  return renderProfile(state);
}

const sectionHeading = (title, description) => `<div class="editor-heading"><div><h1>${title}</h1><p>${description}</p></div></div>`;
const field = (label, html, className = '') => `<label class="field ${className}"><span class="field-label">${label}</span>${html}</label>`;
const input = (value, attrs) => `<input value="${escapeHtml(value)}" ${attrs} />`;
const itemAttrs = (section, id, key) => `data-section-name="${section}" data-id="${id}" data-field="${key}"`;

function renderProfile(state) {
  const p = state.profile;
  return `${sectionHeading('基本信息', '让招聘方快速了解你，并方便与你联系')}
    <div class="form-card">
      <div class="form-grid">
        ${field('姓名 <em>必填</em>', input(p.name, 'data-profile="name" placeholder="你的姓名" maxlength="30" autocomplete="name"'))}
        ${field('求职岗位 <em>必填</em>', input(p.title, 'data-profile="title" placeholder="如：高级产品经理" maxlength="50"'))}
        ${field('所在城市', input(p.city, 'data-profile="city" placeholder="如：上海" maxlength="30"'))}
        ${field('手机号码', input(p.phone, 'data-profile="phone" placeholder="你的联系电话" maxlength="30" autocomplete="tel"'))}
        ${field('电子邮箱 <em>必填</em>', input(p.email, `data-profile="email" placeholder="name@example.com" maxlength="80" autocomplete="email" class="${p.email && !/^\S+@\S+\.\S+$/.test(p.email) ? 'invalid' : ''}"`), 'full-width')}
        ${field('个人主页 / 作品集', input(p.website, 'data-profile="website" placeholder="如：github.com/yourname" maxlength="100"'), 'full-width')}
      </div>
    </div>
    <div class="editor-callout">${icon('bulb')}<div><strong>小提示</strong><p>求职岗位尽量与目标职位保持一致，不必填写身份证号、婚姻状况等敏感信息。</p></div></div>`;
}

function renderSummary(state) {
  const length = state.profile.summary.length;
  return `${sectionHeading('个人优势', '用一段话说明你的经验、专长和独特价值')}
    <div class="form-card">
      ${field('个人简介', `<textarea data-profile="summary" rows="9" maxlength="500" placeholder="例如：5 年 SaaS 产品经验，专注企业服务与效率工具。擅长用户研究和数据分析，曾主导核心产品从 0 到 1 上线……">${escapeHtml(state.profile.summary)}</textarea>`)}
      <div class="field-help"><span>建议 50–180 字，突出与岗位最相关的信息</span><span class="char-count ${length > 180 ? 'over' : ''}">${length}/180</span></div>
    </div>
    <div class="writing-framework"><h3>${icon('sparkle')}推荐表达结构</h3><div class="framework-steps"><span><b>01</b>经验定位</span><i></i><span><b>02</b>核心能力</span><i></i><span><b>03</b>代表成果</span></div><p>避免“性格开朗、吃苦耐劳”等空泛描述，用事实建立专业印象。</p></div>`;
}

function itemHeader(index, title, section, id, count) {
  return `<div class="item-header"><div class="item-number">${String(index + 1).padStart(2, '0')}</div><strong>${escapeHtml(title) || `未填写${sectionLabels[section]}`}</strong><div class="item-actions"><button data-action="move-item" data-direction="up" data-section-name="${section}" data-id="${id}" aria-label="上移" ${index === 0 ? 'disabled' : ''}>${icon('up')}</button><button data-action="move-item" data-direction="down" data-section-name="${section}" data-id="${id}" aria-label="下移" ${index === count - 1 ? 'disabled' : ''}>${icon('down')}</button><button class="danger" data-action="delete-item" data-section-name="${section}" data-id="${id}" aria-label="删除">${icon('trash')}</button></div></div>`;
}

const emptySection = (section, text) => `<div class="empty-section"><div>${icon(sectionIcons[section])}</div><h3>还没有${sectionLabels[section]}</h3><p>${text}</p><button class="button button-secondary" data-action="add-item" data-section-name="${section}">${icon('plus')}添加${sectionLabels[section]}</button></div>`;

function renderExperience(state) {
  return `${sectionHeading('工作经历', '按时间倒序呈现，用成果而不是职责清单证明能力')}
    <div class="item-list">${state.experience.map((item, index) => `<section class="form-card experience-card">${itemHeader(index, item.role || item.company, 'experience', item.id, state.experience.length)}
      <div class="form-grid">
        ${field('公司名称', input(item.company, itemAttrs('experience', item.id, 'company') + ' placeholder="公司全称"'))}
        ${field('职位名称', input(item.role, itemAttrs('experience', item.id, 'role') + ' placeholder="你的职位"'))}
        ${field('开始时间', input(item.start, itemAttrs('experience', item.id, 'start') + ' type="month"'))}
        ${field('结束时间', input(item.end, itemAttrs('experience', item.id, 'end') + ` type="month" ${item.current ? 'disabled' : ''}`))}
        <label class="checkbox-field"><input type="checkbox" data-section-name="experience" data-id="${item.id}" data-field="current" ${item.current ? 'checked' : ''}/><span>目前在职</span></label>
        ${field('工作内容与成果', `<textarea rows="6" ${itemAttrs('experience', item.id, 'description')} placeholder="每行一条，建议：行动 + 工作内容 + 量化成果">${escapeHtml(item.description)}</textarea>`, 'full-width')}
      </div>
      <div class="item-bottom"><span>${icon('info')}每行将在简历中显示为一个要点</span><button class="smart-button" data-action="optimize" data-section-name="experience" data-id="${item.id}">${icon('wand')}智能优化</button></div>
    </section>`).join('')}</div>
    ${state.experience.length ? `<button class="add-entry" data-action="add-item" data-section-name="experience">${icon('plus')}添加一段工作经历</button>` : emptySection('experience', '实习、兼职和全职经历都可以写在这里')}`;
}

function renderProjects(state) {
  return `${sectionHeading('项目经历', '突出与你目标岗位最相关的项目及实际贡献')}
    <div class="item-list">${state.projects.map((item, index) => `<section class="form-card">${itemHeader(index, item.name, 'projects', item.id, state.projects.length)}
      <div class="form-grid">
        ${field('项目名称', input(item.name, itemAttrs('projects', item.id, 'name') + ' placeholder="项目名称"'))}
        ${field('担任角色', input(item.role, itemAttrs('projects', item.id, 'role') + ' placeholder="如：产品负责人"'))}
        ${field('开始时间', input(item.start, itemAttrs('projects', item.id, 'start') + ' type="month"'))}
        ${field('结束时间', input(item.end, itemAttrs('projects', item.id, 'end') + ' type="month"'))}
        ${field('项目描述与成果', `<textarea rows="5" ${itemAttrs('projects', item.id, 'description')} placeholder="每行一条：项目背景、你的行动、最终结果">${escapeHtml(item.description)}</textarea>`, 'full-width')}
      </div>
      <div class="item-bottom"><span>${icon('info')}优先保留与岗位相关的 1–3 个项目</span><button class="smart-button" data-action="optimize" data-section-name="projects" data-id="${item.id}">${icon('wand')}智能优化</button></div>
    </section>`).join('')}</div>
    ${state.projects.length ? `<button class="add-entry" data-action="add-item" data-section-name="projects">${icon('plus')}添加一个项目</button>` : emptySection('projects', '课程项目、个人作品或工作项目都可以成为亮点')}`;
}

function renderEducation(state) {
  return `${sectionHeading('教育背景', '填写最高学历，应届或实习求职者可补充主修课程')}
    <div class="item-list">${state.education.map((item, index) => `<section class="form-card">${itemHeader(index, item.school, 'education', item.id, state.education.length)}
      <div class="form-grid">
        ${field('学校名称', input(item.school, itemAttrs('education', item.id, 'school') + ' placeholder="学校全称"'), 'full-width')}
        ${field('学历', input(item.degree, itemAttrs('education', item.id, 'degree') + ' placeholder="如：本科"'))}
        ${field('专业', input(item.major, itemAttrs('education', item.id, 'major') + ' placeholder="专业名称"'))}
        ${field('开始时间', input(item.start, itemAttrs('education', item.id, 'start') + ' type="month"'))}
        ${field('结束时间', input(item.end, itemAttrs('education', item.id, 'end') + ' type="month"'))}
        ${field('补充说明 <span>选填</span>', `<textarea rows="3" ${itemAttrs('education', item.id, 'description')} placeholder="主修课程、荣誉奖项、学术成果等">${escapeHtml(item.description)}</textarea>`, 'full-width')}
      </div>
    </section>`).join('')}</div>
    ${state.education.length ? `<button class="add-entry" data-action="add-item" data-section-name="education">${icon('plus')}添加教育经历</button>` : emptySection('education', '从最高学历开始填写')}`;
}

function renderSkills(state) {
  return `${sectionHeading('专业技能', '展示与岗位相关、能够被经历印证的能力')}
    <div class="form-card skill-editor-card">
      ${field('添加技能', `<div class="skill-input-row"><input id="skill-input" placeholder="如：SQL、用户研究、项目管理" maxlength="24"/><button class="button button-secondary" data-action="add-skill">${icon('plus')}添加</button></div>`)}
      <div class="field-help">输入后按回车快速添加，最多 40 项</div>
      <div class="skill-tags editable">${state.skills.map((skill, index) => `<span>${escapeHtml(skill)}<button data-action="remove-skill" data-index="${index}" aria-label="删除 ${escapeHtml(skill)}">${icon('close')}</button></span>`).join('') || '<p class="muted">暂未添加技能</p>'}</div>
    </div>
    <div class="editor-callout">${icon('target')}<div><strong>如何填写更有效？</strong><p>先阅读目标岗位描述，优先列出职位要求中你真实掌握的技能。技能顺序按相关度排列。</p></div></div>`;
}

function renderAnalysis(state, tab) {
  const analysis = analyzeResume(state);
  return `<div class="analysis-content">
    <div class="analysis-hero">
      <div class="score-ring" style="--score:${analysis.score * 3.6}deg"><div><strong>${analysis.score}</strong><span>综合评分</span></div></div>
      <div class="score-copy"><span class="eyebrow">RESUME HEALTH</span><h1>${analysis.label}</h1><p>${analysis.score >= 85 ? '内容完整，成果表达清晰。可以针对岗位做最后优化。' : '每次完善都让简历更有竞争力，先从下方建议开始。'}</p></div>
    </div>
    <div class="analysis-tabs"><button class="${tab === 'quality' ? 'active' : ''}" data-analysis-tab="quality">质量诊断</button><button class="${tab === 'job' ? 'active' : ''}" data-analysis-tab="job">岗位匹配${state.jobDescription ? '<i></i>' : ''}</button></div>
    ${tab === 'job' ? renderJobMatch(state) : renderQuality(analysis)}
  </div>`;
}

function renderQuality(analysis) {
  return `<section class="analysis-section"><div class="analysis-section-heading"><h2>评分维度</h2><span>${analysis.quantified}/${analysis.totalBullets} 条含量化成果</span></div>
    <div class="dimension-list">${analysis.dimensions.map((item) => `<div class="dimension-row"><div><span>${item.label}</span><strong>${item.value}<small> / ${item.max}</small></strong></div><div class="dimension-track"><i style="width:${item.value / item.max * 100}%"></i></div></div>`).join('')}</div></section>
    <section class="analysis-section suggestions-section"><div class="analysis-section-heading"><h2>优先优化建议</h2><span class="count-badge">${analysis.suggestions.length}</span></div>
      <div class="suggestion-list">${analysis.suggestions.map((item, index) => `<article class="suggestion ${item.type}"><div class="suggestion-icon">${icon(item.type === 'warning' ? 'alert' : item.type === 'success' ? 'check-circle' : 'bulb')}</div><div><h3>${item.title}</h3><p>${item.text}</p>${item.section !== 'analysis' ? `<button data-action="go-section" data-section="${item.section}">去完善${icon('arrow')}</button>` : `<button data-action="show-job">匹配目标岗位${icon('arrow')}</button>`}</div><span class="suggestion-order">${String(index + 1).padStart(2, '0')}</span></article>`).join('')}</div>
    </section>
    <div class="local-engine-note">${icon('info')}评分与建议由本地规则生成，不会上传简历内容</div>`;
}

function renderJobMatch(state) {
  const match = analyzeJobMatch(state);
  return `<section class="job-input-section"><div class="analysis-section-heading"><h2>目标岗位描述</h2>${state.jobDescription ? '<button data-action="clear-job">清空</button>' : ''}</div><p>粘贴招聘 JD，我们将识别关键要求并与简历比对</p><textarea data-job-description rows="7" placeholder="粘贴岗位职责与任职要求……">${escapeHtml(state.jobDescription)}</textarea><div class="field-help"><span>内容仅在本地分析</span><span>${state.jobDescription.length} 字</span></div></section>
    ${match ? `<section class="match-result"><div class="match-score-row"><div><span class="eyebrow">JOB MATCH</span><h2>岗位匹配度</h2></div><strong class="match-score">${match.score}<small>%</small></strong></div><div class="match-track"><i style="width:${match.score}%"></i></div><p class="match-summary">${match.score >= 80 ? '匹配度很高，可以针对缺失项微调表述。' : match.score >= 60 ? '基础匹配良好，建议补充真实相关的关键词。' : '还有提升空间，请对照岗位要求强化相关经历。'}</p>
      <div class="keyword-group"><h3>${icon('check-circle')}已命中 <span>${match.matched.length}</span></h3><div class="keyword-chips matched">${match.matched.map((word) => `<span>${icon('check')}${escapeHtml(word)}</span>`).join('') || '<p>尚未命中明确关键词</p>'}</div></div>
      <div class="keyword-group"><h3>${icon('target')}可补充 <span>${match.missing.length}</span></h3><div class="keyword-chips missing">${match.missing.map((word) => `<span>${escapeHtml(word)}</span>`).join('') || '<p>已覆盖识别到的关键词</p>'}</div></div>
      <div class="match-advice">${icon('bulb')}<p>只补充你真实具备的能力。关键词匹配是辅助参考，不代表招聘方的最终判断。</p></div>
    </section>` : `<div class="match-empty"><div>${icon('target')}</div><h3>让简历更贴近目标岗位</h3><p>粘贴职位描述后，自动识别技能与能力关键词，发现已经覆盖和可以补强的内容。</p><ul><li>识别岗位核心要求</li><li>对照简历展示匹配度</li><li>给出具体关键词建议</li></ul></div>`}
  `;
}

function renderDesign(state) {
  return `<div class="design-content">${sectionHeading('排版设计', '选择适合你的专业风格，预览会实时更新')}
    <section class="design-section"><h2>简历模板</h2><div class="template-options">
      <button class="template-option ${state.settings.template === 'modern' ? 'selected' : ''}" data-template="modern"><div class="template-thumbnail modern-thumb"><i></i><b></b><span></span><span></span><span></span></div><div><strong>现代专业</strong><span>清晰分区，适合互联网与商务岗位</span></div>${icon('check-circle')}</button>
      <button class="template-option ${state.settings.template === 'classic' ? 'selected' : ''}" data-template="classic"><div class="template-thumbnail classic-thumb"><i></i><b></b><span></span><span></span><span></span></div><div><strong>经典简约</strong><span>克制传统，适合职能与专业岗位</span></div>${icon('check-circle')}</button>
    </div></section>
    <section class="design-section"><h2>主题颜色</h2><p>选择低调、易阅读且打印友好的颜色</p><div class="color-options">${['#2f6f61', '#315b7d', '#3f4a5a', '#76523f', '#6b4f72', '#30343b'].map((color) => `<button class="color-swatch ${state.settings.accent === color ? 'selected' : ''}" style="--swatch:${color}" data-accent="${color}" aria-label="主题色 ${color}">${state.settings.accent === color ? icon('check') : ''}</button>`).join('')}</div></section>
    <section class="design-section"><h2>内容密度</h2><div class="density-options"><button class="${state.settings.density === 'comfortable' ? 'selected' : ''}" data-density="comfortable"><strong>舒适</strong><span>留白充足，更易阅读</span></button><button class="${state.settings.density === 'compact' ? 'selected' : ''}" data-density="compact"><strong>紧凑</strong><span>适合较丰富的经历</span></button></div></section>
    <div class="design-note">${icon('printer')}导出 PDF 时将自动隐藏工作台，仅保留简历内容。</div>
  </div>`;
}

const dateRange = (item) => {
  const start = item.start ? item.start.replace('-', '.') : '';
  const end = item.current ? '至今' : item.end ? item.end.replace('-', '.') : '';
  return [start, end].filter(Boolean).join(' — ');
};
const bulletList = (text) => text.split(/\n+/).map((line) => line.trim()).filter(Boolean).map((line) => `<li>${escapeHtml(line.replace(/^[-•·]\s*/, ''))}</li>`).join('');
const resumeSection = (title, content) => content ? `<section class="resume-section"><h2>${title}</h2>${content}</section>` : '';

export function renderPreview(state) {
  const p = state.profile;
  const contacts = [
    p.city ? icon('pin') + escapeHtml(p.city) : '',
    p.phone ? icon('phone') + escapeHtml(p.phone) : '',
    p.email ? icon('mail') + escapeHtml(p.email) : '',
    p.website ? icon('link') + escapeHtml(p.website) : '',
  ].filter(Boolean);
  const experience = state.experience.filter((item) => Object.values(item).some((value) => typeof value === 'string' && value.trim())).map((item) => `<article class="resume-entry"><div class="resume-entry-head"><div><h3>${escapeHtml(item.role || '职位名称')}</h3><span class="entry-org">${escapeHtml(item.company)}</span></div><time>${dateRange(item)}</time></div>${item.description ? `<ul>${bulletList(item.description)}</ul>` : ''}</article>`).join('');
  const projects = state.projects.filter((item) => item.name || item.description).map((item) => `<article class="resume-entry"><div class="resume-entry-head"><div><h3>${escapeHtml(item.name)}</h3><span class="entry-org">${escapeHtml(item.role)}</span></div><time>${dateRange(item)}</time></div>${item.description ? `<ul>${bulletList(item.description)}</ul>` : ''}</article>`).join('');
  const education = state.education.filter((item) => item.school || item.major).map((item) => `<article class="resume-entry education-entry"><div class="resume-entry-head"><div><h3>${escapeHtml(item.school)}</h3><span class="entry-org">${escapeHtml([item.degree, item.major].filter(Boolean).join(' · '))}</span></div><time>${dateRange(item)}</time></div>${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}</article>`).join('');
  const skills = state.skills.length ? `<div class="resume-skills">${state.skills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join('')}</div>` : '';
  return `<article id="resume-paper" class="resume-paper template-${state.settings.template} density-${state.settings.density}" style="--accent:${state.settings.accent}">
    <header class="resume-header"><div class="resume-identity"><h1>${escapeHtml(p.name) || '你的姓名'}</h1><p>${escapeHtml(p.title) || '目标职位'}</p></div><div class="resume-contact">${contacts.map((contact) => `<span>${contact}</span>`).join('')}</div></header>
    <div class="resume-body">
      ${resumeSection('个人优势', p.summary ? `<p class="resume-summary">${escapeHtml(p.summary)}</p>` : '')}
      ${resumeSection('工作经历', experience)}
      ${resumeSection('项目经历', projects)}
      ${resumeSection('教育背景', education)}
      ${resumeSection('专业技能', skills)}
      ${!p.summary && !experience && !projects && !education && !skills ? '<div class="resume-empty"><span>开始填写内容</span><p>你的专业简历将在这里实时呈现</p></div>' : ''}
    </div>
  </article>`;
}
