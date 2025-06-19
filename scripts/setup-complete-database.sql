-- =====================================================
-- SAFEHAVEN SECURITY SYSTEM - COMPLETE DATABASE SETUP
-- =====================================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS visitor_requests CASCADE;
DROP TABLE IF EXISTS temporary_guests CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS guards CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS residents CASCADE;

-- Create residents table with flat_number as primary key
CREATE TABLE residents (
  flat_number TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create family_members table
CREATE TABLE family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flat_number TEXT NOT NULL REFERENCES residents(flat_number) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT,
  relation TEXT NOT NULL,
  age INTEGER,
  identity_proof TEXT,
  profile_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create temporary_guests table
CREATE TABLE temporary_guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flat_number TEXT NOT NULL REFERENCES residents(flat_number) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guards table
CREATE TABLE guards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('morning', 'evening', 'night')),
  phone_number TEXT NOT NULL,
  password TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'off-duty' CHECK (status IN ('on-duty', 'off-duty')),
  check_in_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visitor_requests table
CREATE TABLE visitor_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  purpose_of_visit TEXT NOT NULL,
  flat_number TEXT NOT NULL REFERENCES residents(flat_number),
  resident_name TEXT,
  visitor_photo TEXT,
  id_proof TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'left-at-gate')),
  checked_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_visitor_requests_flat_number ON visitor_requests(flat_number);
CREATE INDEX idx_visitor_requests_status ON visitor_requests(status);
CREATE INDEX idx_visitor_requests_created_at ON visitor_requests(created_at DESC);
CREATE INDEX idx_family_members_flat_number ON family_members(flat_number);
CREATE INDEX idx_temporary_guests_flat_number ON temporary_guests(flat_number);
CREATE INDEX idx_guards_employee_id ON guards(employee_id);
CREATE INDEX idx_guards_status ON guards(status);

-- Enable Row Level Security
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guards ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_requests ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all operations for demo)
CREATE POLICY "Allow all operations on residents" ON residents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on family_members" ON family_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on temporary_guests" ON temporary_guests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on guards" ON guards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on admins" ON admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on visitor_requests" ON visitor_requests FOR ALL USING (true) WITH CHECK (true);

-- Insert sample residents
INSERT INTO residents (flat_number, name, phone_number, password) VALUES
('A-101', 'John Smith', '+91 9876543210', 'resident123'),
('A-102', 'Emily Davis', '+91 9876543213', 'resident123'),
('B-203', 'Sarah Johnson', '+91 9876543211', 'resident123'),
('B-204', 'David Brown', '+91 9876543214', 'resident123'),
('C-105', 'Mike Wilson', '+91 9876543212', 'resident123'),
('C-106', 'Lisa Anderson', '+91 9876543215', 'resident123');

-- Insert family members
INSERT INTO family_members (flat_number, name, phone_number, relation, age) VALUES
('A-101', 'Jane Smith', '+91 9876543220', 'Spouse', 28),
('A-101', 'Mike Smith', '+91 9876543221', 'Son', 12),
('B-203', 'Tom Johnson', '+91 9876543222', 'Son', 15),
('C-105', 'Lisa Wilson', '+91 9876543223', 'Spouse', 32),
('A-102', 'Robert Davis', '+91 9876543224', 'Spouse', 35);

-- Insert security guards
INSERT INTO guards (employee_id, name, shift, phone_number, password, status, check_in_time) VALUES
('SEC001', 'Ramesh Kumar', 'morning', '+91 9876543230', 'guard123', 'on-duty', '8:20:07 AM'),
('SEC002', 'Suresh Patel', 'evening', '+91 9876543231', 'guard123', 'off-duty', NULL),
('SEC003', 'Mahesh Singh', 'night', '+91 9876543232', 'guard123', 'off-duty', NULL),
('SEC004', 'Rajesh Sharma', 'morning', '+91 9876543233', 'guard123', 'off-duty', NULL),
('SEC005', 'Vikram Yadav', 'evening', '+91 9876543234', 'guard123', 'off-duty', NULL);

-- Insert system administrators
INSERT INTO admins (admin_id, name, password) VALUES
('admin001', 'System Administrator', 'admin123'),
('admin002', 'Security Manager', 'admin123');

-- Insert sample visitor requests
INSERT INTO visitor_requests (visitor_name, phone_number, purpose_of_visit, flat_number, resident_name, status, checked_by, created_at) VALUES
('David Wilson', '+1-555-0125', 'Package Delivery', 'A-101', 'John Smith', 'pending', 'Ramesh Kumar (SEC001)', NOW() - INTERVAL '2 minutes'),
('Lisa Chen', '+1-555-0126', 'Personal Visit', 'A-101', 'John Smith', 'pending', 'Ramesh Kumar (SEC001)', NOW() - INTERVAL '5 minutes'),
('Robert Johnson', '+1-555-0123', 'Business Meeting', 'B-203', 'Sarah Johnson', 'approved', 'Ramesh Kumar (SEC001)', NOW() - INTERVAL '1 hour'),
('Maria Garcia', '+1-555-0124', 'Package Delivery', 'C-105', 'Mike Wilson', 'rejected', 'Ramesh Kumar (SEC001)', NOW() - INTERVAL '15 minutes'),
('Alex Thompson', '+1-555-0127', 'Maintenance', 'A-102', 'Emily Davis', 'left-at-gate', 'Suresh Patel (SEC002)', NOW() - INTERVAL '30 minutes'),
('Jennifer Lee', '+1-555-0128', 'Personal Visit', 'B-204', 'David Brown', 'approved', 'Ramesh Kumar (SEC001)', NOW() - INTERVAL '2 hours'),
('Michael Brown', '+1-555-0129', 'Package Delivery', 'C-106', 'Lisa Anderson', 'pending', 'Ramesh Kumar (SEC001)', NOW() - INTERVAL '1 minute');

-- Insert temporary guests
INSERT INTO temporary_guests (flat_number, name, phone_number, check_in, check_out) VALUES
('A-101', 'Robert Johnson', '+91 9876543222', '2024-01-15', '2024-01-22'),
('B-203', 'Mary Williams', '+91 9876543224', '2024-01-10', '2024-01-17'),
('C-105', 'James Wilson', '+91 9876543225', '2024-01-12', '2024-01-19');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON residents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guards_updated_at BEFORE UPDATE ON guards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visitor_requests_updated_at BEFORE UPDATE ON visitor_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;
SELECT 'Residents: ' || COUNT(*) as residents_count FROM residents;
SELECT 'Guards: ' || COUNT(*) as guards_count FROM guards;
SELECT 'Admins: ' || COUNT(*) as admins_count FROM admins;
SELECT 'Visitor Requests: ' || COUNT(*) as visitor_requests_count FROM visitor_requests;
SELECT 'Family Members: ' || COUNT(*) as family_members_count FROM family_members;
SELECT 'Temporary Guests: ' || COUNT(*) as temporary_guests_count FROM temporary_guests;
