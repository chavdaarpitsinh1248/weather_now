import { useState, useEffect } from "react";
import { useWeather } from "./hooks/useWeather";

export default function App() {
  const [city, setCity] = useState("");
  const { current, forecast, loading, error, fetchWeather } = useWeather();

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWeather(city);
    }, 500);

    return () => clearTimeout(timer);
  }, [city]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Weather Now 🌤️</h1>

      <input 
        type="text"
        placeholder="Search city..."
        onChange={(e) => setCity(e.target.value)}
        style={{ padding: "10px", width: "250px" }}
      />

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {current && (
        <div style={{ marginTop: "20px" }}>
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