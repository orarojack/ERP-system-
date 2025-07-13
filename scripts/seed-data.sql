-- Insert sample products
INSERT INTO products (id, name, category, price, stock, description) VALUES
('prod-1', 'iPhone 15 USB-C Charger', 'Chargers', 2599.00, 50, 'Original Apple USB-C fast charger with cable'),
('prod-2', 'Samsung Galaxy S24 Ultra', 'Phones', 89999.00, 15, 'Latest Samsung flagship with S Pen'),
('prod-3', 'iPhone 14 OLED Screen', 'Screens', 19999.00, 8, 'Original iPhone 14 replacement OLED display'),
('prod-4', '15W Wireless Charger', 'Chargers', 3999.00, 25, 'Fast wireless charging pad with LED indicator'),
('prod-5', 'Samsung A54 Back Cover', 'Accessories', 1299.00, 30, 'Premium silicone back cover with camera protection'),
('prod-6', 'iPhone 13 Battery', 'Batteries', 4500.00, 20, 'High-capacity replacement battery for iPhone 13'),
('prod-7', 'USB-C to Lightning Cable', 'Cables', 1899.00, 40, '2-meter premium charging and data cable'),
('prod-8', 'Samsung S23 Screen Protector', 'Accessories', 899.00, 60, 'Tempered glass screen protector with installation kit');

-- Insert sample services
INSERT INTO services (id, name, category, price, duration, description, warranty) VALUES
('serv-1', 'Screen Replacement', 'Repair', 12000.00, '1-2 hours', 'Professional screen replacement with quality parts', '3 months'),
('serv-2', 'Battery Replacement', 'Repair', 8000.00, '30 minutes', 'High-quality battery replacement service', '6 months'),
('serv-3', 'Water Damage Repair', 'Repair', 15000.00, '2-3 days', 'Complete water damage restoration and cleaning', '1 month'),
('serv-4', 'Software Troubleshooting', 'Software', 5000.00, '1 hour', 'Software issues, virus removal, and optimization', '2 weeks'),
('serv-5', 'Data Recovery', 'Data', 10000.00, '1-2 days', 'Professional data recovery from damaged devices', 'No warranty on data'),
('serv-6', 'Motherboard Repair', 'Repair', 18000.00, '3-5 days', 'Advanced motherboard component-level repair', '2 months'),
('serv-7', 'Camera Repair', 'Repair', 9000.00, '1-2 hours', 'Front and rear camera module replacement', '3 months'),
('serv-8', 'Charging Port Repair', 'Repair', 6000.00, '1 hour', 'Charging port cleaning and replacement service', '2 months');

-- Insert sample customers
INSERT INTO customers (id, name, phone, email, address) VALUES
('cust-1', 'John Doe', '+254712345678', 'john.doe@email.com', 'Nairobi, Kenya'),
('cust-2', 'Jane Smith', '+254723456789', 'jane.smith@email.com', 'Mombasa, Kenya'),
('cust-3', 'Peter Kamau', '+254734567890', 'peter.kamau@email.com', 'Kisumu, Kenya'),
('cust-4', 'Mary Wanjiku', '+254745678901', 'mary.wanjiku@email.com', 'Nakuru, Kenya'),
('cust-5', 'David Ochieng', '+254756789012', 'david.ochieng@email.com', 'Eldoret, Kenya');
