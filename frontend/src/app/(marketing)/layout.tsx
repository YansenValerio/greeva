import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MidtransScript } from '@/components/checkout/MidtransScript';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { CartDrawer } from '@/components/cart/CartDrawer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 pt-16">{children}</div>
      <Footer />
      <MidtransScript />
      <ChatWidget />
      <CartDrawer />
    </div>
  );
}
