import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuditReport() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("code");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewedAt, setViewedAt] = useState(null);

  useEffect(() => {
    document.title = "Verifikasi LAI";
    if (id) loadReport();
  }, [id]);

  useEffect(() => {
    setViewedAt(new Date());
  }, []);

  async function loadReport() {
    if (!id) {
      setError("Kode verifikasi tidak valid");
      setLoading(false);
      return;
    }

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

  const isFlagged = data.is_unverifiable === true;

  return (
    <>
      {/* ================= PAGE BACKGROUND ================= */}
      <div
        className="
        min-h-screen
        bg-[#C1C1C1]
        flex
        justify-center
        items-start
        px-2 sm:px-6
        pt-4 pb-10
        audit-report
      "
      >
        {/* ================= PAPER ================= */}
        <div
          className="
          bg-white
          text-black
          w-full
          max-w-[1600px]
          mx-auto
          px-9
          pt-7 pb-4
          rounded-sm
        "
        >
          {/* ================= HEADER ================= */}
          <div className="text-center leading-tight mb-3">
            <h1 className="text-[20px] font-bold uppercase">
              Kementerian Keuangan Republik Indonesia
            </h1>
            <h1 className="text-[20px] font-bold uppercase">
              Direktorat Jenderal Stabilitas dan Pengembangan Sektor Keuangan
            </h1>
            <h1 className="text-[20px] font-bold uppercase">
              Direktor Pembinaan dan Pengawasan Profesi Keuangan
            </h1>

            <hr className="border-t-3 border-gray-400 w-full -mx-1 sm:-mx-2 lg:-mx-2 mt-3 mb-5" />
          </div>

          {/* ================= OPENING ================= */}
          <p
            className="
            text-[16px]       /* desktop: tetap 16px */
            leading-5            /* mobile: rapat */
            sm:leading-6         /* desktop: normal */
            mb-2
            pl-0
            sm:pl-3
            text-left            /* mobile: kiri */
            sm:text-justify      /* desktop: justify */
          "
          >
            Laporan Auditor Independen <b className="italic">telah terdaftar</b>{" "}
            pada aplikasi Pelita di Direktorat Pembinaan dan Pengawasan Profesi
            Keuangan dengan informasi sebagai berikut:
          </p>

          {/* ================= CONTENT ================= */}
          <div className="overflow-x-auto">
            <table className="w-full text-[16px] leading-7 lg:leading-8 mb-4">
              <tbody>
                <Row label="A. Nama KAP" value={data.nama_kap} />
                <Row label="B. Nama Klien" value={data.nama_klien} />
                <Row
                  label="C. Periode"
                  value={formatPeriodeText(data.periode)}
                />
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
          <p
            className="
            italic
            text-[16px]       /* desktop: tetap */
            leading-5
            sm:leading-6
            mb-4
            px-2                 /* mobile: ada jarak kiri-kanan */
            sm:px-0
            text-left         /* mobile*/
            sm:text-justify      /* desktop*/
          "
          >
            “Disclaimer: Semua informasi dalam QR Code dibuat oleh KAP yang
            bersangkutan. DPPPK tidak bertanggung jawab atas kesalahan informasi
            yang disampaikan KAP.”
          </p>

          <hr className="border-t-3 border-gray-400 w-full -mx-1 sm:-mx-2 lg:-mx-2 mt-3 mb-1" />

          {/* ================= FOOTER ================= */}
          <div className="text-center text-[16px] leading-6">
            <p
              className="
              font-bold
              text-[16px]       /* desktop normal */
              mb-2
              text-center          /* mobile: tengah */
              sm:text-center       /* desktop: tetap rapi */
              leading-5
            "
            >
              Untuk informasi lebih lanjut silakan hubungi
              <br className="sm:hidden" />
              <span className="block sm:inline">
                (021) 3505112 atau email ke{" "}
              </span>{" "}
              <a
                href="mailto:kemenkeu.prime@kemenkeu.go.id"
                className="text-[#0000EE] underline font-bold"
              >
                kemenkeu.prime@kemenkeu.go.id
              </a>
            </p>

            <p className="mt-1 font-bold text-[10px]">
              dibuat oleh sistem pada {formatViewedAt(viewedAt)}
            </p>
          </div>
        </div>
      </div>
    </>
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
          sm:w-[10%]
          font-bold
          sm:font-normal
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
          sm:w-[60%]
          pl-4          
          sm:pl-0       
        "
      >
        <span className="hidden sm:inline">: </span>
        {value || "-"}
      </td>
    </tr>
  );
}

function formatViewedAt(date) {
  if (!date) return "-";

  const tanggal = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const jam = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return `hari ${tanggal} jam ${jam}`;
}
