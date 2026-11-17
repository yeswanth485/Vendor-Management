import React from 'react';
import { motion } from 'motion/react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { ProductPreview } from './ProductPreview';
import { ProblemSection } from './ProblemSection';
import { WorkflowSection } from './WorkflowSection';
import { FeaturesSection } from './FeaturesSection';
import { RiskIntelligenceSection } from './RiskIntelligenceSection';
import { ActivityConsoleSection } from './ActivityConsoleSection';
import { TrustSection } from './TrustSection';
import { FAQSection } from './FAQSection';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';

export function LandingPage() {
  const handleExploreClick = () => {
    document.getElementById('product')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDemoClick = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactClick = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-bg-primary text-text-primary"
    >
      {/* Navigation */}
      <Navbar onCtaClick={handleExploreClick} onDemoClick={handleDemoClick} />

      {/* Main Content */}
      <main id="main-content" role="main">
        {/* Hero Section */}
        <Hero onExploreClick={handleExploreClick} onDemoClick={handleDemoClick} />

        {/* Product Preview */}
        <section id="product" className="section relative" aria-labelledby="product-heading">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-glass border border-surface-glass-border text-xs font-semibold text-electric-lime uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-electric-lime animate-pulse-glow" />
                PLATFORM PREVIEW
              </span>
              <h2 id="product-heading" className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-text-primary mb-6">
                See VendorIQ in Action
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                Interactive preview of the actual VendorIQ interface — vendor directory, risk intelligence, 
                and operational activity monitor. All sample data, zero production exposure.
              </p>
            </motion.div>

            <div className="max-w-7xl mx-auto">
              <ProductPreview className="w-full" />
            </div>

            {/* Sample Data Disclaimer */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-8 text-center text-sm text-text-muted"
            >
              ⚠ All data shown is simulated sample data for demonstration purposes only. 
              Not connected to live production systems or real vendor records.
            </motion.p>
          </div>
        </section>

        {/* Problem Section */}
        <ProblemSection />

        {/* Workflow Section */}
        <WorkflowSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* Risk Intelligence Section */}
        <RiskIntelligenceSection />

        {/* Activity Console Section */}
        <ActivityConsoleSection />

        {/* Trust Section */}
        <TrustSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Final CTA */}
        <FinalCTA 
          onExploreClick={handleExploreClick} 
          onContactClick={handleContactClick} 
        />
      </main>

      {/* Footer */}
      <Footer />
    </motion.div>
  );
}