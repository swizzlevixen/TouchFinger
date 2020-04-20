After Effects expressions for easy animation of touch highlights for iOS/Android screencasts.

![Demo of TouchFinger animation on an iPhone 11 Pro](renders/TouchFinger_Demo.gif)

## Usage

For a given TouchFinger, make position keyframes where and when you want the touch highlight to illustrate a touch event. Based on those position keyframes, the touch highlight will adjust opacity, pause, and move smoothly from keyframe to keyframe, mimicking a human user. When the highlight is "hovering" (not touching down), it reduces opacity so that it’s unobtrusive, but the viewer can still track its movement and anticipate the next touch. At The Omni Group, we found this reduced viewer confusion. (If the touch is not needed for several seconds, the highlight fades out, and comes back when it's needed.)

If you need to drag across the screen, I recommend using AE’s tracking to apply position movement to the TouchFinger. If you decide to animate the TouchFinger manually, make sure the keyframes are not more than 4 frames apart, and the script will keep the highlight in the "touch down" mode.

Please see the included After Effects project file `TouchFinger for iOS Devices.aepx` for an example comp using the expressions. There are also several template comps set up for common device sizes. These are sized to fit the native resolution of a recording from those devices, and the touch circles are scaled to the calculated relative size of a fingertip on that screen. I recommend you use Brennan Chapman’s [True Comp Duplicator](https://aescripts.com/true-comp-duplicator/) to make a deep duplicate of all of the nested comps in a template before editing. Don't forget to check the "Update Expressions" checkbox before duplicating.

Two TouchFingers are supplied in each template, but more can be added by duplicating one and then adjusting the expressions attached to that layer to reference the new layer name.

## Okay, but how does it actually work?

There is an EDIT FINGER comp, and one or more TouchFinger precomps nested inside. TouchFinger precomps are layered above a screencast recorded from a mobile device.

### Position

Inside the EDIT FINGER comp, the `Finger Position.js` expression is attached to the Position value of the TouchFinger precomp, and it only handles the position of the finger highlight. The expression attempts to intelligently arrive at the position a few frames before the tap time, pause during the touch event, and then continue to pause there until it's time to move to the next touch event. If it's pressed for time to get to the next touch, it will shorten the animation to something shorter than ideal, but only to a point.

### Opacity

On the same TouchFinger precomp, the `Finger Opacity.js` expression is attached to the Opacity value. This expression keeps an eye on how long there is between position keyframes, and if the highlight is going to be idle for more than a few seconds, fades it out, and fades it back in when it's needed again. This often happens during typing events.

### Touching

There is a Checkbox effect called “Touching” applied to the TouchFinger precomp, and the `Finger Touching.js` expression is applied to that Checkbox. When there is a position keyframe, it is interpreted as a touch event, and this checkbox gets checked for a couple of frames around the keyframe time. If keyframes are 4 or fewer frames apart, this is interpreted as a continuous touch down.

Inside the TouchFinger precomp, there is an expression attached to the finger highlight shape, which listens back to the parent comp to see if the checkbox is checked, and if so, becomes more opaque while it is checked, visually indicating a touch event. The expression is:

```
if (comp("EDIT FINGER").layer("TouchFinger").effect("Touching")("Checkbox") == 1) 100 else 25;
```

> Why the observer? Why not put the `Touching` opacity change inside the `Opacity` Expression?

[That's exactly what I intend to do](https://github.com/bobtiki/TouchFinger/issues/2). The observer is there for historical reasons: The finger highlight was originally made of two separate images, with shading as if it were a pushed or unpushed button. I eventually simplified it to a single simple circle shape, but that vestigial pattern remains. Once I fold that into the opacity expression, that should also eliminate the need for the TouchFinger subcomps, and all the string matching shenanigans that entails, making the templates much simpler.

## Credits / License

Expressions source code written by Mark Boszko while employed as Video Producer at [The Omni Group](https://github.com/omnigroup/). Ken Case, CEO of The Omni Group, was kind enough to grant permission to open source this code. Please see [`OmniSourceLicense.html`](OmniSourceLicense.html) for Omni's MIT-like license terms.

Use of the Apple Product Images in the `(Footage)` folder is governed by the App Store Marketing Artwork License Agreement on the [Apple Marketing Guidelines](https://developer.apple.com/app-store/marketing/guidelines/#section-products) web page. These images are included here to demonstrate their use with an animated screen. Please make sure you have agreed to Apple's terms before using this art for your own videos.

iPhone® and iPad® are registered trademarks of Apple Inc.
