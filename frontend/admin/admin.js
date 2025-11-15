console.log("Admin JS loaded");

const usersTableBody = document.querySelector("#users-table tbody");
const cadastrosTableBody = document.querySelector("#cadastros-table tbody");

const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");

document.getElementById("filter-btn").addEventListener("click", loadData);
document.getElementById("export-csv").addEventListener("click", exportCSV);

document.getElementById("logout-btn").addEventListener("click", async (event) => {
  event.preventDefault();
  await fetch("/auth/logout", { method: "POST", credentials: "include" });
  window.location.href = "/";
});

// Create user
document.getElementById("create-user-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("new-email").value.trim();
  const password = document.getElementById("new-password").value;
  const role = document.getElementById("new-role").value;

  const msg = document.getElementById("create-user-msg");
  msg.textContent = "";

  try {
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, role })
    });

    if (!res.ok) {
      msg.textContent = "Erro ao criar usuário.";
      return;
    }

    msg.textContent = "Usuário criado com sucesso!";
    document.getElementById("create-user-form").reset();
    loadData();
  } catch (err) {
    console.error(err);
    msg.textContent = "Erro inesperado ao criar usuário.";
  }
});

function buildQuery() {
  const params = [];
  if (fromInput.value) params.push(`from=${encodeURIComponent(fromInput.value)}`);
  if (toInput.value) params.push(`to=${encodeURIComponent(toInput.value)}`);
  return params.length ? `?${params.join("&")}` : "";
}

async function loadData() {
  const query = buildQuery();

  const usersRes = await fetch(`/api/admin/users${query}`, {
    credentials: "include",
  });
  const cadRes = await fetch(`/api/admin/cadastros${query}`, {
    credentials: "include",
  });

  const users = await usersRes.json();
  const cadastros = await cadRes.json();

  renderUsers(users);
  renderCadastros(cadastros);
}

// --- USERS: only Email + CreatedAt ---
function renderUsers(users) {
  usersTableBody.innerHTML = "";

  users.forEach((user) => {
    const tr = document.createElement("tr");

    const emailTd = document.createElement("td");
    emailTd.textContent = user.email || "";
    tr.appendChild(emailTd);

    const createdTd = document.createElement("td");
    const createdValue =
      user.created_at || user.createdAt || user.criado || "";
    createdTd.textContent = formatDate(createdValue);
    tr.appendChild(createdTd);

    usersTableBody.appendChild(tr);
  });
}

// --- CADASTROS: parse dados JSON (cpf, birthDate, etc.) ---
function renderCadastros(cadastros) {
  cadastrosTableBody.innerHTML = "";

  cadastros.forEach((c) => {
    const tr = document.createElement("tr");

    const nomeTd = document.createElement("td");
    nomeTd.textContent = c.nome || c.name || "";
    tr.appendChild(nomeTd);

    let dadosObj = {};
    try {
      const rawDados = c.dados || c.dado || c.data;
      if (rawDados) {
        dadosObj = typeof rawDados === "string" ? JSON.parse(rawDados) : rawDados;
      }
    } catch (e) {
      console.warn("Falha ao parsear dados de cadastro:", e);
    }

    const cpfTd = document.createElement("td");
    cpfTd.textContent = dadosObj.cpf || "";
    tr.appendChild(cpfTd);

    const birthTd = document.createElement("td");
    birthTd.textContent = dadosObj.birthDate || "";
    tr.appendChild(birthTd);

    const createdTd = document.createElement("td");
    const createdValue =
      c.created_at || c.createdAt || c.criado || "";
    createdTd.textContent = formatDate(createdValue);
    tr.appendChild(createdTd);

    cadastrosTableBody.appendChild(tr);
  });
}

// Simple date prettifier (optional)
function formatDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

// Basic CSV export (still uses /users endpoint)
function exportCSV() {
  const query = buildQuery();
  window.location.href = `/api/admin/cadastros${query}${query ? "&" : "?"}export=csv`;
}

// Load initial data on page open
loadData();
