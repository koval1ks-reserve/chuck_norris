// Rendering functions
import {categoriesContainer, cardTemplate, mainJokeContainer, favouritesList, favouritesMobileList} from './dom.js';
import { AppState, isFavourite } from './state.js';

export function renderCategoriesButtons(categories) {
  categoriesContainer.innerHTML = categories
    .map(category => `<button class="btn btn-sm category-btn" data-category="${category}">${category}</button>`)
    .join('');
}

export function createJokeCardElement(joke) {
  const jokeElementTemplate = cardTemplate.innerHTML;
  const jokeCardTemplate = document.createElement('div');
  jokeCardTemplate.innerHTML = jokeElementTemplate;
  const jokeElement = jokeCardTemplate.querySelector('.joke-card');

  if (!jokeElement) return jokeCardTemplate.firstChild || document.createElement('div');

  jokeElement.setAttribute('data-joke-object', JSON.stringify(joke));

  jokeCardTemplate.querySelector('.joke-id a').innerText = joke.id;
  jokeCardTemplate.querySelector('.joke-id a').href = joke.url;
  jokeCardTemplate.querySelector('.joke-text').innerText = joke.value;
  jokeCardTemplate.querySelector('.hours-ago').innerText = calculateHoursAgo(joke.updated_at);

  if (joke.categories && joke.categories.length) {
    const categoryBadge = jokeCardTemplate.querySelector('.joke-category');
    categoryBadge.innerText = joke.categories[0];
    categoryBadge.classList.remove('d-none');
  }

  const heartBtn = jokeCardTemplate.querySelector('.fav-heart-btn');
  if (isFavourite(joke.id)) heartBtn.classList.add('active');

  return jokeElement;
}

export function renderMainJoke(joke) {
  mainJokeContainer.innerHTML = '';
  mainJokeContainer.appendChild(createJokeCardElement(joke));
}

export function renderFavouriteJokesList() {
    favouritesList.innerHTML = '';
    favouritesMobileList.innerHTML = '';
    AppState.favouriteJokes.forEach(j => {
        const jokeElement = createJokeCardElement(j);
        const mobileClone = jokeElement.cloneNode(true);
        favouritesList.appendChild(jokeElement);
        favouritesMobileList.appendChild(mobileClone);
    });
}

export function updateFavouriteJokesList(joke, liked) {
    if (liked) {
        // Add to favourites
        const jokeCard = createJokeCardElement(joke);
        const mobileClone = jokeCard.cloneNode(true);
        favouritesList.insertBefore(jokeCard, favouritesList.firstChild);
        favouritesMobileList.insertBefore(mobileClone, favouritesMobileList.firstChild);
    } else {
        // Remove from favourites
        const selector = `.joke-card[data-joke-object*="${joke.id}"]`;
        const favJokeCard = favouritesList.querySelector(selector);
        const favJokeMobileCard = favouritesMobileList.querySelector(selector);
        if (favJokeCard) { favJokeCard.remove(); }
        if (favJokeMobileCard) { favJokeMobileCard.remove(); }
    }
}

/**
 * Calculates the time difference in hours between the current time and a given date string.
 * This function includes a crucial polyfill/fix for older browsers like Internet Explorer 10 (IE10)
 * which frequently fail to parse modern ISO 8601 date formats (e.g., those containing 'T' and 'Z').
 */
function calculateHoursAgo(dateString) {    

  if (!dateString) {
      return '0 hours ago'; 
    }

  const updated = new Date(dateString);

  // Check if standard parsing failed (IE10 compatibility issue)
  if (isNaN(updated.getTime())) {

    // IE10 FIX: Manual cleanup and parsing.
    // Truncate all microseconds/milliseconds (the part after the dot).
    let safeDateString = dateString.split('.')[0];

    // Ensure YYYY/MM/DD HH:mm:ss format.
    safeDateString = safeDateString.replace(/-/g, "/");

    const manuallyParsedDate = new Date(safeDateString);
        
    if (!isNaN(manuallyParsedDate.getTime())) {
      return calculateDifference(manuallyParsedDate);
    } else {
      return 0; 
      }
    }
    
    return calculateDifference(updated);
}

function calculateDifference(updated) {
    const now = new Date();
    const diffMs = now - updated;
    
    if (diffMs < 0) return 0;

    // Convert milliseconds to hours (1000 * 60 * 60 = 3600000 ms per hour)
    return Math.floor(diffMs / (1000 * 60 * 60));
}