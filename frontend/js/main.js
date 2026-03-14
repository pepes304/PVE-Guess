import { showMessage } from './utils.js';

const BASE = window.__API_BASE__ || '';

// -- Simple API client
async function apiRegister(nickname, password) {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname, password })
  });
  return res;
}

async function apiLogin(username, password) {
  const body = new URLSearchParams();
  body.append('username', username);
  body.append('password', password);

  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  return res;
}

async function apiProfile(token) {
  const res = await fetch(`${BASE}/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res;
}

// -- Token storage
const TOKEN_KEY = 'pve_access_token';
function setToken(t) { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); }
function getToken() { return localStorage.getItem(TOKEN_KEY); }

// -- UI helpers
function createModal(title, onSubmit) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50';

  const box = document.createElement('div');
  box.className = 'modal-box bg-white p-6 rounded w-full max-w-md';

  const h = document.createElement('h3');
  h.className = 'text-lg font-semibold mb-4';
  h.textContent = title;

  const form = document.createElement('form');
  form.className = 'flex flex-col gap-3';

  const inpUser = document.createElement('input');
  inpUser.placeholder = 'Нікнейм';
  inpUser.className = 'p-2 border rounded';

  const inpPass = document.createElement('input');
  inpPass.type = 'password';
  inpPass.placeholder = 'Пароль';
  inpPass.className = 'p-2 border rounded';

  const row = document.createElement('div');
  row.className = 'flex gap-2 justify-end';

  const btnCancel = document.createElement('button');
  btnCancel.type = 'button';
  btnCancel.className = 'px-4 py-2 bg-gray-300 rounded';
  btnCancel.textContent = 'Скасувати';
  btnCancel.onclick = () => overlay.remove();

  const btnSubmit = document.createElement('button');
  btnSubmit.type = 'submit';
  btnSubmit.className = 'px-4 py-2 bg-blue-600 text-white rounded';
  btnSubmit.textContent = 'Відправити';

  form.appendChild(inpUser);
  form.appendChild(inpPass);
  row.appendChild(btnCancel);
  row.appendChild(btnSubmit);
  form.appendChild(row);

  form.onsubmit = async (e) => {
    e.preventDefault();
    await onSubmit(inpUser.value.trim(), inpPass.value);
    overlay.remove();
  };

  box.appendChild(h);
  box.appendChild(form);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  inpUser.focus();
}


async function refreshProfileUI() {
  const token = getToken();
  const profileInfo = document.getElementById('profileInfo');
  const btnLogin = document.getElementById('btnLogin');
  const btnRegister = document.getElementById('btnRegister');
  const btnLogout = document.getElementById('btnLogout');

  if (!token) {
    profileInfo.textContent = '';
    btnLogin.classList.remove('hidden');
    btnRegister.classList.remove('hidden');
    btnLogout.classList.add('hidden');
    return;
  }

  try {
    const res = await apiProfile(token);
    if (!res.ok) throw new Error('Not authenticated');
    const data = await res.json();
    profileInfo.textContent = `Привіт, ${data.nickname || data.nick || data.id}`;
    btnLogin.classList.add('hidden');
    btnRegister.classList.add('hidden');
    btnLogout.classList.remove('hidden');
  } catch (err) {
    setToken(null);
    profileInfo.textContent = '';
    btnLogin.classList.remove('hidden');
    btnRegister.classList.remove('hidden');
    btnLogout.classList.add('hidden');
  }
}

// -- Event wiring
document.addEventListener('DOMContentLoaded', () => {
  const btnLogin = document.getElementById('btnLogin');
  const btnRegister = document.getElementById('btnRegister');
  const btnLogout = document.getElementById('btnLogout');

  btnLogin.addEventListener('click', () => {
    createModal('Увійти', async (username, password) => {
      if (!username || !password) { showMessage('Заповніть поля'); return; }
      try {
        const res = await apiLogin(username, password);
        if (!res.ok) {
          const txt = await res.text();
          showMessage('Помилка входу');
          console.error('login failed', res.status, txt);
          return;
        }
        const data = await res.json();
        setToken(data.access_token);
        await refreshProfileUI();
        showMessage('Успішний вхід');
      } catch (e) {
        showMessage('Помилка мережі');
        console.error(e);
      }
    });
  });

  btnRegister.addEventListener('click', () => {
    createModal('Реєстрація', async (nickname, password) => {
      if (!nickname || !password) { showMessage('Заповніть поля'); return; }
      try {
        const res = await apiRegister(nickname, password);
        if (res.status === 409) {
          showMessage('Нікнейм зайнятий');
          return;
        }
        if (!res.ok) {
          showMessage('Помилка реєстрації');
          console.error('register failed', res.status);
          return;
        }
        showMessage('Реєстрація пройшла успішно');
      } catch (e) {
        showMessage('Помилка мережі');
        console.error(e);
      }
    });
  });

  btnLogout.addEventListener('click', async () => {
    setToken(null);
    await refreshProfileUI();
    showMessage('Ви вийшли');
  });

  refreshProfileUI();
});
