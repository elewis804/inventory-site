const express = require( "express" );
const logger = require( "morgan" );
const app = express();
const port = 6969;

app.use(logger("dev"));
app.use(express.static(__dirname + '/public'));

app.get( "/", ( req, res ) => {
    res.sendFile(__dirname + "/views/index.html" );
} );

app.get( "/list", ( req, res ) => {
    res.sendFile(__dirname +  "/views/list.html" );
} );

app.get( "/list/item", ( req, res ) => {
    res.sendFile(__dirname + "/views/item.html" );
} );

// start the server
app.listen( port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
} );