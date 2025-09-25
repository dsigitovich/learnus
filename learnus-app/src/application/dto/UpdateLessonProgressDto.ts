export interface UpdateLessonProgressDto {
  courseId: string;
  lessonId: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface UpdateLessonProgressResponse {
  success: boolean;
  message: string;
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
  };
}