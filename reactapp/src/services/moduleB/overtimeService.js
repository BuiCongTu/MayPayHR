import BASE_API from '../api'
import axios from "axios";

const OVERTIME_REQUEST_API = '/overtime-request/'

export async function getFilteredOvertimeRequest (filter, pageable) {
    const params = {
        ...filter,
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
    }

    try {
        const response = await axios.get(BASE_API + OVERTIME_REQUEST_API, { params });
        console.log("Overtime request response:", response.data);
        return response.data;
    } catch (err) {
        console.error("Failed to fetch overtime requests:", err);
        return { content: [], totalElements: 0 };
    }
}

export async function createOvertimeRequest(requestData) {
    const API_URL = BASE_API + OVERTIME_REQUEST_API + 'create';
    try {
        const response = await axios.post(API_URL, requestData);
        return response.data;
    } catch (err) {
        console.error("Failed to create overtime request:", err);
        throw err.response?.data || new Error('Failed to create request');
    }
}