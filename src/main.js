import './styles.css';
import { createId, emptyResume, sampleResume, sectionLabels } from './data/defaults.js';
import { optimizeBullet } from './lib/analyzer.js';
import { downloadJson, loadResume, saveResume, validateResume } from './lib/storage.js';
import { icon, renderPanel, renderPreview, renderShell } from './lib/render.js';

const app = document.querySelector('#app');
const modalRoot = document.querySelector('#modal-root');
const toastRoot = document.querySelector('#toast-root');
app.innerHTML = renderShell();

let state = loadResume() || sampleResume();
let saveTimer;
let analysisTimer;
let toastTimer;
const undoStack = [];
const ui = { panel: 'editor', section: 'profile', analysisTab: 'quality' };
const panelContent = document.querySelector('#panel-content');
const resumeContainer = document.querySelector('#resume-container');
const undoButton = document.querySelector('[data-action="undo"]');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function pushUndo() {
  undoStack.push(clone(state));
  if (undoStack.length > 30) undoStack.shift();
  undoButton.disabled = false;
}

function renderPreviewOnly() {
  resumeContainer.innerHTML = renderPreview(state);
  const templateName = document.querySelector('#preview-template-name');
  if (templateName) templateName.textContent = state.settings.template === 'modern' ? '现代专业' : '经典简约';
}

function renderPanelOnly() {
  panelContent.innerHTML = renderPanel(state, ui);
  panelContent.scrollTop = 0;
}

function renderAll() {
  renderPanelOnly();
  renderPreviewOnly();
  undoButton.disabled = undoStack.length === 0;
}

function scheduleSave() {
  const status = document.querySelector('#save-status');
  status.classList.add('saving');
  status.innerHTML = `${icon('check-circle')}<span>正在保存…</span>`;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      saveResume(state);
      status.classList.remove('saving');
      status.innerHTML = `${icon('check-circle')}<span>已自动保存</span>`;
    } catch {
      status.innerHTML = `${icon('alert')}<span>保存失败</span>`;
      toast('浏览器存储空间不足，请先导出备份', 'error');
    }
  }, 450);
}

function updateAfterInput({ refreshPanel = false } = {}) {
  renderPreviewOnly();
  scheduleSave();
  if (refreshPanel) renderPanelOnly();
}

function toast(message, type = 'success') {
  clearTimeout(toastTimer);
  toastRoot.innerHTML = '';
  const element = document.createElement('div');
  element.className = `toast ${type}`;
  element.innerHTML = icon(type === 'error' ? 'alert' : 'check-circle');
  const text = document.createElement('span');
  text.textContent = message;
  element.appendChild(text);
  toastRoot.appendChild(element);
  requestAnimationFrame(() => element.classList.add('visible'));
  toastTimer = setTimeout(() => {
    element.classList.remove('visible');
    setTimeout(() => element.remove(), 250);
  }, 3200);
}

function closeModal() {
  modalRoot.innerHTML = '';
  document.body.classList.remove('modal-open');
}

function openModal(content, className = '') {
  modalRoot.innerHTML = `<div class="modal-backdrop" data-action="close-modal"><div class="modal ${className}" role="dialog" aria-modal="true" aria-label="对话框" data-modal-panel>${content}</div></div>`;
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => modalRoot.querySelector('button')?.focus());
}

function confirmDialog({ title, text, confirmText = '确认', danger = false }) {
  return new Promise((resolve) => {
    openModal(`<div class="confirm-modal"><div class="confirm-icon ${danger ? 'danger' : ''}">${icon(danger ? 'alert' : 'info')}</div><h2>${title}</h2><p>${text}</p><div class="modal-actions"><button class="button button-ghost" data-confirm="cancel">取消</button><button class="button ${danger ? 'button-danger' : 'button-primary'}" data-confirm="yes">${confirmText}</button></div></div>`);
    const handler = (event) => {
      const button = event.target.closest('[data-confirm]');
      if (!button) return;
      modalRoot.removeEventListener('click', handler);
      closeModal();
      resolve(button.dataset.confirm === 'yes');
    };
    modalRoot.addEventListener('click', handler);
  });
}

