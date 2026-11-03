-- =====================================================================
-- LinkHub – Seed Data: Legitimate Curated Resources & Initial Data
-- =====================================================================

USE linkhub_db;

-- 1. Initial Users (Admin & Demo Users)
INSERT INTO users (id, username, email, password_hash, display_name, avatar_url, bio, role, status)
VALUES
(1, 'admin', 'admin@linkhub.com', '$2a$10$w82JQgO0h/j.q9b7eEWu4fXqIoiYq/u6u0Wb3nB/M1d4Qv.q1te', 'LinkHub Administrator', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Lead Curator & Grievance Officer', 'admin', 'online'),
(2, 'alex_gamer', 'alex@linkhub.com', '$2a$10$w82JQgO0h/j.q9b7eEWu4fXqIoiYq/u6u0Wb3nB/M1d4Qv.q1te', 'Alex Vance', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'Avid PC gamer, indie developer and modder', 'user', 'online'),
(3, 'priya_dev', 'priya@linkhub.com', '$2a$10$w82JQgO0h/j.q9b7eEWu4fXqIoiYq/u6u0Wb3nB/M1d4Qv.q1te', 'Priya Sharma', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Fullstack engineer & open web contributor', 'user', 'away'),
(4, 'marcus_films', 'marcus@linkhub.com', '$2a$10$w82JQgO0h/j.q9b7eEWu4fXqIoiYq/u6u0Wb3nB/M1d4Qv.q1te', 'Marcus Brody', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', 'Cinema researcher and public domain curator', 'user', 'offline')
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name);

INSERT INTO admin_users (user_id, permissions)
VALUES (1, 'all')
ON DUPLICATE KEY UPDATE permissions='all';

-- 2. Categories
INSERT INTO categories (id, slug, name, icon, description, section)
VALUES
-- Entertainment
(1, 'free-media', 'Free Media & Directories', 'film', 'Curated lists of open and free media resources', 'entertainment'),
(2, 'entertainment-sites', 'Entertainment Websites', 'globe', 'Web entertainment hubs and pop culture portals', 'entertainment'),
(3, 'music-resources', 'Music Resources', 'musical-notes', 'Legal royalty-free music and open audio archives', 'entertainment'),

-- Movies
(4, 'legal-movies', 'Free Legal Movies', 'tv', 'Authorized free-to-watch ad-supported and public domain cinema', 'movies'),
(5, 'documentaries', 'Documentaries', 'videocam', 'Free educational and investigative documentaries', 'movies'),
(6, 'educational-videos', 'Educational Videos', 'school', 'Open course lectures and verified educational media', 'movies'),

-- Gaming
(7, 'online-games', 'Online Games', 'game-controller', 'Browser-based online games requiring no install', 'gaming'),
(8, 'pc-games', 'PC Games', 'laptop', 'Legitimate PC gaming hubs, open source ports and wikis', 'gaming'),
(9, 'multiplayer-games', 'Multiplayer Games', 'people', 'Instant web multiplayer and cross-platform games', 'gaming'),
(10, 'casual-games', 'Casual Games', 'sparkles', 'Pick up and play arcade and puzzle games', 'gaming'),
(11, 'puzzle-games', 'Puzzle Games', 'extension-puzzle', 'Logic, strategy and mind-bending puzzle challenges', 'gaming'),
(12, 'trending-games', 'Trending Games', 'flame', 'Popular community-voted games and releases', 'gaming'),

-- AI & Tools
(13, 'ai-tools', 'AI Tools', 'hardware-chip', 'Artificial intelligence models, prompts and generative tools', 'tools'),
(14, 'programming-tools', 'Programming Tools', 'code-slash', 'Online compilers, sandboxes and code utilities', 'tools'),
(15, 'developer-resources', 'Developer Resources', 'terminal', 'API references, documentation and open-source libraries', 'tools'),
(16, 'productivity-tools', 'Productivity Tools', 'checkbox', 'Note-taking, project trackers and workflow optimization', 'tools'),
(17, 'image-editing', 'Image Editing Tools', 'color-palette', 'In-browser vector and raster graphics editors', 'tools'),
(18, 'video-editing', 'Video Editing Tools', 'film-outline', 'Browser video trimming, subtitles and composition tools', 'tools'),
(19, 'cybersecurity-edu', 'Cybersecurity Education', 'shield-checkmark', 'Security best practices, malware checks and threat intelligence', 'tools'),
(20, 'educational-resources', 'Educational Resources', 'book', 'Open textbooks, reference libraries and encyclopedias', 'tools')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Website Links (Verified Legal & Official Resources)
INSERT INTO website_links (id, title, url, description, logo_url, category_id, section, is_featured, badge, click_count, status)
VALUES
-- Required 1: 1900–2050 (FMHY)
(1, '1900–2050 (FMHY)', 'https://fmhy.net/', 'Comprehensive directory of free internet media, open-source resources, tools, education, and entertainment.', 'https://fmhy.net/assets/images/logo.png', 1, 'entertainment', TRUE, 'Featured Hub', 3420, 'approved'),

-- Required 2: PC Game (Koyso)
(2, 'PC Game (Koyso)', 'https://koyso.net/', 'Discover PC gaming resources, comprehensive game catalog reviews, PC setups, hardware tips, and gaming news.', 'https://koyso.net/wp-content/uploads/2023/07/cropped-koyso-logo-32x32.png', 8, 'gaming', TRUE, 'Hot PC Hub', 2890, 'approved'),

-- Required 3: All Activity (Toolhunt)
(3, 'All Activity (Toolhunt)', 'https://toolhunt.io/', 'Discover useful online tools, top trending SaaS products, web utilities, and creator resources updated daily.', 'https://toolhunt.io/apple-touch-icon.png', 16, 'tools', TRUE, 'Top Utilities', 4150, 'approved'),

-- Required 4: Poki
(4, 'Poki', 'https://poki.com/', 'Play online browser games instantly on any device without downloads. High-speed casual, action, and 3D arcade games.', 'https://img.poki.com/poki-logo.png', 7, 'gaming', TRUE, 'Official Partner', 8920, 'approved'),

-- Legal Movies & Entertainment
(5, 'Internet Archive Movies', 'https://archive.org/details/movies', 'Millions of free digital movies, historical broadcasts, classic cinema, and public domain cultural artifacts.', 'https://archive.org/images/glogo.png', 4, 'movies', TRUE, 'Public Domain', 5210, 'approved'),

(6, 'Tubi TV', 'https://tubitv.com/', 'Stream thousands of free movies and hit TV shows with no credit card required from major licensed studios.', 'https://tubitv.com/img/tubi-logo.svg', 4, 'movies', TRUE, '100% Free HD', 4780, 'approved'),

(7, 'Pluto TV', 'https://pluto.tv/', 'Watch hundreds of free TV channels and thousands of on-demand movies legally with zero subscription needed.', 'https://images.pluto.tv/meta-images/pluto-tv-logo.png', 4, 'movies', FALSE, 'Live & On-Demand', 3120, 'approved'),

(8, 'Plex Free Movies', 'https://www.plex.tv/watch-free-movies-and-tv/', 'Stream thousands of free movies, bingeable series, and 300+ live channels directly in your browser legally.', 'https://www.plex.tv/wp-content/themes/plex/assets/img/plex-logo.svg', 4, 'movies', FALSE, 'Free HD', 1980, 'approved'),

(9, 'YouTube Free Movies', 'https://www.youtube.com/feed/storefront?bp=4gIOCgJtZw%3D%3D', 'Browse YouTube\'s official library of free-with-ads Hollywood and international feature films.', 'https://www.youtube.com/s/desktop/d90e2da9/img/favicon_96x96.png', 4, 'movies', FALSE, 'Official Free', 6400, 'approved'),

(10, 'PBS Frontline Documentaries', 'https://www.pbs.org/wgbh/frontline/', 'Award-winning investigative documentary journalism available to stream for free.', 'https://www.pbs.org/favicon.ico', 5, 'movies', FALSE, 'Investigative', 1850, 'approved'),

(11, 'Free Music Archive', 'https://freemusicarchive.org/', 'Legal, royalty-free music downloads licensed under Creative Commons for creators and listeners.', 'https://freemusicarchive.org/img/fma-logo.png', 3, 'entertainment', FALSE, 'Creative Commons', 2410, 'approved'),

(12, 'Khan Academy', 'https://www.khanacademy.org/', 'Free, world-class education for anyone, anywhere across mathematics, sciences, computing, and history.', 'https://www.khanacademy.org/favicon.ico', 6, 'movies', TRUE, 'Top Education', 5620, 'approved'),

-- Gaming
(13, 'Itch.io Free Web Games', 'https://itch.io/games/free/platform-web', 'Explore thousands of indie games made by developers worldwide, playable directly in browser.', 'https://static.itch.io/images/itchio-textless-black.svg', 7, 'gaming', TRUE, 'Indie Games', 3760, 'approved'),

(14, 'CrazyGames', 'https://www.crazygames.com/', 'High quality free online games playable in modern web browsers with zero installation.', 'https://images.crazygames.com/common/crazygames-logo.png', 7, 'gaming', FALSE, 'Instant Play', 2900, 'approved'),

(15, 'Open Source Game Clones', 'https://osgameclones.com/', 'Database of open-source video game remakes and reimplementations of classic PC and arcade titles.', 'https://osgameclones.com/favicon.ico', 8, 'gaming', FALSE, 'Open Source', 2150, 'approved'),

(16, 'Chess.com Free Play', 'https://www.chess.com/play/online', 'Play chess online against friends or international grandmaster bots with interactive analysis.', 'https://www.chess.com/bundles/web/favicons/favicon-32x32.png', 9, 'gaming', TRUE, 'Global Multiplayer', 4500, 'approved'),

(17, 'Sudoku.com', 'https://sudoku.com/', 'Play free classic Sudoku online with thousands of daily puzzles ranging from easy to expert.', 'https://sudoku.com/favicon.ico', 11, 'gaming', FALSE, 'Puzzle Logic', 1980, 'approved'),

-- Tools
(18, 'Hugging Face', 'https://huggingface.co/', 'The AI community building the future. Explore state-of-the-art open models, datasets, and apps.', 'https://huggingface.co/front/assets/huggingface_logo.svg', 13, 'tools', TRUE, 'AI Leading', 5820, 'approved'),

(19, 'DevDocs', 'https://devdocs.io/', 'Fast, offline-capable documentation browser for all popular programming languages and frameworks.', 'https://devdocs.io/favicon.ico', 15, 'tools', TRUE, 'Essential Dev', 4230, 'approved'),

(20, 'StackBlitz', 'https://stackblitz.com/', 'Instant, fullstack web development environment powered by WebContainers right in your browser.', 'https://stackblitz.com/favicon.ico', 14, 'tools', FALSE, 'Cloud IDE', 3150, 'approved'),

(21, 'Excalidraw', 'https://excalidraw.com/', 'Virtual collaborative whiteboard tool that lets you easily sketch diagrams that have a hand-drawn feel.', 'https://excalidraw.com/apple-touch-icon.png', 16, 'tools', FALSE, 'Whiteboard', 3310, 'approved'),

(22, 'Photopea', 'https://www.photopea.com/', 'Advanced in-browser image editor supporting PSD, XCF, Sketch, and XD formats with layer support.', 'https://www.photopea.com/promo/icon512.png', 17, 'tools', TRUE, 'Graphics Suite', 4890, 'approved'),

(23, 'CyberChef', 'https://gchq.github.io/CyberChef/', 'The Cyber Swiss Army Knife for encryption, decoding, hex analysis, hashing, and data transformation.', 'https://gchq.github.io/CyberChef/images/cyberchef-128x128.png', 19, 'tools', FALSE, 'Cybersecurity', 2740, 'approved'),

(24, 'VirusTotal', 'https://www.virustotal.com/', 'Analyse suspicious files, domains, IPs and URLs to detect malware and other security threats.', 'https://www.virustotal.com/gui/images/favicon.png', 19, 'tools', TRUE, 'Security Guard', 3910, 'approved'),

(25, 'Project Gutenberg', 'https://www.gutenberg.org/', 'Library of over 70,000 free eBooks in public domain, readable on Kindle, web, and mobile.', 'https://www.gutenberg.org/favicon.ico', 20, 'tools', FALSE, 'Free Classics', 2650, 'approved')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 4. Initial Demo Conversations
INSERT INTO conversations (id, is_group, title, created_by)
VALUES
(1, FALSE, 'Alex Vance & Priya Sharma', 2),
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
