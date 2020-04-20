// Copyright 2019-2020 Omni Development, Inc.  All rights reserved.
//
// This software may only be used and reproduced according to the
// terms in the file OmniSourceLicense.html, which should be
// distributed with this project and can also be found at
// <http://www.omnigroup.com/developer/sourcecode/sourcelicense/>.

/* iOS Screencast with Virtual Finger - Opacity expression

Written by Mark Boszko, The Omni Group


Usage:

Calculates what the opacity of the virtual finger should be, based on manual
position keyframes, which indicate the time and position of a finger tap.

Fades in and out at the beginning and end, and whenever there's no finger motion
for > maxIdle. Hopefully this represents some keyboard action.


Release History:

v1.0 - 2015-05-21 - Development started
v1.1 - 2020-04-19 - Open sourced under OmniSourceLicense

*/

// WISHLIST: Consider adding manual fades with named markers



// What should the opacity normally be, and when it fades out?
var maxOpacity = 66.666;
var minOpacity = 0;

// How long of a gap is allowed before a fadeout is triggered?
var maxIdle = 3.0; // in seconds

// How long should the fades be?
var fadeTime = 0.5; // in seconds; must be < maxIdle / 2, else unexpected values

// How many frames of padding before and after manual keyframes?
var fadePadFrames = 4; // how long before the keyframe should the move arrive (ideal)
var fadePad = framesToTime(fadePadFrames, fps = 1.0 / thisComp.frameDuration);

var nextKey = 0,
    prevKey = 0,
    returnValue = maxOpacity;

// Number of keyframes for position
var posNumKeys = transform.position.numKeys;

// I want to know what keyframes are on either side of where the CTI is.
for (i = 1; i <= posNumKeys; i++) {
    if (transform.position.key(i).time < time) {
        prevKey = i;
    } else if (transform.position.key(i).time == time) {
        // We're right on a keyframe.
        nextKey = -1;
        returnValue = maxOpacity;
        break;
    } else if (transform.position.key(i).time > time) {
        nextKey = i;
        break;
    } else {
        // something's gone horribly awry
        returnValue = -666;
    }
}

/*
If prevKey == 0, that means we're before the first keyframe
If nextKey == 0, that means we're after the last keyframe
If nextKey == -1, that means we're dead on a keyframe
Else, we should have a pair of consecutive numbers.
*/

// Handle the special cases above

// if prevKey == 0, we're before first keyframe; fade opacity in

if (prevKey == 0 && nextKey == 1) {
    var nextTime = transform.position.key(nextKey).time;

    maxTime = nextTime - fadePad;
    minTime = nextTime - fadePad - (fadeTime * 2);

    returnValue = linear(time, minTime, maxTime, minOpacity, maxOpacity);
}

// if nextKey == 0, we're after the last position keyframe; fade out

if (nextKey == 0) {
    var prevTime = transform.position.key(prevKey).time;

    maxTime = prevTime + fadePad;
    minTime = prevTime + fadePad + fadeTime;

    returnValue = linear(time, maxTime, minTime, maxOpacity, minOpacity);
}

// if nextKey == -1, that's handled above by returning the maxOpacity value

// Else, we're between two keyframes

if (prevKey > 0 && nextKey > 0) {
    if (nextKey - 1 != prevKey) {
        // something's gone horribly awry
        returnValue = -999;
    } else {
        // See how much time we have between keyframes, and fade accordingly

        var prevTime = transform.position.key(prevKey).time;
        var nextTime = transform.position.key(nextKey).time;

        var keyDelta = nextTime - prevTime; // How long we have

        if (keyDelta >= maxIdle) {
            // If keyframes are > maxIdle seconds apart, fade out during idle, then fade in

            if ((time - prevTime) < (nextTime - time)) {
                // We're in the top half of the fade - out

                maxTime = prevTime + fadePad;
                minTime = prevTime + fadePad + fadeTime;

                returnValue = linear(time, maxTime, minTime, maxOpacity, minOpacity);
            } else {
                // We're in the bottom half of the fade - in

                minTime = nextTime - fadePad - fadeTime;
                maxTime = nextTime - fadePad;

                returnValue = linear(time, minTime, maxTime, minOpacity, maxOpacity);
            }
        }
    }
};

returnValue;
