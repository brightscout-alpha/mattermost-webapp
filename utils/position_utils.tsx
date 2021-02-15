// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function popOverOverlayPosition(
    targetBounds: DOMRect,
    innerHeight: number,
    spaceRequiredAbove: number,
    spaceRequiredBelow?: number,
    defaultHorizontalPosition?: string,
): string {
    let placement: string;

    if (targetBounds.top > spaceRequiredAbove) {
        placement = 'top';
    } else if (innerHeight - targetBounds.bottom > (spaceRequiredBelow || spaceRequiredAbove)) {
        placement = 'bottom';
    } else {
        placement = defaultHorizontalPosition || 'left';
    }
    return placement;
}
