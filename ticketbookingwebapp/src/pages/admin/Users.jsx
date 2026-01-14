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
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'ORGANIZER' // Restricted according to user request
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

    const showToast = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
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
                showToast("Organizer account created successfully!");
                fetchUsers();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleResetPassword = async (userId, fullName) => {
        if (!window.confirm(`Are you sure you want to reset the password for "${fullName}" to default (123456)?`)) {
            return;
        }

        try {
            const res = await api.resetUserPassword(userId);
            if (res.success) {
                showToast(`Password for ${fullName} has been reset to 123456`);
            }
        } catch (err) {
            console.error("Error resetting password:", err);
            showToast("Error resetting password: " + err.message, "error");
        }
    };

    const handleToggleLock = async (userId, fullName, currentlyLocked) => {
        const action = currentlyLocked ? "unlock" : "lock";
        if (!window.confirm(`Are you sure you want to ${action} the account of "${fullName}"?`)) {
            return;
        }

        try {
            const res = await api.toggleUserLock(userId, !currentlyLocked);
            if (res.success) {
                showToast(`Account for ${fullName} has been ${currentlyLocked ? 'unlocked' : 'locked'}`);
                fetchUsers();
            }
        } catch (err) {
            console.error("Error toggling lock:", err);
            showToast("Error toggling lock: " + err.message, "error");
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
                                                {user.is_locked ? (
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
                                                    <Tooltip title={user.is_locked ? "Unlock User" : "Lock User"}>
                                                        <IconButton
                                                            size="small"
                                                            color={user.is_locked ? "success" : "warning"}
                                                            onClick={() => handleToggleLock(user.user_id, user.full_name, user.is_locked)}
                                                        >
                                                            {user.is_locked ? <LockOpen fontSize="small" /> : <Block fontSize="small" />}
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

            <Snackbar
                open={toast.show}
                autoHideDuration={4000}
                onClose={() => setToast({ ...toast, show: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={toast.variant} sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UsersManagement;
