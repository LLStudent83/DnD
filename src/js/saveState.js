export default class SaveStateTable {
  static save(contaner) {
    const string = contaner.innerHTML;
    localStorage.setItem('state', string);
  }

  static load(state) {
    if (state === null) return;
    document.querySelector('.board').innerHTML = state;
  }
}

// export default class GameState {
//     static from(object) {
//       if (object === null) return;
//       this.level = object.level;
//       this.step = object.step; // чей ход игрока user или компьютера PC
//       this.charPl = object.charPl;
//       this.charPC = object.charPC;
//       this.state = object.state; // при состоянии activ считается что игра в процессе. если new то нужно начать заново
//       this.scores = object.scores;
//       this.maxLevel = object.maxLevel; // максимальный уровень игрока при создании команды
//       localStorage.setItem('state', JSON.stringify(object));
//       return null;
//     }
//   }

// export default class GameStateService {
//     constructor(storage) {
//       this.storage = storage;
//     }

//     save(state) {
//       this.storage.setItem('state', JSON.stringify(state));
//     }

//     saveGame(state) {
//       this.storage.setItem('stateGame', JSON.stringify(state));
//     }

//     loadGame() {
//       try {
//         return JSON.parse(this.storage.getItem('stateGame'));
//       } catch (e) {
//         throw new Error('Invalid state');
//       }
//     }

//     load() {
//       try {
//         return JSON.parse(this.storage.getItem('state'));
//       } catch (e) {
//         throw new Error('Invalid state');
//       }
//     }
//   }
