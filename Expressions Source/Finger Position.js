// Copyright 2019-2020 Omni Development, Inc.  All rights reserved.
//
// This software may only be used and reproduced according to the
// terms in the file OmniSourceLicense.html, which should be
// distributed with this project and can also be found at
// <http://www.omnigroup.com/developer/sourcecode/sourcelicense/>.

/* iOS Screencast with Virtual Finger - Position expression

Written by Mark Boszko, The Omni Group


Usage:

Calculates what the position of the virtual finger should be, based on manual
position keyframes, which indicate the time and position of a finger tap.

Keyframes <= 4f apart indicate an extended drag event, handled differently.


Release History:

v1.0 - 2015-05-18 - Development started
v1.1 - 2020-04-19 - Open sourced under OmniSourceLicense

*/

// FIXME: Something going awry during a drag event
var nextKey = 0,
    prevKey = 0,
    returnValue = [-1, -1];

var moveSpeed = 900; // in pixels per second

// How many frames of padding before and after manual keyframes?
// WISHLIST: Make movePad a function, so that I can assign frames anytime,
//       and it will be immediately be converted to a decimal time.
var movePadFrames = 4; // how long before the keyframe should the move arrive (ideal)
var movePad = framesToTime(movePadFrames, fps = 1.0 / thisComp.frameDuration);

// How close together do keyframes need to be to trigger a drag event?
var dragDeltaFrames = 4;
var dragDelta = framesToTime(dragDeltaFrames, fps = 1.0 / thisComp.frameDuration);

// Number of keyframes for this property
numKeys = transform.position.numKeys;

// I want to know what keyframes are on either side of where the CTI is.
for (i = 1; i <= numKeys; i++) {
    if (transform.position.key(i).time < time) {
        prevKey = i;
    } else if (transform.position.key(i).time == time) {
        // We're right on a keyframe. Return the existing value
        nextKey = -1;
        returnValue = value;
        break;
    } else if (transform.position.key(i).time > time) {
        nextKey = i;
        break;
    } else {
        // something's gone horribly awry
        returnValue = [-666, -666];
    }
};

/*
If prevKey == 0, that means we're before the first keyframe
If nextKey == 0, that means we're after the last keyframe
If nextKey == -1, that means we're dead on a keyframe
Else, we should have a pair of consecutive numbers.
*/

// Handle the special cases above

// if prevKey == 0, prevValue = center of comp
// We should also fade opacity in here (in Opacity expression)

if (prevKey == 0 && nextKey == 1) {
    var prevValue = [thisComp.width / 2, thisComp.height / 2];
    var nextValue = transform.position.key(nextKey).value;
    var nextTime = transform.position.key(nextKey).time;

    moveLength = length(prevValue, nextValue);
    moveTime = moveLength / moveSpeed;

    // There shouldn't be a keyframe right next to the beginning of the comp,
    // And even if there is, I probably intend to do something weird,
    // so I'm not going to worry about a minimum moveTime here.

    nextArrivalTime = nextTime - movePad;

    var returnX = ease(time, nextArrivalTime - moveTime, nextArrivalTime, prevValue[0], nextValue[0]);
    var returnY = ease(time, nextArrivalTime - moveTime, nextArrivalTime, prevValue[1], nextValue[1]);

    returnValue = [returnX, returnY];

}

// if nextKey == 0, stay still
// We should also fade opacity out here (in Opacity expression)

if (nextKey == 0) {
    returnValue = value;
}

// if nextKey == -1, that's handled above by returning the current value

// Else, we're between two keyframes

if (prevKey > 0 && nextKey > 0) {
    if (nextKey - 1 != prevKey) {
        // something's gone horribly awry
        returnValue = [-999, -999];
    } else {
        // Do our re-timing and interpolation here

        // See how much time we have between keyframes, and start/end accordingly
        // Determine start time based on moveSpeed

        var prevValue = transform.position.key(prevKey).value;
        var prevTime = transform.position.key(prevKey).time;
        var nextValue = transform.position.key(nextKey).value;
        var nextTime = transform.position.key(nextKey).time;

        var keyDelta = nextTime - prevTime; // How long we have

        if (keyDelta <= dragDelta) {
            // If keyframes are < 4f apart, this is a drag; linear instead of ease
            var returnX = linear(time, prevTime, nextTime, prevValue[0], nextValue[0]);
            var returnY = linear(time, prevTime, nextTime, prevValue[1], nextValue[1]);
            returnValue = [returnX, returnY];
        } else {
            // Just a normal move

            // How many pixels do we need to travel?
            moveLength = length(prevValue, nextValue);

            // How long at the given speed?
            moveTime = moveLength / moveSpeed;

            // Let's try for a minimum moveTime of 2X the movePad length,
            // so that tiny moveLengths don't get super short times
            if (moveTime < (movePad * 2)) {
                moveTime = movePad * 2;
            }


            // If the move would take longer than we have between keyframes,
            // just move in the time we have.

            var nextArrivalTime = nextTime - movePad;
            var moveDelta = (movePad * 2) + moveTime; // How long the move should take
            var prevDepartTime;

            if (moveDelta <= keyDelta) {
                // We have enough time to make a nice move
                prevDepartTime = nextArrivalTime - moveTime;
            } else if (movePad * 3 <= keyDelta) {
                // We can still make a shorter move with pads
                prevDepartTime = prevTime + movePad;
            } else {
                // Jack Bauer
                prevDepartTime = prevTime + (movePad / 2);
                nextArrivalTime = nextTime - (movePad / 2);
            }


            var returnX = ease(time, prevDepartTime, nextArrivalTime, prevValue[0], nextValue[0]);
            var returnY = ease(time, prevDepartTime, nextArrivalTime, prevValue[1], nextValue[1]);

            returnValue = [returnX, returnY];
        }
    }
};

returnValue;
