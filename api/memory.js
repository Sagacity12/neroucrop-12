export default function handler(req, res) {
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100} MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`,
    external: `${Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100} MB`,
    timestamp: new Date().toISOString()
  });
} 