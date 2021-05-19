
describe('MM-T4063 Custom status expiry', () => {
    before(() => {
        cy.apiUpdateConfig({TeamSettings: {EnableCustomUserStatuses: true}});

        // # Login as test user and visit channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });

    const defaultCustomStatuses = ['In a meeting', 'Out for lunch', 'Out sick', 'Working from home', 'On a vacation'];
    const customStatus = {
        emoji: 'hamburger',
        text: 'Out for lunch',
        duration: '30 minutes',
    };

    let expires_at = new Date();
    it('MM-T4063_1 should open status dropdown', () => {
        // # Click on the sidebar header to open status dropdown
        cy.get('.MenuWrapper .status-wrapper').click();

        // * Check if the status dropdown opens
        cy.get('#statusDropdownMenu').should('exist');
    })

    it('MM-T4063_2 Custom status modal opens with 5 default statuses listed', () => {
        // # Open custom status modal
        cy.get('#statusDropdownMenu li#status-menu-custom-status').click();
        cy.get('#custom_status_modal').should('exist');

        // * Check if all the default suggestions exist
        defaultCustomStatuses.map((statusText) => cy.get('#custom_status_modal .statusSuggestion__content').contains('span', statusText));
    });

    it('MM-T4063_3 "Out for lunch" is selected with the hamburger emoji', () => {
        // * Default emoji is currently visible in the custom status input
        cy.get('#custom_status_modal .StatusModal__emoji-button span').should('have.class', 'icon--emoji');

        // * Input should be empty
        cy.get('#custom_status_modal input.form-control').should('have.value', '');

        // # Select a custom status from the suggestions
        cy.get('#custom_status_modal .statusSuggestion__content').contains('span', customStatus.text).click();

        // * Emoji in the custom status input should be changed
        cy.get('#custom_status_modal .StatusModal__emoji-button span').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

        // * Selected custom status text should be in the input
        cy.get('#custom_status_modal input.form-control').should('have.value', customStatus.text);
        
        // * Selected custom status duration should be displayed in the Clear after section
        cy.get('#custom_status_modal .expiry-wrapper .expiry-value').should('have.text', customStatus.duration);
    });

    it('MM-T4063_4 should set custom status when click on Set Status', () => {
        // # Click on the Set Status button
        cy.get('#custom_status_modal .GenericModal__button.confirm').click();

        // * Modal should be closed
        cy.get('#custom_status_modal').should('not.exist');

        expires_at = Cypress.dayjs().add(30, 'minute');
        // * Status should be set and the emoji should be visible in the sidebar header
        cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
    });

    it('MM-T4063_5 should show the set custom status when status dropdown is opened', () => {
        // # Click on the sidebar header to open status dropdown
        cy.get('.MenuWrapper .status-wrapper').click();

        // * Check if the status dropdown opens
        cy.get('#statusDropdownMenu').should('exist');

        // * Correct custom status text and emoji should be displayed in the status dropdown
        cy.get('.status-dropdown-menu .custom_status__container').should('have.text', customStatus.text);
        cy.get('.status-dropdown-menu .custom_status__row span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

        // * Correct clear time should be displayed in the status dropdown
        cy.get('.status-dropdown-menu .custom_status__expiry').should('have.text', `(Until Today at ${expires_at.format('')})`);
    });
});