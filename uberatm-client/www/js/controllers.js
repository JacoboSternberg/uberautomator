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
  $scope.deptAddresses = [];
  $scope.destAddresses = [];
  $scope.formData = {};
  $scope.addressQueryInProcess = false;
  $scope.deptAddressLastQuery = "";
  $scope.destAddressLastQuery = "";
  $scope.candidateAddressResults = {}
  $scope.times = []
  $scope.car_ids = []
  $scope.latitude = -1;
  $scope.longitude = -1;
  $scope.formData.showSourcePage = true;
  $scope.formData.showDestinationPage = false;

  // deciding which block of inputs to shown.
  $scope.input1Shown = true;

  $scope.useCurrentPosition = function(position) {
     $scope.latitude = position.coords.latitude;
     $scope.longitude = position.coords.longitude;
  }

  $scope.mapCreated = function(map, ui) {
    $scope.map = map;
    $scope.ui = ui;
  };

  if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition($scope.useCurrentPosition);
  } else {
     console.log("Unable to find current location");
  }

  // autocompletion for departure address.
  setInterval(function() {
    var deptAddress = $scope.formData.deptAddress;
    if(!deptAddress || deptAddress == "" || $scope.latitude == -1) {
      $scope.deptAddresses = []
      return;
    }
    if(deptAddress == $scope.deptAddressLastQuery) {
      return;
    }
    if($scope.addressQueryInProcess == true) {
      return;
    }
    // start auto-completion.
    $scope.addressQueryInProcess = true;

    $scope.getLocation(deptAddress, function(response) {
      console.log('response', response);
      var candidateAddressResults = $scope.getCandidateAddress(response);
      $scope.candidateAddressResults = candidateAddressResults;
      addresses = []
      for(var key in candidateAddressResults) {
        addresses.push(key);
      }
      $scope.deptAddresses = addresses.slice(0, 3);
      $scope.addressQueryInProcess = false;
      $scope.deptAddressLastQuery = deptAddress;
    });
  }, 300);

  // autocompletion for destination address.
  setInterval(function() {
    var targetAddress = $scope.formData.destAddress;
    if(!targetAddress || targetAddress == "" || $scope.latitude == -1) {
      $scope.destAddresses = [];
      return;
    }
    if(targetAddress == $scope.destAddressLastQuery) {
      return;
    }
    if($scope.addressQueryInProcess == true) {
      return;
    }
    // start auto-completion.
    $scope.addressQueryInProcess = true;
    $scope.getLocation(targetAddress, function(response) {        
      console.log('response', response);
      var candidateAddressResults = $scope.getCandidateAddress(response);
      $scope.candidateAddressResults = candidateAddressResults;
      addresses = []
      for(var key in candidateAddressResults) {
        addresses.push(key);
      }
      $scope.destAddresses = addresses.slice(0, 3);
      $scope.addressQueryInProcess = false;
      $scope.destAddressLastQuery = targetAddress;
    });
  }, 300);

  $scope.onSetDeptAddress = function(address) {
    console.log('on set', address);
    $scope.deptAddressLastQuery = address;
    $scope.formData.deptAddress = address;
    $scope.deptAddresses = [];
    setTimeout(function() {
      // $scope.deptAddressLastQuery = $scope.formData.deptAddress;
      // $scope.formData.deptAddress = address;
      // $scope.addresses = [];  
    }, 3000);
  }

  $scope.onSetDestAddress = function(address) {
    $scope.formData.destAddress = address;
    $scope.destAddressLastQuery = $scope.formData.destAddress;
    $scope.destAddresses = [];  
    setTimeout(function() {
      // $scope.formData.destAddress = address;
      // $scope.destAddressLastQuery = $scope.formData.destAddress;
      // $scope.destAddresses = [];  
    }, 3000);
  }

  $scope.onClickHere = function() {
    $scope.getLocation("*", function(response) {
      var candidateAddressResults = $scope.getCandidateAddress(response);
      addresses = []
      for(var key in candidateAddressResults) {
        addresses.push(key);
      }
      if(addresses.length > 0) {
        $scope.formData.deptAddress = addresses[0];
      }
    })
  }

  $scope.onSelectDeparture = function() {
    $scope.getLocation($scope.formData.deptAddress, function(response) {
      var candidateAddressResults = $scope.getCandidateAddress(response);
      var candidateAddressKeys = $scope.getCandidateAdressKeys(candidateAddressResults);
      $scope.startPos = candidateAddressResults[candidateAddressKeys[0]];
      var marker = new H.map.Marker({
        lat: $scope.startPos.position[0],
        lng: $scope.startPos.position[1]
      });
      $scope.map.addObject(marker);
    })
  }

  $scope.onSelectDestination = function() {
    $scope.getLocation($scope.formData.destAddress, function(response) {
      var candidateAddressResults = $scope.getCandidateAddress(response);
      console.log('candidates', candidateAddressResults);
      var candidateAddressKeys = $scope.getCandidateAdressKeys(candidateAddressResults);
      $scope.endPos = candidateAddressResults[candidateAddressKeys[0]];
      console.log('endPos', $scope.endPos);
      $scope.getPublicTransportRoute(
        $scope.startPos.position[0],
        $scope.startPos.position[1],
        $scope.endPos.position[0],
        $scope.endPos.position[1],
        $scope.drawRouteOnMap);
    })
  }


  $scope.getCurrentAddress = function(lati, longi) {
      var here_url = "http://reverse.geocoder.cit.api.here.com/6.2/reversegeocode.json" +
	  "geocode.json?app_id=evk3TrU4UcresAseG8Da&app_code=z4yYohROherMZ57eHTsQUg&gen=9";
      $http({
	      method: 'GET',
	      url: here_url,
	      params: {
          mode: "retrieveAdresses",
          prox: lati + "," + longi
        }
      }).then(function successCallback(response) {
	       return response.data;
      }, function errorCallback(response) {
	       console.log(response, "errorcode");
      });
  }

  $scope.getLocation = function (user_address, callback) {
    if(!user_address) 
      return;
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
      console.log('get location', response);
      callback(response);
      // callback(addresses);
      // var latitude = address.Response.View.Result.Location.NavigationPosition.Latitude;
      // var longitude = address.Response.View.Result.Location.NavigationPosition.Longitude;
      // $scope.callUber(); //We now call uber since it worked
    }, function errorCallback(resonse) {
      console.log("error");
      //Display error in the UI
    });
  }

  $scope.getCandidateAddress = function(response) {
    var results = {}
    if(response.data.results.items.length > 0) {
      for(var result of response.data.results.items) {
        var title = result.title;
        results[title] = result;
      }
    }
    return results;
  }

  $scope.getCandidateAdressKeys = function(candidates) {
    var keys = [];
    for(var key in candidates) {
      keys.push(key);
    }
    return keys;
  }

  $scope.getPublicTransportRoute = function(startLat, startLong, endLat, endLong, callback) {
    var here_url = "http://route.cit.api.here.com/routing/7.2/calculateroute.json?app_id=" + HERE_APP_ID
    + "&app_code=" + HERE_APP_CODE;
    $http({
      method: 'GET',
      url: here_url,
      params: {
        waypoint0: "geo!" + startLat + "," + startLong,
        waypoint1: "geo!" + endLat + "," + endLong,
        mode: "fastest;publicTransport",
        combineChange: "true",
        representation: "display"
        // arrival: //Add the correct time and date here. format:2013-09-09T12:44:56
      }
    }).then(function successCallback(response) {
      callback(response);
      // do something with the route we found.
    }, function errorCallback(response) {
      console.log(response.status, "errorcode");
    });
  }

  $scope.drawRouteOnMap = function(response) {
    result = response.data;
    var map = $scope.map;
    var route,
      routeShape,
      startPoint,
      endPoint,
      strip;
    if(result.response.route) {
      // Pick the first route from the response:
      route = result.response.route[0];
      // Pick the route's shape:
      routeShape = route.shape;

      // Create a strip to use as a point source for the route line
      strip = new H.geo.Strip();

      // Push all the points in the shape into the strip:
      routeShape.forEach(function(point) {
        var parts = point.split(',');
        strip.pushLatLngAlt(parts[0], parts[1]);
      });

      // Retrieve the mapped positions of the requested waypoints:
      startPoint = route.waypoint[0].mappedPosition;
      endPoint = route.waypoint[1].mappedPosition;

      // Create a polyline to display the route:
      var routeLine = new H.map.Polyline(strip, {
        style: { strokeColor: 'blue', lineWidth: 10 }
      });

      // Create a marker for the start point:
      var startMarker = new H.map.Marker({
        lat: startPoint.latitude,
        lng: startPoint.longitude
      });

      // Create a marker for the end point:
      var endMarker = new H.map.Marker({
        lat: endPoint.latitude,
        lng: endPoint.longitude
      });

      // Add the route polyline and the two markers to the map:
      map.addObjects([routeLine, startMarker, endMarker]);

      // Set the map's viewport to make the whole route visible:
      map.setViewBounds(routeLine.getBounds());
    }
  }

  /**
   * Returns on array containing the start and end destinations of 1 or more
   * uber rides. Based on the amount of public transportation needed.
   * threshold corresponds to the minimum amount of time in seconds for which
   * we will call uber if we are walking. Uber ride return format:
   * (slat, slong, elat, elong).
   */
  $scope.getUberCoordinates = function(response, threshold) {
     var steps = response.route[0].leg[0].maneuver;
     var uber_info = [];
     var trip_length = 0;
     var continuing_trip = false;
     var slat = 0;
     var slong = 0;
     var elat = 0;
     var elong = 0;
     for (i=0; i < steps.length - 1; i++) {
       var step = steps[i];
       if (step._type = "PrivateTransportManeuverType") {
         if (!continuing_trip) {
            slat = step.position.latitude;
            slong = step.position.longitude;
            continuing_trip = true;
         }
         trip_length += step.travelTime;
       } else if (step._type = "PublicTransportManeuverType") {
          if (trip_length >= threshold) {
            elat = step.position.latitude;
            elong = step.position.longitude;
            continuing_trip = false;
            uber_info.push((slat, slong, elat, elong));
          }
          trip_length = 0;
       }
     }
     var step = steps[step.length - 1]; //Last step is always just arriving with 0 time.
     if (trip_length >= threshold) {
       elat = step.position.latitude;
       elong = step.position.longitude;
       uber_info.push((slat, slong, elat, elong));
     }
     return uber_info;
   }
  

  $scope.getPrivateTransportRoute = function(startLat, startLong, endLat, endLong) {
    var here_url = "http://route.cit.api.here.com/routing/7.2/calculateroute.json?app_id=" + HERE_APP_ID
    + "&app_code=" + HERE_APP_CODE;
    $http({
      method: "GET",
      url: "here_url",
      params: {
        mode: "fastest;car;",
        waypoint0: "geo!" + startLat + "," + startLong,
        waypoint1: "geo!" + endLat + "," + endLong,
        departure: "2015-10-11T00:00:00" //Placeholder, replace with user date in same format.
      }
    }).then(function successCallback(response) {
      console.log("Call worked for private");
    }, function errorCallback(response) {
      console.log(response.status, "errorcode");
    });
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

  $scope.getLocation("california memorial stadium", function(response) {
    console.log('warm up', response);
  }) // a warm-up request.

})
