import express from "express";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import dotenv from "dotenv";
import cors from "cors"; // Import the CORS middleware
import { auth } from "./lib/auth.js";

dotenv.config();

const app = express();

// Configure CORS middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);


app.all("/api/auth/*splat", toNodeHandler(auth)); // For ExpressJS v5 

// Mount express json middleware after Better Auth handler

// or only apply it to routes that don't interact with Better Auth


app.use(express.json());

app.get("/api/me", async (req, res) => {
 	const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
	return res.json(session);
});

app.get("/health", (req, res) => {
  res.send("API is running fine");
});

app.listen(process.env.PORT, () => {
  console.log(`Application is running on http://localhost:${process.env.PORT}`);
});
