const BACKEND_URL =
  "https://eduagent-ai-osvz.onrender.com/ask";
// ============================================================
// Conversation Session
// ============================================================

const SESSION_KEY = "eduagent_session_id";

function getSessionId() {

    let sessionId = localStorage.getItem(
        SESSION_KEY
    );

    if (!sessionId) {

        sessionId =
            (crypto.randomUUID)
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


/* =========================================
   SLEEP
========================================= */

const sleep = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));


/* =========================================
   WORKFLOW NODE CONTROL
========================================= */

function setNode(nodeId, status, active = false) {

  const node =
    document.getElementById(nodeId);

  if (!node) return;

  const statusElement =
    node.querySelector(".node-status");

  if (!statusElement) return;

  statusElement.innerText = status;

  node.classList.remove(
    "active",
    "completed",
    "error"
  );


  if (
    status.includes("✓") ||
    status.includes("Completed") ||
    status.includes("Received") ||
    status.includes("Generated")
  ) {

    node.classList.add("completed");

  } else if (
    status.includes("⚠") ||
    status.includes("Failed") ||
    status.includes("Error") ||
    status.includes("✗")
  ) {

    node.classList.add("error");

  } else if (active) {

    node.classList.add("active");
  }
}


/* =========================================
   RESET WORKFLOW
========================================= */

function resetWorkflow() {

  setNode(
    "userNode",
    "Waiting"
  );

  setNode(
    "routerNode",
    "Waiting"
  );

  setNode(
    "toolNode",
    "Waiting"
  );

  setNode(
    "responseNode",
    "Waiting"
  );


  /*
     Remove dynamically created
     tool nodes and arrows.
  */

  document
    .querySelectorAll(
      ".dynamic-tool-node, .dynamic-tool-arrow"
    )
    .forEach(element => {
      element.remove();
    });


  /*
     Restore original tool node title.
  */

  const toolNode =
    document.getElementById("toolNode");

  if (toolNode) {

    const titleElement =
      toolNode.querySelector(
        ".node-title"
      );

    if (titleElement) {

      titleElement.innerText =
        "🔧 Tool";
    }

    toolNode.classList.remove(
      "active",
      "completed",
      "error"
    );
  }
}


/* =========================================
   SAFE HTML ESCAPE
========================================= */

function escapeHTML(value) {

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


/* =========================================
   SAFE URL CHECK
========================================= */

function isSafeURL(url) {

  try {

    const parsed =
      new URL(url);

    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    );

  } catch {

    return false;
  }
}


/* =========================================
   FORMAT INLINE MARKDOWN
========================================= */

function formatInline(value) {

  let text =
    escapeHTML(value);


  /* =====================================
     MARKDOWN LINKS
  ===================================== */

  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    function(
      match,
      label,
      url
    ) {

      if (!isSafeURL(url)) {

        return label;
      }

      return `
        <a
          href="${url}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${label}
        </a>
      `;
    }
  );


  /* =====================================
     BOLD
  ===================================== */

  text = text.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );


  /* =====================================
     ITALIC
  ===================================== */

  text = text.replace(
    /(?<!\*)\*(.*?)\*(?!\*)/g,
    "<em>$1</em>"
  );


  return text;
}


/* =========================================
   SOURCE PANEL
========================================= */

function formatSources(sources) {

  if (
    !Array.isArray(sources) ||
    sources.length === 0
  ) {

    return "";
  }


  let html = `
    <div class="sources-panel">

      <div class="sources-header">

        <div class="sources-icon">
          🔎
        </div>

        <div>

          <div class="sources-title">
            Sources
          </div>

          <div class="sources-subtitle">
            Retrieved from live web search
          </div>

        </div>

      </div>

      <div class="sources-list">
  `;


  sources.forEach(
    (
      source,
      index
    ) => {

      const title =
        escapeHTML(
          source.title ||
          `Source ${index + 1}`
        );


      const url =
        source.url || "";


      if (!isSafeURL(url)) {

        return;
      }


      const safeURL =
        escapeHTML(url);


      html += `
        <div class="source-card">

          <div class="source-number">
            ${String(
              index + 1
            ).padStart(2, "0")}
          </div>

          <div class="source-info">

            <div class="source-title">
              ${title}
            </div>

            <a
              class="source-link"
              href="${safeURL}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Source ↗
            </a>

          </div>

        </div>
      `;
    }
  );


  html += `
      </div>

    </div>
  `;


  return html;
}


