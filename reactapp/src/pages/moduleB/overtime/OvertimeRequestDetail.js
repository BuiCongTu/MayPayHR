import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getOvertimeRequestById,
    confirmOvertimeTicket,
    rejectOvertimeTicket
} from '../../../services/moduleB/overtimeService';
import RequestStatusTracker from '../../../components/moduleB/RequestStatusTracker';
import EmployeeListTable from './EmployeeList';
import ActionReasonModal from './ActionReasonModal';
import RequestTicketList from './RequestTicketList';

import {
    Box, CircularProgress, Typography, Alert, Button, Container,
    Paper, Grid, Chip, LinearProgress, Card, CardContent, Stack,
    Accordion, AccordionSummary, AccordionDetails, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip,
    Dialog, DialogTitle, DialogContent, Tabs, Tab, CardActionArea
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import ViewListIcon from '@mui/icons-material/ViewList';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';

function processStaffingData(request) {
    if (!request || !request.lineDetails) return { stats: {}, lines: [] };

    const lineMap = {};
    let pendingTicketsGlobal = 0;

    request.lineDetails.forEach(detail => {
        lineMap[detail.lineId] = {
            id: detail.lineId,
            name: detail.lineName,
            required: detail.numEmployees,
            staffed: 0,
            tickets: []
        };
    });

    if (request.overtimeTickets) {
        request.overtimeTickets.forEach(ticket => {
            if (ticket.status === 'rejected' || ticket.status === 'pending') return;
            if (ticket.status === 'submitted') pendingTicketsGlobal++;

            if (ticket.employeeList) {
                const employeesByLine = {};
                ticket.employeeList.forEach(emp => {
                    if (emp.status === 'accepted' && emp.lineId) {
                        if (!employeesByLine[emp.lineId]) employeesByLine[emp.lineId] = [];
                        employeesByLine[emp.lineId].push(emp);
                    }
                });

                Object.keys(employeesByLine).forEach(lineId => {
                    const lineEntry = lineMap[lineId];
                    const contributingEmps = employeesByLine[lineId];

                    if (lineEntry) {
                        lineEntry.staffed += contributingEmps.length;
                        lineEntry.tickets.push({
                            ticketId: ticket.id,
                            managerName: ticket.managerName || ticket.manager?.fullName || "Unknown",
                            status: ticket.status,
                            contribution: contributingEmps.length,
                            employees: contributingEmps
                        });
                    }
                });
            }
        });
    }

    const lineArray = Object.values(lineMap);
    const totalDemand = lineArray.reduce((sum, l) => sum + l.required, 0);
    const totalSupply = lineArray.reduce((sum, l) => sum + l.staffed, 0);

    return {
        stats: {
            totalDemand,
            totalSupply,
            fillRate: totalDemand > 0 ? Math.round((totalSupply / totalDemand) * 100) : 0,
            pendingTickets: pendingTicketsGlobal
        },
        lines: lineArray
    };
}

function StatCard({ title, value, subtitle, icon, color, onClick }) {
    const CardContentWrapper = onClick ? CardActionArea : React.Fragment;
    const wrapperProps = onClick ? { onClick: onClick } : {};

    return (
        <Card elevation={2} sx={{ height: '100%', borderTop: `4px solid ${color}` }}>
            <CardContentWrapper {...wrapperProps}>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                        <Box>
                            <Typography color="textSecondary" variant="caption" fontWeight="bold" textTransform="uppercase">
                                {title}
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                                {value}
                            </Typography>
                            {subtitle}
                        </Box>
                        <Box sx={{ p: 1, bgcolor: `${color}15`, borderRadius: 2, color: color }}>
                            {icon}
                        </Box>
                    </Stack>
                </CardContent>
            </CardContentWrapper>
        </Card>
    );
}

function TicketStatusChip({ status }) {
    let color = 'default';
    if (status === 'submitted') color = 'info';
    if (status === 'confirmed') color = 'primary';
    if (status === 'approved') color = 'success';
    if (status === 'rejected') color = 'error';
    return <Chip label={status?.toUpperCase()} color={color} size="small" sx={{ fontWeight: 'bold', minWidth: 80 }} />;
}

export default function OvertimeRequestDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [request, setRequest] = useState(null);
    const [processedData, setProcessedData] = useState({ stats: {}, lines: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI State
    const [tabValue, setTabValue] = useState(0);
    const [expandedAccordion, setExpandedAccordion] = useState(false);

    // Modals
    const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [selectedEmployeeList, setSelectedEmployeeList] = useState([]);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [ticketToReject, setTicketToReject] = useState(null);

    const loadData = async () => {
        try {
            const data = await getOvertimeRequestById(id);
            setRequest(data);
            setProcessedData(processStaffingData(data));
        } catch (err) {
            setError("Failed to load request details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleAccordionChange = (panelId) => (event, isExpanded) => {
        setExpandedAccordion(isExpanded ? panelId : false);
    };

    const handleConfirm = async (ticketId) => {
        try {
            await confirmOvertimeTicket(ticketId);
            loadData();
        } catch (err) {
            alert("Failed to confirm ticket: " + err.message);
        }
    };

    const handleRejectClick = (ticketId) => {
        setTicketToReject(ticketId);
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = async (reason) => {
        try {
            await rejectOvertimeTicket(ticketToReject, reason);
            setRejectModalOpen(false);
            setTicketToReject(null);
            loadData();
        } catch (err) {
            alert("Failed to reject ticket.");
        }
    };

    const handleViewEmployees = (list) => {
        setSelectedEmployeeList(list || []);
        setEmployeeModalOpen(true);
    };

    const handlePendingCardClick = () => {
        setTabValue(1);
    };

    if (loading) return <Box p={5} display="flex" justifyContent="center"><CircularProgress /></Box>;
    if (error) return <Box p={5}><Alert severity="error">{error}</Alert></Box>;
    if (!request) return null;

    const { stats, lines } = processedData;
    const fmtTime = (t) => t ? t.substring(0, 5) : '';

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 8 }}>

            {/* ZONE A: HEADER */}
            <Box mb={3}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/overtime-request')}
                            size="small"
                            sx={{ color: 'text.secondary' }}
                        >
                            Back to List
                        </Button>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={7}>
                            <Typography variant="overline" color="textSecondary" sx={{ letterSpacing: 1 }}>
                                {request.departmentName}
                            </Typography>

                            <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.main">
                                Overtime Request #{request.id}
                            </Typography>

                            <Stack spacing={2} sx={{ mt: 2 }}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Chip
                                        icon={<CalendarTodayIcon />}
                                        label={<Typography variant="subtitle1" fontWeight="bold">{request.overtimeDate}</Typography>}
                                        color="primary" variant="outlined" sx={{ px: 1 }}
                                    />
                                    <Chip
                                        icon={<AccessTimeIcon />}
                                        label={`${fmtTime(request.startTime)} - ${fmtTime(request.endTime)} (${request.overtimeTime}h)`}
                                        variant="outlined"
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="textSecondary">Requested by</Typography>
                                    <Typography variant="subtitle1" fontWeight="medium">{request.factoryManagerName}</Typography>
                                </Box>

                                {/* ADDED DETAILS SECTION */}
                                {request.details && (
                                    <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 1, borderLeft: '4px solid #1976d2', mt: 1 }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                            <DescriptionIcon fontSize="small" color="action" />
                                            <Typography variant="subtitle2" fontWeight="bold">Request Reason:</Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {request.details}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Grid>

                        <Grid item xs={12} md={5}>
                            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', pl: { md: 4 }, borderLeft: { md: '1px solid #eee' } }}>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom align="center">
                                    CURRENT STATUS
                                </Typography>
                                <RequestStatusTracker status={request.status} />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>

            {/* ZONE B: HEALTH CHECK */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard title="Total Demand" value={stats.totalDemand} subtitle={<Typography variant="body2" color="textSecondary">Required Employees</Typography>} icon={<GroupIcon />} color="#1976d2" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard title="Current Supply" value={stats.totalSupply} subtitle={<Typography variant="body2" color="textSecondary">Accepted Employees</Typography>} icon={<AssignmentTurnedInIcon />} color={stats.totalSupply >= stats.totalDemand ? "#2e7d32" : "#ed6c02"} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Pending Review"
                        value={stats.pendingTickets}
                        subtitle={<Typography variant="body2" color="textSecondary">Tickets waiting action</Typography>}
                        icon={<PendingActionsIcon />}
                        color={stats.pendingTickets > 0 ? "#d32f2f" : "#9e9e9e"}
                        onClick={stats.pendingTickets > 0 ? handlePendingCardClick : undefined}
                    />
                </Grid>
            </Grid>

            {/* ZONE C: TABS & CONTENT */}
            <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, p: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
                        <Tab icon={<ViewListIcon />} label="Line Coverage" iconPosition="start" />
                        <Tab icon={<TableChartIcon />} label="Ticket Management" iconPosition="start" />
                    </Tabs>
                </Box>

                {/* TAB 1: LINE COVERAGE */}
                {tabValue === 0 && (
                    <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Drill down by line to see coverage gaps. <strong>Only valid tickets count towards the total.</strong>
                        </Typography>
                        {lines.map((line) => {
                            const isFull = line.staffed >= line.required;
                            const statusColor = isFull ? 'success.main' : (line.staffed === 0 ? 'error.main' : 'warning.main');

                            return (
                                <Accordion
                                    key={line.id}
                                    sx={{ mb: 1, border: '1px solid #eee', '&:before': { display: 'none' } }}
                                    expanded={expandedAccordion === line.id}
                                    onChange={handleAccordionChange(line.id)}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box display="flex" width="100%" alignItems="center" justifyContent="space-between" pr={2}>
                                            <Typography variant="subtitle1" fontWeight="bold">{line.name}</Typography>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Typography variant="body2" sx={{ color: statusColor, fontWeight: 'bold' }}>
                                                    {line.staffed} / {line.required} Filled
                                                </Typography>
                                                <LinearProgress variant="determinate" value={Math.min((line.staffed/line.required)*100, 100)} sx={{ width: 100, height: 8, borderRadius: 4 }} color={isFull ? "success" : "warning"} />
                                            </Box>
                                        </Box>
                                    </AccordionSummary>

                                    <AccordionDetails sx={{ bgcolor: '#fafafa', p: 0 }}>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell><strong>Ticket Source</strong></TableCell>
                                                        <TableCell><strong>Manager</strong></TableCell>
                                                        <TableCell><strong>Status</strong></TableCell>
                                                        <TableCell align="right"><strong>Contribution</strong></TableCell>
                                                        <TableCell align="right"><strong>Actions</strong></TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {line.tickets.length === 0 ? (
                                                        <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>No tickets submitted for this line yet.</TableCell></TableRow>
                                                    ) : (
                                                        line.tickets.map((ticket) => (
                                                            <TableRow key={ticket.ticketId}>
                                                                <TableCell>Ticket #{ticket.ticketId}</TableCell>
                                                                <TableCell>{ticket.managerName}</TableCell>
                                                                <TableCell><TicketStatusChip status={ticket.status} /></TableCell>
                                                                <TableCell align="right"><Chip label={`+${ticket.contribution}`} size="small" variant="outlined" /></TableCell>
                                                                <TableCell align="right">
                                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                                        <Tooltip title="View List"><IconButton size="small" onClick={() => handleViewEmployees(ticket.employees)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                                                                        {ticket.status === 'submitted' && (
                                                                            <>
                                                                                <Tooltip title="Confirm"><IconButton color="success" size="small" onClick={() => handleConfirm(ticket.ticketId)}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
                                                                                <Tooltip title="Reject"><IconButton color="error" size="small" onClick={() => handleRejectClick(ticket.ticketId)}><CancelIcon fontSize="small" /></IconButton></Tooltip>
                                                                            </>
                                                                        )}
                                                                    </Stack>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}
                    </Box>
                )}

                {/* TAB 2: TICKET MANAGEMENT */}
                {tabValue === 1 && (
                    <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Manage all submitted tickets in a single list.
                        </Typography>
                        <RequestTicketList request={request} />
                    </Box>
                )}
            </Box>

            {/* MODALS */}
            <Dialog open={employeeModalOpen} onClose={() => setEmployeeModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Employee List <IconButton onClick={() => setEmployeeModalOpen(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    <EmployeeListTable employees={selectedEmployeeList} />
                </DialogContent>
            </Dialog>

            <ActionReasonModal
                open={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onSubmit={handleRejectSubmit}
                title="Reject Ticket"
                label="Reason for Rejection"
                submitText="Reject Ticket"
                submitColor="error"
            />
        </Container>
    );
}