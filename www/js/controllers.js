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
		console.log("congratz");
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
	.controller('NewCtrl', function($scope,$window, $timeout, CurrentUser, $ionicPopup, $ionicPlatform, $state, Timers, Geo) {

	$scope.$on('$ionicView.enter', function(e) {
		$scope.grid = Geo.getNewGrid();
		$scope.show = false;

		if ($scope.grid != null){
			console.log('-------------------------BUTTON CHANGE-------------------------------')
			$scope.show = true;
		};

	})

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

	$scope.map = function(){
	console.log("going to map");
    $state.go('tab.map');
  }

	$scope.newTimer = function(){
		console.log($scope.data.name+'  '+$scope.data.color)
		Timers.newTimer($scope.data.name,$scope.data.color, $scope.grid, $scope.data.gridName);
		Geo.setNewGrid(null);
		$scope.grid = null;
		$scope.data.name = null;
	}

	$scope.test = function(){
	console.log(Geo.getNewGrid());
}







})
//NEW CONTROLLER END

//TIMERS CONTROLLER
	.controller('TimersCtrl', function($scope, $ionicFilterBar, $ionicPopup, $state, $window, $interval,  CurrentUser, Timers, Clock, Notifications, Geo, $cordovaGeolocation, $cordovaLocalNotification) {
// this controller has become quite cluttered

		$scope.$on('$ionicView.enter', function(e) {
			$scope.allGrids = Geo.getAllGrids();

			$scope.allGrids.$loaded()
					.then(function(){
						// access data here;
					//  console.log($scope.allGrids);

					 //clear tracking


					});
		});

	$scope.timers = Timers.all();
	$scope.smartTracking = { checked: false };
	//on load - set elapsed time
	$scope.timers.$loaded()
			.then(function(){
				// access data here;
				for (var i = 0 ; i < $scope.timers.length ; ++i){
				 $scope.displayElapsed(i);
				}
			});



			$scope.smartToogle = function(){
				console.log("toogle reached"+$scope.smartTracking.checked);
				if ($scope.smartTracking.checked == true) {
					$scope.startTracking();
				}else if ($scope.smartTracking.checked == false) {
					if ($scope.watch) {
						$scope.watch.clearWatch();
						$scope.watch = null;
						$scope.displayPosition = null;
					}
				}
			}

			// TRACKING location
			$scope.displayPosition = null;

			$scope.mapOptions = {timeout: 30000, maximumAge: 0, enableHighAccuracy: true};

			$scope.startTracking = function(){
			$scope.displayPosition ="Thinking...."
	    $scope.watch = $cordovaGeolocation.watchPosition($scope.mapOptions);
	    $scope.watch.then(null,
	    function(error){

				$scope.displayPosition ="Could not get location"
	    }, function(position){

				var lat = position.coords.latitude;
				var lng = position.coords.longitude;

				$scope.displayPosition = String('current position is '+lat+' and '+lng);

				//check if user is in a timer grid
				for (var i = 0 ; i < $scope.allGrids.length ; ++i){

					var radiusString = String('0.000'+$scope.allGrids[i].radius);
					var radius = Number(radiusString);

					var minLat = $scope.allGrids[i].lat - radius;
					var maxLat = $scope.allGrids[i].lat + radius;
					var minLng = $scope.allGrids[i].lng - radius;
					var maxLng = $scope.allGrids[i].lng + radius;

					//  console.log(minLat+' '+maxLat+' '+minLng+' '+maxLng);

					//if within raduis
					if ((lat > minLat && lat < maxLat) && (lng > minLng && lng < maxLng)) {


						console.log($scope.allGrids[i].$id);
						console.log($scope.allGrids[i].name);
						$scope.inGrid($scope.allGrids[i].$id , $scope.allGrids[i].name);

					// 	var alertPopup=$ionicPopup.alert({
					// 	title: 'within raduis!!',
					// 	template: 'Coming soon'
					// });

				}

				}


	    });
	  }


  // actions for when a user is in grid
	$scope.inGrid = function(gridUid, gridName){

		for (var i = 0 ; i < $scope.timers.length ; ++i){

			if ($scope.timers[i].locations.locationKey == gridUid){
				console.log('notification reached');

				if ($scope.activeTimer != $scope.timers[i].$id) {

					$cordovaLocalNotification.schedule({
	            id: "1",
	            // at: alarmTime,
	            message: gridName+": "+$scope.timers[i].name+" started",
	            title: "Touch to cancel",
	            autoCancel: true,
	            // sound: null
	        }).then(function () {
	        });

					$scope.moveItem($scope.timers[i], i , 0 );
				}

			}

		}

	}

	$scope.test2 = function(){

		console.log($scope.allGrids);

	}

	$scope.test = function(){
		console.log('long hold triggered');
		Notifications.instant("reached from timers page");
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


	$scope.moveItem = function(item, fromIndex, toIndex) {
    //Move the item in the array
    $scope.timers.splice(fromIndex, 1);
    $scope.timers.splice(toIndex, 0, item);

	//start clock(). index will always be zero due to array reorder.
	// A bit hacked together = write cleaner code
	$scope.clock(0);

  	};

		$scope.activeTimer = null;

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
				$scope.activeTimer = $scope.timers[index].$id;
				$scope.timers[index].runClock = $interval(displayTime, 1000);
				$scope.timers[index].state = 1;

			}
		}

		$scope.stop = function(index) {
			$interval.cancel($scope.timers[index].runClock);
			$scope.displayElapsed(index);
			$scope.timers[index].runClock=null;
			$scope.timers[index].state = 0;
			$scope.activeTimer = null;
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




	//STATS CONTROLLER
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
//
.controller('SettingsCtrl', function($scope, $state, $window, $ionicPopup, $cordovaLocalNotification, $ionicPlatform, Auth){

 $ionicPlatform.ready(function () {

         $scope.add = function() {
        var alarmTime = new Date();
        alarmTime.setMinutes(alarmTime.getSeconds + 4);
        $cordovaLocalNotification.add({
            id: "1234",
            date: alarmTime,
            message: "This is a message",
            title: "This is a title",
            autoCancel: true,
            sound: null
        }).then(function () {
            console.log("The notification has been set");
        });
    };

		 $scope.schedule = function() {
        var alarmTime = new Date();
        alarmTime.setMinutes(alarmTime.getSeconds + 4);
        $cordovaLocalNotification.schedule({
            id: "1",
            // at: alarmTime,
            message: "This is scheduled ",
            title: "This is a title",
            autoCancel: true,
            // sound: null
        }).then(function () {
            console.log("The notification has been set");
        });
    };

	$scope.instant = function() {
        var alarmTime = new Date();
        alarmTime.setMinutes(alarmTime.getSeconds + 4);
        $cordovaLocalNotification.schedule({
            id: "1",
            // at: alarmTime,
            message: "This is scheduled ",
            title: "This is a title",
            autoCancel: true,
            // sound: null
        }).then(function () {
        });
    };



    });

$scope.test = function (){
	var confirmPopup  = $ionicPopup.confirm({
				title: 'test',
				template: 'This is just for display'
			});
}



$scope.signOut = function(){
	$window.location.reload();
		$state.go('login');
}

})

.controller('MapCtrl', function($scope, $cordovaGeolocation, $state, Geo) {
  var options = {timeout: 30000, maximumAge: 0, enableHighAccuracy: true};
  var latLng;
  var marker;
  var pathCoords = [];
  var path;
  $scope.watch = null;

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    pathCoords.push(latLng);
    console.log(position.coords.latitude + ', ' + position.coords.longitude)

    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

	var currentMarker = '/img/curentPosition.png';
    marker = new google.maps.Marker({
      position: latLng,
      animation: google.maps.Animation.DROP,
	  icon: currentMarker,
      map: $scope.map});

	userMarker =  new google.maps.Marker({
		map: $scope.map,
		animation: google.maps.Animation.DROP,
		draggable: true
	});

	$scope.radius = 40;

	$scope.setRadius = function(value){
		console.log('radus changed '+ value);
		$scope.radius = value;
		userCircle.setRadius(Number(value));

	}

	userCircle = new google.maps.Circle({
		map: $scope.map,
		//center: latLng, //userMarker.getPosition(),
		radius: $scope.radius

	});


	choise = new google.maps.event.addListener($scope.map, "click", function (event) {
    var latitude = event.latLng.lat();
    var longitude = event.latLng.lng();

	userMarker.setPosition(event.latLng);
	// userCircle.setCenter(event.latLng);

    console.log( latitude + ', ' + longitude );
}); //end addListener



	radiusChange = new google.maps.event.addListener(userMarker, "position_changed", function (event) {
    userCircle.setCenter(userMarker.getPosition($scope.radius));
});

  }, function(error){
    console.log("Could not get location");
  });

//   $scope.startTracking = function(){
//     $scope.watch = $cordovaGeolocation.watchPosition(options);
//     $scope.watch.then(null,
//     function(error){
//       console.log("Could not get location");
//     }, function(position){
//       latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

//       pathCoords.push(latLng);
//       $scope.map.panTo(latLng);
//       marker.setPosition(latLng);

//       path = new google.maps.Polyline({
//         path: pathCoords,
//         geodesic: true,
//         strokeColor: '#0099cc',
//         strokeOpacity: 0.8,
//         strokeWeight: 2
//       });

//       path.setMap($scope.map);
//     });
//   }

//   $scope.stopTracking = function(){
//     $scope.watch.clearWatch();
//     $scope.watch = null;
//     path.setMap(null);
//     pathCoords = [];
//   }

$scope.done = function(){
	var grid = {
		lat: userMarker.getPosition().lat(),
		lng: userMarker.getPosition().lng(),
		radius: $scope.radius
	}

	if (grid != null){
	Geo.setNewGrid(grid);
	}

	console.log(grid);
    $state.go('tab.new');
  }

})
