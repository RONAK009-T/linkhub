const crypto = require('crypto');
const db = require('../config/db');

/**
 * Record user consent under Digital Personal Data Protection Act, 2023 (DPDPA)
 */
async function recordConsent(req, res) {
  try {
    const { consentType, status, version } = req.body;
    const userId = req.user.id;
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    if (!consentType) {
      return res.status(400).json({ error: 'consentType is required' });
    }

    await db.query(
      `INSERT INTO consent_records (user_id, consent_type, status, ip_address, user_agent, version)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = NOW()`,
      [userId, consentType, status || 'granted', ip, userAgent.slice(0, 255), version || '1.0']
    );

    return res.json({ message: 'Consent preferences recorded successfully.', status: status || 'granted' });
  } catch (error) {
    console.error('[Record Consent Error]', error);
    return res.status(500).json({ error: 'Failed to record consent record.' });
  }
}

/**
 * Get active consents for authenticated user
 */
async function getConsents(req, res) {
  try {
    const userId = req.user.id;
    const [records] = await db.query('SELECT consent_type, status, version, updated_at FROM consent_records WHERE user_id = ?', [userId]);
    return res.json({ consents: records });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve consent records.' });
  }
}

/**
 * Submit Grievance / Notice under Indian Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules
 */
async function submitGrievance(req, res) {
  try {
    const { complainantName, complainantEmail, category, subject, description } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!complainantName || !complainantEmail || !category || !subject || !description) {
      return res.status(400).json({ error: 'All fields are mandatory to file an official grievance request.' });
    }

    const ticketId = 'GRV-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    await db.query(
      `INSERT INTO grievance_requests (ticket_id, user_id, complainant_name, complainant_email, category, subject, description, status, acknowledged_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'acknowledged', NOW())`,
      [ticketId, userId, complainantName.trim(), complainantEmail.trim(), category, subject.trim(), description.trim()]
    );

    return res.status(201).json({
      message: 'Grievance ticket registered and acknowledged. Redressal will be evaluated in accordance with statutory guidelines.',
      ticketId,
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Submit Grievance Error]', error);
    return res.status(500).json({ error: 'Failed to register grievance request.' });
  }
}

/**
 * Track status of grievance ticket
 */
async function getGrievanceStatus(req, res) {
  try {
    const ticketId = req.params.ticketId;
    const [requests] = await db.query(
      'SELECT ticket_id, category, subject, status, acknowledged_at, resolved_at FROM grievance_requests WHERE ticket_id = ?',
      [ticketId]
    );

    if (!requests || requests.length === 0) {
      return res.status(404).json({ error: 'Grievance ticket not found.' });
    }

    return res.json({ ticket: requests[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get grievance status.' });
  }
}

/**
 * Statutory Grievance Officer details & compliance disclosure
 */
function getComplianceInfo(req, res) {
  return res.json({
    platform: 'LinkHub – Legal Social Chat, Gaming & Entertainment Platform',
    applicable_jurisdiction: 'India (Information Technology Act, 2000 & DPDPA 2023)',
    grievance_officer: {
      name: 'Nodal Compliance & Grievance Redressal Officer',
      designation: 'Grievance Officer',
      email: 'grievance@linkhub.com',
      postal_address: 'LinkHub Technologies, DLF Cyber City, Gurugram, Haryana, India',
      acknowledgement_window: 'Within 24 hours of receipt',
      disposal_timeline: 'Within 15 days of acknowledgement'
    },
    message_ephemeral_notice: 'All social messages automatically expire and are purged after 60 seconds. Ephemeral messages do not constitute persistent records. Users are advised that recipients may record messages via external photography or client screenshots.',
    third_party_links_notice: 'LinkHub is a directory providing hyperlinks to legitimate third-party web destinations. LinkHub does not host, mirror, or distribute third-party copyrighted files.'
  });
}

module.exports = {
  recordConsent,
  getConsents,
  submitGrievance,
  getGrievanceStatus,
  getComplianceInfo
};
