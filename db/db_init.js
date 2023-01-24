const db = require("./db_connection");

const drop_stuff_table_sql = "DROP TABLE IF EXISTS `stuff`;"

db.execute(drop_stuff_table_sql);


const create_stuff_table_sql = `
    CREATE TABLE stuff
    (
        id          INT         NOT NULL AUTO_INCREMENT,
        item        VARCHAR(45) NOT NULL,
        quantity    INT         NOT NULL,
        description VARCHAR(150) NULL,
        PRIMARY KEY (id)
    );
`
db.execute(create_stuff_table_sql);

const insert_stuff_table_sql = `
    INSERT INTO stuff
        (item, quantity, description)
    VALUES (?, ?, ?);
`

db.execute(insert_stuff_table_sql, ['Blue-Eyes', 28, 'A deck built around the fearsome Blue-Eyes White Dragon and its retrains. It also has many strong extra deck monsters, including Xyz monsters and level 9 synchro monsters.']);
db.execute(insert_stuff_table_sql, ['Heroes', 51, 'A deck built on the Heroes archetype, focusing on Fusion summoning strong effect monsters to the field.']);
db.execute(insert_stuff_table_sql, ['Branded Despia', 55, 'A deck built with the Branded engine in order to bring out powerful fusion monsters. In addition, Despia cards help to bring out even more powerful monsters and strong effects.']);
db.execute(insert_stuff_table_sql, ['Dark Magician', 0, 'A deck built around Dark Magician, with a major focus on bringing it out to the field and using spell and trap cards as substitutes for effects.']);

const read_stuff_table_sql = "SELECT * FROM stuff";

db.execute(read_stuff_table_sql,
    (error, results) => {
        if (error)
            throw error;

        console.log("Table 'stuff' initialized with:")
        console.log(results);
    }
);

db.end();