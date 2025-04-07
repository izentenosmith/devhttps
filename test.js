const assert = require('assert');
const https = require('https');
const { generateSelfSignedCert } = require('./index');

/**
 * Simple test suite for devhttps package
 */
async function runTests() {
  console.log('Running devhttps tests...');
  
  try {
    // Test 1: Default parameters
    console.log('Test 1: Generate certificate with default parameters');
    const defaultCert = generateSelfSignedCert({});
    assert(defaultCert.key, 'Key should be generated');
    assert(defaultCert.cert, 'Certificate should be generated');
    assert(defaultCert.key.includes('-----BEGIN RSA PRIVATE KEY-----'), 'Key should be in PEM format');
    assert(defaultCert.cert.includes('-----BEGIN CERTIFICATE-----'), 'Certificate should be in PEM format');
    console.log('✅ Test 1 passed');

    // Test 2: Custom parameters
    console.log('Test 2: Generate certificate with custom parameters');
    const customCert = generateSelfSignedCert({
      commonName: 'test.local',
      organization: 'Test Org',
      country: 'CA',
      validDays: 30
    });
    assert(customCert.key, 'Key should be generated');
    assert(customCert.cert, 'Certificate should be generated');
    assert(customCert.cert.includes('CA'), 'Certificate should contain country code');
    console.log('✅ Test 2 passed');

    // Test 3: Input validation
    console.log('Test 3: Input validation');
    try {
      generateSelfSignedCert({ country: 'USA' });
      assert.fail('Should throw error for invalid country code');
    } catch (error) {
      assert(error.message.includes('Country code must be exactly 2 characters'), 
        'Should throw specific error for invalid country code');
    }

    try {
      generateSelfSignedCert({ validDays: 0 });
      assert.fail('Should throw error for invalid validDays');
    } catch (error) {
      assert(error.message.includes('validDays must be a positive number'), 
        'Should throw specific error for invalid validDays');
    }
    console.log('✅ Test 3 passed');

    // Test 4: HTTPS server creation (optional)
    console.log('Test 4: Create HTTPS server with generated certificate');
    const { key, cert } = generateSelfSignedCert({});
    const server = https.createServer({ key, cert }, (req, res) => {
      res.writeHead(200);
      res.end('Test server running');
    });
    
    // Start server on random port
    await new Promise((resolve, reject) => {
      server.listen(0, () => {
        const port = server.address().port;
        console.log(`Test server started on port ${port}`);
        // Close server immediately after successful start
        server.close(() => {
          console.log('Test server closed');
          resolve();
        });
      });
      server.on('error', reject);
    });
    console.log('✅ Test 4 passed');

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests(); 