import mongoose from "mongoose";

export const connectDB = async () => {
  mongoose
    .connect(process.env.MONGO_URL, {
    })
    .then((data) => {
      console.log(`MongoDb connected with server: ${data.connection.host}`);
    }).catch((error) => {
        console.log(`${error.message}  invalid mongodb url`)
    })
};



// 106.219.223.127