// dom.test.js
describe('DOM Utility Functions (Status Messages)', () => {
    let clearStatusMessage;
    let showStatusMessage;
    let statusArea;

    beforeEach(async () => {
        jest.useFakeTimers();

        document.body.innerHTML = `
            <div id="status-area"></div>
            <div id="categories-container"></div>
            <input name="searchMode" type="radio" value="random">
            <div id="search-input"></div>
            <button id="get-joke-btn"></button>
            <div id="main-joke-container"></div>
            <div id="favourites-list-content"></div>
            <div id="favourites-list-mobile"></div>
            <template id="joke-card-template"></template>
            <div id="favourite-modal"></div>
        `;

        const module = await import('../js/dom.js');

        clearStatusMessage = module.clearStatusMessage;
        showStatusMessage = module.showStatusMessage;

        statusArea = document.getElementById('status-area');
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('clearStatusMessage', () => {
        it('should clear the content of statusArea', () => {
            statusArea.innerHTML = '<div class="alert">Test</div>';

            clearStatusMessage();

            expect(statusArea.innerHTML).toBe('');
        });
    });

    describe('showStatusMessage', () => {
        const message = 'Operation successful';

        it('should render a default warning message with close button', () => {
            showStatusMessage(message);

            const alert = statusArea.querySelector('.alert');
            expect(alert).not.toBeNull();
            expect(alert.textContent).toContain(message);
            expect(alert.classList.contains('alert-warning')).toBe(true);
            expect(alert.classList.contains('alert-dismissible')).toBe(true);
            expect(statusArea.querySelector('.btn-close')).not.toBeNull();
        });

        it('should render a success type message', () => {
            showStatusMessage(message, 'success');

            const alert = statusArea.querySelector('.alert');
            expect(alert.classList.contains('alert-success')).toBe(true);
        });

        it('should clear existing messages before showing a new one', () => {
            statusArea.innerHTML = '<div class="alert">Old Message</div>';

            showStatusMessage(message);

            expect(statusArea.innerHTML).not.toContain('Old Message');
        });

        it('should clear the message when close button clicked', () => {
            showStatusMessage(message);

            const btn = statusArea.querySelector('.btn-close');
            btn.dispatchEvent(new Event('click'));

            expect(statusArea.innerHTML).toBe('');
        });
    });
});
