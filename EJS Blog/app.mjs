import express from "express";
import methodOverride from "method-override";
import path from "path";

const app = express();
const __dirname = path.resolve();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as View Engine/Templating Engine
app.set("view engine", "ejs");

// In-memory data storage
let posts = [];

// Routes
app.get("/", (req, res) => {
  res.render("index", { posts });
});

app.get("/posts/new", (req, res) => {
  res.render("new");
});

app.post("/posts", (req, res) => {
  const { title, content } = req.body;
  posts.push({ id: Date.now(), title, content });
  res.redirect("/");
});

app.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  res.render("show", { post });
});

app.get("/posts/:id/edit", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  res.render("edit", { post });
});

app.put("/posts/:id", (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const post = posts.find((p) => p.id === parseInt(id));
  post.title = title;
  post.content = content;
  res.redirect(`/posts/${id}`);
});

app.delete("/posts/:id", (req, res) => {
  posts = posts.filter((p) => p.id !== parseInt(req.params.id));
  res.redirect("/");
});

// Start th server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on localhost: ${PORT}`);
});
