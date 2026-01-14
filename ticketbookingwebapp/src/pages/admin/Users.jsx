import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    IconButton,
    Chip,
    Avatar,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Tooltip,
    Stack,
    Snackbar
} from '@mui/material';
import {
    Search,
    PersonAdd,
    Refresh,
    Edit,
    VpnKey,
    Block,
    CheckCircle,
    DeleteOutline,
    LockOpen,
    Lock
} from '@mui/icons-material';
import { api } from '../../services/api';

const UsersManagement = () => {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'ORGANIZER' // Restricted according to user request
    });
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        userId: null,
        fullName: '',
        type: 'RESET', // 'RESET' or 'LOCK'
        currentlyLocked: false
    });
    const [resultDialog, setResultDialog] = useState({
        open: false,
        title: '',
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.getAllUsers();
            if (res.success) setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Failed to load users data.");
        } finally {
            setLoading(false);
        }
    };

    const showResult = (title, message, severity = 'success') => {
        setResultDialog({ open: true, title, message, severity });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            setCreating(true);
            setError(null);
            // We send a dummy username or modify backend to not require it. 
            // For now, let's assume email can be used as username or backend handles it.
            const res = await api.createUser({ ...newUser, username: newUser.email });
            if (res.success) {
                setShowCreateModal(false);
                setNewUser({ email: '', password: '', full_name: '', role: 'ORGANIZER' });
                showResult("Thành công", "Đã tạo tài khoản nhà tổ chức thành công!");
                fetchUsers();
            }
        } catch (err) {
            showResult("Lỗi", err.message, "error");
        } finally {
            setCreating(false);
        }
    };

    const handleResetPassword = (userId, fullName) => {
        setConfirmDialog({
            open: true,
            userId,
            fullName,
            type: 'RESET'
        });
    };

    const handleToggleLock = (userId, fullName, currentlyLocked) => {
        setConfirmDialog({
            open: true,
            userId,
            fullName,
            type: 'LOCK',
            currentlyLocked
        });
    };

    const processConfirmAction = async () => {
        const { userId, fullName, type, currentlyLocked } = confirmDialog;
        setConfirmDialog({ ...confirmDialog, open: false });

        try {
            if (type === 'RESET') {
                const res = await api.resetUserPassword(userId);
                if (res.success) {
                    showResult("Thành công", "Đã khôi phục mật khẩu thành công!");
                }
            } else if (type === 'LOCK') {
                const res = await api.toggleUserLock(userId, !currentlyLocked);
                if (res.success) {
                    const actionText = currentlyLocked ? 'mở khóa' : 'khóa';
                    showResult("Thành công", `Đã ${actionText} tài khoản thành công!`);
                    fetchUsers();
                }
            }
        } catch (err) {
            console.error(`Error in ${type}:`, err);
            showResult("Lỗi", err.message, "error");
        }
    };

    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getRoleColor = (role) => {
        const roles = {
            'ADMIN': 'error',
            'ORGANIZER': 'primary',
            'USER': 'secondary'
        };
        return roles[role] || 'default';
    };

    const getRoleLabel = (role) => {
        const roles = {
            'ADMIN': 'Administrator',
            'ORGANIZER': 'Organizer',
            'USER': 'Customer'
        };
        return roles[role] || role;
    };

    if (loading && users.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Users Management
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Manage Organizer accounts and monitor user activity
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchUsers}
                        sx={{ borderRadius: 1.5 }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={() => setShowCreateModal(true)}
                        sx={{ borderRadius: 1.5 }}
                    >
                        Create Organizer
                    </Button>
                </Stack>
            </Stack>

            <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="disabled" fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ maxWidth: 400 }}
                        />
                    </Box>
                    <TableContainer>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Full Name & Email</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Joined Date</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, pr: 3 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.user_id} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: `${getRoleColor(user.role)}.lighter`,
                                                            color: `${getRoleColor(user.role)}.main`,
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        {user.full_name?.charAt(0) || 'U'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {user.full_name || 'Anonymous'}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {user.email}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getRoleLabel(user.role)}
                                                    color={getRoleColor(user.role)}
                                                    size="small"
                                                    sx={{ borderRadius: 1, fontWeight: 600, minWidth: 100 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {!user.is_active ? (
                                                    <Chip
                                                        label="Locked"
                                                        color="error"
                                                        size="small"
                                                        variant="outlined"
                                                        icon={<Lock style={{ fontSize: 14 }} />}
                                                        sx={{ borderRadius: 1 }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="Active"
                                                        color="success"
                                                        size="small"
                                                        variant="outlined"
                                                        icon={<CheckCircle style={{ fontSize: 14 }} />}
                                                        sx={{ borderRadius: 1 }}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="textSecondary">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'Default'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={{ pr: 2 }}>
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Tooltip title={!user.is_active ? "Unlock User" : "Lock User"}>
                                                        <IconButton
                                                            size="small"
                                                            color={!user.is_active ? "success" : "warning"}
                                                            onClick={() => handleToggleLock(user.user_id, user.full_name, !user.is_active)}
                                                        >
                                                            {!user.is_active ? <LockOpen fontSize="small" /> : <Block fontSize="small" />}
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reset Password">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleResetPassword(user.user_id, user.full_name)}
                                                        >
                                                            <VpnKey fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                            <Typography color="textSecondary">No users found matching your search.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Create Organizer Dialog */}
            <Dialog
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <form onSubmit={handleCreateUser}>
                    <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            Create Organizer Account
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ px: 3 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                            Enter the details for the new event organizer. They will be able to host and manage events.
                        </Typography>
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    required
                                    placeholder="e.g. John Doe / Company Name"
                                    value={newUser.full_name}
                                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    required
                                    placeholder="organizer@example.com"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Initial Password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setShowCreateModal(false)} color="inherit">
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={creating}
                            sx={{ px: 4, borderRadius: 1.5 }}
                        >
                            {creating ? <CircularProgress size={24} /> : 'Create Organizer'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
                PaperProps={{ sx: { borderRadius: 2, minWidth: 320 } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {confirmDialog.type === 'RESET' ? 'Xác nhận khôi phục mật khẩu' : 'Xác nhận thay đổi trạng thái'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {confirmDialog.type === 'RESET' ? (
                            <>Bạn có chắc chắn muốn khôi phục mật khẩu cho tài khoản <strong>{confirmDialog.fullName}</strong> về mặc định?</>
                        ) : (
                            <>Bạn có chắc chắn muốn <strong>{confirmDialog.currentlyLocked ? 'mở khóa' : 'khóa'}</strong> tài khoản của <strong>{confirmDialog.fullName}</strong>?</>
                        )}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={processConfirmAction} variant="contained" color="primary" sx={{ borderRadius: 1.5 }}>
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Result Dialog */}
            <Dialog
                open={resultDialog.open}
                onClose={() => setResultDialog({ ...resultDialog, open: false })}
                PaperProps={{ sx: { borderRadius: 2, minWidth: 320 } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                    {resultDialog.severity === 'success' ? (
                        <CheckCircle color="success" />
                    ) : (
                        <Block color="error" />
                    )}
                    {resultDialog.title}
                </DialogTitle>
                <DialogContent>
                    <Typography>{resultDialog.message}</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        fullWidth
                        onClick={() => setResultDialog({ ...resultDialog, open: false })}
                        variant="contained"
                        color="primary"
                        sx={{ borderRadius: 1.5 }}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default UsersManagement;
