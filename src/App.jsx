import { useState, useEffect } from "react";
import { useWeather } from "./hooks/useWeather";
import "./index.css";

export default function App() {
  const [city, setCity] = useState("");
  const { current, forecast, loading, error, fetchWeather } = useWeather();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("weather-dark") === "true";
  });

  useEffect(() => {
    localStorage.setItem("weather-dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWeather(city);
    }, 500);
    return () => clearTimeout(timer);
  }, [city]);

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <div className="header">
        <h1>Weather Now 🌤️</h1>
        <button
          className="toggle-btn"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="search-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Search city..."
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {current && (
        <div className="card">
          <h2>{current.name}</h2>
          <p>🌡️ {current.main.temp}°C</p>
          <p>☁️ {current.weather[0].description}</p>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast">
          <h3>5-Day Forecast</h3>
          <div className="forecast-list">
            {forecast.slice(0, 7).map((item, index) => (
              <div key={index} className="forecast-card">
                <p>{new Date(item.dt_txt).toDateString()}</p>
                <p>🌡️ {item.main.temp}°C</p>
                <p>{item.weather[0].main}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
