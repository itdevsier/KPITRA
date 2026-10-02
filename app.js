const KEY = "dirops-tracker-ui-v3";
const statuses = ["Selesai", "On Progress", "On Track", "Terkendala", "At Risk", "Belum Mulai"];
const viewToCollection = { dirops: "dirops", kolegial: "kolegial", tracker: "tracker", monev: "monev", actions: "actions", priority: "priority", users: "users", master: "master" };
const state = load();
if (!["Super Admin","Direksi","Kepala Divisi","Admin/Sekretaris"].includes(state.currentRole)) state.currentRole = "Admin/Sekretaris";
if (!state.selectedYear) state.selectedYear = "2026";
if (!state.dashboardYear) state.dashboardYear = state.selectedYear;
if (!state.compareYear) state.compareYear = String((+state.selectedYear || 2026) - 1);
if (!state.dashboardDivision) state.dashboardDivision = "Semua Divisi";
if (!state.dashboardDataStatus) state.dashboardDataStatus = "Data Aktif";
if (!state.profile) state.profile = { name: "Dirops PT SIER", email: "sekretariat@pt-sier.co.id" };
if (!state.currentDivision) state.currentDivision = "KSR";
if (!state.notifications) state.notifications = [];
if (typeof state.isLoggedIn !== "boolean") state.isLoggedIn = false;
if (!state.kolegial || state.kolegial.length < 10) {
  state.kolegial = [
    { id:id(), kode:"1", kategori:"A. Nilai Ekonomi dan Sosial untuk Indonesia", indikator:"Realisasi Laba Bersih Tanpa Revaluasi", satuan:"Rp Miliar", target:100, tw1:"", tw2:"", tw3:"", tw4:"", bobot:15, catatan:"" },
    { id:id(), kode:"2", kategori:"A. Nilai Ekonomi dan Sosial untuk Indonesia", indikator:"Pertumbuhan Pendapatan Utilitas", satuan:"Rp Miliar", target:100, tw1:"", tw2:"", tw3:"", tw4:"", bobot:14, catatan:"" },
    { id:id(), kode:"3", kategori:"A. Nilai Ekonomi dan Sosial untuk Indonesia", indikator:"Implementasi Centralized Treasury Management (CTM)", satuan:"Waktu", target:100, tw1:"", tw2:"", tw3:"", tw4:"", bobot:8, catatan:"" },
    { id:id(), kode:"4", kategori:"A. Nilai Ekonomi dan Sosial untuk Indonesia", indikator:"Implementasi Operating Excellent", satuan:"%", target:100, tw1:"", tw2:"", tw3:"", tw4:"", bobot:5, catatan:"" },
    { id:id(), kode:"5", kategori:"A. Nilai Ekonomi dan Sosial untuk Indonesia", indikator:"Realisasi Inisiatif Strategis Prioritas", satuan:"%", target:100, tw1:"", tw2:"", tw3:"", tw4:"", bobot:8, catatan:"" },
    { id:id(), kode:"6", kategori:"A. Nilai Ekonomi dan Sosial untuk Indonesia", indikator:"Pengembangan Kawasan Industri", satuan:"Ha", target:100, tw1:"", tw2:"", tw3:"", tw4:"", bobot:10, catatan:"" },
    { id:id(), kode:"7", kategori:"B. Inovasi Model Bisnis", indikator:"Implementasi Sentralisasi Pengelolaan Utilitas", satuan:"%", target:100, tw1:"", tw2:"", tw3:"", tw4:"", bobot:10, catatan:"" },
    { id:id(), kode:"8", kategori:"C. Kepemimpinan Teknologi", indikator:"Implementasi TI aman & terintegrasi (AI/SSC)", satuan:"%", target:100, tw1:"", tw2:"", tw3:"", tw4:"", bobot:10, catatan:"" },
    { id:id(), kode:"9", kategori:"D. Peningkatan Investasi", indikator:"Realisasi Penyerapan Investasi", satuan:"Rp Miliar", target:100, tw1:"", tw2:"", tw3:"", tw4:"", bobot:14, catatan:"" },
    { id:id(), kode:"10", kategori:"E. Pengembangan Talenta", indikator:"Implementasi Standardisasi Struktur Organisasi", satuan:"Waktu", target:100, tw1:"", tw2:"", tw3:"", tw4:"", bobot:6, catatan:"" },
  ];
}
if (!state.kpiMaster) {
  state.kpiMaster = {
    dirops: state.dirops.map((x,i) => ({ id:id(), kode:x.kode, kategori:"", indikator:x.indikator, satuan:x.satuan, target:x.target, bobot:x.bobot, polaritas:"Max", kelompok:x.kelompok || (i < 4 ? "Kolegial" : "Direktorat") })),
    kolegial: state.kolegial.map(x => ({ id:id(), kode:x.kode, kategori:x.kategori || "", indikator:x.indikator, satuan:x.satuan, target:x.target, bobot:x.bobot, polaritas:"Max" }))
  };
}
state.dirops.forEach((item,index)=>{ if(!item.kelompok) item.kelompok = index < 4 ? "Kolegial" : "Direktorat"; });
state.kpiMaster.dirops.forEach((item,index)=>{ if(!item.kelompok) item.kelompok = state.dirops[index]?.kelompok || (index < 4 ? "Kolegial" : "Direktorat"); });
const inferKpiDivision = item => {
  const text = `${item.indikator || ""} ${item.kategori || ""}`.toLowerCase();
  if(/air|waduk|utilitas|proper|green|lingkungan/.test(text)) return "KSR";
  if(/investasi|kawasan|tenant|okupansi/.test(text)) return "KPR/PIER";
  if(/digital|teknologi|sistem|treasury|struktur organisasi/.test(text)) return "Lintas Divisi";
  return "Lintas Divisi";
};
["dirops","kolegial"].forEach(type => {
  (state[type] || []).forEach(item => {
    if(!item.penanggungJawab) item.penanggungJawab = inferKpiDivision(item);
    if(item.targetTw1 === undefined) item.targetTw1 = Math.round((+item.target || 0) * .25 * 100) / 100;
    if(item.targetTw2 === undefined) item.targetTw2 = Math.round((+item.target || 0) * .5 * 100) / 100;
    if(item.targetTw3 === undefined) item.targetTw3 = Math.round((+item.target || 0) * .75 * 100) / 100;
    if(item.targetTw4 === undefined) item.targetTw4 = +item.target || 0;
  });
  (state.kpiMaster[type] || []).forEach(item => {
    if(!item.penanggungJawab){
      const active = (state[type] || []).find(row=>row.kode===item.kode || row.indikator===item.indikator);
      item.penanggungJawab = active?.penanggungJawab || inferKpiDivision(item);
    }
    const active = (state[type] || []).find(row=>row.kode===item.kode || row.indikator===item.indikator);
    ["targetTw1","targetTw2","targetTw3","targetTw4"].forEach((field,index)=>{
      if(item[field] === undefined) item[field] = active?.[field] ?? Math.round((+item.target || 0) * ((index+1)/4) * 100) / 100;
    });
  });
});
const migratedSettingIds = {};
["dirops","kolegial"].forEach(type => (state.kpiMaster[type] || []).forEach(item=>{
  const key = `${type}-${item.tahun || "2026"}-${item.nomorDokumen || "default"}`;
  if(!migratedSettingIds[key]) migratedSettingIds[key] = item.settingId || id();
  if(!item.settingId) item.settingId = migratedSettingIds[key];
  if(!item.settingName) item.settingName = type === "dirops" ? `KPI Direktur Operasi ${item.tahun || "2026"}` : `KPI Direksi Kolegial ${item.tahun || "2026"}`;
  if(!item.createdBy) item.createdBy = "Direksi";
  if(!item.createdAt) item.createdAt = "13 Mei 2026";
  if(item.isOpen === undefined) item.isOpen = true;
  if(!item.publishedAt && item.statusValidasi === "Final") item.publishedAt = item.tanggalDokumen || "13 Mei 2026";
}));
["dirops","kolegial","tracker","monev","actions","priority"].forEach(col => (state[col] || []).forEach(item => { if(!item.tahun) item.tahun = "2026"; }));
["dirops","kolegial"].forEach(type => (state.kpiMaster[type] || []).forEach(item => { if(!item.tahun) item.tahun = "2026"; }));
(state.tracker || []).map(item=>item.divisi).filter(Boolean).forEach(divisi=>{
  const exists = (state.master || []).some(item=>String(item.tipe || "").toLowerCase()==="divisi" && item.nama===divisi);
  if(!exists) state.master.push({ id:id(), tipe:"Divisi", nama:divisi, keterangan:"Tersinkron dari Tracker Divisi" });
});
if(!(state.master || []).some(item=>String(item.tipe || "").toLowerCase()==="divisi" && item.nama==="Lintas Divisi")){
  state.master.push({ id:id(), tipe:"Divisi", nama:"Lintas Divisi", keterangan:"Agenda gabungan seluruh Kepala Divisi" });
}
let activeView = "dashboard";
let activeDivision = "Semua Divisi";
let trackerSearch = "";
let trackerDivisionFilter = "Semua Divisi";
let trackerStatusFilter = "Semua Status";
let trackerEntries = 8;
let reportTab = "Dirops";
let reportMonth = "September";
let reportYear = "2026";
let settingSearch = "";
const listViewState = {
  monev: { search: "", entries: 8, status: "Semua Status", secondary: "Semua Prioritas" },
  actions: { search: "", entries: 8, status: "Semua Status", secondary: "Semua PIC" },
  priority: { search: "", entries: 8, status: "Semua Status", secondary: "Semua PIC" }
};
let modal = {};
let tableSeq = 0;
const roleViews = {
  "Super Admin": ["dashboard","dirops","kolegial","tracker","monev","actions","priority","reports","master","users"],
  "Direksi": ["dashboard","dirops","kolegial","tracker","monev","actions","priority","reports","master"],
  "Admin/Sekretaris": ["dashboard","dirops","kolegial","tracker","monev","actions","priority","reports"],
  "Kepala Divisi": ["dashboard","dirops","kolegial","tracker","reports"]
};