/* =========================================
   CREATE DYNAMIC TOOL NODE
========================================= */

function createToolNode(
  displayName,
  index,
  parent
) {

  /*
     Arrow before every additional tool.
  */

  const arrow =
    document.createElement(
      "div"
    );

  arrow.className =
    "arrow dynamic-tool-arrow";

  arrow.innerText =
    "→";


  parent.appendChild(
    arrow
  );


  /*
     Create tool node.
  */

  const node =
    document.createElement(
      "div"
    );

  node.className =
    "node dynamic-tool-node";

  node.id =
    `dynamicToolNode${index}`;


  node.innerHTML = `
    <div class="node-title">
      ${escapeHTML(displayName)}
    </div>

    <div class="node-status">
      Waiting
    </div>
  `;


  parent.appendChild(
    node
  );


  return node;
}


/* =========================================
   UPDATE TOOL NODE
========================================= */

async function animateToolNode(
  node,
  displayName,
  success
) {

  if (!node) return;


  const titleElement =
    node.querySelector(
      ".node-title"
    );

  const statusElement =
    node.querySelector(
      ".node-status"
    );


  if (
    titleElement
  ) {

    titleElement.innerText =
      displayName;
  }


  node.classList.remove(
    "active",
    "completed",
    "error"
  );


  /*
     Tool running
  */

  statusElement.innerText =
    `⏳ ${displayName}`;

  node.classList.add(
    "active"
  );


  await sleep(700);


  node.classList.remove(
    "active"
  );


  /*
     Tool completed
  */

  if (success) {

    statusElement.innerText =
      `✓ ${displayName}`;

    node.classList.add(
      "completed"
    );

  } else {

    statusElement.innerText =
      `✗ ${displayName}`;

    node.classList.add(
      "error"
    );
  }


  await sleep(400);
}


/* =========================================
   SHOW ACTUAL TOOL CHAIN
========================================= */

async function showToolChain(
  actualTools
) {

  const toolNode =
    document.getElementById(
      "toolNode"
    );


  if (!toolNode) return;


  const toolsParent =
    toolNode.parentElement;


  /*
     No actual tools
  */

  if (
    actualTools.length === 0
  ) {

    const titleElement =
      toolNode.querySelector(
        ".node-title"
      );

    const statusElement =
      toolNode.querySelector(
        ".node-status"
      );


    if (titleElement) {

      titleElement.innerText =
        "💡 Direct Answer";
    }


    statusElement.innerText =
      "✓ Direct Answer";


    toolNode.classList.remove(
      "active",
      "error"
    );

    toolNode.classList.add(
      "completed"
    );


    return;
  }


  const toolNames = {

    calculator:
      "🧮 Calculator",

    web_search:
      "🔎 SerpApi",

    quiz_generator:
      "📝 Quiz Generator",

    study_plan_generator:
      "📅 Study Planner"
  };


  /*
     Display every actual tool
     in execution order.
  */

  for (
    let i = 0;
    i < actualTools.length;
    i++
  ) {

    const tool =
      actualTools[i];


    const displayName =
      toolNames[tool.tool] ||
      `🔧 ${tool.tool}`;


    let currentNode;


    /*
       First tool uses original
       tool node.
    */

    if (i === 0) {

      currentNode =
        toolNode;

    } else {

      /*
         Additional tools get
         dynamically created nodes.
      */

      currentNode =
        createToolNode(
          displayName,
          i,
          toolsParent
        );
    }


    await animateToolNode(
      currentNode,
      displayName,
      tool.status === "success"
    );
  }
}


/* =========================================
   ASK AGENT
========================================= */

