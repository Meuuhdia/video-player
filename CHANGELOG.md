# Changelog

## 1.2.0
- [feature] extended audio description: descriptions written in a WebVTT track (`<track kind="descriptions" src="*.vtt">`) read by the speech synthesis or sent to the screen reader (aria-live), with automatic pause until a description is finished and lowered video volume while speaking
- [feature] audio description menu: 
    - recorded version
    - spoken descriptions per language
    - output, speech rate and pause settings saved between visits
- [feature] transcription on the right: 
    - the video shrinks to leave it room
    - without enough room it stays below and the side buttons are hidden
    - a displayed transcription stays visible in fullscreen
- [fix] changing the transcription language quickly displayed several transcriptions, a missing or invalid file now shows a message
- [fix] the player waited for the first image of the video: 
    - on Safari (and iOS) it only appeared after the first play
    - an unknown or infinite duration (live stream) broke the controls
- [fix] several players on a page:
    - fullscreen changed the state of all of them
    - caption settings labels pointed to the first player
- [fix] a video with only a transcription showed an empty captions menu
- [fix] clicking a label in the captions or audio description settings could close the menu
- [fix] the progress bar jumped back while being dragged during playback
- [fix] controls misaligned in fullscreen when the host site limits the width of list items
- [fix] event listeners piled up during playback until the tab could crash (hidden controls took several seconds of mouse movement to come back)
- [fix] progress bar thumb cut off on screens narrower than 401px
- [fix] a displayed transcription added a large empty space at the bottom of the page
- [fix] play/pause button label was always in French and did not follow pauses not made with the button

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