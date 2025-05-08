const BASE_URL = 'https://your-new-app-name.azurewebsites.net';

export async function loginUser(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error('Login failed');
  return await res.json(); // { access_token, token_type }
}

export async function getUserInfo(token) {
  const res = await fetch(`${BASE_URL}/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Invalid token');
  return await res.json();
}

export async function getUserCredits(token) {
  const res = await fetch(`${BASE_URL}/user/me/credits`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Could not fetch credits');
  return await res.json(); // { credits: number }
}
