import * as State from '../js/state.js';
import * as Dom from '../js/dom.js'; 
import { renderCategoriesButtons, createJokeCardElement, renderMainJoke, renderFavouriteJokesList, updateFavouriteJokesList } from '../js/render.js';

const mockCalculateHoursAgo = jest.fn(dateString => {
    if (dateString === undefined || dateString === null) return '0 hours';
    return '7 hours';
});
global.calculateHoursAgo = mockCalculateHoursAgo; 

const mockDomElements = {
    categoriesContainer: { innerHTML: '' },
    mainJokeContainer: { innerHTML: '', appendChild: jest.fn() },
    favouritesList: { innerHTML: '', appendChild: jest.fn(), insertBefore: jest.fn(), querySelector: jest.fn(), remove: jest.fn() },
    favouritesMobileList: { innerHTML: '', appendChild: jest.fn(), insertBefore: jest.fn(), querySelector: jest.fn(), remove: jest.fn() },
    cardTemplate: { innerHTML: `
        <div class="joke-card" data-joke-object="">
            <div class="joke-id"><a href="#">ID</a></div>
            <div class="joke-text">Text</div>
            <div class="joke-category d-none">Category</div>
            <div class="hours-ago">Hours</div>
            <button class="fav-heart-btn"></button>
        </div>
    `},
    showStatusMessage: jest.fn(), clearStatusMessage: jest.fn(),
    radioButtons: [], searchInput: { value: '' }, getJokeButton: {}, favouriteJokesModal: {},
};

describe('Rendering Module (render.js)', () => {
    
    let isFavouriteSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        mockCalculateHoursAgo.mockImplementation(dateString => !dateString ? '0 hours' : '7 hours');

        Dom.categoriesContainer = mockDomElements.categoriesContainer;
        Dom.mainJokeContainer = mockDomElements.mainJokeContainer;
        Dom.cardTemplate = mockDomElements.cardTemplate;
        Dom.favouritesList = mockDomElements.favouritesList;
        Dom.favouritesMobileList = mockDomElements.favouritesMobileList;
        Dom.showStatusMessage = mockDomElements.showStatusMessage;
        Dom.clearStatusMessage = mockDomElements.clearStatusMessage;
        
        isFavouriteSpy = jest.spyOn(State, 'isFavourite').mockReturnValue(false);
        
        State.AppState.favouriteJokes = [];
    });
    
    // --- renderCategoriesButtons ---
    it('should correctly render category buttons', () => {
        const categories = ['animal', 'career'];
        renderCategoriesButtons(categories);
        
        const expectedHtml = categories.map(c => 
            `<button class="btn btn-sm category-btn" data-category="${c}">${c}</button>`
        ).join('');

        expect(Dom.categoriesContainer.innerHTML).toBe(expectedHtml);
    });

    // --- createJokeCardElement ---
    describe('createJokeCardElement', () => {
        const jokeData = {
            id: 'abc', url: 'http://chuck.io/abc', value: 'Test joke text.',
            updated_at: '2025-12-01T00:00:00.000Z', categories: ['dev']
        };

        it('should add active class to heart button if joke is a favorite', () => {
            isFavouriteSpy.mockReturnValue(true);
            const card = createJokeCardElement(jokeData);
            expect(card.querySelector('.fav-heart-btn').classList.contains('active')).toBe(true);
        });
        
        it('should hide category badge if categories array is empty', () => {
            const jokeNoCategory = { ...jokeData, categories: [] };
            const card = createJokeCardElement(jokeNoCategory);
            expect(card.querySelector('.joke-category').classList.contains('d-none')).toBe(true);
        });
    });

    // --- renderMainJoke ---
    it('should replace content in mainJokeContainer with a new joke card', () => {
        const joke = { id: 'm1', value: 'Main joke', categories: [] };
        renderMainJoke(joke);
        expect(Dom.mainJokeContainer.appendChild).toHaveBeenCalledTimes(1);
    });
    
    // --- renderFavouriteJokesList ---
    it('should render all favourite jokes into desktop and mobile lists', () => {
        State.AppState.favouriteJokes = [{ id: 'f1', categories: [] }, { id: 'f2', categories: [] }];
        renderFavouriteJokesList();
        
        expect(Dom.favouritesList.appendChild).toHaveBeenCalledTimes(2);
        expect(Dom.favouritesMobileList.appendChild).toHaveBeenCalledTimes(2);
    });
    
    // --- updateFavouriteJokesList ---
    describe('updateFavouriteJokesList (Add/Remove)', () => {
        const jokeA = { id: 'u1', value: 'Updated joke', categories: [] };
        
        beforeEach(() => {
            Dom.favouritesList.querySelector.mockClear();
            Dom.favouritesMobileList.querySelector.mockClear();
            Dom.favouritesList.insertBefore.mockClear();
            Dom.favouritesMobileList.insertBefore.mockClear();
        });

        it('should insert a new joke at the beginning (liked=true)', () => {
            updateFavouriteJokesList(jokeA, true);
            
            expect(Dom.favouritesList.insertBefore).toHaveBeenCalledTimes(1);
        });
        
        it('should remove joke from both lists (liked=false)', () => {
            const mockCard = { remove: jest.fn() };
            Dom.favouritesList.querySelector.mockReturnValue(mockCard);
            Dom.favouritesMobileList.querySelector.mockReturnValue(mockCard);

            updateFavouriteJokesList(jokeA, false);
            
            expect(mockCard.remove).toHaveBeenCalledTimes(2);
        });
    });
});