// Page behavior: switching screens, the add-card form, and the review flow.

let cards = [];
let storageWorks = true;
let reviewQueue = [];
let reviewIndex = 0;

function byId(id) {
  return document.getElementById(id);
}

function persist() {
  if (!storageWorks) return;
  try {
    saveCards(localStorage, cards);
  } catch {
    storageWorks = false;
    byId("storage-error").hidden = false;
  }
}

function showScreen(screenId) {
  for (const screen of document.querySelectorAll(".screen")) {
    screen.hidden = screen.id !== screenId;
  }
  for (const tab of document.querySelectorAll(".tab")) {
    tab.setAttribute("aria-pressed", String(tab.dataset.screen === screenId));
  }
  if (screenId === "review-screen") startReview();
}

// ---- Add cards screen ----

function renderCardList() {
  const list = byId("card-list");
  list.replaceChildren();
  for (const card of [...cards].reverse()) {
    const item = document.createElement("li");
    const course = document.createElement("span");
    course.className = "card-list-course";
    course.textContent = card.course;
    const front = document.createElement("span");
    front.textContent = card.front;
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "link-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete card: ${card.front}`);
    deleteButton.addEventListener("click", () => deleteCard(card));
    item.append(course, front, deleteButton);
    list.append(item);
  }
  byId("card-list-empty").hidden = cards.length > 0;
  byId("card-count").textContent = cards.length > 0 ? `(${cards.length})` : "";

  const options = byId("course-options");
  options.replaceChildren(
    ...listCourses(cards).map((name) => {
      const option = document.createElement("option");
      option.value = name;
      return option;
    }),
  );
}

function deleteCard(card) {
  if (!confirm(`Delete this card?\n\n${card.front}`)) return;
  cards = cards.filter((other) => other.id !== card.id);
  persist();
  renderCardList();
}

function handleAddCard(event) {
  event.preventDefault();
  const courseInput = byId("course-input");
  const frontInput = byId("front-input");
  const backInput = byId("back-input");
  byId("form-success").textContent = "";

  const error = validateCard(courseInput.value, frontInput.value, backInput.value);
  byId("form-error").textContent = error ?? "";
  if (error) return;

  cards.push(createCard(courseInput.value, frontInput.value, backInput.value));
  persist();
  renderCardList();

  // Keep the course filled in, since you usually add several cards for one class.
  frontInput.value = "";
  backInput.value = "";
  frontInput.focus();
  byId("form-success").textContent = "Card saved.";
}

// ---- Review screen ----

function startReview() {
  reviewQueue = [...cards];
  reviewIndex = 0;
  renderReview();
}

function renderReview() {
  const hasCards = reviewQueue.length > 0;
  const finished = hasCards && reviewIndex >= reviewQueue.length;
  byId("review-empty").hidden = hasCards;
  byId("review-done").hidden = !finished;
  byId("review-active").hidden = !hasCards || finished;
  if (!hasCards || finished) return;

  const card = reviewQueue[reviewIndex];
  byId("review-progress").textContent = `Card ${reviewIndex + 1} of ${reviewQueue.length}`;
  byId("review-course").textContent = card.course;
  byId("review-front").textContent = card.front;
  byId("review-back").textContent = card.back;
  byId("review-back-wrap").hidden = true;
  byId("show-answer").hidden = false;
  byId("next-card").hidden = true;
  byId("show-answer").focus();
}

function showAnswer() {
  byId("review-back-wrap").hidden = false;
  byId("show-answer").hidden = true;
  byId("next-card").hidden = false;
  byId("next-card").focus();
}

function nextCard() {
  reviewIndex += 1;
  renderReview();
}

// ---- Startup ----

try {
  cards = loadCards(localStorage);
} catch {
  storageWorks = false;
  byId("storage-error").hidden = false;
}

for (const button of document.querySelectorAll("[data-screen], [data-go]")) {
  button.addEventListener("click", () => showScreen(button.dataset.screen ?? button.dataset.go));
}
byId("add-card-form").addEventListener("submit", handleAddCard);
byId("show-answer").addEventListener("click", showAnswer);
byId("next-card").addEventListener("click", nextCard);
byId("review-again").addEventListener("click", startReview);

renderCardList();
