const BACKEND_URL =
    "https://eduagent-ai-osvz.onrender.com/ask";

const SESSION_KEY =
    "eduagent_session_id";


/* =====================================================
   SESSION
===================================================== */

function getSessionId() {

    let sessionId =
        localStorage.getItem(SESSION_KEY);

    if (!sessionId) {

        sessionId =
            crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2)}`;

        localStorage.setItem(
            SESSION_KEY,
            sessionId
        );
    }

    return sessionId;
}


/* =====================================================
   DOM
===================================================== */

const questionInput =
    document.getElementById(
        "questionInput"
    );

const answerBox =
    document.getElementById(
        "answerBox"
    );

const responseSection =
    document.getElementById(
        "responseSection"
    );

const sourcesSection =
    document.getElementById(
        "sourcesSection"
    );

const sourcesBox =
    document.getElementById(
        "sourcesBox"
    );

const askButton =
    document.getElementById(
        "askButton"
    );


const workflow = {

    user: {
        node:
            document.getElementById(
                "userNode"
            ),
        status:
            document.getElementById(
                "userStatus"
            )
    },

    planner: {
        node:
            document.getElementById(
                "routerNode"
            ),
        status:
            document.getElementById(
                "routerStatus"
            )
    },

    tool: {
        node:
            document.getElementById(
                "toolNode"
            ),
        status:
            document.getElementById(
                "toolStatus"
            )
    },

    validation: {
        node:
            document.getElementById(
                "validationNode"
            ),
        status:
            document.getElementById(
                "validationStatus"
            )
    },

    response: {
        node:
            document.getElementById(
                "responseNode"
            ),
        status:
            document.getElementById(
                "responseStatus"
            )
    }
};


/* =====================================================
   DEMO PROMPT
===================================================== */

function useDemoPrompt(question) {

    if (!questionInput) {
        return;
    }

    questionInput.value =
        question;

    questionInput.focus();

    /*
     * Small delay makes the demo feel
     * natural while recording.
     */
    setTimeout(() => {

        askAgent(question);

    }, 150);
}


/* =====================================================
   WORKFLOW HELPERS
===================================================== */

function resetWorkflow() {

    Object.values(workflow)
        .forEach(item => {

            if (!item.node) {
                return;
            }

            item.node.classList.remove(
                "active",
                "success",
                "error"
            );

            if (item.status) {
                item.status.textContent =
                    "Waiting";
            }
        });
}


function setWorkflowState(
    key,
    state,
    text
) {

    const item =
        workflow[key];

    if (!item || !item.node) {
        return;
    }

    item.node.classList.remove(
        "active",
        "success",
        "error"
    );

    item.node.classList.add(
        state
    );

    if (item.status) {
        item.status.textContent =
            text;
    }
}


function activateWorkflowStep(
    key,
    text = "Processing..."
) {

    setWorkflowState(
        key,
        "active",
        text
    );
}


function completeWorkflowStep(
    key,
    text = "Completed"
) {

    setWorkflowState(
        key,
        "success",
        text
    );
}


function errorWorkflowStep(
    key,
    text = "Failed"
) {

    setWorkflowState(
        key,
        "error",
        text
    );
}


/* =====================================================
   TOOL NAME
===================================================== */

function getToolDisplayName(tool) {

    const names = {

        calculator:
            "Calculator",

        calculator_retry:
            "Calculator Recovery",

        web_search:
            "Web Search",

        web_search_retry:
            "Web Search Recovery",

        quiz_generator:
            "Quiz Generator",

        study_plan_generator:
            "Study Plan Generator",

        study_plan_retry:
            "Study Plan Recovery",

        weak_topic_detector:
            "Weak Topic Detector",

        quiz_result_analyzer:
            "Quiz Result Analyzer",

        education_router:
            "Education Router",

        agent_planner:
            "Agent Planner",

        agent_validator:
            "Result Validator",

        agent_validator_retry:
            "Validation Retry",

        result_validator:
            "Result Validator",

        result_validator_retry:
            "Validation Retry",

        final_response:
            "Final Response"
    };

    return (
        names[tool] ||
        formatToolName(tool)
    );
}


function formatToolName(tool) {

    if (!tool) {
        return "Unknown Tool";
    }

    return String(tool)
        .replace(/_/g, " ")
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );
}


/* =====================================================
   TOOL ICON
===================================================== */

function getToolIcon(tool) {

    if (
        tool.includes("calculator")
    ) {
        return "∑";
    }

    if (
        tool.includes("web_search")
    ) {
        return "⌕";
    }

    if (
        tool.includes("quiz")
    ) {
        return "?";
    }

    if (
        tool.includes("study_plan")
    ) {
        return "◫";
    }

    if (
        tool.includes("weak_topic")
    ) {
        return "◇";
    }

    if (
        tool.includes("validator")
    ) {
        return "✓";
    }

    if (
        tool.includes("planner")
    ) {
        return "01";
    }

    return "✦";
}


/* =====================================================
   TRACE SUMMARY
===================================================== */

function getTraceTools(trace) {

    if (!Array.isArray(trace)) {
        return [];
    }

    return trace.filter(item => {

        const tool =
            item?.tool || "";

        return (
            tool !== "education_router" &&
            tool !== "final_response"
        );
    });
}


/* =====================================================
   TRACE → WORKFLOW
===================================================== */

async function animateAgentWorkflow(
    trace
) {

    const tools =
        getTraceTools(trace);


    /*
     * STEP 1
     * User query
     */

    activateWorkflowStep(
        "user",
        "Received"
    );

    await sleep(350);

    completeWorkflowStep(
        "user",
        "Received"
    );


    /*
     * STEP 2
     * Planner
     */

    activateWorkflowStep(
        "planner",
        "Planning..."
    );

    await sleep(550);

    const planner =
        trace.find(
            item =>
                item?.tool ===
                "agent_planner"
        );

    if (planner) {

        completeWorkflowStep(
            "planner",
            "Plan ready"
        );

    } else {

        completeWorkflowStep(
            "planner",
            "Direct route"
        );
    }


    /*
     * STEP 3
     * Actual tool execution
     */

    activateWorkflowStep(
        "tool",
        "Executing..."
    );


    if (tools.length === 0) {

        await sleep(400);

    } else {

        /*
         * Show each actual tool
         * in the status text.
         */
        for (
            const item of tools
        ) {

            const tool =
                item?.tool || "";

            /*
             * Validator steps are shown
             * separately in step 4.
             */
            if (
                tool.includes(
                    "validator"
                )
            ) {
                continue;
            }

            const displayName =
                getToolDisplayName(
                    tool
                );

            activateWorkflowStep(
                "tool",
                displayName
            );

            await sleep(500);
        }
    }


    completeWorkflowStep(
        "tool",
        tools.length
            ? `${tools.length} step(s) executed`
            : "No tool required"
    );


    /*
     * STEP 4
     * Validation
     */

    activateWorkflowStep(
        "validation",
        "Checking result..."
    );

    await sleep(500);


    const validationItems =
        trace.filter(item => {

            const tool =
                item?.tool || "";

            return (
                tool.includes(
                    "validator"
                )
            );
        });


    const rejected =
        validationItems.filter(
            item =>
                item?.status ===
                "rejected"
        );


    const retryItems =
        trace.filter(item => {

            const tool =
                item?.tool || "";

            return (
                tool.includes(
                    "retry"
                )
            );
        });


    if (
        rejected.length > 0 &&
        retryItems.length > 0
    ) {

        activateWorkflowStep(
            "validation",
            "Recovery required..."
        );

        await sleep(500);

        activateWorkflowStep(
            "validation",
            "Retry validated..."
        );

        await sleep(550);

        completeWorkflowStep(
            "validation",
            "Recovered ✓"
        );

    } else {

        completeWorkflowStep(
            "validation",
            "Validated ✓"
        );
    }


    /*
     * STEP 5
     * Final response
     */

    activateWorkflowStep(
        "response",
        "Generating..."
    );

    await sleep(500);

    completeWorkflowStep(
        "response",
        "Completed ✓"
    );
}


/* =====================================================
   SLEEP
===================================================== */

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


/* =====================================================
   TOOL TRACE PANEL
===================================================== */

function showToolChain(trace) {

    /*
     * Old tool-chain panel is removed
     * from the new HTML.
     *
     * We now use the Agent Workflow
     * section instead.
     */

    if (!Array.isArray(trace)) {
        return;
    }

    console.log(
        "Agent tool trace:",
        trace
    );
}


/* =====================================================
   SOURCES
===================================================== */

function showSources(
    sources
) {

    if (
        !sourcesSection ||
        !sourcesBox
    ) {
        return;
    }


    sourcesBox.innerHTML =
        "";


    if (
        !Array.isArray(sources) ||
        sources.length === 0
    ) {

        sourcesSection.style.display =
            "none";

        return;
    }


    sourcesSection.style.display =
        "block";


    sources.forEach(
        source => {

            const item =
                document.createElement(
                    "a"
                );

            item.href =
                source.url || "#";

            item.target =
                "_blank";

            item.rel =
                "noopener noreferrer";

            item.textContent =
                source.title ||
                "Source";


            sourcesBox.appendChild(
                item
            );
        }
    );
}


/* =====================================================
   ASK AGENT
===================================================== */

async function askAgent(
    question = ""
) {

    question =
        question ||
        (
            questionInput
                ? questionInput.value.trim()
                : ""
        );


    if (!question) {
        return;
    }


    if (responseSection) {

        responseSection.style.display =
            "block";
    }


    resetWorkflow();


    /*
     * Disable button during request.
     */

    if (askButton) {

        askButton.disabled =
            true;

        askButton.innerHTML =
            `
            <span>Thinking...</span>
            <span>✦</span>
            `;
    }


    /*
     * Initial answer state.
     */

    if (answerBox) {

        answerBox.innerHTML = `
            <div class="loading">

                <div class="spinner"></div>

                <p>
                    EduAgent is planning
                    your request...
                </p>

            </div>
        `;
    }


    try {

        /*
         * User received
         */
        activateWorkflowStep(
            "user",
            "Received"
        );


        await sleep(250);


        /*
         * Planner
         */
        activateWorkflowStep(
            "planner",
            "Planning..."
        );


        const response =
            await fetch(
                BACKEND_URL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        question:
                            question,

                        session_id:
                            getSessionId()
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                `Backend error: ${response.status}`
            );
        }


        /*
         * Backend response
         */

        const data =
            await response.json();


        const trace =
            Array.isArray(
                data.tool_trace
            )
                ? data.tool_trace
                : [];


        /*
         * Stop current workflow
         * state before replaying actual trace.
         */

        resetWorkflow();


        /*
         * Replay actual agentic
         * workflow.
         */

        await animateAgentWorkflow(
            trace
        );


        /*
         * Sources
         */

        showSources(
            data.sources || []
        );


        /*
         * Final answer
         */

        if (answerBox) {

            const quizHTML =
                renderQuiz(
                    data.answer
                );


            answerBox.innerHTML = `
                <div class="answer-content">

                    ${
                        quizHTML ||
                        formatAnswer(
                            data.answer
                        )
                    }

                </div>
            `;
        }


        /*
         * Scroll response
         * into view for demo.
         */

        if (responseSection) {

            setTimeout(() => {

                responseSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 100);
        }


    } catch (error) {

        console.error(
            "EduAgent error:",
            error
        );


        errorWorkflowStep(
            "response",
            "Failed"
        );


        if (answerBox) {

            answerBox.innerHTML = `
                <div class="error-message">

                    <strong>
                        Something went wrong.
                    </strong>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                </div>
            `;
        }

    } finally {

        /*
         * Re-enable button.
         */

        if (askButton) {

            askButton.disabled =
                false;

            askButton.innerHTML =
                `
                <span>Ask Agent</span>
                <span class="button-arrow">→</span>
                `;
        }
    }
}


/* =====================================================
   ENTER KEY
===================================================== */

if (questionInput) {

    questionInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                askAgent();
            }
        }
    );
}


/* =====================================================
   NORMAL ANSWER FORMATTER
===================================================== */

function formatAnswer(text) {

    if (!text) {
        return "";
    }


    let formatted =
        String(text);


    /*
     * Escape HTML
     */

    formatted =
        formatted
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            );


    /*
     * Headings
     */

    formatted =
        formatted.replace(
            /^### (.*)$/gm,
            "<h3>$1</h3>"
        );


    formatted =
        formatted.replace(
            /^## (.*)$/gm,
            "<h2>$1</h2>"
        );


    formatted =
        formatted.replace(
            /^# (.*)$/gm,
            "<h1>$1</h1>"
        );


    /*
     * Bold
     */

    formatted =
        formatted.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /*
     * Italic
     */

    formatted =
        formatted.replace(
            /\*(.*?)\*/g,
            "<em>$1</em>"
        );


    /*
     * Markdown links
     */

    formatted =
        formatted.replace(
            /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );


    /*
     * Numbered lists
     */

    formatted =
        formatted.replace(
            /(?:^|\n)(\d+)\.\s+(.*)/g,
            '<div class="numbered-item"><span>$1.</span> $2</div>'
        );


    /*
     * Bullet lists
     */

    formatted =
        formatted.replace(
            /(?:^|\n)[-*]\s+(.*)/g,
            '<div class="bullet-item">• $1</div>'
        );


    /*
     * Simple tables
     */

    /* =====================================================
   MARKDOWN TABLES
===================================================== */

const lines =
    formatted.split("\n");

let tableHTML = "";
let insideTable = false;

const outputLines = [];

for (let i = 0; i < lines.length; i++) {

    const line = lines[i].trim();

    if (
        line.startsWith("|") &&
        line.endsWith("|")
    ) {

        const cells =
            line
                .split("|")
                .slice(1, -1)
                .map(cell => cell.trim());

        /*
         * Ignore markdown separator row:
         * |---|---|---|
         */

        const isSeparator =
            cells.length > 0 &&
            cells.every(cell =>
                /^:?-+:?$/.test(cell)
            );

        if (isSeparator) {
            continue;
        }

        if (!insideTable) {

            insideTable = true;

            tableHTML =
                `<div class="markdown-table">`;
        }

        tableHTML += `
            <div class="markdown-table-row">
                ${cells
                    .map(
                        cell =>
                            `<div class="markdown-table-cell">
                                ${cell}
                             </div>`
                    )
                    .join("")}
            </div>
        `;

        /*
         * Check whether next line
         * is still a table.
         */

        const nextLine =
            lines[i + 1]
                ? lines[i + 1].trim()
                : "";

        if (
            !(
                nextLine.startsWith("|") &&
                nextLine.endsWith("|")
            )
        ) {

            tableHTML += "</div>";

            outputLines.push(
                tableHTML
            );

            tableHTML = "";

            insideTable = false;
        }

    } else {

        outputLines.push(line);
    }
}

formatted =
    outputLines.join("\n");
        

                


                if (
                    cells.length === 0
                ) {
                    return match;
                }


                return `
                    <div class="table-row">

                        ${cells
                            .map(
                                cell =>
                                    `<div>${cell}</div>`
                            )
                            .join("")}

                    </div>
                `;
            }
        );


    /*
     * Line breaks
     */

    formatted =
        formatted.replace(
            /\n/g,
            "<br>"
        );


    return formatted;
}


/* =====================================================
   INTERACTIVE QUIZ
===================================================== */

function renderQuiz(
    answer
) {

    if (!answer) {
        return "";
    }


    let quiz;


    try {

        quiz =
            typeof answer === "string"
                ? JSON.parse(answer)
                : answer;

    } catch (error) {

        return "";
    }


    if (
        !quiz ||
        !Array.isArray(
            quiz.questions
        ) ||
        quiz.questions.length === 0
    ) {

        return "";
    }


    const quizId =
        `quiz-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}`;


    setTimeout(
        () => {

            const quizElement =
                document.getElementById(
                    quizId
                );


            if (!quizElement) {
                return;
            }


            initializeQuiz(
                quizElement,
                quiz.questions,
                quiz
            );

        },
        0
    );


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


    function loadQuestion() {

        const question =
            questions[
                currentQuestion
            ];


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
                        question.question ||
                        ""
                    )}
                </h3>


                <div class="quiz-options">

                    ${createQuizOptions(
                        question
                    )}

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

                    ${
                        currentQuestion ===
                        questions.length - 1

                        ? "Finish Quiz"

                        : "Next Question"
                    }

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


        optionButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

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
            }
        );


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


    function handleAnswer(
        question,
        selected,
        optionButtons,
        nextButton
    ) {

        const correct =
            String(
                question.correct_answer ||
                ""
            )
                .trim()
                .toUpperCase();


        const selectedValue =
            String(selected)
                .trim()
                .toUpperCase();


        const feedback =
            quizElement.querySelector(
                "#quiz-feedback"
            );


        optionButtons.forEach(
            button => {

                button.disabled =
                    true;


                const option =
                    button.dataset.option
                        .trim()
                        .toUpperCase();


                if (
                    option === correct
                ) {

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
            }
        );


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
                    ? question.options[
                        correct
                    ]
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


        nextButton.disabled =
            false;
    }


    function showQuizResult() {

        const total =
            questions.length;


        const percentage =
            total > 0
                ? Math.round(
                    (score / total) *
                    100
                )
                : 0;


        let message;


        if (
            percentage >= 80
        ) {

            message =
                "Excellent work!";

        } else if (
            percentage >= 60
        ) {

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

                initializeQuiz(
                    quizElement,
                    questions,
                    quiz
                );
            }
        );
    }


    loadQuestion();
}


/* =====================================================
   QUIZ OPTIONS
===================================================== */

function createQuizOptions(
    question
) {

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
        .map(
            ([key, value]) => {

                return `

                    <button
                        type="button"
                        class="quiz-option"
                        data-option="${escapeHTML(
                            key
                        )}"
                    >

                        <span
                            class="quiz-option-key"
                        >
                            ${escapeHTML(key)}
                        </span>

                        <span
                            class="quiz-option-text"
                        >
                            ${escapeHTML(value)}
                        </span>

                    </button>
                `;
            }
        )
        .join("");
}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =====================================================
   INITIAL STATE
===================================================== */

resetWorkflow();

  

  


   

  


  
