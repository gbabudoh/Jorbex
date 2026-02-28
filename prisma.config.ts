import path from 'path';
import dotenv from 'dotenv';

// Load .env.local for Prisma CLI commands
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
