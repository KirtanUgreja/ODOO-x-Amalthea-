import bcrypt from 'bcryptjs';

async function generateHashes() {
  const password = 'Password123!'; // Default password for all test users
  const saltRounds = 12;
  
  console.log('Generating password hashes for test users...');
  console.log('Default password for all users:', password);
  console.log('');
  
  const users = [
    { name: 'John Admin', email: 'admin@oneflow.com' },
    { name: 'Sarah Manager', email: 'pm@oneflow.com' },
    { name: 'Mike Developer', email: 'dev1@oneflow.com' },
    { name: 'Lisa Designer', email: 'dev2@oneflow.com' },
    { name: 'Tom Finance', email: 'finance@oneflow.com' },
  ];
  
  for (const user of users) {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = '${user.email}';`);
  }
}

generateHashes().catch(console.error);