async function askAgent() {

  const input =
    document.getElementById(
      "questionInput"
    );

  const button =
    document.getElementById(
      "askButton"
    );

  const responseSection =
    document.getElementById(
      "responseSection"
    );

  const answerBox =
    document.getElementById(
      "answerBox"
    );


  const question =
    input.value.trim();


  if (!question) {

    alert(
      "Please enter a question."
    );

    return;
  }


  button.disabled =
    true;

  button.innerText =
    "Agent Working...";


  responseSection.style.display =
    "block";


  answerBox.innerHTML = `
    <div class="ai-loading">

      <span>🤔</span>

      <div>

        <strong>
          EduAgent is thinking...
        </strong>

        <small>
          Analyzing your question
        </small>

      </div>

    </div>
  `;


  resetWorkflow();


  try {

    /* =====================================
       USER
    ===================================== */

    setNode(
      "userNode",
      "⏳ Processing",
      true
    );


    await sleep(500);


    setNode(
      "userNode",
      "✓ Received"
    );


    /* =====================================
       ROUTER
    ===================================== */

    setNode(
      "routerNode",
      "⏳ Routing...",
      true
    );


    /* =====================================
       BACKEND REQUEST
    ===================================== */

    const response =
      await fetch(
        BACKEND_URL,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
          JSON.stringify({
          question:
          question,
          session_id:
          getSessionId()
  })
            
              
                
            
        }
      );


    if (!response.ok) {

      throw new Error(
        `Server error: ${response.status}`
      );
    }


    const data =
      await response.json();


    /* =====================================
       ROUTER COMPLETE
    ===================================== */

    setNode(
      "routerNode",
      "✓ Completed"
    );


    await sleep(400);


    /* =====================================
       DETECT ACTUAL TOOLS
    ===================================== */

    const actualTools =
      Array.isArray(
        data.tool_trace
      )
        ? data.tool_trace.filter(
            item =>
              item.tool !==
                "education_router" &&
              item.tool !==
                "final_response"
          )
        : [];


    console.log(
      "TOOL TRACE:",
      data.tool_trace
    );


    console.log(
      "ACTUAL TOOLS:",
      actualTools
    );


    /* =====================================
       SHOW ACTUAL TOOL CHAIN
    ===================================== */

    await showToolChain(
      actualTools
    );


    /* =====================================
       RESPONSE NODE
    ===================================== */

    setNode(
      "responseNode",
      "⏳ Generating...",
      true
    );


    await sleep(600);


    setNode(
      "responseNode",
      "✓ Generated"
    );


    /* =====================================
       PREMIUM AI RESPONSE
    ===================================== */

    answerBox.innerHTML = `

      <div class="answer-header">

        <div class="ai-avatar">
          🧠
        </div>

        <div>

          <div class="answer-title">
            EduAgent AI
          </div>

          <div class="answer-subtitle">
            Intelligent education response
          </div>

        </div>

      </div>


      <div class="answer-divider"></div>


      <div class="answer-content">

        ${formatAnswer(
          data.answer
        )}

      </div>


      ${formatSources(
        data.sources
      )}

    `;


  } catch (error) {

    console.error(
      error
    );


    setNode(
      "routerNode",
      "⚠ Error"
    );


    setNode(
      "toolNode",
      "⚠ Failed"
    );


    setNode(
      "responseNode",
      "⚠ Failed"
    );


    answerBox.innerHTML = `

      <div class="error-card">

        <div class="error-icon">
          ⚠️
        </div>

        <div>

          <strong>
            Unable to connect to EduAgent
          </strong>

          <p>
            Please try again in a moment.
          </p>

        </div>

      </div>

    `;
  }


  button.disabled =
    false;

  button.innerText =
    "Ask EduAgent";
}


/* =========================================
   FORMAT AI ANSWER
========================================= */

