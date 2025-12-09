import { useState } from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// helper: pick item in arr whose `hour` is nearest to targetHour
function pickNearest(arr, targetHour) {
    if (!arr || arr.length === 0) return null;
    let best = arr[0];
    let bestDiff = Math.abs(arr[0].hour - targetHour);
    for (let i = 1; i < arr.length; i++) {
        const diff = Math.abs(arr[i].hour - targetHour);
        if (diff < bestDiff) {
            best = arr[i];
            bestDiff = diff;
        }
    }
    return best
}

export function useWeather() {
    const [current, setCurrent] = useState(null);
    const [forecastByDay, setForecastByDay] = useState([]);
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

            const { lat, lon } = currentRes.data.coord;
            setCurrent(currentRes.data);

            // 5 days / 3 hour forecast (returns list + city.timezone)
            const forecastRes = await axios.get(
                `https:api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
            );

            const list = forecastRes.data.list; // array of 3-hour entries
            const timezone = forecastRes.data.city?.timezone ?? 0; // seconds offset

            // Build map: dataString -> array of { item, hour, localDateObj }
            const daysMap = {};
            
            list.forEach((item) => {
                // item.dt is unix seconds UTC.
                const localMs = (item.dt + timezone) * 1000;
                const localDateObj = new Date(localMs);
                const localDateStr = localDateObj.toISOString().slice(0, 10);
                const hour = localDateObj.getUTCHours();

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
                // pick morning (~6) and night (~22). You can tweak target hours here.
                const morning = pickNearest(entries, 6);
                const night = pickNearest(entries, 22);

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