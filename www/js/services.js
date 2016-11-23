angular.module('chronos.services', [])

	.factory('Auth', function(){
	var config = {
		apiKey: "AIzaSyDSJ3nHOVn-frvyhB2brmS0kdOu57ci0Fo",
		authDomain: "chronos-c63b2.firebaseapp.com",
		databaseURL: "https://chronos-c63b2.firebaseio.com",
		storageBucket: "chronos-c63b2.appspot.com",
		messagingSenderId: "1054527482628"
	};
	firebase.initializeApp(config);
	return firebase.auth();
})

	.factory('Tools', function(){
	
	return {

		colorCode: function(color){
		var value;

		switch(color){
		case "positive":
			value = "#387ef5";
			break;
		case "calm":
			value = "#11c1f3";
			break;
		case "balanced":
			value = "#33cd5f";
			break;	
		case "energized":
			value = "#ffc900";
			break;	
		case "assertive":
			value = "#ef473a"; 
			break;	
		case "royal":
			value = "#886aea";
			break;	
		default:
			$value = "";

	}
		return value;

		}

	}
		
})


	.factory('Geo',function(CurrentUser, $ionicPopup, $state, $firebaseArray){

		var newGrid = null;

		return {
		
		getNewGrid: function() {
			return newGrid;
		},
		setNewGrid: function(grid){
			newGrid = grid;
		},
		setNewGridNull: function(){
			newGrid = null;
		},
		getAllGrids: function(){

			var allGrids = $firebaseArray(firebase.database().ref('/locations/'+CurrentUser.uid+'/'));
			return allGrids;
		}
			
	}


	})


	.factory('Clock', function($interval){

	var counter;
	var start;

	

	return {
		start: function(state) {
			timercounter(state);
			return counter;
		}
	}

})


	.factory('CurrentUser', function(){

	var user = firebase.auth().currentUser;
	var name, email, photoUrl, uid;

	if (user != null) {
		//name = user.displayName;
		email = user.email;
		//photoUrl = user.photoURL;
		uid = user.uid;
	}

	return user;

})

	.factory('Timers', function($firebaseArray, $state, $ionicPopup, CurrentUser){
	
	var plotTimers;

	return {
		all: function() {
			var timers = $firebaseArray(firebase.database().ref("users/"+CurrentUser.uid+'/timers'));
			return timers;
		},
		elapsedTime: function(timerkey) {

			var startDate = '1479054589592';

			var elapsedTime = $firebaseArray(firebase.database().ref('/timers/'+timerkey+'/').orderByKey().startAt(startDate));
			return elapsedTime;

		},
		//ADD TIME ON TIMER STOP
		addTime: function(time, timerKey){

			var date = Date.now();
			//time data
			var timersData = {};
			timersData[date] = time;

			var updates = {};
			updates['/timers/' + timerKey] = timersData;

			firebase.database().ref('timers/'+timerKey+'/').update(timersData);

		

		},
		setTimers: function(TimersArray){

			plotTimers = TimersArray;
			
			
		},
		getTimers: function(){

			return plotTimers;

		},
		deleteTimer: function(id){

			//hard deleting from database
			firebase.database().ref('timers/'+id).remove();
			firebase.database().ref("users/"+CurrentUser.uid+'/timers/'+id).remove();

		},
		//NEW TIMER	
		newTimer: function(name, color, grid, gridName) {
			

		if(name != null){
			var date = Date.now();

			// Get a key for a new Post.
  			var newPostKey = firebase.database().ref("users/"+CurrentUser.uid).child('timers').push().key
			var newLocationKey = firebase.database().ref("locations/"+CurrentUser.uid).push().key  

			// users timer entry.
			var userData = {
				color: color,
				dateCreated: date,
				name: name,
				locations: {locationKey: newLocationKey}
			};

	
			//timers data
			var timersData = {};
			timersData[date] = 0;

			//Location data
			var locationData = grid;
			locationData['name'] = gridName;

			
			

		
			// Write the new post's data simultaneously in the posts list and the user's post list.
			var updates = {};
			updates["users/"+CurrentUser.uid+'/timers/' + newPostKey] = userData;
			updates['/timers/' + newPostKey] = timersData;
			updates['/locations/'+CurrentUser.uid+'/'+newLocationKey] = locationData;

			firebase.database().ref().update(updates);

			// varalertPopup=$ionicPopup.alert({
			// 	title: timerData.name+" timer added",
			// 	template: ''
			// });
			$state.go('tab.timers');

		}else{
			console.log("no name set, couldnt set new timer")
			varalertPopup=$ionicPopup.alert({
				title: 'Error',
				template: 'Please check you have a name set!'
			});
		};

		},


	};

})

.factory('Notifications', function($cordovaLocalNotification){
	
	var alarmTime = new Date();

	return {
		instant: function(message){

			
        alarmTime.setMinutes(alarmTime.getSeconds + 4);
        $cordovaLocalNotification.schedule({
            id: "1",
            message: "Chronos ",
            title: "Notification",
            autoCancel: true,
        }).then(function () {
            console.log("The notification has been set");
        });

		}
	}

});



	


