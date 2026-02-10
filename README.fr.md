# Meuuhdia

- [english documentation](/README.md)
- [documentazione in italiano](/README.it.md)

Lecteur video inclusif embarquant les options de contrôle classiques.
Vous pouvez renseigner des fichiers de traduction, sous-titrage et transcription textuelle.

Le lecteur permettra à l'utilisateur d'activer et configurer lui même l'affichage de ces fichiers.
Il pourra modifier les couleurs et taille des sous-titres à sa convenance.

Ce lecteur a été conçu en ayant à coeur de créer un outil inclusif.
Toutefois, il n'a fait l'objet d'aucun audit, il y a donc certainement des choses a améliorer. Tous les retours sont les bienvenus.

## Installation
1. Installer le lecteur avec NPM : `npm install @meuuhdia/video-player`
2. Activer le lecteur en ajoutant le code suivant dans votre fichier javascript principal (ou bien à l'endroit précis ou vous en avez besoin) :
```js
// sans empaqueteur JS
import "/node_modules/@meuuhdia/video-player/meuuhdia.js";

// avec empaqueteur JS
import "@meuuhdia/video-player";
```

## Personnalisation
Vous pouvez mettre à jour les variables CSS Meuuhdia pour adapter les couleurs à votre design.

### Couleurs et police du lecteur
```css
:root {
    --meuuhdia-color-main: #000000;
    --meuuhdia-color-secondary: #FFFFFF;
    --meuuhdia-font-family: "Luciole", consolas;
}
```

### Couleurs par défaut des sous-titres
```css
:root {
    --meuuhdia-cue-color: #ffff00;
    --meuuhdia-cue-bgcolor: #000000;
}
```

## Utilisation
Copiez le code suivant à l'endroit ou vous souhaitez afficher le lecteur vidéo, il s'agit du code minimal nécessaire au fonctionnement de Meuuhdia.
- L'attribut "controls" permet de s'assurer d'avoir les options de contrôle disponibles dans le cas ou le lecteur natif serait affiché (javascript désactivé).
- L'attribut `[preload='metadata']` permet au lecteur Meuuhdia de charger la vidéo
- Au moins une balise `<source>` doit être renseignée

```html
<div class="meuuhdia">
    <div class="meuuhdia_wrapper">
        <video preload="metadata" controls>
            <source src="path/to/your/video.mp4" type="video/mp4">
        </video>
    </div>
</div>
```

### Sous-titres et traductions
Les fichiers vtt renseignés ne doivent pas contenir de styles css, Meuuhdia applique deja des styles adaptés pour que tout le monde puisse les lire correctement et les adapter à ses besoins.

#### Traduction
Pour fournir une traduction de la video l'attribut kind doit avoir la valeur "subtitles".

Exemple:
```html
<track kind="subtitles" src="path/to/your/subtitles.en.vtt" srclang="en" lang="en" label="English" />
```

#### Sous-titre
Pour fournir un sous-titrage de la video l'attribut kind doit avoir la valeur "captions".
Un sous-titrage correct doit permettre de comprendre tout ce qu'il se passe dans la vidéo avec le son coupé, par exemple si une personne réagit à un bruit, ce bruit doit être retranscrit dans les sous-titres.

Exemple:
```html
<track kind="captions" src="path/to/your/captions.fr.vtt" srclang="fr" label="Français" />
```

Pour un sous-titrage de qualité, 3 règles de base:
- Maximum 2 lignes de 40 caractères par image
- Afficher pendant minimum 600ms
- Minimum 160 ms entre 2 sous-titrages

Pour bénéficier de l'ensemble des fonctionnalités du lecteur, voici les différentes options de balisage et propriétés disponibles pour vos fichiers VTT:
- <v Fanch> : locuteur à l'écran (blanc)
    - <v.whisp Fanch> : chuchote ou aparté (parenthèses)
    - <v.group> : phrase dite par plusieurs locuteurs (majuscule)
- <v.off> : locuteur hors champ ou voix off (jaune, italique)
- <c.sound> : effet sonore non induit par l'image (rouge)
    - <c.numeric> : effet sonore provenant d'un téléphone, tv... (asterisque)
- <c.think Narrateur> : pensée du personnage ou narration (cyan)
- <c.music> : indication musicale, paroles de chanson (magenta)
- <lang Breton> : indication de langue étrangère (vert)
- 00:10.360 --> 00:13.900 align: start/end (droite/gauche)
- 00:10.360 --> 00:13.900 line: 1 (haut)

### Transcription textuelle
Pour fournir une transcription textuelle de la video l'attribut kind doit avoir la valeur "descriptions".

Le fichier fourni doit être un fichier JSON contenant une liste de clé/valeur permettant d'afficher la transcription sous forme de liste ordonnée (ex: {"00:10 Clara": "Salut Toto !", "00:13 Toto": "Hey Clara, comment vas-tu ?"})

Une transcription correcte doit permettre de comprendre tout ce qu'il se passe dans la vidéo uniquement à la lecture du texte.

Exemple:
```html
<track kind="descriptions" src="path/to/your/transcript.it.json" srclang="it" label="italiano" />
```

### Exemple complet
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