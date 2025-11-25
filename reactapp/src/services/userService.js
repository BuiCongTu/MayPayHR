import BASE_API from './api';
import axios from 'axios';

const USER_API = '/user';

export async function getUsersByDepartment(deptId) {
    const API_URL = `${BASE_API}${USER_API}/department/${deptId}`;
    try {
        const response = await axios.get(API_URL);
        return response.data?.data || [];
    } catch (err) {
        console.error("Failed to fetch users by department:", err);
        return [];
    }
}