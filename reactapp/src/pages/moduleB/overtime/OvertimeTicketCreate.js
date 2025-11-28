import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFilteredOvertimeRequest, createOvertimeTicket } from '../../../services/moduleB/overtimeService';
import { getUsersByDepartment } from '../../../services/userService';
import EmployeeTransferList from './EmployeeTransferList';

import {
    Box, Container, Paper, Typography, Autocomplete, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Checkbox, Button, Alert, CircularProgress, Stack, Chip
} from '@mui/material';

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// --- MOCK AUTH (Replace with real context) ---
const useAuth = () => ({ user: { id: 199050002, departmentId: 199040005 } });

export default function OvertimeTicketCreate() {
    const navigate = useNavigate();
    const { user } = useAuth();

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

    useEffect(() => {
        async function init() {
            try {
                const reqData = await getFilteredOvertimeRequest(
                    { status: 'open', departmentId: user.departmentId },
                    { page: 0, size: 50, sort: 'id,desc' }
                );
                setRequests(reqData.content || []);

                if (user.departmentId) {
                    const users = await getUsersByDepartment(user.departmentId);
                    setDeptEmployees(users || []);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to initialize data.");
            } finally {
                setLoadingReq(false);
            }
        }
        init();
    }, [user.departmentId]);

    const handleRequestChange = (event, newValue) => {
        setSelectedRequest(newValue);
        setError(null);

        if (newValue) {
            const fulfilledLineIds = new Set();
            if (newValue.overtimeTickets) {
                newValue.overtimeTickets.forEach(ticket => {
                    if (ticket.status !== 'rejected') {
                        ticket.employeeList?.forEach(emp => fulfilledLineIds.add(emp.lineId));
                    }
                });
            }

            const initialLines = newValue.lineDetails.map(d => ({
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
                    options={requests}
                    getOptionLabel={(option) => `Req #${option.id} - ${option.overtimeDate} (${option.startTime.substring(0,5)} - ${option.endTime.substring(0,5)})`}
                    value={selectedRequest}
                    onChange={handleRequestChange}
                    loading={loadingReq}
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
                                        <TableCell align="center">Required</TableCell>
                                        <TableCell align="center">Assigned</TableCell>
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
                                                <TableCell align="center">{line.numEmployees}</TableCell>
                                                <TableCell align="center">
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

            {/* NEW MODAL COMPONENT */}
            <EmployeeTransferList
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={`Assign Employees to: ${currentEditingLine?.lineName}`}
                allEmployees={deptEmployees}
                initialSelected={currentEditingLine ? (allocations[currentEditingLine.lineId] || []) : []}
                unavailableEmployees={currentEditingLine ? getUnavailableEmployeesMap(currentEditingLine.lineId) : new Map()}
                requestedCount={currentEditingLine ? currentEditingLine.numEmployees : 0}
                onSave={handleSaveAllocation}
            />
        </Container>
    );
}