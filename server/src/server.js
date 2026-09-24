require("dotenv").config();
console.log("Mongo URI exists:", !!process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const competitionRoutes = require("./routes/competitionRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const authRoutes = require("./routes/authRoutes");


const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/competitions", competitionRoutes);
app.use("/api/competitions", registrationRoutes);
app.use("/api/competitions", submissionRoutes);
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "Feedants API is running",
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});