/* ==========================================================================
   ORBIT — Shared Toast / Modal Feedback
   ========================================================================== */

export function showToast(title, body, timeout = 3600) {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <svg class="toast-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
      <path d="M10 6.5V10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="13.2" r="0.9" fill="currentColor"/>
    </svg>
    <div>
      <p class="toast-title">${title}</p>
      <p class="toast-body">${body}</p>
    </div>
  `;
  stack.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-shown'));

  window.setTimeout(() => {
    toast.classList.remove('is-shown');
    window.setTimeout(() => toast.remove(), 250);
  }, timeout);
}

export function showModal(title, body) {
  const overlay = document.getElementById('modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  if (!overlay || !titleEl || !bodyEl) return;

  titleEl.textContent = title;
  bodyEl.textContent = body;
  overlay.classList.add('is-shown');
  overlay.setAttribute('aria-hidden', 'false');

  document.getElementById('modal-close')?.focus();
}

export function hideModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('is-shown');
  overlay.setAttribute('aria-hidden', 'true');
}

export function initModal() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  closeBtn?.addEventListener('click', hideModal);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) hideModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideModal();
  });
}