function formatAnswer(answer) {

  if (!answer) {

    return `
      <p>
        No answer received.
      </p>
    `;
  }


  /* =====================================
     NORMALIZE NEWLINES
  ===================================== */

  let raw =
    String(answer)
      .replace(
        /\r\n/g,
        "\n"
      )
      .replace(
        /\r/g,
        "\n"
      )
      .trim();


  const lines =
    raw.split("\n");


  let output =
    "";


  let tableRows =
    [];


  let insideTable =
    false;


  /* =====================================
     RENDER TABLE
  ===================================== */

  function renderTable(rows) {

    if (
      rows.length < 2
    ) {

      return "";
    }


    const header =
      rows[0]
        .split("|")
        .map(
          cell =>
            cell.trim()
        )
        .filter(
          cell =>
            cell !== ""
        );


    const bodyRows =
      rows
        .slice(2)
        .map(
          row =>
            row
              .split("|")
              .map(
                cell =>
                  cell.trim()
              )
              .filter(
                cell =>
                  cell !== ""
              )
        )
        .filter(
          row =>
            row.length > 0
        );


    if (
      header.length === 0
    ) {

      return "";
    }


    let table = `
      <div class="ai-table-wrapper">

        <table class="ai-table">

          <thead>

            <tr>
    `;


    header.forEach(
      cell => {

        table += `
          <th>
            ${formatInline(
              cell
            )}
          </th>
        `;
      }
    );


    table += `
            </tr>

          </thead>

          <tbody>
    `;


    bodyRows.forEach(
      row => {

        if (
          !row.length
        ) return;


        table += `
          <tr>
        `;


        row.forEach(
          cell => {

            table += `
              <td>
                ${formatInline(
                  cell
                )}
              </td>
            `;
          }
        );


        table += `
          </tr>
        `;
      }
    );


    table += `
          </tbody>

        </table>

      </div>
    `;


    return table;
  }


  /* =====================================
     PROCESS LINES
  ===================================== */

  lines.forEach(
    line => {

      const trimmed =
        line.trim();


      /* ===================================
         IGNORE EMPTY LINES
      =================================== */

      if (
        trimmed === ""
      ) {

        return;
      }


      /* ===================================
         TABLE LINE
      =================================== */

      if (
        trimmed.startsWith("|") &&
        trimmed.endsWith("|")
      ) {

        if (
          !insideTable
        ) {

          insideTable =
            true;

          tableRows =
            [];
        }


        tableRows.push(
          trimmed
        );

        return;
      }


      /* ===================================
         FINISH TABLE
      =================================== */

      if (
        insideTable
      ) {

        output +=
          renderTable(
            tableRows
          );

        tableRows =
          [];

        insideTable =
          false;
      }


      /* ===================================
         HEADING
      =================================== */

      if (
        trimmed.startsWith(
          "### "
        )
      ) {

        output += `
          <h4>
            ${formatInline(
              trimmed.substring(
                4
              )
            )}
          </h4>
        `;

        return;
      }


      if (
        trimmed.startsWith(
          "## "
        )
      ) {

        output += `
          <h3>
            ${formatInline(
              trimmed.substring(
                3
              )
            )}
          </h3>
        `;

        return;
      }


      if (
        trimmed.startsWith(
          "# "
        )
      ) {

        output += `
          <h2>
            ${formatInline(
              trimmed.substring(
                2
              )
            )}
          </h2>
        `;

        return;
      }


      /* ===================================
         BULLET
      =================================== */

      if (
        trimmed.startsWith("• ") ||
        trimmed.startsWith("- ")
      ) {

        const bulletText =
          trimmed.substring(
            2
          );


        output += `
          <div class="answer-bullet">
            ${formatInline(
              bulletText
            )}
          </div>
        `;

        return;
      }


      /* ===================================
         NUMBERED LIST
      =================================== */

      if (
        /^\d+\.\s+/.test(
          trimmed
        )
      ) {

        const numberText =
          trimmed.replace(
            /^\d+\.\s+/,
            ""
          );


        output += `
          <div class="answer-number">
            ${formatInline(
              numberText
            )}
          </div>
        `;

        return;
      }


      /* ===================================
         HORIZONTAL LINE
      =================================== */

      if (
        trimmed === "---"
      ) {

        output +=
          "<hr>";

        return;
      }


      /* ===================================
         NORMAL TEXT
      =================================== */

      output += `
        <p>
          ${formatInline(
            trimmed
          )}
        </p>
      `;

    }
  );


  /* =====================================
     FINAL TABLE
  ===================================== */

  if (
    insideTable
  ) {

    output +=
      renderTable(
        tableRows
      );
  }


  /* =====================================
     FINAL CLEANUP
  ===================================== */

  return output.trim();
}

  

  


   

  


  
