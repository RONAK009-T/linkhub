const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/db');
const { generateToken } = require('../config/jwt');
const { verifyGoogleToken } = require('../config/google');

/**
 * Register a new user
 */
async function register(req, res) {
  try {
    const { username, email, password, display_name } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be between 3 and 30 characters.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if username or email already exists
    const [existing] = await db.query(
      'SELECT id, username, email FROM users WHERE username = ? OR email = ?',
      [username.trim().toLowerCase(), email.trim().toLowerCase()]
    );

    if (existing && existing.length > 0) {
      if (existing[0].username === username.trim().toLowerCase()) {
        return res.status(409).json({ error: 'Username is already taken.' });
      }
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const safeDisplayName = display_name?.trim() || username.trim();
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(username)}`;

    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, display_name, avatar_url, role) VALUES (?, ?, ?, ?, ?, ?)',
      [username.trim().toLowerCase(), email.trim().toLowerCase(), password_hash, safeDisplayName, defaultAvatar, 'user']
    );

    const user = {
      id: result.insertId,
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      display_name: safeDisplayName,
      avatar_url: defaultAvatar,
      role: 'user',
      status: 'online'
    };

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user
    });
  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
}

/**
 * Login user with email/username and password
 */
async function login(req, res) {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Please enter your username/email and password.' });
    }

    const identifier = login.trim().toLowerCase();
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [identifier, identifier]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const user = users[0];

    if (user.is_banned) {
      return res.status(403).json({ error: 'Your account has been suspended by an administrator.' });
    }

    if (!user.password_hash) {
      return res.status(400).json({ error: 'This account was created with Google Sign-in. Please use Google Login.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
    }

    // Update status to online
    await db.query('UPDATE users SET status = ?, last_seen = NOW() WHERE id = ?', ['online', user.id]);

    const token = generateToken(user);

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        role: user.role,
        status: 'online'
      }
    });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({ error: 'Server error during login.' });
  }
}

/**
 * Google Sign In / Sign Up
 */
async function googleAuth(req, res) {
  try {
    const { idToken, accessToken } = req.body;
    const token = idToken || accessToken;

    if (!token) {
      return res.status(400).json({ error: 'Google OAuth token is required.' });
    }

    const googleUser = await verifyGoogleToken(token);

    // 1. Check if google_account already exists
    const [existingGoogle] = await db.query(
      'SELECT * FROM google_accounts WHERE google_id = ?',
      [googleUser.googleId]
    );

    let user;

    if (existingGoogle && existingGoogle.length > 0) {
      // Find matching user
      const [u] = await db.query('SELECT * FROM users WHERE id = ?', [existingGoogle[0].user_id]);
      if (u && u.length > 0) {
        user = u[0];
      }
    }

    // 2. If not found by google_id, check if email exists in users table
    if (!user) {
      const [existingEmail] = await db.query('SELECT * FROM users WHERE email = ?', [googleUser.email.toLowerCase()]);
      if (existingEmail && existingEmail.length > 0) {
        user = existingEmail[0];
        // Link google account to existing user
        await db.query(
          'INSERT INTO google_accounts (user_id, google_id, email, display_name, avatar_url) VALUES (?, ?, ?, ?, ?)',
          [user.id, googleUser.googleId, googleUser.email, googleUser.displayName, googleUser.avatarUrl]
        );
      }
    }

    // 3. If user still does not exist, create new user and link
    if (!user) {
      const baseUsername = googleUser.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      let uniqueUsername = baseUsername;
      
      // Ensure unique username
      const [check] = await db.query('SELECT id FROM users WHERE username = ?', [uniqueUsername]);
      if (check && check.length > 0) {
        uniqueUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const [resUser] = await db.query(
        'INSERT INTO users (username, email, password_hash, display_name, avatar_url, role) VALUES (?, ?, NULL, ?, ?, ?)',
        [uniqueUsername, googleUser.email.toLowerCase(), googleUser.displayName, googleUser.avatarUrl, 'user']
      );

      const userId = resUser.insertId;

      await db.query(
        'INSERT INTO google_accounts (user_id, google_id, email, display_name, avatar_url) VALUES (?, ?, ?, ?, ?)',
        [userId, googleUser.googleId, googleUser.email, googleUser.displayName, googleUser.avatarUrl]
      );

      user = {
        id: userId,
        username: uniqueUsername,
        email: googleUser.email.toLowerCase(),
        display_name: googleUser.displayName,
        avatar_url: googleUser.avatarUrl,
        role: 'user',
        status: 'online'
      };
    }

    if (user.is_banned) {
      return res.status(403).json({ error: 'Your account has been suspended.' });
    }

    await db.query('UPDATE users SET status = ?, last_seen = NOW() WHERE id = ?', ['online', user.id]);

    const jwtToken = generateToken(user);

    return res.json({
      message: 'Google authentication successful!',
      token: jwtToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        role: user.role,
        isGoogleLinked: true
      }
    });
  } catch (error) {
    console.error('[Google Auth Error]', error);
    return res.status(500).json({ error: error.message || 'Google authentication failed.' });
  }
}

/**
 * Get current authenticated profile
 */
async function getMe(req, res) {
  try {
    const [users] = await db.query('SELECT id, username, email, display_name, avatar_url, bio, role, status, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const [gAccounts] = await db.query('SELECT google_id FROM google_accounts WHERE user_id = ?', [req.user.id]);
    const isGoogleLinked = gAccounts && gAccounts.length > 0;

    return res.json({
      user: {
        ...users[0],
        isGoogleLinked
      }
    });
  } catch (error) {
    console.error('[GetMe Error]', error);
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
}

/**
 * Update user profile
 */
async function updateProfile(req, res) {
  try {
    const { display_name, bio, avatar_url, status } = req.body;
    const userId = req.user.id;

    if (display_name) {
      await db.query('UPDATE users SET display_name = ? WHERE id = ?', [display_name.trim(), userId]);
    }
    if (bio !== undefined) {
      await db.query('UPDATE users SET bio = ? WHERE id = ?', [bio.trim(), userId]);
    }
    if (avatar_url) {
      await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatar_url.trim(), userId]);
    }
    if (status && ['online', 'offline', 'away'].includes(status)) {
      await db.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    }

    const [updated] = await db.query('SELECT id, username, email, display_name, avatar_url, bio, role, status FROM users WHERE id = ?', [userId]);

    return res.json({
      message: 'Profile updated successfully!',
      user: updated[0]
    });
  } catch (error) {
    console.error('[Update Profile Error]', error);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
}

/**
 * Forgot Password - Generates reset token
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const [users] = await db.query('SELECT id, email FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (!users || users.length === 0) {
      return res.json({ message: 'If an account exists with that email, a password reset link has been dispatched.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await db.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [resetToken, expiresAt, users[0].id]);

    return res.json({
      message: 'If an account exists with that email, a password reset link has been dispatched.',
      debugResetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined
    });
  } catch (error) {
    console.error('[Forgot Password Error]', error);
    return res.status(500).json({ error: 'Error generating reset token.' });
  }
}

/**
 * Reset Password with token
 */
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Valid token and password of at least 6 characters required.' });
    }

    const [users] = await db.query(
      'SELECT id, reset_token_expires FROM users WHERE reset_token = ?',
      [token]
    );

    if (!users || users.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const user = users[0];
    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ error: 'Password reset token has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [password_hash, user.id]
    );

    return res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    console.error('[Reset Password Error]', error);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
}

/**
 * Search registered users for chat
 */
async function searchUsers(req, res) {
  try {
    const query = req.query.q || '';
    const currentUserId = req.user.id;

    let sql = 'SELECT id, username, display_name, avatar_url, status, role FROM users WHERE id != ?';
    let params = [currentUserId];

    if (query.trim()) {
      sql += ' AND (username LIKE ? OR display_name LIKE ?)';
      params.push(`%${query.trim()}%`, `%${query.trim()}%`);
    }

    sql += ' ORDER BY status = "online" DESC, username ASC LIMIT 25';

    const [users] = await db.query(sql, params);
    return res.json({ users });
  } catch (error) {
    console.error('[Search Users Error]', error);
    return res.status(500).json({ error: 'Error searching users.' });
  }
}

/**
 * Delete User Account
 */
async function deleteAccount(req, res) {
  try {
    const userId = req.user.id;
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    return res.json({ message: 'Your account and data have been permanently deleted.' });
  } catch (error) {
    console.error('[Delete Account Error]', error);
    return res.status(500).json({ error: 'Failed to delete account.' });
  }
}

module.exports = {
  register,
  login,
  googleAuth,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  searchUsers,
  deleteAccount
};
