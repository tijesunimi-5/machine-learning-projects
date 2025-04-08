export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import * as tf from "@tensorflow/tfjs";

function loadDataset() {
  const filePath = path.join(
    process.cwd(),
    "..",
    "datasets",
    "Conversation.csv"
  );
  const csvText = fs.readFileSync(filePath, "utf8");
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return parsed.data;
}

export async function POST(req) {
  const body = await req.json();
  const userInput = body.message?.toLowerCase();

  const dataset = loadDataset();

  // Basic conversation match
  const match = dataset.find((row) =>
    userInput.includes(row.question.toLowerCase())
  );

  const reply = match ? match.answer : "Sorry, I didn't understand that.";

  return NextResponse.json({ reply, dataset });
}

//we assign dataset here when it has been loaded so we can access it
// const dataset = loadDataset();

//we filter the dataset to remove empty columns
// const filteredData = dataset.filter((item) => {
//   return Object.values(item).every(
//     (value) => value !== undefined && value !== null && value !== ""
//   );
// });

//we split each columns so we can access input and output
// const question = filteredData.map((ques) => ques.question);
// const answer = filteredData.map((ans) => ans.answer);

//we created this to assign the length of each column so we can normalize
// const questionSize = question.length;
// const answerSize = answer.length;

//to normalize the question column
// const questionOneHotEncoded = question.map((word, index) => {
//   let quesEncoding = new Array(questionSize).fill(0);
//   quesEncoding[index] = 1;

//   return quesEncoding;
// });

//to normalize the answer column
// const answerOneHotEncoded = answer.map((word, index) => {
//   let ansEncoding = new Array(answerSize).fill(0);
//   ansEncoding[index] = 1;

//   return ansEncoding;
// });
