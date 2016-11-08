angular.module('chronos.controllers', [])

//LOGIN CONTROLLER
	.controller('LoginCtrl', function($scope, $state, $ionicPopup, Auth){
	$scope.data={};

	//AUTH login
	$scope.login=function(){
		Auth.signInWithEmailAndPassword($scope.data.email, $scope.data.password)
			.then(function(authData){
			console.log(authData);
			$state.go('tab.timers');
		}).catch(function(error) {
			console.log(error);
			varalertPopup=$ionicPopup.alert({
				title: 'Login failed!',
				template: 'Please check your credentials!'
			});
		});
	};

	//go to signup
	$scope.signup=function(){
		$state.go('signup');
	}

	$scope.test = function(){
		console.log("test function reached!")
	};

})
//LOGIN END

//SIGNUP CONTROLLER
	.controller('SignupCtrl', function($scope, $state, $ionicPopup, $ionicPopup, Auth, CurrentUser){
	$scope.data={};

	$scope.signup = function(){

		var email = $scope.data.email;
		var password = $scope.data.password
		//TODO: check for repeat password

		Auth.createUserWithEmailAndPassword(email, password)
			.then(function(authData){
			//On sucess, add user to database through uid
			console.log(authData);
			console.log("user created")
			firebase.database().ref("users").child(authData.uid).update({
				email: authData.email,
				timers: 0
			});

			varalertPopup=$ionicPopup.alert({
				title: 'Succes!',
				template: 'User created'
			});

			$state.go('login');

		}).catch(function(error) {
			console.log(error);
			varalertPopup=$ionicPopup.alert({
				title: 'Sign up failed!',
				template: 'Please check your credentials!'
			});
		});
	};



})
//SIGNUP END

//NEW TIMER CONTROLLER
	.controller('NewCtrl', function($scope, $timeout, CurrentUser, $ionicPopup) {
	$scope.data = {};

	$scope.data.elapsedTime = 0;

	//add new timer to firebase
	$scope.addNewTimer = function(){
		console.log("addNewTimer function reached ")

		if($scope.data.name != null){
			$scope.data.date = new Date();

			//firebase update
			firebase.database().ref("users/"+CurrentUser.uid+'/timers').child($scope.data.name).update({
				elapsedTime: 0,
				dataCreated: $scope.data.date
			});

		}else{
			varalertPopup=$ionicPopup.alert({
				title: 'Error',
				template: 'Please check you have a name set!'
			});
		};


	}


})
//NEW CONTROLLER END

	.controller('TimersCtrl', function($scope, $ionicFilterBar, $ionicPopup, $state, Foods, CurrentUser) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	$scope.testWrite = function(){
		console.log("testWrite function reached");
		$scope.testWrite.data = {};
		$scope.testWrite.data.name = "NameTest1"
		$scope.testWrite.data.email = "Email@test.dk1"
		$scope.testWrite.writeUserData = function() {
			console.log("data set");
			firebase.database().ref('/users/email').set({
				username1: $scope.data.testWrite.name,
				email1: $scope.data.testWrite.email
			});
		};
	};

	$scope.test = function(){
		console.log("test function reached!");
	};



})

	.controller('FireCtrl', function($scope, $ionicFilterBar, $ionicPopup, $state, Foods, CurrentUser) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	$scope.testWrite = function(){
		console.log("testWrite function reached");
		$scope.testWrite.data = {};
		$scope.testWrite.data.name = "NameTest1"
		$scope.testWrite.data.email = "Email@test.dk1"
		$scope.testWrite.writeUserData = function() {
			console.log("data set");
			firebase.database().ref('/users/email').set({
				username1: $scope.data.testWrite.name,
				email1: $scope.data.testWrite.email
			});
		};
	};


	$scope.testRead = function(){
		console.log('test read function reached');
		var starCountRef = firebase.database().ref('users/');
		console.log(starCountRef);
		starCountRef.on('value', function(snapshot) {
			updateStarCount(postElement, snapshot.val());
		});
	};

	$scope.test = function(){
		console.log("test function reached!")
	};

	$scope.currentUser = function(){
		console.log("current user function reached");
		var current = CurrentUser.uid;
		console.log(current);

	};

	$scope.writeUserId = function() {
		var currentUser = CurrentUser.uid;
		console.log("writeUserId function reached");
		firebase.database().ref("users").child(CurrentUser.uid).update({
			email: CurrentUser.email
		});
	}

	//SNAPSHOT FROM DATABASE
	// $scope.refreshDiaries=function() {
	//   $timeout(function() {
	//   $scope.plotData=Foods.getPlotData();
	//   $scope.$broadcast('scroll.refreshComplete');
	//   }, 1000);
	// }

	firebase.database().ref('diaries').on('value', function(snapshot) {
		var tmp=snapshot.val();
		var diariesArray=[];
		for(var i in tmp){
			diariesArray.push(tmp[i]);
		}
		$scope.plotData = Foods.getPlotData(diariesArray);
	});
	// $

})



	.controller('AddCtrl', function($scope, $state, Foods){
	$scope.foods=Foods.all();
	$scope.newFood={
		id:$scope.foods.length,
		name:'',
		cat:'',
		img:'',
		calories: 0
	}
	$scope.confirm=function () {
		Foods.add($scope.newFood);
		$scope.close();
	};
	$scope.close=function() {
		$state.go('tab.foods');
	};
})
	.controller('FoodDetailCtrl', function($scope, $stateParams, Foods) {
	$scope.food = Foods.get($stateParams.foodId);
})

	.controller('AccountCtrl', function($scope) {
	$scope.settings = {
		enableFriends: true
	};
});
