-- Update free plan generation limits
-- Free users now get 3 monthly generations + 2 bonus for new users (total 5)
-- Generations reset only when ALL are exhausted

-- Update existing free plan limits to 3
UPDATE user_usage 
SET generations_limit = 3 
WHERE plan = 'free' AND generations_limit = 5;

-- For new users, the trigger will still give them 5 initially (3 monthly + 2 bonus)
-- We'll handle the logic in the application code