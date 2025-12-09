import { useState, useEffect } from "react";
import { useWeather } from "./hooks/useWeather";

export default function App() {
  const [city, setCity] = useState("");
  const { current, forecast, loading, error, fetchWeather } = useWeather();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("weather-dark") === "true";
  });

  useEffect(() => {
    localStorage.setItem("weather-dark", darkMode);
  }, [darkMode]);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWeather(city);
    }, 500);

    return () => clearTimeout(timer);
  }, [city]);

  return (
    <div 
      style={{
        minHeight: "100vh",
        background: darkMode ? "#0f172a" : "#f8fafc",
        color: darkMode ? "#f1f5f9" : "#0f172a",
        padding: "2rem",
        fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>Weather Now 🌤️</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: "10px 15px",
              borderRadius: "8px",
              border: "none",
              curesor: "pointer",
            }}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <input 
          type="text"
          placeholder="Search city..."
          onChange={(e) => setCity(e.target.value)}
          style={{ 
            padding: "10px", 
            width: "250px",
            marginTop: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: darkMode ? "#1e293b" : "#fff",
            color: darkMode ? "#f1f5f9" : "#0f172a",
           }}
        />
        

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {current && (
        <div 
          style={{ 
            marginTop: "20px",
            padding: "20px",
            borderRadius: "12px",
            background: darkMode ? "#1e293b" : "#e2e8f0",
          }}
        >
          <h2>{current.name}</h2>
          <p>🌡️ Temp: {current.main.temp}°C</p>
          <p>☁️ Weather: {current.weather[0].description}</p>
        </div>          
      )}

      {forecast.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>5-Day Forecast</h3>

          <div style={{ display: "flex", gap: "10px", overflowx: "auto" }} >
            {forecast.slice(0, 7).map((item, index) => (
              <div 
                key={index}
                style={{
                  background: darkMode ? "#1e293b" : "#ffffff",
                  border: "1px solid #ddd",
                  padding: "10px",
                  minwidth: "120px",
                  borderRadius: "8px",
                }}
              >
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