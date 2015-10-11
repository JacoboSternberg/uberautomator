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
  
})

.controller('StartOverlayCtrl', function($scope, $http, $state) {
  $scope.addresses = [];
  $scope.deptAddress = "";
  $scope.addressQueryInProcess = false;
  $scope.addressQueryOnWait = "";
  $scope.candidateAddressResults = {}
  $scope.times = []
  $scope.car_ids = []
  $scope.latitude = -1;
  $scope.longitude = -1;

  $scope.useCurrentPosition = function(position) {
     $scope.latitude = position.coords.latitude;
     $scope.longitude = position.coords.longitude;
     function setCenter() {
       if($scope.map) {
          $scope.map.setCenter($scope.latitude, $scope.longitude);
       }else{
          setTimeout(setCenter, 100);
       }
     }
     setCenter();
  }

  $scope.mapCreated = function(map, ui) {
    $scope.map = map;
    $scope.ui = ui;
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
    var HERE_APP_ID='evk3TrU4UcresAseG8Da';
    var HERE_APP_CODE='z4yYohROherMZ57eHTsQUg';
    var here_url = "https://places.demo.api.here.com/places/v1/discover/search?app_id=" + HERE_APP_ID 
    + "&app_code=" + HERE_APP_CODE;
    $http({
      method: 'GET',
      url: here_url,
      params: {
        q: user_address,
        at: $scope.latitude + "," + $scope.longitude
      }
    }).then(function successCallback(response) {
      //The request worked. Do some display stuff.
      //callback(response)
      console.log(response.results);
    }, function errorCallback(resonse) {
      console.log("error");
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

  $scope.callUber = function(curr_long, curr_lat) {
    $state.transitionTo("search");
    var url = "https://api.uber.com/v1/products";
    //while (true) {
    var parameters = {
        'server_token': '3_hEHw2oOLy9jPtAYc-fBXqWMHXmP2WVChp1Kjpf',
        'latitude': curr_long,
        'longitude': curr_lat
    };
    $http.get(url, parameters).then(successCallback, errorCallback);
    function successCallback(response) {
      for (var product in response.products) {
        $scope.car_ids.push(product.product_id);
      }
    };
    function errorCallback(response) {
      console.log("error");
    };
    $(".box .timeLeft p").html()
    var eta = $scope.estimateUber($scope.car_ids);
    $(".box .eta p").html($scope.car_ids[eta]);
    //$(".box .callIn p").html($) // Unable to do this until we fix epochTime/create 
    // way to call the time.
    if ($.now() > $scope.epochTime) {
      var requestUrl = "https://api.uber.com/v1/requests";
      var requestParams = {
        'product_id': $scope.times[eta],
        'start_latitude': curr_lat,
        'start_longitude': curr_long,
        'end_latitude': null, //Get What the endtime is from Tim.
        'end_longitude': null //Get what the endtime is from Tim.
      };
      request_id = $http.post(requestUrl, requestParams).then(function(response){return response.request_id}, function(response){console.log("error")});
      var displayUrl = "https://api.uber.com/v1/requests/{" + request_id + "}/map";
      map = $http.get(displayUrl).then(function(response){return response.href});
      $(".map").html("<img src='" + map + "></img>");
    }
    //$(".box .timeLeft p").html($scope.epochParser($scope.epochTime - $.now()/1000, "time"));
    // We should be able to create a server in order to store user's time request data.

    // Top: Map of uber drivers nearby
    // Middle-bottom: Time left until requested time, minimum ETA of driver
    // Driver ETA: calling in [(time left - minimum ETA)]
    //}
  }

  $scope.cancel = function() {
    $state.transitionTo("dash");
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
            return ($scope.prependZero(hours) + " : " + $scope.prependZero(minutes)) + " " + am_pm;
          }
        }
      }

  $scope.prependZero = function(param) {
        if (String(param).length < 2) {
          return "0" + String(param);
        }
        return param;
      }

  $scope.estimateUber = function(car_ids) {
    var url = "https://api.uber.com/v1/requests/estimate";
    for (car in $scope.car_ids) {
      var parameters = {
        'product_id': car,
        'start_latitude': $scope.latitude,
        'start_longitude': $scope.longitude,
      }    
      $http.post(url, parameters).then(function(response){$scope.times.push(response.pickup_estimate);}, function(response){console.log("error");});
    }
    return $scope.times.indexOf(Math.min.apply(Math, $scope.times));
  }
})
