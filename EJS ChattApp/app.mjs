import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import session from "express-session";
import connectMongo from "connect-mongo";
// import bcrypt from "bcrypt";
import User from "./models/User.mjs";
import Message from "./models/Message.mjs";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

const mongoURI = "mongodb://localhost:27017/chat-app";

// MongoDB connection
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware to parse incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Reading static files like css files
app.use(express.static("public"));

// Session setup
const sessionMiddleware = session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: false,
  store: connectMongo.create({ mongoUrl: mongoURI }),
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
});

// Middleware: Ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    console.log("User is authenticated:", req.session.userId);
    return next();
  }
  console.log("User is not authenticated");
  res.redirect("/login");
}

app.use(sessionMiddleware);

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// Setting EJS as View Engine
app.set("view engine", "ejs");

// Middleware to make user data available in templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId;
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

// Login Route
app.get("/login", (req, res) => {
  res.render("login");
});

// Post login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", username);

  try {
    const user = await User.findOne({ username });
    console.log("User found:", user);

    if (user) {
      console.log("Stored password:", user.password);

      // Simple password comparison
      if (password === user.password) {
        req.session.userId = user._id;
        res.redirect("/chat");
      } else {
        console.log("Invalid username or password");
        res.redirect("/login");
      }
    } else {
      console.log("Invalid username or password");
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal server error");
  }
});

//
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // Save the user with the plain text password
    const newUser = new User({ username, password }); // Store plain password for testing
    await newUser.save();

    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Internal server error");
  }
});

// app.get("/chat", ensureAuthenticated, (req, res) => {
//   res.render("chat");
// });

app.get("/chat", ensureAuthenticated, async (req, res) => {
  try {
    // Fetch the user from the database using the userId stored in the session
    const user = await User.findById(req.session.userId);
    if (user) {
      res.render("chat", { username: user.username });
    } else {
      res.redirect("/login"); // Redirect if user not found
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Check user Existance

app.get("/check-user/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (user) {
      res.json({ exists: true, user });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking user existence:", error);
    res
      .status(500)
      .json({ error: "An error occurred while checking user existence" });
  }
});

// Real-Time Chat
io.on("connection", (socket) => {
  console.log("A user connected");

  // Chat
  socket.on("chat message", async (data) => {
    console.log("Message received:", data);
    if (socket.request.session && socket.request.session.userId) {
      const user = await User.findById(socket.request.session.userId);

      if (user) {
        const message = new Message({
          username: user.username,
          message: data.message,
        });

        try {
          await message.save(); // Save the message to the database
          // Emit the message to all clients
          io.emit("chat message", {
            username: user.username,
            message: data.message,
          });
        } catch (error) {
          console.error("Error saving message:", error);
        }
      }
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// LogOut

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/chat");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

// Starting the Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});
