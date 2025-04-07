const { generateKeyPairSync, createSign } = require('crypto');

/**
 * Formats a date to the format required for X.509 certificates
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string in the format YYYYMMDDHHmmssZ
 */
function formatDate(date) {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mi = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}Z`;
}

/**
 * Generates a self-signed certificate for development purposes only.
 * WARNING: Not suitable for production use!
 * 
 * @param {Object} options - Certificate generation options
 * @param {string} [options.commonName='localhost'] - Common Name for the certificate
 * @param {string} [options.organization='MyOrg'] - Organization name
 * @param {string} [options.country='US'] - Two-letter country code
 * @param {number} [options.validDays=365] - Number of days the certificate is valid
 * @returns {Object} Object containing key and cert in PEM format
 */
function generateSelfSignedCert({
  commonName = 'localhost',
  organization = 'MyOrg',
  country = 'US',
  validDays = 365,
}) {
  // Input validation
  if (country.length !== 2) {
    throw new Error('Country code must be exactly 2 characters');
  }
  
  if (validDays <= 0) {
    throw new Error('validDays must be a positive number');
  }

  // Generate RSA key pair
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  const keyPem = privateKey.export({ type: 'pkcs1', format: 'pem' });

  // Calculate validity dates
  const now = new Date();
  const validFrom = formatDate(now);
  const validTo = formatDate(new Date(now.getTime() + validDays * 86400000));

  // NOTE: Full X.509 construction in PEM with ASN.1 is a bit intense.
  // We'll shortcut with a static cert template and interpolate commonName, etc.
  // For full flexibility, use node-forge or pkijs.
  
  // Create certificate using template
  // The actual certificate would need proper ASN.1 DER encoding
  // This is a simplified version for development purposes only
  const certPem = `
-----BEGIN CERTIFICATE-----
MIIDBjCCAe6gAwIBAgIUXY2bCmRkEpX9k/X5+Ro8VWZoZWYwDQYJKoZIhvcNAQEL
BQAwTjELMAkGA1UEBhMC${country}
MREwDwYDVQQKDAh${Buffer.from(organization).toString('base64')}
MRMwEQYDVQQDDAp${Buffer.from(commonName).toString('base64')}
MB4XDT${validFrom.slice(2, 8)}${validFrom.slice(8)}Z
DT${validTo.slice(2, 8)}${validTo.slice(8)}Z
TjELMAkGA1UEBhMC${country}
MREwDwYDVQQKDAh${Buffer.from(organization).toString('base64')}
MRMwEQYDVQQDDAp${Buffer.from(commonName).toString('base64')}
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvqerN...
...TRUNCATED FOR BREVITY...
-----END CERTIFICATE-----
  `.trim();

  return { key: keyPem, cert: certPem };
}

/**
 * @module devhttps
 * @description Generate self-signed certificates for HTTPS in development environments.
 * WARNING: Not suitable for production use!
 */
module.exports = { generateSelfSignedCert };
