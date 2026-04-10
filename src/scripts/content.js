import Cerebras from '@cerebras/cerebras_cloud_sdk';
import {form,icon} from '../templates.js';

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
          items: {  type: "string" }
        }
    },
    required: ["advancedPrompt", "isUserQueryAlreadyAdvanced", "listOfQuestionsToAskUserForBetterPrompt"],
    additionalProperties: false
};

async function convertSearchTextToAdvancedPrompt(searchContent) {
  const cacheResult = cache.get(searchContent);
  if(cacheResult){
    return cacheResult;
  }
  
  const systemInstruction = `
You are an expert at rewriting basic search queries into highly effective Google search queries using advanced search operators.

Given a simple query, transform it into a more precise and powerful search query by:
- Adding quotes for exact phrases when appropriate
- Using site:, filetype:, intitle:, inurl:, OR, and - (exclude) operators when useful
- Inferring user intent (e.g., academic, tutorial, product, troubleshooting)
- Making the query more specific and targeted

Rules:
- Output ONLY the improved search query
- Do not include explanations
- Keep it concise but powerful

Original query: "${searchContent}"
`;
  const completionCreateResponse = await client.chat.completions.create({
    messages: [{ role: 'user', content: systemInstruction }],
    model: 'qwen-3-235b-a22b-instruct-2507',
    response_format: {
      type: 'json_schema', 
      json_schema: {
        name: 'advanced_prompt_schema',
        strict: true,
        schema: advancedPromptSchema
      }
    }
  });
  const schemaAdvancedPromptData = JSON.parse(completionCreateResponse.choices[0].message.content);
  console.log("Received response from Cerebras API: ", schemaAdvancedPromptData);
  const advancedPrompt = schemaAdvancedPromptData.advancedPrompt;
  const isAlreadyAdvanced = schemaAdvancedPromptData.isUserQueryAlreadyAdvanced;
  const questionsToAskUserForBetterPrompt = schemaAdvancedPromptData.listOfQuestionsToAskUserForBetterPrompt;
  const result = { advancedPrompt: isAlreadyAdvanced ? searchContent : advancedPrompt, questionsToAskUserForBetterPrompt, isUserQueryAlreadyAdvanced:isAlreadyAdvanced };
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

function showForm(questions = []){
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
  const abortController = new AbortController();
  const dismissForm = () => {
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

  shadowRoot.querySelector("#prompt-enhancer-close").addEventListener("click", dismissForm);
  shadowRoot.querySelector("#prompt-enhancer-cancel").addEventListener("click", dismissForm);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      dismissForm();
    }
  });
  formElement.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(formElement);
    const userResponsesToQuestions = Object.fromEntries(formData.entries());
    console.log("User responses to clarifying questions: ", userResponsesToQuestions);
    dismissForm();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      dismissForm();
    }
  }, { signal: abortController.signal });

  document.body.appendChild(shadowHost);
  shadowRoot.querySelector(".prompt-enhancer-input")?.focus();
}


async function enhanceGoogleSearchPrompt(element){
  if(!element){
    console.error("Not able to find the search input element.");
    return;
  }
    const parentElement = element.parentElement;
    parentElement.style.position = "relative";
    parentElement.appendChild(promptEnhancerElement);
    parentElement.addEventListener("click", async (event) => {
      if(event.target.id !== "prompt-enhancer-icon" && !event.target.closest("#prompt-enhancer-icon")){
        return;
      }

      
        promptEnhancerElement.classList.add("loading");
        try{
        const searchContent = element.value;
        const result = await convertSearchTextToAdvancedPrompt(searchContent);
        console.log("Result from advanced prompt conversion: ", result);
        if(result.questionsToAskUserForBetterPrompt.length > 0){
          showForm(result.questionsToAskUserForBetterPrompt);
        }
        element.value = result.advancedPrompt;

        } catch (error) {
          alert("Error enhancing the search prompt. Please try again.");
          console.error("Error enhancing the search prompt: ", error?.error?.message || error.message || "Please try again.");
        } finally {
           promptEnhancerElement.classList.remove("loading");
        }
    });


}


enhanceGoogleSearchPrompt(document.querySelector("textarea"));
