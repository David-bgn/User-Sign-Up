import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// const db = new pg.Client({
//   user: "postgres",
//   host: "localhost",
//   database: "personal",
//   password: "",
//   port: 5432,
// });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("render.com") ? { rejectUnauthorized: false } : false,
});


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/", async (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(500).send("Username and Password Required!");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const data = await pool.query(
      "SELECT user_name FROM users WHERE user_name = $1",
      [user]
    );
    const arr = data.rows;
    if (arr.length !== 0) {
      return res.status(400).send("User already exist");
    }

    await pool.query("INSERT INTO users (user_name, password) VALUES ($1, $2)", [
      user,
      hashedPassword,
    ]);
    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

app.post("/login", async (req, res) => {
  const { user_name, password } = req.body;

  if (!user_name || !password) {
    return res.status(400).send("User Name and Password Required!");
  }

  try {
    const data = await pool.query(
      "SELECT password FROM users WHERE user_name = $1",
      [user_name]
    );
    if (data.rows.length === 0) {
      return res.status(400).send("User not found.");
    }

    const storedHashedPassword = data.rows[0].password;
    const match = await bcrypt.compare(password, storedHashedPassword);

    if (match) {
      return res.status(200).send("You logged in successfully!");
    } else {
      return res.status(401).send("Wrong password");
    }
  } catch (error) {
    console.error("ERROR IN / LOGIN:", error); // Log the error
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () =>
  console.log(`App listening on port: http://localhost:${port}`)
);
