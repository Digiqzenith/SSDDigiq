import { config } from "dotenv";
config({ path: "./config/config.env" });
export const app = express();
import express from "express";
import cors from "cors";
import centerRoutes from './routes/centerRoutes.js'
import studRoutes from "./routes/studRoutes.js"
import franchiseRoutes from "./routes/franchiseRoutes.js"
import cookieParser from "cookie-parser";
import courseRoute from './routes/courseRoute.js'
import universityRoutes from "./routes/universityRoutes.js"
import { isFranchiseAuthenticated } from "./middlewares/auth.js";
import bodyParser from "body-parser";


app.use(cors({
    origin: process.env.FRONTPORT, // Specific origin
    credentials: true, // Allow cookies or credentials
    optionsSuccessStatus: 200, // For older browsers
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json()); // Parse JSON bodies
app.set("view engine", "ejs");
app.use(cookieParser());

// Protected route (master panel)
app.get('/masterpanel', isFranchiseAuthenticated, (req, res) => {
    res.json({ message: 'Welcome to the Master Panel', user: req.user });
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.send('Welcome to masterpanel');
});
app.use("/api", centerRoutes);
app.use("/api", universityRoutes);
app.use("/api", franchiseRoutes);
app.use('/api', courseRoute);
app.use("/api", studRoutes);


