import React, {useState, useEffect} from 'react';
import {
    getFilteredOvertimeTickets,
    confirmOvertimeTicket,
    rejectOvertimeTicket
} from "../../../services/moduleB/overtimeService";

import {
    Box,
    Typography,
    Paper,
    TextField,
    InputAdornment,
    ToggleButton,
    ToggleButtonGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Chip,
    colors,
    Button,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    Tooltip,
    IconButton
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

import {visuallyHidden} from '@mui/utils';
import ViewOnlyEmployeeList from './ViewOnlyEmployeeList';
import ActionReasonModal from './ActionReasonModal';

const headCells = [
    {id: 'id', label: 'Ticket ID', numeric: false, width: '10%'},
    {id: 'manager.fullName', label: 'Manager Name', numeric: false, width: '20%'},
    {id: 'employeeList', label: 'Employees', numeric: false, width: '15%'},
    {id: 'reason', label: 'Reason', numeric: false, width: '20%'},
    {id: 'status', label: 'Status', numeric: false, width: '15%'},
    {id: 'actions', label: 'Actions', numeric: false, width: '10%'},
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
                        sx={{
                            width: headCell.width,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                        align={headCell.numeric ? 'right' : 'left'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                            disabled={headCell.id === 'actions' || headCell.id === 'employeeList'}
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

function RequestTicketList({request}) {
    const [tickets, setTickets] = useState([]);
    // [RESTORED] Sorting State
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('id');

    const [statusFilter, setStatusFilter] = useState('');
    const [managerNameSearch, setManagerNameSearch] = useState('');
    const [debouncedManagerName, setDebouncedManagerName] = useState(managerNameSearch);

    // Modals
    const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [ticketToReject, setTicketToReject] = useState(null);

    const requestId = request?.id;

    // Debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedManagerName(managerNameSearch);
        }, 500);
        return () => clearTimeout(handler);
    }, [managerNameSearch]);

    // Fetch Data
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
            // [RESTORED] Sorting param
            const pageable = {page: 0, size: 100, sort: `${orderBy},${order}`};
            try {
                const data = await getFilteredOvertimeTickets(filter, pageable);
                setTickets(data?.content || []);
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

    // [RESTORED] Sorting Handler
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
    const handleCloseEmployeeModal = () => setEmployeeModalOpen(false);

    const handleOpenRejectModal = (ticket) => {
        setTicketToReject(ticket);
        setRejectModalOpen(true);
    };
    const handleCloseRejectModal = () => {
        setTicketToReject(null);
        setRejectModalOpen(false);
    };

    const handleConfirm = async (ticketId) => {
        try {
            await confirmOvertimeTicket(ticketId);
            setTickets(prev => prev.map(t => t.id === ticketId ? {...t, status: 'confirmed'} : t));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmitRejection = async (reason) => {
        if (!ticketToReject) return;
        try {
            await rejectOvertimeTicket(ticketToReject.id, reason);
            setTickets(prev => prev.map(t => t.id === ticketToReject.id ? {...t, status: 'rejected', reason} : t));
            handleCloseRejectModal();
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
                label = 'VOTING';
                break;
            case 'submitted':
                color = 'info';
                label = 'SUBMITTED';
                break;
            case 'confirmed':
                color = 'primary';
                label = 'WAITING FD';
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
        return <Chip label={label} color={color} size="small" sx={{minWidth: 70, fontWeight: 'bold'}}/>;
    };

    const cellTruncateStyle = {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    };

    return (
        <Box sx={{
            my: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 2,
            backgroundColor: 'grey.50'
        }}>
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} alignItems="center" sx={{mb: 2}}>
                <Typography variant="h6" component="h3" sx={{fontWeight: 'bold', mr: 1, flexShrink: 0}}>
                    Associated Tickets
                </Typography>
                <TextField
                    placeholder="Search by Manager..."
                    value={managerNameSearch}
                    onChange={e => setManagerNameSearch(e.target.value)}
                    variant="outlined" size="small"
                    sx={{width: 240, backgroundColor: 'white'}}
                    InputProps={{startAdornment: (<InputAdornment position="start"><SearchIcon/></InputAdornment>)}}
                />
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0}}>
                    <Typography variant="body2" sx={{fontWeight: 'medium'}}>Status:</Typography>
                    <ToggleButtonGroup value={statusFilter} exclusive onChange={handleStatusChange} size="small"
                                       sx={{bgcolor: 'white'}}>
                        <ToggleButton value="">All</ToggleButton>
                        <ToggleButton value="submitted">Submitted</ToggleButton>
                        <ToggleButton value="confirmed">Confirmed</ToggleButton>
                        <ToggleButton value="approved">Approved</ToggleButton>
                        <ToggleButton value="rejected">Rejected</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Stack>

            <Paper sx={{width: '100%', mb: 0, border: '1px solid', borderColor: 'grey.300', overflow: 'hidden'}}>
                <TableContainer>
                    <Table aria-labelledby="ticketTableTitle" size={"small"} sx={{width: '100%', tableLayout: 'fixed'}}>
                        <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleSortRequest}/>
                        <TableBody>
                            {tickets.length === 0 ? (
                                <TableRow><TableCell colSpan={headCells.length} align="center" sx={{py: 4}}>No tickets
                                    found.</TableCell></TableRow>
                            ) : (
                                tickets.map((ticket) => {
                                    const isActionable = ticket.status === 'submitted';

                                    const totalEmployees = ticket.employeeList?.length || 0;
                                    const acceptedEmployees = ticket.employeeList?.filter(emp => emp.status === 'accepted').length || 0;

                                    return (
                                        <TableRow hover key={ticket.id}>
                                            <TableCell sx={cellTruncateStyle}>{ticket.id}</TableCell>
                                            <TableCell sx={cellTruncateStyle}>{ticket.managerName || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Button size="small" variant="text"
                                                        onClick={() => handleOpenEmployeeModal(ticket.employeeList)}
                                                        sx={{p: 0.5, minWidth: 'auto'}}>
                                                    {acceptedEmployees} / {totalEmployees} Accepted
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={ticket.reason || ''} arrow>
                                                    <Box sx={cellTruncateStyle}>{ticket.reason || 'N/A'}</Box>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>{getStatusChip(ticket.status)}</TableCell>
                                            <TableCell align="center">
                                                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                                    <Tooltip title="Confirm" arrow>
                                                        <span>
                                                            <IconButton color="success"
                                                                        onClick={() => handleConfirm(ticket.id)}
                                                                        disabled={!isActionable} size="small">
                                                                <CheckIcon/>
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="Reject" arrow>
                                                        <span>
                                                            <IconButton color="error"
                                                                        onClick={() => handleOpenRejectModal(ticket)}
                                                                        disabled={!isActionable} size="small">
                                                                <CloseIcon/>
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={employeeModalOpen} onClose={handleCloseEmployeeModal} maxWidth="md" fullWidth>
                <DialogTitle sx={{m: 0, p: 2}}>
                    Employee List
                    <IconButton onClick={handleCloseEmployeeModal} sx={{position: 'absolute', right: 8, top: 8}}>
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{p: 0}}>
                    <ViewOnlyEmployeeList employees={selectedEmployees}/>
                </DialogContent>
            </Dialog>

            <ActionReasonModal
                open={rejectModalOpen}
                onClose={handleCloseRejectModal}
                onSubmit={handleSubmitRejection}
                title="Reason for Rejection"
                label="Rejection Reason"
                submitText="Submit Rejection"
                submitColor="error"
            />
        </Box>
    );
}

export default RequestTicketList;