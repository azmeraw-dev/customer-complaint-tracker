document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("addBtn").addEventListener("click", addComplaint);
  document.getElementById("searchInput").addEventListener("input", filterComplaints);
  document.getElementById("clearBtn").addEventListener("click", clearAllComplaints);
  document.getElementById("exportBtn").addEventListener("click", exportToCSV);

  loadComplaints();
});

function addComplaint() {
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("phoneNumber").value.trim();
  const complaint = document.getElementById("complaintText").value.trim();
  const priority = document.getElementById("prioritySelect").value;

  if (!name || !phone || !complaint) {
    alert("Please fill in all fields!");
    return;
  }

  const newComplaint = { name, phone, complaint, status: "Pending", priority };
  let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
  complaints.push(newComplaint);
  localStorage.setItem("complaints", JSON.stringify(complaints));

  appendComplaintToTable(newComplaint);

  document.getElementById("customerName").value = "";
  document.getElementById("phoneNumber").value = "";
  document.getElementById("complaintText").value = "";
}

function appendComplaintToTable(complaintObj) {
  const table = document.getElementById("complaintTable");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${complaintObj.name}</td>
    <td>${complaintObj.phone}</td>
    <td>${complaintObj.complaint}</td>
    <td class="${complaintObj.status === "Pending" ? "status-pending" : "status-resolved"}">${complaintObj.status}</td>
    <td class="priority-${complaintObj.priority.toLowerCase()}">${complaintObj.priority}</td>
    <td>${complaintObj.status === "Pending" ? '<button class="action-btn resolve-btn">Resolve</button>' : ''}</td>
  `;

  if (complaintObj.status === "Pending") {
    row.querySelector(".resolve-btn").addEventListener("click", function () {
      row.cells[3].textContent = "Resolved";
      row.cells[3].className = "status-resolved";
      this.remove();

      let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
      complaints = complaints.map(c => {
        if (c.name === complaintObj.name && c.phone === complaintObj.phone && c.complaint === complaintObj.complaint) {
          c.status = "Resolved";
        }
        return c;
      });
      localStorage.setItem("complaints", JSON.stringify(complaints));
    });
  }

  table.appendChild(row);
}

function loadComplaints() {
  const complaints = JSON.parse(localStorage.getItem("complaints")) || [];
  complaints.forEach(c => appendComplaintToTable(c));
}

function filterComplaints() {
  const filter = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.getElementById("complaintTable").getElementsByTagName("tr");

  for (let row of rows) {
    const name = row.cells[0].textContent.toLowerCase();
    const phone = row.cells[1].textContent.toLowerCase();
    row.style.display = (name.includes(filter) || phone.includes(filter)) ? "" : "none";
  }
}

function clearAllComplaints() {
  if (confirm("Are you sure you want to delete all complaints?")) {
    localStorage.removeItem("complaints");
    document.getElementById("complaintTable").innerHTML = "";
  }
}

function exportToCSV() {
  const complaints = JSON.parse(localStorage.getItem("complaints")) || [];
  if (!complaints.length) { alert("No complaints to export!"); return; }

  let csv = "data:text/csv;charset=utf-8,Customer Name,Phone,Complaint,Status,Priority\n";
  complaints.forEach(c => {
    csv += `${c.name},${c.phone},"${c.complaint}",${c.status},${c.priority}\n`;
  });

  const encodedUri = encodeURI(csv);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const date = new Date();
  link.setAttribute("download", `complaints_${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}



