// Copyright 2019-2020 Omni Development, Inc.  All rights reserved.
//
// This software may only be used and reproduced according to the
// terms in the file OmniSourceLicense.html, which should be
// distributed with this project and can also be found at
// <http://www.omnigroup.com/developer/sourcecode/sourcelicense/>.

/* iOS Screencast with Virtual Finger - Touching expression

Written by Mark Boszko, The Omni Group

Usage:

Calculates when the virtual finger should be in the "touching" state,
based on manual position keyframes, which indicate the time and position
of a finger tap.

Position keyframes <= 4f apart indicate an extended drag event,
and the finger should remain touching during this whole time

This expression should be applied to the Touching checkbox effect on the
TouchFinger pre-comp layer inside EDIT_FINGER comp.


Release History:

v1.0 - 2015-05-21 - Development started.
v1.1 - 2016-02-24 - Added Gesture (no touch) movements, signified by a
       keyframe on the Touching checkbox effect, at the same time as a
       position keyframe.
v1.2 - 2020-04-19 - Open sourced under OmniSourceLicense

*/

// WISHLIST: Come up with a way to represent double-tap.
//		 Maybe if this keyframe and prev/next are the exact same position
//		 and exactly 4 frames apart?
var nextKey = 0,
    prevKey = 0,
    returnValue = 0;

// Number of keyframes for the position property
var posNumKeys = transform.position.numKeys;

// I want to know what position keyframes are on either side of where the CTI is.
for (i = 1; i <= posNumKeys; i++) {
    if (transform.position.key(i).time < time) {
        prevKey = i;
    } else if (transform.position.key(i).time == time) {
        // We're right on a keyframe.
        nextKey = -1; // special value to indicate we are on a keyframe
        returnValue = 1;
        break;
    } else if (transform.position.key(i).time > time) {
        nextKey = i;
        break;
    } else {
        // something's gone horribly awry
        returnValue = -666;
    }
};

// Enable taps

// If the next position keyframe is 1 frame away, touch down
// nextKey.time - time, convert to frames, round == 1 ?

if (nextKey > 0) {
    nextDelta = (transform.position.key(nextKey).time - time)
    nextDeltaFrames = timeToFrames(t = nextDelta, fps = 1.0 / thisComp.frameDuration, isDuration = false)
    if (nextDeltaFrames == 1) returnValue = 1;
}

// If the prev keyframe is 1 frame away, touch up
// time - prevKey.time, convert to frames, round == 1 ?

if (prevKey > 0) {
    prevDelta = (transform.position.key(prevKey).time - time)
    prevDeltaFrames = timeToFrames(t = prevDelta, fps = 1.0 / thisComp.frameDuration, isDuration = false);
    if (prevDeltaFrames == 1) returnValue = 1;
}

// Manage the drag state

if (prevKey > 0 && nextKey > 0 && returnValue == 0) {
    keysDelta = transform.position.key(nextKey).time - transform.position.key(prevKey).time;
    keysDeltaFrames = timeToFrames(t = keysDelta, fps = 1.0 / thisComp.frameDuration, isDuration = false);
    if (keysDeltaFrames <= 4) returnValue = 1;
}



/*

So now that we have the touch state, REVERT it to a non-touch
if we have a keyframe on the Touching effect, because this
special case means it's a gesture and not a touch.

*/

// Get the keyframes for the Touching checkbox.
// Taps disabled within two frames of a Touching keyframe

var nextTouchKey = 0,
    prevTouchKey = 0,
    isGesture = false;

// Number of keyframes for the position property
var touchNumKeys = thisLayer.effect("Touching").param("Checkbox").numKeys;

// I want to know what touch keyframes are on either side of where the CTI is.
for (i = 1; i <= touchNumKeys; i++) {
    if (thisLayer.effect("Touching").param("Checkbox").key(i).time < time) {
        prevTouchKey = i;
    } else if (thisLayer.effect("Touching").param("Checkbox").key(i).time == time) {
        // We're right on a keyframe.
        nextTouchKey = -1; // special value to indicate we are on a keyframe
        isGesture = true;
        break;
    } else if (thisLayer.effect("Touching").param("Checkbox").key(i).time > time) {
        nextTouchKey = i;
        break;
    } else {
        // something's gone horribly awry
        returnValue = -666;
    }
};


// Disable taps

// If the next touch keyframe is 1 frame away, do not touch down
// nextTouchKey.time - time, convert to frames, round == 1 ?

if (nextTouchKey > 0) {
    nextDelta = (thisLayer.effect("Touching").param("Checkbox").key(nextTouchKey).time - time)
    nextDeltaFrames = timeToFrames(t = nextDelta, fps = 1.0 / thisComp.frameDuration, isDuration = false)
    if (nextDeltaFrames == 1) isGesture = true;
}

// If the prev touch keyframe is 1 frame away, still do not touch down
// time - prevTouchKey.time, convert to frames, round == 1 ?

if (prevTouchKey > 0) {
    prevDelta = (thisLayer.effect("Touching").param("Checkbox").key(prevTouchKey).time - time)
    prevDeltaFrames = timeToFrames(t = prevDelta, fps = 1.0 / thisComp.frameDuration, isDuration = false);
    if (prevDeltaFrames == 1) isGesture = true;
}



// Return
if (isGesture) {
    0; // return no touch
} else {
    returnValue; // Do the thing you're normally supposed to
}
