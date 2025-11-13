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
    Collapse,
    Chip,
    colors,
    Button,
    ButtonGroup,
    Stack
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import {visuallyHidden} from '@mui/utils';

// --- HeadCells for Factory Manager's Embedded View ---
const headCells = [
    {id: 'id', label: 'Ticket ID', numeric: false, width: '10%'},
    {id: 'managerName', label: 'Manager', numeric: false, width: '10%'},
    {id: 'createdAt', label: 'Created At', numeric: false, width: '15%'},
    {id: 'overtimeTime', label: 'Overtime (h)', numeric: true, width: '10%'},
    {id: 'status', label: 'Status', numeric: false, width: '10%'},
];

function EnhancedTableHead(props) {
    const {order, orderBy, onRequestSort} = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow sx={{
                "& th": {
                    fontWeight: 'bold',
                    backgroundColor: colors.blue[100],
                }
            }}>
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
                {/* Manual Actions Column Header */}
                <TableCell align="center" sx={{width: '15%'}}>Actions</TableCell>
            </TableRow>
        </TableHead>
    );
}

function TicketRow(props) {
    const {ticket, isExpanded, onToggle, onAction} = props;

    const getStatusChip = (status) => {
        let color;
        let label = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Unknown';
        switch (status) {
            case 'pending': color = 'warning'; break;
            case 'confirmed': color = 'info'; break;
            case 'approved': color = 'success'; break;
            case 'rejected': color = 'error'; break;
            default: color = 'default';
        }
        return <Chip label={label} color={color} size="small" sx={{minWidth: 90}}/>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString();
        } catch (e) {
            return dateString;
        }
    };

    const cellTruncateStyle = {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 0,
    };

    // A ticket can only be actioned if it's pending
    const isActionable = ticket.status === 'pending';

    return (
        <React.Fragment>
            <TableRow
                hover
                sx={{
                    '& > *': {borderBottom: 'unset'},
                }}
            >
                <TableCell
                    component="th"
                    scope="row"
                    sx={cellTruncateStyle}
                    onClick={onToggle}
                >
                    {ticket.id}
                </TableCell>
                <TableCell align="left" sx={cellTruncateStyle}>{ticket.managerName || 'N/A'}</TableCell>
                <TableCell align="left" sx={cellTruncateStyle}>{formatDate(ticket.createdAt)}</TableCell>
                <TableCell align="right">{ticket.overtimeTime || 0}</TableCell>
                <TableCell align="left">
                    {getStatusChip(ticket.status)}
                </TableCell>
                {/* Actions Cell */}
                <TableCell align="center">
                    <ButtonGroup size="small" variant="outlined" disabled={!isActionable}>
                        <Button
                            color="success"
                            onClick={() => onAction(ticket.id, 'confirm')}
                        >
                            Confirm
                        </Button>
                        <Button
                            color="error"
                            onClick={() => onAction(ticket.id, 'reject')}
                        >
                            Reject
                        </Button>
                    </ButtonGroup>
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{margin: 2, padding: 2, backgroundColor: 'grey.100', borderRadius: 2}}>
                            <Typography variant="h6" gutterBottom component="div">
                                Ticket Details
                            </Typography>
                            <Typography variant="body2" sx={{mb: 1}}>
                                <strong>Reason:</strong> {ticket.reason || 'No reason provided.'}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 1, wordBreak: 'break-all'}}>
                                <strong>Employee List:</strong> {ticket.employeeList || 'N/A'}
                            </Typography>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}


// --- Main List Component (Embedded Factory Manager View) ---
// This component expects to receive a `request` object as a prop
function RequestTicketList({ request }) {
    const [tickets, setTickets] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('id');

    const [statusFilter, setStatusFilter] = useState('');
    const [managerNameSearch, setManagerNameSearch] = useState('');
    const [debouncedManagerName, setDebouncedManagerName] = useState(managerNameSearch);

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

            const pageable = {
                page: 0,
                size: 100,
                sort: `${orderBy},${order}`
            };

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

    const handleExpandChange = (panelId) => {
        setExpanded(isExpanded => (isExpanded === panelId ? false : panelId));
    };

    const handleStatusChange = (event, newStatus) => {
        setStatusFilter(newStatus || '');
    };

    const handleSortRequest = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleTicketAction = async (ticketId, action) => {
        const newStatus = action === 'confirm' ? 'confirmed' : 'rejected';
        setTickets(prevTickets =>
            prevTickets.map(t =>
                t.id === ticketId ? { ...t, status: newStatus } : t
            )
        );

        try {
            if (action === 'confirm') {
                await confirmOvertimeTicket(ticketId);
            } else {
                await rejectOvertimeTicket(ticketId);
            }
            // TODO: show a success toast
        } catch (err) {
            setTickets(prevTickets =>
                prevTickets.map(t =>
                    t.id === ticketId ? { ...t, status: 'pending' } : t
                )
            );
            // TODO: show an error toast
            console.error(`Failed to ${action} ticket:`, err);
        }
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
            {/* --- Filter Bar --- */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems="center"
                sx={{ mb: 2 }}
            >
                <Typography
                    variant="h6"
                    component="h3"
                    sx={{fontWeight: 'bold', mr: 1, flexShrink: 0}}
                >
                    Associated Tickets
                </Typography>

                <TextField
                    id="managerSearch"
                    placeholder="Search by Manager..."
                    value={managerNameSearch}
                    onChange={e => setManagerNameSearch(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                        width: 240,
                        backgroundColor: 'white',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {borderRadius: 1}
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon/>
                            </InputAdornment>
                        ),
                    }}
                />

                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0}}>
                    <Typography variant="body2" sx={{fontWeight: 'medium'}}>
                        Status:
                    </Typography>
                    <Box sx={{backgroundColor: 'white', borderRadius: 1, overflow: 'hidden'}}>
                        <ToggleButtonGroup
                            value={statusFilter}
                            exclusive
                            onChange={handleStatusChange}
                            size="small"
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
            <Paper sx={{width: '100%', mb: 0, border: '1px solid', borderColor: 'grey.300'}}>
                <TableContainer>
                    <Table
                        aria-labelledby="ticketTableTitle"
                        size={"small"} // Small table for embedded view
                        sx={{
                            tableLayout: 'fixed',
                            width: '100%',
                            minWidth: '750px',
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
                                    <TableCell colSpan={6} align="center" sx={{py: 4}}>
                                        <Typography variant="body1" color="text.secondary">
                                            No tickets found for this request.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.map((ticket) => (
                                    <TicketRow
                                        key={ticket.id}
                                        ticket={ticket}
                                        isExpanded={expanded === ticket.id}
                                        onToggle={() => handleExpandChange(ticket.id)}
                                        onAction={handleTicketAction}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}

export default RequestTicketList;