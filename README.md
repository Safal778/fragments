# Fragments

Fragments is a Node.js and Express API for creating, listing, and retrieving
user-owned fragments.

## Requirements

- Node.js 20.6 or newer
- npm

## Setup

Install dependencies and create a local environment file:

```powershell
npm ci
Copy-Item .env.example .env
```

The example environment selects local HTTP Basic Auth. For Thunder Client,
choose **Basic Auth** and use `test-user1@fragments-testing.com` /
`test-password1`; these test credentials are for development/testing only.
To use AWS Cognito instead, remove `HTPASSWD_FILE` and set
`AWS_COGNITO_POOL_ID` and `AWS_COGNITO_CLIENT_ID`. The application rejects
simultaneous Cognito and Basic Auth configuration; Basic Auth is disabled when
`NODE_ENV=production`.

Run the development server:

```powershell
npm run dev
```

The API listens on port 8080 by default. Set `PORT` and `API_URL` in `.env` to
change the port and the base URL used for fragment `Location` headers.

## API

All fragment endpoints are under `/v1` and require authentication:

- `POST /v1/fragments` — create a fragment. Currently accepts supported content
  types including `text/plain`.
- `GET /v1/fragments` — list the authenticated user's fragment IDs.
- `GET /v1/fragments/:id` — retrieve one of the authenticated user's fragments.

`GET /` is a non-cacheable health check and does not require authentication.

## Development commands

```bash
npm test
npm run coverage
npm run lint
npm run format:check
npm run format
npm start
npm run dev
npm run debug
```

Jest loads test-only settings from `env.jest`; local `.env` values are not
needed to run the tests. Coverage enforces a minimum of 80% line coverage.
GitHub Actions runs formatting checks, ESLint, and the unit tests.

## Logging

The service uses structured Pino logs. Set `FRAGMENTS_LOG_LEVEL` to `fatal`,
`error`, `warn`, `info`, `debug`, or `trace`; the default is `info`.

## Repository

Safal (GitHub: [@Safal778](https://github.com/Safal778))