function id() { return Math.random().toString(36).slice(2, 10); }
function seed() {
  return {
    dirops: [
      { id:id(), kode:"OP.1", indikator:"Tingkat Okupansi Kawasan Industri", satuan:"%", target:92, tw1:91.2, tw2:92.5, tw3:93, tw4:94.2, bobot:20, catatan:"Melampaui target berkat ekspansi lahan logistik." },
      { id:id(), kode:"OP.2", indikator:"Realisasi Investasi Infrastruktur", satuan:"Rp Miliar", target:45, tw1:10, tw2:22, tw3:35, tw4:43.5, bobot:15, catatan:"Beberapa pekerjaan tertunda akibat faktor cuaca." },
      { id:id(), kode:"OP.3", indikator:"Key Tenant Satisfaction Index", satuan:"Skala 1-5", target:4.2, tw1:4.1, tw2:4.15, tw3:4.22, tw4:4.25, bobot:15, catatan:"SOP respon darurat mempercepat penanganan keluhan." },
      { id:id(), kode:"OP.4", indikator:"Capaian Zero Waste Plant JSP", satuan:"% Progress", target:100, tw1:25, tw2:40, tw3:40, tw4:40, bobot:25, catatan:"Eskalasi keterlambatan vendor instalasi." },
      { id:id(), kode:"OP.5", indikator:"Digitalisasi Operasional Lapangan", satuan:"Sistem", target:100, tw1:10, tw2:50, tw3:75, tw4:100, bobot:10, catatan:"Sistem SIER Tracker diimplementasikan penuh." },
      { id:id(), kode:"OP.6", indikator:"Pemberdayaan UMKM Mitra Binaan", satuan:"UMKM", target:120, tw1:30, tw2:65, tw3:95, tw4:125, bobot:15, catatan:"Program inkubasi digital menambah jangkauan mitra." },
    ],
    kolegial: [
      { id:id(), kode:"KOL.1", indikator:"Laba Bersih Tanpa Revaluasi", satuan:"Rp Miliar", target:100, tw1:24, tw2:42, tw3:65, tw4:82, bobot:25, catatan:"Perlu penguatan pendapatan utilitas." },
      { id:id(), kode:"KOL.2", indikator:"Centralized Treasury Management", satuan:"Status", target:100, tw1:30, tw2:55, tw3:80, tw4:90, bobot:15, catatan:"Integrasi proses treasury berjalan." },
      { id:id(), kode:"KOL.3", indikator:"Standardisasi Struktur Organisasi", satuan:"Status", target:100, tw1:25, tw2:70, tw3:85, tw4:95, bobot:20, catatan:"Menunggu final penetapan organisasi." },
    ],
    tracker: [
      { id:id(), divisi:"KSR", pic:"R. Pratama", pekerjaan:"Audit Kepatuhan & Sertifikasi HSE", output:"Sertifikat ISO 45001 dan laporan audit", deadline:"15 Feb", status:"Selesai", progress:100, catatan:"Sertifikasi ISO 45001 diselesaikan penuh." },
      { id:id(), divisi:"KPR/PIER", pic:"B. Nugroho", pekerjaan:"Pembangunan Drainase Primer PIER", output:"Drainase primer berfungsi sesuai spesifikasi", deadline:"28 Feb", status:"On Progress", progress:75, catatan:"Tahap pengerasan beton selesai." },
      { id:id(), divisi:"JSP", pic:"D. Sari", pekerjaan:"Konstruksi Pipa Daur Ulang IPAL", output:"Jaringan pipa daur ulang siap diuji", deadline:"10 Mar", status:"Terkendala", progress:40, catatan:"Terkendala pengiriman fitting pipa utama." },
      { id:id(), divisi:"Logistik", pic:"A. Wijaya", pekerjaan:"Standarisasi SOP Gudang Logistik", output:"SOP gudang logistik disahkan", deadline:"22 Mar", status:"On Progress", progress:15, catatan:"Kick-off dan review draft pertama." },
    ],
    monev: [
      { id:id(), agenda:"Audit ESG Terpadu Holding", prioritas:"Kritis", pic:"D. Pratama", target:"20 Jan", status:"At Risk", progress:40, catatan:"Keterlambatan dokumen pendukung." },
      { id:id(), agenda:"Standarisasi Mutu Layanan Tenant", prioritas:"Tindak Lanjut", pic:"S. Wijaya", target:"25 Jan", status:"On Progress", progress:70, catatan:"Draft SOP sudah dikonsolidasikan." },
      { id:id(), agenda:"Digitalisasi Pemantauan Kawasan", prioritas:"Pantau", pic:"M. Ibrahim", target:"10 Feb", status:"On Track", progress:65, catatan:"Uji coba dashboard area PIER." },
      { id:id(), agenda:"Pembangunan Green Belt Buffer", prioritas:"Tindak Lanjut", pic:"R. Handoko", target:"15 Feb", status:"On Progress", progress:55, catatan:"Pendataan lahan buffer berjalan." },
    ],
    actions: [
      { id:id(), agenda:"Revisi SOP Logistik", target:"15 Jan", pic:"A. Wijaya", status:"Selesai", progress:100, catatan:"Dokumen final disetujui." },
      { id:id(), agenda:"Audit KSR Triwulan I", target:"18 Jan", pic:"R. Pratama", status:"On Progress", progress:85, catatan:"Laporan temuan sudah siap." },
      { id:id(), agenda:"Zero Waste Plant", target:"22 Jan", pic:"D. Sari", status:"Terkendala", progress:40, catatan:"Vendor belum konfirmasi jadwal." },
      { id:id(), agenda:"Monev Danareksa Q1", target:"25 Jan", pic:"B. Nugroho", status:"On Progress", progress:75, catatan:"Data sudah terkumpul." },
    ],
    priority: [
      { id:id(), kode:"OP.4 (JSP)", isu:"Vendor terlambat mengirimkan pipa fitting utama IPAL JSP", dampak:"Keterlambatan Proyek", pic:"Kadiv JSP", status:"Tertunda", mitigasi:"Kirim surat peringatan dan cari alternatif vendor lokal.", evidence:"Surat_Teguran_V3.pdf" },
      { id:id(), kode:"ACT.2 (IT)", isu:"Keterbatasan alokasi firewall eksternal untuk sistem IoT CCTV gerbang", dampak:"Risiko Keamanan", pic:"Kadiv IT", status:"On Progress", mitigasi:"Rule lokal sementara sembari menunggu Capex.", evidence:"Nota_Dinas_Pengadaan_FW.docx" },
      { id:id(), kode:"MON.6 (KPR)", isu:"Tingkat adopsi portal digital tenant masih di bawah target 80%", dampak:"Adopsi Lambat", pic:"Kadiv KPR", status:"Tereksekusi", mitigasi:"Sosialisasi ke tenant utama PIER.", evidence:"Laporan_Sosialisasi_TW4.pdf" },
    ],
    users: [
      { id:id(), nama:"Dirops PT SIER - KPI", role:"Direksi", akses:"Seluruh Divisi", aktivitas:"Baru saja", status:"Aktif" },
      { id:id(), nama:"Sekretaris Direksi Operasi", role:"Admin/Sekretaris", akses:"Sekretariat Dirops", aktivitas:"3 jam yang lalu", status:"Aktif" },
      { id:id(), nama:"Kepala Divisi KSR", role:"Kepala Divisi", akses:"Tracker Divisi", aktivitas:"2 hari yang lalu", status:"Aktif" },
    ],
    master: [
      { id:id(), tipe:"Divisi", nama:"KSR", keterangan:"Operasional kawasan SIER" },
      { id:id(), tipe:"Divisi", nama:"KPR/PIER", keterangan:"Operasional kawasan Pasuruan" },
      { id:id(), tipe:"Divisi", nama:"Lintas Divisi", keterangan:"Agenda gabungan seluruh Kepala Divisi" },
      { id:id(), tipe:"Status", nama:"At Risk / Terkendala", keterangan:"Butuh eskalasi" },
      { id:id(), tipe:"Role", nama:"Admin/Sekretaris", keterangan:"Input realisasi dan monitoring" },
    ],
    audit:["Sistem dimuat dan seluruh menu siap digunakan."]
  };
}
function load(){ return JSON.parse(localStorage.getItem(KEY) || "null") || seed(); }
function notificationType(msg=""){
  const text = msg.toLowerCase();
  if(text.includes("dirops") || text.includes("kolegial") || text.includes("tw")) return "Kinerja";
  if(text.includes("tracker") || text.includes("monev") || text.includes("actions")) return "Monitoring";
  if(text.includes("priority") || text.includes("isu")) return "Isu";
  if(text.includes("laporan") || text.includes("export")) return "Laporan";
  return "Sistem";
}
function pushNotification(message, type=notificationType(message)){
  state.notifications.unshift({ id:id(), message, type, time:new Date().toLocaleString("id-ID"), read:false });
  state.notifications = state.notifications.slice(0, 20);
}
function save(msg){
  if(msg){
    state.audit.unshift(`${new Date().toLocaleString("id-ID")} - ${msg}`);
    pushNotification(msg);
  }
  localStorage.setItem(KEY, JSON.stringify(state));
  render();
  showToast("Perubahan tersimpan");
}
function showToast(message, type="success"){
  const toast = $("#save-toast");
  if(!toast) return;
  toast.textContent = message;
  toast.className = `save-toast ${type} show`;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>toast.classList.remove("show"), 2600);
}
function renderProfile(){
  const name = state.profile.name || "Dirops PT SIER";
  $("#profile-name").textContent = name;
  $("#profile-email").textContent = state.profile.email || "-";
  $("#profile-role").textContent = state.currentRole;
  $("#top-profile-name").textContent = name;
  $("#top-profile-role").textContent = isKadiv() ? `${state.currentRole} | ${state.currentDivision}` : state.currentRole;
  const divisionSwitch = $("#division-switch");
  if(divisionSwitch){
    divisionSwitch.hidden = !isKadiv();
    divisionSwitch.value = state.currentDivision;
  }
  $("#profile-initials").textContent = name.split(/\s+/).filter(Boolean).slice(0,2).map(word=>word[0]).join("").toUpperCase() || "DP";
}
function currentNotifications(){
  const riskItems = [
    ...state.tracker.filter(x=>["At Risk","Terkendala"].includes(x.status)).map(x=>({type:"Monitoring", message:`${x.divisi}: ${x.pekerjaan} perlu perhatian`, time:"Status aktif", read:false})),
    ...state.monev.filter(x=>["At Risk","Terkendala"].includes(x.status)).map(x=>({type:"Monitoring", message:`Monev: ${x.agenda} berstatus ${x.status}`, time:"Status aktif", read:false})),
    ...state.priority.filter(x=>["At Risk","Terkendala","Tertunda"].includes(x.status)).map(x=>({type:"Isu", message:`Isu prioritas: ${x.isu}`, time:"Status aktif", read:false}))
  ];
  return [...(state.notifications || []), ...riskItems].slice(0, 12);
}
function renderNotifications(){
  const panel = $("#notification-panel");
  const count = $("#notification-count");
  if(!panel || !count) return;
  const items = currentNotifications();
  const unread = items.filter(x=>!x.read).length;
  count.textContent = unread;
  count.style.display = unread ? "grid" : "none";
  panel.innerHTML = `<div class="notification-head"><strong>Notifikasi</strong><button type="button" data-read-notifications>Tandai dibaca</button></div>
    <div class="notification-list">${items.length ? items.map(item=>`<div class="notification-item ${item.read?"read":""}"><span>${esc(item.type)}</span><strong>${esc(item.message)}</strong><small>${esc(item.time)}</small></div>`).join("") : `<div class="notification-empty">Belum ada notifikasi.</div>`}</div>`;
}
function toggleProfileMenu(force){
  const menu = $("#profile-menu");
  const trigger = $("#profile-trigger");
  const open = typeof force === "boolean" ? force : !menu.classList.contains("open");
  menu.classList.toggle("open", open);
  menu.setAttribute("aria-hidden", String(!open));
  trigger.setAttribute("aria-expanded", String(open));
}
function toggleNotificationPanel(force){
  const panel = $("#notification-panel");
  const trigger = $("#notification-trigger");
  const open = typeof force === "boolean" ? force : !panel.classList.contains("open");
  panel.classList.toggle("open", open);
  panel.setAttribute("aria-hidden", String(!open));
  trigger?.setAttribute("aria-expanded", String(open));
}
function openProfileModal(){
  toggleProfileMenu(false);
  $("#profile-name-input").value = state.profile.name || "";
  $("#profile-email-input").value = state.profile.email || "";
  $("#profile-role-input").value = state.currentRole;
  $("#profile-modal").classList.add("open");
  $("#profile-modal").setAttribute("aria-hidden", "false");
}
function closeProfileModal(){
  $("#profile-modal").classList.remove("open");
  $("#profile-modal").setAttribute("aria-hidden", "true");
}
function applyAuthState(){
  document.body.classList.toggle("logged-out", !state.isLoggedIn);
  const roleField = $("#login-role");
  if(roleField) roleField.value = state.currentRole;
  refreshIcons();
}
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
const avg = arr => Math.round(arr.reduce((a,b)=>a+(+b.progress||0),0)/(arr.length||1));
function latestRealization(x){
  return ["tw4","tw3","tw2","tw1"].map(key=>+x[key] || 0).find(value=>value > 0) || 0;
}
const achievement = (x,key="latest") => {
  const actual = key === "latest" ? latestRealization(x) : (+x[key] || 0);
  const target = +x.target || 0;
  if(!target || !actual) return 0;
  return x.polaritas === "Min" ? Math.min(target / actual, 1) : Math.min(actual / target, 1);
};
const score = x => achievement(x) * (+x.bobot||0);
const cls = s => s==="Selesai"||s==="Tereksekusi"||s==="Aktif"||s==="Open" ? "done" : s==="Terkendala"||s==="At Risk"||s==="Tertunda" ? "risk" : s==="Belum Mulai"||s==="Terkunci"||s==="Closed" ? "idle" : s==="On Track" ? "track" : "progress";
const pill = s => `<span class="pill ${cls(s)}">${esc(s)}</span>`;
const actions = (col,id) => `<div class="actions"><button class="icon" title="View" data-view-item="${col}" data-id="${id}"><i data-lucide="eye"></i></button>${canDelete(col) ? `<button class="icon delete" title="Hapus" data-delete="${col}" data-id="${id}"><i data-lucide="trash-2"></i></button>` : ""}</div>`;
const kpiMasterActions = (type,id) => `<div class="actions"><button class="icon" title="View" data-view-item="kpiMaster${type}" data-id="${id}"><i data-lucide="eye"></i></button><button class="icon delete" title="Hapus" data-delete="kpiMaster${type}" data-id="${id}"><i data-lucide="trash-2"></i></button></div>`;
function byYear(rows, year=state.selectedYear){ return (rows || []).filter(item=>String(item.tahun || year) === String(year)); }
function mastersByYear(type){ return byYear(state.kpiMaster[type] || []); }
function currentRows(col){ return byYear(state[col] || []); }
function activeMasterRows(rows){ return (rows || []).filter(item=>!item.statusValidasi || item.statusValidasi === "Final"); }
function divisionOptions(rows=currentRows("tracker")){
  const fromMaster = (state.master || [])
    .filter(item=>String(item.tipe || "").toLowerCase()==="divisi")
    .map(item=>item.nama)
    .filter(Boolean);
  const fromTracker = (rows || []).map(item=>item.divisi).filter(Boolean);
  return [...new Set([...fromMaster, ...fromTracker])];
}
const allKpiMasters = () => [
  ...mastersByYear("dirops").map(item=>({...item, jenisKpi:"Dirops", masterCol:"kpiMasterDirops"})),
  ...mastersByYear("kolegial").map(item=>({...item, jenisKpi:"Kolegial", masterCol:"kpiMasterKolegial"}))
];
function isAdmin(){ return state.currentRole === "Super Admin"; }
function isDirector(){ return state.currentRole === "Direksi"; }
function isKadiv(){ return state.currentRole === "Kepala Divisi"; }
function isSecretary(){ return state.currentRole === "Admin/Sekretaris"; }
function canAccessKpiRow(item){
  if(!isKadiv()) return true;
  const owner = item?.penanggungJawab || "Lintas Divisi";
  return owner === state.currentDivision || ["Lintas Divisi","ALL Kadiv","Semua Divisi"].includes(owner);
}
function canAccessTrackerRow(item){
  if(!isKadiv()) return true;
  return item?.divisi === state.currentDivision || item?.divisi === "Lintas Divisi";
}
function canSetupMaster(){ return isAdmin() || isDirector(); }
function canCreate(col){
  if(isAdmin()) return true;
  if(isDirector()) return ["kpiMaster","kpiMasterDirops","kpiMasterKolegial","tracker","monev","actions","priority"].includes(col);
  if(isSecretary()) return ["tracker","monev","actions","priority"].includes(col);
  if(isKadiv()) return false;
  return false;
}
function canDelete(col){
  if(isAdmin()) return true;
  if(isDirector()) return ["kpiMasterDirops","kpiMasterKolegial","tracker","monev","actions","priority"].includes(col);
  return false;
}
function allowedViews(){
  return roleViews[state.currentRole] || roleViews["Admin/Sekretaris"];
}
function canView(view){
  return allowedViews().includes(view);
}
function getCollection(col){
  if(col==="kpiMaster") return allKpiMasters();
  if(col==="kpiMasterDirops") return state.kpiMaster.dirops;
  if(col==="kpiMasterKolegial") return state.kpiMaster.kolegial;
  return state[col];
}
function setCollection(col, rows){
  if(col==="kpiMasterDirops") state.kpiMaster.dirops = rows;
  else if(col==="kpiMasterKolegial") state.kpiMaster.kolegial = rows;
  else state[col] = rows;
}
function cloneForYear(item, year, resetProgress=false){
  const clone = {...item, id:id(), tahun:year};
  if(resetProgress){
    ["tw1","tw2","tw3","tw4","catatan"].forEach(field=>{ if(field in clone) clone[field] = ""; });
    if("progress" in clone) clone.progress = 0;
    if("status" in clone) clone.status = "Belum Mulai";
  }
  return clone;
}
function copyPreviousYear(){
  const targetYear = String(state.selectedYear);
  const sourceYear = String((+targetYear || 2026) - 1);
  let copied = 0;
  const copyRows = (col, resetProgress=true) => {
    if(currentRows(col).length) return;
    const rows = byYear(state[col], sourceYear).map(item=>cloneForYear(item, targetYear, resetProgress));
    if(rows.length){
      state[col] = [...rows, ...state[col]];
      copied += rows.length;
    }
  };
  ["dirops","kolegial","tracker","monev","actions","priority"].forEach(col=>copyRows(col, col!=="priority"));
  ["dirops","kolegial"].forEach(type=>{
    if(mastersByYear(type).length) return;
    const settingIds = new Map();
    const rows = byYear(state.kpiMaster[type], sourceYear).map(item=>{
      const clone = cloneForYear(item, targetYear, false);
      if(!settingIds.has(item.settingId)) settingIds.set(item.settingId,id());
      clone.settingId = settingIds.get(item.settingId);
      clone.settingName = String(item.settingName||"").replace(sourceYear,targetYear);
      clone.createdAt = new Date().toISOString().slice(0,10);
      clone.publishedAt = "";
      clone.statusValidasi = "Draft";
      clone.isOpen = false;
      return clone;
    });
    if(rows.length){
      state.kpiMaster[type] = [...rows, ...state.kpiMaster[type]];
      copied += rows.length;
    }
  });
  if(!copied){
    showToast(`Data ${sourceYear} tidak tersedia atau ${targetYear} sudah terisi`, "error");
    return;
  }
  save(`Copy struktur dan agenda ${sourceYear} ke ${targetYear}`);
}
function canEditField(col, field, row=null){
  if (isAdmin()) return true;
  if (col.startsWith("kpiMaster")) return isDirector();
  if(isDirector()) return true;
  if(["dirops","kolegial"].includes(col) && row?.isOpen === false) return false;
  if(isKadiv() && ["dirops","kolegial"].includes(col)){
    return canAccessKpiRow(row) && ["tw1","tw2","tw3","tw4","catatan"].includes(field);
  }
  if(isKadiv()) return col==="tracker" && canAccessTrackerRow(row) && ["output","status","progress","catatan"].includes(field);
  const editable = {
    dirops:["tw1","tw2","tw3","tw4","catatan"],
    kolegial:["tw1","tw2","tw3","tw4","catatan"],
    tracker:["output","status","progress","catatan"],
    monev:["status","progress","catatan"],
    actions:["status","progress","catatan"],
    priority:["status","mitigasi","evidence"],
    users:[],
    master:[]
  };
  return (editable[col] || []).includes(field);
}
function inputCell(value, col="", rowId="", field="", type="text"){
  if(!col || !rowId || !field) return `<span class="input-cell">${esc(value)}</span>`;
  const row = getCollection(col)?.find(item=>item.id===rowId);
  const editable = canEditField(col, field, row);
  if(type === "textarea"){
    const text = String(value || "");
    const preview = text ? (text.length > 46 ? `${text.slice(0, 46)}...` : text) : "Isi / lihat";
    return `<button type="button" class="text-popover-trigger ${editable ? "editable" : ""}" data-text-popup="${col}" data-id="${rowId}" data-field="${field}"><span>${esc(preview)}</span><i data-lucide="maximize-2"></i></button>`;
  }
  const attrs = `class="kpi-entry" data-kpi-col="${col}" data-kpi-id="${rowId}" data-kpi-field="${field}" ${editable ? "" : "disabled"}`;
  return `<input ${attrs} type="${type}" value="${esc(value)}" placeholder="Isi">`;
}
function kpiInputCells(col, row){
  return [
    inputCell(row.tw1, col, row.id, "tw1", "number"),
    inputCell(row.tw2, col, row.id, "tw2", "number"),
    inputCell(row.tw3, col, row.id, "tw3", "number"),
    inputCell(row.tw4, col, row.id, "tw4", "number"),
    inputCell(row.catatan, col, row.id, "catatan", "textarea")
  ];
}
function inputHtml(value){ return `<span class="input-cell">${value}</span>`; }

