import Grondplan from '@/components/grondplan'

interface UserPageProps {
  params: { user_id: string };
}

export default function Home({ params }: UserPageProps) {
  const { user_id } = params;
  
  return (
    <main className="container mx-auto p-4">
      <Grondplan userId={user_id} />
    </main>
  )
}
