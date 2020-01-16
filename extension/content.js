/*! Material Design ELO | https://github.com/Bloemendaal/Windesheim-ELO | (c) 2019 Casper Bloemendaal | MIT License */
(function() {
   'use strict';

   var version = 1.70;
   var tab     = false;
   var hidenav = false;
   var lang    = 0;
   var path;

   var upload;
   var snackbar;
   var progressBar;

   var favoriteCourses = localStorage.getItem("favoriteCourses") == "-1" ? -1 : 0;
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
               setCoursesPortfolios(true);
            },
            search: function(q) {
               setCoursesPortfolios(true, q);
            },
            container: function(t, e) {
               var $this = $(t);
               var id = $this.data('id');
               if (e.target.classList.contains('mdc-icon-button')) {
                  favoriteCourse(id, e, $this);
               } else {
                  prepareFolder(1, id, $this.data('name'), $this.data('syllabus'));
               }
            },
            fab: function() {
               favoriteCourses = Math.abs(favoriteCourses + 1) * -1;
               localStorage.setItem("favoriteCourses", favoriteCourses.toString());
               setCoursesPortfolios(true, $('#search').is(':visible') ? $('#search').val() : '');
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
            container: 'folder',
            fab: 'save_alt'
         },
         functions: {
            navback: function(){
               $('#nav-menu-list > li').removeClass('mdc-list-item--activated');
               $('#nav-menu-list > li[data-id="0"]').addClass('mdc-list-item--activated');
               setPage(0);
            },
            fab: function () {
               var currentPath = preparePath(false);
               var courseID = currentPath[1].split('-');
               var subFolder = currentPath.length > 2 ? currentPath[currentPath.length - 1] : -1;
               getFolderContents(courseID[courseID.length - 1], subFolder)
               .then(async (result) => {
                  console.log(result);
                  var zip = new JSZip();
                  await generateZip(result, zip);
                  zip.generateAsync({type:"blob"})
                  .then((content) => {
                     saveAs(content, $('#title').text() + ".zip");
                  });
               });
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
               setCoursesPortfolios(false);
            },
            search: function(q){
               setCoursesPortfolios(false, q);
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
            fab: function(){
               $.ajax({
                  url: '/Services/CMS.asmx/ExportFolder',
                  type: 'GET',
                  data: {
                     folderId: path[path.length - 1],
                     download: null
                  },
                  cache:false,
                  xhrFields:{
                      responseType: 'blob'
                  },
                  success: function(response, status, xhr) {
                     // check for a filename
                     var filename = "";
                     var disposition = xhr.getResponseHeader('Content-Disposition');
                     if (disposition && disposition.indexOf('attachment') !== -1) {
                        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        var matches = filenameRegex.exec(disposition);
                        if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                     }

                     var type = xhr.getResponseHeader('Content-Type');
                     var blob = new Blob([response], { type: type });

                     if (typeof window.navigator.msSaveBlob !== 'undefined') {
                        // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                        window.navigator.msSaveBlob(blob, filename);
                     } else {
                        var URL = window.URL || window.webkitURL;
                        var downloadUrl = URL.createObjectURL(blob);

                        if (filename) {
                           // use HTML5 a[download] attribute to specify filename
                           var a = document.createElement("a");
                           // safari doesn't support this yet
                           if (typeof a.download === 'undefined') {
                              window.location = downloadUrl;
                           } else {
                              a.href = downloadUrl;
                              a.download = filename;
                              document.body.appendChild(a);
                              a.click();
                           }
                        } else {
                           window.location = downloadUrl;
                        }

                        setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
                     }
                  }
               });
            },
            navback: function(){
               $('#nav-menu-list > li').removeClass('mdc-list-item--activated');
               $('#nav-menu-list > li[data-id="2"]').addClass('mdc-list-item--activated');
               setPage(2);
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
               setIframe('/Pages/Forum/ForumPage.aspx');
            },
            onunload: function() {
               setIframe();
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

               Object.keys(languages).forEach(function(k){
                  append.append('<li class="mdc-list-item settings-language' + (k == lang ? ' mdc-list-item--activated' : '') + '" data-lang="' + k + '" data-mdc-auto-init="MDCRipple"><div class="uk-margin-right"><div class="uk-inline uk-cover-container uk-border-circle mdc-list-item__image">' + languages[k].svg + '</div></div><span class="mdc-list-item__text"><span class="mdc-list-item__primary-text">' + printLanguages(languages[k].title) + '</span><span class="mdc-list-item__secondary-text">' + languages[k].title[k] + '</span></span></li>');
               });

               append.append('<h2 class="mdc-list-group__subheader uk-margin-large-top" style="font-size:1.5rem">' + printLanguages({
                  en: 'Night mode',
                  nl: 'Nachtmodus',
                  de: 'Nacht-Modus'
               }) + '</h2>');

               append.append('<li class="mdc-list-item settings-darktheme" data-mdc-auto-init="MDCRipple"><span class="uk-margin-right uk-cover-container mdc-list-item__image mdc-list-item__graphic material-icons"><span class="darktheme-show">brightness_2</span><span class="darktheme-hide">wb_sunny</span></span><span class="darktheme-show">' + printLanguages({
                   en: 'Switch to a light theme',
                   nl: 'Gebruik een licht thema',
                   de: 'Wechseln Sie zu einem hellen Thema'
               }) + '</span><span class="darktheme-hide">' + printLanguages({
                  en: 'Switch to a dark theme',
                  nl: 'Gebruik een donker thema',
                  de: 'Wechseln Sie zu einem dunklen Thema'
               }) + '</span></li>');

               mdc.autoInit(document.getElementById('container-list'), () => {});
            },
            container: function(t, e){
               var $this = $(t);
               if ($this.hasClass('settings-language')) {
                  var slang = $this.data('lang');
                  $.ajax({
                     url: '/Services/UserSchoolConfig.asmx',
                     type: 'POST',
                     data: '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ChangeUserLanguageID xmlns="http://www.threeships.com/N@TSchool/UserSchoolConfig"><lcid>' + languages[slang].key + '</lcid></ChangeUserLanguageID></soap:Body></soap:Envelope>',
                     dataType: 'xml',
                     contentType: 'text/xml',
                     complete: function(){
                        lang = slang;
                        $('#container-list > ul > .settings-language').removeClass('mdc-list-item--activated');
                        $this.addClass('mdc-list-item--activated');
                        $('html').attr('lang', slang);
                     },
                     error: function(){
                        var msg;
                        switch (slang) {
                           case 'nl':
                              msg = "Opslaan van de taalinstellingen is mislukt.";
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
               } else if ($this.hasClass('settings-darktheme')) {
                   var dT = !+localStorage.getItem("darkTheme");
                   localStorage.setItem("darkTheme", (+dT).toString());
                   $('html').toggleClass('darktheme', dT);
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
         name: 'wip',
         title: 'WIP',
         icon: 'supervised_user_circle',
         display: {
            link: '//wip.windesheim.nl'
         }
      },
      {
         name: 'selfserviceportal',
         title: {
            en: 'Self-Service Portal',
            nl: 'Zelfservice portaal',
            de: 'Self-Service Portal'
         },
         icon: 'add_circle',
         display: {
            link: '//windesheim.topdesk.net/tas/public/ssp/'
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
      },
      {
         id: {
            studyroute: 11
         },
         icon: 'web',
         display: 'iframe'
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

   async function generateZip(result, folder) {
      for (var i = 0; i < result.length; i++) {
         if (result[i].STUDYROUTE_CONTENT) {
            await generateZip(result[i].STUDYROUTE_CONTENT, folder.folder(result[i].NAME));
         } else if (result[i].URL) {
            const file = await fetch(result[i].URL).then((response) => {
               if (response.ok) {
                  return response.blob();
               }

               return null;
            }).catch((error) => {
               return null;
            });

            if (file) {
               var name = result[i].NAME;
               var exts = result[i].URL.split('.');
               if (exts.length > 1) {
                  var ext = exts.pop();
                  if (ext != result[i].NAME.split('.').pop()) {
                     name += '.' + ext;
                  }
               }

               folder.file(name, file);
            }
         }
      }
   }
   async function getFolderContents(courseID, parent = -1) {
      var timeout = 1;
      setTimeout(function () {
         if (timeout) {
            eloTimeout();
         }
      }, 3000);

      var url = new URL('/services/' + (pages[tab].name == 'portfolio' ? 'my' + pages[tab].name : pages[tab].name) + 'mobile.asmx/Load' + pages[tab].name.charAt(0).toUpperCase() + pages[tab].name.slice(1) + 'Content', location.origin),
      params = {
         [pages[tab].name + 'id']: courseID,
         parentid: parent,
         start: 0,
         length: 1000
      };
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

      return await fetch(url)
      .then((response) => {
         return response.json();
      })
      .then(async (myJson) => {
         timeout = 0;

         for (var i = 0; i < myJson.STUDYROUTE_CONTENT.length; i++) {
            if (prepareItemType(myJson.STUDYROUTE_CONTENT[i].URL, myJson.STUDYROUTE_CONTENT[i].ITEMTYPE).display == 'folder') {
               myJson.STUDYROUTE_CONTENT[i].STUDYROUTE_CONTENT = await getFolderContents(courseID, myJson.STUDYROUTE_CONTENT[i].ID);
            }
         }

         return myJson.STUDYROUTE_CONTENT;
      });
   }

   function eloError() {
      var msg, actionText;
      switch (lang) {
         case 'nl':
         msg = "Kan de ELO momenteel niet bereiken...";
         actionText = "Herladen";
         break;
         case 'de':
         msg = "ELO kann derzeit nicht erreicht werden...";
         actionText = "Neu laden";
         break;
         default:
         msg = "Cannot reach the ELO...";
         actionText = "Reload";
      }
      eloSnackbar(msg, actionText);
   }
   function eloTimeout() {
      var msg, actionText;
      switch (lang) {
         case 'nl':
         msg = "Het laden duurt langer dan verwacht...";
         actionText = "Herladen";
         break;
         case 'de':
         msg = "Das Laden dauert länger als erwartet...";
         actionText = "Neu laden";
         break;
         default:
         msg = "Loading takes longer than expected...";
         actionText = "Reload";
      }
      eloSnackbar(msg, actionText);
   }
   function eloSnackbar(msg, actionText) {
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

   function setPage(k, t = null, ignoreState = null) {
      if ($('#search').is(':visible')) {
         $('#search-back').trigger('click');
      }

      var display;
      if (typeof k == 'object') {
         display = k;
      } else {
         if (tab !== false && pages[tab].hasOwnProperty('functions') && pages[tab].functions.hasOwnProperty('onunload')) {
            pages[tab].functions.onunload();
         }

         tab = k;
         display = pages[k].display;
         if (t === true || t === false) {
            if (ignoreState === null) {
               ignoreState = t;
            }
            t = null;
         }

         if (!t) {
            t = pages[k].title;
         }

         if (pages[k].hasOwnProperty('functions') && pages[k].functions.hasOwnProperty('onload')) {
            pages[k].functions.onload();
         }

         if (!ignoreState) {
            var state = { title: t };
            history.pushState(state, t, '#' + pages[k].name);
            path = preparePath();
         }

      }

      if (display.container) {
         $('#container > *').hide();
         $('#container-' + display.container).show();
      }
      if (display.nav) {
         $('#nav > *:not(#nav-focus)').hide();
         $('#nav-' + display.nav).show();
      }


      if (t) {
         $('#title').html(printLanguages(t));
      }

      if (display.fab) {
         $('#FAB').removeClass('fab-hidden').text(display.fab);
      } else {
         $('#FAB').addClass('fab-hidden').text('');
      }

      $('#content').css('background-color', display.hasOwnProperty('backgroundColor') ? display.backgroundColor : '#fff');
      $('#search-button').toggle(!!display.search);

   }

   function setCoursesPortfolios(courses, search = '') {
      var timeout = 1;
      var list = $('#container-list > ul');

      setTimeout(function () {
         if (timeout) {
            list.html('<span class="last-child uk-text-center uk-text-small uk-margin-left">' + printLanguages({
               en: 'Loading...',
               nl: 'Laden...',
               de: 'Wird geladen...'
            }) + '</span>');
         }
      }, 250);
      setTimeout(function () {
         if (timeout) {
            eloTimeout();
         }
      }, 3000);

      $.ajax({
         url:  courses ? '/services/Studyroutemobile.asmx/LoadStudyroutes' : '/services/MyPortfolioMobile.asmx/LoadPortfolios',
         type: 'GET',
         data: courses ? {
            start: 0,
            length: 100,
            filter: favoriteCourses,
            search: search
         } : {
            start: 0,
            length: 100,
            userId: -1,
            search: search
         },
         complete: function(data) {
            timeout = 0;
            list.html('<span class="last-child uk-text-center uk-text-small uk-margin-left">' + printLanguages({
               en: 'No results found...',
               nl: 'Geen resultaten gevonden...',
               de: 'Keine Ergebnisse gefunden ...'
            }) + '</span>');

            if (data.status == 200) {
               if (courses) {
                  data.responseJSON.STUDYROUTES.forEach(function(c) {
                     list.append('<li class="mdc-list-item uk-width-1-1 ' + (c.IS_FAVORITE ? 'uk-flex-first' : '') + '" data-id="'+c.ID+'" data-name="'+c.NAME+'" ' + (c.PREFACEPAGE_URL ? 'data-syllabus="' + encodeURI(c.PREFACEPAGE_URL) + '"' : '') + ' data-mdc-auto-init="MDCRipple"><div class="uk-margin-right"><div class="uk-inline uk-cover-container uk-border-circle mdc-list-item__image uk-flex">' + (c.IMAGEURL_24 ? '<img src="'+c.IMAGEURL_24+'" alt="'+c.NAME+'" uk-cover>' : '<i class="material-icons mdc-list-item__graphic" style="margin:auto">book</i>') + '</div></div><span>'+c.NAME+'</span><i class="mdc-icon-button mdc-theme--text-icon-on-background material-icons uk-margin-auto-left" role="button">'+(c.IS_FAVORITE ? 'star' : 'star_border')+'</i></li>');
                  });
               } else {
                  data.responseJSON.PORTFOLIOS.forEach(function(c) {
                     list.append('<li class="mdc-list-item uk-width-1-1 ' + (c.ISMAIN ? 'uk-flex-first' : '') + '" data-id="'+c.ID+'" data-name="'+c.NAME+'" data-mdc-auto-init="MDCRipple"><i class="material-icons mdc-list-item__graphic">folder_shared</i><span>'+c.NAME+'</span></li>');
                  });
               }
               mdc.autoInit(document.getElementById('container-list'), () => {});
            } else {
               eloError();
            }
         }
      });
   }

   function setFolder(append, id, parent = -1, npath = false) {
      if (!Array.isArray(append)) {
         append = [append];
      }
      if (npath) {
         var i = id;
         var splitC = npath[1].split('-');
         id = decodeURI(splitC[splitC.length - 1]);
      }
      Object.keys(append).forEach(function(k) {
         if (parent != -1 && append[k].attr('id') != 'folder-'+parent && append[k].parents('#nav').length > 0) {
            if (i) {
               append[k].addClass('folder-expanded');
            }
            append[k].after('<ul id="folder-'+parent+'" class="mdc-list uk-margin-left uk-padding-remove" style="display:none"></ul>');
            append[k] = $('#folder-'+parent);
         }
         append[k].html('<span class="last-child uk-text-center uk-text-small uk-margin-left">' + printLanguages({
            en: 'Loading...',
            nl: 'Laden...',
            de: 'Wird geladen...'
         }) + '</span>');
      });

      var url = '/services/' + (pages[tab].name == 'portfolio' ? 'my' + pages[tab].name : pages[tab].name) + 'mobile.asmx/Load' + pages[tab].name.charAt(0).toUpperCase() + pages[tab].name.slice(1) + 'Content';

      var timeout = 1;
      if (!i) {
         setTimeout(function () {
            if (timeout) {
               eloTimeout();
            }
         }, 3000);
      }

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
            timeout = 0;

            append.forEach(function(a){
               a.children('.last-child').html(printLanguages({
                  en: 'No results found...',
                  nl: 'Geen resultaten gevonden...',
                  de: 'Keine Ergebnisse gefunden ...'
               }));
            });
            data[pages[tab].name.toUpperCase() + '_CONTENT'].forEach(function(item) {
               if (item.hasOwnProperty('IS_SCO') && item.IS_SCO == 1) {
                  item.URL = 'https://elo.windesheim.nl/Pages/StudyRouteSCOPlayer/StudyRouteSCOPlayer.aspx?FK_ID=' + item.STUDYROUTE_ITEM_ID;
               }
               var properties = prepareItemType(item.URL, item.ITEMTYPE);
               var link = (item.hasOwnProperty('URL') && properties.display == 'link');
               var html = (link ? '<a href="' + encodeURI(item.URL) + '" target="_blank" rel="noopener" ' : '<li data-display="' + properties.display + '"' + (item.hasOwnProperty('URL') ? 'data-url="' + encodeURI(item.URL) + '" ' : '')) + 'data-id="'+item.ID+'" data-name="'+item.NAME+'" data-type="' + item.ITEMTYPE + '" ' + (item.hasOwnProperty('STUDYROUTE_RESOURCE_ID') ? 'data-resource="' + item.STUDYROUTE_RESOURCE_ID + '" ' : '') + ' data-mdc-auto-init="MDCRipple" class="mdc-list-item uk-margin-remove-top ' + (hidenav && item.hasOwnProperty('HIDE_IN_NAVIGATION') && item.HIDE_IN_NAVIGATION ? 'folder-hidenav' : '') + '">' + (properties.display == 'folder' ? '<i class="material-icons mdc-list-item__graphic folder-icon-arrow">arrow_right</i><i class="material-icons mdc-list-item__graphic folder-icon-margin uk-margin-remove-left uk-position-relative"' : '<i class="material-icons mdc-list-item__graphic folder-icon-margin uk-position-relative"') + (properties.color && !properties.label ? ' style="color:' + properties.color + '"' : '') + '>' + properties.icon + (properties.color && properties.label ? '<span class="folder-icon-badge" style="background-color:' + properties.color + '">' + properties.label + '</span>' : '') + '</i><span class="folder-text-padding">' + item.NAME + '</span>' + (link ? '<i class="mdc-list-item__meta material-icons">launch</i></a>' : '</li>');

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

            if (i) {
               i++;
               readFolderURL(npath, i);
            } else {

            }
         },
         error: function () {
            timeout = 0;

            append.forEach(function(a){
               a.children('.last-child').html(printLanguages({
                  en: 'No results found...',
                  nl: 'Geen resultaten gevonden...',
                  de: 'Keine Ergebnisse gefunden ...'
               }));
            });
            if (!i) {
               eloError();
            }
         }
      });
   }

   function setFolderItem(t, e = null) {
      var $this    = $(t);
      var display  = $this.data('display');

      if (display) {
         var nav      = $('#nav-folder-list');
         var course   = nav.data('name');
         var courseID = nav.data('id');
         var   itemID = $this.data('id');
         var $thisnav = $('#nav-folder-list li[data-id="'+itemID+'"]');
         var title    = $this.data('name') || pages[tab].title;
         var npath    = preparePath(false);
         var cpath;
         if (path) {
            cpath = path[path.length - 1];
         } else {
            cpath = preparePath();
            cpath = cpath[cpath.length - 1];
         }

         if (display == 'folder') {
            var $target  =  e === null ? null : $(e.target);
            var $next    = $thisnav.next();

            if ($target !== null && $target.is('.folder-icon-arrow')) {
               if ($next.is('#folder-'+itemID)) {
                  if ($this.is('.folder-expanded')) {
                     $next.slideUp(250);
                     $this.removeClass('folder-expanded');
                  } else {
                     $next.slideDown(250);
                     $this.addClass('folder-expanded');
                  }
               } else {
                  setFolder($this, courseID, itemID);
                  $this.addClass('folder-expanded');
               }
            } else {
               var sublist = $('#container-folder > ul');
               var update = [sublist];
               if (!$next.is('#folder-'+itemID) && itemID != -1) {
                  update.push($thisnav);
               } else if (!$next.is(':visible')) {
                  $next.slideDown(250);
               }
               setPage({nav: 'folder', container: 'folder'}, title, true);
               setFolder(update, courseID, itemID);

               if (e && ((cpath != itemID && itemID != -1) || (cpath != courseID && itemID == -1))) {
                  npath = npath[1].split('-');
                  npath.pop();
                  history.pushState({ title: title }, title, '#' + pages[tab].name + '/' + npath.join('-') + '-' + courseID + (itemID == -1 ? '' : '/' + prepareItemPath($thisnav)));
                  path = preparePath();
               }

               $('#nav-folder-list li.mdc-list-item').removeClass('mdc-list-item--activated');
               $thisnav.addClass('mdc-list-item--activated folder-expanded');

               if (itemID != -1) {
                  var iType = itemTypes.find(function(i){
                     return i.display == 'folder';
                  });
                  sublist.prepend('<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" data-id="' + $thisnav.parent().prev().data('id') + '" data-type="' + iType.id[pages[tab].name] + '" data-display="folder"><i class="material-icons mdc-list-item__graphic" aria-hidden="true">arrow_back</i><span class="folder-text-padding">' + printLanguages({
                     en: 'Parent folder',
                     nl: 'Map omhoog',
                     de: '&Uuml;bergeordneter Ordner'
                  }) + '</span></li><hr class="mdc-list-divider">');
               }

               setPage({fab: pages[tab].name == 'portfolio' && itemID == -1 ? false : 'save_alt'});
            }
         } else {
            $('#nav-folder-list li.mdc-list-item').removeClass('mdc-list-item--activated');
            $thisnav.addClass('mdc-list-item--activated folder-expanded');

            if (e && ((cpath != itemID && itemID != -1) || (cpath != courseID && itemID == -1))) {
               npath = npath[1].split('-');
               npath.pop();
               history.pushState({ title: title }, title, '#' + pages[tab].name + '/' + npath.join('-') + '-' + courseID + (itemID == -1 ? '' : '/' + prepareItemPath($thisnav)));
               path = preparePath();
            }

            if (display == 'include') {
               var url = $this.data('url');
               $('#container-include').load(url, function(response, status){
                  var container = $('#container-include');
                  if ((container.children('p:only-child').length == 1 || container.children('title + p:last-child').length == 1) && container.children('p').children('iframe:only-child').length == 1) {
                     setIframe(container.find('iframe').attr('src'));
                     container.html('');
                     setPage({nav: 'folder', container: 'iframe'}, title, true);
                  } else {
                     setPage({nav: 'folder', container: 'include'}, title, true);
                  }
               });
            } else if (display == 'iframe') {
               setIframe($this.data('url'));
               setPage({nav: 'folder', container: 'iframe'}, title, true);
            } else if (display == 'image') {
               $('#container-include').html('<div class="uk-flex"><img src="' + $this.data('url') + '" alt="' + title + '" class="uk-margin-auto"></div>');
               setPage({nav: 'folder', container: 'include'}, title, true);
            } else if (display == 'handin') {
               prepareHandin($this.data('resource'));
               setPage({nav: 'folder', container: 'handin', backgroundColor: '#f8f8f8'}, title, true);
            }
         }
      } else {
         var msg, actionText;
         switch (lang) {
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
               window.location.href = 'https://github.com/Bloemendaal/Windesheim-ELO/issues/new?title='+encodeURIComponent('[BUG] Unknown display')+'&body='+encodeURIComponent('Page: ' + pages[tab].name + "\n" + 'itemID: ' + $this.data('id') + "\n" + 'itemName: ' + title + "\n" + 'itemType: ' + $this.data('type') + "\n" + 'Version: ' + version + "\n\n" + '[Your description of what this item should be, e.g. docx file opened as link or pdf file opened as iframe]');
            },
            actionText: actionText,
            multiline: true,
            actionOnBottom: true
         });
      }
   }

   function setIframe(src = 'about:blank') {
      var iframe = $('#container-iframe > iframe');
      iframe.remove();
      iframe.attr('src', src);
      $('#container-iframe').append(iframe);
   }

   function prepareFolder(page, id, title, syllabus = null) {
      var append = $('#nav-folder-list, #container-folder > ul');
      append.data('id', id);
      setPage(page, title, true);

      history.pushState({
         title: title
      }, title, '#' + pages[tab].name + '/' + encodeURIComponent(title) + '-' + id);
      path = preparePath();

      setFolder(append, id);

      $('#nav-folder-list').prepend((syllabus ? prepareSyllabus(syllabus) : '') + '<li class="mdc-list-item mdc-list-item--activated" data-mdc-auto-init="MDCRipple" data-id="-1" data-name="' + title + '" data-type="0" data-display="folder"><i class="material-icons mdc-list-item__graphic">folder_special</i><span class="folder-text-padding">' + title + '</span></li><hr class="mdc-list-divider">');
   }

   function prepareSyllabus(url) {
      var properties = prepareItemType(url, 10, 'studyroute');
      var syllabusLang = {
         en: 'Syllabus',
         nl: 'Studiewijzer',
         de: 'Lernf&uuml;hrer'
      };
      return (properties.display == 'link' ? '<a href="' + url + '" target="_blank" rel="noopener"': '<li data-url="' + url + '"') + ' data-id="syllabus" data-name="' + syllabusLang[lang] + '" data-display="' + properties.display + '" data-mdc-auto-init="MDCRipple" class="mdc-list-item"><i class="material-icons mdc-list-item__graphic">class</i><span class="folder-text-padding">' + printLanguages(syllabusLang) + '</span>' + (properties.display == 'link' ? '<i class="mdc-list-item__meta material-icons">launch</i></a>' : '</li>');
   }

   function prepareItemPath(t, id = null) {
      if (!id) {
         id = [t.data('id')];
      }
      var p = t.parent().prev();
      var pid = p.data('id');

      if (pid == -1) {
         return id.reverse().join('/');
      } else {
         id.push(pid);
         return prepareItemPath(p, id);
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
            sbtn.find('button').prop('disabled', false).html(printLanguages({
               en: 'Submit',
               nl: 'Inleveren',
               de: 'Senden'
            }));

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

            var dProperties;
            if (submit) {
               dProperties = prepareItemType(data.HANDIN_URL, data.HANDIN_TYPE, 'handin');

               progressBar.css('transform', 'scaleX(1)');
               sbtn.hide();
               doc.show();
               doc.children('div').html(prepareHandinHTML(data.HANDIN_URL, data.HANDIN_NAME, dProperties));
            } else if (data.hasOwnProperty('INITIAL_DOCUMENT_URL') && data.INITIAL_DOCUMENT_STATUS == 1) {
               dProperties = prepareItemType(data.INITIAL_DOCUMENT_URL, data.INITIAL_DOCUMENT_TYPE, 'handin');
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

   function preparePath(toLower = true) {
      if (location.pathname == '/Start.aspx') {
         return (toLower ? location.hash.toLowerCase() : location.hash).substr(1).replace(/^\/+|\/+$/g, '').split('/');
      } else {
         return (toLower ? location.pathname.toLowerCase() : location.pathname).split('?')[0].replace(/^\/+|\/+$/g, '').split('/');
      }
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
               switch (lang) {
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
               eloSnackbar(msg, actionText);
            }
         }
      });
   }

   function readURL(e = false) {
      var npath = preparePath();
      var k = Object.keys(pages).find(function(k){
         return pages[k].name == npath[0];
      });

      if (typeof k !== 'undefined' && typeof pages[k].display == 'object' && pages[k].display.hasOwnProperty('container')) {
         if (tab === false) {
            if (location.protocol == 'https:') {
               initELO();
            } else {
               location.protocol = 'https:';
            }
         }

         var title;
         if (typeof e == 'object') {
            if (typeof e.state == 'object' && e.state && e.state.hasOwnProperty('title')) {
               title = e.state.title;
            } else {
               title = e.title;
            }
         } else if (typeof e == 'string') {
            title = e;
         } else {
            title = pages[k].title;
         }
         setPage(k, title, true);

         var splitnC = preparePath(false);
         if (pages[k].display.container == 'folder') {
            splitnC = splitnC[1].split('-');
            var splitpC = (path && path[1]) ? path[1].split('-') : '';
            if (path && npath[0] == path[0] && decodeURI(splitnC[splitnC.length - 1]) == decodeURI(splitpC[splitpC.length - 1])) {
               if (npath[2] && $('#nav-folder-list li[data-id="'+npath[2]+'"]').length) {
                  readFolderURL(npath, 2);
               } else {
                  var $this = $('#nav-folder-list li[data-id="-1"]');
                  setFolderItem($this);
               }
            } else {
               var append = $('#nav-folder-list, #container-folder > ul');
               var id = decodeURI(splitnC[splitnC.length - 1]);
               append.data('id', id);
               setFolder(append, 1, -1, npath);
               splitnC.pop();
               $('#nav-folder-list').prepend('<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" data-id="-1" data-name="' + decodeURI(splitnC.join('-')) + '" data-type="0" data-display="folder"><i class="material-icons mdc-list-item__graphic" aria-hidden="true">folder_special</i><span class="folder-text-padding">' + decodeURI(splitnC.join('-')) + '</span></li><hr class="mdc-list-divider">');

               var name = pages[tab].name;
               if (name == 'studyroute' || name == 'portfolio') {
                  $.ajax({
                     url:  '/services/' + (name == 'studyroute' ? 'Studyroutemobile.asmx/LoadStudyroutes' : 'MyPortfolioMobile.asmx/LoadPortfolios'),
                     type: 'GET',
                     data: {
                        start: 0,
                        length: 300,
                        userId: -1,
                        filter: 0,
                        search: ''
                     },
                     success: function(data) {
                        var cs = data[name.toUpperCase() + 'S'].find(function(r) {
                           return r.ID == id;
                        });

                        $('#nav-folder-list > li:first-child').data('name', cs.NAME).children('.folder-text-padding').text(cs.NAME);
                        if (cs.PREFACEPAGE_URL) {
                           $('#nav-folder-list').prepend(prepareSyllabus(encodeURI(cs.PREFACEPAGE_URL)));
                        }

                        if (npath.length == 2) {
                           $('#title').text(cs.NAME);
                        } else if (npath[2] == 'syllabus') {
                           readURL();
                        }

                        mdc.autoInit(document.getElementById('nav-folder-list'), () => {});
                     }
                  });
               }

            }
         } else if (pages[k].name == 'notification') {
            $('#nav-menu-list > li').removeClass('mdc-list-item--activated');
            setPage(k, decodeURIComponent(splitnC[1]), true);
            setIframe(decodeURIComponent(splitnC[2]));
         } else if (pages[k].display.nav == 'menu') {
            $('#nav-menu-list > li').removeClass('mdc-list-item--activated');
            $('#nav-menu-list > li[data-id="' + k + '"]').addClass('mdc-list-item--activated');
         }
      } else if (['security', 'cms', 'services'].indexOf(npath[0]) < 0) {
         location.replace('/Security/SAML2/Login.aspx?redirectUrl=' + encodeURIComponent(location.origin + '/Start.aspx#' + pages[0].name));
      }

      path = npath;
   }

   function readFolderURL(npath, i) {
      var $this;
      if (i < npath.length) {
         $this = $('#nav-folder-list li[data-id="'+npath[i]+'"]');
         if ($this.length) {
            i++;
            $this.addClass('folder-expanded');
            readFolderURL(npath, i);
         } else {
            setFolder($('#nav-folder-list li[data-id="'+npath[i - 1]+'"]'), i, npath[i - 1], npath);
         }
      } else {
         $this = $('#nav-folder-list li[data-id="' + (npath.length == 2 ? '-1' : npath[npath.length - 1]) + '"]');
         $('#nav-folder-list li.mdc-list-item').removeClass('mdc-list-item--activated');
         $this.addClass('mdc-list-item--activated');
         setFolderItem($this);
         return;
      }
   }

   function initELO() {
      document.write('<!DOCTYPE html><html><head><title>Windesheim ELO</title><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"><meta name="author" content="Casper Bloemendaal"><meta name="theme-color" content="#406790"><meta name="msapplication-navbutton-color" content="#406790"><meta name="apple-mobile-web-app-status-bar-style" content="#406790"></head><body><aside id="drawer" class="mdc-drawer mdc-drawer--modal mdc-drawer--prepare"><div class="mdc-drawer__header"><h3 class="mdc-drawer__title uk-text-truncate"></h3><h6 class="mdc-drawer__subtitle uk-text-truncate"></h6></div><div id="nav" class="mdc-drawer__content uk-scrollbar"><ul id="nav-focus" class="mdc-list"><li class="mdc-list-item" tabindex="0"></li></ul><div id="nav-menu"><ul id="nav-menu-list" class="mdc-list"></ul></div><div id="nav-folder"><ul class="mdc-list" data-id="-1"><li id="nav-folder-back" class="mdc-list-item" data-mdc-auto-init="MDCRipple"> <i class="material-icons mdc-list-item__graphic" aria-hidden="true">arrow_back</i> <span class="lang-en">Back</span> <span class="lang-nl">Terug</span> <span class="lang-de">Zur&uuml;ck</span></li></ul><ul id="nav-folder-list" class="mdc-list uk-padding-remove-top"></ul></div></div> </aside><div class="mdc-drawer-scrim"></div><div class="mdc-drawer-app-content"> <header id="top-app-bar" class="mdc-top-app-bar mdc-top-app-bar--fixed"><div class="mdc-top-app-bar__row top-app-bar__main"> <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start"> <span class="material-icons mdc-top-app-bar__navigation-icon">menu</span> <span id="title" class="mdc-top-app-bar__title"></span> </section> <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar"> <span id="search-button" uk-toggle="target: #top-app-bar .top-app-bar__search, #top-app-bar .top-app-bar__main; animation: uk-animation-fade" class="material-icons mdc-top-app-bar__action-item" aria-label="Zoeken" alt="Zoeken">search</span> <span id="top-app-bar__more" class="material-icons mdc-top-app-bar__action-item mdc-menu-surface--anchor" aria-label="Meer..." alt="Meer..."> <span>notifications_none</span><div id="top-app-bar__menu" class="mdc-menu mdc-menu-surface"><ul class="mdc-list mdc-list--two-line"></ul></div> </span> </section></div><div class="mdc-top-app-bar__row top-app-bar__search" hidden> <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start"> <span id="search-back" uk-toggle="target: #top-app-bar .top-app-bar__search, #top-app-bar .top-app-bar__main; animation: uk-animation-fade" class="material-icons mdc-top-app-bar__navigation-icon">arrow_back</span><div class="uk-search uk-search-navbar uk-width-1-1 uk-light"> <input id="search" class="uk-search-input mdc-top-app-bar__title" type="search" placeholder="Zoeken..." autofocus></div> </section></div> </header><div id="content" class="uk-container uk-container-expand"><div class="mdc-top-app-bar--fixed-adjust"></div><div id="container"><div id="container-iframe"> <iframe src="" width="100%" height="100%"></iframe></div><div id="container-handin"><div id="handin-progress" role="progressbar" class="mdc-linear-progress"><div class="mdc-linear-progress__buffering-dots"></div><div class="mdc-linear-progress__buffer"></div><div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar"> <span class="mdc-linear-progress__bar-inner"></span></div><div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar"> <span class="mdc-linear-progress__bar-inner"></span></div></div><div id="handin-upload" class="uk-flex uk-flex-column"><div class="handin-load uk-padding uk-scrollbar"></div><div class="uk-text-center uk-padding"> <i class="material-icons uk-text-middle uk-margin-small-right">cloud_upload</i> <span class="uk-text-middle"> <span class="lang-en">Attach binaries by dropping them here or</span> <span class="lang-nl">Upload bestanden door ze hierheen te slepen of</span> <span class="lang-de">Laden Sie Dateien hoch, indem Sie sie hierher ziehen oder</span> </span><div uk-form-custom> <input type="file" multiple> <span class="uk-link"> <span class="lang-en">selecting one</span> <span class="lang-nl">te selecteren</span> <span class="lang-de">ausw&auml;hlen</span> </span></div></div><div class="uk-padding uk-padding-remove-top"><ul class="mdc-list uk-padding-remove"><li class="handin-review mdc-list-group"><h6 class="mdc-list-group__subheader"> <span class="lang-en">Review</span> <span class="lang-nl">Beoordeling</span> <span class="lang-de">Rezension</span></h6><div></div></li><li class="handin-start mdc-list-group"><h6 class="mdc-list-group__subheader"> <span class="lang-en">Provided document</span> <span class="lang-nl">Meegeleverd document</span> <span class="lang-de">Bereitgestelltes Dokument</span></h6><div></div></li><li class="handin-document mdc-list-group"><h6 class="mdc-list-group__subheader"> <span class="lang-en">Uploaded document</span> <span class="lang-nl">Geüpload document</span> <span class="lang-de">Hochgeladenes Dokument</span></h6><div></div></li></ul></div><div id="handin-submit" class="uk-padding uk-padding-remove-top"><div class="uk-grid"><div class="uk-width-expand"> <small class="uk-text-meta uk-text-middle" style="padding-left: 16px"> <span class="lang-en">Note that pressing submit cannot be undone.</span> <span class="lang-nl">Op inleveren klikken kan niet ongedaan gemaakt worden.</span> <span class="lang-de">Beachten Sie, dass das Dr&uuml;cken von "Senden" nicht r&uuml;ckg&auml;ngig gemacht werden kann.</span> </small></div><div class="uk-width-auto"> <button class="mdc-button mdc-button--raised" data-mdc-auto-init="MDCRipple"></button></div></div></div></div><div id="handin-review" class="uk-flex uk-flex-column"><div class="handin-load uk-padding uk-scrollbar"></div><div class="uk-padding"><ul class="mdc-list uk-padding-remove"><li class="handin-review mdc-list-group"><h6 class="mdc-list-group__subheader"> <span class="lang-en">Review</span> <span class="lang-nl">Beoordeling</span> <span class="lang-de">Rezension</span></h6><div></div></li><li class="handin-start mdc-list-group"><h6 class="mdc-list-group__subheader"> <span class="lang-en">Provided document</span> <span class="lang-nl">Meegeleverd document</span> <span class="lang-de">Bereitgestelltes Dokument</span></h6><div></div></li><li class="handin-document mdc-list-group"><h6 class="mdc-list-group__subheader"> <span class="lang-en">Submitted document</span> <span class="lang-nl">Ingezonden document</span> <span class="lang-de">&Uuml;bermitteltes Dokument</span></h6><div></div></li></ul></div></div></div><div id="container-include"></div><div id="container-list"><ul class="mdc-list mdc-list--two-line uk-flex uk-flex-column" aria-orientation="vertical"></ul></div><div id="container-folder"><ul class="mdc-list"></ul></div></div> <button id="FAB" class="mdc-fab fab-hidden material-icons" aria-label="Favorite" data-mdc-auto-init="MDCRipple"> <span class="mdc-fab__icon"></span> </button></div></div><div class="mdc-snackbar" id="snackbar"><div class="mdc-snackbar__surface"><div class="mdc-snackbar__label" role="status" aria-live="polite"></div><div class="mdc-snackbar__actions"><button type="button" class="mdc-button mdc-snackbar__action"></button><button class="mdc-icon-button mdc-snackbar__dismiss material-icons" title="Dismiss">close</button></div></div></div></body></html>');
      document.close();

      window.onpopstate = readURL;

      $.ajax({
         url: '/services/Mobile.asmx/LoadUserSchoolConfig',
         type: 'GET',
         success: function(data){
            if (data.ACTIVESESSION) {
               $('#drawer > .mdc-drawer__header > .mdc-drawer__title'  ).text(data.USERNAME);
               $('#drawer > .mdc-drawer__header > .mdc-drawer__subtitle').text(data.LOGINID);
               lang = Object.keys(languages).find(function(k){
                  return languages[k].key == data.NOMENCLATURE;
               });
               $('html').attr('lang', lang || '').toggleClass('darktheme', !!+localStorage.getItem("darkTheme"));

               if (pages[tab].name == 'settings') {
                  pages[tab].functions.onload();
               }
            } else {
               window.location.replace('/Security/SAML2/Login.aspx?redirectUrl=' + encodeURIComponent(location.href));
            }
         },
         error: function () {
            window.location.replace('/Security/SAML2/Login.aspx?redirectUrl=' + encodeURIComponent(location.href));
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
               menu.append('<li class="mdc-list-item" data-id="'+k+'" data-mdc-auto-init="MDCRipple" tabindex="0" aria-selected="true" aria-expanded="true"><i class="material-icons mdc-list-item__graphic" aria-hidden="true">'+pages[k].icon+'</i>'+printLanguages(pages[k].title)+'</li>');
            }
         }
      });

      // Navigatiebalk functies
      $('#nav-menu-list').on('click', 'li.mdc-list-item', function(){
         var $this = $(this);
         $('#nav-menu-list > li').removeClass('mdc-list-item--activated');
         $this.addClass('mdc-list-item--activated');

         var id = $this.data('id');
         var ignoreState = (id == Object.keys(pages).find(function(k) {
            return path[0] == pages[k].name;
         }));
         setPage(id, ignoreState);
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
                  switch (lang) {
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
                        window.location.href = 'https://github.com/Bloemendaal/Windesheim-ELO/issues/new?title='+encodeURIComponent('[BUG] Handin DeleteWorkingDocument error')+'&body='+encodeURIComponent('Page: ' + pages[tab].name + "\n" + 'cpId: ' + id + "\n" + 'assignmentId: ' + assignment + "\n" + 'Version: ' + version + 'xhrData: ' + JSON.stringify(data, null, 2) + "\n" + "\n\n" + '[Your description of the steps you took to encounter this problem. Try to reproduce the proces, possibly provide a screenshot.]');
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
         var title = $this.data('name');
         var url   = $this.data('url');

         setPage(6, title, true);
         history.pushState({ title: title }, title, '#' + pages[tab].name + '/' + encodeURIComponent(title) + '/' + encodeURIComponent(url));
         setIframe(url);
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
      snackbar.show = function (t) {
			if (!t) {
				throw new Error("Please provide a data object with at least a message to display.");
			}
			if (!t.message) {
				throw new Error("Please provide a message to be displayed.");
			}
			if (t.actionHandler && !t.actionText) {
				throw new Error("Please provide action text with the handler.");
			}

			this.labelText = t.message;

			var b = this.surfaceEl_.lastElementChild.firstElementChild;
			if (t.actionHandler && t.actionText) {
				b.removeEventListener('click', this.handleActionButtonClick);
				this.handleActionButtonClick = t.actionHandler;
				b.addEventListener('click', this.handleActionButtonClick);
				this.actionButtonText = t.actionText;
				b.removeAttribute('hidden');
			} else {
				b.setAttribute('hidden', '');
			}

			this.timeoutMs = t.timeout ? t.timeout : 5000;

			this.root_.classList.toggle('mdc-snackbar--stacked', !!(snackbar.multiline || snackbar.actionOnBottom));

			this.surfaceEl_.lastElementChild.lastElementChild.toggleAttribute('hidden', t.hasOwnProperty('dismiss') ? !t.dismiss : false);

			this.open();
		}

      snackbar.listen('MDCSnackbar:opening', function () {
         $('.mdc-fab').css('transform', 'translateY(-' + $('#snackbar').outerHeight(true) + 'px)');
      });
      snackbar.listen('MDCSnackbar:closing', function () {
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
   }

   readURL();
})();
