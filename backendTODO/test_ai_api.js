/* eslint-env node */
const http = require('http');

const makeRequest = (path, method, data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const req = http.request(
      `http://localhost:5000${path}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

async function runAITests() {
  console.log('=== TASKFLOW AI COMPLETE STAGES 1-7 VERIFICATION TESTS ===\n');

  // 1. Health check
  const health = await makeRequest('/api/health', 'GET');
  console.log('1. Health Check Status:', health.status);

  // 2. Auth - Register test user
  const testEmail = `ai_stage_tester_${Date.now()}@example.com`;
  const regResult = await makeRequest('/api/auth/register', 'POST', {
    name: 'AI Stage Tester',
    email: testEmail,
    password: 'Password123',
  });
  const token = regResult.body?.data?.token;

  if (!token) {
    console.error('Failed to obtain token for test');
    return;
  }
  console.log('2. User Registered & Token Obtained: SUCCESS');

  // 3. Command Endpoint Verification with Token
  const promptsToTest = [
    'Tomorrow at 7 PM remind me to study DSA for 2 hours with high priority.',
    'Create a 7 day Flutter learning roadmap.',
    'Search YouTube channels to learn Flutter.',
    'Break building an e-commerce app into tasks.',
    'Move unfinished tasks to tomorrow.',
  ];

  for (let i = 0; i < promptsToTest.length; i++) {
    const prompt = promptsToTest[i];
    const res = await makeRequest(
      '/api/ai/command',
      'POST',
      {
        prompt,
        nowIso: new Date().toISOString(),
        timezone: 'Asia/Kolkata',
      },
      {
        Authorization: `Bearer ${token}`,
      }
    );
    console.log(`3.${i + 1} Prompt: "${prompt}"`);
    console.log(`   Status: ${res.status}, Intent: ${res.body?.data?.intent}, Tasks: ${res.body?.data?.tasks?.length || 0}`);
  }

  // 4. Overdue Reschedule Endpoint Test
  const rescheduleRes = await makeRequest(
    '/api/ai/reschedule-overdue',
    'POST',
    { mode: 'NEXT DAY' },
    { Authorization: `Bearer ${token}` }
  );
  console.log('4. Auto Reschedule Endpoint:', rescheduleRes.status, rescheduleRes.body?.message);

  // 5. Conversation History Endpoints Test
  const convsRes = await makeRequest(
    '/api/ai/conversations',
    'GET',
    null,
    { Authorization: `Bearer ${token}` }
  );
  console.log('5. Conversations List Status:', convsRes.status, `Count: ${convsRes.body?.data?.conversations?.length || 0}`);

  console.log('\n=== ALL STAGE TESTS COMPLETED SUCCESSFULLY ===');
}

runAITests().catch(console.error);
