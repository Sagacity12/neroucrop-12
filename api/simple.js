import http from 'http';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    message: 'Simple API is working',
    timestamp: new Date().toISOString()
  }));
} 