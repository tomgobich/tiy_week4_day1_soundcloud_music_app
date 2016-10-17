$(document).ready(function()
{
	// DOM selectors
	var $searchInput 	= $('#searchInput');
	var $searchResults 	= $('#searchResults');



	// array to hold search results
	var searchResults = [];

	// Function constructor for songs (which are then loaded into searchResults array)
	function Song(id, cover, title, username, userAvatar, streamLink)
	{
		this.id 		= id;
		this.cover 		= cover;
		this.title 		= title;
		this.username 	= username;
		this.userAvatar = userAvatar;
		this.streamLink = streamLink;
	}


	// --------------------------------------------------
	// --------------------------------------------------
	//
	// Event Listeners
	//
	// --------------------------------------------------
	// --------------------------------------------------

	// Event listener for search form submission
	$('#searchForm').on('submit', function(e)
	{
		// Stop form from submitting
		e.preventDefault();

		// Get search input value
		var input = $searchInput.val();

		// Was something submitted?
		if(validateInput(input))
		{
			// Yes, send it to the API
			callSoundcloudAPI(input);
		}
	});

	// Event Listener for song block (controls song selection)
	$('body').on('click', '.song-block', function()
	{
		var id = this.id;
		var streamLink = null;

		// Loop through search result songs
		searchResults.forEach(function(song)
		{
			// Find the matching ID's
			if(id == song.id)
			{
				// Grab it's stream link
				streamLink = song.streamLink + '?client_id=03e4633e2d85874a921380e47cac705d';
			}
		});

		// Remove old active element, if there was one
		$('.song-block .active').removeClass('active');

		// Add new active element
		$(this).children('.song').addClass('active');

		// Animate audio player on-screen
		$('.audio-player').css('bottom', 0);

		// Add stream link to audio element's source
		$('#audioPlayer').attr('src', streamLink);

	});



	// --------------------------------------------------
	// Get data from Soundcloud API
	// --------------------------------------------------
	function callSoundcloudAPI(input)
	{
		SC.initialize({
			
			client_id: '03e4633e2d85874a921380e47cac705d'

		});

		// find all sounds of buskers licensed under 'creative commons share alike'
		SC.get('/tracks',
		{
			// Search for user query
			q: input

		}).then(function(tracks)
		{
		 	// Put needed data into an object
			loadDataToObject(tracks);

			// Display data from objects
			displayData();

		});
	}



	// --------------------------------------------------
	// Takes data from API and loads it into object
	// --------------------------------------------------
	function loadDataToObject(tracks)
	{
		// Loop through each search result
		tracks.forEach(function(track)
		{
			// Create new object to store data into
			var song = new Song();

			// Strip the fat off the API results
			song.id 		= track.id;
			song.cover 		= track.artwork_url;
			song.title 		= track.title;
			song.username 	= track.user.username;
			song.userAvatar = track.user.avatar_url;
			song.streamLink = track.stream_url;

			// Load object into array
			searchResults.push(song);
		});
	}



	// --------------------------------------------------
	// Display data from API
	// --------------------------------------------------
	function displayData()
	{
		// Clear old search results
		$searchResults.html('');

		// Loop through search results
		searchResults.forEach(function(track)
		{
			// Missing track cover?
			if(track.cover === null)
			{
				// Yes, set default image as track cover
				track.cover = "images/cover-default.svg";
			}

			// Create HTML element to display
			var songHTML = 
			`
				<div id="${track.id}" class="col-xs-4 col-md-3 song-block">
					<div class="song">
						<div class="cover-blur"></div>
						<div class="content">
							<div class="cover-block">
								<img class="cover-hover" src="images/play.svg">
								<img class="cover" src="${track.cover}">
							</div>
							<h2 class="song-title">${track.title}</h2>
							<div class="user">
								<img class="avatar" src="${track.userAvatar}">
								<h3 class="username">${track.username}</h3>
							</div>
						</div>
					</div> 
				</div>
			`;

			// Add HTML element to search results
			$searchResults.append(songHTML);
		});
	}



	// --------------------------------------------------
	// --------------------------------------------------
	//
	// Utilities
	//
	// --------------------------------------------------
	// --------------------------------------------------

	// --------------------------------------------------
	// Validate input
	// --------------------------------------------------
	function validateInput(input)
	{
		// Is the input empty, undefined, or null?
		if(input.trim() === "" || input === undefined || input === null)
		{
			// Yes, alert the user
			alert('Please enter a song/artist and try again');

			// Return false, validation failed, do not pass go
			return false;
		}

		// Return true, and continue onward
		return true;
	}

});