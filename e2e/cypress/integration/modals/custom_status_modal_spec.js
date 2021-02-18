// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @modals

import * as TIMEOUTS from '../../fixtures/timeouts';

import {openCustomStatusModal} from './helper';

describe('Custom Status modal', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
        cy.apiUpdateConfig({TeamSettings: {EnableCustomUserStatuses: true}});
        cy.apiClearUserCustomStatus();
    });

    afterEach(() => {
        cy.reload();
    });

    const customStatus = {
        emoji: 'calendar',
        text: 'Busy',
    };

    specify('Set status button should be disabled when the custom status modal opens', () => {
        openCustomStatusModal();

        cy.get('#custom_status_modal .modal-footer button.confirm').should('exist').and('have.attr', 'disabled');
    });

    specify('all the suggestions must have cursor pointer', () => {
        openCustomStatusModal();

        cy.get('#custom_status_modal .statusSuggestion__row').should('have.css', 'cursor', 'pointer');
    });

    it('should enable the set status button when clicked on any suggestion', () => {
        openCustomStatusModal();

        cy.get('#custom_status_modal .GenericModal__button.confirm').should('have.attr', 'disabled');
        cy.get('#custom_status_modal .statusSuggestion__row').first().click();
        cy.get('#custom_status_modal .GenericModal__button.confirm').should('not.have.attr', 'disabled');
    });

    it('should enable the set status button when typed in the input', () => {
        openCustomStatusModal();

        cy.get('#custom_status_modal .GenericModal__button.confirm').should('have.attr', 'disabled');
        cy.get('#custom_status_modal .StatusModal__input input').type(customStatus.text);
        cy.get('#custom_status_modal .GenericModal__button.confirm').should('not.have.attr', 'disabled');
    });

    it('should change the emoji when typed in the input', () => {
        openCustomStatusModal();

        cy.get('#custom_status_modal .StatusModal__emoji-button span').should('have.class', 'icon--emoji');
        cy.get('#custom_status_modal .StatusModal__input input').type(customStatus.text);
        cy.get('#custom_status_modal .StatusModal__emoji-button span').invoke('attr', 'data-emoticon').should('contain', 'speech_balloon');
    });

    it('should display the emoji overlay when clicked on the emoji button', () => {
        openCustomStatusModal();

        cy.get('#custom_status_modal .StatusModal__emoji-button').click();
        cy.get('#emojiPicker').should('exist');
    });

    it('should set custom status on clicking the set status button', () => {
        openCustomStatusModal();

        cy.get('#custom_status_modal .StatusModal__input input').type(customStatus.text);
        cy.get('#custom_status_modal .GenericModal__button.confirm').click();

        // # Open status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu .custom_status__row').should('have.text', customStatus.text);
    });

    specify('clear button should be visible on opening modal when status is set', () => {
        cy.apiUpdateUserCustomStatus(customStatus);

        openCustomStatusModal();

        cy.get('#custom_status_modal').findByText('Clear Status').should('exist');
    });

    it('should clear the status if Clear Status button is clicked', () => {
        openCustomStatusModal();

        cy.get('#custom_status_modal').findByText('Clear Status').click();

        // # Open status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu .custom_status__row').should('not.have.text', customStatus.text);
    });

    it('should clear the input when the input clear button is clicked and suggestions should be visible', () => {
        cy.apiUpdateUserCustomStatus(customStatus);
        openCustomStatusModal();

        cy.get('#custom_status_modal input.form-control').should('have.value', customStatus.text);
        cy.get('#custom_status_modal .statusSuggestion').should('not.exist');
        cy.get('#custom_status_modal .StatusModal__clear-container').click();
        cy.get('#custom_status_modal .statusSuggestion').should('exist');
        cy.get('#custom_status_modal input.form-control').should('have.value', '');
    });

    specify('last set status should be the first in the recents list', () => {
        cy.apiUpdateUserCustomStatus(customStatus);
        cy.apiClearUserCustomStatus();
        cy.wait(TIMEOUTS.ONE_SEC);
        openCustomStatusModal();

        cy.get('#custom_status_modal .statusSuggestion__row').first().find('.statusSuggestion__text').should('have.text', customStatus.text);
    });

    specify('status should be removed from the recents when corresponding clear button is clicked', () => {
        cy.apiUpdateUserCustomStatus(customStatus);
        cy.apiClearUserCustomStatus();
        cy.wait(TIMEOUTS.ONE_SEC);
        openCustomStatusModal();

        cy.get('#custom_status_modal .statusSuggestion__row').first().trigger('mouseover');
        cy.get('#custom_status_modal .statusSuggestion__row').first().get('.suggestion-clear').should('be.visible');
        cy.get('#custom_status_modal .statusSuggestion__row').first().get('.suggestion-clear').click();

        cy.get('#custom_status_modal .statusSuggestion__row').first().should('not.have.text', customStatus.text);
    });

    it('should open the modal on clicking the emoji in the sidebar header', () => {
        cy.apiUpdateUserCustomStatus(customStatus);
        cy.wait(TIMEOUTS.ONE_SEC);

        cy.get('#custom_status_modal').should('not.exist');
        cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        cy.get('#headerInfoContent span.emoticon').click();
        cy.get('#custom_status_modal').should('exist');
    });
});
