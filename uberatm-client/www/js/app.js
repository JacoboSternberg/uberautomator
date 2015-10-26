// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
HERE_APP_ID = "evk3TrU4UcresAseG8Da";
HERE_APP_CODE = "z4yYohROherMZ57eHTsQUg";
UBER_APP_TOKEN = '3_hEHw2oOLy9jPtAYc-fBXqWMHXmP2WVChp1Kjpf'

app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.directives', 'ionic-timepicker', 'ionic.contrib.frost']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $urlRouterProvider.otherwise('/dash');
  $stateProvider
    .state('dash', {
      url: '/dash',
      templateUrl: 'templates/tab-dash.html',
      controller: 'DashCtrl'
    })
    .state('search', {
      url: '/search', 
      templateUrl: 'templates/search.html',
      controller: 'DashCtrl'
    });

  // if none of the above states are matched, use this as the fallback

});

app.controller('UnderCtrl', function($scope) {
  $scope.items = [];
  for(var i = 0; i < 30; i++) {
    $scope.items.push({text: 'Item ' + (i+1) });
  }
})

.controller('OverlayCtrl', function($scope) {
  $scope.items = [];
  for(var i = 0; i < 5; i++) {
    $scope.items.push({text: 'Option' + (i+1) });
  }
});
