import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import Layout from "./components/layout/Layout";
import CheckInPage from "./pages/attendance/CheckInPage";
import CheckOutPage from "./pages/attendance/CheckOutPage";
import HistoryPage from "./pages/attendance/HistoryPage";
import RegisterPage from "./pages/attendance/RegisterPage";
import OvertimeRequestForm from "./pages/moduleB/overtime/OvertimeRequestForm";
import OvertimeRequestList from "./pages/moduleB/overtime/OvertimeRequestList";
import OvertimeTicketList from "./pages/moduleB/overtime/OvertimeTicketList";
import OvertimeRequestDetail from "./pages/moduleB/overtime/OvertimeRequestDetail";
import OvertimeTicketDetail from "./pages/moduleB/overtime/OvertimeTicketDetail";
import OvertimeTicketCreate from "./pages/moduleB/overtime/OvertimeTicketCreate";
import LoginPage from "./pages/auth/Login";

function App()
{

    const userRole = 199010002;

    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout role={userRole} />}>
                        <Route path="/overtime-request" element={<OvertimeRequestList />} />
                        <Route path="/overtime-request/create" element={<OvertimeRequestForm />} />
                        <Route path="/overtime-ticket" element={<OvertimeTicketList />} />
                        <Route path="/attendance/checkin" element={<CheckInPage />} />
                        <Route path="/attendance/checkout" element={<CheckOutPage />} />
                        <Route path="/attendance/register" element={<RegisterPage />} />
                        <Route path="/attendance/history" element={<HistoryPage />} />
                        <Route path="/overtime-request/:id" element={<OvertimeRequestDetail />} />

                        {/* Ticket Routes */}
                        <Route path="/overtime-ticket" element={<OvertimeTicketList />} />
                        <Route path="/overtime-ticket/:id" element={<OvertimeTicketDetail />} />
                        <Route path="/overtime-ticket/create" element={<OvertimeTicketCreate />} />
                    </Route>
                     <Route path="/login" element={<LoginPage />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;