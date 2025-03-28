import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import userRouter from './routes/userRoute.js'
import cors from "cors";
import contactRouter from './routes/contactRoutes.js';
import mechanicRoutes from './routes/mechanicRoute.js';
import adminRouter from './routes/adminRoutes.js';
import garageRoutes from "./routes/garageRoute.js";
import requestRoutes from "./routes/requestRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import supportRouter from "./routes/supportRoutes.js";


dotenv.config();
const port = process.env.PORT || 5000
const db_user = process.env.DB_USER;
const db_name = process.env.DB_NAME;
const db_pass = process.env.DB_PASS;

// app.use("/",mainRouter);
const app = express();
const corsOptions = {
  origin: "*", // Accept requests from any origin
  optionsSuccessStatus: 201,
  credentials: true, // Allow cookies & authentication headers
};
app.use(cors(corsOptions));

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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`the app is running on the Port ${PORT}`);
})
const dbUri = `mongodb+srv://${db_user}:${db_pass}@cluster0.h04vn.mongodb.net/${db_name}?retryWrites=true&w=majority`;
mongoose.set("strictQuery", false);
mongoose
  .connect(dbUri)
  .then(() => {
    console.log("Connect to MongoDB");
    app.listen(port, () => {
      console.log(`Node API is running on port http://localhost:${PORT}`);

    });
  })
  .catch((error) => {
    console.log(error)
  })