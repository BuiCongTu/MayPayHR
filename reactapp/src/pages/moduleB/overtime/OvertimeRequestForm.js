import React, { useState, useEffect } from 'react';
import { createOvertimeRequest } from '../../../services/moduleB/overtimeService';
import { getAllDepartments, getLinesByDepartment } from "../../../services/departmentService";
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Autocomplete,
    createFilterOptions,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Grid
} from '@mui/material';

const filter = createFilterOptions({
    matchFrom: 'any',
    ignoreCase: true,
    stringify: (option) => `${option.id} ${option.name}`,
});

function OvertimeRequestForm() {
    const [formData, setFormData] = useState({
        factoryManagerId: '',
        departmentId: '',
        overtimeDate: new Date().toISOString().split('T')[0],
        startTime: '17:00', // Default start time
        endTime: '18:00',
        overtimeTime: 1.0,
        details: ''
    });

    // Helper States
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [linesTableData, setLinesTableData] = useState([]);
    const [isSpecialDay, setIsSpecialDay] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getAllDepartments();
                setDepartments(data || []);
            } catch (err) {
                setError("Failed to fetch departments.");
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        async function fetchLines() {
            if (formData.departmentId) {
                try {
                    const fetchedLines = await getLinesByDepartment(formData.departmentId);
                    const initialTableData = fetchedLines.map(line => ({
                        id: line.id,
                        name: line.name,
                        isSelected: false,
                        numEmployees: ''
                    }));
                    setLinesTableData(initialTableData);
                } catch (err) {
                    console.error(err);
                    setLinesTableData([]);
                }
            } else {
                setLinesTableData([]);
            }
        }
        fetchLines();
    }, [formData.departmentId]);

    useEffect(() => {
        // Check if Date is Sunday (0)
        if (formData.overtimeDate) {
            const dayOfWeek = new Date(formData.overtimeDate).getDay();
            const isSunday = dayOfWeek === 0;
            // "Holiday" check can be added here later
            setIsSpecialDay(isSunday);

            // Reset to 17:00 if not special day
            if (!isSunday && formData.startTime !== '17:00') {
                setFormData(prev => ({ ...prev, startTime: '17:00' }));
            }
        }

        if (formData.startTime && formData.endTime) {
            const start = new Date(`1970-01-01T${formData.startTime}:00`);
            const end = new Date(`1970-01-01T${formData.endTime}:00`);

            let diffMs = end - start;
            if (diffMs < 0) {
                diffMs += 24 * 60 * 60 * 1000; // Add 24 hours
            }

            const diffHours = diffMs / (1000 * 60 * 60);
            // Round to 2 decimals
            const roundedHours = Math.round(diffHours * 100) / 100;

            setFormData(prev => ({ ...prev, overtimeTime: roundedHours }));
        }
    }, [formData.overtimeDate, formData.startTime, formData.endTime]);


    // --- HANDLERS ---

    const handleMainChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLineCheckbox = (index) => {
        const newData = [...linesTableData];
        newData[index].isSelected = !newData[index].isSelected;
        if (!newData[index].isSelected) newData[index].numEmployees = '';
        setLinesTableData(newData);
    };

    const handleLineQuantity = (index, value) => {
        const newData = [...linesTableData];
        newData[index].numEmployees = value;
        if (value && !newData[index].isSelected) newData[index].isSelected = true;
        setLinesTableData(newData);
    };

    const handleSelectAll = (event) => {
        const isChecked = event.target.checked;
        const newData = linesTableData.map(row => ({ ...row, isSelected: isChecked }));
        setLinesTableData(newData);
    };

    const totalEmployees = linesTableData
        .filter(l => l.isSelected)
        .reduce((sum, item) => sum + (parseInt(item.numEmployees) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const selectedLines = linesTableData.filter(l => l.isSelected);

        if (selectedLines.length === 0) {
            setError("Please select at least one line.");
            setLoading(false);
            return;
        }
        if (selectedLines.some(l => !l.numEmployees || parseInt(l.numEmployees) <= 0)) {
            setError("All selected lines must have a valid number of employees.");
            setLoading(false);
            return;
        }

        // Payload matching DTO/Entity
        const payload = {
            factoryManager: { id: parseInt(formData.factoryManagerId) },
            department: { id: parseInt(formData.departmentId) },
            overtimeDate: formData.overtimeDate,
            startTime: formData.startTime + ":00",
            endTime: formData.endTime + ":00",
            overtimeTime: parseFloat(formData.overtimeTime),
            details: formData.details,
            lineDetails: selectedLines.map(l => ({
                lineId: l.id,
                numEmployees: parseInt(l.numEmployees)
            }))
        };

        try {
            await createOvertimeRequest(payload);
            setSuccess(`Successfully created request for ${totalEmployees} employees!`);
            setFormData(prev => ({ ...prev, details: '' }));
            setLinesTableData(prev => prev.map(l => ({ ...l, isSelected: false, numEmployees: '' })));
        } catch (err) {
            setError(err.toString() || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
                <Typography variant="h5" component="h1" gutterBottom color="primary" fontWeight="bold">
                    Create Overtime Request
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            label="Factory Manager ID"
                            name="factoryManagerId"
                            value={formData.factoryManagerId}
                            onChange={handleMainChange}
                            required
                            sx={{ flex: 1 }}
                        />
                        <Autocomplete
                            options={departments}
                            getOptionLabel={(option) => `${option.name} (${option.id})`}
                            filterOptions={filter}
                            value={departments.find(dept => dept.id === formData.departmentId) || null}
                            onChange={(event, newValue) => {
                                setFormData(prev => ({ ...prev, departmentId: newValue ? newValue.id : '' }));
                            }}
                            sx={{ flex: 2 }}
                            renderInput={(params) => (
                                <TextField {...params} label="Department" required error={!departments.length} />
                            )}
                        />
                    </Box>

                    {/* --- ROW 2: Date & Time --- */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Date"
                                name="overtimeDate"
                                type="date"
                                value={formData.overtimeDate}
                                onChange={handleMainChange}
                                required
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="From"
                                name="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={handleMainChange}
                                required
                                fullWidth
                                disabled={!isSpecialDay}
                                InputLabelProps={{ shrink: true }}
                                helperText={!isSpecialDay ? "Fixed (Mon-Sat)" : "Editable (Sunday)"}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="To"
                                name="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={handleMainChange}
                                required
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                label="Hours"
                                value={formData.overtimeTime}
                                fullWidth
                                InputProps={{ readOnly: true }}
                                sx={{ bgcolor: 'action.hover' }}
                            />
                        </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ mt: 1 }}>
                        Select Lines & Headcount
                    </Typography>

                    {linesTableData.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={linesTableData.some(l => l.isSelected) && !linesTableData.every(l => l.isSelected)}
                                                checked={linesTableData.length > 0 && linesTableData.every(l => l.isSelected)}
                                                onChange={handleSelectAll}
                                            />
                                        </TableCell>
                                        <TableCell><strong>Line Name</strong></TableCell>
                                        <TableCell width="30%"><strong>Count</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {linesTableData.map((row, index) => (
                                        <TableRow key={row.id} selected={row.isSelected} hover>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={row.isSelected}
                                                    onChange={() => handleLineCheckbox(index)}
                                                />
                                            </TableCell>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    placeholder="0"
                                                    type="number"
                                                    value={row.numEmployees}
                                                    onChange={(e) => handleLineQuantity(index, e.target.value)}
                                                    disabled={!row.isSelected}
                                                    inputProps={{ min: "1" }}
                                                    fullWidth
                                                    error={row.isSelected && (!row.numEmployees || row.numEmployees <= 0)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Alert severity="info">Select a department to view available lines.</Alert>
                    )}

                    <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                        <Typography variant="h6">
                            Total Employees: <strong>{totalEmployees}</strong>
                        </Typography>
                    </Box>

                    <TextField
                        label="Reason / Details"
                        name="details"
                        value={formData.details}
                        onChange={handleMainChange}
                        multiline
                        rows={3}
                        fullWidth
                    />

                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">{success}</Alert>}

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading || totalEmployees === 0}
                        sx={{ py: 1.5, fontWeight: 'bold' }}
                    >
                        {loading ? <CircularProgress size={26} /> : 'Submit Overtime Request'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default OvertimeRequestForm;