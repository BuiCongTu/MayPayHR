import React, {useState, useEffect} from 'react';
import {getFilteredOvertimeRequest} from "../../../services/moduleB/overtimeService";
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

const headCells = [
    {id: 'id', label: 'ID', numeric: false, width: '15%'},
    {id: 'departmentName', label: 'Department', numeric: false, width: '25%'},
    {id: 'numEmployees', label: 'Employee #', numeric: true, width: '15%'},
    {id: 'overtimeTime', label: 'Overtime (h)', numeric: true, width: '15%'},
    {id: 'createdAt', label: 'Created At', numeric: false, width: '15%'},
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

function RequestRow(props) {
    const {request, isExpanded, onToggle} = props;

    const getStatusChip = (status) => {
        let color;
        let label = status.charAt(0).toUpperCase() + status.slice(1);

        switch (status) {
            case 'pending':
                color = 'warning';
                break;
            case 'processed':
                color = 'success';
                break;
            default:
                color = 'default';
                label = 'Unknown';
        }

        return <Chip label={label} color={color} size="small" sx={{minWidth: 80}}/>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
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
                    {request.id}
                </TableCell>
                <TableCell align="left" sx={cellTruncateStyle}>
                    {request.departmentName || 'N/A'}
                </TableCell>
                <TableCell align="right">{request.numEmployees || 'N/A'}</TableCell>
                <TableCell align="right">{request.overtimeTime || 0}</TableCell>
                <TableCell align="left" sx={cellTruncateStyle}>
                    {formatDate(request.createdAt)}
                </TableCell>
                <TableCell align="left">
                    {getStatusChip(request.status)}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{margin: 2, padding: 2, backgroundColor: 'grey.100', borderRadius: 2}}>
                            <Typography variant="h6" gutterBottom component="div">
                                Request Details
                            </Typography>
                            <Typography variant="body2" sx={{mb: 1}}>
                                <strong>Details:</strong> {request.details || 'No details provided.'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Date:</strong> {request.createdAt || 'N/A'}
                            </Typography>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}


// --- Main List Component ---
function OvertimeRequestList() {
    const [requests, setRequests] = useState([]);
    const [page, setPage] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('');
    const [departmentNameSearch, setDepartmentNameSearch] = useState('');
    const [debouncedDepartmentName, setDebouncedDepartmentName] = useState(departmentNameSearch);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('id');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedDepartmentName(departmentNameSearch);
            setPage(0);
        }, 500);
        return () => clearTimeout(handler);
    }, [departmentNameSearch]);

    useEffect(() => {
        async function loadData() {
            const filter = {
                status: statusFilter || null,
                departmentName: debouncedDepartmentName || null,
            };
            const sortString = `${orderBy},${order}`;
            const pageable = {page, size: 10, sort: sortString};
            try {
                const data = await getFilteredOvertimeRequest(filter, pageable);
                setRequests(data?.content || []);
            } catch (err) {
                console.error("Failed to fetch overtime requests", err);
            }
        }

        loadData();
    }, [page, statusFilter, debouncedDepartmentName, order, orderBy]);

    const handleExpandChange = (panelId) => {
        setExpanded(isExpanded => (isExpanded === panelId ? false : panelId));
    };

    const handleStatusChange = (event, newStatus) => {
        if (newStatus !== null) {
            setStatusFilter(newStatus);
            setPage(0);
        }
    };

    const handleSortRequest = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
        setPage(0);
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
                    variant="h6"
                    component="h2"
                    sx={{fontWeight: 'bold', mr: 1}}
                >
                    Overtime Requests
                </Typography>
                <TextField
                    id="deptSearch"
                    placeholder="Search by Department..."
                    value={departmentNameSearch}
                    onChange={e => setDepartmentNameSearch(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                        width: 250,
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
                            <ToggleButton value="processed">Processed</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>
                <Box sx={{flexGrow: 1}}/>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon/>}
                    onClick={() => navigate("/overtime-request/create")}
                    sx={{minWidth: 'auto'}}
                >
                    Create
                </Button>
            </Paper>

            <Paper sx={{width: '100%', mb: 2, overflow: 'auto'}}>
                <TableContainer>
                    <Table
                        aria-labelledby="tableTitle"
                        size="medium"
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
                            {requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{py: 6}}>
                                        <Typography variant="h6" color="text.secondary">
                                            No overtime requests found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((req) => (
                                    <RequestRow
                                        key={req.id}
                                        request={req}
                                        isExpanded={expanded === req.id}
                                        onToggle={() => handleExpandChange(req.id)}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            {/* TODO: Add Pagination controls here */}
        </Box>
    );
}

export default OvertimeRequestList;