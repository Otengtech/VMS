import mongoose from 'mongoose';
import User from '../models/User.model.js';
import bcrypt from 'bcryptjs'; // ✅ Add this import
import { sendNewPassword } from '../config/email.js'; // ✅ Add this import for sending new password emails
import { sendPasswordChangedNotification, sendUserCredentials } from '../config/email.js';

// create user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, terminalId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash the password from frontend
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      terminalId: role === 'superadmin' ? null : terminalId // Superadmin doesn't need terminal
    });

    // Send email with the password the user created
    await sendUserCredentials(email, password, name, role);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully. Credentials have been sent to their email.',
      user: userResponse
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create user'
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/SuperAdmin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('terminalId', 'name location')
      .select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error('GET USERS ERROR:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/SuperAdmin
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const user = await User.findById(id)
      .populate('terminalId', 'name location')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('GET USER ERROR:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/SuperAdmin
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, terminalId, password } = req.body;

    console.log('Updating user with data:', { name, email, role, terminalId, hasPassword: !!password });

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    // Get the original user to get their email and name
    const originalUser = await User.findById(id);
    if (!originalUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Build update object
    const updateData = {};
    let isPasswordChanged = false;
    let newPasswordPlain = null;
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    
    // Handle password - ONLY if provided and not empty
    if (password !== undefined && password !== null && password !== '') {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters'
        });
      }
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
      isPasswordChanged = true;
      newPasswordPlain = password; // Store plain password for email
      console.log('Password will be updated');
    }

    // Handle terminalId
    if (terminalId !== undefined) {
      if (terminalId === null || terminalId === '') {
        updateData.terminalId = null;
      } else if (!mongoose.Types.ObjectId.isValid(terminalId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid terminal ID'
        });
      } else {
        updateData.terminalId = terminalId;
      }
    }

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('terminalId', 'name location')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Send email notification if password was changed
    if (isPasswordChanged) {
      try {
        await sendNewPassword(originalUser.email, newPasswordPlain, user.name);
        console.log(`✅ New password sent to ${originalUser.email}`);
      } catch (emailError) {
        console.error('Failed to send password email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json({
      success: true,
      user,
      message: isPasswordChanged 
        ? 'User updated successfully. New password has been sent to their email.' 
        : 'User updated successfully'
    });
  } catch (error) {
    console.error('UPDATE USER ERROR:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // ✅ Prevent deleting last superadmin
    if (user.role === 'superadmin') {
      const count = await User.countDocuments({ role: 'superadmin' });

      if (count <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete the last superadmin user'
        });
      }
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('DELETE USER ERROR:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};