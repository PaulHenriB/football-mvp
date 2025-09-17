// frontend/assets/js/modal.js
// Reusable modal module: initModals(), openModal(selectorOrEl), closeModal(selectorOrEl)
// Dispatches custom events: 'modal:open' and 'modal:close' on document

const FOCUSABLE = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

let openModals = new Set();

function initModals() {
  // Openers: elements with data-modal-target attribute (value is a selector e.g. "#modal-schedule")
  document.querySelectorAll('[data-modal-target]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sel = btn.getAttribute('data-modal-target');
      const modal = document.querySelector(sel);
      if (modal) openModal(modal);
    });
  });

  // Closeers: elements inside modals with data-modal-close
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = btn.closest('.modal');
      if (modal) closeModal(modal);
    });
  });

  // Close by clicking overlay
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList && target.classList.contains('modal')) {
      closeModal(target);
    }
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      openModals.forEach(modal => closeModal(modal));
    }
  });
}

/* Focus trap and restore */
function trapFocus(modalEl) {
  const focusable = Array.from(modalEl.querySelectorAll(FOCUSABLE));
  const previouslyFocused = document.activeElement;
  if (focusable.length) focusable[0].focus();

  function handleTab(e) {
    if (e.key !== 'Tab') return;
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  document.addEventListener('keydown', handleTab);

  // cleanup function to remove key handler and restore focus
  function cleanup(e) {
    if (!e || !e.detail || e.detail.modal !== modalEl) return;
    document.removeEventListener('keydown', handleTab);
    document.removeEventListener('modal:close', cleanup);
    if (previouslyFocused && previouslyFocused.focus) {
      previouslyFocused.focus();
    }
  }

  document.addEventListener('modal:close', cleanup);
}

/* Open modal */
function openModal(modalOrSelector) {
  const modal = typeof modalOrSelector === 'string' ? document.querySelector(modalOrSelector) : modalOrSelector;
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  openModals.add(modal);

  // emit event for pages to react (e.g. move DOM nodes)
  document.dispatchEvent(new CustomEvent('modal:open', { detail: { modal } }));

  // trap focus
  trapFocus(modal);
}

/* Close modal */
function closeModal(modalOrSelector) {
  const modal = typeof modalOrSelector === 'string' ? document.querySelector(modalOrSelector) : modalOrSelector;
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  openModals.delete(modal);

  // emit close event
  document.dispatchEvent(new CustomEvent('modal:close', { detail: { modal } }));
}

/* Expose API for modules and classic scripts */
export { initModals, openModal, closeModal };

// global fallback for non-module pages that want to use window.Modal
if (typeof window !== 'undefined') {
  window.Modal = { initModals, openModal, closeModal };
  // Safe auto-init on DOM ready (idempotent)
  document.addEventListener('DOMContentLoaded', () => {
    try { initModals(); } catch (e) { /* ignore */ }
  });
}
