var markers = []
// self view model function takes the locations data into its constructor
function ViewModel(data) {
    self = this;

    self.locations = data;
    self.searchInput = ko.observable("");
    self.locationFilter = ko.computed(function() {
        var locationsFiltered = [];
        if ( self.searchInput == "") {
            return self.locations;
        }
         for (let i = 0; i < self.locations.length; i++) {
            if(self.locations[i].title.toLowerCase().includes(self.searchInput().toLowerCase())) {
                locationsFiltered.push(self.locations[i]);
         }        
        }
        return locationsFiltered;
    }); 
    self.filter = function(){
        for (let i = 0; i < markers.length; i++) {
            // if the title includes any letter of search input
            if ( markers[i].title.toLowerCase().includes(self.searchInput().toLowerCase())){
                markers[i].setVisible(true);
                
            }
            else{
                markers[i].setVisible(false);
               
            }
        }
    }

}

var viewModel = new ViewModel(Locations);
// call the filter everytime the input gets a value
viewModel.searchInput.subscribe(function(){
    viewModel.filter();
});


function toggleAnimation(marker) {
    if (marker.getAnimation()) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.DROP);
    }
}


function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: Locations[1]['position'],
        zoom: 16,
    });

    largeInfowindow = new google.maps.InfoWindow();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < Locations.length; i++) {
        // Get the position from the location array.
        var position = Locations[i].position;
        var title = Locations[i].title;
        var id = Locations[i].id
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: id
        });

        marker.setMap(map)
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open the largeInfowindow at each marker.
        marker.addListener('click', function () {
            populateInfoWindow(self);
            toggleAnimation(self)
        });



    }
}

function populateInfoWindow(marker) {
    // Check to make sure the largeInfowindowis not already opened on self marker.
    if (largeInfowindow.marker != marker) {
        // Clear the largeInfowindow content to give the streetview time to load.
        largeInfowindow.setContent('');
        largeInfowindow.marker = marker;
        // Make sure the marker property is cleared if the largeInfowindow is closed.
        largeInfowindow.addListener('closeclick', function () {
            largeInfowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
                largeInfowindow.setContent('<div><h3>' + marker.title + '</h3></div><div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {

                largeInfowindow.setContent('<div><h3>' + marker.title + '</h3></div><div> </div>');
            }
        }
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open thelargeInfowindow on the correct marker.
        largeInfowindow.open(map, marker);
    }
}

// Activates knockout.js
ko.applyBindings(viewModel);