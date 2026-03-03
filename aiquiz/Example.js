const response = await fetch("http://localhost:8080/generate-quiz", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    subject: "Biology",
    course: "AP Biology",
    chapter: "Cell Communication",
    section: "Signal Transduction",
    numQuestions: 5,
    additionalInfo: "3 multiple choice, 2 short answer. Focus on GPCR pathways."
  })
});

const data = await response.json();
console.log(data);