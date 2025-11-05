import app from "./src/app.js";
import { connect } from "./src/config/mongoDB.js";

const PORT = process.env.PORT || 3000;

const startServer = async() => {
    try{
        await connect(); // MongoDB 연결
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error("Failed to connect to MongoDB : ", err);
    }
    
};

startServer();