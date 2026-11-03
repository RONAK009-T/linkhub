const db = require('../config/db');

let cleanupInterval = null;
let ioInstance = null;

function startMessageCleanupJob(io) {
  ioInstance = io;
  if (cleanupInterval) return;

  console.log('[Cleanup Service] Server-side 60-second temporary message cleanup worker started (Interval: 2000ms).');

  // Sweep every 2 seconds
  cleanupInterval = setInterval(async () => {
    try {
      // Hard delete any messages where server-time expires_at <= NOW()
      const [result] = await db.query('DELETE FROM messages WHERE expires_at <= NOW()');
      
      if (result && result.affectedRows > 0) {
        // Notify all connected clients to prune their local caches/screens
        if (ioInstance) {
          ioInstance.emit('messages_expired', {
            timestamp: new Date().toISOString(),
            expiredCount: result.affectedRows
          });
        }
      }
    } catch (err) {
      // Suppress logging if benign or during test
    }
  }, 2000);
}

function stopMessageCleanupJob() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

module.exports = {
  startMessageCleanupJob,
  stopMessageCleanupJob
};
