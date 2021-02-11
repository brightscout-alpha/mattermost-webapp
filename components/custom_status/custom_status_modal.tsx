// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import {Tooltip} from 'react-bootstrap';
import {setCustomStatus, unsetCustomStatus, removeRecentCustomStatus} from 'mattermost-redux/actions/users';
import {setCustomStatusInitialisationState} from 'mattermost-redux/actions/preferences';
import {Preferences} from 'mattermost-redux/constants';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import {NavbarElementProps} from 'react-day-picker';

import {UserCustomStatus} from 'mattermost-redux/types/users';

import GenericModal from 'components/generic_modal';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import {GlobalState} from 'types/store';
import OverlayTrigger from 'components/overlay_trigger';
import Constants from 'utils/constants';
import RenderEmoji from 'components/emoji/render_emoji';
import {getCustomStatus, getRecentCustomStatuses, showStatusDropdownPulsatingDot} from 'selectors/views/custom_status';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {localizeMessage} from 'utils/utils';

import CustomStatusSuggestion from './custom_status_suggestion';

import 'components/category_modal.scss';
import './custom_status.scss';

type Props = {
    onHide: () => void;
};

type ExpiryMenuItem = {
    text: string;
    value: string;
    localizationId: string;
}

const EMOJI_PICKER_WIDTH_OFFSET = 308;
const defaultCustomStatusSuggestions: UserCustomStatus[] = [
    {emoji: 'calendar', text: 'In a meeting'},
    {emoji: 'hamburger', text: 'Out for lunch'},
    {emoji: 'sneezing_face', text: 'Out Sick'},
    {emoji: 'house', text: 'Working from home'},
    {emoji: 'palm_tree', text: 'On a vacation'},
];

