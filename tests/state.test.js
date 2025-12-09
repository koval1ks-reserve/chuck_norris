// state.test.js
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        removeItem: jest.fn(key => {
            delete store[key];
        }),
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import { AppState, getSearchMode, setSearchMode, setSelectedCategory, isFavourite, toggleFavouriteJoke } from '../js/state.js';

describe('State Module (state.js)', () => {
    
    beforeEach(() => {
        localStorageMock.clear();
        AppState.favouriteJokes.length = 0; 
        jest.clearAllMocks();
    });

    // --- LocalStorage Getters/Setters ---
    describe('Search Mode Persistence', () => {
        it('should correctly set the search mode in localStorage', () => {
            setSearchMode('search');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('chuckSearchMode', 'search');
        });

        it('should correctly get the search mode from localStorage', () => {
            localStorageMock.setItem('chuckSearchMode', 'category');
            const mode = getSearchMode();
            expect(mode).toBe('category');
        });
    });

    // --- AppState Mutators ---
    describe('AppState Mutators', () => {
        it('should set the selected category in AppState', () => {
            setSelectedCategory('career');
            expect(AppState.selectedCategory).toBe('career');
        });
    });

    // --- Favourite Jokes Logic ---
    describe('toggleFavouriteJoke', () => {
        const jokeA = { id: 'a', value: 'Joke A' };

        it('should add a joke to the list if it is not a favorite', () => {
            const isLiked = toggleFavouriteJoke(jokeA);
            expect(AppState.favouriteJokes).toHaveLength(1);
            expect(isLiked).toBe(true);
        });

        it('should remove a joke from the list if it is already a favorite', () => {
            AppState.favouriteJokes.push(jokeA);
            
            const isLiked = toggleFavouriteJoke(jokeA);
            expect(AppState.favouriteJokes).toHaveLength(0);
            expect(isLiked).toBe(false);
        });
    });

    describe('isFavourite', () => {
        it('should return true if the joke ID is in the favorite list', () => {
            AppState.favouriteJokes.push({ id: 'test1' });
            expect(isFavourite('test1')).toBe(true);
            expect(isFavourite('test2')).toBe(false);
        });
    });
});