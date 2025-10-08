// ===============================================
// 📘 Buku Tamu Backend (Node.js + Supabase + Express)
// ===============================================

const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

const app = express();
const port = 5000;

// ===============================================
// 🧩 Koneksi ke Database Supabase
// ===============================================
const pool = new Pool({
  connectionString:
    "postgresql://postgres.vvkfqtqrdsoassuyaimm:ajuyganteng666@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

// ===============================================
// ⚙️ Middleware
// ===============================================
app.use(cors());
app.use(express.json());

// ===============================================
// 🧠 ROUTES
// ===============================================

// ✅ 1. Cek server aktif
app.get("/", (req, res) => {
  res.send("🚀 Buku Tamu API aktif — Gunakan endpoint /tamu");
});

// ✅ 2. Tambah data tamu
app.post("/tamu", async (req, res) => {
  try {
    const {
      nama,
      no_telp,
      instansi,
      email,
      alamat,
      tujuan_kunjungan,
      keperluan,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO tamu (nama, no_telp, instansi, email, alamat, tujuan_kunjungan, keperluan)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [nama, no_telp, instansi, email, alamat, tujuan_kunjungan, keperluan]
    );

    console.log("✅ Data baru ditambahkan:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error input data:", err.message);
    res.status(500).send("Gagal menambah data tamu");
  }
});

// ✅ 3. Ambil semua data tamu
app.get("/tamu", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tamu ORDER BY id DESC");
    console.log("📦 Data dikirim:", result.rows.length, "baris");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Gagal ambil data:", err.message);
    res.status(500).send("Error ambil data tamu");
  }
});

// ✅ 4. Edit data tamu
app.put("/tamu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama,
      no_telp,
      instansi,
      email,
      alamat,
      tujuan_kunjungan,
      keperluan,
    } = req.body;

    const result = await pool.query(
      `UPDATE tamu
       SET nama=$1, no_telp=$2, instansi=$3, email=$4, alamat=$5, tujuan_kunjungan=$6, keperluan=$7
       WHERE id=$8 RETURNING *`,
      [nama, no_telp, instansi, email, alamat, tujuan_kunjungan, keperluan, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    console.log("✅ Data diperbarui:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Gagal update data:", err.message);
    res.status(500).send("Error update data tamu");
  }
});

// ✅ 5. Hapus tamu
app.delete("/tamu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM tamu WHERE id=$1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Data tidak ditemukan" });

    console.log("🗑️ Data dihapus:", id);
    res.json({ message: "Data berhasil dihapus" });
  } catch (err) {
    console.error("❌ Gagal hapus data:", err.message);
    res.status(500).send("Error hapus data");
  }
});

// ===============================================
// 📊 Statistik (Dashboard)
// ===============================================

// ✅ Statistik Harian
app.get("/tamu/statistik/harian", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(tanggal, 'DD Mon YYYY') AS hari,
        COUNT(*) AS jumlah
      FROM tamu
      GROUP BY 1
      ORDER BY MIN(tanggal)
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Gagal ambil statistik harian:", err.message);
    res.status(500).send("Error ambil statistik harian");
  }
});

// ✅ Statistik Mingguan
app.get("/tamu/statistik/mingguan", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('week', tanggal), 'WW') AS minggu,
        COUNT(*) AS jumlah
      FROM tamu
      GROUP BY 1
      ORDER BY MIN(tanggal)
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Gagal ambil statistik mingguan:", err.message);
    res.status(500).send("Error ambil statistik mingguan");
  }
});

// ✅ Statistik Bulanan
app.get("/tamu/statistik/bulanan", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(tanggal, 'Month') AS bulan,
        COUNT(*) AS jumlah
      FROM tamu
      GROUP BY 1
      ORDER BY MIN(tanggal)
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Gagal ambil statistik bulanan:", err.message);
    res.status(500).send("Error ambil statistik bulanan");
  }
});

