DROP TABLE IF EXISTS portfolio_items;
CREATE TABLE portfolio_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    tone TEXT NOT NULL,
    description TEXT,
    project_link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO portfolio_items (title, category, image_url, tone, description, project_link) VALUES 
('Aurora Skincare', 'Branding', '/assets/portfolio-skincare.webp', 'from-orange-400/30 to-pink-400/30', 'A complete rebranding project including packaging and digital presence for a premium skincare line.', 'https://example.com/aurora'),
('Nimbus Fintech', 'Web Design', '/assets/portfolio-fintech.webp', 'from-teal-400/30 to-blue-500/30', 'Modern and secure web platform designed for a forward-thinking financial technology startup.', 'https://example.com/nimbus'),
('Verdant Foods', 'Packaging', '/assets/portfolio-food.webp', 'from-green-400/30 to-emerald-500/30', 'Sustainable and eye-catching packaging design for an organic food brand.', 'https://example.com/verdant'),
('Lumen Analytics', 'UI/UX', '/assets/portfolio-analytics.webp', 'from-blue-400/30 to-indigo-500/30', 'Intuitive dashboard and user interface design for complex data analytics software.', 'https://example.com/lumen');

DROP TABLE IF EXISTS testimonials;
CREATE TABLE testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO testimonials (quote, name, role, image_url, status) VALUES 
('Advaita reimagined our brand from the ground up. Conversion lifted 38% in the first quarter after launch.', 'Priya Menon', 'CMO, Nimbus Fintech', 'https://api.dicebear.com/7.x/notionists/svg?seed=Priya&backgroundColor=ffdfbf', 'active'),
('Their design team thinks like product strategists. Every pixel earns its place.', 'Marc Lefevre', 'Founder, Aurora Skincare', 'https://api.dicebear.com/7.x/notionists/svg?seed=Marc&backgroundColor=b6e3f4', 'active'),
('From identity to packaging to web, they shipped a cohesive experience that finally feels like us.', 'Anika Sharma', 'Head of Brand, Verdant', 'https://api.dicebear.com/7.x/notionists/svg?seed=Anika&backgroundColor=c0aede', 'active');

DROP TABLE IF EXISTS messages;
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    budget TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS site_settings;
CREATE TABLE site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_settings (key, value) VALUES 
('email', 'hello@advaita.design'),
('phone', '+91 00000 00000'),
('whatsapp', '910000000000'),
('instagram_url', '#'),
('linkedin_url', '#'),
('twitter_url', '#'),
('address', '123 Creative Studio St, Suite 100, Design City, DC 12345'),
('show_phone', 'true'),
('show_address', 'false'),
('legal_name', 'Sridhar Silver'),
('payment_instructions', 'Payment via Bank Transfer:\nAccount Holder: Sridhar Silver\nBank: [Insert Bank Name]\nAccount Number: [Insert Account Number]\nIFSC/Code: [Insert Code]'),
('show_testimonials', 'true'),
('show_marquee', 'true'),
('virtual_address', 'Available for remote work worldwide'),
('show_virtual_address', 'true'),
('stat_years_experience', '17+'),
('stat_projects_delivered', '100+'),
('stat_happy_clients', '424+'),
('stat_creative_support', '24/7'),
('stat_clients_served', '424+'),
('stat_countries_served', '12'),
('stat_brands_served', '75+');

DROP TABLE IF EXISTS proposals;
CREATE TABLE proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    client_name TEXT NOT NULL,
    company_name TEXT,
    client_email TEXT,
    project_type TEXT,
    client_type TEXT DEFAULT 'remote',
    cover_image TEXT,
    status TEXT DEFAULT 'Draft',
    valid_until TEXT,
    content_json TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    signature_name TEXT,
    signature_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS push_subscriptions;
CREATE TABLE push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS agreements;
CREATE TABLE agreements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_id INTEGER NOT NULL,
    status TEXT DEFAULT 'Pending',
    client_name TEXT NOT NULL,
    company_name TEXT,
    project_name TEXT NOT NULL,
    scope_of_work TEXT,
    deliverables TEXT,
    timeline TEXT,
    payment_terms TEXT,
    project_value TEXT,
    version INTEGER DEFAULT 1,
    pdf_url TEXT,
    signature_name TEXT,
    signature_image TEXT,
    signed_at DATETIME,
    ip_address TEXT,
    browser_info TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id)
);

DROP TABLE IF EXISTS projects;
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agreement_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    company_name TEXT,
    budget TEXT,
    timeline TEXT,
    deliverables TEXT,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agreement_id) REFERENCES agreements(id)
);

DROP TABLE IF EXISTS invoices;
CREATE TABLE invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount TEXT NOT NULL,
    status TEXT DEFAULT 'Draft',
    sent_date DATETIME,
    payment_date DATETIME,
    pdf_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

DROP TABLE IF EXISTS milestones;
CREATE TABLE milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    progress_percentage INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

DROP TABLE IF EXISTS files;
CREATE TABLE files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    agreement_id INTEGER,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (agreement_id) REFERENCES agreements(id)
);

DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    browser_info TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS clients;
CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company_name TEXT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    access_code TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
