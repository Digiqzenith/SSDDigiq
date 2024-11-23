import { config } from "dotenv";
config({ path: "./config/config.env" });
import { app } from "./app.js";
import { connectDB } from "./database/connectDb.js";

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`server is working on ${process.env.PORT}`);
});
