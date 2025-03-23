export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Next.js API route is working',
    timestamp: new Date().toISOString()
  });
} 