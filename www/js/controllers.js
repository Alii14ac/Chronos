angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, $ionicPopup, Auth){
    $scope.data = {};
    $scope.login = function(){
       
        Auth.signInWithEmailAndPassword($scope.data.email,$scope.datapassword)
        .then(function(authData){
            console.log(authData);
            $state.go('tab.dash'); })
        .catch(function(error){
            console.log(error);
            var alertPopup = $ionicPopup.alert({
                title: "Login Failed!",
                template: "Please check your credentials!"                
            });    
        });         
    };    
})

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});


