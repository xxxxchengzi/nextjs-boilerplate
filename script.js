class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    initializeElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.clearBtn = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        this.clearBtn.addEventListener('click', () => this.clearCompleted());

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString()
        };

        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.saveTodos();
        this.render();

        // 添加反馈动画
        this.todoInput.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.todoInput.style.transform = 'scale(1)';
        }, 150);
    }

    toggleTodo(id) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        this.saveTodos();
        this.render();
    }

    deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.classList.add('removing');
            setTimeout(() => {
                this.todos = this.todos.filter(todo => todo.id !== id);
                this.saveTodos();
                this.render();
            }, 300);
        }
    }

    clearCompleted() {
        const completedCount = this.todos.filter(todo => todo.completed).length;
        if (completedCount === 0) return;

        if (confirm(`确定要删除 ${completedCount} 个已完成的任务吗？`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            case 'pending':
                return this.todos.filter(todo => !todo.completed);
            default:
                return this.todos;
        }
    }

    render() {
        this.updateStats();
        this.renderTodos();
        this.updateClearButton();
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const pending = total - completed;

        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
        this.pendingTasks.textContent = pending;

        // 添加数字变化动画
        [this.totalTasks, this.completedTasks, this.pendingTasks].forEach(el => {
            el.style.transform = 'scale(1.1)';
            setTimeout(() => {
                el.style.transform = 'scale(1)';
            }, 200);
        });
    }

    renderTodos() {
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            this.todoList.style.display = 'none';
            this.emptyState.style.display = 'block';
            return;
        }

        this.todoList.style.display = 'block';
        this.emptyState.style.display = 'none';

        this.todoList.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');

        // 绑定事件
        this.todoList.querySelectorAll('.todo-item').forEach(item => {
            const id = parseInt(item.dataset.id);
            const checkbox = item.querySelector('.todo-checkbox');
            const deleteBtn = item.querySelector('.delete-btn');

            checkbox.addEventListener('click', () => this.toggleTodo(id));
            deleteBtn.addEventListener('click', () => this.deleteTodo(id));
        });
    }

    createTodoHTML(todo) {
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}"></div>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <span class="todo-date">${todo.createdAt}</span>
                <button class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </li>
        `;
    }

    updateClearButton() {
        const completedCount = this.todos.filter(todo => todo.completed).length;
        this.clearBtn.disabled = completedCount === 0;
        this.clearBtn.innerHTML = `
            <i class="fas fa-trash"></i>
            清除已完成 ${completedCount > 0 ? `(${completedCount})` : ''}
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('保存数据失败:', error);
            alert('保存数据失败，请检查浏览器存储权限');
        }
    }

    loadTodos() {
        try {
            const stored = localStorage.getItem('todos');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('加载数据失败:', error);
            return [];
        }
    }
}

// 应用入口
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// 添加一些实用功能
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K 快速聚焦输入框
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('todoInput').focus();
    }
});

// 添加离线支持提示
window.addEventListener('online', () => {
    console.log('网络连接已恢复');
});

window.addEventListener('offline', () => {
    console.log('网络连接已断开，数据将保存在本地');
});

// 页面可见性变化时保存数据
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面即将隐藏，确保数据已保存
        console.log('页面隐藏，确保数据已保存');
    }
});