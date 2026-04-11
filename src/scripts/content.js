import Cerebras from "@cerebras/cerebras_cloud_sdk";
import { form, icon } from "../templates.js";

let searchInputElement = document.querySelector("textarea");

const cache = new Map();

const client = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

const advancedPromptSchema = {
  type: "object",
  properties: {
    advancedPrompt: { type: "string" },
    isUserQueryAlreadyAdvanced: { type: "boolean" },
    listOfQuestionsToAskUserForBetterPrompt: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "advancedPrompt",
    "isUserQueryAlreadyAdvanced",
    "listOfQuestionsToAskUserForBetterPrompt",
  ],
  additionalProperties: false,
};

const advanedPromptSchemaToUserQueries = {
  type: "object",
  properties: {
    advancedPrompt: { type: "string" },
  },
  required: ["advancedPrompt"],
  additionalProperties: false,
};

async function convertSearchTextToAdvancedPrompt(searchContent) {
  const cacheResult = cache.get(searchContent);
  if (cacheResult) {
    return cacheResult;
  }

  const systemInstruction = `
You are an expert at rewriting basic search queries into highly effective Google search queries using advanced search operators.

Given a simple query, decide whether it is already advanced enough. If it is not, transform it into a more precise and powerful search query by:
- Adding quotes for exact phrases when appropriate
- Using site:, filetype:, intitle:, inurl:, OR, and - (exclude) operators when useful
- Inferring user intent such as academic, tutorial, product, or troubleshooting
- Making the query more specific and targeted

Rules:
- Return valid JSON matching the provided schema
- If the query is already advanced enough, set isUserQueryAlreadyAdvanced to true and keep advancedPrompt equal to the original query
- If clarification would help produce a better query, populate listOfQuestionsToAskUserForBetterPrompt with short, specific questions
- Do not include explanations

Original query: "${searchContent}"
`;
  const completionCreateResponse = await client.chat.completions.create({
    messages: [{ role: "user", content: systemInstruction }],
    model: "qwen-3-235b-a22b-instruct-2507",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "advanced_prompt_schema",
        strict: true,
        schema: advancedPromptSchema,
      },
    },
  });
  const schemaAdvancedPromptData = JSON.parse(completionCreateResponse.choices[0].message.content);
  console.log("Received response from Cerebras API: ", schemaAdvancedPromptData);
  const advancedPrompt = schemaAdvancedPromptData.advancedPrompt;
  const isAlreadyAdvanced = schemaAdvancedPromptData.isUserQueryAlreadyAdvanced;
  const questionsToAskUserForBetterPrompt =
    schemaAdvancedPromptData.listOfQuestionsToAskUserForBetterPrompt;
  const result = {
    advancedPrompt: isAlreadyAdvanced ? searchContent : advancedPrompt,
    questionsToAskUserForBetterPrompt,
    isUserQueryAlreadyAdvanced: isAlreadyAdvanced,
  };
  cache.set(searchContent, result);
  setTimeout(() => cache.delete(searchContent), 60 * 1000);
  return result;
}

const promptEnhancerIcon = icon;

const promptEnhancerElement = document.createElement("span");
promptEnhancerElement.id = "prompt-enhancer-icon";
promptEnhancerElement.innerHTML = promptEnhancerIcon;

function buildQuestionId(question, index) {
  const normalizedQuestion = question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `prompt-question-${normalizedQuestion || "item"}-${index}`;
}

async function createAdvancedPromptFromUserResponses(searchContent, userResponses) {
  const advanedPromptFromUserResponsesInstruction = `You are an expert at rewriting search queries into highly effective Google search queries using advanced search operators.

Given the original search query and the user's answers to clarifying questions, transform the query into a more precise and powerful search query by:
- Adding quotes for exact phrases when appropriate
- Using site:, filetype:, intitle:, inurl:, OR, and - (exclude) operators when useful
- Inferring user intent such as academic, tutorial, product, or troubleshooting
- Making the query more specific and targeted

Rules:
- Return valid JSON matching the provided schema
- Output only the improved search query in the advancedPrompt field
- Do not include explanations

Original query: "${searchContent}"
User responses to clarifying questions: ${JSON.stringify(userResponses)}
`;
  const completionCreateResponse = await client.chat.completions.create({
    messages: [{ role: "user", content: advanedPromptFromUserResponsesInstruction }],
    model: "qwen-3-235b-a22b-instruct-2507",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "advanced_prompt_schema_to_user_queries",
        strict: true,
        schema: advanedPromptSchemaToUserQueries,
      },
    },
  });
  const schemaAdvancedPromptData = JSON.parse(completionCreateResponse.choices[0].message.content);
  console.log("Received response from Cerebras API changed: ", schemaAdvancedPromptData);
  const advancedPrompt = schemaAdvancedPromptData.advancedPrompt;

  cache.set(searchContent, advancedPrompt);
  setTimeout(() => cache.delete(searchContent), 60 * 1000);
  console.log("returning advanced prompt", advancedPrompt);
  return advancedPrompt;
}