function switchPanel(panel) {
  ui.panel = panel;
  document.querySelectorAll('[data-panel]').forEach((button) => {
    const active = button.dataset.panel === panel;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  renderPanelOnly();
}

function addItem(section) {
  pushUndo();
  const factories = {
    experience: () => ({ id: createId(), company: '', role: '', start: '', end: '', current: false, description: '' }),
    projects: () => ({ id: createId(), name: '', role: '', start: '', end: '', description: '' }),
    education: () => ({ id: createId(), school: '', degree: '', major: '', start: '', end: '', description: '' }),
  };
  if (!factories[section]) return;
  state[section].push(factories[section]());
  renderAll();
  scheduleSave();
  const items = panelContent.querySelectorAll(`[data-section-name="${section}"][data-field]`);
  items[items.length - 1]?.focus();
}

function addSkill() {
  const input = document.querySelector('#skill-input');
  const skill = input?.value.trim();
  if (!skill) return input?.focus();
  if (state.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
    toast('这项技能已经添加过了', 'error');
    return;
  }
  if (state.skills.length >= 40) return toast('最多添加 40 项技能', 'error');
  pushUndo();
  state.skills.push(skill);
  renderAll();
  scheduleSave();
  document.querySelector('#skill-input')?.focus();
}

function showResetMenu() {
  openModal(`<div class="data-menu-modal"><div class="modal-heading"><div><span class="eyebrow">YOUR DATA</span><h2>简历数据管理</h2></div><button class="icon-button" data-action="close-modal" aria-label="关闭">${icon('close')}</button></div><p>当前内容已自动保存在浏览器中，你也可以随时备份。</p><div class="data-menu-options"><button data-action="load-sample"><span class="menu-option-icon">${icon('sparkle')}</span><span><strong>载入示例简历</strong><small>使用完整示例快速体验所有功能</small></span>${icon('chevron')}</button><button data-action="export"><span class="menu-option-icon">${icon('download')}</span><span><strong>导出 JSON 备份</strong><small>保存到本地，用于迁移或恢复</small></span>${icon('chevron')}</button><button data-action="new-resume"><span class="menu-option-icon danger">${icon('file')}</span><span><strong>新建空白简历</strong><small>清空当前内容，重新开始填写</small></span>${icon('chevron')}</button></div><div class="local-engine-note">${icon('info')}请勿在公共设备上保留个人敏感信息</div></div>`);
}

async function loadSample() {
  closeModal();
  if (!await confirmDialog({ title: '载入示例简历？', text: '当前简历会被示例内容替换，你仍可通过“撤销”恢复。', confirmText: '载入示例' })) return;
  pushUndo();
  state = sampleResume();
  ui.section = 'profile';
  renderAll();
  scheduleSave();
  toast('示例简历已载入');
}

async function newResume() {
  closeModal();
  if (!await confirmDialog({ title: '新建空白简历？', text: '当前内容将被清空。建议先导出备份，操作后也可以撤销。', confirmText: '新建简历', danger: true })) return;
  pushUndo();
  state = emptyResume();
  ui.section = 'profile';
  renderAll();
  scheduleSave();
  toast('已创建空白简历');
}

function showOptimize(section, id) {
  const item = state[section].find((entry) => entry.id === id);
  if (!item) return;
  const original = item.description.trim();
  if (!original) return toast('先填写工作内容，再使用智能优化', 'error');
  const optimized = optimizeBullet(original);
  openModal(`<div class="optimize-modal"><div class="modal-heading"><div><span class="eyebrow">SMART REFINE</span><h2>${icon('wand')}智能表达优化</h2></div><button class="icon-button" data-action="close-modal" aria-label="关闭">${icon('close')}</button></div><p class="optimize-intro">统一行动表达、分行与标点，让成果要点更清晰。优化不会新增数字或虚构经历。</p><div class="compare-grid"><section><div class="compare-label">优化前</div><div class="compare-text original">${escapeMultiline(original)}</div></section><section><div class="compare-label improved">${icon('sparkle')}优化后</div><div class="compare-text improved">${escapeMultiline(optimized)}</div></section></div><div class="local-engine-note">${icon('info')}本地规则仅调整表达，建议应用后再次核对事实与数据</div><div class="modal-actions"><button class="button button-ghost" data-action="close-modal">保留原文</button><button class="button button-primary" data-action="apply-optimize" data-section-name="${section}" data-id="${id}">${icon('check')}应用优化</button></div></div>`, 'wide-modal');
  modalRoot.dataset.optimized = optimized;
}

function escapeMultiline(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML.replace(/\n/g, '<br>');
}

function applyOptimize(section, id) {
  const item = state[section].find((entry) => entry.id === id);
  if (!item || !modalRoot.dataset.optimized) return;
  pushUndo();
  item.description = modalRoot.dataset.optimized;
  closeModal();
  renderAll();
  scheduleSave();
  toast('表达优化已应用');
}

async function importResume(file) {
  if (!file) return;
  try {
    if (file.size > 2 * 1024 * 1024) throw new Error('备份文件不能超过 2 MB');
    const imported = validateResume(JSON.parse(await file.text()));
    pushUndo();
    state = imported;
    ui.section = 'profile';
    closeModal();
    renderAll();
    scheduleSave();
    toast('简历备份已成功导入');
  } catch (error) {
    toast(error instanceof SyntaxError ? '无法读取文件，请选择有效的 JSON 备份' : error.message, 'error');
  }
}

async function handleAction(button, event) {
  const action = button.dataset.action;
  const { sectionName, id } = button.dataset;
  if (action === 'undo') {
    if (!undoStack.length) return;
    state = undoStack.pop();
    closeModal();
    renderAll();
    scheduleSave();
    toast('已撤销上一步');
  } else if (action === 'print') {
    clearTimeout(saveTimer);
    saveResume(state);
    const oldTitle = document.title;
    document.title = `${state.profile.name || '我的简历'}-${state.profile.title || '简历'}`;
    window.print();
    setTimeout(() => { document.title = oldTitle; }, 500);
  } else if (action === 'export') {
    closeModal();
    downloadJson(state);
    toast('JSON 备份已导出');
  } else if (action === 'import') {
    document.querySelector('#import-file').click();
  } else if (action === 'mobile-menu') {
    const menu = document.querySelector('#mobile-actions');
    menu.hidden = !menu.hidden;
  } else if (action === 'reset-menu') {
    document.querySelector('#mobile-actions').hidden = true;
    showResetMenu();
  } else if (action === 'close-modal') {
    if (button.classList.contains('modal-backdrop') && event.target.closest('[data-modal-panel]')) return;
    closeModal();
  } else if (action === 'add-item') {
    addItem(sectionName);
  } else if (action === 'delete-item') {
    if (await confirmDialog({ title: `删除这段${sectionLabels[sectionName]}？`, text: '删除后可通过撤销恢复，请确认是否继续。', confirmText: '删除', danger: true })) {
      pushUndo();
      state[sectionName] = state[sectionName].filter((item) => item.id !== id);
      renderAll();
      scheduleSave();
      toast('已删除，可通过撤销恢复');
    }
  } else if (action === 'move-item') {
    const index = state[sectionName].findIndex((item) => item.id === id);
    const nextIndex = button.dataset.direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || nextIndex < 0 || nextIndex >= state[sectionName].length) return;
    pushUndo();
    [state[sectionName][index], state[sectionName][nextIndex]] = [state[sectionName][nextIndex], state[sectionName][index]];
    renderAll();
    scheduleSave();
  } else if (action === 'optimize') {
    showOptimize(sectionName, id);
  } else if (action === 'apply-optimize') {
    applyOptimize(sectionName, id);
  } else if (action === 'add-skill') {
    addSkill();
  } else if (action === 'remove-skill') {
    pushUndo();
    state.skills.splice(Number(button.dataset.index), 1);
    renderAll();
    scheduleSave();
  } else if (action === 'go-section') {
    ui.section = button.dataset.section;
    switchPanel('editor');
  } else if (action === 'show-job') {
    ui.analysisTab = 'job';
    renderPanelOnly();
  } else if (action === 'clear-job') {
    state.jobDescription = '';
    renderPanelOnly();
    scheduleSave();
  } else if (action === 'load-sample') {
    await loadSample();
  } else if (action === 'new-resume') {
    await newResume();
  }
}

app.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.panel) return switchPanel(button.dataset.panel);
  if (button.dataset.section && !button.dataset.action) {
    ui.section = button.dataset.section;
    return renderPanelOnly();
  }
  if (button.dataset.analysisTab) {
    ui.analysisTab = button.dataset.analysisTab;
    return renderPanelOnly();
  }
  if (button.dataset.template) {
    state.settings.template = button.dataset.template;
    renderAll();
    return scheduleSave();
  }
  if (button.dataset.accent) {
    state.settings.accent = button.dataset.accent;
    renderAll();
    return scheduleSave();
  }
  if (button.dataset.density) {
    state.settings.density = button.dataset.density;
    renderAll();
    return scheduleSave();
  }
  if (button.dataset.action) await handleAction(button, event);
});

