import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Create response
    const response = NextResponse.json({ message: "Déconnexion réussie" });

    // Delete the token cookie
    response.cookies.delete("token");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la déconnexion" },
      { status: 500 }
    );
  }
}
