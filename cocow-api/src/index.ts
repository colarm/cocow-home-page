import express from "express";
import apiRouter from "./routes.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Mount API v1 routes
app.use("/api/v1", apiRouter);

// Start the server
app.listen(port, () => {
  console.log(`Cocow API server is running on port ${port}`);
});
