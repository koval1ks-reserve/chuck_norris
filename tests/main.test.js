// tests/main.test.js

// Mocking State, API, Render
const mockAppState = { categoriesLoaded: false, categories: [], API_BASE: 'http://mock.api', selectedCategory: 'dev' };
const mockGetSearchMode = jest.fn();
const mockToggleFavouriteJoke = jest.fn();
const mockFetchCategories = jest.fn();
const mockFetchJoke = jest.fn();
const mockRenderFavouriteJokesList = jest.fn();
const mockUpdateFavouriteJokesList = jest.fn();
const mockShowStatusMessage = jest.fn();
const mockClearStatusMessage = jest.fn();

jest.mock('../js/state.js', () => ({
    AppState: mockAppState,
    setSearchMode: jest.fn(),
    getSearchMode: mockGetSearchMode,
    setSelectedCategory: jest.fn(),
    toggleFavouriteJoke: mockToggleFavouriteJoke,
}));
jest.mock('../js/api.js', () => ({ fetchCategories: mockFetchCategories, fetchJoke: mockFetchJoke }));
jest.mock('../js/render.js', () => ({
    renderCategoriesButtons: jest.fn(),
    renderMainJoke: jest.fn(),
    renderFavouriteJokesList: mockRenderFavouriteJokesList,
    updateFavouriteJokesList: mockUpdateFavouriteJokesList,
}));

// --- Mock DOM Elements & Functions ---
const mockRadioElements = [
    { addEventListener: jest.fn(), value: 'random', checked: false, getAttribute: jest.fn(() => 'rand-container') },
    { addEventListener: jest.fn(), value: 'category', checked: true, getAttribute: jest.fn(() => 'cat-container') }
];
const mockCategoriesContainer = { innerHTML: '', addEventListener: jest.fn() };
const mockGetJokeButton = { addEventListener: jest.fn(), disabled: false };
const mockSearchInput = { addEventListener: jest.fn(), value: '' };

jest.mock('../js/dom.js', () => ({
    radioButtons: mockRadioElements, 
    categoriesContainer: mockCategoriesContainer,
    searchInput: mockSearchInput,
    getJokeButton: mockGetJokeButton,
    mainJokeContainer: { querySelector: jest.fn(() => null) }, 
    favouritesList: { innerHTML: '' },
    favouritesMobileList: { innerHTML: '' },
    cardTemplate: { innerHTML: '<div></div>' },
    favouriteJokesModal: {},
    showStatusMessage: mockShowStatusMessage,
    clearStatusMessage: mockClearStatusMessage,
}));

document.body.addEventListener = jest.fn();
document.querySelectorAll = jest.fn(() => [{ classList: { remove: jest.fn(), add: jest.fn() } }]); 
document.querySelector = jest.fn(() => mockRadioElements[0]);

require('../js/main.js'); 

const getJokeClickHandler = mockGetJokeButton.addEventListener.mock.calls[0]?.[1];
const radioChangeHandler = mockRadioElements[0].addEventListener.mock.calls[0]?.[1];
const categoryClickHandler = mockCategoriesContainer.addEventListener.mock.calls[0]?.[1];
const bodyClickHandler = document.body.addEventListener.mock.calls[0]?.[1];


describe('Main Module (main.js) Logic', () => {

    beforeAll(() => {
        originalConsoleError = console.error;
        console.error = jest.fn();
    });

    afterAll(() => {
        console.error = originalConsoleError;
    });
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSearchMode.mockReturnValue('random');
        mockAppState.categoriesLoaded = false;
        mockAppState.categories = [];
    });

    // --- onGetJokeClick ---
    describe('onGetJokeClick (Get Joke Button Handler)', () => {
        
        it('should fetch a joke and render it successfully', async () => {
            mockFetchJoke.mockResolvedValueOnce({ id: 'j1' });
            
            await getJokeClickHandler(); 

            expect(mockClearStatusMessage).toHaveBeenCalledTimes(1);
            expect(mockFetchJoke).toHaveBeenCalled();
        });

        it('should handle fetchJoke failure and display a status message', async () => {
            mockFetchJoke.mockRejectedValueOnce(new Error('API failure'));

            await getJokeClickHandler();

            expect(mockShowStatusMessage).toHaveBeenCalledWith('Something went wrong. Try again', 'warning');
        });
    });
    
    // --- Event Listeners (Delegation) ---
    describe('Event Listeners Delegation', () => {
        it('Heart click should toggle favourite state and update lists', () => {
            const jokeData = { id: 'fav1', value: 'Joke' };
            
            mockToggleFavouriteJoke.mockReturnValue(true); 
            
            const mockJokeCard = { getAttribute: jest.fn(() => JSON.stringify(jokeData)), querySelector: jest.fn(() => ({ classList: { toggle: jest.fn() } })) };
            const mockHeartBtn = { closest: jest.fn(selector => selector === '.fav-heart-btn' ? mockHeartBtn : mockJokeCard) };
            
            bodyClickHandler({ target: mockHeartBtn });

            expect(mockToggleFavouriteJoke).toHaveBeenCalledWith(jokeData);
            expect(mockUpdateFavouriteJokesList).toHaveBeenCalledWith(jokeData, true);
        });
    });
});