import api from './api/api';

export async function signup(email, username, password, password2) {
  const res = await api.post('accounts/signup/', {
    email, username, password, password2
  });
  return res.data;
}

export async function login(username, password) {
  const res = await api.post('accounts/login/', { username, password });
  localStorage.setItem('access', res.data.access);
  localStorage.setItem('refresh', res.data.refresh);
}

export function logout() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
}

export async function getProfile() {
  const res = await api.get('accounts/me/');
  return res.data;
}
