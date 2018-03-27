var markers = [];
// self view model function takes the locations data into its constructor
function ViewModel(data) {
    self = this;

    self.locations = data;
    self.searchInput = ko.observable("");
    self.locationFilter = ko.computed(function () {
        var locationsFiltered = [];
        if (self.searchInput == "") {
            return self.locations;
        }
        for (let i = 0; i < self.locations.length; i++) {
            if (self.locations[i].title.toLowerCase().includes(self.searchInput().toLowerCase())) {
                locationsFiltered.push(self.locations[i]);
            }
        }
        return locationsFiltered;
    });
    self.filter = function () {
        for (let i = 0; i < markers.length; i++) {
            // if the title includes any letter of search input
            if (markers[i].title.toLowerCase().includes(self.searchInput().toLowerCase())) {
                markers[i].setVisible(true);

            } else {
                markers[i].setVisible(false);

            }
        }
    }

}

var viewModel = new ViewModel(Locations);
// call the filter everytime the input gets a value
viewModel.searchInput.subscribe(function () {
    viewModel.filter();
});

// toogle de animation when you click on a marker
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
        center: Locations[0]['position'],
        zoom: 12,
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
            populateInfoWindow(this);
            toggleAnimation(this)
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

        // Foursquare API 
        var baseUrl = 'https://api.foursquare.com/v2/venues/search?';
        ClientID = 'FVF5KYDFF3BSDWOZ52NJEKHVIYCMVJB4C4DMPUCSX2LGYV2E';
        ClientSecret = 'PV14NKEGXRB43D1XCC41FGYAQ4PQQ4P2AQDXNCYMJGR0MUW2';
        foursquareUrl = baseUrl +'limit=1&ll='+marker.getPosition().lat()+','+marker.getPosition().lng()+'&client_id='+ClientID+'&client_secret='+ClientSecret+'&v=20140806&m=foursquare'
        $.getJSON(foursquareUrl)
            .done(function (data) {
                var currentVenue = data.response.venues[0];
                console.log(currentVenue)
                var placeName = currentVenue.name;
                var placeAddress = currentVenue.location.formattedAddress;
                var lat =  currentVenue.location.lat;
                var lng =  currentVenue.location.lng;
                windowContent = '<div><p><strong>Name: </strong>' + placeName + '</p>' +
                    '<p><strong>Address: </strong>  ' + placeAddress + '</p>'+
                    '<p>'+lat+', '+lng+'</p>' +'</div>';
                // Creating the content for the info window
                largeInfowindow.setContent('<div class="info-window" ><h4>' + marker.title + '</h4></div>' + windowContent);
                // Assign the infowindow to its marker
                largeInfowindow.open(map, marker);
            })
            .fail(function (data) {
                alert("something went wrong with Foursquare");

            })
    }
}
// Activates knockout.js
ko.applyBindings(viewModel);