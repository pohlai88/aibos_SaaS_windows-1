'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer,
  MapPin, Search, Plus, Trash2, Eye, EyeOff, Droplets, Gauge
} from 'lucide-react';

// ==================== TYPES ====================

interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: string;
  description: string;
  icon: string;
  visibility: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  timestamp: string;
}

interface ForecastData {
  date: string;
  high: number;
  low: number;
  description: string;
  icon: string;
  precipitation: number;
  humidity: number;
}

interface Location {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  isDefault: boolean;
}

// ==================== MOCK DATA ====================

const MOCK_WEATHER_DATA: Record<string, WeatherData> = {
  'new-york': {
    location: 'New York, NY',
    temperature: 72,
    feelsLike: 75,
    humidity: 65,
    pressure: 1013,
    windSpeed: 8,
    windDirection: 'NE',
    description: 'Partly Cloudy',
    icon: 'cloud-sun',
    visibility: 10,
    uvIndex: 6,
    sunrise: '06:30',
    sunset: '19:45',
    timestamp: new Date().toISOString()
  },
  'london': {
    location: 'London, UK',
    temperature: 58,
    feelsLike: 55,
    humidity: 78,
    pressure: 1008,
    windSpeed: 12,
    windDirection: 'SW',
    description: 'Light Rain',
    icon: 'cloud-rain',
    visibility: 6,
    uvIndex: 2,
    sunrise: '07:15',
    sunset: '18:30',
    timestamp: new Date().toISOString()
  },
  'tokyo': {
    location: 'Tokyo, Japan',
    temperature: 82,
    feelsLike: 85,
    humidity: 70,
    pressure: 1015,
    windSpeed: 5,
    windDirection: 'SE',
    description: 'Sunny',
    icon: 'sun',
    visibility: 12,
    uvIndex: 8,
    sunrise: '05:45',
    sunset: '18:15',
    timestamp: new Date().toISOString()
  }
};

const MOCK_FORECAST: Record<string, ForecastData[]> = {
  'new-york': [
    { date: '2024-01-15', high: 75, low: 62, description: 'Partly Cloudy', icon: 'cloud-sun', precipitation: 20, humidity: 65 },
    { date: '2024-01-16', high: 78, low: 65, description: 'Sunny', icon: 'sun', precipitation: 0, humidity: 60 },
    { date: '2024-01-17', high: 72, low: 58, description: 'Light Rain', icon: 'cloud-rain', precipitation: 60, humidity: 80 },
    { date: '2024-01-18', high: 68, low: 55, description: 'Cloudy', icon: 'cloud', precipitation: 30, humidity: 75 },
    { date: '2024-01-19', high: 70, low: 60, description: 'Partly Cloudy', icon: 'cloud-sun', precipitation: 10, humidity: 70 }
  ],
  'london': [
    { date: '2024-01-15', high: 60, low: 48, description: 'Light Rain', icon: 'cloud-rain', precipitation: 70, humidity: 85 },
    { date: '2024-01-16', high: 58, low: 45, description: 'Cloudy', icon: 'cloud', precipitation: 40, humidity: 80 },
    { date: '2024-01-17', high: 62, low: 50, description: 'Partly Cloudy', icon: 'cloud-sun', precipitation: 20, humidity: 75 },
    { date: '2024-01-18', high: 65, low: 52, description: 'Sunny', icon: 'sun', precipitation: 0, humidity: 65 },
    { date: '2024-01-19', high: 63, low: 49, description: 'Light Rain', icon: 'cloud-rain', precipitation: 50, humidity: 80 }
  ],
  'tokyo': [
    { date: '2024-01-15', high: 85, low: 72, description: 'Sunny', icon: 'sun', precipitation: 0, humidity: 65 },
    { date: '2024-01-16', high: 88, low: 75, description: 'Partly Cloudy', icon: 'cloud-sun', precipitation: 10, humidity: 70 },
    { date: '2024-01-17', high: 82, low: 68, description: 'Light Rain', icon: 'cloud-rain', precipitation: 40, humidity: 80 },
    { date: '2024-01-18', high: 80, low: 70, description: 'Cloudy', icon: 'cloud', precipitation: 30, humidity: 75 },
    { date: '2024-01-19', high: 83, low: 71, description: 'Sunny', icon: 'sun', precipitation: 0, humidity: 60 }
  ]
};

// ==================== WEATHER APP ====================

