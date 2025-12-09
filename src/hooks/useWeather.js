import { useState } from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

function pickExactHour(arr, targetHour) {
    if (!arr || arr.light === 0) return null;
    return arr.find((entry) => entry.hour === targetHour) || null;
}

export function useWeather() {
  const [current, setCurrent] = useState(null);
  const [forecastByDay, setForecastByDay] = useState([]); // new structured forecast
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async (city) => {
    if (!city) return;

    try {
      setLoading(true);
      setError("");

      // Current weather
      const currentRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&appid=${API_KEY}&units=metric`
      );

      setCurrent(currentRes.data);

      const { lat, lon } = currentRes.data.coord;

      // 5 day / 3 hour forecast (returns list + city.timezone)
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      const list = forecastRes.data.list; // array of 3-hour entries
      const timezone = forecastRes.data.city?.timezone ?? 0; // seconds offset from UTC

      // Build map: dateString -> array of { item, hour, localDateObj }
      const daysMap = {}; // { '2025-12-09': [ {item, hour, localDate} , ... ] }

      list.forEach((item) => {
        // item.dt is unix seconds UTC. Shift by timezone (seconds) to get local city time.
        const localMs = (item.dt + timezone) * 1000;
        const localDateObj = new Date(localMs);
        const localDateStr = localDateObj.toISOString().slice(0, 10); // YYYY-MM-DD
        const hour = localDateObj.getUTCHours(); // use UTC hour because we constructed with timezone shift

        if (!daysMap[localDateStr]) daysMap[localDateStr] = [];
        daysMap[localDateStr].push({
          item,
          hour,
          localDateObj,
        });
      });

      // Convert map -> ordered array of days (limit to 5 days)
      const orderedDates = Object.keys(daysMap).sort().slice(0, 5);

      const result = orderedDates.map((dateStr) => {
        const entries = daysMap[dateStr];
        // pick morning (~6) and night (~21). You can tweak target hours.
        const morning = pickExactHour(entries, 6);
        const night = pickExactHour(entries, 21);

        // Helper to convert chosen entry into a simpler object for the UI
        const toSimple = (chosen) => {
          if (!chosen) return null;
          const { item, localDateObj } = chosen;
          return {
            dt: item.dt,
            timeText: localDateObj.toISOString().slice(11, 16), // HH:MM
            temp: item.main.temp,
            feels_like: item.main.feels_like,
            description: item.weather[0].description,
            main: item.weather[0].main,
            icon: item.weather[0].icon,
          };
        };

        return {
          date: dateStr,
          morning: toSimple(morning),
          night: toSimple(night),
        };
      });

      setForecastByDay(result);
    } catch (err) {
      console.error(err);
      setError("City not found or API error");
      setCurrent(null);
      setForecastByDay([]);
    } finally {
      setLoading(false);
    }
  };

  return { current, forecastByDay, loading, error, fetchWeather };
}
