CREATE TYPE ROLE AS ENUM ('admin', 'manager', 'agent');


CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(128) NOT NULL UNIQUE,
  password VARCHAR(128) NOT NULL,

  company INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch INTEGER NOT NULL REFERENCES branches(id),
  role ROLE NOT NULL,

  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);