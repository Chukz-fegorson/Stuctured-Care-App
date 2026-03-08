# pgAdmin Setup

Use the local PostgreSQL 17 Windows service on `localhost:5432` as the single
database for Structure Health. This makes pgAdmin the live inspection surface
for the same data the app writes to.

## One-Time Setup

1. Open pgAdmin and connect to the local PostgreSQL 17 server.
2. Open the `postgres` database in Query Tool.
3. Run [pgadmin-bootstrap.sql](/c:/Users/chuks.omedo/Desktop/JAVA%20PROJECTS/Structure%20Health/database/pgadmin-bootstrap.sql).
4. If `strutured_care` does not already exist, run:

```sql
CREATE DATABASE strutured_care OWNER strutured_care;
```

5. Refresh pgAdmin and confirm the `strutured_care` database appears.

## App Connection

- Host: `localhost`
- Port: `5432`
- Database: `strutured_care`
- Username: `strutured_care`
- Password: `strutured_care`

## Notes

- The app scripts now default to `localhost:5432`.
- Once the database exists, Flyway will create and update the schema when the
  services start.
- Querying from pgAdmin shows the same live data the app is using.
- To restore the demo dataset, run [demo-reset.sql](/c:/Users/chuks.omedo/Desktop/JAVA%20PROJECTS/Structure%20Health/database/demo-reset.sql) and then [demo-seed.sql](/c:/Users/chuks.omedo/Desktop/JAVA%20PROJECTS/Structure%20Health/database/demo-seed.sql) in Query Tool, or use [demo-reset.cmd](/c:/Users/chuks.omedo/Desktop/JAVA%20PROJECTS/Structure%20Health/demo-reset.cmd).
