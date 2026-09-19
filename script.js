const BACKEND_URL =
  "https://eduagent-ai-osvz.onrender.com/ask";

const SESSION_KEY = "eduagent_session_id";

function getSessionId() {
    let sessionId = localStorage.getItem(SESSION_KEY);

    if (!sessionId) {
        sessionId =
            (crypto.randomUUID)
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2)}`;

        localStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
}


/* =========================
   DOM ELEMENTS
========================= */

const chatForm = null;

const questionInput =
    document.getElementById("questionInput");

const answerBox =
    document.getElementById("answerBox");

const responseSection =
    document.getElementById("responseSection");

const toolChain =
    document.getElementById("tool-chain");

const sourcePanel =
    document.getElementById("source-panel");

const workflowNodes =
    document.querySelectorAll(".node");


/* =========================
   WORKFLOW
========================= */

function resetWorkflow() {
    workflowNodes.forEach(node => {
        node.classList.remove(
            "active",
            "completed",
            "error"
        );
    });
}


function activateWorkflow(index) {
    workflowNodes.forEach((node, i) => {
        node.classList.remove("active", "completed");

        if (i < index) {
            node.classList.add("completed");
        }

        if (i === index) {
            node.classList.add("active");
        }
    });
}


function completeWorkflow() {
    workflowNodes.forEach(node => {
        node.classList.remove("active");
        node.classList.add("completed");
    });
}


/* =========================
   TOOL CHAIN
========================= */

function showToolChain(tools) {

    if (!toolChain) return;

    toolChain.innerHTML = "";

    if (!tools || tools.length === 0) {
        toolChain.innerHTML = `
            <div class="tool-empty">
                No tools used
            </div>
        `;
        return;
    }

    tools.forEach(item => {

        const tool = item.tool || "unknown";

        let displayName = tool;

        if (tool === "calculator") {
            displayName = "Calculator";
        }

        else if (tool === "web_search") {
            displayName = "Web Search";
        }

        else if (tool === "quiz_generator") {
            displayName = "Quiz Generator";
        }

        else if (tool === "study_plan_generator") {
            displayName = "Study Plan Generator";
        }

        else if (tool === "weak_topic_detector") {
            displayName = "Weak Topic Detector";
        }

        else if (tool === "quiz_result_analyzer") {
            displayName = "Quiz Result Analyzer";
        }

        const toolItem = document.createElement("div");

        toolItem.className = "tool-item";

        toolItem.innerHTML = `
            <span class="tool-icon">⚙️</span>
            <span>${displayName}</span>
        `;

        toolChain.appendChild(toolItem);
    });
}


/* =========================
   SOURCES
========================= */

function showSources(sources) {

    if (!sourcePanel) return;

    sourcePanel.innerHTML = "";

    if (!sources || sources.length === 0) {
        sourcePanel.innerHTML = `
            <div class="source-empty">
                No external sources used.
            </div>
        `;
        return;
    }

    const title = document.createElement("h3");

    title.textContent = "Sources";

    sourcePanel.appendChild(title);

    sources.forEach(source => {

        const sourceItem = document.createElement("div");

        sourceItem.className = "source-item";

        sourceItem.innerHTML = `
            <a
                href="${source.url || "#"}"
                target="_blank"
                rel="noopener noreferrer"
            >
                ${source.title || "Source"}
            </a>

            <p>
                ${source.content || ""}
            </p>
        `;

        sourcePanel.appendChild(sourceItem);
    });
}


/* =========================
   ASK AGENT
========================= */

async function askAgent(question) {

    question =
        question ||
        questionInput.value.trim();

    if (!question) return;

    if (responseSection) {
        responseSection.style.display = "block";
    }

    resetWorkflow();

    

    activateWorkflow(0);

    answerBox.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Agent is thinking...</p>
        </div>
    `;

    if (sourcePanel) {
        sourcePanel.innerHTML = "";
    }

    try {

        activateWorkflow(1);

        const response = await fetch(BACKEND_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question,
                session_id: getSessionId()
            })
        });


        if (!response.ok) {
            throw new Error(
                `Backend error: ${response.status}`
            );
        }


        activateWorkflow(2);


        const data = await response.json();


        activateWorkflow(3);


        /*
         * Remove router/final-response
         * from visible tool chain.
         */
        const actualTools =
            Array.isArray(data.tool_trace)
                ? data.tool_trace.filter(
                    item =>
                        item.tool !== "education_router" &&
                        item.tool !== "final_response"
                )
                : [];


        showToolChain(actualTools);

        showSources(data.sources || []);


        /*
         * Quiz JSON gets rendered as
         * interactive quiz.
         *
         * Normal answers continue to
         * use formatAnswer().
         */
        answerBox.innerHTML = `
            <div class="answer-content">
                ${renderQuiz(data.answer) || formatAnswer(data.answer)}
            </div>
        `;


        completeWorkflow();


    } catch (error) {

        console.error(error);

        workflowNodes.forEach(node => {
            node.classList.remove(
                "active",
                "completed"
            );

            node.classList.add("error");
        });


        answerBox.innerHTML = `
            <div class="error-message">
                <strong>Something went wrong.</strong>
                <p>${error.message}</p>
            </div>
        `;
    }
}


