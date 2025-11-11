import React, { useState, useEffect } from 'react';
import { createOvertimeRequest } from '../../../services/moduleB/overtimeService';
import { getAllDepartments } from "../../../services/departmentService";
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Autocomplete,
    createFilterOptions
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
        overtimeTime: '',
        numEmployees: '',
        details: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getAllDepartments();
                setDepartments(data || []);
            } catch (err) {
                setError("Failed to fetch departments, please refresh the page");
            }
        }
        loadData();
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const payload = {
            factoryManager: { id: parseInt(formData.factoryManagerId) },
            department: { id: parseInt(formData.departmentId) },
            overtimeTime: parseFloat(formData.overtimeTime),
            numEmployees: parseInt(formData.numEmployees),
            details: formData.details
        };

        try {
            await createOvertimeRequest(payload);
            setSuccess('Overtime request created successfully!');
            // Reset form
            setFormData({
                factoryManagerId: '',
                departmentId: '',
                overtimeTime: '',
                numEmployees: '',
                details: ''
            });
        } catch (err) {
            setError(err.toString() || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    mt: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2, // Adds space between TextFields
                    p: 3,
                    boxShadow: 3,
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                }}
            >
                <Typography variant="h5" component="h1" gutterBottom>
                    Create Overtime Request
                </Typography>

                {/* These ID fields should be replaced with dropdowns */}
                <TextField
                    label="Factory Manager ID"
                    name="factoryManagerId"
                    value={formData.factoryManagerId}
                    onChange={handleChange}
                    fullWidth
                />

                {/* auto complete department */}
                <Autocomplete
                    id="department-autocomplete"
                    options={departments}
                    getOptionLabel={(option) => option.id + " - " + option.name || ''}

                    filterOptions={filter}

                    value={departments.find(dept => dept.id === formData.departmentId) || null}

                    onChange={(event, newValue) => {
                        setFormData(prev => ({
                            ...prev,
                            departmentId: newValue ? newValue.id : ''
                        }));
                    }}

                    // This renders the text field
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Department (search by name or id)"
                            fullWidth
                            // Show error if departments failed to load
                            error={!departments.length > 0}
                        />
                    )}
                />

                <TextField
                    label="Overtime Hours"
                    name="overtimeTime"
                    type="number"
                    value={formData.overtimeTime}
                    onChange={handleChange}
                    required
                    fullWidth
                    inputProps={{ step: "0.5", min: "0" }}
                />
                <TextField
                    label="Number of Employees"
                    name="numEmployees"
                    type="number"
                    value={formData.numEmployees}
                    onChange={handleChange}
                    required
                    fullWidth
                    inputProps={{ min: "1" }}
                />
                <TextField
                    label="Details / Reason"
                    name="details"
                    value={formData.details}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    fullWidth
                />

                {/* Show error or success messages */}
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{ mt: 2, height: 56 }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Submit Request'}
                </Button>
            </Box>
        </Container>
    );
}

export default OvertimeRequestForm;