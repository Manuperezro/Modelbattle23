/* SDLC Models Challenge - Robust Dual Input Handler (Drag & Click-to-Place) */

class DualInputHandler {
  constructor() {
    this.selectedItem = null;
    this.callbackMap = new Map();
    this.initListeners();
  }

  initListeners() {
    // CLICK / TAP CONTROLLER
    document.addEventListener('click', (e) => {
      const dragItem = e.target.closest('.drag-item');
      const dropTarget = e.target.closest('.waterfall-slot, .drop-target, .v-node-btn');

      // Click on draggable item
      if (dragItem) {
        window.soundEngine.playClick();
        
        if (this.selectedItem === dragItem) {
          // Deselect
          this.deselectAll();
        } else {
          this.deselectAll();
          this.selectedItem = dragItem;
          dragItem.classList.add('selected');
        }
        return;
      }

      // Click on drop slot while item is selected
      if (dropTarget && this.selectedItem) {
        window.soundEngine.playPlace();
        
        const itemData = this.selectedItem.dataset.id || this.selectedItem.innerText.trim();
        const slotData = dropTarget.dataset.slotId || dropTarget.id;

        const currentMission = window.gameState ? window.gameState.currentMission : null;
        if (currentMission && this.callbackMap.has(currentMission)) {
          this.callbackMap.get(currentMission)(this.selectedItem, dropTarget, itemData, slotData);
        }

        this.deselectAll();
        return;
      }

      // Click outside -> deselect
      if (!dragItem && !dropTarget && this.selectedItem) {
        this.deselectAll();
      }
    });

    // NATIVE DRAG & DROP CONTROLLER
    document.addEventListener('dragstart', (e) => {
      const dragItem = e.target.closest('.drag-item');
      if (dragItem) {
        dragItem.classList.add('dragging');
        e.dataTransfer.setData('text/plain', dragItem.dataset.id || dragItem.innerText.trim());
        e.dataTransfer.effectAllowed = 'move';
        window.soundEngine.playClick();
      }
    });

    document.addEventListener('dragend', (e) => {
      const dragItem = e.target.closest('.drag-item');
      if (dragItem) {
        dragItem.classList.remove('dragging');
      }
    });

    document.addEventListener('dragover', (e) => {
      const dropTarget = e.target.closest('.waterfall-slot, .drop-target');
      if (dropTarget) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        dropTarget.classList.add('highlight');
      }
    });

    document.addEventListener('dragleave', (e) => {
      const dropTarget = e.target.closest('.waterfall-slot, .drop-target');
      if (dropTarget) {
        dropTarget.classList.remove('highlight');
      }
    });

    document.addEventListener('drop', (e) => {
      const dropTarget = e.target.closest('.waterfall-slot, .drop-target');
      if (dropTarget) {
        e.preventDefault();
        dropTarget.classList.remove('highlight');

        const draggingEl = document.querySelector('.drag-item.dragging') || this.selectedItem;
        const itemData = e.dataTransfer.getData('text/plain') || (draggingEl ? draggingEl.dataset.id : '');
        const slotData = dropTarget.dataset.slotId || dropTarget.id;

        window.soundEngine.playPlace();
        
        const currentMission = window.gameState ? window.gameState.currentMission : null;
        if (currentMission && this.callbackMap.has(currentMission) && draggingEl) {
          this.callbackMap.get(currentMission)(draggingEl, dropTarget, itemData, slotData);
        }
        this.deselectAll();
      }
    });
  }

  deselectAll() {
    document.querySelectorAll('.drag-item.selected').forEach(el => el.classList.remove('selected'));
    this.selectedItem = null;
  }

  registerMissionCallback(missionNum, callback) {
    this.callbackMap.set(missionNum, callback);
  }
}

window.dualInputHandler = new DualInputHandler();
