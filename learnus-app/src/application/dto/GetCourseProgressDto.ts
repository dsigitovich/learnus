export interface GetCourseProgressDto {
  courseId: string;
  userId: string;
}

export interface GetCourseProgressResponse {
  success: boolean;
  courseProgress?: {
    id: string;
    courseId: string;
    userId: string;
    completionPercentage: number;
    overallStatus: string;
    totalLessons: number;
    completedLessons: number;
    inProgressLessons: number;
    notStartedLessons: number;
    startedAt?: string;
    completedAt?: string;
    totalDurationInMinutes?: number;
    averageLessonDurationInMinutes?: number;
    lessonProgresses: {
      id: string;
      lessonId: string;
      status: string;
      startedAt?: string;
      completedAt?: string;
      durationInMinutes?: number;
      notes?: string;
    }[];
  };
  message?: string;
}