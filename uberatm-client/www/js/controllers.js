angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {
  $scope.pubTransportBool = true;      

  $scope.publicTransportation = function(){
    if (pubTransportBool) {
      //Display map 
    } else {
      // Google URL change 
    }
  };

  function timePickerCallback(val) {
    if (typeof (val) === 'undefined') {
      console.log('Time not selected');
    } else {
      var selectedTime = new Date(val * 1000);
      console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
      $scope.epochTime = val;
    }
  }  

  $scope.epochTime = 27000;

  $scope.timePickerObject = {
    inputEpochTime: ((new Date()).getHours() * 60 * 60),  //Optional
    step: 15,  //Optional
    format: 12,  //Optional
    titleLabel: 'Choose your departure time',  //Optional
    setLabel: 'Set',  //Optional
    closeLabel: 'Close',  //Optional
    setButtonType: 'button-positive',  //Optional
    closeButtonType: 'button-stable',  //Optional
    callback: function (val) {    //Mandatory
      timePickerCallback(val);
    }
  }
  
  $scope.mapCreated = function(map) {
    $scope.map = map;
  }

})

app.directive('standardTimeNoMeridian', function() {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      etime: '=etime'
    },
    template: "<strong>{{stime}}</strong>",
    link: function(scope, elem, attrs) {

      scope.stime = epochParser(scope.etime, 'time');

      function prependZero(param) {
        if (String(param).length < 2) {
          return "0" + String(param);
        }
        return param;
      }

      function epochParser(val, opType) {
        var am_pm = "AM"
        if (val === null) {
          return "00 : 00 " + am_pm;
        } else {
          if (opType === 'time') {
            var hours = parseInt(val / 3600);
            var minutes = (val / 60) % 60;

            if (hours >= 12) {
              am_pm = "PM";
            }else{
              am_pm = "AM";
            }

            if (hours >= 13) {
              hours -= 12;
            }else if(hours == 0) {
              hours += 12;
            }

            return (prependZero(hours) + " : " + prependZero(minutes)) + " " + am_pm;
          }
        }
      }

      scope.$watch('etime', function(newValue, oldValue) {
        scope.stime = epochParser(scope.etime, 'time');
      });

    }
  };
})

.controller('StartUnderCtrl', function($scope) {
  $scope.mapCreated = function(map) {
    $scope.map = map;
  };

  $scope.centerOnMe = function () {
    console.log("Centering");
    if (!$scope.map) {
      return;
    }

    $scope.loading = $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function (pos) {
      console.log('Got pos', pos);
      $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      $scope.loading.hide();
    }, function (error) {
      alert('Unable to get location: ' + error.message);
    });
  };
})

