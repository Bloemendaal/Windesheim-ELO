// ==UserScript==
// @name          Material Design ELO
// @namespace     https://github.com/Bloemendaal
// @description   Make the ELO great (again)!
// @author        Casper Bloemendaal
// @license       MIT

// @downloadURL   https://github.com/Bloemendaal/Windesheim-ELO/raw/master/MDELO.user.js
// @updateURL     https://github.com/Bloemendaal/Windesheim-ELO/raw/master/MDELO.user.js
// @supportURL    https://github.com/Bloemendaal/Windesheim-ELO/issues
// @version       1.2

// @match         https://elo.windesheim.nl/Start.aspx
// @grant         none
// @run-at        document-start
// @require       https://code.jquery.com/jquery-3.3.1.min.js#sha256=FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=
// @require       https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-rc.25/js/uikit.min.js#sha256=zH8nrIM2oxqwe9HgYAuKG4S2q16mZuzymyC84SKEdww=
// @require       https://unpkg.com/material-components-web@latest/dist/material-components-web.js
// @noframes
// ==/UserScript==

(function() {
   'use strict';

   var snackbar;
   var tab = false;
   var version = 1.2;
   var hidenav = false;
   var favoriteCourses = 0;
   var pages = [
      {
         name: 'courses',
         title: {
            en: 'Courses',
            nl: 'Studieroutes',
            de: 'Kurse'
         },
         icon: 'book',
         display: {
            nav: 'menu',
            container: 'list',
            search: true,
            notifications: true,
            fab: 'star_half'
         },
         functions: {
            onload: function() {
               setCourses();
            },
            search: function(q) {
               setCourses(q);
            },
            container: function(t, e) {
               var $this = $(t);
               var id = $this.data('id');
               if (e.target.nodeName == 'I') {
                  favoriteCourse(id, e, $this);
               } else {
                  prepareFolder(1, id, $this.data('name'));
               }
            },
            fab: function() {
               favoriteCourses = Math.abs(favoriteCourses + 1) * -1;
               setCourses($('#search').is(':visible') ? $('#search').val() : '');
            }
         }
      },
      {
         name: 'studyroute',
         title: {
            en: 'Course',
            nl: 'Studieroute',
            de: 'Kurs'
         },
         showInNav: false,
         display: {
            nav: 'folder',
            container: 'folder'
         },
         functions: {
            navback: function(){
               preparePage(0);
            }
         }
      },
      {
         name: 'portfolios',
         title: 'Portfolio',
         icon: 'folder_shared',
         display: {
            nav: 'menu',
            container: 'list',
            search: true
         },
         functions: {
            onload: function(){
               setPortfolios();
            },
            search: function(q){
               setPortfolios(q);
            },
            container: function(t, e){
               var $this = $(t);
               prepareFolder(3, $this.data('id'), $this.data('name'));
            }
         }
      },
      {
         name: 'portfolio',
         title: {
            en: 'Portfolio',
            nl: 'Portfolio',
            de: 'Portfolio'
         },
         showInNav: false,
         display: {
            nav: 'folder',
            container: 'folder'
         },
         functions: {
            navback: function(){
               preparePage(2);
            }
         }
      },
      {
         name: 'project',
         title: {
            en: 'Project',
            nl: 'Project',
            de: 'Projekte'
         },
         icon: 'extension',
         display: {
            nav: 'menu',
            container: 'list'
         },
         functions: {
            onload: function(){
               $('#container-list > ul').html('');
            }
         }
      },
      {
         name: 'forum',
         title: {
            en: 'Forum',
            nl: 'Forum',
            de: 'Forum'
         },
         icon: 'forum',
         display: {
            nav: 'menu',
            container: 'list'
         },
         functions: {
            onload: function(){
               $('#container-list > ul').html('');
            }
         }
      },
      {
         name: 'dashboard',
         title: {
            en: 'Dashboard',
            nl: 'Dashboard',
            de: 'Dashboard'
         },
         icon: 'dashboard',
         display: {
            nav: 'menu',
            container: 'list'
         },
         functions: {
            onload: function(){
               $('#container-list > ul').html('');
            }
         }
      },
      {
         name: 'progress',
         title: {
            en: 'Progress',
            nl: 'Voortgang',
            de: 'Fortschritt'
         },
         icon: 'timeline',
         display: {
            nav: 'menu',
            container: 'list'
         },
         functions: {
            onload: function(){
               $('#container-list > ul').html('');
            }
         }
      }
   ];
   var itemTypes = [
      {
         id: {
            studyroute: 0,
            portfolio: -1
         },
         icon: 'folder',
         display: 'folder'
      },
      {
         id: {
            studyroute: 1
         },
         icon: 'ondemand_video',
         display: 'include'
      },
      {
         id: {
            studyroute: 3
         },
         icon: 'link',
         display: 'link'
      },
      {
         id: {
            studyroute: 4
         },
         icon: 'ondemand_video',
         display: 'iframe'
      },
      {
         id: {
            studyroute: 9
         },
         icon: 'archive',
         display: 'iframe'
      },
      {
         id: {
            studyroute: 10,
            portfolio: 0
         },
         icon: 'insert_drive_file',
         display: 'link',
         ext: [
            {
               ext: ['pdf'],
               label: 'PDF',
               color: '#f44336',
               display: 'iframe'
            },
            {
               ext: ['doc', 'docx'],
               label: 'W',
               color: '#2196f3'
            },
            {
               ext: ['ppt', 'pptx'],
               label: 'P',
               color: '#ff5722'
            },
            {
               ext: ['xls', 'xlsx', 'csv'],
               label: 'X',
               color: '#4caf50'
            },
            {
               ext: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
               icon: 'photo',
               display: 'image'
            },
            {
               ext: ['txt'],
               icon: 'description',
               display: 'include'
            }
         ]
      }
   ];

   function preparePage(k, t = null) {
      if ($('#search').is(':visible')) {
         $('#search-back').trigger('click');
      }

      if (typeof k == 'object') {
         var display = k;
      } else {
         tab = k;
         var display = pages[k].display;
         if (!t) {
            t = pages[k].title;
         }
         if (pages[k].hasOwnProperty('functions') && pages[k].functions.hasOwnProperty('onload')) {
            pages[k].functions.onload();
         }
      }

      $('#container > *, #nav > *:not(#nav-focus)').hide();
      $('#container-' + display.container + ', #nav-' + display.nav).show();

      if (t) {
         $('#title').html( typeof t == 'object' ? printLanguages(t) : t );
      }

      if (display.fab) {
         $('#FAB').removeClass('fab-hidden').text(display.fab);
      } else {
         $('#FAB').addClass('fab-hidden').text('');
      }

      $('#search-button').toggle(!!display.search);
   }

   function printLanguages(string) {
      var r = '';
      Object.keys(string).forEach(function(k) {
         r += '<span class="lang-'+k+'">'+string[k]+'</span>';
      });
      return r;
   }

   function setCourses(search = '') {
      $.ajax({
         url:  '/services/Studyroutemobile.asmx/LoadStudyroutes',
         type: 'GET',
         data: {
            start: 0,
            length: 50,
            filter: favoriteCourses,
            search: search
         },
         success: function(data) {
            var list = $('#container-list > ul');
            list.html('<span class="last-child uk-text-center uk-text-small uk-margin-left">Geen resultaten gevonden...</span>');

            data.STUDYROUTES.forEach(function(c) {
               list.append('<li class="mdc-list-item uk-width-1-1" data-id="'+c.ID+'" data-name="'+c.NAME+'" data-mdc-auto-init="MDCRipple"><div class="uk-margin-right"><div class="uk-inline uk-cover-container uk-border-circle mdc-list-item__image"><img src="'+c.IMAGEURL_24+'" alt="'+c.NAME+'" uk-cover></div></div><span>'+c.NAME+'</span><i class="mdc-icon-toggle mdc-theme--text-icon-on-background material-icons uk-margin-auto-left" role="button">'+(c.IS_FAVORITE ? 'star' : 'star_border')+'</i></li>');
            });

            mdc.autoInit(document.getElementById('container-list'), () => {});
         }
      });
   }


   function setPortfolios(search = '') {
      $.ajax({
         url:  '/services/MyPortfolioMobile.asmx/LoadPortfolios',
         type: 'GET',
         data: {
            start: 0,
            length: 50,
            userId: -1,
            search: search
         },
         success: function(data) {
            var list = $('#container-list > ul');
            list.html('<span class="last-child uk-text-center uk-text-small uk-margin-left">Geen resultaten gevonden...</span>');

            data.PORTFOLIOS.forEach(function(c) {
               list.append('<li class="mdc-list-item uk-width-1-1" data-id="'+c.ID+'" data-name="'+c.NAME+'" data-mdc-auto-init="MDCRipple"><i class="material-icons mdc-list-item__graphic">folder_shared</i><span>'+c.NAME+'</span></li>');
            });

            mdc.autoInit(document.getElementById('container-list'), () => {});
         }
      });
   }

   function setFolder(append, id, parent = -1) {
      if (!Array.isArray(append)) {
         append = [append];
      }
      Object.keys(append).forEach(function(k) {
         if (parent != -1 && append[k].attr('id') != 'folder-'+parent && append[k].parents('#nav').length > 0) {
            append[k].after('<ul id="folder-'+parent+'" class="mdc-list uk-margin-left uk-padding-remove" style="display:none"></ul>');
            append[k] = $('#folder-'+parent);
         }
         append[k].html('<span class="last-child uk-text-center uk-text-small uk-margin-left">Geen resultaten gevonden...</span>');
      });

      var url = '/services/'+(pages[tab].name == 'portfolio' ? 'my' + pages[tab].name : pages[tab].name)+'mobile.asmx/Load'+pages[tab].name.charAt(0).toUpperCase() + pages[tab].name.slice(1)+'Content';

      $.ajax({
         url:  url,
         type: 'GET',
         data: {
            [pages[tab].name + 'id']: id,
            parentid: parent,
            start: 0,
            length: 100
         },
         success: function(data) {
            data[pages[tab].name.toUpperCase() + '_CONTENT'].forEach(function(item) {
               var itemType = itemTypes.find(function(i){
                  return i.id[pages[tab].name] == item.ITEMTYPE;
               });

               var display = itemType.display;
               var icon    = itemType.icon;
               var label   = itemType.label;
               var color   = itemType.color;

               if (itemType.hasOwnProperty('ext')) {
                  var surl = item.URL.split('.');
                  var ext = itemType.ext.find(function(i){
                     return i.ext.indexOf(surl[surl.length - 1]) > -1;
                  });

                  if (ext) {
                     display = ext.hasOwnProperty('display') ? ext.display : display;
                     icon    = ext.hasOwnProperty('icon')    ? ext.icon    : icon;
                     label   = ext.hasOwnProperty('label')   ? ext.label   : label;
                     color   = ext.hasOwnProperty('color')   ? ext.color   : color;
                  }
               }

               var link = (item.hasOwnProperty('URL') && display == 'link');
               var html = (link ? '<a href="' + encodeURI(item.URL) + '" target="_blank" rel="noopener" ' : '<li data-display="' + display + '"' + (item.hasOwnProperty('URL') ? 'data-url="' + encodeURI(item.URL) + '" ' : '')) + 'data-id="'+item.ID+'" data-name="'+item.NAME+'" data-type="' + item.ITEMTYPE + '" data-mdc-auto-init="MDCRipple" class="mdc-list-item ' + (hidenav && item.hasOwnProperty('HIDE_IN_NAVIGATION') && item.HIDE_IN_NAVIGATION ? 'folder-hidenav' : '') + '">' + (display == 'folder' ? '<i class="material-icons mdc-list-item__graphic folder-icon-arrow">arrow_right</i><i class="material-icons mdc-list-item__graphic folder-icon-margin uk-margin-remove-left uk-position-relative"' : '<i class="material-icons mdc-list-item__graphic folder-icon-margin uk-position-relative"') + (color && !label ? ' style="color:' + color + '"' : '') + '>' + icon + (color && label ? '<span class="folder-icon-badge" style="background-color:' + color + '">' + label + '</span>' : '') + '</i><span class="folder-text-padding">' + item.NAME + '</span>' + (link ? '<i class="mdc-list-item__meta material-icons">launch</i></a>' : '</li>');

               append.forEach(function(a){
                  a.append(html);
               });
            });

            mdc.autoInit(document.getElementById('nav-folder-list'),       () => {});
            mdc.autoInit(document.querySelector('#container-folder > ul'), () => {});

            append.forEach(function(a) {
               if (a.attr('id') == 'folder-'+parent && a.is(':not(:visible)')) {
                  a.slideDown(250);
               }
            });
         }
      });
   }

   function setFolderItem(t, e) {
      var $target = $(e.target);
      var $this   = $(t);
      var display = $this.data('display');

      if (display) {
         if (display == 'folder') {
            var courseID = $('#nav-folder-list').data('id');
            var folderID = $this.data('id');
            var $thisnav = $('#nav-folder-list li[data-id="'+folderID+'"]');
            var $next    = $thisnav.next();

            if ($target.is('.folder-icon-arrow')) {
               if ($next.is('#folder-'+folderID)) {
                  if ($this.is('.folder-expanded')) {
                     $next.slideUp(250);
                     $this.removeClass('folder-expanded');
                  } else {
                     $next.slideDown(250);
                     $this.addClass('folder-expanded');
                  }
               } else {
                  setFolder($this, courseID, folderID);
                  $this.addClass('folder-expanded');
               }
            } else {
               var sublist = $('#container-folder > ul');
               var update = [sublist];
               if (!$next.is('#folder-'+folderID) && folderID != -1) {
                  update.push($thisnav);
               } else if (!$next.is(':visible')) {
                  $next.slideDown(250);
               }
               preparePage({nav: 'folder', container: 'folder'}, $this.data('name'));
               setFolder(update, courseID, folderID);
               $('#nav-folder-list li.mdc-list-item').removeClass('mdc-list-item--activated');
               $thisnav.addClass('mdc-list-item--activated folder-expanded');

               if (folderID != -1) {
                  var iType = itemTypes.find(function(i){
                     return i.display == 'folder';
                  });
                  sublist.prepend('<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" data-id="'+$thisnav.parent().prev().data('id')+'" data-type="'+iType.id[pages[tab].name]+'" data-display="folder"><i class="material-icons mdc-list-item__graphic" aria-hidden="true">arrow_back</i><span class="folder-text-padding"><span class="lang-en">Parent folder</span><span class="lang-nl">Map omhoog</span><span class="lang-de">&uuml;bergeordneter Ordner</span></span></li><hr class="mdc-list-divider">');
               }
            }
         } else {
            $('#nav-folder-list li.mdc-list-item').removeClass('mdc-list-item--activated');
            $('#nav-folder-list li[data-id="'+$this.data('id')+'"]').addClass('mdc-list-item--activated folder-expanded');
            if (display == 'include') {
               var url = $this.data('url');
               $('#container-include').load(url, function(response, status){
                  var container = $('#container-include');
                  if ((container.children('p:only-child').length == 1 || container.children('title + p:last-child').length == 1) && container.children('p').children('iframe:only-child').length == 1) {
                     $('#container-iframe > iframe').attr('src', container.find('iframe').attr('src'));
                     container.html('');
                     preparePage({nav: 'folder', container: 'iframe'}, $this.data('name'));
                  } else {
                     preparePage({nav: 'folder', container: 'include'}, $this.data('name'));
                  }
               });
            } else if (display == 'iframe') {
               $('#container-iframe > iframe').attr('src', $this.data('url'));
               preparePage({nav: 'folder', container: 'iframe'}, $this.data('name'));
            } else if (display == 'image') {
               $('#container-include').html('<div class="uk-flex"><img src="'+$this.data('url')+'" alt="'+$this.data('name')+'" class="uk-margin-auto"></div>');
               preparePage({nav: 'folder', container: 'include'}, $this.data('name'));
            }
         }
      } else {
         var msg, actionText;
         switch ($('html').attr('lang')) {
            case 'nl':
            msg = "Dit itemtype is onbekend. Excuses voor het ongemak.";
            actionText = "Rapporteer een bug";
            break;
            case 'de':
            msg = "Dieser Artikeltyp ist unbekannt. Entschuldigung für die Unannehmlichkeiten.";
            actionText = "Einen Fehler einreichen";
            break;
            default:
            msg = "This item type is unknown. Sorry for the inconvenience.";
            actionText = "Report a bug";
         }
         snackbar.show({
            message: msg,
            timeout: 5000,
            actionHandler: function() {
               window.location.href = 'https://github.com/Bloemendaal/Windesheim-ELO/issues/new?title='+encodeURI('[BUG] Unknown display')+'&body='+encodeURI('Page: ' + pages[tab].name + "\n" + 'itemID: ' + $this.data('id') + "\n" + 'itemName: ' + $this.data('name') + "\n" + 'itemType: ' + $this.data('type') + "\n" + 'Version: ' + version + "\n\n" + '[Your description of what this item should be, e.g. docx file opened as link or pdf file opened as iframe]');
            },
            actionText: actionText,
            multiline: true,
            actionOnBottom: true
         });
      }
   }

   function prepareFolder(page, id, title) {
      var append = $('#nav-folder-list, #container-folder > ul');
      append.data('id', id);
      preparePage(page, title);
      setFolder(append, id);
      $('#nav-folder-list').prepend('<li class="mdc-list-item mdc-list-item--activated" data-mdc-auto-init="MDCRipple" data-id="-1" data-name="'+title+'" data-type="0" data-display="folder"><i class="material-icons mdc-list-item__graphic" aria-hidden="true">folder_special</i><span class="folder-text-padding">'+title+'</span></li><hr class="mdc-list-divider">');
   }

   function favoriteCourse(id, e, $this) {
      $.ajax({
         url:  '/Home/StudyRoute/StudyRoute/ToggleFavorite',
         type: 'POST',
         data: {
            studyrouteId: id
         },
         success: function(data) {
            if (data.success == true) {
               var $target = $(e.target);
               if ($target.text() == 'star') {
                  $target.text('star_border');
                  if (favoriteCourses == -1) {
                     $this.remove();
                  }
               } else {
                  $target.text('star');
               }
            } else {
               var msg, actionText;
               switch ($('html').attr('lang')) {
                  case 'nl':
                  msg = "Er is een fout opgetreden. Probeer het later opnieuw.";
                  actionText = "Herladen";
                  break;
                  case 'de':
                  msg = "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.";
                  actionText = "Neu laden";
                  break;
                  default:
                  msg = "An error occurred. Please try again later.";
                  actionText = "Reload";
               }
               snackbar.show({
                  message: msg,
                  actionHandler: function() {
                     location.reload();
                  },
                  actionText: actionText,
                  multiline: true,
                  actionOnBottom: true
               });
            }
         }
      });
   }

   $(function(){
      $('head script, head style').remove();
      $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-rc.25/css/uikit.min.css" integrity="sha256-P3mc1WE09pSm1iAHPFelzUieKI78yRxZ7dGYjXuqIVw=" crossorigin="anonymous"><link rel="stylesheet" href="//fonts.googleapis.com/icon?family=Material+Icons"><link rel="stylesheet" href="//unpkg.com/material-components-web@latest/dist/material-components-web.min.css"><style>:root{--mdc-theme-primary: #406790}.lang-nl, .lang-de, [lang="nl"] .lang-en, [lang="de"] .lang-en{display: none;}[lang="nl"] .lang-nl, [lang="de"] .lang-de{display: initial;}.mdc-drawer .mdc-list-item--activated, .mdc-drawer .mdc-list-item--activated .mdc-list-item__graphic{color: #406790; color: var(--mdc-theme-primary, #406790)}.mdc-text-field--focused:not(.mdc-text-field--disabled) .mdc-floating-label{color: #000}.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-floating-label{color: #b00020}body, .material-icons{-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none}a.material-icons{text-decoration-line: none}.mdc-switch+label{margin-left: 10px}#container{-webkit-touch-callout: text; -webkit-user-select: text; -khtml-user-select: text; -moz-user-select: text; -ms-user-select: text; user-select: text; min-height:100vh;}#container, #container-iframe, #container-iframe > iframe{min-height: calc(100vh - 56px);}#container-list, #container-folder, #container-include{max-width: 1200px; padding-bottom: 40px;}#container-include{overflow-wrap: break-word; word-wrap: break-word; padding-top: 20px;}#container-iframe{margin-left: -15px; margin-right: -15px}#container-folder .mdc-list-item{min-height: 48px; height: auto; line-height: normal}#top-app-bar input{font-size: 1.25rem; color: #fff; color: var(--mdc-theme-on-primary, #fff)}#snackbar{z-index: 1500}#drawer .mdc-list-item{min-height: 40px; height: auto; line-height: normal}#nav-focus{height: 0; width: 0; margin: 0; padding: 0;}.mdc-drawer--modal.mdc-drawer--open{display: flex}@media (min-width:600px){#container, #container-iframe, #container-iframe > iframe{min-height: calc(100vh - 64px);}.mdc-fab:not(.fab-hidden){transform: translateY(0) !important}}@media (min-width:640px){.mdc-drawer{width: 512px;}#container-iframe{margin-left: -30px; margin-right: -30px}}@media (min-width:960px){.mdc-drawer{width: 30%;}.mdc-drawer-scrim{display: none !important}.mdc-drawer--modal{box-shadow: none}.mdc-drawer--prepare{display: flex}.mdc-drawer--open+.mdc-drawer-scrim+.mdc-drawer-app-content, .mdc-drawer--prepare+.mdc-drawer-scrim+.mdc-drawer-app-content{margin-left: 30%; margin-right: 0}.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-scrim+.mdc-drawer-app-content>.mdc-top-app-bar, .mdc-drawer--prepare+.mdc-drawer-scrim+.mdc-drawer-app-content>.mdc-top-app-bar{width: 70%}.mdc-drawer-app-content{transition: margin-left .25s cubic-bezier(.4, 0, .2, 1)}.mdc-top-app-bar{transition: width .25s cubic-bezier(.4, 0, .2, 1)}.mdc-drawer--open.mdc-drawer--closing+.mdc-drawer-scrim+.mdc-drawer-app-content{margin-left: 0; transition: margin-left .2s cubic-bezier(.4, 0, .2, 1)}.mdc-drawer--open.mdc-drawer--closing+.mdc-drawer-scrim+.mdc-drawer-app-content>.mdc-top-app-bar{transition: width .2s cubic-bezier(.4, 0, .2, 1)}#container-iframe{margin-left: -40px; margin-right: -40px}}.mdc-drawer__drawer::-webkit-scrollbar, .uk-scrollbar::-webkit-scrollbar{background-color: transparent; width: 12px}.mdc-drawer__drawer::-webkit-scrollbar-thumb, .uk-scrollbar::-webkit-scrollbar-thumb{background-clip: padding-box; border-radius: 3px; -webkit-border-radius: 3px; border: 4px solid transparent; background-color: rgba(0, 0, 0, .2)}ul.mdc-list:not(.mdc-list--non-interactive)>*{cursor: pointer}.uk-cover-container{width: 48px; height: 48px}.only-child, .last-child, .first-child{display: none}.only-child:only-child, .last-child:last-child, .first-child:first-child{display: initial}.folder-icon-margin{margin-right: 24px}#nav-folder .folder-icon-margin{margin-left: 24px}.folder-icon-arrow{margin: 0px; transition-duration: 0.25s; pointer-events: initial!important}.folder-expanded > .folder-icon-arrow{transform: rotate(90deg);}#nav-folder .folder-hidenav, #container-folder .folder-icon-arrow{display: none}.folder-icon-badge{font-size: 0.5rem; line-height: 1em; font-family: Roboto,sans-serif; position: absolute; color: #fff; bottom: 3px; padding: 1px 2px 0px 2px; right: 3px; border-radius: 2px}.folder-text-padding{padding-top: 8px; padding-bottom: 8px}.mdc-fab{position: fixed; bottom: 1rem; right: 1rem; animation-duration: .25s; animation-duration: 250ms; transition-duration: .25s; transition-duration: 250ms}.fab-hidden{opacity: 0; transform: translateY(48px)}@media(min-width:1024px){.mdc-fab{bottom: 1.5rem; right: 1.5rem}}</style>');
      $('body').html('<aside id="drawer" class="mdc-drawer mdc-drawer--modal mdc-drawer--prepare"> <div class="mdc-drawer__header"> <h3 class="mdc-drawer__title uk-text-truncate"></h3> <h6 class="mdc-drawer__subtitle uk-text-truncate"></h6> </div><div id="nav" class="mdc-drawer__content uk-scrollbar"> <ul id="nav-focus" class="mdc-list"><li class="mdc-list-item"></li></ul> <div id="nav-menu"> <ul id="nav-menu-list" class="mdc-list"></ul> </div><div id="nav-folder"> <ul class="mdc-list" data-id="-1"> <li id="nav-folder-back" class="mdc-list-item" data-mdc-auto-init="MDCRipple"> <i class="material-icons mdc-list-item__graphic" aria-hidden="true">arrow_back</i> <span class="lang-en">Back</span> <span class="lang-nl">Terug</span> <span class="lang-de">Zur&uuml;ck</span> </li></ul> <ul id="nav-folder-list" class="mdc-list uk-padding-remove-top"></ul> </div></div></aside><div class="mdc-drawer-scrim"></div><div class="mdc-drawer-app-content"> <header id="top-app-bar" class="mdc-top-app-bar mdc-top-app-bar--fixed"> <div class="mdc-top-app-bar__row top-app-bar__main"> <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start"> <span class="material-icons mdc-top-app-bar__navigation-icon">menu</span> <span id="title" class="mdc-top-app-bar__title"></span> </section> <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar"> <span id="search-button" uk-toggle="target: #top-app-bar .top-app-bar__search, #top-app-bar .top-app-bar__main; animation: uk-animation-fade" class="material-icons mdc-top-app-bar__action-item" aria-label="Zoeken" alt="Zoeken">search</span> <span id="top-app-bar__more" class="material-icons mdc-top-app-bar__action-item mdc-menu-surface--anchor" aria-label="Meer..." alt="Meer..."> notifications_none <div id="top-app-bar__menu" class="mdc-menu mdc-menu-surface"> test notificatie </div></span> </section> </div><div class="mdc-top-app-bar__row top-app-bar__search" hidden> <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start"> <span id="search-back" uk-toggle="target: #top-app-bar .top-app-bar__search, #top-app-bar .top-app-bar__main; animation: uk-animation-fade" class="material-icons mdc-top-app-bar__navigation-icon">arrow_back</span> <div class="uk-search uk-search-navbar uk-width-1-1 uk-light"> <input id="search" class="uk-search-input mdc-top-app-bar__title" type="search" placeholder="Zoeken..." autofocus> </div></section> </div></header> <div class="uk-container uk-container-expand"> <div class="mdc-top-app-bar--fixed-adjust"></div><div id="container"> <div id="container-iframe"> <iframe src="" width="100%" height="100%"></iframe> </div><div id="container-include"></div><div id="container-list"> <ul class="mdc-list mdc-list--two-line uk-flex uk-flex-column" aria-orientation="vertical"></ul> </div><div id="container-folder"> <ul class="mdc-list"></ul> </div></div><button id="FAB" class="mdc-fab fab-hidden material-icons" aria-label="Favorite" data-mdc-auto-init="MDCRipple"> <span class="mdc-fab__icon"></span> </button> </div></div><div id="snackbar" class="mdc-snackbar" aria-live="assertive" aria-atomic="true" aria-hidden="true"> <div class="mdc-snackbar__text"></div><div class="mdc-snackbar__action-wrapper"> <button type="button" class="mdc-snackbar__action-button"></button> </div></div>');

      $.ajax({
         url: '/services/Mobile.asmx/LoadUserSchoolConfig',
         type: 'GET',
         success: function(data){
            if (data.ACTIVESESSION) {
               $('#drawer > .mdc-drawer__header > .mdc-drawer__title'  ).text(data.USERNAME);
               $('#drawer > .mdc-drawer__header > .mdc-drawer__subtitle').text(data.LOGINID);
               $('html').attr('lang', !data.hasOwnProperty('NOMENCLATURE') || data.NOMENCLATURE == '1033_00' ? 'en' : (data.NOMENCLATURE == '1031_00' ? 'de' : 'nl'));
            } else {
               window.location.replace(window.location.origin);
            }
         }
      });

      var menu = $('#nav-menu-list');
      Object.keys(pages).forEach(function(k) {
         if (!pages[k].hasOwnProperty('showInNav') || pages[k].showInNav == true) {
            var title = printLanguages(pages[k].title);
            menu.append('<li class="mdc-list-item '+(tab === false && 'mdc-list-item--activated')+'" data-id="'+k+'" data-mdc-auto-init="MDCRipple" tabindex="0" aria-selected="true" aria-expanded="true"><i class="material-icons mdc-list-item__graphic" aria-hidden="true">'+pages[k].icon+'</i>'+title+'</li>');
            if (!tab) {
               preparePage(k);
            }
         }
      });

      $('#nav-menu-list').on('click', 'li.mdc-list-item', function(){
         var $this = $(this);
         $('#nav-menu-list > li').removeClass('mdc-list-item--activated');
         $this.addClass('mdc-list-item--activated');
         preparePage($this.data('id'));
      });

      $('#container-list > ul').on('click', 'li.mdc-list-item', function(e){
         if (pages[tab].hasOwnProperty('functions') && pages[tab].functions.hasOwnProperty('container')) {
            pages[tab].functions.container(this, e);
         }
      });

      $('#nav-folder-list, #container-folder > ul').on('click', 'li.mdc-list-item', function(e){
         setFolderItem(this, e);
      });

      // Standaard klikfuncties
      $('#search').on('input', function(){
         var $this  = $(this);
         var search = $this.val();
         if (pages[tab].hasOwnProperty('functions') && pages[tab].functions.hasOwnProperty('search') && $this.is(":visible")) {
            pages[tab].functions.search(search);
         }
      });

      $('#search-back').click(function(){
         if (pages[tab].hasOwnProperty('functions') && pages[tab].functions.hasOwnProperty('searchback')) {
            pages[tab].functions.searchback();
         } else if (pages[tab].hasOwnProperty('functions') && pages[tab].functions.hasOwnProperty('onload')) {
            pages[tab].functions.onload();
         }
      });

      $('#FAB').click(function(){
         if (pages[tab].hasOwnProperty('functions') && pages[tab].functions.hasOwnProperty('fab')) {
            pages[tab].functions.fab();
         }
      });

      $('#nav-folder-back').click(function() {
         if (pages[tab].hasOwnProperty('functions') && pages[tab].functions.hasOwnProperty('navback')) {
            pages[tab].functions.navback();
         }
      });



      // Snackbar, Drawer en Notificatiemenu
      mdc.autoInit();

      snackbar = new mdc.snackbar.MDCSnackbar(document.getElementById('snackbar'));
      snackbar.listen('MDCSnackbar:show', function () {
         $('.mdc-fab').css('transform', 'translateY(-' + $('#snackbar').outerHeight(true) + 'px)');
      });
      snackbar.listen('MDCSnackbar:hide', function () {
         $('.mdc-fab').css('transform', 'translateY(0px)');
      });

      var e_drawer = document.getElementById('drawer');
      var e_appbar = document.getElementById('top-app-bar');

      if (e_drawer && e_appbar) {
         var drawer = new mdc.drawer.MDCDrawer.attachTo(e_drawer);
         var appbar = new mdc.topAppBar.MDCTopAppBar.attachTo(e_appbar);
         appbar.setScrollTarget(document.getElementById('container'));
         appbar.listen('MDCTopAppBar:nav', () => {
            drawer.open = !drawer.open;
         });

         if (e_drawer.classList.contains('mdc-drawer--prepare')) {
            if (window.innerWidth >= 960) {
               e_drawer.classList.add('mdc-drawer--open');
            }
            e_drawer.classList.remove('mdc-drawer--prepare');
         }

         document.addEventListener('touchstart', handleTouchStart, false);
         document.addEventListener('touchmove', handleTouchMove, false);

         var xDown = null;
         var yDown = null;

         function handleTouchStart(evt) {
            xDown = evt.touches[0].clientX;
            yDown = evt.touches[0].clientY;
         };

         function handleTouchMove(evt) {
            if ( xDown === null || !yDown || window.innerWidth >= 960) {
               return;
            }

            var xUp = evt.touches[0].clientX;
            var yUp = evt.touches[0].clientY;

            var xDiff = xDown - xUp;
            var yDiff = yDown - yUp;

            if (Math.abs( xDiff ) > Math.abs( yDiff ) && xDiff < 0 && xDown < 10 && !drawer.open) {
               drawer.open = true;
            }

            xDown = null;
            yDown = null;
         };
      }

      var e_menu = document.getElementById('top-app-bar__menu');
      var e_more = document.getElementById('top-app-bar__more');

      if (e_appbar && e_more && e_menu) {
         var nmenu = new mdc.menuSurface.MDCMenuSurface(e_menu);

         e_more.addEventListener('click', function() {
            nmenu.open = !nmenu.open;
         });

         e_menu.addEventListener('MDCMenu:selected', function(evt) {
            var detail = evt.detail;
         });
      }
   });

})();
