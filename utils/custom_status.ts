// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';

import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';
import {Preferences} from 'mattermost-redux/constants';

import {GlobalState} from 'types/store';

function showCustomStatusPulsatingDotAndPostHeader(state: GlobalState) {
    const preferences = getMyPreferences(state);
    const key = getPreferenceKey(Preferences.CATEGORY_CUSTOM_STATUS, Preferences.NAME_CUSTOM_STATUS_TUTORIAL_STATE);
    return !(preferences[key] && preferences[key].value === Preferences.CUSTOM_STATUS_MODAL_VIEWED);
}

export function showStatusDropdownPulsatingDot(state: GlobalState) {
    return showCustomStatusPulsatingDotAndPostHeader(state);
}

export function showPostHeaderUpdateStatusButton(state: GlobalState) {
    return showCustomStatusPulsatingDotAndPostHeader(state);
}
