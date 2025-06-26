const express = require("express");
const methodOverride = require("method-override");
const app = express();


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));

require("dotenv").config();
const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URL;
console.log("Connecting to:", mongoURI); // TEMP LOG for debugging

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Error:", err));


// Schema & Model
const trySchema = new mongoose.Schema({
  name: String,
  done: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: ["low", "medium", "urgent"],
    default: "low"
  }
});

const Item = mongoose.model("task", trySchema);

// GET Home Route
app.get("/", async function (req, res) {
  try {
    const foundItems = await Item.find({}).sort({ _id: -1 });
    const msg = req.query.msg || null;
    res.render("list", { ejes: foundItems, message: msg });
  } catch (err) {
    console.error(err);
    res.send("Error fetching tasks");
  }
});

// POST Add Task
app.post("/", async function (req, res) {
  const taskName = req.body.ele1.trim();
  const priority = req.body.priority;

  if (taskName === "") {
    return res.redirect("/?msg=Task+title+cannot+be+empty");
  }

  const newTask = new Item({ name: taskName, priority: priority });
  await newTask.save();
  res.redirect("/?msg=Task+added+successfully");
});

// PUT Edit Task
app.put("/edit/:id", async function (req, res) {
  try {
    const updatedData = {
      name: req.body.newText,
      priority: req.body.newPriority
    };
    await Item.findByIdAndUpdate(req.params.id, updatedData);
    res.redirect("/?msg=Task+updated+successfully");
  } catch (err) {
    console.error(err);
    res.send("Error editing task");
  }
});

// DELETE Task
app.delete("/delete/:id", async function (req, res) {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.redirect("/?msg=Task+deleted+successfully");
  } catch (err) {
    console.error(err);
    res.send("Error deleting task");
  }
});

// TOGGLE Checkbox
app.post("/toggle/:id", async function (req, res) {
  try {
    const item = await Item.findById(req.params.id);
    item.done = !item.done;
    await item.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Error toggling checkbox");
  }
});

// Start Server
app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
