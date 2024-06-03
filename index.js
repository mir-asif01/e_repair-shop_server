const express = require('express')
const app = express()
const cors = require('cors')
const bcrypt = require('bcrypt')
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



async function run() {
    const userCollection = client.db("e_repair-shop").collection("users")
    const serviceCollection = client.db("e_repair-shop").collection("services")

    const genarateJwtToken = async (user) => {
        const token = jwt.sign(user, process.env.JWT_SECRET)
        return token
    }

    const verifyJwt = (req, res, next) => {
        const token = req.header?.authorization.split(" ")[1]
        const jwt_payload = jwt.verify(token, process.env.JWT_SECRET)
        const user = userCollection.findOne({ _id: new ObjectId(jwt_payload?._id) })
        req.user = user
        next()
    }

    try {

        // user endpoints
        app.get("/users", async (req, res) => {
            const query = {}
            const users = await userCollection.find(query).toArray()
            res.send(users)
        })
        app.get("/users/:id", async (req, res) => {
            const id = req.params.id
            const user = await userCollection.findOne({ _id: new ObjectId(id) })
            res.send(user)
        })
        app.post("/signup", async (req, res) => {
            const reqBody = req.body
            const { username, email, password } = reqBody
            const existingUser = userCollection.findOne({ email: email })
            if (existingUser) {
                res.send({ message: "user already exists!!" })
            }
            const hashedPassword = await bcrypt.hash(password, 7)
            const user = {
                username,
                email,
                hashedPassword
            }
            const result = await userCollection.insertOne(user)

            res.send({ message: "User created succesfully" })
        })
        app.post("/login", async (req, res) => {
            const loginInfo = req.body
            const { email, password } = loginInfo
            const existingUser = userCollection.findOne({ email: email })
            if (!existingUser) {
                res.send({ message: "User not registered" })
            }
            const isPasswordMatch = await bcrypt.compare(password, existingUser?.hashedPassword)
            if (!isPasswordMatch) {
                res.send({ message: "Password Incorrect!!" })
            }
            const login_token = genarateJwtToken(existingUser)
            res.send({ message: "Login Succesful" }).cookie("login-token", login_token)
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
            res, send({ message: "Username updated successfully" })
        })

        // service endpoints

        app.get("/services", async (req, res) => {
            const query = {}
            const services = await serviceCollection.find(query).toArray()
            res.send(services)
        })
        app.get("/services/:id", async (req, res) => {
            const id = req.params.id
            const service = await serviceCollection.findOne({ _id: new ObjectId(id) })
            res.send(service)
        })
        app.get("/users-services", async (req, res) => {
            const email = req.query.email
            const filter = { email: email }
            const result = await serviceCollection.find(filter).toArray()
            res.send(result)
        })
        app.post("/add-service", async (req, res) => {
            const service = req.body
            const result = await serviceCollection.insertOne(service)
            res.send({ message: "service order placed" })
        })
        app.delete("/delete-service/:id", async (req, res) => {
            const id = req.params.id
            const query = {
                _id: new ObjectId(id)
            }
            const result = await serviceCollection.deleteOne(query)
            res.send({ message: "Service deleted" })
        })






        // login user via email and pass
        // app.post("/login", async (req, res) => {
        //     const userInfo = user
        //     const { email, password } = user
        //     const doesUserExist = userCollection.findOne({ email: email })
        //     if (!doesUserExist) {
        //         res.send({ message: "User do not exist" })
        //     }
        //     const isPasswordMatch = await bcrypt.compare(password, doesUserExist.hashedPassword)
        //     if (!isPasswordMatch) {
        //         res.send({ message: "Password incorrect!!" })
        //     }
        //     res.send(doesUserExist)
        // })









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
