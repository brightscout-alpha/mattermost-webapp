// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import StatusDropdown from './status_dropdown';

describe('components/StatusDropdown', () => {
    const actions = {
        openModal: jest.fn(),
        setStatus: jest.fn(),
        unsetUserCustomStatus: jest.fn(),
        setStatusDropdown: jest.fn(),
        setCustomStatusInitialisationState: jest.fn(),
    };

    const baseProps = {
        actions,
        userId: '',
        isCustomStatusEnabled: false,
        isStatusDropdownOpen: false,
        showCustomStatusPulsatingDot: false,
    };

    test('should match snapshot in default state', () => {
        const wrapper = shallow(
            <StatusDropdown {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with profile picture URL', () => {
        const props = {
            ...baseProps,
            profilePicture: 'http://localhost:8065/api/v4/users/jsx5jmdiyjyuzp9rzwfaf5pwjo/image?_=1590519110944',
        };

        const wrapper = shallow(
            <StatusDropdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with status dropdown open', () => {
        const props = {
            ...baseProps,
            isStatusDropdownOpen: true,
        };

        const wrapper = shallow(
            <StatusDropdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with custom status enabled', () => {
        const props = {
            ...baseProps,
            isStatusDropdownOpen: true,
            isCustomStatusEnabled: true,
        };

        const wrapper = shallow(
            <StatusDropdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with custom status pulsating dot enabled', () => {
        const props = {
            ...baseProps,
            isStatusDropdownOpen: true,
            isCustomStatusEnabled: true,
            showCustomStatusPulsatingDot: true,
        };

        const wrapper = shallow(
            <StatusDropdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when tooltip is enabled', () => {
        const props = {
            ...baseProps,
            isStatusDropdownOpen: true,
            isCustomStatusEnabled: true,
        };
        const wrapper = shallow(
            <StatusDropdown {...props}/>,
        );

        wrapper.setState({showCustomStatusTooltip: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should enable tooltip when needed', () => {
        const props = {
            ...baseProps,
            isStatusDropdownOpen: true,
            isCustomStatusEnabled: true,
        };
        const wrapper = shallow<StatusDropdown>(
            <StatusDropdown {...props}/>,
        );

        const instance = wrapper.instance();
        instance.customStatusTextRef = {
            current: {
                offsetWidth: 50,
                scrollWidth: 60,
            },
        } as any;

        instance.showCustomStatusTextTooltip();
        expect(instance.state.showCustomStatusTooltip).toBe(true);
    });

    test('setCustomStatusInitialisationState should be dispatched if showPulsatingDot is true and modal is opened', () => {
        const props = {
            ...baseProps,
            isStatusDropdownOpen: true,
            isCustomStatusEnabled: true,
            showCustomStatusPulsatingDot: true,
        };
        const wrapper = shallow<StatusDropdown>(
            <StatusDropdown {...props}/>,
        );

        const instance = wrapper.instance();
        instance.showCustomStatusModal();
        expect(props.actions.setCustomStatusInitialisationState).toBeCalledTimes(1);
    });
});
