# Material Design ELO
Een klein project ontworpen om de Windesheim ELO dragelijker te maken. Zorg dat de plugin Tampermonkey ([Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)) of Greasemonkey ([Firefox](https://addons.mozilla.org/nl/firefox/addon/greasemonkey/)) geïnstalleerd is en open vervolgens het [MDELO.user.js](https://github.com/Bloemendaal/Windesheim-ELO/raw/master/MDELO.user.js) bestand. Als het goed is, krijg opent een pagina om hem te installeren. Zo niet, dan kan je het bestand downloaden en handmatig installeren.

# Technische documentatie
## Dependencies
- [jQuery](https://github.com/jquery/jquery)
- [Material Design Components](https://github.com/material-components/material-components-web)
- [UIkit](https://github.com/uikit/uikit)
- [Material Icons](https://github.com/google/material-design-icons)

## Arrays, Objects & variables
```js
var pages = [
   {
      name: 'string',                        // Universele naam van de pagina
      title: {                               // Een object van titels in Engels, Nederlands en Duits
         en: 'String',              
         nl: 'Draad',
         de: 'Draht'
      },
      icon: 'icon',                          // Naam van het icoon dat moet worden weergegeven
      showInNav: Boolean,                    // Wordt weergegeven in de navigatiebalk, true bij default
      display: {                             // Onderdelen van de website die moeten worden weergegeven
         nav: 'menu || folder',              // Navigatiemenu aan de zijkant, keuze uit menu of folder
         container: 'list',                  // Hoofdcontainer, keuze uit list, folder, iframe of include
         search: Boolean,                    // Zoekbalk weergeven, Boolean
         notifications: Boolean,             // Notificaties weergeven, Boolean
         fab: 'icon'                         // FAB weergeven, false of icoon
      },
      functions: {
         onload:    function() { ... },         // Functie die uitgevoerd wordt wanneer de pagina laadt
         search:    function(q) { ... },        // Zoekfunctie met variable q als zoekopdracht
         container: function(t, e) { ... },     // Klikfunctie van de container, wordt alleen bij display container list uitgevoerd met variable t als this en e.
         navback:   function() { ... },         // Klikfunctie van de terugknop in de nav.
         fab:       function() { ... }          // Klikfunctie van de FAB
      }
   },
   { ... }                                   // Pagina's worden op volgorde ingeladen
]
```
Pages definieert alle mogelijke pagina's. Er kunnen naast deze vooraf ingestelde pagina's ook nog andere pagina's ingeladen worden door de `preparePage(display, title = null)` functie te gebruiken, waarin `display` een object is `{nav: String, container: String}` en titel een optionele titel is, in te laden als Object voor meerdere talen of als String.
