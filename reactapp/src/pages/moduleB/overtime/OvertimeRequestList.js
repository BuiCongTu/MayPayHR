import React, {useState, useEffect} from 'react';
import {getFilteredOvertimeRequest} from "../../../services/moduleB/overtimeService";
import {useNavigate} from "react-router-dom";
import {
    Box, Typography, Button, Paper, TextField, InputAdornment, ToggleButton, ToggleButtonGroup,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Collapse, Chip, colors, Grid, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import {visuallyHidden} from '@mui/utils';
import RequestTicketList from './RequestTicketList';

const headCells = [
    {id: 'id', label: 'ID', width: '10%'},
    {id: 'departmentName', label: 'Department', width: '30%'},
    {id: 'overtimeDate', label: 'Date', width: '15%'},
    {id: 'startTime', label: 'Time', width: '15%'},
    {id: 'numEmployees', label: 'Total Empl.', numeric: true, width: '15%'}, // Updated label
    {id: 'status', label: 'Status', width: '15%'},
];

function EnhancedTableHead(props) {
    const {order, orderBy, onRequestSort} = props;
    return (
        <TableHead>
            <TableRow sx={{"& th": {fontWeight: 'bold', backgroundColor: colors.blue[50]}}}>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        width={headCell.width}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={(e) => onRequestSort(e, headCell.id)}
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

function RequestRow({request, isExpanded, onToggle}) {
    const getStatusChip = (status) => {
        let color = 'default';
        let label = status ? status.toUpperCase() : 'UNKNOWN';

        switch (status?.toLowerCase()) {
            case 'pending': color = 'warning'; break;
            case 'open': color = 'info'; break;
            case 'processed': color = 'success'; break;
            case 'rejected': color = 'error'; break;
            case 'expired': color = 'default'; break;
        }
        return <Chip label={label} color={color} size="small" sx={{minWidth: 80, fontWeight: 'bold'}}/>;
    };

    const fmtTime = (t) => t ? t.substring(0, 5) : '';

    return (
        <React.Fragment>
            <TableRow hover onClick={onToggle} sx={{cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 }}}>
                <TableCell>#{request.id}</TableCell>
                <TableCell>{request.departmentName || 'N/A'}</TableCell>
                <TableCell>{request.overtimeDate}</TableCell>
                <TableCell>{fmtTime(request.startTime)} - {fmtTime(request.endTime)} ({request.overtimeTime}h)</TableCell>
                <TableCell align="right">
                    <Typography fontWeight="bold" color="primary">
                        {request.numEmployees}
                    </Typography>
                </TableCell>
                <TableCell>{getStatusChip(request.status)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{m: 2, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0'}}>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={5}>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>REQUEST OVERVIEW</Typography>
                                    <Typography variant="body2" paragraph>
                                        <strong>Reason:</strong> {request.details || "No details provided."}
                                    </Typography>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        LINE BREAKDOWN
                                    </Typography>

                                    {/* --- NEW: Line Details Table --- */}
                                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                                        <Table size="small" aria-label="line details">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: '#eee' }}>
                                                    <TableCell><strong>Line Name</strong></TableCell>
                                                    <TableCell align="right"><strong>Headcount</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {request.lineDetails && request.lineDetails.length > 0 ? (
                                                    request.lineDetails.map((detail) => (
                                                        <TableRow key={detail.id}>
                                                            <TableCell component="th" scope="row">
                                                                {detail.lineName}
                                                            </TableCell>
                                                            <TableCell align="right">{detail.numEmployees}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={2} align="center">No specific lines recorded</TableCell>
                                                    </TableRow>
                                                )}
                                                {/* Total Row */}
                                                <TableRow>
                                                    <TableCell align="right"><strong>Total</strong></TableCell>
                                                    <TableCell align="right"><strong>{request.numEmployees}</strong></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    <Typography variant="caption" display="block" color="textSecondary">
                                        Created: {new Date(request.createdAt).toLocaleString()}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={7}>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>TICKETS & EMPLOYEES</Typography>
                                    <RequestTicketList request={request}/>
                                </Grid>
                            </Grid>

                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export default function OvertimeRequestList() {
    const [requests, setRequests] = useState([]);
    const [page, setPage] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [departmentSearch, setDepartmentSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const navigate = useNavigate();
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('id');

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(departmentSearch), 500);
        return () => clearTimeout(t);
    }, [departmentSearch]);

    // Load data
    useEffect(() => {
        async function load() {
            try {
                const filter = {status: statusFilter || null, departmentName: debouncedSearch || null};
                const data = await getFilteredOvertimeRequest(filter, {page, size: 10, sort: `${orderBy},${order}`});
                setRequests(data?.content || []);
            } catch (e) {
                console.error(e);
            }
        }
        load();
    }, [statusFilter, debouncedSearch, order, orderBy, page]);

    return (
        <Box>
            <Paper elevation={0} sx={{
                p: 2, mb: 2, bgcolor: 'white', border: '1px solid #eee',
                display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center'
            }}>
                <Typography variant="h6" sx={{fontWeight: 'bold', mr: 2}}>Overtime Requests</Typography>

                <TextField
                    size="small"
                    placeholder="Search Department..."
                    value={departmentSearch}
                    onChange={e => setDepartmentSearch(e.target.value)}
                    InputProps={{startAdornment: <InputAdornment position="start"><SearchIcon/></InputAdornment>}}
                />

                <ToggleButtonGroup
                    value={statusFilter}
                    exclusive
                    onChange={(e, v) => setStatusFilter(v)}
                    size="small"
                >
                    <ToggleButton value="">All</ToggleButton>
                    <ToggleButton value="pending" color="warning">Pending</ToggleButton>
                    <ToggleButton value="open" color="info">Open</ToggleButton>
                    <ToggleButton value="processed" color="success">Processed</ToggleButton>
                </ToggleButtonGroup>

                <Box flexGrow={1}/>

                <Button variant="contained" startIcon={<AddIcon/>} onClick={() => navigate("/overtime-request/create")}>
                    New Request
                </Button>
            </Paper>

            <TableContainer component={Paper} elevation={0} sx={{border: '1px solid #eee'}}>
                <Table sx={{ tableLayout: 'fixed', minWidth: 650 }}>
                    <EnhancedTableHead
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={(e, p) => {
                            const isAsc = orderBy === p && order === 'asc';
                            setOrder(isAsc ? 'desc' : 'asc');
                            setOrderBy(p);
                        }}
                    />
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center">No requests found.</TableCell></TableRow>
                        ) : requests.map(req => (
                            <RequestRow
                                key={req.id}
                                request={req}
                                isExpanded={expanded === req.id}
                                onToggle={() => setExpanded(expanded === req.id ? false : req.id)}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}