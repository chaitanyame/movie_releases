const express = require('express');
const cors = require('cors');
const { fetchLiveReleases } = require('./fetch-live');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve main HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/../index.html');
});

// API endpoint for live releases
app.get('/api/releases/live', async (req, res) => {
    try {
        const country = req.query.country || 'india';
        const data = await fetchLiveReleases(country);
        res.json(data);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch releases', 
            message: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/releases/live`);
});
