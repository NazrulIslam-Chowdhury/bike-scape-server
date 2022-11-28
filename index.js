const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require("stripe")('sk_test_51M6x6lF6tcNk03pC1gB0nTLnPPxzGsCYwC9ewG9oPjF2OkYcgHWEGeYdnXkJKFcFI8m9MucyFB48evbWqlHvy6B900UeNRoLjP');
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
        const sellingItemsCollection = client.db('bikeScape').collection('sellingItems');
        const bikeCategoryCollection = client.db('bikeScape').collection('bikeCategory');
        const usersCollection = client.db('bikeScape').collection('users');
        const bookingsCollection = client.db('bikeScape').collection('bookings');
        const reportedItemsCollection = client.db('bikeScape').collection('report');
        const paymentCollection = client.db('bikeScape').collection('payments')

        app.get('/advertise', async (req, res) => {
            const query = {};
            const result = await sellingItemsCollection.find(query).limit(3).toArray();
            res.send(result);
        })


        // category api
        app.get('/category', async (req, res) => {
            const query = {};
            const result = await bikeCategoryCollection.find(query).toArray();
            res.send(result);
        })


        // all products
        app.get('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            if (id === "638331e4c0624e6f81d0952a") {
                const query = { category_name: "sports bike" };
                const sports = await sellingItemsCollection.find(query).toArray();
                res.send(sports);
            }
            else if (id === "638331e4c0624e6f81d0952b") {
                const query = { category_name: "scooter" };
                const scooter = await sellingItemsCollection.find(query).toArray();
                res.send(scooter);
            }
            else {
                const query = { category_name: "touring bike" };
                const touring = await sellingItemsCollection.find(query).toArray();
                res.send(touring);
            }
        })

        // seller's products
        app.post('/bikes', async (req, res) => {
            const product = req.body;
            const products = await sellingItemsCollection.insertOne(product);
            res.send(products);
        })

        app.get('/bikes', async (req, res) => {
            const email = req.query.email;
            const query = { email };
            const result = await sellingItemsCollection.find(query).toArray();
            res.send(result);
        })

        app.delete('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await sellingItemsCollection.deleteOne(query);
            res.send(result);
        })

        // users
        app.post('/users', async (req, res) => {
            const users = req.body;
            const user = await usersCollection.insertOne(users);
            res.send(user);
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const result = await usersCollection.find(query).toArray();
            res.send(result);
        })

        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: "Admin"
                }
            }
            const result = await usersCollection.updateOne(query, updatedDoc, option);
            res.send(result);

        })

        // all buyers
        app.get('/users/all-buyers', async (req, res) => {
            const query = { activity: 'Buyer' };
            const buyers = await usersCollection.find(query).toArray()
            res.send(buyers);
        })

        app.delete('/users/all-buyers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })

        // all sellers
        app.get('/users/all-sellers', async (req, res) => {
            const query = { activity: 'Seller' };
            const sellers = await usersCollection.find(query).toArray();
            res.send(sellers);
        })

        app.put('/users/verify-seller/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id), activity: 'Seller' };
            const option = { upsert: true };
            const updatedDoc = {
                $set: {
                    verify: true
                }
            }
            const result = await usersCollection.updateOne(query, updatedDoc, option);
            res.send(result);

        })

        app.delete('/users/all-sellers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })

        // buyer,seller and admin email api
        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const buyer = await usersCollection.findOne(query);
            res.send({ isBuyer: buyer?.activity === 'Buyer' });
        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const seller = await usersCollection.findOne(query);
            res.send({ isSeller: seller?.activity === 'Seller' });
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const admin = await usersCollection.findOne(query);
            res.send({ isAdmin: admin?.role === 'Admin' });
        })

        // bookings
        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            const booking = await bookingsCollection.insertOne(bookings);
            res.send(booking);
        })

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email };
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingsCollection.findOne(query);
            res.send(result);
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.send(result);
        })

        // payment api
        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'bdt',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentCollection.insertOne(payment);
            const id = payment.bookingId
            const query = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updateResult = await bookingsCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        // reported items
        app.post('/report-items', async (req, res) => {
            const items = req.body;
            const result = await reportedItemsCollection.insertOne(items);
            res.send(result);
        })

        app.get('/report-items', async (req, res) => {
            const query = {};
            const result = await reportedItemsCollection.find(query).toArray();
            res.send(result);
        })

        app.delete('/report-items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reportedItemsCollection.deleteOne(query);
            res.send(result);
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