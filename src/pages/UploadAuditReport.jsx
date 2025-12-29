import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

/* ================= HELPER RUPIAH ================= */

function formatRupiah(value) {
  if (!value) return "";
  return "IDR " + Number(value).toLocaleString("id-ID");
}

function parseRupiah(value = "") {
  return value.replace(/[^\d]/g, "");
}

/* ================= MAIN COMPONENT ================= */

export default function UploadAuditReport() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    nama_kap: "",
    nama_klien: "",
    periode_awal: "",
    periode_akhir: "",
    no_lai_parts: ["", "", "", "", "", "", "", ""],
    tgl_lai: "",
    ap_penanggungjawab: "",
    opini: "",
    total_aset: "",
    laba_bersih: "",
    is_unverifiable: false,
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  const noLaiPreview = form.no_lai_parts.filter(Boolean).join("/");
  const isFormInvalid = !!validateForm(form);

  /* ================= LOAD DATA (EDIT MODE) ================= */

  useEffect(() => {
    if (isEdit) loadData();
  }, [id]);

  async function loadData() {
    setLoadingData(true);

    const { data, error } = await supabase
      .from("audit_reports")
      .select(
        `
        nama_kap,
        nama_klien,
        periode,
        no_lai,
        tgl_lai,
        ap_penanggungjawab,
        opini,
        total_aset,
        laba_bersih,
        is_unverifiable,
        created_at,
        manual_created_at
      `
      )

      .eq("id", id)
      .single();

    if (error || !data) {
      setError("Data laporan tidak ditemukan");
      setLoadingData(false);
      return;
    }

    const [awal, akhir] = data.periode.split(" s.d. ");

    setForm({
      nama_kap: data.nama_kap,
      nama_klien: data.nama_klien,
      periode_awal: awal,
      periode_akhir: akhir,
      no_lai_parts: data.no_lai.split("/"),
      tgl_lai: data.tgl_lai,
      ap_penanggungjawab: data.ap_penanggungjawab,
      opini: data.opini,
      total_aset: String(data.total_aset),
      laba_bersih: String(data.laba_bersih),
      is_unverifiable: data.is_unverifiable ?? false,
    });

    setLoadingData(false);
  }

  /* ================= HANDLERS ================= */

  function handleChange(e) {
    const { name, type, value, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function handleLaiChange(index, value) {
    const updated = [...form.no_lai_parts];
    updated[index] = value;
    setForm({ ...form, no_lai_parts: updated });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const periode = `${form.periode_awal} s.d. ${form.periode_akhir}`;
    const no_lai = form.no_lai_parts.map((p) => p.trim()).join("/");

    const payload = {
      nama_kap: form.nama_kap,
      nama_klien: form.nama_klien,
      periode,
      no_lai,
      tgl_lai: form.tgl_lai,
      ap_penanggungjawab: form.ap_penanggungjawab,
      opini: form.opini,
      total_aset: Number(form.total_aset),
      laba_bersih: Number(form.laba_bersih),
      is_unverifiable: form.is_unverifiable,
    };

    try {
      const { error } = isEdit
        ? await supabase.from("audit_reports").update(payload).eq("id", id)
        : await supabase.from("audit_reports").insert([payload]);

      if (error) throw error;

      navigate("/database");
    } catch (err) {
      setError("Gagal menyimpan data laporan");
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return <p className="text-center mt-10">Memuat data...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit ? "Edit Laporan Audit" : "Upload Laporan Audit"}
            </h1>
            <p className="text-sm text-gray-600">
              {isEdit
                ? "Perbarui data laporan auditor independen"
                : "Isikan data laporan auditor independen sesuai dokumen resmi"}
            </p>
          </div>

          <button
            onClick={() => navigate("/database")}
            className="
              inline-flex items-center gap-2
              px-4 py-2
              bg-gray-100 border border-gray-300
              rounded-lg text-sm font-medium
              hover:bg-gray-200 transition
            "
          >
            ← Kembali
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <Section title="Informasi Umum" desc="Identitas KAP dan klien">
            <Input
              label="Nama KAP"
              name="nama_kap"
              placeholder="Contoh: Amir Abadi Jusuf, Aryanto, Mawar & Rekan"
              hint="Sesuai nama resmi Kantor Akuntan Publik"
              value={form.nama_kap}
              onChange={handleChange}
            />

            <Input
              label="Nama Klien"
              name="nama_klien"
              placeholder="Contoh: PT Jasa Marga (Persero) Tbk"
              hint="Nama entitas yang diaudit"
              value={form.nama_klien}
              onChange={handleChange}
            />
          </Section>

          <Section title="Periode Audit" desc="Rentang waktu audit">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="date"
                value={form.periode_awal}
                onChange={(e) =>
                  setForm({ ...form, periode_awal: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
              <span className="text-gray-500 font-semibold">s.d</span>
              <input
                type="date"
                value={form.periode_akhir}
                onChange={(e) =>
                  setForm({ ...form, periode_akhir: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
          </Section>

          <Section title="Nomor LAI" desc="Nomor Laporan Auditor Independen">
            <div className="flex gap-1 overflow-x-auto pb-2">
              {[
                "00877",
                "2.1030",
                "AU.1",
                "06",
                "0645-1",
                "1",
                "IX",
                "2022",
              ].map((ph, i) => (
                <div key={i} className="flex items-center gap-1">
                  <input
                    value={form.no_lai_parts[i]}
                    onChange={(e) => handleLaiChange(i, e.target.value)}
                    placeholder={ph}
                    className="border px-2 py-1 rounded text-sm text-center w-[90px]"
                    required
                  />
                  {i < 7 && <span className="text-gray-400">/</span>}
                </div>
              ))}
            </div>

            {noLaiPreview && (
              <p className="text-xs text-gray-500 mt-2">
                Preview: <b>{noLaiPreview}</b>
              </p>
            )}
          </Section>

          <Section title="Detail Auditor" desc="Tanggal dan opini audit">
            <Input
              type="date"
              label="Tanggal LAI"
              name="tgl_lai"
              value={form.tgl_lai}
              onChange={handleChange}
            />

            <Input
              label="AP Penanggung Jawab"
              name="ap_penanggungjawab"
              placeholder="Contoh: Dedy Sukrisnadi"
              value={form.ap_penanggungjawab}
              onChange={handleChange}
            />

            <Input
              label="Opini Audit"
              name="opini"
              placeholder="Contoh: WTP"
              value={form.opini}
              onChange={handleChange}
            />
          </Section>

          <Section title="Informasi Keuangan" desc="Ringkasan keuangan utama">
            <label className="block text-sm font-semibold mb-1">
              Total Aset
            </label>
            <input
              value={formatRupiah(form.total_aset)}
              onChange={(e) =>
                setForm({
                  ...form,
                  total_aset: parseRupiah(e.target.value),
                })
              }
              className="w-full border px-3 py-2 text-sm rounded"
            />

            <label className="block text-sm font-semibold mt-4 mb-1">
              Laba / Rugi Bersih
            </label>
            <input
              value={formatRupiah(form.laba_bersih)}
              onChange={(e) =>
                setForm({
                  ...form,
                  laba_bersih: parseRupiah(e.target.value),
                })
              }
              className="w-full border px-3 py-2 text-sm rounded"
            />

            {/* ================= CHECKBOX FLAG ================= */}
            <div className="flex items-center gap-2 mt-4">
              <input
                id="is_unverifiable"
                type="checkbox"
                name="is_unverifiable"
                checked={form.is_unverifiable}
                onChange={handleChange}
              />
              <label
                htmlFor="is_unverifiable"
                className="text-sm cursor-pointer"
              >
                Data keuangan tidak dapat dikonfirmasi (*)
              </label>
            </div>
          </Section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isFormInvalid}
            className="
              w-full bg-blue-900 text-white py-3 rounded-lg
              hover:bg-blue-800 transition
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading
              ? "Menyimpan..."
              : isEdit
              ? "Simpan Perubahan"
              : "Simpan & Lihat Laporan"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Section({ title, desc, children }) {
  return (
    <div>
      <h2 className="text-base font-bold mb-1">{title}</h2>
      <p className="text-sm text-gray-600 mb-4">{desc}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Input({ label, hint, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input
        {...props}
        className="w-full border px-3 py-2 text-sm rounded focus:ring-2 focus:ring-blue-500"
      />
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function CurrencyInput({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input
        value={formatRupiah(value)}
        onChange={(e) =>
          onChange({ target: { name, value: parseRupiah(e.target.value) } })
        }
        placeholder="IDR 0"
        className="w-full border px-3 py-2 text-sm rounded focus:ring-2 focus:ring-blue-500"
        inputMode="numeric"
      />
    </div>
  );
}

function validateForm(form) {
  if (!form.nama_kap.trim()) return "Nama KAP wajib diisi";
  if (!form.nama_klien.trim()) return "Nama Klien wajib diisi";
  if (!form.periode_awal || !form.periode_akhir)
    return "Periode audit wajib diisi lengkap";
  if (!form.tgl_lai) return "Tanggal LAI wajib diisi";
  if (!form.ap_penanggungjawab.trim()) return "AP Penanggung Jawab wajib diisi";
  if (!form.opini.trim()) return "Opini audit wajib diisi";
  if (!form.total_aset) return "Total aset wajib diisi";
  if (!form.laba_bersih) return "Laba/Rugi bersih wajib diisi";

  const hasEmptyLai = form.no_lai_parts.some((p) => !p.trim());
  if (hasEmptyLai) return "Semua bagian Nomor LAI wajib diisi";

  return null;
}
