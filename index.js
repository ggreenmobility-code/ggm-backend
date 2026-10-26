const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Front-end files (rider.html, admin.html) ko direct serve karne ke liye
app.use(express.static(__dirname));

// MongoDB Connection
const MONGO_URI = "mongodb+srv://ggreenmobility_db_user:Greenmobility123@cluster0.bpraxez.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected Successfully");
}).catch(err => {
    console.log("MongoDB Connection Error: ", err);
});

// Rider Schema & Model
const riderSchema = new mongoose.Schema({
    name: String,
    phone: String,
    partner: String,
    drivinglicense: String,
    aadhaar: String,
    pan: String,
    date: { type: Date, default: Date.now }
});

const Rider = mongoose.model('Rider', riderSchema);

// API Route to Register Rider (KYC Form Submission)
app.post('/api/register-rider', async (req, res) => {
    try {
        const newRider = new Rider(req.body);
        await newRider.save();
        res.status(201).json({ success: true, message: "Rider registered successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// API Route to Get All Riders (For Admin Panel)
app.get('/api/riders', async (req, res) => {
    try {
        const riders = await Rider.find();
        res.status(200).json(riders);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});