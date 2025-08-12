const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ====== Import scrapers ======
// If these don't exist yet, comment them out temporarily
const linkedinScraper = require('./scraper/linkedin-scraper');
const indeedScraper = require('./scraper/indeed-scraper');
const googleScraper = require('./scraper/google-scraper');

// ====== Middleware ======
app.use(cors());
app.use(express.json());

// ====== Serve static files from public ======
app.use(express.static(path.join(__dirname, 'public')));

// ====== API endpoint for candidate search ======
app.post('/api/search', async (req, res) => {
    try {
        const { jobTitle, location, skills, experience } = req.body;
        console.log('Search request:', { jobTitle, location, skills, experience });

        const [linkedinResults, indeedResults, googleResults] = await Promise.allSettled([
            linkedinScraper.search({ jobTitle, location, skills, experience }),
            indeedScraper.search({ jobTitle, location, skills, experience }),
            googleScraper.search({ jobTitle, location, skills, experience })
        ]);

        let allResults = [];

        if (linkedinResults.status === 'fulfilled') allResults.push(...linkedinResults.value);
        if (indeedResults.status === 'fulfilled') allResults.push(...indeedResults.value);
        if (googleResults.status === 'fulfilled') allResults.push(...googleResults.value);

        if (allResults.length === 0) {
            return res.status(500).json({
                success: false,
                error: 'No results from any scraper'
            });
        }

        const uniqueResults = allResults.filter((candidate, index, self) => {
            return index === self.findIndex((c) => c.email === candidate.email || c.name === candidate.name);
        });

        res.json({
            success: true,
            count: uniqueResults.length,
            results: uniqueResults
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            error: 'Search failed',
            message: error.message
        });
    }
});

// ====== Health check endpoint ======
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ====== Always serve index.html for root and unknown routes ======
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ====== Start server ======
app.listen(PORT, () => {
    console.log(`🚀 HR Sourcing App running on port ${PORT}`);
    console.log(`🌐 Access: http://localhost:${PORT}`);
});
