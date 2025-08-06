import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import userRouter from './routes/userRoute.js';
import cors from "cors";
import contactRouter from './routes/contactRoutes.js';
import mechanicRoutes from './routes/mechanicRoute.js';
import adminRouter from './routes/adminRoutes.js';
import garageRoutes from "./routes/garageRoute.js";
import requestRoutes from "./routes/requestRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import supportRouter from "./routes/supportRoutes.js";

dotenv.config();
const PORT = process.env.PORT || 5000;
const db_user = process.env.DB_USER;
const db_name = process.env.DB_NAME;
const db_pass = process.env.DB_PASS;

const app = express();

// ✅ CORS
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 201,
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Middlewares & Routes
app.use(bodyParser.json());
app.use("/", userRouter);
app.use("/contact", contactRouter);
app.use('/mechanic', mechanicRoutes);
app.use("/garages", garageRoutes);
app.use("/requests", requestRoutes);
app.use("/messages", messageRoutes);
app.use("/contacts", supportRouter);
app.use('/admin', adminRouter);
app.use('/api', requestRoutes);

// ✅ MongoDB Connection
const dbUri = `mongodb+srv://${db_user}:${db_pass}@cluster0.h04vn.mongodb.net/${db_name}?retryWrites=true&w=majority`;
mongoose.set("strictQuery", false);

mongoose
  .connect(dbUri)
  .then(() => {
    console.log("Connected to MongoDB");
    // ✅ Start server ONLY after DB connection
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
``
