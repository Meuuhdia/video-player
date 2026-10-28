# Changelog

## 1.1.0
- [feature] audio description: alternative audio described video version (`<source data-audiodescription>`) with a toggle button keeping position and playback state
- [fix] fullscreen button: initial aria-pressed was set on the list item instead of the button

## 1.0.2
- [fix] line breaks ignored in untagged caption text: each cue line is now rendered in its own span
- [fix] transcription speaker names containing spaces were dropped: only the first space separates time and speaker
- [docs] fix `<v.think>` and `<lang>` markup examples and inverted `align` start/end description

## 1.0.1
- [update] add english and italian translation
- [update] add autoplay and muted attributes compatibility
- [fix] disclosures conflict with multiple players on the same page