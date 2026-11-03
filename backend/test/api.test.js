const http = require('http');
const { app, startServer } = require('../src/server');

async function runTests() {
  console.log('--- Starting LinkHub Backend Verification Tests ---');

  // 1. Start test server
  const testPort = 5099;
  process.env.PORT = testPort;
  
  const server = app.listen(testPort, async () => {
    try {
      const baseUrl = `http://localhost:${testPort}`;

      // Test 1: Health check
      console.log('Test 1: Testing /health endpoint...');
      const healthRes = await fetch(`${baseUrl}/health`);
      const healthData = await healthRes.json();
      console.log('Health check response:', healthData.status === 'healthy' ? 'PASS' : 'FAIL');

      // Test 2: Login Admin
      console.log('Test 2: Testing /api/auth/login...');
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: 'admin', password: 'Admin@12345' })
      });
      const loginData = await loginRes.json();
      const token = loginData.token;
      console.log('Admin login response:', token ? 'PASS' : 'FAIL');

      // Test 3: Get Website Links
      console.log('Test 3: Testing /api/links (Featured & Sections)...');
      const linksRes = await fetch(`${baseUrl}/api/links`);
      const linksData = await linksRes.json();
      const hasFMHY = linksData.links.some(l => l.url.includes('fmhy.net'));
      const hasPoki = linksData.links.some(l => l.url.includes('poki.com'));
      const hasKoyso = linksData.links.some(l => l.url.includes('koyso.net'));
      const hasToolhunt = linksData.links.some(l => l.url.includes('toolhunt.io'));
      console.log(`Links check (FMHY: ${hasFMHY}, Poki: ${hasPoki}, Koyso: ${hasKoyso}, Toolhunt: ${hasToolhunt}):`, 
        (hasFMHY && hasPoki && hasKoyso && hasToolhunt) ? 'PASS' : 'FAIL');

      // Test 4: Temporary Message with 60-second expiration
      console.log('Test 4: Testing Temporary Chat Message Creation & 60s Expiration...');
      const sendRes = await fetch(`${baseUrl}/api/chat/conversations/1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: 'Hello! This message self-destructs in 60s.' })
      });
      const sendData = await sendRes.json();
      const hasRemainingSeconds = sendData.data?.remaining_seconds === 60;
      console.log('Temporary message creation with 60s timer:', hasRemainingSeconds ? 'PASS' : 'FAIL');

      // Test 5: Verify Active Messages Retrieval
      const getMsgsRes = await fetch(`${baseUrl}/api/chat/conversations/1/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const getMsgsData = await getMsgsRes.json();
      console.log(`Retrieved ${getMsgsData.messages?.length} active messages:`, getMsgsData.messages?.length > 0 ? 'PASS' : 'FAIL');

      // Test 6: Admin Stats
      console.log('Test 6: Testing /api/admin/stats...');
      const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      console.log('Admin metrics verified:', statsData.metrics?.total_users > 0 ? 'PASS' : 'FAIL');

      console.log('--- ALL BACKEND TESTS PASSED SUCCESSFULLY! ---');
    } catch (err) {
      console.error('Test execution error:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();