// ✅ Statistik Tahunan
app.get("/tamu/statistik/tahunan", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        EXTRACT(YEAR FROM tanggal) AS tahun,
        COUNT(*) AS jumlah
      FROM tamu
      GROUP BY 1
      ORDER BY tahun
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Gagal ambil statistik tahunan:", err.message);
    res.status(500).send("Error ambil statistik tahunan");
  }
});

// ===============================================
// 📁 Export Data
// ===============================================

// ✅ Export ke CSV
app.get("/tamu/export/csv", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tamu ORDER BY tanggal DESC");

    let csv = "Nama,No Telp,Instansi,Email,Alamat,Tujuan,Keperluan,Tanggal\n";
    result.rows.forEach((row) => {
      csv += `"${row.nama}","${row.no_telp}","${row.instansi}","${row.email}","${row.alamat}","${row.tujuan_kunjungan}","${row.keperluan}","${row.tanggal}"\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("laporan_tamu.csv");
    res.send(csv);
  } catch (err) {
    console.error("❌ Gagal export CSV:", err.message);
    res.status(500).send("Error export CSV");
  }
});

// ✅ Export ke PDF
app.get("/tamu/export/pdf", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tamu ORDER BY tanggal DESC");
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=laporan_tamu.pdf");
    doc.pipe(res);

    doc.font("Times-Bold").fontSize(18).text("LAPORAN BUKU TAMU", { align: "center" });
    doc.moveDown(1);

    const headers = ["No", "Nama", "Instansi", "Keperluan", "Tanggal"];
    const widths = [30, 120, 120, 120, 100];
    let startX = 40;
    let y = 120;

    // Header
    doc.font("Times-Bold").fontSize(10);
    headers.forEach((h, i) => {
      doc.text(h, startX + widths.slice(0, i).reduce((a, b) => a + b, 0), y, { width: widths[i], align: "left" });
    });
    y += 20;

    doc.font("Times-Roman").fontSize(9);
    result.rows.forEach((row, i) => {
      const values = [
        i + 1,
        row.nama || "-",
        row.instansi || "-",
        row.keperluan || "-",
        row.tanggal ? new Date(row.tanggal).toLocaleDateString("id-ID") : "-",
      ];
      let x = startX;
      values.forEach((v, idx) => {
        doc.text(String(v), x, y, { width: widths[idx], align: "left" });
        x += widths[idx];
      });
      y += 18;
    });

    doc.end();
    console.log("✅ PDF berhasil dibuat!");
  } catch (err) {
    console.error("❌ Gagal export PDF:", err.message);
    res.status(500).send("Error export PDF");
  }
});

// ✅ Export ke Excel
app.get("/tamu/export/excel", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tamu ORDER BY tanggal DESC");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Laporan Tamu");

    sheet.addRow([
      "No",
      "Nama",
      "No Telp",
      "Instansi",
      "Email",
      "Alamat",
      "Tujuan",
      "Keperluan",
      "Tanggal",
    ]);

    result.rows.forEach((row, i) => {
      sheet.addRow([
        i + 1,
        row.nama,
        row.no_telp,
        row.instansi,
        row.email,
        row.alamat,
        row.tujuan_kunjungan,
        row.keperluan,
        row.tanggal ? new Date(row.tanggal).toLocaleDateString("id-ID") : "-",
      ]);
    });

    sheet.columns.forEach((col) => (col.width = 20));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=laporan_tamu.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
    console.log("✅ Excel berhasil dibuat!");
  } catch (err) {
    console.error("❌ Gagal export Excel:", err.message);
    res.status(500).send("Error export Excel");
  }
});

// ===============================================
// 🚀 Jalankan Server
// ===============================================
app.listen(port, async () => {
  console.log(`✅ Server berjalan di http://localhost:${port}`);

  try {
    const test = await pool.query("SELECT NOW()");
    console.log("📡 Koneksi ke Supabase berhasil:", test.rows[0].now);
  } catch (err) {
    console.error("⚠️ Gagal konek ke Supabase:", err.message);
  }
});