modalRoot.addEventListener('click', async (event) => {
  const button = event.target.closest('button, .modal-backdrop');
  if (button?.dataset.action) await handleAction(button, event);
});

app.addEventListener('input', (event) => {
  const target = event.target;
  if (target.dataset.profile) {
    state.profile[target.dataset.profile] = target.value;
    updateAfterInput();
  } else if (target.dataset.field && target.dataset.id) {
    const item = state[target.dataset.sectionName]?.find((entry) => entry.id === target.dataset.id);
    if (!item) return;
    item[target.dataset.field] = target.type === 'checkbox' ? target.checked : target.value;
    if (target.dataset.field === 'current' && target.checked) item.end = '';
    updateAfterInput({ refreshPanel: target.type === 'checkbox' });
  } else if (target.hasAttribute('data-job-description')) {
    state.jobDescription = target.value;
    scheduleSave();
    clearTimeout(analysisTimer);
    analysisTimer = setTimeout(() => {
      const scroll = panelContent.scrollTop;
      renderPanelOnly();
      panelContent.scrollTop = scroll;
      const textarea = panelContent.querySelector('[data-job-description]');
      textarea?.focus();
      textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
    }, 350);
  }
});

app.addEventListener('change', (event) => {
  if (event.target.id === 'import-file') {
    importResume(event.target.files[0]);
    event.target.value = '';
  } else if (event.target.dataset.profile || event.target.dataset.field) {
    if (ui.panel === 'editor') renderPanelOnly();
  }
});

app.addEventListener('keydown', (event) => {
  if (event.target.id === 'skill-input' && event.key === 'Enter') {
    event.preventDefault();
    addSkill();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modalRoot.innerHTML) closeModal();
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    saveResume(state);
    toast('简历已保存到当前浏览器');
  }
});

renderAll();
saveResume(state);
