// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {useSelector} from 'react-redux';

import moment from 'moment';

import OverlayTrigger from 'components/overlay_trigger';
import RenderEmoji from 'components/emoji/render_emoji';
import {getCustomStatus, isCustomStatusEnabled} from 'selectors/views/custom_status';
import {GlobalState} from 'types/store';
import Constants from 'utils/constants';
import {CustomStatusDuration} from 'mattermost-redux/types/users';
import Timestamp, {RelativeRanges} from 'components/timestamp';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getUserTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {areTimezonesEnabledAndSupported} from 'selectors/general';
import {getCurrentDateAndTimeForTimezone} from 'utils/timezone';

const CUSTOM_STATUS_EXPIRY_RANGES = [
    RelativeRanges.TODAY_TITLE_CASE,
    RelativeRanges.TOMORROW_TITLE_CASE,
];

export function displayTime(time: string, timezone?: string) {
    const currentTime = timezone ? getCurrentDateAndTimeForTimezone(timezone) : new Date();
    const timestampProps: { [key: string]: any } = {
        value: time,
        ranges: CUSTOM_STATUS_EXPIRY_RANGES,
    };

    const currentMomentTime = moment(currentTime);
    if (moment(time).isSame(currentMomentTime.endOf('day')) || moment(time).isAfter(currentMomentTime.add(1, 'day').endOf('day'))) {
        timestampProps.useTime = false;
    }
    if (moment(time).isBefore(currentMomentTime.add(6, 'days'))) {
        timestampProps.useDate = {weekday: 'long'};
    }

    return (
        <Timestamp
            {...timestampProps}
        />
    );
}

interface ComponentProps {
    emojiSize?: number;
    showTooltip?: boolean;
    tooltipDirection?: 'top' | 'right' | 'bottom' | 'left';
    spanStyle?: React.CSSProperties;
    emojiStyle?: React.CSSProperties;
    userID?: string;
    onClick?: () => void;
}

const CustomStatusEmoji = (props: ComponentProps) => {
    const {emojiSize, emojiStyle, spanStyle, showTooltip, tooltipDirection, userID, onClick} = props;
    const customStatusEnabled = useSelector(isCustomStatusEnabled);
    const customStatus = useSelector((state: GlobalState) => {
        return getCustomStatus(state, userID);
    });
    const currentUserId = useSelector(getCurrentUserId);
    const userTimezone = useSelector((state: GlobalState) => getUserTimezone(state, currentUserId));
    const enableTimezone = useSelector(areTimezonesEnabledAndSupported);

    let timezone: string | undefined;
    if (enableTimezone) {
        timezone = userTimezone.manualTimezone;
        if (userTimezone.useAutomaticTimezone) {
            timezone = userTimezone.automaticTimezone;
        }
    }

    if (!(customStatusEnabled && customStatus && customStatus.emoji)) {
        return null;
    }

    const statusEmoji = (
        <RenderEmoji
            emojiName={customStatus.emoji}
            size={emojiSize}
            emojiStyle={emojiStyle}
            onClick={onClick}
        />
    );

    if (!showTooltip) {
        return statusEmoji;
    }

    return (
        <OverlayTrigger
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement={tooltipDirection}
            overlay={
                <Tooltip id='custom-status-tooltip'>
                    <div className='custom-status'>
                        <RenderEmoji
                            emojiName={customStatus.emoji}
                            size={14}
                            emojiStyle={{
                                marginTop: 2,
                            }}
                        />
                        {customStatus.text &&
                            <span
                                className='custom-status-text'
                                style={{marginLeft: 5}}
                            >
                                {customStatus.text}
                            </span>
                        }
                    </div>
                    {customStatus.expires_at && customStatus.duration !== CustomStatusDuration.DONT_CLEAR &&
                        <div>
                            <span>
                                {'Until '}
                                {displayTime(customStatus.expires_at, timezone)}
                            </span>
                        </div>
                    }
                </Tooltip>
            }
        >
            <span style={spanStyle}>
                {statusEmoji}
            </span>
        </OverlayTrigger>
    );
};

CustomStatusEmoji.defaultProps = {
    userID: '',
    emojiSize: 16,
    tooltipDirection: 'top',
    showTooltip: false,
    spanStyle: {},
    emojiStyle: {
        marginLeft: 4,
    },
};

export default CustomStatusEmoji;
