const Modal = {
  create(options) {
    const { title = 'หัวข้อ', body = '', footer = '' } = options;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'modal-overlay-dynamic';

    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';

    const modalTitle = document.createElement('h2');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = title;

    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close-btn';
    closeButton.innerHTML = '&times;';

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalBody.innerHTML = body;

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    modalContainer.appendChild(modalHeader);
    modalContainer.appendChild(modalBody);

    if (footer) {
      const modalFooter = document.createElement('div');
      modalFooter.className = 'modal-footer';
      modalFooter.innerHTML = footer;
      modalContainer.appendChild(modalFooter);
    }

    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => {
        if(document.body.contains(modalOverlay)) {
            document.body.removeChild(modalOverlay);
        }
      }, 300);
    };

    closeButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 10);

    return {
      close: closeModal,
      modalElement: modalOverlay
    };
  }
};
