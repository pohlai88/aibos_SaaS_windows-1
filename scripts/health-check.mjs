// Remove node-fetch import and use native fetch
const endpoints = {
  backend: 'https://your-backend.railway.app/health',
  frontend: 'https://your-frontend.vercel.app/api/health'
};

async function checkHealth() {
  console.log('🔍 Running health checks...');
  
  for (const [service, url] of Object.entries(endpoints)) {
    try {
      // Use native fetch (Node.js 18+)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'AI-BOS-Health-Check/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ ${service}: Healthy (${response.status})`);
      } else {
        console.log(`❌ ${service}: Unhealthy (${response.status})`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`❌ ${service}: Timeout (5s)`);
      } else {
        console.log(`❌ ${service}: Error - ${error.message}`);
      }
    }
  }
}

checkHealth();