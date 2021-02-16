// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getCurrentUser, getUser} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {get} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'mattermost-redux/constants';

import {createSelector} from 'reselect';
import {memoizeResult} from 'mattermost-redux/utils/helpers';

import {GlobalState} from 'types/store';

export function makeGetCustomStatus() {
    return memoizeResult((state: GlobalState, userID?: string) => {
        const user = userID ? getUser(state, userID) : getCurrentUser(state);
        const userProps = user.props || {};
        return userProps.customStatus && JSON.parse(userProps.customStatus);
    });
}

export const getRecentCustomStatuses = createSelector(
    (state: GlobalState) => get(state, Preferences.CATEGORY_CUSTOM_STATUS, Preferences.NAME_RECENT_CUSTOM_STATUSES),
    (value) => {
        return value ? JSON.parse(value) : [];
    },
);

export function isCustomStatusEnabled(state: GlobalState) {
    const config = getConfig(state);
    return config && config.EnableCustomUserStatuses === 'true';
}

function showCustomStatusPulsatingDotAndPostHeader(state: GlobalState) {
    const hasViewedCustomStatusModal = get(state, Preferences.CATEGORY_CUSTOM_STATUS, Preferences.NAME_CUSTOM_STATUS_TUTORIAL_STATE);
    return hasViewedCustomStatusModal !== Preferences.CUSTOM_STATUS_MODAL_VIEWED;
}

export function showStatusDropdownPulsatingDot(state: GlobalState) {
    return showCustomStatusPulsatingDotAndPostHeader(state);
}

export function showPostHeaderUpdateStatusButton(state: GlobalState) {
    return showCustomStatusPulsatingDotAndPostHeader(state);
}