.controller('StartOverlayCtrl', function($scope, $http) {
  $scope.addresses = [];
  $scope.deptAddress = "";
  $scope.addressQueryInProcess = false;
  $scope.addressQueryOnWait = "";
  $scope.candidateAddressResults = {}
  $scope.latitude = -1;
  $scope.longitude = -1;

  $scope.useCurrentPosition = function(position) {
     $scope.latitude = position.coords.latitude;
     $scope.longitude = position.coords.longitude;
     console.log('GPS: ' + $scope.latitude + " , " + $scope.longitude);
  }

  if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition($scope.useCurrentPosition);
  } else {
     console.log("Unable to find current location");
  }

  $scope.onAddressChange = function (deptAddress) {
    if(deptAddress == "" || $scope.latitude == -1) {
      $scope.addresses = [];
      return;
    }

    if($scope.addressQueryInProcess == true) {
      $scope.addressQueryOnWait = deptAddress;
      setTimeout(function() {
        $scope.onAddressChange($scope.addressQueryOnWait);
      }, 100);
      return;
    }

    $scope.addressQueryInProcess = true;

    $scope.getLocation(deptAddress, function(response) {        
      console.log('response', response);
      $scope.getCandidateAdresses(response, function(candidateAddressResults) {
        $scope.candidateAddressResults = candidateAddressResults;
        addresses = []
        for(var key in candidateAddressResults) {
          addresses.push(key);
        }
        $scope.addresses = addresses.slice(0, 3);
        $scope.addressQueryInProcess = false;
      });
    });
    
  }

  $scope.onClickHere = function() {
    console.log('clicked')
    $scope.deptAddress = "Here"
  }

  $scope.getCurrentAddress = function(lati, longi) {
      var here_url = "http://reverse.geocoder.cit.api.here.com/6.2/reversegeocode.json" +
	  "geocode.json?app_id=evk3TrU4UcresAseG8Da&app_code=z4yYohROherMZ57eHTsQUg&gen=9";
      $http({
	  method: 'GET',
	  url: here_url,
	  params: {mode: "retrieveAdresses", prox: lati + "," + longi}
      }).then(function successCallback(response) {
	  return response.data;
      }, function errorCallback(response) {
	  console.log(response, "errorcode");
      });
  }

  $scope.getLocation = function (user_address, callback) {
    var here_url = "https://places.demo.api.here.com/places/v1/discover/search?app_id=evk3TrU4UcresAseG8Da&app_code=z4yYohROherMZ57eHTsQUg";
    $http({
      method: 'GET',
      url: here_url,
      params: {
        q: user_address,
        at: $scope.latitude + "," + $scope.longitude
      }
    }).then(function successCallback(response) {
      //The request worked. Do some display stuff.
      callback(response)
      console.log(response);
      // callback(addresses);
      // var latitude = address.Response.View.Result.Location.NavigationPosition.Latitude;
      // var longitude = address.Response.View.Result.Location.NavigationPosition.Longitude;
      // $scope.callUber(); //We now call uber since it worked
    }, function errorCallback(resonse) {
      //Display error in the UI
    });
  }

  $scope.getCandidateAdresses = function(response, callback) {
    var results = {}
    if(response.data.results.items.length > 0) {
      for(var result of response.data.results.items) {
        var title = result.title;
        results[title] = result;
      }
    }
    callback(results);
  }

  $scope.callUber = function(deptAddress) {
    console.log(deptAddress);
    var url = 'https://api.uber.com/v1/products';
    $(".box").append("<button class='button overflowShow' value='Reload Page' onClick='window.location.reload()'></button>");
    $(".box").append("<div class='timeLeft'> Time left: </div>");
    $(".box").append("<div class='eta'> ETA: </div>");
    $(".box").append("<div class='callIn'> Calling Uber in: </div>");
    while (true) {
      var car_ids = []
      $scope.getLocation(deptAddress, $scope.getCandidateAdresses);
      var parameters = {
          'server_token': '3_hEHw2oOLy9jPtAYc-fBXqWMHXmP2WVChp1Kjpf',
          'latitude': scope.latitude,
          'longitude': scope.longitude
      };
      $http.get(url, parameters).then(successCallback, errorCallback);
    function successCallback(response) {
      for (var product in response.products) {
        car_ids.push(product.product_id);
      }
    };
    function errorCallback(response) {

    };
    $(".box .eta").append($scope.estimateUber(car_ids));
    $(".box .timeLeft").append($scope.epochParser($scope.epochTime - $.now(), "time"));
    // We should be able to create a server in order to store user's time request data.

    // Top: Map of uber drivers nearby
    // Middle-bottom: Time left until requested time, minimum ETA of driver
    // Driver ETA: calling in [(time left - minimum ETA)]
    }
  }

  $scope.epochParser = function (val, opType) {
        var am_pm = "AM"
        if (val === null) {
          return "00 : 00 " + am_pm;
        } else {
          if (opType === 'time') {
            var hours = parseInt(val / 3600);
            var minutes = (val / 60) % 60;

            if (hours >= 12) {
              am_pm = "PM";
            }else{
              am_pm = "AM";
            }

            if (hours >= 13) {
              hours -= 12;
            }else if(hours == 0) {
              hours += 12;
            }

            return (prependZero(hours) + " : " + prependZero(minutes)) + " " + am_pm;
          }
        }
      }

  $scope.estimateUber = function(car_ids) {
    times = []
    var url = 'https://api.uber.com/v1/requests/estimate';
    for (car in car_ids) {
      var parameters = {
        'product_id': car,
        'start_latitude': $scope.latitude,
        'start_longitude': $scope.longitude,
        'end_latitude': null, // Either user inputted location or HERE maps deteremined location
        'end_longitude': null// Same as above
      }    
      $http.post(url, parameters).then(
        function(response){
          times.push(response.pickup_estimate);
        }, function(response){
          console.log("error");
        });
    }
    return Math.min.apply(Math, times);
  }
})
