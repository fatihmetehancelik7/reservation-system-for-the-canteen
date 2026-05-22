# Environment Variables

The backend configuration can be controlled with environment variables.

## Runtime

SERVER_PORT controls the HTTP port.
ACTIVE_YEAR controls the reservation year.
DAILY_PRICE controls the per-day meal price.
APP_TIMEZONE controls server-side date checks.
CORS_ALLOWED_ORIGINS controls accepted frontend origins.
JWT_EXPIRATION_MS controls token lifetime.

## Database

SPRING_DATASOURCE_URL controls the JDBC URL.
SPRING_DATASOURCE_DRIVER_CLASS_NAME controls the JDBC driver.
SPRING_DATASOURCE_USERNAME controls the database username.
SPRING_DATASOURCE_PASSWORD controls the database password.
SPRING_JPA_DATABASE_PLATFORM controls the Hibernate dialect.
SPRING_JPA_HIBERNATE_DDL_AUTO controls schema update behavior.
SPRING_JPA_SHOW_SQL controls SQL logging.
SPRING_JPA_FORMAT_SQL controls SQL formatting.

## Development only

H2_CONSOLE_ENABLED controls the H2 console.
H2_CONSOLE_WEB_ALLOW_OTHERS controls remote H2 console access.

## Security

JWT_SECRET must be supplied from a secure deployment secret store in production. Do not commit production secrets.
