async function test() {
  const response = await fetch("http://localhost:3000/api/gemini/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      model: "gemini-2.5-flash", 
      contents: "hello",
    })
  });
  console.log("Status:", response.status);
  const text = await response.text();
  console.log("Response text:", text);
}
test();
