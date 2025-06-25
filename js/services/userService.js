import { supabase } from '../config.js';

export const getUserByCode = async (employeeCode) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('code', employeeCode)
      .single();

    if (error) {
      throw error;
    }
    return { user: data, error: null };
  } catch (error) {
    console.error('Error fetching user by code:', error.message);
    return { user: null, error: error };
  }
};
