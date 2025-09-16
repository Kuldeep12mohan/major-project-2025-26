import express from "express";
import authRoutes from "./routes/auth.routes.js"
import cors from "cors"
import courseRoutes from "./routes/course.routes.js"

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/courses",courseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
