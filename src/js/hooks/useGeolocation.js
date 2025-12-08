// Geolocation hook for JavaScript

function useGeolocation(options = {}) {
  const {
    enableHighAccuracy = false,
    timeout = 10000,
    maximumAge = 60000,
    watch = false
  } = options;

  // State variables
  let locationState = {
    loading: true,
    position: null,
    error: null,
    accuracy: null
  };

  // Callbacks
  let onLocationUpdate = null;
  let onError = null;

  // Watch ID for clearing later
  let watchId = null;

  // Function to get current position
  function getCurrentPosition() {
    if (!navigator.geolocation) {
      const error = new Error('Geolocation is not supported by this browser');
      locationState = { loading: false, position: null, error, accuracy: null };
      
      if (onError) onError(error);
      return Promise.reject(error);
    }

    locationState.loading = true;
    
    const positionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge
    };

    if (watch) {
      // Use watchPosition instead of getCurrentPosition
      watchId = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        handlePositionError,
        positionOptions
      );
    } else {
      // Use getCurrentPosition
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            handlePositionSuccess(position);
            resolve(locationState);
          },
          (error) => {
            handlePositionError(error);
            reject(locationState.error);
          },
          positionOptions
        );
      });
    }
  }

  // Handle successful position retrieval
  function handlePositionSuccess(position) {
    locationState = {
      loading: false,
      position: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
      },
      error: null,
      accuracy: position.coords.accuracy
    };

    if (onLocationUpdate) onLocationUpdate(locationState);
  }

  // Handle position error
  function handlePositionError(error) {
    let errorMessage = '';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'User denied the request for Geolocation';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'The request to get user location timed out';
        break;
      default:
        errorMessage = 'An unknown error occurred';
        break;
    }

    locationState = {
      loading: false,
      position: null,
      error: new Error(errorMessage),
      accuracy: null
    };

    if (onError) onError(locationState.error);
  }

  // Function to subscribe to location updates
  function subscribe(updateCallback, errorCallback) {
    onLocationUpdate = updateCallback;
    onError = errorCallback;
  }

  // Function to unsubscribe
  function unsubscribe() {
    onLocationUpdate = null;
    onError = null;
  }

  // Function to clear watch
  function clearWatch() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  }

  // Function to get current state
  function getState() {
    return locationState;
  }

  // Get current position when the hook is initialized
  getCurrentPosition();

  // Return the API
  return {
    getCurrentPosition,
    subscribe,
    unsubscribe,
    clearWatch,
    getState,
    // Expose the state directly as well
    ...locationState
  };
}

// Hook to get distance between two points
function useDistance(lat1, lon1, lat2, lon2) {
  // Convert degrees to radians
  const deg2rad = (deg) => deg * (Math.PI / 180);
  
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  
  return distance;
}

// Hook to get user's city based on location
async function useCityFromLocation(latitude, longitude) {
  try {
    // Using a free geocoding API (this is an example, you might need to use a different service)
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=demo`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data[0]?.name || null;
  } catch (error) {
    console.error('Error getting city from location:', error);
    return null;
  }
}

// Export the hooks
export { useGeolocation, useDistance, useCityFromLocation };