function hero(title, desc="", stats=""){ return `<div class="hero"><div><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ""}</div>${stats ? `<div class="hero-stats">${stats}</div>` : ""}</div>`; }
function stat(label, value, delta="", tone="", icon="chart-no-axes-combined"){ return `<div class="stat-card"><div class="stat-icon"><i data-lucide="${icon}"></i></div><div class="stat-copy"><small>${label}</small><strong>${value}</strong>${delta ? `<span class="delta ${tone}">${delta}</span>` : ""}</div></div>`; }
function filterDropdown(key, value, options, attrs=""){
  return `<div class="ui-dropdown table-dropdown" data-dropdown="${key}"><button type="button" class="ui-dropdown-btn" data-dropdown-toggle="${key}"><strong>${esc(value)}</strong><i data-lucide="chevron-down" class="chev"></i></button><div class="ui-dropdown-menu">${options.map(option=>`<button type="button" class="${String(option)===String(value)?"active":""}" data-table-filter="${key}" data-value="${esc(option)}" ${attrs}>${esc(option)}</button>`).join("")}</div></div>`;
}
function syncMasterKpi(type, master){
  if(master.statusValidasi !== "Final") return;
  const structuralFields = ["kode","kategori","kelompok","indikator","penanggungJawab","satuan","target","targetTw1","targetTw2","targetTw3","targetTw4","bobot","polaritas","settingId","settingName","isOpen","publishedAt"];
  const rows = state[type] || [];
  const index = rows.findIndex(item=>String(item.tahun)===String(master.tahun) && (item.masterId===master.id || item.kode===master.kode || item.indikator===master.indikator));
  if(index >= 0){
    const updated = {...rows[index], masterId:master.id};
    structuralFields.forEach(field=>{ if(master[field] !== undefined) updated[field] = master[field]; });
    state[type] = rows.map((item,i)=>i===index ? updated : item);
    return;
  }
  const active = { id:id(), masterId:master.id, tahun:master.tahun, tw1:"", tw2:"", tw3:"", tw4:"", catatan:"" };
  structuralFields.forEach(field=>{ if(master[field] !== undefined) active[field] = master[field]; });
  state[type] = [active, ...rows];
}
function table(headers, rows, className="", pageSize=8){
  const hasNumberColumn = headers.some(header=>String(header).toLowerCase()==="no");
  let tableHeaders = headers;
  let tableRows = rows;
  if(!hasNumberColumn){
    let rowNumber = 0;
    tableHeaders = ["No", ...headers];
    tableRows = rows.replace(/<tr([^>]*)>([\s\S]*?)<\/tr>/g,(match, attrs, body)=>{
      const isSummaryRow = /section-row|total-row/.test(attrs);
      const colspanAdjusted = body.replace(/colspan="(\d+)"/g,(_, value)=>`colspan="${+value + 1}"`);
      const number = isSummaryRow ? "" : ++rowNumber;
      return `<tr${attrs}><td class="row-number">${number}</td>${colspanAdjusted}</tr>`;
    });
  }
  const count = (tableRows.match(/<tr/g) || []).length;
  const tableId = `tbl-${++tableSeq}`;
  const pages = Math.ceil(count / pageSize);
  const pageButtons = Array.from({length:pages},(_,i)=>`<button type="button" class="page-number ${i===0?"active":""}" data-page-to="${tableId}" data-index="${i}">${i+1}</button>`).join("");
  const pager = count ? `<div class="table-pager" data-pager="${tableId}"><span>1-${Math.min(pageSize,count)} dari ${count}</span><div><button type="button" class="icon" data-page="${tableId}" data-dir="-1" title="Sebelumnya"><i data-lucide="chevron-left"></i></button>${pageButtons}<button type="button" class="icon" data-page="${tableId}" data-dir="1" title="Berikutnya"><i data-lucide="chevron-right"></i></button></div></div>` : "";
  return `<div class="table-shell" data-table-shell="${tableId}" data-page-size="${pageSize}" data-page-index="0"><div class="table-panel"><table class="${className}" data-table-id="${tableId}"><thead><tr>${tableHeaders.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table></div>${pager}</div>`;
}
function donut(total, rows, color="var(--teal)"){ return `<div class="donut-wrap"><div class="donut" style="--p:72;--c:${color}" data-label="Total&#10;${total}"></div><div class="legend">${rows.map(r=>`<div class="legend-row"><span><i class="dot ${r[2]||""}"></i>${r[0]}</span><strong>${r[1]}</strong></div>`).join("")}</div></div>`; }
function progress(name,p,sub){ return `<div class="progress-card"><strong>${name}</strong><b style="float:right;color:${p<50?"var(--red)":p<90?"var(--warning)":"var(--teal)"}">${p}%</b><div class="bar ${p<50?"red":p<90?"yellow":""}"><span style="width:${p}%"></span></div><span class="subtle">${sub}</span></div>`; }
function countByStatus(rows, status){ return rows.filter(x=>x.status===status).length; }
function kpiTotal(rows){ return Math.round(rows.reduce((a,b)=>a+score(b),0)*10)/10; }
function kpiMetrics(year=state.dashboardYear || state.selectedYear){
  const diropsRows = byYear(state.dirops, year);
  const kolegialRows = byYear(state.kolegial, year);
  return {
    total: kpiTotal(diropsRows),
    kolegial: kpiTotal(diropsRows.slice(0,4)),
    direktorat: kpiTotal(diropsRows.slice(4)),
    direksi: kpiTotal(kolegialRows)
  };
}

function trendChartSvg(year){
  const labels = ["TW1","TW2","TW3","TW4"];
  const average = (collection, key) => {
    const rows = byYear(state[collection] || [], year);
    return Math.round(rows.reduce((sum,item)=>sum + achievement(item,key) * 100, 0) / (rows.length || 1));
  };
  const series = [
    { label:"Batas KPI", color:"#94a3b8", values:[25,50,75,100], dash:"7 7" },
    { label:"Dirops", color:"#008f86", values:labels.map((_,i)=>average("dirops",`tw${i+1}`)) },
    { label:"Kolegial", color:"#ff7048", values:labels.map((_,i)=>average("kolegial",`tw${i+1}`)) }
  ];
  const box = { width:760, height:230, left:58, right:24, top:24, bottom:42 };
  const x = index => box.left + ((box.width-box.left-box.right)/(labels.length-1))*index;
  const y = value => box.top + ((100-Math.max(0,Math.min(100,value)))/100)*(box.height-box.top-box.bottom);
  const grid = [100,75,50,25,0].map(value=>`<g><line x1="${box.left}" y1="${y(value)}" x2="${box.width-box.right}" y2="${y(value)}"/><text x="${box.left-12}" y="${y(value)+4}" text-anchor="end">${value}%</text></g>`).join("");
  const verticals = labels.map((label,index)=>`<g><line x1="${x(index)}" y1="${box.top}" x2="${x(index)}" y2="${box.height-box.bottom}"/><text x="${x(index)}" y="${box.height-15}" text-anchor="middle">${label}</text></g>`).join("");
  const plots = series.map(item=>{
    const points = item.values.map((value,index)=>`${x(index)},${y(value)}`).join(" ");
    const nodes = item.values.map((value,index)=>`<g class="trend-point" data-tip="${item.label} ${labels[index]}: ${value}%"><circle cx="${x(index)}" cy="${y(value)}" r="8" class="trend-point-ring"/><circle cx="${x(index)}" cy="${y(value)}" r="4"/></g>`).join("");
    return `<g class="trend-series" style="--series:${item.color}"><polyline points="${points}" ${item.dash?`stroke-dasharray="${item.dash}"`:""}/>${nodes}</g>`;
  }).join("");
  return `<svg class="trend-svg" viewBox="0 0 ${box.width} ${box.height}" role="img" aria-label="Tren capaian KPI tahun ${esc(year)}" preserveAspectRatio="xMidYMid meet"><g class="trend-grid">${grid}${verticals}</g>${plots}</svg>`;
}
function yearCompare(value, compareValue=0){
  const diff = Math.round((value - compareValue) * 10) / 10;
  return `${state.dashboardYear || state.selectedYear} vs ${state.compareYear}: ${diff >= 0 ? "+" : ""}${diff}%`;
}
function statusRows(rows, label){
  const watched = ["Belum Mulai","On Progress","On Track","At Risk","Terkendala","Selesai"];
  const body = watched.map(status=>`<tr><td>${status}</td><td class="cell-number"><b>${countByStatus(rows,status)}</b></td></tr>`).join("");
  return `${body}<tr class="total-row"><td>TOTAL ${label}</td><td class="cell-number"><b>${rows.length}</b></td></tr>`;
}

function renderDashboard(){
  const dashYear = state.dashboardYear || state.selectedYear;
  const diropsRows = byYear(state.dirops, dashYear);
  const kolegialRows = byYear(state.kolegial, dashYear);
  const activeOnly = state.dashboardDataStatus !== "Semua Data";
  const filterActive = rows => activeOnly ? rows.filter(item=>!["Selesai","Tereksekusi"].includes(item.status)) : rows;
  const filterDivision = rows => state.dashboardDivision === "Semua Divisi" ? rows : rows.filter(item=>(item.divisi || "Lintas Divisi") === state.dashboardDivision);
  const trackerData = filterActive(filterDivision(byYear(state.tracker, dashYear)));
  const monevData = filterActive(byYear(state.monev, dashYear));
  const actionsData = filterActive(byYear(state.actions, dashYear));
  const diropsTotal = kpiTotal(diropsRows);
  const diropsKolegial = kpiTotal(diropsRows.slice(0,4));
  const diropsDirektorat = kpiTotal(diropsRows.slice(4));
  const kolegialTotal = kpiTotal(kolegialRows);
  const compareMetrics = kpiMetrics(state.compareYear);
  const monitoringItems = [...trackerData, ...monevData, ...actionsData];
  const statusCount = s => countByStatus(monitoringItems, s);
  const attentionCount = statusCount("Terkendala") + statusCount("At Risk");
  const completedCount = statusCount("Selesai");
  const statusSummary = [
    ["Belum Mulai", statusCount("Belum Mulai"), "idle"],
    ["On Progress", statusCount("On Progress"), "progress"],
    ["Selesai", completedCount, "done"],
    ["Terkendala", statusCount("Terkendala"), "risk"],
    ["At Risk", statusCount("At Risk"), "risk"]
  ];
  const statusColors = { "Belum Mulai":"#94a3b8", "On Progress":"#f6c316", "Selesai":"#22c55e", "Terkendala":"#ef4444", "At Risk":"#f97352" };
  let statusCursor = 0;
  const statusGradient = statusSummary.map(([label,count])=>{
    const start = statusCursor;
    const end = statusCursor + (count / (monitoringItems.length || 1)) * 100;
    statusCursor = end;
    return `${statusColors[label]} ${start}% ${end}%`;
  }).join(", ");
  const overallStatusTip = `Total item monitoring: ${monitoringItems.length}\nSelesai: ${completedCount}\nPerlu perhatian: ${attentionCount}`;
  const overallStatus = `<div class="real-donut-wrap compact"><div class="real-donut" data-tip="${esc(overallStatusTip)}" style="background:conic-gradient(${statusGradient || "#e5e7eb 0 100%"});"><span><b>${monitoringItems.length}</b>Item</span></div><div class="real-donut-legend">${statusSummary.map(([label,count])=>`<div data-tip="${esc(`${label}: ${count} item (${Math.round(count/(monitoringItems.length||1)*100)}%)`)}"><span><i style="background:${statusColors[label]}"></i>${label}</span><b>${count}</b><em>${Math.round(count/(monitoringItems.length||1)*100)}%</em></div>`).join("")}</div></div>`;
  const divisions = divisionOptions(trackerData);
  const trackerRows = divisions.map(divisi=>{
    const rows = trackerData.filter(x=>(x.divisi || "Lintas Divisi")===divisi);
    return `<tr><td><strong>${esc(divisi)}</strong></td><td class="cell-number">${rows.length}</td><td class="cell-number">${countByStatus(rows,"Belum Mulai")}</td><td class="cell-number">${countByStatus(rows,"On Progress")}</td><td class="cell-number">${countByStatus(rows,"Selesai")}</td><td class="cell-number">${countByStatus(rows,"Terkendala")+countByStatus(rows,"At Risk")}</td><td class="cell-number"><b>${avg(rows)}%</b></td></tr>`;
  }).join("");
  const totalTracker = `<tr class="total-row"><td>TOTAL</td><td class="cell-number">${trackerData.length}</td><td class="cell-number">${countByStatus(trackerData,"Belum Mulai")}</td><td class="cell-number">${countByStatus(trackerData,"On Progress")}</td><td class="cell-number">${countByStatus(trackerData,"Selesai")}</td><td class="cell-number">${countByStatus(trackerData,"Terkendala")+countByStatus(trackerData,"At Risk")}</td><td class="cell-number"><b>${avg(trackerData)}%</b></td></tr>`;
  const compareRows = [
    ["KPI Operasi", diropsTotal, compareMetrics.total],
    ["KPI Kolegial", diropsKolegial, compareMetrics.kolegial],
    ["KPI Direktorat", diropsDirektorat, compareMetrics.direktorat],
    ["Direksi Kolegial", kolegialTotal, compareMetrics.direksi]
  ].map(([label,value,compare])=>`<div class="compare-item" data-tip="${esc(`${label}\n${dashYear}: ${value}%\n${state.compareYear}: ${compare}%\nSelisih: ${Math.round((value-compare)*10)/10}%`)}"><span>${label}</span><div class="compare-bars"><i style="height:${Math.max(8,compare)}%"></i><b style="height:${Math.max(8,value)}%"></b></div><strong>${value}%</strong><em>${compare}%</em></div>`).join("");
  const divProgress = divisions.map(divisi=>{
    const rows = trackerData.filter(x=>(x.divisi || "Lintas Divisi")===divisi);
    const p = avg(rows);
    const idle = countByStatus(rows,"Belum Mulai"), progress = countByStatus(rows,"On Progress"), done = countByStatus(rows,"Selesai"), risk = countByStatus(rows,"Terkendala") + countByStatus(rows,"At Risk");
    return `<div class="division-progress-row" data-tip="${esc(`${divisi}\nTotal: ${rows.length} agenda\nProgress rata-rata: ${p}%\nBelum Mulai: ${idle}\nOn Progress: ${progress}\nSelesai: ${done}\nKendala/Risk: ${risk}`)}"><span>${esc(divisi)}</span><div class="bar ${p<50?"red":p<90?"yellow":""}"><span style="width:${p}%"></span></div><b>${p}%</b></div>`;
  }).join("");
  const divisionAverageBars = `<div class="real-vertical-bars">${divisions.map(divisi=>{
    const p = avg(trackerData.filter(x=>(x.divisi || "Lintas Divisi")===divisi));
    const tone = p < 50 ? "red" : p < 90 ? "yellow" : "teal";
    return `<div class="real-vbar" data-tip="${esc(`${divisi}\nRata-rata progress: ${p}%\nKategori: ${p < 50 ? "Perhatian" : p < 90 ? "Pantau" : "Baik"}`)}"><strong>${p}%</strong><span class="${tone}" style="height:${Math.max(10,p)}%"></span><small>${esc(divisi)}</small></div>`;
  }).join("")}</div>`;
  const monevTotal = monevData.length || 1;
  let monevCursor = 0;
  const monevColors = { "Belum Mulai":"#94a3b8", "On Progress":"#f6c316", "On Track":"#008f86", "At Risk":"#f97352", "Terkendala":"#ef4444", "Selesai":"#22c55e" };
  const monevSummary = ["Belum Mulai","On Progress","On Track","At Risk","Terkendala","Selesai"].map(status=>[status, countByStatus(monevData, status)]);
  const monevGradient = monevSummary.map(([status,count])=>{
    const start = monevCursor;
    const end = monevCursor + (count / monevTotal) * 100;
    monevCursor = end;
    return `${monevColors[status]} ${start}% ${end}%`;
  }).join(", ");
  const monevStatus = ["Belum Mulai","On Progress","On Track","At Risk","Terkendala","Selesai"].map(status=>{
    const count = countByStatus(monevData, status);
    return `<div data-tip="${esc(`${status}: ${count} item (${Math.round(count/monevTotal*100)}%)`)}"><span><i style="background:${monevColors[status]}"></i>${status}</span><b>${count}</b><em>${Math.round(count/monevTotal*100)}%</em></div>`;
  }).join("");
  const monevDonut = `<div class="real-donut-wrap compact"><div class="real-donut" data-tip="${esc(`Total monev & isu strategis: ${monevData.length}`)}" style="background:conic-gradient(${monevGradient || "#e5e7eb 0 100%"});"><span><b>${monevData.length}</b>Item</span></div><div class="real-donut-legend">${monevStatus}</div></div>`;
  const trendMonths = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep"];
  const monthIndex = value => {
    const text = String(value || "").toLowerCase();
    const months = [["jan","januari"],["feb","februari"],["mar","maret"],["apr","april"],["mei"],["jun","juni"],["jul","juli"],["agu","agustus"],["sep","september"]];
    const found = months.findIndex(names => names.some(name => text.includes(name)));
    return found >= 0 ? found : 0;
  };
  const monevTrend = trendMonths.map((m,i)=>{
    const rows = monevData.filter(item => monthIndex(item.target) === i || (!item.target && i === 0));
    const idleCount = countByStatus(rows, "Belum Mulai");
    const progressCount = countByStatus(rows, "On Progress");
    const doneCount = countByStatus(rows, "On Track") + countByStatus(rows, "Selesai");
    const riskCount = countByStatus(rows, "At Risk") + countByStatus(rows, "Terkendala");
    const fallback = rows.length ? 0 : (i < 5 ? Math.max(0, Math.round((monevData.length || 4) * (i + 1) / 16)) : 0);
    const idle = Math.max(4, idleCount * 14 + fallback * 3);
    const progress = Math.max(4, progressCount * 18 + fallback * 5);
    const done = Math.max(4, doneCount * 18 + (i > 3 ? fallback * 4 : 0));
    const risk = Math.max(4, riskCount * 18);
    return `<div class="status-trend-bar" data-tip="${esc(`${m}\nTotal item: ${rows.length}\nBelum Mulai: ${idleCount}\nOn Progress: ${progressCount}\nOn Track/Selesai: ${doneCount}\nRisk/Kendala: ${riskCount}`)}"><span style="height:${idle}px"></span><i style="height:${progress}px"></i><b style="height:${done}px"></b><em style="height:${risk}px"></em><small>${m}</small></div>`;
  }).join("");
  const actionRows = actionsData.slice(0,5).map((x,i)=>`<tr><td class="cell-number">${i+1}</td><td><strong>${esc(x.agenda)}</strong></td><td>${esc(x.pic)}</td><td>${esc(x.target)}</td><td>${pill(x.status)}</td></tr>`).join("");
  const milestoneRows = [...monevData, ...actionsData].slice(0,5).map(x=>`<tr><td>${esc(x.target||"-")}</td><td><strong>${esc(x.agenda)}</strong></td><td>${pill(x.status)}</td></tr>`).join("");
  const kpiCard = (label, value, compareValue, icon, color="blue") => `<article class="dashboard-metric-card ${color}"><div class="metric-head"><span>${label}</span><i data-lucide="${icon}"></i></div><div class="metric-value"><strong>${value}%</strong><em>${yearCompare(value, compareValue)}</em></div><div class="metric-meta"><span>${state.compareYear}: ${compareValue}%</span><span>${dashYear}</span></div><div class="metric-track"><b style="width:${Math.max(0,Math.min(100,value))}%"></b></div></article>`;
  const statusTiles = statusSummary.map(([label,count,tone])=>`<span class="${tone}"><b>${count}</b><small>${label}</small></span>`).join("");
  const yearOptions = ["2027","2026","2025","2024"];
  if(!yearOptions.includes(state.compareYear) || state.compareYear === dashYear) state.compareYear = yearOptions.find(year=>year!==dashYear) || String((+dashYear || 2026) - 1);
  const dropdown = (key, value, options, label="", icon="") => `<div class="ui-dropdown" data-dropdown="${key}"><button type="button" class="ui-dropdown-btn" data-dropdown-toggle="${key}">${icon ? `<i data-lucide="${icon}"></i>` : ""}${label ? `<span>${label}</span>` : ""}<strong>${esc(value)}</strong><i data-lucide="chevron-down" class="chev"></i></button><div class="ui-dropdown-menu">${options.map(option=>`<button type="button" class="${option===value?"active":""}" data-dashboard-filter="${key}" data-value="${esc(option)}">${esc(option)}</button>`).join("")}</div></div>`;
  const headerYear = dropdown("year", dashYear, yearOptions, "", "calendar-days");
  const compareFilter = dropdown("compare", state.compareYear, yearOptions.filter(year=>year!==dashYear), "Bandingkan:");
  const divisionFilter = dropdown("division", state.dashboardDivision, ["Semua Divisi", ...divisionOptions()]);
  const statusFilter = dropdown("status", state.dashboardDataStatus, ["Data Aktif", "Semua Data"], "", "circle-check");
  const statusLegend = `<span class="chart-bottom-legend status-legend"><i class="dot gray"></i>B.Mulai <i class="dot yellow"></i>Progress <i class="dot green"></i>Selesai <i class="dot red"></i>Kendala <i class="dot orange"></i>Risk</span>`;
  const monevLegend = `<span class="chart-bottom-legend status-legend"><i class="dot gray"></i>B.Mulai <i class="dot yellow"></i>Progress <i class="dot green"></i>Track/Selesai <i class="dot red"></i>Risk/Kendala</span>`;
  $("#dashboard").innerHTML = `
    <div class="dashboard-hero">
      <div><h1>Dashboard Monitoring & Evaluasi Kinerja</h1><strong>Direktorat Operasional PT SIER</strong></div>
      <div class="dashboard-filters">
        ${headerYear}
        ${compareFilter}
        ${divisionFilter}
        ${statusFilter}
      </div>
    </div>
    <div class="dashboard-kpi-strip reference">
      ${kpiCard("KPI Direktorat Operasi",diropsTotal,compareMetrics.total,"target","blue")}
      ${kpiCard("KPI Kolegial (40%)",diropsKolegial,compareMetrics.kolegial,"users-round","amber")}
      ${kpiCard("KPI Direktorat (60%)",diropsDirektorat,compareMetrics.direktorat,"building-2","cyan")}
      ${kpiCard("KPI Direksi Kolegial",kolegialTotal,compareMetrics.direksi,"award","indigo")}
      <article class="dashboard-metric-card monitoring-total amber"><div class="metric-head"><span>Total Item Monitoring</span><i data-lucide="clipboard-list"></i></div><div class="metric-value"><strong>${monitoringItems.length}</strong><em>${completedCount} selesai, ${attentionCount} perhatian</em></div><div class="status-mini">${statusTiles}</div></article>
    </div>
    <div class="dashboard-row reference-trend">
      <div class="panel trend-panel"><div class="panel-head"><div><h2>Tren Capaian KPI</h2></div></div><div class="chart trend-chart">${trendChartSvg(dashYear)}<span class="chart-bottom-legend"><i class="dot"></i>Dirops <i class="dot blue"></i>Kolegial <i class="dot gray"></i>Batas KPI</span></div></div>
      <div class="panel chart-panel"><div class="panel-head"><div><h2>Perbandingan KPI</h2></div></div><div class="compare-chart">${compareRows}<span class="chart-bottom-legend"><i class="dot gray"></i>${state.compareYear} <i class="dot yellow"></i>${dashYear}</span></div></div>
    </div>
    <div class="dashboard-row reference-status">
      <div class="panel chart-panel"><div class="panel-head"><div><h2>Status Monitoring</h2></div></div><div class="chart-like">${overallStatus}${statusLegend}</div></div>
      <div class="panel chart-panel"><div class="panel-head"><div><h2>Progress Divisi</h2></div></div><div class="division-stack">${divProgress}${statusLegend}</div></div>
      <div class="panel chart-panel"><div class="panel-head"><div><h2>Rata-rata Divisi</h2></div></div><div class="chart-like">${divisionAverageBars}<span class="chart-bottom-legend"><i class="dot"></i>Baik <i class="dot yellow"></i>Pantau <i class="dot red"></i>Perhatian</span></div></div>
    </div>
    <div class="dashboard-row reference-monitor">
      <div class="panel chart-panel"><div class="panel-head"><h2>Distribusi Monev & Isu Strategis</h2></div><div class="monev-distribution">${monevDonut}${monevLegend}</div></div>
      <div class="panel chart-panel"><div class="panel-head"><h2>Tren Status Monev</h2></div><div class="status-trend">${monevTrend}${monevLegend}</div></div>
      <div class="panel dashboard-table-panel"><div class="panel-head"><h2>Jadwal & Milestone Penting</h2></div>${table(["Tanggal","Kegiatan","Status"],milestoneRows,"monitor-table",5)}</div>
    </div>
    <div class="dashboard-row tables reference-bottom">
      <div class="panel dashboard-table-panel"><div class="panel-head"><h2>Detail Tracker Follow-up Divisi</h2></div>${table(["Divisi","Total","Belum Mulai","On Progress","Selesai","Terkendala","Rata-rata Progress (%)"],trackerRows+totalTracker,"monitor-table dashboard-summary-table",6)}</div>
      <div class="panel dashboard-table-panel"><div class="panel-head"><h2>Top Action Items BOD-BOC</h2></div>${table(["No","Action Item","PIC","Target","Status"],actionRows,"monitor-table",5)}</div>
    </div>
  `;
}

