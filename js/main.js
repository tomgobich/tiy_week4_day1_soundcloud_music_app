$(document).ready(function()
{
	// Weekly forecast array
	var weeklyForecast 	= [];
	var forecastUnit 	= JSON.parse(localStorage.getItem('unit'));
	var location 		= JSON.parse(localStorage.getItem('location'));

	// DOM selectors
	var $locationInput 	= $('#locationInput');
	var $forecastData 	= $('#forecastData');
	var $forecastUnit 	= $('#forecastUnit');

	// Is forecast unit undefined or null?
	if(forecastUnit === undefined || forecastUnit === null)
	{
		// Yes, default to imperial
		forecastUnit = "imperial";
	}

	// Is location input defined?
	if(location !== undefined || location !== null)
	{
		// Yes, set value to location input
		$locationInput.val(location);
	}



	// ------------------------------------------------------------
	// Forecast object constructor
	// ------------------------------------------------------------
	function Forecast(dayText, tempHigh, tempLow, condition, iconCode)
	{
		this.day 		= dayText;
		this.tempHigh 	= Math.round(tempHigh);
		this.tempLow 	= Math.round(tempLow);
		this.condition 	= condition;
		this.iconCode 	= iconCode;

		// ------------------------------------------------------------
		// Prepares link to icon file
		// ------------------------------------------------------------
		this.getIconImageURL = function()
		{
			var self = this;

			// Get filename from iconCode
			var filename = getIconFilename(self);

			// Did filename come back as number? (means it's openweathermap code still)
			if(typeof filename === typeof 0)
			{
				// Yes, pass in openweathermap icon to deal with exception
				return `http://openweathermap.org/img/w/${filename}.png`;
			}
			else
			{
				// No, pass in local icon image
				return `images/${filename}`;
			}
		}
	}



	// ------------------------------------------------------------
	// ------------------------------------------------------------
	// 
	// Event Listeners
	// 
	// ------------------------------------------------------------
	// ------------------------------------------------------------

	// Event listener for location input form
	$('#locationForm').on('submit', function(e)
	{
		// Prevent form from submitting
		e.preventDefault();

		// Get forecast data from openweathermap API using location from user input
		getForecastFromAPI();
	});


	// Event listener for forecast unit toggle
	$('#forecastUnit').on('click', function()
	{
		// Toggle forecast unit
		toggleForecastUnit();
	});



	// ------------------------------------------------------------
	// ------------------------------------------------------------
	// 
	// Getting & Displaying Forecast
	// 
	// ------------------------------------------------------------
	// ------------------------------------------------------------

	// Call API request on initial load run-through
	getForecastFromAPI();



	// ------------------------------------------------------------
	// Makes AJAX call to openweathermap API
	// ------------------------------------------------------------
	function getForecastFromAPI()
	{
		// Set focus to location input
		$locationInput.focus();

		// Set defaults if anything isn't set or loaded
		validateInput();

		// Visually update forecast unit for user
		setForecastUnit();

		// Set new location from input
		location = $locationInput.val();

		// AJAX call to openweatherdata api
		$.ajax({
			url: `http://api.openweathermap.org/data/2.5/forecast/daily?q=${location}&type=like&units=${forecastUnit}&cnt=7&APPID=ebf5e5843530b4f8cf4c0bd17b6b6048`,
			method: 'GET',
			success: function(data) { prepareWeeklyForecast(data); },
			error: function(err) { console.log("Error! Message: " + e.responseText); },
			complete: function() { console.log("All done!"); }
		})
	}



	// ------------------------------------------------------------
	// Strips needed data from API data and puts it in an object
	// ------------------------------------------------------------
	function prepareWeeklyForecast(data)
	{
		// Clear out weekly forecast array
		weeklyForecast = [];

		// Set global location
		location = data.city.name + ", " + data.city.country;

		// Display the city openweatherdata matched with user's input and add the country to the end
		$locationInput.val(location);

		// Save location to local storage
		localStorage.setItem('location', JSON.stringify(location));

		// Loop through forecast days
		data.list.forEach(function(day)
		{
			var date 		= new Date(day.dt * 1000),
				dayText 	= getDayText(date.getDay()),
				tempHigh 	= day.temp.max,
				tempLow 	= day.temp.min,
				condition 	= day.weather[0].description,
				iconCode 	= day.weather[0].icon;

			// Create new Forecast object and load with forecast data
			var forecastDay = new Forecast(dayText, tempHigh, tempLow, condition, iconCode);

			// Push into weekly forecast array
			weeklyForecast.push(forecastDay);
		});

		// Prepare HTML and display data
		displayWeeklyForecast();
	}



	// ------------------------------------------------------------
	// Sets Forecast Day's HTML and appends it to parent element
	// ------------------------------------------------------------
	function displayWeeklyForecast()
	{
		// Empty HTML element
		$forecastData.empty();

		// Loop through weekly forecast array
		weeklyForecast.forEach(function(day)
		{
			// Load data into HTML block
			var forecastBlock = 
			`
				<div class="forecast-day">
					<div class="details">
						<h3 class="day">${day.day}</h3>
						<p class="condition">${day.condition}</p>
					</div>
					<img class="forecast-icon" src="${day.getIconImageURL()}" alt="${day.condition}">
					<div class="temps">
						<p class="temp low"><img src="images/low.svg" alt="Low Temperature">${day.tempLow}&deg;</p>
						<p class="temp high"><img src="images/high.svg" alt="High Temperature">${day.tempHigh}&deg;</p>
					</div>
				</div> 
			`;

			// Append HTML block to DOM
			$forecastData.append(forecastBlock);
		});
	}



	// ------------------------------------------------------------
	// ------------------------------------------------------------
	//
	// Toggle Unit of Temperature
	//
	// ------------------------------------------------------------
	// ------------------------------------------------------------

	// ------------------------------------------------------------
	// Toggle the unit of measurement for temperature
	// ------------------------------------------------------------
	function toggleForecastUnit()
	{
		// Was unit of measurement imperial?
		if(forecastUnit === "imperial")
		{
			// Yes, toggle over to metric
			forecastUnit = "metric";
		}
		else
		{
			// No, toggle over to imperial
			forecastUnit = "imperial";
		}

		// Save new unit in local storage
		localStorage.setItem('unit', JSON.stringify(forecastUnit));

		// Visually update forecast unit for user
		setForecastUnit();

		// Change units in weeklyForecast objects mathematically 
		calculateUnits();

		// Update visually displayed temperatures
		displayWeeklyForecast();
	}



	// ------------------------------------------------------------
	// Toggle the unit of measurement for temperature
	// ------------------------------------------------------------
	function setForecastUnit()
	{
		// Is the unit matric?
		if(forecastUnit === "metric")
		{
			// Yes, add class metric to move toggle
			$forecastUnit.addClass('metric');
		}
		else
		{
			// No, remove class metric to move toggle
			$forecastUnit.removeClass('metric');
		}
	}



	// ------------------------------------------------------------
	// Calculate unit change from metric to imperial, vise versa
	// ------------------------------------------------------------
	function calculateUnits()
	{
		// Is user switching to metric?
		if(forecastUnit === "metric")
		{
			// Yes, loop through weeklyForecast array & change highs/lows to metric
			weeklyForecast.forEach(function(day)
			{
				day.tempHigh = Math.round((day.tempHigh - 32) / 1.8);
				day.tempLow  = Math.round((day.tempLow - 32) / 1.8);
			});
		}
		else
		{
			// No, loop through weeklyForecast array & change highs/lows to imperial
			weeklyForecast.forEach(function(day)
			{
				day.tempHigh = Math.round((day.tempHigh * 1.8) + 32);
				day.tempLow  = Math.round((day.tempLow * 1.8) + 32);
			});
		}
	}



	// ------------------------------------------------------------
	// ------------------------------------------------------------
	//
	// Utilities
	//
	// ------------------------------------------------------------
	// ------------------------------------------------------------

	// ------------------------------------------------------------
	// Validate location form input & forecast unit toggle
	// ------------------------------------------------------------
	function validateInput()
	{
		var locationFromForm = $locationInput.val();

		// Is the location undefined or empty?
		if(locationFromForm === undefined || locationFromForm.trim() === "")
		{
			// Use Cincinnati as default 
			location = 'Cincinnati, US';
			$locationInput.val(location);
		}
	}



	// ------------------------------------------------------------
	// Takes in icon code from API and sets different images to code
	// ------------------------------------------------------------
	function getIconFilename(self)
	{
		// Match icon code then return appropriate image name.type
		switch(self.iconCode)
			{
				case '01d':
					return 'sunny.svg';
					break;
				case '01n':
					return 'moon.svg';
					break;
				case '02d':
					return 'cloud-few.svg';
					break;
				case '02n':
					return 'cloud-few-night.svg';
					break;
				case '03d':
				case '03n':
				case '04d':
				case '04n':
					return 'cloud-scattered.svg';
					break;
				case '09d':
					return 'rainy.svg';
					break;
				case '09n':
					return 'rainy-night.svg';
					break;
				case '10d':
				case '10n':
					return 'rain.svg';
					break;
				case '11d':
				case '11n':
					return 'storm.svg';
					break;
				case '13d':
				case '13n':
					return 'snowflake.svg';
					break;
				case '50d':
				case '50n':
					return 'raindrop.svg';
					break;
				default:
					return self.iconCode;
					break;
			}
	}



	// ------------------------------------------------------------
	// Takes index of day from date and returns full day's text
	// ------------------------------------------------------------
	function getDayText(dayIndex)
	{
		// Match day index and return full text
		switch(dayIndex)
		{
			case 0:
				return 'Sunday';
				break;
			case 1:
				return 'Monday';
				break;
			case 2:
				return 'Tuesday';
				break;
			case 3:
				return 'Wednesday';
				break;
			case 4:
				return 'Thursday';
				break;
			case 5:
				return 'Friday';
				break;
			case 6:
				return 'Saturday';
				break;
			default:
				return 'Invalid Date';
				break;
		}
	}

});