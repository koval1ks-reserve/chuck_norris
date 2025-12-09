// DOM references.
export const radioButtons = document.querySelectorAll('input[name="searchMode"]');
export const categoriesContainer = document.getElementById('categories-container');
export const searchInput = document.getElementById('search-input');
export const getJokeButton = document.getElementById('get-joke-btn');
export const mainJokeContainer = document.getElementById('main-joke-container');
export const favouritesList = document.getElementById('favourites-list-content');
export const favouritesMobileList = document.getElementById('favourites-list-mobile');
export const cardTemplate = document.getElementById('joke-card-template');
export const favouriteJokesModal = document.getElementById('favourite-modal')

let statusTimerId = null;

function getStatusArea() {
  return document.getElementById('status-area');
}

export function clearStatusMessage() {
  if (statusTimerId) {
    clearTimeout(statusTimerId);
    statusTimerId = null;
  }
  const statusArea = getStatusArea();
  if (statusArea) statusArea.innerHTML = '';
}

export function showStatusMessage(message, type = 'warning', { autoHideMs = 2000 } = {}) {
  // Early return if no container for status in the DOM structure.
  const statusArea = getStatusArea();
  if (!statusArea) return;

  clearStatusMessage();

  const alertDomElement = document.createElement('div');
  alertDomElement.className = `alert alert-${type} alert-dismissible fade show`;
  alertDomElement.setAttribute('role', 'alert');
  alertDomElement.textContent = message;

  // Creating button to close alert.
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn-close';
  btn.setAttribute('data-bs-dismiss', 'alert');
  btn.setAttribute('aria-label', 'Close');
  btn.addEventListener('click', () => clearStatusMessage());

  alertDomElement.appendChild(btn);
  statusArea.appendChild(alertDomElement);

  if (autoHideMs > 0) {
    statusTimerId = setTimeout(() => {
      clearStatusMessage();
    }, autoHideMs);
  }
}
