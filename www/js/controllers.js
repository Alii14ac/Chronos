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
	.controller('SignupCtrl', function($scope, $state, $ionicPopup, Auth, CurrentUser){
	$scope.data={};

	$scope.signup = function(){

		var email = $scope.data.email;
		var password = $scope.data.password
		var name = $scope.data.name
		//TODO: check for repeat password

		Auth.createUserWithEmailAndPassword(email, password)
			.then(function(authData){
			//On sucess, add user to database through uid
			console.log(authData);
			console.log("user created")
			firebase.database().ref("users").child(authData.uid).update({
				email: authData.email,
				timers: 0,
				group: 0,
				name: name
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
	.controller('NewCtrl', function($scope, $timeout, CurrentUser, $ionicPopup, $state, Database) {
	$scope.data = {};

	$scope.data.elapsedTime = 0;
	$scope.data.buttonColor = "button-calm";
	$scope.data.color = "calm";

	$scope.colorSwitch = function(){
		
	switch($scope.data.color){
		case "positive":
			$scope.data.buttonColor = "button-positive";
			break;
		case "calm":
			$scope.data.buttonColor = "button-calm";
			break;
		case "balanced":
			$scope.data.buttonColor = "button-balanced";
			break;	
		case "energized":
			$scope.data.buttonColor = "button-energized";
			break;	
		case "assertive":
			$scope.data.buttonColor = "button-assertive"; 
			break;	
		case "royal":
			$scope.data.buttonColor = "button-royal";
			break;	
		default:
			$scope.data.buttonColor = "button-dark";

	}
	console.log("color switch - "+$scope.data.buttonColor);
	}

	$scope.newTimer = function(){
		console.log($scope.data.name+'  '+$scope.data.color)
		Database.newTimer($scope.data.name,$scope.data.color);
	}
	

	




})
//NEW CONTROLLER END

//TIMERS CONTROLLER
	.controller('TimersCtrl', function($scope, $ionicFilterBar, $ionicPopup, $state, $interval, Foods, CurrentUser, Timers, Clock,Database) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//
	//	$scope.$on('$ionicView.loaded', function(e) {
	//	});


	$scope.timers = Timers.all();


	$scope.test2 = function(index){
		for (var i = 0; i < $scope.timers.length; ++i){
			$scope.timers[i].counter = 0;
			$scope.timers[i].runClock = null;
			$scope.timers[i].state = 0;
			console.log("loop "+i);
		}
		console.log("ready to time repeated buttons");

	}

	//TIME FUNCTIONS
	$scope.clock = function(index){

		//workaround for making the loop run
		if ($scope.timers[index].counter == null){
			//for (var i = 0; i < $scope.timers.length; ++i){
			$scope.timers[index].counter = 0;
			$scope.timers[index].runClock = null;
			$scope.timers[index].state = 0;
			//}
		}
		//making sure only one timer is active
		for (var i = 0; i < $scope.timers.length; ++i){
			if($scope.timers[i].state == 1){
				if($scope.timers[index] != $scope.timers[i]){
					console.log("another timer is running");
					$scope.stop(i);
				}
			}
		}

		function displayTime() {
			$scope.timers[index].time = moment().hour(0).minute(0).second($scope.timers[index].counter++).format('HH : mm : ss');
		}

		$scope.start = function() {
			if($scope.timers[index].runClock==null)
			{

				$scope.timers[index].runClock = $interval(displayTime, 1000);
				$scope.timers[index].state = 1;

			}
		}

		$scope.stop = function(index) {
			$interval.cancel($scope.timers[index].runClock);
			$scope.timers[index].runClock=null;
			$scope.timers[index].state = 0;
			//call to add time function
			Database.addTime($scope.timers[index].time, $scope.timers[index].$id);
			$scope.reset();

		}

		$scope.reset = function() {
			$scope.timers[index].counter = 0;
			$scope.timers[index].time = null;
			
		}




		if($scope.timers[index].state == 0){
			console.log("timer started")
			$scope.start();

		}else if($scope.timers[index].state == 1){
			console.log("timer stoped")
			$scope.stop(index);

		}





	}





})
//TIMERS CONTROLLER END

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
