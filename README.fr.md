# Meuuhdia

- [english documentation](/README.md)
- [documentazione in italiano](/README.it.md)

Lecteur video inclusif embarquant les options de contrôle classiques.
Vous pouvez renseigner des fichiers de traduction, sous-titrage et transcription textuelle.

Pour créer ces fichiers au format Meuuhdia, utilisez [Meuuhdia Studio](https://meuuhdia-studio.buocennig.fr) : un éditeur en ligne qui fonctionne entièrement dans votre navigateur, sans envoyer vos fichiers sur un serveur.

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
- L'attribut `[preload='metadata']` est recommandé : il affiche la durée et la taille de la vidéo dès le chargement de la page, sans télécharger la vidéo
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
[Meuuhdia Studio](https://meuuhdia-studio.buocennig.fr) vous aide à créer ces fichiers avec le balisage décrit ci-dessous, à vérifier les règles de qualité et à générer la transcription textuelle.

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
- <v.think Narrateur> : pensée du personnage ou narration (cyan)
- <c.music> : indication musicale, paroles de chanson (magenta)
- <lang br> : indication de langue étrangère, avec son code de langue (ici le breton) (vert)
- 00:10.360 --> 00:13.900 align: start/end (gauche/droite)
- 00:10.360 --> 00:13.900 line: 1 (haut)

### Transcription textuelle
Pour fournir une transcription textuelle de la video l'attribut kind doit avoir la valeur "descriptions".

Le fichier fourni doit être un fichier JSON contenant une liste de clé/valeur permettant d'afficher la transcription sous forme de liste ordonnée (ex: {"00:10 Clara": "Salut Toto !", "00:13 Toto": "Hey Clara, comment vas-tu ?"})

Une transcription correcte doit permettre de comprendre tout ce qu'il se passe dans la vidéo uniquement à la lecture du texte. Si la vidéo a une audiodescription, intégrez-la aussi à la transcription : Meuuhdia Studio peut le faire automatiquement.

L'internaute peut afficher la transcription sous la vidéo ou à sa droite. À droite, la vidéo se réduit pour lui laisser la place. S'il n'y a pas assez de place, la transcription reste sous la vidéo et les boutons de position sont masqués. Une transcription affichée reste visible en plein écran.

Exemple:
```html
<track kind="descriptions" src="path/to/your/transcript.it.json" srclang="it" label="italiano" />
```

### Audiodescription
L'audiodescription décrit ce qui se voit à l'écran pour les personnes aveugles ou malvoyantes. Meuuhdia propose deux façons de la fournir, utilisables ensemble.

#### Version audiodécrite enregistrée
Si vous disposez d'une version de la vidéo intégrant l'audiodescription, ajoutez-la avec une balise `<source>` portant l'attribut `data-audiodescription`, placée après les sources classiques.

L'internaute peut passer d'une version à l'autre en conservant la position et l'état de lecture. Les deux versions doivent avoir la même durée et le même minutage pour que les sous-titres restent synchronisés.

Exemple:
```html
<source src="path/to/your/video.mp4" type="video/mp4">
<source src="path/to/your/video-ad.mp4" type="video/mp4" data-audiodescription>
```

#### Descriptions lues
Sans version enregistrée, fournissez les descriptions dans un fichier VTT, avec l'attribut kind "descriptions" : c'est l'extension `.vtt` qui le distingue de la transcription en JSON.

Chaque cue contient en texte simple ce qui se voit, placé dans un silence de la vidéo. Le lecteur lit les descriptions avec la synthèse vocale du navigateur, ou les transmet au lecteur d'écran de l'internaute. Si une description est plus longue que sa cue, la vidéo se met en pause le temps de la finir (audiodescription étendue).

Dans le menu « Audiodescription », l'internaute choisit la langue, la restitution (voix de synthèse ou lecteur d'écran), le débit et la pause automatique. Ses réglages sont mémorisés. Si la vidéo a aussi une version enregistrée, elle est proposée en premier.

Pour écrire vos descriptions, comptez environ 15 caractères par seconde de lecture. Meuuhdia Studio vérifie cette durée et signale les descriptions qui couvrent un dialogue.

Exemple:
```html
<track kind="descriptions" src="path/to/your/descriptions.fr.vtt" srclang="fr" label="Français" />
```

### Exemple complet
```html
<div class="meuuhdia">
    <div class="meuuhdia_wrapper">
        <video poster="assets/poster.png" preload="metadata" controls disablePictureInPicture>
            <source src="assets/extrait.mp4" type="video/mp4">
            <source src="assets/extrait-ad.mp4" type="video/mp4" data-audiodescription>

            <track kind="subtitles" src="assets/subtitles.en.vtt" srclang="en" lang="en" label="English" />

            <track kind="captions" src="assets/captions.fr.vtt" srclang="fr" label="Français" />
            <track kind="captions" src="assets/captions.it.vtt" srclang="it" label="Italiano" />

            <track kind="descriptions" src="assets/descriptions.fr.vtt" srclang="fr" label="Français" />

            <track kind="descriptions" src="assets/transcript.fr.json" srclang="fr" label="français" />
            <track kind="descriptions" src="assets/transcript.it.json" srclang="it" label="italiano" />
        </video>
    </div>
</div>
```