-- Create residents table with flat_number as primary key
CREATE TABLE IF NOT EXISTS residents (
  flat_number TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
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
CREATE TABLE IF NOT EXISTS temporary_guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flat_number TEXT NOT NULL REFERENCES residents(flat_number) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guards table
CREATE TABLE IF NOT EXISTS guards (
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
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visitor_requests table
CREATE TABLE IF NOT EXISTS visitor_requests (
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
CREATE INDEX IF NOT EXISTS idx_visitor_requests_flat_number ON visitor_requests(flat_number);
CREATE INDEX IF NOT EXISTS idx_visitor_requests_status ON visitor_requests(status);
CREATE INDEX IF NOT EXISTS idx_visitor_requests_created_at ON visitor_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_family_members_flat_number ON family_members(flat_number);
CREATE INDEX IF NOT EXISTS idx_temporary_guests_flat_number ON temporary_guests(flat_number);
CREATE INDEX IF NOT EXISTS idx_guards_employee_id ON guards(employee_id);
CREATE INDEX IF NOT EXISTS idx_guards_status ON guards(status);

-- Enable Row Level Security
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guards ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for residents
CREATE POLICY "Residents can view their own data" ON residents
  FOR SELECT USING (true);

CREATE POLICY "Residents can update their own data" ON residents
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can insert residents" ON residents
  FOR INSERT WITH CHECK (true);

-- Create policies for visitor_requests
CREATE POLICY "Anyone can view visitor requests" ON visitor_requests
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert visitor requests" ON visitor_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update visitor requests" ON visitor_requests
  FOR UPDATE USING (true);

-- Create policies for guards
CREATE POLICY "Anyone can view guards" ON guards
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update guards" ON guards
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can insert guards" ON guards
  FOR INSERT WITH CHECK (true);

-- Create policies for admins
CREATE POLICY "Anyone can view admins" ON admins
  FOR SELECT USING (true);

-- Create policies for family_members
CREATE POLICY "Anyone can view family members" ON family_members
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert family members" ON family_members
  FOR INSERT WITH CHECK (true);

-- Create policies for temporary_guests
CREATE POLICY "Anyone can view temporary guests" ON temporary_guests
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert temporary guests" ON temporary_guests
  FOR INSERT WITH CHECK (true);
