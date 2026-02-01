import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, CloudFog } from "lucide-react";

interface WeatherCardProps {
  location: string;
  globalRadius?: number;
}

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
  country: string;
}

const WeatherCard = ({ location, globalRadius = 50 }: WeatherCardProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const borderRadius = `${Math.round((globalRadius / 100) * 24)}px`;

  useEffect(() => {
    const fetchWeather = async () => {
      if (!location) {
        setLoading(false);
        setError(true);
        return;
      }

      try {
        // Using wttr.in API (free, no API key required)
        const response = await fetch(
          `https://wttr.in/${encodeURIComponent(location)}?format=j1`
        );
        if (!response.ok) throw new Error("Failed to fetch weather");
        
        const data = await response.json();
        const current = data.current_condition?.[0];
        const area = data.nearest_area?.[0];
        
        if (current && area) {
          setWeather({
            temperature: parseInt(current.temp_C),
            condition: current.weatherDesc?.[0]?.value || "Unknown",
            icon: current.weatherCode,
            location: area.areaName?.[0]?.value || location,
            country: area.country?.[0]?.value || "",
          });
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location]);

  const getWeatherIcon = (code: string) => {
    const codeNum = parseInt(code);
    // Weather codes from wttr.in
    if (codeNum >= 200 && codeNum < 300) return CloudLightning; // Thunderstorm
    if (codeNum >= 300 && codeNum < 600) return CloudRain; // Rain/Drizzle
    if (codeNum >= 600 && codeNum < 700) return CloudSnow; // Snow
    if (codeNum >= 700 && codeNum < 800) return CloudFog; // Mist/Fog
    if (codeNum === 800 || code === "113") return Sun; // Clear
    if (codeNum > 800 || code === "116" || code === "119" || code === "122") return Cloud; // Cloudy
    return Cloud;
  };

  const celsiusToFahrenheit = (celsius: number): number => {
    return Math.round((celsius * 9/5) + 32);
  };

  if (loading) {
    return (
      <div 
        className="font-ggsans flex items-center gap-3 px-4 py-3 border border-foreground/20 backdrop-blur-xl animate-pulse"
        style={{ borderRadius }}
      >
        <div className="w-12 h-12 rounded-xl bg-white/10" />
        <div className="space-y-2 flex-1">
          <div className="w-24 h-4 bg-white/10 rounded" />
          <div className="w-32 h-3 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div 
        className="font-ggsans flex items-center gap-3 px-4 py-3 border border-foreground/20 backdrop-blur-xl"
        style={{ borderRadius }}
      >
        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Cloud className="w-6 h-6 text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">Weather</p>
          <p className="text-xs text-white/50">Location not found</p>
        </div>
      </div>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.icon);

  return (
    <div 
      className="font-ggsans relative flex items-center gap-3 px-4 py-3 border border-foreground/20 backdrop-blur-xl"
      style={{ borderRadius }}
    >
      {/* Weather Icon */}
      <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
        <WeatherIcon className="w-10 h-10 text-blue-400" />
      </div>

      {/* Weather Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="font-medium text-white text-sm">
            {weather.location}
            {weather.country && <span className="text-white/60">, {weather.country}</span>}
          </span>
        </div>
        
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-white/70 flex items-center gap-1">
            🌡️ {weather.temperature}°C ({celsiusToFahrenheit(weather.temperature)}°F)
          </span>
          <span className="text-xs text-white/50 flex items-center gap-1">
            ☁️ {weather.condition}
          </span>
        </div>
      </div>

      {/* Weather Label */}
      <div className="absolute top-3 right-3 flex items-center gap-1 text-white/50">
        <Cloud className="w-4 h-4 text-blue-400" />
        <span className="text-xs">Weather</span>
      </div>
    </div>
  );
};

export default WeatherCard;
