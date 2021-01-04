// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {Tooltip} from 'react-bootstrap';

import {unsetUserCustomStatus, updateUserCustomStatus} from 'actions/views/user';
import GenericModal from 'components/generic_modal';
import 'components/category_modal.scss';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import './custom_status.scss';
import {GlobalState} from 'types/store';
import messageHtmlToComponent from 'utils/message_html_to_component';
import OverlayTrigger from 'components/overlay_trigger';
import Constants from 'utils/constants';

type Props = {
    onHide: () => void;
};

const CustomStatusModal: React.FC<Props> = (props: Props) => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state: GlobalState) => getCurrentUser(state));
    const userProps = currentUser.props || {};
    const currentCustomStatus = userProps.customStatus ? JSON.parse(userProps.customStatus) : {emoji: '', text: ''};
    const recentCustomStatuses = userProps.recentCustomStatuses ? JSON.parse(userProps.recentCustomStatuses) : [];
    const customStatusControlRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [text, setText] = useState<string>(currentCustomStatus.text);
    const [emoji, setEmoji] = useState<string>(currentCustomStatus.emoji);
    const isStatusSet = emoji || text;
    const handleSetStatus = () => {
        const customStatus = {
            emoji: emoji || 'speech_balloon',
            text,
        };
        dispatch(updateUserCustomStatus(customStatus));
    };

    const handleClearStatus = () => {
        dispatch(unsetUserCustomStatus());
    };

    const getCustomStatusControlRef = () => {
        return customStatusControlRef.current;
    };

    const handleEmojiClose = () => {
        setShowEmojiPicker(false);
    };

    const handleEmojiClick = (selectedEmoji: any) => {
        setShowEmojiPicker(false);
        const emojiName = selectedEmoji.name || selectedEmoji.aliases[0];
        setEmoji(emojiName);
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleTextChange = (event: any) => {
        setText(event.target.value);
    };
    let customStatusEmoji = <EmojiIcon className={'icon icon--emoji'}/>;
    if (emoji || text) {
        customStatusEmoji = messageHtmlToComponent(
            `<span data-emoticon="${emoji || 'speech_balloon'}" />`,
            false,
            {emoji: true},
        );
    }

    const clearHandle = () => {
        setText('');
        setEmoji('');
    };

    const clearButton = isStatusSet ?
        (
            <div
                className='StatusModal__clear-container'
            >
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={
                        <Tooltip id='clear-custom-status'>
                            {'Clear'}
                        </Tooltip>
                    }
                >
                    <span
                        className='input-clear-x'
                        aria-hidden='true'
                        onClick={clearHandle}
                    >
                        <i className='icon icon-close-circle'/>
                    </span>
                </OverlayTrigger>
            </div>
        ) : null;

    const disableSetStatus = currentCustomStatus.text === text && currentCustomStatus.emoji === emoji;

    const handleSuggestion = (status: any) => {
        setEmoji(status.emoji);
        setText(status.text);
    };

    const recentStatuses = (
        <>
            <div className='statusSuggestion__row'>
                <span className='statusSuggestion__title'>
                    {'Recent Statuses'}
                </span>
            </div>
            {recentCustomStatuses.map((status: any) => (
                <div
                    key={status.text}
                    className='statusSuggestion__row cursor--pointer a11y--active'
                    onClick={
                        () => handleSuggestion(status)
                    }
                >
                    <div className='statusSuggestion__icon'>
                        {messageHtmlToComponent(
                            `<span data-emoticon="${status.emoji}" class="custom-status-emoji"/>`,
                            false,
                            {emoji: true},
                        )}
                    </div>
                    <span className='statusSuggestion__text'>
                        {status.text}
                    </span>
                </div>
            ))
            }
        </>
    );

    const suggestion = (
        <div className='statusSuggestion'>
            <div className='statusSuggestion__content'>
                <div
                    className='statusSuggestion__row cursor--pointer a11y--active'
                    onClick={
                        () => handleSuggestion(
                            {
                                emoji: 'calendar',
                                text: 'In a meeting',
                            })
                    }
                >
                    <div className='statusSuggestion__icon'>
                        {messageHtmlToComponent(
                            '<span data-emoticon="calendar" class="custom-status-emoji"/>',
                            false,
                            {emoji: true},
                        )}
                    </div>
                    <span className='statusSuggestion__text'>
                        {'In a meeting'}
                    </span>
                </div>
                <div
                    className='statusSuggestion__row cursor--pointer a11y--active'
                    onClick={
                        () => handleSuggestion(
                            {
                                emoji: 'hamburger',
                                text: 'Out for lunch',
                            })
                    }
                >
                    <div className='statusSuggestion__icon'>
                        {messageHtmlToComponent(
                            '<span data-emoticon="hamburger" class="custom-status-emoji"/>',
                            false,
                            {emoji: true},
                        )}
                    </div>
                    <span className='statusSuggestion__text'>
                        {'Out for lunch'}
                    </span>
                </div>
                <div
                    className='statusSuggestion__row cursor--pointer a11y--active'
                    onClick={
                        () => handleSuggestion(
                            {
                                emoji: 'sneezing_face',
                                text: 'Out Sick',
                            })
                    }
                >
                    <div className='statusSuggestion__icon'>
                        {messageHtmlToComponent(
                            '<span data-emoticon="sneezing_face" class="custom-status-emoji"/>',
                            false,
                            {emoji: true},
                        )}
                    </div>
                    <span className='statusSuggestion__text'>
                        {'Out Sick'}
                    </span>
                </div>
                <div
                    className='statusSuggestion__row cursor--pointer a11y--active'
                    onClick={
                        () => handleSuggestion(
                            {
                                emoji: 'house',
                                text: 'Working from home',
                            })
                    }
                >
                    <div className='statusSuggestion__icon'>
                        {messageHtmlToComponent(
                            '<span data-emoticon="house" class="custom-status-emoji"/>',
                            false,
                            {emoji: true},
                        )}
                    </div>
                    <span className='statusSuggestion__text'>
                        {'Working from home'}
                    </span>
                </div>
                <div
                    className='statusSuggestion__row cursor--pointer a11y--active'
                    onClick={
                        () => handleSuggestion(
                            {
                                emoji: 'palm_tree',
                                text: 'On a vacation',
                            })
                    }
                >
                    <div className='statusSuggestion__icon'>
                        {messageHtmlToComponent(
                            '<span data-emoticon="palm_tree" class="custom-status-emoji"/>',
                            false,
                            {emoji: true},
                        )}
                    </div>
                    <span className='statusSuggestion__text'>
                        {'On a vacation'}
                    </span>
                </div>
                {recentStatuses}
            </div>
        </div>
    );

    return (
        <GenericModal
            onHide={props.onHide}
            modalHeaderText={
                <FormattedMessage
                    id='custom_status_modal_header'
                    defaultMessage='Set a status'
                />
            }
            confirmButtonText={
                <FormattedMessage
                    id='custom_status_modal_confirm'
                    defaultMessage='Set Status'
                />
            }
            cancelButtonText={
                <FormattedMessage
                    id='custom_status_modal_cancel'
                    defaultMessage='Clear Status'
                />
            }
            isConfirmDisabled={disableSetStatus}
            id='custom_status_modal'
            className={'StatusModal'}
            handleConfirm={handleSetStatus}
            handleCancel={(currentCustomStatus.text || currentCustomStatus.emoji) ?
                handleClearStatus : undefined
            }
        >
            <div className='StatusModal__body'>
                <div className='StatusModal__input'>
                    <div
                        ref={customStatusControlRef}
                        className='StatusModal__emoji-container'
                    >
                        <EmojiPickerOverlay
                            target={getCustomStatusControlRef}
                            show={showEmojiPicker}
                            onHide={handleEmojiClose}
                            onEmojiClose={handleEmojiClose}
                            onEmojiClick={handleEmojiClick}
                        />
                        <button
                            type='button'
                            onClick={toggleEmojiPicker}
                            className={classNames('emoji-picker__container', 'StatusModal__emoji-button', {
                                'StatusModal__emoji-button--active': showEmojiPicker,
                            })}
                        >
                            {customStatusEmoji}
                        </button>
                    </div>
                    <input
                        className='form-control'
                        placeholder='Set a status'
                        type='text'
                        value={text}
                        onChange={handleTextChange}
                    />
                    {clearButton}
                </div>
                {!isStatusSet && suggestion}
            </div>
        </GenericModal>
    );
};

export default CustomStatusModal;
