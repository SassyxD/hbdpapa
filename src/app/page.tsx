'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

const sections = [
  { id: 'header', label: 'หน้าแรก' },
  { id: 'letter', label: 'จดหมาย' },
  { id: 'gallery', label: 'รูปภาพ' },
  { id: 'quote', label: 'ข้อความ' },
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [revealedImages, setRevealedImages] = useState<Set<number>>(new Set());
  const [overlayImage, setOverlayImage] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState('header');
  const [passedSections, setPassedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            const sectionId = entry.target.getAttribute('data-section');
            if (sectionId) {
              setActiveSection(sectionId);
              setPassedSections(prev => {
                const newSet = new Set(prev);
                let foundCurrent = false;

                // Clear passed sections after current section
                sections.forEach(({ id }) => {
                  if (id === sectionId) {
                    foundCurrent = true;
                  } else if (!foundCurrent) {
                    newSet.add(id);
                  } else {
                    newSet.delete(id);
                  }
                });

                return newSet;
              });
            }
          }
        });
      },
      {
        threshold: [0.2, 0.5, 0.8], // Multiple thresholds for better detection
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    document.querySelectorAll('.animate-on-scroll, .gallery-item, .section-divider, .quote-section blockquote, [data-section]')
      .forEach(element => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleImageClick = useCallback((index: number) => {
    if (!revealedImages.has(index)) {
      // First click - reveal the image
      setRevealedImages(prev => new Set([...prev, index]));
    } else {
      // Second click - show overlay
      setOverlayImage(index);
    }
  }, [revealedImages]);

  const closeOverlay = useCallback(() => {
    setOverlayImage(null);
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  // Clean up body overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle escape key to close overlays
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeOverlay();
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closeOverlay]);

  const handleButtonMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Progress Navigation */}
      <nav className="progress-nav">
        <div className="progress-line"></div>
        <ul className="progress-nav-list">
          {sections.map(({ id, label }) => (
            <li
              key={id}
              className={`progress-item ${activeSection === id ? 'active' : ''} ${passedSections.has(id) ? 'passed' : ''}`}
              onClick={() => scrollToSection(id)}
            >
              <div className="progress-dot"></div>
              <span className="progress-label">{label}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* Header Section */}
      <header className="relative h-[90vh] sm:h-screen overflow-hidden banner-gradient" data-section="header">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-on-scroll">
              <h1 className="heading-japanese text-5xl sm:text-7xl md:text-8xl lg:text-9xl mb-6">
                Yak Thai
              </h1>
              <div className="divider-line mb-6" />
              <p className="text-lg sm:text-xl md:text-2xl text-body text-[var(--neon-grey-light)]">
                Happy Birthday to my Dad!
              </p>
            </div>
          </div>
        </div>
        <div className="scroll-text-container">
          <div className="scroll-text animate-on-scroll delay-200">
            เลื่อนเพื่อดูเพิ่มเติม
          </div>
        </div>
      </header>

      {/* Letter Button Section */}
      <section className="section-spacing letter-section" data-section="letter">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="arrow-container">
            <div className="arrow left animate-on-scroll delay-100"></div>
            <button
              onClick={openModal}
              onMouseMove={handleButtonMouseMove}
              className="gift-button animate-on-scroll delay-200"
            >
              จดหมายให้ป๊า
            </button>
            <div className="arrow right animate-on-scroll delay-300"></div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section-spacing gallery-section" data-section="gallery">
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="heading-japanese text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center mb-12 animate-on-scroll">
            สุขสันต์วันเกิดนะครับป๊า
          </h2>

          <div className="gallery-grid">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className={`gallery-item ${revealedImages.has(index) ? 'revealed' : ''}`}
                onClick={() => handleImageClick(index)}
              >
                <Image
                  src={`/images/gallery/dad${index + 1}.jpg`}
                  alt={`Dad's picture ${index + 1}`}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover rounded-xl"
                  priority={index < 2}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {!revealedImages.has(index) && (
                  <div className="reveal-hint">
                    คลิกเพื่อดูรูป
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Overlay */}
      <div
        className={`image-overlay ${overlayImage !== null ? 'active' : ''}`}
        onClick={closeOverlay}
      >
        <div
          className="image-overlay-content"
          onClick={e => e.stopPropagation()}
        >
          {overlayImage !== null && (
            <>
              <Image
                src={`/images/gallery/dad${overlayImage + 1}.jpg`}
                alt={`Dad's picture ${overlayImage + 1}`}
                width={1920}
                height={1080}
                className="rounded-xl"
                sizes="90vw"
                priority
                quality={100}
                style={{ objectFit: 'contain' }}
              />
              <button
                className="image-overlay-close"
                onClick={closeOverlay}
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quote Section */}
      <section className="section-spacing quote-section" data-section="quote">
        <div className="relative z-10">
          <div className="section-divider w-full mb-16"></div>
          <div className="max-w-4xl mx-auto text-center px-4">
            <blockquote className="animate-on-scroll">
              ขอให้ป๊ามีความสุข สุขภาพแข็งแรง และประสบความสำเร็จในทุกๆ ด้าน อยู่เป็นร่มโพธื์ ร่มไทรให้หนูด้วยนะ
              <footer className="mt-6 text-base sm:text-lg text-[var(--neon-white)]">- Sho</footer>
            </blockquote>
          </div>
          <div className="section-divider w-full mt-16"></div>
        </div>
      </section>

      {/* Birthday Message Modal */}
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`}>
        <div className="modal-content">
          <button onClick={closeModal} className="modal-close">
            ✕
          </button>
          <div className="modal-header">
            สุขสันต์วันเกิดนะป๊า
          </div>
          <div className="modal-body">
            <div className="letter-content">
              <p>ถึง ปะป๊า,</p>
              <p>
                ในวันเกิดปีนี้ หนูอยากจะบอกว่าหนูรักป๊าและภูมิใจในตัวป๊ามากๆ
                ขอบคุณสำหรับทุกสิ่งที่ป๊าได้มอบให้กับบ้านของเรา
                ทั้งความรัก การดูแล และคำสอนดีๆ ที่ทำให้หนูเป็นอย่างทุกวันนี้
              </p>
              <p>
                ป๊าเป็นศิลปินที่ยิ่งใหญ่ในสายตาหนูเสมอ
                หนูอาจจะไม่ได้บอกรักป๊าบ่อยๆ แต่หนูรักแล้วก็เป็นห่วงป๊ามากๆ
                ถ้าหนูทำอะไรผิดพลาดก็ขออภัยด้วยนะป๊า หนูจะพยายามทำดีขึ้นในอนาคต
                อาจจะวาดรูปไม่สวย แต่หนูอยากให้เว็บนี้เป็นของขวัญปีนี้นะป๊า
              </p>
              <p>
                ขอให้ป๊ามีความสุข สุขภาพแข็งแรง และประสบความสำเร็จในทุกๆ ด้าน
                หนูจะพยายามเป็นลูกที่ดี จะทำให้ป๊าภูมิใจเสมอและจะดูแลป๊ากับที่บ้านในอนาคตเอง
              </p>
              <p>
                สุขสันต์วันเกิดปีที่ 48 นะป๊า หนูรักป๊ามากๆ
              </p>
              <p className="text-right">
                ด้วยรักและเคารพ<br />
                โช, ลูกชายคนโต
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 