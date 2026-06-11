import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button, Title, Subtitle } from '../../components';
import { useUser } from '../../context/UserContext';
import { useActiveCompetition } from '../../hooks/useActiveCompetition'; // 🌟 HOZZÁADVA

// 12-hour duration shelf-life token matching your user profile lifecycle
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

const PerformerDetailDrawer = ({ performer, categories, onClose }) => {
  const { user } = useUser();
  const { data: competition } = useActiveCompetition(); // 🌟 HOZZÁADVA: Aktív verseny adatai
  const [marks, setMarks] = useState({});

  const getStorageKey = () => `user_${user?.user_id}_marks_${performer?.id}`;

  // --- 🌟 MOUNT CHECK WITH AUTO-EXPIRY 🌟 ---
  useEffect(() => {
    if (performer && user?.user_id) {
      const key = getStorageKey();
      const rawData = localStorage.getItem(key);

      if (rawData) {
        try {
          const parsed = JSON.parse(rawData);

          // Verify if it has our timestamp wrapper structure
          if (parsed && typeof parsed === 'object' && 'exp' in parsed) {
            if (Date.now() > parsed.exp) {
              localStorage.removeItem(key); // ❌ 12h passed -> Wipe stale notes
              console.log(`🧹 Stale performance marks cleared: ${key}`);
              setMarks({});
            } else {
              setMarks(parsed.value); // Fresh data -> Load marks
            }
          } else {
            // Fallback for older legacy records that weren't wrapped yet
            setMarks(parsed);
          }
        } catch (e) {
          setMarks({});
        }
      } else {
        setMarks({});
      }
    }
  }, [performer, user]);

  // --- 🌟 SAVE MARKS WITH EXPIRATION TIMESTAMP 🌟 ---
  const toggleMark = (key) => {
    if (!user?.user_id) return;

    const newMarks = { ...marks, [key]: !marks[key] };
    setMarks(newMarks);

    // Wrap the value with the 12-hour future expiration point
    const wrapper = {
      value: newMarks,
      exp: Date.now() + SESSION_DURATION_MS,
    };

    localStorage.setItem(getStorageKey(), JSON.stringify(wrapper));
  };

  // 🌟 Megnézzük, hogy a jelenlegi gálán van-e egyáltalán toplista szavazás
  const hasToplist = competition?.top_number > 0;

  return (
    <AnimatePresence>
      {performer && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className='pos-fixed t-0 l-0 w-100v h-100v bg-bg zindex-10 p-32 pb-144 flex flex-column gap-24'
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

            {/* 🌟 DINAMIKUS MEGJELENÍTÉS: Csapóajtó a Toplistának */}
            {hasToplist && (
              <ChecklistItem
                label='Toplista'
                checked={marks['toplist']}
                onToggle={() => toggleMark('toplist')}
              />
            )}

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
            className='pos-abs b-0 m-auto l-0 r-0 mb-64'
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
              e.stopPropagation();
              setShowTooltip(!showTooltip);
            }}
            style={{ touchAction: 'manipulation' }}
          >
            ?
          </div>
        )}
      </div>

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
