const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//
//
//
//

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "Invalid authorization" });
  }
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "Invalid authorization" });
    }

    req.decoded = decoded;
    next();
  });
};

//
//
//
//
//
//

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2qbsssi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const usersCollection = client.db("melodyDB").collection("users");

    const popularCoursesCollection = client
      .db("melodyDB")
      .collection("popularCourses");

    const popularInstructorsCollection = client
      .db("melodyDB")
      .collection("popularInstructors");

    const allCoursesCollection = client.db("melodyDB").collection("allCourses");

    const allInstructorsCollection = client
      .db("melodyDB")
      .collection("allInstructors");

    const reviewsCollection = client.db("melodyDB").collection("reviews");

    const bookedCollection = client.db("melodyDB").collection("booked");

    //
    //
    //
    //
    //

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res.send({ token });
    });

    // user related api call methods

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;

      const query = { email: user.email };

      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "User already exists" });
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //   admin related api methods
    app.get("/users/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (req.decoded.email !== email) {
        res.send({ admin: false });
      }

      const query = { email: email };

      const user = await usersCollection.findOne(query);

      const result = { admin: user?.role === "admin" };

      res.send(result);
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //   Instructor  related api methods

    app.patch("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "instructor",
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // popular-courses

    app.get("/popular-courses", async (req, res) => {
      const showAll = req.query.showAll === "true";

      let query = popularCoursesCollection.find().sort({ students: -1 });
      if (!showAll) {
        query = query.limit(6);
      }

      const result = await query.toArray();
      res.send(result);
    });

    // all-courses

    app.get("/all-courses", async (req, res) => {
      const result = await allCoursesCollection.find().toArray();
      res.send(result);
    });

    // popular-instructors

    app.get("/popular-instructors", async (req, res) => {
      const showAll = req.query.showAll === "true";

      let query = popularInstructorsCollection.find().sort({ students: -1 });
      if (!showAll) {
        query = query.limit(6);
      }

      const result = await query.toArray();
      res.send(result);
    });

    // all-instructors

    app.get("/all-instructors", async (req, res) => {
      const result = await allInstructorsCollection.find().toArray();
      res.send(result);
    });

    // booked collection related api methods

    app.get("/booked-courses", verifyJWT, async (req, res) => {
      const email = req.query.email;
      console.log(email);

      if (!email) {
        res.send([]);
      }

      const decodedEmail = req.decoded.email;

      if (decodedEmail !== email) {
        return res
          .status(403)
          .send({ error: true, message: "Forbidden Access" });
      }

      const query = { email: email };

      const result = await bookedCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/booked-courses", async (req, res) => {
      const item = req.body;
      console.log(item);

      const result = await bookedCollection.insertOne(item);
      res.send(result);
    });

    app.delete("/booked-courses/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      const result = await bookedCollection.deleteOne(query);

      res.send(result);
    });

    //
    //
    //
    //
    //
    //

    //  reviews section

    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    //
    //
    //
    //
    //
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//
//
//
//

app.get("/", (req, res) => {
  res.send("Welcome to the Melody Grove Server!");
});

app.listen(port, () => {
  console.log("server listening on port no", port);
});
