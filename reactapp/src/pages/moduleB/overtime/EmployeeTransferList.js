import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemIcon, ListItemText, Checkbox,
    Paper, Typography, TextField, InputAdornment,
    Stack, ToggleButton, ToggleButtonGroup, Divider,
    Avatar, Tooltip, ListItemAvatar
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import LockIcon from '@mui/icons-material/Lock';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import WarningIcon from '@mui/icons-material/Warning';

// --- HELPER FUNCTIONS ---
function intersection(a, b) {
    return a.filter((value) => b.indexOf(value) !== -1);
}

function not(a, b) {
    return a.filter((value) => b.indexOf(value) === -1);
}

function stringAvatar(name) {
    const nameParts = name ? name.split(' ') : ['?'];
    let initials = nameParts[0][0];
    if (nameParts.length > 1) {
        initials += nameParts[nameParts.length - 1][0];
    }
    return {
        sx: {
            bgcolor: stringToColor(name || ''),
            width: 32,
            height: 32,
            fontSize: '0.8rem',
            mr: 1
        },
        children: initials,
    };
}

function stringToColor(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
}

export default function EmployeeTransferList({
                                                 open,
                                                 onClose,
                                                 title,
                                                 allEmployees = [],
                                                 initialSelected = [],
                                                 unavailableEmployees = new Map(),
                                                 requestedCount = 0,
                                                 onSave
                                             }) {
    const [checked, setChecked] = useState([]);
    const [right, setRight] = useState([]);
    const [viewFilter, setViewFilter] = useState('available');
    const [searchTerm, setSearchTerm] = useState("");

    const left = useMemo(() => {
        const rightIds = new Set(right.map(u => u.id));
        return allEmployees.filter(u => !rightIds.has(u.id));
    }, [allEmployees, right]);

    useEffect(() => {
        if (open) {
            setRight(initialSelected);
            setChecked([]);
            setViewFilter('available');
            setSearchTerm("");
        }
    }, [open, initialSelected]);

    // --- LIMIT LOGIC ---
    const targetCount = requestedCount || 0;
    const selectedCount = right.length;
    const remainingSlots = Math.max(0, targetCount - selectedCount);
    const isFulfilled = targetCount > 0 && selectedCount >= targetCount;

    const filterList = (list, isSourceList) => {
        return list.filter(u => {
            const term = searchTerm.toLowerCase();
            const matchesSearch = (
                (u.fullName || '').toLowerCase().includes(term) ||
                (u.id || '').toString().includes(term) ||
                (u.email || '').toLowerCase().includes(term)
            );

            if (!matchesSearch) return false;

            if (isSourceList && viewFilter === 'available') {
                return !unavailableEmployees.has(u.id);
            }

            return true;
        });
    };

    const leftFiltered = filterList(left, true);
    const rightFiltered = filterList(right, false);

    const leftChecked = intersection(checked, leftFiltered);
    const rightChecked = intersection(checked, rightFiltered);

    const handleToggle = (value) => () => {
        if (unavailableEmployees.has(value.id) && left.includes(value)) return;
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];
        if (currentIndex === -1) newChecked.push(value);
        else newChecked.splice(currentIndex, 1);
        setChecked(newChecked);
    };

    const handleCheckedRight = () => {
        if (leftChecked.length > remainingSlots) return;
        setRight(right.concat(leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const handleAllRight = () => {
        const moveables = leftFiltered.filter(u => !unavailableEmployees.has(u.id));
        if (moveables.length > remainingSlots) {
            setRight(right.concat(moveables.slice(0, remainingSlots)));
        } else {
            setRight(right.concat(moveables));
        }
    };

    const handleAllLeft = () => {
        setRight(not(right, rightFiltered));
    };

    const isOverSelection = leftChecked.length > remainingSlots;

    // -- LIST RENDERER --
    const CustomList = ({ items, type }) => (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderColor: type === 'target' && isFulfilled ? 'success.light' : 'divider',
                borderWidth: type === 'target' && isFulfilled ? 2 : 1,
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <Box sx={{
                py: 1,
                px: 2,
                bgcolor: type === 'target' ? (isFulfilled ? 'success.50' : 'primary.50') : 'grey.100',
                borderBottom: 1,
                borderColor: 'divider',
                flexShrink: 0
            }}>
                <Typography variant="subtitle2" fontWeight="bold" align="center" color="text.primary">
                    {type === 'source' ? 'Available Candidates' : 'Selected Employees'}
                </Typography>
            </Box>

            <Divider />

            {/* List Body */}
            <List
                dense
                component="div"
                role="list"
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    bgcolor: 'background.paper'
                }}
            >
                {items.length === 0 ? (
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                        color="text.secondary"
                        p={3}
                        gap={1}
                    >
                        {type === 'source' ? <GroupAddIcon fontSize="large" color="disabled" /> : <PlaylistAddCheckIcon fontSize="large" color="disabled" />}
                        <Typography variant="caption">
                            {type === 'source' ? "No employees found" : "List is empty"}
                        </Typography>
                    </Box>
                ) : (
                    items.map((user) => {
                        const isUnavailable = unavailableEmployees.has(user.id);
                        const reason = unavailableEmployees.get(user.id);
                        const labelId = `transfer-list-item-${user.id}-label`;
                        const isChecked = checked.indexOf(user) !== -1;

                        return (
                            <ListItem
                                key={user.id}
                                role="listitem"
                                button
                                onClick={handleToggle(user)}
                                disabled={isUnavailable && type === 'source'}
                                divider
                                sx={{
                                    bgcolor: isChecked ? 'action.selected' : 'inherit'
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <Checkbox
                                        checked={isChecked}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                        disabled={isUnavailable && type === 'source'}
                                        size="small"
                                    />
                                </ListItemIcon>
                                <ListItemAvatar sx={{ minWidth: 40 }}>
                                    <Avatar {...stringAvatar(user.fullName)} />
                                </ListItemAvatar>
                                <ListItemText
                                    id={labelId}
                                    primary={
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: isUnavailable ? 'normal' : 'medium',
                                                    color: isUnavailable ? 'text.disabled' : 'text.primary'
                                                }}
                                            >
                                                {user.fullName}
                                            </Typography>
                                            {isUnavailable && type === 'source' && (
                                                <Tooltip title={reason} placement="top">
                                                    <LockIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                            ID: {user.id} • {user.lineName || 'Unassigned'}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        );
                    })
                )}
            </List>
        </Paper>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            PaperProps={{
                sx: {
                    width: '100%',
                    maxWidth: 900,
                    height: '80vh',
                    maxHeight: 800,
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', px: 3, py: 2, flexShrink: 0 }}>
                <Typography variant="h6" fontWeight="bold">{title}</Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#f8f9fa' }}>

                {/* TOOLBAR */}
                <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                        p: 1.5,
                        mb: 1,
                        bgcolor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexShrink: 0,
                        flexWrap: 'wrap'
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Find employee..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        sx={{
                            flex: 1,
                            minWidth: 180,
                            maxWidth: 280
                        }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                    />

                    <ToggleButtonGroup
                        value={viewFilter}
                        exclusive
                        onChange={(e, v) => v && setViewFilter(v)}
                        size="small"
                    >
                        <ToggleButton value="available">Available</ToggleButton>
                        <ToggleButton value="all">All</ToggleButton>
                    </ToggleButtonGroup>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* INTEGRATED COUNTER & WARNING */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: isOverSelection ? 'error.50' : (isFulfilled ? 'success.50' : 'primary.50'),
                        border: 1,
                        borderColor: isOverSelection ? 'error.light' : (isFulfilled ? 'success.light' : 'primary.light'),
                        color: isOverSelection ? 'error.main' : (isFulfilled ? 'success.main' : 'primary.main')
                    }}>
                        {isOverSelection ? (
                            <>
                                <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2" fontWeight="bold">
                                    Over Limit: Uncheck {leftChecked.length - remainingSlots}
                                </Typography>
                            </>
                        ) : (
                            <>
                                <AssignmentIndIcon fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2" fontWeight="bold">
                                    Selected: {selectedCount} / {targetCount}
                                </Typography>
                            </>
                        )}
                    </Box>
                </Paper>

                {/* TRANSFER AREA */}
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        flex: 1,
                        minHeight: 0
                    }}
                >
                    {/* LEFT COLUMN */}
                    <Box sx={{ width: '45%', height: '100%' }}>
                        {CustomList({ items: leftFiltered, type: 'source' })}
                    </Box>

                    {/* BUTTONS COLUMN */}
                    <Box sx={{ width: '10%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleAllRight}
                            disabled={leftFiltered.length === 0 || isFulfilled}
                            sx={{ minWidth: 40 }}
                        >
                            <KeyboardDoubleArrowRightIcon />
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCheckedRight}
                            disabled={leftChecked.length === 0 || isOverSelection || isFulfilled}
                            color={isOverSelection ? "error" : "primary"}
                            sx={{ minWidth: 40 }}
                        >
                            <KeyboardArrowRightIcon />
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCheckedLeft}
                            disabled={rightChecked.length === 0}
                            sx={{ minWidth: 40 }}
                        >
                            <KeyboardArrowLeftIcon />
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleAllLeft}
                            disabled={rightFiltered.length === 0}
                            sx={{ minWidth: 40 }}
                        >
                            <KeyboardDoubleArrowLeftIcon />
                        </Button>
                    </Box>

                    {/* RIGHT COLUMN */}
                    <Box sx={{ width: '45%', height: '100%' }}>
                        {CustomList({ items: rightFiltered, type: 'target' })}
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2, bgcolor: 'white', flexShrink: 0 }}>
                <Button onClick={onClose} color="inherit" sx={{ mr: 1 }}>Cancel</Button>
                <Button
                    onClick={() => onSave(right)}
                    variant="contained"
                    size="large"
                    disabled={right.length === 0 && initialSelected.length === 0}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}