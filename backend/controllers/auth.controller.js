import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ name, email, password });
  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      id: user._id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      country: user.country,
      city: user.city,
      favoriteGenres: user.favoriteGenres,
      bio: user.bio,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      country,
      city,
      favoriteGenres,
      bio,
      currentPassword,
      newPassword
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }
      
      const isCurrentPasswordValid = await user.matchPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      user.password = newPassword;
    }

    // Update user fields
    user.name = name || user.name;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.gender = gender || user.gender;
    user.country = country || user.country;
    user.city = city || user.city;
    user.favoriteGenres = favoriteGenres || user.favoriteGenres;
    user.bio = bio || user.bio;

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      dateOfBirth: updatedUser.dateOfBirth,
      gender: updatedUser.gender,
      country: updatedUser.country,
      city: updatedUser.city,
      favoriteGenres: updatedUser.favoriteGenres,
      bio: updatedUser.bio,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
