// Task Management App
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.currentSort = 'date';
        this.editingTaskId = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.renderTasks();
        this.updateStats();
    }

    initializeElements() {
        // Main elements
        this.tasksContainer = document.querySelector('.tasks-container');
        this.modal = document.querySelector('.modal');
        this.taskForm = document.querySelector('#taskForm');
        
        // Form elements
        this.titleInput = document.querySelector('#taskTitle');
        this.descriptionInput = document.querySelector('#taskDescription');
        this.dateInput = document.querySelector('#taskDate');
        this.priorityInput = document.querySelector('#taskPriority');
        this.categoryInput = document.querySelector('#taskCategory');
        
        // Buttons
        this.addTaskBtn = document.querySelector('.add-task-btn');
        this.closeModalBtn = document.querySelector('.close-modal');
        this.saveBtn = document.querySelector('.save-btn');
        this.cancelBtn = document.querySelector('.cancel-btn');
        
        // Filters
        this.searchInput = document.querySelector('#searchInput');
        this.filterSelect = document.querySelector('#filterSelect');
        this.sortSelect = document.querySelector('#sortSelect');
    }

    attachEventListeners() {
        // Add task button
        this.addTaskBtn.addEventListener('click', () => this.openModal());
        
        // Modal buttons
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.saveBtn.addEventListener('click', () => this.saveTask());
        
        // Form submission
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });
        
        // Search and filters
        this.searchInput.addEventListener('input', () => this.renderTasks());
        this.filterSelect.addEventListener('change', () => {
            this.currentFilter = this.filterSelect.value;
            this.renderTasks();
        });
        this.sortSelect.addEventListener('change', () => {
            this.currentSort = this.sortSelect.value;
            this.renderTasks();
        });
    }

    openModal(taskId = null) {
        this.editingTaskId = taskId;
        this.modal.classList.add('active');
        
        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                this.titleInput.value = task.title;
                this.descriptionInput.value = task.description;
                this.dateInput.value = task.date;
                this.priorityInput.value = task.priority;
                this.categoryInput.value = task.category;
            }
        } else {
            this.taskForm.reset();
        }
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.editingTaskId = null;
        this.taskForm.reset();
    }

    saveTask() {
        const taskData = {
            id: this.editingTaskId || Date.now().toString(),
            title: this.titleInput.value,
            description: this.descriptionInput.value,
            date: this.dateInput.value,
            priority: this.priorityInput.value,
            category: this.categoryInput.value,
            completed: false,
            createdAt: this.editingTaskId ? 
                this.tasks.find(t => t.id === this.editingTaskId).createdAt : 
                new Date().toISOString()
        };

        if (this.editingTaskId) {
            const index = this.tasks.findIndex(t => t.id === this.editingTaskId);
            this.tasks[index] = taskData;
        } else {
            this.tasks.push(taskData);
        }

        this.saveToLocalStorage();
        this.renderTasks();
        this.updateStats();
        this.closeModal();
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveToLocalStorage();
            this.renderTasks();
            this.updateStats();
        }
    }

    toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveToLocalStorage();
            this.renderTasks();
            this.updateStats();
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    filterTasks() {
        let filteredTasks = [...this.tasks];
        
        // Apply search filter
        const searchTerm = this.searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply status filter
        switch (this.currentFilter) {
            case 'completed':
                filteredTasks = filteredTasks.filter(task => task.completed);
                break;
            case 'pending':
                filteredTasks = filteredTasks.filter(task => !task.completed);
                break;
        }
        
        // Apply sorting
        switch (this.currentSort) {
            case 'date':
                filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                filteredTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'title':
                filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
        
        return filteredTasks;
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-card ${task.priority}`;
        taskElement.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${task.title}</h3>
                <div class="task-actions">
                    <button onclick="taskManager.toggleTaskStatus('${task.id}')" class="toggle-btn">
                        <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                    </button>
                    <button onclick="taskManager.openModal('${task.id}')" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="taskManager.deleteTask('${task.id}')" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p class="task-description">${task.description}</p>
            <div class="task-meta">
                <div class="task-date">
                    <i class="fas fa-calendar"></i>
                    ${new Date(task.date).toLocaleDateString()}
                </div>
                <span class="task-category">${task.category}</span>
            </div>
        `;
        
        return taskElement;
    }

    renderTasks() {
        const filteredTasks = this.filterTasks();
        this.tasksContainer.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            this.tasksContainer.innerHTML = `
                <div class="no-tasks">
                    <i class="fas fa-tasks"></i>
                    <p>No tasks found</p>
                </div>
            `;
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.tasksContainer.appendChild(taskElement);
        });
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        
        document.querySelector('.total-tasks .stat-value').textContent = totalTasks;
        document.querySelector('.completed-tasks .stat-value').textContent = completedTasks;
    }
}

// Initialize the task manager
const taskManager = new TaskManager(); 