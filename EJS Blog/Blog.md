## Blog Dummy Text

Husbands ask repeated resolved but laughter debating. She end cordial visitor noisier fat subject general picture. Or if offering confined entrance no. Nay rapturous him see something residence. Highly talked do so vulgar. Her use behaved spirits and natural attempt say feeling. Exquisite mr incommode immediate he something ourselves it of. Law conduct yet chiefly beloved examine village proceed.

Received overcame oh sensible so at an. Formed do change merely to county it. Am separate contempt domestic to to oh. On relation my so addition branched. Put hearing cottage she Norland letters equally prepare too. Replied exposed savings he no viewing as up. Soon body add him hill. No father living really people estate if. Mistake do produce beloved demesne.

## CRUD-Blog - Project

### Project - Structure

```
blog-app/
|--public/
|  |__ styles.css
|--views/
|  |-- index.ejs
|  |-- new.ejs
|  |-- show.ejs
|  |-- edit.ejs
|  |__ partials/
|      |__ header.ejs
|-- app.mjs
|__ package.json

```

### app.mjs

```mjs
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
```

### index.ejs

```js
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="/styles.css" />
    <title>Blog App</title>
  </head>
  <body>
    <%- include('partials/header') %>
    <div class="container">
      <h1>Blog Posts</h1>
      <a href="/posts/new">Create New Post</a>

      <!-- List -->
      <ul>
        <% posts.forEach(post => {%>
        <li>
          <a href="/posts/<%= post.id %>"> <%= post.title %> </a>
          <a href="/posts/<%= post.id %>/edit"> Edit </a>
          <!-- Form: Request Body -->
          <form
            action="/posts/<%= post.id %>?_method=DELETE"
            method="POST"
            style="display: inline"
          >
            <button type="submit">Delete</button>
          </form>
        </li>
        <%}) %>
      </ul>
    </div>
  </body>
</html>


```

### new.ejs

```js
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="/styles.css" />
    <title>New Post</title>
  </head>
  <body>
    <%- include('partials/header') %>

    <div class="container">
      <h1>Create New Post</h1>
      <!-- Form: Request Body -->
      <form action="/posts" method="POST">
        <input type="text" name="title" placeholder="Title" required />
        <textarea name="content" placeholder="Content" required></textarea>
        <button type="submit">Create</button>
      </form>
    </div>
  </body>
</html>

```

### show.ejs

```js
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="/styles.css" />
    <title><%= post.title%></title>
  </head>
  <body>
    <%- include('partials/header') %>
    <div class="container">
      <h1><%= post.title %></h1>
      <p><%= post.content %></p>
      <a href="/posts/<%= post.id %>/edit">Edit</a>
      <!-- Form -->
      <form
        action="/posts/<%= post.id %>?_method=DELETE"
        method="POST"
        style="display: inline"
      >
        <button type="submit">Delete</button>
      </form>
      <a href="/">Back to Post</a>
    </div>
  </body>
</html>

```

### edit.ejs

```js
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="/styles.css" />
    <title>Edit Post</title>
  </head>
  <body>
    <%- include('partials/header') %>
    <div class="container">
      <h1>Edit Post</h1>
      <!-- Form -->
      <form action="/posts/<%= post.id %>?_method=PUT" method="POST">
        <input type="text" name="title" value="<%= post.title %>" required />
        <textarea name="content" requred><%= post.content %></textarea>
        <button type="submit">Update</button>
      </form>
    </div>
  </body>
</html>

```

### Partials: header.ejs

```js
<header>
  <nav>
    <a href="/"> Home </a>
  </nav>
</header>
```

### Styles: styles.css

```css
/* Simple styles */

body {
  font-family: poppins, sans-serif;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

input[type="text"],
textarea {
  padding: 10px;
  margin-bottom: 10px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 6px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ccc;
}

a {
  margin-right: 10px;
  color: #007bff;
  text-decoration: none;
}
```

## Package.json

### ExpressJs initalizing Steps

- npm init -y : makes a package.json file
- npm i express: install it
- npm i ejs: install it
- npm i method-override: install it
- npm i socket.io: install it : This is for realTime Chat Apps if your making one
- npm i -D nodemon :like live server for live updates then -add .mjs to index.js any where you see it

- Modify package.json file by adding scripts:

  ```json
  <!-- scripts -->
  "start:dev": "nodemon ./src/index.mjs",
  "start": "node ./src/index.mjs"

  <!-- After Dev Dependencies add -->
  "type": "module"
  ```

- npm run start:dev
- Once Server Starts You cant Type any Command In the Terminal Until You stop Server with Ctrl C

In the End Your Json File Should Look Something Like This

```json
{
  "name": "ejs-blog",
  "version": "1.0.0",
  "main": "app.mjs",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start:dev": "nodemon ./app.mjs",
    "start": "node .app.mjs"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "ejs": "^3.1.10",
    "express": "^4.19.2",
    "method-override": "^3.0.0",
    "socket.io": "^4.7.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  },
  "type": "module"
}
```
