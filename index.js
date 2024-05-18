
const express = require("express");
const app = express();

const userRouter = require("./routes/user");


require("./config/database").connect();


const cors = require('cors');

require('dotenv').config();


app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
// Route imports

// Mounting routes
app.use("/auth", userRouter);


app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
});



