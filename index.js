const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// यहाँ अपनी MongoDB Atlas की सही कनेक्शन स्ट्रिंग डालें (अगर पर्यावरण वेरिएबल सेट नहीं है)
"mongodb+srv://ggreenmobility%40gmail.com:Greenmobility123cluster0.bpraxez.mongodb.net/"
const MONGO_URI = "mongodb+srv://ggreenmobility%40gmail.com:Greenmobility123cluster0.bprax... (आपकी पूरी लिंक)";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected Successfully");
}).catch(err => {
    console.log("MongoDB Connection Error: ", err);
});
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected Successfully");
}).catch(err => {
    console.log("MongoDB Connection Error: ", err);
});

// Rider Schema with KYC Details
const riderSchema = new mongoose.Schema({
    name: String,
    phone: String,
    partner: String,
    drivingLicense: String,
    aadhaar: String,
    pan: String,
    status: { type: String, default: 'Pending' },
    scooterNumber: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

const Rider = mongoose.model('Rider', riderSchema);

// Test Route
app.get('/', (req, res) => {
    res.send("Go Green Mobility Backend is Live!");
});

// Register Rider API (POST)
app.post('/api/register-rider', async (req, res) => {
    try {
        const { name, phone, partner, drivingLicense, aadhaar, pan } = req.body;
        const newRider = new Rider({
            name,
            phone,
            partner,
            drivingLicense,
            aadhaar,
            pan
        });
        await newRider.save();
        res.status(201).json({ success: true, message: 'Rider registered successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get All Riders API (GET)
app.get('/api/riders', async (req, res) => {
    try {
        const riders = await Rider.find().sort({ createdAt: -1 });
        res.json({ success: true, data: riders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update Rider Status & Scooter Number API (POST)
app.post('/api/update-rider', async (req, res) => {
    try {
        const { id, status, scooterNumber } = req.body;
        const updatedRider = await Rider.findByIdAndUpdate(
            id,
            { status, scooterNumber },
            { new: true }
        );
        res.json({ success: true, data: updatedRider });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
