// QuizManager reads quiz data and keeps quiz lookup logic out of the scene.
export default class QuizManager {
  constructor(quizData = {}) {
    this.quizData = quizData;
  }

  getQuiz(quizId) {
    const quiz = this.quizData?.[quizId];

    if (!quiz) {
      console.warn(`QuizManager: missing quiz "${quizId}".`);
      return null;
    }

    return {
      quizId,
      title: quiz.title ?? 'Quiz',
      question: quiz.question ?? '',
      options: Array.isArray(quiz.options)
        ? quiz.options.map((option, index) => ({
            index,
            label: option.label ?? `Option ${index + 1}`,
            correct: Boolean(option.correct)
          }))
        : []
    };
  }
}
