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

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import {visuallyHidden} from '@mui/utils';
import EmployeeListTable from './EmployeeList';

// TODO: Replace with your actual auth context
const useAuth = () => {
    return {user: {id: 199050002}}; // Mock Manager ID
};

const headCells = [
    {id: 'id', label: 'Ticket ID', numeric: false, width: '10%'},
    {id: 'overtimeRequest.factoryManager.fullName', label: 'Requested By', numeric: false, width: '20%'},
    {id: 'overtimeRequest.overtimeDate', label: 'Date', numeric: false, width: '15%'},
    {id: 'overtimeRequest.startTime', label: 'Time', numeric: false, width: '15%'},
    {id: 'reason', label: 'Reason', numeric: false, width: '25%'},
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
                        {headCell.id !== 'details' ? (
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
                        ) : (
                            headCell.label
                        )}
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
        let label = status ? status.toUpperCase() : 'UNKNOWN';
        switch (status?.toLowerCase()) {
            case 'pending':
                color = 'warning';
                label = 'PENDING';
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
        return <Chip label={label} color={color} size="small" sx={{minWidth: 90, fontWeight: 'bold'}}/>;
    };

    const formatTime = (t) => t ? t.substring(0, 5) : '';

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
                sx={{'& > *': {borderBottom: 'unset'}, cursor: 'pointer'}}
            >
                <TableCell component="th" scope="row" sx={cellTruncateStyle}>
                    {ticket.id}
                </TableCell>
                <TableCell align="left" sx={cellTruncateStyle}>
                    {ticket.requesterName || 'N/A'}
                </TableCell>
                <TableCell align="left" sx={cellTruncateStyle}>
                    {ticket.overtimeDate || 'N/A'}
                </TableCell>
                <TableCell align="left" sx={cellTruncateStyle}>
                    {formatTime(ticket.startTime)} - {formatTime(ticket.endTime)}
                </TableCell>
                <TableCell align="left" sx={cellTruncateStyle}>
                    {ticket.reason? `${ticket.reason}` : ticket.approvedByName ? `Approved by ${ticket.approvedByName}` : '-'}
                </TableCell>
                <TableCell align="left">
                    {getStatusChip(ticket.status)}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{margin: 2, padding: 2, backgroundColor: 'grey.100', borderRadius: 2}}>
                            <Typography variant="h6" gutterBottom component="div">Ticket Details</Typography>
                            <Typography variant="body2" sx={{mb: 1}}>
                                <strong>Confirmed By:</strong> {ticket.confirmedByName || 'Pending'}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 1}}>
                                <strong>Approved By:</strong> {ticket.approvedByName || 'Pending'}
                            </Typography>

                            <Typography variant="body2" sx={{mb: 0.5, fontWeight: 'bold'}}>
                                Employee List:
                            </Typography>
                            {/* Pass the list to your existing EmployeeList component */}
                            <EmployeeListTable employees={ticket.employeeList}/>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

function OvertimeTicketList() {
    const [tickets, setTickets] = useState([]);
    const [page, setPage] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('id');

    const [statusFilter, setStatusFilter] = useState('');
    const [requesterNameSearch, setRequesterNameSearch] = useState('');
    const [debouncedRequester, setDebouncedRequester] = useState(requesterNameSearch);

    const {user: currentUser} = useAuth();

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedRequester(requesterNameSearch);
            setPage(0);
        }, 500);
        return () => clearTimeout(handler);
    }, [requesterNameSearch]);

    // Data Fetching
    useEffect(() => {
        async function loadData() {
            if (!currentUser?.id) return;

            const filter = {
                managerId: currentUser.id,
                status: statusFilter || null,
                requesterName: debouncedRequester || null,
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
    }, [page, statusFilter, debouncedRequester, order, orderBy, currentUser?.id]);

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

    return (
        <Box>
            <Paper elevation={1} sx={{
                p: 2,
                mb: 4,
                bgcolor: 'grey.50',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Typography variant="h5" component="h2" sx={{fontWeight: 'bold', mr: 1, width: '100%'}}>
                    My Overtime Tickets
                </Typography>

                <TextField
                    id="requesterSearch"
                    placeholder="Search by Requester..."
                    value={requesterNameSearch}
                    onChange={e => setRequesterNameSearch(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{width: 250, bgcolor: 'white'}}
                    InputProps={{startAdornment: (<InputAdornment position="start"><SearchIcon/></InputAdornment>)}}
                />

                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <Typography variant="body2" sx={{fontWeight: 'medium', ml: 1}}>Status:</Typography>
                    <ToggleButtonGroup value={statusFilter} exclusive onChange={handleStatusChange} size="small"
                                       sx={{bgcolor: 'white'}}>
                        <ToggleButton value="">All</ToggleButton>
                        <ToggleButton value="pending">Pending</ToggleButton>
                        <ToggleButton value="submitted">Submitted</ToggleButton>
                        <ToggleButton value="confirmed">Confirmed</ToggleButton>
                        <ToggleButton value="approved">Approved</ToggleButton>
                        <ToggleButton value="rejected">Rejected</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Box sx={{flexGrow: 1}}/>

                <Button variant="contained" color="primary" startIcon={<AddIcon/>}
                        onClick={() => navigate("/overtime-ticket/create")} sx={{minWidth: 'auto'}}>
                    Create
                </Button>
            </Paper>

            <Paper sx={{width: '100%', mb: 2}}>
                <TableContainer>
                    <Table aria-labelledby="tableTitle" size={"medium"}
                           sx={{tableLayout: 'fixed', width: '100%', minWidth: '900px'}}>
                        <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleSortRequest}/>
                        <TableBody>
                            {tickets.length === 0 ? (
                                <TableRow><TableCell colSpan={6} align="center" sx={{py: 6}}>No overtime tickets
                                    found.</TableCell></TableRow>
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
        </Box>
    );
}

export default OvertimeTicketList;