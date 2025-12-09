// API functions
import { AppState, getSearchMode } from './state.js';
import {searchInput, showStatusMessage} from './dom.js';

export const fetchCategories = async function() {
  const res = await fetch(`${AppState.API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
};

export const fetchJoke = async function() {
  let joke = null;
  let result = [];
    
  switch (getSearchMode()) {
    case 'category':
      if (!AppState.selectedCategory) {
        showStatusMessage('Please select a category.', 'warning');
          return;
        }
        result = await fetch(`${AppState.API_BASE}/random?category=${encodeURIComponent(AppState.selectedCategory)}`);
        if (!result.ok) throw new Error('Failed to fetch joke by category');
        return result.json();

        case 'search':
          let queryTrimmed = searchInput.value.trim();
          if (!queryTrimmed) {
            showStatusMessage('Please enter search text.', 'warning');
            return;
          }
          result = await fetch(`${AppState.API_BASE}/search?query=${queryTrimmed}`);
          if (!result.ok) throw new Error('Failed to search jokes');  
          let searchResult = await result.json();
          
          // Get just first one joke, since it can be a thousands of them.
          joke = searchResult.total > 0 ? searchResult.result[0] : null;
          return joke;

        case 'random':
          result = await fetch(`${AppState.API_BASE}/random`);
          if (!result.ok) throw new Error('Failed to fetch random joke');
          return result.json();
    }

    return joke;
};