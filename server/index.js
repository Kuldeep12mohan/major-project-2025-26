import express from "express";
import authRoutes from "./routes/auth.routes.js"
import cors from "cors"
import adminRoutes from "./routes/admin.routes.js"
import studentRoutes from "./routes/student.routes.js"
import cookieParser from "cookie-parser";
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/admin",adminRoutes)
app.use("/api/student",studentRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