function sidePanels(){
  const itemRows = state.actions.slice(0,4).map(x=>`<tr><td><strong>${esc(x.agenda)}</strong></td><td>${esc(x.target)}</td><td><b style="color:${x.progress<50?"var(--danger)":"var(--teal)"}">${x.progress}%</b></td><td>${esc(x.pic)}</td></tr>`).join("");
  return `<div class="panel"><div class="panel-head"><h3>Status Monev Danareksa</h3><span>•••</span></div>${donut(state.monev.length,[["Selesai",1],["On Progress",2,"yellow"],["At Risk",1,"red"],["Belum Mulai",0,"gray"]])}</div>
  <div class="panel"><div class="panel-head"><h3>Action Items BOD-BOC</h3><span>•••</span></div>${table(["Agenda","Target","Prog","PIC"],itemRows)}</div>
  <div class="panel"><div class="panel-head"><div><h2>Isu yang Perlu Perhatian Segera</h2><span class="subtle">Ringkasan risiko strategis dan prioritas tindakan</span></div><span>•••</span></div>${donut(4,[["Kritis","1 isu","red"],["Perlu Tindak Lanjut","2 isu","yellow"],["Pantau","1 isu","gray"]],"var(--red)")}<div style="display:grid;gap:10px;margin-top:18px">${state.priority.map(x=>`<div class="progress-card"><strong>${esc(x.isu)}</strong><br>${pill(x.status)} <span class="subtle">1 isu</span></div>`).join("")}</div></div>
  <div class="panel"><div class="panel-head"><h3>Aktivitas Terkini</h3><span>•••</span></div><div class="legend">${state.audit.slice(0,5).map(x=>`<div class="legend-row"><span><i class="dot"></i>${esc(x)}</span></div>`).join("")}</div></div>`;
}

function renderKpi(col,title){
  const allData=currentRows(col);
  const data=allData.filter(canAccessKpiRow);
  const total=Math.round(data.reduce((a,b)=>a+score(b),0));
  const createButton = canCreate(col) ? `<button class="primary-btn" data-create="${col}"><i data-lucide="plus"></i> Tambah KPI</button>` : "";
  if (col === "kolegial") {
    const rows = data.map((x,i)=>{
      const capaian = achievement(x) * 100;
      const nilai = capaian / 100 * (+x.bobot || 0);
      const t1 = x.targetTw1 ?? Math.round((+x.target || 0) * .25 * 100) / 100;
      const t2 = x.targetTw2 ?? Math.round((+x.target || 0) * .5 * 100) / 100;
      const t3 = x.targetTw3 ?? Math.round((+x.target || 0) * .75 * 100) / 100;
      const t4 = x.targetTw4 ?? x.target;
      const inputs = kpiInputCells(col, x);
      return `<tr><td>${i+1}</td><td>${esc(x.kategori)}</td><td><strong>${esc(x.indikator)}</strong></td><td>${esc(x.penanggungJawab||"Lintas Divisi")}</td><td>${esc(x.satuan)}</td><td>${x.bobot}%</td><td>${esc(x.polaritas||"Max")}</td><td>${esc(x.target)}</td><td>${esc(t1)}</td><td>${esc(t2)}</td><td>${esc(t3)}</td><td>${esc(t4)}</td><td>${inputs[0]}</td><td>${inputs[1]}</td><td>${inputs[2]}</td><td><b style="color:var(--teal)">${inputs[3]}</b></td><td>${inputs[4]}</td><td><b style="color:${capaian<60?"var(--red)":"var(--teal)"}">${Math.round(capaian*10)/10}%</b></td><td><b>${Math.round(nilai*10)/10}%</b></td><td>${actions(col,x.id)}</td></tr>`;
    }).join("");
    const totalRows = `<div class="kpi-total-list"><div class="grand"><span>TOTAL NILAI KPI DIREKSI KOLEGIAL</span><strong>${total}%</strong></div></div>`;
    $(`#${col}`).innerHTML = `${hero(title)}<div class="panel"><div class="panel-head"><div><h2>Realisasi Triwulan</h2></div>${createButton}</div>${table(["No","Kategori","Key Performance Indicator","Penanggung Jawab","Satuan","Bobot","Polaritas",`Target Tahunan ${state.selectedYear}`,"T.TW1","T.TW2","T.TW3","T.TW4","Realisasi TW1","Realisasi TW2","Realisasi TW3","Realisasi TW4","Catatan / Update","Capaian %","Nilai Tertimbang","Aksi"],rows,"kpi-table kpi-kolegial")}${totalRows}</div>`;
    return;
  }
  const sectioned = col==="dirops"
    ? [["I. KPI KOLEGIAL", data.filter(x=>x.kelompok !== "Direktorat")], ["II. KPI DIREKTORAT", data.filter(x=>x.kelompok === "Direktorat")]]
    : [["KPI DIREKSI KOLEGIAL", data]];
  const sectionScore = items => Math.round(items.reduce((sum, item) => sum + score(item), 0) * 10) / 10;
  const rows=sectioned.map(([label,items]) => `
    <tr class="section-row"><td colspan="19">${label}</td></tr>
    ${items.map((x,i)=>{
      const capaian = achievement(x) * 100;
      const nilai = capaian / 100 * (+x.bobot || 0);
      const t1 = x.targetTw1 ?? Math.round((+x.target || 0) * .25 * 100) / 100;
      const t2 = x.targetTw2 ?? Math.round((+x.target || 0) * .5 * 100) / 100;
      const t3 = x.targetTw3 ?? Math.round((+x.target || 0) * .75 * 100) / 100;
      const t4 = x.targetTw4 ?? x.target;
      const inputs = kpiInputCells(col, x);
      return `<tr><td>${i+1}</td><td><strong>${esc(x.indikator)}</strong></td><td>${esc(x.penanggungJawab||"Lintas Divisi")}</td><td>${esc(x.satuan)}</td><td>${x.bobot}%</td><td>${esc(x.polaritas||"Max")}</td><td>${esc(x.target)}</td><td>${esc(t1)}</td><td>${esc(t2)}</td><td>${esc(t3)}</td><td>${esc(t4)}</td><td>${inputs[0]}</td><td>${inputs[1]}</td><td>${inputs[2]}</td><td><b style="color:var(--teal)">${inputs[3]}</b></td><td>${inputs[4]}</td><td><b style="color:${capaian<60?"var(--red)":"var(--teal)"}">${Math.round(capaian*10)/10}%</b></td><td><b>${Math.round(nilai*10)/10}%</b></td><td>${actions(col,x.id)}</td></tr>`;
    }).join("")}
  `).join("");
  const source = col==="dirops" ? "Kontrak Manajemen No.810/SKP-EKS/V/2026. Isi/update Realisasi TW1-TW4 setiap triwulan." : "Kontrak Manajemen No.807/SKP-EKS/V/2026. Isi/update Realisasi TW1-TW4 setiap triwulan.";
  const totalRows = col==="dirops"
    ? `<div class="kpi-total-list">
        <div><span>TOTAL NILAI KPI KOLEGIAL</span><strong>${sectionScore(data.filter(x=>x.kelompok !== "Direktorat"))}%</strong></div>
        <div><span>TOTAL NILAI KPI DIREKTORAT</span><strong>${sectionScore(data.filter(x=>x.kelompok === "Direktorat"))}%</strong></div>
        <div class="grand"><span>TOTAL NILAI KPI DIREKTUR OPERASI</span><strong>${total}%</strong></div>
      </div>`
    : `<div class="kpi-total-list"><div class="grand"><span>TOTAL NILAI KPI DIREKSI KOLEGIAL</span><strong>${total}%</strong></div></div>`;
  $(`#${col}`).innerHTML = `${hero(title)}<div class="panel"><div class="panel-head"><div><h2>Realisasi Triwulan</h2></div>${createButton}</div>${table(["No","Key Performance Indicator","Penanggung Jawab","Satuan","Bobot","Polaritas",`Target Tahunan ${state.selectedYear}`,"Target TW1","Target TW2","Target TW3","Target TW4","Realisasi TW1","Realisasi TW2","Realisasi TW3","Realisasi TW4","Catatan / Update","Capaian % (realisasi terakhir vs target tahunan)","Nilai Tertimbang (Capaian % x Bobot)","Aksi"],rows,"kpi-table kpi-dirops")}${totalRows}</div>`;
}

function renderTracker(){
  const data = currentRows("tracker").filter(canAccessTrackerRow);
  const query = trackerSearch.trim().toLowerCase();
  const filtered = data.filter(item=>{
    const matchesDivision = trackerDivisionFilter === "Semua Divisi" || item.divisi === trackerDivisionFilter;
    const matchesStatus = trackerStatusFilter === "Semua Status" || item.status === trackerStatusFilter;
    const matchesSearch = !query || [item.divisi,item.pic,item.pekerjaan,item.output,item.deadline,item.status,item.catatan].some(value=>String(value||"").toLowerCase().includes(query));
    return matchesDivision && matchesStatus && matchesSearch;
  });
  const completed = data.filter(item=>item.status === "Selesai").length;
  const attention = data.filter(item=>["At Risk","Terkendala"].includes(item.status)).length;
  const divisions = divisionOptions(data);
  const rows=filtered.map(x=>`<tr><td><strong>${esc(x.divisi)}</strong></td><td>${esc(x.pic)}</td><td><strong>${esc(x.pekerjaan)}</strong></td><td>${inputCell(x.output||"", "tracker", x.id, "output", "textarea")}</td><td>${esc(x.deadline)}</td><td>${inputHtml(pill(x.status))}</td><td><div class="tracker-progress"><div class="bar ${x.progress<50?"red":x.progress<90?"yellow":""}"><span style="width:${x.progress}%"></span></div><b>${x.progress}%</b></div></td><td>${inputCell(x.catatan)}</td><td>${actions("tracker",x.id)}</td></tr>`).join("") || `<tr><td colspan="9" class="empty-state">Tidak ada agenda yang cocok dengan filter.</td></tr>`;
  const toolbar = `<div class="tracker-toolbar"><label class="entries-control"><span>Entries</span>${filterDropdown("trackerEntries", trackerEntries, [5,8,10,25])}</label><label class="tracker-search"><span>Search</span><div><i data-lucide="search"></i><input type="search" value="${esc(trackerSearch)}" placeholder="Cari agenda, PIC, divisi..." data-tracker-search></div></label><label class="tracker-filter"><span>Divisi</span>${filterDropdown("trackerDivision", trackerDivisionFilter, ["Semua Divisi", ...divisions])}</label><label class="tracker-filter"><span>Status</span>${filterDropdown("trackerStatus", trackerStatusFilter, ["Semua Status", ...statuses])}</label></div>`;
  const createButton = canCreate("tracker") ? `<button class="primary-btn" data-create="tracker"><i data-lucide="plus"></i> Tambah Agenda</button>` : "";
  $("#tracker").innerHTML = `${hero("Tracker Divisi")}<div class="cards-row tracker-summary">${stat("Total Agenda",`${data.length}`,"","","list-checks")}${stat("Rata-rata Progress",`${avg(data)}%`,"","warn","chart-no-axes-combined")}${stat("Selesai",`${completed}`,"","","circle-check")}${stat("Perlu Perhatian",`${attention}`,"","danger","triangle-alert")}</div><div class="panel tracker-panel"><div class="panel-head"><div><h2>Daftar Tracker Divisi</h2></div>${createButton}</div>${toolbar}${table(["Divisi","PIC","Pekerjaan / Follow-Up","Output yang Diharapkan","Deadline","Status","Progress","Catatan","Aksi"],rows,"tracker-table",trackerEntries)}</div>`;
}

