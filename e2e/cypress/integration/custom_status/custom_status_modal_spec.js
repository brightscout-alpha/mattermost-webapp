
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
describe('Custom Status modal', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
            cy.apiUpdateConfig({TeamSettings: {EnableCustomUserStatuses: true}});
        });
    });

    afterEach(() => {
        cy.reload();
    });

    const customStatusText = 'Busy';
    specify('Set status button should be disabled when the custom status modal opens', () => {
        // # Open status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Click the "Set a Custom Status" header
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#status-menu-custom-status').click();

        cy.get('#custom_status_modal .modal-footer button.confirm').should('exist').and('have.attr', 'disabled');
    });

    specify('all the suggestions must have cursor pointer', () => {
        cy.apiClearUserCustomStatus();

        // # Open status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Click the "Set a Custom Status" header
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#status-menu-custom-status').click();

        cy.get('#custom_status_modal .statusSuggestion__row').should('have.css', 'cursor', 'pointer');
    });

    it('should enable the set status button when clicked on any suggestion', () => {
        cy.apiClearUserCustomStatus();

        // # Open status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Click the "Set a Custom Status" header
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#status-menu-custom-status').click();

        cy.get('#custom_status_modal .GenericModal__button.confirm').should('have.attr', 'disabled');
        cy.get('#custom_status_modal .statusSuggestion__row').first().click();
        cy.get('#custom_status_modal .GenericModal__button.confirm').should('not.have.attr', 'disabled');
    });

    it('should enable the set status button when typed in the input', () => {
        cy.apiClearUserCustomStatus();

        // # Open status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Click the "Set a Custom Status" header
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#status-menu-custom-status').click();

        cy.get('#custom_status_modal .GenericModal__button.confirm').should('have.attr', 'disabled');
        cy.get('#custom_status_modal .StatusModal__input input').type(customStatusText);
        cy.get('#custom_status_modal .GenericModal__button.confirm').should('not.have.attr', 'disabled');
    });

    it('should display the emoji overlay when clicked on the emoji button', () => {
        // # Open status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Click the "Set a Custom Status" header
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#status-menu-custom-status').click();

        cy.get('#custom_status_modal .StatusModal__emoji-button').click();
        cy.get('#emojiPicker').should('exist');
    });

    it('should set custom status on clicking the set status button', () => {
        cy.apiClearUserCustomStatus();

        // # Open status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Click the "Set a Custom Status" header
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#status-menu-custom-status').click();

        cy.get('#custom_status_modal .StatusModal__input input').type(customStatusText);
        cy.get('#custom_status_modal .GenericModal__button.confirm').click();

        // # Open status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu .custom_status__row').should('have.text', customStatusText);
    });
});
