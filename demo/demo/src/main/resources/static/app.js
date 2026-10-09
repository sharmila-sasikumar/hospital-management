const API = "/api";
let patients = [];
let doctors = [];

// ---------- Tabs ----------
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});

// ---------- Helpers ----------
async function request(url, method = "GET", body = null) {
  const options = { method, headers: { "Content-Type": "application/json" } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(API + url, options);
  return method === "GET" ? res.json() : res;
}

// ---------- Patients ----------
async function loadPatients() {
  patients = await request("/patients");
  document.getElementById("patient-table").innerHTML = patients.map(p => `
    <tr>
      <td>${p.id}</td><td>${p.name}</td><td>${p.age}</td><td>${p.gender}</td>
      <td>${p.phone}</td><td>${p.disease}</td>
      <td><button class="del" onclick="deletePatient(${p.id})">Delete</button></td>
    </tr>`).join("");
  fillPatientDropdown();
}

async function addPatient() {
  const patient = {
    name: document.getElementById("p-name").value,
    age: parseInt(document.getElementById("p-age").value) || 0,
    gender: document.getElementById("p-gender").value,
    phone: document.getElementById("p-phone").value,
    disease: document.getElementById("p-disease").value
  };
  if (!patient.name) return alert("Enter patient name");
  await request("/patients", "POST", patient);
  ["p-name", "p-age", "p-phone", "p-disease"].forEach(id => document.getElementById(id).value = "");
  loadPatients();
}

async function deletePatient(id) {
  if (!confirm("Delete this patient?")) return;
  await request("/patients/" + id, "DELETE");
  loadPatients();
  loadAppointments();
}

// ---------- Doctors ----------
async function loadDoctors() {
  doctors = await request("/doctors");
  document.getElementById("doctor-table").innerHTML = doctors.map(d => `
    <tr>
      <td>${d.id}</td><td>${d.name}</td><td>${d.specialization}</td><td>${d.phone}</td>
      <td><button class="del" onclick="deleteDoctor(${d.id})">Delete</button></td>
    </tr>`).join("");
  fillDoctorDropdown();
}

async function addDoctor() {
  const doctor = {
    name: document.getElementById("d-name").value,
    specialization: document.getElementById("d-spec").value,
    phone: document.getElementById("d-phone").value
  };
  if (!doctor.name) return alert("Enter doctor name");
  await request("/doctors", "POST", doctor);
  ["d-name", "d-spec", "d-phone"].forEach(id => document.getElementById(id).value = "");
  loadDoctors();
}

async function deleteDoctor(id) {
  if (!confirm("Delete this doctor?")) return;
  await request("/doctors/" + id, "DELETE");
  loadDoctors();
  loadAppointments();
}

// ---------- Appointments ----------
function fillPatientDropdown() {
  document.getElementById("a-patient").innerHTML =
    patients.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
}

function fillDoctorDropdown() {
  document.getElementById("a-doctor").innerHTML =
    doctors.map(d => `<option value="${d.id}">Dr. ${d.name} (${d.specialization})</option>`).join("");
}

async function loadAppointments() {
  const list = await request("/appointments");
  const pName = id => (patients.find(p => p.id === id) || {}).name || "Unknown";
  const dName = id => (doctors.find(d => d.id === id) || {}).name || "Unknown";
  document.getElementById("appointment-table").innerHTML = list.map(a => `
    <tr>
      <td>${a.id}</td><td>${pName(a.patientId)}</td><td>Dr. ${dName(a.doctorId)}</td>
      <td>${a.appointmentDate}</td><td>${a.reason}</td>
      <td><button class="del" onclick="deleteAppointment(${a.id})">Cancel</button></td>
    </tr>`).join("");
}

async function addAppointment() {
  const appointment = {
    patientId: parseInt(document.getElementById("a-patient").value),
    doctorId: parseInt(document.getElementById("a-doctor").value),
    appointmentDate: document.getElementById("a-date").value,
    reason: document.getElementById("a-reason").value
  };
  if (!appointment.patientId || !appointment.doctorId || !appointment.appointmentDate)
    return alert("Select patient, doctor and date");
  await request("/appointments", "POST", appointment);
  document.getElementById("a-reason").value = "";
  loadAppointments();
}

async function deleteAppointment(id) {
  await request("/appointments/" + id, "DELETE");
  loadAppointments();
}

// ---------- Start ----------
(async function init() {
  await loadPatients();
  await loadDoctors();
  await loadAppointments();
})();