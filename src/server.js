const express = require('express');
const axios = require('axios');
const app = express();
const port = 3001;

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Weatherstack proxy server running. Use /weather to fetch data.' });
});

app.get('/weather', async (req, res) => {
  const API_KEY = '';
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Coordinates required' });
  }

  try {
    const WEATHER_URL = `http://api.weatherstack.com/current?access_key=${API_KEY}&query=${lat},${lon}&units=m`;
    const response = await axios.get(WEATHER_URL);

    if (response.data.error) {
      console.log(`Weatherstack error: ${response.data.error.info}`);
      return res.status(400).json({ error: response.data.error.info });
    }

    const data = response.data;
    console.log(`[${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}] Temp for ${data.location.name}: ${data.current.temperature}°C`);

    const weatherData = {
      city: data.location.name || 'Unknown Location',
      current: {
        temp: data.current.temperature,
        feels_like: data.current.feelslike,
        humidity: data.current.humidity,
        clouds: data.current.cloudcover,
        visibility: data.current.visibility,
        wind_speed: data.current.wind_speed / 3.6, // km/h to m/s
        wind_deg: data.current.wind_degree,
        uvi: data.current.uv_index || 0,
        pop: data.current.precip || 0,
        dt: Math.floor(Date.now() / 1000),
      },
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Proxy error:', error.message, error.response?.status, error.response?.data);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch weather data',
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});