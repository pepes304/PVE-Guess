import { showMessage } from './utils.js';

const WORDS = [
  'СЛОВО', 'ДУМКА', 'КНИГА', 'МРІЯ', 'ЗЕМЛЯ', 'ВОГОНЬ', 'ВІТЕР', 'СОНЦЕ',
  'МІСЯЦЬ', 'ЗІРКА', 'НЕБО', 'МОРЕ', 'ЛІСИ', 'ПОЛЕ', 'РІЧКА', 'ГОРА',
  'ПТАХ', 'КВІТКА', 'ДЕРЕВО', 'ТРАВА', 'КРАСА', 'ЛЮБОВ', 'МАМА', 'ТАТО',
  'СЕРЦЕ', 'ДУША', 'ПІСНЯ', 'ТАНОК', 'СВІТ', 'ДЕНЬ', 'НІЧЧЮ', 'РАНОК',
  'ВЕЧІР', 'ЖИТТЯ', 'ЩАСТЯ', 'ДОЛЯ', 'ВОЛЯ', 'СИЛА', 'ВЛАДА', 'ЧЕСТЬ',
  'СЛАВА', 'ГЕРОЙ', 'НАРОД', 'МІСТО', 'СЕЛО', 'ХАТА', 'ДВІР', 'ШЛЯХ',
  'ДРУГ', 'ВОРОГ', 'БИТВА', 'ПЕРЕМОГА', 'МОВА', 'КАЗКА', 'ЛЕГЕНДА',
  'ВОДА', 'ХЛІБ', 'СІЛЬ', 'ЦУКОР', 'МОЛОКО', 'МАСЛО', 'СМЕТАНА',
  'БОРЩ', 'ВАРЕНИКИ', 'КАША', 'СМАК', 'ЗАПАХ', 'КОЛІР', 'ЗВУК',
].filter(w => w.length === 5);

const KEYBOARD_ROWS = [
  ['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х', 'Ї'],
  ['Ф', 'І', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Є', '⌫'],
  ['\'', 'Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю', 'Ґ', '↵']
];

let targetWord = '';
let currentRow = 0;
let currentCol = 0;
let currentGuess = '';
let gameOver = false;
let letterStates = {};

const grid = document.getElementById('grid');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');
const newGameBtn = document.getElementById('newGame');

function init() {
  targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  currentRow = 0;
  currentCol = 0;
  currentGuess = '';
  gameOver = false;
  letterStates = {};
  message.textContent = '';
  newGameBtn.classList.add('hidden');
  createGrid();
  createKeyboard();
  console.log('Слово:', targetWord);
}

function createGrid() {
  grid.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const row = document.createElement('div');
    row.className = 'flex gap-0.5 sm:gap-1 md:gap-1.5 justify-center';
    for (let j = 0; j < 5; j++) {
      const cell = document.createElement('div');
      cell.className = 'game-cell border-2 border-gray-600 flex items-center justify-center font-bold text-white uppercase';
      cell.id = `cell-${i}-${j}`;
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

function createKeyboard() {
  keyboard.innerHTML = '';
  KEYBOARD_ROWS.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'flex gap-0.5 sm:gap-1 justify-center';
    row.forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'game-keyboard-btn bg-gray-500 text-white rounded font-semibold hover:bg-gray-400 transition';
      btn.textContent = key;
      btn.id = `key-${key}`;
      btn.addEventListener('click', () => handleKeyPress(key));
      rowDiv.appendChild(btn);
    });
    keyboard.appendChild(rowDiv);
  });
}

function handleKeyPress(key) {
  if (gameOver) return;

  if (key === '⌫') {
    if (currentCol > 0) {
      currentCol--;
      currentGuess = currentGuess.slice(0, -1);
      const cell = document.getElementById(`cell-${currentRow}-${currentCol}`);
      cell.textContent = '';
      cell.classList.remove('border-gray-400');
      cell.classList.add('border-gray-600');
    }
  } else if (key === '↵') {
    submitGuess();
  } else if (currentCol < 5) {
    const cell = document.getElementById(`cell-${currentRow}-${currentCol}`);
    cell.textContent = key;
    cell.classList.remove('border-gray-600');
    cell.classList.add('border-gray-400');
    cell.classList.add('bounce');
    setTimeout(() => cell.classList.remove('bounce'), 300);
    currentGuess += key;
    currentCol++;
  }
}

function submitGuess() {
  if (currentGuess.length !== 5) {
    showMessage('Введіть 5 літер!');
    shakeRow();
    return;
  }

  const guess = currentGuess.toUpperCase();
  const target = targetWord.toUpperCase();
  const result = checkGuess(guess, target);
  revealRow(result);
}

function checkGuess(guess, target) {
  const result = Array(5).fill('absent');
  const targetLetters = target.split('');
  const guessLetters = guess.split('');
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = 'correct';
      targetLetters[i] = null;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'correct') continue;
    const idx = targetLetters.indexOf(guessLetters[i]);
    if (idx !== -1) {
      result[i] = 'present';
      targetLetters[idx] = null;
    }
  }
  return result;
}

function revealRow(result) {
  const guess = currentGuess.toUpperCase();
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const cell = document.getElementById(`cell-${currentRow}-${i}`);
      cell.classList.add('flip');
      setTimeout(() => {
        cell.classList.remove('border-gray-400', 'border-gray-600');
        if (result[i] === 'correct') {
          cell.classList.add('bg-green-600', 'border-green-600');
        } else if (result[i] === 'present') {
          cell.classList.add('bg-yellow-500', 'border-yellow-500');
        } else {
          cell.classList.add('bg-gray-700', 'border-gray-700');
        }
        updateKeyboard(guess[i], result[i]);
      }, 250);
    }, i * 300);
  }

  setTimeout(() => {
    if (guess === targetWord.toUpperCase()) {
      showMessage('🎉 Вітаю! Ви вгадали!');
      gameOver = true;
      newGameBtn.classList.remove('hidden');
    } else if (currentRow === 5) {
      showMessage(`Слово було: ${targetWord}`);
      gameOver = true;
      newGameBtn.classList.remove('hidden');
    } else {
      currentRow++;
      currentCol = 0;
      currentGuess = '';
    }
  }, 5 * 300 + 300);
}

function updateKeyboard(letter, state) {
  const key = document.getElementById(`key-${letter}`);
  if (!key) return;
  const currentState = letterStates[letter];
  if (currentState === 'correct') return;
  if (currentState === 'present' && state !== 'correct') return;
  letterStates[letter] = state;
  key.classList.remove('bg-gray-500', 'bg-green-600', 'bg-yellow-500', 'bg-gray-700');
  if (state === 'correct') {
    key.classList.add('bg-green-600');
  } else if (state === 'present') {
    key.classList.add('bg-yellow-500');
  } else {
    key.classList.add('bg-gray-700');
  }
}

function shakeRow() {
  const row = grid.children[currentRow];
  row.classList.add('shake');
  setTimeout(() => row.classList.remove('shake'), 500);
}

document.addEventListener('keydown', (e) => {
  if (gameOver) return;
  const key = e.key.toUpperCase();
  if (key === 'BACKSPACE') {
    handleKeyPress('⌫');
  } else if (key === 'ENTER') {
    handleKeyPress('↵');
  } else if (/^[А-ЯІЇЄҐЬ']$/i.test(key)) {
    handleKeyPress(key);
  }
});

newGameBtn.addEventListener('click', init);

init();
