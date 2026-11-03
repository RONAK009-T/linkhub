const db = require('../config/db');

/**
 * Get curated website links
 */
async function getLinks(req, res) {
  try {
    const { section, category_id, featured, search } = req.query;
    const userId = req.user ? req.user.id : null;

    let sql = `
      SELECT l.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
      FROM website_links l
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (section) {
      sql += ' AND l.section = ?';
      params.push(section);
    }

    if (category_id) {
      sql += ' AND l.category_id = ?';
      params.push(Number(category_id));
    }

    if (featured === 'true' || featured === '1') {
      sql += ' AND l.is_featured = 1';
    }

    if (search && search.trim()) {
      sql += ' AND (l.title LIKE ? OR l.description LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    sql += ' ORDER BY l.is_featured DESC, l.click_count DESC, l.id ASC';

    const [links] = await db.query(sql, params);

    // If user is authenticated, determine if link is favorited
    let userFavorites = new Set();
    if (userId) {
      const [favs] = await db.query('SELECT link_id FROM favorites WHERE user_id = ?', [userId]);
      userFavorites = new Set(favs.map(f => f.link_id));
    }

    const formattedLinks = links.map(link => ({
      ...link,
      is_featured: Boolean(link.is_featured),
      is_favorite: userFavorites.has(link.id)
    }));

    return res.json({ links: formattedLinks });
  } catch (error) {
    console.error('[Get Links Error]', error);
    return res.status(500).json({ error: 'Failed to retrieve website links.' });
  }
}

/**
 * Get single link and increment click count
 */
async function getLinkById(req, res) {
  try {
    const linkId = Number(req.params.id);
    const userId = req.user ? req.user.id : null;

    const [links] = await db.query(
      `SELECT l.*, c.name as category_name, c.slug as category_slug 
       FROM website_links l 
       LEFT JOIN categories c ON l.category_id = c.id 
       WHERE l.id = ?`,
      [linkId]
    );

    if (!links || links.length === 0) {
      return res.status(404).json({ error: 'Website link not found.' });
    }

    // Increment click counter
    await db.query('UPDATE website_links SET click_count = click_count + 1 WHERE id = ?', [linkId]);

    let is_favorite = false;
    if (userId) {
      const [fav] = await db.query('SELECT id FROM favorites WHERE user_id = ? AND link_id = ?', [userId, linkId]);
      is_favorite = Boolean(fav && fav.length > 0);
    }

    return res.json({
      link: {
        ...links[0],
        click_count: (links[0].click_count || 0) + 1,
        is_favorite
      }
    });
  } catch (error) {
    console.error('[Get Link Error]', error);
    return res.status(500).json({ error: 'Failed to get link.' });
  }
}

/**
 * Get categories list
 */
async function getCategories(req, res) {
  try {
    const { section } = req.query;
    let sql = 'SELECT * FROM categories';
    const params = [];

    if (section) {
      sql += ' WHERE section = ? OR section = "general"';
      params.push(section);
    }

    sql += ' ORDER BY id ASC';

    const [categories] = await db.query(sql, params);
    return res.json({ categories });
  } catch (error) {
    console.error('[Get Categories Error]', error);
    return res.status(500).json({ error: 'Failed to get categories.' });
  }
}

/**
 * Toggle favorite on a website link
 */
async function toggleFavorite(req, res) {
  try {
    const linkId = Number(req.params.id);
    const userId = req.user.id;

    const [existing] = await db.query('SELECT id FROM favorites WHERE user_id = ? AND link_id = ?', [userId, linkId]);

    if (existing && existing.length > 0) {
      // Remove
      await db.query('DELETE FROM favorites WHERE user_id = ? AND link_id = ?', [userId, linkId]);
      return res.json({ message: 'Removed from favorites.', is_favorite: false, link_id: linkId });
    } else {
      // Add
      await db.query('INSERT INTO favorites (user_id, link_id) VALUES (?, ?)', [userId, linkId]);
      return res.json({ message: 'Added to favorites!', is_favorite: true, link_id: linkId });
    }
  } catch (error) {
    console.error('[Toggle Favorite Error]', error);
    return res.status(500).json({ error: 'Failed to update favorite status.' });
  }
}

/**
 * Get all user favorites
 */
async function getUserFavorites(req, res) {
  try {
    const userId = req.user.id;

    const [favorites] = await db.query(
      `SELECT l.*, c.name as category_name, c.slug as category_slug
       FROM favorites f
       JOIN website_links l ON f.link_id = l.id
       LEFT JOIN categories c ON l.category_id = c.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );

    const formatted = favorites.map(f => ({
      ...f,
      is_favorite: true
    }));

    return res.json({ favorites: formatted });
  } catch (error) {
    console.error('[Get User Favorites Error]', error);
    return res.status(500).json({ error: 'Failed to retrieve favorites.' });
  }
}

/**
 * Report inappropriate content or user
 */
async function reportResource(req, res) {
  try {
    const { reportedUserId, reportedLinkId, reason, details } = req.body;
    const reporterId = req.user.id;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'A report reason is required.' });
    }

    await db.query(
      'INSERT INTO reports (reporter_id, reported_user_id, reported_link_id, reason, details, status) VALUES (?, ?, ?, ?, ?, "pending")',
      [reporterId, reportedUserId || null, reportedLinkId || null, reason.trim(), details?.trim() || null]
    );

    return res.status(201).json({ message: 'Report submitted. Our moderation team will review it.' });
  } catch (error) {
    console.error('[Report Resource Error]', error);
    return res.status(500).json({ error: 'Failed to submit report.' });
  }
}

module.exports = {
  getLinks,
  getLinkById,
  getCategories,
  toggleFavorite,
  getUserFavorites,
  reportResource
};
