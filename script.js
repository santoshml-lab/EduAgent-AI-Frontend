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


    activateWorkflowStep(
        "user",
        "Received"
    );

    await sleep(350);

    completeWorkflowStep(
        "user",
        "Received"
    );


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


    activateWorkflowStep(
        "tool",
        "Executing..."
    );


    if (tools.length === 0) {

        await sleep(400);

    } else {

        for (
            const item of tools
        ) {

            const tool =
                item?.tool || "";

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


    if (askButton) {

        askButton.disabled =
            true;

        askButton.innerHTML =
            `
            <span>Thinking...</span>
            <span>✦</span>
            `;
    }


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

        activateWorkflowStep(
            "user",
            "Received"
        );


        await sleep(250);


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


        const data =
            await response.json();


        const trace =
            Array.isArray(
                data.tool_trace
            )
                ? data.tool_trace
                : [];


        resetWorkflow();


        await animateAgentWorkflow(
            trace
        );


        showSources(
            data.sources || []
        );


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
   FORMAT ANSWER
===================================================== */

function formatAnswer(text) {

    if (!text) {
        return "";
    }

    let formatted = String(text);


    /* =================================================
       ESCAPE HTML
    ================================================= */

    formatted = formatted
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");


    /* =================================================
       HEADINGS
    ================================================= */

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


    /* =================================================
       MARKDOWN TABLES
    ================================================= */

    const lines =
        formatted.split("\n");

    const output = [];

    let i = 0;

    while (i < lines.length) {

        const line =
            lines[i].trim();


        if (
            line.startsWith("|") &&
            line.endsWith("|") &&
            i + 1 < lines.length
        ) {

            const headerCells =
                parseTableRow(lines[i]);

            const separatorCells =
                parseTableRow(lines[i + 1]);


            const validSeparator =
                separatorCells.length > 0 &&
                separatorCells.every(
                    cell =>
                        /^:?-{3,}:?$/.test(
                            cell.trim()
                        )
                );


            if (
                headerCells.length > 0 &&
                validSeparator
            ) {

                let tableHTML = `
                    <div class="table-wrapper">
                        <table class="markdown-table">
                            <thead>
                                <tr>
                `;


                headerCells.forEach(
                    cell => {

                        tableHTML += `
                            <th>${cell}</th>
                        `;
                    }
                );


                tableHTML += `
                                </tr>
                            </thead>
                            <tbody>
                `;


                i += 2;


                while (i < lines.length) {

                    const bodyLine =
                        lines[i].trim();


                    if (
                        !bodyLine.startsWith("|") ||
                        !bodyLine.endsWith("|")
                    ) {
                        break;
                    }


                    const cells =
                        parseTableRow(
                            bodyLine
                        );


                    if (
                        cells.length === 0
                    ) {

                        i++;

                        continue;
                    }


                    tableHTML += `
                        <tr>
                    `;


                    cells.forEach(
                        cell => {

                            tableHTML += `
                                <td>${cell}</td>
                            `;
                        }
                    );


                    tableHTML += `
                        </tr>
                    `;


                    i++;
                }


                tableHTML += `
                            </tbody>
                        </table>
                    </div>
                `;


                output.push(
                    tableHTML
                );

                continue;
            }
        }


        output.push(line);

        i++;
    }


    formatted =
        output.join("\n");


    /* =================================================
       BOLD
    ================================================= */

    formatted = formatted.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );


    /* =================================================
       ITALIC
    ================================================= */

    formatted = formatted.replace(
        /\*(.*?)\*/g,
        "<em>$1</em>"
    );


    /* =================================================
       MARKDOWN LINKS
    ================================================= */

    formatted = formatted.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );


    /* =================================================
       NUMBERED LISTS
    ================================================= */

    formatted = formatted.replace(
        /(?:^|\n)(\d+)\.\s+(.*)/g,
        '<div class="numbered-item"><span>$1.</span> $2</div>'
    );


    /* =================================================
       BULLET LISTS
    ================================================= */

    formatted = formatted.replace(
        /(?:^|\n)[-*]\s+(.*)/g,
        '<div class="bullet-item">• $1</div>'
    );


    /* =================================================
       LINE BREAKS
    ================================================= */

    formatted = formatted.replace(
        /\n/g,
        "<br>"
    );


    return formatted;
}


/* =====================================================
   MARKDOWN TABLE ROW PARSER
===================================================== */

