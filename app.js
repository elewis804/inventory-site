const express = require("express");
const logger = require("morgan");
const app = express();
const db = require("./db/db_pool")
const helmet = require("helmet");
const {auth, requiresAuth} = require('express-openid-connect');
const port = process.env.PORT || 6969;
const dotenv = require("dotenv");

dotenv.config();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASEURL,
    clientID: process.env.CLIENTID,
    issuerBaseURL: process.env.ISSUERBASEURL
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router

app.use(logger("dev"));
app.use(express.static(__dirname + '/public'));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'cdnjs.cloudflare.com'],
        }
    }
}));

app.use(express.urlencoded({extended: false}));
app.use((req, res, next) => {
    res.locals.isLoggedIn = req.oidc.isAuthenticated();
    res.locals.user = req.oidc.user;
    next();
})

app.get('/authtest', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
})

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/list", requiresAuth(), (req, res) => {
    db.execute("SELECT deckID, name, cards FROM decks WHERE decks.userEmail = ?;", [req.oidc.user.email], (error, results) => {
        if (error) {
            res.status(500).send(error);
        } else {
            res.render("list", {inventory: results});
        }
    })
});

const read_item_sql = `
    SELECT name, cards, description, deckID
    FROM decks
    WHERE deckID = ?
      AND userEmail = ?;
`

app.get("/list/item/:id", requiresAuth(), (req, res) => {
    db.execute(read_item_sql, [req.params.id, req.oidc.user.email], (error, results) => {
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
    DELETE
    FROM decks
    WHERE deckID = ?
      AND userEmail = ?;
`

app.get("/list/item/:id/delete", requiresAuth(), (req, res) => {
    db.execute(delete_item_sql, [req.params.id, req.oidc.user.email], (error, results) => {
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
        (name, cards, description, userEmail)
    VALUES (?, ?, ?, ?)
`
app.post("/list", requiresAuth(), (req, res) => {
    db.execute(post_item_sql, [req.body.name, req.body.quantity, req.body.description, req.oidc.user.email], (error, results) => {
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
    SET name        = ?,
        cards       = ?,
        description = ?
    WHERE deckID = ?
      AND userEmail = ?;
`

app.post("/list/item/:id", requiresAuth(), (req, res) => {
    db.execute(update_item_sql, [req.body.name, req.body.quantity, req.body.description, req.params.id, req.oidc.user.email], (error, results) => {
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
app.listen(port, () => {
    console.log(`App server listening on ${port}. (Go to http://localhost:${port})`);
});