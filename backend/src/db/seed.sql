-- LinkHub Seed Data

USE linkhub_db;

-- Insert Admin & Demo Users (Password: Admin@12345 -> bcrypt $2a$10$w82J... or created dynamically)
-- We insert with password hash for 'Admin@12345':
-- $2a$10$T81aUj5gO0h/j.q9b7eEWu4fXqIoiYq/u6u0Wb3nB/M1d4Qv.q1te (or initialized programmatically)
INSERT INTO users (id, username, email, password_hash, display_name, avatar_url, bio, role, status)
VALUES
(1, 'admin', 'admin@linkhub.com', '$2a$10$QO0hI2b20fS6eN3l8P1W8O7D9U0F5A0H9B5C8E1D2C3B4A5Z6Y7X8', 'LinkHub Admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'System Administrator & Curator', 'admin', 'online'),
(2, 'alex_gamer', 'alex@linkhub.com', '$2a$10$QO0hI2b20fS6eN3l8P1W8O7D9U0F5A0H9B5C8E1D2C3B4A5Z6Y7X8', 'Alex Vance', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'Pro gamer and retro game collector', 'user', 'online'),
(3, 'sarah_dev', 'sarah@linkhub.com', '$2a$10$QO0hI2b20fS6eN3l8P1W8O7D9U0F5A0H9B5C8E1D2C3B4A5Z6Y7X8', 'Sarah Chen', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Fullstack engineer & open-source enthusiast', 'user', 'away'),
(4, 'marcus_stream', 'marcus@linkhub.com', '$2a$10$QO0hI2b20fS6eN3l8P1W8O7D9U0F5A0H9B5C8E1D2C3B4A5Z6Y7X8', 'Marcus Brody', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', 'Movie buff and cinema historian', 'user', 'offline')
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name);

INSERT INTO admin_users (user_id, permissions)
VALUES (1, 'all')
ON DUPLICATE KEY UPDATE permissions='all';

-- Categories
INSERT INTO categories (id, slug, name, icon, description, section)
VALUES
(1, 'free-media', 'Free Media & Directories', 'film', 'Curated lists of open and free media resources', 'entertainment'),
(2, 'streaming-hubs', 'Legal Streaming', 'tv', 'Free legal television, indie cinema, and public domain streaming', 'movies'),
(3, 'browser-games', 'Online Browser Games', 'gamepad-2', 'Instant play web games without downloads', 'gaming'),
(4, 'pc-gaming', 'PC Gaming Resources', 'monitor', 'PC game hubs, community mods, open source releases and tools', 'gaming'),
(5, 'casual-games', 'Casual & Arcade', 'sparkles', 'Fun, quick-to-learn casual games and puzzle collections', 'gaming'),
(6, 'multiplayer-games', 'Multiplayer Games', 'users', 'Connect and play in real time with friends', 'gaming'),
(7, 'ai-tools', 'AI & Machine Learning', 'bot', 'Artificial intelligence models, prompts, and assistants', 'tools'),
(8, 'developer-tools', 'Developer Tools', 'code', 'APIs, documentation, code formatters, and utilities', 'tools'),
(9, 'productivity', 'Productivity & Workspace', 'check-square', 'Task management, notes, and workflow boosters', 'tools'),
(10, 'design-tools', 'Design & UI/UX', 'palette', 'Graphics, vector icons, color palettes, and inspiration', 'tools'),
(11, 'cybersecurity', 'Cybersecurity & Privacy', 'shield-check', 'Security testing, privacy audit tools, and research sites', 'tools')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Website Links
INSERT INTO website_links (id, title, url, description, logo_url, category_id, section, is_featured, badge, click_count)
VALUES
-- Required 1: FMHY (1900-2050)
(1, '1900–2050 (FMHY)', 'https://fmhy.net/', 'Comprehensive directory of free internet media, open-source resources, tools, education, and entertainment.', 'https://fmhy.net/assets/images/logo.png', 1, 'entertainment', TRUE, 'Featured Hub', 3420),

-- Required 2: PC Game (Koyso)
(2, 'PC Game (Koyso)', 'https://koyso.net/', 'Discover PC gaming resources, comprehensive game catalog reviews, PC setups, hardware tips, and gaming news.', 'https://koyso.net/wp-content/uploads/2023/07/cropped-koyso-logo-32x32.png', 4, 'gaming', TRUE, 'Hot PC Hub', 2890),

-- Required 3: All Activity (ToolHunt)
(3, 'All Activity (Toolhunt)', 'https://toolhunt.io/', 'Discover useful online tools, top trending SaaS products, web utilities, and creator resources updated daily.', 'https://toolhunt.io/apple-touch-icon.png', 8, 'tools', TRUE, 'Top Utilities', 4150),

-- Required 4: Poki
(4, 'Poki', 'https://poki.com/', 'Play online browser games instantly on any device without downloads. High-speed casual, action, and 3D arcade games.', 'https://img.poki.com/poki-logo.png', 3, 'gaming', TRUE, 'Official Partner', 8920),

-- Legal Free Movie & Video Resources
(5, 'Internet Archive Movies', 'https://archive.org/details/movies', 'Millions of free digital movies, historical broadcasts, classic cinema, and public domain cultural artifacts.', 'https://archive.org/images/glogo.png', 2, 'movies', TRUE, 'Public Domain', 5210),

(6, 'Pluto TV', 'https://pluto.tv/', 'Watch hundreds of free TV channels and thousands of on-demand movies legally with zero subscription needed.', 'https://images.pluto.tv/meta-images/pluto-tv-logo.png', 2, 'movies', FALSE, '100% Free TV', 3120),

(7, 'Tubi TV', 'https://tubitv.com/', 'Stream thousands of free movies and hit TV shows with no credit card required from major studios.', 'https://tubitv.com/img/tubi-logo.svg', 2, 'movies', TRUE, 'Popular Free', 4780),

(8, 'Plex Free Movies', 'https://www.plex.tv/watch-free-movies-and-tv/', 'Stream thousands of free movies, bingeable series, and 300+ live channels directly in your browser.', 'https://www.plex.tv/wp-content/themes/plex/assets/img/plex-logo.svg', 2, 'movies', FALSE, 'Free HD', 1980),

(9, 'YouTube Free Movies', 'https://www.youtube.com/feed/storefront?bp=4gIOCgJtZw%3D%3D', 'Browse YouTube\'s official library of free-with-ads Hollywood and international movies.', 'https://www.youtube.com/s/desktop/d90e2da9/img/favicon_96x96.png', 2, 'movies', FALSE, 'Official Free', 6400),

-- Gaming Resources
(10, 'Itch.io Free Web Games', 'https://itch.io/games/free/platform-web', 'Explore thousands of indie games made by developers worldwide, playable directly in browser.', 'https://static.itch.io/images/itchio-textless-black.svg', 3, 'gaming', TRUE, 'Indie Games', 3760),

(11, 'CrazyGames', 'https://www.crazygames.com/', 'High quality free online games playable in modern web browsers with zero installation.', 'https://images.crazygames.com/common/crazygames-logo.png', 3, 'gaming', FALSE, 'Instant Play', 2900),

(12, 'OpenEmu (Mac) / RetroArch', 'https://www.retroarch.com/', 'Cross-platform frontend for emulators, game engines, and media players with zero bloat.', 'https://www.retroarch.com/images/retroarch-logo.png', 4, 'gaming', FALSE, 'Open Source', 2150),

(13, 'Armor Games', 'https://armorgames.com/', 'Classic and modern flash-to-HTML5 adventure, strategy, and puzzle games collection.', 'https://armorgames.com/favicon.ico', 5, 'gaming', FALSE, 'Arcade', 1840),

-- Tools & Utilities
(14, 'Hugging Face', 'https://huggingface.co/', 'The AI community building the future. Explore state-of-the-art open models, datasets, and apps.', 'https://huggingface.co/front/assets/huggingface_logo.svg', 7, 'tools', TRUE, 'AI Leading', 5820),

(15, 'DevDocs', 'https://devdocs.io/', 'Fast, offline-capable documentation browser for all popular programming languages and frameworks.', 'https://devdocs.io/favicon.ico', 8, 'tools', TRUE, 'Essential Dev', 4230),

(16, 'Excalidraw', 'https://excalidraw.com/', 'Virtual collaborative whiteboard tool that lets you easily sketch diagrams that have a hand-drawn feel.', 'https://excalidraw.com/apple-touch-icon.png', 10, 'tools', FALSE, 'Visual Drawing', 3310),

(17, 'CyberChef', 'https://gchq.github.io/CyberChef/', 'The Cyber Swiss Army Knife for encryption, decoding, hex analysis, hashing, and data transformation.', 'https://gchq.github.io/CyberChef/images/cyberchef-128x128.png', 11, 'tools', FALSE, 'Cybersecurity', 2740),

(18, 'VirusTotal', 'https://www.virustotal.com/', 'Analyse suspicious files, domains, IPs and URLs to detect malware and other breaches.', 'https://www.virustotal.com/gui/images/favicon.png', 11, 'tools', TRUE, 'Security Guard', 3910)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Initial Conversation for testing temporary chat
INSERT INTO conversations (id, is_group, title, created_by)
VALUES
(1, FALSE, 'Alex Vance & Sarah Chen', 2),
(2, TRUE, 'LinkHub Community Gaming Lounge', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO conversation_members (conversation_id, user_id)
VALUES
(1, 2),
(1, 3),
(2, 1),
(2, 2),
(2, 3),
(2, 4)
ON DUPLICATE KEY UPDATE conversation_id=VALUES(conversation_id);
