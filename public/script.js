// script.js

// Função para buscar e exibir as tarefas
function loadTasks() {
    fetch("/tarefas")
        .then(response => response.json())
        .then(data => displayTasks(data.data))
        .catch(error => console.error("Erro ao carregar tarefas:", error));
}

// Função para exibir a lista de tarefas na tela
function displayTasks(tasks) {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const taskDiv = document.createElement("div");
        taskDiv.className = "task";
        if (task.custo >= 1000) taskDiv.style.backgroundColor = "yellow";

        taskDiv.innerHTML = `
            <span>${task.nome}</span>
            <span>R$ ${task.custo.toFixed(2)}</span>
            <span>${task.data_limite}</span>
            <button onclick="editTask(${task.id})">✏️</button>
            <button onclick="deleteTask(${task.id})">🗑️</button>
        `;

        taskList.appendChild(taskDiv);
    });
}

// Função para abrir o popup de edição/inclusão de tarefa
function openPopup(editing = false, task = {}) {
    const popup = document.getElementById("task-popup");
    const title = document.getElementById("popup-title");
    const taskName = document.getElementById("task-name");
    const taskCost = document.getElementById("task-cost");
    const taskDeadline = document.getElementById("task-deadline");

    title.innerText = editing ? "Editar Tarefa" : "Nova Tarefa";
    taskName.value = task.nome || "";
    taskCost.value = task.custo || "";
    taskDeadline.value = task.data_limite || "";
    
    popup.dataset.editing = editing;
    popup.dataset.taskId = task.id || "";
    popup.classList.remove("hidden");
}

// Função para fechar o popup
function closePopup() {
    document.getElementById("task-popup").classList.add("hidden");
}

// Função para adicionar ou editar tarefa
function saveTask(event) {
    event.preventDefault();

    const name = document.getElementById("task-name").value;
    const cost = document.getElementById("task-cost").value;
    const deadline = document.getElementById("task-deadline").value;
    const editing = document.getElementById("task-popup").dataset.editing === "true";
    const taskId = document.getElementById("task-popup").dataset.taskId;

    const url = editing ? `/tarefas/${taskId}` : "/tarefas";
    const method = editing ? "PUT" : "POST";
    const taskData = { nome: name, custo: parseFloat(cost), data_limite: deadline };

    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
    })
    .then(response => response.json())
    .then(() => {
        loadTasks();
        closePopup();
    })
    .catch(error => console.error("Erro ao salvar tarefa:", error));
}

// Função para editar tarefa
function editTask(id) {
    fetch(`/tarefas/${id}`)
        .then(response => response.json())
        .then(data => openPopup(true, data.data))
        .catch(error => console.error("Erro ao carregar tarefa:", error));
}

// Função para excluir tarefa
function deleteTask(id) {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
        fetch(`/tarefas/${id}`, { method: "DELETE" })
            .then(() => loadTasks())
            .catch(error => console.error("Erro ao excluir tarefa:", error));
    }
}

// Eventos
document.getElementById("add-task-btn").addEventListener("click", () => openPopup());
document.getElementById("task-form").addEventListener("submit", saveTask);
document.getElementById("cancel-btn").addEventListener("click", closePopup);

// Carregar as tarefas ao iniciar
loadTasks();
