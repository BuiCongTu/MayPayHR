import React, {useState, useEffect} from 'react';
import {
    getFilteredOvertimeTickets,
    approveOvertimeTicket,
    rejectOvertimeTicket
} from "../../../services/moduleB/overtimeService";

import {
    Box, Paper, TextField, InputAdornment, ToggleButton, ToggleButtonGroup,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TableSortLabel, Chip, colors, Stack, Dialog, DialogTitle,
    DialogContent, Tooltip, IconButton
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedIcon from '@mui/icons-material/Verified';
import VisibilityIcon from '@mui/icons-material/Visibility';

import {visuallyHidden} from '@mui/utils';
import EmployeeListTable from './EmployeeList';
import ActionReasonModal from './ActionReasonModal';

const headCells = [
    {id: 'id', label: 'ID', numeric: false, width: '10%'},
    {id: 'manager.fullName', label: 'Manager', numeric: false, width: '20%'},
    {id: 'employeeList', label: 'Empl #', numeric: false, width: '15%'},
    {id: 'status', label: 'Status', numeric: false, width: '15%'},
    {id: 'actions', label: 'Actions', numeric: false, width: '15%'},
];

function EnhancedTableHead(props) {
    const {order, orderBy, onRequestSort} = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow sx={{"& th": {fontWeight: 'bold', backgroundColor: colors.blue[100]}}}>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        sx={{ width: headCell.width }}
                        align={headCell.numeric ? 'right' : 'left'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                            disabled={headCell.id === 'actions' || headCell.id === 'employeeList' || headCell.id === 'status'}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

// Updated Prop definition: added 'onRefresh'
function RequestTicketList({request, onRefresh}) {
    const [tickets, setTickets] = useState([]);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('id');

    const [statusFilter, setStatusFilter] = useState('');
    const [managerNameSearch, setManagerNameSearch] = useState('');
    const [debouncedManagerName, setDebouncedManagerName] = useState(managerNameSearch);

    // Modals
    const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    // Reject Modal
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [ticketToReject, setTicketToReject] = useState(null);

    // Approve Modal (NEW)
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [ticketToApprove, setTicketToApprove] = useState(null);

    const requestId = request?.id;

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedManagerName(managerNameSearch);
        }, 500);
        return () => clearTimeout(handler);
    }, [managerNameSearch]);

    useEffect(() => {
        async function loadData() {
            if (!requestId) {
                setTickets([]);
                return;
            }
            const filter = {
                requestId: requestId,
                status: statusFilter || null,
                managerName: debouncedManagerName || null,
            };
            const pageable = {page: 0, size: 100, sort: `${orderBy},${order}`};
            try {
                const data = await getFilteredOvertimeTickets(filter, pageable);
                const allTickets = data?.content || [];
                const visibleTickets = allTickets.filter(ticket => ticket.status !== 'pending');
                setTickets(visibleTickets);
            } catch (err) {
                console.error("Failed to fetch tickets", err);
                setTickets([]);
            }
        }

        loadData();
    }, [requestId, statusFilter, debouncedManagerName, order, orderBy]);

    const handleStatusChange = (event, newStatus) => {
        setStatusFilter(newStatus || '');
    };

    const handleSortRequest = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // --- Actions ---
    const handleOpenEmployeeModal = (employees) => {
        setSelectedEmployees(employees || []);
        setEmployeeModalOpen(true);
    };

    // Open Approve Modal
    const handleApproveClick = (ticket) => {
        setTicketToApprove(ticket);
        setApproveModalOpen(true);
    };

    // Submit Approve
    const handleApproveSubmit = async (reason) => {
        if (!ticketToApprove) return;
        try {
            await approveOvertimeTicket(ticketToApprove.id, reason);
            setTickets(prev => prev.map(t => t.id === ticketToApprove.id ? {...t, status: 'approved'} : t));
            setApproveModalOpen(false);
            setTicketToApprove(null);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmitRejection = async (reason) => {
        if (!ticketToReject) return;
        try {
            await rejectOvertimeTicket(ticketToReject.id, reason);
            setTickets(prev => prev.map(t => t.id === ticketToReject.id ? {...t, status: 'rejected', reason} : t));
            setRejectModalOpen(false);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusChip = (status) => {
        let color;
        let label = status ? status.toUpperCase() : 'UNKNOWN';
        switch (status?.toLowerCase()) {
            case 'pending':
                color = 'warning';
                break;
            case 'submitted':
                color = 'info';
                break;
            case 'approved':
                color = 'success';
                break;
            case 'rejected':
                color = 'error';
                break;
            default:
                color = 'default';
        }
        return <Chip label={label} color={color} size="small" sx={{minWidth: 90, fontWeight: 'bold'}}/>;
    };

    const getScopeText = (employeeList) => {
        if(!employeeList) return "0 Employees";
        const count = employeeList.length;
        return `${count} Employee${count !== 1 ? 's' : ''}`;
    }

    return (
        <Box sx={{ mt: 1 }}>
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} alignItems="center" sx={{mb: 2}}>
                <TextField
                    placeholder="Search Manager..."
                    value={managerNameSearch}
                    onChange={e => setManagerNameSearch(e.target.value)}
                    variant="outlined" size="small"
                    sx={{width: 240, backgroundColor: 'white'}}
                    InputProps={{startAdornment: (<InputAdornment position="start"><SearchIcon/></InputAdornment>)}}
                />
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0}}>
                    <ToggleButtonGroup value={statusFilter} exclusive onChange={handleStatusChange} size="small" sx={{bgcolor: 'white'}}>
                        <ToggleButton value="">All</ToggleButton>
                        <ToggleButton value="submitted">Submitted</ToggleButton>
                        <ToggleButton value="approved">Approved</ToggleButton>
                        <ToggleButton value="rejected">Rejected</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Stack>

            <Paper sx={{width: '100%', mb: 0, border: '1px solid', borderColor: 'grey.300', overflow: 'hidden'}}>
                <TableContainer>
                    <Table size="small" sx={{width: '100%', tableLayout: 'fixed'}}>
                        <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleSortRequest}/>
                        <TableBody>
                            {tickets.length === 0 ? (
                                <TableRow><TableCell colSpan={headCells.length} align="center" sx={{py: 4}}>No tickets found.</TableCell></TableRow>
                            ) : (
                                tickets.map((ticket) => {
                                    const isActionable = ticket.status === 'submitted';

                                    return (
                                        <TableRow hover key={ticket.id}>
                                            <TableCell>#{ticket.id}</TableCell>
                                            <TableCell>{ticket.managerName || 'N/A'}</TableCell>
                                            <TableCell>{getScopeText(ticket.employeeList)}</TableCell>
                                            <TableCell>{getStatusChip(ticket.status)}</TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1}>
                                                    <Tooltip title="View List">
                                                        <IconButton size="small" onClick={() => handleOpenEmployeeModal(ticket.employeeList)}>
                                                            <VisibilityIcon fontSize="small"/>
                                                        </IconButton>
                                                    </Tooltip>

                                                    {isActionable && (
                                                        <>
                                                            <Tooltip title="Approve">
                                                                <IconButton color="success" onClick={() => handleApproveClick(ticket)} size="small">
                                                                    <VerifiedIcon fontSize="small"/>
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Reject">
                                                                <IconButton color="error" onClick={() => {
                                                                    setTicketToReject(ticket);
                                                                    setRejectModalOpen(true);
                                                                }} size="small">
                                                                    <CloseIcon fontSize="small"/>
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* EMPLOYEES MODAL */}
            <Dialog open={employeeModalOpen} onClose={() => setEmployeeModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Ticket Employees
                    <IconButton onClick={() => setEmployeeModalOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    <EmployeeListTable employees={selectedEmployees} />
                </DialogContent>
            </Dialog>

            {/* REJECT MODAL */}
            <ActionReasonModal
                open={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onSubmit={handleSubmitRejection}
                title="Reject Ticket"
                label="Reason for Rejection"
                submitText="Reject Ticket"
                submitColor="error"
            />

            {/* APPROVE MODAL */}
            <ActionReasonModal
                open={approveModalOpen}
                onClose={() => setApproveModalOpen(false)}
                onSubmit={handleApproveSubmit}
                title="Approve Ticket"
                label="Reason or Approval Note"
                submitText="Approve"
                submitColor="success"
            />
        </Box>
    );
}

export default RequestTicketList;