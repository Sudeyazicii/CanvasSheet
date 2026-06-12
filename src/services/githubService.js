/**
 * GitHub API Service
 * Yüklenen veriyi (CSV) doğrudan kullanıcının GitHub reposuna commit eder.
 */
export async function commitToGitHub({ token, owner, repo, path, content, message }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  let sha = null;
  
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
    if (res.ok) {
      const data = await res.json();
      sha = data.sha;
    }
  } catch (e) {
    // Dosya henüz mevcut olmayabilir
  }

  // Base64 encoding (UTF-8 destekli)
  const base64Content = btoa(unescape(encodeURIComponent(content)));

  const body = {
    message: message || 'Canvas Sheet ile veri güncellemesi',
    content: base64Content
  };
  
  if (sha) {
    body.sha = sha;
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `HTTP ${res.status}`);
  }

  return await res.json();
}
