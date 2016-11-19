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
			var alertPopup=$ionicPopup.alert({
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
	.controller('NewCtrl', function($scope,$window, $timeout, CurrentUser, $ionicPopup, $state, Database) {
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

	}

	$scope.add=function(view){
	console.log("settings");	
    $state.go(view);
  }

	$scope.newTimer = function(){
		console.log($scope.data.name+'  '+$scope.data.color)
		Database.newTimer($scope.data.name,$scope.data.color);
	}

	$scope.signOut = function(){
	$window.location.reload();  
		$state.go('login');  
}
	
})
//NEW CONTROLLER END

//TIMERS CONTROLLER
	.controller('TimersCtrl', function($scope, $ionicFilterBar, $ionicPopup, $state, $window, $interval,  CurrentUser, Timers, Clock,Database) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//
		$scope.$on('$ionicView.loaded', function(e) {
			
		});

	$scope.timers = Timers.all();

	//on load - set elapsed time
	$scope.timers.$loaded()
			.then(function(){
				// access data here;
				for (var i = 0 ; i < $scope.timers.length ; ++i){
				 $scope.displayElapsed(i);	
				}
			});
		
	$scope.test2 = function(){	
		console.log('short press triggered');			
	}

	$scope.test = function(){	
		console.log('long hold triggered');			
	}

	$scope.add=function(view){
    $state.go(view);
 	}

	//ELAPSED TIME FUNCTION
	$scope.displayElapsed =function(index){

			$scope.timers[index].elapsedTime = 0;
			$scope.timers[index].elapsedTimeArray = Timers.elapsedTime($scope.timers[index].$id);

			$scope.timers[index].elapsedTimeArray.$loaded()
			.then(function(){
				// access data here;

				for (var i = 0; i < $scope.timers[index].elapsedTimeArray.length  ; ++i){
				
				 	$scope.timers[index].elapsedTime += $scope.timers[index].elapsedTimeArray[i].$value
				}
				if ($scope.timers[index].elapsedTime != 0 && $scope.timers[index].elapsedTime != null){
					//used for chart data
				$scope.timers[index].yAxis = $scope.timers[index].elapsedTime;  	
				$scope.timers[index].elapsedTime =  moment().hour(0).minute(0).second($scope.timers[index].elapsedTime-1).format('HH : mm : ss')
				}else{
					$scope.timers[index].elapsedTime = "Not Used Yet"
				}

				Timers.setTimers($scope.timers);
			});

		}

	// -------- NG-CLICK --------------------	
	$scope.moveItem = function(item, fromIndex, toIndex) {
    //Move the item in the array
    $scope.timers.splice(fromIndex, 1);
    $scope.timers.splice(toIndex, 0, item);

	//start clock(). index will always be zero due to array reorder. 
	// A bit hacked together = write cleaner code
	$scope.clock(0);

  	};

	//TIME FUNCTIONS
		$scope.clock = function(index){

		//workaround for making the loop run
		if ($scope.timers[index].counter == null){
			
			$scope.timers[index].counter = 0;
			$scope.timers[index].runClock = null;
			$scope.timers[index].state = 0;
			
		}


		//making sure only one timer is active
		for (var i = 0; i < $scope.timers.length; ++i){
			if($scope.timers[i].state == 1){
				if($scope.timers[index] != $scope.timers[i]){
					console.log("another timer is running");
					$scope.stop(i);
					$scope.timers[i].time = null;
				}
			}
		}


		function displayTime() {
			$scope.timers[index].time = moment().hour(0).minute(0).second($scope.timers[index].counter++).format('HH : mm : ss');
		}

		$scope.start = function() {
			if($scope.timers[index].runClock==null)
			{
				console.log("timer started");
				$scope.timers[index].runClock = $interval(displayTime, 1000);
				$scope.timers[index].state = 1;

			}
		}

		$scope.stop = function(index) {
			$interval.cancel($scope.timers[index].runClock);
			$scope.displayElapsed(index);
			$scope.timers[index].runClock=null;
			$scope.timers[index].state = 0;
			//call to add time function
			Timers.addTime($scope.timers[index].counter-1 , $scope.timers[index].$id);
				
			$scope.reset();

		}

		$scope.reset = function() {
			$scope.timers[index].counter = 0;
			$scope.timers[index].time = null;			
		}

		if($scope.timers[index].state == 0){
			$scope.start();

		}else if($scope.timers[index].state == 1){
			$scope.stop(index);

		}
	}

	 $scope.showPopup=function(timer) {
 
   
    // An elaborate, custom popup
    var myPopup=$ionicPopup.show({
    //   templateUrl: 'templates/timers-popup.html',
      title: 'Options',
	  subTitle: 'for '+'<b>'+timer.name+'</b>'+' timer',
      
      scope: $scope,
      buttons: [
      
      {text: 'Edit',
      type: ' button button-block button-positive ',
      onTap: function(e) {
        var alertPopup=$ionicPopup.alert({
				title: 'Feature not available',
				template: 'Coming soon'
			});
      }
      },
	  {text: 'Delete', 
	  type: ' button button-block button-assertive ',
	  onTap: function(e) {
        var confirmPopup  = $ionicPopup.confirm({
				title: 'Warning',
				template: 'This can not be undone'
			});

			confirmPopup.then(function(res) {
				if(res) {
				console.log('deleting timer');
				Timers.deleteTimer(timer.$id);
				} else {
				console.log('You are not sure');
				}
			});
		
       }
	  },
	  {text: 'Exit', type: ' button button-block button-energized ', onTap: function(){ myPopup.close();} },
    ]
    });
  }

  $scope.signOut = function(){
	  
	$window.location.reload();  
		$state.go('login');  
}
})
//TIMERS CONTROLLER END



	

	.controller('StatsCtrl', function($scope, $state,$window, Timers, Tools) {
		$scope.signOut = function(){
	$window.location.reload();  
		$state.go('login');  
}
	
	$scope.$on('$ionicView.enter', function(e) {

	$scope.timers = Timers.getTimers();
		
	$scope.timers.$loaded()
			.then(function(){
				// access data here;
				
				$scope.labels = [];
				$scope.data = [];
				$scope.color = [];
				 $scope.barOptions = {
					scales: {
						yAxes: [
							{
								display: false,
							}
						]
					},
					tooltips : {
						callbacks : {
							label: function(tooltipItems, data) {
								
								var array = [$scope.timers[tooltipItems.index].elapsedTime, 'Times used: ' + $scope.timers[tooltipItems.index].elapsedTimeArray.length];
								return array;
								},
						}
					}
				};				
    

				for (i = 0 ; i < $scope.timers.length ; ++i){

					var label = $scope.timers[i].name;
					var data = $scope.timers[i].yAxis;
					var color = Tools.colorCode($scope.timers[i].color);

					$scope.labels.push(label);
					$scope.data.push(data);
					$scope.color.push(color);

				}
			});
		});

	$scope.add=function(view){
    $state.go(view);
  	}

	$scope.refresh = function(){
		$scope.timers = Timers.getTimers();
	}

	$scope.test = function(){
		console.log($scope.labels);
		console.log($scope.data);
		console.log($scope.options);
	}
})

.controller('SettingsCtrl', function($scope, $state, $window, $ionicPopup, Auth){

// $scope.signOut = function (){
// 	firebase.auth().signOut().then(function() {
//   		// Sign-out successful.
// 		// $state.go('login');  
// 		$window.location.reload();  
// 		$state.go('login');  
		
		
// 		}, function(error) {
// 		// An error happened.
// 		varalertPopup=$ionicPopup.alert({
// 				title: 'Logout failed!',
// 				template: ''
// 			});
// 		});
// }

$scope.signOut = function(){
	$window.location.reload();  
		$state.go('login');  
}

})

