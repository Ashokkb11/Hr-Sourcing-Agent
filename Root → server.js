const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import scrapers
const linkedinScraper = require('./scraper/linkedin-scraper');
const indeedScraper = require('./scraper/indeed-scraper');
const googleScraper = require('./scraper/google-scraper');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for candidate search
app.post('/api/search', async (req, res) => {
    try {
        const { jobTitle, location, skills, experience } = req.body;
        
        console.log('Search request:', { jobTitle, location, skills, experience });
        
        // Run all scrapers in parallel
        const [linkedinResults, indeedResults, googleResults] = await Promise.allSettled([
            linkedinScraper.search({ jobTitle, location, skills, experience }),
            indeedScraper.search({ jobTitle, location, skills, experience }),
            googleScraper.search({ jobTitle, location, skills, experience })
        ]);

        // Combine results
        const allResults = [];
        
        if (linkedinResults.status === 'fulfilled') {
            allResults.push(...linkedinResults.value);
        }
        
        if (indeedResults.status === 'fulfilled') {
            allResults.push(...indeedResults.value);
        }
        
        if (googleResults.status === 'fulfilled') {
            allResults.push(...googleResults.value);
        }

        // Remove duplicates based on email or name
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 HR Sourcing App running on port ${PORT}`);
    console.log(`📱 Access at: http://localhost:${PORT}`);
});
