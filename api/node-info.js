export default function handler(req, res) {
  res.status(200).json({
    node: process.version,
    env: process.env.NODE_ENV,
    platform: process.platform,
    arch: process.arch,
    timestamp: new Date().toISOString()
  });
} 