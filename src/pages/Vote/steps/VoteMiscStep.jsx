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

  // Helper function checking for the active category ID signature
  const hasUserMarkedCategory = (performerId) => {
    const saved = localStorage.getItem(`user_${userId}_marks_${performerId}`);
    if (!saved) return false;
    const parsed = JSON.parse(saved);
    return !!parsed[category.id];
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
        <Button text='Vissza' onClick={onBack} />
        <Button
          text='Tovább'
          onClick={onConfirm}
          disabled={!currentSelection}
        />
      </div>
    </>
  );
};

export default VoteMiscStep;
