angular.module('starter.directives', ['ngCordova'])

.directive('map', function($cordovaGeolocation) {
  return {
    restrict: 'E',
    scope: {
      onCreate: '&'
    },

    link: function ($scope, $element, $attr) {

      function initialize() {
        var platform = new H.service.Platform({
          'app_id': HERE_APP_ID,
          'app_code': HERE_APP_CODE
        });

        var defaultLayers = platform.createDefaultLayers();

        // Instantiate (and display) a map object:
        var posOptions = {timeout: 10000, enableHighAccuracy: true};
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (pos) {
          console.log('GPS', pos);
          var map = new H.Map(
            $element[0],
            defaultLayers.normal.map,
            {
              zoom: 10,
              center: { lat: pos.coords.latitude, lng: pos.coords.longitude}
            }
          );

          // Add default behavior.
          var mapEvents = new H.mapevents.MapEvents(map);
          var behavior = new H.mapevents.Behavior(mapEvents);

          // var ui = H.ui.UI.createDefault(map, defaultLayers);
          var ui = null;  // no ui components.

          $scope.onCreate({
            map: map,
            ui: ui
          });
        }, function(err) {
          // error in getting geolocation.
        });
      }
      

      if (document.readyState === "complete") {
        initialize();
      } else {
        // google.maps.event.addDomListener(window, 'load', initialize);
      }
    }
  }
});
