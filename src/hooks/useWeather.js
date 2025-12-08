import { useState } from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export function useWeather() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchWeather = async (city) => {
        if (!city) return;

        try {
            setLoading(true);
            setError("");

            const res = await axios.get(
                `https:api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
            );

            setData(res.data);
        } catch (err) {
            setError("City not found");
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, fetchWeather };
}