function renderSimpleList(col,title,desc){
  const isM=col==="monev";
  const data=currentRows(col);
  const viewState = listViewState[col];
  const query = viewState.search.trim().toLowerCase();
  const filtered = data.filter(item=>{
    const matchesSearch = !query || [item.agenda,item.prioritas,item.target,item.pic,item.status,item.catatan].some(value=>String(value||"").toLowerCase().includes(query));
    const matchesStatus = viewState.status === "Semua Status" || item.status === viewState.status;
    return matchesSearch && matchesStatus;
  });
  const done = data.filter(item=>item.status==="Selesai").length;
  const attention = data.filter(item=>["At Risk","Terkendala"].includes(item.status)).length;
  const inProgress = data.filter(item=>["On Progress","On Track"].includes(item.status)).length;
  const rows=filtered.map(x=>isM
    ? `<tr><td><strong>${esc(x.agenda)}</strong></td><td>${esc(x.prioritas||"-")}</td><td>${esc(x.pic)}</td><td>${esc(x.target)}</td><td>${inputHtml(pill(x.status))}</td><td>${inputCell(x.catatan)}</td><td>${actions(col,x.id)}</td></tr>`
    : `<tr><td><strong>${esc(x.agenda)}</strong></td><td>${esc(x.target)}</td><td>${esc(x.pic)}</td><td>${inputHtml(pill(x.status))}</td><td><div class="tracker-progress"><div class="bar ${x.progress<50?"red":x.progress<90?"yellow":""}"><span style="width:${x.progress}%"></span></div><b>${x.progress}%</b></div></td><td>${inputCell(x.catatan)}</td><td>${actions(col,x.id)}</td></tr>`).join("") || `<tr><td colspan="${isM?7:7}" class="empty-state">Tidak ada data yang cocok dengan filter.</td></tr>`;
  const toolbar = `<div class="tracker-toolbar list-toolbar"><label><span>Entries</span>${filterDropdown(`listEntries:${col}`, viewState.entries, [5,8,10,25])}</label><label class="tracker-search"><span>Search</span><div><i data-lucide="search"></i><input type="search" value="${esc(viewState.search)}" placeholder="Cari agenda, PIC, status..." data-list-search="${col}"></div></label><label class="tracker-filter"><span>Status</span>${filterDropdown(`listStatus:${col}`, viewState.status, ["Semua Status", ...statuses])}</label></div>`;
  const summary = isM
    ? stat("Total Agenda",`${data.length}`,"","","clipboard-check")+stat("Berjalan",`${inProgress}`,"","warn","loader-circle")+stat("Selesai",`${done}`,"","","circle-check")+stat("Perhatian",`${attention}`,"","danger","triangle-alert")
    : stat("Total Action",`${data.length}`,"","","list-checks")+stat("Rata-rata",`${avg(data)}%`,"","warn","chart-no-axes-combined")+stat("Selesai",`${done}`,"","","circle-check")+stat("Perhatian",`${attention}`,"","danger","triangle-alert");
  const headers = isM ? ["Agenda Strategis","Prioritas","PIC","Target Waktu","Status","Catatan / Rencana Solusi","Aksi"] : ["Agenda","Target","PIC","Status","Progress","Catatan / Rencana Solusi","Aksi"];
  $(`#${col}`).innerHTML = `${hero(title)}<div class="cards-row tracker-summary">${summary}</div><div class="panel tracker-panel list-panel"><div class="panel-head"><div><h2>${isM?"Daftar Monitoring":"Daftar Action Items"}</h2></div><button class="primary-btn" data-create="${col}"><i data-lucide="plus"></i> ${isM?"Tambah Agenda":"Tambah Action"}</button></div>${toolbar}${table(headers,rows,`tracker-table ${isM?"monev-table":"action-table"}`,viewState.entries)}</div>`;
}

function renderPriority(){
  const data = currentRows("priority");
  const viewState = listViewState.priority;
  const query = viewState.search.trim().toLowerCase();
  const filtered = data.filter(item=>{
    const matchesSearch = !query || [item.kode,item.isu,item.dampak,item.pic,item.status,item.mitigasi,item.evidence].some(value=>String(value||"").toLowerCase().includes(query));
    const matchesStatus = viewState.status === "Semua Status" || item.status === viewState.status;
    return matchesSearch && matchesStatus;
  });
  const rows=filtered.map(x=>`<tr><td><strong>${esc(x.kode)}</strong></td><td><strong>${esc(x.isu)}</strong></td><td><b style="color:var(--red)">${esc(x.dampak)}</b></td><td>${esc(x.pic)}</td><td>${pill(x.status)}</td><td>${esc(x.mitigasi)}</td><td><a>${esc(x.evidence)}</a></td><td>${actions("priority",x.id)}</td></tr>`).join("") || `<tr><td colspan="8" class="empty-state">Tidak ada isu yang cocok dengan filter.</td></tr>`;
  const critical = data.filter(x=>["At Risk","Terkendala","Tertunda"].includes(x.status)).length;
  const done = data.filter(x=>["Selesai","Tereksekusi"].includes(x.status)).length;
  const priorityStatuses = [...new Set([...statuses, "Tertunda", "Tereksekusi"])];
  const toolbar = `<div class="tracker-toolbar list-toolbar"><label><span>Entries</span>${filterDropdown("listEntries:priority", viewState.entries, [5,8,10,25])}</label><label class="tracker-search"><span>Search</span><div><i data-lucide="search"></i><input type="search" value="${esc(viewState.search)}" placeholder="Cari isu, PIC, status..." data-list-search="priority"></div></label><label class="tracker-filter"><span>Status</span>${filterDropdown("listStatus:priority", viewState.status, ["Semua Status", ...priorityStatuses])}</label></div>`;
  $("#priority").innerHTML = `${hero("Isu Prioritas")}
  <div class="cards-row tracker-summary">${stat("Total Isu",data.length,"","","triangle-alert")}${stat("Prioritas Tinggi",critical,"","danger","octagon-alert")}${stat("Selesai",done,"","","circle-check")}${stat("Mitigasi",data.length-done,"","warn","shield-alert")}</div>
  <div class="panel tracker-panel list-panel"><div class="panel-head"><div><h2>Daftar Isu</h2></div><button class="primary-btn" data-create="priority"><i data-lucide="plus"></i> Tambah Isu</button></div>${toolbar}${table(["ID Rujukan","Deskripsi Hambatan Kritis","Dampak & Risiko","Pemilik Isu","Status Tindakan","Mitigasi & Langkah Selanjutnya","Evidence","Aksi"],rows,"priority-table",viewState.entries)}</div>`;
}

function renderReports(){
  const tabs = ["Dirops","Kolegial","Tracker Divisi","Monev Danareksa","Action Items"];
  const dataMap = {
    "Dirops": { title:"Laporan KPI Dirops", rows:currentRows("dirops").length, source:"KPI Direktur Operasi", desc:"Capaian, nilai tertimbang, realisasi triwulan, dan catatan update." },
    "Kolegial": { title:"Laporan KPI Kolegial", rows:currentRows("kolegial").length, source:"KPI Direksi Kolegial", desc:"Capaian kolegial, kategori, bobot, target, dan realisasi triwulan." },
    "Tracker Divisi": { title:"Laporan Tracker Divisi", rows:currentRows("tracker").length, source:"Tracker Divisi", desc:"Follow-up divisi, PIC, output, deadline, status, progress, dan catatan." },
    "Monev Danareksa": { title:"Laporan Monev Danareksa", rows:currentRows("monev").length, source:"Monev Danareksa", desc:"Isu dan arahan strategis, prioritas, PIC, status, dan rencana solusi." },
    "Action Items": { title:"Laporan Action Items BOD-BOC", rows:currentRows("actions").length, source:"Action Items", desc:"Tindak lanjut rapat, target waktu, PIC, progress, dan status penyelesaian." }
  };
  const active = dataMap[reportTab] || dataMap.Dirops;
  const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const years = ["2027","2026","2025","2024"];
  $("#reports").innerHTML = `${hero("Laporan")}
  <div class="panel tracker-panel list-panel report-panel">
    <div class="panel-head report-head">
      <div><h2>Daftar Laporan</h2></div>
      <div class="report-filters">
        <label><span>Bulan</span><select data-report-month>${months.map(m=>`<option ${m===reportMonth?"selected":""}>${m}</option>`).join("")}</select></label>
        <label><span>Tahun</span><select data-report-year>${years.map(y=>`<option ${y===reportYear?"selected":""}>${y}</option>`).join("")}</select></label>
      </div>
    </div>
    <div class="report-tabs">${tabs.map(tab=>`<button class="tab ${tab===reportTab?"active":""}" data-report-tab="${tab}">${tab}</button>`).join("")}</div>
    <div class="report-detail-card">
      <div><h3>${active.title}</h3><span class="report-meta">${reportMonth} ${reportYear} • ${active.rows} data</span></div>
      <button class="primary-btn" data-export="${active.title}"><i data-lucide="download"></i> Download</button>
    </div>
  </div>`;
}
function renderMaster(){
  const grouped = new Map();
  allKpiMasters().forEach(item=>{
    if(!grouped.has(item.settingId)) grouped.set(item.settingId,{...item, items:[]});
    grouped.get(item.settingId).items.push(item);
  });
  const settings = [...grouped.values()];
  const query = settingSearch.trim().toLowerCase();
  const filteredSettings = settings.filter(x=>!query || [x.settingName,x.jenisKpi,x.tahun,x.createdBy,x.dasarDokumen,x.isOpen?"Open":"Closed"].some(value=>String(value||"").toLowerCase().includes(query)));
  const masterRows = filteredSettings.map(x=>`<tr><td><strong>${esc(x.settingName)}</strong></td><td>${esc(x.jenisKpi)}</td><td>${esc(x.tahun||state.selectedYear)}</td><td>${esc(x.createdBy||"Direksi")}</td><td>${esc(x.createdAt||"-")}</td><td>${esc(x.publishedAt||"Belum terbit")}</td><td>${pill(x.isOpen ? "Open" : "Closed")}</td><td class="cell-number">${x.items.length}</td><td><div class="actions"><button class="icon" title="Detail" data-setting-view="${x.settingId}"><i data-lucide="eye"></i></button>${canSetupMaster()?`<button class="icon" title="Edit" data-setting-edit="${x.settingId}"><i data-lucide="pencil"></i></button><button class="icon delete" title="Hapus" data-setting-delete="${x.settingId}"><i data-lucide="trash-2"></i></button>`:""}</div></td></tr>`).join("") || `<tr><td colspan="9" class="empty-state">Setting KPI tidak ditemukan.</td></tr>`;
  const yearFilter = filterDropdown("masterYear", state.selectedYear, ["2024","2025","2026","2027","2028"]);
  const searchControl = `<label class="setting-search"><i data-lucide="search"></i><input type="search" value="${esc(settingSearch)}" placeholder="Cari setting KPI..." data-setting-search></label>`;
  const setupActions = canSetupMaster() ? `<button class="primary-btn" data-setting-create><i data-lucide="plus"></i> Buat Setting KPI</button>` : "";
  const masterActions = `<div class="panel-actions setting-list-actions">${searchControl}${yearFilter}${setupActions}</div>`;
  $("#master").innerHTML = `${hero("Setting KPI")}
  <div class="panel tracker-panel list-panel"><div class="panel-head"><div><h2>Daftar Setting KPI</h2></div>${masterActions}</div>${table(["Nama Setting","Jenis KPI","Tahun","Dibuat Oleh","Tanggal Dibuat","Tanggal Terbit","Posisi","Jumlah KPI","Aksi"],masterRows,"monitor-table setting-kpi-table",8)}</div>`;
}
function renderUsers(){
  const rows=state.users.map(x=>`<tr><td><strong>${esc(x.nama)}</strong></td><td>${esc(x.role)}</td><td>${esc(x.akses)}</td><td>${esc(x.aktivitas)}</td><td>${pill(x.status)}</td><td>${actions("users",x.id)}</td></tr>`).join("");
  const userAction = isAdmin() ? `<button class="primary-btn" data-create="users"><i data-lucide="plus"></i> Tambah User</button>` : "";
  const roleMatrix = [
    ["Super Admin","Semua menu, CRUD penuh, user role, dan hapus data"],
    ["Direksi","Membuat dan menerbitkan Setting KPI, mengatur periode pengisian, serta validasi sumber data"],
    ["Kepala Divisi","Isi realisasi dan catatan KPI yang ditugaskan; update Tracker Divisi"],
    ["Admin/Sekretaris","Input realisasi KPI, update Monev/Action/Isu, laporan"]
  ].map(x=>`<tr><td><strong>${x[0]}</strong></td><td>${x[1]}</td></tr>`).join("");
  $("#users").innerHTML = `${hero("User & Role")}
  <div class="cards-row tracker-summary">${stat("Pengguna",state.users.length,"","","users")}${stat("Aktif",state.users.filter(x=>x.status==="Aktif").length,"","","user-check")}${stat("Role","4","","","shield-user")}${stat("Mode",state.currentRole,"","","key-round")}</div>
  <div class="panel tracker-panel list-panel"><div class="panel-head"><div><h2>Daftar Pengguna</h2></div>${userAction}</div>${table(["Nama Pengguna","Peran (Role)","Divisi Akses","Aktivitas Terakhir","Status Akun","Tindakan"],rows,"user-table",8)}</div>
  <div class="panel tracker-panel list-panel"><div class="panel-head"><div><h2>Akses Role</h2></div></div>${table(["Role","Kewenangan Utama"],roleMatrix,"monitor-table role-matrix-table",8)}</div>`;
}

function applyRoleAccess(){
  const allowed = allowedViews();
  if(!allowed.includes(activeView)) activeView = "dashboard";
  document.querySelectorAll("[data-view]").forEach(item=>{
    const permitted = allowed.includes(item.dataset.view);
    item.hidden = !permitted;
    item.classList.toggle("active", permitted && item.dataset.view === activeView);
  });
  document.querySelectorAll(".view").forEach(view=>view.classList.toggle("active", view.id === activeView));
  document.querySelectorAll(".nav-group").forEach(group=>{
    const hasVisible = [...group.querySelectorAll("[data-view]")].some(item=>!item.hidden);
    group.hidden = !hasVisible;
  });
}

function render(){
  tableSeq = 0;
    renderDashboard(); renderKpi("dirops",`KPI Direktur Operasi PT SIER ${state.selectedYear}`); renderKpi("kolegial",`KPI Direksi Secara Kolegial PT SIER Tahun ${state.selectedYear}`); renderTracker(); renderSimpleList("monev","Monev Danareksa",""); renderSimpleList("actions","Action Items BOD-BOC",""); renderPriority(); renderReports(); renderMaster(); renderUsers();
  applyRoleAccess();
  drawDashboardCharts();
  enableDashboardChartInteractions();
  initPagination();
  refreshIcons();
  renderProfile();
  renderNotifications();
}

function prepCanvas(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = Math.round(Math.max(320, rect.width));
  const cssHeight = Math.round(Math.max(180, rect.height));
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return { ctx, w: cssWidth, h: cssHeight };
}

function drawDashboardCharts() {
  drawDivisionChart();
  drawStatusChart();
}

function enableDashboardChartInteractions() {
  const getTooltip = () => {
    let tooltip = document.getElementById("dashboard-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.id = "dashboard-tooltip";
      tooltip.className = "chart-tooltip dashboard-tooltip";
      document.body.appendChild(tooltip);
    }
    return tooltip;
  };
  const showTooltip = (text, clientX, clientY) => {
    const tooltip = getTooltip();
    tooltip.textContent = text;
    tooltip.classList.add("show");
    const offset = 14;
    const rect = tooltip.getBoundingClientRect();
    const left = Math.min(window.innerWidth - rect.width - 12, Math.max(12, clientX + offset));
    const top = Math.min(window.innerHeight - rect.height - 12, Math.max(12, clientY - rect.height - offset));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };
  const hideTooltip = () => getTooltip().classList.remove("show", "pinned");
  document.querySelectorAll("#dashboard canvas").forEach(canvas => {
    if (canvas.dataset.interactive === "true") return;
    canvas.dataset.interactive = "true";
    canvas.addEventListener("pointermove", event => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / (window.devicePixelRatio || 1) / rect.width;
      const scaleY = canvas.height / (window.devicePixelRatio || 1) / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      const hit = (canvas.__hits || []).find(item => item.contains(x, y));
      canvas.title = hit ? hit.label : "";
      canvas.style.cursor = hit ? "crosshair" : "default";
      if (hit) showTooltip(hit.label, event.clientX, event.clientY);
      else hideTooltip();
    });
    canvas.addEventListener("click", event => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / (window.devicePixelRatio || 1) / rect.width;
      const scaleY = canvas.height / (window.devicePixelRatio || 1) / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      const hit = (canvas.__hits || []).find(item => item.contains(x, y));
      if (hit) {
        showTooltip(hit.label, event.clientX, event.clientY);
        getTooltip().classList.add("pinned");
      }
    });
    canvas.addEventListener("pointerleave", () => {
      if (!getTooltip().classList.contains("pinned")) hideTooltip();
    });
  });
  document.querySelectorAll("#dashboard [data-tip]").forEach(item => {
    if (item.dataset.tipReady === "true") return;
    item.dataset.tipReady = "true";
    item.addEventListener("pointermove", event => {
      if (getTooltip().classList.contains("pinned")) return;
      showTooltip(item.dataset.tip, event.clientX, event.clientY);
    });
    item.addEventListener("pointerleave", () => {
      if (!getTooltip().classList.contains("pinned")) hideTooltip();
    });
    item.addEventListener("click", event => {
      event.stopPropagation();
      showTooltip(item.dataset.tip, event.clientX, event.clientY);
      getTooltip().classList.add("pinned");
    });
  });
  if (!window.__dashboardTooltipCloseReady) {
    window.__dashboardTooltipCloseReady = true;
    document.addEventListener("click", event => {
      if (!event.target.closest("#dashboard [data-tip], #dashboard canvas")) hideTooltip();
    });
  }
}

