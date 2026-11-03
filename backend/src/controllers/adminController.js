const db = require('../config/db');

/**
 * Get aggregated statistics for the Admin Dashboard
 */
async function getStats(req, res) {
  try {
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    const [linkCount] = await db.query('SELECT COUNT(*) as count FROM website_links');
    const [convoCount] = await db.query('SELECT COUNT(*) as count FROM conversations');
    const [activeMsgCount] = await db.query('SELECT COUNT(*) as count FROM messages WHERE expires_at > NOW()');
    const [reportCount] = await db.query('SELECT COUNT(*) as count FROM reports WHERE status = "pending"');
    const [onlineUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE status = "online"');

    // Section breakdown of links
    const [sections] = await db.query(
      'SELECT section, COUNT(*) as count FROM website_links GROUP BY section'
    );

    return res.json({
      metrics: {
        total_users: userCount[0]?.count || 0,
        online_users: onlineUsers[0]?.count || 0,
        total_links: linkCount[0]?.count || 0,
        active_conversations: convoCount[0]?.count || 0,
        active_temporary_messages: activeMsgCount[0]?.count || 0,
        pending_reports: reportCount[0]?.count || 0
      },
      sections_distribution: sections || [],
      system_status: {
        uptime_seconds: process.uptime(),
        database: db.isUsingFallback() ? 'In-Memory Development Store' : 'Production MySQL',
        node_version: process.version
      }
    });
  } catch (error) {
    console.error('[Admin Stats Error]', error);
    return res.status(500).json({ error: 'Failed to retrieve admin stats.' });
  }
}

/**
 * List all users with pagination and search
 */
async function getAllUsers(req, res) {
  try {
    const { search, role } = req.query;
    let sql = 'SELECT id, username, email, display_name, avatar_url, role, status, is_banned, created_at FROM users WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      sql += ' AND (username LIKE ? OR email LIKE ? OR display_name LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';

    const [users] = await db.query(sql, params);
    return res.json({ users });
  } catch (error) {
    console.error('[Admin Get Users Error]', error);
    return res.status(500).json({ error: 'Failed to retrieve users.' });
  }
}

/**
 * Toggle user ban status or role
 */
async function updateUser(req, res) {
  try {
    const targetUserId = Number(req.params.id);
    const { role, is_banned } = req.body;

    // Prevent modifying main admin
    if (targetUserId === 1 && (is_banned || (role && role !== 'admin'))) {
      return res.status(403).json({ error: 'Cannot ban or demote root administrator.' });
    }

    if (role !== undefined && ['user', 'admin'].includes(role)) {
      await db.query('UPDATE users SET role = ? WHERE id = ?', [role, targetUserId]);
    }

    if (is_banned !== undefined) {
      await db.query('UPDATE users SET is_banned = ? WHERE id = ?', [Boolean(is_banned) ? 1 : 0, targetUserId]);
    }

    const [updated] = await db.query('SELECT id, username, email, display_name, role, status, is_banned FROM users WHERE id = ?', [targetUserId]);

    return res.json({
      message: 'User account updated successfully.',
      user: updated[0]
    });
  } catch (error) {
    console.error('[Admin Update User Error]', error);
    return res.status(500).json({ error: 'Failed to update user account.' });
  }
}

/**
 * Create a new website link
 */
async function createLink(req, res) {
  try {
    const { title, url, description, logo_url, category_id, section, is_featured, badge } = req.body;

    if (!title || !url || !description || !section) {
      return res.status(400).json({ error: 'Title, url, description, and section are required.' });
    }

    const [result] = await db.query(
      `INSERT INTO website_links (title, url, description, logo_url, category_id, section, is_featured, badge, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        url.trim(),
        description.trim(),
        logo_url?.trim() || null,
        category_id ? Number(category_id) : null,
        section,
        is_featured ? 1 : 0,
        badge?.trim() || null,
        req.user.id
      ]
    );

    return res.status(201).json({
      message: 'Website link added successfully!',
      linkId: result.insertId
    });
  } catch (error) {
    console.error('[Admin Create Link Error]', error);
    return res.status(500).json({ error: 'Failed to create link.' });
  }
}

/**
 * Update an existing website link
 */
async function updateLink(req, res) {
  try {
    const linkId = Number(req.params.id);
    const { title, url, description, logo_url, category_id, section, is_featured, badge } = req.body;

    await db.query(
      `UPDATE website_links 
       SET title = ?, url = ?, description = ?, logo_url = ?, category_id = ?, section = ?, is_featured = ?, badge = ?
       WHERE id = ?`,
      [
        title.trim(),
        url.trim(),
        description.trim(),
        logo_url?.trim() || null,
        category_id ? Number(category_id) : null,
        section,
        is_featured ? 1 : 0,
        badge?.trim() || null,
        linkId
      ]
    );

    return res.json({ message: 'Website link updated successfully!' });
  } catch (error) {
    console.error('[Admin Update Link Error]', error);
    return res.status(500).json({ error: 'Failed to update link.' });
  }
}

/**
 * Delete a website link
 */
async function deleteLink(req, res) {
  try {
    const linkId = Number(req.params.id);
    await db.query('DELETE FROM website_links WHERE id = ?', [linkId]);
    return res.json({ message: 'Website link removed successfully.' });
  } catch (error) {
    console.error('[Admin Delete Link Error]', error);
    return res.status(500).json({ error: 'Failed to delete link.' });
  }
}

/**
 * Create Category
 */
async function createCategory(req, res) {
  try {
    const { name, slug, icon, description, section } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and unique slug are required.' });
    }

    const [resCat] = await db.query(
      'INSERT INTO categories (name, slug, icon, description, section) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), slug.trim().toLowerCase(), icon || 'folder', description?.trim() || null, section || 'general']
    );

    return res.status(201).json({
      message: 'Category created successfully!',
      categoryId: resCat.insertId
    });
  } catch (error) {
    console.error('[Admin Create Category Error]', error);
    return res.status(500).json({ error: 'Failed to create category.' });
  }
}

/**
 * Get user and content reports
 */
async function getReports(req, res) {
  try {
    const [reports] = await db.query(`
      SELECT r.*, 
             u1.username as reporter_username,
             u2.username as reported_username,
             l.title as reported_link_title
      FROM reports r
      JOIN users u1 ON r.reporter_id = u1.id
      LEFT JOIN users u2 ON r.reported_user_id = u2.id
      LEFT JOIN website_links l ON r.reported_link_id = l.id
      ORDER BY r.created_at DESC
    `);

    return res.json({ reports });
  } catch (error) {
    console.error('[Admin Get Reports Error]', error);
    return res.status(500).json({ error: 'Failed to retrieve reports.' });
  }
}

/**
 * Update report status
 */
async function updateReportStatus(req, res) {
  try {
    const reportId = Number(req.params.id);
    const { status } = req.body;

    if (!['pending', 'reviewed', 'dismissed', 'action_taken'].includes(status)) {
      return res.status(400).json({ error: 'Invalid report status.' });
    }

    await db.query('UPDATE reports SET status = ? WHERE id = ?', [status, reportId]);
    return res.json({ message: 'Report status updated successfully.' });
  } catch (error) {
    console.error('[Admin Update Report Error]', error);
    return res.status(500).json({ error: 'Failed to update report status.' });
  }
}

module.exports = {
  getStats,
  getAllUsers,
  updateUser,
  createLink,
  updateLink,
  deleteLink,
  createCategory,
  getReports,
  updateReportStatus
};
