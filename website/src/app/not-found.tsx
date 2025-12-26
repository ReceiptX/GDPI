import { Button } from '@/components/Button';
import { Container } from '@/components/Container';

export default function NotFound() {
  return (
    <section className="py-16">
      <Container>
        <h1 className="font-heading text-3xl font-extrabold text-white">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-200">
          The page you’re looking for doesn’t exist. Use the navigation, or head back home.
        </p>
        <div className="mt-6">
          <Button asChild href="/" size="lg">
            Go to homepage
          </Button>
        </div>
      </Container>
    </section>
  );
}