/* =========================
   FORM SUBMIT
========================= */

if (chatForm) {

    chatForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const question =
                questionInput.value.trim();

            if (!question) return;

            await askAgent(question);
        }
    );
}


/* =========================
   ENTER KEY
========================= */

if (questionInput) {

    questionInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                if (chatForm) {
                    chatForm.requestSubmit();
                }
            }
        }
    );
}


/* =========================
   FORMAT NORMAL ANSWER
========================= */

function formatAnswer(text) {

    if (!text) {
        return "";
    }

    let formatted = String(text);


    /* Escape HTML first */

    formatted = formatted
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");


    /* Markdown headings */

    formatted = formatted.replace(
        /^### (.*)$/gm,
        "<h3>$1</h3>"
    );

    formatted = formatted.replace(
        /^## (.*)$/gm,
        "<h2>$1</h2>"
    );

    formatted = formatted.replace(
        /^# (.*)$/gm,
        "<h1>$1</h1>"
    );


    /* Bold */

    formatted = formatted.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );


    /* Italic */

    formatted = formatted.replace(
        /\*(.*?)\*/g,
        "<em>$1</em>"
    );


    /* Links */

    formatted = formatted.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );


    /* Numbered lists */

    formatted = formatted.replace(
        /(?:^|\n)(\d+)\.\s+(.*)/g,
        '<div class="numbered-item"><span>$1.</span> $2</div>'
    );


    /* Bullet lists */

    formatted = formatted.replace(
        /(?:^|\n)[-*]\s+(.*)/g,
        '<div class="bullet-item">• $1</div>'
    );


    /* Tables */

    formatted = formatted.replace(
        /\|(.+)\|/g,
        function(match) {

            const cells = match
                .split("|")
                .slice(1, -1)
                .map(cell => cell.trim());

            if (cells.length === 0) {
                return match;
            }

            return `
                <div class="table-row">
                    ${cells
                        .map(cell => `<div>${cell}</div>`)
                        .join("")}
                </div>
            `;
        }
    );


    /* Line breaks */

    formatted = formatted.replace(
        /\n/g,
        "<br>"
    );


    return formatted;
}


/* =====================================================
   INTERACTIVE QUIZ
===================================================== */

function renderQuiz(answer) {

    if (!answer) {
        return "";
    }


    let quiz;


    /*
     * Backend currently returns quiz
     * JSON as a string.
     */
    try {

        quiz =
            typeof answer === "string"
                ? JSON.parse(answer)
                : answer;

    } catch (error) {

        /*
         * Not quiz JSON.
         */
        return "";
    }


    /*
     * Validate quiz structure.
     */

    if (
        !quiz ||
        !Array.isArray(quiz.questions) ||
        quiz.questions.length === 0
    ) {
        return "";
    }


    const quizId =
        `quiz-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}`;


    /*
     * Initialize after HTML has
     * been inserted into DOM.
     */
    setTimeout(() => {

        const quizElement =
            document.getElementById(quizId);

        if (!quizElement) return;

        initializeQuiz(
            quizElement,
            quiz.questions,
            quiz
        );

    }, 0);


    /*
     * Return initial quiz container.
     */

    return `
        <div
            id="${quizId}"
            class="interactive-quiz"
        >
            <div class="quiz-loading">
                Loading quiz...
            </div>
        </div>
    `;
}


/* =====================================================
   QUIZ ENGINE
===================================================== */

