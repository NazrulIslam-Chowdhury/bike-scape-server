const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hnlrj23.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const advertiseItemsCollection = client.db('bikeScape').collection('sellingItems');
        const bikeCategoryCollection = client.db('bikeScape').collection('bikeCategory');
        const usersCollection = client.db('bikeScape').collection('users');
        const bookingsCollection = client.db('bikeScape').collection('bookings');

        app.get('/advertise', async (req, res) => {
            const query = {};
            const result = await advertiseItemsCollection.find(query).toArray();
            res.send(result);
        })


        // category api
        app.get('/category', async (req, res) => {
            const query = {};
            const result = await bikeCategoryCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await bikeCategoryCollection.findOne(filter);
            res.send(result);
        })

        // users
        app.post('/users', async (req, res) => {
            const users = req.body;
            const user = await usersCollection.insertOne(users);
            res.send(user);
        })

        // bookings
        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            const booking = await bookingsCollection.insertOne(bookings);
            res.send(booking);
        })
    }
    finally {

    }
}

run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('Assignment 12 is running')
})

app.listen(port, () => {
    console.log(`Assignment 12 is running on port ${port}`)
})