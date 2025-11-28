import React, { useState } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { Coordinates, LocationDetails, LoadingState } from './types';
import { getLocationDetails } from './services/geminiService';
import { Button } from './components/Button';
import { InfoCard } from './components/InfoCard';

const App: React.FC = () => {
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [details, setDetails] = useState<LocationDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleShareLocation = () => {
    setStatus(LoadingState.GETTING_COORDS);
    setErrorMsg(null);
    setDetails(null);

    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      setStatus(LoadingState.ERROR);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        
        try {
          setStatus(LoadingState.FETCHING_DETAILS);
          const locationData = await getLocationDetails(latitude, longitude);
          setDetails(locationData);
          setStatus(LoadingState.SUCCESS);
        } catch (err: any) {
          setErrorMsg(err.message || "Failed to fetch address details.");
          setStatus(LoadingState.ERROR);
        }
      },
      (error) => {
        let msg = "Unable to retrieve your location.";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            msg = "Permission denied. Please allow location access in your browser settings to detect your address.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            msg = "The request to get user location timed out.";
            break;
        }
        setErrorMsg(msg);
        setStatus(LoadingState.ERROR);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8">
      
      {/* Header / Intro */}
      <div className="text-center max-w-2xl mb-10 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4 shadow-sm">
          <Navigation className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Exact Location Finder
        </h1>
        <p className="text-lg text-slate-600 max-w-lg mx-auto">
          Click below to detect your precise address, including Building Number, Landmark, Colony, and Pin Code instantly.
        </p>
      </div>

      {/* Action Area */}
      <div className="flex flex-col items-center w-full">
        {status === LoadingState.IDLE && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleShareLocation();
            }}
            className="group relative inline-flex items-center justify-center text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition-all duration-300 border-b-2 border-indigo-200 hover:border-indigo-600 pb-1"
          >
            <MapPin className="w-6 h-6 mr-2 animate-bounce group-hover:animate-none" />
            Detect My Exact Address
          </a>
        )}

        {/* Loading States */}
        {status === LoadingState.GETTING_COORDS && (
          <div className="flex flex-col items-center space-y-3 animate-pulse">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-indigo-600 font-medium">Locating GPS Coordinates...</p>
          </div>
        )}

        {status === LoadingState.FETCHING_DETAILS && (
          <div className="flex flex-col items-center space-y-3 animate-pulse">
             <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-purple-600 font-medium">Fetching House, Area & Pin Code Details...</p>
          </div>
        )}

        {/* Error State */}
        {status === LoadingState.ERROR && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center animate-fade-in">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-800 mb-2">Detection Failed</h3>
            <p className="text-red-600 mb-4">{errorMsg}</p>
            <Button onClick={handleShareLocation} variant="secondary">
              Try Again
            </Button>
          </div>
        )}

        {/* Success State */}
        {status === LoadingState.SUCCESS && coords && details && (
          <div className="w-full flex flex-col items-center space-y-6">
            <InfoCard 
              data={details} 
              coords={{ lat: coords.latitude, lng: coords.longitude }} 
            />
            
            <Button 
              variant="outline" 
              onClick={() => {
                setStatus(LoadingState.IDLE);
                setDetails(null);
                setCoords(null);
              }}
            >
              Detect Another Location
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 text-slate-400 text-sm font-medium">
        Powered by Google Maps & Gemini
      </footer>
    </div>
  );
};

export default App;
