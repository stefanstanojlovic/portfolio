document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const titleText = document.getElementById('todo-title-text');
  const editBtn = document.getElementById('edit-title-btn');
  const sortSelect = document.getElementById('sort-tasks');
  let currentSort = 'date-desc';

  // Učitaj naslov iz localStorage
  let todoTitle = localStorage.getItem('todoTitle') || 'My To-Do List';
  titleText.textContent = todoTitle;

  // Učitaj taskove iz localStorage-a
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Format datuma i vremena
  function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year}. ${hours}:${minutes}`;
  }

  // Prikaz taskova
  function renderTasks() {
    list.innerHTML = "";

    // Sortiraj pre prikaza
    let sortedTasks = [...tasks];
    if (currentSort === 'date-desc') {
      sortedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSort === 'date-asc') {
      sortedTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (currentSort === 'az') {
      sortedTasks.sort((a, b) => a.text.localeCompare(b.text, 'en', {sensitivity:'base'}));
    } else if (currentSort === 'za') {
      sortedTasks.sort((a, b) => b.text.localeCompare(a.text, 'en', {sensitivity:'base'}));
    }

    sortedTasks.forEach((task, idxSorted) => {
      // Pronađi indeks u originalnom nizu (potrebno za update/delete)
      const index = tasks.findIndex(t => t.createdAt === task.createdAt && t.text === task.text);
      const li = document.createElement('li');
      li.className = 'todo-item' + (task.done ? ' done' : '');
      li.innerHTML = `
        <div class="todo-main">
          <span>${task.text}</span>
          <span class="todo-date">${formatDate(task.createdAt)}</span>
        </div>
        <div>
          <button class="done-btn">&#10003;</button>
          <button class="delete-btn">&#10005;</button>
        </div>
      `;
      // Obeleži kao završeno
      li.querySelector('.done-btn').onclick = function() {
        tasks[index].done = !tasks[index].done;
        saveTasks();
        renderTasks();
      };
      // Brisanje
      li.querySelector('.delete-btn').onclick = function() {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
      };
      list.appendChild(li);
    });
  }

  // Čuvanje taskova u localStorage
  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // Dodavanje novog taska
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const task = input.value.trim();
    if (task === "") return;
    tasks.push({
      text: task,
      done: false,
      createdAt: new Date().toISOString()
    });
    saveTasks();
    renderTasks();
    input.value = '';
  });

  // Sort dropdown logika
  if (sortSelect) {
    sortSelect.value = currentSort;
    sortSelect.addEventListener('change', function () {
      currentSort = sortSelect.value;
      renderTasks();
    });
  }

  // Edit naslov (olovka)
  editBtn.addEventListener('click', function () {
    const inputTitle = document.createElement('input');
    inputTitle.type = 'text';
    inputTitle.value = titleText.textContent;
    inputTitle.className = 'title-input';

    editBtn.style.display = 'none';
    titleText.replaceWith(inputTitle);
    inputTitle.focus();
    inputTitle.select();

    inputTitle.addEventListener('blur', saveNewTitle);
    inputTitle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        inputTitle.blur();
      }
    });

    function saveNewTitle() {
      let newTitle = inputTitle.value.trim() || 'My To-Do List';
      localStorage.setItem('todoTitle', newTitle);
      titleText.textContent = newTitle;
      inputTitle.replaceWith(titleText);
      editBtn.style.display = '';
    }
  });

  // Prikaz na početku
  renderTasks();
});
