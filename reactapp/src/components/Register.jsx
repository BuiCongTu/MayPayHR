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
    const [lines, setLines] = useState([]);
    const [skillLevels, setSkillLevels] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load departments and roles
        loadFormOptions();
    }, []);

    const loadFormOptions = async () => {
        try {
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
            setError('Không thể tải dữ liệu form');
        }
    };

    const onChange = async (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        // Clear error khi user thay đổi
        if (error) setError('');

        // Load lines when department changes
        if (name === 'departmentId' && value) {
            try {
                const linesList = await formDataService.getLinesByDepartment(value);
                setLines(linesList || []);
                setForm(prev => ({ ...prev, lineId: '' })); // Reset line
            } catch (err) {
                console.error('Failed to load lines:', err);
                setLines([]);
            }
        }
    };

    const validate = () => {
        // Kiểm tra các field bắt buộc
        if (!form.fullName.trim()) return 'Họ và tên là bắt buộc.';
        if (!form.email.trim()) return 'Email là bắt buộc.';
        if (!form.phone.trim()) return 'Số điện thoại là bắt buộc.';
        if (!form.password) return 'Mật khẩu là bắt buộc.';
        if (!form.roleId) return 'Vui lòng chọn vị trí.';
        if (!form.departmentId) return 'Vui lòng chọn phòng ban.';
        if (form.gender === '') return 'Vui lòng chọn giới tính.';

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) return 'Email không hợp lệ.';

        // Validation phone - 10-11 chữ số
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(form.phone)) return 'Số điện thoại phải từ 10-11 chữ số.';

        // Validation password
        if (form.password.length < 6) return 'Mật khẩu phải ít nhất 6 ký tự.';
        if (form.password !== form.confirmPassword) return 'Mật khẩu không trùng khớp.';

        // Validation baseSalary if provided
        if (form.baseSalary && isNaN(form.baseSalary)) return 'Lương cơ bản phải là số.';

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
            setError(err.response?.data?.message || err.message || 'Đăng ký thất bại.');
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
                            MayPayHR
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Đăng ký tài khoản nhân viên
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
                            label="Họ và tên"
                            name="fullName"
                            value={form.fullName}
                            onChange={onChange}
                            margin="normal"
                            required
                            placeholder="Nhập họ và tên"
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
                            label="Số điện thoại"
                            name="phone"
                            value={form.phone}
                            onChange={onChange}
                            margin="normal"
                            required
                            placeholder="0123456789"
                            disabled={loading}
                        />

                        {/* Password */}
                        <TextField
                            fullWidth
                            label="Mật khẩu"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={onChange}
                            margin="normal"
                            required
                            placeholder="Ít nhất 6 ký tự"
                            disabled={loading}
                        />

                        {/* Confirm Password */}
                        <TextField
                            fullWidth
                            label="Xác nhận mật khẩu"
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
                            label="Giới tính"
                            name="gender"
                            value={form.gender}
                            onChange={onChange}
                            margin="normal"
                            required
                            disabled={loading}
                        >
                            <MenuItem value="">-- Chọn giới tính --</MenuItem>
                            <MenuItem value="true">Nam</MenuItem>
                            <MenuItem value="false">Nữ</MenuItem>
                        </TextField>

                        {/* Role ID */}
                        <TextField
                            fullWidth
                            select
                            label="Vị trí công việc"
                            name="roleId"
                            value={form.roleId}
                            onChange={onChange}
                            margin="normal"
                            required
                            disabled={loading}
                        >
                            <MenuItem value="">-- Chọn vị trí --</MenuItem>
                            {roles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Department ID */}
                        <TextField
                            fullWidth
                            select
                            label="Phòng ban"
                            name="departmentId"
                            value={form.departmentId}
                            onChange={onChange}
                            margin="normal"
                            required
                            disabled={loading}
                        >
                            <MenuItem value="">-- Chọn phòng ban --</MenuItem>
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
                            label="Chuyền"
                            name="lineId"
                            value={form.lineId}
                            onChange={onChange}
                            margin="normal"
                            disabled={loading || !form.departmentId}
                            helperText={!form.departmentId ? "Vui lòng chọn phòng ban trước" : ""}
                        >
                            <MenuItem value="">-- Chọn chuyền --</MenuItem>
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
                            label="Trình độ kỹ năng"
                            name="skillLevelId"
                            value={form.skillLevelId}
                            onChange={onChange}
                            margin="normal"
                            disabled={loading}
                        >
                            <MenuItem value="">-- Chọn trình độ --</MenuItem>
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
                            label="Loại lương"
                            name="salaryType"
                            value={form.salaryType}
                            onChange={onChange}
                            margin="normal"
                            disabled={loading}
                        >
                            <MenuItem value="TimeBased">Theo thời gian</MenuItem>
                            <MenuItem value="ProductBased">Theo sản phẩm</MenuItem>
                        </TextField>

                        {/* Base Salary */}
                        <TextField
                            fullWidth
                            label="Lương cơ bản"
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
                            label="Ngày vào làm"
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
                            label="Phương thức xác nhận"
                            name="verificationMethod"
                            value={form.verificationMethod}
                            onChange={onChange}
                            margin="normal"
                            disabled={loading}
                        >
                            <MenuItem value="EMAIL">Email</MenuItem>
                            <MenuItem value="PHONE">SMS (Số điện thoại)</MenuItem>
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
                                'Đăng ký'
                            )}
                        </Button>
                    </form>

                    {/* Link to Login */}
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Đã có tài khoản?{' '}
                            <span
                                onClick={() => navigate('/login')}
                                style={{
                                    color: '#667eea',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    textDecoration: 'underline'
                                }}
                            >
                Đăng nhập ngay
              </span>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}