function avgKpi(collection, key) {
  const rows = currentRows(collection);
  return Math.round(rows.reduce((sum, item) => sum + achievement(item, key) * 100, 0) / (rows.length || 1));
}

function drawTrendChart() {
  const chart = prepCanvas("kpiTrendChart");
  if (!chart) return;
  const canvas = document.getElementById("kpiTrendChart");
  canvas.__hits = [];
  const { ctx, w, h } = chart;
  const pad = { top: 24, right: 28, bottom: 46, left: 52 };
  const labels = ["TW1", "TW2", "TW3", "TW4"];
  const dirops = labels.map((_, i) => avgKpi("dirops", `tw${i + 1}`));
  const kolegial = labels.map((_, i) => avgKpi("kolegial", `tw${i + 1}`));
  const targetLimit = [25, 50, 75, 100];
  ctx.clearRect(0, 0, w, h);
  const chartH = h - pad.top - pad.bottom;
  const chartW = w - pad.left - pad.right;
  const yFor = value => pad.top + ((100 - value) / 100) * chartH;
  const xFor = index => pad.left + (chartW / (labels.length - 1)) * index;
  ctx.save();
  ctx.translate(.5, .5);
  ctx.strokeStyle = "#e5eaf1";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#7a8696"; ctx.font = "700 11px Manrope"; ctx.textAlign = "right";
  [100,75,50,25,0].forEach(v => {
    const y = yFor(v);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
    ctx.fillText(`${v}%`, pad.left - 9, y + 4);
  });
  labels.forEach((_, i) => {
    const x = xFor(i);
    ctx.strokeStyle = "#edf1f5";
    ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, h - pad.bottom); ctx.stroke();
  });
  ctx.strokeStyle = "#d4dde8";
  ctx.beginPath(); ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, h - pad.bottom); ctx.lineTo(w - pad.right, h - pad.bottom); ctx.stroke();
  ctx.restore();
  const plot = (data, color, fillColor, label, dashed=false) => {
    const points = data.map((v, i) => ({
      x: xFor(i),
      y: yFor(v),
      v
    }));
    if(fillColor){
      const area = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
      area.addColorStop(0, fillColor);
      area.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, h - pad.bottom);
      ctx.lineTo(points[0].x, h - pad.bottom);
      ctx.closePath();
      ctx.fillStyle = area;
      ctx.fill();
    }
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.strokeStyle = color; ctx.lineWidth = dashed ? 1.8 : 2.8; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.setLineDash(dashed ? [6, 5] : []); ctx.stroke(); ctx.setLineDash([]);
    points.forEach(p => {
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(p.x, p.y, dashed ? 5.5 : 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, dashed ? 2.4 : 3.8, 0, Math.PI * 2); ctx.fill();
      if(dashed){
        ctx.fillStyle = "#64748b"; ctx.font = "800 10px Manrope"; ctx.textAlign = "center";
        ctx.fillText(`${p.v}%`, p.x, p.y - 12);
      }
    });
    points.forEach((p, i) => canvas.__hits.push({
      label: `${label} ${labels[i]}: ${p.v}%`,
      contains: (x, y) => Math.hypot(x - p.x, y - p.y) <= 12
    }));
  };
  plot(targetLimit, "#94a3b8", null, "Batas KPI", true);
  plot(dirops, "#008f86", "rgba(0,143,134,.10)", "Dirops");
  plot(kolegial, "#f97352", "rgba(249,115,82,.055)", "Kolegial");
  ctx.fillStyle = "#7a8696"; ctx.font = "800 11px Manrope"; ctx.textAlign = "center";
  labels.forEach((label, i) => {
    ctx.fillText(label, xFor(i), h - 20);
  });
  ctx.fillStyle = "#98a2b3"; ctx.font = "700 10px Manrope"; ctx.fillText("Triwulan", w / 2, h - 6);
}

function drawDivisionChart() {
  const chart = prepCanvas("divisionBarChart");
  if (!chart) return;
  const canvas = document.getElementById("divisionBarChart");
  canvas.__hits = [];
  const { ctx, w, h } = chart;
  const trackerData = currentRows("tracker");
  const labels = divisionOptions(trackerData);
  const values = labels.map(label => avg(trackerData.filter(item => item.divisi === label)));
  const pad = { top: 32, right: 20, bottom: 45, left: 46 };
  const gap = 18;
  const bw = (w - pad.left - pad.right - gap * (labels.length - 1)) / labels.length;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#edf0f2";
  ctx.fillStyle = "#8b95a3"; ctx.font = "11px Manrope"; ctx.textAlign = "right";
  [100,75,50,25,0].forEach(v => {
    const y = pad.top + ((100 - v) / 100) * (h - pad.top - pad.bottom);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
    ctx.fillText(`${v}%`, pad.left - 9, y + 4);
  });
  ctx.strokeStyle = "#d9e1e6";
  ctx.beginPath(); ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, h - pad.bottom); ctx.lineTo(w - pad.right, h - pad.bottom); ctx.stroke();
  values.forEach((v, i) => {
    const x = pad.left + i * (bw + gap);
    const bh = (v / 100) * (h - pad.top - pad.bottom);
    const y = h - pad.bottom - bh;
    const color = v < 50 ? "#f05252" : v < 90 ? "#f3a31b" : "#09a9b7";
    const grad = ctx.createLinearGradient(0, y, 0, h - pad.bottom);
    grad.addColorStop(0, color);
    grad.addColorStop(1, `${color}99`);
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, bw, bh, 8);
    ctx.fillStyle = "rgba(255,255,255,.28)";
    roundRect(ctx, x + 6, y + 6, Math.max(4, bw - 12), Math.max(4, bh * .18), 5);
    ctx.fillStyle = "#171923"; ctx.font = "700 12px Manrope"; ctx.textAlign = "center"; ctx.fillText(`${v}%`, x + bw / 2, y - 8);
    ctx.fillStyle = "#8b95a3"; ctx.font = "12px Manrope"; ctx.fillText(labels[i], x + bw / 2, h - 20);
    canvas.__hits.push({
      label: `${labels[i]}: ${v}%`,
      contains: (pointX, pointY) => pointX >= x && pointX <= x + bw && pointY >= y && pointY <= h - pad.bottom
    });
  });
  ctx.fillStyle = "#a1aab6"; ctx.font = "11px Manrope"; ctx.textAlign = "center"; ctx.fillText("Divisi", w / 2, h - 5);
}

