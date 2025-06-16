#!/usr/bin/env node

/**
 * CORS Diagnostic Script
 * Tests CORS configuration and provides detailed analysis
 */

const https = require('https');
const http = require('http');

const SERVER_URL = '207.180.201.77';
const ORIGINS_TO_TEST = [
  'http://localhost:19011',
  'http://localhost:19007',
  'http://localhost:3000',
  'https://localhost:3000'
];

const API_ENDPOINTS = [
  '/api/auth/me',
  '/api/auth/login',
  '/api/activites',
  '/api/sites'
];

console.log('🔍 CORS DIAGNOSTIC TOOL');
console.log('========================\n');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https://') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        error: error.message,
        statusCode: null,
        headers: {},
        data: null
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        error: 'Request timeout',
        statusCode: null,
        headers: {},
        data: null
      });
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testCorsHeaders(endpoint, origin) {
  console.log(`\n🧪 Testing CORS for ${endpoint} from origin: ${origin}`);
  console.log('─'.repeat(60));

  // Test 1: OPTIONS preflight request
  console.log('1️⃣  Testing OPTIONS (preflight) request...');
  
  const preflightUrl = `https://${SERVER_URL}${endpoint}`;
  const preflightOptions = {
    method: 'OPTIONS',
    headers: {
      'Origin': origin,
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
  };

  const preflightResponse = await makeRequest(preflightUrl, preflightOptions);
  
  if (preflightResponse.error) {
    console.log(`   ❌ ERROR: ${preflightResponse.error}`);
  } else {
    console.log(`   ✅ Status: ${preflightResponse.statusCode}`);
    
    const corsHeaders = {
      'access-control-allow-origin': preflightResponse.headers['access-control-allow-origin'],
      'access-control-allow-methods': preflightResponse.headers['access-control-allow-methods'],
      'access-control-allow-headers': preflightResponse.headers['access-control-allow-headers'],
      'access-control-allow-credentials': preflightResponse.headers['access-control-allow-credentials']
    };

    console.log('   📋 CORS Headers:');
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) {
        console.log(`      ${key}: ${value}`);
      } else {
        console.log(`      ${key}: ❌ MISSING`);
      }
    });
  }

  // Test 2: Actual GET request
  console.log('\n2️⃣  Testing actual GET request...');
  
  const getOptions = {
    method: 'GET',
    headers: {
      'Origin': origin,
      'Content-Type': 'application/json'
    }
  };

  const getResponse = await makeRequest(preflightUrl, getOptions);
  
  if (getResponse.error) {
    console.log(`   ❌ ERROR: ${getResponse.error}`);
  } else {
    console.log(`   ✅ Status: ${getResponse.statusCode}`);
    
    const allowOrigin = getResponse.headers['access-control-allow-origin'];
    if (allowOrigin) {
      console.log(`   🌐 Access-Control-Allow-Origin: ${allowOrigin}`);
    } else {
      console.log('   ❌ Missing Access-Control-Allow-Origin header');
    }

    if (getResponse.statusCode === 401) {
      console.log('   🔐 401 Unauthorized - This is expected without authentication');
    }
  }
}

async function testUrlFormats() {
  console.log('\n🔗 TESTING URL FORMATS');
  console.log('======================\n');

  const urlsToTest = [
    `http://${SERVER_URL}:443/api/auth/me`,  // ❌ Wrong format
    `https://${SERVER_URL}:443/api/auth/me`, // ⚠️  Redundant port
    `https://${SERVER_URL}/api/auth/me`,     // ✅ Correct format
  ];

  for (const url of urlsToTest) {
    console.log(`Testing: ${url}`);
    
    const response = await makeRequest(url, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:19011'
      }
    });

    if (response.error) {
      console.log(`   ❌ ERROR: ${response.error}`);
    } else {
      console.log(`   ✅ Status: ${response.statusCode}`);
      if (response.headers['access-control-allow-origin']) {
        console.log(`   🌐 CORS: ${response.headers['access-control-allow-origin']}`);
      } else {
        console.log('   ❌ No CORS headers');
      }
    }
    console.log('');
  }
}

async function generateCurlCommands() {
  console.log('\n🔧 CURL COMMANDS FOR MANUAL TESTING');
  console.log('====================================\n');

  console.log('1️⃣  Test OPTIONS preflight request:');
  console.log(`curl -X OPTIONS https://${SERVER_URL}/api/auth/me \\
  -H "Origin: http://localhost:19011" \\
  -H "Access-Control-Request-Method: GET" \\
  -H "Access-Control-Request-Headers: Content-Type" \\
  -v\n`);

  console.log('2️⃣  Test actual GET request:');
  console.log(`curl -X GET https://${SERVER_URL}/api/auth/me \\
  -H "Origin: http://localhost:19011" \\
  -H "Content-Type: application/json" \\
  -v\n`);

  console.log('3️⃣  Test with authentication (replace TOKEN with actual token):');
  console.log(`curl -X GET https://${SERVER_URL}/api/auth/me \\
  -H "Origin: http://localhost:19011" \\
  -H "Content-Type: application/json" \\
  -H "Cookie: token=YOUR_TOKEN_HERE" \\
  -v\n`);
}

function provideSolutions() {
  console.log('\n💡 SOLUTIONS SUMMARY');
  console.log('====================\n');

  console.log('🔧 1. Fix URL Format in Your Mobile App:');
  console.log('   ❌ Wrong: http://207.180.201.77:443');
  console.log('   ✅ Correct: https://207.180.201.77\n');

  console.log('🔧 2. Ensure CORS Middleware is Active:');
  console.log('   - The middleware.js file has been updated with CORS support');
  console.log('   - Rebuild and restart your application on the server\n');

  console.log('🔧 3. Update Your Mobile App API Configuration:');
  console.log(`   const API_BASE_URL = 'https://${SERVER_URL}';
   
   // Always include credentials for cookies
   fetch(\`\${API_BASE_URL}/api/auth/me\`, {
     method: 'GET',
     credentials: 'include',
     headers: {
       'Content-Type': 'application/json'
     }
   })\n`);

  console.log('🔧 4. Server Deployment Steps:');
  console.log('   1. Upload the updated middleware.js to your server');
  console.log('   2. Run: npm run build');
  console.log('   3. Run: pm2 restart suivicluster');
  console.log('   4. Check logs: pm2 logs suivicluster\n');
}

async function main() {
  try {
    // Test URL formats
    await testUrlFormats();

    // Test CORS for different origins and endpoints
    for (const origin of ORIGINS_TO_TEST) {
      for (const endpoint of API_ENDPOINTS.slice(0, 2)) { // Test first 2 endpoints
        await testCorsHeaders(endpoint, origin);
      }
    }

    // Generate curl commands
    generateCurlCommands();

    // Provide solutions
    provideSolutions();

    console.log('🎯 DIAGNOSTIC COMPLETE');
    console.log('======================');
    console.log('Review the results above to identify and fix CORS issues.\n');

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

// Run the diagnostic
main();
