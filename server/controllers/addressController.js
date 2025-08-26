import Address from '../models/Address.js';
import User from '../models/User.js';

export const createAddress = async (req, res) => {
  try {
    const { userId, ...addressData } = req.body;
    
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create new address
    const address = new Address({
      user: userId,
      ...addressData
    });

    await address.save();

    res.status(201).json({
      success: true,
      address,
      message: 'Address created successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const addresses = await Address.find({ user: userId })
      .sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      addresses
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const address = await Address.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!address) {
      return res.status(404).json({ 
        success: false, 
        message: 'Address not found' 
      });
    }

    res.status(200).json({
      success: true,
      address,
      message: 'Address updated successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findByIdAndDelete(id);

    if (!address) {
      return res.status(404).json({ 
        success: false, 
        message: 'Address not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const { id, userId } = req.params;

    // First reset all addresses to non-default
    await Address.updateMany(
      { user: userId },
      { $set: { isDefault: false } }
    );

    // Then set the selected address as default
    const address = await Address.findByIdAndUpdate(
      id,
      { $set: { isDefault: true } },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ 
        success: false, 
        message: 'Address not found' 
      });
    }

    res.status(200).json({
      success: true,
      address,
      message: 'Default address set successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};