import Grondplan from '@/components/grondplan'

interface UserPageProps {
  params: { user_id: string };
}

export default function Home({ params }: UserPageProps) {
  const { user_id } = params;
  
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Grondplan Creator</h1>
      <Grondplan userId={user_id} />
    </main>
  )
}

