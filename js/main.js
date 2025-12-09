'use strict';

// Polyfils for EI compatibility,
import 'core-js/modules/es.json.stringify';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'whatwg-fetch'
import 'element-closest-polyfill'
import 'template-element';
import 'element-remove';
import '../scss/style.scss';

import { radioButtons, categoriesContainer, searchInput, getJokeButton, mainJokeContainer, showStatusMessage, clearStatusMessage, favouriteJokesModal } from './dom.js';
import { AppState, setSearchMode, getSearchMode, setSelectedCategory, toggleFavouriteJoke} from './state.js';
import { fetchCategories, fetchJoke} from './api.js';
import { renderCategoriesButtons, renderMainJoke, renderFavouriteJokesList, updateFavouriteJokesList} from './render.js';

function attachEventListeners() {

  const handleRadioChange = async function(e) {
    if (!e.target || e.target.type !== 'radio' || !e.target.checked) {
        return;
    }
    setSearchMode(e.target.value); 
    clearStatusMessage();
    await updateControlsVisibility(e.target); 
  };

  // Search joke mode change.
  radioButtons.forEach(function (radio) {
    radio.addEventListener('change', handleRadioChange); 
  });

  // Category click (delegation).
  categoriesContainer.addEventListener('click', e => {
    const btn = e.target.closest('.category-btn');
    if (!btn) return;

    // Remove active class from other buttons, since we're switching categories.
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active', 'bg-light', 'text-dark'));
    btn.classList.add('active', 'bg-light', 'text-dark');
    // Store selected category.
    setSelectedCategory(btn.getAttribute('data-category'));
    clearStatusMessage();
  });

  // Heart click delegation (add/remove favourite)
  document.body.addEventListener('click', e => {
    const heartBtn = e.target.closest('.fav-heart-btn');
    if (!heartBtn) return;
    const jokeCard = heartBtn.closest('.joke-card');
    const jokeData = JSON.parse(jokeCard.getAttribute('data-joke-object'));
    const likedJoke = toggleFavouriteJoke(jokeData);
    
    // We don't need to render all favorite jokes again, just update the one we just liked/unliked.
    updateFavouriteJokesList(jokeData, likedJoke);

    // Update other joke cards.
    const mainJokeCard = mainJokeContainer.querySelector('.joke-card');
    if (mainJokeCard) {
      // Usually we use 'dataset', but for EI-10, we should use getAttribute().
      const mainJokeCardData = JSON.parse(mainJokeCard.getAttribute('data-joke-object'));
      if (mainJokeCardData.id === jokeData.id) {
        mainJokeCard.querySelector('.fav-heart-btn').classList.toggle('active', likedJoke);
      }
    }

  });

  // Get a joke button
  getJokeButton.addEventListener('click', onGetJokeClick);
  // Clear status when user enters something in search
  searchInput.addEventListener('input', () => clearStatusMessage());
}

async function loadCategoriesIfNeeded() {
  if (AppState.categoriesLoaded) {
    renderCategoriesButtons(AppState.categories);
    return;
  }
  try {
    categoriesContainer.innerHTML = `
    <div class="spinner-border spinner-border-sm text-secondary" role="status">
      <span class="visually-hidden">Loading...</span>
     </div>`;

    const categories = await fetchCategories();
    AppState.categories = categories;
    AppState.categoriesLoaded = true;
    renderCategoriesButtons(categories);
    } catch (e) {
      console.error('Error fetching categories:', e);
      categoriesContainer.innerHTML = '<p class="text-danger">Failed to load categories.</p>';
    }
}

async function onGetJokeClick() {
  clearStatusMessage();
  getJokeButton.disabled = true;

  try {
    let joke = await fetchJoke();
    if (joke) {
      renderMainJoke(joke);
    }
  } catch (e) {
    console.error('Error fetching joke:', e);
    showStatusMessage('Something went wrong. Try again', 'warning');
  } finally {
    getJokeButton.disabled = false;
  }
}

async function updateControlsVisibility(activeRadioElement) {

  // Early return.
  if (!activeRadioElement) {
    return;
  }

  const allSearchControlContainers = document.querySelectorAll('.js-search-control-target'); 
  let currentSearchContainerId = null;
  const controlsValue = activeRadioElement.getAttribute('data-controls'); 

  if (controlsValue !== null && controlsValue !== "") {
    currentSearchContainerId = controlsValue; 
  }

  allSearchControlContainers.forEach(container => {
    const shouldBeVisible = container.id === currentSearchContainerId;
    const action = shouldBeVisible ? 'remove' : 'add'; 
    container.classList[action]('d-none');
  });

  const currentSearchMode = getSearchMode();
  if (currentSearchMode === 'category') {
    await loadCategoriesIfNeeded();
  }
}

function init() {
  // Get favourite jokes from local storage, and render them.
  renderFavouriteJokesList();
  attachEventListeners();

  // When a user selects a radio button and reloads the page, 
  // we must remember which radio they selected last and update the visibility of the associated elements. 
  // For example, for the radio button "From categories", we must reload the categories.
  const savedSearchMode = getSearchMode();
  const activeRadioElement = document.querySelector(`input[name="searchMode"][value="${savedSearchMode}"]`);
  if (activeRadioElement) {
    activeRadioElement.checked = true;
    updateControlsVisibility(activeRadioElement);
  }
}

init();