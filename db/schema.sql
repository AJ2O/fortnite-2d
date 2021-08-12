--- load with
--- sqlite3 database.db < schema.sql
DROP TABLE player;

CREATE TABLE player (
    username VARCHAR(20) PRIMARY KEY,
    password VARCHAR(80) NOT NULL,
    email VARCHAR(255),
    birthday VARCHAR(10),
    year VARCHAR(10),
    lecture VARCHAR(10),
    score INTEGER
);
