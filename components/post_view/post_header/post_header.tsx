// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {EventHandler, MouseEvent} from 'react';
import {FormattedMessage} from 'react-intl';

import {Post} from 'mattermost-redux/types/posts';

import {UserCustomStatus} from 'mattermost-redux/types/users';

import Constants from 'utils/constants';
import * as PostUtils from 'utils/post_utils.jsx';
import PostInfo from 'components/post_view/post_info';
import UserProfile from 'components/user_profile';
import BotBadge from 'components/widgets/badges/bot_badge';
import Badge from 'components/widgets/badges/badge';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import './post_header.scss';

export type Props = {

    /*
    * The post to render the header for
    */
    post: Post;

    /*
    * Function called when the comment icon is clicked
    */
    handleCommentClick: EventHandler<MouseEvent>;

    /*
    * Function called when the card icon is clicked
    */
    handleCardClick: (post: Post) => void;

    /*
    * Function called when the post options dropdown is opened
    */
    handleDropdownOpened: (opened: boolean) => void;

    /*
    * Set to render compactly
    */
    compactDisplay?: boolean;

    /*
    * The number of replies in the same thread as this post
    */
    replyCount?: number;

    /**
     * Set to indicate that this is previous post was not a reply to the same thread
     */
    isFirstReply?: boolean;

    /**
     * Set to mark post as being hovered over
     */
    hover: boolean;

    /*
    * Set to render the post time when not hovering
    */
    showTimeWithoutHover: boolean;

    /**
     * Whether or not the post username can be overridden.
     */
    enablePostUsernameOverride: boolean;

    /**
     * If the user that made the post is a bot.
     */
    isBot: boolean;

    /**
     * If the user that made the post is a guest.
     */
    isGuest: boolean;

    /**
     * To Check if the current post is last in the list
     */
    isLastPost?: boolean;

    /**
     * To Check if the current post is last in the list by the current user
     */
    isCurrentUserLastPostGroupFirstPost?: boolean;

    /**
     * Source of image that should be override current user profile.
     */
    overwriteIcon?: string;

    /**
     * Custom status of the user
     */
    customStatus: UserCustomStatus;

    /**
     * User id of logged in user.
     */
    currentUserID: string;

    isCustomStatusEnabled: boolean;
    showUpdateStatusButton: boolean;

    actions: {
        setStatusDropdown: (open: boolean) => void;
    };
};

export default class PostHeader extends React.PureComponent<Props> {
    updateStatus = () => {
        this.props.actions.setStatusDropdown(true);
    }

    render(): JSX.Element {
        const {post} = this.props;
        const isSystemMessage = PostUtils.isSystemMessage(post);
        const fromAutoResponder = PostUtils.fromAutoResponder(post);
        const fromWebhook = post?.props?.from_webhook === 'true';

        let userProfile = (
            <UserProfile
                userId={post.user_id}
                hasMention={true}
            />
        );
        let indicator;
        let colon;
        let customStatus;

        if (fromWebhook) {
            if (post.props.override_username && this.props.enablePostUsernameOverride) {
                userProfile = (
                    <UserProfile
                        userId={post.user_id}
                        hideStatus={true}
                        overwriteName={post.props.override_username}
                        overwriteIcon={this.props.overwriteIcon}
                    />
                );
            } else {
                userProfile = (
                    <UserProfile
                        userId={post.user_id}
                        hideStatus={true}
                    />
                );
            }

            if (!this.props.isBot) {
                indicator = (<BotBadge/>);
            }
        } else if (fromAutoResponder) {
            userProfile = (
                <UserProfile
                    userId={post.user_id}
                    hideStatus={true}
                    hasMention={true}
                />
            );

            indicator = (
                <Badge>
                    <FormattedMessage
                        id='post_info.auto_responder'
                        defaultMessage='AUTOMATIC REPLY'
                    />
                </Badge>
            );
        } else if (isSystemMessage && this.props.isBot) {
            userProfile = (
                <UserProfile
                    userId={post.user_id}
                    hideStatus={true}
                />
            );
        } else if (isSystemMessage) {
            userProfile = (
                <UserProfile
                    overwriteName={
                        <FormattedMessage
                            id='post_info.system'
                            defaultMessage='System'
                        />
                    }
                    overwriteImage={Constants.SYSTEM_MESSAGE_PROFILE_IMAGE}
                    disablePopover={true}
                />
            );
        }

        if (this.props.compactDisplay) {
            colon = (<strong className='colon'>{':'}</strong>);
        }

        const userCustomStatus = this.props.customStatus;
        const isCustomStatusSet = userCustomStatus && userCustomStatus.emoji;
        const isCurrentUser = this.props.post.user_id && this.props.post.user_id === this.props.currentUserID;
        if (this.props.isCustomStatusEnabled && !isSystemMessage && isCustomStatusSet) {
            customStatus = (
                <CustomStatusEmoji
                    userID={this.props.post.user_id}
                    showTooltip={true}
                    emojiSize={14}
                    emojiStyle={{
                        margin: '4px 0 0 4px',
                    }}
                />
            );
        }

        if (this.props.isCustomStatusEnabled && !isSystemMessage && isCurrentUser && !isCustomStatusSet && this.props.showUpdateStatusButton && this.props.isCurrentUserLastPostGroupFirstPost) {
            customStatus = (
                <div
                    onClick={this.updateStatus}
                    className='post__header-set-custom-status cursor--pointer'
                >
                    <EmojiIcon className='post__header-set-custom-status-icon'/>
                    <span className='post__header-set-custom-status-text'>
                        <FormattedMessage
                            id='post_header.update_status'
                            defaultMessage='Update your status'
                        />
                    </span>
                </div>
            );
        }

        return (
            <div className='post__header'>
                <div className='col col__name'>
                    {userProfile}
                    {colon}
                    {indicator}
                    {customStatus}
                </div>
                <div className='col'>
                    <PostInfo
                        post={post}
                        handleCommentClick={this.props.handleCommentClick}
                        handleCardClick={this.props.handleCardClick}
                        handleDropdownOpened={this.props.handleDropdownOpened}
                        compactDisplay={this.props.compactDisplay}
                        replyCount={this.props.replyCount}
                        isFirstReply={this.props.isFirstReply}
                        showTimeWithoutHover={this.props.showTimeWithoutHover}
                        hover={this.props.hover}
                        isLastPost={this.props.isLastPost}
                    />
                </div>
            </div>
        );
    }
}
