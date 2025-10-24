const questionSolvers = new Map();
const questionGenerators = new Map();

function convertTextToHtml(text) {
  /**
   * Convert special characters to HTML equivalents
   * JSON.parse already decoded \n to actual newlines, so we just need to convert to HTML
   *
   * @param {string} text - The text to convert
   * @returns {string} The text with special characters converted to HTML
   */
  if (typeof text !== "string") return text;
  console.log("Converting text:", text);
  return text.replace(/\n/g, "<br>").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
}

function preprocessQuestion(question) {
  /**
   * Preprocess a question to convert special characters in text fields
   *
   * @param {Object} question - The question object
   * @returns {Object} The preprocessed question
   */
  const processed = { ...question };

  // Convert question text
  if (processed.question) {
    processed.question = convertTextToHtml(processed.question);
  }

  // Convert options array
  if (Array.isArray(processed.options)) {
    processed.options = processed.options.map((opt) => convertTextToHtml(opt));
  }

  return processed;
}

function registerQuestionSolver(type, solverFunction) {
  questionSolvers.set(type, solverFunction);
}

function registerQuestionGenerator(type, generatorFunction) {
  questionGenerators.set(type, generatorFunction);
}

function getQuestionSolver(type) {
  return questionSolvers.get(type);
}

function getQuestionGenerator(type) {
  return questionGenerators.get(type);
}

function processQuestion(question) {
  const solver = getQuestionSolver(question["questionType"]);
  if (solver && typeof solver === "function") {
    return solver(question);
  } else {
    console.error(
      `No solver found for question type: ${question["questionType"]}`,
    );
    return 0;
  }
}

function generateQuestion(question, questionNumber) {
  const generator = getQuestionGenerator(question["questionType"]);
  if (generator && typeof generator === "function") {
    // Preprocess the question to handle special characters
    const processedQuestion = preprocessQuestion(question);
    return generator(processedQuestion, questionNumber);
  } else {
    console.error(
      `No generator found for question type: ${question["questionType"]}`,
    );
    return `<div class="error">Unknown question type: ${question["questionType"]}</div>`;
  }
}

// Export functions
window.questionRegistry = {
  // Solver methods
  registerSolver: registerQuestionSolver,
  getSolver: getQuestionSolver,
  process: processQuestion,

  // Generator methods
  registerGenerator: registerQuestionGenerator,
  getGenerator: getQuestionGenerator,
  generate: generateQuestion,
};
