document.addEventListener('DOMContentLoaded', () => {

    const totalTabunganEl = document.getElementById('total-tabungan');
    const totalPemasukanBulanEl = document.getElementById('total-pemasukan-bulan');
    const totalPengeluaranBulanEl = document.getElementById('total-pengeluaran-bulan');

    const inputPemasukanEl = document.getElementById('input-pemasukan');
    const btnTambahPemasukan = document.getElementById('btn-tambah-pemasukan');

    const inputPengeluaranEl = document.getElementById('input-pengeluaran');
    const btnTambahPengeluaran = document.getElementById('btn-tambah-pengeluaran');

    const riwayatListEl = document.getElementById('riwayat-list');
    const btnHapusRiwayat = document.getElementById('btn-hapus-riwayat');

    const STORAGE_KEY = 'transaksi_keuangan';

    function dapatkanSemuaTransaksi() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    function simpanTransaksi(transaksi) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transaksi));
    }

    function formatRupiah(angka) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    }

    function dapatkanBulanTahunIni() {
        return new Date().toISOString().slice(0, 7); 
    }

    function updateUI() {
        const transaksi = dapatkanSemuaTransaksi();
        const bulanIni = dapatkanBulanTahunIni();

        let totalTabungan = 0;
        let totalPemasukanBulan = 0;
        let totalPengeluaranBulan = 0;

        for (const tx of transaksi) {
            const tanggalTx = tx.tanggal.slice(0, 7);

            if (tx.tipe === 'pemasukan') {
                totalTabungan += tx.nominal;
                if (tanggalTx === bulanIni) {
                    totalPemasukanBulan += tx.nominal;
                }
            } else if (tx.tipe === 'pengeluaran') {
                totalTabungan -= tx.nominal;
                if (tanggalTx === bulanIni) {
                    totalPengeluaranBulan += tx.nominal;
                }
            }
        }

        totalTabunganEl.innerText = `Total Tabungan : ${formatRupiah(totalTabungan)}`;
        totalPemasukanBulanEl.innerText = `Total Pemasukan : ${formatRupiah(totalPemasukanBulan)}`;
        totalPengeluaranBulanEl.innerText = `Total Pengeluaran : ${formatRupiah(totalPengeluaranBulan)}`;

        renderRiwayat();
    }

    function renderRiwayat() {
        const transaksi = dapatkanSemuaTransaksi();
        
        riwayatListEl.innerHTML = '';

        if (transaksi.length === 0) {
            riwayatListEl.innerHTML = '<p class="riwayat-item">Belum ada riwayat transaksi.</p>';
            return;
        }

        const transaksiTerbalik = transaksi.slice().reverse();

        for (const tx of transaksiTerbalik) {
            const item = document.createElement('p');
            
            item.classList.add('riwayat-item', tx.tipe); 

            const tanggal = new Date(tx.tanggal).toLocaleDateString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric'
            });

            item.innerHTML = `
                ${tx.tipe === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}: <strong>${formatRupiah(tx.nominal)}</strong>
                <span>${tanggal}</span>
            `;
            
            riwayatListEl.appendChild(item);
        }
    }

    function tambahTransaksi(tipe) {
        let inputEl;
        if (tipe === 'pemasukan') {
            inputEl = inputPemasukanEl;
        } else {
            inputEl = inputPengeluaranEl;
        }

        const nominal = parseInt(inputEl.value);

        if (!nominal || nominal <= 0) {
            alert('Masukkan nominal yang valid!');
            return;
        }

        const transaksiBaru = {
            id: Date.now(),
            tipe: tipe,
            nominal: nominal,
            tanggal: new Date().toISOString()
        };

        const transaksi = dapatkanSemuaTransaksi();
        transaksi.push(transaksiBaru);
        simpanTransaksi(transaksi);

        inputEl.value = '';

        updateUI();
    }

    function hapusSemuaRiwayat() {
        const konfirmasi = confirm('Apakah Anda yakin ingin menghapus semua riwayat? Data tidak dapat dikembalikan.');

        if (konfirmasi) {
            localStorage.removeItem(STORAGE_KEY);
            updateUI();
        }
    }

    btnTambahPemasukan.addEventListener('click', () => {
        tambahTransaksi('pemasukan');
    });

    btnTambahPengeluaran.addEventListener('click', () => {
        tambahTransaksi('pengeluaran');
    });

    btnHapusRiwayat.addEventListener('click', hapusSemuaRiwayat);

    updateUI();

});
