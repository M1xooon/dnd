import { saveState } from './storage.js';

function createEl(tag, cls, text){
  const el = document.createElement(tag);
  if(cls) el.className = cls;
  if(text !== undefined) el.textContent = text;
  return el;
}

export function buildBoard(root, state, handlers){

  root.innerHTML = ''; 

  const board = createEl('div','board');

  state.columns.forEach(column => {
    const col = createEl('div','column');
    col.dataset.columnId = column.id;

    const header = createEl('div','column-header', column.title);
    col.append(header);

    const cardsWrap = createEl('div','cards');
    column.cards.forEach(card => {
      const cardEl = createCardEl(card);
      cardsWrap.append(cardEl);
    });

    const footer = createEl('div', 'column-footer');
const addBtn = createEl('button', 'add-btn', 'Add another card');
footer.append(addBtn);


addBtn.addEventListener('click', () => {

  if (footer.querySelector('.card-input')) return;

  addBtn.style.display = 'none';

  const inputContainer = createEl('div', 'add-card-container');
  const input = createEl('textarea', 'card-input');
  input.placeholder = 'Enter card text...';

  const addCardBtn = createEl('button', 'confirm-btn', 'Add card');
  const cancelBtn = createEl('button', 'cancel-btn', 'Cancel');

  inputContainer.append(input, addCardBtn, cancelBtn);
  footer.append(inputContainer);

  input.focus();

  addCardBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (text) {
      const newCard = {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
        text,
      };
      column.cards.push(newCard);
      saveState(state);
      buildBoard(root, state, handlers);
    }
  });

  cancelBtn.addEventListener('click', () => {
    inputContainer.remove();
    addBtn.style.display = 'block';
  });
  });

    footer.append(addBtn);

    col.append(cardsWrap, footer);
    board.append(col);
  });

  root.append(board);


  function createCardEl(card) {
  const el = createEl('div', 'card');
  el.dataset.cardId = card.id;

  const textEl = createEl('div', 'card-text', card.text);
  el.append(textEl);

  const del = createEl('button', 'delete', '✕');
  del.setAttribute('aria-label', 'delete');

  ['pointerdown', 'mousedown', 'click'].forEach(evt =>
    del.addEventListener(evt, e => e.stopPropagation())
  );

  del.addEventListener('click', () => {
    state.columns.forEach(c => {
      const idx = c.cards.findIndex(x => x.id === card.id);
      if (idx !== -1) {
        c.cards.splice(idx, 1);
      }
    });
    saveState(state);
    buildBoard(root, state, handlers);
  });

  el.append(del);

  el.addEventListener('pointerdown', (ev) => {
    if (ev.button !== 0) return;
    handlers.onStartDrag(ev, el, card);
  });

  return el;
}


  return board;
}
