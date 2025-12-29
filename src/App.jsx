import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AuditReport from "./pages/AuditReport";
import AuditReportList from "./pages/AuditReportList";
import UploadAuditReport from "./pages/UploadAuditReport";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* 🌍 PUBLIC */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/api/VerifikasiLai" element={<AuditReport />} />
      <Route path="/login" element={<Login />} />

      {/* 🔒 PRIVATE */}
      <Route element={<ProtectedRoute />}>
        <Route path="/database" element={<AuditReportList />} />
        <Route path="/upload" element={<UploadAuditReport />} />
        <Route
          path="/database/audit-reports/:id/edit"
          element={<UploadAuditReport />}
        />
      </Route>
    </Routes>
  );
}
