import { BrowserRouter, Routes, Route } from "react-router-dom";
import OvertimeRequestList from "./pages/moduleB/overtime/OvertimeRequestList";
import OvertimeRequestForm from "./pages/moduleB/overtime/OvertimeRequestForm";
import Layout from "./components/layout/Layout";
import './App.css';
import OvertimeTicketList from "./pages/moduleB/overtime/OvertimeTicketList";
import OvertimeRequestDetail from "./pages/moduleB/overtime/OvertimeRequestDetail";
import OvertimeTicketDetail from "./pages/moduleB/overtime/OvertimeTicketDetail";
import OvertimeTicketCreate from "./pages/moduleB/overtime/OvertimeTicketCreate";

function App() {

    //hardcode user role for now
    const userRole = 199010002; //factory manager

    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout role={userRole} />}>
                        <Route path="/overtime-request" element={<OvertimeRequestList />} />
                        <Route path="/overtime-request/create" element={<OvertimeRequestForm />} />
                        <Route path="/overtime-ticket" element={<OvertimeTicketList />} />
                        <Route path="/overtime-request/:id" element={<OvertimeRequestDetail />} />

                        {/* Ticket Routes */}
                        <Route path="/overtime-ticket" element={<OvertimeTicketList />} />
                        <Route path="/overtime-ticket/:id" element={<OvertimeTicketDetail />} />
                        <Route path="/overtime-ticket/create" element={<OvertimeTicketCreate />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;