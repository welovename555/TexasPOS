import { supabaseClient } from '../config.js';

const shiftService = {
  async getActiveShift(employeeId) {
    try {
      const { data, error } = await supabaseClient
        .from('shifts')
        .select('*')
        .eq('employee_id', employeeId)
        .is('end_time', null)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error getting active shift:', error.message);
      return null;
    }
  },

  async startShift(employeeId) {
    try {
      const { data, error } = await supabaseClient
        .from('shifts')
        .insert({
          employee_id: employeeId,
          start_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting shift:', error.message);
      return null;
    }
  },

  async endShift(shiftId) {
    try {
      const { data, error } = await supabaseClient
        .from('shifts')
        .update({
          end_time: new Date().toISOString()
        })
        .eq('id', shiftId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error ending shift:', error.message);
      return null;
    }
  }
};

export { shiftService };
