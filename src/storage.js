const STORAGE_KEY = 'ahj:dnd:board:v1';

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      columns: [
        { id: 'col-1', title: 'To Do', cards: [] },
        { id: 'col-2', title: 'In Progress', cards: [] },
        { id: 'col-3', title: 'Done', cards: [] }
      ]
    };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {
      columns: [
        { id: 'col-1', title: 'To Do', cards: [] },
        { id: 'col-2', title: 'In Progress', cards: [] },
        { id: 'col-3', title: 'Done', cards: [] }
      ]
    };
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
