import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "personal",
  password: "cLšVEWťxžaPSQL",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/", async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).send("Name and Password required!");
  }

  try {
    await db.query(
      "INSERT INTO users (user_name, password) VALUES ($1, $2)",
      [name, password]
    );
    res.redirect("/");
  } catch (err) {
    console.log(error);
    res.status(500).send("Internal server Error");
  }
});

app.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});
