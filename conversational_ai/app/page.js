"use client";
import { useState } from "react";
import * as tf from "@tensorflow/tfjs";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  let dataset, answerCol, questionCol, model;

  const sendMessage = async () => {
    const res = await fetch("/api/conversation-model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    setReply(data.reply);
    dataset = data.dataset;
    Mlmodel();
  };

  const Mlmodel = async () => {
    const ds = await dataset;

    const filteredData = ds.filter((item) => {
      return Object.values(item).every(
        (value) => value !== undefined && value !== null && value !== ""
      );
    });

    answerCol = filteredData.map((ans) => {
      return ans.answer;
    });
    questionCol = filteredData.map((ques) => {
      return ques.question;
    });

    const answerSize = answerCol.length;
    const questionSize = questionCol.length;

    const answerOneHotEncoded = answerCol.map((word, index) => {
      let answerEncoding = new Array(answerSize).fill(0);
      answerEncoding[index] = 1;
      return answerEncoding;
    });

    const questionOneHotEncoded = questionCol.map((word, index) => {
      let questionEncoding = new Array(questionSize).fill(0);
      questionEncoding[index] = 1;
      return questionEncoding;
    });

    trainModel(
      answerSize,
      questionSize,
      answerOneHotEncoded,
      questionOneHotEncoded
    );
  };

  const trainModel = async (
    answerSize,
    questionSize,
    answerOneHotEncoded,
    questionOneHotEncoded
  ) => {
    model = tf.sequential();
    model.add(
      tf.layers.dense({
        inputShape: [questionSize],
        units: 50,
        activation: "relu",
      })
    );
    model.add(tf.layers.dense({ units: 30, activation: "relu" }));
    model.add(tf.layers.dense({ units: answerSize, activation: "softmax" }));

    model.compile({
      optimizer: "adam",
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });

    const inputTensor = tf.tensor2d(questionOneHotEncoded);
    const outputTensor = tf.tensor2d(answerOneHotEncoded);

    await model.fit(inputTensor, outputTensor, {
      epochs: 120,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epochs, log) => {
          console.log(`Epoch: ${epochs + 1}, loss: ${log.loss.toFixed(4)}`);
        },
      },
    });

    console.log("Training Completed!");

    const prediction = predictResponse(message)
    console.log('Predicted response:', prediction);
    setReply(prediction);
  };

  const predictResponse = (inputText) => {
    const inputIndex = questionCol.indexOf(inputText);

    if (inputIndex === -1) {
      return "Sorry, I didn't understand that.";
    }

    const inputEncoding = new Array(questionCol.length).fill(0);
    inputEncoding[inputIndex] = 1;
    const inputTensor = tf.tensor2d([inputEncoding]);
    const prediction = model.predict(inputTensor);
  };

  return (
    <div className="p-4 space-y-4">
      <input
        type="text"
        className="border p-2"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Say something..."
      />
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>
      <div className="text-lg font-medium">Reply: {reply}</div>
    </div>
  );
}
