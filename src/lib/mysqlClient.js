import mysql from 'mysql2/promise';

// MySQL connection configuration
const dbConfig = {
  host: 'localhost',      // Replace with your Hostinger MySQL host
  user: 'root',           // Replace with your MySQL username
  password: '',           // Replace with your MySQL password
  database: 'sahmclean',  // Replace with your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
let pool;

const initDatabase = async () => {
  try {
    // Create a connection pool
    pool = mysql.createPool(dbConfig);
    
    // Test the connection
    const connection = await pool.getConnection();
    console.log('MySQL database connected successfully');
    connection.release();
    
    // Create tables if they don't exist
    await createTables();
    
    return true;
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
    return false;
  }
};

const createTables = async () => {
  try {
    // Create services_pricing table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS services_pricing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_id VARCHAR(255) NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        unit VARCHAR(100) DEFAULT 'خدمة',
        discount_percentage DECIMAL(5,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY (service_id)
      )
    `);

    // Create packages table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        discount_percentage DECIMAL(5,2) DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        duration VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create package_items table (for services included in packages)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS package_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        package_id INT NOT NULL,
        service_id VARCHAR(255) NOT NULL,
        quantity INT DEFAULT 1,
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables created or already exist');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
};

// Execute SQL query with params
const query = async (sql, params) => {
  try {
    if (!pool) await initDatabase();
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get all services pricing
const getServicesPricing = async () => {
  return await query('SELECT * FROM services_pricing ORDER BY category, service_name');
};

// Get service pricing by ID
const getServicePricingById = async (serviceId) => {
  const results = await query('SELECT * FROM services_pricing WHERE service_id = ?', [serviceId]);
  return results.length > 0 ? results[0] : null;
};

// Create or update service pricing
const upsertServicePricing = async (servicePricing) => {
  const { service_id, service_name, price, unit, discount_percentage, category, is_active } = servicePricing;
  
  // Check if service pricing exists
  const existing = await getServicePricingById(service_id);
  
  if (existing) {
    // Update existing service pricing
    return await query(
      'UPDATE services_pricing SET service_name = ?, price = ?, unit = ?, discount_percentage = ?, category = ?, is_active = ? WHERE service_id = ?',
      [service_name, price, unit, discount_percentage, category, is_active, service_id]
    );
  } else {
    // Insert new service pricing
    return await query(
      'INSERT INTO services_pricing (service_id, service_name, price, unit, discount_percentage, category, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [service_id, service_name, price, unit, discount_percentage, category, is_active]
    );
  }
};

// Delete service pricing
const deleteServicePricing = async (serviceId) => {
  return await query('DELETE FROM services_pricing WHERE service_id = ?', [serviceId]);
};

// Get all packages
const getAllPackages = async () => {
  return await query('SELECT * FROM packages ORDER BY featured DESC, created_at DESC');
};

// Get package by ID
const getPackageById = async (packageId) => {
  // Get package details
  const packages = await query('SELECT * FROM packages WHERE id = ?', [packageId]);
  if (packages.length === 0) return null;
  
  // Get package items (services)
  const packageItems = await query(`
    SELECT pi.*, sp.service_name, sp.price
    FROM package_items pi
    LEFT JOIN services_pricing sp ON pi.service_id = sp.service_id
    WHERE pi.package_id = ?
  `, [packageId]);
  
  return {
    ...packages[0],
    items: packageItems
  };
};

// Create package
const createPackage = async (packageData, packageItems) => {
  const { name, description, price, discount_percentage, featured, duration, is_active } = packageData;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Insert package
    const [result] = await connection.execute(
      'INSERT INTO packages (name, description, price, discount_percentage, featured, duration, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, discount_percentage, featured, duration, is_active]
    );
    
    const packageId = result.insertId;
    
    // Insert package items
    if (packageItems && packageItems.length > 0) {
      const itemsValues = packageItems.map(item => [packageId, item.service_id, item.quantity]);
      await connection.query(
        'INSERT INTO package_items (package_id, service_id, quantity) VALUES ?',
        [itemsValues]
      );
    }
    
    await connection.commit();
    
    return packageId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Update package
const updatePackage = async (packageId, packageData, packageItems) => {
  const { name, description, price, discount_percentage, featured, duration, is_active } = packageData;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Update package
    await connection.execute(
      'UPDATE packages SET name = ?, description = ?, price = ?, discount_percentage = ?, featured = ?, duration = ?, is_active = ? WHERE id = ?',
      [name, description, price, discount_percentage, featured, duration, is_active, packageId]
    );
    
    // Delete existing package items
    await connection.execute('DELETE FROM package_items WHERE package_id = ?', [packageId]);
    
    // Insert updated package items
    if (packageItems && packageItems.length > 0) {
      const itemsValues = packageItems.map(item => [packageId, item.service_id, item.quantity]);
      await connection.query(
        'INSERT INTO package_items (package_id, service_id, quantity) VALUES ?',
        [itemsValues]
      );
    }
    
    await connection.commit();
    
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Delete package
const deletePackage = async (packageId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Delete package items first (foreign key constraint)
    await connection.execute('DELETE FROM package_items WHERE package_id = ?', [packageId]);
    
    // Delete package
    await connection.execute('DELETE FROM packages WHERE id = ?', [packageId]);
    
    await connection.commit();
    
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Initialize the database connection when this module is imported
initDatabase();

export {
  query,
  getServicesPricing,
  getServicePricingById,
  upsertServicePricing,
  deleteServicePricing,
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage
};