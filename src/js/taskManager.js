/* eslint-disable class-methods-use-this */
import SaveStateTable from './saveState';

export default class TaskManager {
  constructor(container) {
    if (typeof container === 'string') {
      this.container = document.querySelector(container);
    } else { this.container = container; }
    this.draggedEl = null;
    this.onClick = this.onClick.bind(this);
    this.showCloseTask = this.showCloseTask.bind(this);
    this.hideCloseTask = this.hideCloseTask.bind(this);

    this.onMousedown = this.onMousedown.bind(this);
    this.onMouseup = this.onMouseup.bind(this);
    this.onMousemove = this.onMousemove.bind(this);
    document.addEventListener('mousemove', (evt) => this.onMousemove(evt));
    this.init();
  }

  init() {
    if (localStorage.getItem('state') === null) {
      SaveStateTable.load(null);
    }
    SaveStateTable.load(localStorage.getItem('state'));
    this.addAvents();
  }

  addAvents() {
    this.columns = Array.from(document.querySelectorAll('.taskColumn'));
    for (const column of this.columns) {
      column.addEventListener('click', (e) => this.onClick(e));
    }
    const cards = Array.from(this.container.querySelectorAll('.taskColumn__card'));
    for (const card of cards) {
      card.addEventListener('mouseenter', (evt) => this.showCloseTask(evt));
      card.addEventListener('mouseleave', (evt) => this.hideCloseTask(evt));
      card.addEventListener('mousedown', (evt) => this.onMousedown(evt));
      card.addEventListener('mouseup', (evt) => this.onMouseup(evt));
    }
  }

  onMousedown(evt) {
    const { target } = evt;
    this.draggedEl = target;
    target.addEventListener('dragstart', (event) => event.preventDefault());
    if (!target.classList.contains('taskColumn__card')) return;
    const width = evt.target.offsetWidth;
    const height = evt.target.offsetHeight;
    target.style.position = 'absolute';
    target.style.zIndex = 1000;
    document.body.append(target);
    // target.style.left = `${evt.pageX}px`;
    // target.style.top = `${evt.pageY}px`;

    target.style.left = `${evt.clientX - target.getBoundingClientRect().left}px`;
    target.style.top = `${evt.clientY - target.getBoundingClientRect().top}px`;
    target.style.width = `${width}px`;
    target.style.height = `${height}px`;
  }

  onMouseup(evt) {

  }

  onMousemove(evt) {
    if (!this.draggedEl) return;
    evt.preventDefault();
    const { target } = evt;
    // console.log(evt);
    target.style.left = `${evt.pageX}px`;
    target.style.top = `${evt.pageY}px`;
  }

  onClick(e) {
    if (e.target.classList.contains('taskColumn__futerAdd')) {
      this.showAddCard(e);
    }
    if (e.target.classList.contains('taskColumn__futerClose')) {
      this.closeAddCard(e);
    }
    if (e.target.classList.contains('taskColumn__futerNewCard')) {
      this.addCard(e);
    }
    if (e.target.classList.contains('taskColumn__cardClose')) {
      this.dellCard(e);
    }
  }

  showAddCard(e) { // Показывает диалог добавления задачи
    const { target } = e;
    const futerEl = target.parentNode;
    target.remove();
    const textarea = document.createElement('textarea');
    textarea.setAttribute('placeholder', 'Ввести заголовок для этой карточки');
    textarea.className = 'taskColumn__futerText';
    futerEl.appendChild(textarea);
    const button = document.createElement('button');
    button.className = 'taskColumn__futerNewCard';
    button.textContent = 'Добавить карточку';
    futerEl.appendChild(button);
    const closeAddCard = document.createElement('a');
    closeAddCard.className = 'taskColumn__futerClose';
    futerEl.appendChild(closeAddCard);
  }

  closeAddCard(e) { // закрывает диалог добавления задачи
    const { target } = e;
    const futerEl = target.parentNode;
    futerEl.innerHTML = '<a href="#" class="taskColumn__futerAdd">Добавить карточку</a>';
  }

  addCard(e) { // добавляет задачу в колонку
    const { target } = e;
    const cardsContaner = target.closest('.taskColumn')
      .querySelector('.taskColumn__cards');
    const text = target.closest('.taskColumn__futer')
      .querySelector('.taskColumn__futerText').value;
    const taskElem = this.createTask(text);
    cardsContaner.appendChild(taskElem);
    this.closeAddCard(e);
    this.addAvents();
    SaveStateTable.save(this.container);
  }

  showCloseTask(evt) { // показываек кнопку удалеия карточки с задачей
    const { target } = evt;
    if (target.firstChild.classList.contains('taskColumn__cardClose')) return;
    const cardClose = document.createElement('div');
    cardClose.className = 'taskColumn__cardClose';
    target.appendChild(cardClose);
  }

  hideCloseTask(evt) { // прячет кнопку удаления карточки с задачей
    const { target } = evt;
    target.querySelector('.taskColumn__cardClose').remove();
  }

  dellCard(e) { // удаляет карточку с задачей
    const { target } = e;
    const taskElem = target.closest('.taskColumn__card');
    taskElem.remove();
    SaveStateTable.save(this.container);
  }

  createTask(text) { // создает DOMэлемент задачи
    const task = document.createElement('div');
    task.className = 'taskColumn__card';
    const textElem = document.createElement('span');
    textElem.textContent = text;
    task.appendChild(textElem);
    return task;
  }
}