function drawStatusChart() {
  const chart = prepCanvas("statusDonutChart");
  if (!chart) return;
  const canvas = document.getElementById("statusDonutChart");
  canvas.__hits = [];
  const { ctx, w, h } = chart;
  const rows = statuses.map(status => [...currentRows("tracker"), ...currentRows("actions"), ...currentRows("monev")].filter(item => item.status === status).length);
  const total = rows.reduce((a, b) => a + b, 0) || 1;
  const colors = ["#94a3b8", "#f3a31b", "#22c55e", "#fb7185", "#f05252", "#09a9b7"];
  const cx = w * .32, cy = h / 2, r = Math.min(w, h) * .28;
  let start = -Math.PI / 2;
  ctx.clearRect(0, 0, w, h);
  rows.forEach((value, i) => {
    const end = start + (value / total) * Math.PI * 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, start, end); ctx.lineWidth = 24; ctx.lineCap = "round"; ctx.strokeStyle = colors[i]; ctx.stroke();
    const segmentStart = start;
    canvas.__hits.push({
      label: `${statuses[i]}: ${value}`,
      contains: (pointX, pointY) => {
        const distance = Math.hypot(pointX - cx, pointY - cy);
        let angle = Math.atan2(pointY - cy, pointX - cx);
        if (angle < -Math.PI / 2) angle += Math.PI * 2;
        return distance >= r - 16 && distance <= r + 16 && angle >= segmentStart && angle <= end;
      }
    });
    start = end;
  });
  ctx.beginPath(); ctx.arc(cx, cy, r - 20, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
  ctx.fillStyle = "#171923"; ctx.font = "800 22px Manrope"; ctx.textAlign = "center"; ctx.fillText(total, cx, cy + 7);
  ctx.textAlign = "left"; ctx.font = "12px Manrope";
  statuses.forEach((label, i) => {
    const y = cy - 42 + i * 26;
    ctx.fillStyle = colors[i]; ctx.beginPath(); ctx.arc(w * .58, y - 4, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3e4654"; ctx.fillText(label, w * .62, y);
    ctx.fillStyle = "#171923"; ctx.font = "800 12px Manrope"; ctx.fillText(rows[i], w - 34, y);
    ctx.font = "12px Manrope";
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.fill();
}

function schema(col){
  const kpiFields = [["kode","No/Kode"],["indikator","Key Performance Indicator","textarea"],["satuan","Satuan"],["target","Target Tahunan 2026","number"],["tw1","Realisasi TW1","number"],["tw2","Realisasi TW2","number"],["tw3","Realisasi TW3","number"],["tw4","Realisasi TW4","number"],["bobot","Bobot","number"],["catatan","Catatan / Update","textarea"]];
  const kpiOwners = [...new Set([...divisionOptions(), "Lintas Divisi", "ALL Kadiv"])];
  const targetFields = [["target","Target Tahunan","number"],["targetTw1","Target TW1","number"],["targetTw2","Target TW2","number"],["targetTw3","Target TW3","number"],["targetTw4","Target TW4","number"]];
  const yearField = ["tahun","Tahun Berlaku","select",["2024","2025","2026","2027","2028"]];
  const diropsFields = [["kelompok","Jenis KPI","select",["Kolegial","Direktorat"]],["indikator","Key Performance Indicator","textarea"],["penanggungJawab","Penanggung Jawab","select",kpiOwners],["satuan","Satuan"],["bobot","Bobot","number"],["polaritas","Polaritas","select",["Max","Min"]],...targetFields,["tw1","Realisasi TW1","number"],["tw2","Realisasi TW2","number"],["tw3","Realisasi TW3","number"],["tw4","Realisasi TW4","number"],["catatan","Catatan / Update","textarea"]];
  const kolegialFields = [["kategori","Kategori"],["indikator","Key Performance Indicator","textarea"],["penanggungJawab","Penanggung Jawab","select",kpiOwners],["satuan","Satuan"],["bobot","Bobot","number"],["polaritas","Polaritas","select",["Max","Min"]],...targetFields,["tw1","Realisasi TW1","number"],["tw2","Realisasi TW2","number"],["tw3","Realisasi TW3","number"],["tw4","Realisasi TW4","number"],["catatan","Catatan / Update","textarea"]];
  const sourceFields = [["dasarDokumen","Dasar Dokumen"],["nomorDokumen","Nomor Dokumen"],["tanggalDokumen","Tanggal Dokumen"],["statusValidasi","Status Validasi","select",["Draft","Final","Perlu Konfirmasi"]],["catatanValidasi","Catatan Validasi","textarea"]];
  const masterKpiFields = [["kode","Kode"],yearField,["kategori","Kategori"],["indikator","Key Performance Indicator","textarea"],["penanggungJawab","Penanggung Jawab","select",kpiOwners],["satuan","Satuan"],...targetFields,["bobot","Bobot","number"],["polaritas","Polaritas","select",["Max","Min"]],...sourceFields];
  const masterDiropsFields = [["kode","Kode"],yearField,["kelompok","Jenis KPI","select",["Kolegial","Direktorat"]],["kategori","Kategori"],["indikator","Key Performance Indicator","textarea"],["penanggungJawab","Penanggung Jawab","select",kpiOwners],["satuan","Satuan"],...targetFields,["bobot","Bobot","number"],["polaritas","Polaritas","select",["Max","Min"]],...sourceFields];
  const unifiedMasterFields = [["jenisKpi","Jenis KPI","select",["Dirops","Kolegial"]],yearField,["kode","Kode"],["kelompok","Kelompok Dirops","select",["Kolegial","Direktorat"]],["kategori","Kategori Kolegial"],["indikator","Key Performance Indicator","textarea"],["penanggungJawab","Penanggung Jawab","select",kpiOwners],["satuan","Satuan"],...targetFields,["bobot","Bobot","number"],["polaritas","Polaritas","select",["Max","Min"]],...sourceFields];
  const map={
    dirops:diropsFields,
    kolegial:kolegialFields,
    kpiMasterDirops:masterDiropsFields,
    kpiMasterKolegial:masterKpiFields,
    kpiMaster:unifiedMasterFields,
    tracker:[["divisi","Divisi","select",divisionOptions()],["pic","PIC"],["pekerjaan","Pekerjaan","textarea"],["output","Output yang Diharapkan","textarea"],["deadline","Deadline"],["status","Status","select",statuses],["progress","Progress","number"],["catatan","Catatan","textarea"]],
    monev:[["agenda","Agenda","textarea"],["prioritas","Prioritas"],["pic","PIC"],["target","Target"],["status","Status","select",statuses],["progress","Progress","number"],["catatan","Catatan","textarea"]],
    actions:[["agenda","Agenda","textarea"],["target","Target"],["pic","PIC"],["status","Status","select",statuses],["progress","Progress","number"],["catatan","Catatan","textarea"]],
    priority:[["kode","Kode"],["isu","Isu","textarea"],["dampak","Dampak"],["pic","PIC"],["status","Status"],["mitigasi","Mitigasi","textarea"],["evidence","Evidence"]],
    users:[["nama","Nama"],["role","Role","select",["Super Admin","Direksi","Kepala Divisi","Admin/Sekretaris"]],["akses","Akses"],["aktivitas","Aktivitas"],["status","Status","select",["Aktif","Terkunci"]]],
    master:[["tipe","Tipe"],["nama","Nama"],["keterangan","Keterangan","textarea"]]
  };
  return map[col]||map.tracker;
}
function applyMasterToForm(col, master){
  if(!master) return;
  ["kategori","indikator","penanggungJawab","satuan","bobot","polaritas","target","kelompok"].forEach(name=>{
    const field = document.querySelector(`#form-fields [name="${name}"]`);
    if(field && master[name] !== undefined) field.value = master[name];
  });
}
function setupMasterPicker(col){
  const picker = document.querySelector('#form-fields select[name="masterId"]');
  if(!picker) return;
  const masters = activeMasterRows(mastersByYear(col));
  const category = document.querySelector('#form-fields [name="kategori"]');
  const updateOptions = () => {
    const selectedCategory = category?.value || "";
    const current = picker.value.split("|")[0];
    const filtered = selectedCategory ? masters.filter(item=>item.kategori===selectedCategory) : masters;
    picker.innerHTML = `<option value="">Pilih KPI Master</option>${filtered.map(item=>`<option value="${esc(item.id)}">${esc(item.kode)} - ${esc(item.indikator)}</option>`).join("")}`;
    if(filtered.some(item=>item.id===current)) picker.value = filtered.find(item=>item.id===current).id;
  };
  category?.addEventListener("change",()=>updateOptions());
  picker.addEventListener("change",()=>applyMasterToForm(col, masters.find(item=>item.id===picker.value.split("|")[0])));
  updateOptions();
}
function setupTrackerDivisionPicker(){
  const division = document.querySelector('#form-fields [name="divisi"]');
  const pic = document.querySelector('#form-fields [name="pic"]');
  if(!division || !pic) return;
  const sync = () => {
    if(division.value === "Lintas Divisi") pic.value = "ALL Kadiv";
  };
  division.addEventListener("change", sync);
  sync();
}
function settingRows(settingId){
  return ["dirops","kolegial"].flatMap(type=>(state.kpiMaster[type]||[]).filter(item=>item.settingId===settingId).map(item=>{
    const active = (state[type]||[]).find(row=>row.masterId===item.id || (row.kode===item.kode && String(row.tahun)===String(item.tahun)));
    return {...item, tw1:active?.tw1??"", tw2:active?.tw2??"", tw3:active?.tw3??"", tw4:active?.tw4??"", catatan:active?.catatan??"", settingType:type};
  }));
}
function settingKpiRow(row={}, type="dirops", readonly=false){
  const field = (name, value="", inputType="text") => readonly
    ? `<span>${esc(value || "-")}</span>`
    : `<input type="${inputType}" data-setting-field="${name}" value="${esc(value)}" ${inputType==="number"?'min="0" step="any"':""}>`;
  const groupValue = type==="dirops" ? (row.kelompok||"Kolegial") : (row.kategori||"");
  const group = readonly ? `<span>${esc(groupValue||"-")}</span>` : type==="dirops"
    ? `<select data-setting-field="kelompok"><option ${groupValue==="Kolegial"?"selected":""}>Kolegial</option><option ${groupValue==="Direktorat"?"selected":""}>Direktorat</option></select>`
    : `<input data-setting-field="kategori" value="${esc(groupValue)}">`;
  const owners = [...new Set([...divisionOptions(),"Lintas Divisi","ALL Kadiv"])];
  const owner = readonly ? `<span>${esc(row.penanggungJawab||"-")}</span>` : `<select data-setting-field="penanggungJawab">${owners.map(value=>`<option ${value===(row.penanggungJawab||"Lintas Divisi")?"selected":""}>${esc(value)}</option>`).join("")}</select>`;
  const polarity = readonly ? `<span>${esc(row.polaritas||"Max")}</span>` : `<select data-setting-field="polaritas"><option ${row.polaritas!=="Min"?"selected":""}>Max</option><option ${row.polaritas==="Min"?"selected":""}>Min</option></select>`;
  const capaian = Math.round(achievement(row)*1000)/10;
  const nilai = Math.round(score(row)*10)/10;
  const runtime = `<td class="setting-runtime">${esc(row.tw1||"-")}</td><td class="setting-runtime">${esc(row.tw2||"-")}</td><td class="setting-runtime">${esc(row.tw3||"-")}</td><td class="setting-runtime">${esc(row.tw4||"-")}</td><td class="setting-runtime text-left">${esc(row.catatan||"-")}</td><td class="setting-runtime">${capaian}%</td><td class="setting-runtime">${nilai}%</td>`;
  return `<tr class="setting-kpi-row" data-row-id="${esc(row.id||"")}"><td>${field("kode",row.kode)}</td><td>${group}</td><td>${field("indikator",row.indikator)}</td><td>${owner}</td><td>${field("satuan",row.satuan)}</td><td>${field("bobot",row.bobot,"number")}</td><td>${polarity}</td><td>${field("target",row.target,"number")}</td><td>${field("targetTw1",row.targetTw1,"number")}</td><td>${field("targetTw2",row.targetTw2,"number")}</td><td>${field("targetTw3",row.targetTw3,"number")}</td><td>${field("targetTw4",row.targetTw4,"number")}</td>${runtime}${readonly?"":`<td><button type="button" class="icon delete" data-setting-row-delete><i data-lucide="trash-2"></i></button></td>`}</tr>`;
}
function openKpiSetting(settingId="", readonly=false){
  if(!readonly && !canSetupMaster()) return;
  const rows = settingId ? settingRows(settingId) : [];
  const first = rows[0] || {};
  const type = first.settingType || "dirops";
  modal = { col:"kpiSetting", settingId, readonly, settingType:type };
  $("#crud-form").classList.add("setting-modal");
  $("#modal-context").textContent = "SETTING KPI";
  $("#modal-title").textContent = readonly ? "Detail Setting KPI" : settingId ? "Edit Setting KPI" : "Buat Setting KPI";
  const metadata = `<div class="setting-meta-grid">
    <label class="field"><span>Nama Setting</span><input name="settingName" value="${esc(first.settingName||"")}" ${readonly?"disabled":""} required></label>
    <label class="field"><span>Jenis KPI</span><select name="jenisKpi" data-setting-type ${readonly?"disabled":""}><option value="dirops" ${type==="dirops"?"selected":""}>Dirops</option><option value="kolegial" ${type==="kolegial"?"selected":""}>Kolegial</option></select></label>
    <label class="field"><span>Tahun</span><select name="tahun" ${readonly?"disabled":""}>${["2024","2025","2026","2027","2028"].map(y=>`<option ${y===(first.tahun||state.selectedYear)?"selected":""}>${y}</option>`).join("")}</select></label>
    <label class="field"><span>Dibuat Oleh</span><input name="createdBy" value="${esc(first.createdBy||state.profile.name||"Direksi")}" ${readonly?"disabled":""}></label>
    <label class="field"><span>Tanggal Dibuat</span><input type="date" name="createdAt" value="${esc(/^\d{4}-\d{2}-\d{2}$/.test(first.createdAt||"")?first.createdAt:"")}" ${readonly?"disabled":""}></label>
    <label class="field"><span>Tanggal Terbit</span><input type="date" name="publishedAt" value="${esc(/^\d{4}-\d{2}-\d{2}$/.test(first.publishedAt||"")?first.publishedAt:"")}" ${readonly?"disabled":""}></label>
    <label class="field"><span>Posisi Pengisian</span><select name="isOpen" ${readonly?"disabled":""}><option value="true" ${first.isOpen!==false?"selected":""}>Open</option><option value="false" ${first.isOpen===false?"selected":""}>Closed</option></select></label>
    <label class="field"><span>Dasar Dokumen</span><input name="dasarDokumen" value="${esc(first.dasarDokumen||"")}" ${readonly?"disabled":""}></label>
  </div>`;
  const bodyRows = (rows.length?rows:[{}]).map(row=>settingKpiRow(row,type,readonly)).join("");
  $("#form-fields").innerHTML = `${metadata}<div class="setting-table-wrap"><div class="setting-table-head"><strong>Struktur dan Preview KPI</strong>${readonly?"":`<button type="button" class="soft-btn" data-setting-row-add><i data-lucide="plus"></i> Tambah Baris</button>`}</div><div class="table-panel"><table class="setting-editor-table"><thead><tr><th>Kode</th><th>Kelompok/Kategori</th><th>Key Performance Indicator</th><th>Penanggung Jawab</th><th>Satuan</th><th>Bobot</th><th>Polaritas</th><th>Target Tahunan</th><th>Target TW1</th><th>Target TW2</th><th>Target TW3</th><th>Target TW4</th><th>Realisasi TW1</th><th>Realisasi TW2</th><th>Realisasi TW3</th><th>Realisasi TW4</th><th>Catatan / Update</th><th>Capaian %</th><th>Nilai Tertimbang</th>${readonly?"":"<th>Aksi</th>"}</tr></thead><tbody>${bodyRows}</tbody></table></div></div>`;
  $(".modal-actions").innerHTML = readonly ? `<button type="button" class="soft-btn" data-close-modal>Tutup</button>${canSetupMaster()?`<button type="button" class="primary-btn" data-setting-edit="${settingId}">Edit</button>`:""}` : `<button type="button" class="soft-btn" data-close-modal>Batal</button><button type="submit" class="primary-btn">Simpan Setting</button>`;
  $("#crud-modal").classList.add("open");
  refreshIcons();
}
function openModal(col,rowId){
  if(!rowId && !canCreate(col)){ alert("Role saat ini tidak memiliki akses menambah data ini."); return; }
  modal={col,rowId};
  $("#crud-form").classList.remove("setting-modal");
  const row=rowId?getCollection(col).find(x=>x.id===rowId):{};
  $("#modal-context").textContent=`${col.toUpperCase()} - ${state.currentRole}`;
  $("#modal-title").textContent=rowId?"Edit Data":"Tambah Data";
  let fields = schema(col);
  if(!rowId && (col==="dirops" || col==="kolegial")){
    const units = [...new Set(activeMasterRows(mastersByYear(col)).map(item=>item.satuan).filter(Boolean))];
    fields = fields.map(field=>field[0]==="satuan" ? ["satuan","Satuan","select",units] : field);
  }
  if(col==="kolegial" && !rowId){
    const categories = [...new Set(activeMasterRows(mastersByYear("kolegial")).map(item=>item.kategori).filter(Boolean))];
    fields = fields.map(field=>field[0]==="kategori" ? ["kategori","Kategori","select",categories] : field);
  }
  const masterType = col==="dirops" ? "dirops" : col==="kolegial" ? "kolegial" : "";
  const masterSelect = !rowId && masterType
    ? [["masterId","Pilih KPI Master","select",["",...activeMasterRows(mastersByYear(masterType)).map(x=>`${x.id}|${x.kode} - ${x.indikator}`)]]]
    : [];
  $("#form-fields").innerHTML=[...masterSelect,...fields].map(([n,l,t="text",opts=[]])=>{
    const v=rowId ? (row?.[n]??"") : (n==="tahun" ? state.selectedYear : "");
    const locked = rowId && !canEditField(col,n,row);
    const mark = "";
    const base = `class="field ${t==="textarea" ? "wide" : ""} ${locked ? "is-locked" : "is-editable"}"`;
    const disabled = locked ? "disabled" : "";
    if(t==="textarea")return `<label ${base}><span>${l}</span><textarea name="${n}" ${disabled}>${esc(v)}</textarea></label>`;
    if(t==="select")return `<label ${base}><span>${l}${mark}</span><select name="${n}" ${disabled}>${opts.map(o=>`<option value="${esc(o)}" ${o===v?"selected":""}>${esc(String(o).split("|")[1]||o)}</option>`)}</select></label>`;
    return `<label ${base}><span>${l}${mark}</span><input type="${t}" name="${n}" value="${esc(v)}" ${disabled}></label>`;
  }).join("");
  setupMasterPicker(masterType);
  if(col==="tracker") setupTrackerDivisionPicker();
  $(".modal-actions").innerHTML = `<button type="button" class="soft-btn" data-close-modal>Batal</button><button type="submit" class="primary-btn">Simpan</button>`;
  $("#crud-modal").classList.add("open");
}
function closeModal(){ $("#crud-modal").classList.remove("open"); $("#crud-form").classList.remove("setting-modal"); $("#crud-form").reset(); }
function submit(e){
  e.preventDefault();
  if(modal.col==="kpiSetting"){
    const values = Object.fromEntries(new FormData(e.target).entries());
    const type = values.jenisKpi || modal.settingType || "dirops";
    const settingId = modal.settingId || id();
    const rowElements = [...document.querySelectorAll("#form-fields .setting-kpi-row")];
    const numeric = new Set(["bobot","target","targetTw1","targetTw2","targetTw3","targetTw4"]);
    const rows = rowElements.map(element=>{
      const row = { id:element.dataset.rowId || id() };
      element.querySelectorAll("[data-setting-field]").forEach(field=>{
        const name = field.dataset.settingField;
        row[name] = numeric.has(name) ? Number(field.value) : field.value.trim();
      });
      return row;
    });
    if(!values.settingName?.trim() || !rows.length || rows.some(row=>!row.kode || !row.indikator || !row.satuan)){
      showToast("Lengkapi nama setting, kode, indikator, dan satuan KPI", "error");
      return;
    }
    if(rows.some(row=>[row.bobot,row.target,row.targetTw1,row.targetTw2,row.targetTw3,row.targetTw4].some(value=>!Number.isFinite(value) || value<0))){
      showToast("Bobot dan seluruh target harus berupa angka 0 atau lebih", "error");
      return;
    }
    const totalWeight = rows.reduce((sum,row)=>sum+row.bobot,0);
    if(Math.abs(totalWeight-100) > .01){
      showToast(`Total bobot KPI harus 100% (saat ini ${totalWeight}%)`, "error");
      return;
    }
    const metadata = {
      settingId, settingName:values.settingName.trim(), tahun:values.tahun || state.selectedYear,
      createdBy:values.createdBy || state.profile.name || "Direksi", createdAt:values.createdAt || new Date().toISOString().slice(0,10),
      publishedAt:values.publishedAt || "", isOpen:values.isOpen !== "false", dasarDokumen:values.dasarDokumen || "",
      statusValidasi:values.publishedAt ? "Final" : "Draft"
    };
    const oldRows = settingRows(settingId);
    const oldIds = new Set(oldRows.map(row=>row.id));
    state.kpiMaster.dirops = state.kpiMaster.dirops.filter(row=>!oldIds.has(row.id));
    state.kpiMaster.kolegial = state.kpiMaster.kolegial.filter(row=>!oldIds.has(row.id));
    const prepared = rows.map(row=>({...row,...metadata}));
    state.kpiMaster[type] = [...prepared, ...state.kpiMaster[type]];
    prepared.forEach(row=>syncMasterKpi(type,row));
    state.selectedYear = metadata.tahun;
    closeModal();
    save(`${modal.settingId?"Update":"Tambah"} Setting KPI ${metadata.settingName}`);
    return;
  }
  if(modal.textField){
    const vals = Object.fromEntries(new FormData(e.target).entries());
    setCollection(modal.col, getCollection(modal.col).map(x=>x.id===modal.rowId ? {...x, [modal.textField]: vals[modal.textField] || ""} : x));
    closeModal();
    save(`Update ${modal.textField} ${modal.col} oleh ${state.currentRole}`);
    return;
  }
  const vals=Object.fromEntries(new FormData(e.target).entries());
  if(modal.col==="kpiMaster"){
    const targetCol = vals.jenisKpi === "Kolegial" ? "kpiMasterKolegial" : "kpiMasterDirops";
    const targetType = vals.jenisKpi === "Kolegial" ? "kolegial" : "dirops";
    const payload = { ...vals, tahun: vals.tahun || state.selectedYear };
    delete payload.jenisKpi;
    if(targetCol==="kpiMasterKolegial") delete payload.kelompok;
    if(!payload.statusValidasi) payload.statusValidasi = "Draft";
    schema(targetCol).forEach(([n,,t])=>{if(t==="number" && n in payload) payload[n]=+payload[n]||0});
    const master = {id:id(),...payload};
    setCollection(targetCol, [master, ...getCollection(targetCol)]);
    syncMasterKpi(targetType, master);
    state.selectedYear = master.tahun;
    closeModal();
    save(`Tambah data ${targetCol} oleh ${state.currentRole}`);
    return;
  }
  const numericFields = schema(modal.col).filter(([, , type])=>type==="number").map(([name])=>name);
  const requiredNumericFields = modal.rowId ? [] : (["dirops","kolegial","kpiMaster","kpiMasterDirops","kpiMasterKolegial"].includes(modal.col) ? ["target","targetTw1","targetTw2","targetTw3","targetTw4","bobot"] : numericFields);
  if(requiredNumericFields.some(name=>String(vals[name] ?? "").trim()==="")){
    showToast("Lengkapi semua field angka terlebih dahulu", "error");
    return;
  }
  if(numericFields.some(name=>String(vals[name] ?? "").trim()!=="" && (!Number.isFinite(Number(vals[name])) || Number(vals[name]) < 0))){
    showToast("Nilai angka tidak boleh negatif", "error");
    return;
  }
  if(!modal.rowId && (modal.col==="dirops" || modal.col==="kolegial") && !vals.masterId){
    showToast("Pilih KPI dari Master KPI terlebih dahulu", "error");
    return;
  }
  if(!modal.rowId && (modal.col==="dirops" || modal.col==="kolegial") && vals.masterId){
    const type = modal.col;
    const master = activeMasterRows(mastersByYear(type)).find(x=>x.id===vals.masterId.split("|")[0]);
    if(master) Object.assign(vals, { kode:master.kode, kategori:vals.kategori || master.kategori || "", indikator:master.indikator, penanggungJawab:vals.penanggungJawab || master.penanggungJawab, satuan:vals.satuan || master.satuan, target:vals.target || master.target, bobot:vals.bobot || master.bobot, polaritas:vals.polaritas || master.polaritas, kelompok:vals.kelompok || master.kelompok });
    delete vals.masterId;
  }
  if(modal.col==="tracker" && vals.divisi==="Lintas Divisi") vals.pic = "ALL Kadiv";
  schema(modal.col).forEach(([n,,t])=>{if(t==="number" && n in vals) vals[n]=+vals[n]||0});
  if(modal.rowId){
    setCollection(modal.col, getCollection(modal.col).map(x=>x.id===modal.rowId?{...x,...vals}:x));
    if(["kpiMasterDirops","kpiMasterKolegial"].includes(modal.col)){
      const type = modal.col === "kpiMasterDirops" ? "dirops" : "kolegial";
      syncMasterKpi(type, getCollection(modal.col).find(item=>item.id===modal.rowId));
    }
  } else {
    const yearlyCols = ["dirops","kolegial","tracker","monev","actions","priority"];
    const payload = yearlyCols.includes(modal.col) ? {id:id(), tahun:state.selectedYear, ...vals} : {id:id(), ...vals};
    setCollection(modal.col, [payload, ...getCollection(modal.col)]);
  }
  closeModal();
  save(`${modal.rowId?"Update":"Tambah"} data ${modal.col} oleh ${state.currentRole}`);
}
function $(s){ return document.querySelector(s); }

function openView(col,rowId){
  const row = getCollection(col)?.find(x=>x.id===rowId);
  if(!row) return;
  modal = { col, rowId };
  $("#modal-context").textContent = col.toUpperCase();
  $("#modal-title").textContent = "Detail Data";
  $("#form-fields").innerHTML = schema(col).map(([name,label]) => {
    const value = row[name] ?? "-";
    return `<div class="detail-field ${String(value).length > 38 ? "wide" : ""}"><span>${label}</span><strong>${esc(value)}</strong></div>`;
  }).join("");
  $(".modal-actions").innerHTML = `<button type="button" class="soft-btn" data-close-modal>Tutup</button><button type="button" class="primary-btn" data-edit-from-view>Edit</button>`;
  $("#crud-modal").classList.add("open");
}

function openTextPopup(col,rowId,field){
  const row = getCollection(col)?.find(x=>x.id===rowId);
  if(!row) return;
  const editable = canEditField(col, field, row);
  modal = { col, rowId, textField:field };
  $("#modal-context").textContent = `${col.toUpperCase()} - ${field}`;
  $("#modal-title").textContent = field === "catatan" ? "Catatan / Update" : "Detail Teks";
  $("#form-fields").innerHTML = editable
    ? `<label class="field wide is-editable"><span>${field === "catatan" ? "Catatan / Update" : "Isi Detail"}</span><textarea name="${field}" class="text-popup-area">${esc(row[field] || "")}</textarea></label>`
    : `<div class="detail-field wide text-popup-read"><span>${field === "catatan" ? "Catatan / Update" : "Isi Detail"}</span><strong>${esc(row[field] || "-")}</strong></div>`;
  $(".modal-actions").innerHTML = editable
    ? `<button type="button" class="soft-btn" data-close-modal>Batal</button><button type="submit" class="primary-btn">Simpan</button>`
    : `<button type="button" class="soft-btn" data-close-modal>Tutup</button>`;
  $("#crud-modal").classList.add("open");
}

document.body.addEventListener("change",e=>{
  const input=e.target.closest("[data-kpi-field]");
  if(!input || input.disabled) return;
  const { kpiCol, kpiId, kpiField } = input.dataset;
  const row = getCollection(kpiCol)?.find(x=>x.id===kpiId);
  if(!row || !canEditField(kpiCol,kpiField,row)) return;
  if(input.type === "number" && (input.value.trim()==="" || Number(input.value) < 0)){
    input.value = row[kpiField] ?? "";
    showToast("Isi angka 0 atau lebih", "error");
    return;
  }
  const value = input.type === "number" ? Number(input.value) : input.value;
  setCollection(kpiCol,getCollection(kpiCol).map(x=>x.id===kpiId ? {...x,[kpiField]:value} : x));
  save(`Update ${kpiField.toUpperCase()} ${kpiCol} oleh ${state.currentRole}`);
});

function refreshTrackerView(focusSearch=false, caret=0){
  renderTracker();
  initPagination();
  refreshIcons();
  if(focusSearch){
    const field = document.querySelector("[data-tracker-search]");
    if(field){ field.focus(); field.setSelectionRange(caret, caret); }
  }
}
document.body.addEventListener("input",e=>{
  const field = e.target.closest("[data-tracker-search]");
  if(!field) return;
  trackerSearch = field.value;
  refreshTrackerView(true, field.selectionStart || trackerSearch.length);
});
document.body.addEventListener("change",e=>{
  if(e.target.matches("[data-report-month]")){ reportMonth = e.target.value; renderReports(); refreshIcons(); return; }
  if(e.target.matches("[data-report-year]")){ reportYear = e.target.value; renderReports(); refreshIcons(); return; }
  if(e.target.matches("[data-tracker-entries]")) trackerEntries = +e.target.value || 8;
  if(e.target.matches("[data-tracker-division]")) trackerDivisionFilter = e.target.value;
  if(e.target.matches("[data-tracker-status]")) trackerStatusFilter = e.target.value;
  if(e.target.matches("[data-tracker-entries], [data-tracker-division], [data-tracker-status]")) refreshTrackerView();
});
function refreshListView(col, focusSearch=false, caret=0){
  const configs = {
    monev: ["Monev Danareksa",""],
    actions: ["Action Items BOD-BOC",""]
  };
  if(col==="priority") renderPriority();
  else renderSimpleList(col, configs[col][0], configs[col][1]);
  initPagination();
  refreshIcons();
  if(focusSearch){
    const field = document.querySelector(`[data-list-search="${col}"]`);
    if(field){ field.focus(); field.setSelectionRange(caret, caret); }
  }
}
document.body.addEventListener("input",e=>{
  const field = e.target.closest("[data-list-search]");
  if(!field) return;
  const col = field.dataset.listSearch;
  listViewState[col].search = field.value;
  refreshListView(col, true, field.selectionStart || field.value.length);
});
document.body.addEventListener("input",e=>{
  const field = e.target.closest("[data-setting-search]");
  if(!field) return;
  settingSearch = field.value;
  const caret = field.selectionStart || settingSearch.length;
  renderMaster();
  initPagination();
  refreshIcons();
  const next = document.querySelector("[data-setting-search]");
  if(next){ next.focus(); next.setSelectionRange(caret,caret); }
});
document.body.addEventListener("change",e=>{
  if(e.target.matches("[data-setting-type]")){
    const type = e.target.value;
    modal.settingType = type;
    document.querySelectorAll(".setting-kpi-row").forEach(row=>{
      const cell = row.children[1];
      if(type==="dirops") cell.innerHTML = `<select data-setting-field="kelompok"><option>Kolegial</option><option>Direktorat</option></select>`;
      else cell.innerHTML = `<input data-setting-field="kategori" placeholder="Kategori KPI">`;
    });
    return;
  }
  const entries = e.target.closest("[data-list-entries]");
  const status = e.target.closest("[data-list-status]");
  const field = entries || status;
  if(!field) return;
  const col = field.dataset.listEntries || field.dataset.listStatus;
  if(entries) listViewState[col].entries = +entries.value || 8;
  if(status) listViewState[col].status = status.value;
  refreshListView(col);
});

document.body.addEventListener("click",e=>{
  const nav=e.target.closest("[data-view]"), create=e.target.closest("[data-create]"), copyYear=e.target.closest("[data-copy-year]"), cur=e.target.closest("[data-create-current]"), viewItem=e.target.closest("[data-view-item]"), edit=e.target.closest("[data-edit]"), editFromView=e.target.closest("[data-edit-from-view]"), del=e.target.closest("[data-delete]"), close=e.target.closest("[data-close-modal]"), closeProfile=e.target.closest("[data-close-profile]"), div=e.target.closest("[data-div]"), exp=e.target.closest("[data-export]"), reportTabBtn=e.target.closest("[data-report-tab]"), readNotifications=e.target.closest("[data-read-notifications]"), group=e.target.closest(".group-toggle"), page=e.target.closest("[data-page]"), pageTo=e.target.closest("[data-page-to]"), textPopup=e.target.closest("[data-text-popup]"), bell=e.target.closest(".bell"), profileTrigger=e.target.closest("#profile-trigger"), editProfile=e.target.closest("[data-edit-profile]"), logout=e.target.closest("[data-logout]"), dropdownToggle=e.target.closest("[data-dropdown-toggle]"), dashboardFilter=e.target.closest("[data-dashboard-filter]"), tableFilter=e.target.closest("[data-table-filter]"), settingCreate=e.target.closest("[data-setting-create]"), settingView=e.target.closest("[data-setting-view]"), settingEdit=e.target.closest("[data-setting-edit]"), settingDelete=e.target.closest("[data-setting-delete]"), settingRowAdd=e.target.closest("[data-setting-row-add]"), settingRowDelete=e.target.closest("[data-setting-row-delete]");
  if(settingCreate){ openKpiSetting(); return; }
  if(settingView){ openKpiSetting(settingView.dataset.settingView,true); return; }
  if(settingEdit){ openKpiSetting(settingEdit.dataset.settingEdit,false); return; }
  if(settingRowAdd){
    const type = document.querySelector("[data-setting-type]")?.value || modal.settingType || "dirops";
    document.querySelector(".setting-editor-table tbody")?.insertAdjacentHTML("beforeend",settingKpiRow({},type,false));
    refreshIcons();
    return;
  }
  if(settingRowDelete){
    const rows = document.querySelectorAll(".setting-kpi-row");
    if(rows.length<=1){ showToast("Setting KPI harus memiliki minimal satu indikator", "error"); return; }
    settingRowDelete.closest("tr")?.remove();
    return;
  }
  if(settingDelete){
    const settingId = settingDelete.dataset.settingDelete;
    if(!confirm("Hapus setting KPI beserta struktur indikatornya?")) return;
    const oldRows = settingRows(settingId);
    const oldIds = new Set(oldRows.map(row=>row.id));
    state.kpiMaster.dirops = state.kpiMaster.dirops.filter(row=>row.settingId!==settingId);
    state.kpiMaster.kolegial = state.kpiMaster.kolegial.filter(row=>row.settingId!==settingId);
    ["dirops","kolegial"].forEach(type=>state[type]=state[type].filter(row=>row.settingId!==settingId && !oldIds.has(row.masterId)));
    save("Setting KPI dihapus");
    return;
  }
  if(dropdownToggle){ const box=dropdownToggle.closest(".ui-dropdown"); document.querySelectorAll(".ui-dropdown.open").forEach(item=>{ if(item!==box) item.classList.remove("open"); }); box?.classList.toggle("open"); return; }
  if(dashboardFilter){
    const key = dashboardFilter.dataset.dashboardFilter;
    const value = dashboardFilter.dataset.value;
    if(key==="year"){ state.dashboardYear = value; if(state.compareYear === value) state.compareYear = String((+value || 2026) - 1); }
    if(key==="compare") state.compareYear = value;
    if(key==="division") state.dashboardDivision = value;
    if(key==="status") state.dashboardDataStatus = value;
    localStorage.setItem(KEY, JSON.stringify(state));
    render();
    return;
  }
  if(tableFilter){
    const key = tableFilter.dataset.tableFilter;
    const value = tableFilter.dataset.value;
    if(key==="masterYear"){
      state.selectedYear = value;
      localStorage.setItem(KEY, JSON.stringify(state));
      renderMaster();
      initPagination();
      refreshIcons();
      return;
    }
    if(key==="trackerEntries") trackerEntries = +value || 8;
    if(key==="trackerDivision") trackerDivisionFilter = value;
    if(key==="trackerStatus") trackerStatusFilter = value;
    if(key.startsWith("listEntries:")) listViewState[key.split(":")[1]].entries = +value || 8;
    if(key.startsWith("listStatus:")) listViewState[key.split(":")[1]].status = value;
    if(key.startsWith("list")) refreshListView(key.split(":")[1]);
    else refreshTrackerView();
    return;
  }
  if(!e.target.closest(".ui-dropdown")) document.querySelectorAll(".ui-dropdown.open").forEach(item=>item.classList.remove("open"));
  if(reportTabBtn){ reportTab = reportTabBtn.dataset.reportTab; renderReports(); refreshIcons(); return; }
  if(copyYear){ copyPreviousYear(); return; }
  if(textPopup){ openTextPopup(textPopup.dataset.textPopup, textPopup.dataset.id, textPopup.dataset.field); return; }
  if(pageTo){ e.preventDefault(); e.stopPropagation(); goToPage(pageTo.dataset.pageTo, +pageTo.dataset.index); return; }
  if(page){ e.preventDefault(); e.stopPropagation(); changePage(page.dataset.page, +page.dataset.dir); return; }
  if(nav){
    if(!canView(nav.dataset.view)){ showToast("Role ini tidak memiliki akses menu tersebut", "error"); return; }
    activeView=nav.dataset.view;
    applyRoleAccess();
  }
  if(group) group.closest(".nav-group").classList.toggle("open");
  if(create) openModal(create.dataset.create); if(cur){ const col=viewToCollection[activeView]; if(col) openModal(col); }
  if(viewItem) openView(viewItem.dataset.viewItem, viewItem.dataset.id);
  if(editFromView) openModal(modal.col, modal.rowId);
  if(edit) openModal(edit.dataset.edit,edit.dataset.id);
  if(del && !canDelete(del.dataset.delete)) alert("Hapus data hanya untuk Super Admin/Direksi sesuai kewenangan.");
  if(del && canDelete(del.dataset.delete) && confirm("Hapus data ini?")){ setCollection(del.dataset.delete, getCollection(del.dataset.delete).filter(x=>x.id!==del.dataset.id)); save(`Hapus data ${del.dataset.delete}`); }
  if(close) closeModal(); if(div){ activeDivision=div.dataset.div; render(); }
  if(profileTrigger){ toggleProfileMenu(); return; }
  if(editProfile){ openProfileModal(); return; }
  if(logout){
    toggleProfileMenu(false);
    state.isLoggedIn = false;
    localStorage.setItem(KEY, JSON.stringify(state));
    applyAuthState();
    return;
  }
  if(closeProfile){ closeProfileModal(); return; }
  if(exp) alert(`${exp.dataset.export} siap diunduh (simulasi).`);
  if(readNotifications){ state.notifications = (state.notifications||[]).map(x=>({...x, read:true})); localStorage.setItem(KEY, JSON.stringify(state)); renderNotifications(); return; }
  if(bell){ toggleNotificationPanel(); return; }
});
document.body.addEventListener("change",e=>{
  const dashboardYear = e.target.closest("[data-dashboard-year]");
  const dashboardCompare = e.target.closest("[data-dashboard-compare]");
  const dashboardDivision = e.target.closest("[data-dashboard-division]");
  const dashboardStatus = e.target.closest("[data-dashboard-status]");
  if(!dashboardYear && !dashboardCompare && !dashboardDivision && !dashboardStatus) return;
  if(dashboardYear){
    state.dashboardYear = dashboardYear.value;
    if(state.compareYear === state.dashboardYear) state.compareYear = String((+state.dashboardYear || 2026) - 1);
  }
  if(dashboardCompare) state.compareYear = dashboardCompare.value;
  if(dashboardDivision) state.dashboardDivision = dashboardDivision.value;
  if(dashboardStatus) state.dashboardDataStatus = dashboardStatus.value;
  localStorage.setItem(KEY, JSON.stringify(state));
  render();
});
$("#crud-form").addEventListener("submit",submit);
$("#profile-form").addEventListener("submit",e=>{
  e.preventDefault();
  state.profile.name = $("#profile-name-input").value.trim();
  state.profile.email = $("#profile-email-input").value.trim();
  closeProfileModal();
  save("Profil pengguna diperbarui");
});
$("#sidebar-toggle").addEventListener("click",()=>{ document.body.classList.toggle("sidebar-collapsed"); refreshIcons(); });
$("#global-search").addEventListener("input",e=>{ const q=e.target.value.toLowerCase(); document.querySelectorAll("tbody tr,.mini-card,.progress-card").forEach(el=>el.style.display=el.textContent.toLowerCase().includes(q)?"":"none"); });
$("#role-switch").value = state.currentRole;
$("#role-switch").addEventListener("change",e=>{
  state.currentRole = e.target.value;
  localStorage.setItem(KEY, JSON.stringify(state));
  render();
  showToast(`Mode akses: ${state.currentRole}`);
});
$("#division-switch").addEventListener("change",e=>{
  state.currentDivision = e.target.value;
  localStorage.setItem(KEY, JSON.stringify(state));
  render();
  showToast(`Akses Kepala Divisi: ${state.currentDivision}`);
});
$("#login-form").addEventListener("submit",e=>{
  e.preventDefault();
  const email = $("#login-email").value.trim() || "direksi@sier.co.id";
  state.currentRole = $("#login-role").value;
  state.profile.email = email;
  state.profile.name = state.currentRole === "Direksi" ? "Direksi Operasional" : state.currentRole;
  state.isLoggedIn = true;
  localStorage.setItem(KEY, JSON.stringify(state));
  $("#role-switch").value = state.currentRole;
  render();
  applyAuthState();
});
render();
applyAuthState();
function refreshIcons(){ if(window.lucide) window.lucide.createIcons(); }
function initPagination(){ document.querySelectorAll("[data-table-shell]").forEach(shell=>applyPage(shell)); }
function changePage(tableId, dir){
  const shell = document.querySelector(`[data-table-shell="${tableId}"]`);
  if(!shell) return;
  const rows = [...shell.querySelectorAll("tbody tr")];
  const pageSize = +shell.dataset.pageSize || 8;
  const max = Math.max(0, Math.ceil(rows.length / pageSize) - 1);
  const step = dir > 0 ? 1 : -1;
  shell.dataset.pageIndex = Math.max(0, Math.min(max, (+shell.dataset.pageIndex || 0) + step));
  applyPage(shell);
  refreshIcons();
}
function goToPage(tableId, index){
  const shell = document.querySelector(`[data-table-shell="${tableId}"]`);
  if(!shell) return;
  const rows = [...shell.querySelectorAll("tbody tr")];
  const pageSize = +shell.dataset.pageSize || 8;
  const max = Math.max(0, Math.ceil(rows.length / pageSize) - 1);
  shell.dataset.pageIndex = Math.max(0, Math.min(max, index));
  applyPage(shell);
  refreshIcons();
}
function applyPage(shell){
  const rows = [...shell.querySelectorAll("tbody tr")];
  const pageSize = +shell.dataset.pageSize || 8;
  const pageIndex = +shell.dataset.pageIndex || 0;
  const start = pageIndex * pageSize;
  rows.forEach((row,i)=>row.style.display = i >= start && i < start + pageSize ? "" : "none");
  const pager = shell.querySelector(".table-pager");
  if(!pager) return;
  const max = Math.max(0, Math.ceil(rows.length / pageSize) - 1);
  pager.querySelector("span").textContent = `${start + 1}-${Math.min(start + pageSize, rows.length)} dari ${rows.length}`;
  pager.querySelector('[data-dir="-1"]').disabled = pageIndex <= 0;
  pager.querySelector('[data-dir="1"]').disabled = pageIndex >= max;
  pager.querySelectorAll("[data-page-to]").forEach(btn=>btn.classList.toggle("active", +btn.dataset.index === pageIndex));
}
window.addEventListener("load", refreshIcons);
window.addEventListener("resize", () => {
  clearTimeout(window.__chartResize);
  window.__chartResize = setTimeout(drawDashboardCharts, 120);
});
