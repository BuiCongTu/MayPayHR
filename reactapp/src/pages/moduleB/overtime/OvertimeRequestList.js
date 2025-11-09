// factory manager yeu cau
import React, {useState, useEffect} from 'react';
import {getFilteredOvertimeRequest} from "../../../services/moduleB/overtimeService";
import OvertimeRequestCard from "./OvertimeRequestCard";

function OvertimeRequestList() {
    const [requests, setRequests] = useState([]);
    const [page, setPage] = useState(0);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getFilteredOvertimeRequest(
                    {},
                    { page, size: 10, sort: "id,desc" }
                );
                setRequests(data?.content || []);
            } catch (err) {
                console.error("Failed to fetch overtime requests", err);
            }
        }
        loadData();
    }, [page]);
    return (
        <div className="p-4">
            {requests.length === 0 ? (
                <p>No overtime requests found.</p>
            ) : (
                requests.map(req => <OvertimeRequestCard key={req.id} request={req} />)
            )}
        </div>
    );
}

export default OvertimeRequestList;