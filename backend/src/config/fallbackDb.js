const bcrypt = require('bcryptjs');

// In-Memory Database store matching MySQL tables and relationships
const store = {
  users: [],
  google_accounts: [],
  categories: [],
  website_links: [],
  conversations: [],
  conversation_members: [],
  messages: [],
  favorites: [],
  notifications: [],
  reports: [],
  admin_users: []
};

let autoIds = {
  users: 10,
  google_accounts: 10,
  categories: 20,
  website_links: 30,
  conversations: 10,
  conversation_members: 20,
  messages: 100,
  favorites: 10,
  notifications: 10,
  reports: 10,
  admin_users: 10
};

function initFallbackData() {
  const hash = bcrypt.hashSync('Admin@12345', 10);

  store.users = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@linkhub.com',
      password_hash: hash,
      display_name: 'LinkHub Admin',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: 'System Administrator & Curator',
      status: 'online',
      last_seen: new Date(),
      role: 'admin',
      is_banned: 0,
      reset_token: null,
      reset_token_expires: null,
      created_at: new Date()
    },
    {
      id: 2,
      username: 'alex_gamer',
      email: 'alex@linkhub.com',
      password_hash: hash,
      display_name: 'Alex Vance',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      bio: 'Pro gamer and retro game collector',
      status: 'online',
      last_seen: new Date(),
      role: 'user',
      is_banned: 0,
      reset_token: null,
      reset_token_expires: null,
      created_at: new Date()
    },
    {
      id: 3,
      username: 'sarah_dev',
      email: 'sarah@linkhub.com',
      password_hash: hash,
      display_name: 'Sarah Chen',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      bio: 'Fullstack engineer & open-source enthusiast',
      status: 'away',
      last_seen: new Date(),
      role: 'user',
      is_banned: 0,
      reset_token: null,
      reset_token_expires: null,
      created_at: new Date()
    },
    {
      id: 4,
      username: 'marcus_stream',
      email: 'marcus@linkhub.com',
      password_hash: hash,
      display_name: 'Marcus Brody',
      avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      bio: 'Movie buff and cinema historian',
      status: 'offline',
      last_seen: new Date(),
      role: 'user',
      is_banned: 0,
      reset_token: null,
      reset_token_expires: null,
      created_at: new Date()
    }
  ];

  store.admin_users = [{ id: 1, user_id: 1, permissions: 'all' }];

  store.categories = [
    { id: 1, slug: 'free-media', name: 'Free Media & Directories', icon: 'film', description: 'Curated lists of open and free media resources', section: 'entertainment' },
    { id: 2, slug: 'streaming-hubs', name: 'Legal Streaming', icon: 'tv', description: 'Free legal television, indie cinema, and public domain streaming', section: 'movies' },
    { id: 3, slug: 'browser-games', name: 'Online Browser Games', icon: 'gamepad-2', description: 'Instant play web games without downloads', section: 'gaming' },
    { id: 4, slug: 'pc-gaming', name: 'PC Gaming Resources', icon: 'monitor', description: 'PC game hubs, community mods, open source releases and tools', section: 'gaming' },
    { id: 5, slug: 'casual-games', name: 'Casual & Arcade', icon: 'sparkles', description: 'Fun, quick-to-learn casual games and puzzle collections', section: 'gaming' },
    { id: 6, slug: 'multiplayer-games', name: 'Multiplayer Games', icon: 'users', description: 'Connect and play in real time with friends', section: 'gaming' },
    { id: 7, slug: 'ai-tools', name: 'AI & Machine Learning', icon: 'bot', description: 'Artificial intelligence models, prompts, and assistants', section: 'tools' },
    { id: 8, slug: 'developer-tools', name: 'Developer Tools', icon: 'code', description: 'APIs, documentation, code formatters, and utilities', section: 'tools' },
    { id: 9, slug: 'productivity', name: 'Productivity & Workspace', icon: 'check-square', description: 'Task management, notes, and workflow boosters', section: 'tools' },
    { id: 10, slug: 'design-tools', name: 'Design & UI/UX', icon: 'palette', description: 'Graphics, vector icons, color palettes, and inspiration', section: 'tools' },
    { id: 11, slug: 'cybersecurity', name: 'Cybersecurity & Privacy', icon: 'shield-check', description: 'Security testing, privacy audit tools, and research sites', section: 'tools' }
  ];

  store.website_links = [
    {
      id: 1,
      title: '1900–2050 (FMHY)',
      url: 'https://fmhy.net/',
      description: 'Comprehensive directory of free internet media, open-source resources, tools, education, and entertainment.',
      logo_url: 'https://fmhy.net/assets/images/logo.png',
      category_id: 1,
      section: 'entertainment',
      is_featured: 1,
      badge: 'Featured Hub',
      click_count: 3420,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 2,
      title: 'PC Game (Koyso)',
      url: 'https://koyso.net/',
      description: 'Discover PC gaming resources, comprehensive game catalog reviews, PC setups, hardware tips, and gaming news.',
      logo_url: 'https://koyso.net/wp-content/uploads/2023/07/cropped-koyso-logo-32x32.png',
      category_id: 4,
      section: 'gaming',
      is_featured: 1,
      badge: 'Hot PC Hub',
      click_count: 2890,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 3,
      title: 'All Activity (Toolhunt)',
      url: 'https://toolhunt.io/',
      description: 'Discover useful online tools, top trending SaaS products, web utilities, and creator resources updated daily.',
      logo_url: 'https://toolhunt.io/apple-touch-icon.png',
      category_id: 8,
      section: 'tools',
      is_featured: 1,
      badge: 'Top Utilities',
      click_count: 4150,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 4,
      title: 'Poki',
      url: 'https://poki.com/',
      description: 'Play online browser games instantly on any device without downloads. High-speed casual, action, and 3D arcade games.',
      logo_url: 'https://img.poki.com/poki-logo.png',
      category_id: 3,
      section: 'gaming',
      is_featured: 1,
      badge: 'Official Partner',
      click_count: 8920,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 5,
      title: 'Internet Archive Movies',
      url: 'https://archive.org/details/movies',
      description: 'Millions of free digital movies, historical broadcasts, classic cinema, and public domain cultural artifacts.',
      logo_url: 'https://archive.org/images/glogo.png',
      category_id: 2,
      section: 'movies',
      is_featured: 1,
      badge: 'Public Domain',
      click_count: 5210,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 6,
      title: 'Pluto TV',
      url: 'https://pluto.tv/',
      description: 'Watch hundreds of free TV channels and thousands of on-demand movies legally with zero subscription needed.',
      logo_url: 'https://images.pluto.tv/meta-images/pluto-tv-logo.png',
      category_id: 2,
      section: 'movies',
      is_featured: 0,
      badge: '100% Free TV',
      click_count: 3120,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 7,
      title: 'Tubi TV',
      url: 'https://tubitv.com/',
      description: 'Stream thousands of free movies and hit TV shows with no credit card required from major studios.',
      logo_url: 'https://tubitv.com/img/tubi-logo.svg',
      category_id: 2,
      section: 'movies',
      is_featured: 1,
      badge: 'Popular Free',
      click_count: 4780,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 8,
      title: 'Plex Free Movies',
      url: 'https://www.plex.tv/watch-free-movies-and-tv/',
      description: 'Stream thousands of free movies, bingeable series, and 300+ live channels directly in your browser.',
      logo_url: 'https://www.plex.tv/wp-content/themes/plex/assets/img/plex-logo.svg',
      category_id: 2,
      section: 'movies',
      is_featured: 0,
      badge: 'Free HD',
      click_count: 1980,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 9,
      title: 'YouTube Free Movies',
      url: 'https://www.youtube.com/feed/storefront?bp=4gIOCgJtZw%3D%3D',
      description: 'Browse YouTube\'s official library of free-with-ads Hollywood and international movies.',
      logo_url: 'https://www.youtube.com/s/desktop/d90e2da9/img/favicon_96x96.png',
      category_id: 2,
      section: 'movies',
      is_featured: 0,
      badge: 'Official Free',
      click_count: 6400,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 10,
      title: 'Itch.io Free Web Games',
      url: 'https://itch.io/games/free/platform-web',
      description: 'Explore thousands of indie games made by developers worldwide, playable directly in browser.',
      logo_url: 'https://static.itch.io/images/itchio-textless-black.svg',
      category_id: 3,
      section: 'gaming',
      is_featured: 1,
      badge: 'Indie Games',
      click_count: 3760,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 11,
      title: 'CrazyGames',
      url: 'https://www.crazygames.com/',
      description: 'High quality free online games playable in modern web browsers with zero installation.',
      logo_url: 'https://images.crazygames.com/common/crazygames-logo.png',
      category_id: 3,
      section: 'gaming',
      is_featured: 0,
      badge: 'Instant Play',
      click_count: 2900,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 12,
      title: 'OpenEmu (Mac) / RetroArch',
      url: 'https://www.retroarch.com/',
      description: 'Cross-platform frontend for emulators, game engines, and media players with zero bloat.',
      logo_url: 'https://www.retroarch.com/images/retroarch-logo.png',
      category_id: 4,
      section: 'gaming',
      is_featured: 0,
      badge: 'Open Source',
      click_count: 2150,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 13,
      title: 'Armor Games',
      url: 'https://armorgames.com/',
      description: 'Classic and modern flash-to-HTML5 adventure, strategy, and puzzle games collection.',
      logo_url: 'https://armorgames.com/favicon.ico',
      category_id: 5,
      section: 'gaming',
      is_featured: 0,
      badge: 'Arcade',
      click_count: 1840,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 14,
      title: 'Hugging Face',
      url: 'https://huggingface.co/',
      description: 'The AI community building the future. Explore state-of-the-art open models, datasets, and apps.',
      logo_url: 'https://huggingface.co/front/assets/huggingface_logo.svg',
      category_id: 7,
      section: 'tools',
      is_featured: 1,
      badge: 'AI Leading',
      click_count: 5820,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 15,
      title: 'DevDocs',
      url: 'https://devdocs.io/',
      description: 'Fast, offline-capable documentation browser for all popular programming languages and frameworks.',
      logo_url: 'https://devdocs.io/favicon.ico',
      category_id: 8,
      section: 'tools',
      is_featured: 1,
      badge: 'Essential Dev',
      click_count: 4230,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 16,
      title: 'Excalidraw',
      url: 'https://excalidraw.com/',
      description: 'Virtual collaborative whiteboard tool that lets you easily sketch diagrams that have a hand-drawn feel.',
      logo_url: 'https://excalidraw.com/apple-touch-icon.png',
      category_id: 10,
      section: 'tools',
      is_featured: 0,
      badge: 'Visual Drawing',
      click_count: 3310,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 17,
      title: 'CyberChef',
      url: 'https://gchq.github.io/CyberChef/',
      description: 'The Cyber Swiss Army Knife for encryption, decoding, hex analysis, hashing, and data transformation.',
      logo_url: 'https://gchq.github.io/CyberChef/images/cyberchef-128x128.png',
      category_id: 11,
      section: 'tools',
      is_featured: 0,
      badge: 'Cybersecurity',
      click_count: 2740,
      created_by: 1,
      created_at: new Date()
    },
    {
      id: 18,
      title: 'VirusTotal',
      url: 'https://www.virustotal.com/',
      description: 'Analyse suspicious files, domains, IPs and URLs to detect malware and other breaches.',
      logo_url: 'https://www.virustotal.com/gui/images/favicon.png',
      category_id: 11,
      section: 'tools',
      is_featured: 1,
      badge: 'Security Guard',
      click_count: 3910,
      created_by: 1,
      created_at: new Date()
    }
  ];

  store.conversations = [
    { id: 1, is_group: 0, title: 'Alex Vance & Sarah Chen', created_by: 2, created_at: new Date() },
    { id: 2, is_group: 1, title: 'LinkHub Gaming Lounge', created_by: 1, created_at: new Date() }
  ];

  store.conversation_members = [
    { id: 1, conversation_id: 1, user_id: 2, joined_at: new Date() },
    { id: 2, conversation_id: 1, user_id: 3, joined_at: new Date() },
    { id: 3, conversation_id: 2, user_id: 1, joined_at: new Date() },
    { id: 4, conversation_id: 2, user_id: 2, joined_at: new Date() },
    { id: 5, conversation_id: 2, user_id: 3, joined_at: new Date() },
    { id: 6, conversation_id: 2, user_id: 4, joined_at: new Date() }
  ];

  store.favorites = [
    { id: 1, user_id: 1, link_id: 1, created_at: new Date() },
    { id: 2, user_id: 1, link_id: 4, created_at: new Date() },
    { id: 3, user_id: 2, link_id: 2, created_at: new Date() },
    { id: 4, user_id: 2, link_id: 4, created_at: new Date() }
  ];
}

