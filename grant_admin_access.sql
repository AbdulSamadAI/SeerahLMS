-- UPDATE USER TO ADMIN ROLE
-- This will give your account (mrabdulsamad323@gmail.com) admin privileges

UPDATE users_extended 
SET role = 'Admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'mrabdulsamad323@gmail.com'
);

-- Verify the update
SELECT id, name, role FROM users_extended 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'mrabdulsamad323@gmail.com'
);
