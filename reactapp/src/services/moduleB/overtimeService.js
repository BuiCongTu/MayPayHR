import BASE_API from '../api'
import axios from "axios";

//overtime request service
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

//overtime ticket service
const OVERTIME_TICKET_API = '/overtime-ticket/'

export async function getFilteredOvertimeTickets (filter, pageable) {
    const params = {
        ...filter,
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
    }

    try {
        const response = await axios.get(BASE_API + OVERTIME_TICKET_API, { params });
        console.log("Overtime ticket response:", response.data);
        return response.data;
    } catch (err) {
        console.error("Failed to fetch overtime tickets:", err);
        return { content: [], totalElements: 0 };
    }
}

export async function confirmOvertimeTicket(ticketId) {
    const API_URL = `${BASE_API}${OVERTIME_TICKET_API}${ticketId}/confirm`;
    try {
        const response = await axios.post(API_URL);
        return response.data;
    } catch (err) {
        console.error("Failed to confirm overtime ticket:", err);
        throw err.response?.data || new Error('Failed to confirm ticket');
    }
}

export async function rejectOvertimeTicket(ticketId) {
    const API_URL = `${BASE_API}${OVERTIME_TICKET_API}${ticketId}/reject`;
    try {
        const response = await axios.post(API_URL);
        return response.data;
    } catch (err) {
        console.error("Failed to reject overtime ticket:", err);
        throw err.response?.data || new Error('Failed to reject ticket');
    }
}