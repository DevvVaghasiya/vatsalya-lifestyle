USE texdeal;

-- Cleared legacy customers

INSERT INTO inventories (fabric_name, stock_quantity, rate_per_meter, color_code)
VALUES 
('Cotton Fabric', 1200, 120, '#D4C9A8'),
('Polyester Fabric', 850, 95, '#4A5568'),
('Rayon Fabric', 650, 110, '#8F9B73'),
('Linen Fabric', 300, 150, '#E2D8C3'),
('Denim Fabric', 450, 180, '#2B4C7E');

INSERT INTO dashboard_assets (name, image_url, type)
VALUES
('Blue Silk', 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop', 'FABRIC_COLLECTION'),
('Red Velvet', 'https://images.unsplash.com/photo-1597484662317-9bd7732dfad6?q=80&w=2070&auto=format&fit=crop', 'FABRIC_COLLECTION'),
('Golden Satin', 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop', 'FABRIC_COLLECTION'),
('Emerald Linen', 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2079&auto=format&fit=crop', 'FABRIC_COLLECTION'),
('Ruby Chiffon', 'https://images.unsplash.com/photo-1551334787-21e6bd3ab135?q=80&w=1935&auto=format&fit=crop', 'FABRIC_COLLECTION');

-- After running this, try making GET requests to:
-- http://localhost:8080/api/customers
-- http://localhost:8080/api/inventory
