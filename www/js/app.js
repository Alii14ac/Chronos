// Ionic chronos App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'chronos' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'chronos.services' is found in services.js
// 'chronos.controllers' is found in controllers.js
angular.module('chronos', [
	'ionic',
	'firebase',
  'ngAnimate',
	'chart.js',
	'jett.ionic.filter.bar',
  'chronos.controllers',
	'chronos.services'
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

	 .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SignupCtrl'
  })

  // Each tab has its own nav history stack:

  .state('tab.new', {
    url: '/new',
    views: {
      'tab-new': {
        templateUrl: 'templates/tab-new.html',
        controller: 'NewCtrl'
      }
    }
  })

  .state('tab.timers', {
      url: '/timers',
      views: {
        'tab-timers': {
          templateUrl: 'templates/tab-timers.html',
          controller: 'TimersCtrl'
        }
      }
    })
    .state('tab.add', {
      url:'/add',
      views:{
        'tab-timers':{
          templateUrl:'templates/tab-add.html',
          controller:'AddCtrl'
        }
      }
    })
    .state('tab.food-detail', {
      url: '/foods/:foodId',
      views: {
        'tab-timers': {
          templateUrl: 'templates/food-detail.html',
          controller: 'FoodDetailCtrl'
        }
      }
    })

  .state('tab.stat', {
    url: '/stat',
    views: {
      'tab-stat': {
        templateUrl: 'templates/tab-stat.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
