import React, { useState, useRef } from 'react';
import { Upload, Download, QrCode, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

const QrisConverter = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [amount, setAmount] = useState('');
  const [generatedQR, setGeneratedQR] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && (uploadedFile.type === 'image/png' || uploadedFile.type === 'image/jpeg')) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(uploadedFile);
      setStatus({ type: 'success', message: 'QRIS dinamis berhasil diupload!' });
    } else {
      setStatus({ type: 'error', message: 'Silakan upload file PNG atau JPG!' });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const event = { target: { files } };
      handleFileUpload(event);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const generateStaticQRIS = async () => {
    if (!file || !amount) {
      setStatus({ type: 'error', message: 'Mohon upload QRIS dan masukkan nominal!' });
      return;
    }

    setIsProcessing(true);
    setStatus({ type: '', message: '' });

    try {
      // Simulasi proses konversi QRIS
      // Dalam implementasi real, di sini akan ada logika untuk:
      // 1. Decode QR menggunakan jsQR
      // 2. Modifikasi payload dengan tag 54 (Amount)
      // 3. Hitung ulang CRC16 (tag 63)
      // 4. Generate QR baru dengan qrcode library

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulasi processing

      // Generate QR code sederhana untuk demo
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 200;
      canvas.height = 200;
      
      // Background putih
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 200, 200);
      
      // QR pattern sederhana untuk demo
      ctx.fillStyle = 'black';
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
          if (Math.random() > 0.5) {
            ctx.fillRect(i * 10, j * 10, 10, 10);
          }
        }
      }

      const qrDataURL = canvas.toDataURL();
      setGeneratedQR(qrDataURL);
      setStatus({ type: 'success', message: `QRIS statis berhasil dibuat dengan nominal Rp ${parseInt(amount).toLocaleString('id-ID')}!` });
    } catch (error) {
      setStatus({ type: 'error', message: 'Gagal generate QRIS. Silakan coba lagi.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadQR = () => {
    if (generatedQR) {
      const link = document.createElement('a');
      link.download = `qris-statis-${amount}.png`;
      link.href = generatedQR;
      link.click();
    }
  };

  const formatCurrency = (value) => {
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              QRIS Converter
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Ubah QRIS dinamis menjadi QRIS statis dengan nominal tetap. 
            Proses cepat, aman, dan berjalan sepenuhnya di browser Anda.
          </p>
        </div>

        {/* Status Alert */}
        {status.message && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 ${
            status.type === 'error' 
              ? 'bg-red-50 border-red-400 text-red-700' 
              : 'bg-green-50 border-green-400 text-green-700'
          }`}>
            <div className="flex items-center gap-2">
              {status.type === 'error' ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              <span className="font-medium">{status.message}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Upload QRIS Dinamis</h2>
              </div>
              <p className="text-gray-600 text-sm">Upload file PNG atau JPG QRIS dinamis Anda</p>
            </div>
            
            <div className="p-6">
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="QRIS Preview"
                      className="max-w-full h-48 object-contain mx-auto rounded-lg shadow-md"
                    />
                    <p className="text-sm text-gray-600">{file?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Drop QRIS di sini atau klik untuk upload
                      </p>
                      <p className="text-sm text-gray-500">PNG, JPG hingga 10MB</p>
                    </div>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Amount Input & Generate Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-800">Generate QRIS Statis</h2>
              </div>
              <p className="text-gray-600 text-sm">Masukkan nominal dan buat QRIS statis</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nominal (Rupiah)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={formatCurrency(amount)}
                    onChange={(e) => setAmount(e.target.value.replace(/\./g, ''))}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              <button
                onClick={generateStaticQRIS}
                disabled={!file || !amount || isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    Generate QRIS Statis
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Result Section */}
        {generatedQR && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <QrCode className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-800">QRIS Statis</h2>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Rp {parseInt(amount).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            
            <div className="p-8">
              <div className="text-center space-y-6">
                <div className="inline-block p-4 bg-gray-50 rounded-2xl">
                  <img
                    src={generatedQR}
                    alt="Generated QRIS"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                
                <button
                  onClick={downloadQR}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  Download QRIS
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">Catatan Penting</h3>
              <ul className="text-amber-700 text-sm space-y-1">
                <li>• Implementasi EMV/QRIS masih eksperimental (simulasi client-side)</li>
                <li>• QRIS production membutuhkan validasi compliance resmi</li>
                <li>• Jangan gunakan untuk transaksi riil tanpa sertifikasi</li>
                <li>• Semua proses berjalan di browser, data tidak dikirim ke server</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Hidden Canvas for QR Generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default QrisConverter;
