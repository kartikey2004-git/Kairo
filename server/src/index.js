import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/health", (req, res) => {
  res.send("API is running fine");
});

app.listen(process.env.PORT, () => {
  console.log(`Application is running on http://localhost: ${process.env.PORT}`);
});
