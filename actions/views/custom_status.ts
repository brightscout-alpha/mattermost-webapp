// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import {Preferences} from 'utils/constants';

export function setCustomStatusInitialisationState(initializationState: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);
        const preferences: PreferenceType = {
            user_id: currentUserId,
            category: Preferences.CATEGORY_CUSTOM_STATUS,
            name: Preferences.NAME_CUSTOM_STATUS_TUTORIAL_STATE,
            value: initializationState,
        };
        await dispatch(savePreferences(currentUserId, [preferences]));
    };
}
