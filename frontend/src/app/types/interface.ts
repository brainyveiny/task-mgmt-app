/**
 * @file interface.ts
 * @description Centralized type definitions and domain models for the task management system
 */

/**
 * @summary Core domain types
 * Defines possible statuses, priorities, and entity shapes for users and tasks
 */

// #region Types
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

// #endregion

/**
 * @summary User entity
 * Represents a registered user with system-generated metadata
 */

// #region User
export interface User {
    username: string;
    email: string;
    created_at: string;
}

// #endregion

/**
 * @summary Authentication response
 * Represents the JWT payload returned upon successful login
 */

// #region AuthResponse
export interface AuthResponse {
    access_token: string;
    token_type: string;
}

// #endregion

/**
 * @summary Registration model
 * Payload required for creating a new user account
 */

// #region RegisterData
export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

// #endregion

/**
 * @summary Login credentials
 * Payload required for authenticating an existing user
 */

// #region LoginCredentials
export interface LoginCredentials {
    email: string;
    password: string;
}

// #endregion

/**
 * @summary Task entity
 * Represents a complete task item with title, status, and audit dates
 */

// #region Task
export interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string;
    created_at: string;
    updated_at: string;
}

// #endregion

/**
 * @summary Task creation model
 * Subset of task properties allowed during initial persistence
 */

// #region TaskCreate
export interface TaskCreate {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string;
}

// #endregion

/**
 * @summary Task update model
 * Partial task set for modifying existing items
 */

// #region TaskUpdate
export interface TaskUpdate {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string;
}

// #endregion
