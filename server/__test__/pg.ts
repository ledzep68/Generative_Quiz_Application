import { newDb } from 'pg-mem';

const MockedDB = newDb();
export const { Pool, Client } = MockedDB.adapters.createPg();
export const getTestDb = () => MockedDB;