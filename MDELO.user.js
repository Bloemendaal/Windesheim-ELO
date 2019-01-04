// ==UserScript==
// @name          Material Design ELO
// @namespace     https://github.com/Bloemendaal
// @description   Make the ELO great (again)!
// @author        Casper Bloemendaal
// @license       MIT

// @downloadURL   https://github.com/Bloemendaal/Windesheim-ELO/raw/master/MDELO.user.js
// @updateURL     https://github.com/Bloemendaal/Windesheim-ELO/raw/master/MDELO.user.js
// @supportURL    https://github.com/Bloemendaal/Windesheim-ELO/issues
// @version       1.4.1

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

   var version = 1.4.1;
   var tab     = false;
   var hidenav = false;

   var upload;
   var progressBar;

   var snackbar;

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
         title: 'Portfolio',
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
               $('#container-list > ul').html(printLanguages({
                  en: 'This part has yet to be developed. Please try again later.',
                  nl: 'Dit onderdeel moet nog worden ontwikkeld. Probeer het later nog eens.',
                  de: 'Dieser Teil muss noch entwickelt werden. Bitte versuchen Sie es sp&auml;ter erneut.'
               }));
            }
         }
      },
      {
         name: 'forum',
         title: 'Forum',
         icon: 'forum',
         display: {
            nav: 'menu',
            container: 'iframe'
         },
         functions: {
            onload: function(){
               $('#container-iframe > iframe').attr('src', '/Pages/Forum/ForumPage.aspx');
            },
            onunload: function() {
               $('#container-iframe > iframe').attr('src', '');
            }
         }
      },
      {
         name: 'settings',
         title: {
            en: 'Settings',
            nl: 'Instellingen',
            de: 'Einstellungen'
         },
         icon: 'settings',
         display: {
            nav: 'menu',
            container: 'list'
         },
         functions: {
            onload: function(){
               var append = $('#container-list > ul')
               append.html('<h2 class="mdc-list-group__subheader" style="font-size:1.5rem">' + printLanguages({
                  en: 'Language',
                  nl: 'Taal',
                  de: 'Sprache'
               }) + '</h2>');

               var clang = $('html').attr('lang');
               Object.keys(languages).forEach(function(k){
                  append.append('<li class="mdc-list-item settings-language' + (k == clang ? ' mdc-list-item--activated' : '') + '" data-lang="' + k + '" data-mdc-auto-init="MDCRipple"><div class="uk-margin-right"><div class="uk-inline uk-cover-container uk-border-circle mdc-list-item__image">' + languages[k].svg + '</div></div><span class="mdc-list-item__text"><span class="mdc-list-item__primary-text">' + printLanguages(languages[k].title) + '</span><span class="mdc-list-item__secondary-text">' + languages[k].title[k] + '</span></span></li>');
               });

               mdc.autoInit(document.getElementById('container-list'), () => {});
            },
            container: function(t, e){
               var $this = $(t);
               if ($this.hasClass('settings-language')) {
                  var lang = $this.data('lang');
                  $.ajax({
                     url: 'https://elo.windesheim.nl/Services/UserSchoolConfig.asmx',
                     type: 'POST',
                     data: '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ChangeUserLanguageID xmlns="http://www.threeships.com/N@TSchool/UserSchoolConfig"><lcid>' + languages[lang].key + '</lcid></ChangeUserLanguageID></soap:Body></soap:Envelope>',
                     dataType: 'xml',
                     contentType: 'text/xml',
                     complete: function(){
                        $('#container-list > ul > .settings-language').removeClass('mdc-list-item--activated');
                        $this.addClass('mdc-list-item--activated');
                        $('html').attr('lang', lang);
                     },
                     error: function(){
                        switch (lang) {
                           case 'nl':
                              msg = "Opslaan van de taalinstellingen is mislukt";
                              break;
                           case 'de':
                              msg = "Spracheinstellungen konnten nicht gespeichert werden.";
                              break;
                           default:
                              msg = "Failed to save language settings.";
                        }
                        snackbar.show({
                           message: msg
                        });
                     }
                  });
               }
            }
         }
      },
      {
         name: 'notification',
         title: {
            en: 'Notification',
            nl: 'Notificatie',
            de: 'Benachrichtigung'
         },
         showInNav: false,
         display: {
            nav: 'menu',
            container: 'iframe'
         }
      },
      { display: 'hr' },
      {
         name: 'educator',
         title: 'Educator',
         icon: 'account_circle',
         display: {
            link: '//educator.windesheim.nl'
         }
      },
      {
         name: 'sharenet',
         title: 'Sharenet',
         icon: 'supervised_user_circle',
         display: {
            link: '//sharenet.windesheim.nl'
         }
      },
      {
         name: 'bug',
         title: {
            en: 'Report a bug',
            nl: 'Rapporteer een bug',
            de: 'Einen Fehler einreichen'
         },
         icon: 'bug_report',
         display: {
            link: '//github.com/Bloemendaal/Windesheim-ELO/issues/new'
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
         display: 'handin'
      },
      {
         id: {
            studyroute: 10,
            portfolio: 0,
            handin: 0
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
   var languages = {
      en: {
         key: '1033_00',
         title: {
            en: 'English',
            nl: 'Engels',
            de: 'Englisch'
         },
         svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" uk-cover><clipPath><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><path d="M0,0 v30 h60 v-30 z" fill="#00247d"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#t)" stroke="#cf142b" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#cf142b" stroke-width="6"/></svg>'
      },
      nl: {
         key: '1043_00',
         title: {
            en: 'Dutch',
            nl: 'Nederlands',
            de: 'Niederl&auml;ndisch'
         },
         svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6" uk-cover><rect fill="#21468B" width="9" height="6"/><rect fill="#FFF" width="9" height="4"/><rect fill="#AE1C28" width="9" height="2"/></svg>'
      },
      de: {
         key: '1031_00',
         title: {
            en: 'German',
            nl: 'Duits',
            de: 'Deutsche'
         },
         svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" uk-cover><rect width="5" height="3" y="0" x="0" fill="#000"/><rect width="5" height="2" y="1" x="0" fill="#D00"/><rect width="5" height="1" y="2" x="0" fill="#FFCE00"/></svg>'
      }
   };


   function preparePage(k, t = null) {
      if ($('#search').is(':visible')) {
         $('#search-back').trigger('click');
      }

      if (typeof k == 'object') {
         var display = k;
      } else {
         if (tab !== false && pages[tab].hasOwnProperty('functions') && pages[tab].functions.hasOwnProperty('onunload')) {
            pages[tab].functions.onunload();
         }

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

      $('#content').css('background-color', display.hasOwnProperty('backgroundColor') ? display.backgroundColor : '#fff');
      $('#search-button').toggle(!!display.search);
   }

   function printLanguages(o) {
      if (typeof o == 'object') {
         var r = '';
         Object.keys(o).forEach(function(k) {
            r += '<span class="lang-'+k+'">'+o[k]+'</span>';
         });
         return r;
      } else {
         return o;
      }
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
               list.append('<li class="mdc-list-item uk-width-1-1 ' + (c.IS_FAVORITE ? 'uk-flex-first' : '') + '" data-id="'+c.ID+'" data-name="'+c.NAME+'" data-mdc-auto-init="MDCRipple"><div class="uk-margin-right"><div class="uk-inline uk-cover-container uk-border-circle mdc-list-item__image"><img src="'+c.IMAGEURL_24+'" alt="'+c.NAME+'" uk-cover></div></div><span>'+c.NAME+'</span><i class="mdc-icon-toggle mdc-theme--text-icon-on-background material-icons uk-margin-auto-left" role="button">'+(c.IS_FAVORITE ? 'star' : 'star_border')+'</i></li>');
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
               list.append('<li class="mdc-list-item uk-width-1-1 ' + (c.ISMAIN ? 'uk-flex-first' : '') + '" data-id="'+c.ID+'" data-name="'+c.NAME+'" data-mdc-auto-init="MDCRipple"><i class="material-icons mdc-list-item__graphic">folder_shared</i><span>'+c.NAME+'</span></li>');
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
               var properties = prepareItemType(item.URL, item.ITEMTYPE);
               var link = (item.hasOwnProperty('URL') && properties.display == 'link');
               var html = (link ? '<a href="' + encodeURI(item.URL) + '" target="_blank" rel="noopener" ' : '<li data-display="' + properties.display + '"' + (item.hasOwnProperty('URL') ? 'data-url="' + encodeURI(item.URL) + '" ' : '')) + 'data-id="'+item.ID+'" data-name="'+item.NAME+'" data-type="' + item.ITEMTYPE + '" ' + (item.hasOwnProperty('STUDYROUTE_RESOURCE_ID') ? 'data-resource="' + item.STUDYROUTE_RESOURCE_ID + '" ' : '') + ' data-mdc-auto-init="MDCRipple" class="mdc-list-item ' + (hidenav && item.hasOwnProperty('HIDE_IN_NAVIGATION') && item.HIDE_IN_NAVIGATION ? 'folder-hidenav' : '') + '">' + (properties.display == 'folder' ? '<i class="material-icons mdc-list-item__graphic folder-icon-arrow">arrow_right</i><i class="material-icons mdc-list-item__graphic folder-icon-margin uk-margin-remove-left uk-position-relative"' : '<i class="material-icons mdc-list-item__graphic folder-icon-margin uk-position-relative"') + (properties.color && !properties.label ? ' style="color:' + properties.color + '"' : '') + '>' + properties.icon + (properties.color && properties.label ? '<span class="folder-icon-badge" style="background-color:' + properties.color + '">' + properties.label + '</span>' : '') + '</i><span class="folder-text-padding">' + item.NAME + '</span>' + (link ? '<i class="mdc-list-item__meta material-icons">launch</i></a>' : '</li>');

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
            } else if (display == 'handin') {
               prepareHandin($this.data('resource'));
               preparePage({nav: 'folder', container: 'handin', backgroundColor: '#f8f8f8'}, $this.data('name'));
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

   function prepareItemType(url, it, comp = null) {
      if (!comp) {
         comp = pages[tab].name;
      }

      var itemType = itemTypes.find(function(i){
         return i.id[comp] == it;
      });

      var display = itemType.display;
      var icon    = itemType.icon;
      var label   = itemType.label;
      var color   = itemType.color;

      if (itemType.hasOwnProperty('ext')) {
         var surl = url.split('.');
         var ext = itemType.ext.find(function(i){
            return i.ext.indexOf(surl[surl.length - 1].toLowerCase()) > -1;
         });

         if (ext) {
            display = ext.hasOwnProperty('display') ? ext.display : display;
            icon    = ext.hasOwnProperty('icon')    ? ext.icon    : icon;
            label   = ext.hasOwnProperty('label')   ? ext.label   : label;
            color   = ext.hasOwnProperty('color')   ? ext.color   : color;
         }
      }

      return {
         display: display,
         icon: icon,
         label: label,
         color: color
      };
   }

   function prepareHandin(resource) {
      $('#container-handin').data('resource', resource);
      $.ajax({
         url: '/services/Studyroutemobile.asmx/LoadUserHandinDetails',
         type: 'GET',
         data: {
            studyRouteResourceId: resource
         },
         success: function(data){
            data = data.STUDYROUTE_USER_HANDINDETAILS[0];
            upload.params.AssignmentId = data.ID;

            var submit   = data.hasOwnProperty('HANDIN_URL');
            var celem    = $('#handin-' + (submit ? 'review' : 'upload'));
            var review   = celem.find('.handin-review');
            var start    = celem.find('.handin-start');
            var sbtn     = $('#handin-submit');
            var doc      = celem.find('.handin-document');

            $('#handin-' + (submit ? 'upload' : 'review')).hide();
            celem.find('.handin-load').load(encodeURI(data.DESCRIPTION_DOCUMENT_URL));
            celem.show();

            if (data.hasOwnProperty('REVIEW_URL')) {
               var rProperties = prepareItemType(data.REVIEW_URL, data.REVIEW_TYPE, 'handin');

               review.show();
               review.children('div').html(prepareHandinHTML(data.REVIEW_URL, data.REVIEW_NAME, rProperties));
            } else { review.hide(); }

            if (data.hasOwnProperty('INITIAL_DOCUMENT_URL') && (submit || data.INITIAL_DOCUMENT_STATUS == -1)) {
               var sProperties = prepareItemType(data.INITIAL_DOCUMENT_URL, data.INITIAL_DOCUMENT_TYPE, 'handin');

               start.show();
               start.children('div').html(prepareHandinHTML(data.INITIAL_DOCUMENT_URL, data.INITIAL_DOCUMENT_NAME, sProperties));
            } else { start.hide(); }

            if (submit) {
               var dProperties = prepareItemType(data.HANDIN_URL, data.HANDIN_TYPE, 'handin');

               progressBar.css('transform', 'scaleX(1)');
               sbtn.hide();
               doc.show();
               doc.children('div').html(prepareHandinHTML(data.HANDIN_URL, data.HANDIN_NAME, dProperties));
            } else if (data.hasOwnProperty('INITIAL_DOCUMENT_URL') && data.INITIAL_DOCUMENT_STATUS == 1) {
               var dProperties = prepareItemType(data.INITIAL_DOCUMENT_URL, data.INITIAL_DOCUMENT_TYPE, 'handin');
               dProperties.delete = {
                  id: data.INITIAL_DOCUMENT_CPID,
                  assignment: data.ID
               };

               progressBar.css('transform', 'scaleX(1)');
               sbtn.show();
               doc.show();
               doc.children('div').html(prepareHandinHTML(data.INITIAL_DOCUMENT_URL, data.INITIAL_DOCUMENT_NAME, dProperties));
            } else {
               progressBar.css('transform', 'scaleX(0)');
               doc.hide();
               sbtn.hide();
            }
            mdc.autoInit(document.getElementById('container-handin'), () => {});
         }
      });
   }

   function prepareHandinHTML(url, name, properties) {
      return (properties.hasOwnProperty('delete') ? '<div class="uk-grid uk-grid-collapse"><div class="uk-width-expand">' : '') + '<a href="' + encodeURI(url) + '" target="_blank" rel="noopener" data-mdc-auto-init="MDCRipple" class="mdc-list-item"><i class="material-icons mdc-list-item__graphic uk-position-relative"' + (properties.color && !properties.label ? ' style="color:' + properties.color + '"' : '') + '>' + properties.icon + (properties.color && properties.label ? '<span class="folder-icon-badge" style="background-color:' + properties.color + '">' + properties.label + '</span>' : '') + '</i><span class="folder-text-padding">' + name + '</span><i class="mdc-list-item__meta material-icons">launch</i></a>' + (properties.hasOwnProperty('delete') ? '</div><div class="uk-width-auto"><div class="handin-delete mdc-list-item" data-id="' + properties.delete.id + '" data-assignment="' + properties.delete.assignment + '" data-mdc-auto-init="MDCRipple"><i class="material-icons mdc-list-item__meta">delete</i></div></div>' : '');
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
                  $this.removeClass('uk-flex-first');
                  if (favoriteCourses == -1) {
                     $this.remove();
                  }
               } else {
                  $target.text('star');
                  $this.addClass('uk-flex-first');
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
      $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-rc.25/css/uikit.min.css" integrity="sha256-P3mc1WE09pSm1iAHPFelzUieKI78yRxZ7dGYjXuqIVw=" crossorigin="anonymous"><link rel="stylesheet" href="//fonts.googleapis.com/icon?family=Material+Icons"><link rel="stylesheet" href="//unpkg.com/material-components-web@latest/dist/material-components-web.min.css"><style>:root{--mdc-theme-primary:#406790}.lang-nl, .lang-de, [lang="nl"] .lang-en, [lang="de"] .lang-en{display:none}[lang="nl"] .lang-nl, [lang="de"] .lang-de{display:initial}.mdc-drawer .mdc-list-item--activated, .mdc-drawer .mdc-list-item--activated .mdc-list-item__graphic{color:#406790;color:var(--mdc-theme-primary, #406790)}.mdc-text-field--focused:not(.mdc-text-field--disabled) .mdc-floating-label{color:#000}.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-floating-label{color:#b00020}body,.material-icons{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}a.material-icons{text-decoration-line:none}.mdc-switch+label{margin-left:10px}#container{-webkit-touch-callout:text;-webkit-user-select:text;-khtml-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;min-height:100vh}#container,#container-iframe,#container-iframe>iframe,#container-handin{min-height:calc(100vh - 56px)}#container-list,#container-folder,#container-include{max-width:1200px;padding-bottom:15px;margin-left:auto;margin-right:auto}#container-include{overflow-wrap:break-word;word-wrap:break-word;padding-top:15px}#container-iframe{margin-left:-15px;margin-right:-15px}#container-folder .mdc-list-item{min-height:48px;height:auto;line-height:normal}#container-handin{padding-top:15px;padding-bottom:15px;box-sizing:border-box;position:relative;height:calc(100vh - 56px)}#handin-upload,#handin-review{border:1px dashed #e6e6e6;border-top:0;height:calc(100% - 4px);background-color:#fff}.handin-load{flex:1;height:1px;overflow-y:scroll}#top-app-bar input{font-size:1.25rem;color:#fff;color:var(--mdc-theme-on-primary,#fff)}#snackbar{z-index:1500}#drawer .mdc-list-item{min-height:40px;height:auto;line-height:normal}#nav-focus, #nav-focus li{height:0;width:0;margin:0;padding:0}.mdc-drawer--modal.mdc-drawer--open{display:flex}@media (min-width:600px){#container,#container-iframe,#container-iframe>iframe,#container-handin{min-height:calc(100vh - 64px)}#container-handin{height:calc(100vh - 64px)}.mdc-fab:not(.fab-hidden){transform:translateY(0) !important}}@media (min-width:640px){.mdc-drawer{width:512px}#container-iframe{margin-left:-30px;margin-right:-30px}#container-list,#container-folder,#container-handin,#container-include{padding-bottom:30px}#container-handin,#container-include{padding-top:30px}}@media (min-width:960px){.mdc-drawer{width:30%}.mdc-drawer-scrim{display:none !important}.mdc-drawer--modal{box-shadow:none}.mdc-drawer--prepare{display:flex}.mdc-drawer--open+.mdc-drawer-scrim+.mdc-drawer-app-content,.mdc-drawer--prepare+.mdc-drawer-scrim+.mdc-drawer-app-content{margin-left:30%;margin-right:0}.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-scrim+.mdc-drawer-app-content>.mdc-top-app-bar,.mdc-drawer--prepare+.mdc-drawer-scrim+.mdc-drawer-app-content>.mdc-top-app-bar{width:70%}.mdc-drawer-app-content{transition:margin-left .25s cubic-bezier(.4,0,.2,1)}.mdc-top-app-bar{transition:width .25s cubic-bezier(.4,0,.2,1)}.mdc-drawer--open.mdc-drawer--closing+.mdc-drawer-scrim+.mdc-drawer-app-content{margin-left:0;transition:margin-left .2s cubic-bezier(.4,0,.2,1)}.mdc-drawer--open.mdc-drawer--closing+.mdc-drawer-scrim+.mdc-drawer-app-content>.mdc-top-app-bar{transition:width .2s cubic-bezier(.4,0,.2,1)}#container-iframe{margin-left:-40px;margin-right:-40px}#container-list,#container-folder,#container-handin,#container-include{padding-bottom:40px}#container-handin,#container-include{padding-top:40px}}.mdc-drawer__drawer::-webkit-scrollbar,.uk-scrollbar::-webkit-scrollbar{background-color:transparent;width:12px}.mdc-drawer__drawer::-webkit-scrollbar-thumb,.uk-scrollbar::-webkit-scrollbar-thumb{background-clip:padding-box;border-radius:3px;-webkit-border-radius:3px;border:4px solid transparent;background-color:rgba(0, 0, 0, .2)}ul.mdc-list:not(.mdc-list--non-interactive) .mdc-list-item{cursor:pointer}.uk-cover-container{width:48px;height:48px}.only-child,.last-child,.first-child{display:none}.only-child:only-child,.last-child:last-child,.first-child:first-child{display:initial}.folder-icon-margin{margin-right:24px}#nav-folder .folder-icon-margin{margin-left:24px}.folder-icon-arrow{margin:0px;transition-duration:0.25s;pointer-events:initial!important}.folder-expanded>.folder-icon-arrow{transform:rotate(90deg)}#nav-folder .folder-hidenav, #container-folder .folder-icon-arrow{display:none}.folder-icon-badge{font-size:0.5rem;line-height:1em;font-family:Roboto,sans-serif;position:absolute;color:#fff;bottom:3px;padding:1px 2px 0px 2px;right:3px;border-radius:2px}.folder-text-padding{padding-top:8px;padding-bottom:8px}.mdc-fab{position:fixed;bottom:1rem;right:1rem;animation-duration: .25s;animation-duration:250ms;transition-duration: .25s;transition-duration:250ms}.fab-hidden{opacity:0;transform:translateY(48px)}@media(min-width:1024px){.mdc-fab{bottom:1.5rem;right:1.5rem}}</style>');
      $('body').html('<aside id="drawer" class="mdc-drawer mdc-drawer--modal mdc-drawer--prepare"><div class="mdc-drawer__header"><h3 class="mdc-drawer__title uk-text-truncate"></h3><h6 class="mdc-drawer__subtitle uk-text-truncate"></h6></div><div id="nav" class="mdc-drawer__content uk-scrollbar"><ul id="nav-focus" class="mdc-list"><li class="mdc-list-item" tabindex="0"></li></ul><div id="nav-menu"><ul id="nav-menu-list" class="mdc-list"></ul></div><div id="nav-folder"><ul class="mdc-list" data-id="-1"><li id="nav-folder-back" class="mdc-list-item" data-mdc-auto-init="MDCRipple"> <i class="material-icons mdc-list-item__graphic" aria-hidden="true">arrow_back</i> <span class="lang-en">Back</span> <span class="lang-nl">Terug</span> <span class="lang-de">Zur&uuml;ck</span></li></ul><ul id="nav-folder-list" class="mdc-list uk-padding-remove-top"></ul></div></div> </aside><div class="mdc-drawer-scrim"></div><div class="mdc-drawer-app-content"> <header id="top-app-bar" class="mdc-top-app-bar mdc-top-app-bar--fixed"><div class="mdc-top-app-bar__row top-app-bar__main"> <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start"> <span class="material-icons mdc-top-app-bar__navigation-icon">menu</span> <span id="title" class="mdc-top-app-bar__title"></span> </section> <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar"> <span id="search-button" uk-toggle="target: #top-app-bar .top-app-bar__search, #top-app-bar .top-app-bar__main; animation: uk-animation-fade" class="material-icons mdc-top-app-bar__action-item" aria-label="Zoeken" alt="Zoeken">search</span> <span id="top-app-bar__more" class="material-icons mdc-top-app-bar__action-item mdc-menu-surface--anchor" aria-label="Meer..." alt="Meer..."> <span>notifications_none</span><div id="top-app-bar__menu" class="mdc-menu mdc-menu-surface"><ul class="mdc-list mdc-list--two-line"></ul></div> </span> </section></div><div class="mdc-top-app-bar__row top-app-bar__search" hidden> <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start"> <span id="search-back" uk-toggle="target: #top-app-bar .top-app-bar__search, #top-app-bar .top-app-bar__main; animation: uk-animation-fade" class="material-icons mdc-top-app-bar__navigation-icon">arrow_back</span><div class="uk-search uk-search-navbar uk-width-1-1 uk-light"> <input id="search" class="uk-search-input mdc-top-app-bar__title" type="search" placeholder="Zoeken..." autofocus></div> </section></div> </header><div id="content" class="uk-container uk-container-expand"><div class="mdc-top-app-bar--fixed-adjust"></div><div id="container"><div id="container-iframe"> <iframe src="" width="100%" height="100%"></iframe></div><div id="container-handin"><div id="handin-progress" role="progressbar" class="mdc-linear-progress"><div class="mdc-linear-progress__buffering-dots"></div><div class="mdc-linear-progress__buffer"></div><div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar"> <span class="mdc-linear-progress__bar-inner"></span></div><div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar"> <span class="mdc-linear-progress__bar-inner"></span></div></div><div id="handin-upload" class="uk-flex uk-flex-column"><div class="handin-load uk-padding uk-scrollbar"></div><div class="uk-text-center uk-padding"> <i class="material-icons uk-text-middle uk-margin-small-right">cloud_upload</i> <span class="uk-text-middle"> <span class="lang-en">Attach binaries by dropping them here or</span> <span class="lang-nl">Upload bestanden door ze hierheen te slepen of</span> <span class="lang-de">Laden Sie Dateien hoch, indem Sie sie hierher ziehen oder</span> </span><div uk-form-custom> <input type="file" multiple> <span class="uk-link"> <span class="lang-en">selecting one</span> <span class="lang-nl">te selecteren</span> <span class="lang-de">ausw&auml;hlen</span> </span></div></div><div class="uk-padding uk-padding-remove-top"><ul class="mdc-list uk-padding-remove"><li class="handin-review mdc-list-group"><h6 class="mdc-list-group__subheader"> <span class="lang-en">Review</span> <span class="lang-nl">Beoordeling</span> <span class="lang-de">Rezension</span></h6><div></div></li><li class="handin-start mdc-list-group"><h6 class="mdc-list-group__subheader"> <span class="lang-en">Provided document</span> <span class="lang-nl">Meegeleverd document</span> <span class="lang-de">Bereitgestelltes Dokument</span></h6><div></div></li><li class="handin-document mdc-list-group"><h6 class="mdc-list-group__subheader"> <span class="lang-en">Uploaded document</span> <span class="lang-nl">Geüpload document</span> <span class="lang-de">Hochgeladenes Dokument</span></h6><div></div></li></ul></div><div id="handin-submit" class="uk-padding uk-padding-remove-top"><div class="uk-grid"><div class="uk-width-expand"> <small class="uk-text-meta uk-text-middle" style="padding-left: 16px"> <span class="lang-en">Note that pressing submit cannot be undone.</span> <span class="lang-nl">Op inleveren klikken kan niet ongedaan gemaakt worden.</span> <span class="lang-de">Beachten Sie, dass das Dr&uuml;cken von "Senden" nicht r&uuml;ckg&auml;ngig gemacht werden kann.</span> </small></div><div class="uk-width-auto"> <button class="mdc-button mdc-button--raised" data-mdc-auto-init="MDCRipple"> <span class="lang-en">Submit</span> <span class="lang-nl">Inleveren</span> <span class="lang-de">Senden</span> </button></div></div></div></div><div id="handin-review" class="uk-flex uk-flex-column"><div class="handin-load uk-padding uk-scrollbar"></div><div class="uk-padding"><ul class="mdc-list uk-padding-remove"><li class="handin-review mdc-list-group"><h6 class="mdc-list-group__subheader"> <span class="lang-en">Review</span> <span class="lang-nl">Beoordeling</span> <span class="lang-de">Rezension</span></h6><div></div></li><li class="handin-start mdc-list-group"><h6 class="mdc-list-group__subheader"> <span class="lang-en">Provided document</span> <span class="lang-nl">Meegeleverd document</span> <span class="lang-de">Bereitgestelltes Dokument</span></h6><div></div></li><li class="handin-document mdc-list-group"><h6 class="mdc-list-group__subheader"> <span class="lang-en">Submitted document</span> <span class="lang-nl">Ingezonden document</span> <span class="lang-de">&Uuml;bermitteltes Dokument</span></h6><div></div></li></ul></div></div></div><div id="container-include"></div><div id="container-list"><ul class="mdc-list mdc-list--two-line uk-flex uk-flex-column" aria-orientation="vertical"></ul></div><div id="container-folder"><ul class="mdc-list"></ul></div></div> <button id="FAB" class="mdc-fab fab-hidden material-icons" aria-label="Favorite" data-mdc-auto-init="MDCRipple"> <span class="mdc-fab__icon"></span> </button></div></div><div id="snackbar" class="mdc-snackbar" aria-live="assertive" aria-atomic="true" aria-hidden="true"><div class="mdc-snackbar__text"></div><div class="mdc-snackbar__action-wrapper"> <button type="button" class="mdc-snackbar__action-button"></button></div></div>');

      $.ajax({
         url: '/services/Mobile.asmx/LoadUserSchoolConfig',
         type: 'GET',
         success: function(data){
            if (data.ACTIVESESSION) {
               $('#drawer > .mdc-drawer__header > .mdc-drawer__title'  ).text(data.USERNAME);
               $('#drawer > .mdc-drawer__header > .mdc-drawer__subtitle').text(data.LOGINID);
               var lang = Object.keys(languages).find(function(k){
                  return languages[k].key == data.NOMENCLATURE;
               });
               $('html').attr('lang', lang || '');
            } else {
               window.location.replace(window.location.origin);
            }
         }
      });

      $.ajax({
         url: '/services/MyNewsMobile.asmx/LoadMessages',
         type: 'GET',
         data: {
            includeReadMessages: true,
            lastUpdate: "01-01-2000",
            sort: 0,
            start: 0,
            length: 10
         },
         success: function(data){
            data = data.MESSAGES;
            var append = $('#top-app-bar__menu > ul');
            var unread = false;

            data.forEach(function(msg){
               if (msg.ISREAD == false) {
                  unread = true;
               }

               append.append('<li class="mdc-list-item ' + (msg.ISREAD ? '' : 'mdc-list-item--activated') + '" data-id="' + msg.ID + '" data-name="' + msg.NAME + '" data-url="' + encodeURI(msg.URL) + '">' + (msg.hasOwnProperty('DESCRIPTION') ? '<span class="mdc-list-item__text"><span class="mdc-list-item__primary-text">' + msg.NAME + '</span><span class="mdc-list-item__secondary-text">' + msg.DESCRIPTION + '</span></span>' : '<span>' + msg.NAME + '</span>') + (msg.ISURGENT ? '<i class="material-icons mdc-list-item__meta">priority_high</i>' : '') + '</li>');

               if (unread) {
                  $('#top-app-bar__more > span').text('notifications_active');
               }
            });
         }
      });

      var menu = $('#nav-menu-list');
      Object.keys(pages).forEach(function(k) {
         if (!pages[k].hasOwnProperty('showInNav') || pages[k].showInNav == true) {
            if (pages[k].display == 'hr') {
               menu.append('<li role="separator" class="mdc-list-divider"></li>');
            } else if (pages[k].display.hasOwnProperty('link')) {
               menu.append('<a href="' + pages[k].display.link + '" target="_blank" rel="noopener" class="mdc-list-item" data-mdc-auto-init="MDCRipple" tabindex="0" aria-selected="true" aria-expanded="true"><i class="material-icons mdc-list-item__graphic" aria-hidden="true">'+pages[k].icon+'</i>'+printLanguages(pages[k].title)+'<i class="mdc-list-item__meta material-icons">launch</i></a>')
            } else {
               menu.append('<li class="mdc-list-item '+(tab === false && 'mdc-list-item--activated')+'" data-id="'+k+'" data-mdc-auto-init="MDCRipple" tabindex="0" aria-selected="true" aria-expanded="true"><i class="material-icons mdc-list-item__graphic" aria-hidden="true">'+pages[k].icon+'</i>'+printLanguages(pages[k].title)+'</li>');
               if (!tab) {
                  preparePage(k);
               }
            }
         }
      });

      // Navigatiebalk functies
      $('#nav-menu-list').on('click', 'li.mdc-list-item', function(){
         var $this = $(this);
         $('#nav-menu-list > li').removeClass('mdc-list-item--activated');
         $this.addClass('mdc-list-item--activated');
         preparePage($this.data('id'));
      });

      $('#nav-folder-list, #container-folder > ul').on('click', 'li.mdc-list-item', function(e){
         setFolderItem(this, e);
      });


      // Container functies
      $('#container-list > ul').on('click', 'li.mdc-list-item', function(e){
         if (pages[tab].hasOwnProperty('functions') && pages[tab].functions.hasOwnProperty('container')) {
            pages[tab].functions.container(this, e);
         }
      });

      $('#container-handin .handin-document').on('click', '.handin-delete', function(){
         var $this = $(this);
         var assignment = $this.data('assignment');
         var id = $this.data('id');
         $.ajax({
            url: '/services/Studyroutemobile.asmx/DeleteWorkingDocument',
            type: 'GET',
            data: {
               cpId: id,
               assignmentId: assignment
            },
            beforeSend: function() {
               $this.html('<div uk-spinner="ratio:0.8" class="mdc-list-item__meta"></div>');
            },
            complete: function(data){
               if (data.status != 200 || data.responseJSON.DELETE_WORKING_DOCUMENT != "TRUE") {
                  var msg, actionText;
                  switch ($('html').attr('lang')) {
                     case 'nl':
                        msg = "Verwijderen mislukt, de pagina wordt herladen.";
                        actionText = "Rapporteer een bug";
                        break;
                     case 'de':
                        msg = "Löschen fehlgeschlagen, Laden der Seite neu.";
                        actionText = "Einen Fehler einreichen";
                        break;
                     default:
                        msg = "Failed to delete, reloading the page.";
                        actionText = "Report a bug";
                  }
                  snackbar.show({
                     message: msg,
                     timeout: 5000,
                     actionHandler: function() {
                        window.location.href = 'https://github.com/Bloemendaal/Windesheim-ELO/issues/new?title='+encodeURI('[BUG] Handin DeleteWorkingDocument error')+'&body='+encodeURI('Page: ' + pages[tab].name + "\n" + 'cpId: ' + id + "\n" + 'assignmentId: ' + assignment + "\n" + 'Version: ' + version + 'xhrData: ' + JSON.stringify(data, null, 2) + "\n" + "\n\n" + '[Your description of the steps you took to encounter this problem. Try to reproduce the proces, possibly provide a screenshot.]');
                     },
                     actionText: actionText,
                     multiline: true,
                     actionOnBottom: true
                  });
               }
               prepareHandin($('#container-handin').data('resource'));
            }
         });
      });

      $('#handin-submit button').click(function(){
         var btn = $(this);
         if (btn.prop('disabled') == false) {
            btn.prop('disabled', true).html(printLanguages({
               en: 'Loading...',
               nl: 'Laden...',
               de: 'Wird geladen...'
            }));
            var items = $('#handin-upload .handin-document .handin-delete');
            var icount = 0;
            var itotal = items.length;
            items.each(function(){
               var $this = $(this);
               var assignment = $this.data('assignment');
               var id = $this.data('id');
               $.ajax({
                  url: '/services/Studyroutemobile.asmx/SubmitExistingDocument',
                  type: 'GET',
                  data: {
                     assignmentId: assignment,
                     cpId: id,
                     cpType: 0
                  },
                  complete: function(data) {
                     if (data.status != 200 || data.responseJSON.SUCCESS != "TRUE") {
                        snackbar.show({
                           message: data.responseJSON.ERROR
                        });
                     }
                     icount++;
                     if (icount == itotal) {
                        prepareHandin($('#container-handin').data('resource'));
                     }
                  }
               });
            });
         }
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

      $('#top-app-bar__menu > ul').on('click', 'li.mdc-list-item', function(){
         var $this = $(this);
         preparePage(7, $this.data('name'));
         $('#container-iframe > iframe').attr('src', $this.data('url'));
         $('#nav-menu-list > li').removeClass('mdc-list-item--activated');
         if ($this.hasClass('mdc-list-item--activated')) {
            $.ajax({
               url: '/services/MyNewsMobile.asmx/SetMessageStatus',
               type: 'GET',
               data: {
                  messageId: $this.data('id'),
                  isRead: true
               },
               success: function(){
                  $this.removeClass('mdc-list-item--activated');
                  if ($('#top-app-bar__menu > ul > li.mdc-list-item--activated').length == 0) {
                     $('#top-app-bar__more > span').text('notifications_none');
                  }
               }
            });
         }
      });

      // File upload
      progressBar = $('#handin-progress > .mdc-linear-progress__bar.mdc-linear-progress__primary-bar');
      upload = UIkit.upload('#handin-upload', {
         url: '/Services/Assignment.asmx/UploadTempFile',
         multiple: true,
         concurrent: 1,
         loadStart: function (e) {
            progressBar.css('transform', 'scaleX(0)');
         },
         progress: function (e) {
            progressBar.css('transform', 'scaleX('+(e.loaded/e.total).toFixed(2)+')');
         },
         loadEnd: function (e) {
            progressBar.css('transform', 'scaleX(1)');
         },
         completeAll: function() {
            prepareHandin($('#container-handin').data('resource'));
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
