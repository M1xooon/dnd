import { saveState } from './storage.js';

export function enableDnD(root, state, rebuildBoard) {
  let dragging = null;

  function createGhost(el, offsetX, offsetY) {
    const rect = el.getBoundingClientRect();
    const ghost = el.cloneNode(true);
    ghost.classList.add('ghost');
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    ghost.style.position = 'absolute';
    ghost.style.left = rect.left + 'px';
    ghost.style.top = rect.top + 'px';
    ghost.style.zIndex = '1000';
    ghost.style.pointerEvents = 'none';
    document.body.append(ghost);
    return ghost;
  }

  function onPointerMove(ev) {
    if (!dragging) return;
    ev.preventDefault();

    const { ghost, offsetX, offsetY, placeholder } = dragging;
    ghost.style.left = ev.pageX - offsetX + 'px';
    ghost.style.top = ev.pageY - offsetY + 'px';

    const elemBelow = document.elementFromPoint(ev.clientX, ev.clientY);
    if (!elemBelow) return;

    const column = elemBelow.closest('.column');
    if (!column) return;

    const cardsWrap = column.querySelector('.cards');
    const cardBelow = elemBelow.closest('.card');

    if (cardBelow && cardBelow.parentElement === cardsWrap) {
      const rect = cardBelow.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (ev.clientY < midY) {
        cardBelow.before(placeholder);
      } else {
        cardBelow.after(placeholder);
      }
    } else {
      cardsWrap.append(placeholder);
    }
  }

  function onPointerUp(ev) {
    if (!dragging) return;

    const { cardId, fromColumnId, ghost, placeholder } = dragging;
    ghost.remove();

    const toColumnEl = placeholder.closest('.column');
    const toColumnId = toColumnEl ? toColumnEl.dataset.columnId : fromColumnId;

    let movedCard = null;
    for (const col of state.columns) {
      const idx = col.cards.findIndex(c => c.id === cardId);
      if (idx !== -1) {
        movedCard = col.cards.splice(idx, 1)[0];
        break;
      }
    }

    if (movedCard) {
      const colState = state.columns.find(c => c.id === toColumnId);
      const beforeCardEl = placeholder.nextElementSibling;
      if (beforeCardEl) {
        const beforeId = beforeCardEl.dataset.cardId;
        const insertIdx = colState.cards.findIndex(c => c.id === beforeId);
        colState.cards.splice(insertIdx, 0, movedCard);
      } else {
        colState.cards.push(movedCard);
      }
    }

    placeholder.remove();
    saveState(state);
    rebuildBoard();

    dragging = null;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  }

  function startDrag(ev, cardEl, card) {
    if (ev.button !== 0) return;
    ev.preventDefault();

    const fromColumnEl = cardEl.closest('.column');
    if (!fromColumnEl) return;

    const fromColumnId = fromColumnEl.dataset.columnId;
    const rect = cardEl.getBoundingClientRect();
    const offsetX = ev.pageX - rect.left;
    const offsetY = ev.pageY - rect.top;

    const ghost = createGhost(cardEl, offsetX, offsetY);

    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    placeholder.style.height = rect.height + 'px';

    cardEl.replaceWith(placeholder);

    dragging = { cardId: card.id, fromColumnId, ghost, placeholder, offsetX, offsetY };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  return { startDrag };
}
