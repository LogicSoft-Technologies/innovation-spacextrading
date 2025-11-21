import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from "path"
import connectDB from './config/mongodb.js';
import adminRoutes from './routes/adminRoute.js';
import userRoutes from './routes/userRoutes.js';
import marketRoutes from './routes/marketRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import depositRoutes from './routes/depositRoutes.js'
import withdrawalRoutes from './routes/withdrawalRoutes.js'
import paymentMethodRoutes from "./routes/paymentMethodRoutes.js";

// App config 
const app = express();
const port = process.env.PORT || 5000;

const __dirname = path.resolve()

// Connect to MongoDB
connectDB();

// Middlewares 
app.use(express.json());
app.use(cors());

// API Endpoints
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes, uploadRoutes);
app.use('/api/market', marketRoutes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/api/payments', paymentRoutes)
app.use('/api/deposits', depositRoutes);
app.use('/api/withdrawals', withdrawalRoutes);

//payment method endpoint
app.use("/api/admin/payment-methods", paymentMethodRoutes);

// Test endpoint
app.get('/', (req, res) => {
    res.send("API Working");
});

// Start server
app.listen(port, () => console.log('Server started on PORT: ' + port));
