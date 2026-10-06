// Card data and storage. No page code here, so this file can be tested on its own.

const STORAGE_KEY = "studyCards.cards";

/** Returns an error message if the card is incomplete, or null if it can be saved. */
function validateCard(course, front, back) {
  if (course.trim() === "") return "Please enter a course.";
  if (front.trim() === "") return "Please enter the front of the card.";
  if (back.trim() === "") return "Please enter the back of the card.";
  return null;
}

function createCard(course, front, back) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    course: course.trim(),
    front: front.trim(),
    back: back.trim(),
    createdAt: new Date().toISOString(),
  };
}

/** Loads saved cards. Returns an empty list if nothing is saved or the data is unreadable. */
function loadCards(storage) {
  const saved = storage.getItem(STORAGE_KEY);
  if (saved === null) return [];
  try {
    const cards = JSON.parse(saved);
    return Array.isArray(cards) ? cards : [];
  } catch {
    return [];
  }
}

function saveCards(storage, cards) {
  storage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

/** Course names in alphabetical order, without duplicates. */
function listCourses(cards) {
  return [...new Set(cards.map((card) => card.course))].sort();
}
