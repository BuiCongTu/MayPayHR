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
    Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {visuallyHidden} from '@mui/utils';
import {blue} from "@mui/material/colors";

function descendingComparator(a, b, orderBy) {
    // Ensure values are comparable, falling back to an empty string
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
    {id: 'status', label: 'Status', numeric: false, width: '10%'},
];

function EmployeeTableHead(props) {
    const {order, orderBy, onRequestSort} = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    const headStyle = {
        fontWeight: 'bold',
        backgroundColor: blue[100],
        py: 0.5,
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

function EmployeeListTable({employees}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('id');

    if (!employees || employees.length === 0) {
        return (
            <Typography variant="body2" sx={{ml: 2, fontStyle: 'italic'}}>
                No employees assigned to this ticket.
            </Typography>
        );
    }

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Filter employees based on search term
    const filteredEmployees = employees.filter(emp =>
        (emp.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort the filtered employees
    const sortedEmployees = stableSort(filteredEmployees, getComparator(order, orderBy));

    const tableCellStyle = {
        py: 0.5,
    };

    return (
        <Box>
            <TextField
                id="employeeNameSearch"
                placeholder="Search by Employee (Name, ID, Email)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                    mb: 1,
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: 'white',
                    '& .MuiInputBase-input': {
                        paddingTop: '4px',
                        paddingBottom: '4px',
                    },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small"/>
                        </InputAdornment>
                    ),
                }}
            />
            <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                    mt: 1,
                    mb: 1,
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
                                <TableRow key={emp.id} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                    <TableCell sx={tableCellStyle}>{emp.id}</TableCell>
                                    <TableCell sx={tableCellStyle}>{emp.fullName || 'N/A'}</TableCell>
                                    <TableCell sx={tableCellStyle}>{emp.email || 'N/A'}</TableCell>
                                    <TableCell sx={tableCellStyle}>{emp.phone || 'N/A'}</TableCell>
                                    <TableCell sx={tableCellStyle}>{emp.lineName || 'N/A'}</TableCell>
                                    <TableCell sx={tableCellStyle}>{emp.skillLevelName || 'N/A'}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{py: 2}}>
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

export default EmployeeListTable;