import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landipage from "./pages/landipage";

import AuditReportList from "./pages/AuditReportList";
import AuditReport from "./pages/AuditReport";
import UploadAuditReport from "./pages/UploadAuditReport";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landipage />} />

        <Route path="/upload" element={<UploadAuditReport />} />
        <Route path="/audit/:id" element={<AuditReport />} />

        <Route path="/database" element={<AuditReportList />} />
        <Route
          path="/database/audit-reports/:id/edit"
          element={<UploadAuditReport />}
        />
      </Routes>
    </BrowserRouter>
  );
}
