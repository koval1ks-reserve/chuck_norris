export const FAVOURITE_JOKES_STORAGE_KEY = 'chuckFavs';
const SEARCH_MODE_STORAGE_KEY = 'chuckSearchMode';
const DEFAULT_SEARCH_MODE = 'random';

// Application state and persistence
export const AppState = {
  API_BASE: 'https://api.chucknorris.io/jokes',
  selectedCategory: null,
  favouriteJokes: JSON.parse(localStorage.getItem(FAVOURITE_JOKES_STORAGE_KEY)) || [],
  categoriesLoaded: false,
  categories: []
};

/**
 * Sets the current search mode in localStorage.
 */
export function setSearchMode(newSearchMode) {
  localStorage.setItem(SEARCH_MODE_STORAGE_KEY, newSearchMode);
}

/**
 * Retrieves the current search mode from localStorage.
 */
export function getSearchMode() {
  return localStorage.getItem(SEARCH_MODE_STORAGE_KEY) || DEFAULT_SEARCH_MODE;
}

/**
 * Sets the currently selected category in the app state.
 */
export function setSelectedCategory(category) {
  AppState.selectedCategory = category;
}

/**
 * Checks if a joke is currently marked as a favourite.
 */
export function isFavourite(jokeId) {
  return AppState.favouriteJokes.some(j => j.id === jokeId);
}

/**
 * Toggles the favourite status of a joke (adds or removes it).
 */
export function toggleFavouriteJoke(joke) {
  const idx = AppState.favouriteJokes.findIndex(j => j.id === joke.id);
  if (idx === -1) {
    AppState.favouriteJokes.unshift(joke);
  } else {
    AppState.favouriteJokes.splice(idx, 1);
  }
  localStorage.setItem(FAVOURITE_JOKES_STORAGE_KEY, JSON.stringify(AppState.favouriteJokes));
  return idx === -1;
}