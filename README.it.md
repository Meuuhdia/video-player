# Meuuhdia

- [english documentation](/README.md)
- [documentation en français](/README.fr.md)

Lettore video inclusivo che integra le opzioni di controllo classiche.
È possibile fornire file di traduzione, sottotitoli e trascrizione testuale.

Il lettore consente all'utente di attivare e configurare autonomamente la visualizzazione di questi file.
Potrà modificare i colori e la dimensione dei sottotitoli secondo le sue esigenze.

Questo lettore è stato progettato con l'obiettivo di creare uno strumento inclusivo.
Tuttavia, non è stato sottoposto ad alcun audit, quindi ci sono sicuramente aspetti da migliorare. Tutti i feedback sono benvenuti.

## Installazione
1. Installare il lettore con NPM: `npm install @meuuhdia/video-player`
2. Attivare il lettore aggiungendo il seguente codice nel file JavaScript principale (o nel punto preciso in cui ne avete bisogno):
```js
// senza bundler JS
import "/node_modules/@meuuhdia/video-player/meuuhdia.js";

// con bundler JS
import "@meuuhdia/video-player";
```

## Personalizzazione
È possibile aggiornare le variabili CSS di Meuuhdia per adattare i colori al proprio design.

### Colori e font del lettore
```css
:root {
    --meuuhdia-color-main: #000000;
    --meuuhdia-color-secondary: #FFFFFF;
    --meuuhdia-font-family: "Luciole", consolas;
}
```

### Colori predefiniti dei sottotitoli
```css
:root {
    --meuuhdia-cue-color: #ffff00;
    --meuuhdia-cue-bgcolor: #000000;
}
```

## Utilizzo
Copiare il seguente codice nel punto in cui si desidera visualizzare il lettore video. Si tratta del codice minimo necessario per il funzionamento di Meuuhdia.
- L'attributo "controls" assicura la disponibilità delle opzioni di controllo nel caso in cui venga visualizzato il lettore nativo (JavaScript disabilitato).
- L'attributo `[preload='metadata']` permette al lettore Meuuhdia di caricare il video
- Deve essere fornito almeno un tag `<source>`

```html
<div class="meuuhdia">
    <div class="meuuhdia_wrapper">
        <video preload="metadata" controls>
            <source src="path/to/your/video.mp4" type="video/mp4">
        </video>
    </div>
</div>
```

### Sottotitoli e traduzioni
I file VTT forniti non devono contenere stili CSS. Meuuhdia applica già stili appropriati affinché tutti possano leggerli correttamente e adattarli alle proprie esigenze.

#### Traduzione
Per fornire una traduzione del video, l'attributo kind deve avere il valore "subtitles".

Esempio:
```html
<track kind="subtitles" src="path/to/your/subtitles.en.vtt" srclang="en" lang="en" label="English" />
```

#### Sottotitoli
Per fornire sottotitoli per il video, l'attributo kind deve avere il valore "captions".
Un sottotitolo corretto deve permettere di comprendere tutto ciò che accade nel video con il suono disattivato. Ad esempio, se una persona reagisce a un rumore, quel rumore deve essere trascritto nei sottotitoli.

Esempio:
```html
<track kind="captions" src="path/to/your/captions.fr.vtt" srclang="fr" label="Français" />
```

Per sottotitoli di qualità, 3 regole base:
- Massimo 2 righe di 40 caratteri per fotogramma
- Visualizzare per un minimo di 600ms
- Minimo 160ms tra 2 sottotitoli

Per beneficiare di tutte le funzionalità del lettore, ecco le diverse opzioni di markup e proprietà disponibili per i file VTT:
- <v Baingio>: parlante a schermo (bianco)
    - <v.whisp Baingio>: sussurro o a parte (parentesi)
    - <v.group>: frase detta da più parlanti (maiuscolo)
- <v.off>: parlante fuori campo o voce fuori campo (giallo, corsivo)
- <c.sound>: effetto sonoro non indotto dall'immagine (rosso)
    - <c.numeric>: effetto sonoro proveniente da telefono, TV... (asterisco)
- <c.think Narratore>: pensiero del personaggio o narrazione (ciano)
- <c.music>: indicazione musicale, testo di canzoni (magenta)
- <lang Sardo>: indicazione di lingua straniera (verde)
- 00:10.360 --> 00:13.900 align: start/end (destra/sinistra)
- 00:10.360 --> 00:13.900 line: 1 (alto)

### Trascrizione testuale
Per fornire una trascrizione testuale del video, l'attributo kind deve avere il valore "descriptions".

Il file fornito deve essere un file JSON contenente un elenco di coppie chiave/valore per visualizzare la trascrizione sotto forma di elenco ordinato (es: {"00:10 Clara": "Ciao Toto!", "00:13 Toto": "Ehi Clara, come stai?"})

Una trascrizione corretta deve permettere di comprendere tutto ciò che accade nel video solo dalla lettura del testo.

Esempio:
```html
<track kind="descriptions" src="path/to/your/transcript.it.json" srclang="it" label="italiano" />
```

### Esempio completo
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
