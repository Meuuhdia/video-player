# Meuuhdia

- [documentation en français](/README.fr.md)
- [documentazione in italiano](/README.it.md)

Inclusive video player with standard control options.
You can provide translation files, subtitles, and text transcription.

The player allows users to enable and configure the display of these files themselves.
They can customize the colors and size of subtitles to their preferences.

This player was designed with a commitment to creating an inclusive tool.
However, it has not undergone any accessibility audit, so there are certainly areas for improvement. All feedback is welcome.

## Installation
1. Install the player with NPM: `npm install @meuuhdia/video-player`
2. Enable the player by adding the following code to your main JavaScript file (or wherever you need it):
```js
// without JS bundler
import "/node_modules/@meuuhdia/video-player/meuuhdia.js";

// with JS bundler
import "@meuuhdia/video-player";
```

## Customization
You can update Meuuhdia CSS variables to adapt the colors to your design.

### Player colors and font
```css
:root {
    --meuuhdia-color-main: #000000;
    --meuuhdia-color-secondary: #FFFFFF;
    --meuuhdia-font-family: "Luciole", consolas;
}
```

### Default subtitle colors
```css
:root {
    --meuuhdia-cue-color: #ffff00;
    --meuuhdia-cue-bgcolor: #000000;
}
```

## Usage
Copy the following code where you want to display the video player. This is the minimum code required for Meuuhdia to work.
- The "controls" attribute ensures control options are available if the native player is displayed (JavaScript disabled).
- The `[preload='metadata']` attribute allows the Meuuhdia player to load the video
- At least one `<source>` tag must be provided

```html
<div class="meuuhdia">
    <div class="meuuhdia_wrapper">
        <video preload="metadata" controls>
            <source src="path/to/your/video.mp4" type="video/mp4">
        </video>
    </div>
</div>
```

### Subtitles and translations
VTT files provided should not contain CSS styles. Meuuhdia already applies appropriate styles so everyone can read them correctly and adapt them to their needs.

#### Translation
To provide a translation of the video, the kind attribute must have the value "subtitles".

Example:
```html
<track kind="subtitles" src="path/to/your/subtitles.en.vtt" srclang="en" lang="en" label="English" />
```

#### Captions
To provide captions for the video, the kind attribute must have the value "captions".
Proper captions should allow understanding everything happening in the video with the sound off. For example, if a person reacts to a noise, that noise should be transcribed in the captions.

Example:
```html
<track kind="captions" src="path/to/your/captions.fr.vtt" srclang="fr" label="Français" />
```

For quality captions, 3 basic rules:
- Maximum 2 lines of 40 characters per frame
- Display for a minimum of 600ms
- Minimum 160ms between 2 captions

To benefit from all player features, here are the different markup options and properties available for your VTT files:
- <v John>: on-screen speaker (white)
    - <v.whisp John>: whisper or aside (parentheses)
    - <v.group>: sentence spoken by multiple speakers (uppercase)
- <v.off>: off-screen speaker or voiceover (yellow, italic)
- <c.sound>: sound effect not induced by the image (red)
    - <c.numeric>: sound effect from a phone, TV... (asterisk)
- <c.think Narrator>: character's thought or narration (cyan)
- <c.music>: musical indication, song lyrics (magenta)
- <lang Danish>: foreign language indication (green)
- 00:10.360 --> 00:13.900 align: start/end (right/left)
- 00:10.360 --> 00:13.900 line: 1 (top)

### Text transcription
To provide a text transcription of the video, the kind attribute must have the value "descriptions".

The provided file must be a JSON file containing a list of key/value pairs to display the transcription as an ordered list (e.g., {"00:10 Clara": "Hi Toto!", "00:13 Toto": "Hey Clara, how are you?"})

A proper transcription should allow understanding everything happening in the video from reading the text alone.

Example:
```html
<track kind="descriptions" src="path/to/your/transcript.it.json" srclang="it" label="italiano" />
```

### Complete example
```html
<div class="meuuhdia">
    <div class="meuuhdia_wrapper">
        <video poster="assets/poster.png" preload="metadata" controls disablePictureInPicture>
            <source src="assets/extrait.mp4" type="video/mp4">

            <track kind="subtitles" src="assets/subtitles.en.vtt" srclang="en" lang="en" label="English" />

            <track kind="captions" src="assets/captions.fr.vtt" srclang="fr" label="Français" />
            <track kind="captions" src="assets/captions.it.vtt" srclang="it" label="Italiano" />

            <track kind="descriptions" src="assets/transcript.fr.json" srclang="fr" label="français" />
            <track kind="descriptions" src="assets/transcript.it.json" srclang="it" label="italiano" />
        </video>
    </div>
</div>
```
