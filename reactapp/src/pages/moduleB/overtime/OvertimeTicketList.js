import React, {useState, useEffect} from 'react';
import {getFilteredOvertimeTickets} from "../../../services/moduleB/overtimeService";
import {useNavigate} from "react-router-dom";

import {
    Box,
    Typography,
    Button,
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
    colors
} from '@mui/material';

// Import MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import {visuallyHidden} from '@mui/utils';
import EmployeeListTable from './EmployeeList';

//TODO: Replace this with your actual auth context hook
const useAuth = () => {
    // This is a mock. Replace it.
    return {user: {id: 199050002}}; //user with role Manager
};
// -----------------------------


// --- HeadCells for Manager's Standalone View ---
const headCells = [
    {id: 'id', label: 'Ticket ID', numeric: false, width: '15%'},
    {id: 'overtimeRequest.factoryManager.fullName', label: 'Requested By', numeric: false, width: '15%'},
    {id: 'confirmedBy.fullName', label: 'Confirmed By', numeric: false, width: '15%'},
    {id: 'approvedBy.fullName', label: 'Approved By', numeric: false, width: '15%'},
    // {id: 'overtimeTime', label: 'Overtime (h)', numeric: true, width: '10%'},
    {id: 'status', label: 'Status', numeric: false, width: '15%'},
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
                    backgroundColor: colors.blue[50],
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
            </TableRow>
        </TableHead>
    );
}

function TicketRow(props) {
    const {ticket, isExpanded, onToggle} = props;

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
        return <Chip label={label} color={color} size="small" sx={{minWidth: 90}}/>;
    };

    const cellTruncateStyle = {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 0,
    };

    return (
        <React.Fragment>
            <TableRow
                hover
                onClick={onToggle}
                sx={{
                    '& > *': {borderBottom: 'unset'},
                    cursor: 'pointer'
                }}
            >
                <TableCell component="th" scope="row" sx={cellTruncateStyle}>
                    {ticket.id}
                </TableCell>
                <TableCell align="left" sx={cellTruncateStyle}>
                    {ticket.requesterName || 'N/A'}
                </TableCell>
                <TableCell align="left" sx={cellTruncateStyle}>
                    {ticket.confirmedByName || 'N/A'}
                </TableCell>
                <TableCell align="left" sx={cellTruncateStyle}>
                    {ticket.approvedByName || 'N/A'}
                </TableCell>
                {/*<TableCell align="right">{ticket.overtimeTime || 0}</TableCell>*/}
                <TableCell align="left">
                    {getStatusChip(ticket.status)}
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
                                <strong>Request ID:</strong> {ticket.requestId || 'N/A'}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 1}}>
                                <strong>Reason:</strong> {ticket.reason || 'No reason provided.'}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 1}}>
                                <strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleString() || 'N/A'}
                            </Typography>

                            <Typography variant="body2" sx={{mb: 0.5, fontWeight: 'bold'}}>
                                Employee List:
                            </Typography>
                            <EmployeeListTable employees={ticket.employeeList}/>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}


// --- Main List Component (Standalone Manager View) ---
function OvertimeTicketList() {
    const [tickets, setTickets] = useState([]);
    const [page, setPage] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('id');

    const [statusFilter, setStatusFilter] = useState('');
    const [requesterNameSearch, setRequesterNameSearch] = useState('');
    const [confirmedByNameSearch, setConfirmedByNameSearch] = useState('');
    const [approvedByNameSearch, setApprovedByNameSearch] = useState('');

    // --- Debounced values for searching ---
    const [debouncedRequester, setDebouncedRequester] = useState(requesterNameSearch);
    const [debouncedConfirmed, setDebouncedConfirmed] = useState(confirmedByNameSearch);
    const [debouncedApproved, setDebouncedApproved] = useState(approvedByNameSearch);

    //TODO: Replace this with your actual auth context hook
    const {user: currentUser} = useAuth();

    // Debounce search inputs
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedRequester(requesterNameSearch);
            setDebouncedConfirmed(confirmedByNameSearch);
            setDebouncedApproved(approvedByNameSearch);
            setPage(0);
        }, 500);
        return () => clearTimeout(handler);
    }, [requesterNameSearch, confirmedByNameSearch, approvedByNameSearch]);

    // Main data fetching effect
    useEffect(() => {
        async function loadData() {
            if (!currentUser?.id) return;

            const filter = {
                managerId: currentUser.id,

                // Filters from the UI
                status: statusFilter || null,
                requesterName: debouncedRequester || null,
                confirmedByName: debouncedConfirmed || null,
                approvedByName: debouncedApproved || null,
            };

            const pageable = {
                page,
                size: 10,
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
    }, [page, statusFilter, debouncedRequester, debouncedConfirmed, debouncedApproved, order, orderBy, currentUser?.id]);

    const handleExpandChange = (panelId) => {
        setExpanded(isExpanded => (isExpanded === panelId ? false : panelId));
    };

    const handleStatusChange = (event, newStatus) => {
        setStatusFilter(newStatus || '');
        setPage(0);
    };

    const handleSortRequest = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
        setPage(0);
    };

    const commonSearchFieldProps = {
        variant: "outlined",
        size: "small",
        sx: {
            width: 250,
            backgroundColor: 'white',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {borderRadius: 1}
        },
        InputProps: {
            startAdornment: (
                <InputAdornment position="start">
                    <SearchIcon/>
                </InputAdornment>
            ),
        }
    };

    return (
        <Box>
            <Paper
                elevation={1}
                sx={{
                    p: 2,
                    mb: 4,
                    bgcolor: 'grey.50',
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <Typography
                    variant="h5"
                    component="h2"
                    sx={{fontWeight: 'bold', mr: 1, width: '100%'}}
                >
                    My Overtime Tickets
                </Typography>

                {/* --- Updated Search Fields --- */}
                <TextField
                    id="requesterSearch"
                    placeholder="Search by Requester..."
                    value={requesterNameSearch}
                    onChange={e => setRequesterNameSearch(e.target.value)}
                    {...commonSearchFieldProps}
                />
                <TextField
                    id="confirmedBySearch"
                    placeholder="Search by Confirmed By..."
                    value={confirmedByNameSearch}
                    onChange={e => setConfirmedByNameSearch(e.target.value)}
                    {...commonSearchFieldProps}
                />
                <TextField
                    id="approvedBySearch"
                    placeholder="Search by Approved By..."
                    value={approvedByNameSearch}
                    onChange={e => setApprovedByNameSearch(e.target.value)}
                    {...commonSearchFieldProps}
                />

                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <Typography variant="body2" sx={{fontWeight: 'medium', ml: 1}}>
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

                <Box sx={{flexGrow: 1}}/>

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon/>}
                    onClick={() => navigate("/overtime-ticket/create")}
                    sx={{minWidth: 'auto'}}
                >
                    Create
                </Button>
            </Paper>

            {/* --- Table Section --- */}
            <Paper sx={{width: '100%', mb: 2}}>
                <TableContainer>
                    <Table
                        aria-labelledby="tableTitle"
                        size={"medium"}
                        sx={{
                            tableLayout: 'fixed',
                            width: '100%',
                            minWidth: '900px',
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
                                    <TableCell colSpan={6} align="center" sx={{py: 6}}>
                                        <Typography variant="h6" color="text.secondary">
                                            No overtime tickets found.
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
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Box>
                {/* TODO: Add Pagination controls here */}
            </Box>
        </Box>
    );
}

export default OvertimeTicketList;