import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiFog } from 'react-icons/wi';
// Stilləri ana dashboard faylından götürdüyünü fərz edirik
// Əgər ayrıca CSS faylı varsa, onu import edin: import './WeatherWidget.css';

// Hava ikonunu API-dən gələn koda görə təyin edən köməkçi funksiya
const getWeatherIcon = (iconCode) => {
    if (!iconCode) return <WiDaySunny />;
    const code = iconCode.slice(0, 2);
    switch (code) {
        case '01': return <WiDaySunny />;
        case '02': return <WiDaySunny />;
        case '03': return <WiCloudy />;
        case '04': return <WiCloudy />;
        case '09': return <WiRain />;
        case '10': return <WiRain />;
        case '11': return <WiThunderstorm />;
        case '13': return <WiSnow />;
        case '50': return <WiFog />;
        default: return <WiDaySunny />;
    }
};

// === DƏYİŞİKLİK: Komponentə "onWeatherLoad" prop-u əlavə edildi ===
const WeatherWidget = ({ onWeatherLoad }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState('');

    useEffect(() => {
        const API_KEY = 'f62c28934b3520eb832ad756103a255f'; // Sizin API açarınız

        const processWeatherData = (data) => {
            setWeather(data);
            if (onWeatherLoad) {
                // Məlumatı ana komponentə (DashboardPage) ötürürük
                onWeatherLoad(data);
            }
        };

        const fetchWeatherByCoords = async (lat, lon) => {
            try {
                const { data } = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=az`
                );
                processWeatherData(data);
            } catch (error) {
                setNotice('Hava proqnozunu yükləmək mümkün olmadı.');
            } finally {
                setLoading(false);
            }
        };
        
        const fetchWeatherByCity = async (city = 'Baku') => {
             try {
                const { data } = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=az`
                );
                processWeatherData(data);
            } catch (error) {
                setNotice('Hava proqnozunu yükləmək mümkün olmadı.');
            } finally {
                setLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    setNotice('Məkan icazəsi verilmədi, Bakı üçün hava göstərilir.');
                    fetchWeatherByCity();
                }
            );
        } else {
            setNotice('Brauzeriniz geolokasiyanı dəstəkləmir, Bakı üçün hava göstərilir.');
            fetchWeatherByCity();
        }
    }, [onWeatherLoad]); // Effekti onWeatherLoad dəyişdikdə yenidən işə salırıq

    if (loading) {
        return (
            <div className="dashboard-widget weather-widget loading">
                <p>Hava proqnozu yüklənir...</p>
            </div>
        );
    }

    if (!weather) {
        return (
             <div className="dashboard-widget weather-widget error">
                <p>{notice || 'Hava proqnozunu yükləmək mümkün olmadı.'}</p>
            </div>
        );
    }

    return (
        <div className="dashboard-widget weather-widget">
            <h3>Hava Proqnozu: {weather.name}</h3>
            {notice && <p className="weather-notice">{notice}</p>}
            <div className="weather-content">
                <div className="weather-icon">
                    {getWeatherIcon(weather.weather[0].icon)}
                </div>
                <div className="weather-details">
                    <p className="temperature">{Math.round(weather.main.temp)}°C</p>
                    <p className="description">{weather.weather[0].description}</p>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