function parseTableRow(line) {

    if (!line) {
        return [];
    }


    let content =
        line.trim();


    if (
        content.startsWith("|")
    ) {
        content =
            content.substring(1);
    }


    if (
        content.endsWith("|")
    ) {
        content =
            content.substring(
                0,
                content.length - 1
            );
    }


    const cells = [];

    let current = "";
    let escaped = false;


    for (
        let i = 0;
        i < content.length;
        i++
    ) {

        const char =
            content[i];


        if (
            char === "\\" &&
            !escaped
        ) {

            escaped = true;
            continue;
        }


        if (
            char === "|" &&
            !escaped
        ) {

            cells.push(
                current.trim()
            );

            current = "";

        } else {

            current += char;
        }


        escaped = false;
    }


    cells.push(
        current.trim()
    );


    return cells;
}


/* =====================================================
   INTERACTIVE QUIZ
===================================================== */

function renderQuiz(answer) {

    if (!answer) {
        return "";
    }

    let quiz = null;


    /* =================================================
       1. JSON QUIZ
    ================================================= */

    try {

        quiz =
            typeof answer === "string"
                ? JSON.parse(answer)
                : answer;

    } catch (error) {

        quiz = null;
    }


    /* =================================================
       2. PLAIN TEXT / TABLE QUIZ
    ================================================= */

    if (
        !quiz ||
        !Array.isArray(quiz.questions)
    ) {

        quiz =
            parsePlainTextQuiz(
                String(answer)
            );
    }


    /* =================================================
       3. VALIDATION
    ================================================= */

    if (
        !quiz ||
        !Array.isArray(quiz.questions) ||
        quiz.questions.length === 0
    ) {

        return "";
    }


    /* =================================================
       4. REMOVE INVALID QUESTIONS
    ================================================= */

    quiz.questions =
        quiz.questions.filter(
            question => {

                if (
                    !question ||
                    !question.question ||
                    !question.options
                ) {
                    return false;
                }

                const options =
                    question.options;

                return (
                    options.A &&
                    options.B &&
                    options.C &&
                    options.D &&
                    /^[A-D]$/i.test(
                        String(
                            question.correct_answer ||
                            ""
                        )
                    )
                );
            }
        );


    if (
        quiz.questions.length === 0
    ) {

        return "";
    }


    /* =================================================
       5. QUIZ ID
    ================================================= */

    const quizId =
        `quiz-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}`;


    /* =================================================
       6. INITIALIZE AFTER INSERTION
    ================================================= */

    setTimeout(() => {

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

    }, 0);


    /* =================================================
       7. COMPACT QUIZ CONTAINER
    ================================================= */

    return `
        <div
            id="${quizId}"
            class="interactive-quiz"
            style="
                height:auto !important;
                min-height:0 !important;
                max-height:none !important;
                overflow:visible !important;
                writing-mode:horizontal-tb !important;
            "
        >

            <div
                class="quiz-loading"
                style="
                    height:auto !important;
                    min-height:0 !important;
                "
            >
                Loading quiz...
            </div>

        </div>
    `;
}


/* =====================================================
   PLAIN TEXT QUIZ PARSER
===================================================== */

