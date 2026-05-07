CREATE TABLE IF NOT EXISTS section_cards (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  section     TEXT    NOT NULL CHECK(section IN ('fordypning', 'uroskolen')),
  icon        TEXT    NOT NULL DEFAULT 'info',
  title       TEXT    NOT NULL,
  description TEXT,
  link        TEXT,
  link_label  TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_section_cards_section ON section_cards (section, sort_order);

INSERT INTO section_cards (section, icon, title, description, link, link_label, sort_order, created_at, updated_at) VALUES
  ('fordypning', 'user',          'Én-til-én veiledning',  'Personlig veiledning online eller fysisk.',        'https://www.urometoden.no/', 'Gå til timebestilling', 0, 1746614400000, 1746614400000),
  ('fordypning', 'calendar-days', 'Fordypningsretreat',     'Fordyp praksisen gjennom retreats og workshops.',  NULL, NULL, 1, 1746614400000, 1746614400000),
  ('uroskolen',  'info',          'Kommer snart',           'Innhold er under utarbeidelse.',                   NULL, NULL, 0, 1746614400000, 1746614400000),
  ('uroskolen',  'layers',        'Kommer snart',           'Innhold er under utarbeidelse.',                   NULL, NULL, 1, 1746614400000, 1746614400000);
