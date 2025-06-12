document.addEventListener('DOMContentLoaded', () => {
  const todoInput = document.getElementById('todo-input');
  const todoCategory = document.getElementById('todo-category');
  const todoDueDate = document.getElementById('todo-duedate');
  const addBtn = document.getElementById('add-btn');
  const todoList = document.getElementById('todo-list');
  const filterCategory = document.getElementById('filter-category');

  // Create dark mode toggle button
  const darkModeToggle = document.createElement('button');
  darkModeToggle.textContent = ' Dark Mode';
  darkModeToggle.style.marginBottom = '1rem';
  darkModeToggle.style.padding = '0.5rem 1rem';
  darkModeToggle.style.border = 'none';
  darkModeToggle.style.borderRadius = '8px';
  darkModeToggle.style.cursor = 'pointer';
  darkModeToggle.style.background = '#ff6b6b';
  darkModeToggle.style.color = 'white';
  darkModeToggle.style.fontWeight = '700';
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });

  // Insert dark mode toggle button above container
  const container = document.querySelector('.container');
  container.parentNode.insertBefore(darkModeToggle, container);

  // Load dark mode preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }

  // Load todos from localStorage
  function loadTodos() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.forEach(todo => {
      createTodoElement(todo.text, todo.completed, todo.category, todo.dueDate);
      addCategoryOption(todo.category);
    });
  }

  // Save todos to localStorage
  function saveTodos() {
    const todos = [];
    todoList.querySelectorAll('li').forEach(li => {
      todos.push({
        text: li.querySelector('.todo-text').textContent,
        completed: li.classList.contains('completed'),
        category: li.getAttribute('data-category') || '',
        dueDate: li.getAttribute('data-duedate') || ''
      });
    });
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  // Add category option to filter dropdown if not exists
  function addCategoryOption(category) {
    if (!category) return;
    if (![...filterCategory.options].some(opt => opt.value === category)) {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      filterCategory.appendChild(option);
    }
  }

  // Create a todo list item element
  function createTodoElement(task, completed = false, category = '', dueDate = '') {
    const li = document.createElement('li');
    li.setAttribute('data-category', category);
    li.setAttribute('data-duedate', dueDate);
    if (completed) li.classList.add('completed');

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = task;
    span.addEventListener('click', () => {
      li.classList.toggle('completed');
      saveTodos();
    });

    const categorySpan = document.createElement('span');
    categorySpan.className = 'todo-category';
    categorySpan.textContent = category ? `[${category}]` : '';
    categorySpan.style.marginLeft = '0.5rem';
    categorySpan.style.fontStyle = 'italic';
    categorySpan.style.color = '#ccc';

    const dueDateSpan = document.createElement('span');
    dueDateSpan.className = 'todo-duedate';
    dueDateSpan.textContent = dueDate ? `Due: ${dueDate}` : '';
    dueDateSpan.style.marginLeft = '0.5rem';
    dueDateSpan.style.fontSize = '0.85rem';
    dueDateSpan.style.color = '#ff6b6b';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.addEventListener('click', () => {
      todoList.removeChild(li);
      saveTodos();
    });

    li.appendChild(span);
    li.appendChild(categorySpan);
    li.appendChild(dueDateSpan);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  }

  // Add new todo item
  function addTodo() {
    const task = todoInput.value.trim();
    const category = todoCategory.value.trim();
    const dueDate = todoDueDate.value;
    if (task === '') return;

    createTodoElement(task, false, category, dueDate);
    addCategoryOption(category);
    saveTodos();

    todoInput.value = '';
    todoCategory.value = '';
    todoDueDate.value = '';
    todoInput.focus();
  }

  // Filter todos by category
  filterCategory.addEventListener('change', () => {
    const selectedCategory = filterCategory.value;
    todoList.querySelectorAll('li').forEach(li => {
      if (selectedCategory === 'all' || li.getAttribute('data-category') === selectedCategory) {
        li.style.display = '';
      } else {
        li.style.display = 'none';
      }
    });
  });

  addBtn.addEventListener('click', addTodo);

  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  });

  // Drag and drop reorder functionality
  let draggedItem = null;

  todoList.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'LI') {
      draggedItem = e.target;
      e.dataTransfer.effectAllowed = 'move';
    }
  });

  todoList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const target = e.target.closest('li');
    if (target && target !== draggedItem) {
      const rect = target.getBoundingClientRect();
      const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
      todoList.insertBefore(draggedItem, next ? target.nextSibling : target);
    }
  });

  todoList.addEventListener('drop', (e) => {
    e.preventDefault();
    draggedItem = null;
    saveTodos();
  });

  // Make list items draggable
  function makeDraggable(li) {
    li.setAttribute('draggable', true);
  }

  // Override createTodoElement to make items draggable
  const originalCreateTodoElement = createTodoElement;
  createTodoElement = function(task, completed = false, category = '', dueDate = '') {
    originalCreateTodoElement(task, completed, category, dueDate);
    const lastLi = todoList.lastElementChild;
    makeDraggable(lastLi);
  };

  // Make existing items draggable on load
  function makeExistingDraggable() {
    todoList.querySelectorAll('li').forEach(li => {
      makeDraggable(li);
    });
  }

  loadTodos();
  makeExistingDraggable();
});
