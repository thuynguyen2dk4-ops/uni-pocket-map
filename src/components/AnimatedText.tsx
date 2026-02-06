import { motion, AnimatePresence, Easing } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';
import { ReactNode } from 'react';

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div';
}

const easeValues: Easing = [0.4, 0, 0.2, 1];

const MotionWrapper = ({
  as = 'span',
  children,
  className,
  animationKey
}: {
  as: AnimatedTextProps['as'];
  children: ReactNode;
  className: string;
  animationKey: string;
}) => {
  const animationProps = {
    key: animationKey,
    initial: { opacity: 0, y: 5 }, // Bỏ blur
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -5 },
    transition: { duration: 0.2, ease: "easeOut" }, // Dùng ease có sẵn cho nhẹ
    className,
    // Thêm dòng này để tối ưu phần cứng
    style: { willChange: "opacity, transform" }
  };

  switch (as) {
    case 'p':
      return <motion.p {...animationProps}>{children}</motion.p>;
    case 'h1':
      return <motion.h1 {...animationProps}>{children}</motion.h1>;
    case 'h2':
      return <motion.h2 {...animationProps}>{children}</motion.h2>;
    case 'h3':
      return <motion.h3 {...animationProps}>{children}</motion.h3>;
    case 'div':
      return <motion.div {...animationProps}>{children}</motion.div>;
    default:
      return <motion.span {...animationProps}>{children}</motion.span>;
  }
};

export const AnimatedText = ({ children, className = '', as = 'span' }: AnimatedTextProps) => {
  const { language } = useLanguage();

  return (
    <AnimatePresence mode="wait">
      <MotionWrapper 
        as={as} 
        className={className} 
        // CHỈ dùng language làm key. Khi đổi ngôn ngữ mới chạy hiệu ứng.
        // Bỏ String(children) ra khỏi key để tránh re-animate khi chữ thay đổi.
        animationKey={language} 
      >
        {children}
      </MotionWrapper>
    </AnimatePresence>
  );
};
// For longer content blocks
export const AnimatedBlock = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  const { language } = useLanguage();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={language}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{
          duration: 0.2,
          ease: 'easeOut'
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
