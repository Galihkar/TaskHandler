  const taskForm = document.getElementById('taskForm');
  const taskList = document.getElementById('taskList');
  const pagination = document.getElementById('pagination');
  const statusFilter = document.getElementById('statusFilter');
  const searchInput = document.getElementById('searchInput');
  const darkSwitch = document.getElementById('darkSwitch');
  const taskPriority = document.getElementById('taskPriority');

  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  const editTaskForm = document.getElementById('editTaskForm');

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let currentPage = 1;
  const tasksPerPage = 4;

  const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));

  function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }

  const renderTasks = () => {
    const scrollY = window.scrollY;
    taskList.innerHTML = '';

    const filter = statusFilter.value;
    const searchQuery = searchInput.value.trim().toLowerCase();

    const filteredTasks = tasks.filter(task =>
      (filter === 'all' || task.status === filter) &&
      (
        task.title.toLowerCase().includes(searchQuery) ||
        task.from.toLowerCase().includes(searchQuery)
      )
    );

    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
    const start = (currentPage - 1) * tasksPerPage;
    const currentTasks = filteredTasks.slice(start, start + tasksPerPage);

    currentTasks.forEach((task, index) => {
      const realIndex = tasks.indexOf(task);
      const card = document.createElement('div');
      card.className = 'card task-card';
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';
      cardBody.innerHTML = `
        <h5 class="card-title">${task.title}</h5>
        <h6 class="card-subtitle mb-2 text-muted">Assigned by: ${task.from}</h6>
        <p class="card-text">
          <span class="description" id="desc-${realIndex}">${task.desc || '-'}</span>
          ${task.desc && task.desc.split('\n').length > 2 ? 
            `<a href="#" class="read-more-link" data-index="${realIndex}">Read More</a>` : ''}
        </p>
        <p>Priority: <strong>${task.priority}</strong></p>
        <p>Status: <strong>${task.status}</strong></p>
        <p>Start: <strong>${formatDate(task.startDate)}</strong> Finish: <strong>${task.endDate ? formatDate(task.endDate) : '-'}</strong></p>
        <button class="btn btn-warning btn-sm me-2" onclick="editTask(${realIndex})">Edit</button>
        <button class="btn btn-danger btn-sm me-2" onclick="deleteTask(${realIndex})">Delete</button>
        ${task.status === 'On Progress' ? `<button class="btn btn-success btn-sm" onclick="markDone(${realIndex})">Completed</button>` : ''}
      `;
      card.appendChild(cardBody);
      taskList.appendChild(card);
    });

    renderPagination(filteredTasks.length);
    window.scrollTo({ top: scrollY, behavior: 'instant' });

    document.querySelectorAll('.read-more-link').forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const index = this.getAttribute('data-index');
        const desc = document.getElementById(`desc-${index}`);
        const expanded = desc.classList.toggle('expanded');
        this.textContent = expanded ? 'Read Less' : 'Read More';
      });
    });
  };

  const renderPagination = (totalTasks) => {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(totalTasks / tasksPerPage);
    if (totalPages <= 1) return;

    const createPageItem = (label, page, disabled = false, active = false) => {
      const li = document.createElement('li');
      li.className = `page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}`;
      const a = document.createElement('a');
      a.className = 'page-link';
      a.href = '#';
      a.textContent = label;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (!disabled && currentPage !== page) {
          goToPage(page);
        }
      });
      li.appendChild(a);
      return li;
    };

    pagination.appendChild(createPageItem('«', currentPage - 1, currentPage === 1));
    for (let i = 1; i <= totalPages; i++) {
      pagination.appendChild(createPageItem(i, i, false, currentPage === i));
    }
    pagination.appendChild(createPageItem('»', currentPage + 1, currentPage === totalPages));
  };

  const goToPage = (page) => {
    currentPage = page;
    renderTasks();
  };

  taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value.trim();
    const from = document.getElementById('taskFrom').value.trim();
    const desc = document.getElementById('taskDesc').value.trim();
    const priority = taskPriority.value;

    if (!title || !from) return alert('Judul dan Dari harus diisi.');

    const newTask = {
      title,
      from,
      desc,
      priority,
      status: 'On Progress',
      startDate: new Date().toLocaleDateString(),
      endDate: null
    };
    tasks.push(newTask);
    saveTasks();
    currentPage = Math.ceil(tasks.length / tasksPerPage);
    renderTasks();
    taskForm.reset();
  });

  window.markDone = (index) => {
    const descDone = prompt("Deskripsi penyelesaian (opsional):");
    tasks[index].status = 'Selesai';
    tasks[index].endDate = new Date().toLocaleDateString();
    if (descDone) {
      tasks[index].desc = tasks[index].desc ? `${tasks[index].desc}\n\n[Deskripsi Selesai]: ${descDone}` : `[Deskripsi Selesai]: ${descDone}`;
    }
    saveTasks();
    renderTasks();
  };

  window.editTask = (index) => {
    const task = tasks[index];
    document.getElementById('editIndex').value = index;
    document.getElementById('editTitle').value = task.title;
    document.getElementById('editFrom').value = task.from;
    document.getElementById('editDesc').value = task.desc;
    document.getElementById('editPriority').value = task.priority;
    editModal.show();
  };

  window.deleteTask = (index) => {
    if (confirm('Yakin ingin menghapus tugas ini?')) {
      tasks.splice(index, 1);
      saveTasks();
      if ((currentPage - 1) * tasksPerPage >= tasks.length) currentPage = Math.max(1, currentPage - 1);
      renderTasks();
    }
  };

  editTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const index = document.getElementById('editIndex').value;
    tasks[index].title = document.getElementById('editTitle').value.trim();
    tasks[index].from = document.getElementById('editFrom').value.trim();
    tasks[index].desc = document.getElementById('editDesc').value.trim();
    tasks[index].priority = document.getElementById('editPriority').value;
    saveTasks();
    renderTasks();
    editModal.hide();
  });

  statusFilter.addEventListener('change', () => {
    currentPage = 1;
    renderTasks();
  });

  searchInput.addEventListener('input', () => {
    currentPage = 1;
    renderTasks();
  });

  darkSwitch.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', darkSwitch.checked);
    localStorage.setItem('darkMode', darkSwitch.checked);
  });

  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    darkSwitch.checked = true;
  }

  renderTasks();