const STORAGE_KEY = 'jianzhi.resume.v1';

export function loadResume() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return validateResume(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveResume(resume) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
}

export function validateResume(value) {
  if (!value || typeof value !== 'object' || !value.profile || typeof value.profile !== 'object') {
    throw new Error('文件不是有效的简智简历数据');
  }
  const text = (input) => (typeof input === 'string' ? input : '');
  const list = (input) => (Array.isArray(input) ? input : []);
  const profileKeys = ['name', 'title', 'city', 'phone', 'email', 'website', 'summary'];
  const profile = Object.fromEntries(profileKeys.map((key) => [key, text(value.profile[key])]));
  const mapItems = (items, keys) => list(items).map((item, index) => {
    const result = { id: text(item?.id) || `imported-${Date.now()}-${index}` };
    keys.forEach((key) => {
      result[key] = key === 'current' ? Boolean(item?.[key]) : text(item?.[key]);
    });
    return result;
  });
  return {
    version: 1,
    profile,
    experience: mapItems(value.experience, ['company', 'role', 'start', 'end', 'current', 'description']),
    projects: mapItems(value.projects, ['name', 'role', 'start', 'end', 'description']),
    education: mapItems(value.education, ['school', 'degree', 'major', 'start', 'end', 'description']),
    skills: list(value.skills).filter((skill) => typeof skill === 'string').map((skill) => skill.trim()).filter(Boolean).slice(0, 40),
    jobDescription: text(value.jobDescription),
    settings: {
      template: ['modern', 'classic'].includes(value.settings?.template) ? value.settings.template : 'modern',
      accent: /^#[0-9a-f]{6}$/i.test(value.settings?.accent || '') ? value.settings.accent : '#2f6f61',
      density: ['comfortable', 'compact'].includes(value.settings?.density) ? value.settings.density : 'comfortable',
    },
  };
}

export function downloadJson(resume) {
  const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${resume.profile.name || '我的简历'}-简智备份.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
