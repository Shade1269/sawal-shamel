export function getSessionId() {
  try {
    let id = localStorage.getItem('session_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('session_id', id);
    }
    return id;
  } catch {
    return 'anon-' + Math.random().toString(36).slice(2);
  }
}