function showForm(questions = [], searchText) {
  const existingFormHost = document.querySelector("#prompt-enhancer-form-host");
  existingFormHost?.remove();

  const shadowHost = document.createElement("div");
  shadowHost.id = "prompt-enhancer-form-host";
  const shadowRoot = shadowHost.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = form;
  const questionList = shadowRoot.querySelector("#prompt-enhancer-question-list");
  const questionCount = shadowRoot.querySelector("#prompt-enhancer-question-count");
  const overlay = shadowRoot.querySelector("#prompt-enhancer-overlay");
  const formElement = shadowRoot.querySelector("#prompt-enhancer-form");
  const cardElement = shadowRoot.querySelector(".prompt-enhancer-card");
  const closeButton = shadowRoot.querySelector("#prompt-enhancer-close");
  const cancelButton = shadowRoot.querySelector("#prompt-enhancer-cancel");
  const submitButton = shadowRoot.querySelector(".prompt-enhancer-primary");
  const loadingElement = shadowRoot.querySelector("#prompt-enhancer-loading");
  const abortController = new AbortController();
  let isSubmitting = false;
  const setFormLoadingState = (loading) => {
    isSubmitting = loading;
    cardElement.classList.toggle("is-loading", loading);
    formElement.setAttribute("aria-busy", String(loading));
    loadingElement.setAttribute("aria-hidden", String(!loading));

    [
      closeButton,
      cancelButton,
      submitButton,
      ...questionList.querySelectorAll(".prompt-enhancer-input"),
    ].forEach((element) => {
      if (element) {
        element.disabled = loading;
      }
    });
  };
  const dismissForm = () => {
    if (isSubmitting) {
      return;
    }

    console.log("Calling dismiss form");
    abortController.abort();
    shadowHost.remove();
  };

  questionCount.textContent = `${questions.length} clarifying question${questions.length === 1 ? "" : "s"}`;

  questions.forEach((question, index) => {
    const questionId = buildQuestionId(question, index);
    const questionElementContainer = document.createElement("div");
    questionElementContainer.className = "prompt-enhancer-field";
    const questionLabel = document.createElement("label");
    questionLabel.className = "prompt-enhancer-label";
    questionLabel.textContent = question;
    questionLabel.htmlFor = questionId;
    const questionInput = document.createElement("input");
    questionInput.type = "text";
    questionInput.id = questionId;
    questionInput.name = questionId;
    questionInput.className = "prompt-enhancer-input";
    questionInput.placeholder = "Type your answer";
    questionElementContainer.appendChild(questionLabel);
    questionElementContainer.appendChild(questionInput);
    questionList.appendChild(questionElementContainer);
  });

  closeButton.addEventListener("click", dismissForm);
  cancelButton.addEventListener("click", dismissForm);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay && !isSubmitting) {
      dismissForm();
    }
  });
  formElement.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setFormLoadingState(true);

    try {
      const formData = new FormData(formElement);
      const userResponsesToQuestions = Object.fromEntries(formData.entries());
      console.log("User responses to clarifying questions: ", userResponsesToQuestions);
      const advancedPrompt = await createAdvancedPromptFromUserResponses(
        searchText,
        userResponsesToQuestions,
      );
      console.log(
        "Advanced prompt generated from user responses: ",
        advancedPrompt,
        searchInputElement,
      );
      searchInputElement.value = advancedPrompt;
      setFormLoadingState(false);
      console.log("Calling dismiss form function");
      dismissForm();
    } catch (error) {
      setFormLoadingState(false);
      alert("Error refining the prompt from your answers. Please try again.");
      console.error(
        "Error refining prompt from form responses: ",
        error?.error?.message || error.message || "Please try again.",
      );
    }
  });

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        dismissForm();
      }
    },
    { signal: abortController.signal },
  );

  document.body.appendChild(shadowHost);
  shadowRoot.querySelector(".prompt-enhancer-input")?.focus();
}

async function setEnhancedPromptToSearchInput(
  promptEnhancerElement,
  searchInputElement,
  functionToCallForEnhancingPrompt,
) {
  promptEnhancerElement.classList.add("loading");
  try {
    const searchContent = searchInputElement.value;
    const result = await functionToCallForEnhancingPrompt(searchContent);
    console.log("Result from advanced prompt conversion: ", result);
    if (result.questionsToAskUserForBetterPrompt?.length) {
      showForm(result.questionsToAskUserForBetterPrompt, searchContent);
    }
    searchInputElement.value = result.advancedPrompt;
  } catch (error) {
    alert("Error enhancing the search prompt. Please try again.");
    console.error(
      "Error enhancing the search prompt: ",
      error?.error?.message || error.message || "Please try again.",
    );
  } finally {
    promptEnhancerElement.classList.remove("loading");
  }
}

function enhanceGoogleSearchPrompt(searchInputElement) {
  if (!searchInputElement) {
    console.error("Not able to find the search input element.");
    return;
  }
  const parentElement = searchInputElement.parentElement;
  parentElement.style.position = "relative";
  parentElement.appendChild(promptEnhancerElement);
  parentElement.addEventListener("click", async (event) => {
    if (
      event.target.id !== "prompt-enhancer-icon" &&
      !event.target.closest("#prompt-enhancer-icon")
    ) {
      return;
    }

    await setEnhancedPromptToSearchInput(
      promptEnhancerElement,
      searchInputElement,
      convertSearchTextToAdvancedPrompt,
    );
  });
}

enhanceGoogleSearchPrompt(searchInputElement);
