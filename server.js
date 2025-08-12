require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Import LinkedIn scraper with error handling
let searchLinkedIn;
try {
  searchLinkedIn = require('./scraper/linkedin-scraper');
  console.log('✅ LinkedIn scraper loaded successfully');
} catch (error) {
  console.error('❌ Failed to load LinkedIn scraper:', error.message);
  console.log('Creating mock scraper function...');
  
  // Fallback mock function if scraper doesn't exist
  searchLinkedIn = async (query) => {
    return {
      success: true,
      query: query,
      results: [
        {
          name: 'John Doe',
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          profileUrl: 'https://linkedin.com/in/johndoe'
        },
        {
          name: 'Jane Smith',
          title: 'Product Manager',
          company: 'Innovation Inc',
          location: 'New York, NY',
          profileUrl: 'https://linkedin.com/in/janesmith'
        }
      ]
    };
  };
}

// API endpoint for search
app.post('/api/search', async (req, res) => {
  try {
    console.log('📥 Received search request:', req.body);
    
    const { query } = req.body;
    if (!query) {
      console.log('❌ No query provided');
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log('🔍 Searching for:', query);
    
    // Call LinkedIn scraper
    const results = await searchLinkedIn(query);
    
    console.log('✅ Search completed:', results);
    res.json(results);
  } catch (err) {
    console.error('❌ Search error:', err);
    res.status(500).json({ 
      error: 'Something went wrong',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Check if public directory and index.html exist
const publicDir = path.join(__dirname, 'public');
const indexPath = path.join(publicDir, 'index.html');

console.log('📁 Checking directories...');
console.log('Public directory:', publicDir);
console.log('Public directory exists:', fs.existsSync(publicDir));
console.log('Index.html path:', indexPath);
console.log('Index.html exists:', fs.existsSync(indexPath));

// Serve index.html by default
app.get('/', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <html>
        <body>
          <h1>Server is running! 🚀</h1>
          <p>But index.html not found at: ${indexPath}</p>
          <p>Create the file or check your directory structure.</p>
          <p>Try <a href="/api/health">Health Check</a></p>
        </body>
      </html>
    `);
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server with better error handling
app.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  / - Main page`);
  console.log(`   POST /api/search - Search endpoint`);
  console.log(`   GET  /api/health - Health check`);
});
