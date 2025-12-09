// api.test.js
import * as State from '../js/state.js';
import * as Dom from '../js/dom.js'; 
import { fetchCategories, fetchJoke } from '../js/api.js';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockAppStateData = {
    API_BASE: 'http://mock-api.com',
    selectedCategory: 'dev' 
};
const mockSearchInput = { value: 'karate' }; 

let getSearchModeSpy;
let showStatusMessageSpy;

const setupSuccessfulResponse = (body, ok = true) => {
    mockFetch.mockResolvedValueOnce({
        ok,
        json: () => Promise.resolve(body),
    });
};

beforeEach(() => {
    jest.clearAllMocks();
    
    State.AppState.API_BASE = mockAppStateData.API_BASE;
    State.AppState.selectedCategory = mockAppStateData.selectedCategory;
    Dom.searchInput = mockSearchInput; 

    getSearchModeSpy = jest.spyOn(State, 'getSearchMode').mockReturnValue('random');
    showStatusMessageSpy = jest.spyOn(Dom, 'showStatusMessage').mockImplementation(() => {});

});

describe('fetchCategories', () => {
    it('should successfully fetch categories', async () => {
        const categories = ['animal', 'career', 'dev'];
        setupSuccessfulResponse(categories);

        const result = await fetchCategories();

        expect(mockFetch).toHaveBeenCalledWith('http://mock-api.com/categories');
        expect(result).toEqual(categories);
    });

    it('should throw an error if the fetch fails (response not ok)', async () => {
        setupSuccessfulResponse(null, false);

        await expect(fetchCategories()).rejects.toThrow('Failed to fetch categories');
    });
});

describe('fetchJoke', () => {

    // --- RANDOM MODE ---
    describe('when mode is RANDOM', () => {
        beforeEach(() => {
            getSearchModeSpy.mockReturnValue('random');
        });

        it('should fetch a random joke successfully', async () => {
            const joke = { id: 'rand1', value: 'Chuck Norris is random.' };
            setupSuccessfulResponse(joke);

            const result = await fetchJoke();

            expect(mockFetch).toHaveBeenCalledWith('http://mock-api.com/random');
            expect(result).toEqual(joke);
        });

        it('should throw an error if random fetch fails', async () => {
            setupSuccessfulResponse(null, false);

            await expect(fetchJoke()).rejects.toThrow('Failed to fetch random joke');
        });
    });
    
    // --- CATEGORY MODE ---
    describe('when mode is CATEGORY', () => {
        beforeEach(() => {
            getSearchModeSpy.mockReturnValue('category');
        });

        it('should fetch a joke for the selected category', async () => {
            const joke = { id: 'cat1', value: 'Dev joke.' };
            setupSuccessfulResponse(joke);
            
            const result = await fetchJoke();

            expect(mockFetch).toHaveBeenCalledWith('http://mock-api.com/random?category=dev');
            expect(result).toEqual(joke);
        });

        it('should display a warning and return undefined if no category is selected', async () => {
            State.AppState.selectedCategory = null; 

            const result = await fetchJoke();

            expect(mockFetch).not.toHaveBeenCalled();
            expect(showStatusMessageSpy).toHaveBeenCalledWith('Please select a category.', 'warning');
            expect(result).toBeUndefined();
        });
        
        it('should throw an error if category fetch fails', async () => {
            setupSuccessfulResponse(null, false);
            
            await expect(fetchJoke()).rejects.toThrow('Failed to fetch joke by category');
        });
    });

    // --- SEARCH MODE ---
    describe('when mode is SEARCH', () => {
        beforeEach(() => {
            getSearchModeSpy.mockReturnValue('search');
        });

        it('should fetch and return the first joke from search results', async () => {
            const searchBody = {
                total: 2,
                result: [
                    { id: 'search1', value: 'Joke about karate.' }, 
                    { id: 'search2', value: 'Another joke.' },
                ],
            };
            setupSuccessfulResponse(searchBody);

            const result = await fetchJoke();

            expect(mockFetch).toHaveBeenCalledWith('http://mock-api.com/search?query=karate');
            expect(result).toEqual(searchBody.result[0]);
        });
        
        it('should return null if search finds no results', async () => {
            const searchBody = { total: 0, result: [] };
            setupSuccessfulResponse(searchBody);

            const result = await fetchJoke();

            expect(result).toBeNull();
        });
        
        it('should display a warning and return undefined if search query is empty', async () => {
            Dom.searchInput.value = '   ';

            const result = await fetchJoke();

            expect(mockFetch).not.toHaveBeenCalled();
            expect(showStatusMessageSpy).toHaveBeenCalledWith('Please enter search text.', 'warning');
            expect(result).toBeUndefined();
        });
    });
});