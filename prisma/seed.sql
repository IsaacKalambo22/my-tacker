-- Create admin user with hashed password
-- Password: admin123
-- Hashed with bcrypt (10 rounds)
INSERT INTO "User" (id, email, password, "createdAt")
VALUES (
  gen_random_uuid(),
  'admin@techtracker.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  NOW()
)
ON CONFLICT (email) DO NOTHING;
