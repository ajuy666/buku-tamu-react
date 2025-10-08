import { useState } from "react";

function App() {
  const [nama, setNama] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [instansi, setInstansi] = useState("");
  const [email, setEmail] = useState("");
  const [alamat, setAlamat] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [keperluan, setKeperluan] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      nama,
      no_telp: noTelp,
      instansi,
      email,
      alamat,
      tujuan_kunjungan: tujuan,
      keperluan,
    };

    try {
      const res = await fetch("http://localhost:5000/tamu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("✅ Data berhasil dikirim!");
        // reset form
        setNama("");
        setNoTelp("");
        setInstansi("");
        setEmail("");
        setAlamat("");
        setTujuan("");
        setKeperluan("");
      } else {
        alert("❌ Gagal mengirim data");
      }
    } catch (err) {
      alert("⚠️ Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Buku Tamu</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        /><br /><br />

        <input
          type="text"
          placeholder="No Telp"
          value={noTelp}
          onChange={(e) => setNoTelp(e.target.value)}
        /><br /><br />

        <input
          type="text"
          placeholder="Instansi"
          value={instansi}
          onChange={(e) => setInstansi(e.target.value)}
        /><br /><br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br /><br />

        <textarea
          placeholder="Alamat"
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
        /><br /><br />

        <textarea
          placeholder="Tujuan Kunjungan"
          value={tujuan}
          onChange={(e) => setTujuan(e.target.value)}
        /><br /><br />

        <select
          value={keperluan}
          onChange={(e) => setKeperluan(e.target.value)}
        >
          <option value="">-- Pilih Keperluan --</option>
          <option value="Meeting">Meeting</option>
          <option value="Magang">Magang</option>
          <option value="Layanan Publik">Layanan Publik</option>
          <option value="Interview">Interview</option>
        </select><br /><br />

        <button type="submit">Kirim</button>
      </form>
    </div>
  );
}

export default App;
