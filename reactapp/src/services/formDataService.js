import axios from 'axios';

const API_URL = 'http://localhost:9999/api';

export const getDepartments = async () =>
{
  const response = await axios.get(`${API_URL}/department/`);
  return response.data;
};

export const getLinesByDepartment = async (departmentId) =>
{
  const response = await axios.get(`${API_URL}/line/department/${departmentId}`);
  return response.data.data;
};

export const getRoles = async () =>
{
  const response = await axios.get(`${API_URL}/form-data/roles`);
  return response.data.data;
};

export const getSkillLevels = async () =>
{
  const response = await axios.get(`${API_URL}/form-data/skill-levels`);
  return response.data.data;
};

export default {
  getDepartments,
  getLinesByDepartment,
  getRoles,
  getSkillLevels
};
