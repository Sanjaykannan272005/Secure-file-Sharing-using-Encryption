/**
 * File model - Supabase implementation
 */
const { supabase } = require('../utils/database');

const createFile = async (fileData) => {
  const { data, error } = await supabase
    .from('file_metadata')
    .insert({
      id: fileData.id,
      original_name: fileData.originalName,
      original_type: fileData.originalType,
      original_size: fileData.originalSize,
      download_url: fileData.path,
      owner_id: fileData.ownerId,
      owner_email: fileData.ownerEmail
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    path: data.download_url,
    originalName: data.original_name,
    originalType: data.original_type,
    originalSize: data.original_size,
    ownerId: data.owner_id,
    ownerEmail: data.owner_email,
    createdAt: data.created_at,
    sharing: data.sharing_link
  };
};

const getFileById = async (fileId) => {
  const { data, error } = await supabase
    .from('file_metadata')
    .select('*')
    .eq('id', fileId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    path: data.download_url,
    originalName: data.original_name,
    originalType: data.original_type,
    originalSize: data.original_size,
    ownerId: data.owner_id,
    ownerEmail: data.owner_email,
    createdAt: data.created_at,
    sharing: data.sharing_link
  };
};

const getFilesByOwnerId = async (ownerId) => {
  const { data, error } = await supabase
    .from('file_metadata')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map(row => ({
    id: row.id,
    path: row.download_url,
    originalName: row.original_name,
    originalType: row.original_type,
    originalSize: row.original_size,
    ownerId: row.owner_id,
    ownerEmail: row.owner_email,
    createdAt: row.created_at,
    sharing: row.sharing_link
  }));
};

const getAllFiles = async () => {
  const { data, error } = await supabase
    .from('file_metadata')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map(row => ({
    id: row.id,
    path: row.download_url,
    originalName: row.original_name,
    originalType: row.original_type,
    originalSize: row.original_size,
    ownerId: row.owner_id,
    ownerEmail: row.owner_email,
    createdAt: row.created_at,
    sharing: row.sharing_link
  }));
};

const updateFile = async (fileId, updateData) => {
  const updates = {};
  if (updateData.originalName) updates.original_name = updateData.originalName;
  if (updateData.originalType) updates.original_type = updateData.originalType;
  if (updateData.originalSize) updates.original_size = updateData.originalSize;
  
  if (Object.keys(updates).length === 0) return await getFileById(fileId);
  
  const { error } = await supabase
    .from('file_metadata')
    .update(updates)
    .eq('id', fileId);
  
  if (error) throw error;
  return await getFileById(fileId);
};

const deleteFile = async (fileId) => {
  const { error } = await supabase
    .from('file_metadata')
    .delete()
    .eq('id', fileId);
  
  return !error;
};

const createFileSharing = async (fileId, token, expiresAt) => {
  const sharing = {
    token,
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
    createdAt: new Date().toISOString()
  };
  
  const { error } = await supabase
    .from('file_metadata')
    .update({ sharing_link: sharing })
    .eq('id', fileId);
  
  if (error) throw error;
  return await getFileById(fileId);
};

const debugFileStore = async () => {
  const files = await getAllFiles();
  console.log('Current files in database:', files);
  return files;
};

module.exports = {
  createFile,
  getFileById,
  getFilesByOwnerId,
  updateFile,
  deleteFile,
  createFileSharing,
  debugFileStore,
  getAllFiles
};
