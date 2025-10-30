import express from "express";
import authRoutes from "./routes/auth.routes.js"
import cors from "cors"
import courseRoutes from "./routes/course.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import studentRoutes from "./routes/student.routes.js"

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/courses",courseRoutes);
app.use("/api/admin",adminRoutes)
app.use("/api/student",studentRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
