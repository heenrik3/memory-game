const mainContainer = document.querySelector('.main')
const cardsContainer = document.querySelector('.cards')
const displayTurn = document.querySelector('.display__turn')
const displayTime = document.querySelector('.display__time')
const restartButton = document.querySelector('.restart__button')

cardsContainer.addEventListener('click', onCardClick)
restartButton.addEventListener('click', start)

// Animations take .5s to complete
const DEFAULT_DELAY = 500

// Amount of copies of one same card can be found
const COPIES_ALLOWED = 2

const ATTEMPTS_ALLOWED = 2

// Name from the images present in the assests folder
// Must be unique
const pictures = ['et', 'flame', 'heart', 'kiss', 'smile', 'teeth']

// Will contain the 'card' objects.
// {
//   name: 'et',
//   visible: true,
//   matched: false,
//
// }
const cards = []

// Each iteration to find a card match will be inserted here to a maximum of ATTEMPTS_ALLOWED
const attemps = []

// Runtime variables
const options = {
  allowClick: false,
  turn: 0,
  startTime: null,
  intervalId: null,
}

function Card(card, i) {
  const type = card.visible ? card.name : 'hidden'
  return `<li class="card" id="${i}"><picture class="card__picture"><img src="./src/assets/${type}.png" class="card__img" /></picture></li>`
}

function changeMainContainerColor(color) {
  mainContainer.classList.toggle(color)

  setTimeout(() => {
    mainContainer.classList.toggle(color)
  }, DEFAULT_DELAY)
}

function render() {
  cardsContainer.innerHTML = ''

  const markup = cards.map((item, i) => Card(item, i)).join('')

  cardsContainer.insertAdjacentHTML('afterbegin', markup)

  displayTurn.textContent = options.turn
}

function toggleCard(card) {
  card.visible = !card.visible
}

function resetToggledCards() {
  cards.forEach((card) => {
    if (card.visible && !card.matched) toggleCard(card)
  })
}

function matchFound(name) {
  cards.forEach((card) => {
    if (card.name === name) card.matched = true
  })
}

function makeMove(id) {
  const card = cards[id]
  if (!card) return

  // 1) Check if card is currently being shown
  if (card.visible) return

  // 2) Show currently hidden card
  toggleCard(card)
  render()

  // 3) Check if play attempt was the second attempt of turning a card
  attemps.push(card.name)

  if (attemps.length === ATTEMPTS_ALLOWED) {
    options.allowClick = false
    options.turn++

    // Player found the pair correctly
    const isMatch =
      attemps.filter((item) => item === card.name).length === COPIES_ALLOWED

    if (isMatch) {
      matchFound(card.name)

      render()
      changeMainContainerColor('positive')

      setTimeout(() => {
        options.allowClick = true
      }, DEFAULT_DELAY)
    }
    // A mismatch occurred
    else {
      changeMainContainerColor('negative')
      // Reset toggled cards after a small delay
      setTimeout(() => {
        resetToggledCards()

        render()
        options.allowClick = true
      }, DEFAULT_DELAY)
    }

    attemps.length = 0

    if (win()) stopTimer()
  }
}

function onCardClick(e) {
  if (!options.allowClick) return

  const card = e.target.closest('.card')
  if (!card) return

  const { id } = card

  makeMove(id)
}

function loadCards() {
  if (cards.length > 0) cards.length = 0

  // Will insert into cards array, the 'card' object.
  // this object will contain attributes name, visible and matched

  while (true) {
    // 1) Generate random index for each attempt to insert a picture
    const picturePos = Math.floor(Math.random() * pictures.length)

    // 2) Pick a random picture name from pictures
    const pic = pictures[picturePos]

    // 3) Check if there's less than allowed copies of this random picture already loaded
    const allowedInsert =
      cards.filter((card) => card.name === pic).length < COPIES_ALLOWED

    if (allowedInsert) {
      const card = { name: pic, visible: false, matched: false }

      cards.push(card)
    }

    // 4) Stops when a pair of each card is inserted into cards array
    if (cards.length === pictures.length * COPIES_ALLOWED) break
  }
}

function win() {
  return cards.every((card) => card.matched)
}

function timerRoutine() {
  const currentTime = Date.now()
  const elapsedTime = currentTime - options.startTime

  // Convert elapsed time to minutes and seconds
  let minutes = Math.floor(elapsedTime / 60000)
  let seconds = Math.floor((elapsedTime % 60000) / 1000)

  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`

  displayTime.textContent = formattedTime
}

function startTimer() {
  options.intervalId = setInterval(timerRoutine, 1000)
}

function stopTimer() {
  clearInterval(options.intervalId)
}

function resetOptions() {
  options.turn = 0
  options.allowClick = true
  options.startTime = Date.now()
}

function start() {
  resetOptions()

  loadCards()

  displayTurn.textContent = 0
  displayTime.textContent = '00:00'

  render()

  stopTimer()

  startTimer()
}

start()
