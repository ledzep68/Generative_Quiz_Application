import { Pool, PoolClient } from 'pg';
import {config} from "dotenv";
import path from 'path'; 
import { fileURLToPath } from 'url'; 

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 
config({ path: path.join(__dirname, '.env') });

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool(
    isProduction
        ? {
            connectionString: process.env.POSTGRES_URL,
            ssl: { 
                rejectUnauthorized: false 
            }
        }
        : {
            database: process.env.POSTGRES_DB_NAME,
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD
        }
);