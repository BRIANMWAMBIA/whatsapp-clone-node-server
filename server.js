//imports ES6 modules
import  express  from "express";
import mongoose from "mongoose";
import cors from 'cors'
import Pusher from 'pusher';


import Messages from "./dbMessages.js"

//app config
const app = express();
const port = process.env.PORT || 9000;


const pusher = new Pusher({
    appId: "1539056",
    key: "e85842f3b311ed6b933a",
    secret: "cda51101d11af929edd8",
    cluster: "mt1",
    useTLS: true
  });
//middlewares
app.use(express.json());
app.use(cors())

//DB CONFIG
const password = "5PYZNpee4nDAUa8l"
const connection_url=`mongodb+srv://nels:${password}@cluster0.lfbqjgs.mongodb.net/whatsappdb?retryWrites=true&w=majority`;
mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("database connected"))
.catch((err) => console.error(err))

// Pusher makes mongodb realtime database. 
const db = mongoose.connection;
//Introduces mongodb changestream to our collection
db.on('error', console.error.bind(console, 'Connection Error:'));
db.once("open", () => {
    console.log("database open")
    // Changestream watches and triggers pusher once the collection is changed and push up the change
    const msgCollection = db.collection("messagescontents")
    const changeStream = msgCollection.watch();
    changeStream.on("change", (change) => {
        //Testing the change stream
       // console.log(change);
        if(change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            //Trigger pusher channel
            pusher.trigger("messsages", "inserted", {
                message: messageDetails.message,
                name: messageDetails.name,
                timestamp: messageDetails.timestamp
            });
        } else {
            console.log("Error triggering pusher")
        }
    })

})

//pusher server will trigger our frontend and force push down our data


//api routes
app.get("/",(req,res)=>res.status(200).send('hello world')); 

//GET /api/messages/sync
app.get("/api/messages/sync", (req,res) => {
    const messages=Messages.find((err, data) => {
        if(err){
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }

    })
})

//POST  /api/messages/new 
app.post("/api/messages/new", (req, res)  => {
    //getting data from the request body
    const message = req.body;
    //creating new message in the databse
    Messages.create(message, (err, data) => {
        if(err){
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        } 
    })

})
//listener
app.listen(port, ()=>console.log(`Listening on localhost:${port}`))