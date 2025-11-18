import React, {useState, useEffect} from 'react';
import {getFilteredOvertimeRequest} from "../../../services/moduleB/overtimeService";
import {useNavigate} from "react-router-dom";
import {
    Box, Typography, Button, Paper, TextField, InputAdornment, ToggleButton, ToggleButtonGroup,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Collapse, Chip, colors
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import {visuallyHidden} from '@mui/utils';
import RequestTicketList from './RequestTicketList';

const headCells = [
    {id: 'id', label: 'ID', width: '10%'},
    {id: 'departmentName', label: 'Department', width: '35%'},
    {id: 'overtimeDate', label: 'Date', width: '15%'},
    {id: 'startTime', label: 'Time', width: '15%'},
    {id: 'numEmployees', label: 'Empl. #', numeric: true, width: '10%'},
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
                        sx={{ overflow: 'hidden' }}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={(e) => onRequestSort(e, headCell.id)}
                        >
                            <Box component="span" sx={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: 'block'
                            }}>
                                {headCell.label}
                            </Box>
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
            case 'pending':
                color = 'warning';
                break;
            case 'open':
                color = 'info';
                break;     // Ready for tickets
            case 'processed':
                color = 'success';
                break; // Finished
            case 'rejected':
                color = 'error';
                break;
            case 'expired':
                color = 'default';
                break;
        }
        return <Chip label={label} color={color} size="small" sx={{minWidth: 80, fontWeight: 'bold'}}/>;
    };

    // Format time HH:mm:ss -> HH:mm
    const fmtTime = (t) => t ? t.substring(0, 5) : '';

    // Style to force ellipsis
    const ellipsisStyle = {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'block'
    };

    return (
        <React.Fragment>
            <TableRow hover onClick={onToggle} sx={{cursor: 'pointer'}}>
                <TableCell>
                    <Box sx={ellipsisStyle} title={request.id}>
                        {request.id}
                    </Box>
                </TableCell>
                <TableCell>
                    <Box sx={ellipsisStyle} title={request.departmentName}>
                        {request.departmentName || 'N/A'}
                    </Box>
                </TableCell>
                <TableCell>
                    <Box sx={ellipsisStyle}>
                        {request.overtimeDate}
                    </Box>
                </TableCell>
                <TableCell>
                    <Box sx={ellipsisStyle}>
                        {fmtTime(request.startTime)} - {fmtTime(request.endTime)}
                    </Box>
                </TableCell>
                <TableCell align="right">{request.numEmployees}</TableCell>
                <TableCell>{getStatusChip(request.status)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{m: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid #e0e0e0'}}>
                            <Typography variant="subtitle2" gutterBottom color="primary">REQUEST DETAILS</Typography>
                            <Typography variant="body2"><strong>Reason:</strong> {request.details}</Typography>
                            <Typography variant="body2"
                                        sx={{mb: 2}}><strong>Created:</strong> {new Date(request.createdAt).toLocaleString()}
                            </Typography>

                            <RequestTicketList request={request}/>
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

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(departmentSearch), 500);
        return () => clearTimeout(t);
    }, [departmentSearch]);

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
                p: 2,
                mb: 2,
                bgcolor: 'white',
                border: '1px solid #eee',
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <Typography variant="h6" sx={{fontWeight: 'bold', mr: 2}}>Overtime Requests</Typography>
                <TextField
                    size="small"
                    placeholder="Search Department..."
                    value={departmentSearch}
                    onChange={e => setDepartmentSearch(e.target.value)}
                    InputProps={{startAdornment: <InputAdornment position="start"><SearchIcon/></InputAdornment>}}
                />
                <ToggleButtonGroup value={statusFilter} exclusive onChange={(e, v) => setStatusFilter(v)} size="small">
                    <ToggleButton value="">All</ToggleButton>
                    <ToggleButton value="pending">Pending</ToggleButton>
                    <ToggleButton value="open">Open</ToggleButton>
                    <ToggleButton value="processed">Processed</ToggleButton>
                </ToggleButtonGroup>
                <Box flexGrow={1}/>
                <Button variant="contained" startIcon={<AddIcon/>}
                        onClick={() => navigate("/overtime-request/create")}>Create</Button>
            </Paper>

            <TableContainer component={Paper} elevation={0} sx={{border: '1px solid #eee'}}>
                <Table sx={{ tableLayout: 'fixed', minWidth: 650 }}>
                    <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={(e, p) => {
                        const isAsc = orderBy === p && order === 'asc';
                        setOrder(isAsc ? 'desc' : 'asc');
                        setOrderBy(p);
                    }}/>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center">No requests found.</TableCell></TableRow>
                        ) : requests.map(req => (
                            <RequestRow key={req.id} request={req} isExpanded={expanded === req.id}
                                        onToggle={() => setExpanded(expanded === req.id ? false : req.id)}/>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}