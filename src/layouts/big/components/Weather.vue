<script setup>
import { onMounted, ref } from 'vue';

const weatherData = ref(null);
const loading = ref(false);

// 获取天气数据
async function fetchWeather() {
  try {
    loading.value = true;
    // const response = await fetch(
    //   'https://restapi.amap.com/v3/weather/weatherInfo?city=230000&key=14624b183d2be218bf7a44922e1d3c78'
    // )
    // const data = await response.json()

    // if (data.status === '1' && data.lives && data.lives.length > 0) {
    //   const live = data.lives[0]
    //   weatherData.value = {
    //     city: live.city,
    //     weather: live.weather,
    //     temperature: live.temperature,
    //   }
    // }
    // 模拟数据
    weatherData.value = {
      city: '黑龙江',
      weather: '晴',
      temperature: -18
    };
  } catch (error) {
    console.error('获取天气数据失败:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchWeather();
  // 每30分钟更新一次天气数据
  setInterval(fetchWeather, 30 * 60 * 1000);
});
</script>

<template>
  <div class="weather-container">
    <div v-if="!loading && weatherData" class="weather-info">
      <span class="city">{{ weatherData.city }}</span>
      <span class="weather">{{ weatherData.weather }}</span>
      <span class="temperature">{{ weatherData.temperature }}°C</span>
    </div>
    <div v-if="loading" class="weather-loading">
      加载中...
    </div>
  </div>
</template>

<style lang="scss" scoped>
.weather-container {
  display: flex;
  align-items: center;
  color: #c4f3fe;
  // font-family: 'HYYKH-1';

  .weather-info {
    display: flex;
    align-items: flex-end;
    gap: 12px;

    .city {
      font-size: 13px;
      opacity: 0.8;
    }

    .weather {
      font-size: 13px;
      opacity: 0.8;
    }

    .temperature {
      font-size: 16px;
      // font-weight: bold;
      color: #ffffff;
      text-shadow: 0 0 5px #c4f3fe;
    }
  }

  .weather-loading {
    font-size: 12px;
    color: #c4f3fe;
  }
}
</style>
