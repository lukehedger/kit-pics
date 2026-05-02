DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS kits;

CREATE TABLE kits (
  id INTEGER PRIMARY KEY,
  src TEXT NOT NULL,
  alt TEXT NOT NULL,
  team TEXT NOT NULL,
  year TEXT NOT NULL,
  type TEXT NOT NULL
);

CREATE INDEX idx_kits_team ON kits(team);
CREATE INDEX idx_kits_year ON kits(year);

CREATE TABLE votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  kit_id INTEGER NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('like', 'dislike')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (session_id, kit_id),
  FOREIGN KEY (kit_id) REFERENCES kits(id)
);

CREATE INDEX idx_votes_session ON votes(session_id);
CREATE INDEX idx_votes_kit ON votes(kit_id);
