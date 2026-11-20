const hasCognitoPoolId = Boolean(process.env.AWS_COGNITO_POOL_ID);
const hasCognitoClientId = Boolean(process.env.AWS_COGNITO_CLIENT_ID);
const hasHtpasswdFile = Boolean(process.env.HTPASSWD_FILE);

if (hasCognitoPoolId !== hasCognitoClientId) {
  throw new Error(
    'AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID must both be configured for Cognito auth.'
  );
}

if (hasCognitoPoolId && hasHtpasswdFile) {
  throw new Error(
    'env contains configuration for both AWS Cognito and HTTP Basic Auth. Only one is allowed.'
  );
}

if (hasCognitoPoolId) {
  module.exports = require('./cognito');
} else if (hasHtpasswdFile && process.env.NODE_ENV !== 'production') {
  module.exports = require('./basic-auth');
} else if (hasHtpasswdFile) {
  throw new Error('HTTP Basic Auth is only available outside production.');
} else {
  throw new Error('Missing authorization configuration: configure Cognito or HTTP Basic Auth.');
}