const WeatherApp: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([
    { id: 'new-york', name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, isDefault: true },
    { id: 'london', name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, isDefault: false },
    { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, isDefault: false }
  ]);
  const [selectedLocation, setSelectedLocation] = useState<string>('new-york');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'forecast' | 'locations'>('current');
  const [units, setUnits] = useState<'fahrenheit' | 'celsius'>('fahrenheit');

  // ==================== WEATHER DATA ====================

  const currentWeather = MOCK_WEATHER_DATA[selectedLocation];
  const forecast = MOCK_FORECAST[selectedLocation] || [];

  // ==================== LOCATION MANAGEMENT ====================

  const addLocation = useCallback((name: string, country: string) => {
    const newLocation: Location = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      country,
      lat: 0, // Would be set by geocoding API
      lon: 0,
      isDefault: false
    };
    setLocations(prev => [...prev, newLocation]);
    setSelectedLocation(newLocation.id);
    setShowSearch(false);
    setSearchQuery('');
  }, []);

  const removeLocation = useCallback((locationId: string) => {
    if (locations.length > 1) {
      setLocations(prev => prev.filter(loc => loc.id !== locationId));
      if (selectedLocation === locationId) {
        const defaultLocation = locations.find(loc => loc.id !== locationId);
        if (defaultLocation) {
          setSelectedLocation(defaultLocation.id);
        }
      }
    }
  }, [locations, selectedLocation]);

  const setDefaultLocation = useCallback((locationId: string) => {
    setLocations(prev => prev.map(loc => ({
      ...loc,
      isDefault: loc.id === locationId
    })));
  }, []);

  // ==================== UTILITY FUNCTIONS ====================

  const convertTemperature = (temp: number): number => {
    if (units === 'celsius') {
      return Math.round((temp - 32) * 5 / 9);
    }
    return temp;
  };

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sun': return Sun;
      case 'cloud': return Cloud;
      case 'cloud-sun': return Cloud;
      case 'cloud-rain': return CloudRain;
      case 'cloud-snow': return CloudSnow;
      default: return Cloud;
    }
  };

  const getWindDirection = (direction: string): string => {
    const directions: Record<string, string> = {
      'N': 'North',
      'NE': 'Northeast',
      'E': 'East',
      'SE': 'Southeast',
      'S': 'South',
      'SW': 'Southwest',
      'W': 'West',
      'NW': 'Northwest'
    };
    return directions[direction] || direction;
  };

  const getUVIndexLevel = (uv: number): { level: string; color: string } => {
    if (uv <= 2) return { level: 'Low', color: 'text-green-500' };
    if (uv <= 5) return { level: 'Moderate', color: 'text-yellow-500' };
    if (uv <= 7) return { level: 'High', color: 'text-orange-500' };
    if (uv <= 10) return { level: 'Very High', color: 'text-red-500' };
    return { level: 'Extreme', color: 'text-purple-500' };
  };

  // ==================== RENDER ====================

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Weather</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setUnits(units === 'fahrenheit' ? 'celsius' : 'fahrenheit')}
            className="px-3 py-1 bg-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            °{units === 'fahrenheit' ? 'F' : 'C'}
          </button>
          <Cloud className="text-blue-600" size={24} />
        </div>
      </div>

      {/* Location Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MapPin className="text-gray-600" size={20} />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="text-lg font-semibold text-gray-800 bg-transparent border-none focus:outline-none"
          >
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}, {location.country}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <Search size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => addLocation(searchQuery, 'Unknown')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
        {[
          { id: 'current', label: 'Current', icon: Thermometer },
          { id: 'forecast', label: 'Forecast', icon: Eye },
          { id: 'locations', label: 'Locations', icon: MapPin }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === id
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon size={16} />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Current Weather Tab */}
          {activeTab === 'current' && currentWeather && (
            <div className="space-y-6">
              {/* Main Weather Card */}
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {React.createElement(getWeatherIcon(currentWeather.icon), {
                      size: 64,
                      className: 'text-blue-500'
                    })}
                  </div>
                  <div className="text-5xl font-light text-gray-800 mb-2">
                    {convertTemperature(currentWeather.temperature)}°
                  </div>
                  <div className="text-xl text-gray-600 mb-4">
                    {currentWeather.description}
                  </div>
                  <div className="text-sm text-gray-500">
                    Feels like {convertTemperature(currentWeather.feelsLike)}°
                  </div>
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <Droplets className="text-blue-500" size={20} />
                    <span className="font-medium text-gray-800">Humidity</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-800">{currentWeather.humidity}%</div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <Wind className="text-blue-500" size={20} />
                    <span className="font-medium text-gray-800">Wind</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-800">{currentWeather.windSpeed} mph</div>
                  <div className="text-sm text-gray-500">{getWindDirection(currentWeather.windDirection)}</div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <Gauge className="text-blue-500" size={20} />
                    <span className="font-medium text-gray-800">Pressure</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-800">{currentWeather.pressure} hPa</div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="text-blue-500" size={20} />
                    <span className="font-medium text-gray-800">Visibility</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-800">{currentWeather.visibility} mi</div>
                </div>
              </div>

              {/* UV Index and Sun Info */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Additional Info</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">UV Index</div>
                    <div className={`text-xl font-semibold ${getUVIndexLevel(currentWeather.uvIndex).color}`}>
                      {currentWeather.uvIndex}
                    </div>
                    <div className="text-xs text-gray-500">{getUVIndexLevel(currentWeather.uvIndex).level}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Sunrise</div>
                    <div className="text-xl font-semibold text-gray-800">{currentWeather.sunrise}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Sunset</div>
                    <div className="text-xl font-semibold text-gray-800">{currentWeather.sunset}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Forecast Tab */}
          {activeTab === 'forecast' && (
            <div className="space-y-4">
              {forecast.map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {React.createElement(getWeatherIcon(day.icon), {
                          size: 32,
                          className: 'text-blue-500'
                        })}
                        <div>
                          <div className="font-medium text-gray-800">{day.description}</div>
                          <div className="text-sm text-gray-500">{day.precipitation}% rain</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-800">
                        {convertTemperature(day.high)}°
                      </div>
                      <div className="text-sm text-gray-500">
                        {convertTemperature(day.low)}°
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <div className="space-y-4">
              {locations.map((location) => (
                <motion.div
                  key={location.id}
                  layout
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className="text-blue-500" size={20} />
                      <div>
                        <div className="font-medium text-gray-800">{location.name}</div>
                        <div className="text-sm text-gray-500">{location.country}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {location.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                          Default
                        </span>
                      )}
                      {!location.isDefault && (
                        <button
                          onClick={() => setDefaultLocation(location.id)}
                          className="p-1 text-gray-400 hover:text-blue-500"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      {!location.isDefault && locations.length > 1 && (
                        <button
                          onClick={() => removeLocation(location.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WeatherApp;
