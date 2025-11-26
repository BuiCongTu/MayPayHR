import React, {useState} from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper,
    Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {visuallyHidden} from '@mui/utils';
import {blue} from "@mui/material/colors";

function descendingComparator(a, b, orderBy) {
    const valA = a[orderBy] || '';
    const valB = b[orderBy] || '';

    if (valB < valA) {
        return -1;
    }
    if (valB > valA) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

// --- HeadCells for Employee Table ---
const employeeHeadCells = [
    {id: 'employeeId', label: 'ID', numeric: false},
    {id: 'employeeName', label: 'Full Name', numeric: false},
    {id: 'employeeEmail', label: 'Email', numeric: false},
    {id: 'employeePhone', label: 'Phone', numeric: false},
    {id: 'lineName', label: 'Line', numeric: false},
    {id: 'skillLevelName', label: 'Skill Level', numeric: false},
    {id: 'status', label: 'Status', numeric: false},
];

function EmployeeTableHead(props) {
    const {order, orderBy, onRequestSort} = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    const headStyle = {
        fontWeight: 'bold',
        backgroundColor: blue[100],
        py: 1,
    };

    return (
        <TableHead>
            <TableRow>
                {employeeHeadCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={headStyle}
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

// --- Renamed component to ViewOnlyEmployeeList ---
function ViewOnlyEmployeeList({employees}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [order, setOrder] = useState('asc');
    // --- MODIFIED default sort to 'employeeName' ---
    const [orderBy, setOrderBy] = useState('employeeName');

    if (!employees || employees.length === 0) {
        return (
            <Typography variant="body2" sx={{p: 2, fontStyle: 'italic'}}>
                No employees assigned to this ticket.
            </Typography>
        );
    }

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const filteredEmployees = employees.filter(emp =>
        (emp.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.employeeEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.employeeId || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort the filtered employees
    const sortedEmployees = stableSort(filteredEmployees, getComparator(order, orderBy));

    // --- NEW Helper Function for status chip ---
    const getStatusChip = (status) => {
        let color;
        let label = (status || 'pending').charAt(0).toUpperCase() + (status || 'pending').slice(1);

        switch (status) {
            case 'ok':
                color = 'success';
                break;
            case 'rejected':
                color = 'error';
                break;
            case 'pending':
            default:
                color = 'warning';
                label = 'Pending';
        }
        return <Chip label={label} color={color} size="small" sx={{minWidth: 70}}/>;
    };

    return (
        <Box sx={{ p: 2 }}> {/* Added padding to the Box */}
            <TextField
                id="employeeNameSearch"
                placeholder="Search by Employee (Name, ID, Email)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                    mb: 2, // More margin
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: 'white',
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon/>
                        </InputAdornment>
                    ),
                }}
            />
            <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Table size="small" aria-label="employee list">
                    <EmployeeTableHead
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={handleRequestSort}
                    />
                    <TableBody>
                        {sortedEmployees.length > 0 ? (
                            sortedEmployees.map((emp) => (
                                <TableRow key={emp.employeeId} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                    <TableCell>{emp.employeeId || 'N/A'}</TableCell>
                                    <TableCell>{emp.employeeName || 'N/A'}</TableCell>
                                    <TableCell>{emp.employeeEmail || 'N/A'}</TableCell>
                                    <TableCell>{emp.employeePhone || 'N/A'}</TableCell>
                                    <TableCell>{emp.lineName || 'N/A'}</TableCell>
                                    <TableCell>{emp.skillLevelName || 'N/A'}</TableCell>
                                    <TableCell>
                                        {getStatusChip(emp.status)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                {/* --- MODIFIED colSpan --- */}
                                <TableCell colSpan={employeeHeadCells.length} align="center" sx={{py: 3}}>
                                    No employees found matching "{searchTerm}".
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default ViewOnlyEmployeeList;