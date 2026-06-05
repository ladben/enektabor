import { useEffect, useState, useMemo } from 'react';
import {
  Title,
  Subtitle,
  Avatar,
  Button,
  GridFlow,
  ProfileDisplayFlip,
} from '../../../components';
import { useProfileDisplay } from '../../../context/ProfileDisplayContext';

const VoteMiscStep = ({
  category,
  performances,
  selected,
  hasSeenReview,
  onFastForward,
  onSelect,
  onConfirm,
  onBack,
  userId,
}) => {
  const [currentSelection, setCurrentSelection] = useState(selected);
  const { profileDisplay } = useProfileDisplay();

  useEffect(() => {
    setCurrentSelection(selected);
  }, [selected]);

  // --- 🌟 UPDATED MISC STORAGE CHECK WITH TIME GUARD EXPIRATION 🌟 ---
  const hasUserMarkedCategory = (performerId) => {
    const storageKey = `user_${userId}_marks_${performerId}`;
    const saved = localStorage.getItem(storageKey);
    if (!saved) return false;

    try {
      const parsed = JSON.parse(saved);

      // Check if the record uses our timed wrapper structure
      if (parsed && typeof parsed === 'object' && 'exp' in parsed) {
        // ❌ If the note is older than 12 hours, wipe it out and return false!
        if (Date.now() > parsed.exp) {
          localStorage.removeItem(storageKey);
          return false;
        }
        // Fresh data -> look inside the nested 'value' object matching this category ID
        return !!parsed.value?.[category.id];
      }

      // Fallback for older legacy records that aren't wrapped yet
      return !!parsed[category.id];
    } catch (e) {
      return false;
    }
  };

  // Dynamically sort the grid matching this specific category context page
  const sortedPerformances = useMemo(() => {
    return [...performances].sort((a, b) => {
      const markedA = hasUserMarkedCategory(a.id) ? 1 : 0;
      const markedB = hasUserMarkedCategory(b.id) ? 1 : 0;

      if (markedB !== markedA) {
        return markedB - markedA;
      }

      // Secondary alphabetical fallback
      const nameA = a.people?.name || '';
      const nameB = b.people?.name || '';
      return nameA.localeCompare(nameB, 'hu');
    });
  }, [performances, category.id, userId]);

  const handleClick = (id) => {
    setCurrentSelection(id);
    onSelect(id);
  };

  return (
    <>
      <div className='flex flex-column flex-align-center w-100'>
        <Title text='Szavazz!' />
        <Subtitle text={category.question} />
      </div>
      <GridFlow noPadding>
        <div
          style={{ maxWidth: 'calc((100% - 30px) / 4)' }}
          className='w-100 ar-square'
        >
          <ProfileDisplayFlip />
        </div>
        {sortedPerformances.map((p) => {
          const isMarkedInNotes = hasUserMarkedCategory(p.id);
          return (
            <div
              key={p.id}
              onClick={() => handleClick(p.id)}
              style={{ maxWidth: 'calc((100% - 30px) / 4)' }}
              className='w-100 ar-square pos-rel'
            >
              <Avatar
                imgSrc={p.people.avatar}
                imgName={p.people.name}
                state={
                  !currentSelection
                    ? 'default'
                    : currentSelection === p.id
                      ? 'selected'
                      : 'faded'
                }
                display={profileDisplay.icon}
                isMarked={isMarkedInNotes}
              />
            </div>
          );
        })}
      </GridFlow>

      <div className='flex flex-align-center gap-10'>
        {!hasSeenReview && (
          <>
            <Button text='Vissza' onClick={onBack} />
            <Button
              text='Tovább'
              onClick={onConfirm}
              disabled={!currentSelection}
            />
          </>
        )}

        {hasSeenReview && (
          <Button
            text='Áttekint'
            onClick={onFastForward}
            disabled={!currentSelection}
            className='bg-acc text-color-bg'
          />
        )}
      </div>
    </>
  );
};

export default VoteMiscStep;
