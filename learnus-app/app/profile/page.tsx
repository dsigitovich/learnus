"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useStore } from "@/lib/store";

export default function ProfilePage() {
  const { user } = useAuth();
  const { setUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    level: user?.level || "Beginner",
    interests: user?.interests || [],
  });
  const [newInterest, setNewInterest] = useState("");

  const handleSave = async () => {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()],
      });
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Заголовок профиля */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8">
              <div className="flex items-center gap-6">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600 shadow-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {user?.name}
                  </h1>
                  <p className="text-indigo-100">{user?.email}</p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  {isEditing ? "Отмена" : "Редактировать"}
                </button>
              </div>
            </div>

            {/* Содержимое профиля */}
            <div className="p-6 space-y-6">
              {/* Основная информация */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Основная информация
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Имя
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{user?.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      О себе
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Расскажите немного о себе..."
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {user?.bio || "Не указано"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Образовательные предпочтения */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Образовательные предпочтения
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Уровень знаний
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.level}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            level: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="Beginner">Начинающий</option>
                        <option value="Intermediate">Средний</option>
                        <option value="Advanced">Продвинутый</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {user?.level === "Beginner" && "Начинающий"}
                        {user?.level === "Intermediate" && "Средний"}
                        {user?.level === "Advanced" && "Продвинутый"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Интересы
                    </label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && addInterest()}
                            placeholder="Добавить интерес..."
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            onClick={addInterest}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Добавить
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.interests.map((interest) => (
                            <span
                              key={interest}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                            >
                              {interest}
                              <button
                                onClick={() => removeInterest(interest)}
                                className="ml-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user?.interests?.length ? (
                          user.interests.map((interest) => (
                            <span
                              key={interest}
                              className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                            >
                              {interest}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">
                            Интересы не указаны
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Кнопка сохранения */}
              {isEditing && (
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Сохранить изменения
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}