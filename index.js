const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')

require('dotenv').config()
app.use(cors())
app.use(express.json())
app.get('/', async (req, res) => {
    res.send('server running')
})
const port = process.env.PORT
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.mtnbd39.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const genarateJwtToken = (user) => {
    const token = jwt.sign(
        {
            email: user.email,
        },
        process.env.JWT_SECRET,
    );
    return token;
}

const verifyJwt = (req, res, next) => {
    const token = req?.headers?.authorization?.split(" ")[1]
    const jwt_payload = jwt.verify(token, process.env.JWT_SECRET)
    if (!jwt_payload?.email) {
        res.send({ message: "Unauthorized User" })
    }
    req.user = jwt_payload?.email
    next()
}

async function run() {
    const userCollection = client.db("e_repair-shop").collection("users")
    const serviceCollection = client.db("e_repair-shop").collection("services")
    const feedbackCollection = client.db("e_repair-shop").collection('feedbacks')

    try {

        // user endpoints
        app.get("/users", async (req, res) => {
            const query = {}
            const users = await userCollection.find(query).toArray()
            res.send(users)
        })
        app.get("/users/:id", async (req, res) => {
            const id = req.params?.id
            const user = await userCollection.findOne({ "_id": new ObjectId(id) })
            res.send(user)
        })
        app.get("/user-info", async (req, res) => {
            const email = req.query?.email
            const user = await userCollection.findOne({ email: email })
            res.send(user)
        })
        app.patch("/users/:email", verifyJwt, async (req, res) => {
            const payload_email = req?.user
            if (!payload_email) {
                res.send({ message: "Unauthorized user..." })
                return
            }
            const email = req?.params?.email
            const userInfo = req.body
            const result = await userCollection.updateOne(
                { email },
                { $set: userInfo },
                { upsert: true }
            )
            res.send(result)
        })
        app.post("/signup", async (req, res) => {
            const user = req.body
            const existingUser = await userCollection.findOne({ email: user?.email })
            const token = genarateJwtToken(user)
            if (!existingUser) {
                const result = await userCollection.insertOne(user)
                res.send({ token })
            } else {
                res.send({ message: "user already exists!", token })

            }
        })
        app.patch("/update-username/:id", async (req, res) => {
            const id = req.params.id
            const user = req.body

            const query = { _id: new ObjectId(id) }
            const result = userCollection.updateOne(query, {
                $set: { username: user.username }
            }, {
                upsert: true
            })
            res.send(result)
        })

        // service endpoints

        app.get("/orders", async (req, res) => {
            const query = {}
            const services = await serviceCollection.find(query).toArray()
            res.send(services)
        })
        app.get("/orders/:id", async (req, res) => {
            const id = req.params.id
            const service = await serviceCollection.findOne({ _id: new ObjectId(id) })
            res.send(service)
        })
        app.get("/users-orders", verifyJwt, async (req, res) => {
            const email = req?.user
            if (!email) {
                res.send({ message: "Unauthorized User.." })
                return
            }
            const userEmail = req?.query.email
            const filter = {
                orderEmail: userEmail
            }
            const result = await serviceCollection.find(filter).toArray()
            res.send(result)
        })
        app.post("/add-order", verifyJwt, async (req, res) => {
            const email = req?.user
            if (!email) {
                res.send({ message: "Unauthorized User.." })
                return
            }
            const order = req.body
            const result = await serviceCollection.insertOne(order)
            res.send(result)
        })
        app.delete("/delete-order/:id", verifyJwt, async (req, res) => {
            const email = req?.user
            if (!email) {
                res.send({ message: "Unauthorized User..." })
                return
            }
            const id = req.params.id
            const query = {
                "_id": new ObjectId(id)
            }
            const result = await serviceCollection.deleteOne(query)
            res.send(result)
        })

        app.get("/order/:id", async (req, res) => {
            const id = req.params?.id
            const order = await serviceCollection.findOne(
                { "_id": new ObjectId(id) }
            )
            res.send(order)
        })

        app.patch("/order/edit/:id", verifyJwt, async (req, res) => {
            const email = req?.user
            if (!email) {
                res.send({ message: "Unauthorized User.." })
                return
            }
            const id = req.params?.id
            const updatedInfo = req.body
            const result = await serviceCollection.updateOne(
                { "_id": new ObjectId(id) },
                { $set: updatedInfo },
                { upsert: true }
            )
            res.send(result)
        })

        // feedback endpoints

        app.post("/add-feedback", verifyJwt, async (req, res) => {
            const email = req?.user
            if (!email) {
                res.send({ message: "Unauthorized User.." })
                return
            }
            const feedback = req.body
            const result = await feedbackCollection.insertOne(feedback)
            res.send(result)
        })
        app.get("/feedbacks", async (req, res) => {
            const feedbacks = await feedbackCollection.find({}).toArray()
            res.send(feedbacks)
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
