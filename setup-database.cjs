#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🍫 Setting up Noir Sane Database...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
  } else {
    console.log('❌ .env.example file not found');
    process.exit(1);
  }
}

// Update .env with local database settings
let envContent = fs.readFileSync(envPath, 'utf8');
envContent = envContent.replace(
  'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/noir_sane?schema=public"',
  'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/noir_sane?schema=public"'
);
fs.writeFileSync(envPath, envContent);

console.log('📝 Environment file configured');

// Database setup commands
const commands = [
  {
    name: 'Generate Prisma Client',
    command: 'npm run prisma:generate',
    critical: true
  },
  {
    name: 'Run Database Migrations',
    command: 'npm run prisma:migrate',
    critical: true
  },
  {
    name: 'Seed Database with Initial Data',
    command: 'npm run prisma:seed',
    critical: true
  }
];

console.log('\n🚀 Running database setup commands...\n');

for (const cmd of commands) {
  try {
    console.log(`⏳ ${cmd.name}...`);
    execSync(cmd.command, { stdio: 'inherit', cwd: __dirname });
    console.log(`✅ ${cmd.name} completed`);
  } catch (error) {
    console.log(`❌ ${cmd.name} failed`);
    if (cmd.critical) {
      console.log('\n💡 Make sure PostgreSQL is running and accessible:');
      console.log('   - PostgreSQL should be installed on your system');
      console.log('   - Database "noir_sane" should exist');
      console.log('   - User "postgres" should have access');
      console.log('\n📖 See README.md for detailed setup instructions');
      process.exit(1);
    }
  }
}

console.log('\n🎉 Database setup completed successfully!');
console.log('\n🍫 You can now start the application with:');
console.log('   npm run dev');
console.log('\n📱 Application will be available at:');
console.log('   Frontend: http://localhost:8080');
console.log('   Backend:  http://localhost:4000');
console.log('   API Docs: http://localhost:4000/docs');
