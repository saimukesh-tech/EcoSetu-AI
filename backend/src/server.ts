import http from 'http';
import app from './app';

const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    service: 'ecosetu-backend',
    message: `EcoSetu AI Enterprise API Server running on port ${PORT}`
  }));
});

// Graceful Shutdown Handler for SIGTERM & SIGINT
function gracefulShutdown(signal: string) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    service: 'ecosetu-backend',
    message: `Received ${signal}. Initiating graceful shutdown...`
  }));

  server.close(() => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      service: 'ecosetu-backend',
      message: 'HTTP server closed successfully. Process exiting.'
    }));
    process.exit(0);
  });

  // Force close after 10 seconds timeout
  setTimeout(() => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      service: 'ecosetu-backend',
      message: 'Forceful shutdown initiated after 10s timeout.'
    }));
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
