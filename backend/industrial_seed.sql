USE texdeal;

INSERT INTO customers (name, phone, email, address, gst_in, total_deals, total_purchase, pending_due, created_at)
VALUES 
('Shree Ram Textiles', '9876543210', 'shreeram@example.com', 'Surat, Gujarat', '24ABCDE1234F1Z5', 18, 1245000, 45000, NOW()),
('Mahalaxmi Fabrics', '9876543211', 'mahalaxmi@example.com', 'Ahmedabad, Gujarat', '24XYZDE1234F1Z6', 5, 500000, 0, NOW()),
('Shyam Textiles', '9876543212', 'shyam@example.com', 'Mumbai, Maharashtra', '27ABCDE1234F1Z7', 12, 1020000, 120000, NOW());

INSERT INTO inventories (fabric_name, stock_quantity, rate_per_meter, color_code)
VALUES 
('Cotton Fabric', 1200, 120, '#D4C9A8'),
('Polyester Fabric', 850, 95, '#4A5568'),
('Rayon Fabric', 650, 110, '#8F9B73'),
('Linen Fabric', 300, 150, '#E2D8C3'),
('Denim Fabric', 450, 180, '#2B4C7E');

-- After running this, try making GET requests to:
-- http://localhost:8080/api/customers
-- http://localhost:8080/api/inventory
