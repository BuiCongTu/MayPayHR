import {BrowserRouter, Routes, Route} from "react-router-dom";
import OvertimeRequestList from "./pages/moduleB/overtime/OvertimeRequestList";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <Routes>
              <Route path="/overtime-request" element={<OvertimeRequestList />} />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
