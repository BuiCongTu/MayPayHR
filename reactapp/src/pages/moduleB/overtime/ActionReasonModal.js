import React, {useState, useEffect} from 'react';
import {
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';

function ActionReasonModal({
                               open,
                               onClose,
                               onSubmit,
                               title,
                               label,
                               submitText,
                               submitColor = "primary"
                           }) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    // Clear state when modal opens
    useEffect(() => {
        if (open) {
            setReason("");
            setError("");
        }
    }, [open]);

    const handleSubmit = () => {
        if (!reason || reason.trim() === "") {
            setError("Reason cannot be empty.");
            return;
        }
        onSubmit(reason);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="action-reason"
                    label={label}
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={reason}
                    onChange={(e) => {
                        setReason(e.target.value);
                        if (e.target.value) setError("");
                    }}
                    multiline
                    rows={3}
                    error={!!error}
                    helperText={error}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color={submitColor}>
                    {submitText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ActionReasonModal;