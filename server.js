//imports ES6 modules
import  express  from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js"
import cors from 'cors'
//app config
const app = express();
const port = process.env.PORT || 9000;
//middlewares
app.use(express.json());
app.use(cors())

//DB CONFIG
const password = "password"
const connection_url="mongodb+srv://nels:5PYZNpee4nDAUa8l@cluster0.lfbqjgs.mongodb.net/whatsappdb?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("databse connected"))
.catch((err) => console.error(err))

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