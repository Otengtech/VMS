import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const Drivers = () => {
  // State management
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [terminals, setTerminals] = useState([]);
  
  // Form state matching the MongoDB schema
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    status: 'active',
    vehicleAssigned: '',
    terminal: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
    fetchTerminals();
  }, [page, rowsPerPage, searchTerm]);

  // Fetch drivers from API
  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/drivers?page=${page + 1}&limit=${rowsPerPage}&search=${searchTerm}`);
      const data = await response.json();
      setDrivers(data.drivers || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      showSnackbar('Error fetching drivers', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch vehicles for assignment
  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles?status=active');
      const data = await response.json();
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // Fetch terminals for assignment
  const fetchTerminals = async () => {
    try {
      const response = await fetch('/api/terminals?status=active');
      const data = await response.json();
      setTerminals(data.terminals || []);
    } catch (error) {
      console.error('Error fetching terminals:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.licenseNumber?.trim()) {
      errors.licenseNumber = 'License number is required';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (formData.licenseExpiry && new Date(formData.licenseExpiry) < new Date()) {
      errors.licenseExpiry = 'License has expired';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open dialog for adding new driver
  const handleAddClick = () => {
    setDialogMode('add');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '',
      status: 'active',
      vehicleAssigned: '',
      terminal: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      notes: ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Open dialog for editing driver
  const handleEditClick = (driver) => {
    setDialogMode('edit');
    setSelectedDriver(driver);
    setFormData({
      firstName: driver.firstName || '',
      lastName: driver.lastName || '',
      email: driver.email || '',
      phone: driver.phone || '',
      licenseNumber: driver.licenseNumber || '',
      licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.split('T')[0] : '',
      status: driver.status || 'active',
      vehicleAssigned: driver.vehicleAssigned?._id || driver.vehicleAssigned || '',
      terminal: driver.terminal?._id || driver.terminal || '',
      address: driver.address || '',
      emergencyContact: driver.emergencyContact || '',
      emergencyPhone: driver.emergencyPhone || '',
      notes: driver.notes || ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Open dialog for viewing driver
  const handleViewClick = (driver) => {
    setDialogMode('view');
    setSelectedDriver(driver);
    setOpenDialog(true);
  };

  // Handle delete driver
  const handleDeleteClick = async (driverId) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        const response = await fetch(`/api/drivers/${driverId}`, { 
          method: 'DELETE' 
        });
        
        if (response.ok) {
          showSnackbar('Driver deleted successfully', 'success');
          fetchDrivers();
          fetchVehicles(); // Refresh vehicles list
          fetchTerminals(); // Refresh terminals list
        } else {
          showSnackbar('Error deleting driver', 'error');
        }
      } catch (error) {
        showSnackbar('Error deleting driver', 'error');
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the errors in the form', 'error');
      return;
    }

    setLoading(true);
    try {
      const url = dialogMode === 'add' ? '/api/drivers' : `/api/drivers/${selectedDriver?._id}`;
      const method = dialogMode === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showSnackbar(
          `Driver ${dialogMode === 'add' ? 'added' : 'updated'} successfully`,
          'success'
        );
        setOpenDialog(false);
        fetchDrivers();
        fetchVehicles(); // Refresh vehicles list
        fetchTerminals(); // Refresh terminals list
      } else {
        const error = await response.json();
        showSnackbar(error.message || 'Error saving driver', 'error');
      }
    } catch (error) {
      showSnackbar('Error saving driver', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show snackbar message
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Check if license is expired
  const isLicenseExpired = (expiryDate) => {
    return expiryDate && new Date(expiryDate) < new Date();
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Driver Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Driver
        </Button>
      </Box>

      {/* Search and Filter Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search drivers by name, email, phone, or license number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              size="small"
            />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                fetchDrivers();
                fetchVehicles();
                fetchTerminals();
              }}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Driver</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>License</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Terminal</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : drivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">
                      No drivers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                drivers.map((driver) => (
                  <TableRow 
                    key={driver._id} 
                    hover 
                    onClick={() => handleViewClick(driver)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {driver.firstName?.[0]}{driver.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {driver.firstName} {driver.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            License: {driver.licenseNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{driver.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {driver.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          Exp: {driver.licenseExpiry ? format(new Date(driver.licenseExpiry), 'dd/MM/yyyy') : 'N/A'}
                        </Typography>
                        {isLicenseExpired(driver.licenseExpiry) && (
                          <Chip
                            icon={<PersonIcon />}
                            label="Expired"
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {driver.vehicleAssigned ? (
                        <Chip
                          icon={<PersonIcon />}
                          label={driver.vehicleAssigned.registrationNumber || 'Assigned'}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      ) : (
                        <Chip label="Not Assigned" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      {driver.terminal ? (
                        <Chip
                          icon={<PersonIcon />}
                          label={driver.terminal.name || 'Terminal'}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ) : (
                        <Chip label="No Terminal" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={driver.status}
                        color={getStatusColor(driver.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(driver)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(driver._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit/View Driver Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' && 'Add New Driver'}
          {dialogMode === 'edit' && 'Edit Driver'}
          {dialogMode === 'view' && 'Driver Details'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Personal Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  disabled={dialogMode === 'view'}
                  required
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  disabled={dialogMode === 'view'}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={dialogMode === 'view'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={dialogMode === 'view'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={dialogMode === 'view'}
                  multiline
                  rows={2}
                  size="small"
                />
              </Grid>

              {/* License Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  License Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License Number"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  error={!!formErrors.licenseNumber}
                  helperText={formErrors.licenseNumber}
                  disabled={dialogMode === 'view'}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License Expiry"
                  name="licenseExpiry"
                  type="date"
                  value={formData.licenseExpiry}
                  onChange={handleInputChange}
                  error={!!formErrors.licenseExpiry}
                  helperText={formErrors.licenseExpiry}
                  disabled={dialogMode === 'view'}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>

              {/* Assignments */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Assignments
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" disabled={dialogMode === 'view'}>
                  <InputLabel>Vehicle Assignment</InputLabel>
                  <Select
                    name="vehicleAssigned"
                    value={formData.vehicleAssigned}
                    onChange={handleInputChange}
                    label="Vehicle Assignment"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {vehicles.map((vehicle) => (
                      <MenuItem key={vehicle._id} value={vehicle._id}>
                        {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" disabled={dialogMode === 'view'}>
                  <InputLabel>Terminal</InputLabel>
                  <Select
                    name="terminal"
                    value={formData.terminal}
                    onChange={handleInputChange}
                    label="Terminal"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {terminals.map((terminal) => (
                      <MenuItem key={terminal._id} value={terminal._id}>
                        {terminal.name} - {terminal.location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" disabled={dialogMode === 'view'}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Emergency Contact */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Emergency Contact
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  disabled={dialogMode === 'view'}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Phone"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  disabled={dialogMode === 'view'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  size="small"
                />
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Additional Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  disabled={dialogMode === 'view'}
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : (dialogMode === 'add' ? 'Add' : 'Update')}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Drivers;