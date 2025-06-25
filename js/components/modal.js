const Modal = {
  create(options) {
    const { title = 'หัวข้อ', body = '', footer = '' } = options;
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'modal-overlay-dynamic';
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    modalContainer.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="modal-close-btn">&times;</button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    `;
    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);
    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => { if (document.body.contains(modalOverlay)) { document.body.removeChild(modalOverlay); } }, 300);
    };
    modalOverlay.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
    setTimeout(() => modalOverlay.classList.add('active'), 10);
    return { close: closeModal, modalElement: modalOverlay };
  }
};
export { Modal };
