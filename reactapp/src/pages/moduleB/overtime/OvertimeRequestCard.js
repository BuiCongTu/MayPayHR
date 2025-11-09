import React, { useState } from "react";

function OvertimeRequestCard({ request }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border rounded-xl shadow-md p-4 mb-4 bg-white">
            {/* Header summary */}
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div>
                    <h3 className="text-lg font-semibold">
                        Request #{request.id} — {request.status}
                    </h3>
                    <p className="text-gray-500 text-sm">
                        {request.numEmployees} employees — {request.overtimeTime} hours
                    </p>
                </div>
                <button className="text-blue-500 text-sm">
                    {isExpanded ? "Collapse ▲" : "Expand ▼"}
                </button>
            </div>

            {/* Expanded details */}
            {isExpanded && (
                <div className="mt-3 text-gray-700 text-sm">
                    <p><strong>Details:</strong> {request.details}</p>
                    <p><strong>Created At:</strong> {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'N/A'}</p>
                    <p><strong>Department:</strong> {request.departmentName}</p>
                    <p><strong>Factory Manager:</strong> {request.factoryManagerName}</p>

                    {/* Overtime Tickets */}
                    {request.overtimeTickets && request.overtimeTickets.length > 0 && (
                        <div className="mt-2">
                            <strong>Tickets:</strong>
                            <ul className="list-disc ml-5 mt-1">
                                {request.overtimeTickets.map(ticket => (
                                    <li key={ticket.id}>
                                        Manager Name: {ticket.managerName} -- Status: {ticket.status}
                                        {ticket.employeeList && (
                                            <p>Employee List: {ticket.employeeList}</p>
                                        )}

                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default OvertimeRequestCard;
