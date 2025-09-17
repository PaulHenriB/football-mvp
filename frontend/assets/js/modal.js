/**
 * Weplay — Reusable Modal Component
 * ----------------------------------
 * Works across all pages (Dashboard, Matches, etc.)
 *
 * Usage in HTML:
 * <button data-modal-target="#scheduleModal">Open</button>
 *
 * <div id="scheduleModal" class="modal" aria-hidden="true">
 *   <div class="modal__overlay" data-modal-close></div>
 *   <div class="modal__content" role="dialog" aria-modal="true">
 *     <button class="modal__close" data-modal-close>&times;</button>
 *     <!-- Your modal content here -->
 *   </div>
 * </div>
 */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  let activeModal = null;

  /** Open modal by selector or element */
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("no-scroll");
    activeModal = modal;
  }

  /** Close current modal */
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("is-active");
    modal.setAttribute("aria-hidden", "true");
    body.classList.remove("no-scroll");
    activeModal = null;
  }

  /** Toggle modal (open/close) */
  function toggleModal(modal) {
    if (modal.classList.contains("is-active")) {
      closeModal(modal);
    } else {
      openModal(modal);
    }
  }

  /** Handle openers */
  document.querySelectorAll("[data-modal-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const selector = btn.getAttribute("data-modal-target");
      const modal = document.querySelector(selector);
      openModal(modal);
    });
  });

  /** Handle closers */
  document.querySelectorAll("[data-modal-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      closeModal(modal);
    });
  });

  /** ESC key closes active modal */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeModal) {
      closeModal(activeModal);
    }
  });

  // Expose helper functions globally if needed
  window.Modal = {
    open: (selectorOrEl) => {
      const modal =
        typeof selectorOrEl === "string"
          ? document.querySelector(selectorOrEl)
          : selectorOrEl;
      openModal(modal);
    },
    close: (selectorOrEl) => {
      const modal =
        typeof selectorOrEl === "string"
          ? document.querySelector(selectorOrEl)
          : selectorOrEl;
      closeModal(modal);
    },
    toggle: (selectorOrEl) => {
      const modal =
        typeof selectorOrEl === "string"
          ? document.querySelector(selectorOrEl)
          : selectorOrEl;
      toggleModal(modal);
    },
  };
});
