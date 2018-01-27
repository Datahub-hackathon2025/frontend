var sensorTypes = []

var mymap = L.map('map').setView([56.835, 60.612], 13);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZGV2c2FndWwiLCJhIjoiY2pjd2RhMzl0MGdhaDMzcW82eGx1amNpayJ9.9CJ5rqAdw90_Tf9FKj-XBw'
}).addTo(mymap);

var icons = {
  temp:L.icon({iconUrl: './resources/icon/Termo.png', iconSize: [18, 50]}),
  pollution:L.icon({iconUrl: './resources/icon/Dair.png', iconSize: [50, 27]}),
  electricity:L.icon({iconUrl: './resources/icon/Delec.png', iconSize: [50, 27]}),
  street_light:L.icon({iconUrl: './resources/icon/Light.png', iconSize: [37, 50]}),
  parking_lot:L.icon({iconUrl: './resources/icon/P.png', iconSize: [50, 50]}),
  water: L.icon({iconUrl: './resources/icon/Dwater.png', iconSize: [50, 25]})
};

/*
mymap.whenReady(function() {
  $.get("/api/sensors/", function( data ) {
    var sensors = $.map(data, function(el) {return el});
    var sensorsLen = sensors.length;
    for (var i = 0; i < sensorsLen; i++) {
      var sensor = sensors[i];
      var marker = L.marker([sensor["latitude"], sensor["longitude"]]).addTo(mymap).setIcon(icons[sensor["sensor_type"]]);
      var popupContent = sensor["name"];
      marker.bindPopup(popupContent);
    }
  })
  .fail(function() {
    alert( "error" );
  })
});
*/

var checkboxes = document.getElementsByTagName('input');

for (var i=0; i<checkboxes.length; i++)  {
  if (checkboxes[i].type == 'checkbox')   {
    checkboxes[i].checked = false;
  }
}

var markers = []
function getSensors(elem) {
  if (elem.checked) {
    sensorTypes.push(elem.name);
  } else {
    var index = sensorTypes.indexOf(elem.name);
    sensorTypes.splice(index, 1);
  }
  if (sensorTypes.length > 0) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].remove();
    }
    markers = [];
    $.get({url:"/api/sensors/", data:"types="+sensorTypes, success:function( data ) {
      var sensors = $.map(data, function(el) {return el});
      var sensorsLen = sensors.length;
      for (var i = 0; i < sensorsLen; i++) {
        var sensor = sensors[i];
        var marker = L.marker([sensor["latitude"], sensor["longitude"]]).addTo(mymap).setIcon(icons[sensor["sensor_type"]]);
        var popupContent = sensor["name"];
        marker.bindPopup(popupContent);
        markers.push(marker);
      }
    }})
    .fail(function() {
      alert( "error" );
    })
  }
}
