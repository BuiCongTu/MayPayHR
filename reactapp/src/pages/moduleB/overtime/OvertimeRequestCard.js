import React from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Chip,
    Box,
    List,
    ListItem,
    ListItemText
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function OvertimeRequestCard({ request, isExpanded, onToggle }) {

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "warning";
            case "processed":
                return "success";
            default:
                return "default";
        }
    };

    return (
        <Accordion
            sx={{ mb: 2, boxShadow: 3, '&:before': { display: 'none' } }}
            expanded={isExpanded}
            onChange={onToggle}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${request.id}-content`}
                id={`panel-${request.id}-header`}
            >
                {/* ... (Rest of the file is unchanged) ... */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 1 }}>
                    <Box>
                        <Typography variant="h6" component="div">
                            Request #{request.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {request.numEmployees} employees — {request.overtimeTime} hours
                        </Typography>
                    </Box>
                    <Chip label={request.status} color={getStatusColor(request.status)} size="small" />
                </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ borderTop: '1px solid rgba(0, 0, 0, .125)' }}>
                <Box>
                    <Typography variant="body2" gutterBottom>
                        <strong>Details:</strong> {request.details}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                        <strong>Created At:</strong> {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'N/A'}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        <strong>Department:</strong> {request.departmentName}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        <strong>Factory Manager:</strong> {request.factoryManagerName}
                    </Typography>

                    {request.overtimeTickets && request.overtimeTickets.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2">Tickets:</Typography>
                            <List dense>
                                {request.overtimeTickets.map(ticket => (
                                    <ListItem key={ticket.id} disableGutters>
                                        <ListItemText
                                            primary={`Manager: ${ticket.managerName} -- Status: ${ticket.status}`}
                                            secondary={ticket.employeeList ? `Employees: ${ticket.employeeList}` : null}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}

export default OvertimeRequestCard;