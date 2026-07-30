const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = 'https://comprasbackendaup-production.up.railway.app';

app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  secure: true,
}));

app.use(express.static(path.join(__dirname, 'dist/oaxacamiel-app/browser')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/oaxacamiel-app/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
