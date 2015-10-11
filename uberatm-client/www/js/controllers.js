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
            var minutes = parseInt((val / 60) % 60);

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

.controller('StartOverlayCtrl', function($scope, $http, $state, $interval) {
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
  $scope.formData.showPage = 0;
  $scope.formData.nextStopName = "Home";
  $scope.formData.nextUberMinutes = 5;
  $scope.formData.travelStatus = -1; // 0 still, 1 public, 2 uber, 4 finished.
  $scope.formData.uberCalledStatus = false;
  $scope.formData.currentTime = 70000;

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
      console.log('startPos', $scope.startPos);
      var marker = new H.map.Marker({
        lat: $scope.startPos.position[0],
        lng: $scope.startPos.position[1]
      });
      $scope.map.addObject(marker);
      $scope.formData.showPage = 1;
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
      $scope.formData.showPage = 2;
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
    var result = response.data;
    console.log('route', result);
    $scope.route = result.response.route[0].leg[0].maneuver;
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

    // setup gogogo;
    $scope.setup_gogogo($scope.route);
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

   /* a simplied version for demo */
   $scope.getUberCoordinatesSimple = function(maneuver) {
      var upperThres = 20 * 60, lowerThres = 300;
      var slat = $scope.startPos.position[0];
      var slong = $scope.startPos.position[1];
      var elat = $scope.startPos.position[0];
      var elong = $scope.startPos.position[1];
      var distance = 0;
      var uber_info = [];
      for(var i = 0; i < maneuver.length - 1; i++) {
        var step = maneuver[i];
        if(step.travelTime < lowerThres) continue;
        if(step.travelTime < upperThres) {
          elat = step.position.latitude;
          elong = step.position.longitude;
          distance += step.length;
        }else{
          if(distance > 0) {
            uber_info.push({
              slat: slat,
              slong: slong,
              elat: elat,
              elong: elong,
              distance: distance,
              travelTime: distance / 17.0,
              type: 'uber',
              instruction: step.instruction
            });
          }
          uber_info.push({
            slat: elat,
            slong: elong,
            elat: step.position.latitude,
            elong: step.position.longitude,
            distance: step.length,
            travelTime: step.travelTime,
            type: 'public'
          });
          distance = 0;
          slat = step.position.latitude;
          slong = step.position.longitude;
        }
      }
      var step = maneuver[maneuver.length - 1];
      if(distance > 0) {
        uber_info.push({
          slat: slat,
          slong: slong,
          elat: step.position.latitude,
          elong: step.position.longitude,
          distance: distance,
          travelTime: distance / 17.0,
          type: 'uber'
        });
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
    for (car in car_ids) {
      var parameters = {
        'product_id': car,
        'start_latitude': $scope.latitude,
        'start_longitude': $scope.longitude,
      }    
      $http.post(url, parameters).then(function(response){$scope.times.push(response.pickup_estimate);}, function(response){console.log("error");});
    }
    return $scope.times.indexOf(Math.min.apply(Math, $scope.times));
  }
  $scope.getUberCarIds = function(lat, lng, callback) {
    var url = "http://crossorigin.me/https://api.uber.com/v1/products";

    var parameters = {
        'server_token': '3_hEHw2oOLy9jPtAYc-fBXqWMHXmP2WVChp1Kjpf',
        'latitude': lat,
        'longitude': lng
    };

    $http({
      method: 'GET',
      url: url,
      params: parameters
    }).then(function successCallback(response) {
      console.log('uber', response);
      var car_ids = []
      for (var product in response.data.products) {
        car_ids.push(product.product_id);
      }
      callback(car_ids);
      // do something with the route we found.
    }, function errorCallback(response) {
      console.log(response.status, "errorcode");
    });
  };

  $scope.estimateUberEta = function(lat, lng, callback) {
    // TODO: hack;
    callback(Math.floor(Math.random() * 10));
    return;

    $scope.getUberCarIds(lat, lng, function(car_ids) {
      var url = "http://crossorigin.me/https://api.uber.com/v1/requests/estimate";
      var times = [];
      if(car_ids.length == 0) 
        return;
      var car = car_ids[0];
      var parameters = {
        'product_id': car,
        'start_latitude': $scope.latitude,
        'start_longitude': $scope.longitude,
      }    
      $http({
        method: 'POST',
        url: url,
        params: parameters
      }).then(function successCallback(response) {
        console.log('uber estimate', response);
        callback(eta);
        // do something with the route we found.
      }, function errorCallback(response) {
        console.log(response.status, "errorcode");
        callback(Math.floor(Math.random() * 10));
      });
    })
  }

  $scope.setup_gogogo = function(manuver) {
    var startTime = $scope.epochTime; 
    $scope.startTime = startTime - 1800; // half an hour in advance.
    $scope.speedX = 60;                    // how many X speed up for demo.
    $scope.counter = 0;
    $scope.lag = 3;                      // timer period in secons.
    $scope.stage = -1;
    // setInterval($scope.gogogo, $scope.lag * 1000);
    var uber_info = $scope.getUberCoordinatesSimple(manuver);
    console.log('uber', uber_info);
    $scope.uber_info = uber_info;

    // mimic.
    // var time = $scope.startTime + 30 * 60;
    // $scope.formData.currentTime = time;
    // var nextTime = $scope.startTime;
    // var stage = $scope.stage;
    // var uber_info = $scope.uber_info;
    // console.log('uber_info', uber_info);
    // if(stage == -1) {
    //   var lng = uber_info[0].slong;
    //   var lat = uber_info[0].slat;
    // }else{
    //   var lng = uber_info[stage].elong;
    //   var lat = uber_info[stage].elat;
    // }
    // $scope.estimateUberEta(lat, lng, function(eta) {
    //   console.log('eta', eta);
    //   console.log('time', time);
    //   console.log('epochTime', $scope.epochTime);
    //   // update stage.
    //   if(time >= nextTime) {
    //     if(uber_info[stage].type == 'public') {
    //       $scope.formData.travelStatus = 1;
    //     }else if(uber_info[stage].type == 'uber') {
    //       $scope.formData.travelStatus = 2;
    //     }
    //     stage += 1;
    //     if(stage == uber_info.length) {
    //       $scope.formData.travelStatus = 4;
    //     }
    //   }

    //   // show itinerary.
    //   if($scope.formData.travelStatus == 0) {
    //     if($scope.epochTime - time > eta * 60) {
    //       $scope.formData.nextUberMinutes = ($scope.epochTime - time - eta * 60) / 60
    //     }else{
    //       $scope.formData.uberCalledStatus = true;
    //     }
    //   }else if($scope.formData.travelStatus == 1) { // public.

    //   }
    // });

    $scope.nextTime = $scope.epochTime;
    $scope.nextEta = 0;

    var lng = uber_info[0].slong;
    var lat = uber_info[0].slat;

    $scope.map.setCenter({
      lat: lat,
      lng: lng
    });

    $scope.estimateUberEta(lat, lng, function(eta) {
      $scope.nextEta = eta;
      $scope.formData.travelStatus = 0;
      $interval($scope.gogogo, 1000);
    });
  }

  $scope.gogogo = function() {
    var time = $scope.startTime + $scope.counter * $scope.lag * $scope.speedX;
    
    $scope.formData.currentTime = time;

    var stage = $scope.stage;
    var uber_info = $scope.uber_info;

    console.log('time', time);
    console.log('stage', stage);
    console.log('uber_info', uber_info);
    console.log('pos', lng, lat);

    console.log('eta', $scope.nextEta);
    console.log('status', $scope.formData.travelStatus)
    // update stage.

    if(time >= $scope.nextTime) {
      stage += 1;
      if(stage == uber_info.length) {
        $scope.formData.travelStatus = 4;
      }else{
        $scope.map.setCenter({
          lat: uber_info[stage].elat,
          lng: uber_info[stage].elong,
        });

        $scope.stage = stage;
        if(uber_info[stage].type == 'public') {
          $scope.formData.travelStatus = 1;
          $scope.nextTime = time + uber_info[stage].travelTime;
          var lng = uber_info[stage].elong;
          var lat = uber_info[stage].elat;
          $scope.estimateUberEta(lat, lng, function(eta) {
            $scope.nextEta = eta;
          });
        }else if(uber_info[stage].type == 'uber') {
          $scope.formData.travelStatus = 2;
          $scope.formData.uberCalledStatus = false;
          if(uber_info[stage].instruction) {
            $scope.formData.nextStopName = uber_info[stage].instruction;
          }else{
            $scope.formData.nextStopName = 'next stop';
          }
          $scope.nextTime = time + uber_info[stage].travelTime
        }

        document.getElementById('next-stop').innerHTML = $scope.formData.nextStopName;
      }
      
    }

    // show itinerary.
    if($scope.formData.travelStatus == 0 || $scope.formData.travelStatus == 1) {
      if($scope.nextTime - time > $scope.nextEta * 60) {
        $scope.formData.nextUberMinutes = Math.floor(($scope.nextTime - time - $scope.nextEta * 60) / 60);
      }else{
        $scope.formData.uberCalledStatus = true;
      }
    }else{
      $scope.formData.uberCalledStatus = false;
    }

    $scope.counter += 1;
  }

  $scope.getLocation("california memorial stadium", function(response) {
    console.log('warm up', response);
  }) // a warm-up request.

})
