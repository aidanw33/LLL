import { execSync, spawn } from 'child_process'
import { existsSync, copyFileSync, readFileSync, writeFileSync } from 'fs'

function run(cmd) {
  return execSync(cmd, { stdio: 'inherit' })
}

function runQuiet(cmd) {
  return execSync(cmd, { encoding: 'utf-8' })
}

// Check Docker is installed
try {
  execSync('docker --version', { stdio: 'ignore' })
} catch {
  console.error('Error: Docker is not installed.')
  process.exit(1)
}

// Check Docker is running
try {
  execSync('docker info', { stdio: 'ignore' })
} catch {
  console.error('Error: Docker daemon is not running. Start Docker Desktop and try again.')
  process.exit(1)
}

// Create .env from example if it doesn't exist
if (!existsSync('.env')) {
  console.log('Creating .env from .env.example...')
  copyFileSync('.env.example', '.env')
}

// Start Supabase
console.log('Starting Supabase...')
run('npx supabase start')

// Grab local Supabase credentials and update .env
try {
  const status = JSON.parse(runQuiet('npx supabase status --output json'))
  let env = readFileSync('.env', 'utf-8')

  if (status.API_URL) {
    env = env.replace(/^VITE_SUPABASE_URL=.*/m, `VITE_SUPABASE_URL=${status.API_URL}`)
  }
  if (status.ANON_KEY) {
    env = env.replace(/^VITE_SUPABASE_ANON_KEY=.*/m, `VITE_SUPABASE_ANON_KEY=${status.ANON_KEY}`)
  }
  if (status.DB_URL) {
    env = env.replace(/^DATABASE_URL=.*/m, `DATABASE_URL=${status.DB_URL}`)
  }

  writeFileSync('.env', env)
  console.log('Updated .env with local Supabase credentials.')
} catch {
  console.warn('Warning: Could not auto-update .env with Supabase credentials.')
}

// Start Vite dev server
console.log('Starting dev server...')
const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true })
vite.on('exit', (code) => process.exit(code ?? 0))
