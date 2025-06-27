import Navbar from "@/components/home/navbar/navbar";
import BookDetails from '@/components/book/book-details';

export default function BookPage({ params }) {
  return (
    <>
      <Navbar />
      <BookDetails bookId={params.id} />
    </>
  );
}