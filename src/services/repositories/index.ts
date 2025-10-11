/**
 * Repository Layer - Data Access Layer (DAL)
 * 
 * This layer provides a clean abstraction over database operations,
 * making the codebase resilient to table structure changes.
 * 
 * Benefits:
 * - Centralized data access logic
 * - Type-safe database operations
 * - Easy to test and mock
 * - Decoupled from UI components
 */

export { OrderRepository } from './OrderRepository';
export { ProfileRepository } from './ProfileRepository';
export { ShipmentRepository } from './ShipmentRepository';

export type { UnifiedOrder } from './OrderRepository';
export type { ShipmentHistory } from './ShipmentRepository';
