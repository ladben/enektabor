import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button, Title, Subtitle } from '../../components';
import { useUser } from '../../context/UserContext';

const PerformerDetailDrawer = ({ performer, categories, onClose }) => {
  const { user } = useUser();
  const [marks, setMarks] = useState({});

  const getStorageKey = () => `user_${user?.user_id}_marks_${performer?.id}`;

  useEffect(() => {
    if (performer && user?.user_id) {
      const saved = localStorage.getItem(getStorageKey());
      setMarks(saved ? JSON.parse(saved) : {});
    }
  }, [performer, user]);

  const toggleMark = (key) => {
    if (!user?.user_id) return;

    const newMarks = { ...marks, [key]: !marks[key] };
    setMarks(newMarks);
    localStorage.setItem(getStorageKey(), JSON.stringify(newMarks));
  };

  return (
    <AnimatePresence>
      {performer && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className='pos-fixed t-0 l-0 w-100v h-100v bg-bg zindex-10 p-32 pb-112 flex flex-column gap-24'
        >
          {/* Header Info */}
          <div className='flex flex-column gap-8 mt-24'>
            <Title text={performer.people.name} />
            <Subtitle
              text={`${performer.songs.artist} - ${performer.songs.title}`}
            />
          </div>

          {/* Scrollable Content Area */}
          <div className='flex flex-column gap-16 mt-32 ofy-auto pr-4'>
            <p className='text-color-grey text-left'>Emlékeztető magamnak:</p>

            <ChecklistItem
              label='Toplista'
              checked={marks['toplist']}
              onToggle={() => toggleMark('toplist')}
            />

            {categories.map((cat) => (
              <ChecklistItem
                key={cat.id}
                label={cat.name}
                checked={marks[cat.id]}
                onToggle={() => toggleMark(cat.id)}
                info={cat.question}
              />
            ))}
          </div>

          {/* Floating Back Button */}
          <Button
            onClick={onClose}
            text='Vissza'
            className='pos-abs b-0 m-auto l-0 r-0 mb-32'
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ChecklistItem = ({ label, checked, onToggle, info }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className='flex flex-column gap-10 w-100'>
      {/* Main Container Row - Now Entirely Clickable */}
      <div
        onClick={onToggle}
        className={`flex flex-row flex-justify-space-between flex-align-center gap-16 w-100 p-12 border-sm b-radius-10 transition-all ${
          checked
            ? 'border-text bg-text text-color-bg'
            : 'border-text text-color-text'
        }`}
        style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
      >
        <div className='flex flex-align-center gap-10 text-h2 text-left'>
          <span>{checked ? '✓' : '  '}</span>
          <span>{label}</span>
        </div>

        {info && (
          <div
            className={`border-sm b-radius-40-perc px-8 transition-all ${
              checked
                ? 'text-color-bg border-bg bg-transparent'
                : 'text-color-grey border-grey'
            }`}
            onClick={(e) => {
              e.stopPropagation(); // Stops the box from toggling when clicking '?'
              setShowTooltip(!showTooltip);
            }}
            style={{ touchAction: 'manipulation' }}
          >
            ?
          </div>
        )}
      </div>

      {/* Elegant Native Tooltip Expansion */}
      <AnimatePresence>
        {showTooltip && info && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='of-hidden w-100'
          >
            <div className='p-12 b-radius-10 border-sm border-grey text-color-white text-sm bg-bg text-left elevation-sm'>
              {info}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PerformerDetailDrawer;
