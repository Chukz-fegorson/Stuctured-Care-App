DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = 'strutured_care'
    ) THEN
        CREATE ROLE strutured_care LOGIN PASSWORD 'strutured_care';
    ELSE
        ALTER ROLE strutured_care WITH LOGIN PASSWORD 'strutured_care';
    END IF;
END
$$;

COMMENT ON ROLE strutured_care IS 'Structure Health application role';

-- Run the statement below once from the postgres database in pgAdmin if the
-- database does not already exist.
-- CREATE DATABASE strutured_care OWNER strutured_care;
