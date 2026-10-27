const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGO_URI = "mongodb+srv://ggreenmobility_db_user:Green6043@cluster0.bpraxez.mongodb.net/?retryWrites=true&w=majority";

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
    phone: { type: String, unique: true },
    otp: String,
    isVerified: { type: Boolean, default: false },
    name: String,
    partner: String,
    drivingLicense: String,
    aadhaar: String,
    pan: String,
    guarantor1Name: String,
    guarantor1Phone: String,
    guarantor2Name: String,
    guarantor2Phone: String,
    status: { type: String, default: 'Pending' },
    scooterNumber: { type: String, default: 'Not Assigned' },
    date: { type: Date, default: Date.now }
});

const Rider = mongoose.model('Rider', riderSchema);

// 1. API to Send OTP
app.post('/api/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone || phone.length !== 10) {
            return res.status(400).json({ success: false, message: "कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।" });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        await Rider.findOneAndUpdate(
            { phone },
            { phone, otp, isVerified: false },
            { upsert: true, new: true }
        );

        console.log(`OTP for ${phone} is: ${otp}`); // Render logs me OTP dikhega

        res.status(200).json({ success: true, message: "OTP successfully sent!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. API to Verify OTP
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const rider = await Rider.findOne({ phone });

        if (!rider || rider.otp !== otp) {
            return res.status(400).json({ success: false, message: "गलत ओटीपी! कृपया दोबारा प्रयास करें।" });
        }

        rider.isVerified = true;
        await rider.save();

        res.status(200).json({ success: true, message: "OTP Verified Successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. API to Complete Rider KYC Registration
app.post('/api/register-rider', async (req, res) => {
    try {
        const { phone, name, partner, drivingLicense, aadhaar, pan, guarantor1Name, guarantor1Phone, guarantor2Name, guarantor2Phone } = req.body;
        
        const updatedRider = await Rider.findOneAndUpdate(
            { phone, isVerified: true },
            { name, partner, drivingLicense, aadhaar, pan, guarantor1Name, guarantor1Phone, guarantor2Name, guarantor2Phone },
            { new: true }
        );

        if (!updatedRider) {
            return res.status(400).json({ success: false, message: "पहले मोबाइल नंबर वेरीफाई करें।" });
        }

        res.status(201).json({ success: true, message: "Rider KYC registered successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin APIs
app.get('/api/riders', async (req, res) => {
    try {
        const riders = await Rider.find({ isVerified: true });
        res.status(200).json(riders);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/update-rider', async (req, res) => {
    try {
        const { id, status, scooterNumber } = req.body;
        const updatedRider = await Rider.findByIdAndUpdate(id, { status, scooterNumber }, { new: true });
        res.status(200).json({ success: true, updatedRider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'rider.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.use(express.static(__dirname));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
