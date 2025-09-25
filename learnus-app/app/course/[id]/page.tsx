import { Metadata } from 'next';
import CourseView from '@/components/CourseView';

interface CoursePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  return {
    title: 'Курс - LearnUs',
    description: 'Изучайте программирование с помощью ИИ-помощника',
  };
}

export default function CoursePage({ params }: CoursePageProps) {
  return <CourseView courseId={params.id} />;
}