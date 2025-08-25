import React, { useRef, useState } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

export default function QrisConverter() {
  const fileRef = useRef(null);
  const canvasRef = useRef(null);
  const [decoded, setDecoded] = useState('');
  const [amount, setAmount] = useState('');
  const [staticQrisDataUrl, setStaticQrisDataUrl] = useState('');
  const [log, setLog] = useState('');

  function appendLog(txt) {
    setLog(l => (l ? l + "\n" + txt : txt));
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = canvasRef.current;
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, c.width, c.height);
      const qr = jsQR(imageData.data, c.width, c.height);
      if (!qr) {
        appendLog('Gagal mendeteksi QR pada gambar.');
        setDecoded('');
      } else {
        appendLog('QR berhasil didecode.');
        setDecoded(qr.data);
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      appendLog('Gagal memuat gambar.');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  function parseTLV(str) {
    const out = [];
    let i = 0;
    while (i + 4 <= str.length) {
      const tag = str.substr(i, 2);
      const len = parseInt(str.substr(i + 2, 2), 10);
      if (isNaN(len)) break;
      const val = str.substr(i + 4, len);
      out.push({ tag, value: val });
      i += 4 + len;
    }
    return out;
  }

  function buildTLV(arr) {
    return arr.map(({ tag, value }) => {
      const l = String(value.length).padStart(2, '0');
      return tag + l + value;
    }).join('');
  }

  function crc16ccitt(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    let crc = 0xFFFF;
    for (let b of data) {
      crc ^= (b << 8);
      for (let i = 0; i < 8; i++) {
        if (crc & 0x8000) crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
        else crc = (crc << 1) & 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  function convertEmvSetAmount(emv, amtStr) {
    let core = emv;
    const crcTagIdx = emv.indexOf('63');
    if (crcTagIdx !== -1) {
      core = emv.substr(0, crcTagIdx);
    }
    const tlv = parseTLV(core);
    const idx54 = tlv.findIndex(t => t.tag === '54');
    const formatted = formatAmountForQris(amtStr);
    if (idx54 >= 0) {
      tlv[idx54].value = formatted;
    } else {
      const idxInsert = tlv.findIndex(t => t.tag === '58' || t.tag === '59' || t.tag === '60');
      const newItem = { tag: '54', value: formatted };
      if (idxInsert >= 0) tlv.splice(idxInsert, 0, newItem);
      else tlv.push(newItem);
    }
    const rebuilt = buildTLV(tlv);
    const crc = crc16ccitt(rebuilt + '6304');
    return rebuilt + '63' + '04' + crc;
  }

  function formatAmountForQris(input) {
    const cleaned = String(input).replace(/,/g, '').trim();
    if (cleaned === '') return '';
    const n = Number(cleaned);
    if (isNaN(n)) return cleaned;
    return n.toFixed(2);
  }

  const handleGenerate = async () => {
    setStaticQrisDataUrl('');
    if (!decoded) {
      appendLog('Belum ada QR yang didecode.');
      return;
    }
    if (!amount) appendLog('Jumlah nominal kosong — akan membuat QR tanpa nominal (jika format mendukung).');

    let out = '';
    if (/^https?:\/\//i.test(decoded)) {
      const url = new URL(decoded);
      if (amount) url.searchParams.set('amount', formatAmountForQris(amount));
      out = url.toString();
      appendLog('Payload adalah URL — menambahkan parameter amount.');
    } else if (/^0{2}/.test(decoded) || decoded.startsWith('000201')) {
      try {
        out = convertEmvSetAmount(decoded, amount);
        appendLog('Payload terdeteksi sebagai EMV/QRIS. Mencoba menyisipkan tag 54 dan menghitung CRC.');
      } catch (err) {
        appendLog('Gagal memproses EMV: ' + err.message);
        out = decoded;
      }
    } else {
      out = decoded + (amount ? ('|AMOUNT=' + formatAmountForQris(amount)) : '');
      appendLog('Payload bukan URL/EMV. Menggabungkan nominal ke akhir sebagai fallback.');
    }

    try {
      const dataUrl = await QRCode.toDataURL(out, { margin: 1, scale: 8 });
      setStaticQrisDataUrl(dataUrl);
      appendLog('QR statis berhasil dibuat — dapat di-download.');
    } catch (err) {
      appendLog('Gagal membuat QR: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">QRIS Converter — Dynamic ➜ Static</h1>

      <p className="mb-3 text-sm">Unggah gambar QRIS dinamis (PNG/JPG). Aplikasi akan mencoba mendecode payload, Anda masukkan nominal, lalu generate QRIS statis yang bisa diunduh.</p>

      <div className="mb-4">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <label className="block text-sm font-medium">Hasil decode (payload)</label>
      <textarea className="w-full p-2 border rounded mb-3" value={decoded} onChange={e => setDecoded(e.target.value)} rows={4} />

      <label className="block text-sm font-medium">Nominal (contoh: 10000 atau 10000.00)</label>
      <input className="w-full p-2 border rounded mb-3" value={amount} onChange={e => setAmount(e.target.value)} />

      <div className="flex gap-2">
        <button onClick={handleGenerate} className="px-4 py-2 rounded bg-blue-600 text-white">Generate QR Statis</button>
        <button onClick={() => { setDecoded(''); setAmount(''); setStaticQrisDataUrl(''); setLog(''); fileRef.current.value = null; }} className="px-4 py-2 rounded border">Reset</button>
      </div>

      {staticQrisDataUrl && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">QR Statis (hasil)</h2>
          <img src={staticQrisDataUrl} alt="QR Statis" className="mb-2" />
          <div>
            <a href={staticQrisDataUrl} download={`qris-statis.png`} className="underline">Download QR Statis (PNG)</a>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-semibold">Log</h3>
        <pre className="whitespace-pre-wrap p-2 border rounded h-40 overflow-auto bg-gray-50">{log}</pre>
      </div>

      <div className="mt-6 text-xs text-gray-600">
        <strong>Catatan teknis & legal:</strong>
        <ul className="list-disc ml-5">
          <li>Ini demo client-side untuk mengonversi payload QR menjadi QR statis. Tidak terhubung ke server pembayaran apa pun.</li>
          <li>Implementasi EMV/QRIS di sini bersifat eksperimental — untuk produksi Anda harus verifikasi format EMV, signature, dan compliance QRIS dari penyelenggara pembayaran.</li>
          <li>Jangan gunakan ini langsung untuk menerima pembayaran sebelum diuji dan disetujui oleh penyedia/penagih resmi.</li>
        </ul>
      </div>
    </div>
  );
}
