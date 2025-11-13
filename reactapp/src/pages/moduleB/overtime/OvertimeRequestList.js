import React, { useState, useEffect } from 'react';
import { getFilteredOvertimeRequest } from "../../../services/moduleB/overtimeService";
import OvertimeRequestCard from "./OvertimeRequestCard";
import { useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';

function OvertimeRequestList() {
    const [requests, setRequests] = useState([]);
    const [page, setPage] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    // --- Filter States ---
    const [statusFilter, setStatusFilter] = useState(''); // '' = All
    const [departmentNameSearch, setDepartmentNameSearch] = useState('');

    // --- Debounced States for Search ---
    const [debouncedDepartmentName, setDebouncedDepartmentName] = useState(departmentNameSearch);

    // Debounce effect for Department Name
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedDepartmentName(departmentNameSearch);
            setPage(0); // Reset to first page on new search
        }, 500); // 500ms delay

        // Cleanup function
        return () => clearTimeout(handler);
    }, [departmentNameSearch]);

    // --- Main Data Fetching Effect ---
    useEffect(() => {
        async function loadData() {
            const filter = {
                status: statusFilter || null,
                departmentName: debouncedDepartmentName || null,
            };
            const pageable = { page, size: 10, sort: "id,desc" };

            try {
                const data = await getFilteredOvertimeRequest(filter, pageable);
                setRequests(data?.content || []);
            } catch (err) {
                console.error("Failed to fetch overtime requests", err);
            }
        }
        loadData();
    }, [page, statusFilter, debouncedDepartmentName]);

    // --- Handlers ---
    const handleExpandChange = (panelId) => (event, isExpanded) => {
        setExpanded(isExpanded ? panelId : false);
    };

    const handleStatusChange = (value) => {
        setStatusFilter(value);
        setPage(0); // Reset to the first page
    };

    const getStatusButtonClass = (value) => {
        return `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            statusFilter === value
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
        }`;
    };

    return (
        // Main container with padding
        <div className="p-6 md:p-8 max-w-7xl mx-auto">

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Overtime Requests</h2>
                <button
                    onClick={() => navigate("/overtime-request/create")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-all duration-150"
                >
                    Create New Request
                </button>
            </div>

            {/* --- FILTER BAR --- */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg shadow-sm">

                {/* Department Search */}
                <div className="relative flex-grow md:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="deptSearch"
                        type="text"
                        placeholder="Search by Department..."
                        value={departmentNameSearch}
                        onChange={e => setDepartmentNameSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 hidden md:block">Status:</span>
                    <button
                        onClick={() => handleStatusChange('')}
                        className={getStatusButtonClass('')}
                    >
                        All
                    </button>
                    <button
                        onClick={() => handleStatusChange('pending')}
                        className={getStatusButtonClass('pending')}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => handleStatusChange('processed')}
                        className={getStatusButtonClass('processed')}
                    >
                        Processed
                    </button>
                </div>
            </div>

            {/* --- LIST OF REQUESTS --- */}
            {requests.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg text-gray-500">No overtime requests found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <OvertimeRequestCard
                            key={req.id}
                            request={req}
                            isExpanded={expanded === req.id}
                            onToggle={handleExpandChange(req.id)}
                        />
                    ))}
                </div>
            )}

            {/* TODO: Add Pagination controls here */}
        </div>
    );
}

export default OvertimeRequestList;