-- Insert default residents
INSERT INTO residents (flat_number, name, phone_number, password) VALUES
('A-101', 'John Smith', '+91 9876543210', 'resident123'),
('B-203', 'Sarah Johnson', '+91 9876543211', 'resident123'),
('C-105', 'Mike Wilson', '+91 9876543212', 'resident123'),
('A-102', 'Emily Davis', '+91 9876543213', 'resident123'),
('B-204', 'David Brown', '+91 9876543214', 'resident123')
ON CONFLICT (flat_number) DO NOTHING;

-- Insert family members
INSERT INTO family_members (flat_number, name, phone_number, relation, age) VALUES
('A-101', 'Jane Smith', '+91 9876543220', 'Spouse', 28),
('A-101', 'Mike Smith', '+91 9876543221', 'Son', 12),
('B-203', 'Tom Johnson', '+91 9876543222', 'Son', 15),
('C-105', 'Lisa Wilson', '+91 9876543223', 'Spouse', 32)
ON CONFLICT DO NOTHING;

-- Insert default guards
INSERT INTO guards (employee_id, name, shift, phone_number, password, status, check_in_time) VALUES
('SEC001', 'Ramesh Kumar', 'morning', '+91 9876543230', 'guard123', 'on-duty', '8:20:07 AM'),
('SEC002', 'Suresh Patel', 'evening', '+91 9876543231', 'guard123', 'off-duty', NULL),
('SEC003', 'Mahesh Singh', 'night', '+91 9876543232', 'guard123', 'off-duty', NULL),
('SEC004', 'Rajesh Sharma', 'morning', '+91 9876543233', 'guard123', 'off-duty', NULL)
ON CONFLICT (employee_id) DO NOTHING;

-- Insert default admin
INSERT INTO admins (admin_id, name, password) VALUES
('admin001', 'System Administrator', 'admin123'),
('admin002', 'Security Manager', 'admin123')
ON CONFLICT (admin_id) DO NOTHING;

-- Insert sample visitor requests
INSERT INTO visitor_requests (visitor_name, phone_number, purpose_of_visit, flat_number, resident_name, status, checked_by) VALUES
('David Wilson', '+1-555-0125', 'Package Delivery', 'A-101', 'John Smith', 'pending', 'Ramesh Kumar (SEC001)'),
('Lisa Chen', '+1-555-0126', 'Personal Visit', 'A-101', 'John Smith', 'pending', 'Ramesh Kumar (SEC001)'),
('Robert Johnson', '+1-555-0123', 'Business Meeting', 'B-203', 'Sarah Johnson', 'approved', 'Ramesh Kumar (SEC001)'),
('Maria Garcia', '+1-555-0124', 'Package Delivery', 'C-105', 'Mike Wilson', 'rejected', 'Ramesh Kumar (SEC001)'),
('Alex Thompson', '+1-555-0127', 'Maintenance', 'A-102', 'Emily Davis', 'left-at-gate', 'Suresh Patel (SEC002)')
ON CONFLICT DO NOTHING;

-- Insert temporary guests
INSERT INTO temporary_guests (flat_number, name, phone_number, check_in, check_out) VALUES
('A-101', 'Robert Johnson', '+91 9876543222', '2024-01-15', '2024-01-22'),
('B-203', 'Mary Williams', '+91 9876543224', '2024-01-10', '2024-01-17')
ON CONFLICT DO NOTHING;
