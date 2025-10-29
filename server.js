import { listen } from "./app";
import { connect } from "./config/mongodb";

const PORT = process.env.PORT || 3000;

const startServer = async() => {
    try{
        await connect();
        listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error("Failed to connect to MongoDB : ", err);
    }
    
};

startServer();