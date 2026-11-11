# Changelog

## 1.2.0
Recommended update: it fixes a memory issue present since 1.0.0 that could slow down the page during long viewing sessions.

### Features
- extended audio description: descriptions written in a WebVTT track (`<track kind="descriptions" src="*.vtt">`) read by the speech synthesis or sent to the screen reader (aria-live), with automatic pause until a description is finished and lowered video volume while speaking
- audio description menu:
    - recorded version
    - spoken descriptions per language
    - output, speech rate and pause settings saved between visits
- transcription on the right:
    - the video shrinks to leave it room
    - without enough room it stays below and the side buttons are hidden
    - a displayed transcription stays visible in fullscreen

### Fixes
- event listeners piled up during playback and could slow down or crash the tab in long sessions (hidden controls took several seconds of mouse movement to come back)
- the player waited for the first image of the video:
    - on Safari (and iOS) it only appeared after the first play
    - an unknown or infinite duration (live stream) broke the controls
- several players on a page:
    - fullscreen changed the state of all of them
    - caption settings labels pointed to the first player
- transcription:
    - changing the language quickly displayed several transcriptions
    - a missing or invalid file now shows a message
    - a video with only a transcription showed an empty captions menu
    - a displayed transcription added a large empty space at the bottom of the page
- progress bar:
    - it jumped back while being dragged during playback
    - its thumb was cut off on screens narrower than 401px
- screen readers announced the progress bar and the volume as raw numbers
- the volume only changed when the slider was released
- the play/pause button label was always in French and did not follow pauses not made with the button
- controls were misaligned in fullscreen when the host site limits the width of list items
- clicking a label in the captions or audio description settings could close the menu
- a refused playback left an error in the console
- the Space key on the video only worked in Firefox

## 1.1.0
- [feature] audio description: alternative audio described video version (`<source data-audiodescription>`) with a toggle button keeping position and playback state
- [fix] fullscreen button: initial aria-pressed was set on the list item instead of the button
- [docs] audio description documentation, links to Meuuhdia Studio, homepage now points to meuuhdia.buocennig.fr

## 1.0.2
- [fix] line breaks ignored in untagged caption text: each cue line is now rendered in its own span
- [fix] transcription speaker names containing spaces were dropped: only the first space separates time and speaker
- [docs] fix `<v.think>` and `<lang>` markup examples and inverted `align` start/end description

## 1.0.1
- [update] add english and italian translation
- [update] add autoplay and muted attributes compatibility
- [fix] disclosures conflict with multiple players on the same page