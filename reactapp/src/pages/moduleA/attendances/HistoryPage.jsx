import axios from 'axios';
import { useEffect, useState } from 'react';

export default function HistoryPage() {
    const [attendancesData, setAttendancesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [userIds, setUserIds] = useState(null);
    const [view, setView] = useState('personal');

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
    })

    return (
        <div>HistoryPage</div>
    )
}