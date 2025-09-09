import './index.css';
import { loadState, saveState } from './storage.js';
import { buildBoard } from './board.js';
import { enableDnD } from './dnd.js';

const root = document.getElementById('board-root');
let state = loadState();

function rebuild(){
  buildBoard(root, state, {
    onStartDrag: (ev, el, card) => {
      const dnd = dndManager; 
      dnd.startDrag(ev, el, card);
    }
  });
}

let dndManager = null;

function init(){
  buildBoard(root, state, {
    onStartDrag: (ev, el, card) => {
      dndManager.startDrag(ev, el, card);
    }
  });

  dndManager = enableDnD(root, state, () => {
    buildBoard(root, state, {
      onStartDrag: (ev, el, card) => {
        dndManager.startDrag(ev, el, card);
      }
    });
  });
}

init();
