// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getCurrentUser, getUser} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';
import {Preferences} from 'mattermost-redux/constants';

import {GlobalState} from 'types/store';

export function getCustomStatus(state: GlobalState, userID?: string) {
    const user = userID ? getUser(state, userID) : getCurrentUser(state);
    const userProps = user.props || {};
    return userProps.customStatus ? JSON.parse(userProps.customStatus) : {};
}

export function getRecentCustomStatuses(state: GlobalState) {
    const preferences = getMyPreferences(state);
    const key = getPreferenceKey(Preferences.CATEGORY_CUSTOM_STATUS, Preferences.NAME_RECENT_CUSTOM_STATUSES);
    return preferences[key] && preferences[key].value ? JSON.parse(`${preferences[key].value}`) : [];
}

export function isCustomStatusEnabled(state: GlobalState) {
    const config = getConfig(state);
    return config && config.EnableCustomUserStatuses === 'true';
}
