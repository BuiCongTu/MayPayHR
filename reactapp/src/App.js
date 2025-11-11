import {BrowserRouter, Routes, Route} from "react-router-dom";
import OvertimeRequestList from "./pages/moduleB/overtime/OvertimeRequestList";
import OvertimeRequestForm from "./pages/moduleB/overtime/OvertimeRequestForm";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <Routes>
              <Route path="/overtime-request" element={<OvertimeRequestList />} />
              <Route path="/overtime-request/create" element={<OvertimeRequestForm />} />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
