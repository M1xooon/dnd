import { saveState } from './storage.js';

export function enableDnD(root, state, rebuildBoard){
  let dragging = null; 
  const boardEl = root.querySelector('.board');

  function getColumnElFromPoint(x,y){
    const el = document.elementFromPoint(x,y);
    if(!el) return null;
    return el.closest('.column');
  }

  function createGhost(el, offsetX, offsetY){
    const rect = el.getBoundingClientRect();
    const ghost = el.cloneNode(true);
    ghost.classList.add('ghost');
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    ghost.style.left = (rect.left) + 'px';
    ghost.style.top = (rect.top) + 'px';
    ghost.style.transform = 'none';
    document.body.appendChild(ghost);
    return ghost;
  }

  function onPointerMove(e){
    if(!dragging) return;
    e.preventDefault();
    const { ghost, offsetX, offsetY } = dragging;
    ghost.style.left = (e.pageX - offsetX) + 'px';
    ghost.style.top = (e.pageY - offsetY) + 'px';

    const col = getColumnElFromPoint(e.clientX, e.clientY);
    document.querySelectorAll('.placeholder').forEach(p => p.remove());

    if(!col){
      return;
    }
    const cardsWrap = col.querySelector('.cards');
    const children = Array.from(cardsWrap.children);
    let inserted = false;
    for(const child of children){
      const rect = child.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      if(e.clientY < midpoint){
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        placeholder.style.height = rect.height + 'px';
        cardsWrap.insertBefore(placeholder, child);
        inserted = true;
        break;
      }
    }
    if(!inserted){
      const placeholder = document.createElement('div');
      placeholder.className = 'placeholder';
      placeholder.style.height = (ghost.getBoundingClientRect().height) + 'px';
      cardsWrap.appendChild(placeholder);
    }
  }

  function onPointerUp(e){
    if(!dragging) return;
    const { cardId, fromColumnId, ghost } = dragging;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

    const placeholder = document.querySelector('.placeholder');
    if(placeholder){
      const colEl = placeholder.closest('.column');
      const targetColumnId = colEl.dataset.columnId;

      let cardObj = null;
      for(const col of state.columns){
        const idx = col.cards.findIndex(c=> c.id === cardId);
        if(idx !== -1){
          cardObj = col.cards.splice(idx,1)[0];
          break;
        }
      }

      const cardsWrap = colEl.querySelector('.cards');
      const beforeEl = placeholder.nextElementSibling;
      if(beforeEl){

        const siblingCardId = beforeEl.dataset.cardId;
        const colState = state.columns.find(c => c.id === targetColumnId);
        const insertIdx = colState.cards.findIndex(c => c.id === siblingCardId);
        colState.cards.splice(insertIdx, 0, cardObj);
      } else {
        const colState = state.columns.find(c => c.id === targetColumnId);
        colState.cards.push(cardObj);
      }

      placeholder.remove();
      saveState(state);
      rebuildBoard();
    } else {

      rebuildBoard();
    }

    ghost.remove();
    dragging = null;
    document.body.style.cursor = '';
  }

  function startDrag(ev, cardEl, card){
    ev.preventDefault();
    const cardId = card.id;
    const fromColumnEl = cardEl.closest('.column');
    const fromColumnId = fromColumnEl.dataset.columnId;
    const rect = cardEl.getBoundingClientRect();
    const offsetX = ev.pageX - rect.left;
    const offsetY = ev.pageY - rect.top;

    const ghost = createGhost(cardEl, offsetX, offsetY);
   
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    placeholder.style.height = rect.height + 'px';
    cardEl.replaceWith(placeholder); 
    dragging = { cardId, fromColumnId, originalEl: cardEl, placeholder, ghost, offsetX, offsetY };
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.body.style.cursor = 'grabbing';
  }

  return { startDrag };
}
