# Database Connection Guide
## 1. Using pgAdmin 4

1. Launch pgAdmin 4 (should be installed with PostgreSQL)
   - Windows Start Menu → pgAdmin 4
   - OR visit: http://127.0.0.1:53134/browser/ (port may vary)

2. Connect to OneFlow Database:
   - Right-click "Servers" → "Register" → "Server"
   - Fill in these details:
     ```
     General Tab:
     Name: OneFlow Local

     Connection Tab:
     Host: localhost
     Port: 5432
     Database: oneflow_dev
     Username: oneflow_user
     Password: oneflow_pass
     ```

3. Explore Database in pgAdmin:
   - Servers → OneFlow Local → Databases → oneflow_dev
   - Check tables: oneflow_dev → Schemas → public → Tables
   - View data: Right-click any table → View/Edit Data → All Rows
   - Run queries: Tools → Query Tool

## 2. Connection Details for Backend

For Node.js/Express backend:
```javascript
// Using node-postgres
const { Pool } = require('pg');

const pool = new Pool({
  user: 'oneflow_user',
  host: 'localhost',
  database: 'oneflow_dev',
  password: 'oneflow_pass',
  port: 5432,
});
```

For Python backend:
```python
# Using psycopg2
import psycopg2

conn = psycopg2.connect(
    dbname="oneflow_dev",
    user="oneflow_user",
    password="oneflow_pass",
    host="localhost",
    port="5432"
)
```

For Django:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'oneflow_dev',
        'USER': 'oneflow_user',
        'PASSWORD': 'oneflow_pass',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## 3. Connection String Formats

- General format:
  ```
  postgresql://oneflow_user:oneflow_pass@localhost:5432/oneflow_dev
  ```

- Connection URL:
  ```
  postgres://oneflow_user:oneflow_pass@localhost:5432/oneflow_dev
  ```

## 4. Testing Tools

1. psql command line:
   ```bash
   psql -U oneflow_user -d oneflow_dev
   ```

2. Sample queries in pgAdmin:
   ```sql
   -- Check active projects
   SELECT * FROM project_financials;

   -- Check tasks and assignees
   SELECT t.name, t.status, u.name as assignee
   FROM tasks t
   JOIN users u ON t.assignee_id = u.user_id;

   -- Check financial summary
   SELECT 
       p.name as project,
       SUM(ci.amount) as invoiced,
       SUM(vb.amount) as bills,
       SUM(e.amount) as expenses
   FROM projects p
   LEFT JOIN customer_invoices ci ON p.project_id = ci.project_id
   LEFT JOIN vendor_bills vb ON p.project_id = vb.project_id
   LEFT JOIN expenses e ON p.project_id = e.project_id
   GROUP BY p.project_id, p.name;
   ```