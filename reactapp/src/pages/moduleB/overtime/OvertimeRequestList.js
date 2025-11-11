import React, {useState, useEffect} from 'react';
import {getFilteredOvertimeRequest} from "../../../services/moduleB/overtimeService";
import OvertimeRequestCard from "./OvertimeRequestCard";
import {useNavigate} from "react-router-dom";

function OvertimeRequestList() {
    const [requests, setRequests] = useState([]);
    const [page, setPage] = useState(0);

    //navigator
    const navigate = useNavigate();

    // track the expanded panel
    const [expanded, setExpanded] = useState(false);

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

    // handler that sets the state
    const handleExpandChange = (panelId) => (event, isExpanded) => {
        // If the panel is being expanded, set its ID.
        // If it's being collapsed (isExpanded is false), set to false.
        setExpanded(isExpanded ? panelId : false);
    };

    return (
        <div className="p-4">
            <h3 className="text-2xl font-bold mb-4">Overtime Requests</h3>
            <button
                onClick={event => navigate("/overtime-request/create")}>
                Create new request
            </button>
            {requests.length === 0 ? (
                <p>No overtime requests found.</p>
            ) : (
                // Pass the state and handler down to the card
                requests.map(req => (
                    <OvertimeRequestCard
                        key={req.id}
                        request={req}
                        // Pass 'true' if this card's ID matches the expanded ID
                        isExpanded={expanded === req.id}
                        // Pass the handler, pre-set with this card's ID
                        onToggle={handleExpandChange(req.id)}
                    />
                ))
            )}
        </div>
    );
}

export default OvertimeRequestList;