export const listVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15 // Delay between each child
    },
  },
};

export const boxVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};