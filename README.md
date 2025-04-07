# devhttps

🛡️ Generate a private key and self-signed certificate using only Node.js core modules.

## ⚠️ WARNING

**This package is intended for LOCAL DEVELOPMENT ONLY!**

Do NOT use this in production environments. The certificates generated are self-signed and not trusted by browsers or other clients. For production, always use properly signed certificates from a trusted Certificate Authority.

## Install

```bash
npm install --save-dev devhttps
```

## Usage

```js
const { generateSelfSignedCert } = require('devhttps');
const https = require('https');

const { key, cert } = generateSelfSignedCert({
  commonName: 'dev',
  organization: 'My Dev Org',
  country: 'US',
  validDays: 365,
});

https.createServer({ key, cert }, (req, res) => {
  res.writeHead(200);
  res.end(`Hello Secure World from commonName: ${commonName}, organization: ${organization}, country: ${country}, validDays: ${validDays}`);
}).listen(5000, () => {
  console.log('Listening on https://localhost:5000');
});
```
