import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { QRCodeCanvas } from "qrcode.react";
import { LogOut } from "lucide-react";

export default function AuditReportList() {
  const navigate = useNavigate();
  const qrRef = useRef(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* SEARCH & FILTER */
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");

  /* QR MODAL */
  const [qrOpen, setQrOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);

    const { data, error } = await supabase
      .from("audit_reports")
      .select("id, nama_kap, nama_klien, periode, no_lai, created_at")
      .order("created_at", { ascending: false });

    if (error) setError("Gagal mengambil data laporan");
    else setData(data || []);

    setLoading(false);
  }

  /* ================= FILTER DATA ================= */

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const text =
        `${row.nama_klien} ${row.nama_kap} ${row.no_lai}`.toLowerCase();
      const matchSearch = text.includes(search.toLowerCase());

      const year = new Date(row.created_at).getFullYear();
      const matchYear = yearFilter === "all" || String(year) === yearFilter;

      return matchSearch && matchYear;
    });
  }, [data, search, yearFilter]);

  /* ================= ACTIONS ================= */

  async function handleDelete(id) {
    const ok = window.confirm(
      "Yakin ingin menghapus laporan audit ini?\nData tidak dapat dikembalikan."
    );
    if (!ok) return;

    await supabase.from("audit_reports").delete().eq("id", id);
    setData((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleLogout() {
    const ok = window.confirm("Yakin ingin logout?");
    if (!ok) return;

    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  function openQr(id) {
    setQrValue(`${window.location.origin}/api/VerifikasiLai?code=${id}`);
    setQrOpen(true);
  }

  function downloadQr() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "qr-laporan-audit.png";
    link.click();
  }

  if (loading)
    return <p className="text-center mt-20 text-gray-500">Memuat data…</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* HEADER */}
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Database Laporan Audit
          </h1>
          <p className="text-sm text-gray-500">
            Manajemen dan arsip laporan auditor independen
          </p>
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden sm:flex gap-3">
          <button
            onClick={() => navigate("/upload")}
            className="
        bg-blue-900 text-white
        px-5 py-2.5
        rounded-lg shadow
        hover:bg-blue-800
        transition text-sm
      "
          >
            + Upload Laporan
          </button>

          <button
            onClick={handleLogout}
            className="
        flex items-center gap-2
        bg-red-100 text-red-700
        px-4 py-2.5
        rounded-lg
        hover:bg-red-200
        transition text-sm font-medium
      "
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* MOBILE ACTIONS */}
      <div className="sm:hidden space-y-3 mb-6">
        <button
          onClick={() => navigate("/upload")}
          className="
      w-full
      bg-blue-900 text-white
      py-3 rounded-lg
      shadow
      text-sm font-semibold
    "
        >
          + Upload Laporan
        </button>

        <button
          onClick={handleLogout}
          className="
    sm:hidden
    fixed top-3 right-3
    p-2 rounded-full
    bg-red-100 text-red-700
    hover:bg-red-200
    z-50
  "
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* SEARCH & FILTER */}
      <div className="bg-white border rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Cari klien / KAP / No. LAI…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-96 border px-3 py-2 rounded-md text-sm focus:ring focus:border-blue-400"
          />

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full sm:w-40 border px-3 py-2 rounded-md text-sm"
          >
            <option value="all">Semua Tahun</option>
            {[
              ...new Set(data.map((r) => new Date(r.created_at).getFullYear())),
            ].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= MOBILE CARD LIST ================= */}
      <div className="grid gap-4 md:hidden">
        {filteredData.map((row) => (
          <div
            key={row.id}
            className="bg-white border rounded-xl p-4 shadow-sm"
          >
            <div className="mb-2">
              <h3 className="font-semibold text-gray-800">{row.nama_klien}</h3>
              <p className="text-xs text-gray-500">{row.nama_kap}</p>
            </div>

            <div className="text-xs text-gray-600 space-y-1 mb-3">
              <p>
                <b>Periode:</b> {formatPeriodeDisplay(row.periode)}
              </p>

              <p>
                <b>No. LAI:</b> {row.no_lai}
              </p>
              <p>
                <b>Tanggal:</b>{" "}
                {new Date(row.created_at).toLocaleDateString("id-ID")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <button
                onClick={() => navigate(`/api/VerifikasiLai?code=${row.id}`)}
                className="py-2 rounded bg-blue-50 text-blue-700 font-medium"
              >
                Lihat
              </button>

              <button
                onClick={() =>
                  navigate(`/database/audit-reports/${row.id}/edit`)
                }
                className="py-2 rounded bg-amber-50 text-amber-700 font-medium"
              >
                Edit
              </button>

              <button
                onClick={() => openQr(row.id)}
                className="py-2 rounded bg-green-50 text-green-700 font-medium"
              >
                QR
              </button>

              <button
                onClick={() => handleDelete(row.id)}
                className="py-2 rounded bg-red-50 text-red-700 font-medium"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 w-12">#</th>
                <th className="px-4 py-3">Klien</th>
                <th className="px-4 py-3">KAP</th>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3">No. LAI</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredData.map((row, i) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{row.nama_klien}</td>
                  <td className="px-4 py-3">{row.nama_kap}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                      {formatPeriodeDisplay(row.periode)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-xs">{row.no_lai}</td>
                  <td className="px-4 py-3">
                    {new Date(row.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() =>
                          navigate(`/api/VerifikasiLai?code=${row.id}`)
                        }
                        className="text-blue-700 hover:underline"
                      >
                        Lihat
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/database/audit-reports/${row.id}/edit`)
                        }
                        className="text-amber-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openQr(row.id)}
                        className="text-green-700 hover:underline"
                      >
                        QR
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR MODAL */}
      {qrOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center">
            <h2 className="font-bold text-lg">QR Code Laporan</h2>
            <p className="text-xs text-gray-500 mb-4">
              Scan untuk membuka laporan
            </p>

            <div
              ref={qrRef}
              className="flex justify-center bg-gray-50 p-4 rounded mb-4"
            >
              <QRCodeCanvas
                c
                value={qrValue}
                size={180}
                level="H"
                includeMargin
                fgColor="#1F73B2"
                bgColor="#FFFFFF"
                imageSettings={{
                  src: "/logo-kemenkeu.png",
                  x: undefined,
                  y: undefined,
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={downloadQr}
                className="py-2 rounded bg-blue-900 text-white text-sm hover:bg-blue-800"
              >
                Download QR
              </button>
              <button
                onClick={() => setQrOpen(false)}
                className="py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  //HELPER
  function formatPeriodeDisplay(periode) {
    if (!periode) return "-";

    const [awal, akhir] = periode.split(" s.d. ");
    if (!awal || !akhir) return periode;

    const fmt = (d) =>
      new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

    return `${fmt(awal)} s.d. ${fmt(akhir)}`;
  }
}
