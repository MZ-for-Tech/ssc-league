import "dotenv/config";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seasonId = "S1";
const modules = [
  { number: 1, name: "Programming Foundations", description: "Learn to break problems into clear steps, represent solutions with algorithms and flowcharts, and understand how programs work." },
  { number: 2, name: "Python Programming", description: "Build practical Python skills, from variables and decisions to loops, functions, and core data structures." },
  { number: 3, name: "Data Science", description: "Explore data with pandas: inspect, transform, summarize, and visualize datasets through a Titanic case study." },
];

const lessons = [
  [1, 1, "module1-1-v1-20261006", "Algorithms and Problem Solving", "Break problems into clear steps, trace algorithms, and compare solutions for correctness and efficiency."],
  [1, 2, "module1-2-v1-20261006", "Flowcharts and Pseudocode", "Represent solutions with flowcharts and structured plain language. Practice sequences, decisions, loops, and tracing."],
  [1, 3, "module1-3-v1-20261006", "Introduction to Programming", "Explore how programs turn instructions into results, compare programming languages, and recognize common types of errors."],
  [2, 1, "module2-1-v1-20261006", "Variables, Expressions, and Conditions", "Store and update values, combine them with operators, and use comparisons and Boolean logic to control a program."],
  [2, 2, "module2-2-v1-20261006", "Making Decisions with Conditionals", "Use if, elif, and else to choose what a program does. Trace branch order and build conditions for practical problems."],
  [2, 3, "module2-3-v1-20261006", "Loops", "Repeat actions with for and while loops. Trace changing values, choose suitable conditions, and avoid infinite loops."],
  [2, 4, "module2-4-v1-20261006", "Functions and Modules", "Organize programs into reusable functions and modules. Practice parameters, return values, scope, imports, and recursion."],
  [2, 5, "module2-5-v1-20261006", "Lists and Strings", "Work with sequences and text using indexing, slicing, copying, sorting, comprehensions, and practical data-cleaning techniques."],
  [2, 6, "module2-6-v1-20261006", "Tuples and Dictionaries", "Store related data in tuples and dictionaries, work with nested structures, and use them to analyze information."],
  [3, 1, "module3-1-v1-20261006", "What Is Data Science?", "Explore how data science, statistics, and machine learning relate, and learn how pandas organizes data in a DataFrame."],
  [3, 2, "module3-2-v1-20261006", "Pandas Basics", "Create and inspect DataFrames, select rows and columns, update data, and add or remove fields."],
  [3, 3, "module3-3-v1-20261006", "Summarizing, Grouping, and Filtering", "Use descriptive statistics, grouping, filters, and value counts to find patterns in datasets."],
  [3, 4, "module3-4-v1-20261006", "Visualizing Data", "Choose and interpret charts for different questions, from distributions and comparisons to relationships between variables."],
  [3, 5, "module3-5-v1-20261006", "Titanic Data Case Study", "Investigate the Titanic dataset with pandas, compare survival patterns, and explain what the data and charts can—and cannot—tell us."],
];

const assetAltText = {
  "average_sequence.svg": "Flowchart that reads three values and calculates their average.",
  "bonus_decision.svg": "Decision flowchart that awards a bonus when sales meet the threshold.",
  "bonus_strict_boundary.svg": "Bonus decision flowchart using a strict greater-than threshold.",
  "page_connectors.svg": "Diagram comparing on-page and off-page flowchart connectors.",
  "sum_1_to_100.svg": "Loop flowchart that adds the integers from 1 through 100.",
  "sum_missing_update.svg": "Faulty summation loop flowchart with the counter update missing.",
  "loop_test_placement.svg": "Side-by-side flowcharts comparing pre-test and post-test loops.",
  "factorial_loop.svg": "Loop flowchart that calculates the factorial of an input value.",
  "max_of_three.svg": "Flowchart that determines the largest of three values.",
  "six_scores.svg": "Flowchart that reads six scores and accumulates their total.",
  "grade_decision.svg": "Decision flowchart that classifies a score as pass or fail.",
  "incomplete_flow.svg": "Incomplete flowchart that ends at output without a terminal symbol.",
};

function readJsonl(filePath) {
  return readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); }
    catch (error) { throw new Error(`${filePath}:${index + 1}: ${error.message}`); }
  });
}

