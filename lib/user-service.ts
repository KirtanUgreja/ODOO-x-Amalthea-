import { query } from './database-connection';
import { hashPassword, comparePassword } from './password-utils';
import type { UserPayload } from './auth-utils';

// Database user interface
export interface DbUser {
  user_id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'project_manager' | 'team_member' | 'finance';
  hourly_rate: number;
  is_active: boolean;
  created_at: Date;
}

// User creation interface
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'project_manager' | 'team_member' | 'finance';
  hourly_rate: number;
}

// User update interface
export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'admin' | 'project_manager' | 'team_member' | 'finance';
  hourly_rate?: number;
  is_active?: boolean;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<DbUser | null> {
  try {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as DbUser;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw new Error('Failed to get user');
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<DbUser | null> {
  try {
    const result = await query(
      'SELECT * FROM users WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as DbUser;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw new Error('Failed to get user');
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: CreateUserData): Promise<DbUser> {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const passwordHash = await hashPassword(userData.password);

    // Insert the new user
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, hourly_rate, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP)
       RETURNING *`,
      [userData.name, userData.email, passwordHash, userData.role, userData.hourly_rate]
    );

    return result.rows[0] as DbUser;
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create user');
  }
}

/**
 * Update user
 */
export async function updateUser(userId: number, userData: UpdateUserData): Promise<DbUser | null> {
  try {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic SET clause
    if (userData.name !== undefined) {
      setClause.push(`name = $${paramIndex}`);
      values.push(userData.name);
      paramIndex++;
    }

    if (userData.email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await getUserByEmail(userData.email);
      if (existingUser && existingUser.user_id !== userId) {
        throw new Error('Email already taken by another user');
      }
      setClause.push(`email = $${paramIndex}`);
      values.push(userData.email);
      paramIndex++;
    }

    if (userData.role !== undefined) {
      setClause.push(`role = $${paramIndex}`);
      values.push(userData.role);
      paramIndex++;
    }

    if (userData.hourly_rate !== undefined) {
      setClause.push(`hourly_rate = $${paramIndex}`);
      values.push(userData.hourly_rate);
      paramIndex++;
    }

    if (userData.is_active !== undefined) {
      setClause.push(`is_active = $${paramIndex}`);
      values.push(userData.is_active);
      paramIndex++;
    }

    if (setClause.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);
    const result = await query(
      `UPDATE users SET ${setClause.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as DbUser;
  } catch (error) {
    console.error('Error updating user:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update user');
  }
}

/**
 * Authenticate user (login)
 */
export async function authenticateUser(email: string, password: string): Promise<UserPayload | null> {
  try {
    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return null;
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    // Return user payload for JWT
    return {
      userId: user.user_id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

/**
 * Change user password
 */
export async function changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
  try {
    // Get user
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await comparePassword(oldPassword, user.password_hash);
    if (!isOldPasswordValid) {
      throw new Error('Invalid current password');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1 WHERE user_id = $2',
      [newPasswordHash, userId]
    );

    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to change password');
  }
}

/**
 * Get all users (for admin)
 */
export async function getAllUsers(): Promise<Omit<DbUser, 'password_hash'>[]> {
  try {
    const result = await query(
      'SELECT user_id, name, email, role, hourly_rate, is_active, created_at FROM users ORDER BY created_at DESC'
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw new Error('Failed to get users');
  }
}

/**
 * Deactivate user (soft delete)
 */
export async function deactivateUser(userId: number): Promise<boolean> {
  try {
    const result = await query(
      'UPDATE users SET is_active = false WHERE user_id = $1',
      [userId]
    );

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw new Error('Failed to deactivate user');
  }
}