function parsePlainTextQuiz(text) {

    const normalized =
        String(text || "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .trim();


    if (!normalized) {
        return null;
    }


    const questions = [];


    const lines =
        normalized
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);


    /* =================================================
       HELPER
    ================================================= */

    function addQuestion(
        questionText,
        optionValues,
        correctAnswer
    ) {

        if (!questionText) {
            return;
        }


        const options = {
            A: optionValues[0] || "",
            B: optionValues[1] || "",
            C: optionValues[2] || "",
            D: optionValues[3] || ""
        };


        if (
            !options.A ||
            !options.B ||
            !options.C ||
            !options.D
        ) {
            return;
        }


        if (
            !/^[A-D]$/i.test(
                correctAnswer
            )
        ) {
            return;
        }


        questions.push({

            question:
                questionText.trim(),

            options,

            correct_answer:
                String(
                    correctAnswer
                )
                    .trim()
                    .toUpperCase(),

            explanation:
                "Review the concept and compare your answer with the correct option."

        });
    }


    /* =================================================
       1. TAB-SEPARATED TABLE
    ================================================= */

    for (const line of lines) {

        if (!line.includes("\t")) {
            continue;
        }


        const cols =
            line
                .split("\t")
                .map(
                    value =>
                        value.trim()
                );


        /*
         * Remove completely empty cells
         */
        const cleanCols =
            cols.filter(
                value =>
                    value !== ""
            );


        if (
            cleanCols.length < 6
        ) {
            continue;
        }


        const last =
            cleanCols[
                cleanCols.length - 1
            ];


        if (
            !/^[A-D]$/i.test(last)
        ) {
            continue;
        }


        /*
         * Format:
         *
         * Question | A | B | C | D | Answer
         *
         * OR
         *
         * Number | Question | A | B | C | D | Answer
         */

        let questionText;
        let optionStart;


        if (
            cleanCols.length >= 7 &&
            /^\d+$/.test(
                cleanCols[0]
            )
        ) {

            questionText =
                cleanCols[1];

            optionStart = 2;

        } else {

            questionText =
                cleanCols[0];

            optionStart = 1;
        }


        const optionValues =
            cleanCols.slice(
                optionStart,
                optionStart + 4
            );


        addQuestion(
            questionText,
            optionValues,
            last
        );
    }


    /* =================================================
       2. PIPE / MARKDOWN TABLE
    ================================================= */

    if (
        questions.length === 0 &&
        normalized.includes("|")
    ) {

        for (
            const line of lines
        ) {

            if (
                !line.includes("|")
            ) {
                continue;
            }


            const cols =
                parseTableRow(
                    line
                );


            if (
                cols.length < 6
            ) {
                continue;
            }


            /*
             * Skip separator row
             */

            if (
                cols.every(
                    cell =>
                        /^:?-{3,}:?$/.test(
                            cell.trim()
                        )
                )
            ) {
                continue;
            }


            const last =
                cols[
                    cols.length - 1
                ];


            if (
                !/^[A-D]$/i.test(last)
            ) {
                continue;
            }


            let questionText;
            let optionStart;


            if (
                cols.length >= 7 &&
                /^\d+$/.test(
                    cols[0]
                )
            ) {

                questionText =
                    cols[1];

                optionStart = 2;

            } else {

                questionText =
                    cols[0];

                optionStart = 1;
            }


            const optionValues =
                cols.slice(
                    optionStart,
                    optionStart + 4
                );


            addQuestion(
                questionText,
                optionValues,
                last
            );
        }
    }


    /* =================================================
       3. STANDARD MCQ FORMAT
    ================================================= */

    if (
        questions.length === 0
    ) {

        const questionBlocks =
            normalized
                .split(
                    /(?=\n?\s*\d+\.\s+)/g
                )
                .map(
                    block =>
                        block.trim()
                )
                .filter(
                    block =>
                        /^\d+\.\s+/.test(
                            block
                        )
                );


        for (
            const block of questionBlocks
        ) {

            const questionMatch =
                block.match(
                    /^\d+\.\s+([\s\S]*?)(?=\n\s*A[.)]\s+)/i
                );


            if (!questionMatch) {
                continue;
            }


            const questionText =
                questionMatch[1]
                    .trim();


            const optionRegex =
                /(?:^|\n)\s*([A-D])[.)]\s*([\s\S]*?)(?=\n\s*[A-D][.)]\s+|\n\s*(?:Answer|Correct Answer)\s*:|$)/gi;


            const options = {};


            let match;


            while (
                (match =
                    optionRegex.exec(
                        block
                    )) !== null
            ) {

                const key =
                    match[1]
                        .toUpperCase();


                const value =
                    match[2]
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim();


                if (value) {

                    options[key] =
                        value;
                }
            }


            const answerMatch =
                block.match(
                    /(?:Answer|Correct Answer)\s*:\s*([A-D])/i
                );


            const correctAnswer =
                answerMatch
                    ? answerMatch[1]
                        .toUpperCase()
                    : "";


            addQuestion(
                questionText,
                [
                    options.A,
                    options.B,
                    options.C,
                    options.D
                ],
                correctAnswer
            );
        }
    }


    /* =================================================
       FINAL RESULT
    ================================================= */

    if (
        questions.length === 0
    ) {

        return null;
    }


    return {

        topic:
            "Photosynthesis Quiz",

        questions:
            questions

    };
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

            <div
                class="quiz-header"
                style="
                    height:auto !important;
                    min-height:0 !important;
                    display:flex !important;
                    flex-direction:row !important;
                    align-items:center !important;
                    justify-content:space-between !important;
                    gap:16px !important;
                    writing-mode:horizontal-tb !important;
                "
            >

                <div
                    class="quiz-title"
                    style="
                        writing-mode:horizontal-tb !important;
                        white-space:normal !important;
                    "
                >

                    ${escapeHTML(
                        quiz.topic ||
                        quiz.subject ||
                        "Interactive Quiz"
                    )}

                </div>

                <div
                    class="quiz-progress"
                    style="
                        display:inline-flex !important;
                        width:auto !important;
                        height:auto !important;
                        min-height:0 !important;
                        max-height:none !important;
                        white-space:nowrap !important;
                        writing-mode:horizontal-tb !important;
                        transform:none !important;
                        flex-shrink:0 !important;
                        align-items:center !important;
                    "
                >
                    Question ${currentQuestion + 1} of ${questions.length}
                </div>

            </div>


            <div
                class="quiz-question"
                style="
                    height:auto !important;
                    min-height:0 !important;
                "
            >

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

            <div
                class="quiz-result"
                style="
                    height:auto !important;
                    min-height:0 !important;
                "
            >

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
        

  

  


   

  


  
