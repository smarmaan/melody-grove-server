const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//
//
//
//

const { MongoClient, ServerApiVersion } = require("mongodb");
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

    app.get("/booked-courses", async (req, res) => {
      const email = req.query.email;
      console.log(email);

      if (!email) {
        res.send([]);
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
