// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @modals

import { openCustomStatusModal } from './helper';

describe('Custom Status modal', () => {
    let currentUser;
    before(() => {
        cy.apiUpdateConfig({ TeamSettings: { EnableCustomUserStatuses: true } });

        // # Login as test user and visit town-square
        cy.apiInitSetup({ loginAfter: true }).then(({ team, user, channel }) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);
            currentUser = user;
        });
    });

    describe('MM-T3851 Custom status CTAs for new users', () => {
        it('MM-T3851_1 should show Update your status in the post header', () => {
            cy.postMessage('Hello World!');
            cy.get('.post.current--user .post__header').findByText('Update your status').should('exist');
        })

        it('MM-T3851_2 should open status dropdown with pulsating dot when clicked on Update your status post header', () => {
            cy.get('.post.current--user .post__header').findByText('Update your status').click();
            cy.get('#statusDropdownMenu').should('exist');
            cy.get('#statusDropdownMenu .custom_status__row .pulsating_dot').should('exist');
        })

        it('MM-T3851_3 should remove pulsating dot and Update your status post header after opening modal', () => {
            cy.get('#statusDropdownMenu .custom_status__row .pulsating_dot').click();
            cy.get('#custom_status_modal').should('exist').get('button.close').click();
            cy.get('.post.current--user .post__header').findByText('Update your status').should('not.exist');
            cy.get('.MenuWrapper .status-wrapper').click();
            cy.get('#statusDropdownMenu .custom_status__row .pulsating_dot').should('not.exist');
        })
    })

    describe('MM-T3836 Setting a custom status', () => {
        before(() => {
            cy.apiClearUserCustomStatus();
            cy.reload();
        });

        const defaultCustomStatuses = ['In a meeting', 'Out for lunch', 'Out sick', 'Working from home', 'On a vacation'];
        const customStatus = {
            emoji: 'calendar',
            text: 'In a meeting',
        };

        it('MM-T3836_1 should open status dropdown', () => {
            cy.get('.MenuWrapper .status-wrapper').click();

            cy.get('#statusDropdownMenu').should('exist');
        });

        it('MM-T3836_2 Custom status modal opens with 5 default statuses listed', () => {
            cy.get('#statusDropdownMenu li#status-menu-custom-status').click();
            cy.get('#custom_status_modal').should('exist');

            defaultCustomStatuses.map((statusText) => cy.get('#custom_status_modal .statusSuggestion__content').contains('span', statusText));
        });

        it('MM-T3836_3 "In a meeting" is selected with the calendar emoji', () => {
            cy.get('#custom_status_modal .StatusModal__emoji-button span').should('have.class', 'icon--emoji');
            cy.get('#custom_status_modal input.form-control').should('have.value', '');

            cy.get('#custom_status_modal .statusSuggestion__content').contains('span', customStatus.text).click();

            cy.get('#custom_status_modal .StatusModal__emoji-button span').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
            cy.get('#custom_status_modal input.form-control').should('have.value', customStatus.text);
        });

        it('MM-T3836_4 In a meeting is cleared when clicked on "x" in the input', () => {
            cy.get('#custom_status_modal .statusSuggestion').should('not.exist');

            cy.get('#custom_status_modal .StatusModal__clear-container').click();

            cy.get('#custom_status_modal input.form-control').should('have.value', '');
            defaultCustomStatuses.map((statusText) => cy.get('#custom_status_modal .statusSuggestion__content').contains('span', statusText));
        });

        it('MM-T3836_5 "In a meeting" is selected with the calendar emoji', () => {
            cy.get('#custom_status_modal .StatusModal__emoji-button span').should('have.class', 'icon--emoji');
            cy.get('#custom_status_modal input.form-control').should('have.value', '');

            cy.get('#custom_status_modal .statusSuggestion__content').contains('span', customStatus.text).click();

            cy.get('#custom_status_modal .StatusModal__emoji-button span').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
            cy.get('#custom_status_modal input.form-control').should('have.value', customStatus.text);
        });

        it('MM-T3836_6 should set custom status when click on Set Status', () => {
            cy.get('#custom_status_modal .GenericModal__button.confirm').click();

            cy.get('#custom_status_modal').should('not.exist');
            cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        });

        it('MM-T3836_7 should display the custom status tooltip when hover on the emoji in LHS header', () => {
            cy.get('#headerInfoContent span.emoticon').trigger('mouseover');

            cy.get('#custom-status-tooltip').should('exist');
            cy.get('#custom-status-tooltip .custom-status span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
            cy.get('#custom-status-tooltip .custom-status span.custom-status-text').should('have.text', customStatus.text);
        });

        it('MM-T3836_8 should open custom status modal when emoji in LHS header is clicked', () => {
            cy.get('#custom_status_modal').should('not.exist');

            cy.get('#headerInfoContent span.emoticon').click();

            cy.get('#custom_status_modal').should('exist');
        });
    });

    describe('MM-T3846 Setting your own custom status', () => {
        before(() => {
            cy.apiClearUserCustomStatus();
            cy.reload();
        });

        const customStatus = {
            emoji: 'grinning',
            text: 'Busy',
        };

        it('MM-T3846_1 should change the emoji to speech balloon when typed in the input', () => {
            openCustomStatusModal();

            cy.get('#custom_status_modal .StatusModal__emoji-button span').should('have.class', 'icon--emoji');
            cy.get('#custom_status_modal .StatusModal__input input').type(customStatus.text);
            cy.get('#custom_status_modal .StatusModal__emoji-button span').invoke('attr', 'data-emoticon').should('contain', 'speech_balloon');
        });

        it('MM-T3846_2 should display the emoji picker when clicked on the emoji button', () => {
            cy.get('#custom_status_modal .StatusModal__emoji-button').click();
            cy.get('#emojiPicker').should('exist');
        });

        it('MM_T3846_3 should select the emoji from the emoji picker', () => {
            cy.get('#emojiPicker').should('exist');

            cy.get(`#emojiPicker .emoji-picker-items__container .emoji-picker__item img[data-testid="${customStatus.emoji}"]`).click();

            cy.get('#emojiPicker').should('not.exist');
            cy.get('#custom_status_modal .StatusModal__emoji-button span').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        });

        it('MM-T3846_4 should set custom status when click on Set Status', () => {
            cy.get('#custom_status_modal .GenericModal__button.confirm').click();

            cy.get('#custom_status_modal').should('not.exist');
            cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        });

        it('MM-T3846_5 should show custom status with emoji and clear button in the status dropdown', () => {
            cy.get('.MenuWrapper .status-wrapper').click();

            cy.get('#statusDropdownMenu').should('exist');

            cy.get('.status-dropdown-menu .dropdown-menu .custom_status__row').should('have.text', customStatus.text);
            cy.get('.status-dropdown-menu .custom_status__row span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
            cy.get('.MenuWrapper.status-dropdown-menu li#status-menu-custom-status #custom_status__clear').should('exist');
        });

        it('MM-T3846_6 should clear the custom status text when clear button is clicked', () => {
            cy.get('.MenuWrapper.status-dropdown-menu li#status-menu-custom-status #custom_status__clear').click();
            cy.get('.status-dropdown-menu .dropdown-menu .custom_status__row').should('have.text', 'Set a Custom Status');
        });

        it('MM-T3846_7 should show previosly set status in the first position in Recents list', () => {
            cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#status-menu-custom-status').click();
            cy.get('#custom_status_modal').should('exist');

            cy.get('#custom_status_modal .statusSuggestion__row').first().find('.statusSuggestion__text').should('have.text', customStatus.text);
            cy.get('#custom_status_modal .statusSuggestion__row').first().find('span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        });

        it('MM-T3846_8 should set the same status again when clicked on the Set status', () => {
            cy.get('#custom_status_modal .statusSuggestion__row').first().click();

            cy.get('#custom_status_modal .GenericModal__button.confirm').click();

            cy.get('#custom_status_modal').should('not.exist');
            cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        });

        it('MM-T3846_9 should clear the status when clicked on Clear status button', () => {
            openCustomStatusModal();

            cy.get('#custom_status_modal').findByText('Clear Status').click();

            cy.get('#custom_status_modal').should('not.exist');
            cy.get('.MenuWrapper .status-wrapper').click();
            cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu .custom_status__row').should('not.have.text', customStatus.text);
        });
    });

    describe('MM-T3847 Recent statuses', () => {
        before(() => {
            cy.apiClearUserCustomStatus();
            cy.reload();
        });

        const customStatus = {
            emoji: 'grinning',
            text: 'Busy',
        };

        const defaultStatus = {
            emoji: 'calendar',
            text: 'In a meeting',
        };

        it('MM-T3847_1 set a status', () => {
            openCustomStatusModal();

            cy.get('#custom_status_modal .StatusModal__input input').type(customStatus.text);
            cy.get('#custom_status_modal .StatusModal__emoji-button').click();
            cy.get(`#emojiPicker .emoji-picker-items__container .emoji-picker__item img[data-testid="${customStatus.emoji}"]`).click();
            cy.get('#custom_status_modal .GenericModal__button.confirm').click();

            cy.get('#custom_status_modal').should('not.exist');
            cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        });

        it('MM-T3847_2 should show status in the top in the Recents list', () => {
            openCustomStatusModal();
            cy.get('#custom_status_modal .StatusModal__clear-container').click();

            cy.get('#custom_status_modal input.form-control').should('have.value', '');
            cy.get('#custom_status_modal .statusSuggestion__recents .statusSuggestion__row').first().find('.statusSuggestion__text').should('have.text', customStatus.text);
        });

        it('MM-T3847_3 should remove the status from Recents list when corresponding clear button is clicked', () => {
            cy.get('#custom_status_modal .statusSuggestion__recents .statusSuggestion__row').first().trigger('mouseover');
            cy.get('#custom_status_modal .statusSuggestion__recents .statusSuggestion__row').first().get('.suggestion-clear').should('be.visible');
            cy.get('#custom_status_modal .statusSuggestion__recents .statusSuggestion__row').first().get('.suggestion-clear').click();

            cy.get('#custom_status_modal .statusSuggestion__recents').should('not.contain', customStatus.text);
        });

        it('MM-T3847_4 should set default status when clicked on the status', () => {
            cy.get('#custom_status_modal .statusSuggestion__content').contains('span', defaultStatus.text).click();
            cy.get('#custom_status_modal .GenericModal__button.confirm').click();

            cy.get('#custom_status_modal').should('not.exist');
            cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', defaultStatus.emoji);
        });

        it('MM-T3847_5 should show status set in step 4 in the top in the Recents list', () => {
            openCustomStatusModal();
            cy.get('#custom_status_modal .StatusModal__clear-container').click();

            cy.get('#custom_status_modal input.form-control').should('have.value', '');
            cy.get('#custom_status_modal .statusSuggestion__recents .statusSuggestion__row').first().find('.statusSuggestion__text').should('have.text', defaultStatus.text);
        });

        it('MM-T3847_6 should remove the default status from Recents and show in the Suggestions', () => {
            cy.get('#custom_status_modal .statusSuggestion__recents .statusSuggestion__row').first().trigger('mouseover');
            cy.get('#custom_status_modal .statusSuggestion__recents .statusSuggestion__row').first().get('.suggestion-clear').should('be.visible');

            cy.get('#custom_status_modal .statusSuggestion__recents').should('contain', defaultStatus.text);
            cy.get('#custom_status_modal .statusSuggestion__suggestions').should('not.contain', defaultStatus.text);

            cy.get('#custom_status_modal .statusSuggestion__recents .statusSuggestion__row').first().get('.suggestion-clear').click();

            cy.get('#custom_status_modal .statusSuggestion__recents').should('not.contain', defaultStatus.text);
            cy.get('#custom_status_modal .statusSuggestion__suggestions').should('contain', defaultStatus.text);
        });
    });

    describe.only('MM-T3850 Verifying where the custom status appears', () => {
        before(() => {
            cy.apiClearUserCustomStatus();
            cy.reload();
        });

        const customStatus = {
            emoji: 'grinning',
            text: 'Busy',
        };

        it('MM-T3850_1 set a status', () => {
            openCustomStatusModal();

            cy.get('#custom_status_modal .StatusModal__input input').type(customStatus.text);
            cy.get('#custom_status_modal .StatusModal__emoji-button').click();
            cy.get(`#emojiPicker .emoji-picker-items__container .emoji-picker__item img[data-testid="${customStatus.emoji}"]`).click();
            cy.get('#custom_status_modal .GenericModal__button.confirm').click();

            cy.get('#custom_status_modal').should('not.exist');
        });

        it('MM-T3850_2 should display the custom status emoji in LHS header', () => {
            cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        });

        it('MM-T3850_3 should show custom status emoji in the post header', () => {
            cy.postMessage('Hello World!');
            cy.get('.post.current--user .post__header span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        })

        it('MM-T3850_4 should show custom status emoji in the RHS post header', () => {
            cy.get('.post.current--user .post__header').should('be.visible').trigger('mouseover');
            cy.get('.post.current--user .post__header').should('be.visible').get('.post-menu button[aria-label="reply"]').should('exist').click({ force: true });

            cy.get('#rhsContent .post.current--user.thread__root .post__header span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
            cy.get('#rhsCloseButton').click();
        })

        it('MM-T3850_5 should show full custom status in the user popover', () => {
            cy.get('.post.current--user .post__header .user-popover').click();
            cy.get('#user-profile-popover').should('exist');

            cy.get('#user-profile-popover #user-popover-status').should('contain', customStatus.text);
            cy.get('#user-profile-popover #user-popover-status span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        })

        it('MM-T3850_6 should show custom status emoji next to username in the channel members popover', () => {
            cy.get('#member_popover').should('exist').click();

            cy.get('#member-list-popover').should('exist');
            cy.get('#member-list-popover .more-modal__row').first().get('span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        })

        it('MM-T3850_7 should show custom status emoji next to username in the channel members modal', () => {
            cy.get('#member-list-popover .more-modal__button button').click();
            cy.get('#channelMembersModal').should('exist');

            cy.get('#searchUsersInput').type(currentUser.username);
            cy.get('#channelMembersModal .more-modal__row span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
            cy.get('#channelMembersModal .close').click();
        })
        
        it('MM-T3850_8 should show custom status emoji next to username in the team members modal', () => {
            cy.get('.sidebar-header-dropdown__icon').click();
            cy.get('ul.dropdown-menu').should('exist');
            cy.get('ul.dropdown-menu').findByText('View Members').click();
            
            cy.get('#teamMembersModal').should('exist');
            cy.get('#searchUsersInput').type(currentUser.username);
            cy.get('#teamMembersModal .more-modal__row span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
            cy.get('#teamMembersModal .close').click();
        })
        
        it('MM-T3850_9 should show custom status emoji next to username in the more direct messages modal', () => {
            cy.get('button[aria-label="Write a direct message"]').click();
            cy.get('#moreDmModal').should('exist');
            cy.get('#moreDmModal #react-select-2-input').type(currentUser.username);
            cy.get('#moreDmModal .more-modal__row span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        })

        it('MM-T3850_10 should show custom status emoji next to username in DM in LHS section and full custom status in channel header', () => {
            cy.get('#moreDmModal .more-modal__row').click();
            cy.get('#channelHeaderDescription .header-status__text').should('exist');
            cy.get('#channelHeaderDescription .header-status__text').should('contain', customStatus.text);
            cy.get('#channelHeaderDescription .header-status__text span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

            cy.get('.SidebarChannelGroup_content').contains('(you)').get('span.emoticon').should('exist').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);
        })
    })

    describe('Custom status modal basic tests', () => {
        before(() => {
            cy.apiClearUserCustomStatus();
            cy.reload();
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

        specify('clear button should be visible on opening modal when status is set', () => {
            cy.apiUpdateUserCustomStatus(customStatus);

            openCustomStatusModal();

            cy.get('#custom_status_modal').findByText('Clear Status').should('exist');
        });
    });
});
