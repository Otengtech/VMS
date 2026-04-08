import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import terminalRoutes from "./routes/terminal.routes.js";
import driverRoutes from "./routes/driver.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import recordRoutes from "./routes/record.routes.js";
import tripRoutes from "./routes/trip.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ 
  origin: process.env.FRONTEND_URL || "http://localhost:3000", 
  credentials: true 
}));
app.use(express.json());
// Add this right after app.use(express.json())
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});
app.get('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth route is working!' });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/terminals", terminalRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/trips", tripRoutes);


// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Check if running on Vercel serverless
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app; // For serverless (Vercel) deployment