/**
 * Executes a simulated query against store with full SQL pattern support
 */
async function query(sql, params = []) {
  const s = sql.trim();
  const lower = s.toLowerCase();

  // 1. SELECT Users by Email or Username
  if (lower.startsWith('select') && lower.includes('from users')) {
    if (lower.includes('count(*)')) {
      return [[{ count: store.users.length }]];
    }

    if (lower.includes('where id =') || lower.includes('where u.id =')) {
      const id = params[0];
      const user = store.users.find(u => u.id === Number(id));
      return [user ? [user] : []];
    }

    if (lower.includes('where email =') || lower.includes('username =')) {
      const target = params[0];
      const user = store.users.find(u => u.email === target || u.username === target);
      return [user ? [user] : []];
    }

    if (lower.includes('where username like') || lower.includes('display_name like')) {
      const q = (params[0] || '').replace(/%/g, '').toLowerCase();
      const filtered = store.users.filter(u => 
        u.username.toLowerCase().includes(q) || 
        u.display_name.toLowerCase().includes(q)
      );
      return [filtered];
    }

    return [store.users];
  }

  // 2. INSERT into users
  if (lower.startsWith('insert into users')) {
    const id = ++autoIds.users;
    const now = new Date();
    // params order typically: username, email, password_hash, display_name, avatar_url, role
    let newUser = {};
    if (params.length === 6) {
      newUser = {
        id,
        username: params[0],
        email: params[1],
        password_hash: params[2],
        display_name: params[3],
        avatar_url: params[4],
        role: params[5],
        bio: '',
        status: 'online',
        is_banned: 0,
        created_at: now
      };
    } else {
      newUser = {
        id,
        username: params[0] || `user_${id}`,
        email: params[1] || `user_${id}@linkhub.com`,
        password_hash: params[2] || null,
        display_name: params[3] || 'LinkHub User',
        avatar_url: params[4] || null,
        role: 'user',
        bio: '',
        status: 'online',
        is_banned: 0,
        created_at: now
      };
    }
    store.users.push(newUser);
    return [{ insertId: id, affectedRows: 1 }];
  }

  // 3. Google Accounts
  if (lower.includes('google_accounts')) {
    if (lower.startsWith('select')) {
      const gid = params[0];
      const g = store.google_accounts.find(a => a.google_id === gid);
      return [g ? [g] : []];
    }
    if (lower.startsWith('insert')) {
      const id = ++autoIds.google_accounts;
      store.google_accounts.push({
        id,
        user_id: params[0],
        google_id: params[1],
        email: params[2],
        display_name: params[3],
        avatar_url: params[4],
        created_at: new Date()
      });
      return [{ insertId: id, affectedRows: 1 }];
    }
  }

  // 4. Messages (Crucial: 60-Second Temporary Messages & Cleanup)
  if (lower.includes('messages')) {
    const nowTime = Date.now();

    // Background Sweep or hard delete expired messages
    if (lower.startsWith('delete from messages where expires_at <=')) {
      const initialCount = store.messages.length;
      store.messages = store.messages.filter(m => new Date(m.expires_at).getTime() > nowTime);
      const deletedCount = initialCount - store.messages.length;
      return [{ affectedRows: deletedCount }];
    }

    if (lower.startsWith('delete from messages where id =')) {
      const id = Number(params[0]);
      const initialCount = store.messages.length;
      store.messages = store.messages.filter(m => m.id !== id);
      return [{ affectedRows: initialCount - store.messages.length }];
    }

    if (lower.startsWith('delete from messages where conversation_id =')) {
      const cid = Number(params[0]);
      const initialCount = store.messages.length;
      store.messages = store.messages.filter(m => m.conversation_id !== cid);
      return [{ affectedRows: initialCount - store.messages.length }];
    }

    // Insert message with 60s expiration
    if (lower.startsWith('insert into messages')) {
      const id = ++autoIds.messages;
      const conversation_id = Number(params[0]);
      const sender_id = Number(params[1]);
      const content = params[2];
      const created_at = new Date();
      // Server-side strict 60 seconds expiration
      const expires_at = new Date(Date.now() + 60 * 1000);

      const msg = {
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        expires_at,
        is_deleted: 0
      };
      store.messages.push(msg);
      return [{ insertId: id, affectedRows: 1, msg }];
    }

    // Select active messages
    if (lower.startsWith('select')) {
      const cid = Number(params[0]);
      // Enforce server-side expiration: only return messages that have NOT expired
      const activeMsgs = store.messages
        .filter(m => m.conversation_id === cid && new Date(m.expires_at).getTime() > nowTime && !m.is_deleted)
        .map(m => {
          const sender = store.users.find(u => u.id === m.sender_id) || {};
          return {
            ...m,
            sender_name: sender.display_name || 'User',
            sender_avatar: sender.avatar_url,
            sender_username: sender.username
          };
        });
      return [activeMsgs];
    }
  }

  // 5. Conversations & Members
  if (lower.includes('conversations')) {
    if (lower.startsWith('insert into conversations')) {
      const id = ++autoIds.conversations;
      const convo = {
        id,
        is_group: params[0] ? 1 : 0,
        title: params[1] || 'Direct Message',
        created_by: params[2],
        created_at: new Date()
      };
      store.conversations.push(convo);
      return [{ insertId: id, affectedRows: 1 }];
    }

    if (lower.startsWith('insert into conversation_members')) {
      const id = ++autoIds.conversation_members;
      store.conversation_members.push({
        id,
        conversation_id: Number(params[0]),
        user_id: Number(params[1]),
        joined_at: new Date()
      });
      return [{ insertId: id, affectedRows: 1 }];
    }

    if (lower.startsWith('select')) {
      // Find conversations for user
      const userId = Number(params[0]);
      const userConvoIds = store.conversation_members
        .filter(cm => cm.user_id === userId)
        .map(cm => cm.conversation_id);

      const convos = store.conversations
        .filter(c => userConvoIds.includes(c.id))
        .map(c => {
          const members = store.conversation_members
            .filter(cm => cm.conversation_id === c.id)
            .map(cm => {
              const u = store.users.find(usr => usr.id === cm.user_id);
              return u ? { id: u.id, display_name: u.display_name, username: u.username, avatar_url: u.avatar_url, status: u.status } : null;
            })
            .filter(Boolean);

          const now = Date.now();
          const msgs = store.messages.filter(m => m.conversation_id === c.id && new Date(m.expires_at).getTime() > now);
          const lastMsg = msgs[msgs.length - 1] || null;

          return {
            ...c,
            members,
            last_message: lastMsg ? lastMsg.content : null,
            last_message_time: lastMsg ? lastMsg.created_at : c.created_at,
            active_message_count: msgs.length
          };
        });
      return [convos];
    }
  }

  // 6. Categories
  if (lower.includes('categories')) {
    if (lower.startsWith('select')) {
      if (params[0]) {
        return [store.categories.filter(c => c.section === params[0])];
      }
      return [store.categories];
    }
  }

  // 7. Website Links
  if (lower.includes('website_links')) {
    if (lower.startsWith('select')) {
      let links = [...store.website_links];
      if (lower.includes('where section =') && params[0]) {
        links = links.filter(l => l.section === params[0]);
      }
      if (lower.includes('category_id =') && params[1]) {
        links = links.filter(l => l.category_id === Number(params[1]));
      }
      if (lower.includes('is_featured = true') || lower.includes('is_featured = 1')) {
        links = links.filter(l => l.is_featured === 1);
      }
      // attach category info
      const enriched = links.map(l => {
        const cat = store.categories.find(c => c.id === l.category_id);
        return { ...l, category_name: cat ? cat.name : 'General' };
      });
      return [enriched];
    }

    if (lower.startsWith('insert into website_links')) {
      const id = ++autoIds.website_links;
      const newLink = {
        id,
        title: params[0],
        url: params[1],
        description: params[2],
        logo_url: params[3],
        category_id: params[4] ? Number(params[4]) : null,
        section: params[5],
        is_featured: params[6] ? 1 : 0,
        badge: params[7] || '',
        click_count: 0,
        created_by: params[8] || 1,
        created_at: new Date()
      };
      store.website_links.push(newLink);
      return [{ insertId: id, affectedRows: 1 }];
    }

    if (lower.startsWith('update website_links')) {
      const id = Number(params[params.length - 1]);
      const idx = store.website_links.findIndex(l => l.id === id);
      if (idx !== -1) {
        if (lower.includes('click_count = click_count + 1')) {
          store.website_links[idx].click_count = (store.website_links[idx].click_count || 0) + 1;
        } else {
          // full update
          store.website_links[idx] = {
            ...store.website_links[idx],
            title: params[0] || store.website_links[idx].title,
            url: params[1] || store.website_links[idx].url,
            description: params[2] || store.website_links[idx].description,
            logo_url: params[3] || store.website_links[idx].logo_url,
            category_id: params[4] || store.website_links[idx].category_id,
            section: params[5] || store.website_links[idx].section,
            badge: params[6] || store.website_links[idx].badge
          };
        }
        return [{ affectedRows: 1 }];
      }
      return [{ affectedRows: 0 }];
    }

    if (lower.startsWith('delete from website_links')) {
      const id = Number(params[0]);
      const initLen = store.website_links.length;
      store.website_links = store.website_links.filter(l => l.id !== id);
      return [{ affectedRows: initLen - store.website_links.length }];
    }
  }

  // 8. Favorites
  if (lower.includes('favorites')) {
    if (lower.startsWith('select')) {
      const uid = Number(params[0]);
      const userFavIds = store.favorites.filter(f => f.user_id === uid).map(f => f.link_id);
      const favLinks = store.website_links.filter(l => userFavIds.includes(l.id));
      return [favLinks];
    }
    if (lower.startsWith('insert')) {
      const uid = Number(params[0]);
      const lid = Number(params[1]);
      if (!store.favorites.some(f => f.user_id === uid && f.link_id === lid)) {
        store.favorites.push({ id: ++autoIds.favorites, user_id: uid, link_id: lid, created_at: new Date() });
      }
      return [{ affectedRows: 1 }];
    }
    if (lower.startsWith('delete')) {
      const uid = Number(params[0]);
      const lid = Number(params[1]);
      const initLen = store.favorites.length;
      store.favorites = store.favorites.filter(f => !(f.user_id === uid && f.link_id === lid));
      return [{ affectedRows: initLen - store.favorites.length }];
    }
  }

  // 9. Reports & Moderation
  if (lower.includes('reports')) {
    if (lower.startsWith('select')) {
      return [store.reports];
    }
    if (lower.startsWith('insert')) {
      const id = ++autoIds.reports;
      store.reports.push({
        id,
        reporter_id: params[0],
        reported_user_id: params[1],
        reported_link_id: params[2],
        reason: params[3],
        details: params[4],
        status: 'pending',
        created_at: new Date()
      });
      return [{ insertId: id, affectedRows: 1 }];
    }
  }

  // 10. Update user status / profile
  if (lower.startsWith('update users')) {
    const id = Number(params[params.length - 1]);
    const user = store.users.find(u => u.id === id);
    if (user) {
      if (lower.includes('status = ?')) user.status = params[0];
      if (lower.includes('bio = ?')) user.bio = params[0];
      if (lower.includes('display_name = ?')) user.display_name = params[0];
      if (lower.includes('avatar_url = ?')) user.avatar_url = params[0];
      if (lower.includes('is_banned = ?')) user.is_banned = params[0];
      if (lower.includes('reset_token = ?')) {
        user.reset_token = params[0];
        user.reset_token_expires = params[1];
      }
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // Default fallback for any unspecified query
  return [[]];
}

module.exports = {
  initFallbackData,
  query,
  store
};
