var map;
var markers = [];
var globalMapPoints = [];
var largeInfoWindow;
var bounds;

var MapPoint = function(data, id) {
    this.title = data.title;
    this.location = {lat: data.location.lat, lng: data.location.lng};
    this.id = id;

    this.showMarker = function(){
        if(markers[this.id] != null){
            markers[this.id].setVisible(true);
        }
    };

    this.hideMarker = function(){
        markers[this.id].setVisible(false);
    };

    this.selectThisPoint = function(){
        marker = markers[this.id];
        populateInfoWindow(marker, largeInfoWindow);
        zoomToArea(marker);
    };
};

var AllLocations = function(){
    this.filter = ko.observable('');

    this.staticData = [
        {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
        {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
        {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
        {title: 'East Village Studio', location: {lat: 40.7281777, lng: -73.984377}},
        {title: 'TriBeCa Artsy Pad', location: {lat: 40.7195264, lng: -74.0089934}},
        {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
    ];

    this.mapPoints = [
        new MapPoint(this.staticData[0], 0),
        new MapPoint(this.staticData[1], 1),
        new MapPoint(this.staticData[2], 2),
        new MapPoint(this.staticData[3], 3),
        new MapPoint(this.staticData[4], 4),
        new MapPoint(this.staticData[5], 5)
    ];

    this.filteredPoints = ko.computed(function(){
       var filter = this.filter().toLowerCase();
       if(!filter){
           for(var i = 0; i < this.mapPoints.length; i++){
               this.mapPoints[i].showMarker();
           }
           return this.mapPoints;
       } else{
           var resultPoints = ko.utils.arrayFilter(this.mapPoints, function(mapPoint){
               return stringStartsWith(mapPoint.title.toLowerCase(), filter);
           });
           for(var j = 0; j < this.mapPoints.length; j++){
               this.mapPoints[j].hideMarker();
           }
           for(var k = 0; k < resultPoints.length; k++){
               resultPoints[k].showMarker();
           }
           return resultPoints;
       }
    }, this);

    globalMapPoints = this.mapPoints;
};

ko.applyBindings(new AllLocations());

function initMap(){
    // Creates a new map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.7413549, lng: -73.9980244},
        zoom: 8
    });

    largeInfoWindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();

    // Use the location array to create an array of markers
    for (var i = 0; i < globalMapPoints.length; i++){
        var position = globalMapPoints[i].location;
        var title = globalMapPoints[i].title;

        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            id: i
        });
        // Push the marker to our markers array
        markers.push(marker);
        // Extend boundaries for each marker added
        bounds.extend(marker.position);
        // Set listener for infoWindow
        marker.addListener('click', function(){
            populateInfoWindow(this, largeInfoWindow);
        });
    }

    showListings();
}

// Takes input value of given area and locates it, then zooms to that area
function zoomToArea(marker){
    map.setCenter(marker.position);
    map.setZoom(15);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){
        marker.setAnimation(null);
    }, 3000);
}

// Populate the infoWindow when a marker is clicked. Only one will be open at a time
function populateInfoWindow(marker, infoWindow){
    // Check if window is already open on this marker
    if(infoWindow.marker != marker){
        infoWindow.marker = marker;
        infoWindow.setContent(marker.title);
        infoWindow.open(map, marker);
        // Clear marker if infoWindow is closed
        infoWindow.addListener('closeclick', function(){
            infoWindow.setMarker = null;
        });
    }
}

// Loop through and display all markers
function showListings(){
    var bounds = new google.maps.LatLngBounds();
    // Extend boundaries of map for each marker
    for (var i = 0; i < markers.length; i++){
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

// Hides all markers
function hideListings(){
    for(var i = 0; i < markers.length; i++){
        markers[i].setMap(null);
    }
}

// Returns true for strings that begin with given subString
// This function is source code from Knockout source files, removed in production versions
function stringStartsWith(string, subString){
    string = string || '';
    if(subString.length > string.length){
        return false;
    } else {
        return string.substring(0, subString.length) === subString;
    }
}