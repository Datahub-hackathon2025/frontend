var sensorTypes = []

var mymap = L.map('map', {
    minZoom: 10,
    maxZoom: 12
})

mymap.setView([56.835, 60.612], 13);
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

function sortByDate( arr ) {
    return arr.sort(
        function(a, b){
            if (a['datetime'] < b['datetime']) {
                return -1;
            }
            if (a['datetime'] > b['datetime']) {
                return 1;
            }
            return 0;
        });
}

function poll( sensorid, graph ) {
  clearTimeout(pollTimer);
  $.get({url:"/api/points/", data:("sensor="+sensorid), success:function( data ) {
    data = sortByDate(data);

    var point = data[data.length-1]["value"];
    var label = data[data.length-1]["datetime"].slice(11,19);

    if (graph && (graph.data.labels[graph.data.labels.length-1] < label)) {
      graph.data.labels.push(label);
      graph.data.datasets[0].data.push(point);

      if (graph.data.datasets[0].data.length > 10) {
          graph.data.labels.shift();
          graph.data.datasets[0].data.shift();
      }
      graph.update();
    }
    pollTimer = setTimeout(function() {
      if (polling) { 
        poll( sensorid, chart ) 
      }
    }, 2300);

  }});
}

var checkboxes = document.getElementsByTagName('input');
var pollTimer = null;
var polling = 0;

for (var i=0; i<checkboxes.length; i++)  {
  if (checkboxes[i].type == 'checkbox')   {
    checkboxes[i].checked = false;
  }
}
var chart = 0;
function renderChart( sensorid, name ) {
  polling = 0;
  clearTimeout(pollTimer);
  var ctx = document.getElementById("chart").getContext('2d');
  $.get({url:"/api/points/", data:("sensor="+sensorid), success:function( data ) {
    var points = [];
    var labels = [];
    data = sortByDate(data);
    data = data.slice(-10);
    for (var i = 0; i < data.length; i++) {
      points.push(data[i]["value"]);
      labels.push(data[i]["datetime"].slice(11,19));
    }

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ctx, {
      type: 'line',
      // The data for our dataset
      data: {
        labels: labels,
        datasets: [{
          label: name,
          backgroundColor: 'rgb(00, 158, 219)',
          borderColor: 'rgb(50, 75, 154)',
          data: points
        }]
      },

      // Configuration options go here
      options: {}
    });
    polling = 1;
    $("#chart-well").css({"display":"block"});
    
    pollTimer =  setTimeout(function() {
      poll( sensorid, chart ) 
    }, 2500);
    
  }});
}

var sensors = []
var markers = []
function getSensors(elem) {
  if (elem.checked) {
    sensorTypes.push(elem.name);
  } else {
    var index = sensorTypes.indexOf(elem.name);
    sensorTypes.splice(index, 1);
  }
  if (sensorTypes.length > 0) {
    $.get({url:"/api/sensors/", data:"types="+sensorTypes, success:function( data ) {
      sensors = $.map(data, function(el) {return el});
      var sensorsLen = sensors.length;
      for (var i = 0; i < markers.length; i++) {
        markers[i].remove();
      }
      markers = [];
      for (var i = 0; i < sensorsLen; i++) {
        var sensor = sensors[i];
        var marker = L.marker([sensor["latitude"], sensor["longitude"]]).addTo(mymap).setIcon(icons[sensor["sensor_type"]]);
        var popupContent = sensor["name"];
        marker.bindPopup(popupContent);
        marker.sensor = sensor;
        marker.on("click", function (event) { renderChart(event.target.sensor["pk"], event.target.sensor["name"]) });
        markers.push(marker);
      }
    }})
    .fail(function() {
      alert( "error" );
    })
  } else {
    for (var i = 0; i < markers.length; i++) {
      markers[i].remove();
    }
  }
}

function makeHeatMap(points) {
    const heatmap_points = [];
    let max_current_value = points[0]['current_value']['value'];

    for (const point of points){
        if (point['current_value']) {
            max_current_value = Math.max(point['current_value']['value'], max_current_value)
        }
    }

    for (const point of points){
        if (point['current_value']) {
            heatmap_points.push([point['latitude'], point['longitude'], point['current_value']['value']/(0.05*max_current_value+0.0001)])
        }
    }
    const heat = L.heatLayer(heatmap_points, {radius: 150, blur: 50, max: 1.5, maxZoom: 16})
    return heat;
}

function getSensorsOfType(sensors, type){
    const filtered = [];
    for (const point of sensors){
        if (point['sensor_type'] === type){
            filtered.push(point)
        }
    }
    return filtered;
}

let heatmap_layer = null;
function drawPollutionHeatMap(map, markers) {
    removePollutionHeatMap()
    const pollution_sensors = getSensorsOfType(sensors, 'pollution');
    if (pollution_sensors && pollution_sensors.length !== 0) {
        heatmap_layer = makeHeatMap(pollution_sensors);
        mymap.addLayer(heatmap_layer);
    }
}

function removePollutionHeatMap() {
    if (heatmap_layer){
        mymap.removeLayer(heatmap_layer);
        heatmap_layer = null;
    }
}

function togglePollutionMap() {
    if (heatmap_layer) {
        removePollutionHeatMap();
    } else {
        drawPollutionHeatMap();
    }
}