function initializeQuiz(
    quizElement,
    questions,
    quiz
) {

    let currentQuestion = 0;

    let score = 0;


    /*
     * Load question.
     */

    function loadQuestion() {

        const question =
            questions[currentQuestion];


        if (!question) {
            showQuizResult();
            return;
        }


        quizElement.innerHTML = `
            <div class="quiz-header">

                <div class="quiz-title">
                    ${escapeHTML(
                        quiz.topic ||
                        quiz.subject ||
                        "Interactive Quiz"
                    )}
                </div>

                <div class="quiz-progress">
                    Question
                    ${currentQuestion + 1}
                    of
                    ${questions.length}
                </div>

            </div>


            <div class="quiz-question">

                <h3>
                    ${escapeHTML(
                        question.question || ""
                    )}
                </h3>


                <div class="quiz-options">

                    ${createQuizOptions(question)}

                </div>


                <div
                    class="quiz-feedback"
                    id="quiz-feedback"
                ></div>


                <button
                    class="quiz-next"
                    id="quiz-next"
                    disabled
                >
                    ${currentQuestion === questions.length - 1
                        ? "Finish Quiz"
                        : "Next Question"}
                </button>

            </div>
        `;


        const optionButtons =
            quizElement.querySelectorAll(
                ".quiz-option"
            );


        const nextButton =
            quizElement.querySelector(
                "#quiz-next"
            );


        optionButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    /*
                     * Prevent changing answer
                     * after selection.
                     */
                    if (
                        button.disabled
                    ) {
                        return;
                    }


                    const selected =
                        button.dataset.option;


                    handleAnswer(
                        question,
                        selected,
                        optionButtons,
                        nextButton
                    );
                }
            );
        });


        nextButton.addEventListener(
            "click",
            () => {

                currentQuestion++;

                if (
                    currentQuestion >=
                    questions.length
                ) {

                    showQuizResult();

                } else {

                    loadQuestion();
                }
            }
        );
    }


    /*
     * Handle selected answer.
     */

    function handleAnswer(
        question,
        selected,
        optionButtons,
        nextButton
    ) {

        const correct =
            String(
                question.correct_answer || ""
            ).trim().toUpperCase();


        const selectedValue =
            String(selected)
                .trim()
                .toUpperCase();


        const feedback =
            quizElement.querySelector(
                "#quiz-feedback"
            );


        optionButtons.forEach(button => {

            button.disabled = true;

            const option =
                button.dataset.option
                    .trim()
                    .toUpperCase();


            if (option === correct) {

                button.classList.add(
                    "correct"
                );
            }


            if (
                option === selectedValue &&
                selectedValue !== correct
            ) {

                button.classList.add(
                    "wrong"
                );
            }
        });


        if (
            selectedValue === correct
        ) {

            score++;

            feedback.innerHTML = `
                <div class="quiz-correct">
                    ✓ Correct!
                    <p>
                        ${escapeHTML(
                            question.explanation ||
                            "Good job!"
                        )}
                    </p>
                </div>
            `;

        } else {

            const correctText =
                question.options &&
                question.options[correct]
                    ? question.options[correct]
                    : correct;


            feedback.innerHTML = `
                <div class="quiz-wrong">
                    ✗ Not quite.

                    <p>
                        Correct answer:
                        <strong>
                            ${escapeHTML(
                                correct
                            )}
                        </strong>
                        —
                        ${escapeHTML(
                            correctText
                        )}
                    </p>

                    <p>
                        ${escapeHTML(
                            question.explanation ||
                            ""
                        )}
                    </p>
                </div>
            `;
        }


        nextButton.disabled = false;
    }


    /*
     * Final result.
     */

    function showQuizResult() {

        const total =
            questions.length;


        const percentage =
            total > 0
                ? Math.round(
                    (score / total) * 100
                )
                : 0;


        let message;


        if (percentage >= 80) {

            message =
                "Excellent work!";

        } else if (percentage >= 60) {

            message =
                "Good job! Keep practicing.";

        } else {

            message =
                "Keep practicing and try again.";
        }


        quizElement.innerHTML = `
            <div class="quiz-result">

                <div class="quiz-result-icon">
                    🎯
                </div>

                <h2>
                    Quiz Complete
                </h2>

                <div class="quiz-score">
                    ${score} / ${total}
                </div>

                <div class="quiz-percentage">
                    ${percentage}%
                </div>

                <p>
                    ${message}
                </p>

                <button
                    class="quiz-restart"
                    id="quiz-restart"
                >
                    Try Again
                </button>

            </div>
        `;


        const restartButton =
            quizElement.querySelector(
                "#quiz-restart"
            );


        restartButton.addEventListener(
            "click",
            () => {

                /*
                 * Reinitialize the same quiz.
                 */
                initializeQuiz(
                    quizElement,
                    questions,
                    quiz
                );
            }
        );
    }


    /*
     * Start first question.
     */

    loadQuestion();
}


/* =====================================================
   QUIZ OPTIONS HTML
===================================================== */

function createQuizOptions(question) {

    if (
        !question ||
        !question.options
    ) {
        return "";
    }


    const optionEntries =
        Object.entries(
            question.options
        );


    return optionEntries
        .map(([key, value]) => {

            return `
                <button
                    type="button"
                    class="quiz-option"
                    data-option="${escapeHTML(key)}"
                >

                    <span class="quiz-option-key">
                        ${escapeHTML(key)}
                    </span>

                    <span class="quiz-option-text">
                        ${escapeHTML(value)}
                    </span>

                </button>
            `;

        })
        .join("");
}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

  

  


   

  


  
