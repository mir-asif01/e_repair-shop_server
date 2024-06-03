const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
app.use(cors())
app.use(express.json())

const port = process.env.PORT
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.mtnbd39.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    const userCollection = client.db("e_repair-shop").collection("users")

    try {
        app.get('/', async (req, res) => {
            const result = await userCollection.insertOne({
                "name": "asif"
            })
            res.send(result)
        })


    } catch (error) {
        if (error) {
            console.log(error);
        }
    }
}
run()


app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`);
})
