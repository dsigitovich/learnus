import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { userRepository } from "@/lib/db/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const user = userRepository.findByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Ошибка при получении профиля:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const user = userRepository.findByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, bio, level, interests } = body;

    // Валидация данных
    if (name && typeof name !== "string") {
      return NextResponse.json(
        { error: "Неверный формат имени" },
        { status: 400 }
      );
    }

    if (level && !["Beginner", "Intermediate", "Advanced"].includes(level)) {
      return NextResponse.json(
        { error: "Неверный уровень знаний" },
        { status: 400 }
      );
    }

    if (interests && !Array.isArray(interests)) {
      return NextResponse.json(
        { error: "Интересы должны быть массивом" },
        { status: 400 }
      );
    }

    // Обновляем профиль
    const updatedUser = userRepository.update(user.id, {
      name: name || user.name,
      bio: bio || user.bio,
      level: level || user.level,
      interests: interests || user.interests,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Ошибка при обновлении профиля:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}