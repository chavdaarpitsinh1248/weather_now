import { useState, useEffect } from "react";
import { useWeather } from "./hooks/useWeather";
import "./index.css";

export default function App() {
  const [city, setCity] = useState("");
  const { current, forecastByDay, loading, error, fetchWeather } = useWeather();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("weather-dark") === "true";
  });

  useEffect(() => {
    localStorage.setItem("weather-dark", darkMode);
  }, [darkMode]);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (city.trim()) fetchWeather(city.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [city]);

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <div className="header">
        <h1>Weather Now 🌤️</h1>
        <button
          className="toggle-btn"
          onClick={() => setDarkMode((s) => !s)}
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

      {loading && <p style={{ marginTop: 12 }}>Loading...</p>}
      {error && <p style={{ marginTop: 12 }}>{error}</p>}

      {current && (
        <div className="card">
          <h2>{current.name}, {current.sys?.country}</h2>
          <p>🌡️ {Math.round(current.main.temp)}°C</p>
          <p>☁️ {current.weather[0].description}</p>
        </div>
      )}

      {forecastByDay.length > 0 && (
        <div className="forecast">
          <h3>Forecast (morning & night)</h3>
          <div className="forecast-list">
            {forecastByDay.map((day) => (
              <div key={day.date} className="forecast-card">
                <strong>{new Date(day.date).toDateString()}</strong>

                <div style={{ marginTop: 8 }}>
                  <div>
                    <em>Morning</em>
                    {day.morning ? (
                      <div>
                        <p style={{ margin: 4 }}>Time: {day.morning.timeText}</p>
                        <p style={{ margin: 4 }}>Temp: {Math.round(day.morning.temp)}°C</p>
                        <p style={{ margin: 4 }}>{day.morning.description}</p>
                      </div>
                    ) : (
                      <p style={{ margin: 4 }}>— no morning reading</p>
                    )}
                  </div>

                  <hr style={{ margin: "8px 0" }} />

                  <div>
                    <em>Night</em>
                    {day.night ? (
                      <div>
                        <p style={{ margin: 4 }}>Time: {day.night.timeText}</p>
                        <p style={{ margin: 4 }}>Temp: {Math.round(day.night.temp)}°C</p>
                        <p style={{ margin: 4 }}>{day.night.description}</p>
                      </div>
                    ) : (
                      <p style={{ margin: 4 }}>— no night reading</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
