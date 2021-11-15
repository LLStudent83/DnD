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
    // this.onMouseleave = this.onMouseleave.bind(this);
    this.onMousedown = this.onMousedown.bind(this);
    this.onMouseup = this.onMouseup.bind(this);
    this.onMousemove = this.onMousemove.bind(this);
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

  onClick(e) {
    if (e.target.classList.contains('taskColumn__futerAdd')) {
      this.showAddCard(e);
      return;
    }
    if (e.target.classList.contains('taskColumn__futerClose')) {
      this.closeAddCard(e);
      return;
    }
    if (e.target.classList.contains('taskColumn__futerNewCard')) {
      this.addCard(e);
      return;
    }
    if (e.target.classList.contains('taskColumn__cardClose')) {
      this.dellCard(e);
    }
  }

  onMousedown(evt) {
    document.addEventListener('mousemove', this.onMousemove);
    const { target } = evt;
    this.shiftX = evt.clientX - target.getBoundingClientRect().left;
    this.shiftY = evt.clientY - target.getBoundingClientRect().top;
    this.draggedEl = target;
    this.draggedEl.addEventListener('dragstart', (event) => {
      event.preventDefault();
    });
    // target.addEventListener('dragstart', (event) => event.preventDefault());
    if (!target.classList.contains('taskColumn__card')) return;
    this.width = evt.target.offsetWidth;
    this.height = evt.target.offsetHeight;
    target.classList.add('taskColumn__cardDragged');
    document.body.append(target);
    target.style.cursor = 'grabbing';
    target.style.left = `${evt.clientX - this.shiftX}px`;
    target.style.top = `${evt.clientY - this.shiftY}px`;
    target.style.width = `${this.width}px`;
    target.style.height = `${this.height}px`;
  }

  onMousemove(evt) {
    if (this.draggedEl === null
      || !this.draggedEl.classList.contains('taskColumn__card')) return;
    evt.preventDefault();
    this.draggedEl.style.left = `${evt.clientX - this.shiftX}px`;
    this.draggedEl.style.top = `${evt.clientY - this.shiftY}px`;
    const draggedElCentrY = evt.clientY - evt.offsetY + this.height / 2;
    const draggedElCentrX = evt.clientX - evt.offsetX + this.width / 2;
    this.draggedEl.hidden = true;
    const underCardEl = document.elementFromPoint(draggedElCentrX, draggedElCentrY);
    this.draggedEl.hidden = false;
    if (underCardEl.classList.contains('taskColumn__card')) { // taskColumn__cards
      const { top, bottom } = underCardEl.getBoundingClientRect();
      const underCardElCentrY = top + ((bottom - top) / 2);
      if (!this.findShadow(underCardEl)) { // если нет тени то
        this.createShadowCard();
        // eslint-disable-next-line no-unused-expressions
        if (this.container.querySelector('.shadowCard')) this.container.querySelector('.shadowCard').remove();
        // eslint-disable-next-line no-unused-expressions
        draggedElCentrY >= underCardElCentrY ? underCardEl.after(this.shadowCard) : underCardEl.before(this.shadowCard);
      } else { // если тень есть то
        const { right } = underCardEl.closest('.taskColumn__cards').getBoundingClientRect();
        if (draggedElCentrX > right) {
          this.shadowCard.remove();
        }
        if (draggedElCentrY < underCardElCentrY && this.findShadow(underCardEl) === 'down') {
          this.container.querySelector('.shadowCard').remove();
          underCardEl.before(this.shadowCard);
        }
        if (draggedElCentrY > underCardElCentrY && this.findShadow(underCardEl) === 'up') {
          this.container.querySelector('.shadowCard').remove();
          underCardEl.after(this.shadowCard);
        }
      }
    } else if (underCardEl.classList.contains('taskColumn') // если вставляем в колонку где нет карточек
    && !underCardEl.closest('.taskColumn').querySelector('.taskColumn__card')
    && !underCardEl.closest('.taskColumn').querySelector('.shadowCard')) {
      if (this.container.querySelector('.shadowCard')) this.container.querySelector('.shadowCard').remove();
      this.createShadowCard();
      underCardEl.closest('.taskColumn').querySelector('.taskColumn__cards').append(this.shadowCard);
    }
  }

  onMouseup(evt) {
    // eslint-disable-next-line no-shadow
    document.removeEventListener('mousemove', this.onMousemove);
    evt.target.classList.remove('taskColumn__cardDragged');
    this.container.querySelector('.shadowCard').replaceWith(this.draggedEl);
    this.draggedEl.style.left = '0px';
    this.draggedEl.style.top = '0px';
    this.draggedEl.style.cursor = 'pointer';
    this.draggedEl = null;
    SaveStateTable.save(this.container);
  }

  createShadowCard() {
    this.shadowCard = document.createElement('div');
    this.shadowCard.className = 'shadowCard';
    this.shadowCard.style.width = `${this.width}px`;
    this.shadowCard.style.height = `${this.height}px`;
  }

  // eslint-disable-next-line consistent-return
  findShadow(elem) { // ищет тень у элемента и говорит где она выше или ниже самого элемента
    const arr = [];
    arr[0] = elem.nextElementSibling;
    arr[1] = elem.previousElementSibling;
    const index = arr.findIndex((el) => {
      if (el === null) return;
      // eslint-disable-next-line consistent-return
      return el.classList.contains('shadowCard');
    });
    if (index === 0) return 'down';
    if (index === 1) return 'up';
    return null;
  }

  showAddCard(e) { // Показывает диалог добавления задачи
    const { target } = e;
    const futerEl = target.parentElement;
    if (futerEl === null) return;
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
    const futerEl = target.parentElement;
    if (futerEl === null) return;
    futerEl.innerHTML = '<a href="#" class="taskColumn__futerAdd">Добавить карточку</a>';
  }

  addCard(e) { // добавляет задачу в колонку
    const { target } = e;
    if (target.parentElement === null) return;
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
    textElem.className = 'taskColumn__cardText';
    textElem.textContent = text;
    task.appendChild(textElem);
    return task;
  }
}
