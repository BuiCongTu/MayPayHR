import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFilteredOvertimeRequest, createOvertimeTicket } from '../../../services/moduleB/overtimeService';
import { getUsersByDepartment } from '../../../services/userService';
import { getCurrentUser } from '../../../services/authService';
import EmployeeTransferList from './EmployeeTransferList';

import {
    Box, Container, Paper, Typography, Autocomplete, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Checkbox, Button, Alert, CircularProgress, Stack, Chip
} from '@mui/material';

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function OvertimeTicketCreate() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get real user.
    const user = getCurrentUser();

    // Data States
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [deptEmployees, setDeptEmployees] = useState([]);

    // Form States
    const [lines, setLines] = useState([]);
    const [allocations, setAllocations] = useState({});

    // UI States
    const [loading, setLoading] = useState(false);
    const [loadingReq, setLoadingReq] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentEditingLine, setCurrentEditingLine] = useState(null);
    const [error, setError] = useState(null);

    // 1. Load Data & Handle Pre-selection
    useEffect(() => {
        let isMounted = true;

        async function init() {
            if (!user) {
                if (isMounted) {
                    setError("User not authenticated.");
                    setLoadingReq(false);
                }
                return;
            }

            const departmentId = user.departmentId;

            try {
                // A. Fetch Requests
                const reqData = await getFilteredOvertimeRequest(
                    { status: 'open', departmentId: departmentId },
                    { page: 0, size: 50, sort: 'id,desc' }
                );

                if (!isMounted) return;

                const fetchedRequests = reqData.content || [];
                setRequests(fetchedRequests);

                // B. Fetch Employees
                if (departmentId) {
                    const users = await getUsersByDepartment(departmentId);
                    if (isMounted) setDeptEmployees(users || []);
                }

                // C. Handle Pre-selected Request (passed from List)
                if (location.state?.preselectedRequestId) {
                    const targetReq = fetchedRequests.find(r => r.id === location.state.preselectedRequestId);
                    if (targetReq) {
                        setSelectedRequest(targetReq);
                        setupLinesForRequest(targetReq);
                    }
                }

            } catch (err) {
                console.error(err);
                if (isMounted) setError("Failed to initialize data.");
            } finally {
                if (isMounted) setLoadingReq(false);
            }
        }

        init();

        return () => { isMounted = false; };
    }, [user?.id, user?.departmentId, location.state]);

    // Helper to setup lines
    const setupLinesForRequest = (req) => {
        if (req) {
            const fulfilledLineIds = new Set();
            if (req.overtimeTickets) {
                req.overtimeTickets.forEach(ticket => {
                    if (ticket.status !== 'rejected') {
                        ticket.employeeList?.forEach(emp => fulfilledLineIds.add(emp.lineId));
                    }
                });
            }

            const initialLines = req.lineDetails.map(d => ({
                lineId: d.lineId,
                lineName: d.lineName,
                numEmployees: d.numEmployees,
                selected: false,
                isUnavailable: fulfilledLineIds.has(d.lineId)
            }));
            setLines(initialLines);
            setAllocations({});
        } else {
            setLines([]);
            setAllocations({});
        }
    };

    // 2. Handle Request Selection (User Interaction)
    const handleRequestChange = (event, newValue) => {
        setSelectedRequest(newValue);
        setError(null);
        setupLinesForRequest(newValue);
    };

    const handleLineToggle = (lineId) => {
        setLines(prev => prev.map(l => {
            if (l.lineId === lineId) {
                return { ...l, selected: !l.selected };
            }
            return l;
        }));
    };

    const openEmployeePicker = (line) => {
        setCurrentEditingLine(line);
        setModalOpen(true);
    };

    const handleSaveAllocation = (selectedUsers) => {
        if (currentEditingLine) {
            setAllocations(prev => ({
                ...prev,
                [currentEditingLine.lineId]: selectedUsers
            }));

            if (selectedUsers.length > 0) {
                setLines(prev => prev.map(l => l.lineId === currentEditingLine.lineId ? { ...l, selected: true } : l));
            }
        }
        setModalOpen(false);
        setCurrentEditingLine(null);
    };

    const getUnavailableEmployeesMap = (targetLineId) => {
        const unavailable = new Map();

        if (selectedRequest && selectedRequest.overtimeTickets) {
            selectedRequest.overtimeTickets.forEach(ticket => {
                if (ticket.status !== 'rejected') {
                    ticket.employeeList?.forEach(emp => {
                        unavailable.set(emp.employeeId, `Ticket #${ticket.id}`);
                    });
                }
            });
        }

        Object.keys(allocations).forEach(lId => {
            const lineIdInt = parseInt(lId);
            if (lineIdInt !== targetLineId) {
                const lineObj = lines.find(l => l.lineId === lineIdInt);
                const lineName = lineObj ? lineObj.lineName : 'Other Line';

                allocations[lId].forEach(u => {
                    unavailable.set(u.id, `Assigned to ${lineName}`);
                });
            }
        });

        return unavailable;
    };

    const handleSubmit = async () => {
        if (!selectedRequest) return;
        if (!user || !user.id) {
            setError("User session invalid.");
            return;
        }

        const activeLines = lines.filter(l => l.selected);

        if (activeLines.length === 0) {
            setError("Please select at least one line.");
            return;
        }

        const payloadAllocations = activeLines.map(l => ({
            lineId: l.lineId,
            employeeIds: (allocations[l.lineId] || []).map(u => u.id)
        }));

        const emptyLine = activeLines.find(l => !allocations[l.lineId] || allocations[l.lineId].length === 0);
        if (emptyLine) {
            setError(`Line "${emptyLine.lineName}" is selected but has no employees assigned.`);
            return;
        }

        const payload = {
            requestId: selectedRequest.id,
            managerId: user.id,
            allocations: payloadAllocations
        };

        setLoading(true);
        setError(null);

        try {
            await createOvertimeTicket(payload);
            alert("Ticket created successfully!");
            navigate('/overtime-ticket');
        } catch (err) {
            setError(typeof err === 'string' ? err : (err.response?.data || "Failed to create ticket."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <Paper elevation={2} sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/overtime-ticket')} color="inherit">
                        Back
                    </Button>
                    <Typography variant="h5" fontWeight="bold">Create Overtime Ticket</Typography>
                </Stack>

                <Typography variant="subtitle2" color="primary" gutterBottom>STEP 1: SELECT REQUEST</Typography>
                <Autocomplete
                    id="request-select-autocomplete"
                    options={requests}
                    getOptionLabel={(option) => `Req #${option.id} - ${option.overtimeDate} (${option.startTime.substring(0,5)} - ${option.endTime.substring(0,5)})`}
                    value={selectedRequest}
                    onChange={handleRequestChange}
                    loading={loadingReq}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                        <TextField {...params} label="Select Open Request" placeholder="Search by ID or Date..." fullWidth />
                    )}
                    renderOption={(props, option) => (
                        <li {...props}>
                            <Box>
                                <Typography variant="body1" fontWeight="bold">Request #{option.id} - {option.overtimeDate}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {option.departmentName} • {option.startTime.substring(0,5)} to {option.endTime.substring(0,5)}
                                </Typography>
                            </Box>
                        </li>
                    )}
                    sx={{ mb: 4 }}
                />

                {selectedRequest && (
                    <>
                        <Typography variant="subtitle2" color="primary" gutterBottom>STEP 2: ASSIGN EMPLOYEES</Typography>
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: 'grey.100' }}>
                                    <TableRow>
                                        <TableCell padding="checkbox">Select</TableCell>
                                        <TableCell>Line Name</TableCell>
                                        <TableCell align="right">Required</TableCell>
                                        <TableCell align="right">Assigned</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {lines.map((line) => {
                                        const assignedCount = (allocations[line.lineId] || []).length;
                                        const isFulfilled = assignedCount >= line.numEmployees;
                                        const isDisabled = line.isUnavailable;

                                        return (
                                            <TableRow key={line.lineId} selected={line.selected} sx={{ opacity: isDisabled ? 0.6 : 1 }}>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={line.selected}
                                                        onChange={() => handleLineToggle(line.lineId)}
                                                        color="primary"
                                                        disabled={isDisabled}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography fontWeight={isDisabled ? 'normal' : 'bold'}>
                                                        {line.lineName}
                                                    </Typography>
                                                    {isDisabled && (
                                                        <Chip label="Fulfilled in other ticket" size="small" color="default" sx={{ mt: 0.5, fontSize: '0.7rem' }} />
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">{line.numEmployees}</TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={assignedCount}
                                                        color={assignedCount === 0 ? "default" : (isFulfilled ? "success" : "warning")}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        variant={line.selected ? "contained" : "outlined"}
                                                        size="small"
                                                        startIcon={<PersonAddIcon />}
                                                        onClick={() => openEmployeePicker(line)}
                                                        disabled={!line.selected || isDisabled}
                                                    >
                                                        Manage Employees
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <Box display="flex" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                Create Ticket
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>

            <EmployeeTransferList
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={`Assign Employees: ${currentEditingLine?.lineName}`}
                allEmployees={deptEmployees}
                initialSelected={currentEditingLine ? (allocations[currentEditingLine.lineId] || []) : []}
                unavailableEmployees={currentEditingLine ? getUnavailableEmployeesMap(currentEditingLine.lineId) : new Map()}
                requestedCount={currentEditingLine ? currentEditingLine.numEmployees : 0}
                onSave={handleSaveAllocation}
            />
        </Container>
    );
}