import { useState } from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export function useWeather() {
    const [current, setCurrent] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchWeather = async (city) => {
        if (!city) return;

        try {
            setLoading(true);
            setError("");

            // Current weather
            const currentRes = await axios.get(
                `https:api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
            );

            const { lat, lon } = currentRes.data.coord;
            setCurrent(currentRes.data);

            // 7 days forecast
            const forecastRes = await axios.get(
                `https:api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
            );

            setForecast(forecastRes.data.list);
        } catch (err) {
            setError("City not found");
        } finally {
            setLoading(false);
        }
    };

    return { current, forecast, loading, error, fetchWeather };
}