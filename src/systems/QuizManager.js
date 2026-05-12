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

    // Support both single question (legacy) and multi-question formats.
    const questions = Array.isArray(quiz.questions) 
      ? quiz.questions 
      : [{ question: quiz.question, options: quiz.options }];

    return {
      quizId,
      title: quiz.title ?? 'Quiz',
      questions: questions.map((q) => {
        const question = q.prompt ?? q.question ?? '';
        let options = [];

        if (Array.isArray(q.options)) {
          options = q.options.map((option, index) => {
            if (typeof option === 'string') {
              return {
                index,
                label: option,
                correct: index === (q.correctIndex ?? 0)
              };
            }
            return {
              index,
              label: option.label ?? `Option ${index + 1}`,
              correct: Boolean(option.correct)
            };
          });
        }

        return { question, options };
      })
    };
  }
}
