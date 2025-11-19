export async function GET() {
  return Response.json([
    { name: "Riya", tasks: 320 },
    { name: "Arjun", tasks: 214 },
  ]);
}
