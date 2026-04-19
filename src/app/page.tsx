'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/client/Navbar';
import AnnouncementBar from '@/components/client/AnnouncementBar';
import HeroSection from '@/components/client/HeroSection';
import ProductCatalog from '@/components/client/ProductCatalog';
import DeliverySection from '@/components/client/DeliverySection';
import PaymentSection from '@/components/client/PaymentSection';
import Footer from '@/components/client/Footer';
import { getSiteContent, getProducts, getPaymentInfo } from '@/lib/firebaseUtils';
import { Product, SiteContent, PaymentInfo } from '@/lib/types';
import { defaultSiteContent } from '@/lib/firebaseUtils';

export default function HomePage() {
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [content, prods, payment] = await Promise.all([
          getSiteContent(),
          getProducts(),
          getPaymentInfo(),
        ]);
        setSiteContent(content);
        setProducts(prods);
        setPaymentInfo(payment);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader-logo">KRATOS<span> STORE</span></div>
        <div className="loader-bar"><div className="loader-bar-inner" /></div>
        <style jsx>{`
          .page-loader {
            min-height: 100vh;
            background: var(--black);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 28px;
          }
          .loader-logo {
            font-family: var(--font-serif);
            font-size: 36px;
            font-weight: 900;
            color: var(--white);
            letter-spacing: 0.1em;
          }
          .loader-logo span {
            font-family: var(--font-sans);
            font-weight: 300;
            font-size: 20px;
            letter-spacing: 0.25em;
            color: var(--gray-500);
          }
          .loader-bar {
            width: 200px;
            height: 2px;
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
            overflow: hidden;
          }
          .loader-bar-inner {
            height: 100%;
            background: var(--white);
            border-radius: 2px;
            animation: loadProgress 1.5s ease infinite;
          }
          @keyframes loadProgress {
            0% { width: 0%; }
            50% { width: 80%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <AnnouncementBar content={siteContent} />
      <main>
        <HeroSection content={siteContent} />
        <ProductCatalog
          products={products}
          categories={siteContent.categories}
        />
        <DeliverySection content={siteContent} />
        <PaymentSection paymentInfo={paymentInfo} />
      </main>
      <Footer />
    </>
  );
}
