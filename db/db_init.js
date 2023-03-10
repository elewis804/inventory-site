const db = require("./db_connection");

/**** Delete existing table, if any ****/

db.execute("DROP TABLE IF EXISTS decks;");

/**** Create "stuff" table (again)  ****/

db.execute(`
    CREATE TABLE decks
    (
        deckID          INT         NOT NULL AUTO_INCREMENT,
        useremail   VARCHAR(50) NOT NULL,
        name        VARCHAR(45) NOT NULL,
        cards    INT         NOT NULL,
        description VARCHAR(150) NULL,
        PRIMARY KEY (deckID)
    );
`);

db.end();