import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import CoursesItem from './course-item';
import { api } from '~/trpc/server';
import { type RouterOutputs } from '~/trpc/react';
import MyCoursesItem from './my-course-item';

export default async function CoursesPage() {
  const myCourses = await api.course.getMyMachiningCourses();
  const allCourses = await api.course.getMachiningCourses();

  const images = ['/images/mesin.png', "/images/pengukuran.png", "/images/pipe_system.png", "/images/printer.png"];

  return (
    <Tabs defaultValue="my-courses" className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <TabsList className="text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1">
          <TabsTrigger
            value="my-courses"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            My Courses
          </TabsTrigger>
          <TabsTrigger
            value="all-courses"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            All Courses
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="my-courses">
        <div className='w-full h-full'>
          {myCourses.length === 0 && (
            <p className='text-muted-foreground text-center w-full font-medium py-6'>You are not enrolled in any courses.</p>
          )}
          <div
            className='grid md:grid-cols-3 lg:grid-cols-4 grid-cols-2 gap-x-4 gap-y-6 md:gap-x-5 lg:gap-x-6 md:gap-y-8 flex-1'>
            {myCourses.map((course: RouterOutputs['course']['getMyCourses'][number], i: number) => (
              <MyCoursesItem
                href={`/courses/${course.id}`}
                key={course.id}
                id={course.id}
                title={course.title}
                type={course.type}
                image={course.image ? course.image : images[i % 4]!}
                subject={course.classCode}
                numberOfMaterials={course._count.attachments}
                numberOfVideos={course._count.videos}
              />
            ))}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="all-courses">
        <div className='w-full h-full'>
          {allCourses.length === 0 && (
            <p className='text-muted-foreground text-center w-full font-medium py-6'>No courses available.</p>
          )}
          <div
            className='grid md:grid-cols-3 lg:grid-cols-4 grid-cols-2 gap-x-4 gap-y-6 md:gap-x-5 lg:gap-x-6 md:gap-y-8 flex-1'>
            {allCourses.map((course: RouterOutputs['course']['getMachiningCourses'][number], i: number) => (
              <CoursesItem
                href={`/courses/${course.id}`}
                key={course.id}
                id={course.id}
                title={course.title}
                type={course.type}
                image={course.image ? course.image : images[i % 4]!}
                subject={course.classCode}
                numberOfMembers={course._count.members}
                numberOfTryouts={course._count.tryout}
              />
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export const metadata = {
  title: 'Courses',
};
