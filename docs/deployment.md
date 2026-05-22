# Deployment Notes

## Profiles

Use the default profile for local H2 based development. Use the prod profile for deployments.

The prod profile disables the H2 console and SQL logging. It expects deployment values to be supplied through environment variables.

## Database

PostgreSQL is supported through the runtime driver in the backend Maven build. The Docker Compose stack references PostgreSQL through environment variables and does not commit production secrets.

## Security

Use a strong JWT signing value from a secret manager in production. Do not commit deployment secrets. Restrict CORS origins to the deployed frontend domain.

## Checks

Run backend tests before deployment.

```bash
cd backend
mvn test
```

Run frontend lint and build before deployment.

```bash
cd frontend
npm ci
npm run lint
npm run build
```