const CustomStatusModal: React.FC<Props> = (props: Props) => {
    const dispatch = useDispatch();
    const currentCustomStatus = useSelector((state: GlobalState) => getCustomStatus(state));
    const recentCustomStatuses = useSelector((state: GlobalState) => getRecentCustomStatuses(state));
    const customStatusControlRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [text, setText] = useState<string>(currentCustomStatus.text);
    const [emoji, setEmoji] = useState<string>(currentCustomStatus.emoji);
    const [expiry, setExpiry] = useState<string>('four-hours');
    const isStatusSet = emoji || text;
    const firstTimeModalOpened = useSelector((state: GlobalState) => showStatusDropdownPulsatingDot(state));

    const handleCustomStatusInitializationState = () => {
        if (firstTimeModalOpened) {
            dispatch(setCustomStatusInitialisationState(Preferences.CUSTOM_STATUS_MODAL_VIEWED));
        }
    };

    useEffect(handleCustomStatusInitializationState, []);

    const handleSetStatus = () => {
        const customStatus = {
            emoji: emoji || 'speech_balloon',
            text: text.trim(),
        };
        dispatch(setCustomStatus(customStatus));
    };

    const handleClearStatus = () => {
        if (currentCustomStatus.text || currentCustomStatus.emoji) {
            dispatch(unsetCustomStatus());
        }
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

    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputText = event.target.value;
        if (inputText.length <= Constants.CUSTOM_STATUS_TEXT_CHARACTER_LIMIT) {
            setText(inputText);
        }
    };

    const handleRecentCustomStatusClear = (status: any) => {
        dispatch(removeRecentCustomStatus(status));
    };

    const handleExpiryChange = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, expiryValue: string) => {
        event.preventDefault();
        setExpiry(expiryValue);
    };

    const customStatusEmoji = emoji || text ?
        (
            <RenderEmoji
                emoji={emoji || 'speech_balloon'}
                size={20}
            />
        ) : (
            <EmojiIcon className={'icon icon--emoji'}/>
        );

    const clearHandle = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
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
                    placement='top'
                    overlay={
                        <Tooltip id='clear-custom-status'>
                            {'Clear'}
                        </Tooltip>
                    }
                >
                    <button
                        className='style--none input-clear-x'
                        onClick={clearHandle}
                    >
                        <i className='icon icon-close-circle'/>
                    </button>
                </OverlayTrigger>
            </div>
        ) : null;

    const disableSetStatus = (currentCustomStatus.text === text && currentCustomStatus.emoji === emoji) ||
        (text === '' && emoji === '');

    const handleSuggestionClick = (status: any) => {
        setEmoji(status.emoji);
        setText(status.text);
    };

    const calculateRightOffSet = () => {
        let rightOffset = Constants.DEFAULT_EMOJI_PICKER_RIGHT_OFFSET;
        const target = getCustomStatusControlRef();
        if (target) {
            const anyTarget: any = target;
            rightOffset = window.innerWidth - anyTarget.getBoundingClientRect().left - EMOJI_PICKER_WIDTH_OFFSET;
            if (rightOffset < 0) {
                rightOffset = Constants.DEFAULT_EMOJI_PICKER_RIGHT_OFFSET;
            }
        }

        return rightOffset;
    };

    const recentStatuses = (
        <div>
            <div className='statusSuggestion__title'>
                {'RECENT'}
            </div>
            {
                recentCustomStatuses.map((status: UserCustomStatus) => (
                    <CustomStatusSuggestion
                        key={status.text}
                        handleSuggestionClick={handleSuggestionClick}
                        handleClear={handleRecentCustomStatusClear}
                        emoji={status.emoji}
                        text={status.text}
                    />
                ))
            }
        </div>
    );

    const renderCustomStatusSuggestions = () => {
        const recentCustomStatusTexts = recentCustomStatuses.map((status: UserCustomStatus) => status.text);
        const customStatusSuggestions = defaultCustomStatusSuggestions.
            filter((status: UserCustomStatus) => !recentCustomStatusTexts.includes(status.text)).
            map((status: UserCustomStatus, index: number) => (
                <CustomStatusSuggestion
                    key={index}
                    handleSuggestionClick={handleSuggestionClick}
                    emoji={status.emoji}
                    text={status.text}
                />
            ));

        if (customStatusSuggestions.length > 0) {
            return (
                <>
                    <div className='statusSuggestion__title'>
                        {'SUGGESTIONS'}
                    </div>
                    {customStatusSuggestions}
                </>
            );
        }

        return null;
    };

    const suggestion = (
        <div className='statusSuggestion'>
            <div className='statusSuggestion__content'>
                {recentCustomStatuses.length > 0 && recentStatuses}
                <div>
                    {renderCustomStatusSuggestions()}
                </div>
            </div>
        </div>
    );

    const expiryMenuItems: { [key: string]: ExpiryMenuItem } = {
        'dont-clear': {
            text: "Don't clear",
            value: "Don't clear",
            localizationId: 'dont_clear',
        },
        'thirty-minutes': {
            text: '30 minutes',
            value: '30 minutes',
            localizationId: 'thirty_minutes',
        },
        'one-hour': {
            text: '1 hour',
            value: '1 hour',
            localizationId: 'one_hour',
        },
        'four-hours': {
            text: '4 hours',
            value: '4 hours',
            localizationId: 'four_hours',
        },
        today: {
            text: 'Today',
            value: 'Today',
            localizationId: 'today',
        },
        'this-week': {
            text: 'This week',
            value: 'This week',
            localizationId: 'this_week',
        },
        'date-and-time': {
            text: 'Choose date and time',
            value: 'Date and Time',
            localizationId: 'choose_date_and_time',
        },
    };

    const expiryMenu = (
        <div className='statusExpiry'>
            <div className='statusExpiry__content'>
                <MenuWrapper
                    className={'statusExpiry__menu'}
                >
                    <span className='expiry-wrapper expiry-selector'>
                        <FormattedMessage
                            id='expiry_dropdown.clear_after'
                            defaultMessage='Clear after: '
                        />
                        <span className='expiry-value'>
                            {expiryMenuItems[expiry].value}
                        </span>
                        <span>
                            <i
                                className='fa fa-angle-down'
                                aria-hidden='true'
                            />
                        </span>
                    </span>
                    <Menu
                        ariaLabel={localizeMessage('expiry_dropdown.menuAriaLabel', 'Clear after')}
                        id='statusExpiryMenu'
                    >
                        <Menu.Group>
                            {Object.keys(expiryMenuItems).map((item, index) => (
                                <Menu.ItemAction
                                    key={index}
                                    onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleExpiryChange(event, item)}
                                    ariaLabel={localizeMessage(`expiry_dropdown.${expiryMenuItems[item].localizationId}`, expiryMenuItems[item].text).toLowerCase()}
                                    text={localizeMessage(`expiry_dropdown.${expiryMenuItems[item].localizationId}`, expiryMenuItems[item].text)}
                                    id={`expiry-menu-${item}`}
                                />
                            ))}
                        </Menu.Group>
                    </Menu>
                </MenuWrapper>
            </div>
        </div>
    );

    const Navbar: React.FC<Partial<NavbarElementProps>> = (navbarProps: Partial<NavbarElementProps>) => {
        const {
            onPreviousClick,
            onNextClick,
            className,
        } = navbarProps;
        const styleLeft: React.CSSProperties = {
            float: 'left',
        };
        const styleRight: React.CSSProperties = {
            float: 'right',
        };
        return (
            <div className={className}>
                <button
                    className='style--none'
                    style={styleLeft}
                    onClick={() => onPreviousClick()}
                >
                    {'←'}
                </button>
                <button
                    className='style--none'
                    style={styleRight}
                    onClick={() => onNextClick()}
                >
                    {'→'}
                </button>
            </div>
        );
    };

    const showDateAndTimeField = isStatusSet && expiry === 'date-and-time';
    const dateTimeInputContainer = (
        <div className='dateTime'>
            <div className='dateTime__date-input'>
                <span className='dateTime__input-title'>{'Date'}</span>
                <span className='dateTime__date-icon'>
                    <i
                        className='fa fa-calendar'
                        aria-hidden='true'
                    />
                </span>
                <DayPickerInput
                    component={(inputProps: any) => (
                        <input
                            {...inputProps}
                            placeholder=''
                            value='Today'
                        />)}
                    dayPickerProps={{navbarElement: <Navbar/>}}
                />
            </div>
            <div className='dateTime__time-input'>
                <span className='dateTime__input-title'>{'Time'}</span>
                <span className='dateTime__time-icon'>
                    <i
                        className='fa fa-clock-o'
                        aria-hidden='true'
                    />
                </span>
                <input value='12:30 PM'/>
            </div>
        </div>
    );

    return (
        <GenericModal
            enforceFocus={false}
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
            handleCancel={handleClearStatus}
        >
            <div className='StatusModal__body'>
                <div className='StatusModal__input'>
                    <div
                        ref={customStatusControlRef}
                        className='StatusModal__emoji-container'
                    >
                        {showEmojiPicker && (
                            <EmojiPickerOverlay
                                target={getCustomStatusControlRef}
                                show={showEmojiPicker}
                                onHide={handleEmojiClose}
                                onEmojiClose={handleEmojiClose}
                                onEmojiClick={handleEmojiClick}
                                rightOffset={calculateRightOffSet()}
                            />
                        )}
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
                {showDateAndTimeField && dateTimeInputContainer}
                {isStatusSet && expiryMenu}
            </div>
        </GenericModal>
    );
};

export default CustomStatusModal;
