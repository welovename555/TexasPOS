// js/services/userService.js
import { supabaseClient } from '../config.js';

const userService = {
  async findUserByCode(pinCode) {
    try {
      const { data, error } = await supabaseClient
        .from('employees')
        .select('*')
        .eq('code', pinCode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error finding user by code:', error);
      return null;
    }
  }
};

export { userService };
