export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📨 API received:", body);

    return Response.json({
      message: "hello",
      received: body,
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
