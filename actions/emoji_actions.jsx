// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as EmojiActions from 'mattermost-redux/actions/emojis';
import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {setRecentEmojis} from 'actions/local_storage';
import {getEmojiMap, getRecentEmojis, isCustomEmojiEnabled} from 'selectors/emojis';
import {isCustomStatusEnabled, makeGetCustomStatus} from 'selectors/views/custom_status';

import {ActionTypes} from 'utils/constants';
import {EmojiIndicesByAlias} from 'utils/emoji';

export function loadRecentlyUsedCustomEmojis() {
    return async (dispatch, getState) => {
        const state = getState();
        const config = getConfig(state);

        if (config.EnableCustomEmoji !== 'true') {
            return {data: true};
        }

        const recentEmojis = getRecentEmojis(state);
        const emojiMap = getEmojiMap(state);
        const missingEmojis = recentEmojis.filter((name) => !emojiMap.has(name));

        missingEmojis.forEach((name) => {
            dispatch(EmojiActions.getCustomEmojiByName(name));
        });

        return {data: true};
    };
}

export function incrementEmojiPickerPage() {
    return async (dispatch) => {
        dispatch({
            type: ActionTypes.INCREMENT_EMOJI_PICKER_PAGE,
        });

        return {data: true};
    };
}

const MAXIMUM_RECENT_EMOJI = 27;

export function addRecentEmoji(alias) {
    return (dispatch, getState) => {
        const state = getState();
        const recentEmojis = getRecentEmojis(state);
        const emojiMap = getEmojiMap(state);

        let name;
        const emoji = emojiMap.get(alias);
        if (!emoji) {
            return;
        } else if (emoji.name) {
            name = emoji.name;
        } else {
            name = emoji.aliases[0];
        }

        const index = recentEmojis.indexOf(name);
        if (index !== -1) {
            recentEmojis.splice(index, 1);
        }

        recentEmojis.push(name);

        if (recentEmojis.length > MAXIMUM_RECENT_EMOJI) {
            recentEmojis.splice(0, recentEmojis.length - MAXIMUM_RECENT_EMOJI);
        }

        dispatch(setRecentEmojis(recentEmojis));
    };
}

export function loadCustomEmojisForCustomStatusesByUserIds(userIds) {
    return (dispatch, getState) => {
        const state = getState();
        const customEmojiEnabled = isCustomEmojiEnabled(state);
        const customStatusEnabled = isCustomStatusEnabled(state);
        if (!customEmojiEnabled || !customStatusEnabled) {
            return {data: false};
        }

        const getCustomStatus = makeGetCustomStatus();
        const emojisToLoad = new Set();

        userIds.forEach((userId) => {
            const customStatus = getCustomStatus(state, userId);
            if (!customStatus || !customStatus.emoji) {
                return;
            }

            emojisToLoad.add(customStatus.emoji);
        });

        dispatch(loadCustomEmojisIfNeeded(Array.from(emojisToLoad)));
        return {data: true};
    };
}

export function loadCustomEmojisIfNeeded(emojis) {
    return (dispatch, getState) => {
        const state = getState();
        const customEmojiEnabled = isCustomEmojiEnabled(state);
        if (!customEmojiEnabled) {
            return {data: false};
        }

        const systemEmojis = EmojiIndicesByAlias;
        const customEmojisByName = getCustomEmojisByName(state);
        const nonExistentCustomEmoji = state.entities.emojis.nonExistentEmoji;
        const emojisToLoad = new Set();

        emojis.forEach((emoji) => {
            if (systemEmojis.has(emoji)) {
                // It's a system emoji, no need to fetch
                return;
            }

            if (nonExistentCustomEmoji.has(emoji)) {
                // We've previously confirmed this is not a custom emoji
                return;
            }

            if (customEmojisByName.has(emoji)) {
                // We have the emoji, no need to fetch
                return;
            }

            emojisToLoad.add(emoji);
        });

        dispatch(EmojiActions.getCustomEmojisByName(Array.from(emojisToLoad)));
        return {data: true};
    };
}

