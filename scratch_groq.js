const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.log("No GROQ_API_KEY in environment");
  process.exit(1);
}

fetch("https://api.groq.com/openai/v1/models", {
  headers: {
    "Authorization": `Bearer ${apiKey}`
  }
})
.then(res => res.json())
.then(data => {
  console.log(JSON.stringify(data, null, 2));
})
.catch(console.error);
