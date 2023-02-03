const express = require( "express" );
const logger = require( "morgan" );
const app = express();
const port = 6969;
const db = require("./db/db_connection")
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.static(__dirname + '/public'));

app.use( express.urlencoded( { extended: false } ) );

app.get( "/", ( req, res ) => {
    res.render("index");
} );

app.get( "/list", ( req, res ) => {
    db.execute("SELECT deckID, name, cards FROM decks;", (error, results) => {
        if (error) {
            res.status(500).send(error);
        } else {
            res.render("list", {inventory: results});
        }
    })
} );

const read_item_sql = `
    SELECT name, cards, description, deckID
    FROM decks
    WHERE deckID = ?;
`

app.get( "/list/item/:id", ( req, res ) => {
    db.execute(read_item_sql, [req.params.id], (error, results) => {
        if (error) {
            res.status(500).send(error);
        } else if (results.length === 0) {
            res.status(404).send(`No item found with id = ${req.params.id}`);
        } else {
            res.render("item", results[0]);
        }
    })
});

const delete_item_sql = `
    DELETE FROM decks
    WHERE deckID = ?
`

app.get( "/list/item/:id/delete", ( req, res ) => {
    db.execute(delete_item_sql, [req.params.id], (error, results) => {
        if (error) {
            res.status(500).send(error);
        } else if (results.length === 0) {
            res.status(404).send(`No item found with id = ${req.params.id}`);
        } else {
            res.redirect("/list")
        }
    })
});

const post_item_sql = `
    INSERT INTO decks
    (name, cards, description)
    VALUES
    (?, ?, ?)
`
app.post("/list", (req, res) => {
    db.execute(post_item_sql, [req.body.name, req.body.quantity, req.body.description], (error, results) => {
        if (error) {
            res.status(500).send(error);
        } else if (results.length === 0) {
            res.status(404).send(`No item found with id = ${req.params.id}`);
        } else {
            res.redirect("/list")
        }
    })
})

const update_item_sql = `
UPDATE
    decks
SET
    name = ?,
    cards = ?,
    description = ?
WHERE
    deckID = ?
`

app.post("/list/item/:id", (req, res) => {
    db.execute(update_item_sql, [req.body.name, req.body.quantity, req.body.description, req.params.id], (error, results) => {
        if (error) {
            res.status(500).send(error);
        } else if (results.length === 0) {
            res.status(404).send(`No item found with id = ${req.params.id}`);
        } else {
            res.redirect(`/list/item/${req.params.id}`)
        }
    })
})

// start the server
app.listen( port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
} );