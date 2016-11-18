angular.module('chronos.controllers', [])

//LOGIN CONTROLLER
	.controller('LoginCtrl', function($scope, $state, $ionicPopup, Auth){
	$scope.data={};

	//AUTH login
	$scope.login=function(){
		Auth.signInWithEmailAndPassword($scope.data.email, $scope.data.password)
			.then(function(authData){
			console.log(authData);
			$state.go('tab.stat');
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

	//on load - set elapsed time
	$scope.timers.$loaded()
			.then(function(){
				// access data here;
				for (var i = 0 ; i < $scope.timers.length ; ++i){
				 $scope.displayElapsed(i);	
				}
			});

		
	$scope.test2 = function(){
		$scope.moveItem($scope.timers[1],1,0);			
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
				if ($scope.timers[index].elapsedTime != 0){
				$scope.timers[index].elapsedTime =  moment().hour(0).minute(0).second($scope.timers[index].elapsedTime-1).format('HH : mm : ss')
				}else{
					$scope.timers[index].elapsedTime = "Not Used Yet"
				}
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




})
//TIMERS CONTROLLER END


	.controller('AddCtrl', function($scope, $state, Foods){
	
})
	

	.controller('StatsCtrl', function($scope, Timers) {
	
	$scope.all = Timers.all();

	
	$scope.timersArray=[];
	$scope.array=[];
	$scope.index = 0;

	$scope.all.$loaded()
	.then(function(){
		// access data here;
		
		
			for(i = 0; i < $scope.all.length ; ++i){  
			
			// $scope.array[i].name = $scope.all[i].name;
			
			$scope.all[i].counter = 0;
			$scope.index = i;

			$scope.all[i].elapsedTime = Timers.elapsedTime($scope.all[i].$id); 
			console.log($scope.all[i].elapsedTime);
			
			$scope.all[i].elapsedTime.$loaded()
			.then(function(){

				

				

				for(j = 0; j < $scope.all[$scope.index].elapsedTime.length ; ++j){
					// console.log($scope.elapsedTime[i].$value);
					$scope.all[$scope.index].counter += $scope.all[$scope.index].elapsedTime[j].$value;
				}

				// console.log($scope.counter);
				$scope.all[$scope.index].counter; // = moment().hour(0).minute(0).second($scope.counter-1).format('HH : mm : ss')
				$scope.all[$scope.index].data = {'name':$scope.all[$scope.index].name, 'counter': $scope.all[$scope.index].counter};
				$scope.timersArray.push($scope.all[$scope.index].data);	
				});
				
				

				
			}

	});//$loaded end



	$scope.test = function(){
		console.log($scope.timersArray);
	}




});


