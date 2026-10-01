console.log("🔥🔥🔥 SERVER.JS SE EJECUTÓ 🔥🔥🔥");
import 'dotenv/config';
import app from "./app.js";
import connectDB from "./v1/config/db.config.js";

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});