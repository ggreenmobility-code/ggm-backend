const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 5000;
// CORS अनुमति
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = "mongodb+srv://ggreenmobility_db_user:TWvtWboNHHaIPvV7@cluster0.bpraxez.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function startServer() {
    try {
        await client.connect();
        console.log("🎉 डेटाबेस से सफलतापूर्वक कनेक्शन जुड़ गया है!");

        const database = client.db("ggm_fleet");
        const ridersCollection = database.collection("riders");

        app.get('/', (req, res) => {
            res.send("Go Green Mobility Backend Server is running successfully!");
        });

        // 1. राइडर रजिस्ट्रेशन API (डिफ़ॉल्ट स्टेटस 'Pending KYC' के साथ)
        app.post('/api/register-rider', async (req, res) => {
            try {
                const riderData = {
                    ...req.body,
                    status: "Pending KYC", // डिफ़ॉल्ट स्टेटस
                    createdAt: new Date()
                };
                const result = await ridersCollection.insertOne(riderData);
                res.status(201).json({ success: true, message: "राइडर का डेटा सफलतापूर्वक सेव हो गया!", id: result.insertedId });
            } catch (err) {
                res.status(500).json({ success: false, error: err.message });
            }
        });

        // 2. एडमिन के लिए सभी राइडर्स की लिस्ट
        app.get('/api/riders', async (req, res) => {
            try {
                const riders = await ridersCollection.find({}).toArray();
                res.status(200).json({ success: true, data: riders });
            } catch (err) {
                res.status(500).json({ success: false, error: err.message });
            }
        });

        // 3. राइडर स्टेटस अपडेट करने का API (Approve / Reject)
        app.post('/api/update-status', async (req, res) => {
            try {
                const { id, status } = req.body;
                await ridersCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { status: status } }
                );
                res.status(200).json({ success: true, message: "राइडर का स्टेटस अपडेट हो गया है!" });
            } catch (err) {
                res.status(500).json({ success: false, error: err.message });
            }
        });

        app.listen(PORT, () => {
            console.log(`🚀 गो ग्रीन मोबिलिटी सर्वर पोर्ट ${PORT} पर चालू है!`);
        });

    } catch (error) {
        console.error("सर्वर या डेटाबेस शुरू करने में एरर:", error);
    }
}

startServer();