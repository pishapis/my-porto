class Fetch {
    constructor(urlString) {
        this.urlString = urlString;
        this.method = "POST"; // Metode disetel ke "GET" sesuai dengan permintaan kode yang diberikan
        this.idElement = null;
        this.disabled = false;
        this.disabledIdTarget = "";
        this.redirect = false;
        this.redirectUrlBenar = "./";
        this.redirectUrlSalah = "./";
        this.redirectUrlWindow = "_self";
        this.loader = true;
        this.bodyObject = null;
        this.request = null;
        this.csrfToken = null;
    }

    async run(idForm = null) {
        this.idForm = idForm;

        if (this.idForm) {
            console.log('%c FETCHING DENGAN FORMULIR.. ', 'background: #222; color: lime');
            // Kode untuk mengambil CSRF Token telah dihapus karena tidak diperlukan dalam metode fetch yang baru

            const idForm = this.idForm.replace("#", '');
            const formInput = document.getElementById(idForm);
            if (!formInput) {
                ALERT('Nama Formulir Salah', 'bad');
                return { ack: 'bad', message: 'nama formulir salah' };
            }
            const formData = new FormData(formInput);
            const requestOption = { method: this.method.toUpperCase(), body: formData }; // Menghapus headers karena tidak diperlukan dalam permintaan fetch yang baru
            this.request = requestOption; // Mengubah objek permintaan menjadi hanya opsi permintaan
        }

        if (this.disabled) {
            const id = this.disabledIdTarget.replace("#", '');
            const target = document.getElementById(id);
            if (target) {
                target.disabled = true;
            }
        }

        if (this.loader) {
            const overlayDiv = document.getElementById('overlayDiv');
            if (overlayDiv) { overlayDiv.classList.remove('hidden'); }
        }

        try {
            const fetching = await fetch(this.urlString, this.request); // Menggunakan fetch dengan URL dan opsi permintaan yang telah disiapkan
            const resultObj = await fetching.json();
            console.log('%c 🚀 RESULT FETCHING ', 'background: #FFFF00; color: #000', resultObj);

            if (this.disabled) {
                const id = this.disabledIdTarget.replace("#", '');
                const target = document.getElementById(id);
                if (target) {
                    target.disabled = false;
                }
            }
            if (this.loader) {
                const overlayDiv = document.getElementById('overlayDiv');
                if (overlayDiv) { overlayDiv.classList.add('hidden'); }
            }

            if (this.redirect) {
                if (resultObj.ack == "ok") {
                    window.location.href = this.redirectUrlBenar;
                } else {
                    ALERT('Gagal', 'bad');
                    setTimeout(() => {
                        window.location.href = this.redirectUrlSalah;
                    }, 2500);
                }
            } else {
                // Tindakan lain jika tidak ada redirect
            }

            return resultObj;
        } catch (error) {
            // Tangani kesalahan jika terjadi
            console.error(error);
            ALERT("gagal tambah pembelian","bad");
            return { ack: 'bad', message: 'gagal tambah pembelian' };
        }
    }
}



ALERT = function (message, type = '') {

    if (!message) { return; }
    if (typeof message !== 'string') { return; }

    alertPlaceholder = document.getElementById('alertPlaceholder');
    if (!alertPlaceholder) {
        createDiv = document.createElement('div');
        createDiv.setAttribute('id', 'alertPlaceholder');
        document.body.appendChild(createDiv);
        alertPlaceholder = document.getElementById('alertPlaceholder');
    }

    if (type.search(/ok/i) >= 0) {
        isiAlert = /* html */` 
      <div id="isiAlert" 
      style="z-index:2000; position:fixed; top:50px; right:10px;" 
      class="rounded-xl p-2 bg-green-700 text-white flex align-center" >
      <span class="icon-circlecheck text-white text-lg"></span> &nbsp ${message} 
      </div>`;

    } else if (type.search(/bad/i) >= 0) {

        isiAlert = /* html */`<div id="isiAlert" 
        style="z-index:2000; position:fixed; top:50px; right:10px;" 
        class="rounded-xl p-2  bg-red-700 text-white flex align-center" >
        <span class="icon-circleclose2 text-white text-lg"></span> &nbsp ${message}</div>`;
    } else {

        isiAlert = /* html */`<div id="isiAlert" 
      style="z-index:2000;  position:fixed; top:50px; right:10px;" 
      class="rounded-xl p-2 bg-orange-400 text-black  flex align-center" >
        <span class="icon-circlepentung text-black text-lg"></span> &nbsp ${message} 
      </div>`;
    }

    alertPlaceholder.innerHTML = isiAlert;

    isiAlertDiv = document.getElementById('isiAlert');
    isiAlertDiv.classList.add('animate__animated');
    isiAlertDiv.classList.add('animate__fadeInRight');

    setTimeout(function () {
        isiAlertDiv.classList.remove('animate__fadeInRight');
        isiAlertDiv.classList.add('animate__fadeOutRight');
    }, 2000);
};

