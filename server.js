require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const teamRoutes = require("./routes/teamRoutes");
const todoRoutes = require("./routes/todoRoutes");
const messageRoutes = require("./routes/messageRoutes");
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);

// Serve static files in production
app.use(express.static(path.join(__dirname, "public")));

// Catch-all route for SPA - only serve index.html for non-API routes
app.get(/^((?!api).)*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//app.listen(5050, () => console.log("🚀 Server running on port 5050"));
