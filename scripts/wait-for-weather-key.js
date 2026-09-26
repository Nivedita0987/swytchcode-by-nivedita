#!/usr/bin/env node
// OpenWeather API Key Activation Watcher
// New OpenWeather keys take ~10 minutes to 2 hours to activate after signup.
// This script polls the API until the key goes live, then prints a sample
// of the real telemetry your SentinelOps agent will receive.
//
// Usage: node scripts/wait-for-weather-key.js [city] [maxMinutes]

require('dotenv').config();

const key = process.env.OPENWEATHER_API_KEY;
const city = process.argv[2] || 'Gurgaon,IN';
const maxMinutes = parseInt(process.argv[3], 10) || 45;
const intervalMs = 30 * 1000; // poll every 30 seconds

if (!key) {
  console.error('❌ OPENWEATHER_API_KEY is not set. Add it to .env first.');
  process.exit(1);
}

console.log(`🔍 Watching OpenWeather key activation for "${city}"`);
console.log(`   Polling every 30s, giving up after ${maxMinutes} minutes.`);
console.log(`   (New keys typically activate within 10 minutes to 2 hours.)\n`);

const deadline = Date.now() + maxMinutes * 60 * 1000;
let attempt = 0;

async function checkOnce() {
  attempt++;
  try {
    const resp = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${key}`
    );
    if (resp.ok) {
      const d = await resp.json();
      console.log(`\n✅ KEY IS LIVE (attempt ${attempt})!`);
      console.log('--- Sample real telemetry your agent will receive ---');
      console.log(`   city:        ${d.name}, ${d.sys.country}`);
      console.log(`   temperature: ${Math.round(d.main.temp)}°C (feels like ${Math.round(d.main.feels_like)}°C)`);
      console.log(`   humidity:    ${d.main.humidity}%`);
      console.log(`   wind:        ${Math.round(d.wind.speed * 3.6)} km/h`);
      console.log(`   condition:   ${d.weather[0].main} - ${d.weather[0].description}`);
      console.log('\n🚀 Start the app (npm start) and run an agent workflow to see live telemetry in the dashboard.');
      return true;
    }
    const body = await resp.json().catch(() => ({}));
    if (resp.status === 401) {
      process.stdout.write(`.`);
      return false;
    }
    console.log(`\n⚠️ Attempt ${attempt}: HTTP ${resp.status} — ${body.message || 'unexpected error'}`);
    console.log('   (If this is not 401, the key itself may be wrong - double check it.)');
    return false;
  } catch (e) {
    console.log(`\n⚠️ Attempt ${attempt}: network error - ${e.message}`);
    return false;
  }
}

(async () => {
  while (Date.now() < deadline) {
    if (await checkOnce()) process.exit(0);
    await new Promise((res) => setTimeout(res, intervalMs));
  }
  console.log(`\n⏰ Still not active after ${maxMinutes} minutes (${attempt} attempts).`);
  console.log('   OpenWeather keys can take up to 2 hours. Re-run this script later:');
  console.log('   node scripts/wait-for-weather-key.js');
  process.exit(2);
})();
