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

async function runTests() {
  console.log('=== PART 2: BACKEND AUTH API VERIFICATION TESTS ===\n');

  // Test 1: Health Endpoint
  const health = await makeRequest('/api/health', 'GET');
  console.log('1. Health Endpoint:', health.status, JSON.stringify(health.body));

  // Test 2: Register New User
  const testEmail = `testuser_${Date.now()}@example.com`;
  const regResult = await makeRequest('/api/auth/register', 'POST', {
    name: 'Test Runner',
    email: testEmail,
    password: 'Password123',
  });
  console.log('2. Register New User:', regResult.status, JSON.stringify(regResult.body));

  const token = regResult.body?.data?.token;

  // Test 3: Duplicate Registration
  const dupResult = await makeRequest('/api/auth/register', 'POST', {
    name: 'Test Runner',
    email: testEmail,
    password: 'Password123',
  });
  console.log('3. Duplicate Email Registration:', dupResult.status, JSON.stringify(dupResult.body));

  // Test 4: Short Password
  const shortPassResult = await makeRequest('/api/auth/register', 'POST', {
    name: 'Short Pass',
    email: `short_${Date.now()}@example.com`,
    password: '123',
  });
  console.log('4. Short Password Validation:', shortPassResult.status, JSON.stringify(shortPassResult.body));

  // Test 5: Login Correct Credentials
  const loginSuccess = await makeRequest('/api/auth/login', 'POST', {
    email: testEmail,
    password: 'Password123',
  });
  console.log('5. Login Correct Credentials:', loginSuccess.status, JSON.stringify(loginSuccess.body));

  // Test 6: Login Wrong Password
  const loginFail = await makeRequest('/api/auth/login', 'POST', {
    email: testEmail,
    password: 'WrongPassword999',
  });
  console.log('6. Login Wrong Password:', loginFail.status, JSON.stringify(loginFail.body));

  // Test 7: Protected Route /me with Token
  if (token) {
    const meResult = await makeRequest('/api/auth/me', 'GET', null, {
      Authorization: `Bearer ${token}`,
    });
    console.log('7. Protected /api/auth/me:', meResult.status, JSON.stringify(meResult.body));
  }

  console.log('\n=== BACKEND API TESTS COMPLETED ===');
}

runTests().catch(console.error);