function stableUuid(value) {
  const bytes = createHash("sha256").update(`ssc-league-season-1:${value}`).digest("hex").slice(0, 32).split("");
  bytes[12] = "5";
  bytes[16] = ((parseInt(bytes[16], 16) & 0x3) | 0x8).toString(16);
  const hex = bytes.join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function readAsset(bankDir, assetPath) {
  if (!assetPath) return null;
  const normalized = assetPath.replaceAll("\\", "/");
  if (normalized.startsWith("/") || normalized.split("/").includes("..")) {
    throw new Error(`Unsafe stimulus asset path: ${assetPath}`);
  }
  const source = path.join(root, "ssc", "question-banks", bankDir, normalized);
  if (!existsSync(source)) throw new Error(`Missing stimulus asset: ${source}`);
  const targetRelative = `/ssc-assets/s1/${bankDir}/${normalized}`;
  const target = path.join(root, "public", targetRelative.slice(1));
  mkdirSync(path.dirname(target), { recursive: true });
  copyFileSync(source, target);
  return targetRelative;
}

const prepared = [];
const seenBankItemIds = new Set();
const assetUrls = new Set();
for (const [moduleNumber, lessonNumber, bankDir, title, description] of lessons) {
  const bankPath = path.join(root, "ssc", "question-banks", bankDir);
  const plan = JSON.parse(readFileSync(path.join(bankPath, "lesson_plan.json"), "utf8"));
  const questions = readJsonl(path.join(bankPath, "final_items.jsonl"));
  const essays = readJsonl(path.join(bankPath, "essay_items.jsonl"));
  if (questions.length !== 40 || essays.length !== 8) {
    throw new Error(`${bankDir}: expected 40 MCQs and 8 written responses, found ${questions.length} and ${essays.length}.`);
  }

  const mapItem = (item, type) => {
    if (!item.id || !item.question && type === "mcq" || !item.prompt && type === "essay") {
      throw new Error(`${bankDir}: malformed ${type} item.`);
    }
    if (seenBankItemIds.has(item.id)) throw new Error(`Duplicate bank item id: ${item.id}`);
    seenBankItemIds.add(item.id);
    let stimulusAssetUrl = null;
    if (item.stimulusAsset) {
      stimulusAssetUrl = readAsset(bankDir, item.stimulusAsset);
      assetUrls.add(stimulusAssetUrl);
    }
    return { ...item, stimulusAssetUrl };
  };

  const mcqs = questions.map((item) => {
    const row = mapItem(item, "mcq");
    if (!Array.isArray(item.options) || item.options.length < 2 || !Number.isInteger(item.correctIndex) || !item.options[item.correctIndex]) {
      throw new Error(`${item.id}: expected at least two options and a valid correctIndex.`);
    }
    return row;
  });
  const written = essays.map((item) => {
    const row = mapItem(item, "essay");
    if (!Array.isArray(item.rubric) || !item.expectedAnswer) {
      throw new Error(`${item.id}: expected a reference answer and rubric.`);
    }
    return row;
  });
  prepared.push({ moduleNumber, lessonNumber, bankDir, title, description, plan, mcqs, written });
}

const assetCount = assetUrls.size;
const mcqCount = prepared.reduce((sum, lesson) => sum + lesson.mcqs.length, 0);
const essayCount = prepared.reduce((sum, lesson) => sum + lesson.written.length, 0);
if (process.argv.includes("--dry-run")) {
  console.log(`Validated ${prepared.length} lessons, ${mcqCount} MCQs, ${essayCount} ungraded written prompts, and ${assetCount} unique visual assets.`);
  process.exit(0);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.");
const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function upsert(table, rows, onConflict) {
  for (let start = 0; start < rows.length; start += 200) {
    const batch = rows.slice(start, start + 200);
    const { error } = await supabase.from(table).upsert(batch, { onConflict, ignoreDuplicates: false });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

const moduleRows = modules.map((module) => ({
  season_id: seasonId,
  module_number: module.number,
  display_order: module.number,
  name: module.name,
  description: module.description,
}));
const { data: savedModules, error: moduleError } = await supabase
  .from("Module").upsert(moduleRows, { onConflict: "season_id,module_number" }).select("id, module_number");
if (moduleError) throw new Error(`Module: ${moduleError.message}`);
const moduleIds = new Map(savedModules.map((module) => [module.module_number, module.id]));

const topicRows = prepared.map((lesson, index) => {
  return {
    season_id: seasonId,
    module_id: moduleIds.get(lesson.moduleNumber),
    lesson_number: lesson.lessonNumber,
    week_number: index + 1,
    curriculum_key: `S1-M${lesson.moduleNumber}-L${lesson.lessonNumber}`,
    name: lesson.title,
    description: lesson.description,
  };
});
const { data: savedTopics, error: topicError } = await supabase
  .from("Topic").upsert(topicRows, { onConflict: "season_id,curriculum_key" }).select("id, curriculum_key");
if (topicError) throw new Error(`Topic: ${topicError.message}`);
const topicIds = new Map(savedTopics.map((topic) => [topic.curriculum_key, topic.id]));

const questionRows = [];
const optionRows = [];
const essayRows = [];
for (const lesson of prepared) {
  const topicId = topicIds.get(`S1-M${lesson.moduleNumber}-L${lesson.lessonNumber}`);
  for (const [order, item] of lesson.mcqs.entries()) {
    if (!Number.isInteger(item.correctIndex)
      || item.correctIndex < 0 || item.correctIndex >= item.options.length
      || !Array.isArray(item.optionExplanations)
      || item.optionExplanations.length !== item.options.length
      || item.optionExplanations.some((reason) => typeof reason !== "string" || !reason.trim())
      || item.optionExplanations[item.correctIndex] !== item.explanation) {
      throw new Error(`MCQ ${item.id} needs one non-empty option explanation per answer choice.`);
    }
    const questionId = stableUuid(`question:${item.id}`);
    questionRows.push({
      id: questionId,
      season_id: seasonId,
      topic_id: topicId,
      bank_item_id: item.id,
      display_order: order + 1,
      text: item.question,
      points: 10,
      difficulty: ["Remember"].includes(item.bloomLevel) ? "Easy" : ["Analyze", "Evaluate", "Create"].includes(item.bloomLevel) ? "Hard" : "Medium",
      objective: item.objective || null,
      operation: item.operation || null,
      source_ref: item.source || null,
      explanation: item.explanation || null,
      stimulus_code: item.stimulusCode || null,
      stimulus_asset_url: item.stimulusAssetUrl,
      stimulus_asset_alt: item.stimulusAssetAlt || assetAltText[path.basename(item.stimulusAsset || "")] || item.question,
      bloom_level: item.bloomLevel || null,
      bloom_rationale: item.bloomRationale || null,
    });
    item.options.forEach((option, optionIndex) => {
      optionRows.push({
        id: stableUuid(`option:${item.id}:${optionIndex + 1}`),
        season_id: seasonId,
        question_id: questionId,
        option_order: optionIndex + 1,
        text: option,
        is_correct: optionIndex === item.correctIndex,
        justification: item.optionExplanations[optionIndex],
      });
    });
  }
  for (const [order, item] of lesson.written.entries()) {
    essayRows.push({
      id: stableUuid(`essay:${item.id}`),
      season_id: seasonId,
      topic_id: topicId,
      bank_item_id: item.id,
      prompt: item.prompt,
      response_type: item.responseType || null,
      stimulus_code: item.stimulusCode || item.code || null,
      stimulus_asset_url: item.stimulusAssetUrl,
      stimulus_asset_alt: item.stimulusAssetAlt || assetAltText[path.basename(item.stimulusAsset || "")] || item.prompt,
      source_ref: item.source || null,
      operation: item.operation || null,
      bloom_level: item.bloomLevel || null,
      bloom_rationale: item.bloomRationale || null,
      expected_answer: item.expectedAnswer,
      rubric: item.rubric,
      justification: item.justification || null,
      suggested_marks: item.marks || null,
      display_order: order + 1,
    });
  }
}

await upsert("Question", questionRows, "season_id,bank_item_id");
await upsert("QuestionOption", optionRows, "id");
await upsert("EssayQuestion", essayRows, "season_id,bank_item_id");
console.log(`Season 1 import complete: ${modules.length} modules, ${prepared.length} lessons, ${questionRows.length} MCQs, ${optionRows.length} options, ${essayRows.length} ungraded written prompts, ${assetCount} visuals.`);
