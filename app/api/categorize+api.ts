export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📨 API received:", body);

    // Example: Call Python service on localhost:5001
    // const pythonResponse = await fetch("http://localhost:5001/your-endpoint", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(body),
    // });
    // const pythonData = await pythonResponse.json();
    // console.log("🐍 Python service response:", pythonData);

    return Response.json({
      message: "hello",
      received: body,
      // pythonResult: pythonData, // Include Python service response
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ message: "hello from GET" });
}
