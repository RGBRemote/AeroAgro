document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const droneId = localStorage.getItem('droneId');
    
    if (!token || !droneId) {
        window.location.href = 'login.html';
        return;
    }


    const OPENWEATHER_API_KEY = 'a031a0406b7be30ff4f60682fc8c5340';
    let userLocation = null;
    let isUsingFallbackData = false;


    function getUserLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userLocation = {
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        };
                        console.log('User location obtained:', userLocation);
                        resolve(userLocation);
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                      
                        userLocation = {
                            lat: 12.9716,  // Default to Bangalore coordinates
                            lon: 77.5946
                        };
                        console.log('Using fallback location:', userLocation);
                        resolve(userLocation);
                    }
                );
            } else {
                console.error('Geolocation is not supported by this browser.');
                
                userLocation = {
                    lat: 12.9716,  
                    lon: 77.5946
                };
                console.log('Using fallback location:', userLocation);
                resolve(userLocation);
            }
        });
    }

    
    async function fetchWeatherData(date = null) {
        try {
            if (!userLocation) {
                await getUserLocation();
            }

            console.log('Fetching weather data for date:', date || 'current');
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${userLocation.lat}&lon=${userLocation.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
            console.log(apiUrl);

            const response = await fetch(apiUrl);
            console.log('API Response Status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                isUsingFallbackData = true;
                throw new Error(`Weather data fetch failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Weather API Response:', data);
            isUsingFallbackData = false;
            
          
            const weatherData = {
                data: [{
                    temp: data.main.temp,
                    temp_min: data.main.temp_min,
                    temp_max: data.main.temp_max,
                    humidity: data.main.humidity,
                    wind_speed: data.wind.speed,
                    weather: [{
                        description: data.weather[0].description
                    }]
                }]
            };

            console.log('Processed Weather Data:', weatherData);
            return weatherData;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            isUsingFallbackData = true;
            return {
                data: [{
                    temp: 28,
                    temp_min: 25,
                    temp_max: 32,
                    humidity: 65,
                    wind_speed: 5,
                    weather: [{
                        description: 'Partly Cloudy'
                    }]
                }]
            };
        }
    }

    // Function to update weather display
    function updateWeatherDisplay(weatherData) {
        const weatherInfo = document.querySelector('.weather-info');
        if (!weatherInfo) {
            console.log('Weather info element not found');
            return;
        }

        if (weatherData && weatherData.data && weatherData.data.length > 0) {
            const weather = weatherData.data[0];
            const temp = Math.round(weather.temp);
            const tempMin = Math.round(weather.temp_min);
            const tempMax = Math.round(weather.temp_max)+1;
            const avgTemp = Math.round((tempMin + tempMax) / 2);
            const windSpeed = Math.round(weather.wind_speed * 3.6); // Convert m/s to km/h
            const humidity = weather.humidity;
            const description = weather.weather[0].description;

            // Update the entire weather card content
            const weatherCard = weatherInfo.closest('.card');
            if (weatherCard) {
                weatherCard.innerHTML = `
                    <div class="card-header">
                        <i class="fas fa-cloud-sun"></i>
                        <h3>Weather Forecast ${isUsingFallbackData ? '<span style="color: #ff9800; font-size: 0.8em;">(Using Fallback Data)</span>' : ''}</h3>
                    </div>
                    <div class="weather-info">
                        <div class="weather-temp">
                            ${temp}°C
                        </div>
                        <div class="weather-details">
                            <p><i class="fas fa-wind"></i> Wind: ${windSpeed} km/h</p>
                            <p><i class="fas fa-tint"></i> Humidity: ${humidity}%</p>
                            <p><i class="fas fa-temperature-high"></i> High: ${tempMax}°C</p>
                        </div>
                        <div class="weather-forecast">
                        
                            <p><i class="fas fa-thermometer-half"></i> Average Temperature: ${avgTemp}°C</p>
                            <p><i class="fas fa-thermometer-half"></i> ${description} </p>
                        </div>
                    </div>
                `;
            }
        } else {
            console.log('Invalid weather data received');
            // Update the entire weather card content with fallback
            const weatherCard = weatherInfo.closest('.card');
            if (weatherCard) {
                weatherCard.innerHTML = `
                    <div class="card-header">
                        <i class="fas fa-cloud-sun"></i>
                        <h3>Weather Forecast <span style="color: #ff9800; font-size: 0.8em;">(Using Fallback Data)</span></h3>
                    </div>
                    <div class="weather-info">
                        <div class="weather-temp">
                            --°C
                        </div>
                        <div class="weather-details">
                            <p><i class="fas fa-wind"></i> Wind: -- km/h</p>
                            <p><i class="fas fa-tint"></i> Humidity: --%</p>
                            <p><i class="fas fa-temperature-high"></i> High: --°C</p>
                        </div>
                        <div class="weather-forecast">
                            <p><i class="fas fa-temperature-low"></i> Low: --°C</p>
                            <p><i class="fas fa-thermometer-half"></i> Average: --°C</p>
                        </div>
                    </div>
                `;
            }
        }
    }

    // Function to get weather description from weather code
    function getWeatherDescription(code) {
        const weatherCodes = {
            1000: 'Clear',
            1100: 'Mostly Clear',
            1101: 'Partly Cloudy',
            1102: 'Mostly Cloudy',
            1001: 'Cloudy',
            2000: 'Fog',
            2100: 'Light Fog',
            4000: 'Drizzle',
            4001: 'Rain',
            4200: 'Light Rain',
            4201: 'Heavy Rain',
            5000: 'Snow',
            5001: 'Flurries',
            5100: 'Light Snow',
            5101: 'Heavy Snow',
            6000: 'Freezing Drizzle',
            6001: 'Freezing Rain',
            6200: 'Light Freezing Rain',
            6201: 'Heavy Freezing Rain',
            7000: 'Ice Pellets',
            7101: 'Heavy Ice Pellets',
            7102: 'Light Ice Pellets',
            8000: 'Thunderstorm'
        };
        return weatherCodes[code] || 'Unknown';
    }

    // Fetch current weather data when page loads
    fetchWeatherData().then(weatherData => {
        if (weatherData) {
            updateWeatherDisplay(weatherData);
        }
    }).catch(error => {
        console.error('Error fetching current weather:', error);
    });

    // Function to update image metadata with weather data
    async function updateImageMetadata(images) {
        // Get weather data for the current date
        const currentWeather = await fetchWeatherData();
        
        for (const image of images) {
            if (currentWeather && currentWeather.data && currentWeather.data.length > 0) {
                const weather = currentWeather.data[0];
                const avgTemp = Math.round((weather.temp_min + weather.temp_max) / 2);
                image.metadata = image.metadata || {};
                image.metadata.weather = {
                    temperature: weather.temp,
                    avgTemperature: avgTemp,
                    humidity: weather.humidity,
                    windSpeed: weather.wind_speed,
                    description: weather.weather[0].description
                };
            }
        }
        return images;
    }

    // Function to display images in the gallery
    async function displayImages(flights) {
        const galleryContainer = document.getElementById('gallery-container');
        if (!galleryContainer) return;

        galleryContainer.innerHTML = ''; // Clear existing content

        // Collect all images from all flights
        const allImages = [];
        flights.forEach(flight => {
            if (flight.images && flight.images.length > 0) {
                flight.images.forEach(image => {
                    allImages.push({
                        ...image,
                        flightDate: flight.createdAt || image.uploadDate?.isoString || image.timestamp
                    });
                });
            }
        });

        // Sort images by date (newest first)
        allImages.sort((a, b) => new Date(b.flightDate) - new Date(a.flightDate));

        if (allImages.length === 0) {
            galleryContainer.innerHTML = '<p class="no-data-message">No images found. Start a new flight to capture images.</p>';
            return;
        }

        // Update images with weather data
        const imagesWithWeather = await updateImageMetadata(allImages);

        // Display images
        imagesWithWeather.forEach((image, index) => {
            const analysisBlock = document.createElement('div');
            analysisBlock.className = 'analysis-block';
            
            // Image viewer section
            const imageViewer = document.createElement('div');
            imageViewer.className = 'image-viewer';
            
            // Normal image
            const normalImage = document.createElement('img');
            normalImage.src = image.url;
            normalImage.alt = 'Drone Image';
            normalImage.className = 'analysis-image active';
            normalImage.dataset.type = 'normal';
            
            // Heat map image
            const heatMapImage = document.createElement('img');
            heatMapImage.src = image.heatMapUrl;
            heatMapImage.alt = 'Heat Map';
            heatMapImage.className = 'analysis-image';
            heatMapImage.dataset.type = 'heatmap';
            heatMapImage.style.display = 'none';
            heatMapImage.style.opacity = '0';
            
            // Image controls
            const imageControls = document.createElement('div');
            imageControls.className = 'image-controls';
            imageControls.innerHTML = `
                <button class="image-toggle active" data-target="normal">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right:4px;">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                        <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="currentColor"/>
                    </svg>
                    Normal
                </button>
                <button class="image-toggle" data-target="heatmap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right:4px;">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                        <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="currentColor"/>
                        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="currentColor"/>
                    </svg>
                    Heatmap
                </button>
            `;
            
            imageViewer.appendChild(normalImage);
            imageViewer.appendChild(heatMapImage);
            imageViewer.appendChild(imageControls);
            
            // Analysis header
            const analysisHeader = document.createElement('div');
            analysisHeader.className = 'analysis-header';
            analysisHeader.onclick = function() { toggleAnalysis(this); };
            
            const headerContent = document.createElement('div');
            headerContent.innerHTML = `
                <span class="analysis-title">Field Analysis ${index + 1}</span>
                <span class="analysis-status">${image.metadata?.analysis || 'No Analysis'}</span>
            `;
            
            const toggleIcon = document.createElement('div');
            toggleIcon.className = 'toggle-icon';
            toggleIcon.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--gray)">
                    <path d="M7 10l5 5 5-5z"/>
                </svg>
            `;
            
            analysisHeader.appendChild(headerContent);
            analysisHeader.appendChild(toggleIcon);
            
            // Analysis content
            const analysisContent = document.createElement('div');
            analysisContent.className = 'analysis-content';
            
            const metrics = document.createElement('div');
            metrics.className = 'analysis-metrics';
            
            // Add metrics based on available metadata
            if (image.metadata?.temperatureRange) {
                const avgTemp = (image.metadata.temperatureRange.min + image.metadata.temperatureRange.max) / 2;
                metrics.innerHTML += `
                    <div class="metric">Temperature <span class="metric-value">${avgTemp.toFixed(1)}°C</span></div>
                `;
            }
            
            if (image.metadata?.humidity) {
                metrics.innerHTML += `
                    <div class="metric">Humidity <span class="metric-value">${image.metadata.humidity}%</span></div>
                `;
            }
            
            if (image.metadata?.windSpeed) {
                metrics.innerHTML += `
                    <div class="metric">Wind <span class="metric-value">${Math.round(image.metadata.windSpeed * 3.6)} km/h</span></div>
                `;
            }
            
            const analysisText = document.createElement('p');
            analysisText.className = 'analysis-text';
            analysisText.textContent = image.metadata?.description || 'No detailed analysis available.';
            
            const analysisFooter = document.createElement('div');
            analysisFooter.className = 'analysis-footer';
            const uploadDate = new Date(image.flightDate);
            analysisFooter.innerHTML = `
                <span>Flight ${index + 1}</span>
                <span>${uploadDate.toLocaleDateString()} ${uploadDate.toLocaleTimeString()}</span>
            `;
            
            analysisContent.appendChild(metrics);
            analysisContent.appendChild(analysisText);
            analysisContent.appendChild(analysisFooter);
            
            // Assemble the block
            analysisBlock.appendChild(imageViewer);
            analysisBlock.appendChild(analysisHeader);
            analysisBlock.appendChild(analysisContent);
            
            // Add click events for image toggles
            imageControls.querySelectorAll('.image-toggle').forEach(toggle => {
                toggle.addEventListener('click', function() {
                    const targetType = this.dataset.target;
                    
                    // Update active toggle styling
                    this.closest('.image-controls').querySelectorAll('.image-toggle').forEach(t => {
                        t.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    // Animate image transition
                    imageViewer.querySelectorAll('.analysis-image').forEach(img => {
                        if (img.dataset.type === targetType) {
                            img.style.display = 'block';
                            setTimeout(() => {
                                img.style.opacity = '1';
                                img.classList.add('fade-in');
                            }, 10);
                        } else {
                            img.style.opacity = '0';
                            setTimeout(() => {
                                img.style.display = 'none';
                                img.classList.remove('fade-in');
                            }, 300);
                        }
                    });
                });
            });

            // Add click event for modal
            [normalImage, heatMapImage].forEach(imgElement => {
                imgElement.addEventListener('click', function() {
                    const modal = document.getElementById('image-modal');
                    const modalImg = document.getElementById('modal-image');
                    modal.style.display = "block";
                    modalImg.src = this.src;
                });
            });

            galleryContainer.appendChild(analysisBlock);
        });
        
        // Initialize - close all analysis sections by default
        document.querySelectorAll('.analysis-content').forEach(content => {
            content.style.maxHeight = '0';
        });
    }

    // Calendar functionality
    const calendarDays = document.getElementById('calendar-days');
    const calendarMonth = document.querySelector('.calendar-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let flightDates = new Set();

    // Function to fetch flight dates
    async function fetchFlightDates() {
        try {
            const response = await fetch('https://aeroagro-0mz4.onrender.com/api/drone/flights', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const flights = await response.json();
            flightDates.clear();
            
            // Store flight dates with proper date handling
            flights.forEach(flight => {
                // Check both flight creation date and image timestamps
                const flightDate = new Date(flight.createdAt);
                const normalizedFlightDate = new Date(Date.UTC(
                    flightDate.getUTCFullYear(),
                    flightDate.getUTCMonth(),
                    flightDate.getUTCDate()
                ));
                flightDates.add(normalizedFlightDate.toISOString().split('T')[0]);

                // Add dates from image timestamps
                if (flight.images && flight.images.length > 0) {
                    flight.images.forEach(image => {
                        if (image.timestamp) {
                            const imageDate = new Date(image.timestamp);
                            const normalizedImageDate = new Date(Date.UTC(
                                imageDate.getUTCFullYear(),
                                imageDate.getUTCMonth(),
                                imageDate.getUTCDate()
                            ));
                            flightDates.add(normalizedImageDate.toISOString().split('T')[0]);
                        }
                    });
                }
            });
            
            updateCalendar();
        } catch (error) {
            console.error('Error fetching flight dates:', error);
            showNotification('Error fetching flight data. Please try again later.', true);
        }
    }

    function updateCalendar() {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        calendarMonth.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${currentYear}`;
        calendarDays.innerHTML = '';

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'prev-month';
            calendarDays.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = day;
            
            // Create date in UTC to avoid timezone issues
            const currentDayDate = new Date(Date.UTC(currentYear, currentMonth, day));
            const currentDayString = currentDayDate.toISOString().split('T')[0];
            
            // Highlight current day
            const today = new Date();
            const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
            if (currentDayString === todayUTC.toISOString().split('T')[0]) {
                dayElement.classList.add('current-day');
            }

            // Highlight days with flights
            if (flightDates.has(currentDayString)) {
                dayElement.classList.add('flight-day');
                
                // Add click event for flight days
                dayElement.addEventListener('click', async () => {
                    // Fetch and update weather for the selected date
                    const weatherData = await fetchWeatherData(currentDayString);
                    updateWeatherDisplay(weatherData);
                    
                    // Navigate to log page
                    window.location.href = `log.html?date=${currentDayString}`;
                });
            }

            calendarDays.appendChild(dayElement);
        }
    }

    // Event listeners for month navigation
    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            updateCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            updateCalendar();
        });
    }

    // Initialize calendar and fetch flight dates
    fetchFlightDates();

    // Add logout functionality
    const nav = document.querySelector('nav ul');
    const logoutLi = document.createElement('li');
    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.textContent = 'Logout';
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('droneId');
        window.location.href = 'login.html';
    });
    logoutLi.appendChild(logoutLink);
    nav.appendChild(logoutLi);

    // Function to update stats display
    function updateStats(flights) {
        const totalImagesElement = document.getElementById('total-images');
        const totalFlightsElement = document.getElementById('total-flights');
        
        if (totalImagesElement && totalFlightsElement) {
            // Calculate total images
            const totalImages = flights.reduce((sum, flight) => {
                return sum + (flight.images ? flight.images.length : 0);
            }, 0);
            
            // Update the display
            totalImagesElement.textContent = totalImages;
            totalFlightsElement.textContent = flights.length;
        }
    }

    // Function to fetch all flights and display images
    async function fetchAllFlights() {
        try {
            const response = await fetch('https://aeroagro-0mz4.onrender.com/api/drone/flights', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const flights = await response.json();
            await displayImages(flights);
            updateStats(flights);
            
        } catch (error) {
            console.error('Error fetching flights:', error);
            showNotification('Error fetching flight data. Please try again later.', true);
        }
    }
    
    // Function to show notification
    function showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.backgroundColor = isError ? '#f44336' : '#4CAF50';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Set up interval to check for updates every 30 seconds
    setInterval(fetchAllFlights, 30000);
    
    // Initial fetch of flight data
    fetchAllFlights();
});
