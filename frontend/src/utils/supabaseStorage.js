import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Replace these with your actual Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Upload file to Supabase Storage
export const uploadFile = async (file, metadata, onProgress = () => {}) => {
  try {
    // Create a unique file ID
    const fileId = Date.now().toString() + Math.random().toString(36).substring(2, 10);
    const fileName = `${fileId}-${metadata.originalName}`;
    
    // Start progress
    onProgress(10);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('files')
      .upload(fileName, file);
    
    if (error) throw error;
    
    // Update progress
    onProgress(70);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('files')
      .getPublicUrl(fileName);
    
    const downloadURL = urlData.publicUrl;
    
    // Save metadata to Supabase database
    const { data: fileData, error: dbError } = await supabase
      .from('file_metadata')
      .insert([{
        id: fileId,
        original_name: metadata.originalName,
        original_type: metadata.originalType,
        original_size: metadata.originalSize,
        download_url: downloadURL,
        created_at: new Date().toISOString(),
        owner_id: 'user123', // Replace with actual user ID when auth is implemented
        owner_email: 'user@example.com', // Replace with actual user email
        scan_result: metadata.scanResult || null
      }])
      .select();
    
    if (dbError) throw dbError;
    
    onProgress(100);
    
    return { 
      id: fileId, 
      originalName: metadata.originalName,
      originalType: metadata.originalType,
      originalSize: metadata.originalSize,
      downloadURL,
      createdAt: new Date().toISOString(),
      ownerId: 'user123',
      ownerEmail: 'user@example.com'
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Get user's files
export const getFiles = async () => {
  try {
    const { data, error } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('owner_id', 'user123'); // Replace with actual user ID when auth is implemented
    
    if (error) throw error;
    
    return data.map(file => ({
      id: file.id,
      originalName: file.original_name,
      originalType: file.original_type,
      originalSize: file.original_size,
      downloadURL: file.download_url,
      createdAt: file.created_at,
      ownerId: file.owner_id,
      ownerEmail: file.owner_email,
      sharingLink: file.sharing_link
    }));
  } catch (error) {
    console.error('Error getting files:', error);
    return [];
  }
};

// Create sharing link
export const createSharingLink = async (fileId, expirationDate = null, password = null, maxDownloads = null, allowPreview = true) => {
  try {
    // Create sharing token
    const token = `share-${fileId}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Set expiration - default to 1 day if not specified
    let expiresAt = null;
    if (expirationDate === null) {
      // Never expire option
      expiresAt = null;
    } else if (expirationDate) {
      expiresAt = expirationDate.toISOString();
    } else {
      // Default 1 day
      const defaultExpiry = new Date();
      defaultExpiry.setHours(defaultExpiry.getHours() + 24);
      expiresAt = defaultExpiry.toISOString();
    }
    
    const sharingLink = {
      token,
      expiresAt,
      hasPassword: !!password,
      password: password ? btoa(password) : null, // Simple base64 encoding
      maxDownloads,
      downloadCount: 0,
      allowPreview
    };
    
    // Update file with sharing link
    const { error } = await supabase
      .from('file_metadata')
      .update({ sharing_link: sharingLink })
      .eq('id', fileId)
      .eq('owner_id', 'user123'); // Replace with actual user ID when auth is implemented
    
    if (error) throw error;
    
    return sharingLink;
  } catch (error) {
    console.error('Error creating sharing link:', error);
    throw error;
  }
};

// Delete file
export const deleteFile = async (fileId) => {
  try {
    // Get file metadata first to get the storage file name
    const { data: fileData, error: fetchError } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('id', fileId)
      .eq('owner_id', 'user123') // Replace with actual user ID when auth is implemented
      .single();
    
    if (fetchError) throw fetchError;
    if (!fileData) throw new Error('File not found');
    
    // Extract filename from download URL or construct it
    const fileName = `${fileId}-${fileData.original_name}`;
    
    // Delete from Supabase Storage
    const { error: storageError } = await supabase.storage
      .from('files')
      .remove([fileName]);
    
    if (storageError) {
      console.warn('Storage deletion error:', storageError);
      // Continue with database deletion even if storage fails
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('file_metadata')
      .delete()
      .eq('id', fileId)
      .eq('owner_id', 'user123'); // Replace with actual user ID when auth is implemented
    
    if (dbError) throw dbError;
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Verify password for shared file
export const verifySharedFilePassword = async (token, password) => {
  try {
    if (!token) return false;
    
    const fileId = token.split('-')[1];
    if (!fileId) return false;
    
    const { data, error } = await supabase
      .from('file_metadata')
      .select('sharing_link')
      .eq('id', fileId)
      .single();
    
    if (error || !data?.sharing_link) return false;
    
    const storedPassword = data.sharing_link.password;
    if (!storedPassword) return true; // No password required
    
    return btoa(password) === storedPassword;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

// Track download and check limits
export const trackDownload = async (token) => {
  try {
    if (!token) return false;
    
    const fileId = token.split('-')[1];
    if (!fileId) return false;
    
    const { data, error } = await supabase
      .from('file_metadata')
      .select('sharing_link')
      .eq('id', fileId)
      .single();
    
    if (error || !data?.sharing_link) return false;
    
    const sharingLink = data.sharing_link;
    
    // Check if download limit reached
    if (sharingLink.maxDownloads && sharingLink.downloadCount >= sharingLink.maxDownloads) {
      return { limitReached: true };
    }
    
    // Increment download count
    const newCount = (sharingLink.downloadCount || 0) + 1;
    const updatedSharingLink = {
      ...sharingLink,
      downloadCount: newCount
    };
    
    const { error: updateError } = await supabase
      .from('file_metadata')
      .update({ sharing_link: updatedSharingLink })
      .eq('id', fileId);
    
    if (updateError) {
      console.error('Error updating download count:', updateError);
    }
    
    return { success: true, downloadCount: newCount };
  } catch (error) {
    console.error('Error tracking download:', error);
    return false;
  }
};

// Get shared file by token
export const getSharedFile = async (token, password = null) => {
  try {
    if (!token) return null;
    
    const fileId = token.split('-')[1];
    if (!fileId) return null;
    
    // Find the file with this token
    const { data, error } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('id', fileId);
    
    if (error) throw error;
    if (data.length === 0) return null;
    
    const fileData = data[0];
    
    // Verify the token and check expiration
    if (!fileData.sharing_link || fileData.sharing_link.token !== token) {
      return null;
    }
    
    // Check expiration only if expiresAt is set (not null for never expire)
    if (fileData.sharing_link.expiresAt && new Date(fileData.sharing_link.expiresAt) < new Date()) {
      return null;
    }
    
    // Check download limit
    if (fileData.sharing_link.maxDownloads && 
        fileData.sharing_link.downloadCount >= fileData.sharing_link.maxDownloads) {
      return { limitReached: true };
    }
    
    // Check password if required
    if (fileData.sharing_link.hasPassword) {
      if (!password) {
        return { requiresPassword: true };
      }
      if (btoa(password) !== fileData.sharing_link.password) {
        return { invalidPassword: true };
      }
    }
    
    return {
      id: fileData.id,
      originalName: fileData.original_name,
      originalType: fileData.original_type,
      originalSize: fileData.original_size,
      downloadURL: fileData.download_url,
      createdAt: fileData.created_at,
      ownerId: fileData.owner_id,
      ownerEmail: fileData.owner_email,
      sharingLink: {
        ...fileData.sharing_link,
        password: undefined // Don't expose password
      }
    };
  } catch (error) {
    console.error('Error getting shared file:', error);
    return null;
  }
};