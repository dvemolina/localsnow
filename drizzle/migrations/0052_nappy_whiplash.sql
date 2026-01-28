-- Custom SQL migration file, put your code below! --
INSERT INTO user_roles (user_id, role, created_at)
SELECT id, 'admin', NOW()
FROM users
WHERE email = 'dvemolina@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = users.id AND role = 'admin'
  );