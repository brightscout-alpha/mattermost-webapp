// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {getEmojiMap} from 'selectors/emojis';
import {GlobalState} from 'types/store';
import {ModalIdentifiers} from 'utils/constants';
import CustomStatusModal from 'components/custom_status/custom_status_modal';
import {openModal} from 'actions/views/modals';

interface ComponentProps {
    emoji: string;
    size?: number;
    emojiStyle?: React.CSSProperties;
    openModalOnClick?: boolean;
}

const RenderEmoji = ({emoji, emojiStyle, size, openModalOnClick}: ComponentProps) => {
    if (!emoji) {
        return null;
    }

    const dispatch = useDispatch();
    const emojiMap = useSelector((state: GlobalState) => getEmojiMap(state));
    const currentUserId = useSelector((state: GlobalState) => getCurrentUserId(state));
    const emojiFromMap = emojiMap.get(emoji);
    if (!emojiFromMap) {
        return null;
    }
    const emojiImageUrl = getEmojiImageUrl(emojiFromMap);

    const openCustomStatusModal = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        if (openModalOnClick) {
            event.stopPropagation();
            const customStatusInputModalData = {
                ModalId: ModalIdentifiers.CUSTOM_STATUS,
                dialogType: CustomStatusModal,
                dialogProps: {userId: currentUserId},
            };

            dispatch(openModal(customStatusInputModalData));
        }
    };
    return (
        <span
            onClick={openCustomStatusModal}
            className='emoticon'
            alt={`:${emoji}:`}
            data-emoticon={emoji}
            style={{
                backgroundImage: `url(${emojiImageUrl})`,
                backgroundSize: size,
                height: size,
                width: size,
                minHeight: size,
                minWidth: size,
                ...emojiStyle,
            }}
        />
    );
};

RenderEmoji.defaultProps = {
    emoji: '',
    emojiStyle: {},
    size: 16,
};

export default RenderEmoji;
