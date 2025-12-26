import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuditReport() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line
  }, []);

  async function loadReport() {
    const { data, error } = await supabase
      .from("audit_reports")
      .select("*")
      .eq("id", id)
      .single();

    if (error) setError("Data laporan tidak ditemukan");
    else setData(data);

    setLoading(false);
  }

  if (loading) return <p className="text-center mt-10">Memuat data…</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  const createdAt = new Date(data.created_at).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const isFlagged = data.is_unverifiable === true;

  return (
    /* ================= PAGE BACKGROUND ================= */
    <div className="min-h-screen bg-gray-300 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6">
      {/* ================= PAPER ================= */}
      <div className="bg-white text-black border shadow-2xl w-full max-w-[1400px] px-4 sm:px-8 lg:px-10 py-6">
        {/* ================= HEADER ================= */}
        <div className="text-center leading-snug mb-5">
          <h1 className="text-[16px] sm:text-[18px] lg:text-[20px] font-bold uppercase">
            Kementerian Keuangan Republik Indonesia
          </h1>
          <h2 className="text-[16px] sm:text-[18px] lg:text-[20px] font-bold uppercase">
            Direktorat Jenderal Stabilitas dan Pengembangan Sektor Keuangan
          </h2>
          <h3 className="text-[16px] sm:text-[18px] lg:text-[20px] font-bold uppercase">
            Direktorat Pembinaan dan Pengawasan Profesi Keuangan
          </h3>

          <hr className="border-t-3 border-gray-500 my-4" />
        </div>

        {/* ================= OPENING ================= */}
        <p className="text-sm sm:text-[16px] leading-6 mb-4 pl-0 sm:pl-3 text-justify">
          Laporan Auditor Independen <b className="italic">telah terdaftar</b>{" "}
          pada aplikasi Pelita di Direktorat Pembinaan dan Pengawasan Profesi
          Keuangan dengan informasi sebagai berikut:
        </p>

        {/* ================= CONTENT ================= */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm sm:text-[16px] leading-7 mb-4">
            <tbody>
              <Row label="A. Nama KAP" value={data.nama_kap} />
              <Row label="B. Nama Klien" value={data.nama_klien} />
              <Row label="C. Periode" value={formatPeriodeText(data.periode)} />
              <Row label="D. No. LAI" value={data.no_lai} />
              <Row label="E. Tgl. LAI" value={formatDateID(data.tgl_lai)} />
              <Row
                label="F. AP Penanggungjawab"
                value={data.ap_penanggungjawab}
              />
              <Row label="G. Opini" value={data.opini} />

              {/* TOTAL ASET */}
              <Row
                label="H. Total Aset"
                value={
                  <span className={isFlagged ? "text-red-600 " : ""}>
                    IDR {Number(data.total_aset).toLocaleString("id-ID")}
                    {isFlagged && " *"}
                  </span>
                }
              />

              {/* LABA / RUGI */}
              <Row
                label="I. Laba/Rugi Bersih"
                value={
                  <span className={isFlagged ? "text-red-600 " : ""}>
                    IDR {Number(data.laba_bersih).toLocaleString("id-ID")}
                    {isFlagged && " *"}
                  </span>
                }
              />
            </tbody>
          </table>
        </div>

        {/* ================= KETERANGAN KHUSUS ================= */}
        {isFlagged && (
          <p className="text-sm sm:text-[16px] leading-6 mb-4 pl-0 sm:pl-3 text-justify">
            Keterangan tanda (*): Angka tersebut tidak dapat dikonfirmasi
            kebenarannya karena PT. LINGGA JATI QAIREEN menolak untuk
            menyampaikan laporan keuangan auditan kepada DPPPK Kementerian
            Keuangan.
          </p>
        )}

        {/* ================= DISCLAIMER ================= */}
        <p className="italic text-sm sm:text-[16px] leading-6 mb-5 pl-0 sm:pl-3 text-justify">
          “Disclaimer: Semua informasi dalam QR Code dibuat oleh KAP yang
          bersangkutan. DPPPK tidak bertanggung jawab atas kesalahan informasi
          yang disampaikan KAP.”
        </p>

        <hr className="border-t-3 border-gray-500 mb-4" />

        {/* ================= FOOTER ================= */}
        <div className="text-center text-sm sm:text-[16px] leading-6">
          <p className="font-bold">
            Untuk informasi lebih lanjut silakan hubungi (021) 3505112 atau
            email ke{" "}
            <span className="text-blue-700 underline font-bold">
              kemenkeu.prime@kemenkeu.go.id
            </span>
          </p>

          <p className="mt-1 text-gray-600 text-[10px]">
            dibuat oleh sistem pada {createdAt}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function formatPeriodeText(periode) {
  if (!periode) return "-";
  const [awal, akhir] = periode.split(" s.d. ");
  return `${formatDateID(awal)} s.d. ${formatDateID(akhir)}`;
}

function formatDateID(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Row({ label, value }) {
  return (
    <tr className="block sm:table-row mb-4 sm:mb-0">
      {/* LABEL */}
      <td
        className="
        block
        sm:table-cell
        w-full
        sm:w-[16%]
        font-semibold
        pr-3
      "
      >
        {label}
      </td>

      {/* VALUE */}
      <td
        className="
        block
        sm:table-cell
        w-full
        sm:w-[84%]
        pl-0
        sm:pl-0
      "
      >
        <span className="hidden sm:inline">: </span>
        {value || "-"}
      </td>
    </tr>
  );
}
