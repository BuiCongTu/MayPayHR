import
    {
        Alert,
        Box,
        Button,
        CircularProgress,
        Container,
        MenuItem,
        Paper,
        TextField,
        Typography
    } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import * as formDataService from '../services/formDataService';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        roleId: '',
        departmentId: '',
        lineId: '',
        skillLevelId: '',
        gender: '',
        salaryType: 'TimeBased',
        baseSalary: '',
        hireDate: '',
        verificationMethod: 'EMAIL'
    });

    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [lines, setLines] = useState([]);
    const [skillLevels, setSkillLevels] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        loadFormOptions();
    }, []);

    useEffect(() => {
        if (currentUser && roles.length > 0) {
            filterAvailableRoles(currentUser.roleName, roles);
        }
    }, [currentUser, roles]);

    const loadFormOptions = async () => {
        try {
            const user = authService.getCurrentUser();
            if (user) {
                setCurrentUser(user);
            }

            const [depts, rolesList, skillLevelsList] = await Promise.all([
                formDataService.getDepartments(),
                formDataService.getRoles(),
                formDataService.getSkillLevels()
            ]);
            setDepartments(depts || []);
            setRoles(rolesList || []);
            setSkillLevels(skillLevelsList || []);
        } catch (err) {
            console.error('Failed to load form options:', err);
            setError('Failed to load form options');
        }
    };

    const filterAvailableRoles = (currentUserRole, allRoles) => {
        let availableRoleNames = [];

        if (currentUserRole === 'Admin') {
            availableRoleNames = allRoles
                .filter(role => role.name !== 'Admin')
                .map(role => role.name);
        } else if (currentUserRole === 'HR') {
            availableRoleNames = ['Factory Manager', 'Manager', 'Leader', 'Assistant Leader', 'Worker'];
        } else if (currentUserRole === 'Factory Director') {
            availableRoleNames = [];
        } else {
            availableRoleNames = [];
        }

        const filtered = allRoles.filter(role => availableRoleNames.includes(role.name));
        setFilteredRoles(filtered);
    };

    const onChange = async (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (error) setError('');

        if (name === 'departmentId' && value) {
            try {
                const linesList = await formDataService.getLinesByDepartment(value);
                setLines(linesList || []);
                setForm(prev => ({ ...prev, lineId: '' }));
            } catch (err) {
                console.error('Failed to load lines:', err);
                setLines([]);
            }
        }
    };

    const validate = () => {
        // Kiểm tra các field bắt buộc
        if (!form.fullName.trim()) return 'Full name is required.';
        if (!form.email.trim()) return 'Email is required.';
        if (!form.phone.trim()) return 'Phone number is required.';
        if (!form.password) return 'Password is required.';
        if (!form.roleId) return 'Please select a role.';
        if (!form.departmentId) return 'Please select a department.';
        if (form.gender === '') return 'Please select a gender.';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) return 'Invalid email address.';

            // Validation phone - 10-11 digits
        const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(form.phone)) return 'Phone number must be 10-11 digits.';

        if (form.password.length < 6) return 'Password must be at least 6 characters.';
        if (form.password !== form.confirmPassword) return 'Passwords do not match.';
        
        if (form.baseSalary && isNaN(form.baseSalary)) return 'Base salary must be a number.';

        return '';
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            const registerData = {
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                password: form.password,
                roleId: parseInt(form.roleId),
                departmentId: parseInt(form.departmentId),
                verificationMethod: form.verificationMethod,
                gender: form.gender === 'true',
                lineId: form.lineId ? parseInt(form.lineId) : null,
                skillLevelId: form.skillLevelId ? parseInt(form.skillLevelId) : null,
                salaryType: form.salaryType || 'TimeBased',
                baseSalary: form.baseSalary ? parseFloat(form.baseSalary) : null,
                hireDate: form.hireDate || null
            };

            const response = await authService.register(registerData);

            if (response.success) {
                // Redirect to verification page with token
                navigate('/verify-registration', {
                    state: { 
                        token: response.data.token,
                        verificationMethod: form.verificationMethod 
                    }
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed.');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: 2
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={10}
                    sx={{
                        padding: 4,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
                            May Production Human Reource Management System
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Register Employee Account
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={onSubmit}>
                        {/* Full Name */}
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="fullName"
                            value={form.fullName}
                            onChange={onChange}
                            margin="normal"
                            required
                            placeholder="Enter full name"
                            disabled={loading}
                        />

                        {/* Email */}
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={onChange}
                            margin="normal"
                            required
                            placeholder="example@email.com"
                            disabled={loading}
                        />

                        {/* Phone */}
                        <TextField
                            fullWidth
                            label="Phone Number"
                            name="phone"
                            value={form.phone}
                            onChange={onChange}
                            margin="normal"
                            required
                            placeholder="0123456789 ( 10-11 digits )"
                            disabled={loading}
                        />

                        {/* Password */}
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={onChange}
                            margin="normal"
                            required
                            placeholder="At least 6 characters"
                            disabled={loading}
                        />

                        {/* Confirm Password */}
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={onChange}
                            margin="normal"
                            required
                            disabled={loading}
                        />

                        {/* Gender */}
                        <TextField
                            fullWidth
                            select
                            label="Gender"
                            name="gender"
                            value={form.gender}
                            onChange={onChange}
                            margin="normal"
                            required
                            disabled={loading}
                        >
                            <MenuItem value="">-- Select Gender --</MenuItem>
                            <MenuItem value="true">Male</MenuItem>
                            <MenuItem value="false">Female</MenuItem>
                        </TextField>

                        {/* Role ID */}
                        <TextField
                            fullWidth
                            select
                            label="Job Position"
                            name="roleId"
                            value={form.roleId}
                            onChange={onChange}
                            margin="normal"
                            required
                            disabled={loading || !currentUser || filteredRoles.length === 0}
                            helperText={
                                !currentUser
                                    ? "Please log in to see available positions"
                                    : filteredRoles.length === 0
                                    ? "You do not have permission to register users with any positions"
                                    : ""
                            }
                        >
                            <MenuItem value="">-- Chọn vị trí --</MenuItem>
                            {filteredRoles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Department ID */}
                        <TextField
                            fullWidth
                            select
                            label="Department"
                            name="departmentId"
                            value={form.departmentId}
                            onChange={onChange}
                            margin="normal"
                            required
                            disabled={loading}
                        >
                            <MenuItem value="">-- Select Department --</MenuItem>
                            {departments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Line ID */}
                        <TextField
                            fullWidth
                            select
                            label="Section"
                            name="lineId"
                            value={form.lineId}
                            onChange={onChange}
                            margin="normal"
                            disabled={loading || !form.departmentId}
                            helperText={!form.departmentId ? "Please select a department first" : ""}
                        >
                            <MenuItem value="">-- Select Section --</MenuItem>
                            {lines.map((line) => (
                                <MenuItem key={line.id} value={line.id}>
                                    {line.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Skill Level */}
                        <TextField
                            fullWidth
                            select
                            label="Skill Level"
                            name="skillLevelId"
                            value={form.skillLevelId}
                            onChange={onChange}
                            margin="normal"
                            disabled={loading}
                        >
                            <MenuItem value="">-- Select Skill Level --</MenuItem>
                            {skillLevels.map((level) => (
                                <MenuItem key={level.id} value={level.id}>
                                    {level.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Salary Type */}
                        <TextField
                            fullWidth
                            select
                            label="Salary Type"
                            name="salaryType"
                            value={form.salaryType}
                            onChange={onChange}
                            margin="normal"
                            disabled={loading}
                        >
                            <MenuItem value="TimeBased">Time Based</MenuItem>
                            <MenuItem value="ProductBased">Product Based</MenuItem>
                        </TextField>

                        {/* Base Salary */}
                        <TextField
                            fullWidth
                            label="Base Salary"
                            name="baseSalary"
                            type="number"
                            value={form.baseSalary}
                            onChange={onChange}
                            margin="normal"
                            placeholder="8000000"
                            disabled={loading}
                        />

                        {/* Hire Date */}
                        <TextField
                            fullWidth
                            label="Hire Date"
                            name="hireDate"
                            type="date"
                            value={form.hireDate}
                            onChange={onChange}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                            disabled={loading}
                        />

                        {/* Verification Method */}
                        <TextField
                            fullWidth
                            select
                            label="Verification Method"
                            name="verificationMethod"
                            value={form.verificationMethod}
                            onChange={onChange}
                            margin="normal"
                            disabled={loading}
                        >
                            <MenuItem value="EMAIL">Email</MenuItem>
                            <MenuItem value="PHONE">SMS (Phone Number)</MenuItem>
                        </TextField>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                fontSize: '16px',
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)',
                                }
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Register'
                            )}
                        </Button>
                    </form>

                    {/* Link to Login */}
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{' '}
                            <span
                                onClick={() => navigate('/login')}
                                style={{
                                    color: '#667eea',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    textDecoration: 'underline'
                                }}
                            >
                Login now
              </span>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}