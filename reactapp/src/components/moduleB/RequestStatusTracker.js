import React from 'react';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    StepConnector,
    Typography,
    stepConnectorClasses,
    styled
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import PaidIcon from '@mui/icons-material/Paid';
import CancelIcon from '@mui/icons-material/Cancel';

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage: 'linear-gradient( 95deg,rgb(33, 150, 243) 0%,rgb(33, 203, 243) 50%,rgb(136, 225, 242) 100%)',
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage: 'linear-gradient( 95deg,rgb(76, 175, 80) 0%,rgb(139, 195, 74) 50%,rgb(205, 220, 57) 100%)',
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        height: 3,
        border: 0,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
        borderRadius: 1,
    },
}));

// Custom Icon Container
const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    // Dynamic Styling based on state
    ...(ownerState.active && {
        backgroundImage: 'linear-gradient( 136deg, rgb(33, 150, 243) 0%, rgb(33, 203, 243) 50%, rgb(136, 225, 242) 100%)',
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    }),
    ...(ownerState.completed && {
        backgroundImage: 'linear-gradient( 136deg, rgb(76, 175, 80) 0%, rgb(139, 195, 74) 50%, rgb(205, 220, 57) 100%)',
    }),
    ...(ownerState.error && {
        backgroundImage: 'linear-gradient( 136deg, #d32f2f 0%, #f44336 50%, #ffcdd2 100%)',
    }),
}));

function ColorlibStepIcon(props) {
    const { active, completed, className, icon, error } = props;

    const icons = {
        1: <WorkHistoryIcon />,
        2: <HourglassBottomIcon />,
        3: <PaidIcon />,
    };

    let content = icons[String(icon)];
    if (error) content = <CancelIcon />;
    else if (completed) content = <CheckCircleIcon />;

    return (
        <ColorlibStepIconRoot ownerState={{ completed, active, error }} className={className}>
            {content}
        </ColorlibStepIconRoot>
    );
}

// --- 3. MAIN TRACKER COMPONENT ---
export default function RequestStatusTracker({ status }) {
    let activeStep = 0;
    let isError = false;
    let errorLabel = "";

    const normalizedStatus = status ? status.toLowerCase() : 'pending';

    switch (normalizedStatus) {
        case 'pending':
            activeStep = 0;
            break;
        case 'open':
            activeStep = 1;
            break;
        case 'rejected':
            activeStep = 0;
            isError = true;
            errorLabel = "Rejected by Director";
            break;
        case 'expired':
            activeStep = 1;
            isError = true;
            errorLabel = "Expired / Timed Out";
            break;
        case 'processed':
            activeStep = 3;
            break;
        default:
            activeStep = 0;
    }

    const steps = [
        { label: isError && activeStep === 0 ? errorLabel : 'Submission & Review', sub: 'Waiting for FD Approval' },
        { label: isError && activeStep === 1 ? errorLabel : 'Execution & Tickets', sub: 'Line Managers Assign Employees' },
        { label: 'Processing', sub: 'Finalize for Payroll' },
    ];

    return (
        <Box sx={{ width: '100%', py: 2 }}>
            <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
                {steps.map((step, index) => {
                    // Determine if this specific step failed
                    const stepFailed = isError && activeStep === index;

                    return (
                        <Step key={step.label}>
                            <StepLabel
                                error={stepFailed}
                                StepIconComponent={(props) => (
                                    <ColorlibStepIcon {...props} error={stepFailed} />
                                )}
                            >
                                <Typography variant="subtitle2" fontWeight="bold" color={stepFailed ? "error" : "inherit"}>
                                    {step.label}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" display="block">
                                    {step.sub}
                                </Typography>
                            </StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
        </Box>
    );
}