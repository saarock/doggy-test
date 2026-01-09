import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/stack-auth";
import { userService } from "@/lib/services/user-service";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const latitude = Number.parseFloat(searchParams.get("latitude") || "0");
    const longitude = Number.parseFloat(searchParams.get("longitude") || "0");
    const radius = Number.parseFloat(searchParams.get("radius") || "10");
    const goals = searchParams.getAll("goals") || [];
    const pageXOffset = Number.parseInt(searchParams.get("pageXOffset") || "0");
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "20");

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Location required" }, { status: 400 });
    }

    // Update current user's location
    await userService.updateUser(authUser.id, {
      latitude,
      longitude,
      is_online: true,
    });

    // Get nearby users
    const nearbyUsers = await userService.getUsersWithFilters(
      authUser.id,
      latitude,
      longitude,
      radius,
      goals,
      pageXOffset,
      pageSize
    );

    const totalResult = await userService.countUsersWithFilters(
      authUser.id,
      latitude,
      longitude,
      radius,
      goals
    );
    const totalItems = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(totalItems / pageSize);
    console.log(totalResult);
    return NextResponse.json({
      users: nearbyUsers,
      totalItems,
      totalPages,
      currentPage: pageXOffset,
    });
  } catch (error) {
    console.error("Error fetching nearby users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