function formValidator(namaKelas) {
    const elements = document.querySelectorAll(`input[required].${namaKelas}, select[required].${namaKelas}, textarea[required].${namaKelas}`);
    let stop = false;
    [...elements].forEach(currentItem => {

        // reseter
        const divValidasi = document.getElementById("validator-" + currentItem.id);
        if (divValidasi) {divValidasi.innerHTML = "&nbsp;";}

        if (currentItem.value == "" || typeof currentItem.value == "undefined" || currentItem.value.length == 0) {
            if (divValidasi) {divValidasi.innerText = "* wajib diisi";}
            stop = true;
            return false;
        }
        let panjangMinimal = parseInt(currentItem.getAttribute("required-min"));
        if (isNaN(panjangMinimal)) { panjangMinimal = 0; }
        if (currentItem.value.length < panjangMinimal) {

            if (divValidasi) {divValidasi.innerText = `isi minimal ${panjangMinimal} karakter`;}
            stop = true;
            return false;
        }

        let panjangMaximal = parseInt(currentItem.getAttribute("required-max"));
        if (isNaN(panjangMaximal)) { panjangMaximal = 9999; }
        if (currentItem.value.length > panjangMaximal) {
            if (divValidasi) {divValidasi.innerText = `isi maximal ${panjangMaximal} karakter`;}
            stop = true;
            return false;
        }


 
        if (currentItem.getAttribute("type") == "file") {
            if (typeof currentItem.files[0] === "undefined") {
                if (divValidasi) {divValidasi.innerText = "* wajib upload file";}
                stop = true;
                return false;
            } else {
                if (currentItem.files[0].size > 10 * 1024 * 1024) {
                    if (divValidasi) {divValidasi.innerText = "* file tidak boleh lebih dari 10 MB";}
                    stop = true;
                    return false;
                }
            }
        }
    });


    if (stop) { return false; }
    return true;
}


function rp (angka, prefix) {
    if (parseInt(angka) == NaN) { return 0; }
    if (parseInt(angka) == 0) { return 0; }

    if (!angka) { return }
    minus = false;
    if (angka < 0) {
        minus = true; angka = Math.abs(angka);
    }
    numberString = angka.toString(),
        split = numberString.split(','),
        sisa = split[0].length % 3,
        rupiah = split[0].substr(0, sisa),
        ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    // tambahkan titik jika yang di input sudah menjadi angka ribuan
    if (ribuan) {
        separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;

    if (minus) {
        return prefix == undefined ? '-' + rupiah : (rupiah ? 'Rp. -' + rupiah : '');
    }
    return prefix == undefined ? rupiah : (rupiah ? 'Rp. ' + rupiah : '');
};

function get_tanggal(tanggal) {

    // const timestamp = parseInt(tanggal);
    const date = new Date(tanggal);
    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "October", "November", "December"
    ];
    const day = date.getDate();
    let dayjadi = "";
    if (day.toString().length == 1) {
        dayjadi = "0" + day;
    } else {
        dayjadi = day;
    }
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const formattedDate = `${dayjadi} ${month} ${year}`;
    return formattedDate;
}