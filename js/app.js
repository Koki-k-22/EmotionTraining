import { loadAppData } from "./data.js";
import { createPracticeSession, renderPracticeSession } from "./views/practice.js";
import { renderHome } from "./views/home.js";
import { renderReview } from "./views/review.js";
import { renderDictionary } from "./views/dictionary.js";
import { renderStats } from "./views/stats.js";

const ROUTES = new Set(["home", "practice", "review", "dictionary", "stats"]);

const state = {
  route: getRoute(),
  questions: [],
  lexicon: null,
  practiceSession: null,
  reviewSession: null,
  error: null,
};

function getRoute() {
  const route = location.hash.replace(/^#\/?/, "") || "home";
  return ROUTES.has(route) ? route : "home";
}

function navigate(route) {
  location.hash = route;
}

function setRoute(route) {
  state.route = route;
  render();
}

function setPracticeSession(session) {
  state.practiceSession = session;
  render();
}

function setReviewSession(session) {
  state.reviewSession = session;
  render();
}

function finishSession() {
  state.practiceSession = null;
  state.reviewSession = null;
  navigate("home");
  render();
}

function startPractice() {
  state.practiceSession = createPracticeSession(state.questions);
  navigate("practice");
  render();
}

function renderLoading() {
  const section = document.createElement("section");
  section.className = "screen stack";
  section.innerHTML = "<h1>読み込み中</h1><p class=\"hint\">問題データを準備しています。</p>";
  return section;
}

function renderError(message) {
  const section = document.createElement("section");
  section.className = "screen stack";
  section.innerHTML = `<h1>読み込みに失敗しました</h1><p class="hint">${message}</p>`;
  return section;
}

function renderView() {
  if (state.error) return renderError(state.error);
  if (!state.questions.length || !state.lexicon) return renderLoading();

  if (state.route === "practice") {
    if (!state.practiceSession) {
      state.practiceSession = createPracticeSession(state.questions);
    }
    return renderPracticeSession({
      questions: state.questions,
      session: state.practiceSession,
      onUpdate: setPracticeSession,
      onFinish: finishSession,
    });
  }

  if (state.route === "review") {
    return renderReview({
      questions: state.questions,
      session: state.reviewSession,
      onUpdate: setReviewSession,
      onFinish: finishSession,
    });
  }

  if (state.route === "dictionary") {
    return renderDictionary({ lexicon: state.lexicon });
  }

  if (state.route === "stats") {
    return renderStats({ questions: state.questions });
  }

  return renderHome({
    questions: state.questions,
    onStartPractice: startPractice,
    navigate,
  });
}

function renderNav() {
  for (const link of document.querySelectorAll("[data-route]")) {
    const active = link.dataset.route === state.route;
    link.toggleAttribute("aria-current", active);
  }
}

function render() {
  const app = document.querySelector("#app");
  app.replaceChildren(renderView());
  renderNav();
}

window.addEventListener("hashchange", () => setRoute(getRoute()));

document.querySelectorAll("[data-route]").forEach((link) => {
  link.addEventListener("click", () => {
    if (link.dataset.route !== "review") {
      state.reviewSession = null;
    }
  });
});

loadAppData()
  .then(({ questions, lexicon }) => {
    state.questions = questions;
    state.lexicon = lexicon;
    render();
  })
  .catch((error) => {
    state.error = error.message;
    render();
  });

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

render();
