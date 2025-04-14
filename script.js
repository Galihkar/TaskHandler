    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');
    const statusFilter = document.getElementById('statusFilter');
    const darkSwitch = document.getElementById('darkSwitch');
    const taskPriority = document.getElementById('taskPriority');

    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const editTaskForm = document.getElementById('editTaskForm');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));

    const renderTasks = () => {
      taskList.innerHTML = '';
      const filter = statusFilter.value;
      tasks.forEach((task, index) => {
        if (filter !== 'all' && task.status !== filter) return;

        const card = document.createElement('div');
        card.className = 'card task-card';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        cardBody.innerHTML = `
          <h5 class="card-title">${task.title}</h5>
          <h6 class="card-subtitle mb-2 text-muted">Dari: ${task.from}</h6>
          <p class="card-text">
            <span class="description" id="desc-${index}">${task.desc || '-'}</span>
            ${task.desc && task.desc.split('\n').length > 2 ? 
              `<a href="#" class="read-more-link" data-index="${index}">Read More</a>` : ''}
          </p>
          <p>Prioritas: <strong>${task.priority}</strong></p>
          <p>Status: <strong>${task.status}</strong></p>
          <p>Mulai: ${task.startDate}</p>
          <p>Selesai: ${task.endDate || '-'}</p>
          <button class="btn btn-warning btn-sm me-2" onclick="editTask(${index})">Edit</button>
          <button class="btn btn-danger btn-sm me-2" onclick="deleteTask(${index})">Hapus</button>
          ${task.status === 'On Progress' ? `<button class="btn btn-success btn-sm" onclick="markDone(${index})">Selesai</button>` : ''}
        `;

        card.appendChild(cardBody);
        taskList.appendChild(card);
      });

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

    statusFilter.addEventListener('change', renderTasks);

    darkSwitch.addEventListener('change', () => {
      document.body.classList.toggle('dark-mode', darkSwitch.checked);
      localStorage.setItem('darkMode', darkSwitch.checked);
    });

    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
      darkSwitch.checked = true;
    }

    renderTasks();