import { useState, useEffect } from "react";
import { useWeather } from "./hooks/useWeather";

export default function App() {
  const [city, setCity] = useState("");
  const { data, loading, error, fetchWeather } = useWeather();

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

      {data && (
        <div style={{ marginTop: "20px" }}>
          <h2>{data.name}</h2>
          <p>🌡️ Temp: {data.main.temp}°C</p>
          <p>☁️ Weather: {data.weather[0].description}</p>
        </div>          
      )}
    </div>
  );
}