import BASE_API from './api';
import axios from 'axios';

const DEPARTMENT_API = '/department';

export async function getAllDepartments() {
    const API_URL = BASE_API + DEPARTMENT_API + '/';
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (err) {
        console.error("Failed to fetch departments:", err);
        throw err;
    }
}