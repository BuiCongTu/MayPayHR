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
    {id: 'managerName', label: 'Manager', numeric: false, width: '15%'},
    {id: 'employeeList', label: 'Employees', numeric: false, width: '15%'},
    {id: 'reason', label: 'Reason', numeric: false, width: '20%'},
    {id: 'status', label: 'Status', numeric: false, width: '10%'},
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
                            width: headCell.width, // Use percentage width
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
                            // 'overtimeTime' removed from disabled list as it's gone
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

// --- Main List Component (Embedded Factory Manager View) ---
function RequestTicketList({request}) {
    const [tickets, setTickets] = useState([]);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('id');

    const [statusFilter, setStatusFilter] = useState('');
    const [managerNameSearch, setManagerNameSearch] = useState('');
    const [debouncedManagerName, setDebouncedManagerName] = useState(managerNameSearch);

    // --- State for Modals ---
    const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [ticketToReject, setTicketToReject] = useState(null);

    const requestId = request?.id;

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedManagerName(managerNameSearch);
        }, 500);
        return () => clearTimeout(handler);
    }, [managerNameSearch]);

    // Main data fetching effect
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
                setTickets(data?.content || []);
            } catch (err) {
                console.error("Failed to fetch overtime tickets", err);
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

    // --- Modal Handlers ---
    const handleOpenEmployeeModal = (employees) => {
        setSelectedEmployees(employees || []);
        setEmployeeModalOpen(true);
    };
    const handleCloseEmployeeModal = () => {
        setEmployeeModalOpen(false);
    };

    const handleOpenRejectModal = (ticket) => {
        setTicketToReject(ticket);
        setRejectModalOpen(true);
    };
    const handleCloseRejectModal = () => {
        setTicketToReject(null);
        setRejectModalOpen(false);
    };

    // --- Action Handlers ---
    const handleConfirm = async (ticketId) => {
        try {
            await confirmOvertimeTicket(ticketId);
            setTickets(prev =>
                prev.map(t =>
                    t.id === ticketId ? {...t, status: 'confirmed', reason: null} : t
                )
            );
            // TODO: show a success toast
        } catch (err) {
            console.error(`Failed to confirm ticket:`, err);
            // TODO: show an error toast
        }
    };

    const handleSubmitRejection = async (reason) => {
        if (!ticketToReject) return;

        try {
            await rejectOvertimeTicket(ticketToReject.id, reason);
            setTickets(prev =>
                prev.map(t =>
                    t.id === ticketToReject.id
                        ? {...t, status: 'rejected', reason: reason}
                        : t
                )
            );
            handleCloseRejectModal();
            // TODO: show a success toast
        } catch (err) {
            console.error(`Failed to reject ticket:`, err);
            // TODO: show an error toast (the modal will close, so a snackbar is ideal)
        }
    };

    // --- Helper Functions ---
    const getStatusChip = (status) => {
        let color;
        let label = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Unknown';
        switch (status) {
            case 'pending':
                color = 'warning';
                break;
            case 'confirmed':
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
        return <Chip label={label} color={color} size="small" sx={{minWidth: 70}}/>;
    };

    const cellTruncateStyle = {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    };

    return (
        <Box sx={{
            my: 2, p: 2, border: '1px solid',
            borderColor: 'grey.300', borderRadius: 2, backgroundColor: 'grey.50'
        }}>
            {/* --- Filter Bar --- */}
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} alignItems="center" sx={{mb: 2}}>
                <Typography variant="h6" component="h3" sx={{fontWeight: 'bold', mr: 1, flexShrink: 0}}>
                    Associated Tickets
                </Typography>
                <TextField
                    id="managerSearch"
                    placeholder="Search by Manager..."
                    value={managerNameSearch}
                    onChange={e => setManagerNameSearch(e.target.value)}
                    variant="outlined" size="small"
                    sx={{
                        width: 240, backgroundColor: 'white', borderRadius: 1,
                        '& .MuiOutlinedInput-root': {borderRadius: 1}
                    }}
                    InputProps={{
                        startAdornment: (<InputAdornment position="start"><SearchIcon/></InputAdornment>),
                    }}
                />
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0}}>
                    <Typography variant="body2" sx={{fontWeight: 'medium'}}>Status:</Typography>
                    <Box sx={{backgroundColor: 'white', borderRadius: 1, overflow: 'hidden'}}>
                        <ToggleButtonGroup
                            value={statusFilter} exclusive onChange={handleStatusChange} size="small"
                        >
                            <ToggleButton value="">All</ToggleButton>
                            <ToggleButton value="pending">Pending</ToggleButton>
                            <ToggleButton value="confirmed">Confirmed</ToggleButton>
                            <ToggleButton value="approved">Approved</ToggleButton>
                            <ToggleButton value="rejected">Rejected</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>
            </Stack>

            {/* --- Table Section --- */}
            <Paper sx={{width: '100%', mb: 0, border: '1px solid', borderColor: 'grey.300', overflow: 'hidden'}}>
                <TableContainer>
                    <Table
                        aria-labelledby="ticketTableTitle"
                        size={"small"}
                        sx={{
                            width: '100%',
                            tableLayout: 'fixed'
                        }}
                    >
                        <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleSortRequest}
                        />
                        <TableBody>
                            {tickets.length === 0 ? (
                                <TableRow>
                                    {/* --- MODIFIED colSpan --- */}
                                    <TableCell colSpan={headCells.length} align="center" sx={{py: 4}}>
                                        <Typography variant="body1" color="text.secondary">
                                            No tickets found for this request.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.map((ticket) => {
                                    const isActionable = ticket.status === 'pending';

                                    // Calculate employee acceptance status
                                    const totalEmployees = ticket.employeeList?.length || 0;
                                    const acceptedEmployees = ticket.employeeList?.filter(
                                        emp => emp.status === 'ok'
                                    ).length || 0;

                                    return (
                                        <TableRow hover key={ticket.id}>
                                            <TableCell sx={cellTruncateStyle}>{ticket.id}</TableCell>
                                            <TableCell sx={cellTruncateStyle}>{ticket.managerName || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    onClick={() => handleOpenEmployeeModal(ticket.employeeList)}
                                                    sx={{p: 0.5, minWidth: 'auto'}} // Smaller button
                                                >
                                                    {/* Shows X / Y OK */}
                                                    View ({acceptedEmployees} / {totalEmployees} OK)
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={ticket.reason || ''} arrow>
                                                    <Box sx={cellTruncateStyle}>
                                                        {ticket.reason || 'N/A'}
                                                    </Box>
                                                </Tooltip>
                                            </TableCell>

                                            {/* --- 'overtimeTime' TableCell REMOVED --- */}

                                            <TableCell>{getStatusChip(ticket.status)}</TableCell>
                                            <TableCell align="center">
                                                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                                    <Tooltip title="Confirm" arrow>
                                                        <span>
                                                            <IconButton
                                                                color="success"
                                                                onClick={() => handleConfirm(ticket.id)}
                                                                disabled={!isActionable}
                                                                size="small"
                                                            >
                                                                <CheckIcon/>
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="Reject" arrow>
                                                        <span>
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => handleOpenRejectModal(ticket)}
                                                                disabled={!isActionable}
                                                                size="small"
                                                            >
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

            {/* --- Employee List Modal --- */}
            <Dialog
                open={employeeModalOpen}
                onClose={handleCloseEmployeeModal}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{m: 0, p: 2}}>
                    Employee List
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseEmployeeModal}
                        sx={{position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500]}}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{p: 0}}>
                    <ViewOnlyEmployeeList employees={selectedEmployees}/>
                </DialogContent>
            </Dialog>

            {/* --- Rejection Reason Modal --- */}
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