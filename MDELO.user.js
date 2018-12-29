// ==UserScript==
// @name          Material Design ELO
// @namespace     https://github.com/Bloemendaal
// @description   Make the ELO great (again)!
// @author        Casper Bloemendaal
// @license       MIT

// @downloadURL   https://raw.githubusercontent.com/Bloemendaal/Windesheim-ELO/master/MDELO.user.js
// @updateURL     https://raw.githubusercontent.com/Bloemendaal/Windesheim-ELO/master/MDELO.user.js
// @supportURL    https://github.com/Bloemendaal/Windesheim-ELO/issues
// @version       0.1

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

   var favoriteCourses = 0;
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
            var list = $('#courses-list');
            list.html('<span class="only-child uk-text-center">Geen resultaten gevonden...</span>');

            data.STUDYROUTES.forEach(function(c) {
               list.append('<li class="mdc-list-item uk-width-1-1" data-id="'+c.ID+'" data-name="'+c.NAME+'" data-mdc-auto-init="MDCRipple"><div class="uk-margin-right"><div class="uk-inline uk-cover-container uk-border-circle mdc-list-item__image"><img src="'+c.IMAGEURL_24+'" alt="'+c.NAME+'" uk-cover></div></div><span>'+c.NAME+'</span><i class="mdc-icon-toggle mdc-theme--text-icon-on-background material-icons uk-margin-auto-left" role="button">'+(c.IS_FAVORITE ? 'star' : 'star_border')+'</i></li>');
            });

            mdc.autoInit(document.getElementById('courses-list'), () => {});
         }
      });
   }

   function switchSubswitcher(index = 0) {
      $('.sub-switcher').each(function(){
         $(this).children().removeClass('uk-active');
         $(this).children(':nth-child('+(index+1)+')').addClass('uk-active');
      });
   }

   var itemTypes = ['folder', 'ondemand_video', '', 'link', 'ondemand_video', '', '', '', '', 'archive', 'description'];

   $(function(){
      $('#tns').hide();
      $('head script, head style').remove();
      $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-rc.25/css/uikit.min.css" integrity="sha256-P3mc1WE09pSm1iAHPFelzUieKI78yRxZ7dGYjXuqIVw=" crossorigin="anonymous"><link rel="stylesheet" href="//fonts.googleapis.com/icon?family=Material+Icons"><link rel="stylesheet" href="//unpkg.com/material-components-web@latest/dist/material-components-web.min.css"><style>:root{--mdc-theme-primary:#406790}#drawer .mdc-list-item{min-height:40px;height:auto;line-height:normal}.mdc-drawer .mdc-list-item--activated,.mdc-drawer .mdc-list-item--activated .mdc-list-item__graphic{color:#406790;color:var(--mdc-theme-primary,#406790)}.mdc-text-field--focused:not(.mdc-text-field--disabled) .mdc-floating-label{color:#000}.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-floating-label{color:#b00020}.material-icons,body{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}a.material-icons{text-decoration-line:none}.mdc-switch+label{margin-left:10px}#container{-webkit-touch-callout:text;-webkit-user-select:text;-khtml-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;min-height:calc(100vh - 40px);padding-bottom:40px}#container.uk-container-expand{padding:0 0 40px}#top-app-bar input{font-size:1.25rem;color:#fff;color:var(--mdc-theme-on-primary,#fff)}#snackbar{z-index:1500}.mdc-drawer--modal.mdc-drawer--open{display:flex}@media (min-width:600px){.mdc-fab:not(.fab-hidden){transform:translateY(0)!important}}@media (min-width:640px){#container.uk-container-expand{padding:0 32px 40px}}@media (min-width:960px){.mdc-drawer-scrim{display:none!important}.mdc-drawer--modal{box-shadow:none}.mdc-drawer--prepare{display:flex}.mdc-drawer--open+.mdc-drawer-scrim+.mdc-drawer-app-content,.mdc-drawer--prepare+.mdc-drawer-scrim+.mdc-drawer-app-content{margin-left:256px;margin-right:0}.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-scrim+.mdc-drawer-app-content>.mdc-top-app-bar,.mdc-drawer--prepare+.mdc-drawer-scrim+.mdc-drawer-app-content>.mdc-top-app-bar{width:calc(100% - 256px)}.mdc-drawer-app-content{transition:margin-left .25s cubic-bezier(.4,0,.2,1)}.mdc-top-app-bar{transition:width .25s cubic-bezier(.4,0,.2,1)}.mdc-drawer--open.mdc-drawer--closing+.mdc-drawer-scrim+.mdc-drawer-app-content{margin-left:0;transition:margin-left .2s cubic-bezier(.4,0,.2,1)}.mdc-drawer--open.mdc-drawer--closing+.mdc-drawer-scrim+.mdc-drawer-app-content>.mdc-top-app-bar{transition:width .2s cubic-bezier(.4,0,.2,1)}}.mdc-drawer__drawer::-webkit-scrollbar,.uk-scrollbar::-webkit-scrollbar{background-color:transparent;width:12px}.mdc-drawer__drawer::-webkit-scrollbar-thumb,.uk-scrollbar::-webkit-scrollbar-thumb{background-clip:padding-box;border-radius:3px;-webkit-border-radius:3px;border:4px solid transparent;background-color:rgba(0,0,0,.2)}ul.mdc-list:not(.mdc-list--non-interactive)>*{cursor:pointer}.uk-cover-container{width:48px;height:48px}.only-child{display:none}.only-child:only-child{display:initial}.mdc-fab{position:fixed;bottom:1rem;right:1rem;animation-duration:.25s;animation-duration:250ms;transition-duration:.25s;transition-duration:250ms}.fab-hidden{opacity:0;transform:translateY(48px)}.fab-container>*{animation:none}@media(min-width:1024px){.mdc-fab{bottom:1.5rem;right:1.5rem}}</style>');
      $('body').html('<div id="snackbar" class="mdc-snackbar" aria-live="assertive" aria-atomic="true" aria-hidden="true"><div class="mdc-snackbar__text"></div><div class="mdc-snackbar__action-wrapper"><button type="button" class="mdc-snackbar__action-button"></button></div></div><aside id="drawer" class="mdc-drawer mdc-drawer--modal mdc-drawer--prepare"> <div class="mdc-drawer__header"><h3 class="mdc-drawer__title uk-text-truncate"></h3><h6 class="mdc-drawer__subtitle uk-text-truncate"></h6></div> <div class="mdc-drawer__content uk-scrollbar"><ul class="uk-switcher sub-switcher"><li class="uk-active"><ul id="main-switcher" class="mdc-list" uk-switcher="connect: .main-switcher; animation: uk-animation-slide-top-small"> <li class="mdc-list-item mdc-list-item--activated" data-mdc-auto-init="MDCRipple"> <i class="material-icons mdc-list-item__graphic" aria-hidden="true">book</i>Studieroutes </li> <li class="mdc-list-item" data-mdc-auto-init="MDCRipple"> <i class="material-icons mdc-list-item__graphic" aria-hidden="true">folder_shared</i>Portfolio </li> <li class="mdc-list-item" data-mdc-auto-init="MDCRipple"> <i class="material-icons mdc-list-item__graphic" aria-hidden="true">extension</i>Project </li> <li class="mdc-list-item" data-mdc-auto-init="MDCRipple"> <i class="material-icons mdc-list-item__graphic" aria-hidden="true">timeline</i>Voortgang </li> <li class="mdc-list-item"  data-mdc-auto-init="MDCRipple"> <i class="material-icons mdc-list-item__graphic" aria-hidden="true">chat</i>Forums </li> <li class="mdc-list-item" data-mdc-auto-init="MDCRipple"> <i class="material-icons mdc-list-item__graphic" aria-hidden="true">people</i>Online </li> <li class="mdc-list-item" data-mdc-auto-init="MDCRipple"> <i class="material-icons mdc-list-item__graphic" aria-hidden="true">dashboard</i>Dashboard </li></ul></li><li>  <ul class="mdc-list"> <li id="courses-back" class="mdc-list-item" data-mdc-auto-init="MDCRipple" uk-switcher-item="0"> <i class="material-icons mdc-list-item__graphic" aria-hidden="true">book</i>Studieroutes </li> <li id="courses-top" class="mdc-list-item" data-mdc-auto-init="MDCRipple" style="display:none"> <i class="material-icons mdc-list-item__graphic" aria-hidden="true">home</i>Hoofdfolder </li> <hr class="mdc-list-divider"></ul> <ul id="courses-nav" class="mdc-list uk-padding-remove-top"></ul>   </li></ul></div></aside><div class="mdc-drawer-scrim"></div><div class="mdc-drawer-app-content"> <header id="top-app-bar" class="mdc-top-app-bar mdc-top-app-bar--fixed"> <div class="mdc-top-app-bar__row top-app-bar__main"> <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start"> <span class="material-icons mdc-top-app-bar__navigation-icon">menu</span> <span class="mdc-top-app-bar__title"><ul class="main-switcher uk-switcher"> <li>Studieroutes</li> <li>Portfolio</li> <li>Project</li> <li>Voortgang</li> <li>Forums</li> <li>Online</li> <li>Dashboard</li> </ul></span> </section> <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar"> <span class="material-icons mdc-top-app-bar__action-item uk-visible@s" aria-label="Notificaties" alt="Notificaties">notifications_none</span> <span uk-toggle="target: #top-app-bar .top-app-bar__search, #top-app-bar .top-app-bar__main; animation: uk-animation-fade" class="material-icons mdc-top-app-bar__action-item" aria-label="Zoeken" alt="Zoeken">search</span> <span id="top-app-bar__more" class="material-icons mdc-top-app-bar__action-item mdc-menu-surface--anchor" aria-label="Meer..." alt="Meer...">more_vert <div id="top-app-bar__menu" class="mdc-menu mdc-menu-surface"> <ul class="mdc-menu__items mdc-list" role="menu" aria-hidden="true"> <li class="mdc-list-item" role="menuitem" tabindex="0"> Downloaden </li><li class="mdc-list-item" role="menuitem" tabindex="0"> Printen </li></ul> </div></span> </section> </div><div class="mdc-top-app-bar__row top-app-bar__search" hidden> <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start"> <span id="search-back" uk-toggle="target: #top-app-bar .top-app-bar__search, #top-app-bar .top-app-bar__main; animation: uk-animation-fade" class="material-icons mdc-top-app-bar__navigation-icon">arrow_back</span> <div class="uk-search uk-search-navbar uk-width-1-1 uk-light"> <input id="search" class="uk-search-input mdc-top-app-bar__title" type="search" placeholder="Zoeken..." autofocus> </div> </section> </div></header> <div id="container" class="uk-container"> <div class="mdc-top-app-bar--fixed-adjust"></div> <ul class="main-switcher uk-switcher"> <li id="switcher-courses"> <ul class="uk-switcher sub-switcher"><li class="uk-active"><ul id="courses-list" class="mdc-list mdc-list--two-line uk-flex uk-flex-column" aria-orientation="vertical"></ul></li><li> <ul id="courses-sublist" class="mdc-list"></ul> </li></ul> </li> <li id="switcher-portfolio"> </li> <li id="switcher-project"> </li> <li id="switcher-progress"> </li> <li id="switcher-forums"> </li> <li id="switcher-online"> </li> <li id="switcher-dashboard"> </li> </ul> <ul class="main-switcher uk-switcher fab-container"> <li><button id="courses-FAB" class="mdc-fab material-icons" aria-label="Favorite" data-mdc-auto-init="MDCRipple"><span class="mdc-fab__icon">star_half</span></button></li> <li><button id="portfolio-FAB" class="mdc-fab material-icons" aria-label="Favorite" data-mdc-auto-init="MDCRipple"><span class="mdc-fab__icon">star_half</span></button></li> <li><button id="project-FAB" class="mdc-fab material-icons" aria-label="Favorite" data-mdc-auto-init="MDCRipple"><span class="mdc-fab__icon">star_half</span></button></li> <li><button id="progress-FAB" class="mdc-fab material-icons" aria-label="Favorite" data-mdc-auto-init="MDCRipple"><span class="mdc-fab__icon">star_half</span></button></li> <li><button id="forums-FAB" class="mdc-fab material-icons" aria-label="Favorite" data-mdc-auto-init="MDCRipple"><span class="mdc-fab__icon">star_half</span></button></li> <li><button id="online-FAB" class="mdc-fab material-icons" aria-label="Favorite" data-mdc-auto-init="MDCRipple"><span class="mdc-fab__icon">star_half</span></button></li> <li><button id="dashboard-FAB" class="mdc-fab material-icons" aria-label="Favorite" data-mdc-auto-init="MDCRipple"><span class="mdc-fab__icon">star_half</span></button></li> </ul></div></div>');

      setCourses();

      $.ajax({
         url: '/services/Mobile.asmx/LoadUserSchoolConfig',
         type: 'GET',
         success: function(data){
            $('#drawer > .mdc-drawer__header > .mdc-drawer__title'  ).text(data.USERNAME);
            $('#drawer > .mdc-drawer__header > .mdc-drawer__subtitle').text(data.LOGINID);
         }
      });

      $('#courses-list').on('click', 'li.mdc-list-item', function(e){
         var $this = $(this);
         var $id = $this.data('id');
         if (e.target.nodeName == 'I') {
            $.ajax({
               url:  '/Home/StudyRoute/StudyRoute/ToggleFavorite',
               type: 'POST',
               data: {
                  studyrouteId: $id
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
                     snackbar.show({
                        message: "Er is een fout opgetreden. Probeer het later opnieuw.",
                        actionHandler: function() {
                           location.reload();
                        },
                        actionText: "Herladen",
                        multiline: true,
                        actionOnBottom: true
                     });
                  }
               }
            })
         } else {
            var append1 = $('#courses-nav');
            var append2 = $('#courses-sublist');
            append1.html('<h6 class="mdc-list-group__subheader uk-text-truncate">'+$this.data('name')+'</h6>');
            append2.html('<span class="only-child uk-text-center">Geen resultaten gevonden...</span>');
            $.ajax({
               url:  '/services/Studyroutemobile.asmx/LoadStudyrouteContent',
               type: 'GET',
               data: {
                  studyrouteid: $id,
                  parentid: -1,
                  start: 0,
                  length: 100
               },
               success: function(data) {
                  data.STUDYROUTE_CONTENT.forEach(function(item) {
                     if (item.ITEMTYPE == 0) {
                        append1.append('<li class="mdc-list-item" data-mdc-auto-init="MDCRipple"><i class="material-icons mdc-list-item__graphic" aria-hidden="true">'+itemTypes[item.ITEMTYPE]+'</i>'+item.NAME+'</li>');
                     }
                     append2.append('<li class="mdc-list-item" data-mdc-auto-init="MDCRipple"><i class="material-icons mdc-list-item__graphic" aria-hidden="true">'+itemTypes[item.ITEMTYPE]+'</i>'+item.NAME+'</li>');
                  });

                  switchSubswitcher(1);
                  mdc.autoInit(document.getElementById('courses-nav'), () => {});
               }
            });
         }
      });

      // Search
      $('#search').on('input', function(){
         var $this  = $(this);
         var search = $this.val();
         if ($this.is(":visible")) {
            setCourses(search);
         }
      });

      $('#search-back').click(function(){
         setCourses();
      });

      $('#courses-FAB').click(function() {
         favoriteCourses = Math.abs(favoriteCourses + 1) * -1;
         setCourses($('#search').is(':visible') ? $('#search').val() : '');
      });

      $('#courses-back').click(function() {
         switchSubswitcher(0);
      });


      // Navigatie
      mdc.autoInit();

      var snackbar = new mdc.snackbar.MDCSnackbar(document.getElementById('snackbar'));
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
         var menu = new mdc.menuSurface.MDCMenuSurface(e_menu);

         e_more.addEventListener('click', function() {
            menu.open = !menu.open;
         });

         e_menu.addEventListener('MDCMenu:selected', function(evt) {
            var detail = evt.detail;
         });
      }
   });

})();
